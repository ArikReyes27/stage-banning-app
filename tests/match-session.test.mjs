import test from 'node:test'
import assert from 'node:assert/strict'
import { createTournament, resolveBracket, proposeResult, MATCHES, getChampion } from '../src/utils/doubleElimination.ts'
import { proposeMatchAction, readMatchResult, currentSetup, displayGame, gameNumber, victoryIcons } from '../src/utils/matchSession.ts'
import { parseTournament, exportTournament, isTournament } from '../src/utils/tournamentValidation.ts'
import { loadTournament, saveTournament } from '../src/utils/tournamentStorage.ts'

function fixture() {
  const t = createTournament()
  t.status = 'started'; t.participants.forEach((p, i) => { p.nickname = `P${i}`; p.characterIds = ['mario'] })
  t.seeds = t.participants.map(p => p.id)
  return t
}
const match = (t, id = 'W1') => resolveBracket(t).find(m => m.id === id)
const act = (t, action, id = 'W1') => proposeMatchAction(t, id, action).tournament
function win(t, winner = 0, id = 'W1') {
  return act(act(t, { type: 'start', now: '2026-10-17T12:00:00.000Z' }, id), { type: 'win', winner }, id)
}
const setup = { characterIds: ['sora', 'kazuya'], stage: { id: 'battlefield', name: 'Battlefield' } }

test('opening, hiding, reopening and reloading reads do not start, reset or mutate a match', () => {
  let t = fixture()
  assert.equal(readMatchResult(match(t)).details, undefined)
  assert.deepEqual(t.results, {})
  t = act(t, { type: 'start', now: '2026-10-17T12:00:00.000Z' })
  t = act(t, { type: 'setup', setup })
  t = win(t)
  t = act(t, { type: 'setup', setup: { ...setup, characterIds: ['link', 'kazuya'] } })
  t = act(t, { type: 'start' })
  t = act(t, { type: 'pause' })
  const stored = new Map()
  const storage = { getItem: k => stored.get(k) ?? null, setItem: (k, v) => stored.set(k, v) }
  saveTournament(storage, t)
  for (let n = 0; n < 3; n++) {
    const loaded = loadTournament(storage).tournament
    readMatchResult(match(loaded)); displayGame(match(loaded)); victoryIcons(match(loaded), 0)
    assert.deepEqual(loaded, t)
  }
  assert.equal(t.results.W1.details.status, 'paused')
  assert.equal(t.results.W1.details.startedAt, '2026-10-17T12:00:00.000Z')
})

for (const format of ['BO3', 'BO5']) test(`${format} records games and advances only after final confirmation`, () => {
  let t = act(fixture(), { type: 'format', format })
  const target = format === 'BO3' ? 2 : 3
  assert.equal(victoryIcons(match(t), 0).length, target)
  assert.ok(victoryIcons(match(t), 0).every(v => !v.won))
  assert.throws(() => act(t, { type: 'confirm' }))
  assert.deepEqual(act(t, { type: 'win', winner: 0 }).results.W1.scores, [1, 0])
  for (let n = 0; n < target; n++) t = win(t)
  assert.equal(match(t).winnerId, undefined)
  assert.equal(match(t, 'W5').players[0], undefined)
  assert.equal(victoryIcons(match(t), 0).filter(v => v.won).length, target)
  assert.equal(t.results.W1.details.games.length, target)
  assert.throws(() => act(t, { type: 'start' }))
  assert.throws(() => act(t, { type: 'win', winner: 1 }))
  t = act(t, { type: 'confirm' })
  assert.equal(match(t, 'W5').players[0].id, t.seeds[0])
  assert.deepEqual(parseTournament(exportTournament(t)), t)
})

test('character and stage snapshots survive switches and history corrections update icons', () => {
  let t = act(fixture(), { type: 'format', format: 'BO5' })
  t = act(t, { type: 'setup', setup })
  t = win(t)
  t = act(t, { type: 'setup', setup: { characterIds: ['link', 'peach'], stage: { id: 'smashville', name: 'Smashville' } } })
  assert.equal(victoryIcons(match(t), 0)[0].characterId, 'sora')
  assert.equal(victoryIcons(match(t), 0)[1].characterId, 'link')
  t = win(t, 1)
  assert.equal(t.results.W1.details.games[0].stage.id, 'battlefield')
  assert.equal(t.results.W1.details.games[1].stage.id, 'smashville')
  assert.equal(victoryIcons(match(t), 1)[0].characterId, 'peach')
  t = act(t, { type: 'correct', index: 0, game: { ...t.results.W1.details.games[0], winner: 1 } })
  assert.deepEqual(t.results.W1.scores, [0, 2])
  assert.equal(victoryIcons(match(t), 1)[0].characterId, 'kazuya')
  assert.equal(gameNumber(t.results.W1), 3)
  assert.equal(currentSetup(match(t)).stage, undefined)
  assert.equal(t.participants[0].characterIds[0], 'mario')
})

test('correction after confirmation warns of dependent histories and preserves unrelated matches', () => {
  let t = act(win(win(fixture())), { type: 'confirm' })
  t = proposeResult(t, 'W2', { format: 'BO3', scores: [2, 0], confirmed: true }).tournament
  t = act(t, { type: 'start' }, 'W5')
  t = win(t, 1, 'W3')
  const proposal = proposeMatchAction(t, 'W1', { type: 'undo' })
  assert.deepEqual(proposal.invalidated, ['W5'])
  assert.equal(proposal.tournament.results.W5, undefined)
  assert.deepEqual(proposal.tournament.results.W3, t.results.W3)
  assert.equal(t.results.W1.confirmed, true)
  assert.equal(proposal.tournament.results.W1.confirmed, false)
})

test('metadata-only correction preserves confirmed winner and descendants', () => {
  let t = act(win(win(fixture())), { type: 'confirm' })
  const game = { ...t.results.W1.details.games[0], stage: setup.stage, characterIds: ['sora', 'kazuya'] }
  t = act(t, { type: 'correct', index: 0, game })
  assert.equal(t.results.W1.confirmed, true)
  assert.equal(victoryIcons(match(t), 0)[0].characterId, 'sora')
  assert.throws(() => proposeResult(t, 'W1', { format: 'BO3', scores: [2, 0], confirmed: true }), /historial/)
})

test('early-terminal corrections and invalid format reductions never silently remove games', () => {
  let t = win(win(win(fixture(), 0), 1), 0)
  const before = structuredClone(t)
  assert.throws(() => act(t, { type: 'correct', index: 1, game: { ...t.results.W1.details.games[1], winner: 0 } }))
  assert.deepEqual(t, before)
  t = act(t, { type: 'undo' })
  t = act(t, { type: 'correct', index: 1, game: { ...t.results.W1.details.games[1], winner: 0 } })
  assert.deepEqual(t.results.W1.scores, [2, 0])
  let bo5 = act(fixture(), { type: 'format', format: 'BO5' })
  bo5 = win(win(win(bo5)))
  assert.throws(() => act(bo5, { type: 'format', format: 'BO3' }))
})

test('legacy v1 scores migrate lazily without fabricated winners, and remain exportable', () => {
  const old = proposeResult(fixture(), 'W1', { format: 'BO3', scores: [1, 0], confirmed: false }).tournament
  assert.deepEqual(parseTournament(exportTournament(old)), old)
  const next = act(old, { type: 'setup', setup })
  assert.deepEqual(next.results.W1.details.legacyScores, [1, 0])
  assert.deepEqual(next.results.W1.details.games, [])
  assert.equal(victoryIcons(match(next), 0)[0].legacy, true)
  const finished = act(win(next), { type: 'confirm' })
  assert.deepEqual(finished.results.W1.scores, [2, 0])
  assert.deepEqual(parseTournament(exportTournament(finished)), finished)
  assert.deepEqual(old.results.W1.scores, [1, 0])
})

test('extending a confirmed BO3 to BO5 preserves games and requests renewed confirmation', () => {
  const t = act(win(win(fixture())), { type: 'confirm' })
  const next = act(t, { type: 'format', format: 'BO5' })
  assert.deepEqual(next.results.W1.scores, [2, 0])
  assert.deepEqual(next.results.W1.details.games, t.results.W1.details.games)
  assert.equal(next.results.W1.confirmed, false)
  assert.equal(victoryIcons(match(next), 0).length, 3)
  assert.equal(match(next, 'W5').players[0], undefined)
})

test('validation rejects score/history drift, unknown characters and bad details, strips imported URLs', () => {
  const t = win(act(fixture(), { type: 'setup', setup }))
  for (const mutate of [
    x => { x.results.W1.scores = [0, 0] },
    x => { x.results.W1.details.games[0].winner = 8 },
    x => { x.results.W1.details.current.characterIds = ['missing', 'mario'] },
    x => { x.results.W1.details.current.stage = { id: 'a', name: '' } },
    x => { x.results.W1.details.legacyScores = [-1, 0] },
    x => { x.results.W1.details = null },
  ]) {
    const bad = structuredClone(t); mutate(bad)
    assert.equal(isTournament(bad), false)
    assert.throws(() => parseTournament(JSON.stringify(bad)))
  }
  const extra = structuredClone(t); extra.results.W1.details.games[0].stage.image = 'https://invalid.example/image'
  assert.deepEqual(parseTournament(JSON.stringify(extra)), t)
})

test('all rounds including Grand Final and Reset use the same detailed results engine', () => {
  let t = fixture()
  assert.throws(() => act(t, { type: 'start' }, 'RESET'))
  for (const definition of MATCHES) {
    const id = definition.id
    const slot = id === 'GF' ? 1 : 0
    t = win(win(t, slot, id), slot, id)
    assert.equal(match(t, id).winnerId, undefined)
    t = act(t, { type: 'confirm' }, id)
    assert.ok(match(t, id).winnerId)
    assert.equal(isTournament(t), true)
  }
  assert.ok(getChampion(t))
  assert.deepEqual(parseTournament(exportTournament(t)), t)
})
