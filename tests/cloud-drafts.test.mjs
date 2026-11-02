import test from 'node:test'
import assert from 'node:assert/strict'
import { previewDraft, snapshotIsEmpty, snapshotExport, initializeCloudDraft, readCloudSnapshot } from '../src/lib/cloudDrafts.ts'
import { createTournament } from '../src/utils/doubleElimination.ts'
import { createScalableTournament, drawTournament } from '../src/utils/tournamentSetup.ts'
import { parseTournament } from '../src/utils/tournamentValidation.ts'

const players=n=>Array.from({length:n},(_,i)=>({id:'p'+i,nickname:'Player '+i}))
const old=()=>({...createTournament(),participants:players(8).map(p=>({...p,characterIds:[]}))})
const empty=()=>({id:'remote',name:'Remote',revision:'1',import_id:null,roster:[],state:{schemaVersion:2,status:'draft',seeds:[],results:{},structure:[],completionOrder:[]}})
const snapshot=t=>({...empty(),revision:'2',import_id:'linked',state:Object.fromEntries(Object.entries(t).filter(([k])=>k!=='participants')),roster:t.participants.map((p,i)=>({id:p.id,nickname:p.nickname,character_ids:p.characterIds,roster_order:i,in_bracket:true,profile_id:null}))})
test('legacy v1 and scalable draft round-trip retain participant IDs, order and source bytes',()=>{
  for(const t of [old(),createScalableTournament(players(7)),createScalableTournament(players(128))]){
    const raw=JSON.stringify(t,null,2),p=previewDraft(raw)
    assert.equal(p.blocked,null);assert.equal(p.raw,raw)
    assert.deepEqual(parseTournament(snapshotExport(snapshot(t))),parseTournament(raw))
  }
})
test('advanced state, characters, priorities and unknown data never silently turn into a draft',()=>{
  const draft=createScalableTournament(players(3))
  const cases=[drawTournament(draft,()=>0.4),{...draft,priorities:{p0:1}}, {...draft,participants:draft.participants.map(p=>({...p,characterIds:['mario']}))}, {...draft,foreignMetadata:'must not disappear'},createScalableTournament(players(129))]
  for(const t of cases){const raw=JSON.stringify(t);const p=previewDraft(raw);assert.ok(p.blocked);assert.equal(p.raw,raw);assert.deepEqual(p.payload,JSON.parse(raw))}
  assert.ok(previewDraft(JSON.stringify(createTournament())).blocked)
  assert.throws(()=>previewDraft('{bad json'))
})
test('read export preserves DQ, game history, BYEs and reset topology without enabling writes',()=>{
  const t=drawTournament(createScalableTournament(players(3)),()=>0.4)
  t.status='started'
  // A scheduled real match among three entrants (one first-round BYE).
  const match=t.structure.find(m=>m.section==='winners'&&m.sources.every(s=>'seed'in s&&t.seeds[s.seed]))
  t.results[match.id]={format:'BO3',scores:[0,0],confirmed:true,outcome:{type:'dq',loser:1,recordedAt:'2026-11-01T00:00:00Z',reason:'fixture'},details:{legacyScores:[0,0],games:[{characterIds:['mario','link'],winner:0,voided:true}],current:{characterIds:['mario','link']},status:'ready'}}
  t.completionOrder=[match.id]
  const canonical=parseTournament(JSON.stringify(t))
  assert.deepEqual(parseTournament(snapshotExport(snapshot(canonical))),canonical)
  assert.ok(previewDraft(JSON.stringify(canonical)).blocked)
  assert.ok(canonical.structure.some(m=>m.id==='RESET'))
})
test('nonempty remotes and unsupported drafts cannot reach the write RPC',async()=>{
  let calls=0;const client={rpc:async()=>{calls++;return {data:2,error:null}}}
  const p=previewDraft(JSON.stringify(old()))
  assert.ok(snapshotIsEmpty(empty()))
  await initializeCloudDraft(client,empty(),p,'import-id')
  await assert.rejects(initializeCloudDraft(client,snapshot(old()),p,'import-id'))
  await assert.rejects(initializeCloudDraft(client,empty(),previewDraft(JSON.stringify(drawTournament(createScalableTournament(players(4))))),'import-id'))
  assert.equal(calls,1)
})
test('CAS errors are propagated once; reads use a single snapshot RPC',async()=>{
  const calls=[];const client={rpc:async(name,args)=>{calls.push({name,args});return name==='ss_read_tournament_snapshot'?{data:empty(),error:null}:{data:null,error:{code:'40001'}}}}
  await readCloudSnapshot(client,'remote')
  await assert.rejects(initializeCloudDraft(client,empty(),previewDraft(JSON.stringify(old())),'id'),e=>e.code==='40001')
  assert.equal(calls.length,2);assert.equal(calls[1].args.p_expected,1)
  assert.equal(calls[1].args.p_snapshot.participants[0].id,'p0')
})
test('extra roster membership data is never silently discarded by local export',()=>{
  const s=snapshot(old());s.roster[0].in_bracket=false
  assert.throws(()=>snapshotExport(s))
  s.roster[0].in_bracket=true;s.roster[0].profile_id='account'
  assert.throws(()=>snapshotExport(s))
  const extra=snapshot(old());extra.state.futureMetadata={value:'preserve me'}
  assert.throws(()=>snapshotExport(extra))
})
