-- Phase 15.4A: manual SQL Editor test, ONLY stage-strike-tests after the new migration.
-- Existing users and tournaments are never selected as mutation targets. All fixtures roll back.
begin;
set local lock_timeout='5s';
set local statement_timeout='60s';
do $$ begin
  if 'stage-strike-tests'<>'stage-strike-tests' or current_user<>'postgres' then raise exception 'Confirm test project and run as postgres'; end if;
  if exists(select from auth.users where id::text like '154a0000-0000-0000-0000-%') then raise exception 'Fixture collision'; end if;
  if exists(select from pg_trigger where tgrelid in ('auth.users'::regclass,'public.profiles'::regclass) and not tgisinternal and tgenabled<>'D') then raise exception 'Review custom Auth/profile triggers first'; end if;
end $$;
create function pg_temp.assert_true(ok boolean,label text) returns void language plpgsql security invoker as $$
begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; end $$;
create function pg_temp.expect_state(command text,expected text) returns void language plpgsql security invoker as $$
declare actual text;
begin
  begin execute command; exception when others then get stacked diagnostics actual=returned_sqlstate; end;
  if actual is distinct from expected then raise exception 'Expected %, got %',expected,actual; end if;
end $$;
do $$ begin
  execute format('grant usage on schema %I to anon,authenticated',(select nspname from pg_namespace where oid=pg_my_temp_schema()));
end $$;
grant execute on function pg_temp.assert_true(boolean,text),pg_temp.expect_state(text,text) to anon,authenticated;

create function pg_temp.actor(n integer) returns void language plpgsql security invoker as $$
declare a text := '154a0000-0000-0000-0000-'||lpad(n::text,12,'0');
begin
  perform set_config('request.jwt.claim.sub',a,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
end $$;
grant execute on function pg_temp.actor(integer) to authenticated;
create temporary table test_ids(label text primary key,id uuid);
grant select,insert on test_ids to authenticated;
insert into auth.users(id,email_confirmed_at)
  select ('154a0000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,case when n=6 then null else now() end from generate_series(1,7) n;
insert into public.profiles(id,display_name)
  select ('154a0000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,'Fixture '||n from generate_series(1,7) n;
update auth.users set raw_user_meta_data='{"role":"owner","nickname":"Owner 1"}' where id='154a0000-0000-0000-0000-000000000004';

select pg_temp.actor(1);
set local role authenticated;
select pg_temp.assert_true(current_user='authenticated' and auth.uid()='154a0000-0000-0000-0000-000000000001'::uuid,'real owner role and subject');
insert into test_ids values('t1',public.ss_create_tournament('Owner 1 A')),('t2',public.ss_create_tournament('Owner 1 B'));
select pg_temp.assert_true((select count(*)=2 from public.tournaments),'multiple own tournaments, no foreign rows');
select pg_temp.assert_true((select bool_and(owner_id=auth.uid()) from public.tournaments),'automatic owner assignment');
select pg_temp.assert_true(row_security_active('public.tournaments'::regclass),'RLS really active');
select pg_temp.expect_state($q$select public.ss_create_tournament('')$q$,'22023');
select pg_temp.expect_state($q$select public.ss_create_tournament('Forged owner','154a0000-0000-0000-0000-000000000002'::uuid)$q$,'42883');
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),null,'Missing revision')$q$,'40001');
select pg_temp.expect_state($q$update public.tournaments set owner_id='154a0000-0000-0000-0000-000000000005'$q$,'42501');
select pg_temp.expect_state($q$update public.tournament_brackets set state='{}'$q$,'42501');
select pg_temp.expect_state($q$insert into public.tournament_members(tournament_id,profile_id,role) select id,auth.uid(),'admin' from test_ids where label='t1'$q$,'42501');

select pg_temp.actor(2);
insert into test_ids values('foreign',public.ss_create_tournament('Owner 2'));
select pg_temp.assert_true((select count(*)=1 from public.tournaments),'owner 2 isolation');
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),1,'Hijack')$q$,'42501');

select pg_temp.actor(1);
insert into test_ids select 'invite3',public.ss_invite_admin((select id from test_ids where label='t1'),1,'154a0000-0000-0000-0000-000000000003');
insert into test_ids select 'invite7',public.ss_invite_admin((select id from test_ids where label='t1'),2,'154a0000-0000-0000-0000-000000000007');
select pg_temp.expect_state($q$select public.ss_invite_admin((select id from test_ids where label='t1'),3,auth.uid())$q$,'22023');
select pg_temp.expect_state($q$select public.ss_invite_admin((select id from test_ids where label='t1'),3,'154a0000-0000-0000-0000-000000000006')$q$,'22023');

select pg_temp.actor(5);
select pg_temp.assert_true((select count(*)=0 from public.tournaments),'outsider sees no tournaments');
select pg_temp.expect_state($q$select public.ss_accept_admin_invitation((select id from test_ids where label='invite3'),3)$q$,'42501');
select pg_temp.expect_state($q$select public.ss_invitation_revision((select id from test_ids where label='invite3'))$q$,'42501');

select pg_temp.actor(3);
select pg_temp.assert_true((select count(*)=0 from public.tournaments),'invitation alone does not grant tournament access');
select pg_temp.assert_true(public.ss_invitation_revision((select id from test_ids where label='invite3'))=3,'recipient can obtain revision without tournament access');
select pg_temp.assert_true(public.ss_accept_admin_invitation((select id from test_ids where label='invite3'),3)=4,'admin accepts own invitation');
select pg_temp.assert_true(public.ss_tournament_role((select id from test_ids where label='t1'))='admin','effective admin');
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='foreign'),1,'Admin cross-tenant edit')$q$,'42501');
select pg_temp.expect_state($q$select public.ss_accept_admin_invitation((select id from test_ids where label='invite3'),4)$q$,'42501');
select pg_temp.expect_state($q$select public.ss_invite_admin((select id from test_ids where label='t1'),4,'154a0000-0000-0000-0000-000000000005')$q$,'42501');
select pg_temp.expect_state($q$select public.ss_revoke_admin((select id from test_ids where label='t1'),4,'154a0000-0000-0000-0000-000000000007')$q$,'42501');

select pg_temp.actor(7);
select pg_temp.assert_true(public.ss_accept_admin_invitation((select id from test_ids where label='invite7'),4)=5,'second admin accepted');
select pg_temp.actor(1);
select pg_temp.assert_true(public.ss_rename_tournament((select id from test_ids where label='t1'),5,'Owner edit')=6,'owner edit');
-- 15.5C restricts rename to owner. Simulate two tabs of that owner for CAS.
select pg_temp.actor(1);
select pg_temp.assert_true(public.ss_rename_tournament((select id from test_ids where label='t1'),6,'Owner tab A')=7,'first owner tab commits');
-- Sequential stale-client simulation, NOT a real two-connection race.
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),6,'Lost update')$q$,'40001');
select pg_temp.assert_true((select name='Owner tab A' from public.tournaments where id=(select id from test_ids where label='t1')),'conflict rolled back rename');
select pg_temp.assert_true((select count(*)=7 from public.tournament_revisions where tournament_id=(select id from test_ids where label='t1')),'conflict produced no audit row');
select pg_temp.assert_true((select actor_id='154a0000-0000-0000-0000-000000000001'::uuid from public.tournament_revisions where tournament_id=(select id from test_ids where label='t1') and revision=7),'audit actor derived from Auth');
select pg_temp.assert_true(public.ss_rename_tournament((select id from test_ids where label='t1'),7,'Owner tab B')=8,'explicit retry after reload');

set local role postgres;
-- Only fixture setup uses privileged DML. Application has no player-enrollment RPC yet.
insert into public.tournament_members(tournament_id,profile_id,role)
  select id,'154a0000-0000-0000-0000-000000000004','player' from test_ids where label='t1';
select pg_temp.actor(4);
set local role authenticated;
select pg_temp.assert_true(public.ss_tournament_role((select id from test_ids where label='t1'))='player','player role');
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),8,'Player edit')$q$,'42501');
select pg_temp.expect_state($q$update public.tournament_members set role='admin' where profile_id=auth.uid()$q$,'42501');
select pg_temp.expect_state($q$select ss_private.commit_bracket((select id from test_ids where label='t1'),8,'{}')$q$,'42501');

select pg_temp.actor(1);
select pg_temp.assert_true(public.ss_revoke_admin((select id from test_ids where label='t1'),8,'154a0000-0000-0000-0000-000000000003')=9,'owner revokes admin');
select pg_temp.actor(3);
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),9,'Revoked edit')$q$,'42501');
select pg_temp.assert_true(public.ss_tournament_role((select id from test_ids where label='t1')) is null,'revoked admin has no role');

select pg_temp.actor(1);
insert into test_ids select 'cancelled',public.ss_invite_admin((select id from test_ids where label='t1'),9,'154a0000-0000-0000-0000-000000000005');
select pg_temp.assert_true(public.ss_revoke_admin((select id from test_ids where label='t1'),10,'154a0000-0000-0000-0000-000000000005')=11,'cancel pending invitation');
select pg_temp.actor(5);
select pg_temp.expect_state($q$select public.ss_accept_admin_invitation((select id from test_ids where label='cancelled'),11)$q$,'42501');
select pg_temp.actor(1);
insert into test_ids select 'expired',public.ss_invite_admin((select id from test_ids where label='t1'),11,'154a0000-0000-0000-0000-000000000003');
set local role postgres;
update public.tournament_admin_invitations set created_at=now()-interval '8 days',expires_at=now()-interval '1 second' where id=(select id from test_ids where label='expired');
select pg_temp.actor(3);
set local role authenticated;
select pg_temp.expect_state($q$select public.ss_accept_admin_invitation((select id from test_ids where label='expired'),12)$q$,'42501');
select pg_temp.actor(6);
select pg_temp.expect_state($q$select public.ss_create_tournament('Unverified')$q$,'42501');

set local role postgres;
select pg_temp.actor(1);
select pg_temp.expect_state($q$select ss_private.commit_bracket((select id from test_ids where label='t1'),12,'{}')$q$,'0A000');
select pg_temp.assert_true((select state->'results'='{}'::jsonb and revision=12 from public.tournament_brackets where tournament_id=(select id from test_ids where label='t1')),'competitive writes fail closed');
select pg_temp.assert_true(not exists(select from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='ss_private' and has_function_privilege('authenticated',p.oid,'EXECUTE')),'private functions inaccessible');
select pg_temp.assert_true(not exists(select from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname in ('ss_tournament_role','ss_create_tournament','ss_rename_tournament','ss_invite_admin','ss_invitation_revision','ss_accept_admin_invitation','ss_revoke_admin')
  and has_function_privilege('anon',p.oid,'EXECUTE')),'all administrative RPCs deny anon');

do $$ declare t text; r text; begin
  foreach r in array array['anon','authenticated'] loop
    foreach t in array array['tournaments','tournament_participants','tournament_members','tournament_brackets','tournament_revisions','result_reports','tournament_admin_invitations'] loop
      perform pg_temp.assert_true(not has_table_privilege(r,format('public.%I',t),'INSERT,UPDATE,DELETE,TRUNCATE'),'no direct writes '||t);
      execute format('set local role %I',r);
      perform pg_temp.assert_true(current_user=r,'real DML test role');
      perform pg_temp.expect_state(format('delete from public.%I where false',t),'42501');
      execute 'set local role postgres';
    end loop;
  end loop;
end $$;

set local request.jwt.claim.sub='';
set local request.jwt.claims='{"role":"anon"}';
set local role anon;
select pg_temp.assert_true(current_user='anon' and auth.uid() is null,'real anonymous role');
select pg_temp.expect_state($q$select public.ss_create_tournament('Anon')$q$,'42501');
select pg_temp.expect_state('select * from public.tournaments','42501');
select pg_temp.expect_state('select * from public.tournament_admin_invitations','42501');
set local role postgres;
rollback;
do $$ begin
  if exists(select from auth.users where id::text like '154a0000-0000-0000-0000-%') then raise exception 'Fixture cleanup failed'; end if;
end $$;
select 'PASS: owners, admins, players, invitations, revocations, stale revisions, audit rollback and anon; fixtures rolled back' as result;

