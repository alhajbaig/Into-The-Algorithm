import React from 'react'
import { motion } from 'framer-motion'
import { GitBranch, Check, ChevronDown, HelpCircle, Sparkles } from 'lucide-react'

export function InteractiveDecisionTree({ path }) {
  if (!path || !path.length) return null

  return (
    <motion.section
      className="ml-decision-tree-card glass"
      style={{ padding: '2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <GitBranch size={18} className="cc-icon-cyan" />
        <h2 className="ml-section-title">Interactive Decision Flow Diagram</h2>
        <span className="ml-badge">Algorithmic Path Trace</span>
      </div>

      <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
        Trace how ATLAS AI systematically evaluates dataset characteristics to navigate through model selection decision branches.
      </p>

      {/* Decision Tree Node Steps Flow */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
        {path.map((node, i) => (
          <motion.div
            key={node.step}
            className="glass"
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: '18px',
              border: i === path.length - 1 ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
              background: i === path.length - 1 ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.01 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: i === path.length - 1 ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)', color: i === path.length - 1 ? '#000' : '#38bdf8', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                #{node.step}
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                  {node.title}
                </span>
                <h4 style={{ margin: '0.1rem 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  {node.question}
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', borderRadius: '999px', background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#34d399', fontWeight: 800, fontSize: '0.8rem' }}>
              <Check size={14} /> {node.choice}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
