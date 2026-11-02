import type { GameSetup, MatchDetails, MatchResult } from '../types/tournament.ts'
import { getCharacter } from '../data/characters.ts'

export const targetWins = (format: MatchResult['format']) => format === 'BO3' ? 2 : 3

export function detailScores(details: MatchDetails): [number, number] {
  const scores: [number, number] = [...details.legacyScores]
  for (const game of details.games) if (!game.voided) scores[game.winner]++
  return scores
}

function validSetup(value: unknown): value is GameSetup {
  if (!value || typeof value !== 'object') return false
  const setup = value as GameSetup
  return (setup.variantIds === undefined || (Array.isArray(setup.variantIds) && setup.variantIds.length === 2 && setup.variantIds.every(id => typeof id === 'string' && /^0[0-7]$/.test(id)))) && Array.isArray(setup.characterIds) && setup.characterIds.length === 2 &&
    setup.characterIds.every(id => typeof id === 'string' && (id === '' || !!getCharacter(id))) &&
    (setup.stage === undefined || (!!setup.stage && typeof setup.stage === 'object' &&
      typeof setup.stage.id === 'string' && setup.stage.id.length > 0 && setup.stage.id.length <= 128 &&
      typeof setup.stage.name === 'string' && setup.stage.name.trim().length > 0 && setup.stage.name.length <= 128))
}

function validDetails(details: MatchDetails, target: number, expected: [number, number]): boolean {
  if (!details || typeof details !== 'object' || !validSetup(details.current) ||
    !['ready', 'in-progress', 'paused'].includes(details.status) ||
    !Array.isArray(details.legacyScores) || details.legacyScores.length !== 2 ||
    !details.legacyScores.every(n => Number.isInteger(n) && n >= 0 && n <= target) ||
    !Array.isArray(details.games) || details.games.length > 64 ||
    (details.startedAt !== undefined && (typeof details.startedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(details.startedAt) || !Number.isFinite(Date.parse(details.startedAt)))) ||
    (details.rulesetId !== undefined && (typeof details.rulesetId !== 'string' || details.rulesetId.length > 128))) return false
  const scores = [...details.legacyScores]
  for (const game of details.games) {
    if (!validSetup(game) || (game.winner !== 0 && game.winner !== 1) ||
      (game.voided !== undefined && typeof game.voided !== 'boolean')) return false
    if (game.voided) continue
    if (scores.some(n => n >= target)) return false
    scores[game.winner]++
  }
  return scores.every((n, i) => n === expected[i])
}

export function validateResult(value: unknown): value is MatchResult {
  if (!value || typeof value !== 'object') return false
  const result = value as MatchResult
  if (result.format !== 'BO3' && result.format !== 'BO5') return false
  if (typeof result.confirmed !== 'boolean' || !Array.isArray(result.scores) || result.scores.length !== 2) return false
  const target = targetWins(result.format)
  if (!result.scores.every((score) => Number.isInteger(score) && score >= 0 && score <= target)) return false
  const completed = result.scores.filter((score) => score === target).length
  const dq = result.outcome
  if (dq !== undefined && (!dq || typeof dq !== 'object' || dq.type !== 'dq' ||
    (dq.loser !== 0 && dq.loser !== 1) || !result.confirmed ||
    typeof dq.recordedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(dq.recordedAt) || !Number.isFinite(Date.parse(dq.recordedAt)) ||
    (dq.reason !== undefined && (typeof dq.reason !== 'string' || dq.reason.length > 160 || [...dq.reason].some(char => char.charCodeAt(0) < 32))))) return false
  return (result.prepared === undefined || validSetup(result.prepared)) && completed <= 1 && (!!dq || !result.confirmed || completed === 1) &&
    (result.details === undefined || validDetails(result.details, target, result.scores))
}

// Whitelist persisted fields, including per-game snapshots. No imported asset URLs.
export function copyResult(result: MatchResult): MatchResult {
  const setup = (value: GameSetup): GameSetup => ({ characterIds: [...value.characterIds],
    ...(value.variantIds ? { variantIds: [...value.variantIds] as [string, string] } : {}),
    ...(value.stage ? { stage: { id: value.stage.id, name: value.stage.name } } : {}) })
  const d = result.details
  return { format: result.format, scores: [...result.scores], confirmed: result.confirmed,
    ...(result.prepared ? { prepared: setup(result.prepared) } : {}),
    ...(result.outcome ? { outcome: { type: 'dq' as const, loser: result.outcome.loser, recordedAt: result.outcome.recordedAt,
      ...(result.outcome.reason ? { reason: result.outcome.reason } : {}) } } : {}),
    ...(d ? { details: { legacyScores: [...d.legacyScores] as [number, number],
      games: d.games.map(game => ({ ...setup(game), winner: game.winner, ...(game.voided ? { voided: true } : {}) })), current: setup(d.current),
      status: d.status, ...(d.startedAt ? { startedAt: d.startedAt } : {}),
      ...(d.rulesetId ? { rulesetId: d.rulesetId } : {}) } } : {}) }
}

export function winnerSlot(result: MatchResult): 0 | 1 | undefined {
  if (!validateResult(result)) return undefined
  if (result.outcome?.type === 'dq') return result.outcome.loser === 0 ? 1 : 0
  const target = targetWins(result.format)
  if (result.scores[0] === target) return 0
  if (result.scores[1] === target) return 1
  return undefined
}
