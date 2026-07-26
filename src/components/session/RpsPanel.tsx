import type { PlayerId } from '../../hooks/useBanSession'
import { Icon } from '../ui/Icon'

type RpsPanelProps = {
  onWinnerSelect: (playerId: PlayerId) => void
  player1Name: string
  player2Name: string
}

export function RpsPanel({
  onWinnerSelect,
  player1Name,
  player2Name,
}: RpsPanelProps) {
  return (
    <section
      aria-labelledby="rps-title"
      className="glass-panel rounded-[2rem] border-violet-300/15 p-5 sm:p-7"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-300/8 text-violet-300">
          <Icon name="spark" className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">
            Paso 1
          </p>
          <h2 className="mt-1 text-xl font-black text-white" id="rps-title">
            Piedra, papel o tijera
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            ¿Quién ganó? El resultado inicia el striking.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <WinnerButton
          label={`Ganó ${player1Name}`}
          onClick={() => onWinnerSelect('player1')}
        />
        <WinnerButton
          label={`Ganó ${player2Name}`}
          onClick={() => onWinnerSelect('player2')}
        />
      </div>
    </section>
  )
}

function WinnerButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="focus-ring touch-target flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-4 text-sm font-black text-white transition hover:border-violet-300/35 hover:bg-violet-300/10 hover:text-violet-100"
      onClick={onClick}
      type="button"
    >
      <Icon name="check" className="h-4 w-4" />
      {label}
    </button>
  )
}
