-- ONLY stage-strike-tests. Run ALL after script 03; NEVER replace ROLLBACK.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
do $$ begin
  if 'CONFIRM_TEST_PROJECT' <> 'stage-strike-tests' or current_user <> 'postgres' then
    raise exception 'Verify stage-strike-tests and replace confirmation; run as postgres';
  end if;
  if exists(select from auth.users where id in ('00000000-0000-0000-0000-000000001531','00000000-0000-0000-0000-000000001532')) then
    raise exception 'Fixture collision; existing users will not be changed';
  end if;
  if exists(select from pg_trigger where tgrelid in ('auth.users'::regclass,'public.profiles'::regclass) and not tgisinternal and tgenabled <> 'D') then
    raise exception 'Custom triggers require review before test fixtures';
  end if;
  if (select count(*) from pg_roles where rolname in ('anon','authenticated') and not rolsuper and not rolbypassrls)<>2 then
    raise exception 'API roles must not bypass RLS';
  end if;
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

insert into auth.users(id) values ('00000000-0000-0000-0000-000000001531'),('00000000-0000-0000-0000-000000001532');
insert into public.profiles(id,display_name) values ('00000000-0000-0000-0000-000000001532','Other fixture');

set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{"role":"anon"}';
set local role anon;
select pg_temp.assert_true(current_user='anon' and auth.uid() is null,'anon identity');
select pg_temp.expect_state('select id from public.profiles','42501');
select pg_temp.expect_state($q$insert into public.profiles(id,display_name) values ('00000000-0000-0000-0000-000000001531','Guest')$q$,'42501');
set local role postgres;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000001531';
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000001531"}';
set local role authenticated;
select pg_temp.assert_true(current_user='authenticated' and auth.uid()='00000000-0000-0000-0000-000000001531'::uuid,'authenticated identity');
select pg_temp.assert_true(row_security_active('public.profiles'::regclass),'RLS active');
insert into public.profiles(id,display_name) values ('00000000-0000-0000-0000-000000001531','My nickname');
select pg_temp.assert_true((select count(*)=1 from public.profiles),'only own row visible');
update public.profiles set display_name='Edited nickname' where id=auth.uid();
select pg_temp.assert_true((select display_name='Edited nickname' from public.profiles where id=auth.uid()),'own update works');
do $$ declare n bigint; begin
  update public.profiles set display_name='Forbidden' where id='00000000-0000-0000-0000-000000001532';
  get diagnostics n=row_count;
  perform pg_temp.assert_true(n=0,'other profile update blocked');
end $$;
select pg_temp.expect_state($q$insert into public.profiles(id,display_name) values ('00000000-0000-0000-0000-000000001532','Forbidden')$q$,'42501');
select pg_temp.expect_state($q$update public.profiles set id='00000000-0000-0000-0000-000000001532' where id=auth.uid()$q$,'42501');
select pg_temp.expect_state('update public.profiles set created_at=now() where id=auth.uid()','42501');
select pg_temp.expect_state('delete from public.profiles where id=auth.uid()','42501');
select pg_temp.expect_state($q$update public.profiles set display_name='' where id=auth.uid()$q$,'23514');
select pg_temp.expect_state('update public.profiles set display_name=repeat(''x'',33) where id=auth.uid()','23514');
select pg_temp.expect_state('update public.profiles set display_name=null where id=auth.uid()','23514');
set local role postgres;

-- The other account still sees only itself and its nickname was not modified.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000001532';
set local request.jwt.claims = '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000001532"}';
set local role authenticated;
select pg_temp.assert_true(current_user='authenticated' and auth.uid()='00000000-0000-0000-0000-000000001532'::uuid,'second identity');
select pg_temp.assert_true((select count(*)=1 from public.profiles),'second user isolation');
select pg_temp.assert_true((select display_name='Other fixture' from public.profiles where id=auth.uid()),'other nickname preserved');
set local role postgres;

do $$ declare t text; r text; begin
  foreach t in array array['tournaments','tournament_participants','tournament_members','tournament_brackets','tournament_revisions','result_reports'] loop
    perform pg_temp.assert_true((select relrowsecurity and relforcerowsecurity from pg_class where oid=format('public.%I',t)::regclass),'tournament RLS enabled');
    perform pg_temp.assert_true(exists(select from pg_policy where polrelid=format('public.%I',t)::regclass and polname='phase15_lockdown' and not polpermissive and pg_get_expr(polqual,polrelid)='false' and pg_get_expr(polwithcheck,polrelid)='false'),'tournament lockdown remains');
    foreach r in array array['anon','authenticated'] loop
      perform pg_temp.assert_true(not has_table_privilege(r,format('public.%I',t),'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'),'tournament grants remain revoked');
      execute format('set local role %I',r);
      perform pg_temp.assert_true(current_user=r,'actual tournament test role');
      perform pg_temp.expect_state(format('select * from public.%I',t),'42501');
      perform pg_temp.expect_state(format('delete from public.%I where false',t),'42501');
      execute 'set local role postgres';
    end loop;
  end loop;
end $$;
rollback;
do $$ begin
  if exists(select from auth.users where id in ('00000000-0000-0000-0000-000000001531','00000000-0000-0000-0000-000000001532')) then
    raise exception 'Fixtures were not rolled back';
  end if;
end $$;
select 'PASS: own profiles only; anon and tournament access blocked; fixtures rolled back' as result;
