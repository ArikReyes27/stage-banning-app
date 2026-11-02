-- Phase 15.3. MANUAL REVIEW ONLY; ONLY stage-strike-tests, never the main project.
-- Run once, after Phase 15.2 passed. No Auth trigger, role grants, or tournament access.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
do $$ begin
  if 'CONFIRM_TEST_PROJECT' <> 'stage-strike-tests' then
    raise exception 'Verify stage-strike-tests in Dashboard and replace confirmation placeholder';
  end if;
  if current_user <> 'postgres' or to_regprocedure('auth.uid()') is null then
    raise exception 'Requires Supabase SQL Editor as postgres';
  end if;
  if not exists(select from pg_policy where polrelid='public.profiles'::regclass and polname='phase15_lockdown') then
    raise exception 'Expected Phase 15.2 schema';
  end if;
end $$;

-- Do not rewrite existing nicknames. Invalid existing rows cause a full rollback.
alter table public.profiles add constraint profiles_nickname_shape check (
  display_name is not null
  and char_length(btrim(display_name)) between 1 and 32
  and display_name !~ '[[:cntrl:]]'
);
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
revoke all on table public.profiles from public, anon, authenticated;
grant select (id,display_name,created_at), insert (id,display_name), update (display_name)
  on public.profiles to authenticated;

-- Preserve deny-all for anon; replace authenticated lockdown with a self-only fence.
alter policy phase15_lockdown on public.profiles to anon;
create policy profiles_self_fence on public.profiles as restrictive
  for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_self_read on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_self_create on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy profiles_self_edit on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- All six tournament-related tables retain their existing grants and deny-all RLS.
-- Accounts create/edit only their own nickname; no privileged bootstrap or RPC.
commit;
select 'PROFILES_READY: self-only nickname access; tournament tables remain locked' as result;
