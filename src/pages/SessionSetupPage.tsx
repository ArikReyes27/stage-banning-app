import { useState } from 'react'
import { navigateTo } from '../app/navigation'
import { GameHistory } from '../components/session/GameHistory'
import { GameResultPanel } from '../components/session/GameResultPanel'
import { PlayerSetupPanel } from '../components/session/PlayerSetupPanel'
import { RpsPanel } from '../components/session/RpsPanel'
import { SelectedStageSummary } from '../components/session/SelectedStageSummary'
import { SessionHeader } from '../components/session/SessionHeader'
import { SessionStageGrid } from '../components/session/SessionStageGrid'
import { SetCompletePanel } from '../components/session/SetCompletePanel'
import { SetScoreboard } from '../components/session/SetScoreboard'
import { TurnInstructionCard } from '../components/session/TurnInstructionCard'
import { Icon } from '../components/ui/Icon'
import {
  useBanSession,
  type PlayerId,
  type SetFormat,
} from '../hooks/useBanSession'
import { useRulesets } from '../hooks/useRulesets'
import type { Ruleset, Stage } from '../types/ruleset'
import { getPlayerName } from '../utils/sessionFlow'

type SessionSetupPageProps = {
  rulesetId: string
}

export function SessionSetupPage({ rulesetId }: SessionSetupPageProps) {
  const { getRulesetById } = useRulesets()
  const ruleset = getRulesetById(rulesetId)

  if (!ruleset) {
    return <MissingRuleset />
  }

  return <GuidedSession ruleset={ruleset} />
}

function GuidedSession({ ruleset }: { ruleset: Ruleset }) {
  const [player1Name, setPlayer1Name] = useState('Player 1')
  const [player2Name, setPlayer2Name] = useState('Player 2')
  const [format, setFormat] = useState<SetFormat>('BO3')
  const session = useBanSession(ruleset, format)
  const starters = ruleset.stages.filter((stage) => stage.type === 'starter')
  const counterpicks = ruleset.stages.filter(
    (stage) => stage.type === 'counterpick',
  )
  const selectedStage = ruleset.stages.find(
    (stage) => stage.id === session.selectedStageId,
  )
  const currentActorName = getPlayerName(
    session.currentActorId,
    player1Name,
    player2Name,
  )
  const rpsWinnerName = getPlayerName(
    session.rpsWinnerId,
    player1Name,
    player2Name,
  )
  const setWinnerName = getPlayerName(
    session.setWinnerId,
    player1Name,
    player2Name,
  )
  const safePlayer1Name = player1Name.trim() || 'Player 1'
  const safePlayer2Name = player2Name.trim() || 'Player 2'
  const setupLocked =
    session.phase !== 'rps' ||
    session.currentGame > 1 ||
    session.gameHistory.length > 0
  const showStageBoard =
    session.phase === 'rps' ||
    session.phase === 'ban' ||
    session.phase === 'pick'

  const isStageInteractive = (stage: Stage) =>
    session.getStageState(stage) === 'available'

  const reportWinner = (winnerId: PlayerId) => {
    if (!selectedStage) return

    const winnerName =
      winnerId === 'player1' ? safePlayer1Name : safePlayer2Name
    session.reportGameWinner(winnerId, winnerName, selectedStage)
  }

  const resetCurrentGame = () => {
    const confirmed = window.confirm(
      `¿Reiniciar Game ${session.currentGame}? Se perderán los bans y el stage elegido de este game.`,
    )

    if (confirmed) session.resetCurrentGame()
  }

  const resetSet = () => {
    if (!setupLocked) {
      session.resetSet()
      return
    }

    const confirmed = window.confirm(
      '¿Reiniciar el set completo? Se perderán marcador, historial y progreso.',
    )

    if (confirmed) session.resetSet()
  }

  if (session.phase === 'set-complete' && setWinnerName) {
    return (
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <BackToRulesetButton rulesetId={ruleset.id} />
        <div className="mt-5">
          <SetCompletePanel
            currentGame={session.currentGame}
            format={format}
            history={session.gameHistory}
            onResetSet={resetSet}
            player1Name={safePlayer1Name}
            player2Name={safePlayer2Name}
            rulesetId={ruleset.id}
            score={session.score}
            winnerName={setWinnerName}
          />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <BackToRulesetButton rulesetId={ruleset.id} />

      <div className="mt-5 space-y-5">
        {!setupLocked && (
          <PlayerSetupPanel
            format={format}
            onFormatChange={setFormat}
            onPlayer1NameChange={setPlayer1Name}
            onPlayer2NameChange={setPlayer2Name}
            player1Name={player1Name}
            player2Name={player2Name}
          />
        )}

        <SessionHeader
          currentActorName={currentActorName}
          currentGame={session.currentGame}
          format={format}
          phase={session.phase}
          player1Name={safePlayer1Name}
          player2Name={safePlayer2Name}
          rpsWinnerName={rpsWinnerName}
          rulesetName={ruleset.name}
        />

        <SetScoreboard
          currentGame={session.currentGame}
          format={format}
          player1Name={safePlayer1Name}
          player2Name={safePlayer2Name}
          score={session.score}
        />

        {session.phase === 'rps' && (
          <RpsPanel
            onWinnerSelect={session.chooseRpsWinner}
            player1Name={safePlayer1Name}
            player2Name={safePlayer2Name}
          />
        )}

        <TurnInstructionCard
          actorName={currentActorName}
          banStep={session.currentBanStepIndex + 1}
          currentGame={session.currentGame}
          phase={session.phase}
          remainingBans={session.remainingBansInStep}
          rpsWinnerName={rpsWinnerName}
        />

        {showStageBoard && (
          <section className="glass-panel space-y-9 rounded-[2rem] p-4 sm:p-7">
            <SessionStageGrid
              eyebrow={
                session.phase === 'rps'
                  ? 'Bloqueados hasta resolver RPS'
                  : `Disponibles para Game ${session.currentGame}`
              }
              getState={session.getStageState}
              isStageInteractive={isStageInteractive}
              onStageClick={session.interactWithStage}
              stages={starters}
              title="Starter stages"
              tone="cyan"
            />
            <SessionStageGrid
              eyebrow={
                session.counterpicksUnlocked
                  ? `Desbloqueados para Game ${session.currentGame}`
                  : 'Visibles · bloqueados durante Game 1'
              }
              getState={session.getStageState}
              isStageInteractive={isStageInteractive}
              onStageClick={session.interactWithStage}
              stages={counterpicks}
              title="Counterpicks"
              tone="violet"
            />
          </section>
        )}

        {selectedStage && session.phase === 'stage-confirmed' && (
          <SelectedStageSummary
            currentGame={session.currentGame}
            onConfirm={session.confirmSelectedStage}
            onResetGame={resetCurrentGame}
            stage={selectedStage}
          />
        )}

        {selectedStage && session.phase === 'game-result' && (
          <GameResultPanel
            currentGame={session.currentGame}
            onReportWinner={reportWinner}
            onResetGame={resetCurrentGame}
            player1Name={safePlayer1Name}
            player2Name={safePlayer2Name}
            stage={selectedStage}
          />
        )}

        <GameHistory history={session.gameHistory} />

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {session.phase !== 'rps' && session.phase !== 'game-result' && (
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-xs font-black text-slate-400 transition hover:bg-white/6 hover:text-white"
              onClick={resetCurrentGame}
              type="button"
            >
              <Icon name="back" className="h-3.5 w-3.5" />
              Reiniciar game actual
            </button>
          )}
          <button
            className="focus-ring flex items-center justify-center gap-2 rounded-xl border border-rose-300/15 bg-rose-300/7 px-4 py-3 text-xs font-black text-rose-200 transition hover:bg-rose-300/12"
            onClick={resetSet}
            type="button"
          >
            <Icon name="trash" className="h-3.5 w-3.5" />
            Reiniciar set completo
          </button>
        </div>
      </div>
    </main>
  )
}

function BackToRulesetButton({ rulesetId }: { rulesetId: string }) {
  return (
    <button
      className="focus-ring flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white"
      onClick={() => navigateTo(`/rulesets/${rulesetId}`)}
      type="button"
    >
      <Icon name="back" className="h-4 w-4" />
      Volver al detalle
    </button>
  )
}

function MissingRuleset() {
  return (
    <main className="mx-auto grid min-h-[72vh] max-w-4xl place-items-center px-4 py-16 text-center sm:px-6">
      <div>
        <Icon name="warning" className="mx-auto h-10 w-10 text-amber-300" />
        <h1 className="mt-5 text-3xl font-black text-white">
          Ruleset no encontrado
        </h1>
        <button
          className="focus-ring mt-7 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950"
          onClick={() => navigateTo('/')}
          type="button"
        >
          Ir a la Home
        </button>
      </div>
    </main>
  )
}
