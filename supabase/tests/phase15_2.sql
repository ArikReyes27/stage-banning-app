-- ONLY on a disposable, empty local database named stage_strike_phase15_test.
-- psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -d stage_strike_phase15_test -f supabase/tests/phase15_2.sql
\set ON_ERROR_STOP on
do $$ begin
  if current_database() <> 'stage_strike_phase15_test'
     or inet_server_addr() not in ('127.0.0.1'::inet, '::1'::inet)
     or inet_server_addr() is null then
    raise exception 'Requires the disposable local test database';
  end if;
  if exists (select from pg_namespace where nspname = 'auth')
     or exists (select from pg_tables where schemaname = 'public') then
    raise exception 'Requires an empty database, never an existing Supabase database';
  end if;
end $$;

-- Auth and API roles are fixtures, not a full Supabase installation.
do $$ begin
  if not exists (select from pg_roles where rolname = 'anon') then create role anon; end if;
  if not exists (select from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  if exists (select from pg_roles where rolname in ('anon', 'authenticated') and (rolsuper or rolbypassrls)) then
    raise exception 'Test API roles must not bypass RLS';
  end if;
end $$;
create schema auth;
create table auth.users (id uuid primary key);
\ir ../migrations/20261023000000_initial_tournament_architecture.sql

begin;
create function pg_temp.assert_true(ok boolean, label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
create function pg_temp.expect_state(command text, expected text) returns void language plpgsql as $$
declare actual text;
begin
  begin execute command; exception when others then
    get stacked diagnostics actual = returned_sqlstate;
  end;
  if actual is distinct from expected then
    raise exception 'Expected SQLSTATE %, got % for %', expected, actual, command;
  end if;
end $$;

insert into auth.users values
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000003');
insert into public.profiles(id) select id from auth.users;
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

-- Exercise both ACL denial and RLS independently on every table, with rows present.
do $$
declare t text; r text; row_json jsonb; n bigint; key_column text;
begin
  foreach t in array array['profiles','tournaments','tournament_participants','tournament_members','tournament_brackets','tournament_revisions','result_reports'] loop
    key_column := case when t in ('profiles','tournaments','result_reports') then 'id' else 'tournament_id' end;
    perform pg_temp.assert_true((select relrowsecurity and relforcerowsecurity from pg_class where oid=format('public.%I',t)::regclass),'ENABLE/FORCE RLS '||t);
    execute format('select to_jsonb(x) from public.%I x limit 1',t) into row_json;
    foreach r in array array['anon','authenticated'] loop
      execute format('set local role %I',r);
      perform pg_temp.expect_state(format('select * from public.%I',t),'42501');
      perform pg_temp.expect_state(format('insert into public.%I select * from jsonb_populate_record(null::public.%I,%L::jsonb)',t,t,row_json),'42501');
      perform pg_temp.expect_state(format('update public.%I set %I=%I',t,key_column,key_column),'42501');
      perform pg_temp.expect_state(format('delete from public.%I',t),'42501');
      execute 'reset role';
      perform pg_temp.assert_true(not has_table_privilege(r,format('public.%I',t),'UPDATE'),'UPDATE revoked '||t);
      perform pg_temp.assert_true(not has_table_privilege(r,format('public.%I',t),'DELETE'),'DELETE revoked '||t);
      perform pg_temp.assert_true(not has_table_privilege(r,format('public.%I',t),'TRUNCATE'),'TRUNCATE revoked '||t);
    end loop;
    execute format('grant select,insert,update,delete on public.%I to anon,authenticated',t);
    execute format('create policy test_permissive on public.%I for all to anon,authenticated using(true) with check(true)',t);
    foreach r in array array['anon','authenticated'] loop
      execute format('set local role %I',r);
      execute format('select count(*) from public.%I',t) into n;
      perform pg_temp.assert_true(n=0,'RLS hides rows '||t);
      execute format('update public.%I set %I=%I',t,key_column,key_column);
      get diagnostics n = row_count;
      perform pg_temp.assert_true(n=0,'RLS blocks update '||t);
      execute format('delete from public.%I',t);
      get diagnostics n = row_count;
      perform pg_temp.assert_true(n=0,'RLS blocks delete '||t);
      perform pg_temp.expect_state(format('insert into public.%I select * from jsonb_populate_record(null::public.%I,%L::jsonb)',t,t,row_json),'42501');
      execute 'reset role';
    end loop;
  end loop;
end $$;
rollback;
\echo 'PASS: migration, constraints, ACL and restrictive RLS. Test schema remains in disposable DB only.'
