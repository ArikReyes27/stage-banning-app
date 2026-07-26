import { useCallback, useMemo } from 'react'
import { defaultRulesets as rawDefaultRulesets } from '../data/defaultRulesets'
import type {
  PickerRule,
  Ruleset,
  RulesetAccent,
  RulesetInput,
  RulesetSource,
  StageType,
} from '../types/ruleset'
import { createId } from '../utils/id'
import { useLocalStorage } from './useLocalStorage'

export const CUSTOM_RULESETS_STORAGE_KEY = 'stage-strike.custom-rulesets'

const accents: RulesetAccent[] = ['cyan', 'violet', 'amber']
const pickerRules: PickerRule[] = [
  'player1',
  'player2',
  'rpsWinner',
  'rpsLoser',
  'custom',
]
const sources: RulesetSource[] = ['default', 'custom']
const stageTypes: StageType[] = ['starter', 'counterpick']
const emptyRulesets: Ruleset[] = []

const defaultRulesets: Ruleset[] = rawDefaultRulesets.map((ruleset) => ({
  ...ruleset,
  source: 'default',
}))

const isRuleset = (value: unknown): value is Ruleset => {
  if (!value || typeof value !== 'object') return false

  const ruleset = value as Partial<Ruleset>
  const stagesAreValid =
    Array.isArray(ruleset.stages) &&
    ruleset.stages.every(
      (stage) =>
        stage &&
        typeof stage.id === 'string' &&
        typeof stage.name === 'string' &&
        stageTypes.includes(stage.type),
    )
  const sourceIsValid =
    ruleset.source === undefined || sources.includes(ruleset.source)

  return (
    typeof ruleset.id === 'string' &&
    typeof ruleset.name === 'string' &&
    typeof ruleset.community === 'string' &&
    typeof ruleset.description === 'string' &&
    accents.includes(ruleset.accent as RulesetAccent) &&
    sourceIsValid &&
    stagesAreValid &&
    !!ruleset.gameOneFlow &&
    ruleset.gameOneFlow.enabledStages === 'startersOnly' &&
    typeof ruleset.gameOneFlow.firstBanCount === 'number' &&
    typeof ruleset.gameOneFlow.secondBanCount === 'number' &&
    pickerRules.includes(ruleset.gameOneFlow.pickerRule) &&
    !!ruleset.laterGamesFlow &&
    typeof ruleset.laterGamesFlow.winnerBanCount === 'number' &&
    typeof ruleset.laterGamesFlow.loserPicks === 'boolean' &&
    typeof ruleset.laterGamesFlow.counterpicksUnlocked === 'boolean'
  )
}

const isRulesetArray = (value: unknown): value is Ruleset[] =>
  Array.isArray(value) && value.every(isRuleset)

const normalizeCustomRuleset = (ruleset: Ruleset): Ruleset => ({
  ...ruleset,
  source: 'custom',
})

export function useRulesets() {
  const [storedCustomRulesets, setCustomRulesets] = useLocalStorage<Ruleset[]>(
    CUSTOM_RULESETS_STORAGE_KEY,
    emptyRulesets,
    { validate: isRulesetArray },
  )
  const customRulesets = useMemo(
    () => storedCustomRulesets.map(normalizeCustomRuleset),
    [storedCustomRulesets],
  )

  const rulesets = useMemo(() => {
    const combinedRulesets = new Map(
      defaultRulesets.map((ruleset) => [ruleset.id, ruleset]),
    )

    customRulesets.forEach((ruleset) => {
      if (!combinedRulesets.has(ruleset.id)) {
        combinedRulesets.set(ruleset.id, ruleset)
      }
    })

    return Array.from(combinedRulesets.values())
  }, [customRulesets])

  const addRuleset = useCallback(
    (input: RulesetInput) => {
      const now = new Date().toISOString()
      let id = createId('ruleset')

      while (
        defaultRulesets.some((ruleset) => ruleset.id === id) ||
        storedCustomRulesets.some((ruleset) => ruleset.id === id)
      ) {
        id = createId('ruleset')
      }

      const ruleset: Ruleset = {
        ...input,
        id,
        source: 'custom',
        createdAt: now,
        updatedAt: now,
      }

      setCustomRulesets((currentRulesets) => [...currentRulesets, ruleset])
      return ruleset
    },
    [setCustomRulesets, storedCustomRulesets],
  )

  const updateRuleset = useCallback(
    (rulesetId: string, input: RulesetInput) => {
      const currentRuleset = storedCustomRulesets.find(
        (ruleset) => ruleset.id === rulesetId,
      )

      if (!currentRuleset) return undefined

      const updatedRuleset: Ruleset = {
        ...input,
        id: currentRuleset.id,
        source: 'custom',
        createdAt: currentRuleset.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setCustomRulesets((currentRulesets) =>
        currentRulesets.map((ruleset) =>
          ruleset.id === rulesetId ? updatedRuleset : ruleset,
        ),
      )
      return updatedRuleset
    },
    [setCustomRulesets, storedCustomRulesets],
  )

  const deleteRuleset = useCallback(
    (rulesetId: string) => {
      const canDelete = storedCustomRulesets.some(
        (ruleset) => ruleset.id === rulesetId,
      )

      if (!canDelete) return false

      setCustomRulesets((currentRulesets) =>
        currentRulesets.filter((ruleset) => ruleset.id !== rulesetId),
      )
      return true
    },
    [setCustomRulesets, storedCustomRulesets],
  )

  const getRulesetById = useCallback(
    (rulesetId: string) =>
      rulesets.find((ruleset) => ruleset.id === rulesetId),
    [rulesets],
  )

  return {
    addRuleset,
    customRulesets,
    defaultRulesets,
    deleteRuleset,
    getRulesetById,
    rulesets,
    updateRuleset,
  }
}
