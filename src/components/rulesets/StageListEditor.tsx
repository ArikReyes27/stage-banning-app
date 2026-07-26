import { useState, type FormEvent } from 'react'
import { getStageIdentity } from '../../data/stageCatalog'
import type { Stage, StageType } from '../../types/ruleset'
import { createId } from '../../utils/id'
import { Icon } from '../ui/Icon'

type StageListEditorProps = {
  allStages: Stage[]
  onChange: (stages: Stage[]) => void
  stages: Stage[]
  type: StageType
}

const labels: Record<
  StageType,
  { singular: string; title: string; helper: string }
> = {
  starter: {
    singular: 'starter',
    title: 'Starter stages',
    helper: 'Activos durante Game 1. Se requieren al menos 3.',
  },
  counterpick: {
    singular: 'counterpick',
    title: 'Counterpick stages',
    helper: 'Stages extra disponibles desde Game 2 si se desbloquean.',
  },
}

export function StageListEditor({
  allStages,
  onChange,
  stages,
  type,
}: StageListEditorProps) {
  const [stageName, setStageName] = useState('')
  const [error, setError] = useState('')
  const label = labels[type]

  const addStage = (event: FormEvent) => {
    event.preventDefault()
    const cleanName = stageName.trim()

    if (!cleanName) {
      setError('Escribe un nombre antes de agregar.')
      return
    }

    if (
      allStages.some(
        (stage) =>
          getStageIdentity(stage) ===
          getStageIdentity({ id: '', name: cleanName }),
      )
    ) {
      setError('Ese stage ya existe en el ruleset.')
      return
    }

    onChange([
      ...stages,
      { id: createId('stage'), name: cleanName, type },
    ])
    setStageName('')
    setError('')
  }

  const removeStage = (stageId: string) => {
    onChange(stages.filter((stage) => stage.id !== stageId))
    setError('')
  }

  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">{label.title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{label.helper}</p>
        </div>
        <span className="rounded-xl border border-cyan-300/15 bg-cyan-300/8 px-3 py-2 text-xs font-black text-cyan-200">
          {stages.length}
        </span>
      </div>

      <form className="mt-5 flex gap-2" onSubmit={addStage}>
        <input
          className="focus-ring min-w-0 flex-1 rounded-xl border border-white/10 bg-[#070a16]/75 px-4 py-3 text-sm font-medium text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
          onChange={(event) => {
            setStageName(event.target.value)
            setError('')
          }}
          placeholder={`Nombre del ${label.singular}`}
          type="text"
          value={stageName}
        />
        <button
          className="focus-ring grid w-12 shrink-0 place-items-center rounded-xl bg-cyan-300 text-slate-950 transition hover:bg-cyan-200"
          aria-label={`Agregar ${label.singular}`}
          type="submit"
        >
          <Icon name="plus" className="h-4 w-4" />
        </button>
      </form>
      {error && <p className="mt-2 text-xs font-semibold text-rose-300">{error}</p>}

      {stages.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {stages.map((stage) => (
            <div
              className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5"
              key={stage.id}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cyan-300/8 text-cyan-300">
                <Icon
                  name={type === 'starter' ? 'target' : 'spark'}
                  className="h-3.5 w-3.5"
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-300">
                {stage.name}
              </span>
              <button
                aria-label={`Eliminar ${stage.name}`}
                className="focus-ring rounded-lg p-2 text-slate-600 transition hover:bg-rose-300/8 hover:text-rose-300"
                onClick={() => removeStage(stage.id)}
                type="button"
              >
                <Icon name="trash" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-600">
          Aún no agregas {label.title.toLowerCase()}.
        </p>
      )}
    </section>
  )
}
