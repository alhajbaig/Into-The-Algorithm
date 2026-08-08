import { useState, useMemo } from 'react'
import {
  getAllModels,
  getModelById,
  filterModels,
  getModelFamilies,
  getEcosystems,
} from '../engine/genomeEngine'
import { calculateMutationDrift } from '../engine/mutationLabEngine'
import { compareSpeciesList } from '../engine/comparisonEngine'
import { getChronologicalTimeline } from '../engine/timelineEngine'
import { EVOLUTION_TRAJECTORIES } from '../engine/evolutionSimulatorEngine'
import { generateSpeciesAnswers } from '../engine/aiExplanationEngine'
import { getQuestGenomeSynergy } from '../engine/integrationEngine'

/**
 * Custom Hook — Governs Model Genome Explorer state & reactive engines
 */
export function useModelGenome(clearedLevels = []) {
  const [activeTab, setActiveTab] = useState('tree') // 'tree' | 'inspector' | 'mutation' | 'simulator' | 'comparison' | 'timeline' | 'ecosystem'
  const [selectedModelId, setSelectedModelId] = useState('random-forest')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFamily, setSelectedFamily] = useState('all')
  const [selectedEcosystem, setSelectedEcosystem] = useState('all')
  const [comparisonIds, setComparisonIds] = useState(['decision-tree', 'random-forest', 'xgboost'])
  const [activeTrajectoryId, setActiveTrajectoryId] = useState('tree-lineage')
  const [activeSimulatorStep, setActiveSimulatorStep] = useState(0)

  // Hyperparameters for Mutation Lab
  const [mutationParams, setMutationParams] = useState({
    maxDepth: 6,
    nEstimators: 100,
    learningRate: 0.05,
    regularization: 1.0,
    activation: 'relu',
    optimizer: 'adam',
  })

  const selectedModel = useMemo(() => getModelById(selectedModelId), [selectedModelId])
  const filteredModelsList = useMemo(
    () => filterModels(searchQuery, selectedFamily, selectedEcosystem),
    [searchQuery, selectedFamily, selectedEcosystem]
  )

  const families = useMemo(() => getModelFamilies(), [])
  const ecosystems = useMemo(() => getEcosystems(), [])

  const mutationResult = useMemo(
    () => calculateMutationDrift(selectedModelId, mutationParams),
    [selectedModelId, mutationParams]
  )

  const comparisonResult = useMemo(
    () => compareSpeciesList(comparisonIds),
    [comparisonIds]
  )

  const timelineData = useMemo(() => getChronologicalTimeline(), [])

  const aiQnA = useMemo(() => generateSpeciesAnswers(selectedModelId), [selectedModelId])

  const synergy = useMemo(() => getQuestGenomeSynergy(clearedLevels), [clearedLevels])

  const currentTrajectory = useMemo(
    () => EVOLUTION_TRAJECTORIES.find((t) => t.id === activeTrajectoryId) || EVOLUTION_TRAJECTORIES[0],
    [activeTrajectoryId]
  )

  const toggleComparisonModel = (id) => {
    setComparisonIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev // keep at least 2 models
        return prev.filter((m) => m !== id)
      } else {
        if (prev.length >= 4) return [...prev.slice(1), id]
        return [...prev, id]
      }
    })
  }

  return {
    activeTab,
    setActiveTab,
    selectedModel,
    setSelectedModelId,
    searchQuery,
    setSearchQuery,
    selectedFamily,
    setSelectedFamily,
    selectedEcosystem,
    setSelectedEcosystem,
    filteredModelsList,
    families,
    ecosystems,
    mutationParams,
    setMutationParams,
    mutationResult,
    comparisonIds,
    toggleComparisonModel,
    comparisonResult,
    timelineData,
    aiQnA,
    synergy,
    activeTrajectoryId,
    setActiveTrajectoryId,
    activeSimulatorStep,
    setActiveSimulatorStep,
    currentTrajectory,
  }
}
