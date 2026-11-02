-- 15.5A, REVIEW ONLY: manually in stage-strike-tests after 15.4A/05.
-- No new tables, no broader grants/policies, no competitive-validator replacement.
begin;
set local lock_timeout='5s';
set local statement_timeout='60s';
do $$ begin
  if 'stage-strike-tests' <> 'stage-strike-tests' or current_user <> 'postgres' then
    raise exception 'Verify test project and replace confirmation; use postgres';
  end if;
  if to_regprocedure('ss_private.lock_tournament(uuid,boolean)') is null then raise exception 'Requires 15.4A'; end if;
end $$;

-- Canonical v2 topology, equivalent to generateStructure; bounded initial drafts only.
create function ss_private.draft_structure(p_count integer) returns jsonb
language plpgsql immutable set search_path='' as $$
declare sz integer:=2; rounds integer:=1; r integer; j integer; w integer:=0; l integer:=0;
  col integer:=0; id text; sources jsonb; result jsonb:='[]'; winners jsonb:='[]'; row_ids jsonb;
  lower_ids text[]:='{}'; next_ids text[]; prev_ids text[]; final_w text; label text;
begin
  if p_count is null or p_count<2 or p_count>128 then raise exception using errcode='22023',message='Draft supports 2..128 participants'; end if;
  while sz<p_count loop sz:=sz*2; rounds:=rounds+1; end loop;
  for r in 0..rounds-1 loop
    row_ids:='[]';
    for j in 0..(sz/(2^(r+1))::integer)-1 loop
      w:=w+1; id:='W'||w; row_ids:=row_ids||jsonb_build_array(id);
      if r=0 then sources:=jsonb_build_array(jsonb_build_object('seed',j*2),jsonb_build_object('seed',j*2+1));
      else sources:=jsonb_build_array(jsonb_build_object('match',winners->(r-1)->>(j*2),'outcome','winner'),jsonb_build_object('match',winners->(r-1)->>(j*2+1),'outcome','winner')); end if;
      label:=case when r=rounds-1 then 'Winners Final' when r=rounds-2 then 'Winners Semifinals' else 'Winners Round '||(r+1) end;
      result:=result||jsonb_build_array(jsonb_build_object('id',id,'section','winners','column',r,'round',label,'sources',sources));
    end loop;
    winners:=winners||jsonb_build_array(row_ids);
  end loop;
  if sz>2 then
    for j in 0..(sz/4)-1 loop
      l:=l+1; id:='L'||l; lower_ids:=array_append(lower_ids,id);
      sources:=jsonb_build_array(jsonb_build_object('match',winners->0->>(j*2),'outcome','loser'),jsonb_build_object('match',winners->0->>(j*2+1),'outcome','loser'));
      result:=result||jsonb_build_array(jsonb_build_object('id',id,'section','losers','column',col,'round','Losers Round 1','sources',sources));
    end loop;
    col:=col+1;
    for r in 1..rounds-1 loop
      prev_ids:=lower_ids; lower_ids:='{}';
      for j in 1..cardinality(prev_ids) loop
        l:=l+1; id:='L'||l; lower_ids:=array_append(lower_ids,id);
        sources:=jsonb_build_array(jsonb_build_object('match',prev_ids[j],'outcome','winner'),
          jsonb_build_object('match',winners->r->>(case when cardinality(prev_ids)>1 then (j-1)#1 else j-1 end),'outcome','loser'));
        label:=case when r=rounds-1 then 'Losers Final' else 'Losers Round '||(col+1) end;
        result:=result||jsonb_build_array(jsonb_build_object('id',id,'section','losers','column',col,'round',label,'sources',sources));
      end loop;
      col:=col+1;
      if r<rounds-1 then
        next_ids:='{}';
        for j in 0..(cardinality(lower_ids)/2)-1 loop
          l:=l+1; id:='L'||l; next_ids:=array_append(next_ids,id);
          sources:=jsonb_build_array(jsonb_build_object('match',lower_ids[j*2+1],'outcome','winner'),jsonb_build_object('match',lower_ids[j*2+2],'outcome','winner'));
          result:=result||jsonb_build_array(jsonb_build_object('id',id,'section','losers','column',col,'round','Losers Round '||(col+1),'sources',sources));
        end loop;
        lower_ids:=next_ids; col:=col+1;
      end if;
    end loop;
  end if;
  final_w:=winners->(rounds-1)->>0;
  sources:=jsonb_build_array(jsonb_build_object('match',final_w,'outcome','winner'),
    jsonb_build_object('match',case when sz=2 then final_w else lower_ids[1] end,'outcome',case when sz=2 then 'loser' else 'winner' end));
  result:=result||jsonb_build_array(jsonb_build_object('id','GF','section','finals','column',0,'round','Grand Final','sources',sources),
    jsonb_build_object('id','RESET','section','finals','column',1,'round','Grand Final Reset','sources',jsonb_build_array(jsonb_build_object('match','GF','outcome','loser'),jsonb_build_object('match','GF','outcome','winner'))));
  return result;
end $$;

-- Full validation of the SUPPORTED subset, not a weakened competitive validator.
create function ss_private.validate_initial_draft(p_snapshot jsonb) returns void
language plpgsql set search_path='' as $$
declare v integer; n integer; p jsonb; ids text[]:='{}'; names text[]:='{}'; k text; nickname text;
begin
  if p_snapshot is null or jsonb_typeof(p_snapshot)<>'object' or octet_length(p_snapshot::text)>1048576 then
    raise exception using errcode='22023',message='Invalid draft payload'; end if;
  if (p_snapshot->'schemaVersion' in ('1'::jsonb,'2'::jsonb) and p_snapshot->>'status'='draft'
    and p_snapshot->'seeds'='[]'::jsonb and p_snapshot->'results'='{}'::jsonb
    and jsonb_typeof(p_snapshot->'participants')='array') is not true then
    raise exception using errcode='22023',message='Only initial drafts without seeds or results are accepted'; end if;
  v:=(p_snapshot->>'schemaVersion')::integer; n:=jsonb_array_length(p_snapshot->'participants');
  if n<2 or n>128 or (v=1 and n<>8) then raise exception using errcode='22023',message='Invalid draft size'; end if;
  if exists(select from jsonb_object_keys(p_snapshot) a(key) where key<>all(
    case when v=1 then array['schemaVersion','status','participants','seeds','results','priorities']
    else array['schemaVersion','status','participants','seeds','results','priorities','structure','completionOrder'] end))
    or (p_snapshot ? 'priorities' and p_snapshot->'priorities'<>'{}'::jsonb) then
    raise exception using errcode='22023',message='Unsupported draft fields; nothing will be discarded'; end if;
  if v=2 and (p_snapshot->'structure'=ss_private.draft_structure(n) and p_snapshot->'completionOrder'='[]'::jsonb) is not true then
    raise exception using errcode='22023',message='Non-canonical draft structure'; end if;
  for p in select value from jsonb_array_elements(p_snapshot->'participants') loop
    if jsonb_typeof(p)<>'object' then raise exception using errcode='22023',message='Invalid participant'; end if;
    if (jsonb_typeof(p->'id')='string' and p->>'id' ~ '^[a-zA-Z0-9_-]{1,64}$'
      and jsonb_typeof(p->'nickname')='string' and jsonb_typeof(p->'characterIds')='array') is not true
      or exists(select from jsonb_object_keys(p) a(key) where key<>all(array['id','nickname','characterIds'])) then
      raise exception using errcode='22023',message='Invalid participant fields'; end if;
    nickname:=p->>'nickname'; k:=lower(regexp_replace(btrim(nickname),'[[:space:]]+',' ','g'));
    -- Parenthesize CASE: otherwise PL/pgSQL reads its THEN as the IF delimiter.
    if char_length(btrim(nickname))<1 or char_length(nickname)>(case when v=1 then 32 else 128 end)
      or nickname ~ '[[:cntrl:]]' or p->>'id'=any(ids) or k=any(names) then
      raise exception using errcode='22023',message='Invalid or duplicate participant'; end if;
    -- Characters are deliberately not accepted until the server owns a versioned catalog.
    if p->'characterIds'<>'[]'::jsonb then raise exception using errcode='22023',message='Draft character selections not supported yet'; end if;
    ids:=array_append(ids,p->>'id'); names:=array_append(names,k);
  end loop;
end $$;

create function public.ss_initialize_tournament_draft(p_tournament uuid,p_expected bigint,p_import_id uuid,p_snapshot jsonb)
returns bigint language plpgsql security definer set search_path='' as $$
declare old_state jsonb; old_revision bigint; n bigint;
begin
  perform ss_private.lock_tournament(p_tournament,false); -- real owner/admin, shared parent lock
  select state,revision into old_state,old_revision from public.tournament_brackets where tournament_id=p_tournament;
  if p_expected is null or old_revision is distinct from p_expected then raise exception using errcode='40001',message='Revision conflict'; end if;
  if p_import_id is null then raise exception using errcode='22023',message='Import identity required'; end if;
  if old_state is distinct from '{"schemaVersion":2,"status":"draft","seeds":[],"results":{},"structure":[],"completionOrder":[]}'::jsonb
    or exists(select from public.tournament_participants where tournament_id=p_tournament)
    or exists(select from public.tournament_revisions where tournament_id=p_tournament and action='initial_draft_saved') then
    raise exception using errcode='55000',message='Remote tournament is not empty; overwrite is forbidden'; end if;
  perform ss_private.validate_initial_draft(p_snapshot);
  insert into public.tournament_participants(tournament_id,id,nickname,character_ids,roster_order,in_bracket)
    select p_tournament,p->>'id',p->>'nickname','{}'::text[],(position-1)::integer,true
    from jsonb_array_elements(p_snapshot->'participants') with ordinality a(p,position);
  update public.tournament_brackets set state=p_snapshot-'participants' where tournament_id=p_tournament;
  n:=ss_private.audit(p_tournament,p_expected,'initial_draft_saved',jsonb_build_object('import_id',p_import_id,'before',old_state,'after',p_snapshot));
  return n;
end $$;

-- A single SELECT snapshot avoids mixing roster and bracket from different revisions.
create function public.ss_read_tournament_snapshot(p_tournament uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare snapshot jsonb;
begin
  perform ss_private.actor();
  select jsonb_build_object('id',t.id,'name',t.name,'revision',b.revision::text,'state',b.state,
    'roster',coalesce((select jsonb_agg(to_jsonb(p) order by p.roster_order) from public.tournament_participants p where p.tournament_id=t.id),'[]'::jsonb),
    'import_id',(select r.changes->>'import_id' from public.tournament_revisions r where r.tournament_id=t.id and r.action='initial_draft_saved' order by r.revision desc limit 1))
    into snapshot from public.tournaments t join public.tournament_brackets b on b.tournament_id=t.id
    where t.id=p_tournament and public.ss_tournament_role(t.id) in ('owner','admin');
  if snapshot is null then raise exception using errcode='42501',message='Snapshot not available'; end if;
  return snapshot;
end $$;

revoke all on function ss_private.draft_structure(integer),ss_private.validate_initial_draft(jsonb),
  public.ss_initialize_tournament_draft(uuid,bigint,uuid,jsonb),public.ss_read_tournament_snapshot(uuid)
  from public,anon,authenticated,service_role;
grant execute on function public.ss_initialize_tournament_draft(uuid,bigint,uuid,jsonb),public.ss_read_tournament_snapshot(uuid) to authenticated;
-- ss_private.validate_competitive_state still raises 0A000. No direct DML grants added.
commit;
select 'SAFE_DRAFTS_READY: initial empty drafts only; competitive writes still disabled' as result;
