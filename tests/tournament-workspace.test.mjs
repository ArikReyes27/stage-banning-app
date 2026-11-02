import test from 'node:test'
import assert from 'node:assert/strict'
import { ensureWorkspace, workspaceKey, workspaceStorage, readWorkspace } from '../src/lib/tournamentWorkspace.ts'
import { TOURNAMENT_STORAGE_KEY, saveTournament, loadTournament } from '../src/utils/tournamentStorage.ts'
import { REGISTRATION_KEY, saveRegistration, loadRegistration } from '../src/utils/registration.ts'
import { createScalableTournament, drawTournament } from '../src/utils/tournamentSetup.ts'
import { proposeMatchAction } from '../src/utils/matchSession.ts'
import { parseTournament } from '../src/utils/tournamentValidation.ts'
const user='155b0000-0000-0000-0000-000000000001', a='155b0000-0000-0000-0000-000000000002', b='155b0000-0000-0000-0000-000000000003'
const key=id=>workspaceKey('abcdefghijklmnopqrst',user,id)
const memory=()=>{const map=new Map();return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)}}
const roster=(count,prefix)=>({schemaVersion:1,participants:Array.from({length:count},(_,i)=>({id:prefix+i,nickname:prefix+' '+i}))})
const adapter=(store,id,allowed=()=>true)=>workspaceStorage(key(id),allowed,store,()=>{})
test('16 and 32 participant spaces persist independent roster, bracket, games, DQ and reload',()=>{
 const store=memory()
 for(const [id,count,prefix]of[[a,16,'November'],[b,32,'December']]){
  ensureWorkspace(store,key(id));const storage=adapter(store,id), r=roster(count,prefix)
  saveRegistration(storage,r)
  let t={...drawTournament(createScalableTournament(r.participants),()=>.5),status:'started'}
  t=proposeMatchAction(t,'W1',{type:'setup',setup:{characterIds:['mario','link']}}).tournament
  t=proposeMatchAction(t,'W1',{type:'win',winner:0}).tournament
  t=proposeMatchAction(t,'W1',{type:'dq',loser:1,reason:'Fixture'}).tournament
  saveTournament(storage,t)
 }
 const first=loadTournament(adapter(store,a)).tournament, second=loadTournament(adapter(store,b)).tournament
 assert.equal(first.participants.length,16);assert.equal(second.participants.length,32)
 assert.equal(first.results.W1.details.games.length,1);assert.equal(second.results.W1.details.games.length,1)
 assert.equal(first.results.W1.outcome.type,'dq');assert.equal(second.results.W1.outcome.type,'dq')
 assert.ok(first.structure.some(m=>m.id==='RESET'))
 assert.notDeepEqual(first.seeds,second.seeds)
 assert.equal(loadRegistration(adapter(store,a)).participants.length,16)
 assert.equal(loadRegistration(adapter(store,b)).participants.length,32)
 assert.deepEqual(parseTournament(readWorkspace(store,key(a)).tournament),first)
})
test('creation is empty and legacy data is backed up without assigning it to any remote',()=>{
 const store=memory();const legacy=JSON.stringify(createScalableTournament(roster(16,'Old').participants))
 store.setItem(TOURNAMENT_STORAGE_KEY,legacy);store.setItem(REGISTRATION_KEY,JSON.stringify(roster(16,'Old')))
 ensureWorkspace(store,key(a));ensureWorkspace(store,key(b))
 assert.equal(readWorkspace(store,key(a)).tournament,null);assert.equal(readWorkspace(store,key(b)).registration.participants.length,0)
 assert.equal(store.getItem(TOURNAMENT_STORAGE_KEY),legacy)
 assert.equal(JSON.parse(store.getItem('stage-strike.legacy-backup.v1')).tournament,legacy)
 assert.notEqual(key(a),workspaceKey('abcdefghijklmnopqrst',b,a),'account UUID namespaces do not mix')
})
test('existing workspaces survive initialization; backups precede writes; inactive editors cannot save',()=>{
 const store=memory();ensureWorkspace(store,key(a));let active=true
 const storage=adapter(store,a,()=>active), previous=store.getItem(key(a))
 saveRegistration(storage,roster(16,'A'))
 assert.equal(store.getItem(key(a)+':backup'),previous)
 const before=store.getItem(key(a));ensureWorkspace(store,key(a));assert.equal(store.getItem(key(a)),before)
 active=false;assert.throws(()=>saveRegistration(storage,roster(32,'B')));assert.equal(store.getItem(key(a)),before)
})
test('quota and corrupt data fail without overwriting originals; old JSON stays compatible',()=>{
 const store=memory();ensureWorkspace(store,key(a));const before=store.getItem(key(a))
 const fail={getItem:store.getItem,setItem:()=>{throw Error('quota')}}
 assert.throws(()=>saveRegistration(adapter(fail,a),roster(16,'A')));assert.equal(store.getItem(key(a)),before)
 store.setItem(key(a),'{broken');assert.throws(()=>ensureWorkspace(store,key(a)));assert.equal(store.getItem(key(a)),'{broken')
 assert.throws(()=>workspaceKey('wrong',user,a))
})
