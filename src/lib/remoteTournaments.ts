import type { SupabaseClient } from '@supabase/supabase-js'

export type RemoteTournament = { id: string; name: string; owner_id: string; created_at: string; archived_at?: string | null }
export type ManagedTournament = RemoteTournament & { role: 'owner' | 'admin' }
export type Membership = { tournament_id: string; profile_id: string; role: string }
export type AdminInvitation = { id: string; tournament_id: string; invitee_id: string; invited_by: string; expires_at: string; status: string }
export type TournamentAccess = { revision: number; admins: Membership[]; invitations: AdminInvitation[] }
const invitationColumns = 'id,tournament_id,invitee_id,invited_by,expires_at,status'

export function managedTournaments(rows: RemoteTournament[], memberships: Membership[], userId: string): ManagedTournament[] {
  const adminIds = new Set(memberships.filter(m => m.profile_id === userId && m.role === 'admin').map(m => m.tournament_id))
  return rows.flatMap<ManagedTournament>(t => t.owner_id === userId ? [{ ...t, role: 'owner' as const }]
    : adminIds.has(t.id) ? [{ ...t, role: 'admin' as const }] : [])
}

export function validAccountId(value: string): boolean {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value.trim())
}

export function checkedRevision(value: unknown): number {
  const n = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value
  if (typeof n !== 'number' || !Number.isSafeInteger(n) || n < 0) throw new Error('Invalid revision')
  return n
}

export function tournamentError(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null
  if (code === '40001') return 'El torneo cambió mientras lo editabas. Actualiza la lista y revisa los permisos antes de volver a intentarlo.'
  if (code === '42501' || code === 'PGRST301') return 'La operación no está permitida. Comprueba tu sesión, la confirmación del correo y tus permisos; la invitación puede haber caducado o sido revocada.'
  if (code === '23505') return 'Ya existe una invitación pendiente para esa cuenta. Actualiza la lista.'
  if (code === '22023') return 'Revisa los datos: el destinatario debe ser otra cuenta verificada con perfil y no ser ya administrador.'
  if (code === 'PGRST202' || code === 'PGRST205') return 'Las operaciones de torneos no están disponibles en este proyecto de pruebas. Revisa la configuración de la Fase 15.4A.'
  return 'No se pudo confirmar la operación. Revisa la conexión y actualiza la lista antes de repetirla para evitar duplicados.'
}

// Paginate read-only queries. No unbounded profile/directory lookup is performed.
async function allRows<T>(query: (start: number, end: number) => PromiseLike<{ data: T[] | null; error: unknown; count: number | null }>): Promise<T[]> {
  const rows: T[] = []
  for (;;) {
    const result = await query(rows.length, rows.length + 199)
    if (result.error) throw result.error
    const batch = result.data ?? []
    rows.push(...batch)
    if (!batch.length || (result.count !== null && rows.length >= result.count)) return rows
  }
}

export async function loadTournamentDashboard(client: SupabaseClient, userId: string) {
  const tournaments = async () => {
    try { return await allRows<RemoteTournament>((a, b) => client.from('tournaments').select('id,name,owner_id,created_at,archived_at', { count: 'exact' }).order('created_at', { ascending: false }).order('id').range(a, b)) }
    catch (e) {
      // Compatibility before 15.5C: absence of the column keeps lifecycle actions disabled.
      if (!e || typeof e !== 'object' || !('code' in e) || e.code !== '42703') throw e
      return allRows<RemoteTournament>((a, b) => client.from('tournaments').select('id,name,owner_id,created_at', { count: 'exact' }).order('created_at', { ascending: false }).order('id').range(a, b))
    }
  }
  const [rows, memberships, invitations] = await Promise.all([
    tournaments(),
    allRows<Membership>((a, b) => client.from('tournament_members').select('tournament_id,profile_id,role', { count: 'exact' }).eq('profile_id', userId).order('tournament_id').range(a, b)),
    allRows<AdminInvitation>((a, b) => client.from('tournament_admin_invitations').select(invitationColumns, { count: 'exact' }).eq('invitee_id', userId).eq('status', 'pending').order('created_at').order('id').range(a, b)),
  ])
  return { tournaments: managedTournaments(rows, memberships, userId), invitations }
}

export async function loadTournamentAccess(client: SupabaseClient, tournament: ManagedTournament): Promise<TournamentAccess> {
  const [bracket, admins, invitations] = await Promise.all([
    client.from('tournament_brackets').select('revision').eq('tournament_id', tournament.id).single(),
    allRows<Membership>((a, b) => client.from('tournament_members').select('tournament_id,profile_id,role', { count: 'exact' }).eq('tournament_id', tournament.id).eq('role', 'admin').order('profile_id').range(a, b)),
    tournament.role === 'owner' ? allRows<AdminInvitation>((a, b) => client.from('tournament_admin_invitations').select(invitationColumns, { count: 'exact' }).eq('tournament_id', tournament.id).eq('status', 'pending').order('created_at').order('id').range(a, b)) : Promise.resolve([]),
  ])
  if (bracket.error) throw bracket.error
  return { revision: checkedRevision(bracket.data?.revision), admins, invitations }
}

async function rpc(client: SupabaseClient, name: string, args: Record<string, unknown>) {
  const result = await client.rpc(name, args)
  if (result.error) throw result.error
  return result.data
}

export async function createRemoteTournament(client: SupabaseClient, name: string) {
  if (!name.trim() || [...name.trim()].length > 200) throw new Error('Invalid name')
  // Owner is NEVER sent: PostgreSQL assigns it from auth.uid().
  return rpc(client, 'ss_create_tournament', { p_name: name.trim() })
}

export async function inviteAdministrator(client: SupabaseClient, tournamentId: string, revision: number, inviteeId: string) {
  if (!validAccountId(inviteeId)) throw new Error('Invalid UUID')
  return rpc(client, 'ss_invite_admin', { p_tournament: tournamentId, p_expected: checkedRevision(revision), p_invitee: inviteeId.trim().toLowerCase() })
}

export async function revokeAdministrator(client: SupabaseClient, tournamentId: string, revision: number, profileId: string) {
  if (!validAccountId(profileId)) throw new Error('Invalid UUID')
  return rpc(client, 'ss_revoke_admin', { p_tournament: tournamentId, p_expected: checkedRevision(revision), p_profile: profileId })
}

export async function acceptAdminInvitation(client: SupabaseClient, invitationId: string) {
  const revision = checkedRevision(await rpc(client, 'ss_invitation_revision', { p_invitation: invitationId }))
  // One attempt only. A race between these calls must be surfaced, never auto-retried.
  return rpc(client, 'ss_accept_admin_invitation', { p_invitation: invitationId, p_expected: revision })
}
