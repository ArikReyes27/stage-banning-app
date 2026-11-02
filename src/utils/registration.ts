import type { Tournament } from '../types/tournament.ts'

export type RegisteredPlayer = { id: string; nickname: string }
export type Registration = { schemaVersion: 1; participants: RegisteredPlayer[] }
export const REGISTRATION_KEY = 'stage-strike.registration.v1'
export const emptyRegistration = (): Registration => ({ schemaVersion: 1, participants: [] })
export const nicknameKey = (name: string) => name.trim().replace(/\s+/gu, ' ').toLowerCase()
export function cleanNickname(value: string): string {
  const name = value.trim()
  if (!name || name.length > 128 || [...name].some(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127)) throw new Error('Cada nickname debe contener entre 1 y 128 caracteres, sin saltos de línea ni caracteres de control.')
  return name
}
export function validateRegistration(value: unknown): Registration {
  if (!value || typeof value !== 'object' || !('schemaVersion' in value) || value.schemaVersion !== 1 || !('participants' in value) || !Array.isArray(value.participants)) throw new Error('Registro inválido o versión incompatible.')
  const ids = new Set<string>(), names = new Set<string>()
  const participants = value.participants.map((p: unknown) => {
    if (!p || typeof p !== 'object' || !('id' in p) || typeof p.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(p.id) || !('nickname' in p) || typeof p.nickname !== 'string') throw new Error('Participante inválido.')
    const nickname = cleanNickname(p.nickname), key = nicknameKey(nickname)
    if (ids.has(p.id) || names.has(key)) throw new Error('El registro contiene participantes duplicados.')
    ids.add(p.id); names.add(key)
    return { id: p.id, nickname }
  })
  return { schemaVersion: 1, participants }
}
export function previewNames(names: string[], current: Registration) {
  const existing = new Set(current.participants.map(p => nicknameKey(p.nickname))), seen = new Set<string>()
  const rows = names.filter(n => n.trim()).map(value => {
    const nickname = cleanNickname(value), key = nicknameKey(nickname)
    const repeated = seen.has(key), registered = existing.has(key)
    seen.add(key)
    return { nickname, repeated, registered }
  })
  if (!rows.length) throw new Error('No se encontraron nicknames.')
  return { rows, newCount: rows.filter(r => !r.repeated && !r.registered).length, duplicateCount: rows.filter(r => r.repeated || r.registered).length }
}
export function importNames(current: Registration, names: string[], mode: 'add' | 'replace', id = () => crypto.randomUUID()): Registration {
  const preview = previewNames(names, current)
  const byName = new Map(current.participants.map(p => [nicknameKey(p.nickname), p]))
  const added = preview.rows.filter(r => !r.repeated && (mode === 'replace' || !r.registered)).map(r => ({ id: byName.get(nicknameKey(r.nickname))?.id ?? id(), nickname: r.nickname }))
  return validateRegistration({ schemaVersion: 1, participants: mode === 'add' ? [...current.participants, ...added] : added })
}
export function editRegistered(current: Registration, id: string, nickname: string): Registration {
  if (!current.participants.some(p => p.id === id)) throw new Error('El participante ya no existe.')
  return validateRegistration({ ...current, participants: current.participants.map(p => p.id === id ? { ...p, nickname: cleanNickname(nickname) } : p) })
}
export function removeRegistered(current: Registration, ids: string[]): Registration {
  const selected = new Set(ids)
  return { ...current, participants: current.participants.filter(p => !selected.has(p.id)) }
}
export function loadRegistration(storage: Pick<Storage, 'getItem'>): Registration {
  const raw = storage.getItem(REGISTRATION_KEY)
  return raw === null ? emptyRegistration() : validateRegistration(JSON.parse(raw))
}
export function saveRegistration(storage: Pick<Storage, 'setItem'>, value: Registration) {
  storage.setItem(REGISTRATION_KEY, JSON.stringify(validateRegistration(value)))
}
export function registrationTop8(current: Registration, ids: string[]): Tournament {
  if (ids.length !== 8 || new Set(ids).size !== 8) throw new Error('Selecciona exactamente ocho participantes.')
  const participants = ids.map(id => {
    const p = current.participants.find(p => p.id === id)
    if (!p) throw new Error('Un participante seleccionado ya no está registrado.')
    if (p.nickname.length > 32) throw new Error(`El Top 8 actual admite nicknames de hasta 32 caracteres: ${p.nickname}`)
    return { ...p, characterIds: [] }
  })
  return { schemaVersion: 1, status: 'draft', participants, seeds: [], results: {} }
}
