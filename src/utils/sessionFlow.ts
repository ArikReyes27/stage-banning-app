import type { PlayerId, SetFormat } from '../hooks/useBanSession'

export const getFormatLabel = (format: SetFormat) =>
  format === 'BO3' ? 'Best of 3' : 'Best of 5'

export const getFirstTo = (format: SetFormat) => (format === 'BO3' ? 2 : 3)

export const getPlayerName = (
  playerId: PlayerId | undefined,
  player1Name: string,
  player2Name: string,
) => {
  if (playerId === 'player1') return player1Name.trim() || 'Player 1'
  if (playerId === 'player2') return player2Name.trim() || 'Player 2'
  return undefined
}
