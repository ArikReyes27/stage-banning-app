import type { Stage, StageType } from '../../types/ruleset'
import { Icon } from '../ui/Icon'

type StageSelectionSummaryProps = {
  counterpickCount: number
  onRemove: (stage: Stage) => void
  stages: Stage[]
  starterCount: number
}

const sectionStyles: Record<
  StageType,
  { badge: string; chip: string; empty: string; title: string }
> = {
  starter: {
    badge: 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200',
    chip: 'border-cyan-300/15 bg-cyan-300/7 text-cyan-100',
    empty: 'Selecciona al menos 3 starters.',
    title: 'Starters',
  },
  counterpick: {
    badge: 'border-violet-300/20 bg-violet-300/8 text-violet-200',
    chip: 'border-violet-300/15 bg-violet-300/7 text-violet-100',
    empty: 'No hay counterpicks seleccionados.',
    title: 'Counterpicks',
  },
}

export function StageSelectionSummary({
  counterpickCount,
  onRemove,
  stages,
  starterCount,
}: StageSelectionSummaryProps) {
  return (
    <section className="mt-5 grid gap-3 lg:grid-cols-2" aria-label="Resumen de selección">
      <SelectionGroup
        count={starterCount}
        onRemove={onRemove}
        stages={stages.filter((stage) => stage.type === 'starter')}
        type="starter"
      />
      <SelectionGroup
        count={counterpickCount}
        onRemove={onRemove}
        stages={stages.filter((stage) => stage.type === 'counterpick')}
        type="counterpick"
      />
    </section>
  )
}

function SelectionGroup({
  count,
  onRemove,
  stages,
  type,
}: {
  count: number
  onRemove: (stage: Stage) => void
  stages: Stage[]
  type: StageType
}) {
  const style = sectionStyles[type]
  const needsMoreStarters = type === 'starter' && count < 3

  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon
            name={type === 'starter' ? 'target' : 'spark'}
            className={`h-4 w-4 ${
              type === 'starter' ? 'text-cyan-300' : 'text-violet-300'
            }`}
          />
          <h3 className="text-sm font-black text-white">{style.title}</h3>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${style.badge}`}
        >
          {count}
        </span>
      </div>

      {stages.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {stages.map((stage, index) => (
            <button
              aria-label={`Quitar ${stage.name} de ${style.title}`}
              className={`focus-ring flex min-h-10 max-w-full items-center gap-2 rounded-full border py-1.5 pl-3 pr-2 text-[10px] font-black transition hover:border-rose-300/35 hover:bg-rose-300/8 hover:text-rose-100 ${style.chip}`}
              key={`${stage.type}-${stage.id}-${index}`}
              onClick={() => onRemove(stage)}
              type="button"
            >
              <span className="truncate">{stage.name}</span>
              <Icon name="trash" className="h-3 w-3 shrink-0 opacity-60" />
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-600">{style.empty}</p>
      )}

      {needsMoreStarters && stages.length > 0 && (
        <p className="mt-3 flex items-center gap-2 text-[10px] font-bold text-amber-300">
          <Icon name="warning" className="h-3.5 w-3.5" />
          Faltan {3 - count} para cumplir el mínimo.
        </p>
      )}
    </div>
  )
}
