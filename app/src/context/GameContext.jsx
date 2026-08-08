import { createContext, useContext } from 'react'
import { useProgress } from '../hooks/useProgress'
import { useVoice } from '../hooks/useVoice'
import { useAuth } from './AuthContext'

export const GameContext = createContext(null)

export function GameProvider({ children }) {
  const { user } = useAuth()
  const progressApi = useProgress(user?.id)
  const voice = useVoice()
  const value = { ...progressApi, ...voice }
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be inside GameProvider')
  return ctx
}
