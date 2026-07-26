import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { navigateTo } from '../app/navigation'
import heroGraphic from '../assets/hero.png'
import { RulesetGrid } from '../components/rulesets/RulesetGrid'
import { RulesetSearch } from '../components/rulesets/RulesetSearch'
import { Icon } from '../components/ui/Icon'
import { useRulesets } from '../hooks/useRulesets'

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export function HomePage() {
  const [search, setSearch] = useState('')
  const { customRulesets, rulesets } = useRulesets()

  const filteredRulesets = useMemo(() => {
    const query = normalizeText(search.trim())

    if (!query) return rulesets

    return rulesets.filter((ruleset) =>
      normalizeText(
        [
          ruleset.name,
          ruleset.community,
          ruleset.description,
          ...ruleset.stages.map((stage) => stage.name),
        ].join(' '),
      ).includes(query),
    )
  }, [rulesets, search])

  const totalStages = rulesets.reduce(
    (total, ruleset) => total + ruleset.stages.length,
    0,
  )

  const scrollToRulesets = () => {
    document.getElementById('rulesets')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#67e8f9]" />
            Ruleset explorer activo
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] text-white min-[430px]:text-5xl sm:text-6xl lg:text-7xl">
            Stage banning para
            <span className="text-gradient block">comunidades competitivas.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Configura rulesets, guía bans por turnos y juega sets sin confusión.
            Una herramienta mobile-first para seguir strikes, bans y counterpicks
            desde un solo dispositivo.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="focus-ring touch-target flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/15 transition hover:bg-cyan-200"
              onClick={() => navigateTo('/rulesets/new')}
              type="button"
            >
              <Icon name="plus" className="h-4 w-4" />
              Crear ruleset
            </button>
            <button
              className="focus-ring touch-target flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-5 py-3.5 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/8 hover:text-white"
              onClick={scrollToRulesets}
              type="button"
            >
              Explorar rulesets
              <Icon name="arrow-right" className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-white/8 pt-6">
            <HeroStat value={rulesets.length} label="Rulesets" />
            <HeroStat value={totalStages} label="Stages listados" />
            <HeroStat value={customRulesets.length} label="De la comunidad" />
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto hidden w-full max-w-lg lg:block"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          aria-hidden="true"
        >
          <div className="absolute inset-12 rounded-full bg-violet-500/20 blur-[90px]" />
          <div className="glass-panel relative overflow-hidden rounded-[2.25rem] p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                  Featured ruleset
                </p>
                <p className="mt-1 text-2xl font-black text-white">Shine City</p>
              </div>
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Ready
              </div>
            </div>
            <img
              className="floating-graphic mx-auto my-7 w-60 opacity-80"
              src={heroGraphic}
              alt=""
            />
            <div className="grid grid-cols-3 gap-2">
              {['RPS', 'Bans', 'Pick'].map((step, index) => (
                <div
                  className="rounded-xl border border-white/8 bg-white/3 px-3 py-3 text-center"
                  key={step}
                >
                  <span className="block text-[10px] font-black text-cyan-300">
                    0{index + 1}
                  </span>
                  <span className="mt-1 block text-xs font-bold text-slate-300">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"
        id="rulesets"
      >
        <div className="glass-panel rounded-[2rem] p-4 sm:p-6">
          <div className="flex flex-col gap-5 border-b border-white/8 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-300">
                <Icon name="grid" className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.22em]">
                  Biblioteca competitiva
                </p>
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Encuentra tu ruleset
              </h2>
            </div>

            <RulesetSearch onChange={setSearch} value={search} />
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-xs font-semibold text-slate-500">
              {filteredRulesets.length}{' '}
              {filteredRulesets.length === 1 ? 'resultado' : 'resultados'}
            </p>
            {search && (
              <button
                className="focus-ring rounded-lg px-2 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-300/8"
                onClick={() => setSearch('')}
                type="button"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>

          <RulesetGrid
            onClearSearch={() => setSearch('')}
            rulesets={filteredRulesets}
          />
        </div>
      </section>
    </main>
  )
}

function HeroStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <span className="block text-xl font-black text-white sm:text-2xl">
        {value}
      </span>
      <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600 sm:text-[10px]">
        {label}
      </span>
    </div>
  )
}
