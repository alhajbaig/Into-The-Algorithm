import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap, Cpu, BookOpen, ShieldCheck, Flame, Leaf, Award } from 'lucide-react'

export function LeaderboardCardsSection({ evaluatedModels, onSelectLearnMore, problemType }) {
  if (!evaluatedModels || !evaluatedModels.length) return null

  const isClass = problemType === 'Classification'

  return (
    <motion.section
      className="ml-leaderboard-cards-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Trophy size={18} className="cc-icon-gold" />
        <h2 className="ml-section-title">Model Evaluation Leaderboard Showcase</h2>
        <span className="ml-badge">Ranked by 5-Fold Cross Validation</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {evaluatedModels.map((m, idx) => {
          const rank = idx + 1
          const badgeIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`
          const cardBorder = rank === 1 ? 'rgba(251, 191, 36, 0.4)' : rank === 2 ? 'rgba(226, 232, 240, 0.3)' : rank === 3 ? 'rgba(205, 127, 50, 0.3)' : 'rgba(6, 182, 212, 0.2)'
          const cardGlow = rank === 1 ? '0 0 35px rgba(251, 191, 36, 0.2)' : 'none'

          return (
            <motion.div
              key={m.name}
              className="glass"
              style={{
                padding: '1.75rem',
                borderRadius: '24px',
                border: `1px solid ${cardBorder}`,
                boxShadow: cardGlow,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                background: 'rgba(10, 15, 30, 0.75)',
                backdropFilter: 'blur(20px)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span className={`ml-rank-badge ${rank <= 3 ? `ml-rank-${rank}` : ''}`}>
                    {badgeIcon}
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                      {m.name}
                    </h3>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#06b6d4' }}>
                      {m.type}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: rank === 1 ? '#fbbf24' : '#38bdf8', fontFamily: 'var(--font-display)' }}>
                    {m.overallScore}%
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>
                    Score
                  </span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>{isClass ? 'Accuracy' : 'R² Score'}</span>
                  <strong style={{ fontSize: '0.9rem', color: '#34d399' }}>{isClass ? (m.accuracy * 100).toFixed(1) + '%' : m.r2Score}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>5-Fold CV</span>
                  <strong style={{ fontSize: '0.9rem', color: '#a78bfa' }}>{m.cv}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>Latency</span>
                  <strong style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{m.timeMs}ms</strong>
                </div>
              </div>

              {/* Carbon & Difficulty Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Leaf size={12} color="#34d399" /> Carbon: <strong style={{ color: '#e2e8f0' }}>{m.carbon || '0.04 gCO2'}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={12} color="#06b6d4" /> Readiness: <strong style={{ color: '#34d399' }}>{m.deploymentScore || 90}%</strong>
                </span>
              </div>

              {/* Cyber Glassmorphism Button */}
              <motion.button
                type="button"
                className="fl-export-btn"
                style={{ justifyContent: 'center', marginTop: '0.25rem', fontSize: '0.8rem', width: '100%' }}
                onClick={() => onSelectLearnMore(m.name)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
              >
                <BookOpen size={14} /> Educational Deep Dive &amp; Code
              </motion.button>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
