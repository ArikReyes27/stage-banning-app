import type { MatchId, Tournament } from '../types/tournament.ts'
import { getChampion, resolveBracket } from './doubleElimination.ts'
import { getCharacter } from '../data/characters.ts'

export type Standing = {
  id: string; nickname: string; position?: number; losses: number
  setWins: number; setLosses: number
  status: 'pending' | 'active' | 'eliminated' | 'champion'
  characters: { id: string; uses: number }[]
}
const compareId = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0

// Read-only projection: never infer played games from a score, a BYE or a selected character.
export function tournamentStandings(t: Tournament) {
  const matches = resolveBracket(t), champion = getChampion(t)
  const rows = new Map<string, Standing>(t.participants.map(p => [p.id, {
    id: p.id, nickname: p.nickname, losses: 0, setWins: 0, setLosses: 0, characters: [],
    status: t.status === 'started' ? 'active' : 'pending',
  }]))
  const usage = new Map(t.participants.map(p => [p.id, new Map<string, number>()]))
  // Occupancy is structural, independent of results/confirmation order. A winner
  // exists if either source is occupied; a loser exists only with two players.
  const presence = new Map<MatchId, { winner: boolean; loser: boolean }>()
  const lowerCounts = new Map<number, number>()
  for (const m of matches) {
    const sources = m.sources.map(s => 'seed' in s ? !!t.seeds[s.seed] : !!presence.get(s.match)?.[s.outcome])
    presence.set(m.id, { winner: sources.some(Boolean), loser: sources.every(Boolean) })
    if (m.section === 'losers' && sources.every(Boolean)) lowerCounts.set(m.column, (lowerCounts.get(m.column) ?? 0) + 1)
  }
  for (const m of matches) {
    if (!m.enabled || m.automatic || !m.players.every(Boolean)) continue
    for (const game of m.result?.details?.games ?? []) {
      if (game.voided) continue
      for (const slot of [0, 1] as const) {
        const id = game.characterIds[slot], counts = usage.get(m.players[slot]!.id)!
        if (getCharacter(id)) counts.set(id, (counts.get(id) ?? 0) + 1)
      }
    }
    if (!m.result?.confirmed || !m.loserId) continue
    // DQ determines advancement/placement, but is not a played set in this record.
    if (!m.result.outcome && m.winnerId) {
      rows.get(m.winnerId)!.setWins++
      rows.get(m.loserId)!.setLosses++
    }
    const row = rows.get(m.loserId)!
    row.losses++
    if (m.section === 'losers') {
      row.position = 3 + [...lowerCounts].reduce((sum, [column, count]) => sum + (column > m.column ? count : 0), 0)
      row.status = 'eliminated'
    }
  }
  if (champion) {
    const final = matches.find(m => m.id === 'RESET' && m.enabled) ?? matches.find(m => m.id === 'GF')!
    const runnerUp = rows.get(final.loserId!)!
    runnerUp.position = 2; runnerUp.status = 'eliminated'
    rows.get(champion.id)!.position = 1; rows.get(champion.id)!.status = 'champion'
  }
  for (const row of rows.values()) row.characters = [...usage.get(row.id)!]
    .sort(([a, countA], [b, countB]) => countB - countA || compareId(a, b))
    .slice(0, 3).map(([id, uses]) => ({ id, uses }))
  const ordered = [...rows.values()].sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || compareId(a.nickname, b.nickname) || compareId(a.id, b.id))
  const alive = ordered.filter(r => r.status === 'active').length
  // Do not select an arbitrary eight from a larger set of still-active players.
  const top = t.status !== 'started' || alive > 8 ? [] : ordered.filter(r => r.position === undefined || r.position <= 8)
  return { rows: ordered, top, alive, final: !!champion, started: t.status === 'started' }
}

export function standingsCsv(t: Tournament) {
  const data = tournamentStandings(t)
  const cell = (value: string) => `"${(/^[\s]*[=+@-]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`
  const lines = [['Posición', 'Nickname', 'Estado', 'Principal', 'Secundario', 'Tercero', 'Clasificación'],
    ...data.rows.map(r => [r.position?.toString() ?? '', r.nickname,
      r.status === 'champion' ? 'Campeón' : r.status === 'eliminated' ? 'Eliminado' : r.status === 'active' ? 'En juego' : 'Sin iniciar',
      ...[0, 1, 2].map(i => getCharacter(r.characters[i]?.id ?? '')?.name ?? ''), data.final ? 'Final' : 'Provisional'])]
  return '\uFEFF' + lines.map(row => row.map(cell).join(',')).join('\r\n')
}
