import { useEffect, useRef, useState, type ReactNode } from 'react'
import { getAuthTestClient } from '../../lib/authClient'
import { AUTH_TEST_PROJECT_REF } from '../../lib/authTestProject'
import { loadTournamentDashboard, type ManagedTournament } from '../../lib/remoteTournaments'
import { ensureWorkspace, workspaceKey, workspaceStorage, readWorkspace, parseWorkspace } from '../../lib/tournamentWorkspace'
import { WorkspaceContext } from '../../hooks/workspaceContext'
import { navigateTo } from '../../app/navigation'
import { parseTournament } from '../../utils/tournamentValidation'
import { validateRegistration, emptyRegistration, REGISTRATION_KEY } from '../../utils/registration'
import { TOURNAMENT_STORAGE_KEY } from '../../utils/tournamentStorage'

const button = 'bracket-button'
export function TournamentWorkspace({ id, children }: { id: string | null; children: ReactNode }) {
  const [access, setAccess] = useState<{ user: string; rows: ManagedTournament[] } | null>(null)
  const [error, setError] = useState(''), [checking, setChecking] = useState(true)
  const [client] = useState(getAuthTestClient)
  useEffect(() => {
    let live = true, generation = 0
    const check = async () => {
      const ticket = ++generation
      setChecking(true)
      try {
        const session = await client?.auth.getSession()
        const user = session?.data.session?.user.id
        if (!client || !user) { if (live && ticket === generation) { setAccess(null); setError('Inicia sesión para abrir un torneo de Mis torneos.') }; return }
        const data = await loadTournamentDashboard(client, user)
        if (live && ticket === generation) { setAccess({ user, rows: data.tournaments }); setError('') }
      } catch { if (live && ticket === generation) { setAccess(null); setError('No se pudieron comprobar los permisos. Tus datos locales se conservan. Reabre el torneo con conexión.') } }
      finally { if (live && ticket === generation) setChecking(false) }
    }
    // Defer Supabase queries outside the synchronous Auth callback.
    const subscription = client?.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') setAccess(null); queueMicrotask(() => { if (live) void check() }) }).data.subscription
    void check()
    const focus = () => void check()
    window.addEventListener('focus', focus)
    const timer = setInterval(focus, 60000)
    return () => { live = false; generation++; subscription?.unsubscribe(); window.removeEventListener('focus', focus); clearInterval(timer) }
  }, [client, id])
  const current = access?.rows.find(t => t.id === id)
  const toolbar = window.location.pathname.endsWith('/presentation') ? <p className="p-3 text-cyan-200">{current?.name ?? 'Local anterior'}</p> : <section className="mx-auto my-4 max-w-6xl rounded-xl border border-cyan-300/20 bg-[#0c1022] p-4" aria-label="Torneo actual">
    <p className="font-bold text-cyan-200">Torneo actual: {id ? current?.name ?? 'Comprobando acceso' : 'Local anterior (sin vínculo)'}</p>
    <label className="mt-3 block text-sm">Cambiar torneo<select aria-label="Cambiar torneo" className="form-control mt-2" value={id ?? ''} disabled={checking} onChange={e => {
      if (!window.confirm('¿Cambiar de torneo? Los cambios guardados se conservan; termina o descarta cualquier formulario pendiente.')) return
      navigateTo(`/registration?${e.target.value ? `event=${encodeURIComponent(e.target.value)}` : 'local=1'}`)
    }}><option value="">Local anterior (sin vínculo)</option>{access?.rows.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
    <button className={`${button} mt-3`} onClick={() => navigateTo('/my-tournaments')}>Mis torneos</button>
    {id && <p className="mt-2 text-sm text-slate-400">Registro y resultados guardados solo en este navegador y esta cuenta. No están sincronizados con Supabase. Consulta «Datos en nube» para comprobar el borrador remoto.</p>}
  </section>
  if (!id) return <>{toolbar}{children}</>
  if (!current || !access) return <>{toolbar}<p role="status" className="p-6">{checking ? 'Comprobando permisos…' : error || 'Tu cuenta no administra este torneo. Los datos locales no se han eliminado.'}</p></>
  return <>{toolbar}<WorkspaceData key={`${access.user}:${id}`} user={access.user} tournament={current}>{children}</WorkspaceData></>
}

function WorkspaceData({ user, tournament, children }: { user: string; tournament: ManagedTournament; children: ReactNode }) {
  const key = workspaceKey(AUTH_TEST_PROJECT_REF, user, tournament.id)
  const permitted = useRef(false)
  const [storage, setStorage] = useState<ReturnType<typeof workspaceStorage> | null>(null)
  const [readOnly, setReadOnly] = useState(false), [epoch, setEpoch] = useState(0)
  const [ready, setReady] = useState(false), [error, setError] = useState('')
  useEffect(() => {
    let live = true, release: (() => void) | undefined
    if (!navigator.locks) { queueMicrotask(() => { if (live) setError('Este navegador no permite bloquear el espacio entre pestañas. Usa un navegador actualizado.') }); return }
    // Defer acquisition so StrictMode's discarded mount cannot race the live mount.
    void Promise.resolve().then(() => {
      if (!live) return
      return navigator.locks.request(key, { ifAvailable: true }, async lock => {
      if (!live) return
      if (!lock) {
        try { readWorkspace(window.localStorage, key); setStorage(workspaceStorage(key, () => false)); setReadOnly(true); setReady(true) }
        catch { setError('No se puede leer el espacio local. Conserva su respaldo.') }
        return
      }
      try { ensureWorkspace(window.localStorage, key); permitted.current = true; setStorage(workspaceStorage(key, () => permitted.current)); setReady(true) }
      catch { setError('No se pudo abrir o respaldar el espacio local. El original se conserva. Revisa espacio disponible y respaldos.'); return }
      await new Promise<void>(resolve => { release = resolve })
      })
    }).catch(() => { if (live) setError('No se pudo obtener acceso exclusivo al espacio local.') })
    return () => { live = false; permitted.current = false; release?.() }
  }, [key])
  return <>{error && <p role="alert" className="p-5 text-amber-200">{error}</p>}{ready && storage && <WorkspaceContext.Provider value={{ storage, key, name: tournament.name }}>
    {readOnly && <p className="p-4 text-amber-200">Solo lectura: este torneo ya está abierto en otra pestaña. Cierra aquella y reabre esta para editar.</p>}
    {!readOnly && <LegacyImport workspaceKey={key} permitted={() => permitted.current} replaced={() => setEpoch(v => v + 1)} />}
    <fieldset disabled={readOnly} className="min-w-0 border-0 p-0" key={epoch}>{children}</fieldset>
  </WorkspaceContext.Provider>}</>
}

function LegacyImport({ workspaceKey: key, permitted, replaced }: { workspaceKey: string; permitted: () => boolean; replaced: () => void }) {
  const [preview, setPreview] = useState<{ tournament: string | null; registration: string | null; checkpoint?: string } | null>(null)
  const [message, setMessage] = useState('')
  function review() {
    try {
      const tournament = window.localStorage.getItem(TOURNAMENT_STORAGE_KEY), registration = window.localStorage.getItem(REGISTRATION_KEY)
      if (tournament) parseTournament(tournament)
      if (registration) validateRegistration(JSON.parse(registration))
      if (!tournament && !registration) throw new Error('No hay datos antiguos en este origen. Puedes importar tus archivos desde Registro o Bracket.')
      setPreview({ tournament, registration }); setMessage('')
    } catch (e) { setPreview(null); setMessage((e as Error).message) }
  }
  return <details className="mx-auto max-w-6xl p-4 text-sm"><summary className="cursor-pointer">Recuperar datos locales anteriores</summary>
    <p className="my-2">Solo se copian con tu confirmación. El original queda intacto y se respalda el destino. No se envían a Supabase.</p>
    <button className={button} onClick={review}>Vista previa de datos antiguos</button>
    <button className={`${button} ml-2`} onClick={() => {
      try {
        const raw = window.localStorage.getItem(`${key}:backup`)
        if (raw === null) throw new Error('Todavía no hay respaldo anterior de este espacio.')
        const w = parseWorkspace(raw)
        setPreview({ tournament: w.tournament, registration: JSON.stringify(w.registration), checkpoint: raw }); setMessage('Vista previa del último respaldo de este torneo. No son los datos globales antiguos.')
      } catch (e) { setPreview(null); setMessage((e as Error).message) }
    }}>Vista previa del respaldo anterior</button>
    {message && <p role="status">{message}</p>}
    {preview && <div className="my-3 space-y-3">
      <p>{preview.registration ? validateRegistration(JSON.parse(preview.registration)).participants.length : 0} registrados · {preview.tournament ? parseTournament(preview.tournament).participants.length : 0} participantes en bracket · {preview.tournament ? Object.keys(parseTournament(preview.tournament).results).length : 0} resultados</p>
      <p className="max-h-32 overflow-auto">{preview.tournament && parseTournament(preview.tournament).participants.map(p => p.nickname || '(vacío)').join(' · ')}</p>
      <button className={button} onClick={() => {
        if (!window.confirm('¿Copiar estos datos al torneo seleccionado? Se reemplazarán su registro y bracket locales. Se conservará un respaldo del destino. El original antiguo no se modifica.')) return
        try {
          if (!permitted()) throw new Error('El contexto cambió. Reabre el torneo.')
          if (preview.checkpoint ? window.localStorage.getItem(`${key}:backup`) !== preview.checkpoint : window.localStorage.getItem(TOURNAMENT_STORAGE_KEY) !== preview.tournament || window.localStorage.getItem(REGISTRATION_KEY) !== preview.registration) throw new Error('Los datos de origen cambiaron. Revisa otra vista previa.')
          const raw = window.localStorage.getItem(key); readWorkspace(window.localStorage, key)
          if (raw !== null) window.localStorage.setItem(`${key}:before-import:${Date.now()}`, raw)
          window.localStorage.setItem(key, JSON.stringify({ version: 1, registration: preview.registration ? validateRegistration(JSON.parse(preview.registration)) : emptyRegistration(), tournament: preview.tournament }))
          setPreview(null); setMessage('Copia local recuperada. No sincronizada.')
          window.dispatchEvent(new CustomEvent('workspace-saved', { detail: key }))
          replaced()
        } catch (e) { setMessage((e as Error).message) }
      }}>Confirmar recuperación</button>
    </div>}
  </details>
}
