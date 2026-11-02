import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { resolveAuthTestConfig } from './authConfig'
import { AUTH_TEST_PROJECT_REF } from './authTestProject'

let client: SupabaseClient | null = null

/** Separate from the optional legacy client: never reads root VITE_SUPABASE_* values. */
export function getAuthTestClient(): SupabaseClient | null {
  if (client) return client
  const config = resolveAuthTestConfig({
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    VITE_AUTH_TEST_URL: import.meta.env.VITE_AUTH_TEST_URL,
    VITE_AUTH_TEST_PUBLISHABLE_KEY: import.meta.env.VITE_AUTH_TEST_PUBLISHABLE_KEY,
  }, AUTH_TEST_PROJECT_REF)
  if (!config) return null
  try {
    const storage = window.sessionStorage
    const probe = `${config.storageKey}.probe`
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    client = createClient(config.url, config.key, {
      auth: {
        storage,
        storageKey: config.storageKey,
        persistSession: true,
        autoRefreshToken: true,
        flowType: 'pkce',
        detectSessionInUrl: window.location.pathname === '/account',
      },
      global: {
        // Defense in depth: even SDK requests must stay on the pinned origin.
        fetch: (input, init) => {
          const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
          if (url.origin !== config.url) return Promise.reject(new Error('Auth destination blocked'))
          const signal = init?.signal
            ? AbortSignal.any([init.signal, AbortSignal.timeout(20000)])
            : AbortSignal.timeout(20000)
          return fetch(input, { ...init, signal, redirect: 'error' })
        },
      },
    })
    return client
  } catch { return null }
}
