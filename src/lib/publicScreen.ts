import type { MatchId } from '../types/tournament.ts'

// Local-only channel: the admin window writes WHAT the public window should show; the public
// window follows it through the browser `storage` event. It never carries tournament data.
export type ScreenTarget = { view: 'bracket' } | { view: 'standings' } | { view: 'match'; matchId: MatchId }
const MATCH = /^(?:W\d+|L\d+|GF|RESET)$/
const EVENT = /^[a-z0-9-]{1,64}$/i

/** One channel per tournament space, so another event's screen is never driven by this one. */
export function screenKey(eventId: string | null): string {
  return `stage-strike.screen.v1:${eventId && EVENT.test(eventId) ? eventId.toLowerCase() : 'legacy'}`
}
export function parseScreenTarget(raw: string | null): ScreenTarget {
  try {
    const value = JSON.parse(raw ?? 'null') as { view?: unknown; matchId?: unknown } | null
    if (value?.view === 'standings') return { view: 'standings' }
    if (value?.view === 'match' && typeof value.matchId === 'string' && MATCH.test(value.matchId)) return { view: 'match', matchId: value.matchId as MatchId }
  } catch { /* corrupt value: fall back to the public bracket */ }
  return { view: 'bracket' }
}
export function readScreenTarget(storage: Pick<Storage, 'getItem'>, key: string): ScreenTarget {
  try { return parseScreenTarget(storage.getItem(key)) } catch { return { view: 'bracket' } }
}
export function writeScreenTarget(storage: Pick<Storage, 'setItem'>, key: string, target: ScreenTarget) {
  storage.setItem(key, JSON.stringify(parseScreenTarget(JSON.stringify(target))))
}
