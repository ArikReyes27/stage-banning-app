import type { Tournament } from '../../types/tournament'
import { activeMatches } from '../../utils/matchSession'
import { navigateTo } from '../../app/navigation'

export function ActiveMatchLink({ tournament }: { tournament: Tournament }) {
  const matches = activeMatches(tournament)
  if (!matches.length) return null
  if (matches.length === 1) return <button className="bracket-button" type="button" onClick={() => navigateTo(`/tournament/match/${matches[0].id}`)}>
    Continuar encuentro · {matches[0].id}</button>
  return <details className="active-match-menu">
    <summary className="bracket-button cursor-pointer">Ir al match activo · {matches.length} encuentros</summary>
    <div className="active-match-options">{matches.map(match => <button key={match.id} type="button" className="bracket-button"
      onClick={() => navigateTo(`/tournament/match/${match.id}`)}>
      {match.id} · {match.players.map(p => p?.nickname).join(' vs ')}
    </button>)}</div>
  </details>
}
