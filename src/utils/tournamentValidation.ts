import type { Participant, Tournament } from '../types/tournament.ts'
import { getCharacter } from '../data/characters.ts'
import { resolveBracket, rosterError, tournamentMatches } from './doubleElimination.ts'
import { bracketSize, generateStructure } from './bracketStructure.ts'
import { scalableRosterError, validPriorities } from './tournamentSetup.ts'
import { copyResult, validateResult } from './tournamentResults.ts'

const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

export function isTournament(value: unknown): value is Tournament {
  if (!object(value) || ![1, 2].includes(value.schemaVersion as number)) return false
  const modern = value.schemaVersion === 2
  if (!['draft', 'ready', 'started'].includes(value.status as string)) return false
  if (!Array.isArray(value.participants) || (modern ? value.participants.length < 2 : value.participants.length !== 8)) return false
  for (const player of value.participants) {
    if (!object(player) || typeof player.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(player.id)) return false
    if (typeof player.nickname !== 'string' || player.nickname.length > (modern ? 128 : 32) || [...player.nickname].some((char) => char.charCodeAt(0) < 32)) return false
    if (!Array.isArray(player.characterIds) || player.characterIds.length > 1 ||
      !player.characterIds.every((id) => typeof id === 'string' && !!getCharacter(id))) return false
  }
  const players = value.participants as Participant[]
  if (new Set(players.map((p) => p.id)).size !== players.length) return false
  if (!Array.isArray(value.seeds) || !object(value.results)) return false
  const t = value as Tournament
  if (value.priorities !== undefined && (!object(value.priorities) || !validPriorities(t))) return false
  if (modern) {
    if (scalableRosterError(players)) return false
    const canonical = generateStructure(players.length)
    if (!Array.isArray(value.structure) || value.structure.length !== canonical.length || !value.structure.every((m, i) => {
      const expected = canonical[i]
      return object(m) && m.id === expected.id && m.section === expected.section && m.column === expected.column && m.round === expected.round && Array.isArray(m.sources) && m.sources.length === 2 && m.sources.every((s, j) => {
        const source = expected.sources[j]
        return object(s) && ('seed' in source ? s.seed === source.seed && !('match' in s) : s.match === source.match && s.outcome === source.outcome && !('seed' in s))
      })
    })) return false
    if (!Array.isArray(value.completionOrder) || new Set(value.completionOrder).size !== value.completionOrder.length) return false
    if (!value.completionOrder.every(id => typeof id === 'string' && t.results[id as keyof typeof t.results]?.confirmed)) return false
    if (Object.entries(t.results).filter(([, r]) => r?.confirmed).length !== value.completionOrder.length) return false
    if (value.previousSeeds !== undefined && !validDistribution(value.previousSeeds, players)) return false
  }
  if (value.status === 'draft') return value.seeds.length === 0 && Object.keys(value.results).length === 0
  if (modern ? !validDistribution(value.seeds, players) : rosterError(players) || value.seeds.length !== 8 || new Set(value.seeds).size !== 8 || !value.seeds.every(id => players.some(p => p.id === id))) return false
  if (value.status === 'ready' && Object.keys(value.results).length !== 0) return false
  for (const [id, result] of Object.entries(value.results)) {
    if (!tournamentMatches(t).some((match) => match.id === id) || !validateResult(result)) return false
  }
  const bracket = resolveBracket(value as Tournament)
  if (!bracket.every((match) => !match.result || (match.enabled && !!match.players[0] && !!match.players[1] && match.players[0].id !== match.players[1].id))) return false
  if (modern) {
    const seen = new Set<string>(), byId = new Map(bracket.map(m => [m.id, m]))
    const ready = (id: string): boolean => {
      if (seen.has(id)) return true
      const match = byId.get(id as keyof typeof t.results)
      return !!match?.automatic && match.sources.every(s => 'seed' in s || ready(s.match))
    }
    for (const id of t.completionOrder!) {
      if (!byId.get(id)?.sources.every(s => 'seed' in s || ready(s.match))) return false
      seen.add(id)
    }
  }
  return true
}

function validDistribution(value: unknown, players: Participant[]) {
  if (!Array.isArray(value) || value.length !== bracketSize(players.length) || !value.every(id => typeof id === 'string')) return false
  const occupied = value.filter(Boolean), ids = new Set(players.map(p => p.id))
  return occupied.length === players.length && new Set(occupied).size === players.length && occupied.every(id => ids.has(id))
}

export const MAX_TOURNAMENT_JSON = 10 * 1024 * 1024

// Import only our schema's fields; never keep arbitrary input fields or asset URLs.
export function parseTournament(json: string): Tournament {
  if (new TextEncoder().encode(json).length > MAX_TOURNAMENT_JSON) throw new Error('El torneo supera el límite práctico de 10 MB de JSON.')
  let value: unknown
  try { value = JSON.parse(json) } catch { throw new Error('El archivo no contiene JSON válido.') }
  if (!isTournament(value)) throw new Error('Torneo inválido: revisa la versión, participantes, estructura, distribución y resultados dependientes.')
  return {
    schemaVersion: value.schemaVersion, status: value.status,
    participants: value.participants.map((p) => ({ id: p.id, nickname: p.nickname, characterIds: [...p.characterIds] })),
    seeds: [...value.seeds],
    results: Object.fromEntries(Object.entries(value.results).map(([id, r]) => [id, copyResult(r!)])),
    ...(value.priorities ? { priorities: { ...value.priorities } } : {}),
    ...(value.schemaVersion === 2 ? { structure: generateStructure(value.participants.length), completionOrder: [...value.completionOrder!], ...(value.previousSeeds ? { previousSeeds: [...value.previousSeeds] } : {}) } : {}),
  }
}

export function exportTournament(tournament: Tournament): string {
  return JSON.stringify(parseTournament(JSON.stringify(tournament)), null, 2)
}
