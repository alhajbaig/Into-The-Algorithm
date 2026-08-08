import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Sliders, RotateCcw, Zap, Eye, Compass, Layers, Activity, CheckCircle2 } from 'lucide-react'

// Sigmoid function
function sigmoid(z) {
  return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))))
}

// Generate 3D Data Points (x1, x2, label y in {0, 1})
function generate3DData(datasetType, count = 100) {
  const points = []
  for (let i = 0; i < count; i++) {
    let x1, x2, label
    if (datasetType === 'separable') {
      const isClass1 = Math.random() > 0.5
      label = isClass1 ? 1 : 0
      if (isClass1) {
        x1 = 0.6 + (Math.random() - 0.5) * 1.6
        x2 = 0.6 + (Math.random() - 0.5) * 1.6
      } else {
        x1 = -0.6 + (Math.random() - 0.5) * 1.6
        x2 = -0.6 + (Math.random() - 0.5) * 1.6
      }
    } else if (datasetType === 'diagonal') {
      x1 = (Math.random() - 0.5) * 3.2
      x2 = (Math.random() - 0.5) * 3.2
      const line = 1.2 * x1 - 0.8 * x2 + 0.1
      label = line > 0 ? 1 : 0
      // Add slight noise
      if (Math.random() < 0.08) label = 1 - label
    } else {
      // Overlapping Blobs
      const isClass1 = i % 2 === 0
      label = isClass1 ? 1 : 0
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * 1.5
      x1 = (isClass1 ? 0.4 : -0.4) + r * Math.cos(angle)
      x2 = (isClass1 ? 0.4 : -0.4) + r * Math.sin(angle)
    }
    points.push({ x1, x2, label, id: i })
  }
  return points
}

export default function InteractiveLogistic3DPlayground() {
  const canvasRef = useRef(null)

  // Hyperplane & Model Weights
  const [w1, setW1] = useState(1.8)
  const [w2, setW2] = useState(1.4)
  const [bias, setBias] = useState(-0.2)
  const [temperature, setTemperature] = useState(1.2)
  const [datasetType, setDatasetType] = useState('separable')
  const [showHyperplane, setShowHyperplane] = useState(true)
  const [showSigmoidMesh, setShowSigmoidMesh] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)

  // 3D Camera Angles (using Refs for 60fps canvas rendering without React re-render loops)
  const rotXRef = useRef(0.45) // Pitch
  const rotYRef = useRef(0.75) // Yaw
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0.45, rotY: 0.75 })

  const [isFitting, setIsFitting] = useState(false)
  const dataRef = useRef([])
  const [dataPoints, setDataPoints] = useState(() => {
    const initPts = generate3DData(datasetType, 100)
    dataRef.current = initPts
    return initPts
  })

  // Update Data Points on dataset selection
  useEffect(() => {
    const pts = generate3DData(datasetType, 100)
    dataRef.current = pts
    setDataPoints(pts)
  }, [datasetType])

  // Derive Loss and Accuracy inline (zero re-render state loops)
  let totalLoss = 0
  let correct = 0
  if (dataPoints.length > 0) {
    dataPoints.forEach((p) => {
      const z = (w1 * p.x1 + w2 * p.x2 + bias) * temperature
      const pred = sigmoid(z)
      const eps = 1e-7
      const safePred = Math.max(eps, Math.min(1 - eps, pred))
      const l = -(p.label * Math.log(safePred) + (1 - p.label) * Math.log(1 - safePred))
      totalLoss += l
      if ((pred >= 0.5 ? 1 : 0) === p.label) correct++
    })
  }
  const loss = dataPoints.length > 0 ? totalLoss / dataPoints.length : 0.35
  const accuracy = dataPoints.length > 0 ? Math.round((correct / dataPoints.length) * 100) : 90

  // Fit Optimal Hyperplane using 3D Gradient Descent
  const fitGradientDescent = useCallback(() => {
    setIsFitting(true)
    let curW1 = w1
    let curW2 = w2
    let curB = bias
    const data = dataRef.current
    const lr = 0.15
    const N = data.length

    let steps = 0
    const interval = setInterval(() => {
      let dw1 = 0
      let dw2 = 0
      let db = 0

      data.forEach((p) => {
        const z = (curW1 * p.x1 + curW2 * p.x2 + curB) * temperature
        const pred = sigmoid(z)
        const err = pred - p.label
        dw1 += err * p.x1
        dw2 += err * p.x2
        db += err
      })

      curW1 -= lr * (dw1 / N)
      curW2 -= lr * (dw2 / N)
      curB -= lr * (db / N)

      setW1(parseFloat(curW1.toFixed(3)))
      setW2(parseFloat(curW2.toFixed(3)))
      setBias(parseFloat(curB.toFixed(3)))

      steps++
      if (steps >= 45) {
        clearInterval(interval)
        setIsFitting(false)
      }
    }, 30)
  }, [w1, w2, bias, temperature])

  // 3D Rendering Engine
  const render3DScene = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    // Center of 3D projection
    const cx = width / 2
    const cy = height / 2 + 20
    const scale = 110

    // 3D Matrix Rotation Math
    const cosX = Math.cos(rotXRef.current)
    const sinX = Math.sin(rotXRef.current)
    const cosY = Math.cos(rotYRef.current)
    const sinY = Math.sin(rotYRef.current)

    const project3D = (x, y, z) => {
      // Scale domain to [-1.8, 1.8]
      const px = x * 0.75
      const py = y * 0.75
      const pz = (z - 0.5) * 1.5 // map z from [0, 1] to [-0.75, 0.75]

      // Rotate Y (Yaw)
      const x1 = px * cosY - pz * sinY
      const z1 = px * sinY + pz * cosY

      // Rotate X (Pitch)
      const y2 = py * cosX - z1 * sinX
      const z2 = py * sinX + z1 * cosX

      // Perspective divide
      const fov = 4.5
      const perspective = fov / (fov + z2 * 0.4)

      const screenX = cx + x1 * scale * perspective
      const screenY = cy - y2 * scale * perspective

      return { x: screenX, y: screenY, depth: z2 }
    }

    // 1. Draw 3D Coordinate Grid Plane at Z = 0
    ctx.lineWidth = 1
    const gridRes = 10
    const domain = 2.2

    for (let i = -gridRes; i <= gridRes; i++) {
      const pos = (i / gridRes) * domain

      // Lines along X
      const pA = project3D(pos, -domain, 0)
      const pB = project3D(pos, domain, 0)

      ctx.beginPath()
      ctx.moveTo(pA.x, pA.y)
      ctx.lineTo(pB.x, pB.y)
      ctx.strokeStyle = i === 0 ? 'rgba(96, 165, 250, 0.4)' : 'rgba(255, 255, 255, 0.05)'
      ctx.stroke()

      // Lines along Y
      const pC = project3D(-domain, pos, 0)
      const pD = project3D(domain, pos, 0)

      ctx.beginPath()
      ctx.moveTo(pC.x, pC.y)
      ctx.lineTo(pD.x, pD.y)
      ctx.strokeStyle = i === 0 ? 'rgba(96, 165, 250, 0.4)' : 'rgba(255, 255, 255, 0.05)'
      ctx.stroke()
    }

    // 2. Render Surreal 3D Sigmoid Surface Mesh z = sigma(w1*x1 + w2*x2 + b)
    if (showSigmoidMesh) {
      const meshRes = 18
      const step = (domain * 2) / meshRes

      for (let ix = 0; ix < meshRes; ix++) {
        for (let iy = 0; iy < meshRes; iy++) {
          const x1 = -domain + ix * step
          const x2 = -domain + iy * step

          const z1 = sigmoid((w1 * x1 + w2 * x2 + bias) * temperature)
          const z2 = sigmoid((w1 * (x1 + step) + w2 * x2 + bias) * temperature)
          const z3 = sigmoid((w1 * (x1 + step) + w2 * (x2 + step) + bias) * temperature)
          const z4 = sigmoid((w1 * x1 + w2 * (x2 + step) + bias) * temperature)

          const p1 = project3D(x1, x2, z1)
          const p2 = project3D(x1 + step, x2, z2)
          const p3 = project3D(x1 + step, x2 + step, z3)
          const p4 = project3D(x1, x2 + step, z4)

          const avgZ = (z1 + z2 + z3 + z4) / 4
          const r = Math.round(56 * (1 - avgZ) + 244 * avgZ)
          const g = Math.round(189 * (1 - avgZ) + 114 * avgZ)
          const b = Math.round(248 * (1 - avgZ) + 182 * avgZ)

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.28)`
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.lineTo(p3.x, p3.y)
          ctx.lineTo(p4.x, p4.y)
          ctx.closePath()
          ctx.fill()

          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.35)`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }
    }

    // 3. Render Translucent 3D Decision Hyperplane Surface at z = 0.5
    if (showHyperplane) {
      const hpDomain = domain
      const hp1 = project3D(-hpDomain, -hpDomain, 0.5)
      const hp2 = project3D(hpDomain, -hpDomain, 0.5)
      const hp3 = project3D(hpDomain, hpDomain, 0.5)
      const hp4 = project3D(-hpDomain, hpDomain, 0.5)

      ctx.fillStyle = 'rgba(167, 139, 250, 0.18)'
      ctx.beginPath()
      ctx.moveTo(hp1.x, hp1.y)
      ctx.lineTo(hp2.x, hp2.y)
      ctx.lineTo(hp3.x, hp3.y)
      ctx.lineTo(hp4.x, hp4.y)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = '#a78bfa'
      ctx.lineWidth = 1.8
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 4. Render 3D Data Points with Drop Stems
    const renderPoints = dataRef.current.map((pt) => {
      const predZ = sigmoid((w1 * pt.x1 + w2 * pt.x2 + bias) * temperature)
      const projData = project3D(pt.x1, pt.x2, pt.label)
      const projSurf = project3D(pt.x1, pt.x2, predZ)
      return { ...pt, predZ, projData, projSurf }
    })

    // Sort points by depth for correct 3D overlap rendering
    renderPoints.sort((a, b) => b.projData.depth - a.projData.depth)

    renderPoints.forEach((pt) => {
      // Draw Stem line connecting data point to Sigmoid surface
      ctx.beginPath()
      ctx.moveTo(pt.projData.x, pt.projData.y)
      ctx.lineTo(pt.projSurf.x, pt.projSurf.y)
      ctx.strokeStyle = pt.label === 1 ? 'rgba(244, 114, 182, 0.35)' : 'rgba(56, 189, 248, 0.35)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Draw Data Sphere
      ctx.beginPath()
      ctx.arc(pt.projData.x, pt.projData.y, 5.5, 0, Math.PI * 2)

      if (pt.label === 1) {
        ctx.fillStyle = '#f472b6'
        ctx.strokeStyle = '#ffffff'
      } else {
        ctx.fillStyle = '#38bdf8'
        ctx.strokeStyle = '#ffffff'
      }
      ctx.lineWidth = 1.5
      ctx.shadowColor = pt.label === 1 ? '#f472b6' : '#38bdf8'
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.stroke()
      ctx.shadowBlur = 0
    })

    // 5. Draw 3D Axes Labels
    const origin = project3D(0, 0, 0)
    const axisX = project3D(2.5, 0, 0)
    const axisY = project3D(0, 2.5, 0)
    const axisZ = project3D(0, 0, 1.2)

    ctx.font = '700 11px "JetBrains Mono", monospace'
    ctx.fillStyle = '#60a5fa'
    ctx.fillText('X₁', axisX.x + 5, axisX.y)
    ctx.fillStyle = '#a78bfa'
    ctx.fillText('X₂', axisY.x + 5, axisY.y)
    ctx.fillStyle = '#34d399'
    ctx.fillText('P(Y=1|X)', axisZ.x + 5, axisZ.y - 5)
  }, [w1, w2, bias, temperature, showHyperplane, showSigmoidMesh])

  // Continuous Auto-Orbit Loop
  useEffect(() => {
    let animId
    const loop = () => {
      if (autoRotate && !isDragging) {
        rotYRef.current += 0.006
      }
      render3DScene()
      animId = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(animId)
  }, [autoRotate, isDragging, render3DScene])

  // Mouse Drag 3D Rotation Controls
  const handleMouseDown = (e) => {
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotXRef.current,
      rotY: rotYRef.current
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    rotYRef.current = dragStartRef.current.rotY + dx * 0.008
    rotXRef.current = Math.max(-0.2, Math.min(1.2, dragStartRef.current.rotX + dy * 0.008))
    render3DScene()
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <section className="playground-section logistic-3d-section">
      <div className="playground-header">
        <div className="playground-title-group">
          <div className="section-badge threed-badge">
            <Compass size={14} /> SURREAL 3D HYPERPLANE VISUALIZER
          </div>
          <h2>Interactive <em>3D Logistic Regression</em></h2>
          <p className="playground-desc">
            Rotate and inspect the 3D Sigmoidal Probability Surface σ(w₁ x₁ + w₂ x₂ + b) and its decision hyperplane in real time. Tune weight vectors and watch the separating surface bend!
          </p>
        </div>

        <div className="playground-stats-bar glass">
          <div className="p-stat">
            <span className="p-stat-label">WEIGHT VECTOR W</span>
            <span className="p-stat-value highlight-purple">[{w1}, {w2}]</span>
          </div>
          <div className="p-stat">
            <span className="p-stat-label">CLASSIFICATION ACC</span>
            <span className="p-stat-value highlight-green">{accuracy}%</span>
          </div>
          <div className="p-stat">
            <span className="p-stat-label">BCE LOSS J(W)</span>
            <span className="p-stat-value highlight-gold">{loss.toFixed(4)}</span>
          </div>
        </div>
      </div>

      <div className="playground-grid">
        {/* Left Column: 3D Interactive Canvas Stage */}
        <div className="canvas-card glass">
          <div className="canvas-topbar">
            <span className="canvas-tag">
              <Eye size={14} /> Drag mouse to orbit 3D view | Hyperplane at P(Y=1) = 0.5
            </span>
            <button
              className={`pill-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => setAutoRotate(!autoRotate)}
            >
              {autoRotate ? '🔄 Auto-Orbiting' : '⏸ Orbit Paused'}
            </button>
          </div>

          <div
            className="canvas-container canvas-threed-container"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} width={460} height={420} className="playground-canvas threed-cursor" />
          </div>

          <div className="canvas-controls">
            <button
              className={`btn primary play-btn ${isFitting ? 'active-pulse' : ''}`}
              onClick={fitGradientDescent}
            >
              <Zap size={16} fill="currentColor" /> Fit Optimal Hyperplane ⚡
            </button>

            <button
              className={`btn ${showHyperplane ? 'active-tab' : ''}`}
              onClick={() => setShowHyperplane(!showHyperplane)}
            >
              <Layers size={15} /> {showHyperplane ? 'Hide Plane' : 'Show Plane'}
            </button>

            <button
              className={`btn ${showSigmoidMesh ? 'active-tab' : ''}`}
              onClick={() => setShowSigmoidMesh(!showSigmoidMesh)}
            >
              <Activity size={15} /> {showSigmoidMesh ? 'Hide Mesh' : 'Show Mesh'}
            </button>

            <button
              className="btn"
              onClick={() => {
                setW1(1.8)
                setW2(1.4)
                setBias(-0.2)
                setRotX(0.45)
                setRotY(0.75)
              }}
            >
              <RotateCcw size={15} /> Reset 3D
            </button>
          </div>
        </div>

        {/* Right Column: Weight Vector & Hyperplane Controls */}
        <div className="params-card glass">
          <h3>
            <Sliders size={18} /> Hyperplane Weight Controls
          </h3>

          {/* Dataset Selector */}
          <div className="param-group">
            <label className="param-label">3D Dataset Distribution:</label>
            <div className="pill-selector">
              {['separable', 'diagonal', 'overlapping'].map((type) => (
                <button
                  key={type}
                  className={`pill-btn ${datasetType === type ? 'active' : ''}`}
                  onClick={() => setDatasetType(type)}
                >
                  {type === 'separable' && '✨ Separable Blobs'}
                  {type === 'diagonal' && '📐 Diagonal Line'}
                  {type === 'overlapping' && '🌀 Overlapping'}
                </button>
              ))}
            </div>
          </div>

          {/* Weight 1 Slider */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Weight 1 ($w_1$):</label>
              <span className="param-val">{w1}</span>
            </div>
            <input
              type="range"
              min="-3.5"
              max="3.5"
              step="0.1"
              value={w1}
              onChange={(e) => setW1(parseFloat(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Weight 2 Slider */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Weight 2 ($w_2$):</label>
              <span className="param-val">{w2}</span>
            </div>
            <input
              type="range"
              min="-3.5"
              max="3.5"
              step="0.1"
              value={w2}
              onChange={(e) => setW2(parseFloat(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Bias Slider */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Bias ($b$):</label>
              <span className="param-val">{bias}</span>
            </div>
            <input
              type="range"
              min="-2.5"
              max="2.5"
              step="0.1"
              value={bias}
              onChange={(e) => setBias(parseFloat(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Sigmoid Temperature Scale */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Sigmoid Slope Steepness ($k$):</label>
              <span className="param-val">{temperature}x</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="3.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="styled-slider"
            />
          </div>

          {/* Mathematical Formula Card */}
          <div className="weights-monitor-box glass mt-2">
            <h4>3D Sigmoid Decision Equation</h4>
            <div className="code-badge text-center py-2 text-purple-300">
              P(Y=1 | X) = σ({w1}x₁ + {w2}x₂ + {bias})
            </div>
            <div className="weight-row mt-2">
              <span>Decision Boundary:</span>
              <span className="code-badge">{w1}x₁ + {w2}x₂ + {bias} = 0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
