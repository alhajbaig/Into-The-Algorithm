import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { create3DNeuralUniverse } from '../engine/threeDProjectionEngine'
import { Eye, RotateCcw } from 'lucide-react'

/**
 * 3D Neural Universe Canvas Component
 * Renders 3D spatial layers, perspective projection, mouse orbit rotation, 3D weight vectors, and 3D signal streams.
 */
export default function NeuralUniverse3DCanvas({ model, onSelectNeuron, selectedNeuron, mode }) {
  const { layerSizes = [], weights = [], activations = [] } = model || {}

  // 3D Orbit Camera State
  const [rotX, setRotX] = useState(0.2)
  const [rotY, setRotY] = useState(0.4)
  const [fov, setFov] = useState(650)
  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e) => {
    isDragging.current = true
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastMousePos.current.x
    const dy = e.clientY - lastMousePos.current.y

    setRotY((prev) => prev + dx * 0.005)
    setRotX((prev) => Math.max(-1.2, Math.min(1.2, prev - dy * 0.005)))

    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleWheel = (e) => {
    setFov((prev) => Math.max(300, Math.min(1200, prev - e.deltaY * 0.5)))
  }

  const resetCamera = () => {
    setRotX(0.2)
    setRotY(0.4)
    setFov(650)
  }

  // Calculate 3D Projected Nodes
  const projectedNodes = create3DNeuralUniverse(layerSizes, rotX, rotY, fov)

  // Map 3D connections with depth perspective
  const connectionLines = []
  for (let l = 0; l < weights.length; l++) {
    const wMatrix = weights[l]
    const sourceLayer = projectedNodes.filter((n) => n.layerIndex === l)
    const targetLayer = projectedNodes.filter((n) => n.layerIndex === l + 1)

    for (let j = 0; j < targetLayer.length; j++) {
      for (let i = 0; i < sourceLayer.length; i++) {
        const wVal = wMatrix[j] ? wMatrix[j][i] || 0 : 0
        const isPositive = wVal >= 0
        const strokeColor = isPositive ? '#38bdf8' : '#c084fc'
        const avgScale = (sourceLayer[i].scale + targetLayer[j].scale) / 2
        const strokeWidth = Math.max(0.5, Math.abs(wVal) * 3 * avgScale)

        connectionLines.push({
          id: `3d-w-${l}-${i}-${j}`,
          x1: sourceLayer[i].screenX,
          y1: sourceLayer[i].screenY,
          x2: targetLayer[j].screenX,
          y2: targetLayer[j].screenY,
          strokeColor,
          strokeWidth,
          opacity: Math.min(0.85, Math.max(0.15, Math.abs(wVal) * avgScale)),
          duration: `${(1.5 + ((l * 5 + i * 3 + j * 2) % 10) * 0.1).toFixed(1)}s`,
        })
      }
    }
  }

  return (
    <div
      className="neural-canvas-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
    >
      <div className="canvas-hud-header">
        <span>3D NEURAL GALAXY • DRAG TO ROTATE • SCROLL TO ZOOM</span>
        <button type="button" className="action-btn" onClick={resetCamera} style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>
          <RotateCcw size={12} />
          <span>Reset 3D View</span>
        </button>
      </div>

      <svg viewBox="0 0 900 540" className="neural-svg-element">
        <defs>
          <filter id="glow3D" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 3D Weight Lines */}
        {connectionLines.map((line) => (
          <g key={line.id}>
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.strokeColor}
              strokeWidth={line.strokeWidth}
              opacity={line.opacity}
            />
            {mode !== 'pause' && (
              <circle r={2.5 * (line.opacity + 0.5)} fill="#ffffff">
                <animateMotion
                  path={`M ${line.x1},${line.y1} L ${line.x2},${line.y2}`}
                  dur={line.duration}
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}

        {/* 3D Neurons sorted by Depth */}
        {projectedNodes.map((node) => {
          const actVal = activations[node.layerIndex] ? activations[node.layerIndex][node.neuronIndex] || 0 : 0
          const isSelected = selectedNeuron?.id === node.id
          const radius = Math.max(6, Math.min(22, 12 * node.scale))

          return (
            <g
              key={node.id}
              transform={`translate(${node.screenX}, ${node.screenY})`}
              onClick={() => onSelectNeuron({ ...node, activation: actVal })}
              style={{ cursor: 'pointer' }}
            >
              <circle
                r={radius + 4}
                fill="none"
                stroke={actVal > 0.1 ? '#38bdf8' : '#64748b'}
                strokeWidth={isSelected ? 3 : 1.5}
                opacity={0.6 * node.scale}
                filter={actVal > 0.1 ? 'url(#glow3D)' : 'none'}
              />
              <circle
                r={radius}
                fill={actVal > 0 ? `rgba(56, 189, 248, ${0.3 + actVal * 0.7})` : '#0f172a'}
                stroke={isSelected ? '#f8fafc' : '#38bdf8'}
                strokeWidth={2 * node.scale}
              />
              <text y="4" textAnchor="middle" fill="#ffffff" fontSize={Math.max(8, 10 * node.scale)} fontWeight="800">
                {actVal.toFixed(2)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
