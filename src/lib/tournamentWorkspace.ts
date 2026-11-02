import { emptyRegistration, validateRegistration, REGISTRATION_KEY } from '../utils/registration.ts'
import type { Registration } from '../utils/registration.ts'
import { TOURNAMENT_STORAGE_KEY } from '../utils/tournamentStorage.ts'
import { exportTournament, parseTournament } from '../utils/tournamentValidation.ts'
import { validAccountId } from './remoteTournaments.ts'

export type Workspace = { version: 1; registration: Registration; tournament: string | null }
export const emptyWorkspace = (): Workspace => ({ version: 1, registration: emptyRegistration(), tournament: null })
export function workspaceKey(project: string, user: string, tournament: string) {
  if (!/^[a-z0-9]{20}$/.test(project) || !validAccountId(user) || !validAccountId(tournament)) throw new Error('Identificador de torneo inválido.')
  return `stage-strike.workspace.v1:${project}:${user.toLowerCase()}:${tournament.toLowerCase()}`
}
export function parseWorkspace(raw: string): Workspace {
  const value = JSON.parse(raw)
  if (value.version !== 1 || !(value.tournament === null || typeof value.tournament === 'string')) throw new Error('Espacio local inválido. Conserva su respaldo.')
  validateRegistration(value.registration)
  if (value.tournament !== null) parseTournament(value.tournament)
  return value
}
export function readWorkspace(storage: Pick<Storage, 'getItem'>, key: string): Workspace {
  const raw = storage.getItem(key)
  return raw === null ? emptyWorkspace() : parseWorkspace(raw)
}
export function backupLegacy(storage: Pick<Storage, 'getItem' | 'setItem'>) {
  const key = 'stage-strike.legacy-backup.v1'
  if (storage.getItem(key) === null) storage.setItem(key, JSON.stringify({ tournament: storage.getItem(TOURNAMENT_STORAGE_KEY), registration: storage.getItem(REGISTRATION_KEY) }))
}
export function ensureWorkspace(storage: Pick<Storage, 'getItem' | 'setItem'>, key: string) {
  backupLegacy(storage)
  if (storage.getItem(key) === null) storage.setItem(key, JSON.stringify(emptyWorkspace()))
  return readWorkspace(storage, key)
}
export const browserStorage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
}
export function workspaceStorage(key: string, allowed: () => boolean, backing: Pick<Storage, 'getItem' | 'setItem'> = browserStorage, notify = () => window.dispatchEvent(new CustomEvent('workspace-saved', { detail: key }))) {
  // Existing synchronous editors cannot await Web Locks. Exclusive tab ownership is
  // acquired by the boundary before mounting them; stale slices are checked as well.
  return {
    getItem(slice: string) {
      const w = readWorkspace(backing, key)
      return slice === TOURNAMENT_STORAGE_KEY ? w.tournament : JSON.stringify(w.registration)
    },
    setItem(slice: string, value: string) {
      if (!allowed()) throw new Error('El torneo seleccionado cambió o ya no está autorizado.')
      const raw = backing.getItem(key)
      const w = raw === null ? emptyWorkspace() : parseWorkspace(raw)
      const next = slice === TOURNAMENT_STORAGE_KEY ? { ...w, tournament: exportTournament(parseTournament(value)) } : { ...w, registration: validateRegistration(JSON.parse(value)) }
      if (slice === TOURNAMENT_STORAGE_KEY && w.tournament !== null) {
        const before = parseTournament(w.tournament), after = parseTournament(value)
        if (JSON.stringify(before.participants.map(p => p.id)) !== JSON.stringify(after.participants.map(p => p.id)) || (before.seeds.length > 0 && after.status === 'draft')) {
          backing.setItem(`${key}:before-replace:${Date.now()}`, raw!)
        }
      }
      if (raw !== null) backing.setItem(`${key}:backup`, raw)
      backing.setItem(key, JSON.stringify(next))
      notify()
    },
  }
}
