import type { MatchId, ResolvedMatch, Tournament } from '../../types/tournament'
import { useMemo, useState } from 'react'
import { getChampion, resolveBracket } from '../../utils/doubleElimination'
import { phaseMatches, tournamentProgress } from '../../utils/tournamentPhases'
import { MatchCard } from './MatchCard'

const WIDTH = 264
const GAP = 36
const HEIGHT = 116

function BracketSection({ matches, title, tone, onEdit, onVS, onStart }: {
  matches: ResolvedMatch[]; title: string; tone: string; onEdit?: (id: MatchId) => void
  onVS?: (id: MatchId) => void; onStart?: (id: MatchId) => void
}) {
  const columns = [...new Set(matches.map((match) => match.column))]
  if (!matches.length) return null
  const maxRows = Math.max(...columns.map((column) => matches.filter((m) => m.column === column).length))
  const bodyHeight = maxRows * (onVS ? 180 : 136)
  const width = columns.length * (WIDTH + GAP) - GAP
  const positions = new Map(matches.map((match) => {
    const group = matches.filter((m) => m.column === match.column)
    return [match.id, { x: columns.indexOf(match.column) * (WIDTH + GAP), y: 40 + (bodyHeight / group.length) * (group.indexOf(match) + 0.5) - HEIGHT / 2 }]
  }))
  return <section className={`bracket-section ${tone}`}>
    <h2 className="mb-3 text-xs font-black uppercase tracking-[0.2em]">{title}</h2>
    <div className="bracket-scroll focus-ring" tabIndex={0} role="region" aria-label={`${title}: desplazamiento horizontal`}>
      <div className="relative" style={{ width, height: bodyHeight + 48 }}>
        <svg className="pointer-events-none absolute inset-0" width={width} height={bodyHeight + 48} aria-hidden="true">
          {matches.flatMap((match) => match.sources.map((source, slot) => {
            if (!('match' in source)) return null
            const from = positions.get(source.match)
            const to = positions.get(match.id)!
            if (!from) return null
            const x = from.x + WIDTH, y = from.y + HEIGHT / 2
            const endY = to.y + (slot === 0 ? 48 : 91)
            return <path key={`${match.id}-${slot}`} d={`M${x},${y} H${x + GAP / 2} V${endY} H${to.x}`} fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          }))}
        </svg>
        {columns.map((column) => <h3 key={column} className="absolute top-0 text-xs font-bold text-slate-400" style={{ left: columns.indexOf(column) * (WIDTH + GAP), width: WIDTH }}>
          {matches.find((m) => m.column === column)?.round}
        </h3>)}
        {matches.map((match) => <div key={match.id} className="absolute" style={{ left: positions.get(match.id)!.x, top: positions.get(match.id)!.y, width: WIDTH, height: HEIGHT }}>
          <MatchCard match={match} onEdit={onEdit ? () => onEdit(match.id) : undefined} />
          {onVS && !match.automatic && <div className="mt-1 flex gap-2">
            <button className="text-xs font-bold text-cyan-200 focus-ring min-h-8 px-2" onClick={() => onVS(match.id)}>Abrir VS</button>
            {onStart && match.players.every(Boolean) && !match.result?.confirmed && !match.result?.details?.startedAt && !match.result?.scores.some(n => n > 0) &&
              <button className="text-xs font-bold text-violet-200 focus-ring min-h-8 px-2" onClick={() => onStart(match.id)}>Marcar en curso</button>}
          </div>}
        </div>)}
      </div>
    </div>
  </section>
}

export function BracketBoard({ tournament, onEdit, onVS, onStart }: { tournament: Tournament; onEdit?: (id: MatchId) => void; onVS?: (id: MatchId) => void; onStart?: (id: MatchId) => void }) {
  const all = useMemo(() => resolveBracket(tournament).filter(match => match.enabled), [tournament])
  const progress = useMemo(() => tournamentProgress(tournament), [tournament])
  const [phaseSize, setPhaseSize] = useState(0), [section, setSection] = useState('all'), [round, setRound] = useState('all')
  const [query, setQuery] = useState(''), [page, setPage] = useState(0)
  const [showByes, setShowByes] = useState(false)
  const phase = progress.phases.find(p => p.size === phaseSize && p.reached)
  const phaseList = phase ? phaseMatches(tournament, phase) : all
  const rounds = [...new Set(phaseList.filter(m => section === 'all' || m.section === section).map(m => `${m.section}:${m.column}`))]
  const filtered = phaseList.filter(m => (showByes || !m.automatic) && (section === 'all' || m.section === section) && (round === 'all' || `${m.section}:${m.column}` === round) && `${m.id} ${m.players.map(p => p?.nickname ?? '').join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()))
  const current = Math.min(page, Math.max(0, Math.ceil(filtered.length / 32) - 1))
  const matches = tournament.schemaVersion === 2 ? filtered.slice(current * 32, (current + 1) * 32) : all
  const champion = getChampion(tournament)
  return <div className="bracket-board space-y-5">
    {tournament.schemaVersion === 2 && <section className="glass-panel rounded-2xl p-4 space-y-3" aria-label="Navegación del bracket">
      <p className="font-bold">{progress.alive} participantes sin eliminar · {tournament.participants.length} iniciales</p>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showByes} onChange={e => { setShowByes(e.target.checked); setPage(0) }} />Mostrar pases automáticos (BYEs): {all.filter(m => m.automatic && m.winnerId).length}</label>
      <div className="flex flex-wrap gap-2"><button className={`bracket-button ${!phase ? 'primary' : ''}`} onClick={() => { setPhaseSize(0); setPage(0); setRound('all') }}>Bracket completo</button>{progress.phases.map(p => <button key={p.size} disabled={!p.reached} className={`bracket-button ${phase?.size === p.size ? 'primary' : ''}`} onClick={() => { setPhaseSize(p.size); setPage(0); setRound('all') }}>Top {p.size}{!p.reached ? ' · pendiente' : ''}</button>)}</div>
      {phase && <details><summary className="cursor-pointer">Top {phase.size} · participantes y derrotas al entrar</summary><ul className="mt-3 grid max-h-64 gap-2 overflow-auto sm:grid-cols-2">{phase.players.map(p => <li key={p.id}>{tournament.participants.find(player => player.id === p.id)?.nickname} · {p.side} · {p.losses} derrota(s)</li>)}</ul><p className="mt-2 text-xs text-slate-400">Continuación del torneo original desde esta fase. Los resultados previos se consultan en Bracket completo. Las correcciones recalculan las fases afectadas.</p></details>}
      <div className="flex flex-wrap gap-3">
        <label>Sección<select className="form-control" value={section} onChange={e => { setSection(e.target.value); setRound('all'); setPage(0) }}><option value="all">Winners + Losers + Finales</option><option value="winners">Winners</option><option value="losers">Losers</option><option value="finals">Finales</option></select></label>
        <label>Ronda<select className="form-control" value={round} onChange={e => { setRound(e.target.value); setPage(0) }}><option value="all">Todas las rondas</option>{rounds.map(key => <option key={key} value={key}>{phaseList.find(m => `${m.section}:${m.column}` === key)?.round}</option>)}</select></label>
        <label>Localizar encuentro<input className="form-control" placeholder="W1, L5 o nickname" value={query} onChange={e => { setQuery(e.target.value); setPage(0) }} /></label>
      </div>
      {filtered.length > 32 && <div className="flex flex-wrap items-center gap-3"><button className="bracket-button" disabled={!current} onClick={() => setPage(current - 1)}>Encuentros anteriores</button><span>Página {current + 1} de {Math.ceil(filtered.length / 32)} · máximo 32 tarjetas</span><button className="bracket-button" disabled={(current + 1) * 32 >= filtered.length} onClick={() => setPage(current + 1)}>Encuentros siguientes</button></div>}
      {!filtered.length && <p>No hay encuentros en esta selección.</p>}
    </section>}
    {champion && <div role="status" className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-6 py-4 text-emerald-100">
      <span className="mr-3 text-xs font-black uppercase tracking-widest">Campeón</span>
      <strong className="text-2xl">{champion.nickname}</strong>
    </div>}
    <div className="bracket-top">
      <BracketSection matches={matches.filter((m) => m.section === 'winners')} title="Winners bracket" tone="text-cyan-200" onEdit={onEdit} onVS={onVS} onStart={onStart} />
      <BracketSection matches={matches.filter((m) => m.section === 'finals')} title="Grand final" tone="text-emerald-200" onEdit={onEdit} onVS={onVS} onStart={onStart} />
    </div>
    <BracketSection matches={matches.filter((m) => m.section === 'losers')} title="Losers bracket" tone="text-violet-200" onEdit={onEdit} onVS={onVS} onStart={onStart} />
    <p className="text-xs text-slate-500">Los cruces entre secciones se identifican por el código de encuentro. W = ganador · L = perdedor. El reset aparece si el finalista de Losers gana la primera Grand Final.</p>
  </div>
}
