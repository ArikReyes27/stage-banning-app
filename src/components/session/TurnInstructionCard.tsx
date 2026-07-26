import type { SessionPhase } from '../../hooks/useBanSession'
import { Icon } from '../ui/Icon'

type TurnInstructionCardProps = {
  actorName?: string
  banStep: number
  currentGame: number
  phase: SessionPhase
  remainingBans: number
  rpsWinnerName?: string
}

export function TurnInstructionCard({
  actorName,
  banStep,
  currentGame,
  phase,
  remainingBans,
  rpsWinnerName,
}: TurnInstructionCardProps) {
  const instruction = getInstruction({
    actorName,
    currentGame,
    phase,
    remainingBans,
  })
  const isResultPhase = phase === 'game-result' || phase === 'set-complete'
  const isPickPhase = phase === 'pick' || phase === 'stage-confirmed'

  return (
    <section
      aria-live="polite"
      className="glass-panel sticky top-3 z-20 rounded-2xl p-3 sm:p-4"
      role="status"
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
              phase === 'ban'
                ? 'border-rose-300/20 bg-rose-300/8 text-rose-300'
                : isPickPhase || isResultPhase
                  ? 'border-emerald-300/20 bg-emerald-300/8 text-emerald-300'
                  : 'border-violet-300/20 bg-violet-300/8 text-violet-300'
            }`}
          >
            <Icon
              name={
                phase === 'ban'
                  ? 'warning'
                  : isPickPhase || isResultPhase
                    ? 'check'
                    : 'spark'
              }
              className="h-4 w-4"
            />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
              {currentGame === 1
                ? rpsWinnerName
                  ? `${rpsWinnerName} ganó RPS`
                  : 'Elige ganador de RPS para comenzar'
                : `Game ${currentGame} · Counterpicks desbloqueados`}
            </p>
            <p className="mt-1 text-sm font-black text-white sm:text-base">
              {instruction}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <PhaseIndicator
            active={phase === 'rps'}
            label={currentGame === 1 ? 'RPS' : 'Start'}
          />
          <PhaseIndicator
            active={phase === 'ban'}
            label={phase === 'ban' ? `Ban ${banStep}` : 'Ban'}
          />
          <PhaseIndicator active={isPickPhase} label="Pick" />
          <PhaseIndicator active={isResultPhase} label="Result" />
        </div>
      </div>
    </section>
  )
}

function getInstruction({
  actorName,
  currentGame,
  phase,
  remainingBans,
}: {
  actorName?: string
  currentGame: number
  phase: SessionPhase
  remainingBans: number
}) {
  if (phase === 'rps') return 'Los stages están bloqueados hasta resolver el RPS.'
  if (phase === 'ban') {
    return `${actorName} debe banear ${remainingBans} ${
      remainingBans === 1 ? 'stage' : 'stages'
    }.`
  }
  if (phase === 'pick') {
    return `${actorName} debe elegir el stage de Game ${currentGame}.`
  }
  if (phase === 'stage-confirmed') {
    return `Revisa el stage elegido y confirma Game ${currentGame}.`
  }
  if (phase === 'game-result') {
    return `Juega Game ${currentGame} y reporta quién ganó.`
  }
  return 'El set terminó.'
}

function PhaseIndicator({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`rounded-xl border px-2 py-2 text-center text-[8px] font-black uppercase tracking-wider sm:px-3 sm:text-[9px] ${
        active
          ? 'border-cyan-300/25 bg-cyan-300/10 text-cyan-200'
          : 'border-white/8 bg-white/3 text-slate-600'
      }`}
    >
      {label}
    </span>
  )
}
