import { useMemo } from 'react'
import { useGame } from '../../../context/GameContext'
import { calculateNeuralGenome } from '../engine/genomeCalculationEngine'

/**
 * useNeuralGenome Custom Hook
 * Connects the live GameContext progress to the Neural Genome calculation engine.
 */
export function useNeuralGenome() {
  const { progress } = useGame()

  const genomeData = useMemo(() => {
    return calculateNeuralGenome(progress)
  }, [progress])

  return {
    progress,
    ...genomeData
  }
}
