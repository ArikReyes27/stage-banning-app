import type { Ruleset } from '../../types/ruleset'
import { Icon } from '../ui/Icon'
import { RulesetCard } from './RulesetCard'

type RulesetGridProps = {
  onClearSearch: () => void
  rulesets: Ruleset[]
}

export function RulesetGrid({ onClearSearch, rulesets }: RulesetGridProps) {
  if (rulesets.length === 0) {
    return (
      <div className="mt-5 grid min-h-72 place-items-center rounded-3xl border border-dashed border-white/10 bg-white/2 p-8 text-center">
        <div>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-slate-500">
            <Icon name="search" />
          </span>
          <h3 className="mt-4 text-lg font-black text-white">Sin coincidencias</h3>
          <p className="mt-2 text-sm text-slate-500">
            Prueba con otro nombre, comunidad o stage.
          </p>
          <button
            className="focus-ring touch-target mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/8 px-4 py-2.5 text-xs font-black text-cyan-200 transition hover:bg-cyan-300/15"
            onClick={onClearSearch}
            type="button"
          >
            Limpiar búsqueda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rulesets.map((ruleset, index) => (
        <RulesetCard index={index} key={ruleset.id} ruleset={ruleset} />
      ))}
    </div>
  )
}
