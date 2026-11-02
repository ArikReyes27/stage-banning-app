import { useEffect, useState } from 'react'
import { useTournament } from '../hooks/useTournament'
import { readScreenTarget, screenKey, type ScreenTarget } from '../lib/publicScreen'
import { resolveBracket } from '../utils/doubleElimination'
import { MatchVSPage } from './MatchVSPage'
import { StandingsPage } from './StandingsPage'
import { TournamentPresentationPage } from './TournamentPresentationPage'

// Read-only public screen for the TV. It reuses the existing presentation pages and follows the
// admin window's choice (same browser, no Supabase). It never saves anything.
export function PublicScreenPage() {
  const key = screenKey(new URLSearchParams(window.location.search).get('event'))
  const [target, setTarget] = useState<ScreenTarget>(() => readScreenTarget(window.localStorage, key))
  const { tournament } = useTournament()
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (event.key === key || event.key === null) setTarget(readScreenTarget(window.localStorage, key)) }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [key])
  const playable = target.view === 'match' && resolveBracket(tournament).some(m => m.id === target.matchId && m.enabled && m.players.every(Boolean))
  return <div className="public-screen">
    {target.view === 'match' && playable ? <MatchVSPage key={target.matchId} matchId={target.matchId} presentation />
      : target.view === 'standings' ? <StandingsPage presentation /> : <TournamentPresentationPage />}
  </div>
}
