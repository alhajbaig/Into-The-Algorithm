import { motion, AnimatePresence } from 'framer-motion'
import { X, Dna, Zap, CheckCircle2, Lock, ArrowRight } from 'lucide-react'

export function GeneSequenceInspector({ gene, onClose }) {
  if (!gene) return null

  return (
    <AnimatePresence>
      <motion.div
        className="gene-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="gene-modal-card glass"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>

          <div className="gene-modal-header">
            <span className="gene-tag" style={{ color: gene.color }}>{gene.code}</span>
            <h2>{gene.name}</h2>
            <span className="gene-status-badge">
              {gene.isCleared ? '✓ Active Gene Trait' : gene.isUnlocked ? 'Unlocked Gene' : 'Mutating Sequence'}
            </span>
          </div>

          <div className="gene-formula-box glass">
            <span className="formula-label">MATHEMATICAL GENE FORMULA</span>
            <div className="formula-code"><code>{gene.formula}</code></div>
          </div>

          <div className="gene-stats-grid">
            <div className="gene-stat-tile glass">
              <span className="lbl">Synaptic Mastery</span>
              <strong className="val" style={{ color: gene.color }}>{gene.mastery}%</strong>
            </div>
            <div className="gene-stat-tile glass">
              <span className="lbl">Stars Earned</span>
              <strong className="val">⭐ {gene.stars}/3</strong>
            </div>
            <div className="gene-stat-tile glass">
              <span className="lbl">Level Link</span>
              <strong className="val">Level {gene.levelId}</strong>
            </div>
          </div>

          <div className="gene-modal-footer">
            <button type="button" className="saas-btn-showcase" onClick={onClose}>
              <span>Close Inspection</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
