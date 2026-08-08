import { useEffect, useRef, useState, useCallback } from 'react'
import { Trees, Sliders, RotateCcw, Zap, CheckCircle2, BarChart2, Eye } from 'lucide-react'

// --- Dataset Generators ---
function generateData(datasetType, count = 140) {
  const points = []
  for (let i = 0; i < count; i++) {
    let x, y, label
    if (datasetType === 'spiral') {
      const r = (i / count) * 2.2
      const t = 1.75 * i * ((2 * Math.PI) / count) + (i % 2 === 0 ? 0 : Math.PI)
      label = i % 2 === 0 ? 1 : 0
      x = r * Math.cos(t) + (Math.random() - 0.5) * 0.18
      y = r * Math.sin(t) + (Math.random() - 0.5) * 0.18
    } else if (datasetType === 'rings') {
      const isInner = Math.random() > 0.5
      label = isInner ? 1 : 0
      const r = isInner ? Math.random() * 0.8 : 1.3 + Math.random() * 0.7
      const angle = Math.random() * Math.PI * 2
      x = r * Math.cos(angle) + (Math.random() - 0.5) * 0.12
      y = r * Math.sin(angle) + (Math.random() - 0.5) * 0.12
    } else if (datasetType === 'xor') {
      x = (Math.random() - 0.5) * 3.6
      y = (Math.random() - 0.5) * 3.6
      label = x * y > 0 ? 1 : 0
    } else if (datasetType === 'clusters') {
      const cluster = Math.floor(Math.random() * 4)
      const centers = [
        { cx: -1.2, cy: -1.2, l: 0 },
        { cx: 1.2, cy: -1.2, l: 1 },
        { cx: -1.2, cy: 1.2, l: 1 },
        { cx: 1.2, cy: 1.2, l: 0 }
      ]
      const c = centers[cluster]
      x = c.cx + (Math.random() - 0.5) * 1.1
      y = c.cy + (Math.random() - 0.5) * 1.1
      label = c.l
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
    points.push({ x, y, label, id: i })
  }
  return points
}

// Features: [x, y, x^2, y^2, x*y]
function extractFeatures(p) {
  return [p.x, p.y, p.x * p.x, p.y * p.y, p.x * p.y]
}

const FEATURE_NAMES = ['x₁', 'x₂', 'x₁²', 'x₂²', 'x₁·x₂']

// Gini Impurity calculation
function calculateGini(data) {
  if (data.length === 0) return 0
  let p1 = 0
  for (let i = 0; i < data.length; i++) {
    if (data[i].label === 1) p1++
  }
  const prob1 = p1 / data.length
  const prob0 = 1 - prob1
  return 1 - (prob0 * prob0 + prob1 * prob1)
}

// Entropy calculation
function calculateEntropy(data) {
  if (data.length === 0) return 0
  let p1 = 0
  for (let i = 0; i < data.length; i++) {
    if (data[i].label === 1) p1++
  }
  const prob1 = p1 / data.length
  const prob0 = 1 - prob1
  let entropy = 0
  if (prob0 > 0) entropy -= prob0 * Math.log2(prob0)
  if (prob1 > 0) entropy -= prob1 * Math.log2(prob1)
  return entropy
}

// Decision Tree Node Construction
function buildTree(data, depth, maxDepth, minSamplesSplit, criterion, featureSubsampleRatio) {
  const nSamples = data.length
  const p1 = data.filter((d) => d.label === 1).length
  const prob1 = nSamples > 0 ? p1 / nSamples : 0.5

  // Base cases: Max depth reached, pure node, or not enough samples
  if (depth >= maxDepth || nSamples < minSamplesSplit || prob1 === 0 || prob1 === 1) {
    return { isLeaf: true, prob1, value: prob1 >= 0.5 ? 1 : 0, samples: nSamples }
  }

  const numFeatures = 5
  // Random Feature Subsampling
  const featureIndices = Array.from({ length: numFeatures }, (_, i) => i)
  // Shuffle feature indices
  for (let i = featureIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[featureIndices[i], featureIndices[j]] = [featureIndices[j], featureIndices[i]]
  }
  const kFeatures = Math.max(1, Math.floor(numFeatures * featureSubsampleRatio))
  const selectedFeatures = featureIndices.slice(0, kFeatures)

  let bestGain = -Infinity
  let bestFeature = null
  let bestThreshold = null
  let bestLeftData = []
  let bestRightData = []

  const currentImpurity = criterion === 'gini' ? calculateGini(data) : calculateEntropy(data)

  selectedFeatures.forEach((featIdx) => {
    // Sort values along this feature
    const values = data.map((d) => extractFeatures(d)[featIdx]).sort((a, b) => a - b)

    // Evaluate potential split thresholds
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] === values[i + 1]) continue
      const threshold = (values[i] + values[i + 1]) / 2

      const left = []
      const right = []
      data.forEach((d) => {
        if (extractFeatures(d)[featIdx] <= threshold) left.push(d)
        else right.push(d)
      })

      if (left.length === 0 || right.length === 0) continue

      const impLeft = criterion === 'gini' ? calculateGini(left) : calculateEntropy(left)
      const impRight = criterion === 'gini' ? calculateGini(right) : calculateEntropy(right)

      const weightedImpurity = (left.length / nSamples) * impLeft + (right.length / nSamples) * impRight
      const gain = currentImpurity - weightedImpurity

      if (gain > bestGain) {
        bestGain = gain
        bestFeature = featIdx
        bestThreshold = threshold
        bestLeftData = left
        bestRightData = right
      }
    }
  })

  // If no beneficial split was found
  if (bestGain <= 0 || !bestLeftData.length || !bestRightData.length) {
    return { isLeaf: true, prob1, value: prob1 >= 0.5 ? 1 : 0, samples: nSamples }
  }

  // Recursively build left & right children
  const leftChild = buildTree(bestLeftData, depth + 1, maxDepth, minSamplesSplit, criterion, featureSubsampleRatio)
  const rightChild = buildTree(bestRightData, depth + 1, maxDepth, minSamplesSplit, criterion, featureSubsampleRatio)

  return {
    isLeaf: false,
    feature: bestFeature,
    threshold: bestThreshold,
    left: leftChild,
    right: rightChild,
    samples: nSamples,
    gain: bestGain,
    prob1
  }
}

// Predict probability from a single Decision Tree
function predictTree(node, features) {
  if (node.isLeaf) return node.prob1
  if (features[node.feature] <= node.threshold) {
    return predictTree(node.left, features)
  }
  return predictTree(node.right, features)
}

export default function InteractiveRandomForestPlayground() {
  const canvasRef = useRef(null)

  // Hyperparameters
  const [datasetType, setDatasetType] = useState('spiral')
  const [nTrees, setNTrees] = useState(8)
  const [maxDepth, setMaxDepth] = useState(5)
  const [minSamplesSplit, setMinSamplesSplit] = useState(4)
  const [criterion, setCriterion] = useState('gini') // 'gini' or 'entropy'
  const [featureSubsample, setFeatureSubsample] = useState(0.8) // 80% features
  const [bootstrapBagging, setBootstrapBagging] = useState(true)

  // Active view inspection
  const [selectedTreeIndex, setSelectedTreeIndex] = useState(-1) // -1 = Ensemble Forest
  const [forest, setForest] = useState([])
  const [accuracy, setAccuracy] = useState(0)
  const [oobScore, setOobScore] = useState(0)
  const [featureImportance, setFeatureImportance] = useState([0.2, 0.2, 0.2, 0.2, 0.2])
  const [isBuilding, setIsBuilding] = useState(false)

  const dataRef = useRef([])

  // Build the Random Forest Ensemble
  const trainRandomForest = useCallback(() => {
    if (!dataRef.current.length) return

    setIsBuilding(true)
    const rawData = dataRef.current
    const n = rawData.length

    const newForest = []
    const importanceSum = [0, 0, 0, 0, 0]
    const oobVotes = Array.from({ length: n }, () => [])

    for (let t = 0; t < nTrees; t++) {
      // 1. Bootstrap Sample (Bagging)
      let sampleData = []
      const inBagIds = new Set()

      if (bootstrapBagging) {
        for (let i = 0; i < n; i++) {
          const randIdx = Math.floor(Math.random() * n)
          sampleData.push(rawData[randIdx])
          inBagIds.add(rawData[randIdx].id)
        }
      } else {
        sampleData = [...rawData]
      }

      // 2. Build Decision Tree
      const treeRoot = buildTree(sampleData, 0, maxDepth, minSamplesSplit, criterion, featureSubsample)
      newForest.push(treeRoot)

      // Collect feature importance from split gain
      const accumulateImportance = (node) => {
        if (!node || node.isLeaf) return
        importanceSum[node.feature] += (node.gain || 0) * (node.samples / n)
        accumulateImportance(node.left)
        accumulateImportance(node.right)
      }
      accumulateImportance(treeRoot)

      // Collect Out-of-Bag (OOB) predictions
      rawData.forEach((pt) => {
        if (!inBagIds.has(pt.id)) {
          const p = predictTree(treeRoot, extractFeatures(pt))
          oobVotes[pt.id].push(p)
        }
      })
    }

    // Compute Ensemble Accuracy
    let correctCount = 0
    rawData.forEach((pt) => {
      const feats = extractFeatures(pt)
      let sumProb = 0
      newForest.forEach((tree) => {
        sumProb += predictTree(tree, feats)
      })
      const avgProb = sumProb / nTrees
      const pred = avgProb >= 0.5 ? 1 : 0
      if (pred === pt.label) correctCount++
    })
    const accPct = Math.round((correctCount / n) * 100)

    // Compute OOB Accuracy Score
    let oobCorrect = 0
    let oobTotal = 0
    oobVotes.forEach((votes, idx) => {
      if (votes.length > 0) {
        const avgOobProb = votes.reduce((a, b) => a + b, 0) / votes.length
        const pred = avgOobProb >= 0.5 ? 1 : 0
        if (pred === rawData[idx].label) oobCorrect++
        oobTotal++
      }
    })
    const oobPct = oobTotal > 0 ? Math.round((oobCorrect / oobTotal) * 100) : accPct

    // Normalize Feature Importance
    const totalImp = importanceSum.reduce((a, b) => a + b, 0) || 1
    const normImp = importanceSum.map((val) => val / totalImp)

    setForest(newForest)
    setAccuracy(accPct)
    setOobScore(oobPct)
    setFeatureImportance(normImp)
    setIsBuilding(false)
  }, [nTrees, maxDepth, minSamplesSplit, criterion, featureSubsample, bootstrapBagging])

  // Initialize Data on dataset change
  useEffect(() => {
    dataRef.current = generateData(datasetType, 140)
  }, [datasetType])

  // Retrain Random Forest on hyperparameter or dataset change
  useEffect(() => {
    trainRandomForest()
  }, [datasetType, trainRandomForest])

  // Predict Probability for a single Point from Ensemble or Specific Tree
  const predictPoint = useCallback(
    (x, y) => {
      if (!forest.length) return 0.5
      const feats = extractFeatures({ x, y })

      if (selectedTreeIndex >= 0 && selectedTreeIndex < forest.length) {
        // Single Tree view
        return predictTree(forest[selectedTreeIndex], feats)
      }

      // Ensemble Forest averaged vote
      let sum = 0
      for (let i = 0; i < forest.length; i++) {
        sum += predictTree(forest[i], feats)
      }
      return sum / forest.length
    },
    [forest, selectedTreeIndex]
  )

  // Draw Decision Boundary & Data Points on Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    // Render decision boundary background grid
    const gridSize = 45
    const cellW = width / gridSize
    const cellH = height / gridSize

    for (let gx = 0; gx < gridSize; gx++) {
      for (let gy = 0; gy < gridSize; gy++) {
        const nx = ((gx + 0.5) / gridSize) * 4.4 - 2.2
        const ny = ((gy + 0.5) / gridSize) * 4.4 - 2.2

        const pred = predictPoint(nx, ny)

        // Interpolate colors: Class 0 (Electric Emerald/Blue) vs Class 1 (Glowing Pink/Violet)
        const r = Math.round(52 * (1 - pred) + 244 * pred)
        const g = Math.round(211 * (1 - pred) + 114 * pred)
        const b = Math.round(153 * (1 - pred) + 182 * pred)

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.55)`
        ctx.fillRect(gx * cellW, gy * cellH, cellW + 0.5, cellH + 0.5)
      }
    }

    // Grid Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
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
      ctx.arc(cx, cy, 5.5, 0, Math.PI * 2)

      if (p.label === 1) {
        ctx.fillStyle = '#f472b6'
        ctx.strokeStyle = '#ffffff'
      } else {
        ctx.fillStyle = '#34d399'
        ctx.strokeStyle = '#ffffff'
      }
      ctx.lineWidth = 1.8
      ctx.shadowColor = p.label === 1 ? '#f472b6' : '#34d399'
      ctx.shadowBlur = 6
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0
    })
  }, [predictPoint])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas, forest, selectedTreeIndex, datasetType])

  return (
    <section className="playground-section">
      <div className="playground-header">
        <div className="playground-title-group">
          <div className="section-badge">
            <Trees size={14} /> ENSEMBLE LEARNING LAB
          </div>
          <h2>Interactive <em>Random Forest Explorer</em></h2>
          <p className="playground-desc">
            Customize a Bagging Decision Forest in real time! Tune tree counts, depth splits, and feature subsampling ratios to watch variance reduction and non-linear decision boundaries adapt live.
          </p>
        </div>

        <div className="playground-stats-bar glass">
          <div className="p-stat">
            <span className="p-stat-label">TREES IN FOREST</span>
            <span className="p-stat-value highlight-purple">{nTrees} Trees</span>
          </div>
          <div className="p-stat">
            <span className="p-stat-label">ENSEMBLE ACCURACY</span>
            <span className="p-stat-value highlight-green">{accuracy}%</span>
          </div>
          <div className="p-stat">
            <span className="p-stat-label">OOB SCORE</span>
            <span className="p-stat-value highlight-gold">{oobScore}%</span>
          </div>
        </div>
      </div>

      <div className="playground-grid">
        {/* Left Column: Interactive Boundary & Tree Inspector */}
        <div className="canvas-card glass">
          <div className="canvas-topbar">
            <span className="canvas-tag">
              <Eye size={14} />
              {selectedTreeIndex === -1
                ? 'Viewing Full Random Forest Ensemble Vote'
                : `Inspecting Single Decision Tree #${selectedTreeIndex + 1}`}
            </span>
            <div className="canvas-legend">
              <span className="legend-item green">Class 0 (Emerald)</span>
              <span className="legend-item pink">Class 1 (Pink)</span>
            </div>
          </div>

          <div className="canvas-container">
            <canvas ref={canvasRef} width={460} height={420} className="playground-canvas" />
          </div>

          {/* Tree Selector Badges */}
          <div className="tree-selector-bar">
            <span className="tree-select-label">Inspect Trees:</span>
            <button
              className={`tree-badge-btn ${selectedTreeIndex === -1 ? 'active' : ''}`}
              onClick={() => setSelectedTreeIndex(-1)}
            >
              🌳 Forest Ensemble
            </button>
            {forest.map((_, idx) => (
              <button
                key={idx}
                className={`tree-badge-btn ${selectedTreeIndex === idx ? 'active' : ''}`}
                onClick={() => setSelectedTreeIndex(idx)}
              >
                Tree #{idx + 1}
              </button>
            ))}
          </div>

          <div className="canvas-controls">
            <button
              className={`btn primary play-btn ${isBuilding ? 'active-pulse' : ''}`}
              onClick={trainRandomForest}
            >
              <Zap size={16} fill="currentColor" /> Rebuild Random Forest
            </button>

            <button className="btn" onClick={() => setSelectedTreeIndex(-1)}>
              <RotateCcw size={16} /> Reset View
            </button>
          </div>
        </div>

        {/* Right Column: Hyperparameter Customization & Feature Importance */}
        <div className="params-card glass">
          <h3>
            <Sliders size={18} /> Forest Hyperparameters
          </h3>

          {/* Dataset Selector */}
          <div className="param-group">
            <label className="param-label">Select Dataset Shape:</label>
            <div className="pill-selector">
              {['spiral', 'rings', 'xor', 'moons', 'clusters'].map((type) => (
                <button
                  key={type}
                  className={`pill-btn ${datasetType === type ? 'active' : ''}`}
                  onClick={() => setDatasetType(type)}
                >
                  {type === 'spiral' && '🌀 Spiral'}
                  {type === 'rings' && '⭕ Rings'}
                  {type === 'xor' && '🔲 XOR Grid'}
                  {type === 'moons' && '🌙 Moons'}
                  {type === 'clusters' && '🎯 Clusters'}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Trees Slider */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Number of Trees (N_trees):</label>
              <span className="param-val">{nTrees} Trees</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={nTrees}
              onChange={(e) => setNTrees(parseInt(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Max Depth Slider */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Max Tree Depth:</label>
              <span className="param-val">Level {maxDepth}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Min Samples Split */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Min Samples Split:</label>
              <span className="param-val">{minSamplesSplit} Samples</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              step="1"
              value={minSamplesSplit}
              onChange={(e) => setMinSamplesSplit(parseInt(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Split Criterion & Bagging Toggles */}
          <div className="param-group">
            <label className="param-label">Split Criterion & Bagging:</label>
            <div className="pill-selector">
              <button
                className={`pill-btn ${criterion === 'gini' ? 'active' : ''}`}
                onClick={() => setCriterion('gini')}
              >
                Gini Impurity
              </button>
              <button
                className={`pill-btn ${criterion === 'entropy' ? 'active' : ''}`}
                onClick={() => setCriterion('entropy')}
              >
                Entropy (Information Gain)
              </button>
              <button
                className={`pill-btn ${bootstrapBagging ? 'active' : ''}`}
                onClick={() => setBootstrapBagging(!bootstrapBagging)}
              >
                {bootstrapBagging ? '✓ Bagging (Bootstrap)' : 'No Bagging'}
              </button>
            </div>
          </div>

          {/* Feature Importance Bar Chart */}
          <div className="importance-card">
            <div className="loss-head">
              <span>
                <BarChart2 size={14} /> Gini Feature Importance
              </span>
              <span className="badge-converged">
                <CheckCircle2 size={12} /> Live Computed
              </span>
            </div>
            <div className="importance-bars">
              {FEATURE_NAMES.map((name, idx) => {
                const val = featureImportance[idx] || 0
                const pct = Math.round(val * 100)
                return (
                  <div key={idx} className="imp-row">
                    <span className="imp-name">{name}</span>
                    <div className="imp-rail">
                      <div className="imp-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="imp-val">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
