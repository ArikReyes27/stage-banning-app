import type { ResolvedMatch } from '../../types/tournament'
import { readMatchResult, victoryIcons } from '../../utils/matchSession'
import { winnerSlot } from '../../utils/tournamentResults'
import { CharacterIcon } from './CharacterIcon'

export function VictoryIcons({ match, slot, onClick, compact = false }: {
  match: ResolvedMatch; slot: 0 | 1; onClick?: (slot: 0 | 1, index: number) => void; compact?: boolean
}) {
  const result = readMatchResult(match), player = match.players[slot]
  const terminal = winnerSlot(result) !== undefined
  return <div className={compact ? 'quick-victories' : 'vs-victories'} role="group" aria-label={`Victorias de ${player?.nickname}: ${result.scores[slot]}`}>
    {victoryIcons(match, slot).map((icon, index) => {
      const className = `${compact ? 'quick-victory' : 'vs-victory'} ${icon.won ? 'is-won' : 'is-pending'}`
      const content = <><CharacterIcon characterId={icon.characterId}/><span className={compact ? 'quick-victory-mark' : 'vs-victory-mark'} aria-hidden="true">{icon.won ? '✓' : '·'}</span></>
      return onClick && !result.outcome ? <button type="button" key={index} className={className}
        disabled={terminal && !icon.won} aria-pressed={icon.won} onClick={() => onClick(slot, index)}
        aria-label={icon.won ? `Reducir victorias de ${player?.nickname} a ${index}` : `Registrar una victoria para ${player?.nickname}`}
        title={icon.won ? `Retirar esta victoria y las siguientes: quedan ${index}` : 'Sumar una victoria'}>{content}</button>
        : <span key={index} className={className} role="img" aria-label={`${icon.won ? 'Victoria' : 'Pendiente'} ${index + 1}${icon.legacy ? ' · personaje histórico no registrado' : ''}`}>{content}</span>
    })}
  </div>
}
