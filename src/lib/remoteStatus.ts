import type { SupabaseClient } from '@supabase/supabase-js'
import { readCloudSnapshot, snapshotIsEmpty, type CloudSnapshot } from './cloudDrafts.ts'
import { workspaceKey, readWorkspace } from './tournamentWorkspace.ts'
import { parseTournament } from '../utils/tournamentValidation.ts'

// Fase 15.6 A1: read-only comparison of one tournament's remote snapshot with ITS OWN local workspace.
// Nothing here writes to Supabase or to storage, imports data or merges states.
export type ReadFailure = 'offline' | 'unauthenticated' | 'forbidden' | 'unavailable' | 'invalid' | 'unknown'
export type LocalSummary = { stage: 'none' | 'draft' | 'ready' | 'started' | 'unreadable'; participants: number; results: number; confirmed: number }
export type RemoteSummary = { revision: string; participants: number; status: string; results: number; empty: boolean; linked: boolean }
export type SyncComparison = { localOnlyResults: boolean; lines: string[] }
export type RemoteStatus =
  | { ok: true; snapshot: CloudSnapshot; remote: RemoteSummary; local: LocalSummary; comparison: SyncComparison }
  | { ok: false; failure: ReadFailure; local: LocalSummary }

const NETWORK = /failed to fetch|fetch failed|network|load failed|timed? ?out|econn|enotfound/i

export function classifyReadFailure(error: unknown, online = true): ReadFailure {
  if (!online) return 'offline'
  const e = (error && typeof error === 'object' ? error : {}) as { code?: unknown; status?: unknown; message?: unknown; name?: unknown }
  const code = typeof e.code === 'string' ? e.code : '', message = typeof e.message === 'string' ? e.message : ''
  if (code === '42501') return 'forbidden'
  if (code === 'PGRST202') return 'unavailable'
  if (code === 'PGRST301' || e.status === 401 || /jwt|not authenticated|invalid claim/i.test(message)) return 'unauthenticated'
  if (message === 'Invalid snapshot' || message === 'Invalid revision') return 'invalid'
  if (e.name === 'TypeError' || e.name === 'AuthRetryableFetchError' || NETWORK.test(message)) return 'offline'
  return 'unknown'
}

export function readFailureMessage(failure: ReadFailure): string | null {
  switch (failure) {
    case 'offline': return 'Sin conexión con Supabase. Tu información local no cambió y sigue disponible; vuelve a consultar cuando haya red.'
    case 'unauthenticated': return 'La sesión no es válida o expiró. Inicia sesión en Cuenta; tu información local no cambió.'
    case 'forbidden': return 'Tu cuenta no tiene acceso verificado a este torneo remoto. Tu información local no cambió.'
    case 'unavailable': return 'El servidor de pruebas aún no tiene la consulta de lectura disponible (migración 15.5A pendiente). Tu información local no cambió.'
    case 'invalid': return 'La respuesta remota no corresponde a este torneo y se descartó. Tu información local no cambió.'
    default: return null
  }
}

export function localSummary(storage: Pick<Storage, 'getItem'>, key: string): LocalSummary {
  try {
    const raw = readWorkspace(storage, key).tournament
    if (raw === null) return { stage: 'none', participants: 0, results: 0, confirmed: 0 }
    const t = parseTournament(raw), results = Object.values(t.results)
    return { stage: t.status, participants: t.participants.length, results: results.length, confirmed: results.filter(r => r?.confirmed).length }
  } catch { return { stage: 'unreadable', participants: 0, results: 0, confirmed: 0 } }
}

export function remoteSummary(snapshot: CloudSnapshot): RemoteSummary {
  const state = snapshot.state, results = state.results
  return {
    revision: snapshot.revision, participants: snapshot.roster.length, status: typeof state.status === 'string' ? state.status : 'desconocido',
    results: results && typeof results === 'object' ? Object.keys(results).length : 0, empty: snapshotIsEmpty(snapshot), linked: !!snapshot.import_id,
  }
}

export function compareStatus(local: LocalSummary, remote: RemoteSummary): SyncComparison {
  const lines: string[] = []
  const localOnlyResults = local.stage !== 'unreadable' && local.results > 0 && remote.results === 0
  if (local.stage === 'unreadable') lines.push('El espacio local de este torneo no se pudo leer. No se modificó; conserva su respaldo.')
  else if (local.stage === 'none') lines.push('Este dispositivo no tiene bracket local para este torneo.')
  else lines.push(`Local (solo este dispositivo): ${local.stage}, ${local.participants} participantes, ${local.results} resultados (${local.confirmed} confirmados).`)
  lines.push(remote.empty ? 'Remoto: vacío, sin participantes ni resultados.' : `Remoto: ${remote.status}, ${remote.participants} participantes, ${remote.results} resultados.`)
  if (localOnlyResults) lines.push(`Los ${local.results} resultados locales existen únicamente en este dispositivo; el remoto no los tiene.`)
  else if (remote.results > 0) lines.push('El remoto ya tiene resultados. Esta consulta no los compara ni los combina con los locales.')
  return { localOnlyResults, lines }
}

export async function loadRemoteStatus(
  client: Pick<SupabaseClient, 'rpc'>, storage: Pick<Storage, 'getItem'>,
  project: string, userId: string, tournamentId: string, online = true,
): Promise<RemoteStatus> {
  let key: string | null = null
  try { key = workspaceKey(project, userId, tournamentId) } catch { /* invalid ids: no local space can be named */ }
  const local = () => key === null ? { stage: 'unreadable', participants: 0, results: 0, confirmed: 0 } as LocalSummary : localSummary(storage, key)
  if (!online) return { ok: false, failure: 'offline', local: local() }
  try {
    const snapshot = await readCloudSnapshot(client as SupabaseClient, tournamentId)
    const l = local(), remote = remoteSummary(snapshot)
    return { ok: true, snapshot, remote, local: l, comparison: compareStatus(l, remote) }
  } catch (error) {
    return { ok: false, failure: classifyReadFailure(error, online), local: local() }
  }
}
