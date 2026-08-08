import { createContext, useContext } from 'react'
import { useProgress } from '../hooks/useProgress'
import { useVoice } from '../hooks/useVoice'

export const GameContext = createContext(null)

export function GameProvider({ children }) {
  const progressApi = useProgress()
  const voice = useVoice()
  const value = { ...progressApi, ...voice }
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be inside GameProvider')
  return ctx
}
