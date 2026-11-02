import { useState } from 'react'
import type { ResolvedMatch } from '../../types/tournament'
import type { MatchAction } from '../../utils/matchSession'

export function DQControls({ match, apply }: { match: ResolvedMatch; apply: (action: MatchAction) => boolean }) {
  const [open, setOpen] = useState(false)
  const [loser, setLoser] = useState('')
  const [reason, setReason] = useState('')
  const dq = match.result?.outcome
  if (!match.enabled || !match.players.every(Boolean)) return null
  return <section className="dq-controls" aria-label="Descalificación del enfrentamiento">
    {dq ? <>
      <p className="font-bold">DQ · {match.players[dq.loser]?.nickname}</p>
      <p className="my-2 text-sm">{dq.reason || 'Sin motivo registrado'} · <time dateTime={dq.recordedAt}>{new Date(dq.recordedAt).toLocaleString()}</time></p>
      <button type="button" className="bracket-button danger" onClick={() => apply({ type: 'revert-dq' })}>Revertir DQ</button>
    </> : <>
      <button type="button" className="bracket-button danger" aria-expanded={open} onClick={() => setOpen(v => !v)}>DQ / Descalificar</button>
      {open && <div className="mt-3 space-y-3">
        <label className="block text-sm font-bold">Participante que recibirá el DQ
          <select className="form-control mt-1" value={loser} onChange={e => setLoser(e.target.value)}>
            <option value="">Elegir participante</option>
            {match.players.map((p, i) => <option value={i} key={p!.id}>{p!.nickname}</option>)}
          </select>
        </label>
        <label className="block text-sm font-bold">Motivo (opcional, máximo 160 caracteres)
          <input className="form-control mt-1" value={reason} maxLength={160} placeholder="No se presentó a tiempo"
            onChange={e => setReason(e.target.value)} />
        </label>
        <p className="text-sm text-slate-300">El rival ganará el enfrentamiento por DQ. Los juegos previos se conservan; no se asigna un 2–0 o 3–0 artificial. El DQ solo afecta este encuentro.</p>
        <div className="flex flex-wrap gap-2"><button className="bracket-button danger" type="button" disabled={loser === ''}
          onClick={() => { if (apply({ type: 'dq', loser: Number(loser) as 0 | 1, reason })) setOpen(false) }}>Confirmar DQ…</button>
          <button className="bracket-button" type="button" onClick={() => setOpen(false)}>Cancelar DQ</button></div>
      </div>}
    </>}
  </section>
}
