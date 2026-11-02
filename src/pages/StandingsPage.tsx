import { useMemo, useRef, useState } from 'react'
import { useTournament } from '../hooks/useTournament'
import { tournamentStandings, standingsCsv } from '../utils/tournamentStandings'
import { downloadBlob, topEightPng } from '../utils/standingsImage'
import { TopEightPoster } from '../components/tournament/TopEightPoster'
import { CharacterIcon } from '../components/tournament/CharacterIcon'
import { characterAssets } from '../data/characterAssets'
import { navigateTo } from '../app/navigation'
import '../styles/tournament.css'
import '../styles/standings.css'

export function StandingsPage({ presentation = false }: { presentation?: boolean }) {
  const { tournament, error } = useTournament()
  const standings = useMemo(() => tournamentStandings(tournament), [tournament])
  const [complete, setComplete] = useState(false), [page, setPage] = useState(0)
  const [busy, setBusy] = useState(false), [notice, setNotice] = useState('')
  const poster = useRef<HTMLDivElement>(null)
  const currentPage = Math.min(page, Math.max(0, Math.ceil(standings.rows.length / 50) - 1))
  const exportPng = async () => {
    const svg = poster.current?.querySelector('svg')
    if (!svg) return
    setBusy(true); setNotice('')
    try {
      const { blob, missingImages } = await topEightPng(svg)
      downloadBlob(blob, `stage-strike-top8-${standings.final ? 'final' : 'provisional'}.png`)
      setNotice(missingImages ? 'PNG exportado. Algunas imágenes locales no estaban disponibles.' : 'Top 8 exportado a PNG.')
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'No se pudo exportar el PNG.') }
    finally { setBusy(false) }
  }
  return <main className={`standings-page ${presentation ? 'standings-presentation' : ''}`}>
    <header className="standings-header">
      <div><p className="text-xs font-black uppercase tracking-widest text-cyan-200">STAGE//STRIKE · Standings</p><h1 className="mt-2 text-3xl font-black">{complete ? 'Clasificación completa' : 'Top 8 del torneo'}</h1><p className="mt-2 text-sm text-slate-300">{standings.final ? 'Resultados finales' : 'Resultados provisionales'} · {tournament.participants.filter(p => p.nickname).length} participantes{presentation ? ' · Solo lectura' : ''}</p></div>
      {!presentation && <div className="flex flex-wrap gap-2"><button className="bracket-button" onClick={() => navigateTo('/tournament')}>Volver al bracket</button><button className="bracket-button" onClick={() => navigateTo('/tournament/standings/presentation')}>Presentar Top 8</button></div>}
    </header>
    {error && <p role="alert" className="my-4 text-amber-200">{error}</p>}
    {!presentation && <div className="standings-actions">
      <button className="bracket-button primary" onClick={() => { setComplete(!complete); setPage(0) }}>{complete ? 'Volver al Top 8' : 'Ver clasificación completa'}</button>
      {!complete && <button className="bracket-button" disabled={busy || !!error || !standings.top.length} onClick={() => void exportPng()}>{busy ? 'Preparando PNG…' : 'Exportar Top 8 a PNG'}</button>}
      <button className="bracket-button" disabled={!!error || !standings.started} onClick={() => downloadBlob(new Blob([standingsCsv(tournament)], { type: 'text/csv;charset=utf-8' }), 'stage-strike-clasificacion-completa.csv')}>Exportar clasificación completa CSV</button>
    </div>}
    {notice && <p role="status" className="mb-4 text-sm text-cyan-200">{notice}</p>}
    {complete ? <>
      <p className="mb-4 text-sm text-slate-400">Los jugadores en juego no tienen un puesto definitivo. Los empates comparten posición; el orden dentro de ellos no los desempata.</p>
      <table className="standings-table"><thead><tr><th scope="col">Posición</th><th scope="col">Nickname</th><th scope="col">Personajes</th></tr></thead><tbody>
        {standings.rows.slice(currentPage * 50, (currentPage + 1) * 50).map(row => <tr key={row.id}><td>{row.position ?? '—'}<span className="standing-status">{row.status === 'active' ? 'En juego' : row.status === 'pending' ? 'Sin iniciar' : row.status === 'champion' ? 'Campeón' : 'Eliminado'}</span></td><th scope="row">{row.nickname || 'Sin nickname'}</th><td><div className="standing-characters">{row.characters.length ? row.characters.map((c, i) => <span className={i === 0 ? 'standing-main' : 'standing-secondary'} key={c.id}><CharacterIcon characterId={c.id}/></span>) : <span className="text-xs text-slate-400">Sin historial</span>}</div></td></tr>)}
      </tbody></table>
      {standings.rows.length > 50 && <nav className="standings-actions mt-4" aria-label="Páginas de clasificación"><button className="bracket-button" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Anterior</button><span>Página {currentPage + 1} de {Math.ceil(standings.rows.length / 50)}</span><button className="bracket-button" disabled={(currentPage + 1) * 50 >= standings.rows.length} onClick={() => setPage(currentPage + 1)}>Siguiente</button></nav>}
    </> : <>
      <div ref={poster} className="standings-poster-frame"><TopEightPoster standings={standings}/></div>
      <ol className="standings-mobile-summary" aria-label="Detalle del Top 8">{standings.top.map(row => <li key={row.id} data-position={row.position}>
        <span className="font-black">{row.position ? `#${row.position}` : 'En juego'}</span><strong>{row.nickname}</strong>
        {row.position && row.position <= 3 && <><span className="mobile-medal">{row.position === 1 ? '♛ Campeón' : row.position === 2 ? '② Subcampeón' : '③ Tercer lugar'}</span>
          {row.characters[0] && <img className="mobile-podium-render" src={characterAssets[row.characters[0].id]?.render} alt="" onError={e => { e.currentTarget.style.display = 'none' }}/>}</>}
        <div className="standing-characters">{row.characters.length ? row.characters.map(c => <CharacterIcon key={c.id} characterId={c.id}/>) : <span>Sin historial</span>}</div>{row.position !== undefined && row.position <= 3 && <span className="mobile-set-record">SETS {row.setWins}-{row.setLosses}</span>}</li>)}</ol>
      {!presentation && <p className="mt-4 text-sm text-slate-400">Principal, secundario y tercero por juegos registrados, sin duplicados. Los juegos anulados y las selecciones sin jugar no cuentan. Si falta historial no se inventan personajes. Récord de sets: resultados confirmados; excluye DQ y BYEs.</p>}
    </>}
  </main>
}
