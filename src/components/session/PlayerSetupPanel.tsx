import type { SetFormat } from '../../hooks/useBanSession'
import { getFirstTo } from '../../utils/sessionFlow'

type PlayerSetupPanelProps = {
  format: SetFormat
  locked?: boolean
  onFormatChange: (format: SetFormat) => void
}

export function PlayerSetupPanel({
  format,
  locked = false,
  onFormatChange,
}: PlayerSetupPanelProps) {
  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-7">
      <div>
        <div>
          <p className="mb-2 text-xs font-black text-slate-300">
            Formato del set
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/8 bg-[#070a16]/65 p-1.5">
            {(['BO3', 'BO5'] as SetFormat[]).map((option) => (
              <button
                aria-pressed={format === option}
                className={`focus-ring min-h-20 rounded-xl px-4 py-3 text-center transition ${
                  format === option
                    ? 'bg-violet-300 text-slate-950'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                key={option}
                disabled={locked}
                onClick={() => onFormatChange(option)}
                type="button"
              >
                <span className="block text-2xl font-black">
                  {option}
                </span>
                <span className="mt-0.5 block text-[10px] font-bold opacity-60">
                  Primero en ganar {getFirstTo(option)}
                </span>
              </button>
            ))}
          </div>
          {locked && (
            <p className="mt-2 text-[10px] font-bold text-slate-600">
              Reinicia el set para cambiar el formato.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
