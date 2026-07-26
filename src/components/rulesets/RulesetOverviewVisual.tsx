import type { Ruleset } from '../../types/ruleset'
import { Icon, type IconName } from '../ui/Icon'

type RulesetOverviewVisualProps = {
  ruleset: Ruleset
}

export function RulesetOverviewVisual({
  ruleset,
}: RulesetOverviewVisualProps) {
  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-7">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">
        Flujo rápido
      </p>
      <h2 className="mt-2 text-xl font-black text-white">De RPS a counterpick</h2>

      <div className="mt-6 space-y-5">
        <FlowGroup
          eyebrow="Game 1"
          items={[
            { icon: 'spark', label: 'RPS' },
            {
              icon: 'target',
              label: `${ruleset.gameOneFlow.firstBanCount} / ${ruleset.gameOneFlow.secondBanCount} bans`,
            },
            { icon: 'check', label: 'Starter' },
          ]}
        />
        <FlowGroup
          eyebrow="Game 2+"
          items={[
            {
              icon: 'warning',
              label: `${ruleset.laterGamesFlow.winnerBanCount} bans`,
            },
            {
              icon: 'arrow-right',
              label: ruleset.laterGamesFlow.loserPicks
                ? 'Pierde y elige'
                : 'Gana y elige',
            },
            {
              icon: 'layers',
              label: ruleset.laterGamesFlow.counterpicksUnlocked
                ? 'Pool completo'
                : 'Solo starters',
            },
          ]}
        />
      </div>
    </section>
  )
}

function FlowGroup({
  eyebrow,
  items,
}: {
  eyebrow: string
  items: { icon: IconName; label: string }[]
}) {
  return (
    <div>
      <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
        {eyebrow}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, index) => (
          <div
            className="relative rounded-2xl border border-white/8 bg-white/3 px-2 py-4 text-center"
            key={item.label}
          >
            <span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/8 text-cyan-300">
              <Icon name={item.icon} className="h-4 w-4" />
            </span>
            <span className="mt-2 block text-[10px] font-black leading-4 text-slate-300">
              {item.label}
            </span>
            {index < items.length - 1 && (
              <span className="absolute -right-2 top-1/2 z-10 text-xs text-slate-600">
                ›
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
