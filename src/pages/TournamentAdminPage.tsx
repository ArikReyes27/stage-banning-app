import { useRef, useState } from 'react'
import type { MatchId } from '../types/tournament'
import { navigateTo } from '../app/navigation'
import { useTournament } from '../hooks/useTournament'
import { useWorkspace } from '../hooks/workspaceContext'
import { getChampion, resolveBracket } from '../utils/doubleElimination'
import { exportTournament, parseTournament, MAX_TOURNAMENT_JSON } from '../utils/tournamentValidation'
import { TournamentSetup } from '../components/tournament/TournamentSetup'
import { BracketBoard } from '../components/tournament/BracketBoard'
import { MatchEditor } from '../components/tournament/MatchEditor'
import { proposeMatchAction } from '../utils/matchSession'
import { ActiveMatchLink } from '../components/tournament/ActiveMatchLink'
import '../styles/tournament.css'

export function TournamentAdminPage() {
  const workspace = useWorkspace()
  const { tournament, error, save } = useTournament()
  const [editing, setEditing] = useState<MatchId>()
  const [notice, setNotice] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const champion = getChampion(tournament)
  const editableMatch = resolveBracket(tournament).find((match) => match.id === editing && match.enabled && match.players.every(Boolean))
  const exportFile = () => {
    const url = URL.createObjectURL(new Blob([exportTournament(tournament)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'stage-strike-torneo.json'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <main className="tournament-page mx-auto max-w-[1920px] px-4 py-8 sm:px-6 lg:px-8">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Torneo presencial · Ultimate</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">BRACKET <span className="text-gradient">{tournament.participants.every(p => !p.nickname) ? '' : tournament.participants.length}</span></h1>
        <p className="mt-2 text-sm text-slate-400">Doble eliminación · {champion ? 'Finalizado' : tournament.status === 'started' ? 'En curso' : 'Preparación'}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="bracket-button" type="button" onClick={() => navigateTo('/tournament/standings')}>Standings · Top 8</button>
        <button className="bracket-button" type="button" onClick={() => navigateTo('/registration')}>Registro · elegir participantes</button>
        <ActiveMatchLink tournament={tournament} />
        <button className="bracket-button" type="button" onClick={exportFile}>Exportar JSON</button>
        <button className="bracket-button" type="button" onClick={() => fileInput.current?.click()}>Importar JSON</button>
        <button className="bracket-button primary" type="button" onClick={() => navigateTo('/tournament/presentation')}>Modo presentación</button>
        <input className="sr-only" tabIndex={-1} aria-label="Archivo JSON del torneo" type="file" accept=".json,application/json" ref={fileInput}
          onChange={async (e) => {
            const file = e.target.files?.[0]; e.target.value = ''
            if (!file) return
            try {
              if (file.size > MAX_TOURNAMENT_JSON) throw new Error('El archivo supera el límite práctico de 10 MB.')
              const imported = parseTournament(await file.text())
              if (!window.confirm(`¿Reemplazar ${workspace?.name ?? 'el torneo local'} por este archivo de ${imported.participants.length} participantes y ${Object.keys(imported.results).length} resultados? Se reemplazarán el sorteo y los resultados actuales.${workspace ? ' Se guardará un respaldo local antes.' : ''}`)) return
              if (workspace) {
                const previous = window.localStorage.getItem(workspace.key)
                if (previous !== null) window.localStorage.setItem(`${workspace.key}:before-import:${Date.now()}`, previous)
              }
              if (save(imported)) { setEditing(undefined); setNotice('Torneo importado correctamente.') }
            } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'No se pudo importar el archivo.') }
          }} />
      </div>
    </header>
    <p className="mb-5 text-xs text-slate-500">{workspace ? `Administración de ${workspace.name}. Resultados solo en este navegador; el guardado competitivo en nube todavía no está disponible.` : 'Administración local, sin autenticación. El modo presentación oculta la edición; no es una protección de acceso.'}</p>
    {error && <p role="alert" className="mb-5 rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">{error}</p>}
    {notice && <p role="status" className="mb-5 rounded-xl border border-cyan-300/20 p-4 text-sm text-cyan-100">{notice}</p>}
    <TournamentSetup key={tournament.participants.map(p => p.id).join(',')} tournament={tournament} onSave={save} onExport={exportFile} />
    {tournament.status === 'ready' && <div className="my-6 flex flex-wrap items-center gap-4">
      <button className="bracket-button primary" type="button" onClick={() => { if (window.confirm('¿Confirmar esta distribución e iniciar el torneo? Se bloqueará el sorteo libre.')) save({ ...tournament, status: 'started' }) }}>Iniciar torneo</button>
      <p className="text-sm text-slate-400">Revisa los cruces. Al iniciar se bloquean participantes y sorteo.</p>
    </div>}
    {tournament.seeds.length >= 2 && <div className="mt-6">
      {tournament.status === 'started' && <p className="mb-4 text-sm text-slate-400">Selecciona un encuentro con sus dos participantes definidos para registrar o corregir el marcador.</p>}
      <BracketBoard tournament={tournament} onEdit={tournament.status === 'started' ? setEditing : undefined} onVS={id => navigateTo(`/tournament/match/${id}`)}
        onStart={tournament.status === 'started' ? id => {
          try { if (save(proposeMatchAction(tournament, id, { type: 'start' }).tournament)) navigateTo(`/tournament/match/${id}`) }
          catch (cause) { setNotice(cause instanceof Error ? cause.message : 'No se pudo iniciar el encuentro.') }
        } : undefined} />
    </div>}
    {editing && editableMatch && tournament.status === 'started' && <MatchEditor key={JSON.stringify([editing, editableMatch.players.map(p => p?.id)])} tournament={tournament} matchId={editing} onSave={save} onClose={() => setEditing(undefined)} />}
  </main>
}
