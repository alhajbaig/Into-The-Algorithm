import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LEVELS } from '../../data/content'
import { useGame } from '../../context/GameContext'
import { Lock, Star, Play, ChevronRight, Orbit } from 'lucide-react'

const sectionV = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function SkillGalaxy() {
  const { progress, isUnlocked } = useGame()
  const navigate = useNavigate()
  const [hoveredLevel, setHoveredLevel] = useState(null)

  const galaxyLevels = LEVELS.slice(0, 24)

  // SVG constellation layout: arrange nodes in a spiral-ish constellation
  const cols = 6
  const nodeW = 64
  const gapX = 100
  const gapY = 90
  const svgW = cols * (nodeW + gapX) - gapX + 40
  const rows = Math.ceil(galaxyLevels.length / cols)
  const svgH = rows * (nodeW + gapY) - gapY + 40

  function getPos(index) {
    const row = Math.floor(index / cols)
    const col = row % 2 === 0 ? index % cols : cols - 1 - (index % cols) // serpentine
    return {
      x: 20 + col * (nodeW + gapX) + nodeW / 2,
      y: 20 + row * (nodeW + gapY) + nodeW / 2,
    }
  }

  return (
    <motion.section
      className="cc-skill-galaxy"
      variants={sectionV}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="cc-section-header">
        <Orbit size={18} className="cc-icon-purple" />
        <h2 className="cc-section-title">Skill Galaxy</h2>
        <span className="cc-section-badge">{galaxyLevels.length} Nodes</span>
      </div>

      <div className="cc-galaxy-viewport glass">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="cc-galaxy-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.3)" />
            </linearGradient>
            <linearGradient id="lineGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Connection lines */}
          {galaxyLevels.map((lvl, i) => {
            if (i === galaxyLevels.length - 1) return null
            const from = getPos(i)
            const to = getPos(i + 1)
            const cleared = progress.clearedLevels?.includes(lvl.id)
            return (
              <line
                key={`line-${i}`}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke={cleared ? 'url(#lineGradActive)' : 'url(#lineGrad)'}
                strokeWidth={cleared ? 2.5 : 1.5}
                strokeDasharray={cleared ? 'none' : '6 4'}
                className={cleared ? 'cc-line-active' : 'cc-line-dim'}
              />
            )
          })}

          {/* Planet nodes */}
          {galaxyLevels.map((lvl, i) => {
            const pos = getPos(i)
            const unlocked = isUnlocked(lvl.id)
            const cleared = progress.clearedLevels?.includes(lvl.id)
            const stars = progress.levelStars?.[lvl.id] || 0
            const isCurrent = !cleared && unlocked
            const nodeR = 26

            return (
              <g
                key={lvl.id}
                className={`cc-planet-group ${cleared ? 'cleared' : isCurrent ? 'current' : unlocked ? 'unlocked' : 'locked'}`}
                onClick={() => unlocked && navigate(`/quest/level/${lvl.id}`)}
                onMouseEnter={() => setHoveredLevel({ ...lvl, pos, stars })}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{ cursor: unlocked ? 'pointer' : 'default' }}
              >
                {/* Glow halo for cleared/current */}
                {(cleared || isCurrent) && (
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={nodeR + 8}
                    fill="none"
                    stroke={cleared ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.4)'}
                    strokeWidth={2}
                    filter="url(#glow)"
                    className={isCurrent ? 'cc-planet-pulse' : ''}
                  />
                )}

                {/* Planet body */}
                <circle
                  cx={pos.x} cy={pos.y} r={nodeR}
                  fill={cleared ? 'rgba(16,185,129,0.15)' : isCurrent ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)'}
                  stroke={cleared ? '#10b981' : isCurrent ? '#3b82f6' : 'rgba(255,255,255,0.12)'}
                  strokeWidth={2}
                />

                {/* Inner content */}
                {!unlocked ? (
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill="rgba(255,255,255,0.2)" fontSize="14" fontFamily="var(--font-display)">
                    🔒
                  </text>
                ) : (
                  <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill="#fff" fontSize="12" fontWeight="800" fontFamily="var(--font-display)">
                    {lvl.id}
                  </text>
                )}

                {/* Stars indicator for cleared */}
                {cleared && stars > 0 && (
                  <text x={pos.x} y={pos.y + nodeR + 14} textAnchor="middle"
                    fill="#fbbf24" fontSize="10">
                    {'⭐'.repeat(Math.min(stars, 3))}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredLevel && (
            <motion.div
              className="cc-galaxy-tooltip glass"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <div className="cc-tooltip-header">
                <span className="cc-tooltip-chapter">Ch {hoveredLevel.chapter || 1} · {hoveredLevel.tier || 'Foundations'}</span>
                <span className="cc-tooltip-stars">⭐ {hoveredLevel.stars}/3</span>
              </div>
              <h4 className="cc-tooltip-title">{hoveredLevel.title}</h4>
              <p className="cc-tooltip-blurb">{hoveredLevel.blurb}</p>
              <div className="cc-tooltip-footer">
                <span className="cc-tooltip-time">⏱️ ~8 min</span>
                <span className="cc-tooltip-diff">Level {hoveredLevel.id}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
