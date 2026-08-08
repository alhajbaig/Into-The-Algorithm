import { useMemo } from 'react'
import { generateLossLandscapeMesh, computeOptimizerTrajectory } from '../engine/lossLandscapeEngine'

/**
 * 3D Loss Landscape Surface Component
 * Renders 3D loss surface mesh grid and tracks real-time optimizer trajectory down loss bowl.
 */
export default function LossLandscape3DView({ epoch = 0, optimizerKey = 'adam' }) {
  const meshPoints = useMemo(() => generateLossLandscapeMesh(12), [])
  const trajectory = useMemo(() => computeOptimizerTrajectory(epoch, optimizerKey), [epoch, optimizerKey])

  const centerOffset = { x: 450, y: 250 }

  return (
    <div className="neural-canvas-container">
      <div className="canvas-hud-header">
        <span>3D LOSS SURFACING & OPTIMIZER TRAJECTORY ({optimizerKey.toUpperCase()})</span>
        <span>GLOBAL MINIMUM: L(w*) = 0.001</span>
      </div>

      <svg viewBox="0 0 900 520" className="neural-svg-element">
        <defs>
          <linearGradient id="lossMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* 3D Wireframe Mesh Points */}
        {meshPoints.map((pt, idx) => {
          const sx = centerOffset.x + pt.u * 320 - pt.v * 160
          const sy = centerOffset.y + pt.v * 120 - pt.lossZ * 180

          return (
            <circle
              key={idx}
              cx={sx}
              cy={sy}
              r={pt.lossZ > 0.4 ? 3 : 2}
              fill={pt.lossZ > 0.4 ? '#f43f5e' : '#38bdf8'}
              opacity={0.7}
            />
          )
        })}

        {/* Optimizer Trajectory Line */}
        {trajectory.map((step, idx) => {
          if (idx === 0) return null
          const prev = trajectory[idx - 1]
          const x1 = centerOffset.x + prev.u * 320 - prev.v * 160
          const y1 = centerOffset.y + prev.v * 120 - prev.lossZ * 180
          const x2 = centerOffset.x + step.u * 320 - step.v * 160
          const y2 = centerOffset.y + step.v * 120 - step.lossZ * 180

          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#fbbf24"
              strokeWidth={3}
              strokeDasharray="4 4"
            />
          )
        })}

        {/* Current Position Marker */}
        {trajectory.length > 0 && (() => {
          const curr = trajectory[trajectory.length - 1]
          const cx = centerOffset.x + curr.u * 320 - curr.v * 160
          const cy = centerOffset.y + curr.v * 120 - curr.lossZ * 180
          return (
            <g transform={`translate(${cx}, ${cy})`}>
              <circle r={8} fill="#fbbf24" />
              <circle r={14} fill="none" stroke="#fbbf24" strokeWidth={2} opacity={0.6}>
                <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
