import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { getAuthTestClient } from '../lib/authClient'
import { navigateTo } from '../app/navigation'
import { CloudDraftPanel } from '../components/tournament/CloudDraftPanel'
import { TournamentLifecycleMenu } from '../components/tournament/TournamentLifecycleMenu'
import { ensureWorkspace, workspaceKey } from '../lib/tournamentWorkspace'
import { AUTH_TEST_PROJECT_REF } from '../lib/authTestProject'
import {
  acceptAdminInvitation, createRemoteTournament, inviteAdministrator, loadTournamentAccess,
  loadTournamentDashboard, revokeAdministrator, tournamentError, validAccountId,
  type AdminInvitation, type ManagedTournament, type TournamentAccess,
} from '../lib/remoteTournaments'

const card = 'rounded-2xl border border-white/10 bg-[#0c1022]/90 p-5 sm:p-6'
const primary = 'focus-ring rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-50'
const secondary = 'focus-ring rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-cyan-200 disabled:opacity-50'
const input = 'focus-ring w-full rounded-xl border border-white/15 bg-[#060814] px-4 py-3 text-white'

export function MyTournamentsPage() {
  const [client] = useState(getAuthTestClient)
  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">STAGE//STRIKE · Proyecto de pruebas</p>
    <h1 className="text-3xl font-black">Mis torneos</h1>
    <p className="mb-8 mt-3 max-w-2xl text-sm leading-6 text-slate-400">Crea torneos y comparte su administración. El bracket y los resultados locales siguen separados; no se sincronizan desde esta página.</p>
    {client ? <AuthenticatedTournaments client={client} /> : <section className={card}><h2 className="font-bold">Disponible solo en el modo de cuentas de prueba</h2><p className="mt-3 text-sm text-slate-400">Comprueba la configuración de auth-tests. Puedes seguir usando el juego local sin cuenta.</p></section>}
    <button type="button" className={`${secondary} mt-6`} onClick={() => navigateTo('/')}>Volver al juego local</button>
  </main>
}

function AuthenticatedTournaments({ client }: { client: SupabaseClient }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true, events = 0
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => {
      events++
      if (active) { setSession(next); setLoading(false); setError('') }
    })
    const initial = events
    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (events === initial) setSession(data.session)
      setLoading(false)
      if (sessionError) setError('No se pudo comprobar la sesión. Abre Cuenta e inicia sesión de nuevo.')
    }).catch(() => { if (active) { setLoading(false); setError('No se pudo comprobar la sesión. Abre Cuenta para intentarlo de nuevo.') } })
    return () => { active = false; subscription.unsubscribe() }
  }, [client])
  if (loading) return <p role="status">Comprobando sesión…</p>
  if (error || !session) return <section className={card}>
    <h2 className="text-xl font-bold">Inicia sesión para administrar tus torneos</h2>
    {error && <p role="alert" className="mt-3 text-rose-300">{error}</p>}
    <button type="button" className={`${primary} mt-5`} onClick={() => navigateTo('/account')}>Ir a Cuenta</button>
  </section>
  return <TournamentDashboard key={session.user.id} client={client} userId={session.user.id} />
}

type RunMutation = (work: () => Promise<unknown>, success: string) => Promise<boolean>

function TournamentDashboard({ client, userId }: { client: SupabaseClient; userId: string }) {
  const [tournaments, setTournaments] = useState<ManagedTournament[]>([])
  const [invitations, setInvitations] = useState<AdminInvitation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cloudId, setCloudId] = useState<string | null>(null)
  const [version, setVersion] = useState(0)
  const [loadedAt, setLoadedAt] = useState(Date.now)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [stale, setStale] = useState(false)
  const [name, setName] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const active = useRef(false), pending = useRef(false), generation = useRef(0)
  const [localError, setLocalError] = useState('')
  const [filter, setFilter] = useState<'active' | 'archived' | 'all'>('active')

  const reload = useCallback(async () => {
    const ticket = ++generation.current
    try {
      const data = await loadTournamentDashboard(client, userId)
      if (!active.current || ticket !== generation.current) return
      setTournaments(data.tournaments); setInvitations(data.invitations)
      setLoadedAt(Date.now())
      setStale(false); setError(''); setVersion(v => v + 1)
    } catch (failure) {
      if (!active.current || ticket !== generation.current) return
      setTournaments([]); setInvitations([]); setSelectedId(null)
      setError(tournamentError(failure)); setStale(true)
    } finally { if (active.current && ticket === generation.current) setLoading(false) }
  }, [client, userId])
  useEffect(() => {
    active.current = true
    let cancelled = false
    void Promise.resolve().then(() => { if (!cancelled) return reload() })
    return () => { cancelled = true; active.current = false }
  }, [reload])

  const run: RunMutation = async (work, success) => {
    if (pending.current || loading || stale) return false
    pending.current = true; setBusy(true); setError(''); setNotice('')
    try {
      await work()
      if (!active.current) return false
      setNotice(success); setLoading(true)
      await reload()
      return active.current
    } catch (failure) {
      if (active.current) { setError(tournamentError(failure)); setStale(true); setSelectedId(null) }
      return false
    } finally { pending.current = false; if (active.current) setBusy(false) }
  }
  async function create(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || [...name.trim()].length > 200) { setError('Escribe un nombre de 1 a 200 caracteres.'); return }
    if (await run(async () => {
      const id = await createRemoteTournament(client, name)
      try { ensureWorkspace(window.localStorage, workspaceKey(AUTH_TEST_PROJECT_REF, userId, id)); setLocalError('') }
      catch { setLocalError('El torneo remoto fue creado, pero no se pudo preparar su espacio local. No vuelvas a crearlo: libera espacio y usa Abrir torneo.') }
    }, 'Torneo creado. Tu cuenta es la propietaria. Usa Abrir torneo para registrar participantes.')) setName('')
  }
  const disabled = busy || loading || stale
  const selected = tournaments.find(t => t.id === selectedId)
  const cloud = tournaments.find(t => t.id === cloudId)
  const filtered = tournaments.filter(t => filter === 'all' || (filter === 'archived' ? !!t.archived_at : !t.archived_at))
  return <div className="space-y-6">
    <section className={card}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="font-bold">Tu identificador de cuenta</h2><p className="mt-2 text-sm text-slate-400">Comparte este UUID con el propietario que quiera invitarte. No es una contraseña ni concede permisos por sí solo.</p><code className="mt-3 block select-all break-all text-sm text-cyan-200" data-testid="account-uuid">{userId}</code></div>
        <button type="button" className={secondary} disabled={busy || loading} onClick={() => { setLoading(true); setNotice(''); void reload() }}>Actualizar lista</button>
      </div>
    </section>
    {notice && <p role="status" className="text-sm text-cyan-200">{notice}</p>}
    {localError && <p role="alert" className="text-sm text-amber-200">{localError}</p>}
    {error && <p role="alert" className="text-sm leading-6 text-rose-300">{error}</p>}
    {loading && <p role="status" className="text-sm text-slate-300">Cargando torneos e invitaciones…</p>}
    <section className={card}>
      <h2 className="mb-4 text-xl font-bold">Crear torneo</h2>
      <form onSubmit={event => void create(event)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm text-slate-300">Nombre del torneo<input name="remote-tournament-name" className={`${input} mt-2`} required maxLength={200} value={name} disabled={disabled} onChange={e => setName(e.target.value)} /></label>
        <button type="submit" className={primary} disabled={disabled}>{busy ? 'Espera…' : 'Crear torneo'}</button>
      </form>
    </section>
    {!loading && <>
      <section className={card}>
        <h2 className="mb-4 text-xl font-bold">Torneos que administras</h2>
        <label className="mb-4 block text-sm">Mostrar<select aria-label="Filtrar torneos" className={`${input} mt-2`} value={filter} onChange={e => setFilter(e.target.value as typeof filter)}><option value="active">Activos</option><option value="archived">Archivados</option><option value="all">Todos</option></select></label>
        {!stale && tournaments.length === 0 && <p className="text-sm text-slate-400">Aún no administras torneos. Crea uno o acepta una invitación.</p>}
        {tournaments.length > 0 && filtered.length === 0 && <p className="text-sm text-slate-400">No hay torneos en este filtro.</p>}
        <ul className="space-y-3">{filtered.map(t => <li key={t.id} className="rounded-xl border border-white/10 p-4">
          {t.archived_at && <p className="mb-2 text-sm font-bold text-violet-300">Archivado</p>}
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="break-words font-bold">{t.name}</h3><p className="mt-1 text-xs text-cyan-200">{t.role === 'owner' ? 'Propietario' : 'Coadministrador'}</p></div><button type="button" className={secondary} disabled={disabled} onClick={() => setSelectedId(t.id)}>Administradores</button></div>
          <button type="button" className={`${secondary} mt-3`} disabled={disabled} onClick={() => setCloudId(t.id)}>Datos en nube</button>
          <button type="button" className={`${primary} ml-2 mt-3`} disabled={disabled} onClick={() => navigateTo(`/registration?event=${encodeURIComponent(t.id)}`)}>Abrir torneo</button>
          <p className="mt-2 text-xs text-slate-400">Espacio local independiente. Los resultados no se sincronizan entre dispositivos.</p>
          <TournamentLifecycleMenu client={client} tournament={t} userId={userId} disabled={disabled} changed={() => { setSelectedId(null); setCloudId(null); setNotice('Cambio confirmado en Supabase. Las copias locales se conservan.'); setLoading(true); void reload() }} />
        </li>)}</ul>
      </section>
      {selected && !stale && <Administrators key={`${selected.id}:${version}`} client={client} tournament={selected} userId={userId} busy={busy} run={run} />}
      {cloud && !stale && <CloudDraftPanel key={`${cloud.id}:${version}`} client={client} id={cloud.id} name={cloud.name} userId={userId} busy={busy} />}
      <section className={card}>
        <h2 className="mb-4 text-xl font-bold">Invitaciones recibidas</h2>
        {!stale && invitations.length === 0 && <p className="text-sm text-slate-400">No tienes invitaciones pendientes.</p>}
        <ul className="space-y-3">{invitations.map(inv => {
          const expired = Date.parse(inv.expires_at) <= loadedAt
          return <li key={inv.id} className="rounded-xl border border-white/10 p-4 text-sm">
            <p className="font-bold">Invitación a coadministrar</p>
            <p className="mt-2 break-all text-slate-400">Torneo: {inv.tournament_id}</p>
            <p className="mt-1 break-all text-slate-400">Invita: {inv.invited_by}</p>
            <p className="mt-2 text-slate-400">{expired ? 'Caducada' : `Caduca: ${new Date(inv.expires_at).toLocaleString()}`}</p>
            <button type="button" className={`${primary} mt-3`} disabled={disabled || expired} onClick={() => void run(() => acceptAdminInvitation(client, inv.id), 'Invitación aceptada. Ya puedes ver el torneo compartido.')}>Aceptar invitación</button>
          </li>
        })}</ul>
        <p className="mt-4 text-xs leading-5 text-slate-500">Antes de aceptar solo se muestra el identificador del torneo. Confirma la invitación con su propietario si no la esperabas.</p>
      </section>
    </>}
  </div>
}

function Administrators({ client, tournament, userId, busy, run }: { client: SupabaseClient; tournament: ManagedTournament; userId: string; busy: boolean; run: RunMutation }) {
  const [access, setAccess] = useState<TournamentAccess | null>(null)
  const [error, setError] = useState('')
  const [invitee, setInvitee] = useState('')
  useEffect(() => {
    let active = true
    void loadTournamentAccess(client, tournament).then(data => { if (active) setAccess(data) }).catch(failure => { if (active) setError(tournamentError(failure)) })
    return () => { active = false }
  }, [client, tournament])
  async function invite(event: FormEvent) {
    event.preventDefault()
    if (!access) return
    if (!validAccountId(invitee) || invitee.trim().toLowerCase() === userId.toLowerCase()) { setError('Pega el UUID de otra cuenta, no un nickname ni un correo.'); return }
    setError('')
    await run(() => inviteAdministrator(client, tournament.id, access.revision, invitee), 'Invitación enviada. Los permisos se concederán cuando la cuenta destinataria la acepte.')
  }
  function revoke(profileId: string, pendingInvitation: boolean) {
    if (!access) return
    const question = pendingInvitation
      ? `¿Cancelar la invitación de la cuenta ${profileId} en «${tournament.name}»? Si ya aceptó, también se revocará su administración.`
      : `¿Revocar la administración de la cuenta ${profileId} en «${tournament.name}»? También se cancelarán sus invitaciones pendientes.`
    if (!window.confirm(question)) return
    void run(() => revokeAdministrator(client, tournament.id, access.revision, profileId), 'Permisos e invitaciones pendientes de esa cuenta revocados.')
  }
  return <section className={card} aria-label="Administradores del torneo">
    <h2 className="text-xl font-bold">Administradores · {tournament.name}</h2>
    <p className="mt-3 break-all text-sm text-slate-400">Propietario: {tournament.owner_id}</p>
    {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error} Usa “Actualizar lista” para reintentar.</p>}
    {!access && !error && <p role="status" className="mt-3 text-sm text-slate-400">Cargando administradores…</p>}
    {access && <>
      <ul className="mt-4 space-y-3">{access.admins.map(m => <li key={m.profile_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-3"><code className="break-all text-xs text-slate-300">{m.profile_id}</code>{tournament.role === 'owner' && <button type="button" disabled={busy} className={secondary} onClick={() => revoke(m.profile_id, false)}>Revocar administración</button>}</li>)}</ul>
      {access.admins.length === 0 && <p className="mt-3 text-sm text-slate-400">No hay coadministradores.</p>}
      {tournament.role === 'owner' ? <>
        <form onSubmit={event => void invite(event)} className="mt-6 space-y-3 border-t border-white/10 pt-5">
          <label className="block text-sm text-slate-300">UUID de la cuenta invitada<input name="invitee-uuid" className={`${input} mt-2`} required value={invitee} disabled={busy} autoComplete="off" spellCheck={false} onChange={e => setInvitee(e.target.value)} /></label>
          <p className="text-xs leading-5 text-slate-400">Pide a esa persona el identificador que aparece en “Mis torneos”. Debe haber confirmado su correo y guardado su perfil en Cuenta. No hay búsqueda por correo o nickname.</p>
          <button type="submit" disabled={busy} className={primary}>Invitar coadministrador</button>
        </form>
        <h3 className="mb-3 mt-6 font-bold">Invitaciones enviadas pendientes</h3>
        <ul className="space-y-3">{access.invitations.map(inv => <li key={inv.id} className="rounded-xl border border-white/10 p-3"><code className="block break-all text-xs text-slate-300">{inv.invitee_id}</code><p className="my-2 text-xs text-slate-400">Caduca: {new Date(inv.expires_at).toLocaleString()}</p><button type="button" className={secondary} disabled={busy} onClick={() => revoke(inv.invitee_id, true)}>Cancelar invitación</button></li>)}</ul>
        {access.invitations.length === 0 && <p className="text-sm text-slate-400">No hay invitaciones pendientes.</p>}
      </> : <p className="mt-5 text-sm text-slate-400">Solo el propietario puede invitar o revocar administradores.</p>}
    </>}
  </section>
}
