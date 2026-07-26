import { navigateTo } from '../../app/navigation'
import type {
  GameHistoryEntry,
  PlayerId,
  SetFormat,
} from '../../hooks/useBanSession'
import { getFormatLabel } from '../../utils/sessionFlow'
import { GameHistory } from './GameHistory'
import { SetScoreboard } from './SetScoreboard'
import { Icon } from '../ui/Icon'

type SetCompletePanelProps = {
  currentGame: number
  format: SetFormat
  history: GameHistoryEntry[]
  onResetSet: () => void
  player1Name: string
  player2Name: string
  rulesetId: string
  score: Record<PlayerId, number>
  winnerName: string
}

export function SetCompletePanel({
  currentGame,
  format,
  history,
  onResetSet,
  player1Name,
  player2Name,
  rulesetId,
  score,
  winnerName,
}: SetCompletePanelProps) {
  return (
    <section className="space-y-5">
      <div className="glass-panel relative overflow-hidden rounded-[2rem] border-emerald-300/20 p-6 text-center sm:p-10">
        <div className="pointer-events-none absolute inset-x-20 top-0 h-40 bg-emerald-400/12 blur-[70px]" />
        <div className="relative">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-300/10 text-emerald-300">
            <Icon name="spark" className="h-6 w-6" />
          </span>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-300">
            Set terminado · {getFormatLabel(format)}
          </p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-white">
            Ganó {winnerName}
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            El resultado final y todos los games quedaron registrados localmente.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
              onClick={onResetSet}
              type="button"
            >
              <Icon name="back" className="h-4 w-4" />
              Reiniciar set
            </button>
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-3.5 text-sm font-black text-slate-300 transition hover:bg-white/8 hover:text-white"
              onClick={() => navigateTo(`/rulesets/${rulesetId}`)}
              type="button"
            >
              Volver al ruleset
              <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <SetScoreboard
        currentGame={currentGame}
        format={format}
        player1Name={player1Name}
        player2Name={player2Name}
        score={score}
      />
      <GameHistory history={history} />
    </section>
  )
}
