import type { SupabaseClient } from '@supabase/supabase-js'
import { checkedRevision, type ManagedTournament } from './remoteTournaments.ts'
import type { CloudSnapshot } from './cloudDrafts.ts'

export type LifecycleReview = { version: 15503; snapshot: CloudSnapshot; archived_at: string | null }
export function lifecycleAvailable(t: ManagedTournament) { return t.archived_at === null || typeof t.archived_at === 'string' }
export function lifecycleName(value: string) {
  const clean = value.trim()
  if (!clean || [...clean].length > 200) throw new Error('Escribe un nombre de 1 a 200 caracteres.')
  return clean
}
export async function lifecycleReview(client: SupabaseClient, t: ManagedTournament): Promise<LifecycleReview> {
  if (t.role !== 'owner' || !lifecycleAvailable(t)) throw new Error('Acción no disponible.')
  const { data, error } = await client.rpc('ss_tournament_lifecycle_review', { p_tournament: t.id })
  if (error) throw error
  if (data?.version !== 15503 || data.snapshot?.id !== t.id || typeof data.snapshot.name !== 'string' || !Array.isArray(data.snapshot.roster)) throw new Error('Contrato de administración no disponible.')
  checkedRevision(data.snapshot.revision)
  return data
}
export async function lifecycleMutation(client: SupabaseClient, review: LifecycleReview, action: 'rename' | 'archive' | 'restore' | 'delete', value = '') {
  if (review.version !== 15503) throw new Error('Revisión incompatible.')
  const args = { p_tournament: review.snapshot.id, p_expected: checkedRevision(review.snapshot.revision) }
  if (action === 'delete' && value !== review.snapshot.name) throw new Error('Escribe exactamente el nombre del torneo.')
  const name = action === 'rename' ? 'ss_rename_tournament' : action === 'delete' ? 'ss_delete_tournament' : 'ss_set_tournament_archived'
  const payload = action === 'rename' ? { ...args, p_name: lifecycleName(value) } : action === 'delete' ? { ...args, p_confirmation: value } : { ...args, p_archived: action === 'archive' }
  const result = await client.rpc(name, payload)
  if (result.error) throw result.error
  // No automatic retry, including ambiguous network failures after deletion.
  return result.data
}
export function lifecycleError(e: unknown) {
  const code = e && typeof e === 'object' && 'code' in e ? e.code : null
  if (code === '40001') return 'El torneo cambió. Actualiza la lista y revisa otra vez; no se reintentó la acción.'
  if (code === '42501') return 'Solo el propietario verificado puede realizar esta acción.'
  if (code === '22023') return 'Nombre inválido o confirmación distinta del nombre actual. Revisa el torneo antes de continuar.'
  if (code === '0A000') return 'El servidor bloqueó la eliminación por cambios en sus dependencias o triggers. Requiere revisión SQL; no se eliminó el torneo.'
  if (code === 'PGRST202' || code === '42703') return 'Falta aplicar y verificar manualmente la migración 15.5C en stage-strike-tests.'
  return 'No se pudo confirmar la acción. Actualiza la lista antes de intentar nuevamente; conserva el respaldo.'
}
