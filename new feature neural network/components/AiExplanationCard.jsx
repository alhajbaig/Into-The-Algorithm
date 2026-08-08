import { Sparkles, Brain, AlertCircle } from 'lucide-react'

/**
 * AI Explanation Card Component
 * Renders real-time AI teacher insights for neural activations and optimizer behavior.
 */
export default function AiExplanationCard({ explanations = [] }) {
  if (!explanations || explanations.length === 0) return null

  return (
    <div className="activation-desc-card" style={{ borderColor: 'rgba(192, 132, 252, 0.3)' }}>
      <div className="act-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="#c084fc" />
          <h5>AI TEACHER INSIGHT: {explanations[0].title}</h5>
        </div>
      </div>
      <p>{explanations[0].text}</p>
    </div>
  )
}
