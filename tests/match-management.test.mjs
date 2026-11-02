import test from 'node:test'
import assert from 'node:assert/strict'
import { createTournament, resolveBracket, proposeResult, MATCHES, getChampion } from '../src/utils/doubleElimination.ts'
import { proposeMatchAction, victoryIcons, readMatchResult, matchState, activeMatches, matchActionWarnings } from '../src/utils/matchSession.ts'
import { validateResult, winnerSlot } from '../src/utils/tournamentResults.ts'
import { parseTournament, exportTournament, isTournament } from '../src/utils/tournamentValidation.ts'
import { saveTournament, loadTournament } from '../src/utils/tournamentStorage.ts'

const fixture = () => {
  const t = createTournament(); t.status = 'started'
  t.participants.forEach((p, i) => { p.nickname = `Player ${i + 1}`; p.characterIds = ['mario'] })
  t.seeds = t.participants.map(p => p.id)
  return t
}
const resolved = (t, id = 'W1') => resolveBracket(t).find(m => m.id === id)
const act = (t, action, id = 'W1') => proposeMatchAction(t, id, action).tournament
const dq = (t, loser = 0, id = 'W1') => act(t, { type: 'dq', loser, reason: 'No se presentó a tiempo', now: '2026-10-17T18:00:00.000Z' }, id)
const confirmWin = (t, id, slot = 0) => proposeResult(t, id, { format: 'BO3', scores: slot ? [0, 2] : [2, 0], confirmed: true }).tournament
const setup = { characterIds: ['sora', 'kazuya'], stage: { id: 'battlefield', name: 'Battlefield' } }
const beforeGF = () => MATCHES.filter(m => m.id !== 'GF' && m.id !== 'RESET').reduce((t, m) => confirmWin(t, m.id), fixture())

for (const format of ['BO3', 'BO5']) test(`${format}: icon clicks add one win, retire selected wins and cannot create impossible scores`, () => {
  let t = act(fixture(), { type: 'format', format })
  const target = format === 'BO3' ? 2 : 3
  t = act(t, { type: 'setup', setup })
  t = act(t, { type: 'icon', slot: 0, index: target - 1 })
  assert.deepEqual(t.results.W1.scores, [1, 0], 'clicking a distant pending slot never fabricates skipped games')
  assert.deepEqual(t.results.W1.details.games[0].stage, setup.stage)
  const firstStart = t.results.W1.details.startedAt
  t = act(t, { type: 'setup', setup: { characterIds: ['link', 'peach'] } })
  t = act(t, { type: 'icon', slot: 1, index: 0 })
  for (let index = 1; index < target; index++) t = act(t, { type: 'icon', slot: 0, index })
  assert.equal(matchState(resolved(t)).key, 'provisional')
  assert.equal(resolved(t, 'W5').players[0], undefined)
  assert.equal(t.results.W1.details.startedAt, firstStart)
  assert.equal(victoryIcons(resolved(t), 0)[0].characterId, 'sora')
  assert.throws(() => act(t, { type: 'icon', slot: 1, index: 1 }))
  assert.throws(() => act(t, { type: 'icon', slot: 0, index: target }))
  assert.throws(() => act(t, { type: 'icon', slot: 2, index: 0 }))
  t = act(t, { type: 'confirm' })
  assert.equal(resolved(t, 'W5').players[0].id, t.seeds[0])
  const proposal = proposeMatchAction(t, 'W1', { type: 'icon', slot: 0, index: 1 })
  assert.ok(matchActionWarnings(resolved(t), { type: 'icon', slot: 0, index: 1 }, proposal).some(w => w.includes('Reducir')))
  t = proposal.tournament
  assert.deepEqual(t.results.W1.scores, [1, 1])
  assert.equal(t.results.W1.details.games.filter(g => g.voided).length, target - 1)
  assert.deepEqual(t.results.W1.details.games[0].stage, setup.stage)
  assert.equal(resolved(t, 'W5').players[0], undefined)
  assert.equal(t.results.W1.confirmed, false)
  t = act(t, { type: 'icon', slot: 0, index: 0 })
  assert.deepEqual(t.results.W1.scores, [0, 1])
  assert.equal(victoryIcons(resolved(t), 0).filter(i => i.won).length, 0)
  assert.deepEqual(parseTournament(exportTournament(t)), t)
})

test('victories require no repeated start; view reads, pauses and reloads retain all stored data', () => {
  let t = act(fixture(), { type: 'setup', setup })
  t = act(t, { type: 'win', winner: 0 })
  t = act(t, { type: 'pause' })
  t = act(t, { type: 'win', winner: 1 })
  assert.equal(t.results.W1.details.status, 'in-progress')
  const map = new Map(); const store = { getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) }
  saveTournament(store, t)
  for (let i = 0; i < 5; i++) {
    readMatchResult(resolved(t)); victoryIcons(resolved(t), 0)
    assert.deepEqual(loadTournament(store).tournament, t)
  }
})

test('DQ in Winners keeps actual scores/history and drops only the disqualified player into Losers', () => {
  let t = act(fixture(), { type: 'setup', setup })
  t = act(t, { type: 'win', winner: 0 })
  const original = structuredClone(t.results.W1)
  t = dq(t, 0)
  assert.deepEqual(t.results.W1.scores, [1, 0])
  assert.deepEqual(t.results.W1.details, original.details)
  assert.equal(winnerSlot(t.results.W1), 1)
  assert.equal(resolved(t, 'W5').players[0].id, t.seeds[1])
  assert.equal(resolved(t, 'L1').players[0].id, t.seeds[0])
  assert.equal(t.results.W1.outcome.reason, 'No se presentó a tiempo')
  assert.equal(matchState(resolved(t)).key, 'dq')
  assert.equal(victoryIcons(resolved(t), 1).filter(i => i.won).length, 0)
  assert.deepEqual(parseTournament(exportTournament(t)), t)
  assert.throws(() => act(t, { type: 'win', winner: 1 }), /Revierte/)
  assert.throws(() => dq(t, 1), /Revierte/)
})

test('DQ in Losers eliminates the loser without creating a second advancing position', () => {
  let t = confirmWin(confirmWin(fixture(), 'W1'), 'W2')
  const loser = resolved(t, 'L1').players[0].id
  const winner = resolved(t, 'L1').players[1].id
  t = dq(t, 0, 'L1')
  assert.equal(resolved(t, 'L3').players[0].id, winner)
  assert.equal(resolved(t, 'L1').loserId, loser)
  for (const match of resolveBracket(t)) {
    if (match.players.every(Boolean)) assert.notEqual(match.players[0].id, match.players[1].id)
  }
  assert.deepEqual(t.results.L1.scores, [0, 0])
})

for (const loser of [0, 1]) test(`Grand Final DQ slot ${loser} respects reset eligibility`, () => {
  const t = dq(beforeGF(), loser, 'GF')
  assert.equal(resolved(t, 'RESET').enabled, loser === 0)
  assert.equal(!!getChampion(t), loser === 1)
  assert.deepEqual(t.results.GF.scores, [0, 0])
  assert.equal(isTournament(t), true)
})

for (const loser of [0, 1]) test(`Grand Final Reset DQ slot ${loser} produces the correct champion`, () => {
  let t = dq(beforeGF(), 0, 'GF')
  const expected = resolved(t, 'RESET').players[loser === 0 ? 1 : 0].id
  t = dq(t, loser, 'RESET')
  assert.equal(getChampion(t).id, expected)
  assert.deepEqual(t.results.RESET.scores, [0, 0])
  assert.deepEqual(parseTournament(exportTournament(t)), t)
})

test('DQ reversal lists affected descendants, preserves independent results and requires reconfirmation', () => {
  let t = dq(fixture(), 0)
  t = confirmWin(t, 'W2'); t = confirmWin(t, 'W3')
  t = act(t, { type: 'win', winner: 0 }, 'W5')
  t = dq(t, 1, 'L1')
  const old = structuredClone(t)
  const proposal = proposeMatchAction(t, 'W1', { type: 'revert-dq' })
  assert.deepEqual(proposal.invalidated.sort(), ['L1', 'W5'])
  const warnings = matchActionWarnings(resolved(t), { type: 'revert-dq' }, proposal).join('\n')
  assert.match(warnings, /Revertir el DQ/); assert.match(warnings, /L1/); assert.match(warnings, /W5/)
  assert.deepEqual(t, old, 'proposal must not mutate storage before confirmation')
  t = proposal.tournament
  assert.equal(t.results.W1.outcome, undefined)
  assert.deepEqual(t.results.W1.scores, [0, 0])
  assert.equal(t.results.W1.confirmed, false)
  assert.deepEqual(t.results.W3, old.results.W3)
  assert.equal(t.results.L1, undefined)
  assert.equal(t.results.W5, undefined)
  assert.throws(() => act(t, { type: 'revert-dq' }))
})

test('reversing GF DQ invalidates Reset and preserves the earlier bracket', () => {
  let t = dq(dq(beforeGF(), 0, 'GF'), 1, 'RESET')
  const proposal = proposeMatchAction(t, 'GF', { type: 'revert-dq' })
  assert.deepEqual(proposal.invalidated, ['RESET'])
  assert.equal(proposal.tournament.results.RESET, undefined)
  assert.deepEqual(proposal.tournament.results.W7, t.results.W7)
  assert.equal(getChampion(proposal.tournament), undefined)
})

test('DQ over a previously completed set never replaces the actual score, even on reversal', () => {
  let t = confirmWin(fixture(), 'W1')
  t = dq(t, 0)
  assert.deepEqual(t.results.W1.scores, [2, 0])
  assert.equal(resolved(t).winnerId, t.seeds[1])
  assert.throws(() => proposeResult(t, 'W1', { format: 'BO3', scores: [2, 0], confirmed: true }), /explícitamente/)
  t = act(t, { type: 'revert-dq' })
  assert.deepEqual(t.results.W1.scores, [2, 0])
  assert.equal(resolved(t).winnerId, undefined)
  assert.equal(matchState(resolved(t)).key, 'provisional')
})

test('incomplete or unavailable matches, simultaneous DQs and invalid DQ metadata are rejected', () => {
  assert.throws(() => dq(fixture(), 0, 'W5'))
  assert.throws(() => dq(fixture(), 0, 'RESET'))
  assert.throws(() => dq(fixture(), 2))
  const t = dq(fixture())
  for (const mutate of [
    r => { r.outcome.loser = [0, 1] }, r => { r.outcome.type = 'other' },
    r => { r.outcome.recordedAt = 'not-a-date' }, r => { r.outcome.reason = 'a'.repeat(161) },
    r => { r.confirmed = false }, r => { r.outcome = null },
  ]) {
    const bad = structuredClone(t); mutate(bad.results.W1)
    assert.equal(validateResult(bad.results.W1), false)
    assert.throws(() => parseTournament(JSON.stringify(bad)))
  }
})

test('match states and active match discovery retain all concurrent encounters, excluding completed DQs', () => {
  let t = fixture()
  assert.equal(matchState(resolved(t, 'W5')).key, 'pending')
  assert.equal(matchState(resolved(t)).key, 'ready')
  assert.deepEqual(activeMatches(t), [])
  t = act(t, { type: 'win', winner: 0 })
  t = act(t, { type: 'start' }, 'W2')
  t = act(t, { type: 'pause' }, 'W2')
  assert.deepEqual(activeMatches(t).map(m => m.id), ['W1', 'W2'])
  assert.equal(matchState(resolved(t)).key, 'live')
  assert.equal(matchState(resolved(t, 'W2')).key, 'paused')
  t = dq(t, 0, 'W2')
  assert.deepEqual(activeMatches(t).map(m => m.id), ['W1'])
  t = act(act(t, { type: 'win', winner: 0 }), { type: 'confirm' })
  assert.equal(matchState(resolved(t)).key, 'finished')
  assert.deepEqual(activeMatches(t), [])
})

test('legacy scores can be reduced without inventing detailed games; old JSON remains compatible', () => {
  let t = proposeResult(fixture(), 'W1', { format: 'BO5', scores: [2, 1], confirmed: false }).tournament
  assert.deepEqual(parseTournament(exportTournament(t)), t)
  t = act(t, { type: 'icon', slot: 0, index: 0 })
  assert.deepEqual(t.results.W1.scores, [0, 1])
  assert.deepEqual(t.results.W1.details.games, [])
  assert.equal(t.results.W1.details.current.stage, undefined)
  t = dq(t, 1)
  const map = new Map(); const store = { getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) }
  saveTournament(store, t)
  assert.deepEqual(loadTournament(store).tournament, t)
})
