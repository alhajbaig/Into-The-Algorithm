import React from 'react'
import { motion } from 'framer-motion'
import { Layers, Check, X, BookOpen, Zap, Shield, Clock } from 'lucide-react'

export function ModelComparisonSection({ evaluatedModels, onSelectLearnMore }) {
  if (!evaluatedModels || !evaluatedModels.length) return null

  return (
    <motion.section
      className="ml-comparison-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Layers size={18} className="cc-icon-purple" />
        <h2 className="ml-section-title">Algorithm Comparison Cards</h2>
        <span className="ml-badge">Detailed Trade-Off Analysis</span>
      </div>

      <div className="ml-comparison-grid">
        {evaluatedModels.slice(0, 6).map((model, i) => (
          <motion.div
            key={model.name}
            className="ml-algo-card glass"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: '0 0 0.15rem', fontSize: '1.05rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                  {model.name}
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#06b6d4', fontWeight: 700 }}>
                  {model.type}
                </span>
              </div>
              <strong style={{ fontSize: '1.1rem', color: '#fbbf24' }}>
                {model.overallScore}%
              </strong>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.75rem', background: 'rgba(0,0,0,0.3)', padding: '0.65rem', borderRadius: '12px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Speed:</span> <strong style={{ color: '#e2e8f0' }}>{model.speed}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Memory:</span> <strong style={{ color: '#e2e8f0' }}>{model.memory}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>CV Score:</span> <strong style={{ color: '#34d399' }}>{model.cv}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Time:</span> <strong style={{ color: '#e2e8f0' }}>{model.timeMs}ms</strong>
              </div>
            </div>

            <button
              type="button"
              className="fl-export-btn"
              style={{ fontSize: '0.78rem', justifyContent: 'center', width: '100%', marginTop: '0.25rem' }}
              onClick={() => onSelectLearnMore(model.name)}
            >
              <BookOpen size={14} /> Educational Deep Dive
            </button>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
