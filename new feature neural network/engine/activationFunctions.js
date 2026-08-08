/**
 * Mathematical Activation Functions & Derivatives
 */
export const ACTIVATION_FUNCTIONS = {
  relu: {
    id: 'relu',
    name: 'ReLU (Rectified Linear Unit)',
    formula: 'f(x) = max(0, x)',
    description: 'Computes max(0, x). Fast and prevents vanishing gradients for positive inputs, but can cause Dead ReLUs if inputs remain negative.',
    fn: (x) => Math.max(0, x),
    derivative: (x) => (x > 0 ? 1 : 0),
  },
  sigmoid: {
    id: 'sigmoid',
    name: 'Sigmoid',
    formula: 'σ(x) = 1 / (1 + e^-x)',
    description: 'Squashes values into (0, 1). Ideal for binary probabilities, but suffers from severe vanishing gradients at extreme values.',
    fn: (x) => 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, x)))),
    derivative: (x) => {
      const s = 1 / (1 + Math.exp(-Math.max(-15, Math.min(15, x))))
      return s * (1 - s)
    },
  },
  tanh: {
    id: 'tanh',
    name: 'Tanh (Hyperbolic Tangent)',
    formula: 'tanh(x) = (e^x - e^-x) / (e^x + e^-x)',
    description: 'Zero-centered output in (-1, 1). Stronger gradients than Sigmoid near zero, but still subject to saturation at extremes.',
    fn: (x) => Math.tanh(x),
    derivative: (x) => 1 - Math.pow(Math.tanh(x), 2),
  },
  leaky_relu: {
    id: 'leaky_relu',
    name: 'Leaky ReLU (α = 0.01)',
    formula: 'f(x) = max(0.01x, x)',
    description: 'Allows a small gradient (0.01) when x < 0, completely preventing the Dead ReLU problem.',
    fn: (x) => (x > 0 ? x : 0.01 * x),
    derivative: (x) => (x > 0 ? 1 : 0.01),
  },
  gelu: {
    id: 'gelu',
    name: 'GELU (Gaussian Error Linear Unit)',
    formula: 'f(x) = x * Φ(x)',
    description: 'Smooth non-linear activation used in Transformers (GPT, BERT) that weights inputs by their probability under a Gaussian distribution.',
    fn: (x) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * Math.pow(x, 3)))),
    derivative: (x) => {
      const c = Math.sqrt(2 / Math.PI)
      const c2 = 0.044715
      const inner = c * (x + c2 * Math.pow(x, 3))
      const sech2 = 1 - Math.pow(Math.tanh(inner), 2)
      return 0.5 * (1 + Math.tanh(inner)) + 0.5 * x * sech2 * c * (1 + 3 * c2 * Math.pow(x, 2))
    },
  },
  softmax: {
    id: 'softmax',
    name: 'Softmax',
    formula: 'σ(z)_i = e^(z_i) / ∑ e^(z_j)',
    description: 'Converts raw logits into a valid multi-class probability distribution summing to 1.0.',
    fn: (x) => Math.exp(x),
    derivative: () => 1,
  },
}
