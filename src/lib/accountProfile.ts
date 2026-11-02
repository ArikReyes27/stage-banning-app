import type { SupabaseClient } from '@supabase/supabase-js'
import { nicknameError } from './authConfig.ts'

export async function saveOwnNickname(client: SupabaseClient, userId: string, nickname: string) {
  if (nicknameError(nickname)) throw new Error('Invalid nickname')
  const display_name = nickname.trim()
  const update = () => client.from('profiles').update({ display_name }).eq('id', userId).select('id').maybeSingle()
  const first = await update()
  if (first.error) throw first.error
  if (first.data) return
  const created = await client.from('profiles').insert({ id: userId, display_name })
  if (!created.error) return
  if (created.error.code !== '23505') throw created.error
  // Another tab may have created this same profile; never update its id/created_at.
  const retry = await update()
  if (retry.error || !retry.data) throw retry.error ?? new Error('Profile unavailable')
}
