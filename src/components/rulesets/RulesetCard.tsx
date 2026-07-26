import { motion } from 'framer-motion'
import { navigateTo } from '../../app/navigation'
import type { Ruleset, RulesetAccent } from '../../types/ruleset'
import { Icon } from '../ui/Icon'

type RulesetCardProps = {
  ruleset: Ruleset
  index: number
}

const accents: Record<
  RulesetAccent,
  { glow: string; badge: string; line: string; icon: string }
> = {
  cyan: {
    glow: 'from-cyan-400/22 via-cyan-400/4 to-transparent',
    badge: 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200',
    line: 'from-cyan-300 to-blue-500',
    icon: 'bg-cyan-300/10 text-cyan-200',
  },
  violet: {
    glow: 'from-violet-400/22 via-violet-400/4 to-transparent',
    badge: 'border-violet-300/20 bg-violet-300/8 text-violet-200',
    line: 'from-violet-300 to-fuchsia-500',
    icon: 'bg-violet-300/10 text-violet-200',
  },
  amber: {
    glow: 'from-amber-400/22 via-amber-400/4 to-transparent',
    badge: 'border-amber-300/20 bg-amber-300/8 text-amber-200',
    line: 'from-amber-300 to-orange-500',
    icon: 'bg-amber-300/10 text-amber-200',
  },
}

export function RulesetCard({ ruleset, index }: RulesetCardProps) {
  const starters = ruleset.stages.filter((stage) => stage.type === 'starter').length
  const counterpicks = ruleset.stages.length - starters
  const accent = accents[ruleset.accent]

  return (
    <motion.article
      className="glass-panel group relative flex h-full flex-col overflow-hidden rounded-3xl p-5 sm:p-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.99 }}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${accent.glow}`}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-x-7 top-0 h-px bg-gradient-to-r ${accent.line}`}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            {ruleset.community}
          </p>
          <h3 className="mt-2 truncate text-xl font-black tracking-tight text-white">
            {ruleset.name}
          </h3>
          <span
            className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-wider ${
              ruleset.source === 'custom'
                ? 'border-violet-300/20 bg-violet-300/8 text-violet-200'
                : 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200'
            }`}
          >
            {ruleset.source === 'custom' ? 'Custom' : 'Predeterminado'}
          </span>
        </div>
        <span className={`rounded-xl p-2.5 ${accent.icon}`}>
          <Icon name="target" className="h-5 w-5" />
        </span>
      </div>

      <p className="relative mt-4 line-clamp-3 flex-1 text-sm leading-6 text-slate-400">
        {ruleset.description}
      </p>

      <div className="relative mt-6 grid grid-cols-3 gap-2">
        <StageCount className={accent.badge} label="Starters" value={starters} />
        <StageCount label="Counterpicks" value={counterpicks} />
        <StageCount label="Total" value={ruleset.stages.length} />
      </div>

      <div className="relative mt-3 space-y-2 rounded-2xl border border-white/8 bg-[#070a16]/45 p-3">
        <p className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <Icon name="target" className="h-3.5 w-3.5 text-cyan-300" />
          Game 1: starters only
        </p>
        <p className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
          <Icon name="spark" className="h-3.5 w-3.5 text-violet-300" />
          Game 2+:{' '}
          {ruleset.laterGamesFlow.counterpicksUnlocked
            ? 'counterpicks activos'
            : 'solo starters'}
        </p>
      </div>

      <div className="relative mt-5 grid gap-2 sm:grid-cols-2">
        <button
          className="focus-ring touch-target flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-100"
          onClick={() => navigateTo(`/rulesets/${ruleset.id}`)}
          type="button"
        >
          Ver ruleset
          <Icon name="arrow-right" className="h-4 w-4" />
        </button>
        <button
          className="focus-ring touch-target flex items-center justify-center gap-2 rounded-xl border border-violet-300/15 bg-violet-300/8 px-4 py-3 text-sm font-black text-violet-200 transition hover:border-violet-300/30 hover:bg-violet-300/14"
          onClick={() => navigateTo(`/session/setup/${ruleset.id}`)}
          type="button"
        >
          <Icon name="bolt" className="h-4 w-4" />
          Iniciar baneo
        </button>
      </div>
    </motion.article>
  )
}

function StageCount({
  className = 'border-white/8 bg-white/3 text-slate-300',
  label,
  value,
}: {
  className?: string
  label: string
  value: number
}) {
  return (
    <div className={`rounded-2xl border px-2 py-3 ${className}`}>
      <span className="block text-xl font-black">{value}</span>
      <span className="block truncate text-[8px] font-bold uppercase tracking-[0.1em] opacity-70 sm:text-[9px]">
        {label}
      </span>
    </div>
  )
}
