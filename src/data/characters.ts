import { characterAssets } from './characterAssets.ts'

// Keep these IDs stable: saved tournaments reference them.
const roster = [
  ['mario', 'Mario'], ['donkey-kong', 'Donkey Kong'], ['link', 'Link'],
  ['samus', 'Samus'], ['dark-samus', 'Dark Samus'], ['yoshi', 'Yoshi'],
  ['kirby', 'Kirby'], ['fox', 'Fox'], ['pikachu', 'Pikachu'], ['luigi', 'Luigi'],
  ['ness', 'Ness'], ['captain-falcon', 'Captain Falcon'], ['jigglypuff', 'Jigglypuff'],
  ['peach', 'Peach'], ['daisy', 'Daisy'], ['bowser', 'Bowser'],
  ['ice-climbers', 'Ice Climbers'], ['sheik', 'Sheik'], ['zelda', 'Zelda'],
  ['dr-mario', 'Dr. Mario'], ['pichu', 'Pichu'], ['falco', 'Falco'],
  ['marth', 'Marth'], ['lucina', 'Lucina'], ['young-link', 'Young Link'],
  ['ganondorf', 'Ganondorf'], ['mewtwo', 'Mewtwo'], ['roy', 'Roy'], ['chrom', 'Chrom'],
  ['mr-game-and-watch', 'Mr. Game & Watch'], ['meta-knight', 'Meta Knight'],
  ['pit', 'Pit'], ['dark-pit', 'Dark Pit'], ['zero-suit-samus', 'Zero Suit Samus'],
  ['wario', 'Wario'], ['snake', 'Snake'], ['ike', 'Ike'],
  ['pokemon-trainer', 'Pokémon Trainer'], ['diddy-kong', 'Diddy Kong'],
  ['lucas', 'Lucas'], ['sonic', 'Sonic'], ['king-dedede', 'King Dedede'],
  ['olimar', 'Olimar'], ['lucario', 'Lucario'], ['rob', 'R.O.B.'],
  ['toon-link', 'Toon Link'], ['wolf', 'Wolf'], ['villager', 'Villager'],
  ['mega-man', 'Mega Man'], ['wii-fit-trainer', 'Wii Fit Trainer'],
  ['rosalina-and-luma', 'Rosalina & Luma'], ['little-mac', 'Little Mac'],
  ['greninja', 'Greninja'], ['mii-brawler', 'Mii Brawler'],
  ['mii-swordfighter', 'Mii Swordfighter'], ['mii-gunner', 'Mii Gunner'],
  ['palutena', 'Palutena'], ['pac-man', 'PAC-MAN'], ['robin', 'Robin'],
  ['shulk', 'Shulk'], ['bowser-jr', 'Bowser Jr.'], ['duck-hunt', 'Duck Hunt'],
  ['ryu', 'Ryu'], ['ken', 'Ken'], ['cloud', 'Cloud'], ['corrin', 'Corrin'],
  ['bayonetta', 'Bayonetta'], ['inkling', 'Inkling'], ['ridley', 'Ridley'],
  ['simon', 'Simon'], ['richter', 'Richter'], ['king-k-rool', 'King K. Rool'],
  ['isabelle', 'Isabelle'], ['incineroar', 'Incineroar'], ['piranha-plant', 'Piranha Plant'],
  ['joker', 'Joker'], ['hero', 'Hero'], ['banjo-and-kazooie', 'Banjo & Kazooie'],
  ['terry', 'Terry'], ['byleth', 'Byleth'], ['min-min', 'Min Min'], ['steve', 'Steve'],
  ['sephiroth', 'Sephiroth'], ['pyra-mythra', 'Pyra / Mythra'], ['kazuya', 'Kazuya'], ['sora', 'Sora'],
] as const

export const characters = roster.map(([id, name]) => ({
  id, name, icon: characterAssets[id].icon,
})).sort((a, b) => a.name.localeCompare(b.name))

export const getCharacter = (id: string) => characters.find((character) => character.id === id)
