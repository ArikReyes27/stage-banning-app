import { useState } from 'react'
import type { GameSetup, MatchGame, ResolvedMatch } from '../../types/tournament'
import type { MatchAction } from '../../utils/matchSession'
import { currentSetup, readMatchResult } from '../../utils/matchSession'
import { targetWins, winnerSlot } from '../../utils/tournamentResults'
import { stageCatalog } from '../../data/stageCatalog'
import { useRulesets } from '../../hooks/useRulesets'
import { VariantPicker } from './CharacterPicker'
import { CharacterSearch } from './CharacterSearch'
import { MatchHistory } from './MatchHistory'
import { DQControls } from './DQControls'

function GameFields({ setup, match, stages, onChange }: {
  setup: GameSetup; match: ResolvedMatch; stages: { id: string; name: string }[]; onChange: (setup: GameSetup) => void
}) {
  const options = setup.stage && !stages.some(s => s.id === setup.stage?.id) ? [setup.stage, ...stages] : stages
  return <>
    <label className="block text-sm font-bold">Escenario del juego
      <select className="form-control mt-2" value={setup.stage?.id ?? ''} onChange={e => {
        const stage = options.find(s => s.id === e.target.value)
        onChange({ ...setup, stage: undefined, characterIds: [...setup.characterIds], ...(stage ? { stage: { id: stage.id, name: stage.name } } : {}) })
      }}><option value="">Sin escenario seleccionado</option>{options.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
    </label>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {([0, 1] as const).map(slot => <div key={slot}><CharacterSearch label={`Personaje · ${match.players[slot]?.nickname ?? `Jugador ${slot + 1}`}`}
        value={setup.characterIds[slot]} onChange={id => {
          const characterIds: [string, string] = [...setup.characterIds]; characterIds[slot] = id
          const variantIds: [string, string] = [...(setup.variantIds ?? ['00', '00'])]; variantIds[slot] = '00'
          onChange({ ...setup, characterIds, variantIds })
        }} /><VariantPicker setup={setup} slot={slot} onChange={onChange}/></div>)}
    </div>
  </>
}

function GameCorrection({ game, index, match, stages, apply, close }: {
  game: MatchGame; index: number; match: ResolvedMatch; stages: { id: string; name: string }[]
  apply: (action: MatchAction) => boolean; close: () => void
}) {
  const [draft, setDraft] = useState(game)
  return <div className="my-3 rounded-xl border border-violet-300/30 p-4">
    <GameFields setup={draft} match={match} stages={stages} onChange={setup => setDraft({ ...setup, winner: draft.winner })} />
    <label className="my-3 block text-sm font-bold">Ganador del juego
      <select className="form-control mt-2" value={draft.winner} onChange={e => setDraft({ ...draft, winner: Number(e.target.value) as 0 | 1 })}>
        {match.players.map((p, i) => <option key={i} value={i}>{p?.nickname}</option>)}
      </select>
    </label>
    <div className="flex gap-2"><button className="bracket-button primary" onClick={() => { if (apply({ type: 'correct', index, game: draft })) close() }}>Guardar corrección</button>
      <button className="bracket-button" onClick={close}>Cancelar corrección</button></div>
  </div>
}

export function MatchVSControls({ match, apply }: { match: ResolvedMatch; apply: (action: MatchAction) => boolean }) {
  const { rulesets } = useRulesets()
  const [editingGame, setEditingGame] = useState<number>()
  const result = readMatchResult(match)
  const d = result.details
  const terminal = winnerSlot(result) !== undefined
  const selectedRuleset = rulesets.find(r => r.id === d?.rulesetId)
  const stages = selectedRuleset?.stages ?? stageCatalog
  const legacy = d?.legacyScores ?? result.scores
  return <section className="vs-controls glass-panel rounded-3xl p-5 sm:p-7" aria-label="Administración del enfrentamiento">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">Control del set</h2>
      <span className="bracket-badge">{result.scores.join(' – ')} · {result.confirmed ? 'Confirmado' : 'Sin confirmar'}</span></div>
    <div className="my-4 flex flex-wrap gap-2">
      {(['BO3', 'BO5'] as const).map(format => <button key={format} className="bracket-button" aria-pressed={result.format === format}
        onClick={() => { if (format !== result.format) apply({ type: 'format', format }) }}>{format} · {targetWins(format)} victorias</button>)}
      {!d?.startedAt && <button className="bracket-button" disabled={terminal} onClick={() => apply({ type: 'start' })}>Marcar en curso</button>}
      <button className="bracket-button" disabled={terminal || d?.status !== 'in-progress'} onClick={() => apply({ type: 'pause' })}>Pausar juego</button>
    </div>
    {!terminal && <>
      <label className="mb-4 block text-sm font-bold">Pool de escenarios
        <select className="form-control mt-2" value={d?.rulesetId ?? ''} onChange={e => apply({ type: 'ruleset', id: e.target.value })}>
          <option value="">Todo el catálogo</option>
          {d?.rulesetId && !selectedRuleset && <option value={d.rulesetId}>Ruleset no disponible · usando catálogo</option>}
          {rulesets.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </label>
      <p className="mb-4 text-xs text-slate-400">Registro manual. No aplica bans ni cambia el ruleset. El escenario se guarda con cada victoria.</p>
      <GameFields setup={currentSetup(match)} match={match} stages={stages} onChange={setup => apply({ type: 'setup', setup })} />
      <div className="my-5 flex flex-wrap gap-3">{([0, 1] as const).map(slot => <button key={slot} className="bracket-button primary"
        onClick={() => apply({ type: 'win', winner: slot })}>Registrar victoria · {match.players[slot]?.nickname}</button>)}</div>
      <p className="mb-4 text-sm text-slate-400">También puedes registrar victorias directamente con los iconos del VS. No es necesario iniciar ni reanudar cada juego.</p>
    </>}
    {terminal && <div className="my-5 rounded-xl border border-cyan-300/30 p-4">
      <p className="mb-3 font-bold">{match.players[winnerSlot(result)!]?.nickname} alcanzó {targetWins(result.format)} victorias.</p>
      <button className="bracket-button primary" disabled={result.confirmed} onClick={() => apply({ type: 'confirm' })}>
        {result.confirmed ? 'Resultado confirmado' : 'Confirmar resultado final y avanzar'}</button>
      {!result.confirmed && <p className="mt-2 text-sm text-slate-400">El bracket espera tu confirmación para avanzar.</p>}
    </div>}
    <DQControls match={match} apply={apply} />
    {(legacy[0] + legacy[1] > 0) && <details className="my-3 rounded-xl border border-amber-200/20 p-3">
      <summary className="cursor-pointer text-sm text-amber-100">Marcador anterior: {legacy.join(' – ')} · sin detalle de personajes o escenarios</summary>
      <p className="my-2 text-xs text-slate-400">Se conserva el resultado original. Los iconos históricos usan el personaje del registro inicial, ya que el personaje ganador no fue guardado.</p>
      {([0, 1] as const).map(slot => <label key={slot} className="my-2 block text-sm">Victorias anteriores · {match.players[slot]?.nickname}
        <select className="form-control mt-1" value={legacy[slot]} onChange={e => {
          const scores: [number, number] = [...legacy]; scores[slot] = Number(e.target.value)
          apply({ type: 'legacy', scores })
        }}>{Array.from({ length: targetWins(result.format) + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}</select></label>)}
    </details>}
    <MatchHistory match={match} onCorrect={index => setEditingGame(editingGame === index ? undefined : index)} />
    {editingGame !== undefined && d?.games[editingGame] && !d.games[editingGame].voided && <GameCorrection
      key={`${editingGame}-${JSON.stringify(d.games[editingGame])}`} game={d.games[editingGame]} index={editingGame} match={match} stages={stages} apply={apply} close={() => setEditingGame(undefined)} />}
    {d?.games.some(g => !g.voided) && <button className="bracket-button danger mt-4" onClick={() => apply({ type: 'undo' })}>Deshacer último juego</button>}
    <p className="mt-4 text-xs text-slate-400">Una corrección nunca elimina juegos posteriores silenciosamente. Si produce un final anticipado, deshaz primero los juegos que sobren. Cambiar quién avanza puede invalidar encuentros dependientes, previa confirmación.</p>
  </section>
}
