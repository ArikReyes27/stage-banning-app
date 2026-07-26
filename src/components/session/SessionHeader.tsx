import type {
  SessionPhase,
  SetFormat,
} from '../../hooks/useBanSession'
import { getFirstTo, getFormatLabel } from '../../utils/sessionFlow'
import { Icon } from '../ui/Icon'

type SessionHeaderProps = {
  currentActorName?: string
  currentGame: number
  format: SetFormat
  phase: SessionPhase
  player1Name: string
  player2Name: string
  rpsWinnerName?: string
  rulesetName: string
}

const phaseLabels: Record<SessionPhase, string> = {
  rps: 'Esperando RPS',
  ban: 'Striking',
  pick: 'Elegir stage',
  'stage-confirmed': 'Confirmar stage',
  'game-result': 'Reportar ganador',
  'set-complete': 'Set terminado',
}

export function SessionHeader({
  currentActorName,
  currentGame,
  format,
  phase,
  player1Name,
  player2Name,
  rpsWinnerName,
  rulesetName,
}: SessionHeaderProps) {
  const turnLabel =
    phase === 'rps'
      ? 'Elige ganador de RPS'
      : phase === 'stage-confirmed'
        ? `Confirmar Game ${currentGame}`
        : phase === 'game-result'
          ? 'Reportar ganador'
          : phase === 'set-complete'
            ? 'Set terminado'
            : currentActorName

  return (
    <section className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-7">
      <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-violet-500/14 blur-[70px]" />
      <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">
            Sesión guiada · Game {currentGame}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {rulesetName}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge label={getFormatLabel(format)} />
            <StatusBadge label={`First to ${getFirstTo(format)}`} />
            <StatusBadge label={phaseLabels[phase]} tone="violet" />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[30rem]">
          <PlayerCard label="Jugador 1" name={player1Name} />
          <PlayerCard label="Jugador 2" name={player2Name} />
          <StatusLine
            icon="spark"
            label={currentGame === 1 ? 'RPS' : 'Flujo'}
            value={
              currentGame === 1
                ? rpsWinnerName
                  ? `Ganó ${rpsWinnerName}`
                  : 'Sin resolver'
                : 'Counterpick activo'
            }
          />
          <StatusLine
            icon="target"
            label="Turno"
            value={turnLabel ?? 'Sin turno activo'}
          />
        </div>
      </div>
    </section>
  )
}

function StatusBadge({
  label,
  tone = 'cyan',
}: {
  label: string
  tone?: 'cyan' | 'violet'
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
        tone === 'cyan'
          ? 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200'
          : 'border-violet-300/20 bg-violet-300/8 text-violet-200'
      }`}
    >
      {label}
    </span>
  )
}

function PlayerCard({ label, name }: { label: string; name: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#070a16]/65 px-4 py-3">
      <span className="block text-[9px] font-black uppercase tracking-wider text-slate-600">
        {label}
      </span>
      <span className="mt-1 block truncate text-sm font-black text-white">
        {name}
      </span>
    </div>
  )
}

function StatusLine({
  icon,
  label,
  value,
}: {
  icon: 'spark' | 'target'
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
      <Icon name={icon} className="h-4 w-4 shrink-0 text-cyan-300" />
      <div className="min-w-0">
        <span className="block text-[9px] font-black uppercase tracking-wider text-slate-600">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-xs font-black text-slate-300">
          {value}
        </span>
      </div>
    </div>
  )
}
