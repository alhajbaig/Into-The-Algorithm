import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, X, Zap } from 'lucide-react'

/**
 * Neuron Inspector Drawer Component
 * Interactive slide-out drawer providing granular neuron parameters (Activation, Bias, Weights).
 */
export default function NeuronInspectorDrawer({ neuron, onClose, model }) {
  if (!neuron) return null

  const { layerSizes = [], weights = [], biases = [] } = model || {}

  // Fetch weights associated with this neuron
  const isInput = neuron.layerIndex === 0
  const isOutput = neuron.layerIndex === layerSizes.length - 1

  const incomingW = !isInput && weights[neuron.layerIndex - 1]
    ? weights[neuron.layerIndex - 1][neuron.neuronIndex] || []
    : []

  const neuronBias = !isInput && biases[neuron.layerIndex - 1]
    ? biases[neuron.layerIndex - 1][neuron.neuronIndex] || 0
    : 0

  return (
    <AnimatePresence>
      <motion.div
        className="neuron-inspector-drawer"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 60 }}
      >
        <div className="drawer-header">
          <div className="neuron-id-tag">
            <Cpu size={14} color="#60a5fa" />
            <span>NEURON {neuron.id}</span>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          <span className="drawer-layer-title">
            LAYER {neuron.layerIndex} • {isInput ? 'INPUT LAYER' : isOutput ? 'OUTPUT LAYER' : 'HIDDEN LAYER'}
          </span>

          <div className="activation-big-box">
            <span className="act-label">CURRENT ACTIVATION OUTPUT a(z)</span>
            <span className="act-val">{neuron.activation.toFixed(4)}</span>
          </div>

          <div className="param-grid">
            <div className="param-item">
              <span className="p-label">NEURON BIAS (b)</span>
              <span className="p-val">{neuronBias.toFixed(4)}</span>
            </div>
            <div className="param-item">
              <span className="p-label">ACTIVATION FUNCTION</span>
              <span className="p-val text-cyan">{model.activationKey.toUpperCase()}</span>
            </div>
          </div>

          {!isInput && incomingW.length > 0 && (
            <div className="weights-section">
              <h5>INCOMING WEIGHT VECTOR (W)</h5>
              <div className="weights-list">
                {incomingW.map((w, idx) => (
                  <div key={idx} className="weight-item">
                    <span>w_{idx} → {neuron.neuronIndex}</span>
                    <span className={w >= 0 ? 'text-cyan' : 'text-purple'}>{w.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
