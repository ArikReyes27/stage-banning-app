import type { GameHistoryEntry } from '../../hooks/useBanSession'
import { Icon } from '../ui/Icon'

type GameHistoryProps = {
  history: GameHistoryEntry[]
}

export function GameHistory({ history }: GameHistoryProps) {
  if (history.length === 0) return null

  return (
    <section
      aria-label="Historial de games"
      className="glass-panel rounded-[2rem] p-5 sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">
            Historial local
          </p>
          <h2 className="mt-1 text-lg font-black text-white">
            Games registrados
          </h2>
        </div>
        <span className="rounded-full border border-violet-300/20 bg-violet-300/8 px-3 py-1.5 text-[10px] font-black text-violet-200">
          {history.length}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {history.map((game) => (
          <div
            className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-3"
            key={game.gameNumber}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-300/8 text-cyan-300">
              <Icon name="check" className="h-3.5 w-3.5" />
            </span>
            <p className="min-w-0 flex-1 text-xs font-bold text-slate-400">
              <span className="text-white">Game {game.gameNumber}</span>
              <span className="mx-2 text-slate-700">·</span>
              {game.selectedStageName}
              <span className="mx-2 text-slate-700">·</span>
              Ganó <span className="text-violet-200">{game.winnerName}</span>
            </p>
            <span className="shrink-0 text-[9px] font-black uppercase tracking-wider text-slate-600">
              {game.bannedStageIds.length} bans
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
