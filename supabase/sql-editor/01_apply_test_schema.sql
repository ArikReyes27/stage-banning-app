-- STAGE//STRIKE: ONLY stage-strike-tests. Run ALL contents once.
-- Does not replace existing tables, Auth objects or roles.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '60s';
-- Manual safety gate, NOT automatic project identification.
-- In the Dashboard verify project NAME stage-strike-tests AND its project reference.
-- Only then replace CONFIRM_TEST_PROJECT below with stage-strike-tests.
do $$ begin
  if 'stage-strike-tests' <> 'stage-strike-tests' then
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

do $$ declare t text; begin
  foreach t in array array['profiles','tournaments','tournament_participants','tournament_members','tournament_brackets','tournament_revisions','result_reports'] loop
    if to_regclass(format('public.%I',t)) is not null then
      raise exception 'STOP: public.% already exists. Do not drop it or reapply blindly',t;
    end if;
  end loop;
end $$;
-- BEGIN CANONICAL MIGRATION DDL
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 128),
  created_at timestamptz not null default now()
);

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  created_at timestamptz not null default now()
);
create index tournaments_owner_idx on public.tournaments(owner_id);

-- Preserve existing string IDs (not necessarily UUIDs), scoped to each tournament.
-- Registration is not an Auth account: guests need no profile.
create table public.tournament_participants (
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  id text not null check (id ~ '^[a-zA-Z0-9_-]{1,64}$'),
  nickname text not null check (char_length(btrim(nickname)) between 1 and 128),
  character_ids text[] not null default '{}',
  roster_order integer not null check (roster_order >= 0),
  in_bracket boolean not null default false,
  profile_id uuid references public.profiles(id) on delete set null,
  primary key (tournament_id, id),
  unique (tournament_id, roster_order)
);
create index tournament_participants_profile_idx on public.tournament_participants(profile_id);

-- Effective owner role comes ONLY from tournaments.owner_id (no duplicate owner row).
-- A future permission resolver returns owner first, then admin/player below.
create table public.tournament_members (
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'player')),
  created_at timestamptz not null default now(),
  primary key (tournament_id, profile_id)
);
create index tournament_members_profile_idx on public.tournament_members(profile_id);

-- Payload = Omit<Tournament, 'participants'>, preserving schemaVersion 1 | 2.
-- Results, status, seeds, structure, priorities, previousSeeds and completionOrder
-- have one canonical location here. Standings and resolved matches are derived.
create table public.tournament_brackets (
  tournament_id uuid primary key references public.tournaments(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  state jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint bracket_state_shape check (
    (jsonb_typeof(state) = 'object'
    and not (state ? 'participants')
    and state -> 'schemaVersion' in ('1'::jsonb, '2'::jsonb)
    and state ->> 'status' in ('draft', 'ready', 'started')
    and jsonb_typeof(state -> 'seeds') = 'array'
    and jsonb_typeof(state -> 'results') = 'object'
    and (not (state ? 'structure') or jsonb_typeof(state -> 'structure') = 'array')
    and (not (state ? 'completionOrder') or jsonb_typeof(state -> 'completionOrder') = 'array')
    and (state -> 'schemaVersion' <> '2'::jsonb
      or (jsonb_typeof(state -> 'structure') = 'array'
        and jsonb_typeof(state -> 'completionOrder') = 'array'))) is true
  )
);

-- Append-only intent: future trusted transaction writes a delta, never a second
-- mutable copy of the bracket. Roster/membership edits also use this revision.
create table public.tournament_revisions (
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  revision bigint not null check (revision > 0),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null check (char_length(btrim(action)) between 1 and 100),
  reason text,
  changes jsonb not null check (jsonb_typeof(changes) = 'object'),
  created_at timestamptz not null default now(),
  primary key (tournament_id, revision)
);

-- A proposal is NOT an official result. Acceptance must validate the current
-- bracket, permissions and expected revision in a single future transaction.
create table public.result_reports (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  match_id text not null check (match_id ~ '^(W[0-9]+|L[0-9]+|GF|RESET)$'),
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  expected_revision bigint not null check (expected_revision >= 0),
  proposed_result jsonb not null check (jsonb_typeof(proposed_result) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check ((status = 'pending' and reviewed_by is null and reviewed_at is null)
    or (status <> 'pending' and reviewed_by is not null and reviewed_at is not null))
);
create index result_reports_tournament_idx on public.result_reports(tournament_id, status);

-- Explicit lockdown even if Supabase's default table grants change.
-- No permissive policies, grants, RPCs, Auth triggers or realtime publication.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles', 'tournaments', 'tournament_participants', 'tournament_members',
    'tournament_brackets', 'tournament_revisions', 'result_reports'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', table_name);
    execute format(
      'create policy phase15_lockdown on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',
      table_name
    );
  end loop;
end $$;

-- END CANONICAL MIGRATION DDL
commit;
select 'SCHEMA_APPLIED: 7 tables, client access locked' as result;
