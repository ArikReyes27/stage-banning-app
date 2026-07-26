import type { Stage } from '../../types/ruleset'
import { StageGrid } from '../stages/StageGrid'

type RulesetStageSectionProps = {
  stages: Stage[]
  subtitle: string
  title: string
  tone: 'cyan' | 'violet'
}

export function RulesetStageSection({
  stages,
  subtitle,
  title,
  tone,
}: RulesetStageSectionProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              tone === 'cyan' ? 'text-cyan-300' : 'text-violet-300'
            }`}
          >
            {subtitle}
          </p>
          <h3 className="mt-1 text-lg font-black text-white">{title}</h3>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[10px] font-black ${
            tone === 'cyan'
              ? 'border-cyan-300/20 bg-cyan-300/8 text-cyan-200'
              : 'border-violet-300/20 bg-violet-300/8 text-violet-200'
          }`}
        >
          {stages.length}
        </span>
      </div>
      <StageGrid stages={stages} />
    </section>
  )
}
