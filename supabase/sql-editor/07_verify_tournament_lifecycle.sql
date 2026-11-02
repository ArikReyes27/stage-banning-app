-- Run manually ONLY in stage-strike-tests after 20261102000000_tournament_lifecycle.sql.
-- Internal state inspections (not authorization checks) run as postgres; user operations stay under authenticated/anon. No grants added.
-- Test fixtures only. Authenticated/anon use real SET ROLE. Everything rolls back.
begin;
set local lock_timeout='5s';
set local statement_timeout='60s';
do $$ begin
  if 'CONFIRM_TEST_PROJECT'<>'stage-strike-tests' or current_user<>'postgres' then raise exception 'Confirm test project; use postgres'; end if;
  if exists(select from auth.users where id::text like '155c0000-0000-0000-0000-%') then raise exception 'Fixture collision'; end if;
  if exists(select from pg_trigger where tgrelid in ('auth.users'::regclass,'public.profiles'::regclass) and not tgisinternal and tgenabled<>'D') then raise exception 'Review custom Auth/profile triggers first'; end if;
end $$;
create function pg_temp.assert_true(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %',label; end if; end $$;
create function pg_temp.expect_state(command text,expected text) returns void language plpgsql as $$
declare actual text;
begin
  begin execute command; exception when others then get stacked diagnostics actual=returned_sqlstate; end;
  if actual is distinct from expected then raise exception 'Expected %, got %',expected,actual; end if;
end $$;
create function pg_temp.actor(n integer) returns void language plpgsql as $$
declare a text:='155c0000-0000-0000-0000-'||lpad(n::text,12,'0');
begin
  perform set_config('request.jwt.claim.sub',a,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
end $$;
do $$ begin execute format('grant usage on schema %I to anon,authenticated',(select nspname from pg_namespace where oid=pg_my_temp_schema())); end $$;
grant execute on function pg_temp.actor(integer),pg_temp.assert_true(boolean,text),pg_temp.expect_state(text,text) to authenticated,anon;
create temporary table test_ids(label text primary key,id uuid);
create temporary table drafts(label text primary key,payload jsonb);
grant select,insert on test_ids to authenticated;
grant select on drafts to authenticated;
insert into auth.users(id,email_confirmed_at) select ('155c0000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,now() from generate_series(1,4) n;
insert into public.profiles(id,display_name) select ('155c0000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid,'Fixture '||n from generate_series(1,4) n;

select pg_temp.actor(1);
set local role authenticated;
insert into test_ids values('t1',public.ss_create_tournament('Delete fixture')),('t2',public.ss_create_tournament('Keep fixture'));
insert into test_ids select 'invite',public.ss_invite_admin((select id from test_ids where label='t1'),1,'155c0000-0000-0000-0000-000000000002');
select pg_temp.actor(2);
select public.ss_accept_admin_invitation((select id from test_ids where label='invite'),2);
set local role postgres;
insert into public.tournament_members(tournament_id,profile_id,role) select id,'155c0000-0000-0000-0000-000000000004','player' from test_ids where label='t1';
insert into public.tournament_participants(tournament_id,id,nickname,roster_order) select id,'fixture','Fixture',0 from test_ids where label='t1';
insert into public.result_reports(tournament_id,match_id,submitted_by,expected_revision,proposed_result)
 select id,'W1','155c0000-0000-0000-0000-000000000004',3,'{}' from test_ids where label='t1';
set local role authenticated;
select pg_temp.assert_true(current_user='authenticated' and row_security_active('public.tournaments'::regclass),'RLS active under authenticated');
do $$ declare actor integer; begin
 for actor in 2..4 loop
  perform pg_temp.actor(actor);
  perform pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),3,'Hijack')$q$,'42501');
  perform pg_temp.expect_state($q$select public.ss_set_tournament_archived((select id from test_ids where label='t1'),3,true)$q$,'42501');
  perform pg_temp.expect_state($q$select public.ss_set_tournament_archived((select id from test_ids where label='t1'),3,false)$q$,'42501');
  perform pg_temp.expect_state($q$select public.ss_delete_tournament((select id from test_ids where label='t1'),3,'Delete fixture')$q$,'42501');
  perform pg_temp.expect_state($q$select public.ss_tournament_lifecycle_review((select id from test_ids where label='t1'))$q$,'42501');
 end loop;
end $$;
select pg_temp.actor(1);
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),3,' ')$q$,'22023');
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),3,repeat('x',201))$q$,'22023');
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),null,'No revision')$q$,'40001');
select pg_temp.assert_true(public.ss_rename_tournament((select id from test_ids where label='t1'),3,'Renamed fixture')=4,'owner rename');
select pg_temp.expect_state($q$select public.ss_rename_tournament((select id from test_ids where label='t1'),3,'Stale rename')$q$,'40001');
set local role postgres;
select pg_temp.assert_true((select name='Renamed fixture' from public.tournaments where id=(select id from test_ids where label='t1')),'stale rename rolls back');
set local role authenticated;
select pg_temp.expect_state($q$select public.ss_set_tournament_archived((select id from test_ids where label='t1'),4,null)$q$,'22023');
select pg_temp.assert_true(public.ss_set_tournament_archived((select id from test_ids where label='t1'),4,true)=5,'archive');
select pg_temp.actor(2);
select pg_temp.assert_true((select archived_at is not null from public.tournaments where id=(select id from test_ids where label='t1')),'admin still reads archived tournament');
select pg_temp.assert_true(public.ss_tournament_role((select id from test_ids where label='t1'))='admin','archive retains permission');
select pg_temp.actor(1);
select pg_temp.expect_state($q$select public.ss_set_tournament_archived((select id from test_ids where label='t1'),4,false)$q$,'40001');
set local role postgres;
select pg_temp.assert_true((select archived_at is not null from public.tournaments where id=(select id from test_ids where label='t1')),'stale restore rolls back');
set local role authenticated;
select pg_temp.assert_true(public.ss_set_tournament_archived((select id from test_ids where label='t1'),5,false)=6,'restore');
set local role postgres;
select pg_temp.assert_true((select archived_at is null from public.tournaments where id=(select id from test_ids where label='t1')),'restored active');
select pg_temp.assert_true((select count(*)=1 from public.tournament_participants where tournament_id=(select id from test_ids where label='t1')),'rename/archive retain roster');
select pg_temp.assert_true((select count(*)=6 and bool_and(actor_id=auth.uid() or revision=3) from public.tournament_revisions where tournament_id=(select id from test_ids where label='t1')),'audits and actor');
set local role authenticated;
select pg_temp.assert_true(public.ss_tournament_lifecycle_review((select id from test_ids where label='t1'))->>'version'='15503','versioned owner review');
select pg_temp.expect_state($q$select public.ss_delete_tournament((select id from test_ids where label='t1'),6,'renamed fixture')$q$,'22023');
select pg_temp.expect_state($q$select public.ss_delete_tournament((select id from test_ids where label='t1'),6,'Renamed fixture ')$q$,'22023');
select pg_temp.expect_state($q$select public.ss_delete_tournament((select id from test_ids where label='t1'),5,'Renamed fixture')$q$,'40001');
select pg_temp.expect_state($q$select public.ss_delete_tournament((select id from test_ids where label='t1'),null,'Renamed fixture')$q$,'40001');
select pg_temp.expect_state($q$delete from public.tournaments where id=(select id from test_ids where label='t1')$q$,'42501');
select pg_temp.expect_state($q$update public.tournaments set archived_at=now() where id=(select id from test_ids where label='t1')$q$,'42501');

set local role postgres;
-- New fixture trigger scoped to this test, rolled back. Guard must refuse custom cascades.
create function pg_temp.lifecycle_trigger() returns trigger language plpgsql as $$ begin return old; end $$;
create trigger ss_test_155c_guard before delete on public.tournaments for each row execute function pg_temp.lifecycle_trigger();
set local role authenticated;
select pg_temp.expect_state($q$select public.ss_delete_tournament((select id from test_ids where label='t1'),6,'Renamed fixture')$q$,'0A000');
set local role postgres;
drop trigger ss_test_155c_guard on public.tournaments;
set local role authenticated;
set local role postgres;
select pg_temp.assert_true((select revision=6 from public.tournament_brackets where tournament_id=(select id from test_ids where label='t1')),'blocked delete preserves revision');
set local role authenticated;
select pg_temp.assert_true(public.ss_delete_tournament((select id from test_ids where label='t1'),6,'Renamed fixture')->>'deleted_id'=(select id::text from test_ids where label='t1'),'owner deletes selected only');
select pg_temp.expect_state($q$select public.ss_delete_tournament((select id from test_ids where label='t1'),6,'Renamed fixture')$q$,'42501');
set local role postgres;
do $$ declare child text; remaining bigint; begin
 foreach child in array array['tournament_participants','tournament_members','tournament_brackets','tournament_revisions','result_reports','tournament_admin_invitations'] loop
  execute format('select count(*) from public.%I where tournament_id=$1',child) into remaining using (select id from test_ids where label='t1');
  perform pg_temp.assert_true(remaining=0,'cascade '||child);
 end loop;
 perform pg_temp.assert_true(not exists(select from public.tournaments where id=(select id from test_ids where label='t1')),'parent gone');
 perform pg_temp.assert_true((select name='Keep fixture' and archived_at is null from public.tournaments where id=(select id from test_ids where label='t2')),'other tournament unchanged');
 perform pg_temp.assert_true((select revision=1 from public.tournament_brackets where tournament_id=(select id from test_ids where label='t2')),'other bracket unchanged');
 perform pg_temp.assert_true((select count(*)=4 from auth.users where id::text like '155c0000-0000-0000-0000-%'),'Auth accounts retained');
 perform pg_temp.assert_true((select count(*)=4 from public.profiles where id::text like '155c0000-0000-0000-0000-%'),'profiles retained');
end $$;
set local role anon;
select pg_temp.expect_state($q$select public.ss_rename_tournament(gen_random_uuid(),1,'Anon')$q$,'42501');
select pg_temp.expect_state($q$select public.ss_set_tournament_archived(gen_random_uuid(),1,true)$q$,'42501');
select pg_temp.expect_state($q$select public.ss_delete_tournament(gen_random_uuid(),1,'Anon')$q$,'42501');
select pg_temp.expect_state($q$select public.ss_tournament_lifecycle_review(gen_random_uuid())$q$,'42501');
set local role postgres;
rollback;
select 'PASS 07: owner-only lifecycle, CAS, exact confirmation, guarded dependencies, six cascades and isolation; fixtures rolled back' as result;

