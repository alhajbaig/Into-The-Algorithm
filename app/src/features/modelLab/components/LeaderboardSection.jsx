import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap, Cpu, BookOpen, ChevronRight, Award } from 'lucide-react'

export function LeaderboardSection({ evaluatedModels, onSelectLearnMore, problemType }) {
  if (!evaluatedModels || !evaluatedModels.length) return null

  const isClass = problemType === 'Classification'

  return (
    <motion.section
      className="ml-leaderboard-card glass"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Trophy size={18} className="cc-icon-gold" />
        <h2 className="ml-section-title">Model Evaluation Leaderboard</h2>
        <span className="ml-badge">Ranked by 5-Fold Cross Validation</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="ml-leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Algorithm</th>
              <th>Overall Score</th>
              <th>{isClass ? 'Accuracy' : 'R² Score'}</th>
              <th>{isClass ? 'F1 Score' : 'MAE'}</th>
              <th>5-Fold CV</th>
              <th>Inference Speed</th>
              <th>Memory</th>
              <th>Training Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {evaluatedModels.map((m, idx) => {
              const rank = idx + 1
              const rowClass = rank === 1 ? 'ml-row-gold' : rank === 2 ? 'ml-row-silver' : rank === 3 ? 'ml-row-bronze' : ''
              const badgeClass = rank <= 3 ? `ml-rank-${rank}` : ''

              return (
                <motion.tr
                  key={m.name}
                  className={rowClass}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td>
                    <span className={`ml-rank-badge ${badgeClass}`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 800, color: '#fff' }}>{m.name}</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.type}</span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ fontSize: '1.05rem', color: rank === 1 ? '#fbbf24' : '#38bdf8' }}>
                      {m.overallScore}%
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>
                      {isClass ? (m.accuracy * 100).toFixed(1) + '%' : m.r2Score}
                    </span>
                  </td>
                  <td>
                    <span>{isClass ? m.f1 : m.mae}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#a78bfa' }}>{m.cv}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: m.speed.includes('Ultra') || m.speed.includes('Instant') ? '#34d399' : '#e2e8f0' }}>
                      {m.speed}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{m.memory}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{m.timeMs} ms</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="fl-export-btn"
                      style={{ fontSize: '0.72rem', padding: '0.35rem 0.65rem' }}
                      onClick={() => onSelectLearnMore(m.name)}
                    >
                      <BookOpen size={13} /> Learn More
                    </button>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  )
}
