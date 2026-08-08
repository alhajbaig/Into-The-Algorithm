/**
 * Failure Modes Diagnostic Engine
 * Analyzes neural network activations and gradients to detect educational AI anomalies.
 */
export function diagnoseFailureModes(model) {
  const anomalies = []

  if (!model || !model.activations) return anomalies

  // 1. Dead ReLU Detection (Neurons with 0 activation across hidden layers)
  let deadReLUCount = 0
  for (let l = 1; l < model.activations.length - 1; l++) {
    const layerAct = model.activations[l]
    deadReLUCount += layerAct.filter((a) => a === 0).length
  }

  if (deadReLUCount > 2 && model.activationKey === 'relu') {
    anomalies.push({
      id: 'dead_relu',
      type: 'warning',
      title: `${deadReLUCount} Dead ReLUs Detected`,
      message: 'Neurons are permanently outputting 0 because negative inputs pressed gradients to zero. Switch to Leaky ReLU or GELU to fix.',
    })
  }

  // 2. Vanishing Gradient Warning for deep Sigmoid/Tanh
  if (model.layerSizes.length >= 4 && (model.activationKey === 'sigmoid' || model.activationKey === 'tanh')) {
    anomalies.push({
      id: 'vanishing_grad',
      type: 'critical',
      title: 'Vanishing Gradients Imminent',
      message: 'Deep layers with Sigmoid/Tanh activations cause backprop gradient signals to decay exponentially toward zero.',
    })
  }

  // 3. Excessive Learning Rate Warning
  if (model.lr > 0.15) {
    anomalies.push({
      id: 'high_lr',
      type: 'warning',
      title: 'High Learning Rate (α > 0.15)',
      message: 'Learning rate is high. Loss may oscillate or diverge instead of smoothly converging.',
    })
  }

  return anomalies
}
