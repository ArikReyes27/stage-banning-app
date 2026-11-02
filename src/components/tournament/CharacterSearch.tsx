import { useId, useRef, useState } from 'react'
import { characters } from '../../data/characters'
import { CharacterIcon } from './CharacterIcon'

export function CharacterSearch({ label, value, onChange }: { label: string; value: string; onChange: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const id = useId()
  const options = useRef<HTMLDivElement>(null)
  const normalized = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
  const matches = characters.filter(c => normalized(c.name).includes(normalized(query.trim())))
  return <div className="vs-character-search">
    <label htmlFor={id} className="block text-sm font-bold">{label}</label>
    <input id={id} className="form-control my-2" type="search" placeholder="Buscar personaje…" value={query}
      onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); options.current?.querySelector('button')?.focus() } }} onChange={e => setQuery(e.target.value)} autoComplete="off" />
    <div ref={options} onKeyDown={e => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
      const buttons = [...e.currentTarget.querySelectorAll('button')], index = buttons.indexOf(document.activeElement as HTMLButtonElement)
      e.preventDefault(); buttons[e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus()
    }} className="vs-character-options" role="group" aria-label={`Personajes para ${label}`}>
      {matches.map(c => <button type="button" key={c.id} aria-pressed={c.id === value}
        className="vs-character-option" onClick={() => onChange(c.id)}>
        <CharacterIcon characterId={c.id} /><span>{c.name}</span>{c.id === value && <span aria-label="Seleccionado">✓</span>}
      </button>)}
      {!matches.length && <p role="status" className="p-3 text-sm text-slate-400">Sin coincidencias.</p>}
    </div>
  </div>
}
