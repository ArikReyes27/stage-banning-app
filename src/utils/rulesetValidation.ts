import { getStageIdentity } from '../data/stageCatalog'
import type { RulesetInput, Stage } from '../types/ruleset'

export type RulesetValidation = {
  errors: string[]
  warnings: string[]
}

const findDuplicateStageNames = (stages: Stage[]) => {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  stages.forEach((stage) => {
    const identity = getStageIdentity(stage)

    if (seen.has(identity)) {
      duplicates.add(stage.name.trim())
    }

    seen.add(identity)
  })

  return Array.from(duplicates)
}

export const validateRuleset = (ruleset: RulesetInput): RulesetValidation => {
  const errors: string[] = []
  const warnings: string[] = []
  const starters = ruleset.stages.filter((stage) => stage.type === 'starter')
  const counterpicks = ruleset.stages.filter(
    (stage) => stage.type === 'counterpick',
  )
  const emptyStages = ruleset.stages.filter((stage) => !stage.name.trim())
  const duplicateStages = findDuplicateStageNames(ruleset.stages)
  const firstBanCount = ruleset.gameOneFlow.firstBanCount
  const secondBanCount = ruleset.gameOneFlow.secondBanCount
  const winnerBanCount = ruleset.laterGamesFlow.winnerBanCount

  if (!ruleset.name.trim()) errors.push('El nombre del ruleset es obligatorio.')
  if (!ruleset.community.trim()) errors.push('La comunidad es obligatoria.')
  if (emptyStages.length > 0) errors.push('No puede haber stages sin nombre.')
  if (starters.length < 3) errors.push('Agrega al menos 3 starter stages.')

  if (duplicateStages.length > 0) {
    errors.push(`Hay stages duplicados: ${duplicateStages.join(', ')}.`)
  }

  if (!Number.isInteger(firstBanCount) || firstBanCount < 0) {
    errors.push('Los bans del primer jugador deben ser un entero no negativo.')
  }

  if (!Number.isInteger(secondBanCount) || secondBanCount < 0) {
    errors.push('Los bans del segundo jugador deben ser un entero no negativo.')
  }

  if (firstBanCount > starters.length || secondBanCount > starters.length) {
    errors.push('Los bans de Game 1 no pueden superar el número de starters.')
  }

  if (firstBanCount + secondBanCount >= starters.length) {
    errors.push('Los bans de Game 1 deben dejar al menos un starter disponible.')
  }

  if (!Number.isInteger(winnerBanCount) || winnerBanCount < 0) {
    errors.push('Los bans de Game 2+ deben ser un entero no negativo.')
  }

  const laterGameStageCount =
    starters.length +
    (ruleset.laterGamesFlow.counterpicksUnlocked ? counterpicks.length : 0)

  if (winnerBanCount >= laterGameStageCount) {
    errors.push('Los bans de Game 2+ deben dejar al menos un stage disponible.')
  }

  if (starters.length >= 3 && starters.length < 5) {
    warnings.push(
      'Este ruleset tiene menos de 5 starters. Es válido, pero el pool será reducido.',
    )
  }

  if (counterpicks.length === 0) {
    warnings.push('Sin counterpicks, Game 2+ no tendrá stages extra.')
  }

  if (
    counterpicks.length > 0 &&
    !ruleset.laterGamesFlow.counterpicksUnlocked
  ) {
    warnings.push('Los counterpicks existen, pero no se desbloquearán en Game 2+.')
  }

  return { errors, warnings }
}
