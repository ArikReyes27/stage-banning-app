import test from 'node:test'
import assert from 'node:assert/strict'
import { loadRemoteStatus, classifyReadFailure, readFailureMessage, localSummary } from '../src/lib/remoteStatus.ts'
import { workspaceKey, emptyWorkspace } from '../src/lib/tournamentWorkspace.ts'
import { started, attempt, win } from './helpers/phase15-6-vectors.mjs'
import { exportTournament } from '../src/utils/tournamentValidation.ts'

const PROJECT = 'abcdefghijklmnopqrst'
const USER = '11111111-1111-4111-8111-111111111111'
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
const players = n => Array.from({ length: n }, (_, i) => ({ id: 'p' + i, nickname: 'Player ' + i }))
const remoteEmpty = id => ({ id, name: 'R', revision: '4', import_id: null, roster: [], state: { schemaVersion: 2, status: 'draft', seeds: [], results: {}, structure: [], completionOrder: [] } })
const remoteWith = (id, results = {}) => ({ id, name: 'R', revision: '9', import_id: 'x', roster: [{ id: 'p0', nickname: 'Player 0', character_ids: [], roster_order: 0, in_bracket: true, profile_id: null }],
  state: { schemaVersion: 2, status: 'started', seeds: ['p0'], results, structure: [], completionOrder: [] } })
const store = (entries = {}) => { const m = new Map(Object.entries(entries)); return { getItem: k => m.get(k) ?? null, map: m } }
const localStarted = () => JSON.stringify({ ...emptyWorkspace(), tournament: exportTournament(attempt(started(4), 'W1', win('BO3', 0)).tournament) })
const client = (handler) => { const calls = []; return { calls, rpc: async (name, args) => { calls.push({ name, args }); return handler(name, args) } } }

test('authorized read uses only the existing snapshot RPC for the requested UUID and never writes', async () => {
  const c = client((_n, a) => ({ data: remoteEmpty(a.p_tournament), error: null }))
  const s = store({ [workspaceKey(PROJECT, USER, A)]: localStarted() })
  const before = JSON.stringify([...s.map])
  const r = await loadRemoteStatus(c, s, PROJECT, USER, A)
  assert.equal(r.ok, true)
  assert.deepEqual(c.calls, [{ name: 'ss_read_tournament_snapshot', args: { p_tournament: A } }])
  assert.equal(r.remote.revision, '4'); assert.equal(r.remote.empty, true)
  assert.equal(JSON.stringify([...s.map]), before, 'storage untouched')
  assert.equal(r.snapshot.id, A)
})

test('local-only results are flagged; remote results are reported without comparing or merging', async () => {
  const s = store({ [workspaceKey(PROJECT, USER, A)]: localStarted() })
  const only = await loadRemoteStatus(client(() => ({ data: remoteEmpty(A), error: null })), s, PROJECT, USER, A)
  assert.equal(only.local.results, 1); assert.equal(only.local.confirmed, 1)
  assert.equal(only.comparison.localOnlyResults, true)
  assert.ok(only.comparison.lines.some(l => l.includes('únicamente en este dispositivo')))
  const both = await loadRemoteStatus(client(() => ({ data: remoteWith(A, { W1: {} }), error: null })), s, PROJECT, USER, A)
  assert.equal(both.comparison.localOnlyResults, false)
  assert.ok(both.comparison.lines.some(l => l.includes('no los compara')))
  const none = await loadRemoteStatus(client(() => ({ data: remoteEmpty(A), error: null })), store(), PROJECT, USER, A)
  assert.equal(none.local.stage, 'none'); assert.equal(none.comparison.localOnlyResults, false)
})

test('isolation: each tournament reads only its own UUID and workspace key', async () => {
  const s = store({ [workspaceKey(PROJECT, USER, A)]: localStarted() })
  const c = client((_n, a) => ({ data: remoteEmpty(a.p_tournament), error: null }))
  const ra = await loadRemoteStatus(c, s, PROJECT, USER, A), rb = await loadRemoteStatus(c, s, PROJECT, USER, B)
  assert.equal(ra.local.results, 1); assert.equal(rb.local.stage, 'none'); assert.equal(rb.local.results, 0)
  assert.deepEqual(c.calls.map(x => x.args.p_tournament), [A, B])
  // A response for another tournament is discarded and its data is never used.
  const wrong = await loadRemoteStatus(client(() => ({ data: remoteWith(B, { W1: {} }), error: null })), s, PROJECT, USER, A)
  assert.equal(wrong.ok, false); assert.equal(wrong.failure, 'invalid'); assert.equal(wrong.local.results, 1)
  // Another account never sees this account's workspace.
  const other = await loadRemoteStatus(c, s, PROJECT, '22222222-2222-4222-8222-222222222222', A)
  assert.equal(other.local.stage, 'none')
})

test('network, permission, session and missing-RPC failures keep local data untouched and are classified', async () => {
  const s = store({ [workspaceKey(PROJECT, USER, A)]: localStarted() })
  const snapshot = JSON.stringify([...s.map])
  const cases = [
    ['offline', () => { throw new TypeError('Failed to fetch') }],
    ['offline', () => ({ data: null, error: { message: 'TypeError: Failed to fetch' } })],
    ['forbidden', () => ({ data: null, error: { code: '42501', message: 'x' } })],
    ['unauthenticated', () => ({ data: null, error: { code: 'PGRST301', message: 'JWT expired' } })],
    ['unavailable', () => ({ data: null, error: { code: 'PGRST202', message: 'x' } })],
    ['invalid', () => ({ data: { id: A, roster: 'bad', state: {} }, error: null })],
    ['unknown', () => ({ data: null, error: { code: 'XX000', message: 'boom' } })],
  ]
  for (const [expected, handler] of cases) {
    const r = await loadRemoteStatus(client(handler), s, PROJECT, USER, A)
    assert.equal(r.ok, false); assert.equal(r.failure, expected, expected)
    assert.equal(r.local.results, 1, 'local summary still available')
    if (expected !== 'unknown') assert.ok(readFailureMessage(expected).includes('local'))
  }
  assert.equal(JSON.stringify([...s.map]), snapshot)
  const c = client(() => ({ data: remoteEmpty(A), error: null }))
  const off = await loadRemoteStatus(c, s, PROJECT, USER, A, false)
  assert.equal(off.failure, 'offline'); assert.equal(c.calls.length, 0, 'no request while offline')
})

test('unreadable local space and invalid ids never throw or get overwritten', async () => {
  const key = workspaceKey(PROJECT, USER, A), s = store({ [key]: '{broken' })
  assert.equal(localSummary(s, key).stage, 'unreadable')
  const r = await loadRemoteStatus(client(() => ({ data: remoteEmpty(A), error: null })), s, PROJECT, USER, A)
  assert.equal(r.ok, true); assert.equal(r.local.stage, 'unreadable'); assert.equal(s.map.get(key), '{broken')
  const bad = await loadRemoteStatus(client(() => ({ data: null, error: { code: '42501' } })), s, PROJECT, USER, 'not-a-uuid')
  assert.equal(bad.local.stage, 'unreadable')
  assert.equal(classifyReadFailure(new Error('x'), true), 'unknown')
})
