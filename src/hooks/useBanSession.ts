import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Ruleset, Stage } from '../types/ruleset'
import { getFirstTo } from '../utils/sessionFlow'

export type PlayerId = 'player1' | 'player2'
export type SessionPhase =
  | 'rps'
  | 'ban'
  | 'pick'
  | 'stage-confirmed'
  | 'game-result'
  | 'set-complete'
export type SetFormat = 'BO3' | 'BO5'
export type SessionStageState = 'available' | 'banned' | 'selected' | 'locked'

export type GameHistoryEntry = {
  bannedStageIds: string[]
  gameNumber: number
  selectedStageId: string
  selectedStageName: string
  winnerId: PlayerId
  winnerName: string
}

type BanStep = {
  actorId: PlayerId
  count: number
}

const getOtherPlayer = (playerId: PlayerId): PlayerId =>
  playerId === 'player1' ? 'player2' : 'player1'

const getGameOnePickerId = (
  ruleset: Ruleset,
  rpsWinnerId: PlayerId,
): PlayerId => {
  if (ruleset.gameOneFlow.pickerRule === 'player1') return 'player1'
  if (ruleset.gameOneFlow.pickerRule === 'player2') return 'player2'
  if (ruleset.gameOneFlow.pickerRule === 'rpsLoser') {
    return getOtherPlayer(rpsWinnerId)
  }

  return rpsWinnerId
}

const createGameOneBanSteps = (
  ruleset: Ruleset,
  rpsWinnerId: PlayerId,
): BanStep[] => [
  {
    actorId: rpsWinnerId,
    count: ruleset.gameOneFlow.firstBanCount,
  },
  {
    actorId: getOtherPlayer(rpsWinnerId),
    count: ruleset.gameOneFlow.secondBanCount,
  },
]

export function useBanSession(ruleset: Ruleset, format: SetFormat) {
  const resultReportingRef = useRef(false)
  const [phase, setPhase] = useState<SessionPhase>('rps')
  const [currentGame, setCurrentGame] = useState(1)
  const [rpsWinnerId, setRpsWinnerId] = useState<PlayerId>()
  const [previousGameWinnerId, setPreviousGameWinnerId] = useState<PlayerId>()
  const [currentPickerId, setCurrentPickerId] = useState<PlayerId>()
  const [banSteps, setBanSteps] = useState<BanStep[]>([])
  const [currentBanStepIndex, setCurrentBanStepIndex] = useState(0)
  const [remainingBansInStep, setRemainingBansInStep] = useState(0)
  const [bannedStageIds, setBannedStageIds] = useState<string[]>([])
  const [selectedStageId, setSelectedStageId] = useState<string>()
  const [score, setScore] = useState<Record<PlayerId, number>>({
    player1: 0,
    player2: 0,
  })
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([])
  const [setWinnerId, setSetWinnerId] = useState<PlayerId>()
  const targetWins = getFirstTo(format)

  const currentActorId =
    phase === 'ban'
      ? banSteps[currentBanStepIndex]?.actorId
      : phase === 'pick'
        ? currentPickerId
        : undefined
  const counterpicksUnlocked =
    currentGame > 1 && ruleset.laterGamesFlow.counterpicksUnlocked

  useEffect(() => {
    resultReportingRef.current = false
  }, [currentGame])

  const beginBanSteps = useCallback((steps: BanStep[], pickerId: PlayerId) => {
    const firstBanStepIndex = steps.findIndex((step) => step.count > 0)

    setBanSteps(steps)
    setCurrentPickerId(pickerId)
    setCurrentBanStepIndex(firstBanStepIndex === -1 ? 0 : firstBanStepIndex)
    setRemainingBansInStep(
      firstBanStepIndex === -1 ? 0 : steps[firstBanStepIndex].count,
    )
    setPhase(firstBanStepIndex === -1 ? 'pick' : 'ban')
  }, [])

  const beginLaterGame = useCallback(
    (previousWinnerId: PlayerId) => {
      const previousLoserId = getOtherPlayer(previousWinnerId)
      const pickerId = ruleset.laterGamesFlow.loserPicks
        ? previousLoserId
        : previousWinnerId
      const winnerBanCount = ruleset.laterGamesFlow.winnerBanCount ?? 2

      beginBanSteps(
        [{ actorId: previousWinnerId, count: winnerBanCount }],
        pickerId,
      )
    },
    [beginBanSteps, ruleset],
  )

  const chooseRpsWinner = useCallback(
    (winnerId: PlayerId) => {
      setRpsWinnerId(winnerId)
      setBannedStageIds([])
      setSelectedStageId(undefined)
      beginBanSteps(
        createGameOneBanSteps(ruleset, winnerId),
        getGameOnePickerId(ruleset, winnerId),
      )
    },
    [beginBanSteps, ruleset],
  )

  const getStageState = useCallback(
    (stage: Stage): SessionStageState => {
      if (stage.type === 'counterpick' && !counterpicksUnlocked) return 'locked'
      if (selectedStageId === stage.id) return 'selected'
      if (bannedStageIds.includes(stage.id)) return 'banned'
      if (phase !== 'ban' && phase !== 'pick') return 'locked'
      return 'available'
    },
    [bannedStageIds, counterpicksUnlocked, phase, selectedStageId],
  )

  const interactWithStage = useCallback(
    (stage: Stage) => {
      if (getStageState(stage) !== 'available') return

      if (phase === 'pick') {
        setSelectedStageId(stage.id)
        setPhase('stage-confirmed')
        return
      }

      if (phase !== 'ban') return

      setBannedStageIds((currentIds) => [...currentIds, stage.id])

      if (remainingBansInStep > 1) {
        setRemainingBansInStep((currentCount) => currentCount - 1)
        return
      }

      const nextBanStepIndex = banSteps.findIndex(
        (step, index) => index > currentBanStepIndex && step.count > 0,
      )

      if (nextBanStepIndex === -1) {
        setPhase('pick')
        setRemainingBansInStep(0)
        return
      }

      setCurrentBanStepIndex(nextBanStepIndex)
      setRemainingBansInStep(banSteps[nextBanStepIndex].count)
    },
    [
      banSteps,
      currentBanStepIndex,
      getStageState,
      phase,
      remainingBansInStep,
    ],
  )

  const confirmSelectedStage = useCallback(() => {
    if (selectedStageId && phase === 'stage-confirmed') {
      setPhase('game-result')
    }
  }, [phase, selectedStageId])

  const reportGameWinner = useCallback(
    (winnerId: PlayerId, winnerName: string, selectedStage: Stage) => {
      if (phase !== 'game-result' || selectedStage.id !== selectedStageId) {
        return
      }
      if (resultReportingRef.current) return

      resultReportingRef.current = true

      const nextWinnerScore = score[winnerId] + 1
      const nextHistoryEntry: GameHistoryEntry = {
        bannedStageIds: [...bannedStageIds],
        gameNumber: currentGame,
        selectedStageId: selectedStage.id,
        selectedStageName: selectedStage.name,
        winnerId,
        winnerName,
      }

      setScore((currentScore) => ({
        ...currentScore,
        [winnerId]: nextWinnerScore,
      }))
      setGameHistory((currentHistory) => [
        ...currentHistory,
        nextHistoryEntry,
      ])
      setPreviousGameWinnerId(winnerId)

      if (nextWinnerScore >= targetWins) {
        setSetWinnerId(winnerId)
        setPhase('set-complete')
        return
      }

      setCurrentGame((game) => game + 1)
      setBannedStageIds([])
      setSelectedStageId(undefined)
      beginLaterGame(winnerId)
    },
    [
      bannedStageIds,
      beginLaterGame,
      currentGame,
      phase,
      score,
      selectedStageId,
      targetWins,
    ],
  )

  const resetCurrentGame = useCallback(() => {
    resultReportingRef.current = false
    setBannedStageIds([])
    setSelectedStageId(undefined)

    if (currentGame === 1) {
      setRpsWinnerId(undefined)
      setCurrentPickerId(undefined)
      setBanSteps([])
      setCurrentBanStepIndex(0)
      setRemainingBansInStep(0)
      setPhase('rps')
      return
    }

    if (previousGameWinnerId) {
      beginLaterGame(previousGameWinnerId)
    }
  }, [beginLaterGame, currentGame, previousGameWinnerId])

  const resetSet = useCallback(() => {
    resultReportingRef.current = false
    setPhase('rps')
    setCurrentGame(1)
    setRpsWinnerId(undefined)
    setPreviousGameWinnerId(undefined)
    setCurrentPickerId(undefined)
    setBanSteps([])
    setCurrentBanStepIndex(0)
    setRemainingBansInStep(0)
    setBannedStageIds([])
    setSelectedStageId(undefined)
    setScore({ player1: 0, player2: 0 })
    setGameHistory([])
    setSetWinnerId(undefined)
  }, [])

  return useMemo(
    () => ({
      bannedStageIds,
      banSteps,
      confirmSelectedStage,
      counterpicksUnlocked,
      currentActorId,
      currentBanStepIndex,
      currentGame,
      currentPickerId,
      gameHistory,
      getStageState,
      interactWithStage,
      phase,
      previousGameWinnerId,
      remainingBansInStep,
      reportGameWinner,
      resetCurrentGame,
      resetSet,
      rpsWinnerId,
      score,
      selectedStageId,
      setWinnerId,
      targetWins,
      chooseRpsWinner,
    }),
    [
      bannedStageIds,
      banSteps,
      confirmSelectedStage,
      counterpicksUnlocked,
      currentActorId,
      currentBanStepIndex,
      currentGame,
      currentPickerId,
      gameHistory,
      getStageState,
      interactWithStage,
      phase,
      previousGameWinnerId,
      remainingBansInStep,
      reportGameWinner,
      resetCurrentGame,
      resetSet,
      rpsWinnerId,
      score,
      selectedStageId,
      setWinnerId,
      targetWins,
      chooseRpsWinner,
    ],
  )
}
