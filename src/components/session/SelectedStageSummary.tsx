import type { Stage } from '../../types/ruleset'
import { StageThumbnailCard } from '../stages/StageThumbnailCard'
import { Icon } from '../ui/Icon'

type SelectedStageSummaryProps = {
  currentGame: number
  onConfirm: () => void
  onResetGame: () => void
  stage: Stage
}

export function SelectedStageSummary({
  currentGame,
  onConfirm,
  onResetGame,
  stage,
}: SelectedStageSummaryProps) {
  return (
    <section className="glass-panel rounded-[2rem] border-emerald-300/15 p-5 sm:p-7">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <StageThumbnailCard accent="emerald" stage={stage} state="selected" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
            Escenario elegido · Juego {currentGame}
          </p>
          <h2 className="mt-2 text-3xl font-black text-white">{stage.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Confirma el escenario del juego {currentGame}.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
              onClick={onConfirm}
              type="button"
            >
              <Icon name="check" className="h-4 w-4" />
              Confirmar escenario
            </button>
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-3.5 text-sm font-black text-slate-300 transition hover:bg-white/8 hover:text-white"
              onClick={onResetGame}
              type="button"
            >
              <Icon name="back" className="h-4 w-4" />
              Reiniciar juego
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
