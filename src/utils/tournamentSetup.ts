import type { MatchId, Participant, Tournament } from '../types/tournament.ts'
import { bracketSize, generateStructure, seedOrder } from './bracketStructure.ts'
import { descendants, tournamentMatches } from './doubleElimination.ts'
import { cleanNickname, nicknameKey } from './registration.ts'

export function scalableRosterError(players: Participant[]): string | undefined {
  if (players.length < 2) return 'Selecciona al menos dos participantes.'
  if (new Set(players.map(p => p.id)).size !== players.length) return 'Hay participantes duplicados.'
  if (new Set(players.map(p => nicknameKey(p.nickname))).size !== players.length) return 'Hay nicknames duplicados.'
  try { players.forEach(p => cleanNickname(p.nickname)) } catch (e) { return (e as Error).message }
}
export function createScalableTournament(players: { id: string; nickname: string }[]): Tournament {
  const participants = players.map(p => ({ id: p.id, nickname: p.nickname, characterIds: [] }))
  const error = scalableRosterError(participants)
  if (error) throw new Error(error)
  return { schemaVersion: 2, status: 'draft', participants, seeds: [], results: {}, structure: generateStructure(players.length), priorities: {}, completionOrder: [] }
}
export function validPriorities(t: Tournament) {
  const entries = Object.entries(t.priorities ?? {}), ids = new Set(t.participants.map(p => p.id))
  return entries.every(([id, rank]) => ids.has(id) && Number.isInteger(rank) && rank >= 1 && rank <= t.participants.length) && new Set(entries.map(([, rank]) => rank)).size === entries.length
}
export function drawTournament(t: Tournament, random = Math.random): Tournament {
  if (t.status === 'started') throw new Error('El torneo comenzó. Utiliza una corrección de posiciones con confirmación; no se permite volver a sortear.')
  const error = scalableRosterError(t.participants)
  if (error) throw new Error(error)
  if (!validPriorities(t)) throw new Error('Los seeds deben ser números únicos entre 1 y la cantidad de participantes.')
  const priorities = t.priorities ?? {}, remaining = t.participants.filter(p => !Object.hasOwn(priorities, p.id)).map(p => p.id)
  for (let i = remaining.length - 1; i > 0; i--) {
    const draw = random()
    if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new Error('Fuente aleatoria inválida.')
    const j = Math.floor(draw * (i + 1)); [remaining[i], remaining[j]] = [remaining[j], remaining[i]]
  }
  const ranks = new Map(Object.entries(priorities).map(([id, rank]) => [rank, id]))
  let index = 0
  for (let rank = 1; rank <= t.participants.length; rank++) if (!ranks.has(rank)) ranks.set(rank, remaining[index++])
  const seeds = seedOrder(bracketSize(t.participants.length)).map(rank => ranks.get(rank) ?? '')
  return { ...t, schemaVersion: 2, status: 'ready', structure: generateStructure(t.participants.length), seeds, results: {}, completionOrder: [], previousSeeds: t.seeds.length === seeds.length ? [...t.seeds] : undefined }
}
export function swapPositions(t: Tournament, a: number, b: number) {
  if (![a, b].every(n => Number.isInteger(n) && n >= 0 && n < t.seeds.length) || a === b) throw new Error('Elige dos posiciones diferentes de la distribución.')
  if (t.seeds[a] === t.seeds[b]) throw new Error('Ambas posiciones están vacías.')
  const seeds = [...t.seeds]; [seeds[a], seeds[b]] = [seeds[b], seeds[a]]
  const affected = new Set<MatchId>()
  for (const match of tournamentMatches(t)) if (match.sources.some(s => 'seed' in s && (s.seed === a || s.seed === b))) {
    affected.add(match.id); descendants(match.id, t).forEach(id => affected.add(id))
  }
  const invalidated = [...affected].filter(id => t.results[id])
  const results = { ...t.results }; invalidated.forEach(id => delete results[id])
  return { tournament: { ...t, seeds, results, ...(t.schemaVersion === 2 ? { previousSeeds: t.status === 'started' ? undefined : [...t.seeds], completionOrder: (t.completionOrder ?? []).filter(id => !affected.has(id)) } : {}) }, invalidated }
}
export function restoreDistribution(t: Tournament): Tournament {
  if (t.status === 'started' || !t.previousSeeds) throw new Error('No hay una distribución anterior restaurable antes de iniciar.')
  return { ...t, seeds: [...t.previousSeeds], previousSeeds: [...t.seeds] }
}
