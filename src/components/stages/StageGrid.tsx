import type { Stage } from '../../types/ruleset'
import {
  StageThumbnailCard,
  type StageVisualState,
} from './StageThumbnailCard'

type StageGridProps = {
  stages: Stage[]
  getState?: (stage: Stage) => StageVisualState
  getStatusLabel?: (stage: Stage) => string | undefined
  isStageInteractive?: (stage: Stage) => boolean
  onStageClick?: (stage: Stage) => void
  compact?: boolean
}

export function StageGrid({
  compact = false,
  getState,
  getStatusLabel,
  isStageInteractive,
  onStageClick,
  stages,
}: StageGridProps) {
  if (stages.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-600">
        No hay stages en esta categoría.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {stages.map((stage) => (
        <StageThumbnailCard
          compact={compact}
          key={`${stage.type}-${stage.id}`}
          onClick={
            onStageClick && (!isStageInteractive || isStageInteractive(stage))
              ? () => onStageClick(stage)
              : undefined
          }
          stage={stage}
          state={getState?.(stage)}
          statusLabel={getStatusLabel?.(stage)}
        />
      ))}
    </div>
  )
}
