import { useState } from 'react'
import {
  createCatalogStage,
  getStageCatalogEntry,
  getStageIdentity,
  stageCatalog,
} from '../../data/stageCatalog'
import type { Stage, StageType } from '../../types/ruleset'
import { Icon } from '../ui/Icon'
import { StageSelectionSummary } from './StageSelectionSummary'
import { StageThumbnailCard } from './StageThumbnailCard'

type StagePickerProps = {
  stages: Stage[]
  onChange: (stages: Stage[]) => void
}

const labels: Record<StageType, { title: string; helper: string }> = {
  starter: {
    title: 'Asignar starters',
    helper: 'Activos desde Game 1',
  },
  counterpick: {
    title: 'Asignar counterpicks',
    helper: 'Disponibles desde Game 2',
  },
}

export function StagePicker({ onChange, stages }: StagePickerProps) {
  const [activeType, setActiveType] = useState<StageType>('starter')
  const selectedById = new Map(
    stages
      .map((stage) => [getStageCatalogEntry(stage)?.id, stage] as const)
      .filter((entry): entry is [string, Stage] => Boolean(entry[0])),
  )
  const starterCount = stages.filter((stage) => stage.type === 'starter').length
  const counterpickCount = stages.filter(
    (stage) => stage.type === 'counterpick',
  ).length

  const toggleStage = (stageId: string) => {
    const currentStage = selectedById.get(stageId)

    if (currentStage && currentStage.type !== activeType) return

    const withoutStage = stages.filter(
      (stage) => getStageCatalogEntry(stage)?.id !== stageId,
    )

    onChange(
      currentStage?.type === activeType
        ? withoutStage
        : [...withoutStage, createCatalogStage(stageId, activeType)],
    )
  }

  const removeStage = (stageToRemove: Stage) => {
    const identity = getStageIdentity(stageToRemove)

    onChange(
      stages.filter(
        (stage) =>
          stage.type !== stageToRemove.type ||
          getStageIdentity(stage) !== identity,
      ),
    )
  }

  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Catálogo competitivo
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            Elige el stage pool
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Selecciona una categoría y toca cada card para asignarla o quitarla.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/8 bg-[#070a16]/65 p-1.5">
          {(['starter', 'counterpick'] as StageType[]).map((type) => (
            <button
              aria-pressed={activeType === type}
              className={`focus-ring touch-target rounded-xl px-3 py-2.5 text-left transition ${
                activeType === type
                  ? type === 'starter'
                    ? 'bg-cyan-300 text-slate-950'
                    : 'bg-violet-300 text-slate-950'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              key={type}
              onClick={() => setActiveType(type)}
              type="button"
            >
              <span className="flex items-center gap-2 text-xs font-black">
                <Icon
                  name={type === 'starter' ? 'target' : 'spark'}
                  className="h-3.5 w-3.5"
                />
                {labels[type].title}
              </span>
              <span className="mt-0.5 block text-[10px] opacity-65">
                {labels[type].helper}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/8 bg-[#070a16]/55 p-3 text-xs text-slate-400">
        <span className="font-black text-white">
          {labels[activeType].title}:
        </span>{' '}
        toca un stage para agregarlo o quitarlo. Los stages marcados como
        &ldquo;Ya asignado&rdquo; pertenecen a la otra categoría.
      </div>

      <StageSelectionSummary
        counterpickCount={counterpickCount}
        onRemove={removeStage}
        stages={stages}
        starterCount={starterCount}
      />

      <div className="mt-5 grid grid-cols-1 gap-3 min-[430px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {stageCatalog.map((catalogStage) => {
          const selectedStage = selectedById.get(catalogStage.id)
          const isAssignedToActiveType = selectedStage?.type === activeType
          const isAssignedElsewhere =
            Boolean(selectedStage) && !isAssignedToActiveType

          return (
            <StageThumbnailCard
              accent={activeType === 'starter' ? 'cyan' : 'violet'}
              compact
              key={catalogStage.id}
              onClick={
                isAssignedElsewhere
                  ? undefined
                  : () => toggleStage(catalogStage.id)
              }
              stage={{ id: catalogStage.id, name: catalogStage.name }}
              state={
                isAssignedElsewhere
                  ? 'locked'
                  : isAssignedToActiveType
                    ? 'selected'
                    : 'available'
              }
              statusLabel={
                isAssignedElsewhere
                  ? 'Ya asignado'
                  : selectedStage
                    ? selectedStage.type === 'starter'
                    ? 'Starter'
                    : 'Counterpick'
                    : undefined
              }
            />
          )
        })}
      </div>
    </section>
  )
}
