import { motion } from 'framer-motion'
import { Layers, CheckCircle2, Lock, Zap, ChevronRight } from 'lucide-react'

export function ChromosomeBreakdownCard({ chromosomes = [] }) {
  return (
    <div className="chromosomes-section-grid" data-gsap="reveal">
      <div className="section-header-clean">
        <div className="section-tag-pill">
          <Layers size={13} className="text-purple" /> 6 CORE ML CHROMOSOMES
        </div>
        <h2 className="section-title">Genetic Machine Learning Strands</h2>
        <p className="section-desc-muted">
          Multidimensional ML competency chromosomes tracking your algorithm sequence stability.
        </p>
      </div>

      <div className="chromosomes-cards-grid">
        {chromosomes.map((chr, i) => (
          <motion.div
            key={chr.id}
            className={`chromosome-card glass ${chr.status.toLowerCase()}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            style={{ '--chr-accent': chr.color }}
          >
            <div className="chr-card-header">
              <span className="chr-code-badge" style={{ color: chr.color }}>{chr.code}</span>
              <span className={`chr-status-tag status-${chr.status.toLowerCase()}`}>
                {chr.status === 'Mastered' && <CheckCircle2 size={12} />}
                {chr.status}
              </span>
            </div>

            <div className="chr-card-title-row">
              <span className="chr-symbol" style={{ borderColor: chr.color }}>{chr.symbol}</span>
              <div className="chr-meta">
                <h4>{chr.name}</h4>
                <span className="chr-count-text">{chr.cleared} of {chr.total} Levels Active</span>
              </div>
            </div>

            <p className="chr-desc">{chr.desc}</p>

            <div className="chr-progress-wrap">
              <div className="rail">
                <div
                  className="fill"
                  style={{ width: `${chr.percentage}%`, background: chr.color }}
                />
              </div>
              <span className="pct-text">{chr.percentage}% Chromosome Health</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
