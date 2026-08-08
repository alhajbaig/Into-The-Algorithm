import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Sliders, RefreshCw, Sparkles, Zap } from 'lucide-react'

export function WhatIfSimulatorSection({ onWhatIfChange }) {
  const [missingPct, setMissingPct] = useState(0)
  const [noiseLevel, setNoiseLevel] = useState(0)

  const handleMissingChange = (val) => {
    setMissingPct(val)
    onWhatIfChange({ missingPct: val, noiseLevel })
  }

  const handleNoiseChange = (val) => {
    setNoiseLevel(val)
    onWhatIfChange({ missingPct, noiseLevel: val })
  }

  const handleReset = () => {
    setMissingPct(0)
    setNoiseLevel(0)
    onWhatIfChange({ missingPct: 0, noiseLevel: 0 })
  }

  return (
    <motion.section
      className="ml-whatif-section glass"
      style={{ padding: '2rem', borderRadius: '24px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Sliders size={18} className="cc-icon-purple" />
        <h2 className="ml-section-title">Interactive "What-If?" Recommendation Simulator</h2>
        <span className="ml-badge">Real-Time Parameter Sensitivity</span>
      </div>

      <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
        Adjust dataset noise and missing value ratios to observe live recommendation shifts across algorithms in real time.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Missing Value Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>Simulated Missing Data Ratio:</span>
            <strong style={{ color: '#06b6d4' }}>{missingPct}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={missingPct}
            onChange={(e) => handleMissingChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
          />
        </div>

        {/* Noise Level Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>Feature Noise Level:</span>
            <strong style={{ color: '#a78bfa' }}>{noiseLevel}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={noiseLevel}
            onChange={(e) => handleNoiseChange(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#a78bfa', cursor: 'pointer' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <button
          type="button"
          className="fl-export-btn"
          onClick={handleReset}
          style={{ fontSize: '0.78rem' }}
        >
          <RefreshCw size={14} /> Reset Simulation Sliders
        </button>
      </div>
    </motion.section>
  )
}
