import { Award, Brain, Bot, ArrowRight } from 'lucide-react'

/**
 * Integration Badge Card Component — Bridges Quest System, Brain MRI, & AI Twin Recommendations
 */
export default function IntegrationBadgeCard({ synergy, onSelectModel }) {
  if (!synergy) return null

  const { clearedCount, masteredSpeciesCount, brainStrength, nextRecommendedModel, recommendationReason } = synergy

  return (
    <div className="integration-card-grid">
      {/* 1. Quest System Integration */}
      <div className="synergy-box glass">
        <div className="synergy-head">
          <Award size={18} color="#fbbf24" />
          <h4>QUEST SYSTEM ILLUMINATION</h4>
        </div>
        <div className="synergy-val">{masteredSpeciesCount} / 30 Species Unlocked</div>
        <p className="synergy-sub">{clearedCount} levels cleared in campaign. Master levels to illuminate higher-generation species nodes on the tree!</p>
      </div>

      {/* 2. ML Brain MRI Synergy */}
      <div className="synergy-box glass">
        <div className="synergy-head">
          <Brain size={18} color="#a78bfa" />
          <h4>ML BRAIN MRI SYNAPSE STRENGTH</h4>
        </div>
        <div className="synergy-val text-purple">{brainStrength}% Synaptic Activation</div>
        <div className="synergy-progress-rail">
          <div className="fill" style={{ width: `${brainStrength}%` }} />
        </div>
      </div>

      {/* 3. AI Digital Twin Recommendation */}
      <div className="synergy-box glass">
        <div className="synergy-head">
          <Bot size={18} color="#60a5fa" />
          <h4>AI DIGITAL TWIN RECOMMENDATION</h4>
        </div>
        <p className="synergy-reason">{recommendationReason}</p>
        <button
          type="button"
          className="btn-next-rec"
          onClick={() => onSelectModel(nextRecommendedModel.id)}
        >
          Study {nextRecommendedModel.name} Genome <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}
