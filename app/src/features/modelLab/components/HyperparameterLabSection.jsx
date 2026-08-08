import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sliders, Cpu, Sparkles, RefreshCw } from 'lucide-react'

export function HyperparameterLabSection({ winner }) {
  const [nEstimators, setNEstimators] = useState(100)
  const [maxDepth, setMaxDepth] = useState(10)
  const [learningRate, setLearningRate] = useState(0.1)

  if (!winner) return null

  // Simulated tuned score calculation
  const tunedScore = Math.min(99.4, Math.max(80.0, Math.round((winner.overallScore + (nEstimators / 500) * 2 + (maxDepth / 20) * 1.5) * 10) / 10))

  return (
    <motion.section
      className="ml-hyperparameter-section glass"
      style={{ padding: '2rem', borderRadius: '24px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Sliders size={18} className="cc-icon-cyan" />
        <h2 className="ml-section-title">Live Hyperparameter Tuning Playground</h2>
        <span className="ml-badge">Tuning: {winner.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* n_estimators */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>n_estimators:</span>
            <strong style={{ color: '#06b6d4' }}>{nEstimators}</strong>
          </div>
          <input
            type="range"
            min="10"
            max="300"
            step="10"
            value={nEstimators}
            onChange={(e) => setNEstimators(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
          />
        </div>

        {/* max_depth */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>max_depth:</span>
            <strong style={{ color: '#38bdf8' }}>{maxDepth}</strong>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={maxDepth}
            onChange={(e) => setMaxDepth(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
          />
        </div>

        {/* learning_rate */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>learning_rate:</span>
            <strong style={{ color: '#a78bfa' }}>{learningRate}</strong>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.5"
            step="0.01"
            value={learningRate}
            onChange={(e) => setLearningRate(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#a78bfa', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem 1.25rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          Real-time Tuned Validation Score:
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-display)' }}>
          {tunedScore}% (+{(tunedScore - winner.overallScore).toFixed(1)}% improvement)
        </div>
      </div>
    </motion.section>
  )
}
