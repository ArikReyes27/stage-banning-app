import type { SupabaseClient } from '@supabase/supabase-js'
import type { Tournament } from '../types/tournament.ts'
import { parseTournament, exportTournament } from '../utils/tournamentValidation.ts'
import { nicknameKey } from '../utils/registration.ts'
import { checkedRevision } from './remoteTournaments.ts'

export type CloudSnapshot = {
  id: string; name: string; revision: string; import_id: string | null; state: Record<string, unknown>
  roster: { id: string; nickname: string; character_ids: string[]; roster_order: number; in_bracket: boolean; profile_id: string | null }[]
}
export type DraftPreview = { raw: string; tournament: Tournament; payload: unknown; blocked: string | null }

// Parser defaults may add fields, but an export must never drop or change source data.
function retainsSource(source: unknown, parsed: unknown): boolean {
  if (Array.isArray(source)) return Array.isArray(parsed) && source.length === parsed.length && source.every((v, i) => retainsSource(v, parsed[i]))
  if (source !== null && typeof source === 'object') {
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return false
    return Object.entries(source).every(([key, value]) => Object.hasOwn(parsed, key) && retainsSource(value, (parsed as Record<string, unknown>)[key]))
  }
  return source === parsed
}

export function previewDraft(raw: string): DraftPreview {
  const tournament = parseTournament(raw), payload = JSON.parse(raw) as Record<string, unknown>
  const allowed = ['schemaVersion', 'status', 'participants', 'seeds', 'results', 'priorities', ...(tournament.schemaVersion === 2 ? ['structure', 'completionOrder'] : [])]
  let blocked: string | null = null
  if (tournament.status !== 'draft' || tournament.seeds.length || Object.keys(tournament.results).length) blocked = 'El torneo tiene sorteo o estado competitivo. Se conserva íntegro en el respaldo; todavía no se puede subir.'
  else if (tournament.participants.length > 128) blocked = 'La carga inicial admite de 2 a 128 participantes (exactamente 8 en v1).'
  else if (Object.keys(payload).some(key => !allowed.includes(key)) || Object.keys(tournament.priorities ?? {}).length) blocked = 'El borrador tiene campos o prioridades aún no admitidos. No se eliminarán para subirlo.'
  else if (tournament.participants.some(p => p.characterIds.length > 0)) blocked = 'El borrador tiene personajes seleccionados. Su validación en servidor está pendiente; no se eliminarán las selecciones.'
  else if (tournament.participants.some(p => !p.nickname.trim() || [...p.nickname].some(c => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127)) || new Set(tournament.participants.map(p => nicknameKey(p.nickname))).size !== tournament.participants.length) blocked = 'Completa nicknames distintos y sin caracteres de control antes de subir el borrador.'
  // Do not discard extra participant data by passing only the parser's normalized form.
  else if ((payload.participants as Record<string, unknown>[]).some(p => Object.keys(p).some(key => !['id', 'nickname', 'characterIds'].includes(key)))) blocked = 'Los participantes contienen campos adicionales no admitidos. Se conservarán solo en el respaldo.'
  return { raw, tournament, payload, blocked }
}

export function snapshotIsEmpty(snapshot: CloudSnapshot): boolean {
  const s = snapshot.state
  return snapshot.roster.length === 0 && !snapshot.import_id && Object.keys(s).length === 6 &&
    s.schemaVersion === 2 && s.status === 'draft' && JSON.stringify(s.seeds) === '[]' &&
    JSON.stringify(s.results) === '{}' && JSON.stringify(s.structure) === '[]' && JSON.stringify(s.completionOrder) === '[]'
}

export function snapshotTournament(snapshot: CloudSnapshot): Tournament {
  const rows = [...snapshot.roster].sort((a, b) => a.roster_order - b.roster_order)
  if (rows.some((p, i) => p.roster_order !== i || !p.in_bracket || p.profile_id !== null)) throw new Error('El snapshot incluye datos de inscripción que no caben en el JSON local. Descarga el snapshot completo.')
  const source = { ...snapshot.state, participants: rows.map(p => ({ id: p.id, nickname: p.nickname, characterIds: p.character_ids })) }
  const parsed = parseTournament(JSON.stringify(source))
  if (!retainsSource(source, parsed)) throw new Error('El JSON local descartaría datos del snapshot. Descarga el snapshot completo.')
  return parsed
}

export async function readCloudSnapshot(client: SupabaseClient, id: string): Promise<CloudSnapshot> {
  const { data, error } = await client.rpc('ss_read_tournament_snapshot', { p_tournament: id })
  if (error) throw error
  if (!data || data.id !== id || !Array.isArray(data.roster) || !data.state || typeof data.state !== 'object') throw new Error('Invalid snapshot')
  checkedRevision(data.revision)
  return data as CloudSnapshot
}

export async function initializeCloudDraft(client: SupabaseClient, snapshot: CloudSnapshot, preview: DraftPreview, importId: string) {
  if (preview.blocked || !snapshotIsEmpty(snapshot)) throw new Error('Draft upload not permitted')
  const { data, error } = await client.rpc('ss_initialize_tournament_draft', {
    p_tournament: snapshot.id, p_expected: checkedRevision(snapshot.revision), p_import_id: importId, p_snapshot: preview.payload,
  })
  if (error) throw error
  return checkedRevision(data)
}

export function snapshotExport(snapshot: CloudSnapshot): string { return exportTournament(snapshotTournament(snapshot)) }

export function cloudDraftError(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null
  if (code === 'LOCAL_CHANGED') return 'El torneo local cambió después de la vista previa. Revisa una vista previa nueva y descarga otro respaldo; no se envió ningún dato.'
  if (code === '55000') return 'El torneo remoto ya tiene datos. No se sobrescribió: vuelve a consultar el snapshot.'
  if (code === '22023') return 'El servidor rechazó el borrador. Solo admite borradores iniciales compatibles, sin personajes, prioridades, sorteo ni resultados.'
  if (code === 'PGRST202') return 'Falta aplicar y comprobar manualmente la migración 15.5A en el proyecto de pruebas.'
  if (code === '40001') return 'La revisión remota cambió. Revisa un snapshot nuevo; no se reintentó la escritura.'
  if (code === '42501') return 'No tienes acceso de propietario o administrador verificado a este torneo.'
  return 'No se pudo confirmar la operación. Consulta de nuevo el snapshot antes de repetir; conserva tu respaldo JSON.'
}
