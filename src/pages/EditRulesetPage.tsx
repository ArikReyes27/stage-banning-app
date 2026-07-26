import { navigateTo } from '../app/navigation'
import { RulesetForm } from '../components/rulesets/RulesetForm'
import { Icon } from '../components/ui/Icon'
import { useRulesets } from '../hooks/useRulesets'

type EditRulesetPageProps = {
  rulesetId: string
}

export function EditRulesetPage({ rulesetId }: EditRulesetPageProps) {
  const { getRulesetById, updateRuleset } = useRulesets()
  const ruleset = getRulesetById(rulesetId)

  if (!ruleset || ruleset.source !== 'custom') {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-20 text-center">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/8 text-amber-300">
            <Icon name="lock" />
          </span>
          <h1 className="mt-5 text-3xl font-black text-white">
            Edición no disponible
          </h1>
          <p className="mt-3 text-slate-500">
            {ruleset
              ? 'Los rulesets predeterminados están protegidos y no se pueden editar.'
              : 'El ruleset solicitado no existe.'}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {ruleset && (
              <button
                className="focus-ring rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950"
                onClick={() => navigateTo(`/rulesets/${ruleset.id}`)}
                type="button"
              >
                Volver al detalle
              </button>
            )}
            <button
              className="focus-ring rounded-xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-bold text-slate-300"
              onClick={() => navigateTo('/')}
              type="button"
            >
              Ir a la Home
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <button
        className="focus-ring flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
        onClick={() => navigateTo(`/rulesets/${ruleset.id}`)}
        type="button"
      >
        <Icon name="back" className="h-4 w-4" />
        Volver al detalle
      </button>

      <header className="mb-7 mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">
          Editar ruleset custom
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
          {ruleset.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Actualiza stages y reglas. El identificador del ruleset se conservará.
        </p>
      </header>

      <RulesetForm
        initialValue={ruleset}
        mode="edit"
        onCancel={() => navigateTo(`/rulesets/${ruleset.id}`)}
        onSubmit={(input) => {
          const updatedRuleset = updateRuleset(ruleset.id, input)

          if (updatedRuleset) {
            navigateTo(`/rulesets/${updatedRuleset.id}`)
          }
        }}
      />
    </main>
  )
}
