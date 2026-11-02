import test from 'node:test'
import assert from 'node:assert/strict'
import { bracketSize, generateStructure, seedOrder } from '../src/utils/bracketStructure.ts'
import { resolveBracket, proposeResult, getChampion } from '../src/utils/doubleElimination.ts'
import { createScalableTournament, drawTournament, swapPositions, restoreDistribution } from '../src/utils/tournamentSetup.ts'
import { isTournament, exportTournament, parseTournament } from '../src/utils/tournamentValidation.ts'
import { tournamentProgress, phaseMatches } from '../src/utils/tournamentPhases.ts'
import { proposeMatchAction, victoryIcons, currentSetup } from '../src/utils/matchSession.ts'
import { saveTournament, loadTournament, TOURNAMENT_STORAGE_KEY } from '../src/utils/tournamentStorage.ts'

export const sizes = [2, 7, 8, 12, 16, 20, 24, 32, 48, 64, 100, 128, 129]
export function fixture(count) {
  const participants = Array.from({ length: count }, (_, i) => ({ id: `p${i + 1}`, nickname: `Player ${i + 1}`, characterIds: [] }))
  return { schemaVersion: 2, status: 'started', participants, seeds: seedOrder(bracketSize(count)).map(rank => participants[rank - 1]?.id ?? ''), structure: generateStructure(count), completionOrder: [], results: {} }
}
function rng(seed) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 } }
for (const count of sizes) test(`Block A: ${count} players, randomized full double-elimination routes and BYEs`, () => {
  for (let run = 0; run < 6; run++) {
    let t = fixture(count), played = 0
    const random = rng(count * 900 + run), losses = new Map(t.participants.map(p => [p.id, 0]))
    assert.equal(losses.size, count)
    while (!getChampion(t)) {
      const resolved = resolveBracket(t)
      const available = resolved.filter(m => m.enabled && m.players.every(Boolean) && !m.settled)
      assert.ok(available.length, 'no dead end')
      const ids = available.flatMap(m => m.players.map(p => p.id))
      assert.equal(new Set(ids).size, ids.length, 'no simultaneous incompatible matches')
      for (const m of available) for (const p of m.players) assert.ok(losses.get(p.id) < 2)
      const m = available[Math.floor(random() * available.length)], slot = random() < .5 ? 0 : 1
      const format = random() < .5 ? 'BO3' : 'BO5', wins = format === 'BO3' ? 2 : 3
      const result = { format, scores: slot ? [0, wins] : [wins, 0], confirmed: true }
      if (random() < .15) { result.outcome = { type: 'dq', loser: slot === 0 ? 1 : 0, recordedAt: '2026-10-17T00:00:00.000Z' }; result.scores = [0, 0] }
      t = proposeResult(t, m.id, result).tournament
      const loser = m.players[slot === 0 ? 1 : 0].id
      losses.set(loser, losses.get(loser) + 1)
      assert.ok(++played <= 2 * count - 1)
      for (const bye of resolved.filter(m => m.automatic)) assert.equal(t.results[bye.id], undefined)
    }
    const champion = getChampion(t)
    assert.ok(losses.get(champion.id) < 2)
    for (const [id, n] of losses) if (id !== champion.id) assert.equal(n, 2)
    const gf = resolveBracket(t).find(m => m.id === 'GF'), reset = resolveBracket(t).find(m => m.id === 'RESET')
    assert.equal(reset.enabled, gf.winnerId === gf.players[1].id)
    assert.equal(played, 2 * count - 2 + (reset.enabled ? 1 : 0))
    assert.equal(t.completionOrder.length, played)
    assert.ok(isTournament(t))
    assert.deepEqual(parseTournament(exportTournament(t)), t)
    const progress = tournamentProgress(t)
    assert.equal(progress.alive, 1)
    for (const phase of progress.phases) {
      assert.equal(phase.reached, true)
      assert.equal(phase.players.length, phase.size)
      assert.equal(new Set(phase.players.map(p => p.id)).size, phase.size)
      assert.ok(phase.players.every(p => p.losses < 2))
      const visible = phaseMatches(t, phase)
      assert.ok(visible.every(m => !phase.completedBefore.includes(m.id) && !m.automatic))
      assert.ok(visible.every(m => m.players.filter(Boolean).every(p => phase.players.some(snapshot => snapshot.id === p.id))))
    }
  }
})

test('Block B: seed separation, uniform permutation, distributed BYEs and restore for all sizes', () => {
  for (const count of sizes) {
    let t = createScalableTournament(fixture(count).participants)
    t.priorities = Object.fromEntries(t.participants.slice(0, Math.min(4, count)).map((p, i) => [p.id, i + 1]))
    t = drawTournament(t, rng(count))
    assert.ok(isTournament(t))
    assert.equal(t.seeds.filter(Boolean).length, count)
    assert.equal(new Set(t.seeds.filter(Boolean)).size, count)
    const half = t.seeds.length / 2
    assert.notEqual(Math.floor(t.seeds.indexOf('p1') / half), Math.floor(t.seeds.indexOf('p2') / half))
    if (count >= 4) assert.equal(new Set(['p1', 'p2', 'p3', 'p4'].map(id => Math.floor(t.seeds.indexOf(id) / (half / 2)))).size, 4)
    const first = resolveBracket(t).filter(m => m.section === 'winners' && m.column === 0)
    assert.equal(first.filter(m => m.automatic).length, t.seeds.length - count)
    assert.ok(first.every(m => m.players.some(Boolean)))
    const shuffled = drawTournament(t, rng(count + 99))
    assert.deepEqual(restoreDistribution(shuffled).seeds, t.seeds)
    const swapped = swapPositions(t, 0, t.seeds.indexOf('p2')).tournament
    assert.equal(swapped.seeds[0], 'p2'); assert.ok(isTournament(swapped))
    assert.deepEqual(restoreDistribution(swapped).seeds, t.seeds)
    assert.throws(() => drawTournament({ ...t, status: 'started' }))
    assert.throws(() => swapPositions(t, 0, 0))
    assert.throws(() => drawTournament({ ...t, priorities: { p1: 1, p2: 1 } }))
  }
})

test('Block B: started swaps invalidate dependent results only, keep identities and chronology', () => {
  let t = fixture(16)
  for (const m of resolveBracket(t).filter(m => m.players.every(Boolean) && !m.automatic)) t = proposeResult(t, m.id, { format: 'BO3', scores: [2, 0], confirmed: true }).tournament
  const proposal = swapPositions(t, 0, 2)
  assert.deepEqual(proposal.invalidated.sort(), ['W1', 'W2'])
  assert.deepEqual(proposal.tournament.results.W3, t.results.W3)
  assert.equal(proposal.tournament.participants, t.participants)
  assert.ok(isTournament(proposal.tournament))
  assert.equal(new Set(proposal.tournament.seeds.filter(Boolean)).size, 16)
})

test('Block C: Top phases count actual second defeats, not Winners rounds or BYEs; corrections recalculate', () => {
  let t = fixture(20)
  assert.deepEqual(tournamentProgress(t).phases.map(p => [p.size, p.reached]), [[16, false], [8, false]])
  for (const id of t.structure.filter(m => m.section === 'winners').map(m => m.id)) {
    const match = resolveBracket(t).find(m => m.id === id)
    if (!match.automatic) t = proposeResult(t, id, { format: 'BO3', scores: [2, 0], confirmed: true }).tournament
  }
  assert.equal(tournamentProgress(t).alive, 20)
  let last
  while (tournamentProgress(t).alive > 16) {
    const match = resolveBracket(t).find(m => m.section === 'losers' && m.players.every(Boolean) && !m.settled)
    last = match.id
    t = proposeResult(t, last, { format: 'BO5', scores: [0, 0], confirmed: true, outcome: { type: 'dq', loser: 1, recordedAt: '2026-10-17T00:00:00Z' } }).tournament
  }
  const phase = tournamentProgress(t).phases[0]
  assert.ok(phase.reached); assert.equal(phase.players.length, 16)
  assert.equal(phase.players.filter(p => p.side === 'Winners').length, 1)
  assert.deepEqual(tournamentProgress(parseTournament(exportTournament(t))).phases, tournamentProgress(t).phases)
  t = proposeResult(t, last, { format: 'BO5', scores: [0, 0], confirmed: false }, { revertDQ: true }).tournament
  assert.equal(tournamentProgress(t).alive, 17)
  assert.equal(tournamentProgress(t).phases[0].reached, false)
})

for (const count of [2, 7, 20, 129]) test(`Block D: ${count} players retain detailed VS, BO3/BO5, DQ/reversal and reset`, () => {
  let t = fixture(count), played = 0
  const act = (id, action) => { t = proposeMatchAction(t, id, action).tournament }
  while (!getChampion(t)) {
    const m = resolveBracket(t).find(m => m.enabled && m.players.every(Boolean) && !m.settled)
    assert.ok(m)
    for (const [slot, player] of m.players.entries()) {
      const prior = resolveBracket(t).filter(previous => previous.settled && previous.result?.details?.games.length && previous.players.some(p => p?.id === player.id)).at(-1)
      const previousSlot = prior?.players.findIndex(p => p?.id === player.id)
      const expected = prior?.result.details.games.filter(g => !g.voided).at(-1)?.characterIds[previousSlot] ?? ''
      assert.equal(currentSetup(m).characterIds[slot], expected)
    }
    const format = played % 2 ? 'BO5' : 'BO3', wins = format === 'BO5' ? 3 : 2
    act(m.id, { type: 'format', format })
    act(m.id, { type: 'setup', setup: { characterIds: ['sora', ''] } })
    assert.deepEqual(t.results[m.id].details.current.characterIds, ['sora', ''])
    act(m.id, { type: 'setup', setup: { characterIds: ['sora', 'kazuya'], stage: { id: 'battlefield', name: 'Battlefield' } } })
    const slot = m.id === 'GF' ? 1 : played % 2
    act(m.id, { type: 'icon', slot, index: wins - 1 })
    act(m.id, { type: 'setup', setup: { characterIds: ['link', 'mario'] } })
    act(m.id, { type: 'dq', loser: slot === 0 ? 1 : 0, reason: 'Prueba administrativa' })
    assert.deepEqual(t.results[m.id].scores, slot ? [0, 1] : [1, 0])
    act(m.id, { type: 'revert-dq' })
    assert.equal(t.results[m.id].details.games.length, 1)
    for (let i = 1; i < wins; i++) act(m.id, { type: 'icon', slot, index: i })
    assert.equal(resolveBracket(t).find(item => item.id === m.id).winnerId, undefined)
    const icons = victoryIcons(resolveBracket(t).find(item => item.id === m.id), slot)
    assert.equal(icons.filter(i => i.won).length, wins)
    assert.equal(icons[0].characterId, slot ? 'kazuya' : 'sora')
    act(m.id, { type: 'confirm' })
    assert.ok(isTournament(t))
    played++
  }
  assert.ok(t.results.RESET?.confirmed)
  const data = new Map([['stage-strike.registration.v1', 'preserve registry']])
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
  saveTournament(storage, t)
  assert.deepEqual(loadTournament(storage).tournament, t)
  assert.equal(data.get('stage-strike.registration.v1'), 'preserve registry')
  const resetWinner = getChampion(t).id
  act('RESET', { type: 'dq', loser: 0 })
  act('RESET', { type: 'revert-dq' }); act('RESET', { type: 'confirm' })
  assert.equal(getChampion(t).id, resetWinner)
  assert.ok(data.has(TOURNAMENT_STORAGE_KEY))
})

test('Block E: invalid graphs, chronology, BYE results and distributions cannot enter persistence', () => {
  const base = fixture(7)
  const bad = []
  let t = structuredClone(base); t.structure[0].sources[0] = { match: 'GF', outcome: 'winner' }; bad.push(t)
  t = structuredClone(base); t.seeds[1] = t.seeds[0]; bad.push(t)
  t = structuredClone(base); t.results.W999 = { format: 'BO3', scores: [2, 0], confirmed: true }; t.completionOrder = ['W999']; bad.push(t)
  t = structuredClone(base); const bye = resolveBracket(t).find(m => m.automatic); t.results[bye.id] = { format: 'BO3', scores: [2, 0], confirmed: true }; t.completionOrder = [bye.id]; bad.push(t)
  t = structuredClone(base); t.previousSeeds = ['p1']; bad.push(t)
  for (const value of bad) { assert.equal(isTournament(value), false); assert.throws(() => parseTournament(JSON.stringify(value))) }
  let completed = fixture(2)
  completed = proposeResult(completed, 'W1', { format: 'BO3', scores: [2, 0], confirmed: true }).tournament
  completed = proposeResult(completed, 'GF', { format: 'BO3', scores: [2, 0], confirmed: true }).tournament
  assert.equal(isTournament({ ...completed, completionOrder: ['GF', 'W1'] }), false)
  assert.equal(isTournament({ ...completed, completionOrder: ['W1', 'W1'] }), false)
  assert.equal(isTournament({ ...completed, completionOrder: [] }), false)
  assert.throws(() => proposeMatchAction(base, bye.id, { type: 'dq', loser: 0 }))
})
