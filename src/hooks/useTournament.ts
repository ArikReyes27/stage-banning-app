import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from './workspaceContext'
import { browserStorage } from '../lib/tournamentWorkspace'
import type { Tournament } from '../types/tournament'
import { createTournament } from '../utils/doubleElimination'
import { loadTournament, saveTournament, TOURNAMENT_STORAGE_KEY } from '../utils/tournamentStorage'

function readLocalTournament(storage: Pick<Storage, 'getItem' | 'setItem'>) {
  try { return loadTournament(storage) }
  catch { return { tournament: createTournament(), error: 'El almacenamiento local no está disponible. Exporta un JSON para conservar el torneo.' } }
}

// Same localStorage + storage-event pattern as useLocalStorage, with visible errors.
export function useTournament() {
  const workspace = useWorkspace()
  const storage = workspace?.storage ?? browserStorage
  const read = () => readLocalTournament(storage)
  const [state, setState] = useState(read)
  const mounted = useRef(false)
  const raw = () => { try { return storage.getItem(TOURNAMENT_STORAGE_KEY) } catch { return null } }
  const expected = useRef(raw())
  useEffect(() => {
    mounted.current = true
    const refresh = () => { try { expected.current = storage.getItem(TOURNAMENT_STORAGE_KEY) } catch { expected.current = null }; setState(readLocalTournament(storage)) }
    const sync = (event: StorageEvent) => {
      if (event.key === (workspace?.key ?? TOURNAMENT_STORAGE_KEY) || event.key === null) refresh()
    }
    const local = (e: Event) => { if ((e as CustomEvent).detail === workspace?.key) refresh() }
    window.addEventListener('storage', sync)
    window.addEventListener('workspace-saved', local)
    return () => { mounted.current = false; window.removeEventListener('storage', sync); window.removeEventListener('workspace-saved', local) }
  }, [storage, workspace?.key])

  const save = (tournament: Tournament) => {
    try {
      if (!mounted.current) return false
      if (workspace && storage.getItem(TOURNAMENT_STORAGE_KEY) !== expected.current) throw new Error('stale')
      saveTournament(storage, tournament)
      expected.current = storage.getItem(TOURNAMENT_STORAGE_KEY)
      setState({ tournament })
      return true
    } catch {
      setState(workspace ? { ...read(), error: 'No se guardó la edición. El espacio cambió, está bloqueado o no hay espacio para el respaldo. Revisa el torneo antes de reintentar.' } : { tournament, error: 'No se pudo guardar en este navegador. Los cambios están en memoria: exporta el torneo a JSON antes de cerrar.' })
      return false
    }
  }

  return { ...state, save }
}
