import type { SessionPhase } from '../../hooks/useBanSession'

type TurnInstructionCardProps = {
  actorName?: string
  phase: SessionPhase
  remainingBans: number
}

export function TurnInstructionCard({
  actorName,
  phase,
  remainingBans,
}: TurnInstructionCardProps) {
  const instruction = getInstruction({
    actorName,
    phase,
    remainingBans,
  })
  if (phase !== 'ban' && phase !== 'pick') return null

  return (
    <section
      aria-live="polite"
      className="glass-panel sticky top-3 z-20 rounded-2xl p-3 sm:p-4"
      role="status"
    >
      <p className={`text-lg font-black ${phase === 'ban' ? 'text-rose-200' : 'text-emerald-200'}`}>{instruction}</p>
    </section>
  )
}

function getInstruction({
  actorName,
  phase,
  remainingBans,
}: {
  actorName?: string
  phase: SessionPhase
  remainingBans: number
}) {
  if (phase === 'rps') return 'Elige quién inicia.'
  if (phase === 'ban') {
    return `${actorName} debe banear ${remainingBans} ${
      remainingBans === 1 ? 'escenario' : 'escenarios'
    }.`
  }
  if (phase === 'pick') {
    return `${actorName} · Elige un escenario.`
  }
  if (phase === 'stage-confirmed') {
    return 'Confirma el escenario.'
  }
  if (phase === 'game-result') {
    return 'Registra al ganador.'
  }
  return 'El set terminó.'
}
