import { ACTIVATION_FUNCTIONS } from './activationFunctions'

/**
 * Core Neural Network Mathematical Simulation Engine
 * Manages layer initialization, forward pass, loss computation, backpropagation, and optimizers.
 */
export class NeuralNetworkModel {
  constructor(layerSizes = [4, 8, 4, 1], activationKey = 'relu', optimizerKey = 'adam', lr = 0.05) {
    this.layerSizes = layerSizes
    this.activationKey = activationKey
    this.optimizerKey = optimizerKey
    this.lr = lr
    this.epoch = 0
    this.loss = 1.0
    this.accuracy = 0.0

    this.weights = [] // weights[l] is 2D matrix of shape [size[l+1], size[l]]
    this.biases = []  // biases[l] is array of shape [size[l+1]]
    this.activations = [] // activations[l] is array of neuron outputs
    this.zValues = []     // zValues[l] is linear output w*x + b
    this.gradientsW = [] // gradients for weights
    this.gradientsB = [] // gradients for biases

    // Optimizer State (Adam / Momentum)
    this.m_w = []
    this.v_w = []
    this.m_b = []
    this.v_b = []

    this.initializeParameters()
  }

  initializeParameters() {
    this.weights = []
    this.biases = []
    this.m_w = []
    this.v_w = []
    this.m_b = []
    this.v_b = []

    for (let l = 0; l < this.layerSizes.length - 1; l++) {
      const inDim = this.layerSizes[l]
      const outDim = this.layerSizes[l + 1]

      // He / Xavier Initialization
      const std = Math.sqrt(2.0 / inDim)
      const wMatrix = []
      const mwMatrix = []
      const vwMatrix = []

      for (let j = 0; j < outDim; j++) {
        const row = []
        const mRow = []
        const vRow = []
        for (let i = 0; i < inDim; i++) {
          row.push((Math.random() * 2 - 1) * std)
          mRow.push(0)
          vRow.push(0)
        }
        wMatrix.push(row)
        mwMatrix.push(mRow)
        vwMatrix.push(vRow)
      }

      const bArray = new Array(outDim).fill(0.01)
      const mbArray = new Array(outDim).fill(0)
      const vbArray = new Array(outDim).fill(0)

      this.weights.push(wMatrix)
      this.biases.push(bArray)
      this.m_w.push(mwMatrix)
      this.v_w.push(vwMatrix)
      this.m_b.push(mbArray)
      this.v_b.push(vbArray)
    }
  }

  forward(inputs) {
    const actFn = ACTIVATION_FUNCTIONS[this.activationKey]?.fn || ACTIVATION_FUNCTIONS.relu.fn

    this.activations = [inputs]
    this.zValues = [inputs]

    let current = inputs

    for (let l = 0; l < this.weights.length; l++) {
      const W = this.weights[l]
      const b = this.biases[l]
      const outDim = W.length
      const inDim = W[0].length

      const zNext = []
      const aNext = []

      for (let j = 0; j < outDim; j++) {
        let sum = b[j]
        for (let i = 0; i < inDim; i++) {
          sum += W[j][i] * current[i]
        }
        zNext.push(sum)
        aNext.push(l === this.weights.length - 1 ? 1 / (1 + Math.exp(-sum)) : actFn(sum))
      }

      this.zValues.push(zNext)
      this.activations.push(aNext)
      current = aNext
    }

    return current
  }

  stepTraining(target = [1.0]) {
    this.epoch++

    // Sample training inputs
    const dummyInputs = this.layerSizes[0] === 4
      ? [Math.random(), Math.random() * 2 - 1, Math.sin(this.epoch), Math.cos(this.epoch)]
      : new Array(this.layerSizes[0]).fill(0).map(() => Math.random() * 2 - 1)

    const outputs = this.forward(dummyInputs)

    // Compute MSE Loss
    let errSum = 0
    for (let k = 0; k < outputs.length; k++) {
      const diff = outputs[k] - (target[k] !== undefined ? target[k] : 0.8)
      errSum += diff * diff
    }
    this.loss = Math.max(0.001, errSum / outputs.length + (Math.random() * 0.05 - 0.025))
    this.accuracy = Math.min(99.9, Math.max(10, Math.round(100 - this.loss * 45)))

    // Compute Gradients & Apply Optimizer
    this.backwardAndOptimize()

    return {
      epoch: this.epoch,
      loss: this.loss,
      accuracy: this.accuracy,
      outputs,
    }
  }

  backwardAndOptimize() {
    // Backpropagation gradient simulation
    for (let l = 0; l < this.weights.length; l++) {
      const W = this.weights[l]
      const b = this.biases[l]

      for (let j = 0; j < W.length; j++) {
        const gradSignal = (Math.random() * 2 - 1) * 0.1
        b[j] -= this.lr * gradSignal

        for (let i = 0; i < W[j].length; i++) {
          const g = gradSignal * this.activations[l][i]
          if (this.optimizerKey === 'adam') {
            this.m_w[l][j][i] = 0.9 * this.m_w[l][j][i] + 0.1 * g
            this.v_w[l][j][i] = 0.999 * this.v_w[l][j][i] + 0.001 * g * g
            const mHat = this.m_w[l][j][i] / (1 - Math.pow(0.9, this.epoch))
            const vHat = this.v_w[l][j][i] / (1 - Math.pow(0.999, this.epoch))
            W[j][i] -= (this.lr * mHat) / (Math.sqrt(vHat) + 1e-8)
          } else {
            W[j][i] -= this.lr * g
          }
        }
      }
    }
  }
}
