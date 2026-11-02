import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cloudDraftError, initializeCloudDraft, previewDraft, snapshotExport, snapshotIsEmpty, type CloudSnapshot, type DraftPreview } from '../../lib/cloudDrafts'
import { readWorkspace, workspaceKey } from '../../lib/tournamentWorkspace'
import { loadRemoteStatus, readFailureMessage, type RemoteStatus } from '../../lib/remoteStatus'
import { AUTH_TEST_PROJECT_REF } from '../../lib/authTestProject'
import { MAX_TOURNAMENT_JSON } from '../../utils/tournamentValidation'

const button = 'focus-ring rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-cyan-200 disabled:opacity-50'
function download(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function CloudDraftPanel({ client, id, name, userId, busy: parentBusy }: { client: SupabaseClient; id: string; name: string; userId: string; busy: boolean }) {
  const localKey = workspaceKey(AUTH_TEST_PROJECT_REF, userId, id)
  const [snapshot, setSnapshot] = useState<CloudSnapshot | null>(null)
  const [status, setStatus] = useState<RemoteStatus | null>(null)
  const [preview, setPreview] = useState<DraftPreview | null>(null)
  const [source, setSource] = useState<'local' | 'file'>('local')
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('')
  const [backup, setBackup] = useState(false), [confirmed, setConfirmed] = useState(false)
  const active = useRef(false), pending = useRef(false)
  useEffect(() => { active.current = true; return () => { active.current = false } }, [])
  const disabled = busy || parentBusy
  async function read() {
    if (pending.current) return
    pending.current = true; setBusy(true); setError(''); setSnapshot(null); setStatus(null); setConfirmed(false)
    try {
      // Read-only: the remote snapshot of THIS id is compared with THIS id's local workspace; nothing is written.
      const next = await loadRemoteStatus(client, window.localStorage, AUTH_TEST_PROJECT_REF, userId, id, navigator.onLine)
      if (!active.current) return
      setStatus(next)
      if (next.ok) setSnapshot(next.snapshot)
      else setError(readFailureMessage(next.failure) ?? cloudDraftError(null))
    } catch { if (active.current) setError(cloudDraftError(null)) }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  function prepare(raw: string, origin: 'local' | 'file') {
    setPreview(null); setBackup(false); setConfirmed(false); setError(''); setNotice('')
    try { setPreview(previewDraft(raw)); setSource(origin) }
    catch { setError('El JSON no es un torneo local válido. El original no se modificó; conserva una copia para revisarlo.') }
  }
  function local() {
    try {
      const raw = readWorkspace(window.localStorage, localKey).tournament
      if (raw === null) { setPreview(null); setBackup(false); setConfirmed(false); setError('Este torneo aún no tiene bracket local. Usa Abrir torneo → Registro → Bracket para preparar sus participantes, o elige explícitamente un JSON.'); return }
      prepare(raw, 'local')
    } catch { setPreview(null); setBackup(false); setConfirmed(false); setError('No se pudo leer el almacenamiento local. Puedes elegir un archivo JSON.') }
  }
  async function file(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0]; event.target.value = ''
    if (!picked || pending.current) return
    setPreview(null); setBackup(false); setConfirmed(false)
    if (picked.size > MAX_TOURNAMENT_JSON) { setError('El archivo supera 10 MB. No se leyó ni modificó.'); return }
    pending.current = true; setBusy(true)
    try { const raw = await picked.text(); if (active.current) prepare(raw, 'file') }
    catch { if (active.current) setError('No se pudo leer el archivo.') }
    finally { pending.current = false; if (active.current) setBusy(false) }
  }
  async function upload() {
    if (pending.current || !preview || !snapshot || preview.blocked || !backup || !confirmed || !snapshotIsEmpty(snapshot)) return
    if (!window.confirm(`¿Guardar este borrador de ${preview.tournament.participants.length} participantes en «${name}»? Se exige que el remoto siga vacío. Tu torneo local no cambiará.`)) return
    pending.current = true; setBusy(true); setError(''); setNotice('')
    const importId = crypto.randomUUID()
    try {
      if (source === 'local' && readWorkspace(window.localStorage, localKey).tournament !== preview.raw) {
        setPreview(null); setBackup(false); throw { code: 'LOCAL_CHANGED' }
      }
      const revision = await initializeCloudDraft(client, snapshot, preview, importId)
      if (!active.current) return
      setNotice(`Borrador guardado en ${id}, revisión ${revision}. Vinculación: ${importId}. El JSON local permanece intacto.`)
      setSnapshot(null); setConfirmed(false)
    } catch (failure) {
      if (active.current) { setError(cloudDraftError(failure)); setSnapshot(null); setConfirmed(false) }
    } finally { pending.current = false; if (active.current) setBusy(false) }
  }
  function exportRemote() {
    if (!snapshot) return
    try { download(snapshotExport(snapshot), 'stage-strike-torneo-remoto.json') }
    catch { setError('Este snapshot no puede convertirse sin pérdida al JSON local. Descarga el snapshot completo; no se cambió ningún dato.') }
  }
  return <section className="rounded-2xl border border-white/10 bg-[#0c1022]/90 p-5 sm:p-6" aria-label="Datos del torneo en nube">
    <h2 className="text-xl font-bold">Datos en nube · {name}</h2>
    <p className="mt-3 text-sm text-cyan-200">La vista previa usa exclusivamente el espacio local de «{name}» de esta cuenta. Guardar localmente no significa guardar en Supabase.</p>
    <p className="my-3 text-sm leading-6 text-slate-400">Carga inicial de borradores sin sorteo, resultados, prioridades ni personajes. Los torneos avanzados se respaldan, pero no se suben todavía. Nunca se reemplaza un remoto con datos.</p>
    <button type="button" className={button} disabled={disabled} onClick={() => void read()}>Consultar snapshot remoto</button>
    {busy && <p role="status" className="mt-3 text-sm text-slate-300">Procesando…</p>}
    {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
    {notice && <p role="status" className="mt-3 break-words text-sm text-cyan-200">{notice}</p>}
    {status?.ok && <div className="mt-4 space-y-1 rounded-xl border border-white/10 p-3 text-sm text-slate-300" role="status" aria-label="Estado remoto del torneo">
      <p className="font-semibold text-cyan-200">Estado remoto · revisión {status.remote.revision}{status.remote.linked ? ' · borrador vinculado' : ''}</p>
      {status.comparison.lines.map(line => <p key={line}>{line}</p>)}
      {status.comparison.localOnlyResults && <p className="font-semibold text-amber-200">Solo local: respalda estos resultados antes de cambiar de dispositivo.</p>}
      <p className="text-xs text-slate-500">Consulta de solo lectura: no importa, publica ni sincroniza resultados entre dispositivos.</p>
    </div>}
    {snapshot && <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
      <p className="text-sm text-slate-300">Revisión {snapshot.revision} · {snapshot.roster.length} participantes · {snapshotIsEmpty(snapshot) ? 'Remoto vacío' : 'Remoto con datos: solo lectura'}</p>
      {snapshot.import_id && <p className="break-all text-xs text-slate-400">Vinculación guardada: {snapshot.import_id}</p>}
      <details className="text-sm text-slate-400"><summary className="cursor-pointer">Ver participantes remotos</summary><ol className="mt-2 list-inside list-decimal">{snapshot.roster.map(p => <li key={p.id}>{p.nickname} · {p.id}</li>)}</ol></details>
      <div className="flex flex-wrap gap-2"><button type="button" className={button} disabled={disabled || !snapshot.roster.length} onClick={exportRemote}>Descargar torneo JSON</button><button type="button" className={button} disabled={disabled} onClick={() => download(JSON.stringify(snapshot, null, 2), 'stage-strike-snapshot-remoto.json')}>Descargar snapshot completo</button></div>
      <p className="text-xs text-slate-500">Para abrirlo en otro dispositivo, descarga el torneo JSON e impórtalo con la opción local existente, después de respaldar el torneo de ese dispositivo.</p>
    </div>}
    <div className="mt-6 border-t border-white/10 pt-5">
      <h3 className="font-bold">Vincular un borrador local</h3>
      <div className="my-3 flex flex-wrap items-center gap-3"><button type="button" className={button} disabled={disabled} onClick={local}>Vista previa del torneo local</button><label className="text-sm text-slate-300">O elegir JSON<input className="mt-2 block max-w-full text-xs" aria-label="Archivo de torneo JSON" type="file" accept=".json,application/json" disabled={disabled} onChange={event => void file(event)} /></label></div>
      {preview && <div className="space-y-3">
        <p className="text-sm text-slate-300">Versión {preview.tournament.schemaVersion} · {preview.tournament.status} · {preview.tournament.participants.length} participantes · {Object.keys(preview.tournament.results).length} resultados</p>
        <details className="text-sm text-slate-400"><summary className="cursor-pointer">Revisar roster que se guardará</summary><ol className="mt-2 list-inside list-decimal">{preview.tournament.participants.map(p => <li key={p.id}>{p.nickname || '(sin nickname)'} · {p.id}</li>)}</ol></details>
        {preview.blocked && <p role="status" className="text-sm text-amber-200">{preview.blocked}</p>}
        <button type="button" className={button} disabled={disabled} onClick={() => { download(preview.raw, 'stage-strike-respaldo-antes-de-nube.json'); setBackup(true) }}>Descargar respaldo JSON original</button>
        <label className="flex items-start gap-3 text-sm text-slate-300"><input className="mt-1" type="checkbox" disabled={disabled || !backup} checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />He guardado el respaldo y revisado el roster y el torneo remoto de destino.</label>
        <button type="button" className="focus-ring rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50" disabled={disabled || !snapshot || !snapshotIsEmpty(snapshot) || !!preview.blocked || !backup || !confirmed} onClick={() => void upload()}>Confirmar carga inicial</button>
      </div>}
    </div>
  </section>
}
