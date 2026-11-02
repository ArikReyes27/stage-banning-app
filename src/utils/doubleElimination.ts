import type { MatchDefinition, MatchId, MatchResult, Participant, ResolvedMatch, Tournament } from '../types/tournament.ts'
import { copyResult, validateResult, winnerSlot } from './tournamentResults.ts'
import { getCharacter } from '../data/characters.ts'
import { generateStructure } from './bracketStructure.ts'

export const tournamentMatches = (tournament: Tournament): MatchDefinition[] => tournament.schemaVersion === 2 ? tournament.structure ?? generateStructure(tournament.participants.length) : MATCHES

// Topological order. Cross the semifinal drops to avoid immediate W1 rematches.
export const MATCHES: MatchDefinition[] = [
  { id: 'W1', section: 'winners', round: 'Winners Round 1', column: 0, sources: [{ seed: 0 }, { seed: 1 }] },
  { id: 'W2', section: 'winners', round: 'Winners Round 1', column: 0, sources: [{ seed: 2 }, { seed: 3 }] },
  { id: 'W3', section: 'winners', round: 'Winners Round 1', column: 0, sources: [{ seed: 4 }, { seed: 5 }] },
  { id: 'W4', section: 'winners', round: 'Winners Round 1', column: 0, sources: [{ seed: 6 }, { seed: 7 }] },
  { id: 'W5', section: 'winners', round: 'Winners Semifinals', column: 1, sources: [{ match: 'W1', outcome: 'winner' }, { match: 'W2', outcome: 'winner' }] },
  { id: 'W6', section: 'winners', round: 'Winners Semifinals', column: 1, sources: [{ match: 'W3', outcome: 'winner' }, { match: 'W4', outcome: 'winner' }] },
  { id: 'W7', section: 'winners', round: 'Winners Final', column: 2, sources: [{ match: 'W5', outcome: 'winner' }, { match: 'W6', outcome: 'winner' }] },
  { id: 'L1', section: 'losers', round: 'Losers Round 1', column: 0, sources: [{ match: 'W1', outcome: 'loser' }, { match: 'W2', outcome: 'loser' }] },
  { id: 'L2', section: 'losers', round: 'Losers Round 1', column: 0, sources: [{ match: 'W3', outcome: 'loser' }, { match: 'W4', outcome: 'loser' }] },
  { id: 'L3', section: 'losers', round: 'Losers Round 2', column: 1, sources: [{ match: 'L1', outcome: 'winner' }, { match: 'W6', outcome: 'loser' }] },
  { id: 'L4', section: 'losers', round: 'Losers Round 2', column: 1, sources: [{ match: 'L2', outcome: 'winner' }, { match: 'W5', outcome: 'loser' }] },
  { id: 'L5', section: 'losers', round: 'Losers Round 3', column: 2, sources: [{ match: 'L3', outcome: 'winner' }, { match: 'L4', outcome: 'winner' }] },
  { id: 'L6', section: 'losers', round: 'Losers Final', column: 3, sources: [{ match: 'L5', outcome: 'winner' }, { match: 'W7', outcome: 'loser' }] },
  { id: 'GF', section: 'finals', round: 'Grand Final', column: 0, sources: [{ match: 'W7', outcome: 'winner' }, { match: 'L6', outcome: 'winner' }] },
  { id: 'RESET', section: 'finals', round: 'Grand Final Reset', column: 1, sources: [{ match: 'GF', outcome: 'loser' }, { match: 'GF', outcome: 'winner' }] },
]

export function createTournament(): Tournament {
  return {
    schemaVersion: 1, status: 'draft', seeds: [], results: {},
    participants: Array.from({ length: 8 }, (_, i) => ({ id: `p${i + 1}`, nickname: '', characterIds: [] })),
  }
}

export function rosterError(players: Participant[]): string | undefined {
  if (players.length !== 8) return 'Registra exactamente 8 participantes.'
  if (new Set(players.map((p) => p.id)).size !== 8) return 'Los identificadores de participantes deben ser únicos.'
  if (players.some((p) => !p.nickname.trim() || p.nickname.trim().length > 32)) return 'Cada alias debe tener entre 1 y 32 caracteres.'
  if (new Set(players.map((p) => p.nickname.trim().toLocaleLowerCase())).size !== 8) return 'Usa un alias diferente para cada participante.'
  if (players.some((p) => p.characterIds.length !== 1 || !getCharacter(p.characterIds[0]))) return 'Selecciona un personaje del catálogo para cada participante.'
}

export function shuffleSeeds(players: Participant[], random = Math.random): string[] {
  const error = rosterError(players)
  if (error) throw new Error(error)
  const seeds = players.map((p) => p.id)
  for (let i = seeds.length - 1; i > 0; i--) {
    const draw = random()
    if (draw < 0 || draw >= 1 || !Number.isFinite(draw)) throw new Error('Fuente de sorteo inválida.')
    const j = Math.floor(draw * (i + 1))
    ;[seeds[i], seeds[j]] = [seeds[j], seeds[i]]
  }
  return seeds
}

export function resolveBracket(tournament: Tournament): ResolvedMatch[] {
  const resolved = new Map<MatchId, ResolvedMatch>()
  const playersById = new Map(tournament.participants.map(p => [p.id, p]))
  for (const match of tournamentMatches(tournament)) {
    const gf = resolved.get('GF')
    const enabled = match.id !== 'RESET' || (!!gf?.winnerId && gf.winnerId === gf.players[1]?.id)
    const players = match.sources.map((source) => {
      if (!enabled) return undefined
      const id = 'seed' in source ? tournament.seeds[source.seed]
        : source.outcome === 'winner' ? resolved.get(source.match)?.winnerId : resolved.get(source.match)?.loserId
      return playersById.get(id ?? '')
    }) as ResolvedMatch['players']
    const result = tournament.results[match.id]
    const slot = result?.confirmed && players[0] && players[1] ? winnerSlot(result) : undefined
    const sourcesSettled = match.sources.every(source => 'seed' in source || resolved.get(source.match)?.settled)
    const automatic = enabled && sourcesSettled && !players.every(Boolean)
    const settled = enabled && (automatic || slot !== undefined)
    // Follow only this participant's incoming path; never borrow a bracket slot's identity.
    const inherited = players.map((player, slot) => {
      const source = match.sources[slot]
      const prior = 'match' in source ? resolved.get(source.match) : undefined
      const priorSlot = prior?.players.findIndex(p => p?.id === player?.id) ?? -1
      if (!player || !prior || priorSlot < 0) return { id: player?.characterIds[0] ?? '', variant: '00' }
      const last = prior.result?.details?.games.findLast(g => !g.voided && !!getCharacter(g.characterIds[priorSlot]))
      const setup = last ?? prior.result?.details?.current ?? prior.result?.prepared ?? prior.suggested
      return { id: setup?.characterIds[priorSlot] ?? player.characterIds[0] ?? '', variant: setup?.variantIds?.[priorSlot] ?? '00' }
    })
    const suggested = { characterIds: inherited.map(v => v.id) as [string, string], variantIds: inherited.map(v => v.variant) as [string, string] }
    resolved.set(match.id, {
      ...match, players, enabled, result, automatic, settled, suggested,
      winnerId: automatic ? players.find(Boolean)?.id : slot === undefined ? undefined : players[slot]?.id,
      loserId: slot === undefined ? undefined : players[slot === 0 ? 1 : 0]?.id,
    })
  }
  return [...resolved.values()]
}

export function getChampion(tournament: Tournament): Participant | undefined {
  const bracket = resolveBracket(tournament)
  const final = bracket.find((m) => m.id === 'GF')!
  const reset = bracket.find((m) => m.id === 'RESET')!
  const id = reset.enabled ? reset.winnerId : final.winnerId
  return tournament.participants.find((p) => p.id === id)
}

export function descendants(id: MatchId, tournament?: Tournament): MatchId[] {
  const affected = new Set<MatchId>([id])
  for (const match of tournament ? tournamentMatches(tournament) : MATCHES) {
    if (match.sources.some((source) => 'match' in source && affected.has(source.match))) affected.add(match.id)
  }
  affected.delete(id)
  return [...affected]
}

// Returns a proposal. The caller must confirm any reported invalidations before saving.
export function proposeResult(tournament: Tournament, id: MatchId, result: MatchResult, options: { revertDQ?: boolean } = {}) {
  if (tournament.status !== 'started') throw new Error('Inicia el torneo antes de registrar resultados.')
  const before = resolveBracket(tournament).find((m) => m.id === id)
  if (!before?.enabled || !before.players[0] || !before.players[1]) throw new Error('Faltan participantes definidos.')
  if (before.players[0].id === before.players[1].id || !validateResult(result)) throw new Error('El marcador no es válido para este formato.')
  if (before.result?.details && !result.details) throw new Error('Este set tiene historial por juego. Corrígelo desde VS para conservarlo.')
  if (before.result?.outcome && !result.outcome && !options.revertDQ) throw new Error('Revierte explícitamente el DQ antes de cambiar el resultado.')
  const next: Tournament = { ...tournament, results: { ...tournament.results, [id]: copyResult(result) } }
  const after = resolveBracket(next).find((m) => m.id === id)!
  const invalidated: MatchId[] = []
  if (before.winnerId !== after.winnerId || before.loserId !== after.loserId) {
    for (const dependent of descendants(id, tournament)) {
      if (next.results[dependent]) invalidated.push(dependent)
      delete next.results[dependent]
    }
  }
  if (tournament.schemaVersion === 2) {
    const order = (tournament.completionOrder ?? []).filter(key => next.results[key]?.confirmed)
    if (result.confirmed && !order.includes(id)) order.push(id)
    next.completionOrder = order
  }
  return { tournament: next, invalidated }
}
