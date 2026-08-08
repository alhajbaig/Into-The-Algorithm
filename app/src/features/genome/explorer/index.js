/**
 * Model Genome Explorer Feature Export Module
 * Everything remains inside Model Genome Explorer/ folder and exports cleanly.
 */

export { default as ModelGenomeExplorerView } from './components/ModelGenomeExplorerView'
export { useModelGenome } from './hooks/useModelGenome'
export { GENOME_DATABASE } from './engine/genomeDatabase'
export {
  getAllModels,
  getModelById,
  filterModels,
  calculateDnaSimilarity,
  getRadarTraitMetrics,
} from './engine/genomeEngine'
export { buildEvolutionTreeLayout } from './engine/evolutionTreeEngine'
export { EVOLUTION_TRAJECTORIES } from './engine/evolutionSimulatorEngine'
export { calculateMutationDrift } from './engine/mutationLabEngine'
export { compareSpeciesList } from './engine/comparisonEngine'
export { getChronologicalTimeline } from './engine/timelineEngine'
export { generateSpeciesAnswers } from './engine/aiExplanationEngine'
export { getQuestGenomeSynergy } from './engine/integrationEngine'
