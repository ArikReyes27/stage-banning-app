import { createContext, useContext } from 'react'
import type { TournamentStorage } from '../utils/tournamentStorage'
export const WorkspaceContext = createContext<{ storage: TournamentStorage; key: string; name: string } | null>(null)
export const useWorkspace = () => useContext(WorkspaceContext)
