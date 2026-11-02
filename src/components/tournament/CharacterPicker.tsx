import { useEffect, useRef, useState } from 'react'
import type { GameSetup } from '../../types/tournament'
import { CharacterIcon } from './CharacterIcon'
import { CharacterSearch } from './CharacterSearch'
import { availableVariants, variantAsset } from '../../data/characterVariants'

export function VariantPicker({ setup, slot, onChange }: { setup: GameSetup; slot: 0 | 1; onChange: (value: GameSetup) => void }) {
  const id = setup.characterIds[slot], variants = availableVariants(id)
  if (variants.length < 2) return null
  return <div className="flex flex-wrap gap-2 my-3" role="group" aria-label="Color del personaje">{variants.map(variant => <button type="button" className="bracket-button" key={variant} aria-label={'Color ' + (Number(variant) + 1)} aria-pressed={(setup.variantIds?.[slot] ?? '00') === variant} onClick={() => {
    const variantIds: [string, string] = [...(setup.variantIds ?? ['00', '00'])]; variantIds[slot] = variant; onChange({ ...setup, variantIds })
  }}><img src={variantAsset(id, variant, 'icon')} width="32" height="32" alt="" /></button>)}</div>
}
export function CharacterPicker({ label, setup, slot, disabled, onChange }: { label: string; setup: GameSetup; slot: 0 | 1; disabled?: boolean; onChange: (value: GameSetup) => boolean }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (open) trigger.current?.parentElement?.querySelector('input')?.focus() }, [open])
  const close = () => { setOpen(false); trigger.current?.focus() }
  return <div className="character-picker">
    <button ref={trigger} type="button" className="focus-ring" disabled={disabled} aria-label={'Cambiar personaje de ' + label} aria-expanded={open} onClick={() => setOpen(!open)}><CharacterIcon characterId={setup.characterIds[slot]} /></button>
    {open && <div className="character-picker-popover" onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close() } }}>
      <CharacterSearch label={'Personaje · ' + label} value={setup.characterIds[slot]} onChange={id => {
        const characterIds: [string, string] = [...setup.characterIds]; characterIds[slot] = id
        const variantIds: [string, string] = [...(setup.variantIds ?? ['00', '00'])]; variantIds[slot] = '00'
        if (onChange({ ...setup, characterIds, variantIds })) close()
      }}/>
      <VariantPicker setup={setup} slot={slot} onChange={onChange}/>
      <p className="text-xs text-slate-400 my-2">Selección preparada; no cuenta como juego disputado.</p>
      <button type="button" className="bracket-button" onClick={close}>Cerrar selector</button>
    </div>}
  </div>
}
