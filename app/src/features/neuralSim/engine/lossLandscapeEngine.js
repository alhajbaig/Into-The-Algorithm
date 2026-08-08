/**
 * 3D Loss Landscape & Optimizer Trajectory Engine
 * Generates Rastrigin/Saddle loss surface mesh points and tracks optimizer trajectory.
 */
export function generateLossLandscapeMesh(gridSize = 15) {
  const points = []

  for (let i = 0; i < gridSize; i++) {
    const u = (i / (gridSize - 1)) * 2 - 1 // -1 to +1
    for (let j = 0; j < gridSize; j++) {
      const v = (j / (gridSize - 1)) * 2 - 1

      // 3D Loss Surface Formula (Rastrigin loss bowl)
      const lossZ = 0.5 * (u * u + v * v) + 0.1 * Math.cos(4 * u) + 0.1 * Math.cos(4 * v)

      points.push({
        u,
        v,
        lossZ,
        gridI: i,
        gridJ: j,
      })
    }
  }

  return points
}

export function computeOptimizerTrajectory(epoch, optimizerKey) {
  const steps = []
  const maxEpochs = Math.max(1, epoch)

  for (let t = 0; t <= Math.min(30, maxEpochs); t++) {
    const decay = Math.exp(-t * 0.12)
    const noise = (Math.sin(t * 1.5) * 0.1) * (optimizerKey === 'sgd' ? 1.5 : 0.4)

    const u = 0.8 * decay + noise
    const v = -0.7 * decay - noise * 0.5
    const lossZ = 0.5 * (u * u + v * v) + 0.05

    steps.push({ t, u, v, lossZ })
  }

  return steps
}
