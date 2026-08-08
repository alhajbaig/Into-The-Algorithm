import { motion } from 'framer-motion'
import { Calendar, Award, BookOpen, ArrowRight } from 'lucide-react'

/**
 * Model Timeline View Component — Chronological milestones (1805–2026)
 */
export default function ModelTimelineView({ timelineData, onSelectModel }) {
  if (!timelineData) return null

  return (
    <div className="timeline-view-container">
      <div className="timeline-hero glass">
        <h3>CHRONOLOGICAL HISTORICAL TIMELINE & PARADIGM SHIFTS</h3>
        <p>Explore landmark breakthroughs that gave birth to modern machine intelligence.</p>
      </div>

      <div className="timeline-eras-stack">
        {timelineData.map((era) => (
          <div key={era.era} className="era-section glass">
            <div className="era-header">
              <Calendar size={16} color="#60a5fa" />
              <h4>{era.era}</h4>
            </div>

            <div className="era-models-grid">
              {era.models.map((model) => (
                <motion.div
                  key={model.id}
                  className="timeline-model-card glass"
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => onSelectModel(model.id)}
                >
                  <div className="card-top-row">
                    <span className="year-badge">{model.historicalMilestones.year}</span>
                    <span className="code-badge">{model.speciesCode}</span>
                  </div>

                  <h5>{model.name}</h5>
                  <p className="creator-text">By {model.historicalMilestones.creator}</p>
                  <p className="breakthrough-text">{model.historicalMilestones.breakthrough}</p>

                  <div className="card-footer-row">
                    <span className="family-tag">{model.family}</span>
                    <span className="inspect-link">Inspect <ArrowRight size={12} /></span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
