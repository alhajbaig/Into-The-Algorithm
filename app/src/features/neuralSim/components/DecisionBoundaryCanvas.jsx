import { useMemo } from 'react'

/**
 * 2D Decision Boundary Contour Canvas Component
 * Evaluates neural network predictions over a 2D coordinate grid (x1, x2) and renders learned decision boundaries.
 */
export default function DecisionBoundaryCanvas({ model, dataset }) {
  const gridSize = 25
  const canvasWidth = 520
  const canvasHeight = 520

  // Compute Decision Boundary Surface Grid
  const boundaryGrid = useMemo(() => {
    const cells = []
    const step = 2.0 / (gridSize - 1)

    for (let i = 0; i < gridSize; i++) {
      const x1 = -1.0 + i * step
      for (let j = 0; j < gridSize; j++) {
        const x2 = -1.0 + j * step

        // Evaluate model forward pass for (x1, x2)
        const inputs = model?.layerSizes[0] === 4 ? [x1, x2, 0.5, -0.5] : [x1, x2]
        const outputs = model ? model.forward(inputs) : [0.5]
        const predVal = outputs[0] || 0.5

        const screenX = ((x1 + 1.0) / 2.0) * canvasWidth
        const screenY = ((1.0 - x2) / 2.0) * canvasHeight

        cells.push({
          screenX,
          screenY,
          predVal,
          width: canvasWidth / gridSize + 1,
          height: canvasHeight / gridSize + 1,
        })
      }
    }
    return cells
  }, [model, model?.epoch])

  const { train = [] } = dataset || {}

  return (
    <div className="neural-canvas-container" style={{ height: '520px' }}>
      <div className="canvas-hud-header">
        <span>2D LEARNED DECISION BOUNDARY CONTOUR MAP (x1 vs x2)</span>
        <span>CLASS 0 (CYAN) vs CLASS 1 (PINK)</span>
      </div>

      <svg viewBox="0 0 520 520" className="neural-svg-element">
        {/* Render Decision Boundary Grid Mesh Cells */}
        {boundaryGrid.map((cell, idx) => {
          // Color interpolate from Cyan (Class 0) to Pink (Class 1)
          const fillOpacity = Math.min(0.75, Math.max(0.15, Math.abs(cell.predVal - 0.5) * 1.5))
          const fillColor = cell.predVal >= 0.5 ? '#f43f5e' : '#38bdf8'

          return (
            <rect
              key={idx}
              x={cell.screenX - cell.width / 2}
              y={cell.screenY - cell.height / 2}
              width={cell.width}
              height={cell.height}
              fill={fillColor}
              opacity={fillOpacity}
            />
          )
        })}

        {/* Scatter Dataset Points */}
        {train.map((pt, idx) => {
          const sx = ((pt.x1 + 1.0) / 2.0) * canvasWidth
          const sy = ((1.0 - pt.x2) / 2.0) * canvasHeight
          const isClass1 = pt.label === 1

          return (
            <circle
              key={idx}
              cx={sx}
              cy={sy}
              r={5}
              fill={isClass1 ? '#f43f5e' : '#38bdf8'}
              stroke="#ffffff"
              strokeWidth={1.5}
            />
          )
        })}
      </svg>
    </div>
  )
}
