-- STAGE//STRIKE: ONLY stage-strike-tests. Run ALL contents, never a selection.
-- Requires script 01. No psql commands, extensions, new roles or Auth schemas.
-- All fixtures, grants and policy changes are rolled back. NEVER change ROLLBACK.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
-- Manual safety gate, NOT automatic project identification.
-- In the Dashboard verify project NAME stage-strike-tests AND its project reference.
-- Only then replace CONFIRM_TEST_PROJECT below with stage-strike-tests.
do $$ begin
  if 'CONFIRM_TEST_PROJECT' <> 'stage-strike-tests' then
    raise exception 'STOP: verify stage-strike-tests in the Dashboard, then replace the confirmation placeholder';
  end if;
  if current_user <> 'postgres' then
    raise exception 'Run the complete script as postgres in SQL Editor';
  end if;
  if to_regclass('auth.users') is null or to_regprocedure('auth.uid()') is null then
    raise exception 'Supabase Auth objects must already exist';
  end if;
  if (select count(*) from pg_roles where rolname in ('anon','authenticated') and not rolsuper and not rolbypassrls) <> 2 then
    raise exception 'Expected existing non-privileged Supabase API roles';
  end if;
end $$;

-- Fail closed on existing app data, fixture UUID collisions or custom triggers.
-- ACCESS EXCLUSIVE prevents concurrent app writes during this short test.
do $$ declare t text; n bigint; begin
  foreach t in array array['profiles','tournaments','tournament_participants','tournament_members','tournament_brackets','tournament_revisions','result_reports'] loop
    if to_regclass(format('public.%I',t)) is null then raise exception 'Apply script 01 first'; end if;
    execute format('lock table public.%I in access exclusive mode',t);
    execute format('select count(*) from public.%I',t) into n;
    if n <> 0 then raise exception 'STOP: public.% contains existing data; nothing will be tested',t; end if;
    if exists (select from pg_trigger where tgrelid=format('public.%I',t)::regclass and not tgisinternal and tgenabled <> 'D') then
      raise exception 'STOP: custom trigger on public.% needs review',t;
    end if;
  end loop;
  if exists (select from pg_trigger where tgrelid='auth.users'::regclass and not tgisinternal and tgenabled <> 'D') then
    raise exception 'STOP: custom auth.users trigger needs review before inserting fixtures';
  end if;
  if exists (select from auth.users where id in (
    '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004')) then
    raise exception 'STOP: fixture UUID collision; existing users will not be changed';
  end if;
end $$;

create function pg_temp.assert_true(ok boolean, label text) returns void language plpgsql security invoker as $$
begin if ok is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
create function pg_temp.expect_state(command text, expected text) returns void language plpgsql security invoker as $$
declare actual text;
begin
  begin execute command; exception when others then
    get stacked diagnostics actual = returned_sqlstate;
  end;
  if actual is distinct from expected then
    raise exception 'Expected SQLSTATE %, got % for %', expected, actual, command;
  end if;
end $$;

-- Do not depend on installation-specific defaults for temporary helper access.
do $$ begin
  execute format('grant usage on schema %I to anon, authenticated',
    (select nspname from pg_namespace where oid=pg_my_temp_schema()));
end $$;
grant execute on function pg_temp.assert_true(boolean,text) to anon,authenticated;
grant execute on function pg_temp.expect_state(text,text) to anon,authenticated;

insert into auth.users (id) values
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000003'),
 ('00000000-0000-0000-0000-000000000004');
insert into public.profiles(id) select id from auth.users where id in (
 '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',
 '00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004');
insert into public.tournaments(id,owner_id,name) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Test A'),
 ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','Test B');
insert into public.tournament_members(tournament_id,profile_id,role) values
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002','admin'),
 ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000003','player');
insert into public.tournament_participants(tournament_id,id,nickname,roster_order)
 select id,'same-local-id','Guest',0 from public.tournaments;
insert into public.tournament_brackets(tournament_id,state)
 select id,'{"schemaVersion":1,"status":"draft","seeds":[],"results":{}}' from public.tournaments;
insert into public.tournament_revisions(tournament_id,revision,action,changes)
 select id,1,'test','{}' from public.tournaments;
insert into public.result_reports(tournament_id,match_id,submitted_by,expected_revision,proposed_result)
 values ('10000000-0000-0000-0000-000000000001','W1','00000000-0000-0000-0000-000000000003',0,'{}');

-- FK, scoped uniqueness, role escalation and report lifecycle.
select pg_temp.expect_state($q$update public.tournaments set owner_id='00000000-0000-0000-0000-000000000099'$q$,'23503');
select pg_temp.expect_state($q$delete from public.profiles where id='00000000-0000-0000-0000-000000000001'$q$,'23503');
select pg_temp.expect_state($q$insert into public.tournament_participants select * from public.tournament_participants$q$,'23505');
select pg_temp.expect_state($q$update public.tournament_members set role='owner'$q$,'23514');
select pg_temp.expect_state($q$update public.result_reports set status='accepted'$q$,'23514');
select pg_temp.expect_state($q$update public.tournament_brackets set revision=-1$q$,'23514');
select pg_temp.expect_state($q$update public.tournament_revisions set revision=0$q$,'23514');

-- Missing/null fields, string versions and incomplete v2 must not pass CHECK via NULL.
do $$ declare bad jsonb; begin
  foreach bad in array array[
    '{}'::jsonb, 'null'::jsonb,
    '{"schemaVersion":"1","status":"draft","seeds":[],"results":{}}'::jsonb,
    '{"schemaVersion":2,"status":"draft","seeds":[],"results":{}}'::jsonb,
    '{"schemaVersion":1,"status":"draft","seeds":[],"results":{},"participants":[]}'::jsonb,
    '{"schemaVersion":2,"status":"draft","seeds":[],"results":{},"structure":null,"completionOrder":[]}'::jsonb
  ] loop
    perform pg_temp.expect_state(format('update public.tournament_brackets set state=%L::jsonb',bad),'23514');
  end loop;
end $$;
update public.tournament_brackets set state='{"schemaVersion":2,"status":"draft","seeds":[],"results":{},"structure":[],"completionOrder":[]}';
-- This is only SQL shape validity, not a valid complete competitive Tournament.

-- Real role switches: JWT claims alone do NOT change PostgreSQL permissions.
-- Helpers are SECURITY INVOKER. Assert current_user and auth.uid() after every switch.
-- Test anon plus authenticated owner/admin/player/outsider. All are blocked today.
do $$
declare
  t text; r text; actor text; scenario integer; row_json jsonb; n bigint;
  key_column text; privilege_name text; admin_role text := current_user;
begin
  foreach t in array array['profiles','tournaments','tournament_participants','tournament_members','tournament_brackets','tournament_revisions','result_reports'] loop
    key_column := case when t in ('profiles','tournaments','result_reports') then 'id' else 'tournament_id' end;
    perform pg_temp.assert_true((select relrowsecurity and relforcerowsecurity from pg_class where oid=format('public.%I',t)::regclass),'ENABLE/FORCE RLS '||t);
    perform pg_temp.assert_true(exists(select from pg_policy where polrelid=format('public.%I',t)::regclass and polname='phase15_lockdown' and not polpermissive and polcmd='*'),'restrictive ALL policy '||t);
    execute format('select to_jsonb(x) from public.%I x limit 1',t) into row_json;
    perform pg_temp.assert_true(row_json is not null,'nonempty fixture '||t);

    foreach r in array array['anon','authenticated'] loop
      foreach privilege_name in array array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] loop
        perform pg_temp.assert_true(not has_table_privilege(r,format('public.%I',t),privilege_name),'ACL revoked: '||r||' '||privilege_name||' '||t);
      end loop;
    end loop;

    for scenario in 0..4 loop
      r := case when scenario=0 then 'anon' else 'authenticated' end;
      actor := case when scenario=0 then '' else '00000000-0000-0000-0000-00000000000'||scenario end;
      perform set_config('request.jwt.claim.sub',actor,true);
      perform set_config('request.jwt.claim.role',r,true);
      perform set_config('request.jwt.claims',jsonb_build_object('sub',nullif(actor,''),'role',r)::text,true);
      execute format('set local role %I',r);
      perform pg_temp.assert_true(current_user=r,'actual role ACL');
      perform pg_temp.assert_true(auth.uid() is not distinct from nullif(actor,'')::uuid,'actual auth.uid ACL');
      perform pg_temp.expect_state(format('select * from public.%I',t),'42501');
      perform pg_temp.expect_state(format('insert into public.%I select * from jsonb_populate_record(null::public.%I,%L::jsonb)',t,t,row_json),'42501');
      perform pg_temp.expect_state(format('update public.%I set %I=%I',t,key_column,key_column),'42501');
      perform pg_temp.expect_state(format('delete from public.%I',t),'42501');
      execute format('set local role %I',admin_role);
    end loop;

    -- Transaction-only grants and permissive policy isolate the restrictive policy.
    -- No other connection sees these uncommitted permission changes.
    execute format('grant select,insert,update,delete on public.%I to anon,authenticated',t);
    execute format('create policy phase15_test_permissive on public.%I for all to anon,authenticated using(true) with check(true)',t);
    for scenario in 0..4 loop
      r := case when scenario=0 then 'anon' else 'authenticated' end;
      actor := case when scenario=0 then '' else '00000000-0000-0000-0000-00000000000'||scenario end;
      perform set_config('request.jwt.claim.sub',actor,true);
      perform set_config('request.jwt.claim.role',r,true);
      perform set_config('request.jwt.claims',jsonb_build_object('sub',nullif(actor,''),'role',r)::text,true);
      execute format('set local role %I',r);
      perform pg_temp.assert_true(current_user=r,'actual role RLS');
      perform pg_temp.assert_true(auth.uid() is not distinct from nullif(actor,'')::uuid,'actual auth.uid RLS');
      perform pg_temp.assert_true(row_security_active(format('public.%I',t)::regclass),'RLS active for caller '||t);
      execute format('select count(*) from public.%I',t) into n;
      perform pg_temp.assert_true(n=0,'RLS hides rows '||t);
      execute format('update public.%I set %I=%I',t,key_column,key_column);
      get diagnostics n = row_count;
      perform pg_temp.assert_true(n=0,'RLS blocks update '||t);
      execute format('delete from public.%I',t);
      get diagnostics n = row_count;
      perform pg_temp.assert_true(n=0,'RLS blocks delete '||t);
      perform pg_temp.expect_state(format('insert into public.%I select * from jsonb_populate_record(null::public.%I,%L::jsonb)',t,t,row_json),'42501');
      execute format('set local role %I',admin_role);
    end loop;

    -- Positive control: temporarily lift ONLY the restrictive condition.
    -- Both real roles must now see the fixtures, ruling out vacuous empty-table tests.
    execute format('alter policy phase15_lockdown on public.%I using(true) with check(true)',t);
    foreach r in array array['anon','authenticated'] loop
      actor := case when r='anon' then '' else '00000000-0000-0000-0000-000000000004' end;
      perform set_config('request.jwt.claim.sub',actor,true);
      perform set_config('request.jwt.claim.role',r,true);
      perform set_config('request.jwt.claims',jsonb_build_object('sub',nullif(actor,''),'role',r)::text,true);
      execute format('set local role %I',r);
      perform pg_temp.assert_true(current_user=r,'actual role positive control');
      perform pg_temp.assert_true(auth.uid() is not distinct from nullif(actor,'')::uuid,'actual auth.uid positive control');
      execute format('select count(*) from public.%I',t) into n;
      perform pg_temp.assert_true(n>0,'positive control sees fixtures '||t);
      execute format('set local role %I',admin_role);
    end loop;
    execute format('alter policy phase15_lockdown on public.%I using(false) with check(false)',t);
  end loop;
end $$;

-- Reverts Auth fixtures, app fixtures, helper functions, claims, grants and policies.
rollback;
-- Read-only cleanup assertions: PASS requires restoration, not just test execution.
do $$ declare t text; r text; n bigint; begin
  if exists(select from auth.users where id in (
    '00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004')) then
    raise exception 'FAIL: Auth fixtures were not rolled back';
  end if;
  foreach t in array array['profiles','tournaments','tournament_participants','tournament_members','tournament_brackets','tournament_revisions','result_reports'] loop
    execute format('select count(*) from public.%I',t) into n;
    if n<>0 then raise exception 'FAIL: app fixtures remain in %',t; end if;
    if exists(select from pg_policy where polrelid=format('public.%I',t)::regclass and polname='phase15_test_permissive') then
      raise exception 'FAIL: temporary policy remains on %',t;
    end if;
    if not exists(select from pg_policy where polrelid=format('public.%I',t)::regclass
      and polname='phase15_lockdown' and not polpermissive
      and pg_get_expr(polqual,polrelid)='false' and pg_get_expr(polwithcheck,polrelid)='false') then
      raise exception 'FAIL: restrictive policy not restored on %',t;
    end if;
    foreach r in array array['anon','authenticated'] loop
      if has_table_privilege(r,format('public.%I',t),'SELECT,INSERT,UPDATE,DELETE') then
        raise exception 'FAIL: test grants remain on % for %',t,r;
      end if;
    end loop;
  end loop;
end $$;
select 'PASS: constraints + ACL + RLS (7 tables, anon and 4 authenticated identities); fixtures rolled back' as result;

