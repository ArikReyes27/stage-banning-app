import type { GameSetup, MatchFormat, MatchGame, MatchId, MatchResult, ResolvedMatch, Tournament } from '../types/tournament.ts'
import { proposeResult, resolveBracket } from './doubleElimination.ts'
import { copyResult, detailScores, targetWins, winnerSlot } from './tournamentResults.ts'

export type MatchAction =
  | { type: 'select'; setup: GameSetup }
  | { type: 'start'; now?: string }
  | { type: 'pause' }
  | { type: 'setup'; setup: GameSetup }
  | { type: 'ruleset'; id: string }
  | { type: 'format'; format: MatchFormat }
  | { type: 'win'; winner: 0 | 1 }
  | { type: 'correct'; index: number; game: MatchGame }
  | { type: 'undo' }
  | { type: 'legacy'; scores: [number, number] }
  | { type: 'confirm' }
  | { type: 'icon'; slot: 0 | 1; index: number }
  | { type: 'dq'; loser: 0 | 1; reason?: string; now?: string }
  | { type: 'revert-dq' }

// Pure read: opening/reopening a view never writes, starts a game or migrates storage.
export function readMatchResult(match: ResolvedMatch): MatchResult {
  return match.result ?? { format: 'BO3', scores: [0, 0], confirmed: false }
}

export function currentSetup(match: ResolvedMatch): GameSetup {
  return match.result?.details?.current ?? match.result?.prepared ?? match.suggested ?? { characterIds: [match.players[0]?.characterIds[0] ?? '', match.players[1]?.characterIds[0] ?? ''] }
}

export function displayGame(match: ResolvedMatch): GameSetup {
  const result = readMatchResult(match)
  const games = result.details?.games.filter(g => !g.voided) ?? []
  return !result.outcome && winnerSlot(result) !== undefined && games.length
    ? games[games.length - 1] : currentSetup(match)
}

export function gameNumber(result: MatchResult): number {
  return Math.min(result.scores[0] + result.scores[1] + (winnerSlot(result) === undefined ? 1 : 0), targetWins(result.format) * 2 - 1)
}

export function victoryIcons(match: ResolvedMatch, slot: 0 | 1) {
  const result = readMatchResult(match)
  const current = displayGame(match).characterIds[slot]
  const legacy = result.details?.legacyScores[slot] ?? result.scores[slot]
  const historical = result.details?.games.filter(game => !game.voided && game.winner === slot).map(game => game.characterIds[slot]) ?? []
  return Array.from({ length: targetWins(result.format) }, (_, i) => ({
    won: i < result.scores[slot],
    characterId: i < legacy ? match.players[slot]?.characterIds[0] : historical[i - legacy] ?? current,
    legacy: i < legacy,
  }))
}

export function proposeMatchAction(tournament: Tournament, id: MatchId, action: MatchAction) {
  const match = resolveBracket(tournament).find(m => m.id === id)
  if (!match?.enabled || !match.players.every(Boolean)) throw new Error('Este encuentro aún no tiene dos participantes.')
  const result = copyResult(readMatchResult(match))
  if (action.type === 'revert-dq') {
    if (!result.outcome) throw new Error('Este encuentro no tiene un DQ.')
    delete result.outcome
    result.confirmed = false
    return proposeResult(tournament, id, result, { revertDQ: true })
  }
  if (result.outcome) throw new Error('Revierte el DQ antes de editar el encuentro.')
  if (action.type === 'select') {
    if (winnerSlot(result) !== undefined) throw new Error('Corrige el personaje desde el historial del VS.')
    if (result.details) {
      result.details.current = structuredClone(action.setup)
      delete result.prepared
    } else result.prepared = structuredClone(action.setup)
    return proposeResult(tournament, id, result)
  }
  if (action.type === 'dq') {
    result.outcome = { type: 'dq', loser: action.loser, recordedAt: action.now ?? new Date().toISOString(),
      ...(action.reason?.trim() ? { reason: action.reason.trim() } : {}) }
    result.confirmed = true
    return proposeResult(tournament, id, result)
  }
  result.details ??= { legacyScores: [...result.scores], games: [], current: currentSetup(match), status: 'ready' }
  delete result.prepared
  const d = result.details
  const recordWin = (winner: 0 | 1) => {
    if (winnerSlot(result) !== undefined) throw new Error('Existe un ganador provisional. Confirma o corrige el marcador.')
    d.games.push({ ...d.current, characterIds: [...d.current.characterIds], winner })
    d.current = { characterIds: [...d.current.characterIds], ...(d.current.variantIds ? { variantIds: [...d.current.variantIds] } : {}) }
    d.status = 'in-progress'; d.startedAt ??= new Date().toISOString(); result.confirmed = false
  }
  switch (action.type) {
    case 'start':
      if (winnerSlot(result) !== undefined) throw new Error('El set ya alcanzó su resultado final. Abre Mostrar VS para consultarlo.')
      d.status = 'in-progress'; d.startedAt ??= action.now ?? new Date().toISOString(); break
    case 'pause': d.status = 'paused'; break
    case 'setup':
      if (winnerSlot(result) !== undefined) throw new Error('Corrige los personajes o el escenario del juego desde el historial.')
      d.current = action.setup; break
    case 'ruleset': d.rulesetId = action.id; break
    case 'format':
      if (result.format !== action.format) result.confirmed = false
      result.format = action.format; break
    case 'win':
      recordWin(action.winner); break
    case 'icon': {
      if ((action.slot !== 0 && action.slot !== 1) || !Number.isInteger(action.index) || action.index < 0 || action.index >= targetWins(result.format)) throw new Error('Icono de victoria inválido.')
      if (action.index >= result.scores[action.slot]) recordWin(action.slot)
      else {
        // Retain only wins before the clicked slot. Keep retired records for consultation.
        const keep = Math.max(0, action.index - d.legacyScores[action.slot])
        let seen = 0
        d.games = d.games.map(game => !game.voided && game.winner === action.slot && seen++ >= keep ? { ...game, voided: true } : game)
        d.legacyScores[action.slot] = Math.min(d.legacyScores[action.slot], action.index)
        result.confirmed = false; d.status = 'in-progress'
      }
      break
    }
    case 'correct':
      if (!Number.isInteger(action.index) || !d.games[action.index] || d.games[action.index].voided || action.game.voided) throw new Error('Juego inexistente o retirado.')
      if (d.games[action.index].winner !== action.game.winner) result.confirmed = false
      d.games[action.index] = action.game; break
    case 'undo':
      { const game = d.games.findLast(g => !g.voided)
        if (!game) throw new Error('No hay juegos detallados para deshacer.')
        game.voided = true; d.current = { ...(game.variantIds ? { variantIds: [...game.variantIds] } : {}), characterIds: [...game.characterIds], ...(game.stage ? { stage: { ...game.stage } } : {}) } }
      result.confirmed = false; d.status = 'in-progress'; break
    case 'legacy': d.legacyScores = [...action.scores]; result.confirmed = false; break
    case 'confirm': result.confirmed = true; break
  }
  result.scores = detailScores(d)
  // The established engine validates terminal scores and handles dependent invalidations.
  return proposeResult(tournament, id, result)
}

export function matchState(match: ResolvedMatch) {
  if (match.automatic) return { key: 'bye', label: match.winnerId ? 'Pase automático · BYE' : 'Sin encuentro · BYE' }
  if (!match.enabled || !match.players.every(Boolean)) return { key: 'pending', label: 'Pendiente' }
  if (match.result?.outcome) return { key: 'dq', label: 'Finalizado por DQ' }
  if (match.winnerId) return { key: 'finished', label: 'Finalizado' }
  if (match.result && winnerSlot(match.result) !== undefined) return { key: 'provisional', label: 'Ganador provisional' }
  if (match.result?.details?.status === 'paused') return { key: 'paused', label: 'En pausa' }
  if (match.result?.details?.status === 'in-progress' || match.result?.scores.some(n => n > 0)) return { key: 'live', label: 'En curso' }
  return { key: 'ready', label: 'Listo' }
}

export function activeMatches(tournament: Tournament) {
  return resolveBracket(tournament).filter(m => ['live', 'paused', 'provisional'].includes(matchState(m).key))
}

export function matchActionWarnings(match: ResolvedMatch, action: MatchAction, proposal: ReturnType<typeof proposeMatchAction>): string[] {
  const warnings: string[] = []
  if (action.type === 'confirm') warnings.push('¿Confirmar el resultado final y avanzar a los jugadores en el bracket?')
  if (action.type === 'dq') warnings.push(`¿Descalificar a ${match.players[action.loser]?.nickname}? ${match.players[action.loser === 0 ? 1 : 0]?.nickname} ganará el set por DQ. Se conservarán los juegos previos, sin añadir victorias ficticias.${action.reason?.trim() ? `\nMotivo: ${action.reason.trim()}` : ''}`)
  if (action.type === 'revert-dq') warnings.push('¿Revertir el DQ? Se conservará el marcador real anterior, sin confirmar ganador. No se restauran resultados dependientes automáticamente.')
  if (action.type === 'undo') warnings.push('¿Retirar la última victoria registrada? El juego se conservará como retirado y se recuperará su configuración.')
  if (action.type === 'legacy') warnings.push('¿Corregir el marcador histórico anterior?')
  if (action.type === 'icon' && action.index < (match.result?.scores[action.slot] ?? 0)) warnings.push(`¿Reducir las victorias de ${match.players[action.slot]?.nickname} a ${action.index}? Se apaga el icono seleccionado y los posteriores de ese jugador. Los juegos detallados retirados permanecerán en el historial.`)
  if (match.result?.confirmed && !proposal.tournament.results[match.id]?.confirmed) warnings.push('El resultado dejará de estar confirmado hasta que vuelvas a confirmarlo.')
  if (proposal.invalidated.length) warnings.push(`Se invalidarán estos resultados e historiales dependientes: ${proposal.invalidated.join(', ')}. Los demás se conservarán.`)
  else if (action.type === 'revert-dq') warnings.push('No hay resultados posteriores guardados que invalidar.')
  return warnings
}
