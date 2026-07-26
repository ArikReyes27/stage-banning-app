import type { Stage } from '../../types/ruleset'
import { StageGrid } from '../stages/StageGrid'
import type { StageVisualState } from '../stages/StageThumbnailCard'

type SessionStageGridProps = {
  eyebrow: string
  getState: (stage: Stage) => StageVisualState
  isStageInteractive: (stage: Stage) => boolean
  onStageClick: (stage: Stage) => void
  stages: Stage[]
  title: string
  tone: 'cyan' | 'violet'
}

export function SessionStageGrid({
  eyebrow,
  getState,
  isStageInteractive,
  onStageClick,
  stages,
  title,
  tone,
}: SessionStageGridProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p
            className={`text-[9px] font-black uppercase tracking-[0.2em] ${
              tone === 'cyan' ? 'text-cyan-300' : 'text-violet-300'
            }`}
          >
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-black text-white">{title}</h2>
        </div>
        <span className="text-xs font-black text-slate-600">{stages.length}</span>
      </div>
      <StageGrid
        getState={getState}
        isStageInteractive={isStageInteractive}
        onStageClick={onStageClick}
        stages={stages}
      />
    </section>
  )
}
