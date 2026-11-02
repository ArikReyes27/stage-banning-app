import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveAuthTestConfig, nicknameError, authErrorMessage } from '../src/lib/authConfig.ts'
import { saveOwnNickname } from '../src/lib/accountProfile.ts'

const ref = 'abcdefghijklmnopqrst'
const env = { MODE: 'auth-tests', DEV: true, VITE_AUTH_TEST_URL: `https://${ref}.supabase.co`, VITE_AUTH_TEST_PUBLISHABLE_KEY: 'sb_publishable_fixture' }
test('Auth test isolation fails closed for default/prod modes, missing pin and foreign endpoints', () => {
  assert.equal(resolveAuthTestConfig(env, ref).url, env.VITE_AUTH_TEST_URL)
  for (const overrides of [
    { MODE: 'development' }, { MODE: 'production' }, { DEV: false },
    { VITE_AUTH_TEST_URL: 'https://differentprojectabcd.supabase.co' },
    { VITE_AUTH_TEST_URL: `${env.VITE_AUTH_TEST_URL}.attacker.example` },
    { VITE_AUTH_TEST_URL: `${env.VITE_AUTH_TEST_URL}/auth/v1` },
    { VITE_AUTH_TEST_URL: `${env.VITE_AUTH_TEST_URL}?project=tests` },
    { VITE_AUTH_TEST_URL: `https://user:pass@${ref}.supabase.co` },
    { VITE_AUTH_TEST_URL: env.VITE_AUTH_TEST_URL.replace('https:', 'http:') },
    { VITE_AUTH_TEST_PUBLISHABLE_KEY: 'sb_secret_fixture' },
  ]) assert.equal(resolveAuthTestConfig({ ...env, ...overrides }, ref), null)
  assert.equal(resolveAuthTestConfig(env, 'UNCONFIGURED_TEST_PROJECT'), null)
  assert.equal(resolveAuthTestConfig({ MODE: 'auth-tests', DEV: true, VITE_SUPABASE_URL: env.VITE_AUTH_TEST_URL, VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_AUTH_TEST_PUBLISHABLE_KEY }, ref), null)
})
test('nickname validation and error presentation do not echo raw server details', () => {
  assert.equal(nicknameError('  Árik 🦊  '), null)
  for (const bad of ['', '   ', 'x'.repeat(33), 'abc\u0000def']) assert.ok(nicknameError(bad))
  assert.equal(nicknameError('🦊'.repeat(32)), null)
  const raw = 'sensitive token or URL must never be rendered'
  assert.ok(!authErrorMessage({ message: raw }).includes(raw))
  assert.match(authErrorMessage({ code: 'invalid_credentials' }), /incorrectos/)
  assert.match(authErrorMessage({ code: 'email_not_confirmed' }), /Confirma/)
})
function profileClient(updates, insertResult = { error: null }) {
  const calls = []
  return { calls, from(table) {
    assert.equal(table, 'profiles')
    return {
      update(value) { calls.push(['update', value]); return { eq(column, id) { calls.push(['where', column, id]); return { select(columns) { assert.equal(columns,'id'); return { maybeSingle: async () => updates.shift() } } } } } },
      async insert(value) { calls.push(['insert', value]); return insertResult },
    }
  } }
}
test('profile save never changes identity/creation time or tournament data', async () => {
  const c = profileClient([{ data: { id: 'self' }, error: null }])
  await saveOwnNickname(c, 'self', '  Alias  ')
  assert.deepEqual(c.calls, [['update', { display_name: 'Alias' }], ['where','id','self']])
})
test('profile creation and simultaneous creation retry stay scoped to the same user', async () => {
  const c = profileClient([{ data:null,error:null },{ data:{id:'self'},error:null }], {error:{code:'23505'}})
  await saveOwnNickname(c,'self','Alias')
  assert.deepEqual(c.calls.filter(c=>c[0]==='where'), [['where','id','self'],['where','id','self']])
  assert.deepEqual(c.calls.find(c=>c[0]==='insert'),['insert',{id:'self',display_name:'Alias'}])
})
test('profile permissions/network failures propagate and invalid nicknames make no requests', async () => {
  const c=profileClient([{data:null,error:{code:'42501'}}])
  await assert.rejects(saveOwnNickname(c,'self','Alias'))
  assert.equal(c.calls.length,2)
  const untouched=profileClient([])
  await assert.rejects(saveOwnNickname(untouched,'self',''))
  assert.equal(untouched.calls.length,0)
})
