import type { MatchDefinition, MatchId, MatchSource } from '../types/tournament.ts'

export function bracketSize(count: number) {
  if (!Number.isSafeInteger(count) || count < 2) throw new Error('Selecciona al menos dos participantes.')
  return 2 ** Math.ceil(Math.log2(count))
}
export function generateStructure(count: number): MatchDefinition[] {
  const size = bracketSize(count), rounds = Math.log2(size)
  const matches: MatchDefinition[] = [], winners: MatchId[][] = []
  let w = 0, l = 0, column = 0
  const winner = (match: MatchId): MatchSource => ({ match, outcome: 'winner' })
  const loser = (match: MatchId): MatchSource => ({ match, outcome: 'loser' })
  for (let r = 0; r < rounds; r++) {
    const row: MatchId[] = []
    for (let j = 0; j < size / 2 ** (r + 1); j++) {
      const id: MatchId = `W${++w}`; row.push(id)
      matches.push({ id, section: 'winners', column: r,
        round: r === rounds - 1 ? 'Winners Final' : r === rounds - 2 ? 'Winners Semifinals' : `Winners Round ${r + 1}`,
        sources: r === 0 ? [{ seed: j * 2 }, { seed: j * 2 + 1 }] : [winner(winners[r - 1][j * 2]), winner(winners[r - 1][j * 2 + 1])] })
    }
    winners.push(row)
  }
  let lower: MatchId[] = []
  const addLower = (sources: [MatchSource, MatchSource], final = false): MatchId => {
    const id: MatchId = `L${++l}`
    matches.push({ id, section: 'losers', column, round: final ? 'Losers Final' : `Losers Round ${column + 1}`, sources })
    return id
  }
  if (size > 2) {
    for (let j = 0; j < winners[0].length; j += 2) lower.push(addLower([loser(winners[0][j]), loser(winners[0][j + 1])]))
    column++
    for (let r = 1; r < rounds; r++) {
      lower = lower.map((id, j) => addLower([winner(id), loser(winners[r][lower.length > 1 ? j ^ 1 : j])], r === rounds - 1))
      column++
      if (r < rounds - 1) {
        const next: MatchId[] = []
        for (let j = 0; j < lower.length; j += 2) next.push(addLower([winner(lower[j]), winner(lower[j + 1])]))
        lower = next; column++
      }
    }
  }
  const finalW = winners[rounds - 1][0]
  matches.push({ id: 'GF', section: 'finals', column: 0, round: 'Grand Final', sources: [winner(finalW), size === 2 ? loser(finalW) : winner(lower[0])] })
  matches.push({ id: 'RESET', section: 'finals', column: 1, round: 'Grand Final Reset', sources: [loser('GF'), winner('GF')] })
  return matches
}

// Standard folded seed order: 1/2 opposite halves, 1..4 separate quarters.
export function seedOrder(size: number): number[] {
  let order = [1, 2]
  for (let n = 4; n <= size; n *= 2) order = order.flatMap(seed => [seed, n + 1 - seed])
  return order
}
