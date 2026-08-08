import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, RotateCcw, Zap, Sliders, Activity, Sparkles, CheckCircle2 } from 'lucide-react'

// Dataset Generators
function generateData(datasetType, count = 120) {
  const points = []
  for (let i = 0; i < count; i++) {
    let x, y, label
    if (datasetType === 'spiral') {
      const r = (i / count) * 2.2
      const t = 1.75 * i * (2 * Math.PI / count) + (i % 2 === 0 ? 0 : Math.PI)
      label = i % 2 === 0 ? 1 : 0
      x = r * Math.cos(t) + (Math.random() - 0.5) * 0.15
      y = r * Math.sin(t) + (Math.random() - 0.5) * 0.15
    } else if (datasetType === 'rings') {
      const isInner = Math.random() > 0.5
      label = isInner ? 1 : 0
      const r = isInner ? Math.random() * 0.8 : 1.3 + Math.random() * 0.7
      const angle = Math.random() * Math.PI * 2
      x = r * Math.cos(angle) + (Math.random() - 0.5) * 0.1
      y = r * Math.sin(angle) + (Math.random() - 0.5) * 0.1
    } else if (datasetType === 'xor') {
      x = (Math.random() - 0.5) * 3.6
      y = (Math.random() - 0.5) * 3.6
      label = (x * y > 0) ? 1 : 0
    } else {
      // Moons
      const isTop = Math.random() > 0.5
      label = isTop ? 1 : 0
      const angle = Math.random() * Math.PI
      if (isTop) {
        x = Math.cos(angle) - 0.5 + (Math.random() - 0.5) * 0.2
        y = Math.sin(angle) + 0.3 + (Math.random() - 0.5) * 0.2
      } else {
        x = 1 - Math.cos(angle) - 0.5 + (Math.random() - 0.5) * 0.2
        y = -Math.sin(angle) - 0.3 + (Math.random() - 0.5) * 0.2
      }
    }
    points.push({ x, y, label })
  }
  return points
}

// Feature Extractor: [x, y, x^2, y^2, x*y, sin(x), cos(y)]
function extractFeatures(x, y) {
  return [x, y, x * x, y * y, x * y, Math.sin(x * 2), Math.cos(y * 2)]
}

// Activations
function activate(val, type) {
  if (type === 'relu') return Math.max(0, val)
  if (type === 'tanh') return Math.tanh(val)
  return 1 / (1 + Math.exp(-val)) // sigmoid
}

function activateDeriv(val, type) {
  if (type === 'relu') return val > 0 ? 1 : 0
  if (type === 'tanh') return 1 - Math.tanh(val) ** 2
  const s = 1 / (1 + Math.exp(-val))
  return s * (1 - s)
}

export default function InteractiveNeuralPlayground() {
  const canvasRef = useRef(null)
  const [datasetType, setDatasetType] = useState('spiral')
  const [learningRate, setLearningRate] = useState(0.12)
  const [hiddenSize, setHiddenSize] = useState(4)
  const [activation, setActivation] = useState('relu')
  const [epochs, setEpochs] = useState(0)
  const [lossHistory, setLossHistory] = useState([])
  const [accuracy, setAccuracy] = useState(50)
  const [isTraining, setIsTraining] = useState(false)

  const dataRef = useRef([])
  const weightsRef = useRef(null)

  // Initialize network weights
  const initWeights = useCallback((hSize) => {
    const featureCount = 7 // [x, y, x2, y2, xy, sinx, cosy]
    // Layer 1: Feature -> Hidden
    const W1 = Array.from({ length: hSize }, () =>
      Array.from({ length: featureCount }, () => (Math.random() - 0.5) * 0.8)
    )
    const B1 = Array.from({ length: hSize }, () => (Math.random() - 0.5) * 0.2)
    // Layer 2: Hidden -> Output (1)
    const W2 = Array.from({ length: hSize }, () => (Math.random() - 0.5) * 0.8)
    const B2 = (Math.random() - 0.5) * 0.2

    weightsRef.current = { W1, B1, W2, B2 }
    setEpochs(0)
    setLossHistory([])
  }, [])

  // Initialize data on dataset change
  useEffect(() => {
    dataRef.current = generateData(datasetType, 120)
    initWeights(hiddenSize)
  }, [datasetType, hiddenSize, initWeights])

  // Forward pass prediction function
  const predict = useCallback((x, y, weights, act) => {
    if (!weights) return 0.5
    const feats = extractFeatures(x, y)
    const { W1, B1, W2, B2 } = weights

    // Hidden layer
    const hiddenVals = []
    for (let h = 0; h < W1.length; h++) {
      let sum = B1[h]
      for (let f = 0; f < feats.length; f++) {
        sum += W1[h][f] * feats[f]
      }
      hiddenVals.push(activate(sum, act))
    }

    // Output neuron
    let outSum = B2
    for (let h = 0; h < W2.length; h++) {
      outSum += W2[h] * hiddenVals[h]
    }
    return 1 / (1 + Math.exp(-outSum)) // Sigmoidal output
  }, [])

  // Train one epoch using Backpropagation
  const trainEpoch = useCallback(() => {
    const weights = weightsRef.current
    if (!weights || !dataRef.current.length) return 0

    const { W1, B1, W2, B2 } = weights
    const data = dataRef.current
    const hSize = W1.length
    const fCount = 7
    const lr = learningRate
    const act = activation

    let totalLoss = 0
    let correctCount = 0

    // Accumulators for batch gradient
    const dW1 = Array.from({ length: hSize }, () => Array(fCount).fill(0))
    const dB1 = Array(hSize).fill(0)
    const dW2 = Array(hSize).fill(0)
    let dB2 = 0

    data.forEach((p) => {
      const feats = extractFeatures(p.x, p.y)

      // Forward
      const hiddenSums = []
      const hiddenVals = []
      for (let h = 0; h < hSize; h++) {
        let sum = B1[h]
        for (let f = 0; f < fCount; f++) {
          sum += W1[h][f] * feats[f]
        }
        hiddenSums.push(sum)
        hiddenVals.push(activate(sum, act))
      }

      let outSum = B2
      for (let h = 0; h < hSize; h++) {
        outSum += W2[h] * hiddenVals[h]
      }
      const pred = 1 / (1 + Math.exp(-outSum))

      // Loss (Binary Cross Entropy)
      const eps = 1e-7
      const safePred = Math.max(eps, Math.min(1 - eps, pred))
      const loss = -(p.label * Math.log(safePred) + (1 - p.label) * Math.log(1 - safePred))
      totalLoss += loss

      // Accuracy
      if ((pred >= 0.5 ? 1 : 0) === p.label) correctCount++

      // Backprop Output Layer
      const dOut = pred - p.label // gradient of BCE with Sigmoid output
      dB2 += dOut
      for (let h = 0; h < hSize; h++) {
        dW2[h] += dOut * hiddenVals[h]
      }

      // Backprop Hidden Layer
      for (let h = 0; h < hSize; h++) {
        const dHidden = dOut * W2[h] * activateDeriv(hiddenSums[h], act)
        dB1[h] += dHidden
        for (let f = 0; f < fCount; f++) {
          dW1[h][f] += dHidden * feats[f]
        }
      }
    })

    // Update Weights (SGD with mini normalization)
    const N = data.length
    dB2 /= N
    for (let h = 0; h < hSize; h++) {
      W2[h] -= lr * (dW2[h] / N)
      B1[h] -= lr * (dB1[h] / N)
      for (let f = 0; f < fCount; f++) {
        W1[h][f] -= lr * (dW1[h][f] / N)
      }
    }
    weights.B2 -= lr * dB2

    const avgLoss = totalLoss / N
    const accPct = Math.round((correctCount / N) * 100)

    setAccuracy(accPct)
    return avgLoss
  }, [learningRate, activation])

  // Draw decision boundary and dataset on Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    // Render decision boundary background grid
    const gridSize = 40
    const cellW = width / gridSize
    const cellH = height / gridSize

    for (let gx = 0; gx < gridSize; gx++) {
      for (let gy = 0; gy < gridSize; gy++) {
        // Map grid cell center to domain [-2.2, 2.2]
        const nx = ((gx + 0.5) / gridSize) * 4.4 - 2.2
        const ny = ((gy + 0.5) / gridSize) * 4.4 - 2.2

        const pred = predict(nx, ny, weightsRef.current, activation)

        // Interpolate colors: Class 0 (Electric Blue) vs Class 1 (Glowing Pink/Violet)
        const r = Math.round(96 * (1 - pred) + 244 * pred)
        const g = Math.round(165 * (1 - pred) + 114 * pred)
        const b = Math.round(250 * (1 - pred) + 182 * pred)

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`
        ctx.fillRect(gx * cellW, gy * cellH, cellW + 0.5, cellH + 0.5)
      }
    }

    // Render grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    // Render Data Points
    dataRef.current.forEach((p) => {
      const cx = ((p.x + 2.2) / 4.4) * width
      const cy = ((p.y + 2.2) / 4.4) * height

      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, Math.PI * 2)

      if (p.label === 1) {
        ctx.fillStyle = '#f472b6'
        ctx.strokeStyle = '#ffffff'
      } else {
        ctx.fillStyle = '#38bdf8'
        ctx.strokeStyle = '#ffffff'
      }
      ctx.lineWidth = 2
      ctx.shadowColor = p.label === 1 ? '#f472b6' : '#38bdf8'
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0
    })
  }, [predict, activation])

  // Effect to re-draw whenever parameters change
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas, epochs, datasetType])

  // Training loop execution
  useEffect(() => {
    let interval
    if (isTraining) {
      interval = setInterval(() => {
        let lastLoss = 0
        for (let i = 0; i < 5; i++) {
          lastLoss = trainEpoch()
        }
        setEpochs((prev) => prev + 5)
        setLossHistory((prev) => [...prev.slice(-30), lastLoss])
        drawCanvas()
      }, 50)
    }
    return () => clearInterval(interval)
  }, [isTraining, trainEpoch, drawCanvas])

  const handleReset = () => {
    setIsTraining(false)
    initWeights(hiddenSize)
    drawCanvas()
  }

  const handleStepOnce = () => {
    setIsTraining(false)
    let lastLoss = 0
    for (let i = 0; i < 10; i++) {
      lastLoss = trainEpoch()
    }
    setEpochs((prev) => prev + 10)
    setLossHistory((prev) => [...prev.slice(-30), lastLoss])
    drawCanvas()
  }

  return (
    <section className="playground-section">
      <div className="playground-header">
        <div className="playground-title-group">
          <div className="section-badge">
            <Sparkles size={14} /> LIVE HYPERPARAMETER LAB
          </div>
          <h2>Interactive <em>Neural Classifier</em></h2>
          <p className="playground-desc">
            Train a neural model right inside your browser! Watch the decision boundary adapt live as backpropagation minimizes loss on complex non-linear datasets.
          </p>
        </div>

        <div className="playground-stats-bar glass">
          <div className="p-stat">
            <span className="p-stat-label">EPOCHS</span>
            <span className="p-stat-value">{epochs}</span>
          </div>
          <div className="p-stat">
            <span className="p-stat-label">ACCURACY</span>
            <span className="p-stat-value highlight-green">{accuracy}%</span>
          </div>
          <div className="p-stat">
            <span className="p-stat-label">CURRENT LOSS</span>
            <span className="p-stat-value highlight-purple">
              {lossHistory.length > 0 ? lossHistory[lossHistory.length - 1].toFixed(4) : '0.6931'}
            </span>
          </div>
        </div>
      </div>

      <div className="playground-grid">
        {/* Left Column: Canvas Stage */}
        <div className="canvas-card glass">
          <div className="canvas-topbar">
            <span className="canvas-tag">
              <Activity size={14} /> Live Decision Boundary Visualization
            </span>
            <div className="canvas-legend">
              <span className="legend-item blue">Class 0 (Blue)</span>
              <span className="legend-item pink">Class 1 (Pink)</span>
            </div>
          </div>

          <div className="canvas-container">
            <canvas ref={canvasRef} width={460} height={420} className="playground-canvas" />
          </div>

          {/* Controls bar beneath canvas */}
          <div className="canvas-controls">
            <button
              className={`btn primary play-btn ${isTraining ? 'active-pulse' : ''}`}
              onClick={() => setIsTraining(!isTraining)}
            >
              {isTraining ? (
                <>⏸ Pause Training</>
              ) : (
                <>
                  <Play size={16} fill="currentColor" /> Train Neural Net
                </>
              )}
            </button>

            <button className="btn" onClick={handleStepOnce} title="Step 10 Epochs">
              <Zap size={16} /> +10 Epochs
            </button>

            <button className="btn" onClick={handleReset} title="Reset Weights">
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* Right Column: Parameters & Loss Curve */}
        <div className="params-card glass">
          <h3>
            <Sliders size={18} /> Model Controls & Hyperparameters
          </h3>

          {/* Dataset Selector */}
          <div className="param-group">
            <label className="param-label">Select Dataset Shape:</label>
            <div className="pill-selector">
              {['spiral', 'rings', 'xor', 'moons'].map((type) => (
                <button
                  key={type}
                  className={`pill-btn ${datasetType === type ? 'active' : ''}`}
                  onClick={() => setDatasetType(type)}
                >
                  {type === 'spiral' && '🌀 Spiral'}
                  {type === 'rings' && '⭕ Rings'}
                  {type === 'xor' && '🔲 XOR Grid'}
                  {type === 'moons' && '🌙 Moons'}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Rate Slider */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Learning Rate ($\eta$):</label>
              <span className="param-val">{learningRate}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.4"
              step="0.01"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Hidden Layer Neurons Slider */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Hidden Layer Neurons:</label>
              <span className="param-val">{hiddenSize} Neurons</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={hiddenSize}
              onChange={(e) => setHiddenSize(parseInt(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Activation Selector */}
          <div className="param-group">
            <label className="param-label">Activation Function:</label>
            <div className="pill-selector">
              {['relu', 'sigmoid', 'tanh'].map((act) => (
                <button
                  key={act}
                  className={`pill-btn ${activation === act ? 'active' : ''}`}
                  onClick={() => setActivation(act)}
                >
                  {act.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Live Loss History Graph */}
          <div className="loss-history-card">
            <div className="loss-head">
              <span>Loss Curve $J(\theta)$</span>
              {accuracy > 90 && (
                <span className="badge-converged">
                  <CheckCircle2 size={12} /> High Convergence
                </span>
              )}
            </div>
            <div className="mini-chart">
              {lossHistory.map((val, idx) => {
                const maxLoss = 1.0
                const heightPct = Math.min(100, Math.max(5, (val / maxLoss) * 100))
                return (
                  <div
                    key={idx}
                    className="chart-bar"
                    style={{ height: `${heightPct}%` }}
                    title={`Loss: ${val.toFixed(4)}`}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
