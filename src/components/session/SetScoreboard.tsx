import { motion } from 'framer-motion'
import type { PlayerId, SetFormat } from '../../hooks/useBanSession'
import { getFirstTo } from '../../utils/sessionFlow'

type SetScoreboardProps = {
  currentGame: number
  format: SetFormat
  player1Name: string
  player2Name: string
  score: Record<PlayerId, number>
}

export function SetScoreboard({
  currentGame,
  format,
  player1Name,
  player2Name,
  score,
}: SetScoreboardProps) {
  const targetWins = getFirstTo(format)

  return (
    <section
      aria-label={`Marcador: ${player1Name} ${score.player1}, ${player2Name} ${score.player2}`}
      aria-live="polite"
      className="glass-panel rounded-[2rem] p-5 sm:p-7"
      role="status"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Marcador del set
          </p>
          <h1 className="mt-1 text-xl font-black text-white">
            Juego {currentGame}
          </h1>
        </div>
        <div className="flex gap-2">
          <ScoreBadge label={format} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PlayerScore
          name={player1Name}
          targetWins={targetWins}
          tone="cyan"
          wins={score.player1}
        />
        <PlayerScore
          name={player2Name}
          targetWins={targetWins}
          tone="violet"
          wins={score.player2}
        />
      </div>
    </section>
  )
}

function PlayerScore({
  name,
  targetWins,
  tone,
  wins,
}: {
  name: string
  targetWins: number
  tone: 'cyan' | 'violet'
  wins: number
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#070a16]/65 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-white">{name}</p>
        <span className={`text-3xl font-black tabular-nums ${tone === 'cyan' ? 'text-cyan-200' : 'text-violet-200'}`}>{wins}</span>
      </div>
      <div className="mt-3 flex gap-2" aria-label={`${wins} games ganados`}>
        {Array.from({ length: targetWins }, (_, index) => {
          const filled = index < wins

          return (
            <motion.span
              animate={{ opacity: 1, scale: 1 }}
              className={`h-4 flex-1 skew-x-[-16deg] rounded-sm border ${
                filled
                  ? tone === 'cyan'
                    ? 'border-cyan-200 bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.45)]'
                    : 'border-violet-200 bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.45)]'
                  : 'border-white/10 bg-white/4'
              }`}
              initial={filled ? { opacity: 0.4, scale: 0.8 } : false}
              key={index}
            />
          )
        })}
      </div>
      <span className="sr-only">
        {wins} de {targetWins} victorias
      </span>
      <p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-600">
        {wins} de {targetWins} victorias
      </p>
    </div>
  )
}

function ScoreBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
      {label}
    </span>
  )
}
