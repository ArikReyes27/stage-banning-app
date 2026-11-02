// UI-only access mode (NOT server security): only loopback hosts get the administration UI.
// Any other host (laptop IP on the LAN, Vercel, ...) gets the public stage-ban experience.
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

export function isAdminHost(hostname: string | undefined): boolean {
  // No hostname means no browser location (server render / test stubs): keep the full UI.
  if (typeof hostname !== 'string') return true
  const host = hostname.trim().toLowerCase().replace(/\.$/, '')
  return LOOPBACK.has(host) || host.endsWith('.localhost')
}

// Public experience: home (official rulesets), a ruleset's read-only details and the ban session.
const PUBLIC_PATHS = [/^\/$/, /^\/rulesets\/(?!new$)[^/]+$/, /^\/session\/setup\/[^/]+$/]

export function isPublicPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/'
  return PUBLIC_PATHS.some(rule => rule.test(path))
}

/** Where a visitor on a public host lands for a given path ('/' when the path is not public). */
export function publicLanding(pathname: string): string | null {
  return isPublicPath(pathname) ? null : '/'
}
