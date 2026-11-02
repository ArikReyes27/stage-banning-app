export type MatchFormat = 'BO3' | 'BO5'
export type MatchId = `W${number}` | `L${number}` | 'GF' | 'RESET'

export type Participant = {
  id: string
  nickname: string
  // Array supports additional characters without changing the player model.
  characterIds: string[]
}

export type MatchSource =
  | { seed: number }
  | { match: MatchId; outcome: 'winner' | 'loser' }

export type MatchDefinition = {
  id: MatchId
  section: 'winners' | 'losers' | 'finals'
  round: string
  column: number
  sources: [MatchSource, MatchSource]
}

export type MatchResult = {
  format: MatchFormat
  scores: [number, number]
  confirmed: boolean
  prepared?: GameSetup
  details?: MatchDetails
  outcome?: { type: 'dq'; loser: 0 | 1; recordedAt: string; reason?: string }
}

export type GameSetup = {
  variantIds?: [string, string]
  characterIds: [string, string]
  stage?: { id: string; name: string }
}

export type MatchGame = GameSetup & { winner: 0 | 1; voided?: boolean }

// Optional additive v1 extension: legacy scores are preserved without invented history.
export type MatchDetails = {
  legacyScores: [number, number]
  games: MatchGame[]
  current: GameSetup
  status: 'ready' | 'in-progress' | 'paused'
  startedAt?: string
  rulesetId?: string
}

export type Tournament = {
  schemaVersion: 1 | 2
  status: 'draft' | 'ready' | 'started'
  participants: Participant[]
  seeds: string[]
  results: Partial<Record<MatchId, MatchResult>>
  structure?: MatchDefinition[]
  priorities?: Record<string, number>
  previousSeeds?: string[]
  completionOrder?: MatchId[]
}

export type ResolvedMatch = MatchDefinition & {
  players: [Participant | undefined, Participant | undefined]
  suggested?: GameSetup
  result?: MatchResult
  enabled: boolean
  winnerId?: string
  loserId?: string
  automatic?: boolean
  settled?: boolean
}
