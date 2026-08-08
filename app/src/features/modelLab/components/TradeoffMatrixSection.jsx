import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Zap, CheckCircle2, AlertTriangle, Layers } from 'lucide-react'

export function TradeoffMatrixSection({ evaluatedModels }) {
  const [hoveredModel, setHoveredModel] = useState(null)

  if (!evaluatedModels || !evaluatedModels.length) return null

  const topModels = evaluatedModels.slice(0, 6)

  return (
    <motion.section
      className="ml-tradeoff-section glass"
      style={{ padding: '2rem', borderRadius: '24px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Activity size={18} className="cc-icon-gold" />
        <h2 className="ml-section-title">Interactive Trade-off Matrix (Performance vs Latency)</h2>
        <span className="ml-badge">Pareto Efficiency Frontier</span>
      </div>

      <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
        Scatter map plotting Accuracy score (Y-axis) vs Latency in ms (X-axis). Bubble size represents Memory footprint. Hover over any node to inspect trade-offs.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'center' }}>
        {/* Scatter Viewport Container */}
        <div style={{ position: 'relative', height: '280px', background: 'rgba(0,0,0,0.3)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
          {/* Axis Labels */}
          <div style={{ position: 'absolute', top: '10px', left: '15px', fontSize: '0.72rem', fontWeight: 800, color: '#34d399' }}>
            ▲ Higher Accuracy Score
          </div>
          <div style={{ position: 'absolute', bottom: '10px', right: '15px', fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8' }}>
            Faster Inference Latency (Lower ms) ▶
          </div>

          {/* Grid lines */}
          <div style={{ position: 'absolute', inset: '40px', borderLeft: '1px dashed rgba(255,255,255,0.1)', borderBottom: '1px dashed rgba(255,255,255,0.1)' }} />

          {/* Model Scatter Nodes */}
          {topModels.map((m, i) => {
            // Y position (Accuracy 70% to 100% mapped to bottom 80% to top 15%)
            const yPct = 85 - (m.overallScore - 70) * 2.2
            // X position (Time ms 15ms to 700ms mapped to left 15% to right 85%)
            const xPct = 15 + Math.min(75, (m.timeMs / 700) * 75)

            return (
              <motion.div
                key={m.name}
                style={{
                  position: 'absolute',
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: hoveredModel?.name === m.name ? 10 : 2
                }}
                onMouseEnter={() => setHoveredModel(m)}
                onMouseLeave={() => setHoveredModel(null)}
                whileHover={{ scale: 1.3 }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '999px',
                    background: i === 0 ? 'rgba(251, 191, 36, 0.25)' : 'rgba(6, 182, 212, 0.25)',
                    border: `2px solid ${i === 0 ? '#fbbf24' : '#06b6d4'}`,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#fff',
                    boxShadow: i === 0 ? '0 0 15px rgba(251, 191, 36, 0.4)' : 'none'
                  }}
                >
                  {i + 1}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Tradeoff Explanation Sidebar */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {hoveredModel ? (
            <div>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#06b6d4' }}>
                {hoveredModel.type}
              </span>
              <h4 style={{ margin: '0.2rem 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                {hoveredModel.name}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                <div>Score: <strong style={{ color: '#fbbf24' }}>{hoveredModel.overallScore}%</strong></div>
                <div>Latency: <strong style={{ color: '#38bdf8' }}>{hoveredModel.timeMs}ms</strong></div>
                <div>Memory: <strong style={{ color: '#e2e8f0' }}>{hoveredModel.memory}</strong></div>
                <div>Carbon: <strong style={{ color: '#34d399' }}>{hoveredModel.carbon}</strong></div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center' }}>
              <Layers size={24} style={{ display: 'block', margin: '0 auto 0.5rem', opacity: 0.5 }} />
              Hover over any numbered node on the matrix map to inspect trade-off parameters.
            </div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
