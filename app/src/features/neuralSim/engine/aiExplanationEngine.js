import { ACTIVATION_FUNCTIONS } from './activationFunctions'

/**
 * AI Explanation Engine
 * Contextual Natural Language Teacher generating real-time explanations for neural dynamics.
 */
export function generateAiExplanations(model, selectedNeuron, failureModes = []) {
  const explanations = []

  const actObj = ACTIVATION_FUNCTIONS[model?.activationKey] || ACTIVATION_FUNCTIONS.relu

  // 1. Selected Neuron Explanation
  if (selectedNeuron) {
    const actVal = selectedNeuron.activation || 0
    if (actVal > 0.5) {
      explanations.push({
        id: 'high_act',
        type: 'activation',
        title: `Neuron ${selectedNeuron.id} High Firing Rate`,
        text: `This neuron is firing strongly at ${actVal.toFixed(3)} output because the weighted sum of its inputs passed through ${actObj.name}.`,
      })
    } else if (actVal === 0) {
      explanations.push({
        id: 'zero_act',
        type: 'warning',
        title: `Neuron ${selectedNeuron.id} Inactive (0.000)`,
        text: `Weighted input sum fell into the non-activating zone of ${actObj.name}, outputting zero contribution to downstream layers.`,
      })
    } else {
      explanations.push({
        id: 'norm_act',
        type: 'activation',
        title: `Neuron ${selectedNeuron.id} Moderate Activity`,
        text: `Output activation is ${actVal.toFixed(3)}. Inputs are balanced across positive and negative weights.`,
      })
    }
  }

  // 2. Optimizer & Learning Explanation
  if (model.optimizerKey === 'adam') {
    explanations.push({
      id: 'opt_adam',
      type: 'optimizer',
      title: 'Adam Optimizer Active',
      text: 'Adam dynamically scales learning rates per parameter using exponential moving averages of past gradients (m) and squared gradients (v).',
    })
  } else if (model.optimizerKey === 'momentum') {
    explanations.push({
      id: 'opt_momentum',
      type: 'optimizer',
      title: 'Momentum SGD Active',
      text: 'Momentum accelerates gradient descent in relevant directions and dampens oscillations by accumulating a velocity vector.',
    })
  } else {
    explanations.push({
      id: 'opt_sgd',
      type: 'optimizer',
      title: 'Standard SGD Active',
      text: 'Stochastic Gradient Descent updates weights proportionally to current gradients without memory buffers.',
    })
  }

  // 3. Failure Mode Explanation
  if (failureModes.length > 0) {
    explanations.push({
      id: 'failure_expl',
      type: 'alert',
      title: failureModes[0].title,
      text: failureModes[0].message,
    })
  }

  return explanations
}
