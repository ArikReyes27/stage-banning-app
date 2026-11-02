import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from './workspaceContext'
import { browserStorage } from '../lib/tournamentWorkspace'
import { emptyRegistration, loadRegistration, REGISTRATION_KEY, saveRegistration } from '../utils/registration'
import type { Registration } from '../utils/registration'

function read(storage: Pick<Storage, 'getItem'>) {
  try { return { registration: loadRegistration(storage), error: '' } }
  catch { return { registration: emptyRegistration(), error: 'No se pudo leer el registro. El dato original se conserva; no se guardarán cambios hasta recuperarlo.' } }
}
export function useRegistration() {
  const workspace = useWorkspace()
  const storage = workspace?.storage ?? browserStorage
  const [state, setState] = useState(() => read(storage))
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    const sync = (e: StorageEvent) => { if (e.key === (workspace?.key ?? REGISTRATION_KEY) || e.key === null) setState(read(storage)) }
    const local = (e: Event) => { if ((e as CustomEvent).detail === workspace?.key) setState(read(storage)) }
    window.addEventListener('storage', sync)
    window.addEventListener('workspace-saved', local)
    return () => { mounted.current = false; window.removeEventListener('storage', sync); window.removeEventListener('workspace-saved', local) }
  }, [storage, workspace?.key])
  const save = (registration: Registration) => {
    if (state.error) throw new Error(state.error)
    if (!mounted.current) throw new Error('El torneo cambió. No se guardaron los datos pendientes.')
    // Reject stale edits rather than silently overwrite another tab's changes.
    if (JSON.stringify(loadRegistration(storage)) !== JSON.stringify(state.registration)) {
      setState(read(storage)); throw new Error('El registro cambió en otra pestaña. Revisa la lista e intenta nuevamente.')
    }
    try { saveRegistration(storage, registration) }
    catch { throw new Error('No se pudo guardar. El registro anterior se conserva; libera espacio o permite el almacenamiento local.') }
    setState({ registration, error: '' })
  }
  return { ...state, save }
}
