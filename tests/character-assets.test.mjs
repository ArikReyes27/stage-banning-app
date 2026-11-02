import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { characters } from '../src/data/characters.ts'
import { availableVariants } from '../src/data/characterVariants.ts'
import { characterAssets } from '../src/data/characterAssets.ts'

test('every saved roster ID has its original base pair and only verified deployed variants', () => {
  assert.equal(characters.length, 86)
  assert.deepEqual(Object.keys(characterAssets).sort(), characters.map(c => c.id).sort())
  const inventory = JSON.parse(readFileSync(new URL('../docs/phase7-assets-inventory.json', import.meta.url)))
  assert.equal(inventory.files.length, 172)
  for (const character of characters) {
    const assets = characterAssets[character.id]
    assert.equal(character.icon, assets.icon)
    assert.equal(assets.fullBodyRender, null)
    assert.deepEqual(assets.variants.filter(v => v.availableLocally).map(v => v.id), availableVariants(character.id))
    for (const [type, url] of [['icon', assets.icon], ['render', assets.render]]) {
      const file = new URL(`../public${url}`, import.meta.url)
      const bytes = readFileSync(file)
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
      const record = inventory.files.find(f => f.characterId === character.id && f.type === type)
      assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256)
      assert.equal(bytes.readUInt32BE(16), record.width)
      assert.equal(bytes.readUInt32BE(20), record.height)
      assert.deepEqual(readdirSync(new URL('.', file)), availableVariants(character.id).map(id => id + '.png'))
    }
  }
  assert.equal(characterAssets['piranha-plant'].sourceFolder, 'pirahnaplant')
  assert.equal(characterAssets['mii-gunner'].variants.length, 4)
  assert.equal(characterAssets['mii-brawler'].variants.length, 1)
})
