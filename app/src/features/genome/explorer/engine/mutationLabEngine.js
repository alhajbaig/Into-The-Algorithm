import { getModelById } from './genomeEngine'

/**
 * Mutation Lab Engine — Calculates hyperparameter genetic mutations & DNA trait drift
 */

export function calculateMutationDrift(modelId, hyperparams) {
  const baseModel = getModelById(modelId)
  const baseTraits = { ...baseModel.traits }

  const {
    maxDepth = 6,
    nEstimators = 100,
    learningRate = 0.05,
    regularization = 1.0,
    activation = 'relu',
    optimizer = 'adam',
  } = hyperparams

  const mutatedTraits = { ...baseTraits }

  // 1. Effect of Tree Depth / Layer Depth
  if (maxDepth > 10) {
    mutatedTraits.bias = Math.max(2, baseTraits.bias - (maxDepth - 10) * 2)
    mutatedTraits.variance = Math.min(98, baseTraits.variance + (maxDepth - 10) * 4)
    mutatedTraits.interpretability = Math.max(10, baseTraits.interpretability - (maxDepth - 10) * 5)
  } else if (maxDepth < 4) {
    mutatedTraits.bias = Math.min(95, baseTraits.bias + (6 - maxDepth) * 6)
    mutatedTraits.variance = Math.max(5, baseTraits.variance - (6 - maxDepth) * 4)
    mutatedTraits.interpretability = Math.min(99, baseTraits.interpretability + (6 - maxDepth) * 5)
  }

  // 2. Effect of Estimator Count / Ensembling
  if (nEstimators > 200) {
    mutatedTraits.variance = Math.max(5, mutatedTraits.variance - Math.round((nEstimators - 200) * 0.05))
    mutatedTraits.generalization = Math.min(99, mutatedTraits.generalization + 3)
    mutatedTraits.speed = Math.max(20, mutatedTraits.speed - Math.round((nEstimators - 200) * 0.1))
  }

  // 3. Effect of Learning Rate
  if (learningRate > 0.3) {
    mutatedTraits.trainingStability = Math.max(20, baseTraits.trainingStability - 35)
    mutatedTraits.generalization = Math.max(40, baseTraits.generalization - 15)
  } else if (learningRate < 0.01) {
    mutatedTraits.trainingStability = Math.min(99, baseTraits.trainingStability + 5)
    mutatedTraits.speed = Math.max(30, baseTraits.speed - 20)
  }

  // 4. Effect of Regularization (Lambda)
  if (regularization > 5.0) {
    mutatedTraits.variance = Math.max(8, mutatedTraits.variance - 15)
    mutatedTraits.bias = Math.min(90, mutatedTraits.bias + 12)
    mutatedTraits.noiseTolerance = Math.min(99, baseTraits.noiseTolerance + 10)
  }

  // 5. Activation Mutation
  if (activation === 'gelu' || activation === 'swish') {
    mutatedTraits.generalization = Math.min(99, mutatedTraits.generalization + 2)
  } else if (activation === 'sigmoid') {
    mutatedTraits.trainingStability = Math.max(30, mutatedTraits.trainingStability - 20)
  }

  // Generate mutated DNA strand string representation
  const mutatedDna = `${baseModel.speciesCode}-MUT[D:${maxDepth}-N:${nEstimators}-LR:${learningRate}-R:${regularization}]`

  return {
    baseTraits,
    mutatedTraits,
    mutatedDna,
    hyperparams,
  }
}
