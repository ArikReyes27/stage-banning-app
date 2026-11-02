import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createTournament, resolveBracket, proposeResult } from '../src/utils/doubleElimination.ts'
import { proposeMatchAction, currentSetup } from '../src/utils/matchSession.ts'
import { tournamentStandings } from '../src/utils/tournamentStandings.ts'
import { exportTournament, parseTournament } from '../src/utils/tournamentValidation.ts'
import { availableVariants, variantAsset } from '../src/data/characterVariants.ts'
import { createScalableTournament, drawTournament } from '../src/utils/tournamentSetup.ts'
const fixture = () => { const t=createTournament(); t.status='started'; t.participants.forEach((p,i)=>{p.nickname='Player '+i;p.characterIds=['mario']});t.seeds=t.participants.map(p=>p.id);return t }
const match=(t,id='W1')=>resolveBracket(t).find(m=>m.id===id)
const act=(t,id,action)=>proposeMatchAction(t,id,action).tournament
const select=(t,id,chars,variant='00')=>act(t,id,{type:'select',setup:{characterIds:chars,variantIds:[variant,'00']}})
const finish=(t,id,winner=0)=>act(act(act(t,id,{type:'win',winner}),id,{type:'win',winner}),id,{type:'confirm'})
test('prepared choice persists without creating games or changing scores; VS uses same setup',()=>{
 let t=select(fixture(),'W1',['sonic','cloud'],'03');assert.equal(t.results.W1.details,undefined)
 assert.deepEqual(t.results.W1.scores,[0,0]);assert.equal(tournamentStandings(t).rows[0].characters.length,0)
 t=parseTournament(exportTournament(t));assert.equal(currentSetup(match(t)).variantIds[0],'03')
 t=act(t,'W1',{type:'win',winner:0});t=select(t,'W1',['cloud','sonic'])
 assert.equal(t.results.W1.details.games[0].characterIds[0],'sonic');assert.equal(t.results.W1.details.games[0].variantIds[0],'03')
 assert.deepEqual(t.results.W1.scores,[1,0]);assert.equal(currentSetup(match(t)).characterIds[0],'cloud')
 assert.deepEqual(tournamentStandings(t).rows.find(r=>r.id==='p1').characters,[{id:'sonic',uses:1}])
})
test('Winners/Losers inheritance prioritizes actual last game; explicit later choice survives upstream metadata correction',()=>{
 let t=finish(select(fixture(),'W1',['sonic','cloud']),'W1');t=finish(t,'W2')
 assert.equal(currentSetup(match(t,'W5')).characterIds[0],'sonic');assert.equal(currentSetup(match(t,'L1')).characterIds[0],'cloud')
 t=select(t,'W5',['joker','mario']);t=act(t,'W1',{type:'correct',index:1,game:{characterIds:['sora','cloud'],winner:0}})
 assert.equal(currentSetup(match(t,'W5')).characterIds[0],'joker')
 t=act(t,'W1',{type:'undo'});assert.equal(t.results.W5,undefined);assert.equal(match(t,'W5').players[0],undefined)
 t=select(t,'W1',['cloud','sonic']);t=act(t,'W1',{type:'win',winner:1});t=act(t,'W1',{type:'win',winner:1});t=act(t,'W1',{type:'confirm'})
 assert.equal(match(t,'W5').players[0].id,'p2');assert.equal(currentSetup(match(t,'W5')).characterIds[0],'sonic')
})
test('prepared-only manual results and DQ inherit without fabricated standings',()=>{
 let t=select(fixture(),'W1',['sonic','cloud']);t=proposeResult(t,'W1',{...t.results.W1,scores:[2,0],confirmed:true}).tournament
 assert.equal(currentSetup(match(t,'W5')).characterIds[0],'sonic');assert.equal(tournamentStandings(t).rows.every(r=>!r.characters.length),true)
 t=select(t,'W2',['joker','sora']);t=act(t,'W2',{type:'dq',loser:0});assert.equal(currentSetup(match(t,'W5')).characterIds[1],'sora')
 t=act(t,'W2',{type:'revert-dq'});assert.equal(match(t,'W5').players[1],undefined)
})
test('BYEs, all bracket sizes and Grand Final Reset follow participant identity',()=>{
 for(const size of [3,8,16,32,64,128]) {
 let t={...drawTournament(createScalableTournament(Array.from({length:size},(_,i)=>({id:'p'+i,nickname:'P'+i}))),()=>.5),status:'started'}
 let steps=0
 while(true){const m=resolveBracket(t).find(m=>m.enabled&&!m.settled&&m.players.every(Boolean));if(!m)break
 const setup=currentSetup(m)
 for(let slot=0;slot<2;slot++) { const prior=m.sources[slot];if('match' in prior && !match(t,prior.match).automatic)assert.equal(setup.characterIds[slot],Number(m.players[slot].id.slice(1))%2?'sonic':'cloud') }
 const ids=m.players.map(p=>Number(p.id.slice(1))%2?'sonic':'cloud');t=select(t,m.id,ids);t=finish(t,m.id,m.id==='GF'?1:0);assert.ok(++steps<260)
 }
 assert.ok(match(t,'RESET').winnerId);assert.doesNotThrow(()=>parseTournament(exportTournament(t)))
 }
})
test('variants have real local PNG pairs, fallback and single competitive identity',()=>{
 for(const v of availableVariants('sonic'))for(const type of ['icon','render']) {const b=readFileSync('public'+variantAsset('sonic',v,type));assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a')}
 assert.equal(variantAsset('cloud','07'),variantAsset('cloud','00'))
 let t=select(fixture(),'W1',['sonic','cloud'],'01');t=act(t,'W1',{type:'win',winner:0});t=select(t,'W1',['sonic','cloud'],'07');t=act(t,'W1',{type:'win',winner:0})
 assert.deepEqual(tournamentStandings(t).rows.find(r=>r.id==='p1').characters,[{id:'sonic',uses:2}])
 assert.throws(()=>select(fixture(),'W1',['sonic','cloud'],'../../bad'))
})
