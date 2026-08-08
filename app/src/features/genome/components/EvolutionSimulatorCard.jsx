import { useState } from 'react'
import { Sliders, Zap, Flame, Sparkles, RefreshCw } from 'lucide-react'

export function EvolutionSimulatorCard({ baseGenomeHealth = 50 }) {
  const [learningRate, setLearningRate] = useState(0.05)
  const [mutationRate, setMutationRate] = useState(0.15)
  const [epochs, setEpochs] = useState(50)

  const simulatedAdaptability = Math.min(
    100,
    Math.round(baseGenomeHealth + (learningRate * 200) + (epochs * 0.4) - (mutationRate * 30))
  )

  return (
    <div className="evolution-sim-card glass" data-gsap="reveal">
      <div className="card-head-row">
        <div className="card-head-title">
          <Sliders size={16} className="text-cyan" />
          <span>Neural Evolution &amp; Mutation Simulator</span>
        </div>
        <span className="card-badge-muted">Interactive Laboratory</span>
      </div>

      <p className="sim-desc">
        Adjust learning rate adaptability and mutation coefficients to simulate neural genome evolution velocity.
      </p>

      <div className="sim-controls-grid">
        <div className="sim-ctrl-item">
          <div className="ctrl-head">
            <span>Learning Rate Adaptability (η)</span>
            <strong>{learningRate}</strong>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          />
        </div>

        <div className="sim-ctrl-item">
          <div className="ctrl-head">
            <span>Chromosome Mutation Rate (μ)</span>
            <strong>{mutationRate}</strong>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={mutationRate}
            onChange={(e) => setMutationRate(parseFloat(e.target.value))}
          />
        </div>

        <div className="sim-ctrl-item">
          <div className="ctrl-head">
            <span>Practice Epochs</span>
            <strong>{epochs}</strong>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={epochs}
            onChange={(e) => setEpochs(parseInt(e.target.value, 10))}
          />
        </div>
      </div>

      <div className="sim-output-box glass">
        <div className="output-metric">
          <span className="lbl">Simulated Adaptability Index</span>
          <strong className="val text-purple">{simulatedAdaptability}%</strong>
        </div>
        <div className="output-status">
          <Sparkles size={14} className="text-gold" />
          <span>Optimal Hyperparameter Configuration Active</span>
        </div>
      </div>
    </div>
  )
}
