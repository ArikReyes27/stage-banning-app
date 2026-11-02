import test from 'node:test'
import assert from 'node:assert/strict'
import { parseScreenTarget, readScreenTarget, writeScreenTarget, screenKey } from '../src/lib/publicScreen.ts'

const store = (entries = {}) => { const m = new Map(Object.entries(entries)); return { m, getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) } }

test('targets round-trip and anything invalid falls back to the public bracket', () => {
  const key = screenKey(null), s = store()
  assert.deepEqual(readScreenTarget(s, key), { view: 'bracket' })
  for (const t of [{ view: 'match', matchId: 'W1' }, { view: 'match', matchId: 'RESET' }, { view: 'standings' }, { view: 'bracket' }]) {
    writeScreenTarget(s, key, t); assert.deepEqual(readScreenTarget(s, key), t)
  }
  for (const bad of ['{x', 'null', '[]', '{"view":"admin"}', '{"view":"match"}', '{"view":"match","matchId":"../x"}', '{"view":"match","matchId":7}', null])
    assert.deepEqual(parseScreenTarget(bad), { view: 'bracket' })
})
test('the channel carries only a view name and match id, never tournament data', () => {
  const s = store({ 'stage-strike.top8.v1': 'TOURNAMENT', other: 'x' }), key = screenKey(null)
  writeScreenTarget(s, key, { view: 'match', matchId: 'L3', results: { W1: 1 }, secret: 'x' })
  assert.deepEqual(JSON.parse(s.m.get(key)), { view: 'match', matchId: 'L3' })
  assert.equal(s.m.get('stage-strike.top8.v1'), 'TOURNAMENT'); assert.equal(s.m.get('other'), 'x'); assert.equal(s.m.size, 3)
})
test('each tournament space has its own channel', () => {
  const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222', s = store()
  assert.notEqual(screenKey(a), screenKey(b)); assert.notEqual(screenKey(a), screenKey(null))
  assert.equal(screenKey('bad id!'), screenKey(null))
  writeScreenTarget(s, screenKey(a), { view: 'standings' })
  assert.deepEqual(readScreenTarget(s, screenKey(b)), { view: 'bracket' })
  assert.deepEqual(readScreenTarget(s, screenKey(null)), { view: 'bracket' })
})
