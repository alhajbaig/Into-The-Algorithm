import { motion, AnimatePresence } from 'framer-motion'
import { X, Dna, Cpu, ShieldAlert, Award, Activity, Zap, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react'
import GeneticTraitsRadar from './GeneticTraitsRadar'

/**
 * Model Genome Inspector Drawer Component
 * Deep-dive panel for complete species genome, mathematical equations, parameters & failure modes.
 */
export default function ModelGenomeInspectorModal({ model, onClose }) {
  if (!model) return null

  return (
    <AnimatePresence>
      <motion.div
        className="genome-inspector-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="genome-inspector-drawer glass"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="drawer-head">
            <div className="species-identity">
              <span className="code-badge">{model.speciesCode}</span>
              <h2>{model.name}</h2>
              <span className="species-family-tag">{model.family} • {model.generation}</span>
            </div>
            <button type="button" className="close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="drawer-scroll-content">
            {/* Genetic Traits Radar */}
            <GeneticTraitsRadar model={model} />

            {/* Genome Metadata Grid */}
            <div className="genome-spec-section glass">
              <h4><Dna size={16} color="#60a5fa" /> SPECIES GENOME SPECIFICATION</h4>
              <div className="spec-grid">
                <div className="spec-item">
                  <span className="spec-label">Algorithm Type</span>
                  <span className="spec-val">{model.algorithmType}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Learning Paradigm</span>
                  <span className="spec-val">{model.learningParadigm}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Input / Output Type</span>
                  <span className="spec-val">{model.inputType} → {model.outputType}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Model Architecture</span>
                  <span className="spec-val">{model.architecture}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Parameters Formulation</span>
                  <span className="spec-val code-badge">{model.parameters}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Ecosystem Niche</span>
                  <span className="spec-val">{model.ecosystem}</span>
                </div>
              </div>
            </div>

            {/* Complexity & Hardware Scaling */}
            <div className="genome-spec-section glass">
              <h4><Cpu size={16} color="#34d399" /> COMPUTATIONAL & MEMORY COMPLEXITY</h4>
              <div className="spec-grid">
                <div className="spec-item">
                  <span className="spec-label">Training Complexity O(·)</span>
                  <span className="spec-val code-badge">{model.complexity.trainTime}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Inference Complexity O(·)</span>
                  <span className="spec-val code-badge">{model.complexity.inferTime}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Memory Footprint</span>
                  <span className="spec-val code-badge">{model.complexity.memory}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Scalability Profile</span>
                  <span className="spec-val">{model.complexity.scalability}</span>
                </div>
              </div>
            </div>

            {/* Optimization & Strategy */}
            <div className="genome-spec-section glass">
              <h4><Zap size={16} color="#fbbf24" /> OPTIMIZATION & DECISION STRATEGY</h4>
              <p className="strategy-text"><strong>Training Style:</strong> {model.trainingStyle}</p>
              <p className="strategy-text"><strong>Optimization Objective:</strong> {model.optimizationStrategy}</p>
              <p className="strategy-text"><strong>Decision Mechanism:</strong> {model.decisionMechanism}</p>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="genome-two-col-grid">
              <div className="strength-box glass">
                <h4 className="text-green"><CheckCircle2 size={16} /> EVOLUTIONARY ADAPTATIONS (STRENGTHS)</h4>
                <ul>
                  {model.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="weakness-box glass">
                <h4 className="text-red"><AlertTriangle size={16} /> SPECIES LIMITATIONS (WEAKNESSES)</h4>
                <ul>
                  {model.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Failure Conditions */}
            <div className="failure-modes-box glass">
              <h4><ShieldAlert size={16} color="#f87171" /> KNOWN EXTINCTION / FAILURE SCENARIOS</h4>
              <ul>
                {model.failureConditions.map((fc, i) => (
                  <li key={i}>{fc}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
