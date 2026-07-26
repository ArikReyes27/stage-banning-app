export type StageType = 'starter' | 'counterpick'

export type Stage = {
  id: string
  name: string
  type: StageType
}

export type PickerRule =
  | 'player1'
  | 'player2'
  | 'rpsWinner'
  | 'rpsLoser'
  | 'custom'

export type RulesetAccent = 'cyan' | 'violet' | 'amber'
export type RulesetSource = 'default' | 'custom'

export type Ruleset = {
  id: string
  name: string
  community: string
  description: string
  accent: RulesetAccent
  source?: RulesetSource
  featured?: boolean
  createdAt?: string
  updatedAt?: string
  stages: Stage[]
  gameOneFlow: {
    enabledStages: 'startersOnly'
    firstBanCount: number
    secondBanCount: number
    pickerRule: PickerRule
  }
  laterGamesFlow: {
    winnerBanCount: number
    loserPicks: boolean
    counterpicksUnlocked: boolean
  }
}

export type RulesetInput = Omit<
  Ruleset,
  'id' | 'source' | 'featured' | 'createdAt' | 'updatedAt'
>
