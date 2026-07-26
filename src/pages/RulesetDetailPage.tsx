import { motion } from 'framer-motion'
import { navigateTo } from '../app/navigation'
import { RulesetOverviewVisual } from '../components/rulesets/RulesetOverviewVisual'
import { RulesetStageSection } from '../components/rulesets/RulesetStageSection'
import { Icon } from '../components/ui/Icon'
import { useRulesets } from '../hooks/useRulesets'

type RulesetDetailPageProps = {
  rulesetId: string
}

export function RulesetDetailPage({ rulesetId }: RulesetDetailPageProps) {
  const { deleteRuleset, getRulesetById } = useRulesets()
  const ruleset = getRulesetById(rulesetId)

  if (!ruleset) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 py-20 text-center">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
            <Icon name="search" />
          </span>
          <h1 className="mt-5 text-3xl font-black text-white">
            Ruleset no encontrado
          </h1>
          <p className="mt-3 text-slate-500">
            Este ruleset no existe en la biblioteca actual.
          </p>
          <button
            className="focus-ring mt-7 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950"
            onClick={() => navigateTo('/')}
            type="button"
          >
            Volver a la Home
          </button>
        </div>
      </main>
    )
  }

  const starters = ruleset.stages.filter((stage) => stage.type === 'starter')
  const counterpicks = ruleset.stages.filter(
    (stage) => stage.type === 'counterpick',
  )
  const isCustom = ruleset.source === 'custom'
  const removeRuleset = () => {
    const confirmed = window.confirm(
      `¿Eliminar "${ruleset.name}"? Esta acción no se puede deshacer.`,
    )

    if (confirmed && deleteRuleset(ruleset.id)) {
      navigateTo('/')
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <button
        className="focus-ring flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
        onClick={() => navigateTo('/')}
        type="button"
      >
        <Icon name="back" className="h-4 w-4" />
        Todos los rulesets
      </button>

      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel relative mt-5 overflow-hidden rounded-[2rem] p-6 sm:p-9 lg:p-11"
        initial={{ opacity: 0, y: 14 }}
        transition={{ duration: 0.4 }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/12 blur-[90px]" />
        <div className="relative max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] ${
                isCustom
                  ? 'border-violet-300/20 bg-violet-300/8 text-violet-200'
                  : 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200'
              }`}
            >
              {isCustom ? 'Ruleset custom' : 'Ruleset predeterminado'}
            </span>
            {ruleset.featured && (
              <span className="flex items-center gap-1.5 rounded-full border border-violet-300/20 bg-violet-300/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">
                <Icon name="spark" className="h-3 w-3" />
                Destacado
              </span>
            )}
          </div>
          <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
            {ruleset.community}
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.045em] text-white sm:text-6xl">
            {ruleset.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {ruleset.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/15 transition hover:bg-cyan-200"
              onClick={() => navigateTo(`/session/setup/${ruleset.id}`)}
              type="button"
            >
              <Icon name="bolt" className="h-4 w-4" />
              Iniciar baneo
            </button>
            {isCustom && (
              <>
                <button
                  className="focus-ring flex items-center justify-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-300/8 px-5 py-3.5 text-sm font-black text-violet-200 transition hover:bg-violet-300/14"
                  onClick={() => navigateTo(`/rulesets/${ruleset.id}/edit`)}
                  type="button"
                >
                  <Icon name="edit" className="h-4 w-4" />
                  Editar ruleset
                </button>
                <button
                  className="focus-ring flex items-center justify-center gap-2 rounded-2xl border border-rose-300/15 bg-rose-300/7 px-5 py-3.5 text-sm font-black text-rose-200 transition hover:bg-rose-300/12"
                  onClick={removeRuleset}
                  type="button"
                >
                  <Icon name="trash" className="h-4 w-4" />
                  Eliminar ruleset
                </button>
              </>
            )}
          </div>
        </div>
      </motion.section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.55fr_0.65fr]">
        <section className="glass-panel rounded-[2rem] p-5 sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Stage pool
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                Escenarios disponibles
              </h2>
            </div>
            <span className="rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs font-bold text-slate-400">
              {ruleset.stages.length} total
            </span>
          </div>

          <RulesetStageSection
            stages={starters}
            subtitle="Activos durante Game 1"
            title="Starter stages"
            tone="cyan"
          />
          <RulesetStageSection
            stages={counterpicks}
            subtitle="Desbloqueados desde Game 2"
            title="Counterpicks"
            tone="violet"
          />
        </section>

        <aside className="lg:sticky lg:top-5 lg:self-start">
          <RulesetOverviewVisual ruleset={ruleset} />
        </aside>
      </div>
    </main>
  )
}
