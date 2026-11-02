import type { MatchId, MatchResult, Tournament } from '../types/tournament.ts'
import { proposeResult } from './doubleElimination.ts'
import { copyResult, winnerSlot } from './tournamentResults.ts'

// Compare the final draft against the authoritative bracket, not its temporary
// unconfirmed steps. This preserves still-valid downstream results.
export function proposeQuickCommit(tournament: Tournament, id: MatchId, draft: MatchResult, confirm: boolean) {
  const original = tournament.results[id]
  const result = copyResult(draft)
  const winner = winnerSlot(result)
  result.confirmed = confirm || (!!original?.confirmed && !original.outcome && winner !== undefined && winner === winnerSlot(original))
  return proposeResult(tournament, id, result)
}
