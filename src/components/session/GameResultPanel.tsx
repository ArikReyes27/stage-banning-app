import type { PlayerId } from '../../hooks/useBanSession'
import type { Stage } from '../../types/ruleset'
import { StageThumbnailCard } from '../stages/StageThumbnailCard'
import { Icon } from '../ui/Icon'

type GameResultPanelProps = {
  currentGame: number
  onReportWinner: (winnerId: PlayerId) => void
  onResetGame: () => void
  player1Name: string
  player2Name: string
  stage: Stage
}

export function GameResultPanel({
  currentGame,
  onReportWinner,
  onResetGame,
  player1Name,
  player2Name,
  stage,
}: GameResultPanelProps) {
  return (
    <section className="glass-panel rounded-[2rem] border-emerald-300/15 p-5 sm:p-7">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <StageThumbnailCard accent="emerald" stage={stage} state="selected" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
            Game {currentGame} en juego
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">{stage.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Juega el game actual. Cuando termine, reporta el ganador.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <WinnerButton
              label={`Ganó ${player1Name}`}
              onClick={() => onReportWinner('player1')}
              tone="cyan"
            />
            <WinnerButton
              label={`Ganó ${player2Name}`}
              onClick={() => onReportWinner('player2')}
              tone="violet"
            />
          </div>

          <button
            className="focus-ring mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black text-slate-500 transition hover:bg-white/5 hover:text-white"
            onClick={onResetGame}
            type="button"
          >
            <Icon name="back" className="h-3.5 w-3.5" />
            Reiniciar game actual
          </button>
        </div>
      </div>
    </section>
  )
}

function WinnerButton({
  label,
  onClick,
  tone,
}: {
  label: string
  onClick: () => void
  tone: 'cyan' | 'violet'
}) {
  return (
    <button
      className={`focus-ring touch-target flex items-center justify-center gap-2 rounded-2xl border px-5 py-4 text-sm font-black transition ${
        tone === 'cyan'
          ? 'border-cyan-300/20 bg-cyan-300/8 text-cyan-100 hover:bg-cyan-300/15'
          : 'border-violet-300/20 bg-violet-300/8 text-violet-100 hover:bg-violet-300/15'
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon name="check" className="h-4 w-4" />
      {label}
    </button>
  )
}
