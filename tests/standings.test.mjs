import test from 'node:test'
import assert from 'node:assert/strict'
import { createScalableTournament, drawTournament, swapPositions } from '../src/utils/tournamentSetup.ts'
import { createTournament, resolveBracket, proposeResult, getChampion } from '../src/utils/doubleElimination.ts'
import { proposeMatchAction } from '../src/utils/matchSession.ts'
import { tournamentStandings, standingsCsv } from '../src/utils/tournamentStandings.ts'
import { exportTournament, parseTournament } from '../src/utils/tournamentValidation.ts'

const fixture = count => ({ ...drawTournament(createScalableTournament(Array.from({length:count}, (_,i)=>({id:`p${i}`,nickname:`Player ${i}`}))), () => .5), status:'started' })
function finish(t, reset = false, reverse = false) {
  let steps = 0
  while (!getChampion(t)) {
    const available = resolveBracket(t).filter(m=>m.enabled && !m.settled && m.players.every(Boolean))
    const m = available[reverse ? available.length - 1 : 0]
    assert.ok(m, 'no blocked progression')
    const slot = m.id === 'GF' && reset ? 1 : steps % 2
    const useDQ = steps % 5 === 0
    t = proposeResult(t,m.id,{format:'BO3',scores:useDQ ? [0,0] : slot ? [0,2] : [2,0],confirmed:true,
      ...(useDQ ? {outcome:{type:'dq',loser:1-slot,recordedAt:'2026-10-18T00:00:00Z'}} : {})}).tournament
    assert.ok(++steps <= t.participants.length * 2)
  }
  return t
}

for (const count of [2,3,7,8,20,32,64,128,129]) test(`standings ${count}: real ties, BYEs, DQ, finals and chronology independence`, () => {
  for (const reverse of [false,true]) {
    const completed = finish(fixture(count), true, reverse)
    const snapshot = JSON.stringify(completed)
    const data = tournamentStandings(completed), matches = resolveBracket(completed)
    assert.ok(data.final); assert.equal(data.rows.length,count)
    assert.equal(data.rows[0].id,getChampion(completed).id)
    assert.equal(data.rows[0].position,1); assert.equal(data.rows[1].position,2)
    assert.ok(data.rows.every(r=>r.status==='champion' ? r.losses<2 : r.losses===2))
    // Oracle uses only actual completed eliminations, not structural occupancy.
    const groups = new Map()
    for (const m of matches.filter(m=>m.section==='losers' && m.loserId)) {
      groups.set(m.column,[...(groups.get(m.column)??[]),m.loserId])
    }
    let place = 3
    for (const [, ids] of [...groups].sort(([a],[b])=>b-a)) {
      for (const id of ids) assert.equal(data.rows.find(r=>r.id===id).position,place)
      place += ids.length
    }
    assert.equal(place,count+1)
    assert.ok(data.top.every(r=>r.position<=8))
    assert.deepEqual(tournamentStandings(parseTournament(exportTournament(completed))),data)
    assert.equal(JSON.stringify(completed),snapshot,'standings must be read-only')
  }
})

test('standard Top 8 preserves tied fifths and sevenths, not arbitrary 1 through 8', () => {
  assert.deepEqual(tournamentStandings(finish(fixture(8))).rows.map(r=>r.position),[1,2,3,4,5,5,7,7])
})

test('unusual BYE swaps and a tie across eighth place never discard a tied player', () => {
  let t = fixture(20)
  const bye = t.seeds.indexOf(''), occupied = t.seeds.findIndex(Boolean)
  t = swapPositions(t,bye,occupied).tournament
  const data = tournamentStandings(finish(t))
  assert.equal(data.rows.length,20)
  assert.ok(data.rows.every(r=>r.position>=1 && r.position<=20))
  assert.deepEqual(data.top,data.rows.filter(r=>r.position<=8))
  const nine = fixture(9)
  nine.seeds = ['', 'p0', 'p6', 'p5', 'p4', '', '', 'p8', '', '', 'p3', 'p2', 'p7', '', 'p1', '']
  const boundary = tournamentStandings(finish(nine))
  assert.deepEqual(boundary.rows.map(r => r.position), [1,2,3,4,5,5,7,8,8])
  assert.equal(boundary.top.length, 9, 'both eighth-place finishers must be included')
})

test('provisional: no fabricated Top 8 or ranks; unconfirmed scores never eliminate', () => {
  let t = fixture(20)
  assert.equal(tournamentStandings(t).top.length,0)
  assert.ok(tournamentStandings(t).rows.every(r=>r.position===undefined))
  const m = resolveBracket(t).find(m=>m.players.every(Boolean) && !m.automatic)
  t = proposeResult(t,m.id,{format:'BO3',scores:[2,0],confirmed:false}).tournament
  assert.equal(tournamentStandings(t).alive,20)
  let steps = 0
  while(tournamentStandings(t).alive>8) {
    const match=resolveBracket(t).find(m=>m.players.every(Boolean) && !m.settled)
    t=proposeResult(t,match.id,{format:'BO3',scores:[2,0],confirmed:true}).tournament
    assert.ok(++steps<40)
  }
  const data = tournamentStandings(t)
  assert.equal(data.final,false); assert.equal(data.top.length,8)
  assert.ok(data.top.every(r=>r.position===undefined))
})

test('GF reset and DQ reversal remove final positions until reconfirmed', () => {
  let t = fixture(2)
  const act = (id,action) => {t=proposeMatchAction(t,id,action).tournament}
  act('W1',{type:'dq',loser:1})
  act('GF',{type:'dq',loser:0})
  assert.equal(tournamentStandings(t).final,false)
  assert.ok(tournamentStandings(t).rows.every(r=>r.position===undefined))
  act('RESET',{type:'dq',loser:0})
  assert.deepEqual(tournamentStandings(t).rows.map(r=>r.position),[1,2])
  act('RESET',{type:'revert-dq'})
  assert.ok(tournamentStandings(t).rows.every(r=>r.position===undefined))
  act('GF',{type:'revert-dq'})
  assert.equal(t.results.RESET,undefined)
  assert.equal(tournamentStandings(t).final,false)
})

test('real characters: both players, usage order, deterministic ties, three unique, voided excluded', () => {
  let t = fixture(8)
  const m = resolveBracket(t).find(m=>m.players.every(Boolean))
  const act = action => {t=proposeMatchAction(t,m.id,action).tournament}
  act({type:'format',format:'BO5'})
  const roster=['samus','mario','link','fox','kirby']
  for(let i=0;i<roster.length;i++) {
    act({type:'setup',setup:{characterIds:[roster[i],'sora']}})
    act({type:'win',winner:i%2})
  }
  let data=tournamentStandings(t)
  assert.deepEqual(data.rows.find(r=>r.id===m.players[0].id).characters.map(c=>c.id),['fox','kirby','link'])
  assert.deepEqual(data.rows.find(r=>r.id===m.players[1].id).characters,[{id:'sora',uses:5}])
  act({type:'undo'})
  data=tournamentStandings(t)
  assert.deepEqual(data.rows.find(r=>r.id===m.players[0].id).characters.map(c=>c.id),['fox','link','mario'])
  act({type:'setup',setup:{characterIds:['sora','mario']}})
  assert.deepEqual(tournamentStandings(t),data,'selected but unplayed characters do not count')
  act({type:'dq',loser:0})
  assert.deepEqual(tournamentStandings(t).rows.find(r=>r.id===m.players[1].id).characters,[{id:'sora',uses:4}])
})

test('legacy scores and roster characters do not fabricate usage; legacy positions remain compatible', () => {
  let t=createTournament()
  t.participants.forEach((p,i)=>{p.nickname=`Legacy ${i}`;p.characterIds=['mario']})
  t.seeds=t.participants.map(p=>p.id);t.status='started'
  t=finish(t)
  const data=tournamentStandings(t)
  assert.deepEqual(data.rows.map(r=>r.position),[1,2,3,4,5,5,7,7])
  assert.ok(data.rows.every(r=>r.characters.length===0))
})

test('CSV exports every row, shared positions, UTF8, quoted nicknames and formula protection', () => {
  const t=finish(fixture(20));t.participants[0].nickname='=SUM(1,2)';t.participants[1].nickname='Ángel "GG"'
  const csv=standingsCsv(t)
  assert.equal(csv.charCodeAt(0),0xfeff)
  assert.equal(csv.split('\r\n').length,21)
  assert.ok(csv.includes('"\'=SUM(1,2)"'));assert.ok(csv.includes('"Ángel ""GG"""'))
  assert.ok(csv.includes('"Final"'))
})
