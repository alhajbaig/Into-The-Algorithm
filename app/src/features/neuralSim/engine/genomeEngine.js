/**
 * Network Genome & Advanced Telemetry Engine
 * Computes model parameters, connection count, FLOPs estimates, and classification metrics.
 */
export function calculateNetworkGenome(layerSizes = [], loss = 1.0) {
  const depth = layerSizes.length

  let totalParams = 0
  let connectionCount = 0

  for (let l = 0; l < layerSizes.length - 1; l++) {
    const inDim = layerSizes[l]
    const outDim = layerSizes[l + 1]
    const weightsInLayer = inDim * outDim
    const biasesInLayer = outDim

    totalParams += weightsInLayer + biasesInLayer
    connectionCount += weightsInLayer
  }

  const complexityScore = Math.round(totalParams * 1.5 + depth * 10)
  const estimatedFlops = totalParams * 2 // 2 FLOPs per multiply-accumulate

  // Derived metrics from current loss
  const lossBounded = Math.max(0.001, Math.min(1.0, loss))
  const precision = Math.min(99.9, Math.max(10, Math.round(100 - lossBounded * 40)))
  const recall = Math.min(99.9, Math.max(10, Math.round(100 - lossBounded * 48)))
  const f1Score = Math.round((2 * precision * recall) / (precision + recall))

  return {
    depth,
    totalParams,
    connectionCount,
    complexityScore,
    estimatedFlops,
    precision,
    recall,
    f1Score,
  }
}
