import type { SetFormat } from '../../hooks/useBanSession'
import { getFirstTo, getFormatLabel } from '../../utils/sessionFlow'
import { Icon } from '../ui/Icon'

type PlayerSetupPanelProps = {
  format: SetFormat
  locked?: boolean
  onFormatChange: (format: SetFormat) => void
  onPlayer1NameChange: (name: string) => void
  onPlayer2NameChange: (name: string) => void
  player1Name: string
  player2Name: string
}

export function PlayerSetupPanel({
  format,
  locked = false,
  onFormatChange,
  onPlayer1NameChange,
  onPlayer2NameChange,
  player1Name,
  player2Name,
}: PlayerSetupPanelProps) {
  return (
    <section className="glass-panel rounded-[2rem] p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/8 text-cyan-300">
          <Icon name="grid" className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Configuración de sesión
          </p>
          <h2 className="mt-1 text-xl font-black text-white">
            Jugadores y formato
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_1.2fr]">
        <PlayerNameField
          label="Jugador 1"
          locked={locked}
          onChange={onPlayer1NameChange}
          value={player1Name}
        />
        <PlayerNameField
          label="Jugador 2"
          locked={locked}
          onChange={onPlayer2NameChange}
          value={player2Name}
        />
        <div>
          <p className="mb-2 text-xs font-black text-slate-300">
            Formato del set
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/8 bg-[#070a16]/65 p-1.5">
            {(['BO3', 'BO5'] as SetFormat[]).map((option) => (
              <button
                aria-pressed={format === option}
                className={`focus-ring rounded-xl px-3 py-2.5 text-left transition ${
                  format === option
                    ? 'bg-violet-300 text-slate-950'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                key={option}
                disabled={locked}
                onClick={() => onFormatChange(option)}
                type="button"
              >
                <span className="block text-xs font-black">
                  {getFormatLabel(option)}
                </span>
                <span className="mt-0.5 block text-[10px] font-bold opacity-60">
                  First to {getFirstTo(option)}
                </span>
              </button>
            ))}
          </div>
          {locked && (
            <p className="mt-2 text-[10px] font-bold text-slate-600">
              Reinicia el set para cambiar jugadores o formato.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function PlayerNameField({
  label,
  locked,
  onChange,
  value,
}: {
  label: string
  locked: boolean
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black text-slate-300">
        {label}
      </span>
      <input
        className="form-control"
        disabled={locked}
        maxLength={32}
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </label>
  )
}
