import { motion } from 'framer-motion'
import { Sliders, Dna, Zap, Activity, RefreshCw } from 'lucide-react'

/**
 * Model Mutation Lab View Component — Hyperparameter genetic mutation simulation
 */
export default function ModelMutationLabView({
  model,
  mutationParams,
  setMutationParams,
  mutationResult,
}) {
  if (!model) return null

  const { baseTraits, mutatedTraits, mutatedDna } = mutationResult || {}

  const handleParamChange = (key, val) => {
    setMutationParams((prev) => ({ ...prev, [key]: val }))
  }

  const resetMutations = () => {
    setMutationParams({
      maxDepth: 6,
      nEstimators: 100,
      learningRate: 0.05,
      regularization: 1.0,
      activation: 'relu',
      optimizer: 'adam',
    })
  }

  const traitKeys = [
    { key: 'bias', label: 'Bias' },
    { key: 'variance', label: 'Variance' },
    { key: 'generalization', label: 'Generalization' },
    { key: 'interpretability', label: 'Interpretability' },
    { key: 'speed', label: 'Inference Speed' },
    { key: 'trainingStability', label: 'Training Stability' },
  ]

  return (
    <div className="mutation-lab-container">
      <div className="mutation-hero glass">
        <div className="mutation-title-group">
          <h3>
            <Dna className="icon-pulse" size={20} color="#34d399" />
            <span>MODEL HYPERPARAMETER MUTATION LAB</span>
          </h3>
          <p className="mutation-desc">
            Mutate hyperparameter genes and observe real-time genetic trait drift, bias-variance shifts, and species adaptation.
          </p>
        </div>

        <div className="mutated-dna-pill glass">
          <span className="pill-label">MUTATED DNA STRAND:</span>
          <span className="code-badge text-green">{mutatedDna}</span>
        </div>
      </div>

      <div className="mutation-grid">
        {/* Left Column: Hyperparameter Genetic Sliders */}
        <div className="mutation-sliders-card glass">
          <div className="card-head-row">
            <h4><Sliders size={16} /> GENETIC HYPERPARAMETER SLIDERS</h4>
            <button type="button" className="btn-reset" onClick={resetMutations}>
              <RefreshCw size={13} /> Reset Genes
            </button>
          </div>

          {/* Tree Depth Gene */}
          <div className="gene-group">
            <div className="gene-header">
              <label>Tree / Layer Depth (Gene: Depth)</label>
              <span className="gene-val">{mutationParams.maxDepth}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={mutationParams.maxDepth}
              onChange={(e) => handleParamChange('maxDepth', parseInt(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Estimators Gene */}
          <div className="gene-group">
            <div className="gene-header">
              <label>Estimator Count (Gene: n_estimators)</label>
              <span className="gene-val">{mutationParams.nEstimators} Trees</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={mutationParams.nEstimators}
              onChange={(e) => handleParamChange('nEstimators', parseInt(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Learning Rate Gene */}
          <div className="gene-group">
            <div className="gene-header">
              <label>Learning Rate (Gene: η)</label>
              <span className="gene-val">{mutationParams.learningRate}</span>
            </div>
            <input
              type="range"
              min="0.001"
              max="0.5"
              step="0.005"
              value={mutationParams.learningRate}
              onChange={(e) => handleParamChange('learningRate', parseFloat(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Regularization Lambda Gene */}
          <div className="gene-group">
            <div className="gene-header">
              <label>Regularization Penalty (Gene: λ / L2)</label>
              <span className="gene-val">{mutationParams.regularization}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="10.0"
              step="0.2"
              value={mutationParams.regularization}
              onChange={(e) => handleParamChange('regularization', parseFloat(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Activation Selector */}
          <div className="gene-group">
            <label>Activation Function Gene:</label>
            <select
              className="gene-select"
              value={mutationParams.activation}
              onChange={(e) => handleParamChange('activation', e.target.value)}
            >
              <option value="relu">ReLU (Rectified Linear Unit)</option>
              <option value="gelu">GELU (Gaussian Error Linear Unit)</option>
              <option value="swish">Swish (SiLU)</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="tanh">Tanh</option>
            </select>
          </div>
        </div>

        {/* Right Column: Real-Time Genetic Trait Drift */}
        <div className="mutation-drift-card glass">
          <h4><Activity size={16} color="#38bdf8" /> REAL-TIME GENETIC TRAIT DRIFT</h4>
          <div className="drift-bars-list">
            {traitKeys.map((item) => {
              const baseVal = baseTraits[item.key] || 50
              const mutVal = mutatedTraits[item.key] || 50
              const diff = mutVal - baseVal

              return (
                <div key={item.key} className="drift-row">
                  <div className="drift-header">
                    <span>{item.label}</span>
                    <span className="drift-values">
                      {baseVal}% → <strong className={diff >= 0 ? 'text-green' : 'text-red'}>{mutVal}%</strong>
                      {diff !== 0 && (
                        <span className={`diff-tag ${diff > 0 ? 'pos' : 'neg'}`}>
                          ({diff > 0 ? `+${diff}` : diff}%)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="drift-rail-group">
                    {/* Base bar */}
                    <div className="drift-rail base">
                      <div className="fill" style={{ width: `${baseVal}%` }} />
                    </div>
                    {/* Mutated bar */}
                    <div className="drift-rail mutated">
                      <div
                        className="fill"
                        style={{
                          width: `${mutVal}%`,
                          background: diff >= 0 ? '#34d399' : '#f87171',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
