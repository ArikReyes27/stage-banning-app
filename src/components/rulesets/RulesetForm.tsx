import { useMemo, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import type {
  PickerRule,
  Ruleset,
  RulesetInput,
  Stage,
  StageType,
} from '../../types/ruleset'
import { validateRuleset } from '../../utils/rulesetValidation'
import { StagePicker } from '../stages/StagePicker'
import { Icon } from '../ui/Icon'
import { StageListEditor } from './StageListEditor'

type RulesetFormProps = {
  initialValue?: Ruleset
  mode: 'create' | 'edit'
  onCancel: () => void
  onSubmit: (ruleset: RulesetInput) => void
}

const defaultValue: RulesetInput = {
  name: '',
  community: '',
  description: '',
  accent: 'cyan',
  stages: [],
  gameOneFlow: {
    enabledStages: 'startersOnly',
    firstBanCount: 1,
    secondBanCount: 1,
    pickerRule: 'rpsWinner',
  },
  laterGamesFlow: {
    winnerBanCount: 2,
    loserPicks: true,
    counterpicksUnlocked: true,
  },
}

const pickerOptions: { label: string; value: Exclude<PickerRule, 'custom'> }[] = [
  { label: 'Ganador de RPS', value: 'rpsWinner' },
  { label: 'Perdedor de RPS', value: 'rpsLoser' },
  { label: 'Player 1', value: 'player1' },
  { label: 'Player 2', value: 'player2' },
]

const toFormValue = (ruleset?: Ruleset): RulesetInput => {
  if (!ruleset) return defaultValue

  return {
    name: ruleset.name,
    community: ruleset.community,
    description: ruleset.description,
    accent: ruleset.accent,
    stages: ruleset.stages,
    gameOneFlow: {
      ...ruleset.gameOneFlow,
      pickerRule:
        ruleset.gameOneFlow.pickerRule === 'custom'
          ? 'rpsWinner'
          : ruleset.gameOneFlow.pickerRule,
    },
    laterGamesFlow: { ...ruleset.laterGamesFlow },
  }
}

export function RulesetForm({
  initialValue,
  mode,
  onCancel,
  onSubmit,
}: RulesetFormProps) {
  const [value, setValue] = useState<RulesetInput>(() => toFormValue(initialValue))
  const validation = useMemo(() => validateRuleset(value), [value])
  const starters = value.stages.filter((stage) => stage.type === 'starter')
  const counterpicks = value.stages.filter(
    (stage) => stage.type === 'counterpick',
  )

  const updateStages = (type: StageType, stages: Stage[]) => {
    setValue((currentValue) => ({
      ...currentValue,
      stages:
        type === 'starter'
          ? [...stages, ...counterpicks]
          : [...starters, ...stages],
    }))
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()

    if (validation.errors.length > 0) return

    onSubmit({
      ...value,
      name: value.name.trim(),
      community: value.community.trim(),
      description: value.description.trim(),
      stages: value.stages.map((stage) => ({
        ...stage,
        name: stage.name.trim(),
      })),
    })
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <motion.section
        className="glass-panel rounded-[2rem] p-5 sm:p-7"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
              Información básica
            </p>
            <h2 className="mt-2 text-xl font-black text-white">
              Identidad del ruleset
            </h2>
          </div>
          <span className="rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
            {mode === 'create' ? 'Nuevo' : 'Editando'}
          </span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FormField label="Nombre del ruleset" required>
            <input
              aria-invalid={!value.name.trim()}
              aria-required="true"
              className="form-control"
              onChange={(event) =>
                setValue((currentValue) => ({
                  ...currentValue,
                  name: event.target.value,
                }))
              }
              placeholder="Ej. Weekly Centro"
              type="text"
              value={value.name}
            />
          </FormField>
          <FormField label="Comunidad" required>
            <input
              aria-invalid={!value.community.trim()}
              aria-required="true"
              className="form-control"
              onChange={(event) =>
                setValue((currentValue) => ({
                  ...currentValue,
                  community: event.target.value,
                }))
              }
              placeholder="Ej. Comunidad Centro"
              type="text"
              value={value.community}
            />
          </FormField>
          <FormField className="sm:col-span-2" label="Descripción">
            <textarea
              className="form-control min-h-28 resize-y"
              onChange={(event) =>
                setValue((currentValue) => ({
                  ...currentValue,
                  description: event.target.value,
                }))
              }
              placeholder="Explica brevemente el enfoque de este ruleset."
              value={value.description}
            />
          </FormField>
        </div>
      </motion.section>

      <StagePicker
        onChange={(stages) =>
          setValue((currentValue) => ({ ...currentValue, stages }))
        }
        stages={value.stages}
      />

      <details className="group rounded-[2rem] border border-white/8 bg-white/3 p-3">
        <summary className="focus-ring touch-target flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-3 py-3 text-sm font-black text-slate-300">
          <span>
            Stages manuales
            <span className="ml-2 text-xs font-medium text-slate-600">
              soporte secundario
            </span>
          </span>
          <Icon
            name="plus"
            className="h-4 w-4 transition group-open:rotate-45"
          />
        </summary>
        <div className="mt-3 grid gap-5 lg:grid-cols-2">
          <StageListEditor
            allStages={value.stages}
            onChange={(stages) => updateStages('starter', stages)}
            stages={starters}
            type="starter"
          />
          <StageListEditor
            allStages={value.stages}
            onChange={(stages) => updateStages('counterpick', stages)}
            stages={counterpicks}
            type="counterpick"
          />
        </div>
      </details>

      <section className="glass-panel rounded-[2rem] p-5 sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">
          Configuración de reglas
        </p>
        <h2 className="mt-2 text-xl font-black text-white">Flujo por game</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <RuleGroup eyebrow="Game 1" title="Starter striking">
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Bans jugador 1"
                onChange={(number) =>
                  setValue((currentValue) => ({
                    ...currentValue,
                    gameOneFlow: {
                      ...currentValue.gameOneFlow,
                      firstBanCount: number,
                    },
                  }))
                }
                value={value.gameOneFlow.firstBanCount}
              />
              <NumberField
                label="Bans jugador 2"
                onChange={(number) =>
                  setValue((currentValue) => ({
                    ...currentValue,
                    gameOneFlow: {
                      ...currentValue.gameOneFlow,
                      secondBanCount: number,
                    },
                  }))
                }
                value={value.gameOneFlow.secondBanCount}
              />
            </div>
            <FormField label="Quién escoge stage">
              <select
                className="form-control"
                onChange={(event) =>
                  setValue((currentValue) => ({
                    ...currentValue,
                    gameOneFlow: {
                      ...currentValue.gameOneFlow,
                      pickerRule: event.target.value as PickerRule,
                    },
                  }))
                }
                value={value.gameOneFlow.pickerRule}
              >
                {pickerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </RuleGroup>

          <RuleGroup eyebrow="Game 2+" title="Counterpick flow">
            <NumberField
              label="Bans del ganador anterior"
              onChange={(number) =>
                setValue((currentValue) => ({
                  ...currentValue,
                  laterGamesFlow: {
                    ...currentValue.laterGamesFlow,
                    winnerBanCount: number,
                  },
                }))
              }
              value={value.laterGamesFlow.winnerBanCount}
            />
            <ToggleField
              checked={value.laterGamesFlow.loserPicks}
              label="El perdedor escoge stage"
              onChange={(checked) =>
                setValue((currentValue) => ({
                  ...currentValue,
                  laterGamesFlow: {
                    ...currentValue.laterGamesFlow,
                    loserPicks: checked,
                  },
                }))
              }
            />
            <ToggleField
              checked={value.laterGamesFlow.counterpicksUnlocked}
              label="Desbloquear counterpicks desde Game 2"
              onChange={(checked) =>
                setValue((currentValue) => ({
                  ...currentValue,
                  laterGamesFlow: {
                    ...currentValue.laterGamesFlow,
                    counterpicksUnlocked: checked,
                  },
                }))
              }
            />
          </RuleGroup>
        </div>
      </section>

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <section aria-live="polite" className="grid gap-3 lg:grid-cols-2">
          {validation.errors.length > 0 && (
            <FeedbackPanel
              items={validation.errors}
              title="Corrige antes de guardar"
              type="error"
            />
          )}
          {validation.warnings.length > 0 && (
            <FeedbackPanel
              items={validation.warnings}
              title="Revisa estas recomendaciones"
              type="warning"
            />
          )}
        </section>
      )}

      <div className="glass-panel sticky bottom-3 z-20 flex flex-col-reverse gap-3 rounded-2xl p-3 sm:flex-row sm:justify-end">
        <button
          className="focus-ring rounded-xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/8 hover:text-white"
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="focus-ring flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
          disabled={validation.errors.length > 0}
          type="submit"
        >
          <Icon name="save" className="h-4 w-4" />
          {mode === 'create' ? 'Guardar ruleset' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

function FormField({
  children,
  className = '',
  label,
  required = false,
}: {
  children: React.ReactNode
  className?: string
  label: string
  required?: boolean
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-black text-slate-300">
        {label}
        {required && <span className="ml-1 text-cyan-300">*</span>}
      </span>
      {children}
    </label>
  )
}

function NumberField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: number) => void
  value: number
}) {
  return (
    <FormField label={label}>
      <input
        className="form-control"
        min="0"
        onChange={(event) => onChange(Number(event.target.value))}
        step="1"
        type="number"
        value={value}
      />
    </FormField>
  )
}

function RuleGroup({
  children,
  eyebrow,
  title,
}: {
  children: React.ReactNode
  eyebrow: string
  title: string
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-5">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
        {eyebrow}
      </p>
      <h3 className="mt-1 text-base font-black text-white">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  )
}

function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/8 bg-[#070a16]/55 px-3 py-3">
      <span className="text-xs font-bold text-slate-300">{label}</span>
      <input
        checked={checked}
        className="h-4 w-4 accent-cyan-300"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  )
}

function FeedbackPanel({
  items,
  title,
  type,
}: {
  items: string[]
  title: string
  type: 'error' | 'warning'
}) {
  const isError = type === 'error'

  return (
    <div
      aria-live={isError ? 'assertive' : 'polite'}
      className={`rounded-2xl border p-4 ${
        isError
          ? 'border-rose-300/20 bg-rose-300/7'
          : 'border-amber-300/20 bg-amber-300/7'
      }`}
      role={isError ? 'alert' : 'status'}
    >
      <p
        className={`flex items-center gap-2 text-xs font-black ${
          isError ? 'text-rose-200' : 'text-amber-200'
        }`}
      >
        <Icon name="warning" className="h-4 w-4" />
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li className="text-xs leading-5 text-slate-400" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
