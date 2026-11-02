-- 15.5C: REVIEW, then run manually ONLY in stage-strike-tests. No competitive writes.
begin;
set local lock_timeout='5s';
set local statement_timeout='60s';
do $$ begin
  if 'CONFIRM_TEST_PROJECT'<>'stage-strike-tests' or current_user<>'postgres' then raise exception 'Confirm test project and use postgres'; end if;
  if to_regprocedure('public.ss_read_tournament_snapshot(uuid)') is null then raise exception 'Requires 15.5A'; end if;
end $$;
alter table public.tournaments add column archived_at timestamptz;

-- Replace the previous admin-capable rename. Owner identity is checked under the shared lock.
create or replace function public.ss_rename_tournament(p_tournament uuid,p_expected bigint,p_name text)
returns bigint language plpgsql security definer set search_path='' as $$
declare old_name text;
begin
  perform ss_private.lock_tournament(p_tournament,true);
  if p_name is null or char_length(btrim(p_name)) not between 1 and 200 or p_name ~ '[[:cntrl:]]' then
    raise exception using errcode='22023',message='Invalid name'; end if;
  select name into old_name from public.tournaments where id=p_tournament;
  update public.tournaments set name=btrim(p_name) where id=p_tournament;
  return ss_private.audit(p_tournament,p_expected,'tournament_renamed',jsonb_build_object('before',old_name,'after',btrim(p_name)));
end $$;

create function public.ss_set_tournament_archived(p_tournament uuid,p_expected bigint,p_archived boolean)
returns bigint language plpgsql security definer set search_path='' as $$
declare previous timestamptz; next_value timestamptz;
begin
  perform ss_private.lock_tournament(p_tournament,true);
  if p_archived is null then raise exception using errcode='22023',message='Archive state required'; end if;
  select archived_at into previous from public.tournaments where id=p_tournament;
  next_value:=case when p_archived then coalesce(previous,clock_timestamp()) else null end;
  update public.tournaments set archived_at=next_value where id=p_tournament;
  return ss_private.audit(p_tournament,p_expected,'tournament_archive_changed',jsonb_build_object('before',previous,'after',next_value));
end $$;

-- Fail closed if schema changes could make cascading deletion affect unexpected rows.
-- No custom triggers or foreign keys to descendants are allowed in this reviewed graph.
create function ss_private.check_tournament_delete_graph() returns void
language plpgsql set search_path='' as $$
declare parent oid:='public.tournaments'::regclass;
  children oid[]:=array['public.tournament_participants'::regclass,'public.tournament_members'::regclass,
    'public.tournament_brackets'::regclass,'public.tournament_revisions'::regclass,
    'public.result_reports'::regclass,'public.tournament_admin_invitations'::regclass]::oid[];
  targets oid[]; f record; found_count integer:=0;
begin
  targets:=array_append(children,parent);
  if exists(select from pg_catalog.pg_rewrite where ev_class=any(targets) and rulename<>'_RETURN')
    or exists(select from pg_catalog.pg_inherits where inhparent=any(targets) or inhrelid=any(targets))
    or exists(select from pg_catalog.pg_class where oid=any(targets) and relkind<>'r') then
    raise exception using errcode='0A000',message='Review rules or inheritance before deletion'; end if;
  if current_setting('session_replication_role')<>'origin' or exists(select from pg_catalog.pg_trigger where tgrelid=any(targets)
    and ((not tgisinternal and tgenabled<>'D') or (tgisinternal and tgenabled not in ('O','A')))) then
    raise exception using errcode='0A000',message='Review custom triggers before deletion'; end if;
  for f in select * from pg_catalog.pg_constraint where contype='f' and confrelid=any(targets) loop
    if f.confrelid<>parent or not (f.conrelid=any(children)) or f.confdeltype<>'c' or not f.convalidated
      or f.conkey is distinct from array[(select attnum from pg_catalog.pg_attribute where attrelid=f.conrelid and attname='tournament_id')]::smallint[]
      or f.confkey is distinct from array[(select attnum from pg_catalog.pg_attribute where attrelid=parent and attname='id')]::smallint[] then
      raise exception using errcode='0A000',message='Review tournament dependency graph before deletion';
    end if;
    found_count:=found_count+1;
  end loop;
  if found_count<>6 or (select count(distinct conrelid) from pg_catalog.pg_constraint where contype='f' and confrelid=parent and conrelid=any(children))<>6 then
    raise exception using errcode='0A000',message='Incomplete reviewed dependency graph'; end if;
end $$;

-- Versioned owner-only review; UI never falls back to old rename or direct DML.
create function public.ss_tournament_lifecycle_review(p_tournament uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare snapshot jsonb;
begin
  perform ss_private.lock_tournament(p_tournament,true);
  snapshot:=public.ss_read_tournament_snapshot(p_tournament);
  return jsonb_build_object('version',15503,'snapshot',snapshot,
    'archived_at',(select archived_at from public.tournaments where id=p_tournament));
end $$;

create function public.ss_delete_tournament(p_tournament uuid,p_expected bigint,p_confirmation text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actual_name text; n bigint;
begin
  perform ss_private.lock_tournament(p_tournament,true);
  select name into actual_name from public.tournaments where id=p_tournament;
  if p_confirmation is null or (p_confirmation collate "C") is distinct from (actual_name collate "C") then
    raise exception using errcode='22023',message='Exact tournament name required'; end if;
  perform ss_private.check_tournament_delete_graph();
  n:=ss_private.audit(p_tournament,p_expected,'tournament_deleted',jsonb_build_object('name',actual_name));
  -- All SIX children cascade only by tournament_id. Profiles/Auth are never deletion targets.
  -- This also removes this tournament's audit history; archive instead to retain it.
  delete from public.tournaments where id=p_tournament;
  return jsonb_build_object('deleted_id',p_tournament,'revision',n::text);
end $$;

revoke all on function ss_private.check_tournament_delete_graph(),public.ss_rename_tournament(uuid,bigint,text),
  public.ss_set_tournament_archived(uuid,bigint,boolean),public.ss_tournament_lifecycle_review(uuid),
  public.ss_delete_tournament(uuid,bigint,text) from public,anon,authenticated,service_role;
grant execute on function public.ss_rename_tournament(uuid,bigint,text),public.ss_set_tournament_archived(uuid,bigint,boolean),
  public.ss_tournament_lifecycle_review(uuid),public.ss_delete_tournament(uuid,bigint,text) to authenticated;
-- Existing RLS and table DML revocations stay unchanged. Archive does not revoke access.
commit;
select 'LIFECYCLE_READY: owner-only rename/archive/restore/delete; competitive writes remain closed' as result;
