import { motion } from 'framer-motion'
import { Layers, Grid, ArrowRight } from 'lucide-react'

/**
 * Ecosystem Navigator Component — Explores ML algorithms by ecosystem niches
 */
export default function EcosystemNavigator({
  ecosystems,
  selectedEcosystem,
  setSelectedEcosystem,
  filteredModelsList,
  onSelectModel,
}) {
  return (
    <div className="ecosystem-nav-container">
      <div className="ecosystem-hero glass">
        <h3>MODEL ECOSYSTEM NAVIGATOR</h3>
        <p>Browse ML algorithms categorized by real-world ecosystem applications & problem domains.</p>

        <div className="ecosystem-pills-row">
          {ecosystems.map((eco) => (
            <button
              key={eco}
              type="button"
              className={`eco-pill ${selectedEcosystem === eco ? 'active' : ''}`}
              onClick={() => setSelectedEcosystem(eco)}
            >
              {eco.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="ecosystem-species-grid">
        {filteredModelsList.map((model) => (
          <motion.div
            key={model.id}
            className="eco-species-card glass"
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectModel(model.id)}
          >
            <div className="card-top">
              <span className="code-badge">{model.speciesCode}</span>
              <span className="eco-tag">{model.ecosystem}</span>
            </div>

            <h4>{model.name}</h4>
            <p className="arch-desc">{model.architecture}</p>
            <p className="type-sub">{model.algorithmType} • {model.learningParadigm}</p>

            <div className="eco-strengths-mini">
              <strong>Key Adaptation:</strong> {model.strengths[0]}
            </div>

            <div className="eco-card-foot">
              <span className="gen-tag">{model.generation}</span>
              <span className="inspect-btn">Inspect DNA →</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
