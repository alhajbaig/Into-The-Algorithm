import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Sparkles, ArrowUpRight } from 'lucide-react'

export function IndustryUseCasesSection({ winner }) {
  if (!winner || !winner.companies) return null

  return (
    <motion.section
      className="ml-industry-section glass"
      style={{ padding: '2rem', borderRadius: '24px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <Building2 size={18} className="cc-icon-cyan" />
        <h2 className="ml-section-title">Real-World Industry Enterprise Adoption</h2>
        <span className="ml-badge">Where {winner.name} Powers Production</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {winner.companies.map((comp, idx) => (
          <motion.div
            key={comp.name}
            className="glass"
            style={{ padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.06)' }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, borderColor: '#06b6d4' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.8rem' }}>{comp.logo}</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                  {comp.name}
                </h4>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8' }}>
                  ENTERPRISE DEPLOYMENT
                </span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45 }}>
              {comp.reason}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
