export function tournamentHref(path: string) {
  if (import.meta.env.MODE !== 'auth-tests' || !import.meta.env.DEV || path.includes('?')) return path
  const id = new URLSearchParams(window.location.search).get('event')
  return id ? `${path}?event=${encodeURIComponent(id)}` : path
}
export const navigateTo = (destination: string) => {
  const path = tournamentHref(destination)
  if (window.location.pathname + window.location.search === path && !window.location.hash) {
    window.scrollTo({ top: 0, behavior: 'instant' })
    return
  }

  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  if (!path.includes('#')) window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
}
