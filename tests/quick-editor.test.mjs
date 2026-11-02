import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveBracket, getChampion, proposeResult } from '../src/utils/doubleElimination.ts'
import { proposeMatchAction, currentSetup, victoryIcons } from '../src/utils/matchSession.ts'
import { proposeQuickCommit } from '../src/utils/quickMatchEditor.ts'
import { createScalableTournament, drawTournament } from '../src/utils/tournamentSetup.ts'
import { tournamentStandings, standingsCsv } from '../src/utils/tournamentStandings.ts'
import { parseTournament, exportTournament } from '../src/utils/tournamentValidation.ts'

const fixture = count => ({ ...drawTournament(createScalableTournament(Array.from({ length: count }, (_, i) => ({ id: 'p' + i, nickname: 'Player ' + i }))), () => .5), status: 'started' })
const act = (t, id, action) => proposeMatchAction(t, id, action).tournament
const match = (t, id) => resolveBracket(t).find(m => m.id === id)
const icon = (t, id, slot, index = 0) => act(t, id, { type: 'icon', slot, index })
const finish = (t, id, slot = 0) => act(icon(icon(t, id, slot, 1), id, slot, 1), id, { type: 'confirm' })

for (const format of ['BO3', 'BO5']) test(`quick ${format}: contiguous icons share VS score/history, preserve snapshots and reload`, () => {
  let t = act(fixture(8), 'W1', { type: 'format', format })
  t = act(t, 'W1', { type: 'setup', setup: { characterIds: ['sonic', 'cloud'], variantIds: ['03', '00'], stage: { id: 'battlefield', name: 'Battlefield' } } })
  const limit = format === 'BO3' ? 2 : 3
  assert.equal(victoryIcons(match(t, 'W1'), 0).length, limit)
  t = icon(t, 'W1', 0, limit - 1)
  assert.deepEqual(t.results.W1.scores, [1, 0], 'clicking a later empty icon adds exactly one win')
  const first = structuredClone(t.results.W1.details.games[0])
  t = act(t, 'W1', { type: 'select', setup: { ...currentSetup(match(t, 'W1')), characterIds: ['joker', 'cloud'] } })
  t = icon(t, 'W1', 1, limit - 1)
  assert.equal(t.results.W1.details.games[1].stage, undefined, 'never invent a stage for the next game')
  assert.deepEqual(t.results.W1.details.games[0], first)
  t = icon(t, 'W1', 1, 0)
  assert.deepEqual(t.results.W1.scores, [1, 0])
  assert.equal(t.results.W1.details.games[1].voided, true)
  for (let i = 1; i < limit; i++) t = icon(t, 'W1', 0, limit - 1)
  assert.throws(() => icon(t, 'W1', 1, 0))
  assert.equal(match(t, 'W1').winnerId, undefined)
  t = act(t, 'W1', { type: 'confirm' })
  assert.ok(match(t, 'W1').winnerId)
  assert.deepEqual(parseTournament(exportTournament(t)), JSON.parse(JSON.stringify(t)))
  assert.equal(victoryIcons(match(t, 'W1'), 0).filter(i => i.won).length, limit)
})

test('confirmed draft is isolated; same winner preserves descendants; changed winner invalidates only at commit', () => {
  let t = fixture(8)
  t = icon(t, 'W1', 1, 0)
  t = finish(t, 'W1'); t = finish(t, 'W2'); t = finish(t, 'W5')
  const original = structuredClone(t)
  const draft = icon(t, 'W1', 1, 0).results.W1
  assert.deepEqual(t, original)
  const same = proposeQuickCommit(t, 'W1', draft, false)
  assert.equal(same.tournament.results.W1.confirmed, true)
  assert.deepEqual(same.invalidated, [])
  assert.deepEqual(same.tournament.results.W5, t.results.W5)
  assert.equal(same.tournament.results.W1.details.games[0].voided, true)
  let changed = icon(t, 'W1', 0, 0)
  changed = icon(changed, 'W1', 1, 1)
  const proposed = proposeQuickCommit(t, 'W1', changed.results.W1, true)
  assert.ok(proposed.invalidated.includes('W5'))
  assert.equal(proposed.tournament.results.W5, undefined)
  assert.deepEqual(t, original)
  assert.equal(proposed.tournament.results.W1.details.games.length, 4)
  assert.equal(proposed.tournament.results.W1.details.games.filter(g => g.voided).length, 2)
  assert.equal(tournamentStandings(same.tournament).rows.reduce((sum, row) => sum + row.setWins, 0), 3)
  assert.equal(tournamentStandings(proposed.tournament).rows.reduce((sum, row) => sum + row.setWins, 0), 2)
})

test('legacy manual scores remain legacy; correction never manufactures historical character/stage snapshots', () => {
  let t = proposeResult(fixture(8), 'W1', { format: 'BO3', scores: [2, 1], confirmed: true }).tournament
  const draft = icon(t, 'W1', 1, 0).results.W1
  assert.deepEqual(draft.details.legacyScores, [2, 0])
  assert.deepEqual(draft.details.games, [])
  t = proposeQuickCommit(t, 'W1', draft, false).tournament
  assert.ok(t.results.W1.confirmed)
  assert.ok(tournamentStandings(t).rows.every(r => !r.characters.length))
  assert.equal(tournamentStandings(t).rows.reduce((n, r) => n + r.setWins, 0), 1)
})

for (const size of [8, 16, 32, 64, 128]) test(`sets ${size}: each confirmed played set contributes one win/loss, GF and Reset counted independently`, () => {
  let t = fixture(size)
  const expected = new Map(t.participants.map(p => [p.id, [0, 0]]))
  const visited = new Set()
  while (!getChampion(t)) {
    const m = resolveBracket(t).find(m => m.enabled && !m.settled && m.players.every(Boolean))
    const winner = m.id === 'GF' ? 1 : 0
    // Exercise the exact icon operation on every round, including finals.
    t = icon(t, m.id, winner, 1)
    t = icon(t, m.id, winner, 0)
    assert.equal(t.results[m.id].details.games[0].voided, true)
    t = finish(t, m.id, winner)
    expected.get(m.players[winner].id)[0]++
    expected.get(m.players[1 - winner].id)[1]++
    visited.add(m.id)
  }
  const standings = tournamentStandings(t)
  for (const row of standings.rows) assert.deepEqual([row.setWins, row.setLosses], expected.get(row.id))
  assert.ok(visited.has('GF') && visited.has('RESET'))
  assert.deepEqual(standings.top.map(r => r.position), [1, 2, 3, 4, 5, 5, 7, 7])
  assert.equal(standings.rows.reduce((n, r) => n + r.setWins, 0), size * 2 - 1)
  assert.equal(standingsCsv(t).split('\r\n').length, size + 1)
  assert.doesNotThrow(() => parseTournament(exportTournament(t)))
})

test('records exclude BYEs, DQ, provisional and invalidated results; retained games do not become sets', () => {
  let t = fixture(7)
  assert.ok(resolveBracket(t).some(m => m.automatic))
  const m = resolveBracket(t).find(m => m.players.every(Boolean))
  t = icon(t, m.id, 0, 0)
  t = act(t, m.id, { type: 'dq', loser: 1 })
  assert.ok(match(t, m.id).winnerId)
  assert.ok(tournamentStandings(t).rows.every(r => r.setWins === 0 && r.setLosses === 0))
  t = act(t, m.id, { type: 'revert-dq' })
  t = icon(t, m.id, 0, 1)
  assert.ok(tournamentStandings(t).rows.every(r => r.setWins === 0))
  t = act(t, m.id, { type: 'confirm' })
  assert.equal(tournamentStandings(t).rows.reduce((n, r) => n + r.setWins, 0), 1)
  t = icon(t, m.id, 0, 0)
  assert.ok(tournamentStandings(t).rows.every(r => r.setWins === 0 && r.setLosses === 0))
  assert.equal(t.results[m.id].details.games.length, 2)
  assert.ok(t.results[m.id].details.games.every(g => g.voided))
})
