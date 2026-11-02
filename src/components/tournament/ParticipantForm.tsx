import type { Tournament } from '../../types/tournament'
import { characters } from '../../data/characters'
import { rosterError, shuffleSeeds } from '../../utils/doubleElimination'
import { CharacterIcon } from './CharacterIcon'

export function ParticipantForm({ tournament, onSave }: { tournament: Tournament; onSave: (value: Tournament) => void }) {
  const error = rosterError(tournament.participants)
  const update = (index: number, field: 'nickname' | 'characterIds', value: string) => {
    onSave({
      ...tournament, status: 'draft', seeds: [], results: {},
      participants: tournament.participants.map((p, i) => i !== index ? p : {
        ...p, [field]: field === 'nickname' ? value : value ? [value] : [],
      }),
    })
  }
  return (
    <form className="glass-panel rounded-3xl p-5 sm:p-7" onSubmit={(event) => {
      event.preventDefault()
      if (error) return
      onSave({ ...tournament, status: 'ready', seeds: shuffleSeeds(tournament.participants), results: {},
        participants: tournament.participants.map((p) => ({ ...p, nickname: p.nickname.trim() })) })
    }}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-black text-white">8 jugadores. Un campeón.</h2>
          <p className="mt-1 text-sm text-slate-400">Solo alias y personaje. El orden de registro no define los cruces.</p></div>
        <span className="bracket-badge">{tournament.participants.filter((p) => p.nickname.trim() && p.characterIds.length).length} / 8</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {tournament.participants.map((player, index) => (
          <div key={player.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-xs font-black text-slate-400">Participante {index + 1}</span></div>
            <label className="block text-xs font-bold text-slate-300">Nickname
              <input className="form-control mt-1" maxLength={32} required value={player.nickname}
                autoComplete="off" onChange={(e) => update(index, 'nickname', e.target.value)} />
            </label>
            <label className="mt-3 block text-xs font-bold text-slate-300">Personaje principal
              <span className="mt-1 flex items-center gap-2">
              <CharacterIcon characterId={player.characterIds[0]} />
              <select className="form-control min-w-0 flex-1" required value={player.characterIds[0] ?? ''}
                onChange={(e) => update(index, 'characterIds', e.target.value)}>
                <option value="">Seleccionar personaje</option>
                {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
              </select>
              </span>
            </label>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button className="bracket-button primary" type="submit" disabled={!!error}>
          {tournament.status === 'ready' ? 'Volver a sortear' : 'Generar bracket'}
        </button>
        <p className="text-xs text-slate-400">{error ?? 'Puedes volver a sortear antes de iniciar el torneo.'}</p>
      </div>
      <p className="mt-3 text-xs text-slate-500">Editar un participante descarta el sorteo previo. Los cambios se guardan en este navegador.</p>
    </form>
  )
}
