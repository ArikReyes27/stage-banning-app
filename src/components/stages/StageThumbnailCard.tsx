import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { getStageCatalogEntry } from '../../data/stageCatalog'
import type { Stage } from '../../types/ruleset'
import { Icon } from '../ui/Icon'

export type StageVisualState = 'available' | 'banned' | 'selected' | 'locked'
export type StageCardAccent = 'emerald' | 'cyan' | 'violet'

type StageThumbnailCardProps = {
  accent?: StageCardAccent
  stage: Pick<Stage, 'id' | 'name'>
  state?: StageVisualState
  statusLabel?: string
  onClick?: () => void
  compact?: boolean
}

const stateClasses: Record<StageVisualState, string> = {
  available:
    'border-white/10 hover:border-cyan-300/40 hover:shadow-cyan-500/10',
  banned: 'border-rose-400/70 shadow-lg shadow-rose-500/15',
  selected: '',
  locked: 'border-white/6 opacity-45 grayscale',
}

const selectedClasses: Record<StageCardAccent, string> = {
  emerald: 'border-emerald-300/80 shadow-lg shadow-emerald-500/15',
  cyan: 'border-cyan-300/80 shadow-lg shadow-cyan-500/15',
  violet: 'border-violet-300/80 shadow-lg shadow-violet-500/15',
}

const statusLabelClasses: Record<StageCardAccent, string> = {
  emerald: 'border-emerald-300/35 bg-emerald-950/85 text-emerald-100',
  cyan: 'border-cyan-300/35 bg-cyan-950/85 text-cyan-100',
  violet: 'border-violet-300/35 bg-violet-950/85 text-violet-100',
}

const stateBadges: Record<Exclude<StageVisualState, 'available'>, ReactNode> = {
  banned: (
    <span className="flex items-center gap-1 rounded-full border border-rose-300/35 bg-rose-950/85 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-rose-200">
      <Icon name="warning" className="h-3 w-3" />
      Baneado
    </span>
  ),
  selected: (
    <span className="flex items-center gap-1 rounded-full border border-emerald-300/35 bg-emerald-950/85 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-200">
      <Icon name="check" className="h-3 w-3" />
      Elegido
    </span>
  ),
  locked: (
    <span className="flex items-center gap-1 rounded-full border border-white/15 bg-slate-950/85 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-300">
      <Icon name="lock" className="h-3 w-3" />
      Bloqueado
    </span>
  ),
}

export function StageThumbnailCard({
  accent = 'emerald',
  compact = false,
  onClick,
  stage,
  state = 'available',
  statusLabel,
}: StageThumbnailCardProps) {
  const catalogStage = getStageCatalogEntry(stage)
  const [imageFailed, setImageFailed] = useState(false)
  const isInteractive = Boolean(onClick) && state !== 'locked'

  const content = (
    <>
      <div
        className={`relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_50%),linear-gradient(135deg,#111827,#25194b_55%,#081521)] ${
          compact ? 'aspect-[16/10]' : 'aspect-[16/9]'
        }`}
      >
        {catalogStage && !imageFailed ? (
          <img
            alt={`Vista previa de ${stage.name}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.035]"
            onError={() => setImageFailed(true)}
            src={catalogStage.image}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center px-3 text-center">
            <span className="max-w-[12rem] text-xs font-black uppercase tracking-[0.12em] text-white/70">
              {stage.name}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050711]/85 via-transparent to-transparent" />
        {(state !== 'available' || statusLabel) && (
          <div className="absolute left-2 top-2">
            {statusLabel ? (
              <span
                className={`rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
                  state === 'locked'
                    ? 'border-white/20 bg-slate-950/85 text-slate-200'
                    : statusLabelClasses[accent]
                }`}
              >
                {statusLabel}
              </span>
            ) : (
              stateBadges[state as Exclude<StageVisualState, 'available'>]
            )}
          </div>
        )}
        {state === 'banned' && (
          <div className="absolute inset-0 grid place-items-center bg-rose-950/38">
            <span className="text-5xl font-light text-rose-200/80">×</span>
          </div>
        )}
      </div>
      <div className="flex min-h-12 items-center justify-between gap-2 border-t border-white/8 bg-[#090d1b]/94 px-3 py-2.5">
        <span className="min-w-0 text-left text-xs font-black leading-4 text-slate-200 sm:text-sm">
          {stage.name}
        </span>
        {catalogStage?.isCompetitive && (
          <span
            aria-label="Stage competitivo"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_9px_rgba(103,232,249,0.8)]"
          />
        )}
      </div>
    </>
  )

  const className = `group relative overflow-hidden rounded-2xl border bg-[#090d1b]/90 text-left transition duration-200 ${
    state === 'selected' ? selectedClasses[accent] : stateClasses[state]
  } ${
    isInteractive ? 'focus-ring w-full active:scale-[0.985]' : ''
  }`

  if (isInteractive) {
    return (
      <motion.button
        aria-label={`${state === 'selected' ? 'Quitar' : 'Seleccionar'} ${stage.name}`}
        aria-pressed={state === 'selected'}
        className={className}
        onClick={onClick}
        type="button"
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.985 }}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <motion.div
      aria-label={`${stage.name}: ${statusLabel ?? state}`}
      className={className}
      whileHover={{ y: state === 'locked' ? 0 : -2 }}
    >
      {content}
    </motion.div>
  )
}
