import type { ResolvedMatch } from '../../types/tournament'
import { getCharacter } from '../../data/characters'
import { CharacterIcon } from './CharacterIcon'
import { displayGame, matchState } from '../../utils/matchSession'

export function MatchCard({ match, onEdit }: { match: ResolvedMatch; onEdit?: () => void }) {
  const ready = !!match.players[0] && !!match.players[1]
  const state = matchState(match)
  const content = <>
    <div className="match-card-heading"><span>{match.id}</span>
      <span className={`match-state ${state.key}`}>{match.automatic ? '' : `${match.result?.format ?? 'BO3'} · `}{state.label}</span>
    </div>
    {match.players.map((player, slot) => {
      const source = match.sources[slot]
      const placeholder = match.automatic ? 'BYE' : 'seed' in source ? `Posición ${source.seed + 1}` : `${source.outcome === 'winner' ? 'Ganador' : 'Perdedor'} ${source.match}`
      const outcome = !match.automatic && match.winnerId && player ? (match.winnerId === player.id ? 'win' : 'loss') : ''
      const characterId = displayGame(match).characterIds[slot]
      const character = getCharacter(characterId ?? '')
      return <div key={slot} className={`match-player ${outcome}`}>
        <CharacterIcon characterId={characterId} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold" title={player?.nickname}>{player?.nickname ?? placeholder}</p>
          <p className="truncate text-[10px] opacity-60">{character?.name ?? placeholder}</p>
        </div>
        {outcome && <span className="text-[10px] font-black" aria-label={outcome === 'win' ? 'Ganador' : match.result?.outcome?.loser === slot ? 'Perdedor por DQ' : 'Perdedor'}>{outcome === 'win' ? 'W' : match.result?.outcome?.loser === slot ? 'L/DQ' : 'L'}</span>}
        <span className="w-5 text-center text-lg font-black tabular-nums" title={match.result?.outcome ? 'Victorias reales antes del DQ' : undefined}>{player && !match.automatic ? match.result?.scores[slot] ?? 0 : '–'}</span>
      </div>
    })}
  </>
  const label = `${match.round}, ${match.id}: ${match.players.map((p) => p?.nickname ?? 'Por definir').join(' contra ')}`
  return onEdit && ready ? (
    <button className="match-card editable focus-ring" type="button" aria-label={`Editar ${label}`} onClick={onEdit}>{content}</button>
  ) : <div className="match-card" aria-label={label}>{content}</div>
}
