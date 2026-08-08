/**
 * 3D Spatial Coordinate & Perspective Projection Engine
 * Converts 3D (X, Y, Z) neural network nodes into 2D screen coordinates (X', Y') with perspective scaling.
 */
export function create3DNeuralUniverse(layerSizes, rotX = 0.2, rotY = 0.4, fov = 600, centerOffset = { x: 450, y: 270 }) {
  const nodes3D = []
  const layerCount = layerSizes.length
  const layerZSpacing = 220 // Z depth per layer

  // Generate 3D Spatial Coordinates for all neurons
  layerSizes.forEach((size, lIdx) => {
    const zPos = (lIdx - (layerCount - 1) / 2) * layerZSpacing
    const radius = Math.min(140, Math.max(40, size * 18))

    for (let nIdx = 0; nIdx < size; nIdx++) {
      const angle = (nIdx / size) * Math.PI * 2
      const xPos = Math.cos(angle) * radius
      const yPos = Math.sin(angle) * radius

      nodes3D.push({
        id: `L${lIdx}-N${nIdx}`,
        layerIndex: lIdx,
        neuronIndex: nIdx,
        x3d: xPos,
        y3d: yPos,
        z3d: zPos,
      })
    }
  })

  // Apply 3D Rotation Matrix & Perspective Projection
  const cosX = Math.cos(rotX)
  const sinX = Math.sin(rotX)
  const cosY = Math.cos(rotY)
  const sinY = Math.sin(rotY)

  const projectedNodes = nodes3D.map((node) => {
    // Rotation around Y-axis
    const x1 = node.x3d * cosY + node.z3d * sinY
    const y1 = node.y3d
    const z1 = -node.x3d * sinY + node.z3d * cosY

    // Rotation around X-axis
    const x2 = x1
    const y2 = y1 * cosX - z1 * sinX
    const z2 = y1 * sinX + z1 * cosX

    // Perspective Projection Scale
    const scale = fov / (fov + z2 + 400)
    const screenX = Math.round(centerOffset.x + x2 * scale)
    const screenY = Math.round(centerOffset.y + y2 * scale)

    return {
      ...node,
      screenX,
      screenY,
      scale: Math.max(0.2, scale),
      depthZ: z2,
    }
  })

  // Sort nodes by depth for Z-indexing
  projectedNodes.sort((a, b) => b.depthZ - a.depthZ)

  return projectedNodes
}
