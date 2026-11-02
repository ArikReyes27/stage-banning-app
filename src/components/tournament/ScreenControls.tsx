import { useState } from 'react'
import type { MatchId } from '../../types/tournament'
import { screenKey, writeScreenTarget, type ScreenTarget } from '../../lib/publicScreen'
import { tournamentHref } from '../../app/navigation'

// Admin-only controls: choose what the public (TV) window shows. Nothing here edits the tournament.
export function ScreenControls({ matchId }: { matchId?: MatchId }) {
  const [notice, setNotice] = useState('')
  const key = screenKey(new URLSearchParams(window.location.search).get('event'))
  const show = (target: ScreenTarget, label: string) => {
    try { writeScreenTarget(window.localStorage, key, target); setNotice(`Pantalla pública: ${label}`) }
    catch { setNotice('No se pudo actualizar la pantalla pública.') }
  }
  const open = () => {
    const win = window.open(tournamentHref('/tournament/screen'), 'stage-strike-screen', 'popup=yes,width=1280,height=720')
    setNotice(win ? 'Ventana pública abierta: arrástrala a la TV y pulsa F11.' : 'El navegador bloqueó la ventana. Permite ventanas emergentes para este sitio.')
  }
  return <div className="flex flex-wrap items-center gap-2" aria-label="Pantalla pública">
    <button className="bracket-button" type="button" onClick={open}>Abrir pantalla pública ↗</button>
    {matchId && <button className="bracket-button primary" type="button" onClick={() => show({ view: 'match', matchId }, `VS ${matchId}`)}>Mostrar {matchId} en TV</button>}
    <button className="bracket-button" type="button" onClick={() => show({ view: 'bracket' }, 'bracket')}>TV: Bracket</button>
    <button className="bracket-button" type="button" onClick={() => show({ view: 'standings' }, 'standings')}>TV: Standings</button>
    {notice && <span role="status" className="text-xs text-cyan-200">{notice}</span>}
  </div>
}
