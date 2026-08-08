import { GENOME_DATABASE } from './genomeDatabase'

/**
 * Model Genome Engine — Trait calculations, DNA alignments, & filtering
 */

export function getAllModels() {
  return GENOME_DATABASE
}

export function getModelById(id) {
  return GENOME_DATABASE.find((m) => m.id === id) || GENOME_DATABASE[0]
}

export function filterModels(searchQuery = '', family = 'all', ecosystem = 'all') {
  return GENOME_DATABASE.filter((model) => {
    const matchesQuery =
      !searchQuery.trim() ||
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.speciesCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.algorithmType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFamily = family === 'all' || model.family === family
    const matchesEcosystem = ecosystem === 'all' || model.ecosystem.toLowerCase().includes(ecosystem.toLowerCase())

    return matchesQuery && matchesFamily && matchesEcosystem
  })
}

/**
 * Calculates DNA Genetic Similarity Score (0 - 100%) between two ML models
 */
export function calculateDnaSimilarity(modelA, modelB) {
  if (!modelA || !modelB) return 0
  if (modelA.id === modelB.id) return 100

  let score = 0

  // 1. Family Match (25 points)
  if (modelA.family === modelB.family) score += 25

  // 2. Learning Paradigm Match (15 points)
  if (modelA.learningParadigm === modelB.learningParadigm) score += 15

  // 3. Lineage / Ancestor Connection (20 points)
  if (
    modelA.ancestors.includes(modelB.id) ||
    modelB.ancestors.includes(modelA.id) ||
    modelA.descendants.includes(modelB.id) ||
    modelB.descendants.includes(modelA.id)
  ) {
    score += 20
  }

  // 4. Genetic Traits Vector Distance (40 points)
  const traitKeys = Object.keys(modelA.traits || {})
  if (traitKeys.length > 0) {
    let traitDiffSum = 0
    traitKeys.forEach((key) => {
      const valA = modelA.traits[key] || 50
      const valB = modelB.traits[key] || 50
      traitDiffSum += Math.abs(valA - valB)
    })
    const avgDiff = traitDiffSum / traitKeys.length
    const traitSim = Math.max(0, 100 - avgDiff)
    score += (traitSim / 100) * 40
  }

  return Math.round(Math.min(100, Math.max(0, score)))
}

/**
 * Converts model traits to array of normalized radar metrics
 */
export function getRadarTraitMetrics(model) {
  if (!model || !model.traits) return []
  const t = model.traits
  return [
    { label: 'Low Bias', value: 100 - t.bias },
    { label: 'Low Variance', value: 100 - t.variance },
    { label: 'Generalization', value: t.generalization },
    { label: 'Interpretability', value: t.interpretability },
    { label: 'Inference Speed', value: t.speed },
    { label: 'Memory Efficiency', value: t.memoryEfficiency },
    { label: 'Parallelization', value: t.parallelization },
    { label: 'Noise Tolerance', value: t.noiseTolerance },
    { label: 'Training Stability', value: t.trainingStability },
  ]
}

/**
 * Gets unique model families in database
 */
export function getModelFamilies() {
  const set = new Set(GENOME_DATABASE.map((m) => m.family))
  return ['all', ...Array.from(set)]
}

/**
 * Gets unique ecosystems in database
 */
export function getEcosystems() {
  return [
    'all',
    'Tabular Analytics',
    'Binary Classification',
    'Computer Vision',
    'Sequential',
    'Attention & LLM',
  ]
}
