import type { Ruleset } from '../types/ruleset'
import { createCatalogStage as stage } from './stageCatalog'

export const defaultRulesets: Ruleset[] = [
  {
    id: 'shine-city',
    name: 'Shine City',
    community: 'Shine City Community',
    description:
      'Un ruleset equilibrado para brackets competitivos, con starters clásicos y counterpicks variados.',
    accent: 'cyan',
    featured: true,
    stages: [
      stage('pokemon-stadium-2', 'starter'),
      stage('battlefield', 'starter'),
      stage('final-destination', 'starter'),
      stage('hollow-bastion', 'starter'),
      stage('small-battlefield', 'starter'),
      stage('town-and-city', 'counterpick'),
      stage('smashville', 'counterpick'),
      stage('kalos-pokemon-league', 'counterpick'),
    ],
    gameOneFlow: {
      enabledStages: 'startersOnly',
      firstBanCount: 1,
      secondBanCount: 2,
      pickerRule: 'rpsWinner',
    },
    laterGamesFlow: {
      winnerBanCount: 3,
      loserPicks: true,
      counterpicksUnlocked: true,
    },
  },
  {
    id: 'neon-weekly',
    name: 'Neon Weekly',
    community: 'Distrito Arcade',
    description:
      'Formato rápido para torneos semanales, diseñado para reducir pausas entre games.',
    accent: 'violet',
    stages: [
      stage('battlefield', 'starter'),
      stage('small-battlefield', 'starter'),
      stage('pokemon-stadium-2', 'starter'),
      stage('hollow-bastion', 'starter'),
      stage('final-destination', 'starter'),
      stage('town-and-city', 'counterpick'),
      stage('smashville', 'counterpick'),
      stage('kalos-pokemon-league', 'counterpick'),
    ],
    gameOneFlow: {
      enabledStages: 'startersOnly',
      firstBanCount: 2,
      secondBanCount: 1,
      pickerRule: 'rpsLoser',
    },
    laterGamesFlow: {
      winnerBanCount: 2,
      loserPicks: true,
      counterpicksUnlocked: true,
    },
  },
  {
    id: 'circuito-frontera',
    name: 'Circuito Frontera',
    community: 'Liga del Norte',
    description:
      'Pool compacto para eventos regionales, con énfasis en decisiones claras y sets ágiles.',
    accent: 'amber',
    stages: [
      stage('battlefield', 'starter'),
      stage('small-battlefield', 'starter'),
      stage('pokemon-stadium-2', 'starter'),
      stage('hollow-bastion', 'starter'),
      stage('final-destination', 'starter'),
      stage('town-and-city', 'counterpick'),
      stage('smashville', 'counterpick'),
      stage('kalos-pokemon-league', 'counterpick'),
    ],
    gameOneFlow: {
      enabledStages: 'startersOnly',
      firstBanCount: 1,
      secondBanCount: 2,
      pickerRule: 'rpsWinner',
    },
    laterGamesFlow: {
      winnerBanCount: 2,
      loserPicks: true,
      counterpicksUnlocked: true,
    },
  },
]

export const getRulesetById = (id: string) =>
  defaultRulesets.find((ruleset) => ruleset.id === id)
