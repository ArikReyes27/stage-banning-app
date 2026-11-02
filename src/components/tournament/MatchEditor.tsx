import { useEffect, useRef, useState } from 'react'
import type { MatchId, MatchResult, Tournament } from '../../types/tournament'
import { resolveBracket } from '../../utils/doubleElimination'
import { copyResult, targetWins, winnerSlot } from '../../utils/tournamentResults'
import { CharacterPicker } from './CharacterPicker'
import { VictoryIcons } from './VictoryIcons'
import { navigateTo } from '../../app/navigation'
import { displayGame, matchActionWarnings, matchState, proposeMatchAction, readMatchResult, type MatchAction } from '../../utils/matchSession'
import { proposeQuickCommit } from '../../utils/quickMatchEditor'
import { DQControls } from './DQControls'
import { MatchHistory } from './MatchHistory'

export function MatchEditor({ tournament, matchId, onSave, onClose }: {
  tournament: Tournament; matchId: MatchId; onSave: (value: Tournament) => boolean | void; onClose: () => void
}) {
  const original = resolveBracket(tournament).find(m => m.id === matchId)!
  const [draft, setDraft] = useState<MatchResult | null>(null)
  const [baseline, setBaseline] = useState('')
  const [notice, setNotice] = useState('')
  const editing = draft !== null
  const working = draft ? { ...tournament, results: { ...tournament.results, [matchId]: draft } } : tournament
  const match = draft ? resolveBracket(working).find(m => m.id === matchId)! : original
  const result = readMatchResult(match), terminal = winnerSlot(result) !== undefined
  const dirty = editing && JSON.stringify(draft) !== baseline
  const conflict = editing && JSON.stringify(original.result ? copyResult(original.result) : undefined) !== baseline
  const editable = (!original.result?.confirmed || editing) && !result.outcome && !conflict
  const games = result.details?.games ?? []
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    element.showModal()
    return () => element.close()
  }, [])
  const close = () => {
    if (dirty && !window.confirm('¿Descartar la corrección pendiente? El resultado guardado se conservará.')) return
    onClose()
  }
  const save = (confirmed: boolean, closeAfter = true): boolean => {
    try {
      if (conflict) throw new Error('El encuentro cambió en otra vista. Descarta este borrador y vuelve a corregir el resultado actualizado.')
      if (!dirty && !confirmed) {
        if (onSave(tournament) === false) throw new Error('No se pudo guardar el progreso.')
      } else {
        const proposal = proposeQuickCommit(tournament, matchId, result, confirmed)
        const warnings: string[] = []
        if (confirmed) warnings.push('¿Confirmar el ganador del set y actualizar el bracket?')
        else if (editing) warnings.push('¿Guardar esta corrección del resultado confirmado?')
        if (proposal.invalidated.length) warnings.push('Se invalidarán los resultados e historiales dependientes: ' + proposal.invalidated.join(', ') + '.')
        if (original.result?.confirmed && !proposal.tournament.results[matchId]?.confirmed) warnings.push('El set quedará pendiente de confirmación; sus jugadores dejarán de avanzar.')
        if (warnings.length && !window.confirm(warnings.join('\n\n'))) return false
        if (onSave(proposal.tournament) === false) throw new Error('No se pudo guardar. Conserva un respaldo antes de salir.')
      }
      setDraft(null); setNotice('Progreso guardado.')
      if (closeAfter) onClose()
      return true
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'No se pudo guardar.'); return false }
  }
  const apply = (action: MatchAction): boolean => {
    try {
      if (conflict) throw new Error('El encuentro cambió en otra vista. Descarta el borrador antes de continuar.')
      if (original.result?.confirmed && !editing) return false
      const proposal = proposeMatchAction(working, matchId, action)
      if (action.type === 'dq' || action.type === 'revert-dq') {
        if (dirty) throw new Error('Guarda o descarta la corrección pendiente antes de aplicar o revertir DQ.')
        const warnings = matchActionWarnings(original, action, proposal)
        if (warnings.length && !window.confirm(warnings.join('\n\n'))) return false
        if (onSave(proposal.tournament) === false) throw new Error('No se pudo guardar el DQ.')
        setDraft(null)
      } else if (editing) {
        setDraft(proposal.tournament.results[matchId]!)
        setNotice('Corrección pendiente: guarda para aplicarla al bracket.')
      } else {
        const warnings = matchActionWarnings(match, action, proposal)
        if (warnings.length && !window.confirm(warnings.join('\n\n'))) return false
        if (onSave(proposal.tournament) === false) throw new Error('No se pudo guardar el progreso.')
        setNotice('Progreso guardado; el ganador avanza al confirmar.')
      }
      return true
    } catch (cause) { setNotice(cause instanceof Error ? cause.message : 'No se pudo actualizar el resultado.'); return false }
  }
  return <dialog ref={dialog} className="bracket-dialog quick-match-editor" aria-labelledby="match-editor-title" onCancel={e => { e.preventDefault(); close() }}>
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-xs font-black uppercase tracking-widest text-cyan-300">{match.round}</p><h2 id="match-editor-title" className="mt-1 text-2xl font-black">Encuentro {match.id}</h2></div>
      <button type="button" className="bracket-button" onClick={close} aria-label="Cerrar panel de resultados">Cerrar</button>
    </div>
    <div className="my-4 flex flex-wrap items-center gap-3">
      <span className={'match-state ' + matchState(original).key}>{matchState(original).label}</span>
      <button type="button" className="bracket-button" onClick={() => { if (dirty && !save(false, false)) return; onClose(); navigateTo('/tournament/match/' + matchId) }}>Abrir VS</button>
      {(original.result?.confirmed || editing) && <button type="button" className="bracket-button" onClick={() => {
        if (editing) { if (!dirty || window.confirm('¿Descartar la corrección pendiente?')) { setDraft(null); setNotice('Resultado guardado conservado.') } }
        else { setBaseline(JSON.stringify(copyResult(original.result!))); setDraft(copyResult(original.result!)); setNotice('Modo corrección. Los cambios se aplican al guardar.') }
      }}>{editing ? 'Descartar corrección' : 'Corregir encuentro'}</button>}
    </div>
    {notice && <p role="status" className="my-3 text-sm text-amber-200">{notice}</p>}
    {conflict && <p role="alert">El resultado cambió en otra vista. Descarta la corrección para consultar la versión actual.</p>}
    <fieldset disabled={!editable}>
      <div className="my-4 flex gap-3" aria-label="Formato del enfrentamiento">{(['BO3', 'BO5'] as const).map(format => <button key={format} type="button" className="bracket-button" aria-pressed={result.format === format} onClick={() => { if (format !== result.format) apply({ type: 'format', format }) }}>{format} · {targetWins(format)} victorias</button>)}</div>
    </fieldset>
    <div className="space-y-3">{([0, 1] as const).map(slot => <div key={slot} className="quick-player-row">
      <div className="quick-player-identity"><CharacterPicker label={match.players[slot]!.nickname} setup={displayGame(match)} slot={slot} disabled={!editable || terminal} onChange={setup => apply({ type: 'select', setup })}/><strong>{match.players[slot]!.nickname}</strong></div>
      <VictoryIcons match={match} slot={slot} compact onClick={editable ? (slot, index) => { apply({ type: 'icon', slot, index }) } : undefined}/>
      <span className="quick-score" aria-label={result.scores[slot] + ' juegos ganados'}>{result.scores[slot]}</span>
    </div>)}</div>
    <p className="my-3 text-xs text-slate-400">Icono principal: cambiar personaje. Victorias: sumar una; al retirar se apagan esa victoria y las siguientes del jugador. Sin huecos.</p>
    <p className="my-3 text-sm text-slate-300">{dirty ? 'Corrección pendiente · ' : result.confirmed ? 'Resultado confirmado · ' : 'Progreso sin confirmar · '}{result.scores.join(' – ')} · {result.format}</p>
    <div className="flex flex-wrap gap-3">
      <button className="bracket-button" type="button" disabled={conflict} onClick={() => save(false)}>Guardar progreso</button>
      <button className="bracket-button primary" type="button" disabled={!editable || !terminal || (result.confirmed && !dirty)} onClick={() => save(true)}>Confirmar ganador</button>
    </div>
    <details className="quick-history"><summary>Ver historial del set <span>· {games.filter(g => !g.voided).length} registrados · {games.filter(g => g.voided).length} retirados</span></summary><div className="quick-history-scroll"><MatchHistory match={match}/></div></details>
    <fieldset disabled={(!!original.result?.confirmed && !editing) || dirty || conflict}><DQControls match={match} apply={apply}/></fieldset>
    {dirty && <p className="text-xs text-slate-400">Guarda o descarta la corrección antes de aplicar DQ.</p>}
  </dialog>
}
