import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Activity, PieChart, Layers } from 'lucide-react'

export function VisualizationsSection({ featureImportances, correlations }) {
  if (!featureImportances || !featureImportances.length) return null

  return (
    <motion.section
      className="ml-viz-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <BarChart3 size={18} className="cc-icon-cyan" />
        <h2 className="ml-section-title">Interactive Visualizations</h2>
        <span className="ml-badge">Feature Contributions &amp; Heatmaps</span>
      </div>

      <div className="ml-viz-grid">
        {/* Feature Importance Card */}
        <div className="ml-viz-card glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Activity size={18} color="#06b6d4" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
              Feature Importance Weights (Gini Impurity)
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {featureImportances.map((item, i) => (
              <div key={item.feature} className="ml-feat-bar-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{item.feature}</span>
                  <span style={{ fontWeight: 800, color: '#38bdf8' }}>{(item.importance * 100).toFixed(1)}%</span>
                </div>
                <div className="ml-feat-bar-track">
                  <motion.div
                    className="ml-feat-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.importance * 100 * 2.2}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Correlation Heatmap Card */}
        <div className="ml-viz-card glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PieChart size={18} color="#a78bfa" />
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
              Feature Correlation Matrix
            </h4>
          </div>

          {correlations && correlations.labels && correlations.labels.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${correlations.labels.length + 1}, 1fr)`, gap: '4px', fontSize: '0.68rem', fontFamily: 'monospace' }}>
                <div></div>
                {correlations.labels.map(l => (
                  <div key={l} style={{ fontWeight: 800, color: '#38bdf8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {l.slice(0, 6)}
                  </div>
                ))}

                {correlations.values.map((row, rIdx) => (
                  <React.Fragment key={rIdx}>
                    <div style={{ fontWeight: 800, color: '#a78bfa', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {correlations.labels[rIdx].slice(0, 6)}
                    </div>
                    {row.map((val, cIdx) => {
                      const color = val > 0.5 ? 'rgba(52, 211, 153, 0.4)' : val < -0.5 ? 'rgba(248, 113, 113, 0.4)' : 'rgba(255, 255, 255, 0.04)'
                      return (
                        <div
                          key={cIdx}
                          style={{
                            background: color,
                            padding: '0.35rem 0.2rem',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontWeight: 700,
                            color: '#fff'
                          }}
                        >
                          {val}
                        </div>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Upload dataset with 2+ numerical columns to generate Pearson correlation heatmap.
            </p>
          )}
        </div>
      </div>
    </motion.section>
  )
}
