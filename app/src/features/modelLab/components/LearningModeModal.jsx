import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, X, Code, CheckCircle2, AlertTriangle, Cpu, Layers, HelpCircle, Sparkles } from 'lucide-react'
import { ALGORITHM_KNOWLEDGE } from '../engine/algorithmKnowledge'

export function LearningModeModal({ modelName, onClose }) {
  if (!modelName) return null

  const info = ALGORITHM_KNOWLEDGE[modelName] || ALGORITHM_KNOWLEDGE['Random Forest']

  return (
    <AnimatePresence>
      <motion.div
        className="ml-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="ml-modal-card glass"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.35)', display: 'grid', placeItems: 'center', fontSize: '1.5rem' }}>
                {info.icon}
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#06b6d4', letterSpacing: '0.06em' }}>
                  STEP 12 · EDUCATIONAL DEEP DIVE &amp; CODE
                </span>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                  {info.name}
                </h2>
              </div>
            </div>
            <motion.button
              type="button"
              className="fl-export-btn"
              style={{ padding: '0.5rem', borderRadius: '50%' }}
              onClick={onClose}
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Body Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Theory */}
            <div>
              <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} /> Theoretical Foundation
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                {info.theory}
              </p>
            </div>

            {/* Clean Mathematical Notation Card */}
            <div className="ml-math-card">
              <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.88rem', fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🧮 Mathematical Formulation
              </h4>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace', padding: '0.4rem 0' }}>
                {modelName.includes('Random Forest') && (
                  <span>f(x) = (1 / B) * ∑ [ b=1 → B ] T_b(x)</span>
                )}
                {modelName.includes('XGBoost') && (
                  <span>L^(t) = ∑ [ i=1 → n ] l( y_i, ŷ_i^(t-1) + f_t(x_i) ) + Ω(f_t)</span>
                )}
                {modelName.includes('Logistic') && (
                  <span>σ(z) = 1 / ( 1 + e^-(w^T x + b) )</span>
                )}
                {modelName.includes('SVM') && (
                  <span>min 1/2 ||w||² + C ∑ ξ_i</span>
                )}
                {!modelName.includes('Random Forest') && !modelName.includes('XGBoost') && !modelName.includes('Logistic') && !modelName.includes('SVM') && (
                  <span>f(x) = argmax P(Y = k | X = x)</span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Where B = number of decision trees, T_b(x) = prediction of individual tree b.
              </div>
            </div>

            {/* Pros & Cons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(52, 211, 153, 0.05)', padding: '1.1rem', borderRadius: '16px', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
                <h5 style={{ margin: '0 0 0.5rem', color: '#34d399', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={16} /> Advantages &amp; Strengths
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem', lineHeight: 1.45 }}>
                  {info.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              <div style={{ background: 'rgba(248, 113, 113, 0.05)', padding: '1.1rem', borderRadius: '16px', border: '1px solid rgba(248, 113, 113, 0.25)' }}>
                <h5 style={{ margin: '0 0 0.5rem', color: '#f87171', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertTriangle size={16} /> Disadvantages &amp; Trade-offs
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem', lineHeight: 1.45 }}>
                  {info.cons.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>

            {/* Complexity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#64748b' }}>Time Complexity:</span> <strong style={{ color: '#fff' }}>{info.timeComplexity}</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#64748b' }}>Space Complexity:</span> <strong style={{ color: '#fff' }}>{info.spaceComplexity}</strong>
              </div>
            </div>

            {/* Scikit-Learn Python Code */}
            <div>
              <h4 style={{ margin: '0 0 0.4rem', fontSize: '0.92rem', fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Code size={16} /> Scikit-learn &amp; PyTorch Implementation Code
              </h4>
              <pre className="ml-code-block">
                {info.pythonCode}
              </pre>
            </div>

            {/* Interview Q&As */}
            <div>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HelpCircle size={16} /> Technical Interview Questions &amp; Answers
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {info.interviewQuestions.map((iq, idx) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      Q: {iq.q}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.45 }}>
                      A: {iq.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <motion.button
              type="button"
              className="fl-btn-primary"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close Learning Guide
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
