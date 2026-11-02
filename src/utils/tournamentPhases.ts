import type { MatchId, Tournament } from '../types/tournament.ts'
import { resolveBracket } from './doubleElimination.ts'

export type TournamentPhase = { size: number; reached: boolean; completedBefore: MatchId[]; players: { id: string; losses: number; side: 'Winners' | 'Losers' }[] }
export function tournamentProgress(t: Tournament) {
  const resolved = resolveBracket(t), byId = new Map(resolved.map(m => [m.id, m]))
  const losses = new Map(t.participants.map(p => [p.id, 0])), completed: MatchId[] = []
  const phases: TournamentPhase[] = [128, 64, 32, 16, 8].filter(n => n <= t.participants.length).map(size => ({ size, reached: false, completedBefore: [], players: [] }))
  let alive = t.participants.length
  const capture = () => {
    for (const phase of phases) if (!phase.reached && alive === phase.size) {
      phase.reached = true; phase.completedBefore = [...completed]
      phase.players = [...losses].filter(([, n]) => n < 2).map(([id, n]) => ({ id, losses: n, side: n === 0 ? 'Winners' : 'Losers' }))
    }
  }
  capture()
  const order = t.schemaVersion === 2 ? t.completionOrder ?? [] : resolved.filter(m => m.result?.confirmed).map(m => m.id)
  for (const id of order) {
    const match = byId.get(id)
    if (!match?.result?.confirmed || !match.loserId || match.automatic) continue
    const previous = losses.get(match.loserId) ?? 0
    losses.set(match.loserId, previous + 1)
    if (previous === 1) alive--
    completed.push(id); capture()
  }
  return { phases, alive, losses }
}

export function phaseMatches(t: Tournament, phase: TournamentPhase) {
  if (!phase.reached) return []
  const excluded = new Set(phase.completedBefore)
  return resolveBracket(t).filter(m => m.enabled && !excluded.has(m.id) && !m.automatic)
}
