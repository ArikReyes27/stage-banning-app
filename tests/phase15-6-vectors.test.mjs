import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { buildVectors, started, playAll } from './helpers/phase15-6-vectors.mjs'
import { generateStructure, bracketSize } from '../src/utils/bracketStructure.ts'
import { resolveBracket } from '../src/utils/doubleElimination.ts'

const FIXTURE = new URL('./fixtures/phase15-6-vectors.json', import.meta.url)
const vectors = buildVectors()

test('golden vectors match the committed fixture (UPDATE_VECTORS=1 regenerates after an intentional engine change)', () => {
  if (process.env.UPDATE_VECTORS === '1') writeFileSync(FIXTURE, JSON.stringify(vectors, null, 1) + '\n')
  assert.deepEqual(JSON.parse(JSON.stringify(vectors)), JSON.parse(readFileSync(FIXTURE, 'utf8')))
})
test('vector generation is deterministic', () => assert.deepEqual(buildVectors(), vectors))

test('structure invariants for every size', () => {
  for (const n of [2, 3, 4, 5, 8, 9, 17, 33, 100, 128]) {
    const s = generateStructure(n), size = bracketSize(n), ids = new Set(), seeds = []
    assert.equal(s.length, 2 * size - 1, `match count n=${n}`)
    for (const m of s) {
      assert.ok(!ids.has(m.id), `unique ${m.id}`)
      for (const src of m.sources) 'seed' in src ? seeds.push(src.seed) : assert.ok(ids.has(src.match), `${m.id} depends on earlier ${src.match}`)
      ids.add(m.id)
    }
    assert.deepEqual(seeds.sort((a, b) => a - b), Array.from({ length: size }, (_, i) => i), 'each seed slot used once')
    assert.deepEqual(s.slice(-2).map(m => m.id), ['GF', 'RESET'])
  }
})
test('BYEs: size-n empty slots, never two empty players in one first-round match, lone player advances', () => {
  for (const n of [3, 5, 6, 7, 9, 17, 33]) {
    const t = started(n), size = bracketSize(n)
    assert.equal(t.seeds.length, size)
    assert.equal(t.seeds.filter(s => s === '').length, size - n)
    for (const m of resolveBracket(t).filter(x => x.sources.every(s => 'seed' in s))) {
      assert.ok(m.players.some(Boolean), `${m.id} has a player`)
      if (!m.players.every(Boolean)) assert.ok(m.automatic && m.settled && m.winnerId, `${m.id} bye advances`)
    }
  }
})
test('full plays crown a champion, play only real matches and keep completionOrder consistent', () => {
  for (const n of [2, 3, 4, 5, 8, 9, 16, 17]) {
    const t = started(n), fav = playAll(t, () => 0), up = playAll(t, m => m.id === 'GF' ? 1 : 0)
    assert.ok(fav.champion && up.champion)
    assert.ok(!fav.played.includes('RESET') && up.played.includes('RESET'))
    assert.deepEqual(fav.tournament.completionOrder, fav.played)
    assert.equal(new Set(up.played).size, up.played.length)
  }
})
test('the vectors record the current correction rules', () => {
  const c = vectors.corrections
  assert.equal(c.notStarted.ok, false); assert.equal(c.resetBeforeGrandFinal.ok, false); assert.equal(c.undefinedPlayers.ok, false)
  assert.deepEqual(c.sameWinnerOtherScore.invalidated, [])
  assert.ok(c.flipWinnerInvalidates.invalidated.length > 0)
  assert.equal(c.dqOverwriteRejected.ok, false); assert.equal(c.dqRevertAllowed.ok, true)
  assert.equal(c.detailsDroppedRejected.ok, false)
})
