import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { getAuthTestClient } from '../lib/authClient'
import { authErrorMessage, nicknameError } from '../lib/authConfig'
import { navigateTo } from '../app/navigation'
import { saveOwnNickname } from '../lib/accountProfile'

const inputClass = 'focus-ring w-full rounded-xl border border-white/15 bg-[#060814] px-4 py-3 text-white'
const buttonClass = 'focus-ring rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50'

export function AccountPage() {
  const [client] = useState(getAuthTestClient)
  return <main className="mx-auto max-w-xl px-4 py-10 sm:py-16">
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">STAGE//STRIKE · Cuentas de prueba</p>
    <h1 className="mb-3 text-3xl font-black text-white">Tu cuenta</h1>
    <p className="mb-8 text-sm leading-6 text-slate-400">Tu perfil personal es independiente del registro de participantes. Puedes seguir jugando y organizando torneos localmente sin iniciar sesión.</p>
    <section className="rounded-2xl border border-white/10 bg-[#0c1022]/90 p-5 shadow-xl sm:p-8">
      {client ? <AccountForm client={client} /> : <>
        <h2 className="text-lg font-bold">Cuentas de prueba no disponibles</h2>
        <p className="mt-3 text-sm leading-6 text-slate-400">Inicia el modo de pruebas con su configuración verificada y permite el almacenamiento de sesión del navegador. El juego local sigue disponible.</p>
      </>}
    </section>
    <button type="button" onClick={() => navigateTo('/')} className="focus-ring mt-6 rounded-lg px-3 py-2 text-sm text-cyan-200">Volver al juego local</button>
  </main>
}

function AccountForm({ client }: { client: SupabaseClient }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [signUp, setSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [nickname, setNickname] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const inFlight = useRef(false)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    let active = true
    let events = 0
    const callback = /[?&#](code|error|access_token)=/.test(window.location.search + window.location.hash)
    const { data: { subscription } } = client.auth.onAuthStateChange((event, next) => {
      // Synchronous only: no SDK calls inside this callback (avoids Auth lock deadlocks).
      events++
      if (active) {
        setSession(next); setLoading(false)
        if (event === 'SIGNED_OUT') setMessage('Tu sesión terminó. Puedes iniciar sesión de nuevo.')
      }
    })
    const initialEvents = events
    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (events === initialEvents) setSession(data.session)
      setLoading(false)
      if (sessionError) setError(authErrorMessage(sessionError))
      else if (callback && !data.session) setMessage('Si ya confirmaste tu correo, inicia sesión con tu contraseña. Si el enlace caducó, solicita uno nuevo desde el formulario.')
      if (callback) window.history.replaceState({}, '', '/account')
    }).catch(() => {
      if (active) { setLoading(false); setError(authErrorMessage(null)) }
      if (callback) window.history.replaceState({}, '', '/account')
    })
    return () => { active = false; mounted.current = false; subscription.unsubscribe() }
  }, [client])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current) return
    setError(''); setMessage('')
    if (signUp) {
      const invalid = nicknameError(nickname)
      if (invalid) { setError(invalid); return }
      if (password.length < 12) { setError('Usa una contraseña de al menos 12 caracteres.'); return }
    }
    inFlight.current = true; setBusy(true)
    try {
      const result = signUp
        ? await client.auth.signUp({ email: email.trim(), password, options: { data: { nickname: nickname.trim() }, emailRedirectTo: `${window.location.origin}/account` } })
        : await client.auth.signInWithPassword({ email: email.trim(), password })
      if (!mounted.current) return
      if (result.error) setError(authErrorMessage(result.error))
      else {
        setPassword('')
        setShowPassword(false)
        setSession(result.data.session)
        setMessage(signUp && !result.data.session ? 'Si el registro procede, recibirás un correo de confirmación. Ábrelo y después inicia sesión.' : '')
      }
    } catch { if (mounted.current) setError(authErrorMessage(null)) }
    finally { inFlight.current = false; if (mounted.current) setBusy(false) }
  }

  async function resend() {
    if (inFlight.current || !email.trim()) return
    inFlight.current = true; setBusy(true); setError(''); setMessage('')
    try {
      const { error: resendError } = await client.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/account` } })
      if (mounted.current) {
        if (resendError) setError(authErrorMessage(resendError))
        else setMessage('Si hay una cuenta pendiente, recibirás un nuevo enlace de confirmación.')
      }
    } catch { if (mounted.current) setError(authErrorMessage(null)) }
    finally { inFlight.current = false; if (mounted.current) setBusy(false) }
  }

  async function logout() {
    if (inFlight.current) return
    inFlight.current = true; setBusy(true); setError(''); setMessage('')
    try {
      const { error: logoutError } = await client.auth.signOut({ scope: 'local' })
      if (mounted.current) {
        if (logoutError) setError('No se pudo cerrar la sesión. Revisa tu conexión y vuelve a intentarlo.')
        else { setSession(null); setPassword(''); setMessage('Sesión cerrada en este navegador.') }
      }
    } catch { if (mounted.current) setError('No se pudo cerrar la sesión. Vuelve a intentarlo.') }
    finally { inFlight.current = false; if (mounted.current) setBusy(false) }
  }

  return <>
    {loading ? <p role="status" className="text-slate-300">Comprobando sesión…</p> : session ? <>
      <h2 className="text-xl font-bold">Sesión iniciada</h2>
      <p className="mt-2 break-all text-sm text-slate-400">{session.user.email}</p>
      <ProfileForm key={session.user.id} client={client} session={session} />
      <button type="button" disabled={busy} className="focus-ring mt-6 rounded-xl border border-white/20 px-4 py-3 text-sm text-slate-200" onClick={() => void logout()}>{busy ? 'Espera…' : 'Cerrar sesión'}</button>
    </> : <>
      <div className="mb-6 flex gap-2" aria-label="Acceso a la cuenta">
        <button type="button" aria-pressed={!signUp} disabled={busy} onClick={() => { setSignUp(false); setShowPassword(false); setError(''); setMessage(''); setPassword('') }} className={`focus-ring flex-1 rounded-xl px-3 py-3 text-sm font-bold ${!signUp ? 'bg-cyan-300/15 text-cyan-200' : 'text-slate-400'}`}>Iniciar sesión</button>
        <button type="button" aria-pressed={signUp} disabled={busy} onClick={() => { setSignUp(true); setShowPassword(false); setError(''); setMessage(''); setPassword('') }} className={`focus-ring flex-1 rounded-xl px-3 py-3 text-sm font-bold ${signUp ? 'bg-cyan-300/15 text-cyan-200' : 'text-slate-400'}`}>Crear cuenta</button>
      </div>
      <form onSubmit={event => void submit(event)} className="space-y-5">
        {signUp && <label className="block text-sm text-slate-300">Nickname<input className={`${inputClass} mt-2`} name="nickname" autoComplete="nickname" required maxLength={64} value={nickname} disabled={busy} onChange={e => setNickname(e.target.value)} /></label>}
        <label className="block text-sm text-slate-300">Correo electrónico<input className={`${inputClass} mt-2`} name="email" type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy} onChange={e => setEmail(e.target.value)} /></label>
        <div>
          <label htmlFor="account-password" className="block text-sm text-slate-300">Contraseña</label>
          <div className="relative mt-2">
            <input id="account-password" className={`${inputClass} pr-14`} name="password" type={showPassword ? 'text' : 'password'} autoComplete={signUp ? 'new-password' : 'current-password'} required minLength={signUp ? 12 : undefined} value={password} disabled={busy} onChange={e => setPassword(e.target.value)} />
            <button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} aria-controls="account-password" disabled={busy} onClick={() => setShowPassword(value => !value)} className="focus-ring absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-xl text-cyan-200">
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{showPassword && <path d="m3 3 18 18" />}</svg>
            </button>
          </div>
        </div>
        {signUp && <p className="text-xs text-slate-400">Al menos 12 caracteres. El nickname no te inscribe en ningún torneo.</p>}
        <button className={`${buttonClass} w-full`} disabled={busy} type="submit">{busy ? 'Espera…' : signUp ? 'Registrarme' : 'Entrar'}</button>
      </form>
      <button type="button" disabled={busy || !email.trim()} onClick={() => void resend()} className="focus-ring mt-4 rounded-lg py-2 text-xs text-cyan-200">Reenviar confirmación</button>
    </>}
    {message && <p role="status" className="mt-5 text-sm leading-6 text-cyan-200">{message}</p>}
    {error && <p role="alert" className="mt-5 text-sm leading-6 text-rose-300">{error}</p>}
  </>
}

function ProfileForm({ client, session }: { client: SupabaseClient; session: Session }) {
  const suggested: unknown = session.user.user_metadata?.nickname
  const [nickname, setNickname] = useState(typeof suggested === 'string' && !nicknameError(suggested) ? suggested : '')
  const [status, setStatus] = useState('Cargando perfil…')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const active = useRef(false)
  const saving = useRef(false)
  const id = session.user.id

  useEffect(() => {
    active.current = true
    let cancelled = false
    void Promise.resolve(client.from('profiles').select('display_name').eq('id', id).maybeSingle()).then(({ data, error: readError }) => {
      if (cancelled) return
      setLoading(false)
      if (readError) { setError('No se pudo cargar tu perfil. Revisa la conexión y que el SQL de perfiles esté aplicado en pruebas.'); setStatus(''); return }
      setError('')
      if (data?.display_name) setNickname(data.display_name)
      setStatus(data ? 'Perfil personal' : 'Guarda tu nickname para completar tu perfil.')
    }).catch(() => { if (!cancelled) { setLoading(false); setError('No se pudo cargar tu perfil. Inténtalo de nuevo.'); setStatus('') } })
    return () => { cancelled = true; active.current = false }
  }, [client, id, attempt])

  async function save(event: FormEvent) {
    event.preventDefault()
    if (saving.current) return
    const invalid = nicknameError(nickname)
    if (invalid) { setError(invalid); return }
    saving.current = true; setBusy(true); setError('')
    try {
      // Only the signed-in profile; no participant, membership or tournament writes.
      await saveOwnNickname(client, id, nickname)
      if (active.current) {
        setStatus('Nickname guardado. Tus participantes locales no se modificaron.')
      }
    } catch { if (active.current) setError('No se pudo guardar el nickname. Revisa la conexión y los permisos de perfiles del proyecto de pruebas.') }
    finally { saving.current = false; if (active.current) setBusy(false) }
  }

  return <form className="mt-6 space-y-3 border-t border-white/10 pt-6" onSubmit={event => void save(event)}>
    <label className="block text-sm text-slate-300">Nickname de tu cuenta<input className={`${inputClass} mt-2`} name="profile-nickname" autoComplete="nickname" required maxLength={64} disabled={loading || busy} value={nickname} onChange={e => setNickname(e.target.value)} /></label>
    <p role="status" className="text-xs leading-5 text-slate-400">{status}</p>
    <button className={buttonClass} type="submit" disabled={loading || busy}>{busy ? 'Guardando…' : 'Guardar nickname'}</button>
    {error && <><p role="alert" className="text-sm text-rose-300">{error}</p><button type="button" className="focus-ring rounded-lg p-2 text-xs text-cyan-200" disabled={busy} onClick={() => { setLoading(true); setAttempt(n => n + 1) }}>Reintentar lectura</button></>}
  </form>
}
