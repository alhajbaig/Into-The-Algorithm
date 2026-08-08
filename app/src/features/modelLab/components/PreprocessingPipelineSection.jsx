import React from 'react'
import { motion } from 'framer-motion'
import { Sliders, CheckCircle2, ArrowRight } from 'lucide-react'

export function PreprocessingPipelineSection({ steps }) {
  if (!steps || !steps.length) return null

  return (
    <motion.section
      className="ml-pipeline-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Sliders size={18} className="cc-icon-purple" />
        <h2 className="ml-section-title">Automated Data Preprocessing Pipeline</h2>
        <span className="ml-badge">Leakage-Free ColumnTransformers</span>
      </div>

      <div className="ml-pipeline-list">
        {steps.map((step, i) => (
          <motion.div
            key={step.name}
            className="ml-pipeline-step glass"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', display: 'grid', placeItems: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
              {i + 1}
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.15rem', fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                {step.name}
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                {step.method}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 800, color: '#34d399', padding: '0.2rem 0.65rem', borderRadius: '999px', background: 'rgba(52, 211, 153, 0.1)' }}>
              <CheckCircle2 size={13} /> {step.status}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
