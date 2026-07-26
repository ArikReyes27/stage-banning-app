import type { Stage, StageType } from '../types/ruleset'

export type StageCatalogEntry = {
  id: string
  name: string
  image: string
  isCompetitive: boolean
}

export const stageCatalog: StageCatalogEntry[] = [
  {
    id: 'final-destination',
    name: 'Final Destination',
    image: '/images/stages/final-destination.jpg',
    isCompetitive: true,
  },
  {
    id: 'battlefield',
    name: 'Battlefield',
    image: '/images/stages/battlefield.jpg',
    isCompetitive: true,
  },
  {
    id: 'small-battlefield',
    name: 'Small Battlefield',
    image: '/images/stages/small-battlefield.jpg',
    isCompetitive: true,
  },
  {
    id: 'pokemon-stadium-2',
    name: 'Pokémon Stadium 2',
    image: '/images/stages/pokemon-stadium-2.jpg',
    isCompetitive: true,
  },
  {
    id: 'hollow-bastion',
    name: 'Hollow Bastion',
    image: '/images/stages/hollow-bastion.jpg',
    isCompetitive: true,
  },
  {
    id: 'town-and-city',
    name: 'Town and City',
    image: '/images/stages/town-and-city.jpg',
    isCompetitive: true,
  },
  {
    id: 'smashville',
    name: 'Smashville',
    image: '/images/stages/smashville.jpg',
    isCompetitive: true,
  },
  {
    id: 'kalos-pokemon-league',
    name: 'Kalos Pokémon League',
    image: '/images/stages/kalos-pokemon-league.jpg',
    isCompetitive: true,
  },
  {
    id: 'yoshis-story',
    name: "Yoshi's Story",
    image: '/images/stages/yoshis-story.jpg',
    isCompetitive: true,
  },
  {
    id: 'lylat-cruise',
    name: 'Lylat Cruise',
    image: '/images/stages/lylat-cruise.jpg',
    isCompetitive: true,
  },
]

export const normalizeStageName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase()

export const getStageCatalogEntry = (stage: Pick<Stage, 'id' | 'name'>) =>
  stageCatalog.find((entry) => entry.id === stage.id) ??
  stageCatalog.find(
    (entry) =>
      normalizeStageName(entry.name) === normalizeStageName(stage.name),
  )

export const getStageIdentity = (stage: Pick<Stage, 'id' | 'name'>) =>
  getStageCatalogEntry(stage)?.id ?? `custom:${normalizeStageName(stage.name)}`

export const createCatalogStage = (id: string, type: StageType): Stage => {
  const catalogStage = stageCatalog.find((entry) => entry.id === id)

  if (!catalogStage) {
    throw new Error(`Unknown catalog stage: ${id}`)
  }

  return {
    id: catalogStage.id,
    name: catalogStage.name,
    type,
  }
}
