import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { Hexagon, Zap, Lock } from 'lucide-react'

const DOMAINS = [
  { id: 'ml',   name: 'Machine Learning',  icon: '🤖', color: '#3b82f6', levelRange: [1, 15] },
  { id: 'dl',   name: 'Deep Learning',     icon: '🧠', color: '#8b5cf6', levelRange: [16, 25] },
  { id: 'cv',   name: 'Computer Vision',   icon: '👁️', color: '#06b6d4', levelRange: [26, 35] },
  { id: 'nlp',  name: 'NLP',               icon: '💬', color: '#10b981', levelRange: [36, 45] },
  { id: 'llm',  name: 'LLMs & GenAI',      icon: '✨', color: '#ec4899', levelRange: [46, 60] },
  { id: 'ops',  name: 'MLOps',             icon: '⚙️', color: '#f59e0b', levelRange: [61, 75] },
  { id: 'ds',   name: 'Data Science',      icon: '📊', color: '#14b8a6', levelRange: [76, 90] },
  { id: 'stat', name: 'Statistics',        icon: '📈', color: '#a78bfa', levelRange: [91, 100] },
]

const sectionV = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function MasteryUniverse() {
  const { progress } = useGame()
  const [expanded, setExpanded] = useState(null)

  const domainStats = DOMAINS.map((d) => {
    const total = d.levelRange[1] - d.levelRange[0] + 1
    let cleared = 0
    let xp = 0
    for (let lvl = d.levelRange[0]; lvl <= d.levelRange[1]; lvl++) {
      if (progress.clearedLevels?.includes(lvl)) {
        cleared++
        xp += 100 + (progress.levelStars?.[lvl] || 0) * 25
      }
    }
    const mastery = Math.round((cleared / total) * 100)
    return { ...d, total, cleared, xp, mastery }
  })

  return (
    <motion.section
      className="cc-mastery-universe"
      variants={sectionV}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="cc-section-header">
        <Hexagon size={18} className="cc-icon-purple" />
        <h2 className="cc-section-title">AI Mastery Universe</h2>
      </div>

      <div className="cc-hex-grid">
        {domainStats.map((domain, i) => {
          const isExpanded = expanded === domain.id
          return (
            <motion.div
              key={domain.id}
              className={`cc-hex-module glass ${isExpanded ? 'expanded' : ''} ${domain.mastery > 0 ? 'active' : 'dormant'}`}
              style={{ '--hex-color': domain.color }}
              onClick={() => setExpanded(isExpanded ? null : domain.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              layout
            >
              {/* Hex Shape */}
              <div className="cc-hex-shape">
                <div className="cc-hex-inner">
                  <span className="cc-hex-icon">{domain.icon}</span>
                </div>
                {/* Mastery ring inside hex */}
                <svg className="cc-hex-ring" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none" stroke={domain.color} strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${Math.PI * 68}`}
                    strokeDashoffset={`${Math.PI * 68 * (1 - domain.mastery / 100)}`}
                    style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                  />
                </svg>
              </div>

              <div className="cc-hex-info">
                <span className="cc-hex-name">{domain.name}</span>
                <span className="cc-hex-mastery" style={{ color: domain.color }}>
                  {domain.mastery}% Mastery
                </span>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="cc-hex-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="cc-hex-detail-row">
                      <Zap size={12} style={{ color: domain.color }} />
                      <span>{domain.xp.toLocaleString()} XP</span>
                    </div>
                    <div className="cc-hex-detail-row">
                      <span>📚 {domain.cleared}/{domain.total} Skills</span>
                    </div>
                    <div className="cc-hex-detail-row">
                      <span>Levels {domain.levelRange[0]}–{domain.levelRange[1]}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
