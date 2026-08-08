import { useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Neural Network Canvas SVG Component
 * Visualizes dynamic layers, pulsing neurons, weighted synaptic connections, forward signals, and backprop gradient pulses.
 */
export default function NeuralNetworkCanvas({ model, onSelectNeuron, selectedNeuron, mode }) {
  const { layerSizes = [], weights = [], activations = [] } = model || {}

  // Compute 2D Canvas positions for all neurons
  const canvasWidth = 900
  const canvasHeight = 520
  const layerCount = layerSizes.length

  const neuronPositions = []

  layerSizes.forEach((size, lIdx) => {
    const x = Math.round(120 + (lIdx * (canvasWidth - 240)) / Math.max(1, layerCount - 1))
    const layerNodes = []
    const spacing = Math.min(65, (canvasHeight - 100) / Math.max(1, size))
    const startY = Math.round((canvasHeight - spacing * (size - 1)) / 2)

    for (let nIdx = 0; nIdx < size; nIdx++) {
      const y = startY + nIdx * spacing
      const actVal = activations[lIdx] ? activations[lIdx][nIdx] || 0 : 0
      layerNodes.push({
        id: `L${lIdx}-N${nIdx}`,
        layerIndex: lIdx,
        neuronIndex: nIdx,
        x,
        y,
        activation: actVal,
      })
    }
    neuronPositions.push(layerNodes)
  })

  // Compute connections with weight lines
  const connectionLines = []
  for (let l = 0; l < weights.length; l++) {
    const wMatrix = weights[l]
    const sourceLayer = neuronPositions[l]
    const targetLayer = neuronPositions[l + 1]

    if (!sourceLayer || !targetLayer) continue

    for (let j = 0; j < targetLayer.length; j++) {
      for (let i = 0; i < sourceLayer.length; i++) {
        const wVal = wMatrix[j] ? wMatrix[j][i] || 0 : 0
        const isPositive = wVal >= 0
        const strokeWidth = Math.min(5, Math.max(0.5, Math.abs(wVal) * 2.5))
        const strokeColor = isPositive ? '#38bdf8' : '#c084fc'

        connectionLines.push({
          id: `w-${l}-${i}-${j}`,
          x1: sourceLayer[i].x,
          y1: sourceLayer[i].y,
          x2: targetLayer[j].x,
          y2: targetLayer[j].y,
          weight: wVal,
          strokeWidth,
          strokeColor,
          opacity: Math.min(0.85, Math.max(0.15, Math.abs(wVal))),
        })
      }
    }
  }

  return (
    <div className="neural-canvas-container">
      <div className="canvas-hud-header">
        <span>DYNAMIC NEURAL TOPOLOGY: {layerSizes.join(' → ')}</span>
        <span>MODE: {mode.toUpperCase()}</span>
      </div>

      <svg viewBox="0 0 900 520" className="neural-svg-element">
        <defs>
          <filter id="neuronGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Weight Connection Lines */}
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

            {/* Forward Signal Signal Particle */}
            {mode !== 'pause' && (
              <circle r={2.5} fill="#ffffff">
                <animateMotion
                  path={`M ${line.x1},${line.y1} L ${line.x2},${line.y2}`}
                  dur={`${1.5 + Math.random()}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {/* Backprop Error Pulse Wave Particle */}
            {mode === 'backprop' && (
              <circle r={3} fill="#f43f5e">
                <animateMotion
                  path={`M ${line.x2},${line.y2} L ${line.x1},${line.y1}`}
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}

        {/* Neurons Rendering */}
        {neuronPositions.map((layer, lIdx) =>
          layer.map((neuron) => {
            const isSelected = selectedNeuron?.id === neuron.id
            const actPct = Math.min(1, Math.max(0, neuron.activation))

            return (
              <g
                key={neuron.id}
                transform={`translate(${neuron.x}, ${neuron.y})`}
                onClick={() => onSelectNeuron(neuron)}
                style={{ cursor: 'pointer' }}
                className="neuron-node-group"
              >
                {/* Neuron Outer Halo Glow */}
                <circle
                  r={isSelected ? 18 : 14}
                  fill="none"
                  stroke={actPct > 0.1 ? '#38bdf8' : '#64748b'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  opacity={0.7}
                  filter={actPct > 0.1 ? 'url(#neuronGlow)' : 'none'}
                />

                {/* Main Core Neuron Circle */}
                <circle
                  r={isSelected ? 14 : 10}
                  fill={actPct > 0 ? `rgba(56, 189, 248, ${0.3 + actPct * 0.7})` : '#0f172a'}
                  stroke={isSelected ? '#f8fafc' : '#38bdf8'}
                  strokeWidth={2}
                />

                {/* Activation Label */}
                <text y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800">
                  {neuron.activation.toFixed(2)}
                </text>

                {/* Layer Tag */}
                {neuron.neuronIndex === 0 && (
                  <text y="-25" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700">
                    {lIdx === 0 ? 'Input' : lIdx === layerSizes.length - 1 ? 'Output' : `Hidden ${lIdx}`}
                  </text>
                )}
              </g>
            )
          })
        )}
      </svg>
    </div>
  )
}
