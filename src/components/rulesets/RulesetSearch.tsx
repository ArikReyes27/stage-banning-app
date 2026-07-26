import { Icon } from '../ui/Icon'

type RulesetSearchProps = {
  onChange: (value: string) => void
  value: string
}

export function RulesetSearch({ onChange, value }: RulesetSearchProps) {
  return (
    <label className="relative block w-full md:max-w-md">
      <span className="sr-only">Buscar rulesets</span>
      <Icon
        name="search"
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
      />
      <input
        className="focus-ring w-full rounded-2xl border border-white/10 bg-[#080b18]/80 py-3.5 pl-11 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-cyan-300/50"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Nombre, comunidad o stage..."
        type="search"
        value={value}
      />
    </label>
  )
}
