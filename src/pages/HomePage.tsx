import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../app/navigation'
import { StageHeroBackground } from '../components/layout/StageHeroBackground'
import '../styles/home.css'
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
  const { rulesets } = useRulesets()

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

  useEffect(() => {
    const revealRulesets = () => {
      if (window.location.hash !== '#rulesets') return
      const section = document.getElementById('rulesets')
      section?.focus({ preventScroll: true })
      section?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }
    revealRulesets()
    window.addEventListener('popstate', revealRulesets)
    return () => window.removeEventListener('popstate', revealRulesets)
  }, [])

  return (
    <main>
      <section className="home-hero" aria-label="Centro de torneos">
        <StageHeroBackground />
        <div className="home-hero-content">
          <p className="home-kicker">Super Smash Bros. Ultimate · Torneos presenciales</p>
          <h1 className="home-title">Tu torneo. Tus reglas.<span className="text-gradient block">Tu escenario.</span></h1>
          <p className="home-intro">Registra participantes, organiza brackets y gestiona escenarios desde un solo lugar.</p>
          <div className="home-actions">
            {([
              { title: 'Registro de participantes', description: 'Registra jugadores e importa listas desde Excel.', action: 'Registrar jugadores', href: '/registration', icon: 'users', tone: 'cyan' },
              { title: 'Bracket del torneo', description: 'Organiza enfrentamientos, Winners, Losers y resultados.', action: 'Administrar torneo', href: '/tournament', icon: 'trophy', tone: 'violet' },
              { title: 'Baneo de escenarios', description: 'Selecciona escenarios y juega siguiendo tu ruleset.', action: 'Elegir ruleset', href: '/#rulesets', icon: 'layers', tone: 'blue' },
            ] as const).map(item => <article className={'home-action ' + item.tone} key={item.href}>
              <span className="home-action-icon"><Icon name={item.icon} /></span>
              <h2>{item.title}</h2><p>{item.description}</p>
              <a className="home-action-button focus-ring" href={item.href} onClick={e => { if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) { e.preventDefault(); navigateTo(item.href) } }}>{item.action}<Icon name="arrow-right" className="h-4 w-4" /></a>
            </article>)}
          </div>
        </div>
        <nav className="home-secondary" aria-label="Más herramientas">
          <a className="focus-ring" href="/tournament/standings" onClick={e => { e.preventDefault(); navigateTo('/tournament/standings') }}><Icon name="trophy" className="h-4 w-4" />Standings · Top 8</a>
          <a className="focus-ring" href="/#rulesets" onClick={e => { e.preventDefault(); navigateTo('/#rulesets') }}><Icon name="grid" className="h-4 w-4" />Explorar rulesets</a>
          <a className="focus-ring" href="/rulesets/new" onClick={e => { e.preventDefault(); navigateTo('/rulesets/new') }}><Icon name="plus" className="h-4 w-4" />Crear ruleset</a>
          <a className="focus-ring" href="/tournament/presentation" onClick={e => { e.preventDefault(); navigateTo('/tournament/presentation') }}><Icon name="trophy" className="h-4 w-4" />Presentación del torneo</a>
        </nav>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"
        id="rulesets"
        tabIndex={-1}
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
