import test from 'node:test'
import assert from 'node:assert/strict'
import {lifecycleName,lifecycleAvailable,lifecycleReview,lifecycleMutation,lifecycleError} from '../src/lib/tournamentLifecycle.ts'
import {loadTournamentDashboard} from '../src/lib/remoteTournaments.ts'
const snapshot={id:'t',name:'Name',revision:'7',roster:[],state:{}}
const review={version:15503,snapshot,archived_at:null}
const client=()=>{const calls=[];return {calls,rpc:async(name,args)=>{calls.push({name,args});return {data:review,error:null}}}}
test('lifecycle requires new migration and owner before review, without unsafe fallback',async()=>{
 const c=client()
 assert.equal(lifecycleAvailable({}),false)
 await assert.rejects(lifecycleReview(c,{id:'t',role:'owner'}))
 await assert.rejects(lifecycleReview(c,{id:'t',role:'admin',archived_at:null}))
 assert.equal(c.calls.length,0)
 assert.deepEqual(await lifecycleReview(c,{id:'t',role:'owner',archived_at:null}),review)
 assert.equal(c.calls[0].name,'ss_tournament_lifecycle_review')
})
test('name limits and exact deletion confirmation validated before RPC',async()=>{
 assert.equal(lifecycleName(' Test '),'Test');assert.throws(()=>lifecycleName(' '));assert.throws(()=>lifecycleName('x'.repeat(201)))
 const c=client()
 for(const v of ['name','Name ',' Name',''])await assert.rejects(lifecycleMutation(c,review,'delete',v))
 assert.equal(c.calls.length,0)
 await lifecycleMutation(c,review,'rename',' New ')
 await lifecycleMutation(c,review,'archive');await lifecycleMutation(c,review,'restore');await lifecycleMutation(c,review,'delete','Name')
 assert.deepEqual(c.calls,[{name:'ss_rename_tournament',args:{p_tournament:'t',p_expected:7,p_name:'New'}},
 {name:'ss_set_tournament_archived',args:{p_tournament:'t',p_expected:7,p_archived:true}},
 {name:'ss_set_tournament_archived',args:{p_tournament:'t',p_expected:7,p_archived:false}},
 {name:'ss_delete_tournament',args:{p_tournament:'t',p_expected:7,p_confirmation:'Name'}}])
})
test('conflicts and graph rejection never retry or leak raw server messages',async()=>{
 for(const code of ['40001','0A000','42501','PGRST202']){
  let calls=0;const c={rpc:async()=>{calls++;return {error:{code,message:'PRIVATE'},data:null}}}
  await assert.rejects(lifecycleMutation(c,review,'delete','Name'),e=>e.code===code)
  assert.equal(calls,1);assert.ok(!lifecycleError({code,message:'PRIVATE'}).includes('PRIVATE'))
 }
})
test('older schema still lists tournaments and leaves lifecycle unavailable',async()=>{
 const c={from(table){let columns='';const q={select(s){columns=s;return q},order(){return q},eq(){return q},async range(){
  if(table!=='tournaments')return {data:[],error:null,count:0}
  if(columns.includes('archived_at'))return {error:{code:'42703'}}
  return {data:[{id:'t',owner_id:'u',name:'Old'}],error:null,count:1}
 }};return q}}
 const result=await loadTournamentDashboard(c,'u')
 assert.equal(result.tournaments.length,1);assert.equal(lifecycleAvailable(result.tournaments[0]),false)
})
