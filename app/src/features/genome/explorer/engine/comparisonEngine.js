import { getModelById, calculateDnaSimilarity } from './genomeEngine'

/**
 * Comparison Engine — Side-by-side multi-species DNA comparison & matrix metrics
 */

export function compareSpeciesList(modelIds = []) {
  const models = modelIds.map((id) => getModelById(id)).filter(Boolean)

  if (models.length === 0) return null

  // Pairwise alignment matrix
  const matrix = []
  for (let i = 0; i < models.length; i++) {
    const row = []
    for (let j = 0; j < models.length; j++) {
      row.push(calculateDnaSimilarity(models[i], models[j]))
    }
    matrix.push(row)
  }

  // Trait Comparison Keys
  const traitKeys = [
    { key: 'bias', label: 'Bias Level (Lower is better)' },
    { key: 'variance', label: 'Variance Level (Lower is better)' },
    { key: 'generalization', label: 'Generalization Score' },
    { key: 'interpretability', label: 'Interpretability' },
    { key: 'speed', label: 'Inference Speed' },
    { key: 'memoryEfficiency', label: 'Memory Efficiency' },
    { key: 'parallelization', label: 'GPU Parallelization' },
    { key: 'noiseTolerance', label: 'Noise Tolerance' },
    { key: 'trainingStability', label: 'Training Stability' },
  ]

  return {
    models,
    matrix,
    traitKeys,
  }
}
