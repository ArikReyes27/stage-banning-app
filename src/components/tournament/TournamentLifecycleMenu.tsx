import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ManagedTournament } from '../../lib/remoteTournaments'
import { lifecycleAvailable, lifecycleError, lifecycleMutation, lifecycleName, lifecycleReview, type LifecycleReview } from '../../lib/tournamentLifecycle'
import { workspaceKey } from '../../lib/tournamentWorkspace'
import { AUTH_TEST_PROJECT_REF } from '../../lib/authTestProject'
import { snapshotIsEmpty } from '../../lib/cloudDrafts'

type Action = 'rename' | 'archive' | 'restore' | 'delete'
const button = 'focus-ring rounded-xl border border-white/15 px-4 py-3 text-sm font-bold disabled:opacity-40'
export function TournamentLifecycleMenu({ client, tournament: t, userId, disabled, changed }: { client: SupabaseClient; tournament: ManagedTournament; userId: string; disabled: boolean; changed: () => void }) {
  const [action, setAction] = useState<Action | null>(null)
  const available = t.role === 'owner' && lifecycleAvailable(t)
  return <>
    <details className="relative mt-3" aria-label={`Administrar ${t.name}`}>
      <summary aria-label={`Opciones de ${t.name}`} className={`${button} inline-block cursor-pointer text-cyan-200`}>⋯</summary>
      <div className="mt-2 flex flex-wrap gap-2 rounded-xl border border-violet-300/20 bg-[#101426] p-3">
        <button className={button} disabled={disabled || !available} onClick={() => setAction('rename')}>Renombrar torneo</button>
        <button className={button} disabled={disabled || !available} onClick={() => setAction(t.archived_at ? 'restore' : 'archive')}>{t.archived_at ? 'Restaurar torneo' : 'Archivar torneo'}</button>
        <button className={`${button} text-rose-300`} disabled={disabled || !available} onClick={() => setAction('delete')}>Eliminar torneo</button>
        {!available && <p className="w-full text-xs text-slate-400">{t.role !== 'owner' ? 'Solo el propietario puede renombrar, archivar o eliminar.' : 'Acciones bloqueadas hasta aplicar y verificar la migración 15.5C en el proyecto de pruebas.'}</p>}
      </div>
    </details>
    {action && <LifecycleDialog key={action} action={action} client={client} tournament={t} userId={userId} close={() => setAction(null)} changed={changed} />}
  </>
}

function LifecycleDialog({ action, client, tournament: t, userId, close, changed }: { action: Action; client: SupabaseClient; tournament: ManagedTournament; userId: string; close: () => void; changed: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), active = useRef(false), pending = useRef(false)
  const [review, setReview] = useState<LifecycleReview | null>(null), [error, setError] = useState('')
  const [value, setValue] = useState(''), [busy, setBusy] = useState(false)
  const [backup, setBackup] = useState<{ raw: string | null } | null>(null), [confirmed, setConfirmed] = useState(false)
  const key = workspaceKey(AUTH_TEST_PROJECT_REF, userId, t.id)
  const title = { rename: 'Renombrar torneo', archive: 'Archivar torneo', restore: 'Restaurar torneo', delete: 'Eliminar torneo permanentemente' }[action]
  useEffect(() => {
    active.current = true
    const element = dialog.current; element?.showModal()
    let cancelled = false
    void lifecycleReview(client, t).then(data => { if (!cancelled) { setReview(data); setValue(action === 'rename' ? data.snapshot.name : '') } }).catch(e => { if (!cancelled) setError(lifecycleError(e)) })
    return () => { cancelled = true; active.current = false; element?.close() }
  }, [action, client, t])
  function download() {
    if (!review) return
    try {
      const raw = window.localStorage.getItem(key)
      const document = JSON.stringify({ format: 'stage-strike-deletion-backup-v1', capturedAt: new Date().toISOString(), remote: review.snapshot, localWorkspaceRaw: raw,
        note: 'Copia del snapshot remoto y del espacio local de esta cuenta. No incluye datos de otros dispositivos ni historial administrativo o invitaciones.' }, null, 2)
      const url = URL.createObjectURL(new Blob([document], { type: 'application/json' }))
      const link = window.document.createElement('a'); link.href = url; link.download = `stage-strike-respaldo-${t.id}.json`; link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000); setBackup({ raw }); setConfirmed(false); setError('')
    } catch { setError('No se pudo preparar el respaldo. La eliminación permanece bloqueada.'); setBackup(null) }
  }
  async function submit() {
    if (!review || pending.current) return
    if (action === 'rename') { try { lifecycleName(value) } catch (e) { setError((e as Error).message); return } }
    if (action === 'delete' && (!backup || !confirmed || value !== review.snapshot.name)) return
    pending.current = true; setBusy(true); setError('')
    try {
      if (action === 'delete') {
        if (window.localStorage.getItem(key) !== backup!.raw) { setBackup(null); setConfirmed(false); throw new Error('changed backup') }
        // Additional durable local receipt before requesting deletion. Never remove workspace keys.
        window.localStorage.setItem(`${key}:before-delete:${Date.now()}`, JSON.stringify({ remote: review.snapshot, localWorkspaceRaw: backup!.raw }))
      }
      await lifecycleMutation(client, review, action, value)
      if (active.current) { changed(); close() }
    } catch (e) { if (active.current) { setError(e instanceof Error && e.message === 'changed backup' ? 'El espacio local cambió. Descarga un respaldo nuevo antes de eliminar.' : lifecycleError(e)); setReview(null) } }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  return <dialog ref={dialog} onCancel={e => { e.preventDefault(); if (!pending.current) close() }} className="m-auto max-h-[90dvh] w-[min(94vw,38rem)] overflow-auto rounded-2xl border border-cyan-300/25 bg-[#0c1022] p-6 text-slate-100 backdrop:bg-black/80" aria-label={title}>
    <h2 className="text-xl font-black">{title}</h2>
    <p className="my-3 break-words">Nombre actual: <strong>{review?.snapshot.name ?? t.name}</strong></p>
    {!review && !error && <p role="status">Comprobando propietario y revisión…</p>}
    {error && <p role="alert" className="my-3 text-rose-300">{error} Cierra y actualiza la lista antes de reabrir.</p>}
    {review && <>
      {action === 'rename' && <label className="block">Nuevo nombre<input autoFocus className="form-control my-3" aria-label="Nuevo nombre" maxLength={200} value={value} disabled={busy} onChange={e => setValue(e.target.value)} /></label>}
      {(action === 'archive' || action === 'restore') && <p className="my-4 text-slate-300">{action === 'archive' ? 'Se moverá a Archivados.' : 'Volverá a Activos.'} Sus datos, participantes y permisos se conservarán.</p>}
      {action === 'delete' && <div className="my-4 space-y-4">
        <p className="font-bold text-rose-300">Se eliminarán permanentemente este torneo remoto, roster, bracket, revisiones, miembros, invitaciones y reportes. No se puede deshacer. Archivar conserva esos datos.</p>
        <p className="text-amber-200">{snapshotIsEmpty(review.snapshot) ? 'El remoto no tiene un snapshot del torneo local.' : 'El snapshot remoto puede ser solo un borrador y no contener tus partidas locales.'} No hay sincronización competitiva; las copias de otros dispositivos no están incluidas.</p>
        <p className="text-sm text-slate-300">Se conservarán las copias y respaldos locales. El respaldo descargado incluye el snapshot remoto y el espacio local de esta cuenta; no es una copia integral de permisos, auditoría u otros dispositivos. No se eliminan cuentas ni otros eventos.</p>
        <button className={button} disabled={busy} onClick={download}>Descargar respaldo JSON</button>
        <label className="flex gap-3 text-sm"><input type="checkbox" checked={confirmed} disabled={!backup || busy} onChange={e => setConfirmed(e.target.checked)} />He guardado el respaldo y entiendo sus límites y la eliminación permanente.</label>
        <label className="block">Escribe exactamente el nombre del torneo<input className="form-control mt-2" aria-label="Confirmar nombre del torneo" autoComplete="off" value={value} disabled={busy} onChange={e => setValue(e.target.value)} /></label>
      </div>}
    </>}
    <div className="mt-5 flex flex-wrap gap-3"><button className={`${button} ${action === 'delete' ? 'text-rose-300' : 'text-cyan-200'}`} disabled={busy || !review || (action === 'delete' && (!backup || !confirmed || value !== review.snapshot.name))} onClick={() => void submit()}>{busy ? 'Procesando…' : action === 'delete' ? 'Eliminar permanentemente' : 'Guardar cambio'}</button><button className={button} disabled={busy} onClick={close}>Cancelar</button></div>
  </dialog>
}
