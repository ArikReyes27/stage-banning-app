// Base assets and verified Sonic alternates. Only availableLocally variants are deployed.
export interface CharacterAssets {
  characterId: string
  sourceFolder: string
  defaultVariantId: string
  icon: string
  render: string
  fullBodyRender: null
  renderFraming: 'unverified-or-cropped'
  variants: { id: string; sourceIndex: number; availableLocally: boolean; sourceIcon: string; sourceRender: string }[]
  sourceForms?: string[]
}

export const characterAssets: Record<string, CharacterAssets> = {
  "mario": {
    "characterId": "mario",
    "sourceFolder": "mario",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/mario/00.png",
    "render": "/images/characters/renders/mario/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "mario/icon0.png",
        "sourceRender": "mario/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "mario/icon1.png",
        "sourceRender": "mario/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "mario/icon2.png",
        "sourceRender": "mario/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "mario/icon3.png",
        "sourceRender": "mario/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "mario/icon4.png",
        "sourceRender": "mario/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "mario/icon5.png",
        "sourceRender": "mario/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "mario/icon6.png",
        "sourceRender": "mario/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "mario/icon7.png",
        "sourceRender": "mario/render7.png"
      }
    ]
  },
  "donkey-kong": {
    "characterId": "donkey-kong",
    "sourceFolder": "donkeykong",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/donkey-kong/00.png",
    "render": "/images/characters/renders/donkey-kong/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "donkeykong/icon0.png",
        "sourceRender": "donkeykong/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "donkeykong/icon1.png",
        "sourceRender": "donkeykong/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "donkeykong/icon2.png",
        "sourceRender": "donkeykong/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "donkeykong/icon3.png",
        "sourceRender": "donkeykong/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "donkeykong/icon4.png",
        "sourceRender": "donkeykong/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "donkeykong/icon5.png",
        "sourceRender": "donkeykong/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "donkeykong/icon6.png",
        "sourceRender": "donkeykong/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "donkeykong/icon7.png",
        "sourceRender": "donkeykong/render7.png"
      }
    ]
  },
  "link": {
    "characterId": "link",
    "sourceFolder": "link",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/link/00.png",
    "render": "/images/characters/renders/link/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "link/icon0.png",
        "sourceRender": "link/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "link/icon1.png",
        "sourceRender": "link/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "link/icon2.png",
        "sourceRender": "link/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "link/icon3.png",
        "sourceRender": "link/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "link/icon4.png",
        "sourceRender": "link/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "link/icon5.png",
        "sourceRender": "link/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "link/icon6.png",
        "sourceRender": "link/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "link/icon7.png",
        "sourceRender": "link/render7.png"
      }
    ]
  },
  "samus": {
    "characterId": "samus",
    "sourceFolder": "samus",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/samus/00.png",
    "render": "/images/characters/renders/samus/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "samus/icon0.png",
        "sourceRender": "samus/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "samus/icon1.png",
        "sourceRender": "samus/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "samus/icon2.png",
        "sourceRender": "samus/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "samus/icon3.png",
        "sourceRender": "samus/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "samus/icon4.png",
        "sourceRender": "samus/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "samus/icon5.png",
        "sourceRender": "samus/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "samus/icon6.png",
        "sourceRender": "samus/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "samus/icon7.png",
        "sourceRender": "samus/render7.png"
      }
    ]
  },
  "dark-samus": {
    "characterId": "dark-samus",
    "sourceFolder": "darksamus",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/dark-samus/00.png",
    "render": "/images/characters/renders/dark-samus/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "darksamus/icon0.png",
        "sourceRender": "darksamus/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "darksamus/icon1.png",
        "sourceRender": "darksamus/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "darksamus/icon2.png",
        "sourceRender": "darksamus/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "darksamus/icon3.png",
        "sourceRender": "darksamus/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "darksamus/icon4.png",
        "sourceRender": "darksamus/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "darksamus/icon5.png",
        "sourceRender": "darksamus/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "darksamus/icon6.png",
        "sourceRender": "darksamus/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "darksamus/icon7.png",
        "sourceRender": "darksamus/render7.png"
      }
    ]
  },
  "yoshi": {
    "characterId": "yoshi",
    "sourceFolder": "yoshi",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/yoshi/00.png",
    "render": "/images/characters/renders/yoshi/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "yoshi/icon0.png",
        "sourceRender": "yoshi/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "yoshi/icon1.png",
        "sourceRender": "yoshi/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "yoshi/icon2.png",
        "sourceRender": "yoshi/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "yoshi/icon3.png",
        "sourceRender": "yoshi/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "yoshi/icon4.png",
        "sourceRender": "yoshi/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "yoshi/icon5.png",
        "sourceRender": "yoshi/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "yoshi/icon6.png",
        "sourceRender": "yoshi/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "yoshi/icon7.png",
        "sourceRender": "yoshi/render7.png"
      }
    ]
  },
  "kirby": {
    "characterId": "kirby",
    "sourceFolder": "kirby",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/kirby/00.png",
    "render": "/images/characters/renders/kirby/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "kirby/icon0.png",
        "sourceRender": "kirby/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "kirby/icon1.png",
        "sourceRender": "kirby/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "kirby/icon2.png",
        "sourceRender": "kirby/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "kirby/icon3.png",
        "sourceRender": "kirby/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "kirby/icon4.png",
        "sourceRender": "kirby/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "kirby/icon5.png",
        "sourceRender": "kirby/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "kirby/icon6.png",
        "sourceRender": "kirby/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "kirby/icon7.png",
        "sourceRender": "kirby/render7.png"
      }
    ]
  },
  "fox": {
    "characterId": "fox",
    "sourceFolder": "fox",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/fox/00.png",
    "render": "/images/characters/renders/fox/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "fox/icon0.png",
        "sourceRender": "fox/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "fox/icon1.png",
        "sourceRender": "fox/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "fox/icon2.png",
        "sourceRender": "fox/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "fox/icon3.png",
        "sourceRender": "fox/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "fox/icon4.png",
        "sourceRender": "fox/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "fox/icon5.png",
        "sourceRender": "fox/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "fox/icon6.png",
        "sourceRender": "fox/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "fox/icon7.png",
        "sourceRender": "fox/render7.png"
      }
    ]
  },
  "pikachu": {
    "characterId": "pikachu",
    "sourceFolder": "pikachu",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/pikachu/00.png",
    "render": "/images/characters/renders/pikachu/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "pikachu/icon0.png",
        "sourceRender": "pikachu/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "pikachu/icon1.png",
        "sourceRender": "pikachu/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "pikachu/icon2.png",
        "sourceRender": "pikachu/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "pikachu/icon3.png",
        "sourceRender": "pikachu/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "pikachu/icon4.png",
        "sourceRender": "pikachu/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "pikachu/icon5.png",
        "sourceRender": "pikachu/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "pikachu/icon6.png",
        "sourceRender": "pikachu/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "pikachu/icon7.png",
        "sourceRender": "pikachu/render7.png"
      }
    ]
  },
  "luigi": {
    "characterId": "luigi",
    "sourceFolder": "luigi",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/luigi/00.png",
    "render": "/images/characters/renders/luigi/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "luigi/icon0.png",
        "sourceRender": "luigi/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "luigi/icon1.png",
        "sourceRender": "luigi/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "luigi/icon2.png",
        "sourceRender": "luigi/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "luigi/icon3.png",
        "sourceRender": "luigi/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "luigi/icon4.png",
        "sourceRender": "luigi/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "luigi/icon5.png",
        "sourceRender": "luigi/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "luigi/icon6.png",
        "sourceRender": "luigi/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "luigi/icon7.png",
        "sourceRender": "luigi/render7.png"
      }
    ]
  },
  "ness": {
    "characterId": "ness",
    "sourceFolder": "ness",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/ness/00.png",
    "render": "/images/characters/renders/ness/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "ness/icon0.png",
        "sourceRender": "ness/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "ness/icon1.png",
        "sourceRender": "ness/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "ness/icon2.png",
        "sourceRender": "ness/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "ness/icon3.png",
        "sourceRender": "ness/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "ness/icon4.png",
        "sourceRender": "ness/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "ness/icon5.png",
        "sourceRender": "ness/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "ness/icon6.png",
        "sourceRender": "ness/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "ness/icon7.png",
        "sourceRender": "ness/render7.png"
      }
    ]
  },
  "captain-falcon": {
    "characterId": "captain-falcon",
    "sourceFolder": "captainfalcon",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/captain-falcon/00.png",
    "render": "/images/characters/renders/captain-falcon/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "captainfalcon/icon0.png",
        "sourceRender": "captainfalcon/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "captainfalcon/icon1.png",
        "sourceRender": "captainfalcon/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "captainfalcon/icon2.png",
        "sourceRender": "captainfalcon/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "captainfalcon/icon3.png",
        "sourceRender": "captainfalcon/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "captainfalcon/icon4.png",
        "sourceRender": "captainfalcon/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "captainfalcon/icon5.png",
        "sourceRender": "captainfalcon/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "captainfalcon/icon6.png",
        "sourceRender": "captainfalcon/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "captainfalcon/icon7.png",
        "sourceRender": "captainfalcon/render7.png"
      }
    ]
  },
  "jigglypuff": {
    "characterId": "jigglypuff",
    "sourceFolder": "jigglypuff",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/jigglypuff/00.png",
    "render": "/images/characters/renders/jigglypuff/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "jigglypuff/icon0.png",
        "sourceRender": "jigglypuff/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "jigglypuff/icon1.png",
        "sourceRender": "jigglypuff/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "jigglypuff/icon2.png",
        "sourceRender": "jigglypuff/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "jigglypuff/icon3.png",
        "sourceRender": "jigglypuff/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "jigglypuff/icon4.png",
        "sourceRender": "jigglypuff/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "jigglypuff/icon5.png",
        "sourceRender": "jigglypuff/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "jigglypuff/icon6.png",
        "sourceRender": "jigglypuff/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "jigglypuff/icon7.png",
        "sourceRender": "jigglypuff/render7.png"
      }
    ]
  },
  "peach": {
    "characterId": "peach",
    "sourceFolder": "peach",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/peach/00.png",
    "render": "/images/characters/renders/peach/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "peach/icon0.png",
        "sourceRender": "peach/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "peach/icon1.png",
        "sourceRender": "peach/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "peach/icon2.png",
        "sourceRender": "peach/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "peach/icon3.png",
        "sourceRender": "peach/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "peach/icon4.png",
        "sourceRender": "peach/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "peach/icon5.png",
        "sourceRender": "peach/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "peach/icon6.png",
        "sourceRender": "peach/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "peach/icon7.png",
        "sourceRender": "peach/render7.png"
      }
    ]
  },
  "daisy": {
    "characterId": "daisy",
    "sourceFolder": "daisy",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/daisy/00.png",
    "render": "/images/characters/renders/daisy/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "daisy/icon0.png",
        "sourceRender": "daisy/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "daisy/icon1.png",
        "sourceRender": "daisy/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "daisy/icon2.png",
        "sourceRender": "daisy/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "daisy/icon3.png",
        "sourceRender": "daisy/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "daisy/icon4.png",
        "sourceRender": "daisy/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "daisy/icon5.png",
        "sourceRender": "daisy/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "daisy/icon6.png",
        "sourceRender": "daisy/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "daisy/icon7.png",
        "sourceRender": "daisy/render7.png"
      }
    ]
  },
  "bowser": {
    "characterId": "bowser",
    "sourceFolder": "bowser",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/bowser/00.png",
    "render": "/images/characters/renders/bowser/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "bowser/icon0.png",
        "sourceRender": "bowser/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "bowser/icon1.png",
        "sourceRender": "bowser/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "bowser/icon2.png",
        "sourceRender": "bowser/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "bowser/icon3.png",
        "sourceRender": "bowser/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "bowser/icon4.png",
        "sourceRender": "bowser/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "bowser/icon5.png",
        "sourceRender": "bowser/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "bowser/icon6.png",
        "sourceRender": "bowser/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "bowser/icon7.png",
        "sourceRender": "bowser/render7.png"
      }
    ]
  },
  "ice-climbers": {
    "characterId": "ice-climbers",
    "sourceFolder": "iceclimbers",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/ice-climbers/00.png",
    "render": "/images/characters/renders/ice-climbers/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "iceclimbers/icon0.png",
        "sourceRender": "iceclimbers/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "iceclimbers/icon1.png",
        "sourceRender": "iceclimbers/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "iceclimbers/icon2.png",
        "sourceRender": "iceclimbers/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "iceclimbers/icon3.png",
        "sourceRender": "iceclimbers/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "iceclimbers/icon4.png",
        "sourceRender": "iceclimbers/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "iceclimbers/icon5.png",
        "sourceRender": "iceclimbers/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "iceclimbers/icon6.png",
        "sourceRender": "iceclimbers/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "iceclimbers/icon7.png",
        "sourceRender": "iceclimbers/render7.png"
      }
    ]
  },
  "sheik": {
    "characterId": "sheik",
    "sourceFolder": "sheik",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/sheik/00.png",
    "render": "/images/characters/renders/sheik/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "sheik/icon0.png",
        "sourceRender": "sheik/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "sheik/icon1.png",
        "sourceRender": "sheik/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "sheik/icon2.png",
        "sourceRender": "sheik/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "sheik/icon3.png",
        "sourceRender": "sheik/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "sheik/icon4.png",
        "sourceRender": "sheik/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "sheik/icon5.png",
        "sourceRender": "sheik/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "sheik/icon6.png",
        "sourceRender": "sheik/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "sheik/icon7.png",
        "sourceRender": "sheik/render7.png"
      }
    ]
  },
  "zelda": {
    "characterId": "zelda",
    "sourceFolder": "zelda",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/zelda/00.png",
    "render": "/images/characters/renders/zelda/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "zelda/icon0.png",
        "sourceRender": "zelda/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "zelda/icon1.png",
        "sourceRender": "zelda/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "zelda/icon2.png",
        "sourceRender": "zelda/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "zelda/icon3.png",
        "sourceRender": "zelda/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "zelda/icon4.png",
        "sourceRender": "zelda/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "zelda/icon5.png",
        "sourceRender": "zelda/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "zelda/icon6.png",
        "sourceRender": "zelda/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "zelda/icon7.png",
        "sourceRender": "zelda/render7.png"
      }
    ]
  },
  "dr-mario": {
    "characterId": "dr-mario",
    "sourceFolder": "drmario",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/dr-mario/00.png",
    "render": "/images/characters/renders/dr-mario/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "drmario/icon0.png",
        "sourceRender": "drmario/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "drmario/icon1.png",
        "sourceRender": "drmario/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "drmario/icon2.png",
        "sourceRender": "drmario/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "drmario/icon3.png",
        "sourceRender": "drmario/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "drmario/icon4.png",
        "sourceRender": "drmario/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "drmario/icon5.png",
        "sourceRender": "drmario/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "drmario/icon6.png",
        "sourceRender": "drmario/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "drmario/icon7.png",
        "sourceRender": "drmario/render7.png"
      }
    ]
  },
  "pichu": {
    "characterId": "pichu",
    "sourceFolder": "pichu",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/pichu/00.png",
    "render": "/images/characters/renders/pichu/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "pichu/icon0.png",
        "sourceRender": "pichu/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "pichu/icon1.png",
        "sourceRender": "pichu/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "pichu/icon2.png",
        "sourceRender": "pichu/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "pichu/icon3.png",
        "sourceRender": "pichu/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "pichu/icon4.png",
        "sourceRender": "pichu/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "pichu/icon5.png",
        "sourceRender": "pichu/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "pichu/icon6.png",
        "sourceRender": "pichu/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "pichu/icon7.png",
        "sourceRender": "pichu/render7.png"
      }
    ]
  },
  "falco": {
    "characterId": "falco",
    "sourceFolder": "falco",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/falco/00.png",
    "render": "/images/characters/renders/falco/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "falco/icon0.png",
        "sourceRender": "falco/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "falco/icon1.png",
        "sourceRender": "falco/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "falco/icon2.png",
        "sourceRender": "falco/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "falco/icon3.png",
        "sourceRender": "falco/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "falco/icon4.png",
        "sourceRender": "falco/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "falco/icon5.png",
        "sourceRender": "falco/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "falco/icon6.png",
        "sourceRender": "falco/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "falco/icon7.png",
        "sourceRender": "falco/render7.png"
      }
    ]
  },
  "marth": {
    "characterId": "marth",
    "sourceFolder": "marth",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/marth/00.png",
    "render": "/images/characters/renders/marth/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "marth/icon0.png",
        "sourceRender": "marth/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "marth/icon1.png",
        "sourceRender": "marth/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "marth/icon2.png",
        "sourceRender": "marth/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "marth/icon3.png",
        "sourceRender": "marth/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "marth/icon4.png",
        "sourceRender": "marth/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "marth/icon5.png",
        "sourceRender": "marth/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "marth/icon6.png",
        "sourceRender": "marth/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "marth/icon7.png",
        "sourceRender": "marth/render7.png"
      }
    ]
  },
  "lucina": {
    "characterId": "lucina",
    "sourceFolder": "lucina",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/lucina/00.png",
    "render": "/images/characters/renders/lucina/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "lucina/icon0.png",
        "sourceRender": "lucina/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "lucina/icon1.png",
        "sourceRender": "lucina/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "lucina/icon2.png",
        "sourceRender": "lucina/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "lucina/icon3.png",
        "sourceRender": "lucina/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "lucina/icon4.png",
        "sourceRender": "lucina/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "lucina/icon5.png",
        "sourceRender": "lucina/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "lucina/icon6.png",
        "sourceRender": "lucina/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "lucina/icon7.png",
        "sourceRender": "lucina/render7.png"
      }
    ]
  },
  "young-link": {
    "characterId": "young-link",
    "sourceFolder": "younglink",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/young-link/00.png",
    "render": "/images/characters/renders/young-link/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "younglink/icon0.png",
        "sourceRender": "younglink/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "younglink/icon1.png",
        "sourceRender": "younglink/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "younglink/icon2.png",
        "sourceRender": "younglink/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "younglink/icon3.png",
        "sourceRender": "younglink/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "younglink/icon4.png",
        "sourceRender": "younglink/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "younglink/icon5.png",
        "sourceRender": "younglink/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "younglink/icon6.png",
        "sourceRender": "younglink/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "younglink/icon7.png",
        "sourceRender": "younglink/render7.png"
      }
    ]
  },
  "ganondorf": {
    "characterId": "ganondorf",
    "sourceFolder": "ganondorf",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/ganondorf/00.png",
    "render": "/images/characters/renders/ganondorf/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "ganondorf/icon0.png",
        "sourceRender": "ganondorf/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "ganondorf/icon1.png",
        "sourceRender": "ganondorf/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "ganondorf/icon2.png",
        "sourceRender": "ganondorf/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "ganondorf/icon3.png",
        "sourceRender": "ganondorf/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "ganondorf/icon4.png",
        "sourceRender": "ganondorf/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "ganondorf/icon5.png",
        "sourceRender": "ganondorf/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "ganondorf/icon6.png",
        "sourceRender": "ganondorf/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "ganondorf/icon7.png",
        "sourceRender": "ganondorf/render7.png"
      }
    ]
  },
  "mewtwo": {
    "characterId": "mewtwo",
    "sourceFolder": "mewtwo",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/mewtwo/00.png",
    "render": "/images/characters/renders/mewtwo/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "mewtwo/icon0.png",
        "sourceRender": "mewtwo/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "mewtwo/icon1.png",
        "sourceRender": "mewtwo/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "mewtwo/icon2.png",
        "sourceRender": "mewtwo/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "mewtwo/icon3.png",
        "sourceRender": "mewtwo/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "mewtwo/icon4.png",
        "sourceRender": "mewtwo/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "mewtwo/icon5.png",
        "sourceRender": "mewtwo/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "mewtwo/icon6.png",
        "sourceRender": "mewtwo/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "mewtwo/icon7.png",
        "sourceRender": "mewtwo/render7.png"
      }
    ]
  },
  "roy": {
    "characterId": "roy",
    "sourceFolder": "roy",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/roy/00.png",
    "render": "/images/characters/renders/roy/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "roy/icon0.png",
        "sourceRender": "roy/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "roy/icon1.png",
        "sourceRender": "roy/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "roy/icon2.png",
        "sourceRender": "roy/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "roy/icon3.png",
        "sourceRender": "roy/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "roy/icon4.png",
        "sourceRender": "roy/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "roy/icon5.png",
        "sourceRender": "roy/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "roy/icon6.png",
        "sourceRender": "roy/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "roy/icon7.png",
        "sourceRender": "roy/render7.png"
      }
    ]
  },
  "chrom": {
    "characterId": "chrom",
    "sourceFolder": "chrom",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/chrom/00.png",
    "render": "/images/characters/renders/chrom/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "chrom/icon0.png",
        "sourceRender": "chrom/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "chrom/icon1.png",
        "sourceRender": "chrom/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "chrom/icon2.png",
        "sourceRender": "chrom/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "chrom/icon3.png",
        "sourceRender": "chrom/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "chrom/icon4.png",
        "sourceRender": "chrom/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "chrom/icon5.png",
        "sourceRender": "chrom/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "chrom/icon6.png",
        "sourceRender": "chrom/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "chrom/icon7.png",
        "sourceRender": "chrom/render7.png"
      }
    ]
  },
  "mr-game-and-watch": {
    "characterId": "mr-game-and-watch",
    "sourceFolder": "mrgameandwatch",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/mr-game-and-watch/00.png",
    "render": "/images/characters/renders/mr-game-and-watch/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "mrgameandwatch/icon0.png",
        "sourceRender": "mrgameandwatch/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "mrgameandwatch/icon1.png",
        "sourceRender": "mrgameandwatch/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "mrgameandwatch/icon2.png",
        "sourceRender": "mrgameandwatch/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "mrgameandwatch/icon3.png",
        "sourceRender": "mrgameandwatch/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "mrgameandwatch/icon4.png",
        "sourceRender": "mrgameandwatch/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "mrgameandwatch/icon5.png",
        "sourceRender": "mrgameandwatch/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "mrgameandwatch/icon6.png",
        "sourceRender": "mrgameandwatch/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "mrgameandwatch/icon7.png",
        "sourceRender": "mrgameandwatch/render7.png"
      }
    ]
  },
  "meta-knight": {
    "characterId": "meta-knight",
    "sourceFolder": "metaknight",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/meta-knight/00.png",
    "render": "/images/characters/renders/meta-knight/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "metaknight/icon0.png",
        "sourceRender": "metaknight/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "metaknight/icon1.png",
        "sourceRender": "metaknight/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "metaknight/icon2.png",
        "sourceRender": "metaknight/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "metaknight/icon3.png",
        "sourceRender": "metaknight/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "metaknight/icon4.png",
        "sourceRender": "metaknight/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "metaknight/icon5.png",
        "sourceRender": "metaknight/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "metaknight/icon6.png",
        "sourceRender": "metaknight/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "metaknight/icon7.png",
        "sourceRender": "metaknight/render7.png"
      }
    ]
  },
  "pit": {
    "characterId": "pit",
    "sourceFolder": "pit",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/pit/00.png",
    "render": "/images/characters/renders/pit/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "pit/icon0.png",
        "sourceRender": "pit/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "pit/icon1.png",
        "sourceRender": "pit/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "pit/icon2.png",
        "sourceRender": "pit/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "pit/icon3.png",
        "sourceRender": "pit/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "pit/icon4.png",
        "sourceRender": "pit/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "pit/icon5.png",
        "sourceRender": "pit/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "pit/icon6.png",
        "sourceRender": "pit/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "pit/icon7.png",
        "sourceRender": "pit/render7.png"
      }
    ]
  },
  "dark-pit": {
    "characterId": "dark-pit",
    "sourceFolder": "darkpit",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/dark-pit/00.png",
    "render": "/images/characters/renders/dark-pit/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "darkpit/icon0.png",
        "sourceRender": "darkpit/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "darkpit/icon1.png",
        "sourceRender": "darkpit/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "darkpit/icon2.png",
        "sourceRender": "darkpit/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "darkpit/icon3.png",
        "sourceRender": "darkpit/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "darkpit/icon4.png",
        "sourceRender": "darkpit/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "darkpit/icon5.png",
        "sourceRender": "darkpit/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "darkpit/icon6.png",
        "sourceRender": "darkpit/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "darkpit/icon7.png",
        "sourceRender": "darkpit/render7.png"
      }
    ]
  },
  "zero-suit-samus": {
    "characterId": "zero-suit-samus",
    "sourceFolder": "zerosuitsamus",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/zero-suit-samus/00.png",
    "render": "/images/characters/renders/zero-suit-samus/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "zerosuitsamus/icon0.png",
        "sourceRender": "zerosuitsamus/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "zerosuitsamus/icon1.png",
        "sourceRender": "zerosuitsamus/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "zerosuitsamus/icon2.png",
        "sourceRender": "zerosuitsamus/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "zerosuitsamus/icon3.png",
        "sourceRender": "zerosuitsamus/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "zerosuitsamus/icon4.png",
        "sourceRender": "zerosuitsamus/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "zerosuitsamus/icon5.png",
        "sourceRender": "zerosuitsamus/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "zerosuitsamus/icon6.png",
        "sourceRender": "zerosuitsamus/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "zerosuitsamus/icon7.png",
        "sourceRender": "zerosuitsamus/render7.png"
      }
    ]
  },
  "wario": {
    "characterId": "wario",
    "sourceFolder": "wario",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/wario/00.png",
    "render": "/images/characters/renders/wario/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "wario/icon0.png",
        "sourceRender": "wario/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "wario/icon1.png",
        "sourceRender": "wario/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "wario/icon2.png",
        "sourceRender": "wario/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "wario/icon3.png",
        "sourceRender": "wario/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "wario/icon4.png",
        "sourceRender": "wario/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "wario/icon5.png",
        "sourceRender": "wario/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "wario/icon6.png",
        "sourceRender": "wario/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "wario/icon7.png",
        "sourceRender": "wario/render7.png"
      }
    ]
  },
  "snake": {
    "characterId": "snake",
    "sourceFolder": "snake",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/snake/00.png",
    "render": "/images/characters/renders/snake/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "snake/icon0.png",
        "sourceRender": "snake/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "snake/icon1.png",
        "sourceRender": "snake/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "snake/icon2.png",
        "sourceRender": "snake/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "snake/icon3.png",
        "sourceRender": "snake/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "snake/icon4.png",
        "sourceRender": "snake/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "snake/icon5.png",
        "sourceRender": "snake/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "snake/icon6.png",
        "sourceRender": "snake/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "snake/icon7.png",
        "sourceRender": "snake/render7.png"
      }
    ]
  },
  "ike": {
    "characterId": "ike",
    "sourceFolder": "ike",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/ike/00.png",
    "render": "/images/characters/renders/ike/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "ike/icon0.png",
        "sourceRender": "ike/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "ike/icon1.png",
        "sourceRender": "ike/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "ike/icon2.png",
        "sourceRender": "ike/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "ike/icon3.png",
        "sourceRender": "ike/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "ike/icon4.png",
        "sourceRender": "ike/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "ike/icon5.png",
        "sourceRender": "ike/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "ike/icon6.png",
        "sourceRender": "ike/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "ike/icon7.png",
        "sourceRender": "ike/render7.png"
      }
    ]
  },
  "pokemon-trainer": {
    "characterId": "pokemon-trainer",
    "sourceFolder": "pokemontrainer",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/pokemon-trainer/00.png",
    "render": "/images/characters/renders/pokemon-trainer/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "pokemontrainer/icon0.png",
        "sourceRender": "pokemontrainer/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "pokemontrainer/icon1.png",
        "sourceRender": "pokemontrainer/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "pokemontrainer/icon2.png",
        "sourceRender": "pokemontrainer/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "pokemontrainer/icon3.png",
        "sourceRender": "pokemontrainer/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "pokemontrainer/icon4.png",
        "sourceRender": "pokemontrainer/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "pokemontrainer/icon5.png",
        "sourceRender": "pokemontrainer/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "pokemontrainer/icon6.png",
        "sourceRender": "pokemontrainer/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "pokemontrainer/icon7.png",
        "sourceRender": "pokemontrainer/render7.png"
      }
    ],
    "sourceForms": [
      "charizard",
      "ivysaur",
      "squirtle"
    ]
  },
  "diddy-kong": {
    "characterId": "diddy-kong",
    "sourceFolder": "diddykong",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/diddy-kong/00.png",
    "render": "/images/characters/renders/diddy-kong/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "diddykong/icon0.png",
        "sourceRender": "diddykong/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "diddykong/icon1.png",
        "sourceRender": "diddykong/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "diddykong/icon2.png",
        "sourceRender": "diddykong/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "diddykong/icon3.png",
        "sourceRender": "diddykong/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "diddykong/icon4.png",
        "sourceRender": "diddykong/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "diddykong/icon5.png",
        "sourceRender": "diddykong/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "diddykong/icon6.png",
        "sourceRender": "diddykong/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "diddykong/icon7.png",
        "sourceRender": "diddykong/render7.png"
      }
    ]
  },
  "lucas": {
    "characterId": "lucas",
    "sourceFolder": "lucas",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/lucas/00.png",
    "render": "/images/characters/renders/lucas/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "lucas/icon0.png",
        "sourceRender": "lucas/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "lucas/icon1.png",
        "sourceRender": "lucas/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "lucas/icon2.png",
        "sourceRender": "lucas/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "lucas/icon3.png",
        "sourceRender": "lucas/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "lucas/icon4.png",
        "sourceRender": "lucas/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "lucas/icon5.png",
        "sourceRender": "lucas/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "lucas/icon6.png",
        "sourceRender": "lucas/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "lucas/icon7.png",
        "sourceRender": "lucas/render7.png"
      }
    ]
  },
  "sonic": {
    "characterId": "sonic",
    "sourceFolder": "sonic",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/sonic/00.png",
    "render": "/images/characters/renders/sonic/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "sonic/icon0.png",
        "sourceRender": "sonic/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": true,
        "sourceIcon": "sonic/icon1.png",
        "sourceRender": "sonic/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": true,
        "sourceIcon": "sonic/icon2.png",
        "sourceRender": "sonic/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": true,
        "sourceIcon": "sonic/icon3.png",
        "sourceRender": "sonic/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": true,
        "sourceIcon": "sonic/icon4.png",
        "sourceRender": "sonic/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": true,
        "sourceIcon": "sonic/icon5.png",
        "sourceRender": "sonic/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": true,
        "sourceIcon": "sonic/icon6.png",
        "sourceRender": "sonic/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": true,
        "sourceIcon": "sonic/icon7.png",
        "sourceRender": "sonic/render7.png"
      }
    ]
  },
  "king-dedede": {
    "characterId": "king-dedede",
    "sourceFolder": "kingdedede",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/king-dedede/00.png",
    "render": "/images/characters/renders/king-dedede/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "kingdedede/icon0.png",
        "sourceRender": "kingdedede/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "kingdedede/icon1.png",
        "sourceRender": "kingdedede/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "kingdedede/icon2.png",
        "sourceRender": "kingdedede/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "kingdedede/icon3.png",
        "sourceRender": "kingdedede/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "kingdedede/icon4.png",
        "sourceRender": "kingdedede/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "kingdedede/icon5.png",
        "sourceRender": "kingdedede/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "kingdedede/icon6.png",
        "sourceRender": "kingdedede/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "kingdedede/icon7.png",
        "sourceRender": "kingdedede/render7.png"
      }
    ]
  },
  "olimar": {
    "characterId": "olimar",
    "sourceFolder": "olimar",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/olimar/00.png",
    "render": "/images/characters/renders/olimar/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "olimar/icon0.png",
        "sourceRender": "olimar/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "olimar/icon1.png",
        "sourceRender": "olimar/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "olimar/icon2.png",
        "sourceRender": "olimar/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "olimar/icon3.png",
        "sourceRender": "olimar/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "olimar/icon4.png",
        "sourceRender": "olimar/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "olimar/icon5.png",
        "sourceRender": "olimar/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "olimar/icon6.png",
        "sourceRender": "olimar/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "olimar/icon7.png",
        "sourceRender": "olimar/render7.png"
      }
    ]
  },
  "lucario": {
    "characterId": "lucario",
    "sourceFolder": "lucario",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/lucario/00.png",
    "render": "/images/characters/renders/lucario/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "lucario/icon0.png",
        "sourceRender": "lucario/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "lucario/icon1.png",
        "sourceRender": "lucario/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "lucario/icon2.png",
        "sourceRender": "lucario/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "lucario/icon3.png",
        "sourceRender": "lucario/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "lucario/icon4.png",
        "sourceRender": "lucario/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "lucario/icon5.png",
        "sourceRender": "lucario/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "lucario/icon6.png",
        "sourceRender": "lucario/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "lucario/icon7.png",
        "sourceRender": "lucario/render7.png"
      }
    ]
  },
  "rob": {
    "characterId": "rob",
    "sourceFolder": "rob",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/rob/00.png",
    "render": "/images/characters/renders/rob/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "rob/icon0.png",
        "sourceRender": "rob/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "rob/icon1.png",
        "sourceRender": "rob/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "rob/icon2.png",
        "sourceRender": "rob/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "rob/icon3.png",
        "sourceRender": "rob/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "rob/icon4.png",
        "sourceRender": "rob/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "rob/icon5.png",
        "sourceRender": "rob/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "rob/icon6.png",
        "sourceRender": "rob/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "rob/icon7.png",
        "sourceRender": "rob/render7.png"
      }
    ]
  },
  "toon-link": {
    "characterId": "toon-link",
    "sourceFolder": "toonlink",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/toon-link/00.png",
    "render": "/images/characters/renders/toon-link/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "toonlink/icon0.png",
        "sourceRender": "toonlink/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "toonlink/icon1.png",
        "sourceRender": "toonlink/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "toonlink/icon2.png",
        "sourceRender": "toonlink/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "toonlink/icon3.png",
        "sourceRender": "toonlink/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "toonlink/icon4.png",
        "sourceRender": "toonlink/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "toonlink/icon5.png",
        "sourceRender": "toonlink/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "toonlink/icon6.png",
        "sourceRender": "toonlink/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "toonlink/icon7.png",
        "sourceRender": "toonlink/render7.png"
      }
    ]
  },
  "wolf": {
    "characterId": "wolf",
    "sourceFolder": "wolf",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/wolf/00.png",
    "render": "/images/characters/renders/wolf/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "wolf/icon0.png",
        "sourceRender": "wolf/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "wolf/icon1.png",
        "sourceRender": "wolf/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "wolf/icon2.png",
        "sourceRender": "wolf/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "wolf/icon3.png",
        "sourceRender": "wolf/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "wolf/icon4.png",
        "sourceRender": "wolf/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "wolf/icon5.png",
        "sourceRender": "wolf/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "wolf/icon6.png",
        "sourceRender": "wolf/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "wolf/icon7.png",
        "sourceRender": "wolf/render7.png"
      }
    ]
  },
  "villager": {
    "characterId": "villager",
    "sourceFolder": "villager",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/villager/00.png",
    "render": "/images/characters/renders/villager/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "villager/icon0.png",
        "sourceRender": "villager/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "villager/icon1.png",
        "sourceRender": "villager/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "villager/icon2.png",
        "sourceRender": "villager/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "villager/icon3.png",
        "sourceRender": "villager/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "villager/icon4.png",
        "sourceRender": "villager/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "villager/icon5.png",
        "sourceRender": "villager/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "villager/icon6.png",
        "sourceRender": "villager/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "villager/icon7.png",
        "sourceRender": "villager/render7.png"
      }
    ]
  },
  "mega-man": {
    "characterId": "mega-man",
    "sourceFolder": "megaman",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/mega-man/00.png",
    "render": "/images/characters/renders/mega-man/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "megaman/icon0.png",
        "sourceRender": "megaman/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "megaman/icon1.png",
        "sourceRender": "megaman/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "megaman/icon2.png",
        "sourceRender": "megaman/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "megaman/icon3.png",
        "sourceRender": "megaman/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "megaman/icon4.png",
        "sourceRender": "megaman/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "megaman/icon5.png",
        "sourceRender": "megaman/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "megaman/icon6.png",
        "sourceRender": "megaman/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "megaman/icon7.png",
        "sourceRender": "megaman/render7.png"
      }
    ]
  },
  "wii-fit-trainer": {
    "characterId": "wii-fit-trainer",
    "sourceFolder": "wiifittrainer",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/wii-fit-trainer/00.png",
    "render": "/images/characters/renders/wii-fit-trainer/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "wiifittrainer/icon0.png",
        "sourceRender": "wiifittrainer/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "wiifittrainer/icon1.png",
        "sourceRender": "wiifittrainer/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "wiifittrainer/icon2.png",
        "sourceRender": "wiifittrainer/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "wiifittrainer/icon3.png",
        "sourceRender": "wiifittrainer/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "wiifittrainer/icon4.png",
        "sourceRender": "wiifittrainer/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "wiifittrainer/icon5.png",
        "sourceRender": "wiifittrainer/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "wiifittrainer/icon6.png",
        "sourceRender": "wiifittrainer/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "wiifittrainer/icon7.png",
        "sourceRender": "wiifittrainer/render7.png"
      }
    ]
  },
  "rosalina-and-luma": {
    "characterId": "rosalina-and-luma",
    "sourceFolder": "rosalinaandluma",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/rosalina-and-luma/00.png",
    "render": "/images/characters/renders/rosalina-and-luma/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "rosalinaandluma/icon0.png",
        "sourceRender": "rosalinaandluma/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "rosalinaandluma/icon1.png",
        "sourceRender": "rosalinaandluma/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "rosalinaandluma/icon2.png",
        "sourceRender": "rosalinaandluma/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "rosalinaandluma/icon3.png",
        "sourceRender": "rosalinaandluma/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "rosalinaandluma/icon4.png",
        "sourceRender": "rosalinaandluma/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "rosalinaandluma/icon5.png",
        "sourceRender": "rosalinaandluma/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "rosalinaandluma/icon6.png",
        "sourceRender": "rosalinaandluma/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "rosalinaandluma/icon7.png",
        "sourceRender": "rosalinaandluma/render7.png"
      }
    ]
  },
  "little-mac": {
    "characterId": "little-mac",
    "sourceFolder": "littlemac",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/little-mac/00.png",
    "render": "/images/characters/renders/little-mac/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "littlemac/icon0.png",
        "sourceRender": "littlemac/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "littlemac/icon1.png",
        "sourceRender": "littlemac/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "littlemac/icon2.png",
        "sourceRender": "littlemac/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "littlemac/icon3.png",
        "sourceRender": "littlemac/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "littlemac/icon4.png",
        "sourceRender": "littlemac/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "littlemac/icon5.png",
        "sourceRender": "littlemac/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "littlemac/icon6.png",
        "sourceRender": "littlemac/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "littlemac/icon7.png",
        "sourceRender": "littlemac/render7.png"
      }
    ]
  },
  "greninja": {
    "characterId": "greninja",
    "sourceFolder": "greninja",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/greninja/00.png",
    "render": "/images/characters/renders/greninja/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "greninja/icon0.png",
        "sourceRender": "greninja/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "greninja/icon1.png",
        "sourceRender": "greninja/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "greninja/icon2.png",
        "sourceRender": "greninja/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "greninja/icon3.png",
        "sourceRender": "greninja/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "greninja/icon4.png",
        "sourceRender": "greninja/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "greninja/icon5.png",
        "sourceRender": "greninja/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "greninja/icon6.png",
        "sourceRender": "greninja/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "greninja/icon7.png",
        "sourceRender": "greninja/render7.png"
      }
    ]
  },
  "mii-brawler": {
    "characterId": "mii-brawler",
    "sourceFolder": "miibrawler",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/mii-brawler/00.png",
    "render": "/images/characters/renders/mii-brawler/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "miibrawler/icon0.png",
        "sourceRender": "miibrawler/render0.png"
      }
    ]
  },
  "mii-swordfighter": {
    "characterId": "mii-swordfighter",
    "sourceFolder": "miiswordfighter",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/mii-swordfighter/00.png",
    "render": "/images/characters/renders/mii-swordfighter/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "miiswordfighter/icon0.png",
        "sourceRender": "miiswordfighter/render0.png"
      }
    ]
  },
  "mii-gunner": {
    "characterId": "mii-gunner",
    "sourceFolder": "miigunner",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/mii-gunner/00.png",
    "render": "/images/characters/renders/mii-gunner/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "miigunner/icon0.png",
        "sourceRender": "miigunner/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "miigunner/icon1.png",
        "sourceRender": "miigunner/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "miigunner/icon2.png",
        "sourceRender": "miigunner/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "miigunner/icon3.png",
        "sourceRender": "miigunner/render3.png"
      }
    ]
  },
  "palutena": {
    "characterId": "palutena",
    "sourceFolder": "palutena",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/palutena/00.png",
    "render": "/images/characters/renders/palutena/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "palutena/icon0.png",
        "sourceRender": "palutena/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "palutena/icon1.png",
        "sourceRender": "palutena/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "palutena/icon2.png",
        "sourceRender": "palutena/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "palutena/icon3.png",
        "sourceRender": "palutena/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "palutena/icon4.png",
        "sourceRender": "palutena/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "palutena/icon5.png",
        "sourceRender": "palutena/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "palutena/icon6.png",
        "sourceRender": "palutena/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "palutena/icon7.png",
        "sourceRender": "palutena/render7.png"
      }
    ]
  },
  "pac-man": {
    "characterId": "pac-man",
    "sourceFolder": "pacman",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/pac-man/00.png",
    "render": "/images/characters/renders/pac-man/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "pacman/icon0.png",
        "sourceRender": "pacman/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "pacman/icon1.png",
        "sourceRender": "pacman/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "pacman/icon2.png",
        "sourceRender": "pacman/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "pacman/icon3.png",
        "sourceRender": "pacman/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "pacman/icon4.png",
        "sourceRender": "pacman/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "pacman/icon5.png",
        "sourceRender": "pacman/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "pacman/icon6.png",
        "sourceRender": "pacman/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "pacman/icon7.png",
        "sourceRender": "pacman/render7.png"
      }
    ]
  },
  "robin": {
    "characterId": "robin",
    "sourceFolder": "robin",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/robin/00.png",
    "render": "/images/characters/renders/robin/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "robin/icon0.png",
        "sourceRender": "robin/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "robin/icon1.png",
        "sourceRender": "robin/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "robin/icon2.png",
        "sourceRender": "robin/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "robin/icon3.png",
        "sourceRender": "robin/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "robin/icon4.png",
        "sourceRender": "robin/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "robin/icon5.png",
        "sourceRender": "robin/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "robin/icon6.png",
        "sourceRender": "robin/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "robin/icon7.png",
        "sourceRender": "robin/render7.png"
      }
    ]
  },
  "shulk": {
    "characterId": "shulk",
    "sourceFolder": "shulk",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/shulk/00.png",
    "render": "/images/characters/renders/shulk/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "shulk/icon0.png",
        "sourceRender": "shulk/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "shulk/icon1.png",
        "sourceRender": "shulk/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "shulk/icon2.png",
        "sourceRender": "shulk/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "shulk/icon3.png",
        "sourceRender": "shulk/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "shulk/icon4.png",
        "sourceRender": "shulk/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "shulk/icon5.png",
        "sourceRender": "shulk/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "shulk/icon6.png",
        "sourceRender": "shulk/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "shulk/icon7.png",
        "sourceRender": "shulk/render7.png"
      }
    ]
  },
  "bowser-jr": {
    "characterId": "bowser-jr",
    "sourceFolder": "bowserjr",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/bowser-jr/00.png",
    "render": "/images/characters/renders/bowser-jr/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "bowserjr/icon0.png",
        "sourceRender": "bowserjr/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "bowserjr/icon1.png",
        "sourceRender": "bowserjr/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "bowserjr/icon2.png",
        "sourceRender": "bowserjr/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "bowserjr/icon3.png",
        "sourceRender": "bowserjr/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "bowserjr/icon4.png",
        "sourceRender": "bowserjr/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "bowserjr/icon5.png",
        "sourceRender": "bowserjr/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "bowserjr/icon6.png",
        "sourceRender": "bowserjr/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "bowserjr/icon7.png",
        "sourceRender": "bowserjr/render7.png"
      }
    ]
  },
  "duck-hunt": {
    "characterId": "duck-hunt",
    "sourceFolder": "duckhunt",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/duck-hunt/00.png",
    "render": "/images/characters/renders/duck-hunt/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "duckhunt/icon0.png",
        "sourceRender": "duckhunt/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "duckhunt/icon1.png",
        "sourceRender": "duckhunt/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "duckhunt/icon2.png",
        "sourceRender": "duckhunt/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "duckhunt/icon3.png",
        "sourceRender": "duckhunt/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "duckhunt/icon4.png",
        "sourceRender": "duckhunt/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "duckhunt/icon5.png",
        "sourceRender": "duckhunt/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "duckhunt/icon6.png",
        "sourceRender": "duckhunt/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "duckhunt/icon7.png",
        "sourceRender": "duckhunt/render7.png"
      }
    ]
  },
  "ryu": {
    "characterId": "ryu",
    "sourceFolder": "ryu",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/ryu/00.png",
    "render": "/images/characters/renders/ryu/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "ryu/icon0.png",
        "sourceRender": "ryu/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "ryu/icon1.png",
        "sourceRender": "ryu/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "ryu/icon2.png",
        "sourceRender": "ryu/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "ryu/icon3.png",
        "sourceRender": "ryu/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "ryu/icon4.png",
        "sourceRender": "ryu/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "ryu/icon5.png",
        "sourceRender": "ryu/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "ryu/icon6.png",
        "sourceRender": "ryu/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "ryu/icon7.png",
        "sourceRender": "ryu/render7.png"
      }
    ]
  },
  "ken": {
    "characterId": "ken",
    "sourceFolder": "ken",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/ken/00.png",
    "render": "/images/characters/renders/ken/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "ken/icon0.png",
        "sourceRender": "ken/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "ken/icon1.png",
        "sourceRender": "ken/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "ken/icon2.png",
        "sourceRender": "ken/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "ken/icon3.png",
        "sourceRender": "ken/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "ken/icon4.png",
        "sourceRender": "ken/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "ken/icon5.png",
        "sourceRender": "ken/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "ken/icon6.png",
        "sourceRender": "ken/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "ken/icon7.png",
        "sourceRender": "ken/render7.png"
      }
    ]
  },
  "cloud": {
    "characterId": "cloud",
    "sourceFolder": "cloud",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/cloud/00.png",
    "render": "/images/characters/renders/cloud/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "cloud/icon0.png",
        "sourceRender": "cloud/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "cloud/icon1.png",
        "sourceRender": "cloud/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "cloud/icon2.png",
        "sourceRender": "cloud/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "cloud/icon3.png",
        "sourceRender": "cloud/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "cloud/icon4.png",
        "sourceRender": "cloud/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "cloud/icon5.png",
        "sourceRender": "cloud/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "cloud/icon6.png",
        "sourceRender": "cloud/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "cloud/icon7.png",
        "sourceRender": "cloud/render7.png"
      }
    ]
  },
  "corrin": {
    "characterId": "corrin",
    "sourceFolder": "corrin",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/corrin/00.png",
    "render": "/images/characters/renders/corrin/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "corrin/icon0.png",
        "sourceRender": "corrin/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "corrin/icon1.png",
        "sourceRender": "corrin/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "corrin/icon2.png",
        "sourceRender": "corrin/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "corrin/icon3.png",
        "sourceRender": "corrin/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "corrin/icon4.png",
        "sourceRender": "corrin/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "corrin/icon5.png",
        "sourceRender": "corrin/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "corrin/icon6.png",
        "sourceRender": "corrin/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "corrin/icon7.png",
        "sourceRender": "corrin/render7.png"
      }
    ]
  },
  "bayonetta": {
    "characterId": "bayonetta",
    "sourceFolder": "bayonetta",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/bayonetta/00.png",
    "render": "/images/characters/renders/bayonetta/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "bayonetta/icon0.png",
        "sourceRender": "bayonetta/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "bayonetta/icon1.png",
        "sourceRender": "bayonetta/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "bayonetta/icon2.png",
        "sourceRender": "bayonetta/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "bayonetta/icon3.png",
        "sourceRender": "bayonetta/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "bayonetta/icon4.png",
        "sourceRender": "bayonetta/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "bayonetta/icon5.png",
        "sourceRender": "bayonetta/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "bayonetta/icon6.png",
        "sourceRender": "bayonetta/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "bayonetta/icon7.png",
        "sourceRender": "bayonetta/render7.png"
      }
    ]
  },
  "inkling": {
    "characterId": "inkling",
    "sourceFolder": "inkling",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/inkling/00.png",
    "render": "/images/characters/renders/inkling/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "inkling/icon0.png",
        "sourceRender": "inkling/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "inkling/icon1.png",
        "sourceRender": "inkling/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "inkling/icon2.png",
        "sourceRender": "inkling/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "inkling/icon3.png",
        "sourceRender": "inkling/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "inkling/icon4.png",
        "sourceRender": "inkling/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "inkling/icon5.png",
        "sourceRender": "inkling/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "inkling/icon6.png",
        "sourceRender": "inkling/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "inkling/icon7.png",
        "sourceRender": "inkling/render7.png"
      }
    ]
  },
  "ridley": {
    "characterId": "ridley",
    "sourceFolder": "ridley",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/ridley/00.png",
    "render": "/images/characters/renders/ridley/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "ridley/icon0.png",
        "sourceRender": "ridley/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "ridley/icon1.png",
        "sourceRender": "ridley/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "ridley/icon2.png",
        "sourceRender": "ridley/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "ridley/icon3.png",
        "sourceRender": "ridley/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "ridley/icon4.png",
        "sourceRender": "ridley/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "ridley/icon5.png",
        "sourceRender": "ridley/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "ridley/icon6.png",
        "sourceRender": "ridley/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "ridley/icon7.png",
        "sourceRender": "ridley/render7.png"
      }
    ]
  },
  "simon": {
    "characterId": "simon",
    "sourceFolder": "simon",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/simon/00.png",
    "render": "/images/characters/renders/simon/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "simon/icon0.png",
        "sourceRender": "simon/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "simon/icon1.png",
        "sourceRender": "simon/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "simon/icon2.png",
        "sourceRender": "simon/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "simon/icon3.png",
        "sourceRender": "simon/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "simon/icon4.png",
        "sourceRender": "simon/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "simon/icon5.png",
        "sourceRender": "simon/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "simon/icon6.png",
        "sourceRender": "simon/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "simon/icon7.png",
        "sourceRender": "simon/render7.png"
      }
    ]
  },
  "richter": {
    "characterId": "richter",
    "sourceFolder": "richter",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/richter/00.png",
    "render": "/images/characters/renders/richter/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "richter/icon0.png",
        "sourceRender": "richter/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "richter/icon1.png",
        "sourceRender": "richter/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "richter/icon2.png",
        "sourceRender": "richter/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "richter/icon3.png",
        "sourceRender": "richter/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "richter/icon4.png",
        "sourceRender": "richter/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "richter/icon5.png",
        "sourceRender": "richter/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "richter/icon6.png",
        "sourceRender": "richter/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "richter/icon7.png",
        "sourceRender": "richter/render7.png"
      }
    ]
  },
  "king-k-rool": {
    "characterId": "king-k-rool",
    "sourceFolder": "kingkrool",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/king-k-rool/00.png",
    "render": "/images/characters/renders/king-k-rool/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "kingkrool/icon0.png",
        "sourceRender": "kingkrool/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "kingkrool/icon1.png",
        "sourceRender": "kingkrool/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "kingkrool/icon2.png",
        "sourceRender": "kingkrool/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "kingkrool/icon3.png",
        "sourceRender": "kingkrool/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "kingkrool/icon4.png",
        "sourceRender": "kingkrool/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "kingkrool/icon5.png",
        "sourceRender": "kingkrool/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "kingkrool/icon6.png",
        "sourceRender": "kingkrool/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "kingkrool/icon7.png",
        "sourceRender": "kingkrool/render7.png"
      }
    ]
  },
  "isabelle": {
    "characterId": "isabelle",
    "sourceFolder": "isabelle",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/isabelle/00.png",
    "render": "/images/characters/renders/isabelle/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "isabelle/icon0.png",
        "sourceRender": "isabelle/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "isabelle/icon1.png",
        "sourceRender": "isabelle/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "isabelle/icon2.png",
        "sourceRender": "isabelle/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "isabelle/icon3.png",
        "sourceRender": "isabelle/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "isabelle/icon4.png",
        "sourceRender": "isabelle/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "isabelle/icon5.png",
        "sourceRender": "isabelle/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "isabelle/icon6.png",
        "sourceRender": "isabelle/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "isabelle/icon7.png",
        "sourceRender": "isabelle/render7.png"
      }
    ]
  },
  "incineroar": {
    "characterId": "incineroar",
    "sourceFolder": "incineroar",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/incineroar/00.png",
    "render": "/images/characters/renders/incineroar/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "incineroar/icon0.png",
        "sourceRender": "incineroar/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "incineroar/icon1.png",
        "sourceRender": "incineroar/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "incineroar/icon2.png",
        "sourceRender": "incineroar/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "incineroar/icon3.png",
        "sourceRender": "incineroar/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "incineroar/icon4.png",
        "sourceRender": "incineroar/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "incineroar/icon5.png",
        "sourceRender": "incineroar/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "incineroar/icon6.png",
        "sourceRender": "incineroar/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "incineroar/icon7.png",
        "sourceRender": "incineroar/render7.png"
      }
    ]
  },
  "piranha-plant": {
    "characterId": "piranha-plant",
    "sourceFolder": "pirahnaplant",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/piranha-plant/00.png",
    "render": "/images/characters/renders/piranha-plant/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "pirahnaplant/icon0.png",
        "sourceRender": "pirahnaplant/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "pirahnaplant/icon1.png",
        "sourceRender": "pirahnaplant/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "pirahnaplant/icon2.png",
        "sourceRender": "pirahnaplant/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "pirahnaplant/icon3.png",
        "sourceRender": "pirahnaplant/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "pirahnaplant/icon4.png",
        "sourceRender": "pirahnaplant/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "pirahnaplant/icon5.png",
        "sourceRender": "pirahnaplant/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "pirahnaplant/icon6.png",
        "sourceRender": "pirahnaplant/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "pirahnaplant/icon7.png",
        "sourceRender": "pirahnaplant/render7.png"
      }
    ]
  },
  "joker": {
    "characterId": "joker",
    "sourceFolder": "joker",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/joker/00.png",
    "render": "/images/characters/renders/joker/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "joker/icon0.png",
        "sourceRender": "joker/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "joker/icon1.png",
        "sourceRender": "joker/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "joker/icon2.png",
        "sourceRender": "joker/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "joker/icon3.png",
        "sourceRender": "joker/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "joker/icon4.png",
        "sourceRender": "joker/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "joker/icon5.png",
        "sourceRender": "joker/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "joker/icon6.png",
        "sourceRender": "joker/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "joker/icon7.png",
        "sourceRender": "joker/render7.png"
      }
    ]
  },
  "hero": {
    "characterId": "hero",
    "sourceFolder": "hero",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/hero/00.png",
    "render": "/images/characters/renders/hero/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "hero/icon0.png",
        "sourceRender": "hero/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "hero/icon1.png",
        "sourceRender": "hero/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "hero/icon2.png",
        "sourceRender": "hero/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "hero/icon3.png",
        "sourceRender": "hero/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "hero/icon4.png",
        "sourceRender": "hero/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "hero/icon5.png",
        "sourceRender": "hero/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "hero/icon6.png",
        "sourceRender": "hero/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "hero/icon7.png",
        "sourceRender": "hero/render7.png"
      }
    ]
  },
  "banjo-and-kazooie": {
    "characterId": "banjo-and-kazooie",
    "sourceFolder": "banjoandkazooie",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/banjo-and-kazooie/00.png",
    "render": "/images/characters/renders/banjo-and-kazooie/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "banjoandkazooie/icon0.png",
        "sourceRender": "banjoandkazooie/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "banjoandkazooie/icon1.png",
        "sourceRender": "banjoandkazooie/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "banjoandkazooie/icon2.png",
        "sourceRender": "banjoandkazooie/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "banjoandkazooie/icon3.png",
        "sourceRender": "banjoandkazooie/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "banjoandkazooie/icon4.png",
        "sourceRender": "banjoandkazooie/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "banjoandkazooie/icon5.png",
        "sourceRender": "banjoandkazooie/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "banjoandkazooie/icon6.png",
        "sourceRender": "banjoandkazooie/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "banjoandkazooie/icon7.png",
        "sourceRender": "banjoandkazooie/render7.png"
      }
    ]
  },
  "terry": {
    "characterId": "terry",
    "sourceFolder": "terry",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/terry/00.png",
    "render": "/images/characters/renders/terry/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "terry/icon0.png",
        "sourceRender": "terry/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "terry/icon1.png",
        "sourceRender": "terry/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "terry/icon2.png",
        "sourceRender": "terry/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "terry/icon3.png",
        "sourceRender": "terry/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "terry/icon4.png",
        "sourceRender": "terry/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "terry/icon5.png",
        "sourceRender": "terry/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "terry/icon6.png",
        "sourceRender": "terry/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "terry/icon7.png",
        "sourceRender": "terry/render7.png"
      }
    ]
  },
  "byleth": {
    "characterId": "byleth",
    "sourceFolder": "byleth",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/byleth/00.png",
    "render": "/images/characters/renders/byleth/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "byleth/icon0.png",
        "sourceRender": "byleth/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "byleth/icon1.png",
        "sourceRender": "byleth/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "byleth/icon2.png",
        "sourceRender": "byleth/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "byleth/icon3.png",
        "sourceRender": "byleth/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "byleth/icon4.png",
        "sourceRender": "byleth/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "byleth/icon5.png",
        "sourceRender": "byleth/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "byleth/icon6.png",
        "sourceRender": "byleth/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "byleth/icon7.png",
        "sourceRender": "byleth/render7.png"
      }
    ]
  },
  "min-min": {
    "characterId": "min-min",
    "sourceFolder": "minmin",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/min-min/00.png",
    "render": "/images/characters/renders/min-min/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "minmin/icon0.png",
        "sourceRender": "minmin/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "minmin/icon1.png",
        "sourceRender": "minmin/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "minmin/icon2.png",
        "sourceRender": "minmin/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "minmin/icon3.png",
        "sourceRender": "minmin/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "minmin/icon4.png",
        "sourceRender": "minmin/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "minmin/icon5.png",
        "sourceRender": "minmin/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "minmin/icon6.png",
        "sourceRender": "minmin/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "minmin/icon7.png",
        "sourceRender": "minmin/render7.png"
      }
    ]
  },
  "steve": {
    "characterId": "steve",
    "sourceFolder": "steve",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/steve/00.png",
    "render": "/images/characters/renders/steve/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "steve/icon0.png",
        "sourceRender": "steve/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "steve/icon1.png",
        "sourceRender": "steve/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "steve/icon2.png",
        "sourceRender": "steve/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "steve/icon3.png",
        "sourceRender": "steve/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "steve/icon4.png",
        "sourceRender": "steve/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "steve/icon5.png",
        "sourceRender": "steve/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "steve/icon6.png",
        "sourceRender": "steve/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "steve/icon7.png",
        "sourceRender": "steve/render7.png"
      }
    ]
  },
  "sephiroth": {
    "characterId": "sephiroth",
    "sourceFolder": "sephiroth",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/sephiroth/00.png",
    "render": "/images/characters/renders/sephiroth/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "sephiroth/icon0.png",
        "sourceRender": "sephiroth/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "sephiroth/icon1.png",
        "sourceRender": "sephiroth/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "sephiroth/icon2.png",
        "sourceRender": "sephiroth/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "sephiroth/icon3.png",
        "sourceRender": "sephiroth/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "sephiroth/icon4.png",
        "sourceRender": "sephiroth/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "sephiroth/icon5.png",
        "sourceRender": "sephiroth/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "sephiroth/icon6.png",
        "sourceRender": "sephiroth/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "sephiroth/icon7.png",
        "sourceRender": "sephiroth/render7.png"
      }
    ]
  },
  "pyra-mythra": {
    "characterId": "pyra-mythra",
    "sourceFolder": "pyramythra",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/pyra-mythra/00.png",
    "render": "/images/characters/renders/pyra-mythra/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "pyramythra/icon0.png",
        "sourceRender": "pyramythra/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "pyramythra/icon1.png",
        "sourceRender": "pyramythra/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "pyramythra/icon2.png",
        "sourceRender": "pyramythra/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "pyramythra/icon3.png",
        "sourceRender": "pyramythra/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "pyramythra/icon4.png",
        "sourceRender": "pyramythra/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "pyramythra/icon5.png",
        "sourceRender": "pyramythra/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "pyramythra/icon6.png",
        "sourceRender": "pyramythra/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "pyramythra/icon7.png",
        "sourceRender": "pyramythra/render7.png"
      }
    ]
  },
  "kazuya": {
    "characterId": "kazuya",
    "sourceFolder": "kazuya",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/kazuya/00.png",
    "render": "/images/characters/renders/kazuya/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "kazuya/icon0.png",
        "sourceRender": "kazuya/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "kazuya/icon1.png",
        "sourceRender": "kazuya/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "kazuya/icon2.png",
        "sourceRender": "kazuya/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "kazuya/icon3.png",
        "sourceRender": "kazuya/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "kazuya/icon4.png",
        "sourceRender": "kazuya/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "kazuya/icon5.png",
        "sourceRender": "kazuya/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "kazuya/icon6.png",
        "sourceRender": "kazuya/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "kazuya/icon7.png",
        "sourceRender": "kazuya/render7.png"
      }
    ]
  },
  "sora": {
    "characterId": "sora",
    "sourceFolder": "sora",
    "defaultVariantId": "00",
    "icon": "/images/characters/icons/sora/00.png",
    "render": "/images/characters/renders/sora/00.png",
    "fullBodyRender": null,
    "renderFraming": "unverified-or-cropped",
    "variants": [
      {
        "id": "00",
        "sourceIndex": 0,
        "availableLocally": true,
        "sourceIcon": "sora/icon0.png",
        "sourceRender": "sora/render0.png"
      },
      {
        "id": "01",
        "sourceIndex": 1,
        "availableLocally": false,
        "sourceIcon": "sora/icon1.png",
        "sourceRender": "sora/render1.png"
      },
      {
        "id": "02",
        "sourceIndex": 2,
        "availableLocally": false,
        "sourceIcon": "sora/icon2.png",
        "sourceRender": "sora/render2.png"
      },
      {
        "id": "03",
        "sourceIndex": 3,
        "availableLocally": false,
        "sourceIcon": "sora/icon3.png",
        "sourceRender": "sora/render3.png"
      },
      {
        "id": "04",
        "sourceIndex": 4,
        "availableLocally": false,
        "sourceIcon": "sora/icon4.png",
        "sourceRender": "sora/render4.png"
      },
      {
        "id": "05",
        "sourceIndex": 5,
        "availableLocally": false,
        "sourceIcon": "sora/icon5.png",
        "sourceRender": "sora/render5.png"
      },
      {
        "id": "06",
        "sourceIndex": 6,
        "availableLocally": false,
        "sourceIcon": "sora/icon6.png",
        "sourceRender": "sora/render6.png"
      },
      {
        "id": "07",
        "sourceIndex": 7,
        "availableLocally": false,
        "sourceIcon": "sora/icon7.png",
        "sourceRender": "sora/render7.png"
      }
    ]
  }
}
