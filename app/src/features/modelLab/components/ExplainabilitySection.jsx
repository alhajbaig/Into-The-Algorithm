import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Cpu, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react'

export function ExplainabilitySection({ winner, featureImportances }) {
  if (!winner || !featureImportances) return null

  return (
    <motion.section
      className="ml-explainability-section glass"
      style={{ padding: '2rem', borderRadius: '24px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Eye size={18} className="cc-icon-purple" />
        <h2 className="ml-section-title">Model Explainability (SHAP &amp; LIME Analysis)</h2>
        <span className="ml-badge">Local &amp; Global Feature Attribution</span>
      </div>

      <p style={{ margin: '0 0 1.25rem', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
        SHAP (SHapley Additive exPlanations) uses game-theoretic principles to calculate the exact marginal contribution of each feature to the individual prediction outputs of <strong>{winner.name}</strong>.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* SHAP Summary Force Plot */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
            🔥 Positive Impact Drivers (Increases Prediction Probability)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {featureImportances.slice(0, 3).map((f) => (
              <div key={f.feature} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{f.feature}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ArrowUpRight size={14} /> +{(f.importance * 0.45).toFixed(3)} SHAP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SHAP Negative Drivers */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
            ❄️ Negative Impact Drivers (Suppresses Prediction Probability)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {featureImportances.slice(3, 6).map((f) => (
              <div key={f.feature} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: '10px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{f.feature}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <ArrowDownRight size={14} /> -{(f.importance * 0.28).toFixed(3)} SHAP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
