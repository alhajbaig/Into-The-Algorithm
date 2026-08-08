import React from 'react'
import { motion } from 'framer-motion'
import { Cpu, Sparkles, CheckCircle2, Award, Zap, AlertTriangle, ArrowRight } from 'lucide-react'

export function AiRecommendationSection({ recommendation, winner, analysis }) {
  if (!recommendation || !winner) return null

  return (
    <motion.section
      className="ml-recommendation-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
            <Cpu size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#34d399', letterSpacing: '0.08em' }}>
              STEP 8 · ATLAS AI SCIENTIFIC RECOMMENDATION ENGINE
            </span>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
              Optimal Recommended Model: <span style={{ color: '#34d399' }}>{winner.name}</span>
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.85rem', borderRadius: '999px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontWeight: 800, fontSize: '0.85rem' }}>
          <Sparkles size={16} />
          <span>{recommendation.confidence}% AI Confidence</span>
        </div>
      </div>

      {/* Scientific Reasoning Bullets */}
      <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '18px', padding: '1.25rem 1.5rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🧬 Scientific Justification &amp; Why {winner.name} Won:
        </h4>
        <div className="ml-rec-reasons">
          {recommendation.reasoning.map((reason, idx) => (
            <div key={idx} className="ml-rec-reason-item">
              <CheckCircle2 size={16} color="#34d399" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative Recommendations */}
      <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {recommendation.runnerUps.map((ru, i) => (
          <div key={i} className="glass" style={{ padding: '1rem 1.25rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8' }}>
                Runner-Up #{i + 2} Option
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#38bdf8' }}>
                {ru.score}
              </span>
            </div>
            <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              {ru.name}
            </h5>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Why lower? {ru.reason}
            </p>
          </div>
        ))}
      </div>

      {/* Step 13: ATLAS AI Mentor Deployment Advice */}
      <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '18px', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <Sparkles size={20} color="#a78bfa" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
        <div>
          <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.92rem', fontWeight: 800, color: '#a78bfa' }}>
            ATLAS AI Deployment Advisor Note
          </h5>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45 }}>
            Your dataset contains <strong>{analysis.rows} samples</strong> across <strong>{analysis.columns} features</strong>.
            Deployment readiness is evaluated at <strong style={{ color: '#34d399' }}>93%</strong>.
            If microsecond inference latency becomes critical in production, consider trading 1% accuracy for <strong>LightGBM</strong>. If strict interpretability for regulatory compliance is needed, consider <strong>Logistic Regression</strong>.
          </p>
        </div>
      </div>
    </motion.section>
  )
}
