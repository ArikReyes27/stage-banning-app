-- Phase 15.4A: REVIEW ONLY. Run manually ONLY in stage-strike-tests after 03/04.
-- No existing frontend uses these RPCs. Competitive writes remain closed.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
do $$ begin
  if 'stage-strike-tests' <> 'stage-strike-tests' or current_user <> 'postgres' then
    raise exception 'Verify the test project in Dashboard; replace confirmation; use postgres';
  end if;
  if not exists(select from pg_roles where rolname=current_user and (rolsuper or rolbypassrls)) then
    raise exception 'RPC owner must bypass RLS; do not disable RLS to work around this';
  end if;
  if not exists(select from pg_policy where polrelid='public.profiles'::regclass and polname='profiles_self_fence') then
    raise exception 'Requires Phase 15.3';
  end if;
end $$;

create schema ss_private;
revoke all on schema ss_private from public,anon,authenticated;
create table public.tournament_admin_invitations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete restrict,
  invited_by uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending' check(status in ('pending','accepted','revoked','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now()+interval '7 days',
  resolved_at timestamptz,
  check(invitee_id<>invited_by),
  check(expires_at>created_at),
  check((status='pending')=(resolved_at is null))
);
create unique index tournament_invite_pending_idx on public.tournament_admin_invitations(tournament_id,invitee_id) where status='pending';
create index tournament_invite_recipient_idx on public.tournament_admin_invitations(invitee_id,status);
alter table public.tournament_admin_invitations enable row level security;
alter table public.tournament_admin_invitations force row level security;
revoke all on public.tournament_admin_invitations from public,anon,authenticated;

create function ss_private.actor() returns uuid language plpgsql security definer set search_path='' as $$
declare a uuid := auth.uid();
begin
  if a is null or not exists(select from auth.users u where u.id=a
    and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
    and (u.banned_until is null or u.banned_until<now()) and u.deleted_at is null) then
    raise exception using errcode='42501',message='Verified account required';
  end if;
  return a;
end $$;

-- No caller-supplied actor, no role from user_metadata; bypass prevents recursive RLS.
create function public.ss_tournament_role(p_tournament uuid) returns text language sql stable security definer set search_path='' as $$
  select case when t.owner_id=auth.uid() then 'owner' else m.role end
  from public.tournaments t
  left join public.tournament_members m on m.tournament_id=t.id and m.profile_id=auth.uid()
  where t.id=p_tournament and exists(select from auth.users u where u.id=auth.uid()
    and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
    and (u.banned_until is null or u.banned_until<now()) and u.deleted_at is null)
$$;

-- Every mutation takes this SAME parent lock before checking permissions/revision.
create function ss_private.lock_tournament(p_tournament uuid,p_owner_only boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare a uuid := ss_private.actor(); owner uuid;
begin
  select owner_id into owner from public.tournaments where id=p_tournament for update;
  if owner is null or (owner<>a and (p_owner_only or not exists(select from public.tournament_members
      where tournament_id=p_tournament and profile_id=a and role='admin'))) then
    raise exception using errcode='42501',message='Tournament operation not permitted';
  end if;
  return a;
end $$;

create function ss_private.audit(p_tournament uuid,p_expected bigint,p_action text,p_changes jsonb)
returns bigint language plpgsql security definer set search_path='' as $$
declare n bigint;
begin
  update public.tournament_brackets set revision=revision+1,updated_at=clock_timestamp(),updated_by=ss_private.actor()
    where tournament_id=p_tournament and revision=p_expected returning revision into n;
  if n is null then raise exception using errcode='40001',message='Revision conflict; reload before retrying'; end if;
  insert into public.tournament_revisions(tournament_id,revision,actor_id,action,changes)
    values(p_tournament,n,ss_private.actor(),p_action,p_changes);
  return n;
end $$;

create function public.ss_create_tournament(p_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare a uuid := ss_private.actor(); t uuid;
begin
  if p_name is null or char_length(btrim(p_name)) not between 1 and 200 then
    raise exception using errcode='22023',message='Invalid tournament name';
  end if;
  -- No metadata-based authority. A missing personal profile gets a neutral nickname.
  insert into public.profiles(id,display_name) values(a,'Jugador') on conflict(id) do nothing;
  insert into public.tournaments(owner_id,name) values(a,btrim(p_name)) returning id into t;
  insert into public.tournament_brackets(tournament_id,state,updated_by) values(t,
    '{"schemaVersion":2,"status":"draft","seeds":[],"results":{},"structure":[],"completionOrder":[]}',a);
  -- Revision 1 records creation; revision 0 exists only inside this transaction.
  perform ss_private.audit(t,0,'tournament_created',jsonb_build_object('name',btrim(p_name),'owner_id',a));
  return t;
end $$;

-- A bounded administrative edit, not an arbitrary JSONB write. Useful for CAS tests.
create function public.ss_rename_tournament(p_tournament uuid,p_expected bigint,p_name text)
returns bigint language plpgsql security definer set search_path='' as $$
declare old_name text;
begin
  perform ss_private.lock_tournament(p_tournament,false);
  if p_name is null or char_length(btrim(p_name)) not between 1 and 200 then
    raise exception using errcode='22023',message='Invalid tournament name';
  end if;
  select name into old_name from public.tournaments where id=p_tournament;
  update public.tournaments set name=btrim(p_name) where id=p_tournament;
  return ss_private.audit(p_tournament,p_expected,'tournament_renamed',jsonb_build_object('before',old_name,'after',btrim(p_name)));
end $$;

create function public.ss_invite_admin(p_tournament uuid,p_expected bigint,p_invitee uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare a uuid := ss_private.lock_tournament(p_tournament,true); invitation uuid;
begin
  if p_invitee is null or p_invitee=a or not exists(select from auth.users u join public.profiles p on p.id=u.id
    where u.id=p_invitee and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
    and (u.banned_until is null or u.banned_until<now()) and u.deleted_at is null) then
    raise exception using errcode='22023',message='A different verified account with a profile is required';
  end if;
  if exists(select from public.tournament_members where tournament_id=p_tournament and profile_id=p_invitee and role='admin') then
    raise exception using errcode='22023',message='Already an administrator';
  end if;
  update public.tournament_admin_invitations set status='expired',resolved_at=clock_timestamp()
    where tournament_id=p_tournament and invitee_id=p_invitee and status='pending' and expires_at<=clock_timestamp();
  insert into public.tournament_admin_invitations(tournament_id,invitee_id,invited_by)
    values(p_tournament,p_invitee,a) returning id into invitation;
  perform ss_private.audit(p_tournament,p_expected,'admin_invited',jsonb_build_object('invitation_id',invitation,'invitee_id',p_invitee));
  return invitation;
end $$;

-- Knowing the invitation UUID is insufficient: the authenticated subject must match.
create function public.ss_invitation_revision(p_invitation uuid) returns bigint
language plpgsql security definer set search_path='' as $$
declare a uuid := ss_private.actor(); n bigint;
begin
  select b.revision into n from public.tournament_admin_invitations i
    join public.tournament_brackets b on b.tournament_id=i.tournament_id
    where i.id=p_invitation and i.invitee_id=a and i.status='pending' and i.expires_at>clock_timestamp();
  if n is null then raise exception using errcode='42501',message='Invitation not available'; end if;
  return n;
end $$;

create function public.ss_accept_admin_invitation(p_invitation uuid,p_expected bigint)
returns bigint language plpgsql security definer set search_path='' as $$
declare a uuid := ss_private.actor(); t uuid; owner uuid; inv public.tournament_admin_invitations%rowtype; previous_role text;
begin
  select tournament_id into t from public.tournament_admin_invitations where id=p_invitation and invitee_id=a;
  if t is null then raise exception using errcode='42501',message='Invitation not available'; end if;
  select owner_id into owner from public.tournaments where id=t for update;
  select * into inv from public.tournament_admin_invitations where id=p_invitation for update;
  if inv.invitee_id<>a or inv.status<>'pending' or inv.expires_at<=clock_timestamp() or inv.invited_by is distinct from owner then
    raise exception using errcode='42501',message='Invitation not available';
  end if;
  select role into previous_role from public.tournament_members where tournament_id=t and profile_id=a;
  insert into public.tournament_members(tournament_id,profile_id,role) values(t,a,'admin')
    on conflict(tournament_id,profile_id) do update set role='admin';
  update public.tournament_admin_invitations set status='accepted',resolved_at=clock_timestamp() where id=p_invitation;
  return ss_private.audit(t,p_expected,'admin_accepted',jsonb_build_object('invitation_id',p_invitation,'profile_id',a,'before',previous_role,'after','admin'));
end $$;

create function public.ss_revoke_admin(p_tournament uuid,p_expected bigint,p_profile uuid)
returns bigint language plpgsql security definer set search_path='' as $$
declare a uuid := ss_private.lock_tournament(p_tournament,true); previous_role text; revoked jsonb;
begin
  if p_profile is null or p_profile=a then raise exception using errcode='22023',message='Cannot revoke owner'; end if;
  select role into previous_role from public.tournament_members where tournament_id=p_tournament and profile_id=p_profile;
  delete from public.tournament_members where tournament_id=p_tournament and profile_id=p_profile and role='admin';
  with changed as (update public.tournament_admin_invitations set status='revoked',resolved_at=clock_timestamp()
    where tournament_id=p_tournament and invitee_id=p_profile and status='pending' returning id)
    select coalesce(jsonb_agg(id),'[]'::jsonb) into revoked from changed;
  return ss_private.audit(p_tournament,p_expected,'admin_revoked',jsonb_build_object('profile_id',p_profile,'before',previous_role,'revoked_invitations',revoked));
end $$;

-- Internal commit boundary for the NEXT stage. Deliberately not callable by clients.
-- Must replace the validator with full server-side competitive validation first.
create function ss_private.validate_competitive_state(p_tournament uuid,p_state jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin
  raise exception using errcode='0A000',message='Competitive writes disabled pending complete server validator';
end $$;
create function ss_private.commit_bracket(p_tournament uuid,p_expected bigint,p_state jsonb)
returns bigint language plpgsql security definer set search_path='' as $$
declare previous jsonb; n bigint;
begin
  perform ss_private.lock_tournament(p_tournament,false);
  perform ss_private.validate_competitive_state(p_tournament,p_state);
  select state into previous from public.tournament_brackets where tournament_id=p_tournament;
  n := ss_private.audit(p_tournament,p_expected,'bracket_changed',jsonb_build_object('before',previous,'after',p_state));
  update public.tournament_brackets set state=p_state where tournament_id=p_tournament;
  return n;
end $$;

-- Only authenticated private readers; restrictive fence survives added permissive policies.
do $$ declare t text; begin
  foreach t in array array['tournaments','tournament_participants','tournament_members','tournament_brackets','tournament_revisions'] loop
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('alter policy phase15_lockdown on public.%I to anon',t);
    execute format('create policy tournament_scope on public.%I as restrictive for all to authenticated using (public.ss_tournament_role(%I) is not null) with check(false)',t,case when t='tournaments' then 'id' else 'tournament_id' end);
    execute format('create policy tournament_read on public.%I for select to authenticated using (public.ss_tournament_role(%I) is not null)',t,case when t='tournaments' then 'id' else 'tournament_id' end);
    execute format('grant select on public.%I to authenticated',t);
  end loop;
end $$;
-- result_reports stays completely locked, no player-report API.
create policy invitation_scope on public.tournament_admin_invitations as restrictive for all to authenticated
  using ((invitee_id=auth.uid() or public.ss_tournament_role(tournament_id)='owner')
    and exists(select from public.profiles where id=auth.uid())) with check(false);
create policy invitation_read on public.tournament_admin_invitations for select to authenticated
  using(invitee_id=auth.uid() or public.ss_tournament_role(tournament_id)='owner');
grant select on public.tournament_admin_invitations to authenticated;

-- Revoke defaults explicitly on EVERY new function, including Supabase defaults.
do $$ declare f record; begin
  for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='ss_private' or (n.nspname='public' and p.proname in (
      'ss_tournament_role','ss_create_tournament','ss_rename_tournament','ss_invite_admin','ss_invitation_revision','ss_accept_admin_invitation','ss_revoke_admin')) loop
    execute format('revoke all on function %s from public,anon,authenticated,service_role',f.signature);
  end loop;
end $$;
grant execute on function public.ss_tournament_role(uuid),public.ss_create_tournament(text),
  public.ss_rename_tournament(uuid,bigint,text),public.ss_invite_admin(uuid,bigint,uuid),
  public.ss_invitation_revision(uuid),public.ss_accept_admin_invitation(uuid,bigint),public.ss_revoke_admin(uuid,bigint,uuid) to authenticated;
commit;
select 'SECURITY_PREPARED: private tournaments and account-bound admin invitations; competitive writes disabled' as result;
