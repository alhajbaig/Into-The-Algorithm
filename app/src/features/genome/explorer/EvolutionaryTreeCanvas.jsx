import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw, Sparkles, BookOpen, Layers } from 'lucide-react'
import { buildEvolutionTreeLayout } from '../engine/evolutionTreeEngine'

/**
 * Evolutionary Tree Canvas Component — Interactive 2D spatial ML family tree map
 */
export default function EvolutionaryTreeCanvas({ onSelectModel, selectedModelId }) {
  const { nodes, links, familyLayout } = buildEvolutionTreeLayout()
  const [zoomLevel, setZoomLevel] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
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
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
    lastMousePos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const resetView = () => {
    setZoomLevel(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <div className="evolution-tree-card glass">
      <div className="tree-header-bar">
        <div className="tree-title-group">
          <h3>
            <Sparkles className="icon-pulse" size={18} color="#60a5fa" />
            <span>EVOLUTIONARY PHYLOGENETIC TREE OF AI</span>
          </h3>
          <span className="tree-sub">Interactive Ancestry Map • Drag to Pan • Scroll to Zoom</span>
        </div>

        <div className="tree-controls-row">
          <button type="button" className="btn-icon" onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}>
            <ZoomIn size={14} />
          </button>
          <button type="button" className="btn-icon" onClick={resetView}>
            <RotateCcw size={14} />
          </button>
          <button type="button" className="btn-icon" onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}>
            <ZoomOut size={14} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Stage */}
      <div
        className="tree-canvas-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <svg
          viewBox="0 0 1000 680"
          className="tree-svg-element"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging.current ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          <defs>
            <linearGradient id="treeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Family Column Headers */}
          {familyLayout.map((group) => (
            <g key={group.family} transform={`translate(${group.rootX}, 50)`}>
              <rect
                x="-80"
                y="-20"
                width="160"
                height="32"
                rx="6"
                fill="rgba(15, 23, 42, 0.7)"
                stroke={group.color}
                strokeWidth="1.5"
              />
              <text y="2" textAnchor="middle" fill={group.color} fontSize="11" fontWeight="800">
                {group.family.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Render Ancestry Links */}
          {links.map((link) => (
            <path
              key={link.id}
              d={`M ${link.sourceX} ${link.sourceY} C ${link.sourceX} ${(link.sourceY + link.targetY) / 2}, ${link.targetX} ${(link.sourceY + link.targetY) / 2}, ${link.targetX} ${link.targetY}`}
              fill="none"
              stroke={link.color}
              strokeWidth="2"
              opacity="0.6"
              strokeDasharray="4 4"
            />
          ))}

          {/* Render Species Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedModelId === node.id

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectModel(node.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Selected Aura */}
                {isSelected && (
                  <circle r="36" fill="none" stroke={node.color} strokeWidth="2.5" className="node-selected-halo" />
                )}

                {/* Main Node Card Circle */}
                <circle
                  r={isSelected ? 26 : 22}
                  fill="#0f172a"
                  stroke={node.color}
                  strokeWidth={isSelected ? 3 : 2}
                />

                <text y="4" textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="800">
                  {node.name.slice(0, 3).toUpperCase()}
                </text>

                {/* Model Title Label */}
                <text
                  y="38"
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#cbd5e1'}
                  fontSize="11"
                  fontWeight={isSelected ? 800 : 600}
                >
                  {node.name}
                </text>

                {/* Generation Pill */}
                <text y="50" textAnchor="middle" fill="#64748b" fontSize="9">
                  {node.generation.split(' ')[0]}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
