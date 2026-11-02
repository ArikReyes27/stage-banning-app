import { BracketBoard } from '../components/tournament/BracketBoard'
import { useTournament } from '../hooks/useTournament'
import '../styles/tournament.css'

export function TournamentPresentationPage() {
  const { tournament, error } = useTournament()
  return <main className="tournament-page bracket-presentation mx-auto max-w-[1920px] px-5 py-5 lg:px-8">
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Super Smash Bros. Ultimate</p>
        <h1 className="mt-1 text-3xl font-black">BRACKET <span className="text-gradient">{tournament.participants.length}</span> <span className="ml-3 text-base font-bold text-slate-400">Double Elimination</span></h1></div>
      <span className="bracket-badge">{tournament.status === 'started' ? 'Presentación · Solo lectura' : 'Vista previa · Torneo sin iniciar'}</span>
    </header>
    {error && <p role="alert" className="mb-5 text-amber-200">{error}</p>}
    {tournament.seeds.length >= 2 ? <BracketBoard tournament={tournament} /> :
      <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">El bracket aparecerá después de seleccionar participantes y generar la distribución.</div>}
  </main>
}
