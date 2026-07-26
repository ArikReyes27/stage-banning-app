import type { ReactNode } from 'react'
import { navigateTo } from '../../app/navigation'
import { Icon } from '../ui/Icon'

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="app-background" aria-hidden="true" />

      <header className="relative z-20 border-b border-white/8 bg-[#060814]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
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
                Ruleset explorer
              </span>
            </span>
          </button>

          <nav className="flex items-center gap-2" aria-label="Navegación principal">
            <button
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white sm:block"
              onClick={() => navigateTo('/')}
              type="button"
            >
              Rulesets
            </button>
            <button
              aria-label="Crear ruleset"
              className="focus-ring touch-target flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-300/20 hover:bg-cyan-300/8 hover:text-cyan-200 sm:px-4 sm:text-sm"
              onClick={() => navigateTo('/rulesets/new')}
              type="button"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span className="hidden sm:inline">Crear ruleset</span>
            </button>
          </nav>
        </div>
      </header>

      <div className="relative z-10">{children}</div>

      <footer className="relative z-10 border-t border-white/8 px-4 py-8 text-center text-xs font-medium tracking-wide text-slate-600">
        Hecho para decisiones rápidas en sets presenciales.
      </footer>
    </div>
  )
}
