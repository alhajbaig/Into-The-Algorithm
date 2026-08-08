/**
 * Dataset Generation Engine (Playground Classification Datasets)
 * Generates synthetic benchmark datasets: Circle, Spiral, XOR, Moons, Blobs.
 */
export function generateDataset(datasetType = 'circle', sampleCount = 200, noise = 0.1, trainSplit = 0.8) {
  const points = []

  for (let i = 0; i < sampleCount; i++) {
    let x1 = 0
    let x2 = 0
    let label = 0

    const n1 = (Math.random() * 2 - 1) * noise
    const n2 = (Math.random() * 2 - 1) * noise

    if (datasetType === 'circle') {
      const radius = i < sampleCount / 2 ? 0.3 + n1 : 0.85 + n1
      const angle = Math.random() * Math.PI * 2
      x1 = Math.cos(angle) * radius
      x2 = Math.sin(angle) * radius
      label = i < sampleCount / 2 ? 0 : 1
    } else if (datasetType === 'xor') {
      x1 = (Math.random() * 2 - 1) + n1
      x2 = (Math.random() * 2 - 1) + n2
      label = (x1 > 0 && x2 > 0) || (x1 < 0 && x2 < 0) ? 1 : 0
    } else if (datasetType === 'spiral') {
      const isClass1 = i >= sampleCount / 2
      const t = (i % (sampleCount / 2)) / (sampleCount / 2) * 2.5 * Math.PI
      const r = (t / (2.5 * Math.PI)) * 0.9 + 0.1
      const angle = isClass1 ? t : t + Math.PI

      x1 = Math.cos(angle) * r + n1
      x2 = Math.sin(angle) * r + n2
      label = isClass1 ? 1 : 0
    } else if (datasetType === 'moons') {
      const isClass1 = i >= sampleCount / 2
      const angle = Math.random() * Math.PI
      if (!isClass1) {
        x1 = Math.cos(angle) * 0.6 - 0.3 + n1
        x2 = Math.sin(angle) * 0.6 + 0.2 + n2
        label = 0
      } else {
        x1 = 0.3 - Math.cos(angle) * 0.6 + n1
        x2 = -Math.sin(angle) * 0.6 - 0.1 + n2
        label = 1
      }
    } else {
      // Gaussian Blobs
      const isClass1 = i >= sampleCount / 2
      const cx = isClass1 ? 0.5 : -0.5
      const cy = isClass1 ? 0.5 : -0.5
      x1 = cx + (Math.random() * 2 - 1) * 0.35 + n1
      x2 = cy + (Math.random() * 2 - 1) * 0.35 + n2
      label = isClass1 ? 1 : 0
    }

    points.push({ x1, x2, label })
  }

  // Shuffle and Split Train/Test
  const shuffled = [...points].sort(() => Math.random() - 0.5)
  const splitIdx = Math.floor(sampleCount * trainSplit)

  return {
    train: shuffled.slice(0, splitIdx),
    test: shuffled.slice(splitIdx),
    all: shuffled,
  }
}
