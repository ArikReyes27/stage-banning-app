// Deterministic vectors derived from the CURRENT TypeScript engine (no rules invented here).
import { createHash } from 'node:crypto'
import { generateStructure, seedOrder, bracketSize } from '../../src/utils/bracketStructure.ts'
import { createScalableTournament, drawTournament, swapPositions } from '../../src/utils/tournamentSetup.ts'
import { resolveBracket, proposeResult, getChampion, descendants } from '../../src/utils/doubleElimination.ts'
import { validateResult, winnerSlot, targetWins } from '../../src/utils/tournamentResults.ts'

export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16)
export const mulberry32 = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
export const players = n => Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, nickname: `Player ${i + 1}` }))
export const started = (n, seed = 15601, priorities = {}) => {
  const t = createScalableTournament(players(n)); t.priorities = priorities
  return { ...drawTournament(t, mulberry32(seed)), status: 'started' }
}
export const win = (format, slot, loserScore = 0) => { const s = [loserScore, loserScore]; s[slot] = targetWins(format); return { format, scores: s, confirmed: true } }
const DQ_AT = '2026-01-01T00:00:00.000Z'
export const dq = (loser, format = 'BO3') => ({ format, scores: [0, 0], confirmed: true, outcome: { type: 'dq', loser, recordedAt: DQ_AT } })
export const summary = t => resolveBracket(t).map(m => ({ id: m.id, p: m.players.map(p => p?.id ?? null), enabled: m.enabled, automatic: !!m.automatic, settled: !!m.settled, w: m.winnerId ?? null, l: m.loserId ?? null }))
export const attempt = (t, id, result, options) => {
  try { const r = proposeResult(t, id, result, options); return { ok: true, tournament: r.tournament, invalidated: r.invalidated, completionOrder: r.tournament.completionOrder ?? null } }
  catch (e) { return { ok: false, error: e.message } }
}
const brief = a => a.ok ? { ok: true, invalidated: a.invalidated, completionOrder: a.completionOrder } : a

// Plays every playable match; pick(match) => winner slot. Returns played order and champion.
export function playAll(t, pick, format = 'BO3') {
  const played = []
  for (let guard = 0; guard < 1000; guard++) {
    const m = resolveBracket(t).find(x => x.enabled && x.players[0] && x.players[1] && !x.settled)
    if (!m) break
    const a = attempt(t, m.id, win(format, pick(m), 1))
    if (!a.ok) throw new Error(`${m.id}: ${a.error}`)
    t = a.tournament; played.push(m.id)
  }
  return { tournament: t, played, champion: getChampion(t)?.id ?? null }
}

export function buildVectors() {
  const counts = [2, 3, 4, 5, 6, 7, 8, 9, 12, 16, 17, 32, 33, 64, 100, 128]
  const structures = counts.map(n => {
    const s = generateStructure(n), size = bracketSize(n)
    return { n, size, matches: s.length, winners: s.filter(m => m.section === 'winners').length, losers: s.filter(m => m.section === 'losers').length,
      ids: s.map(m => m.id).join(','), ...(n <= 8 ? { structure: s } : { digest: digest(s) }) }
  })
  const seedOrders = [2, 4, 8, 16, 32, 64, 128].map(size => ({ size, ...(size <= 16 ? { order: seedOrder(size) } : { digest: digest(seedOrder(size)) }) }))
  const draws = [2, 3, 4, 5, 6, 7, 8, 9, 16, 17].map(n => {
    const t = started(n)
    return { n, rng: 15601, seeds: t.seeds, byes: t.seeds.filter(s => s === '').length }
  })
  draws.push({ n: 6, rng: 15601, priorities: { p3: 1, p5: 2 }, seeds: started(6, 15601, { p3: 1, p5: 2 }).seeds })
  const byeBrackets = [3, 5, 6, 7].map(n => ({ n, bracket: summary(started(n)) }))
  const formats = ['BO3', 'BO5'].flatMap(f => [0, 1].flatMap(slot => [0, 1, 2, 4].map(ls => {
    const value = win(f, slot, ls)
    return { format: f, slot, loserScore: ls, value, valid: validateResult(value), winnerSlot: winnerSlot(value) ?? null }
  })))
  const invalidResults = [
    ['bad format', { format: 'BO7', scores: [0, 0], confirmed: false }],
    ['both reach target', { format: 'BO3', scores: [2, 2], confirmed: true }],
    ['over target', { format: 'BO3', scores: [3, 0], confirmed: true }],
    ['negative', { format: 'BO3', scores: [-1, 0], confirmed: false }],
    ['confirmed without winner', { format: 'BO5', scores: [2, 1], confirmed: true }],
    ['non integer', { format: 'BO3', scores: [1.5, 0], confirmed: false }],
    ['dq not confirmed', { ...dq(0), confirmed: false }],
    ['dq bad loser', { ...dq(0), outcome: { type: 'dq', loser: 2, recordedAt: DQ_AT } }],
    ['dq bad date', { ...dq(0), outcome: { type: 'dq', loser: 0, recordedAt: 'x' } }],
    ['in progress ok', { format: 'BO3', scores: [1, 0], confirmed: false }],
    ['dq ok', dq(1)],
  ].map(([label, value]) => ({ label, valid: validateResult(value), winnerSlot: winnerSlot(value) ?? null }))
  const fullPlays = [2, 3, 4, 5, 8, 9, 16, 17, 32].flatMap(n => {
    const base = started(n)
    const fav = playAll(base, () => 0), upset = playAll(base, m => m.id === 'GF' ? 1 : 0, 'BO5')
    return [['favorite', fav], ['upset-grand-final', upset]].map(([kind, r]) => ({ n, kind, played: r.played.length, resetPlayed: r.played.includes('RESET'), champion: r.champion,
      order: n <= 5 ? r.played : null, orderDigest: digest(r.played), completionLen: r.tournament.completionOrder.length }))
  })
  // Corrections on a 4-player bracket (engine behaviour, not a design proposal).
  const base4 = started(4)
  const played = playAll(base4, () => 0).tournament
  const mid = attempt(attempt(base4, 'W1', win('BO3', 0)).tournament, 'W2', win('BO3', 0)).tournament
  const withWF = attempt(mid, 'W3', win('BO3', 0)).tournament
  const detailed = { format: 'BO3', scores: [2, 0], confirmed: true, details: { legacyScores: [0, 0], games: [{ characterIds: ['', ''], winner: 0 }, { characterIds: ['', ''], winner: 0 }], current: { characterIds: ['', ''] }, status: 'ready' } }
  const withDetails = attempt(base4, 'W1', detailed)
  const dqOnW1 = attempt(base4, 'W1', dq(0))
  const swap = swapPositions(withWF, 0, 2)
  const corrections = {
    initial: summary(base4),
    notStarted: brief(attempt({ ...base4, status: 'ready' }, 'W1', win('BO3', 0))),
    resetBeforeGrandFinal: brief(attempt(base4, 'RESET', win('BO3', 0))),
    undefinedPlayers: brief(attempt(base4, 'W3', win('BO3', 0))),
    sameWinnerOtherScore: brief(attempt(withWF, 'W1', win('BO3', 0, 1))),
    flipWinnerInvalidates: brief(attempt(withWF, 'W1', win('BO3', 1))),
    flipWinnerBO5: brief(attempt(withWF, 'W1', win('BO5', 1, 2))),
    unconfirmedKeepsWinner: brief(attempt(withWF, 'W1', { format: 'BO3', scores: [1, 0], confirmed: false })),
    detailsAccepted: brief(withDetails),
    detailsDroppedRejected: brief(attempt(withDetails.tournament, 'W1', win('BO3', 0))),
    dqRecorded: { ...brief(dqOnW1), winner: summary(dqOnW1.tournament).find(m => m.id === 'W1').w },
    dqOverwriteRejected: brief(attempt(dqOnW1.tournament, 'W1', win('BO3', 0))),
    dqRevertAllowed: brief(attempt(dqOnW1.tournament, 'W1', win('BO3', 0), { revertDQ: true })),
    descendantsOfW1: descendants('W1', base4),
    descendantsOfGF: descendants('GF', base4),
    fullFavorite: { champion: getChampion(played)?.id ?? null, completionOrder: played.completionOrder },
    swapInvalidates: { invalidated: swap.invalidated, seeds: swap.tournament.seeds, completionOrder: swap.tournament.completionOrder, resultsLeft: Object.keys(swap.tournament.results) },
  }
  return { generatedBy: 'tests/helpers/phase15-6-vectors.mjs', engine: 'src/utils (schemaVersion 2)', structures, seedOrders, draws, byeBrackets, formats, invalidResults, fullPlays, corrections }
}
