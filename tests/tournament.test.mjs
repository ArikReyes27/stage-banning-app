import test from 'node:test'
import assert from 'node:assert/strict'
import { createTournament, shuffleSeeds, rosterError, MATCHES, resolveBracket, proposeResult, getChampion, descendants } from '../src/utils/doubleElimination.ts'
import { validateResult, winnerSlot } from '../src/utils/tournamentResults.ts'
import { parseTournament, exportTournament, isTournament } from '../src/utils/tournamentValidation.ts'
import { loadTournament, saveTournament, TOURNAMENT_STORAGE_KEY } from '../src/utils/tournamentStorage.ts'

function fixture() {
  const tournament = createTournament()
  tournament.participants.forEach((player, index) => { player.nickname = `Player ${index + 1}`; player.characterIds = ['mario'] })
  tournament.seeds = tournament.participants.map((player) => player.id)
  tournament.status = 'started'
  return tournament
}
function result(slot = 0, format = 'BO3') {
  const wins = format === 'BO3' ? 2 : 3
  return { format, scores: slot === 0 ? [wins, 0] : [0, wins], confirmed: true }
}
function win(t, id, slot = 0, format = 'BO3') { return proposeResult(t, id, result(slot, format)).tournament }
function through(t, ids) { return ids.reduce((current, id) => win(current, id), t) }
const beforeFinal = () => through(fixture(), MATCHES.filter((m) => m.id !== 'GF' && m.id !== 'RESET').map((m) => m.id))
function memoryStorage() {
  const data = new Map()
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value) } }
}

test('draft has exactly eight editable participants and an empty bracket', () => {
  const t = createTournament()
  assert.equal(t.participants.length, 8)
  assert.equal(isTournament(t), true)
  assert.ok(rosterError(t.participants))
  assert.throws(() => shuffleSeeds(t.participants))
})

test('Fisher–Yates produces a permutation, leaves input intact and can reshuffle', () => {
  const players = fixture().participants
  const original = structuredClone(players)
  const a = shuffleSeeds(players, () => 0)
  const b = shuffleSeeds(players, () => 0.999)
  assert.equal(new Set(a).size, 8)
  assert.deepEqual([...a].sort(), players.map((p) => p.id).sort())
  assert.notDeepEqual(a, b)
  assert.deepEqual(players, original)
  assert.throws(() => shuffleSeeds(players.slice(1)))
  assert.throws(() => shuffleSeeds(players, () => 1))
  players[1].nickname = players[0].nickname
  assert.ok(rosterError(players))
})

test('all initial matches contain exactly one instance of every participant', () => {
  const matches = resolveBracket(fixture())
  const players = matches.filter((m) => m.column === 0 && m.section === 'winners').flatMap((m) => m.players.map((p) => p.id))
  assert.equal(new Set(players).size, 8)
  assert.equal(matches.filter((m) => m.players.every(Boolean)).length, 4)
  assert.equal(matches.find((m) => m.id === 'RESET').enabled, false)
})

test('Winners progression and crossed Losers drops have their expected participants', () => {
  let t = through(fixture(), ['W1', 'W2', 'W3', 'W4'])
  const ids = (id) => resolveBracket(t).find((m) => m.id === id).players.map((p) => p?.id)
  assert.deepEqual(ids('W5'), ['p1', 'p3'])
  assert.deepEqual(ids('W6'), ['p5', 'p7'])
  assert.deepEqual(ids('L1'), ['p2', 'p4'])
  assert.deepEqual(ids('L2'), ['p6', 'p8'])
  t = through(t, ['W5', 'W6', 'L1', 'L2'])
  assert.deepEqual(ids('W7'), ['p1', 'p5'])
  assert.deepEqual(ids('L3'), ['p2', 'p7'])
  assert.deepEqual(ids('L4'), ['p6', 'p3'])
  t = through(t, ['W7', 'L3', 'L4', 'L5'])
  assert.deepEqual(ids('L6'), ['p2', 'p5'])
  t = win(t, 'L6')
  assert.deepEqual(ids('GF'), ['p1', 'p2'])
})

test('Grand Final won by Winners champion ends without reset', () => {
  const t = win(beforeFinal(), 'GF', 0)
  assert.equal(getChampion(t).id, 'p1')
  assert.equal(resolveBracket(t).find((m) => m.id === 'RESET').enabled, false)
  assert.throws(() => win(t, 'RESET'))
  assert.equal(Object.keys(t.results).length, 14)
})

test('Grand Final won by Losers enables a reset; either finalist can become champion', () => {
  const t = win(beforeFinal(), 'GF', 1, 'BO5')
  assert.equal(getChampion(t), undefined)
  const reset = resolveBracket(t).find((m) => m.id === 'RESET')
  assert.equal(reset.enabled, true)
  assert.deepEqual(reset.players.map((p) => p.id), ['p1', 'p2'])
  for (const slot of [0, 1]) {
    const completed = win(t, 'RESET', slot, 'BO5')
    assert.equal(getChampion(completed).id, reset.players[slot].id)
    assert.equal(Object.keys(completed.results).length, 15)
  }
})

test('partial or terminal but unconfirmed scores do not advance players', () => {
  let t = proposeResult(fixture(), 'W1', { format: 'BO3', scores: [1, 1], confirmed: false }).tournament
  assert.equal(resolveBracket(t).find((m) => m.id === 'W5').players[0], undefined)
  t = proposeResult(t, 'W1', { format: 'BO3', scores: [2, 1], confirmed: false }).tournament
  assert.equal(resolveBracket(t).find((m) => m.id === 'W5').players[0], undefined)
  t = proposeResult(t, 'W1', { format: 'BO3', scores: [2, 1], confirmed: true }).tournament
  assert.equal(resolveBracket(t).find((m) => m.id === 'W5').players[0].id, 'p1')
})

test('BO3 and BO5 reject impossible scores and only confirm terminal sets', () => {
  for (const format of ['BO3', 'BO5']) {
    const target = format === 'BO3' ? 2 : 3
    for (const scores of [[-1, 0], [0.5, 0], [target + 1, 0], [target, target], [NaN, 0], [Infinity, 0], ['2', 0]]) {
      assert.equal(validateResult({ format, scores, confirmed: false }), false)
    }
    assert.equal(validateResult({ format, scores: [target - 1, target - 1], confirmed: true }), false)
    assert.equal(validateResult({ format, scores: [target, target - 1], confirmed: true }), true)
    assert.equal(winnerSlot({ format, scores: [target - 1, target], confirmed: false }), 1)
  }
  assert.equal(validateResult({ format: 'BO7', scores: [4, 0], confirmed: true }), false)
  assert.throws(() => win(fixture(), 'W5'))
  assert.throws(() => win({ ...fixture(), status: 'ready' }, 'W1'))
})

test('correcting an early winner invalidates only transitive dependent results', () => {
  const t = win(beforeFinal(), 'GF')
  const before = structuredClone(t)
  const proposal = proposeResult(t, 'W1', result(1))
  assert.deepEqual(t, before, 'proposal must not change original state before confirmation')
  assert.deepEqual(proposal.invalidated.sort(), descendants('W1').filter((id) => t.results[id]).sort())
  for (const id of proposal.invalidated) assert.equal(proposal.tournament.results[id], undefined)
  assert.deepEqual(proposal.tournament.results.W2, t.results.W2)
  assert.deepEqual(proposal.tournament.results.L2, t.results.L2)
  assert.equal(getChampion(proposal.tournament), undefined)
  assert.equal(isTournament(proposal.tournament), true)
  assert.equal(resolveBracket(proposal.tournament).find((m) => m.id === 'W5').players[0].id, 'p2')
})

test('same winner score corrections preserve downstream results', () => {
  const t = win(beforeFinal(), 'GF')
  const p = proposeResult(t, 'W1', { format: 'BO5', scores: [3, 2], confirmed: true })
  assert.deepEqual(p.invalidated, [])
  assert.equal(getChampion(p.tournament).id, getChampion(t).id)
})

test('unconfirming results invalidates downstream and correction can remove a reset', () => {
  const t = win(win(beforeFinal(), 'GF', 1), 'RESET')
  const p = proposeResult(t, 'GF', result(0))
  assert.deepEqual(p.invalidated, ['RESET'])
  assert.equal(resolveBracket(p.tournament).find((m) => m.id === 'RESET').enabled, false)
  const q = proposeResult(t, 'W7', { format: 'BO3', scores: [1, 1], confirmed: false })
  assert.ok(q.invalidated.includes('GF'))
  assert.ok(q.invalidated.includes('RESET'))
  assert.equal(isTournament(q.tournament), true)
})

test('128 deterministic full tournaments maintain integrity and eliminate each non-champion twice', () => {
  for (let run = 0; run < 128; run++) {
    let t = fixture(), random = run + 1
    const losses = new Map(t.participants.map((p) => [p.id, 0]))
    for (const definition of MATCHES) {
      const match = resolveBracket(t).find((m) => m.id === definition.id)
      if (!match.enabled) continue
      assert.ok(match.players.every(Boolean))
      assert.notEqual(match.players[0].id, match.players[1].id)
      for (const player of match.players) assert.ok(losses.get(player.id) < 2, 'eliminated player returned')
      random = (Math.imul(random, 1664525) + 1013904223) >>> 0
      const slot = random >>> 31
      t = win(t, match.id, slot, run % 2 ? 'BO5' : 'BO3')
      const loser = match.players[slot === 0 ? 1 : 0].id
      losses.set(loser, losses.get(loser) + 1)
      if (match.section === 'losers') assert.equal(losses.get(loser), 2)
      assert.equal(isTournament(t), true)
    }
    const champion = getChampion(t)
    assert.ok(champion)
    for (const [id, count] of losses) assert.ok(id === champion.id ? count < 2 : count === 2)
  }
})

test('export/import round-trips draft, preview, partial and completed/reset tournaments', () => {
  const started = fixture()
  const cases = [createTournament(), { ...started, status: 'ready' }, started,
    proposeResult(started, 'W1', { format: 'BO5', scores: [2, 1], confirmed: false }).tournament,
    win(beforeFinal(), 'GF'), win(win(beforeFinal(), 'GF', 1), 'RESET')]
  for (const t of cases) assert.deepEqual(parseTournament(exportTournament(t)), t)
})

test('invalid imports reject malformed schema, roster, scores and dependent results', () => {
  const invalid = [null, [], {}, { ...fixture(), schemaVersion: 2 },
    { ...fixture(), seeds: Array(8).fill('p1') },
    { ...fixture(), seeds: ['unknown', ...fixture().seeds.slice(1)] },
    { ...fixture(), results: { nope: result() } },
    { ...fixture(), results: { W5: result() } },
    { ...fixture(), results: { RESET: result() } },
    { ...fixture(), status: 'ready', results: { W1: result() } },
    { ...fixture(), results: { W1: { format: 'BO3', scores: [2, 2], confirmed: true } } }]
  for (const mutate of [
    (t) => { t.participants.pop() }, (t) => { t.participants[0].id = 'p2' },
    (t) => { t.participants[0].nickname = '' }, (t) => { t.participants[0].nickname = 'x'.repeat(33) },
    (t) => { t.participants[0].characterIds = ['not-a-character'] },
  ]) { const t = fixture(); mutate(t); invalid.push(t) }
  for (const t of invalid) assert.throws(() => parseTournament(JSON.stringify(t)))
  assert.throws(() => parseTournament('{invalid'))
  assert.throws(() => parseTournament(' '.repeat(256_001)))
})

test('refresh restores exact state from storage and never touches ruleset keys', () => {
  const storage = memoryStorage()
  storage.setItem('stage-strike.custom-rulesets', 'unchanged')
  const t = win(win(beforeFinal(), 'GF', 1), 'RESET', 1)
  saveTournament(storage, t)
  assert.deepEqual(loadTournament(storage), { tournament: t })
  assert.equal(storage.getItem('stage-strike.custom-rulesets'), 'unchanged')
  assert.equal(parseTournament(storage.getItem(TOURNAMENT_STORAGE_KEY)).status, 'started')
})

test('missing, corrupted or unavailable local storage is handled without overwriting', () => {
  const storage = memoryStorage()
  assert.deepEqual(loadTournament(storage), { tournament: createTournament() })
  storage.setItem(TOURNAMENT_STORAGE_KEY, 'broken')
  assert.ok(loadTournament(storage).error)
  assert.equal(storage.getItem(TOURNAMENT_STORAGE_KEY), 'broken')
  const blocked = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('quota') } }
  assert.ok(loadTournament(blocked).error)
  assert.throws(() => saveTournament(blocked, fixture()))
})
