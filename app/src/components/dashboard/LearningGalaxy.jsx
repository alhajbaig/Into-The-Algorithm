import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LEVELS } from '../../data/content'
import { useGame } from '../../context/GameContext'
import { CheckCircle2, Lock, Star, Play, Sparkles, ChevronRight, Layers } from 'lucide-react'

export function LearningGalaxy() {
  const { progress, isUnlocked } = useGame()
  const navigate = useNavigate()
  const [hoveredLevel, setHoveredLevel] = useState(null)

  const galaxyLevels = LEVELS.slice(0, 24) // Display first 24 campaign levels in Galaxy grid view

  return (
    <section className="learning-galaxy-card glass" data-gsap="reveal">
      <div className="card-head-row">
        <div className="card-head-title">
          <Layers size={18} className="text-cyan" />
          <span>Interactive Learning Galaxy</span>
        </div>
        <span className="card-badge-muted">24 Core Nodes Active</span>
      </div>

      <p className="galaxy-desc">
        Hover nodes to inspect algorithm parameters, stars earned, and estimated completion time.
      </p>

      {/* Galaxy Connected Node Canvas */}
      <div className="galaxy-nodes-viewport">
        <div className="galaxy-grid-layout">
          {galaxyLevels.map((lvl, index) => {
            const unlocked = isUnlocked(lvl.id)
            const cleared = progress.clearedLevels?.includes(lvl.id)
            const stars = progress.levelStars?.[lvl.id] || 0

            return (
              <div
                key={lvl.id}
                className="galaxy-node-wrapper"
                onMouseEnter={() => setHoveredLevel(lvl)}
                onMouseLeave={() => setHoveredLevel(null)}
              >
                <div
                  className={`galaxy-node ${cleared ? 'cleared' : unlocked ? 'unlocked' : 'locked'}`}
                  onClick={() => unlocked && navigate(`/quest/level/${lvl.id}`)}
                >
                  <span className="node-num">{lvl.id}</span>
                  {cleared ? (
                    <CheckCircle2 size={14} className="node-icon text-green" />
                  ) : unlocked ? (
                    <span className="node-icon">{lvl.emoji}</span>
                  ) : (
                    <Lock size={12} className="node-icon muted" />
                  )}
                </div>

                {index < galaxyLevels.length - 1 && index % 6 !== 5 && (
                  <div className={`galaxy-link-line ${cleared ? 'cleared' : ''}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Hover Tooltip Card */}
        <AnimatePresence>
          {hoveredLevel && (
            <motion.div
              className="galaxy-hover-card glass"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="hover-head-row">
                <span className="hover-chapter">Ch {hoveredLevel.chapter || 1}: {hoveredLevel.tier || 'AI Foundational'}</span>
                <span className="hover-stars">⭐ {progress.levelStars?.[hoveredLevel.id] || 0}/3</span>
              </div>
              <h4 className="hover-title">{hoveredLevel.title}</h4>
              <p className="hover-blurb">{hoveredLevel.blurb}</p>

              <div className="hover-footer-row">
                <span className="hover-time">⏱️ ~8 min</span>
                {isUnlocked(hoveredLevel.id) && (
                  <button
                    type="button"
                    className="hover-play-btn"
                    onClick={() => navigate(`/quest/level/${hoveredLevel.id}`)}
                  >
                    <span>Play Level</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
