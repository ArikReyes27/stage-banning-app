import { useMemo, useState } from 'react'
import type { Tournament } from '../../types/tournament'
import { useRegistration } from '../../hooks/useRegistration'
import { useWorkspace } from '../../hooks/workspaceContext'
import { createScalableTournament, drawTournament, restoreDistribution, swapPositions, validPriorities } from '../../utils/tournamentSetup'
import { nicknameKey } from '../../utils/registration'
import { navigateTo } from '../../app/navigation'

export function TournamentSetup({ tournament: t, onSave, onExport }: { tournament: Tournament; onSave: (t: Tournament) => boolean; onExport: () => void }) {
  const workspace = useWorkspace()
  const { registration, error } = useRegistration()
  const [selected, setSelected] = useState<string[]>([]), [query, setQuery] = useState(''), [page, setPage] = useState(0)
  const [notice, setNotice] = useState(''), [review, setReview] = useState(false)
  const [a, setA] = useState(0), [b, setB] = useState(1), [seedPage, setSeedPage] = useState(0)
  const [showNew, setShowNew] = useState(t.participants.every(p => !p.nickname))
  const rows = useMemo(() => registration.participants.filter(p => nicknameKey(p.nickname).includes(nicknameKey(query))), [registration, query])
  const current = Math.min(page, Math.max(0, Math.ceil(rows.length / 25) - 1))
  const chosen = registration.participants.filter(p => selected.includes(p.id))
  const run = (fn: () => void) => { try { fn(); setNotice('') } catch (e) { setNotice((e as Error).message) } }
  return <section className="glass-panel my-5 rounded-3xl p-5 space-y-4">
    <div className="flex flex-wrap gap-3"><button className="bracket-button" onClick={() => setShowNew(!showNew)}>Seleccionar participantes / Nuevo torneo</button><button className="bracket-button" onClick={() => navigateTo('/registration')}>Ir al registro</button></div>
    {notice && <p role="alert" className="text-amber-200">{notice}</p>}
    {showNew && <div className="space-y-3">
      <h2 className="text-xl font-black">Elegir participantes del registro</h2>
      {error && <p role="alert">{error}</p>}
      <label className="block">Buscar nickname<input className="form-control mt-1" value={query} onChange={e => { setQuery(e.target.value); setPage(0) }} /></label>
      <div className="flex flex-wrap gap-3"><span>{chosen.length} seleccionados / {registration.participants.length} registrados</span><button className="bracket-button" onClick={() => { setSelected(registration.participants.map(p => p.id)); setReview(false) }}>Seleccionar todos</button><button className="bracket-button" onClick={() => { setSelected([]); setReview(false) }}>Limpiar</button></div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{rows.slice(current * 25, (current + 1) * 25).map(p => <label key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 p-3"><input type="checkbox" checked={selected.includes(p.id)} onChange={e => { setSelected(e.target.checked ? [...selected, p.id] : selected.filter(id => id !== p.id)); setReview(false) }} /><span className="break-all">{p.nickname}</span></label>)}</div>
      {!rows.length && <p>No hay participantes. Agrégalos desde Registro.</p>}
      <div className="flex gap-3"><button className="bracket-button" disabled={!current} onClick={() => setPage(current - 1)}>Anterior</button><span>Página {current + 1}</span><button className="bracket-button" disabled={(current + 1) * 25 >= rows.length} onClick={() => setPage(current + 1)}>Siguiente</button></div>
      <button className="bracket-button primary" disabled={chosen.length < 2 || !!error} onClick={() => setReview(true)}>Revisar selección</button>
      {review && <div className="rounded-xl border border-amber-300/30 p-4 space-y-3">
        <h3 className="font-bold">Nuevo torneo · {chosen.length} participantes</h3><p className="max-h-48 overflow-auto break-words">{chosen.map(p => p.nickname).join(' · ')}</p>
        <p>{workspace ? `Reemplazará únicamente el bracket local de ${workspace.name} y sus resultados, con respaldo previo. No crea otro torneo remoto.` : 'Reemplazará el torneo local y sus resultados.'} Descarga primero su JSON para conservarlo. El registro no cambia.</p>
        <div className="flex flex-wrap gap-3"><button className="bracket-button" onClick={onExport}>Exportar torneo actual a JSON</button><button className="bracket-button primary" onClick={() => run(() => {
          const next = createScalableTournament(chosen)
          if (!window.confirm(`¿Reemplazar el torneo local por un nuevo borrador de ${chosen.length} participantes? Se retirarán sus resultados locales. Conserva el JSON anterior si deseas recuperarlos.`)) return
          if (onSave(next)) { setReview(false); setShowNew(false); setSeedPage(0) }
        })}>Confirmar nuevo torneo</button><button className="bracket-button" onClick={() => setReview(false)}>Cancelar</button></div>
      </div>}
    </div>}
    {!t.participants.every(p => !p.nickname) && t.status !== 'started' && <div className="space-y-3">
      <h2 className="text-xl font-black">Distribución · {t.participants.length} participantes</h2>
      <p className="text-sm text-slate-400">Seeds opcionales: números únicos. Los demás se sortean. Los personajes se eligen en cada VS.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{t.participants.slice(seedPage * 25, (seedPage + 1) * 25).map(p => <label key={p.id} className="flex items-center gap-3"><span className="min-w-0 flex-1 truncate" title={p.nickname}>{p.nickname}</span><input aria-label={`Seed de ${p.nickname}`} className="form-control !w-24" type="number" min={1} max={t.participants.length} placeholder="—" value={t.priorities?.[p.id] ?? ''} onChange={e => run(() => {
        const priorities = { ...t.priorities }; if (e.target.value) priorities[p.id] = Number(e.target.value); else delete priorities[p.id]
        if (!validPriorities({ ...t, priorities })) throw new Error('Usa seeds únicos entre 1 y la cantidad de participantes.')
        onSave({ ...t, priorities })
      })} /></label>)}</div>
      <div className="flex flex-wrap gap-3"><button className="bracket-button" disabled={!seedPage} onClick={() => setSeedPage(seedPage - 1)}>Seeds anteriores</button><button className="bracket-button" disabled={(seedPage + 1) * 25 >= t.participants.length} onClick={() => setSeedPage(seedPage + 1)}>Seeds siguientes</button>
        <button className="bracket-button primary" onClick={() => run(() => { onSave(drawTournament(t)) })}>{t.seeds.length ? 'Volver a sortear' : 'Generar bracket'}</button>
        <button className="bracket-button" disabled={!t.previousSeeds} onClick={() => run(() => { onSave(restoreDistribution(t)) })}>Restaurar distribución anterior</button></div>
      <p className="text-xs text-slate-400">Después de cambiar seeds, pulsa Generar bracket / Volver a sortear para aplicarlos. Los intercambios manuales prevalecen sobre los seeds.</p>
    </div>}
    {t.seeds.length > 0 && <details><summary className="cursor-pointer font-bold">{t.status === 'started' ? 'Corrección administrativa de posiciones' : 'Intercambiar / asignar posiciones'}</summary>
      <p className="my-3 text-sm text-slate-400">Elige un jugador y la posición destino: intercambia ambos lugares, incluso con un BYE. {t.status === 'started' && 'Se invalidarán solo los encuentros afectados y sus dependencias. No se permite sortear nuevamente ni sustituir el roster iniciado.'}</p>
      <div className="flex flex-wrap gap-3">{([a, b] as const).map((value, i) => <label key={i} className="min-w-0 flex-1">{i ? 'Posición destino' : 'Posición de origen'}<select className="form-control" value={value} onChange={e => i ? setB(Number(e.target.value)) : setA(Number(e.target.value))}>{t.seeds.map((id, position) => <option key={position} value={position}>{position + 1} · {t.participants.find(p => p.id === id)?.nickname ?? 'BYE'}</option>)}</select></label>)}
        <button className="bracket-button" onClick={() => run(() => {
          const proposal = swapPositions(t, a, b)
          if (t.status === 'started' && !window.confirm(`¿Corregir estas posiciones? Se invalidarán estos resultados e historiales: ${proposal.invalidated.join(', ') || 'ninguno'}. Los demás se conservarán.`)) return
          onSave(proposal.tournament)
        })}>Intercambiar posiciones</button></div>
    </details>}
  </section>
}
