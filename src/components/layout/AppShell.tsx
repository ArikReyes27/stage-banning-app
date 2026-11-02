import { useEffect, useState, type ReactNode } from 'react'
import { navigateTo } from '../../app/navigation'
import { Icon } from '../ui/Icon'
import { isAdminHost } from '../../lib/accessMode'

type AppShellProps = {
  children: ReactNode
  showAccount?: boolean
}

export function AppShell({ children, showAccount = false }: AppShellProps) {
  const adminUi = isAdminHost(window.location.hostname)
  showAccount = showAccount && adminUi
  const isPresentation = () => /^\/tournament\/(?:presentation|screen|standings\/presentation|match\/[^/]+\/presentation)\/?$/.test(window.location.pathname)
  const [presentation, setPresentation] = useState(isPresentation)
  useEffect(() => {
    const sync = () => setPresentation(/^\/tournament\/(?:presentation|screen|standings\/presentation|match\/[^/]+\/presentation)\/?$/.test(window.location.pathname))
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="app-background" aria-hidden="true" />

      {!presentation && <header className="relative z-20 border-b border-white/8 bg-[#060814]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <button
            aria-label="Ir a la página principal"
            className="focus-ring group flex items-center gap-3 rounded-xl text-left"
            onClick={() => navigateTo('/')}
            type="button"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-lg shadow-cyan-500/10 transition group-hover:border-cyan-300/60 group-hover:bg-cyan-300/15">
              <Icon name="layers" className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-black tracking-[0.18em] text-white">
                STAGE//STRIKE
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Torneos presenciales
              </span>
            </span>
          </button>

          {!presentation && <nav className={`grid w-full ${showAccount ? 'grid-cols-3' : 'grid-cols-4'} items-center gap-1 sm:flex sm:w-auto sm:flex-wrap sm:justify-end sm:gap-2`} aria-label="Navegación principal">
            <button className="focus-ring touch-target rounded-xl px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/5 sm:text-sm" onClick={() => navigateTo('/')} type="button">Inicio</button>
            {showAccount && <button className="focus-ring touch-target rounded-xl px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-300/10 sm:text-sm" onClick={() => navigateTo('/account')} type="button">Cuenta</button>}
            {showAccount && <button className="focus-ring touch-target rounded-xl px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-300/10 sm:text-sm" onClick={() => navigateTo('/my-tournaments')} type="button">Mis torneos</button>}
            {adminUi && <button className="focus-ring touch-target rounded-xl px-3 py-2 text-xs font-bold text-cyan-200 sm:text-sm" onClick={() => navigateTo('/registration')} type="button">Registro</button>}
            {adminUi && <button
              className="focus-ring touch-target rounded-xl px-3 py-2 text-xs font-bold text-violet-200 transition hover:bg-violet-300/10 sm:text-sm"
              onClick={() => navigateTo('/tournament')}
              type="button"
            >
              Bracket
            </button>}
            <button
              className="focus-ring touch-target rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white sm:text-sm"
              onClick={() => navigateTo('/#rulesets')}
              type="button"
            >
              Rulesets
            </button>
            {adminUi && <button
              aria-label="Crear ruleset"
              className="focus-ring touch-target hidden items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/20 hover:bg-cyan-300/8 hover:text-cyan-200 sm:flex sm:px-4 sm:text-sm"
              onClick={() => navigateTo('/rulesets/new')}
              type="button"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span className="hidden sm:inline">Crear ruleset</span>
            </button>}
          </nav>}
        </div>
      </header>}

      <div className="relative z-10">{children}</div>

      {!presentation && <footer className="relative z-10 border-t border-white/8 px-4 py-8 text-center text-xs font-medium tracking-wide text-slate-600">
        Hecho para decisiones rápidas en sets presenciales.
      </footer>}
    </div>
  )
}
