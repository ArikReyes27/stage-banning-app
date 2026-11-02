import type { ResolvedMatch } from '../../types/tournament'
import { getCharacter } from '../../data/characters'
import { matchState, readMatchResult } from '../../utils/matchSession'

export function MatchHistory({ match, onCorrect }: { match: ResolvedMatch; onCorrect?: (index: number) => void }) {
  const result = readMatchResult(match)
  const legacy = result.details?.legacyScores ?? result.scores
  let number = legacy[0] + legacy[1]
  return <section aria-label="Historial de juegos">
    <h3 className="mt-5 text-lg font-black">Historial del set</h3>
    <p className="mt-1 text-sm text-slate-400">Estado: {matchState(match).label}</p>
    {legacy.some(n => n > 0) && <p className="my-3 text-sm text-amber-100">Marcador anterior: {legacy.join(' – ')}. Personajes, escenarios y orden de esos juegos no registrados.</p>}
    {!result.details?.games.length && <p className="my-3 text-sm text-slate-400">Todavía no hay juegos con detalle registrado.</p>}
    {result.details?.games.map((game, index) => {
      if (!game.voided) number++
      return <article key={index} className={`match-history-game ${game.voided ? 'retired' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold">{game.voided ? `Registro ${index + 1} · Victoria retirada` : `Juego ${number}`}</h4>
          {onCorrect && !game.voided && <button type="button" className="bracket-button" onClick={() => onCorrect(index)}>Corregir juego {number}</button>}</div>
        <p className="mt-2 text-sm">{game.stage?.name ?? 'Escenario no registrado'}</p>
        {match.players.map((player, slot) => <p className="text-sm text-slate-300" key={slot}>
          {player?.nickname ?? 'Por definir'} — {getCharacter(game.characterIds[slot])?.name ?? 'Personaje no registrado'}</p>)}
        <p className="mt-2 text-sm">{game.voided ? 'Ganador registrado (no suma): ' : 'Ganador: '}<strong>{match.players[game.winner]?.nickname ?? 'No registrado'}</strong></p>
      </article>
    })}
  </section>
}
