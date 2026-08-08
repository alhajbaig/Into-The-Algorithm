import React from 'react'
import { motion } from 'framer-motion'
import {
  Database, Activity, AlertTriangle, ShieldCheck, CheckCircle2,
  PieChart, Hash, Layers, HelpCircle
} from 'lucide-react'

export function DatasetAnalysisSection({ analysis, onTargetChange }) {
  if (!analysis) return null

  const stats = [
    { label: 'Rows / Records', val: analysis.rows.toLocaleString(), icon: Database, color: '#60a5fa' },
    { label: 'Columns / Features', val: analysis.columns, icon: Layers, color: '#38bdf8' },
    { label: 'Numerical Features', val: analysis.numericalFeatures.length, icon: Hash, color: '#06b6d4' },
    { label: 'Categorical Features', val: analysis.categoricalFeatures.length, icon: PieChart, color: '#8b5cf6' },
    { label: 'Missing Values', val: analysis.totalMissing.toLocaleString(), icon: AlertTriangle, color: analysis.totalMissing > 0 ? '#fbbf24' : '#34d399' },
    { label: 'Duplicate Rows', val: analysis.duplicateRows, icon: CheckCircle2, color: analysis.duplicateRows > 0 ? '#f87171' : '#34d399' },
    { label: 'Outliers Detected', val: analysis.totalOutliers, icon: Activity, color: '#f59e0b' },
    { label: 'Dataset Health Score', val: `${analysis.healthScore}/100`, icon: ShieldCheck, color: analysis.healthScore > 80 ? '#34d399' : '#fbbf24' }
  ]

  return (
    <motion.section
      className="ml-analysis-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Database size={18} className="cc-icon-cyan" />
        <h2 className="ml-section-title">Automated Dataset Analysis</h2>
        <span className="ml-badge">Exploratory Data Analysis (EDA)</span>
      </div>

      {/* Target Column Selector Bar */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '18px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>🎯 Target Column to Predict:</span>
          <select
            value={analysis.targetColumn}
            onChange={(e) => onTargetChange(e.target.value)}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid #06b6d4',
              color: '#38bdf8',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {analysis.headers.map((h) => (
              <option key={h} value={h} style={{ background: '#0a0d1a', color: '#fff' }}>
                {h} {h === analysis.targetColumn ? '(Auto-Detected Target)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Memory Footprint: <strong style={{ color: '#38bdf8' }}>{analysis.memoryUsageMB} MB</strong>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="ml-analysis-grid">
        {stats.map((st, i) => {
          const Icon = st.icon
          return (
            <motion.div
              key={st.label}
              className="ml-stat-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, borderColor: st.color }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="ml-stat-lbl">{st.label}</span>
                <Icon size={18} style={{ color: st.color }} />
              </div>
              <span className="ml-stat-val" style={{ color: st.color }}>
                {st.val}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Step 3: Automatic Problem Detection Card */}
      <div className="ml-problem-card">
        <div style={{ padding: '0.75rem', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
          <Activity size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#c084fc', letterSpacing: '0.06em' }}>
              STEP 3 · AUTOMATIC PROBLEM DETECTION
            </span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
              {analysis.problemConfidence}% Confidence
            </span>
          </div>
          <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            Detected Problem Type: <span style={{ color: '#38bdf8' }}>{analysis.problemType}</span>
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.45 }}>
            {analysis.problemReason}
          </p>
        </div>
      </div>
    </motion.section>
  )
}
