import { useState } from 'react'
import type { ResolvedMatch } from '../../types/tournament'
import { getCharacter } from '../../data/characters'
import { variantAsset } from '../../data/characterVariants'
import { getStageCatalogEntry } from '../../data/stageCatalog'
import { displayGame, gameNumber, matchState, readMatchResult } from '../../utils/matchSession'
import { VictoryIcons } from './VictoryIcons'

function Portrait({ characterId, variant }: { characterId: string; variant?: string }) {
  const [failed, setFailed] = useState(false)
  const asset = variantAsset(characterId, failed ? '00' : variant)
  const name = getCharacter(characterId)?.name ?? 'Personaje por definir'
  return asset ? <img className="vs-portrait" src={asset} alt={name} onError={() => setFailed(true)} /> :
    <svg className="vs-portrait vs-placeholder" viewBox="0 0 200 200" role="img" aria-label={`${name}: imagen no disponible`}>
      <circle cx="100" cy="60" r="35" fill="currentColor" /><path d="M25 195v-25a75 75 0 0 1 150 0v25Z" fill="currentColor" />
    </svg>
}

function StageBackground({ image }: { image?: string }) {
  const [failed, setFailed] = useState(false)
  return image && !failed ? <img className="vs-stage" src={image} alt="" onError={() => setFailed(true)} /> : null
}

export function VersusPresentation({ match, onVictoryIcon }: { match: ResolvedMatch; onVictoryIcon?: (slot: 0 | 1, index: number) => void }) {
  const result = readMatchResult(match)
  const setup = displayGame(match)
  const stage = setup.stage ? getStageCatalogEntry(setup.stage) : undefined
  return <section className="vs-composition" aria-label={`VS ${match.id}: ${match.players.map(p => p?.nickname ?? 'Por definir').join(' contra ')}`}>
    <StageBackground key={stage?.image ?? 'gradient'} image={stage?.image} />
    <div className="vs-shade" />
    <header className="vs-meta"><span>STAGE<span className="text-cyan-200">//</span>STRIKE</span>
      <span>{match.round} · {match.id}</span><span>{result.format} · {result.outcome ? 'Resultado por DQ' : `Juego ${gameNumber(result)}`}</span></header>
    {([0, 1] as const).map(slot => {
      const characterId = setup.characterIds[slot]
      const player = match.players[slot]
      return <div key={slot} className={`vs-player vs-player-${slot}`}>
        <div className="vs-art"><Portrait key={characterId + setup.variantIds?.[slot]} characterId={characterId} variant={setup.variantIds?.[slot]} /></div>
        <div className="vs-player-label"><p className="vs-player-number">PLAYER {slot + 1}</p>
          <h1 title={player?.nickname}>{player?.nickname ?? 'Por definir'}</h1>
          <p className="vs-character-name">{getCharacter(characterId)?.name ?? 'Sin personaje'}</p>
          {result.outcome && <span className="vs-dq-badge">{result.outcome.loser === slot ? 'L / DQ' : 'W · Ganador por DQ'}</span>}
          <VictoryIcons match={match} slot={slot} onClick={onVictoryIcon}/>
        </div>
      </div>
    })}
    <div className="vs-center" aria-hidden="true"><span>VS</span><i /></div>
    <footer className="vs-bottom"><span>{setup.stage?.name ?? 'Escenario por definir'}</span>
      <span>{matchState(match).label}</span>
    </footer>
  </section>
}
