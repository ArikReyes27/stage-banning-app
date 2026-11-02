import type { Tournament } from '../types/tournament.ts'
import { createTournament } from './doubleElimination.ts'
import { exportTournament, parseTournament } from './tournamentValidation.ts'

export const TOURNAMENT_STORAGE_KEY = 'stage-strike.top8.v1'
export type TournamentStorage = Pick<Storage, 'getItem' | 'setItem'>

export function loadTournament(storage: TournamentStorage): { tournament: Tournament; error?: string } {
  try {
    const raw = storage.getItem(TOURNAMENT_STORAGE_KEY)
    return { tournament: raw === null ? createTournament() : parseTournament(raw) }
  } catch {
    return { tournament: createTournament(), error: 'No se pudo recuperar el torneo local. El dato guardado no se ha sobrescrito. Puedes importar un respaldo JSON.' }
  }
}

export function saveTournament(storage: TournamentStorage, tournament: Tournament): void {
  storage.setItem(TOURNAMENT_STORAGE_KEY, exportTournament(tournament))
}
