export type AuthTestEnvironment = {
  MODE?: string
  DEV?: boolean
  VITE_AUTH_TEST_URL?: string
  VITE_AUTH_TEST_PUBLISHABLE_KEY?: string
}

export function resolveAuthTestConfig(env: AuthTestEnvironment, expectedRef: string) {
  if (!env.DEV || env.MODE !== 'auth-tests' || !/^[a-z0-9]{20}$/.test(expectedRef)) return null
  const key = env.VITE_AUTH_TEST_PUBLISHABLE_KEY?.trim()
  if (!key || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return null
  try {
    const url = new URL(env.VITE_AUTH_TEST_URL ?? '')
    if (url.origin !== `https://${expectedRef}.supabase.co` || url.pathname !== '/' ||
      url.username || url.password || url.search || url.hash) return null
    return { url: url.origin, key, storageKey: `stage-strike.auth-tests.${expectedRef}` }
  } catch { return null }
}

export function nicknameError(value: string): string | null {
  const nickname = value.trim()
  if (!nickname || [...nickname].length > 32 || [...nickname].some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) {
    return 'Usa un nickname de 1 a 32 caracteres, sin caracteres de control.'
  }
  return null
}

// Never render SDK/raw server messages: they can contain URLs or account details.
export function authErrorMessage(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null
  if (code === 'invalid_credentials') return 'Correo o contraseña incorrectos.'
  if (code === 'email_not_confirmed') return 'Confirma tu correo antes de iniciar sesión.'
  if (code === 'weak_password') return 'La contraseña no cumple los requisitos del proyecto. Usa al menos 12 caracteres.'
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.'
  if (code === 'signup_disabled') return 'El registro de cuentas está deshabilitado en el proyecto de pruebas.'
  return 'No se pudo completar la operación. Revisa tu conexión e inténtalo de nuevo.'
}
