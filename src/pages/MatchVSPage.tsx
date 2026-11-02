import { useEffect, useRef, useState } from 'react'
import type { MatchId } from '../types/tournament'
import { navigateTo, tournamentHref } from '../app/navigation'
import { useTournament } from '../hooks/useTournament'
import { resolveBracket } from '../utils/doubleElimination'
import { matchActionWarnings, proposeMatchAction, type MatchAction } from '../utils/matchSession'
import { MatchVSControls } from '../components/tournament/MatchVSControls'
import { VersusPresentation } from '../components/tournament/VersusPresentation'
import { exportTournament } from '../utils/tournamentValidation'
import { winnerSlot } from '../utils/tournamentResults'
import { MatchHistory } from '../components/tournament/MatchHistory'
import { DQControls } from '../components/tournament/DQControls'
import { ActiveMatchLink } from '../components/tournament/ActiveMatchLink'
import { ScreenControls } from '../components/tournament/ScreenControls'
import '../styles/tournament.css'
import '../styles/versus.css'

export function MatchVSPage({ matchId, presentation = false }: { matchId: MatchId; presentation?: boolean }) {
  const { tournament, error, save } = useTournament()
  const [visible, setVisible] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [notice, setNotice] = useState('')
  const [controlsVisible, setControlsVisible] = useState(true)
  const [correction, setCorrection] = useState(false)
  const viewer = useRef<HTMLDivElement>(null)
  const match = resolveBracket(tournament).find(m => m.id === matchId && m.enabled)
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === viewer.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (viewer.current?.requestFullscreen) await viewer.current.requestFullscreen()
      else setNotice('Este navegador no admite pantalla completa. Usa el modo de pantalla completa del navegador.')
    } catch { setNotice('No se pudo cambiar a pantalla completa. Puedes usar la opción de tu navegador.') }
  }
  const apply = (action: MatchAction): boolean => {
    if (presentation || !match) return false
    try {
      const proposal = proposeMatchAction(tournament, matchId, action)
      const warnings = matchActionWarnings(match, action, proposal)
      if (warnings.length && !window.confirm(warnings.join('\n\n'))) return false
      const stored = save(proposal.tournament)
      if (stored && (action.type === 'confirm' || action.type === 'dq')) setCorrection(false)
      setNotice(stored ? 'Cambios guardados.' : 'Cambios solo en memoria: descarga un respaldo antes de salir.'); return stored
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'No se pudo actualizar el encuentro.'); return false }
  }
  if (!match) return <main className="p-8"><h1 className="text-2xl font-black">Encuentro no disponible</h1><p className="my-4">El encuentro no existe o el Grand Final Reset aún no está habilitado.</p>
    <button className="bracket-button" onClick={() => navigateTo('/tournament')}>Volver al bracket</button></main>
  const ready = match.players.every(Boolean)
  const admin = !presentation && ready && tournament.status === 'started'
  const editable = admin && !match.result?.outcome && (!match.result?.confirmed || correction)
  const provisional = match.result && !match.result.confirmed && winnerSlot(match.result) !== undefined
  return <main className={`vs-page ${presentation ? 'vs-presentation-page' : ''}`}>
    {error && <div className="mb-4 text-amber-200"><p role="alert">{error}</p>
      {!presentation && <button className="bracket-button mt-2" onClick={() => {
        const url = URL.createObjectURL(new Blob([exportTournament(tournament)], { type: 'application/json' }))
        const link = document.createElement('a'); link.href = url; link.download = 'stage-banning-vs-respaldo.json'; link.click()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      }}>Descargar respaldo JSON</button>}</div>}
    <div className="vs-viewer" ref={viewer}>
      <div className="vs-view-toolbar">
        <button className="bracket-button" onClick={() => setVisible(v => !v)}>{visible ? 'Ocultar VS' : 'Mostrar VS'}</button>
        <button className="bracket-button" onClick={() => navigateTo(presentation ? '/tournament/presentation' : '/tournament')}>Volver al bracket</button>
        <button className="bracket-button" onClick={toggleFullscreen}>{fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}</button>
        {!presentation && <a className="bracket-button" href={tournamentHref(`/tournament/match/${match.id}/presentation`)} target="_blank" rel="noopener noreferrer">Abrir presentación ↗</a>}
        {!presentation && <button className="bracket-button" onClick={() => setControlsVisible(v => !v)}>{controlsVisible ? 'Ocultar controles' : 'Mostrar controles'}</button>}
        {!presentation && controlsVisible && <ActiveMatchLink tournament={tournament} />}
        {!presentation && controlsVisible && <ScreenControls matchId={match.id} />}
      </div>
      {admin && controlsVisible && <div className="vs-quick-result">
        {match.result?.confirmed && !match.result.outcome && <button className="bracket-button" onClick={() => setCorrection(v => !v)}>{correction ? 'Volver a consulta' : 'Corregir resultado'}</button>}
        {provisional && <><span role="status">Ganador provisional: {match.players[winnerSlot(match.result!)!]?.nickname}</span>
          <button className="bracket-button primary" onClick={() => apply({ type: 'confirm' })}>Confirmar ganador</button></>}
        {editable && !provisional && <p className="text-xs text-slate-300">Toca un icono apagado para sumar una victoria; uno iluminado para corregir.</p>}
      </div>}
      {visible ? <VersusPresentation match={match} onVictoryIcon={editable && controlsVisible ? (slot, index) => apply({ type: 'icon', slot, index }) : undefined} /> : <div className="vs-hidden" role="status">VS oculto · el encuentro conserva su estado</div>}
    </div>
    {notice && <p className="my-4 text-sm text-cyan-100" role="status">{notice}</p>}
    {!presentation && controlsVisible && (ready && tournament.status === 'started'
      ? editable ? <MatchVSControls key={matchId} match={match} apply={apply} /> : <section className="glass-panel mt-6 rounded-3xl p-5">
        <p className="text-sm text-slate-300">Encuentro finalizado · modo consulta. Para modificar un DQ, utiliza Revertir DQ.</p>
        <DQControls match={match} apply={apply} /><MatchHistory match={match} />
      </section>
      : <p className="my-5 text-slate-300">{ready ? 'Inicia el torneo desde el bracket para administrar este enfrentamiento.' : 'Esperando a que se definan ambos participantes. Puedes abrir esta vista sin alterar resultados.'}</p>)}
    {!presentation && <p className="my-4 text-xs text-slate-500">Presentación compartida entre pestañas del mismo navegador. Usa una sola pestaña administrativa para evitar ediciones simultáneas.</p>}
  </main>
}
