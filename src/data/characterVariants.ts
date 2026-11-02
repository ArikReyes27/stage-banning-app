import { characterAssets } from './characterAssets.ts'
// Only verified, deployed pairs are exposed. Other source metadata is not a URL.
export const availableVariants = (id: string) => characterAssets[id]?.variants.filter(v => v.availableLocally).map(v => v.id) ?? ['00']
export function variantAsset(id: string, variant = '00', type: 'icon' | 'render' = 'render') {
  const base = characterAssets[id]?.[type]
  return base && availableVariants(id).includes(variant) ? base.replace('/00.png', '/' + variant + '.png') : base
}
