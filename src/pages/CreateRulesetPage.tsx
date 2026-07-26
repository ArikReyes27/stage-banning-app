import { navigateTo } from '../app/navigation'
import { RulesetForm } from '../components/rulesets/RulesetForm'
import { Icon } from '../components/ui/Icon'
import { useRulesets } from '../hooks/useRulesets'

export function CreateRulesetPage() {
  const { addRuleset } = useRulesets()

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <button
        className="focus-ring flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
        onClick={() => navigateTo('/')}
        type="button"
      >
        <Icon name="back" className="h-4 w-4" />
        Volver a rulesets
      </button>

      <header className="mb-7 mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
          Ruleset custom
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
          Diseña tu stage pool
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          Define stages y reglas para que tu comunidad tenga un flujo claro en
          cada set.
        </p>
      </header>

      <RulesetForm
        mode="create"
        onCancel={() => navigateTo('/')}
        onSubmit={(input) => {
          const ruleset = addRuleset(input)
          navigateTo(`/rulesets/${ruleset.id}`)
        }}
      />
    </main>
  )
}
