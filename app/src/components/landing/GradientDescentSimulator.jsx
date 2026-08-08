import { useEffect, useRef, useState, useCallback } from 'react'
import { Compass, RotateCcw, Play, Layers, TrendingDown, Target } from 'lucide-react'

// Loss function definition: 3D bowl with variable curvature (elongated ellipse)
function computeLoss(t1, t2, surfaceType = 'bowl') {
  if (surfaceType === 'saddle') {
    return 0.3 * (t1 * t1 - t2 * t2) + 1.5
  }
  if (surfaceType === 'himmelblau') {
    // Scaled Himmelblau function
    const x = t1
    const y = t2
    return 0.02 * (Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2))
  }
  // Standard anisotropic bowl
  return 0.4 * t1 * t1 + 2.2 * t2 * t2
}

function computeGradient(t1, t2, surfaceType = 'bowl') {
  if (surfaceType === 'saddle') {
    return { dt1: 0.6 * t1, dt2: -0.6 * t2 }
  }
  if (surfaceType === 'himmelblau') {
    const x = t1
    const y = t2
    const dt1 = 0.02 * (4 * x * (x * x + y - 11) + 2 * (x + y * y - 7))
    const dt2 = 0.02 * (2 * (x * x + y - 11) + 4 * y * (x + y * y - 7))
    return { dt1, dt2 }
  }
  return { dt1: 0.8 * t1, dt2: 4.4 * t2 }
}

export default function GradientDescentSimulator() {
  const canvasRef = useRef(null)
  const [surfaceType, setSurfaceType] = useState('bowl')
  const [optType, setOptType] = useState('momentum')
  const [learningRate, setLearningRate] = useState(0.12)
  const [momentum, setMomentum] = useState(0.7)
  const [theta, setTheta] = useState({ t1: -2.8, t2: 2.2 })
  const [velocity, setVelocity] = useState({ v1: 0, v2: 0 })
  const [path, setPath] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [stepCount, setStepCount] = useState(0)

  const stateRef = useRef({
    t1: -2.8,
    t2: 2.2,
    v1: 0,
    v2: 0,
    path: [{ t1: -2.8, t2: 2.2 }]
  })

  // Reset ball position
  const resetPos = useCallback((t1 = -2.8, t2 = 2.2) => {
    setIsRunning(false)
    stateRef.current = {
      t1,
      t2,
      v1: 0,
      v2: 0,
      path: [{ t1, t2 }]
    }
    setTheta({ t1, t2 })
    setVelocity({ v1: 0, v2: 0 })
    setPath([{ t1, t2 }])
    setStepCount(0)
  }, [])

  useEffect(() => {
    resetPos(-2.5, 2.3)
  }, [surfaceType, resetPos])

  // Single Gradient Step Calculation
  const stepGradient = useCallback(() => {
    const s = stateRef.current
    const { dt1, dt2 } = computeGradient(s.t1, s.t2, surfaceType)

    let nextV1 = 0
    let nextV2 = 0
    let nextT1 = s.t1
    let nextT2 = s.t2

    if (optType === 'sgd') {
      nextT1 = s.t1 - learningRate * dt1
      nextT2 = s.t2 - learningRate * dt2
    } else if (optType === 'momentum') {
      nextV1 = momentum * s.v1 - learningRate * dt1
      nextV2 = momentum * s.v2 - learningRate * dt2
      nextT1 = s.t1 + nextV1
      nextT2 = s.t2 + nextV2
    } else {
      // Nesterov Accelerated Gradient (NAG)
      const lookaheadT1 = s.t1 + momentum * s.v1
      const lookaheadT2 = s.t2 + momentum * s.v2
      const gradLook = computeGradient(lookaheadT1, lookaheadT2, surfaceType)
      nextV1 = momentum * s.v1 - learningRate * gradLook.dt1
      nextV2 = momentum * s.v2 - learningRate * gradLook.dt2
      nextT1 = s.t1 + nextV1
      nextT2 = s.t2 + nextV2
    }

    stateRef.current = {
      t1: nextT1,
      t2: nextT2,
      v1: nextV1,
      v2: nextV2,
      path: [...s.path, { t1: nextT1, t2: nextT2 }]
    }

    setTheta({ t1: nextT1, t2: nextT2 })
    setVelocity({ v1: nextV1, v2: nextV2 })
    setPath(stateRef.current.path)
    setStepCount((prev) => prev + 1)
  }, [surfaceType, optType, learningRate, momentum])

  // Draw contour map canvas
  const drawContourCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    // Domain bounds [-3.5, 3.5]
    const minDomain = -3.5
    const maxDomain = 3.5

    const toCanvasX = (val) => ((val - minDomain) / (maxDomain - minDomain)) * width
    const toCanvasY = (val) => ((maxDomain - val) / (maxDomain - minDomain)) * height
    const fromCanvasX = (cx) => minDomain + (cx / width) * (maxDomain - minDomain)
    const fromCanvasY = (cy) => maxDomain - (cy / height) * (maxDomain - minDomain)

    // Render Contour Heatmap
    const step = 6
    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        const dt1 = fromCanvasX(x + step / 2)
        const dt2 = fromCanvasY(y + step / 2)
        const lossVal = computeLoss(dt1, dt2, surfaceType)

        // Color mapping: low loss = deep indigo, high loss = bright cyan/violet
        const normLoss = Math.min(1, lossVal / 12)
        const r = Math.round(15 + normLoss * 140)
        const g = Math.round(23 + normLoss * 120)
        const b = Math.round(42 + normLoss * 210)

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.fillRect(x, y, step, step)
      }
    }

    // Render Contour Ring Lines
    const levels = [0.2, 0.8, 2.0, 4.0, 7.0, 11.0, 16.0]
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.lineWidth = 1.2

    for (let gx = 0; gx < width; gx += 15) {
      for (let gy = 0; gy < height; gy += 15) {
        const dt1 = fromCanvasX(gx)
        const dt2 = fromCanvasY(gy)
        const lossVal = computeLoss(dt1, dt2, surfaceType)
        levels.forEach((lvl) => {
          if (Math.abs(lossVal - lvl) < 0.18) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
            ctx.fillRect(gx, gy, 2, 2)
          }
        })
      }
    }

    // Draw Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
    ctx.beginPath()
    ctx.moveTo(toCanvasX(0), 0)
    ctx.lineTo(toCanvasX(0), height)
    ctx.moveTo(0, toCanvasY(0))
    ctx.lineTo(width, toCanvasY(0))
    ctx.stroke()

    // Minimum Target Indicator
    const targetX = toCanvasX(0)
    const targetY = toCanvasY(0)
    ctx.beginPath()
    ctx.arc(targetX, targetY, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#34d399'
    ctx.shadowColor = '#34d399'
    ctx.shadowBlur = 12
    ctx.fill()
    ctx.shadowBlur = 0

    // Draw Trajectory Trail
    const curPath = stateRef.current.path
    if (curPath.length > 1) {
      ctx.beginPath()
      ctx.moveTo(toCanvasX(curPath[0].t1), toCanvasY(curPath[0].t1 ? curPath[0].t2 : 0))
      for (let i = 1; i < curPath.length; i++) {
        ctx.lineTo(toCanvasX(curPath[i].t1), toCanvasY(curPath[i].t2))
      }
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 2.5
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 10
      ctx.stroke()
      ctx.shadowBlur = 0

      // Step nodes along path
      curPath.forEach((pt, i) => {
        ctx.beginPath()
        ctx.arc(toCanvasX(pt.t1), toCanvasY(pt.t2), i === curPath.length - 1 ? 7 : 3, 0, Math.PI * 2)
        ctx.fillStyle = i === curPath.length - 1 ? '#60a5fa' : 'rgba(251, 191, 36, 0.7)'
        ctx.fill()
      })
    }

    // Draw Current Ball Position
    const curX = toCanvasX(stateRef.current.t1)
    const curY = toCanvasY(stateRef.current.t2)
    ctx.beginPath()
    ctx.arc(curX, curY, 9, 0, Math.PI * 2)
    ctx.fillStyle = '#60a5fa'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5
    ctx.shadowColor = '#60a5fa'
    ctx.shadowBlur = 16
    ctx.fill()
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [surfaceType])

  useEffect(() => {
    drawContourCanvas()
  }, [drawContourCanvas, theta, path])

  // Handle Canvas Click to reposition ball
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    const width = canvas.width
    const height = canvas.height
    const minDomain = -3.5
    const maxDomain = 3.5

    const clickT1 = minDomain + (cx / width) * (maxDomain - minDomain)
    const clickT2 = maxDomain - (cy / height) * (maxDomain - minDomain)

    resetPos(clickT1, clickT2)
  }

  // Animation Loop when IsRunning
  useEffect(() => {
    let interval
    if (isRunning) {
      interval = setInterval(() => {
        const curLoss = computeLoss(stateRef.current.t1, stateRef.current.t2, surfaceType)
        if (curLoss < 0.001 || stateRef.current.path.length > 150) {
          setIsRunning(false)
          return
        }
        stepGradient()
      }, 70)
    }
    return () => clearInterval(interval)
  }, [isRunning, stepGradient, surfaceType])

  const curLoss = computeLoss(theta.t1, theta.t2, surfaceType)
  const { dt1, dt2 } = computeGradient(theta.t1, theta.t2, surfaceType)
  const gradMag = Math.sqrt(dt1 * dt1 + dt2 * dt2)

  return (
    <section className="gradient-section">
      <div className="playground-header">
        <div className="playground-title-group">
          <div className="section-badge">
            <Compass size={14} /> OPTIMIZATION VISUALIZER
          </div>
          <h2>Gradient Descent <em>Loss Landscape</em></h2>
          <p className="playground-desc">
            Click anywhere on the loss contour map to set initial parameter weights ($\theta_1, \theta_2$). Compare vanilla SGD against Momentum & Nesterov acceleration as they navigate the loss bowl!
          </p>
        </div>

        <div className="playground-stats-bar glass">
          <div className="p-stat">
            <span className="p-stat-label">STEPS</span>
            <span className="p-stat-value">{stepCount}</span>
          </div>
          <div className="p-stat">
            <span className="p-stat-label">LOSS $J(\theta)$</span>
            <span className="p-stat-value highlight-purple">{curLoss.toFixed(4)}</span>
          </div>
          <div className="p-stat">
            <span className="p-stat-label">GRADIENT ||∇J||</span>
            <span className="p-stat-value highlight-green">{gradMag.toFixed(4)}</span>
          </div>
        </div>
      </div>

      <div className="playground-grid">
        {/* Contour Map Canvas */}
        <div className="canvas-card glass">
          <div className="canvas-topbar">
            <span className="canvas-tag">
              <Target size={14} /> Click contour map to set initial weights ($\theta_1, \theta_2$)
            </span>
            <span className="badge-target">🎯 Target: Minimum (0,0)</span>
          </div>

          <div className="canvas-container">
            <canvas
              ref={canvasRef}
              width={460}
              height={420}
              className="playground-canvas interactive-cursor"
              onClick={handleCanvasClick}
            />
          </div>

          <div className="canvas-controls">
            <button
              className={`btn primary play-btn ${isRunning ? 'active-pulse' : ''}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? '⏸ Pause Descent' : <><Play size={16} fill="currentColor" /> Run Optimization</>}
            </button>

            <button className="btn" onClick={stepGradient} title="Step 1 Iteration">
              <TrendingDown size={16} /> 1 Step
            </button>

            <button className="btn" onClick={() => resetPos(-2.5, 2.3)} title="Reset Position">
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* Controls Column */}
        <div className="params-card glass">
          <h3>
            <Layers size={18} /> Optimizer Configurations
          </h3>

          {/* Surface Type */}
          <div className="param-group">
            <label className="param-label">Loss Function Landscape:</label>
            <div className="pill-selector">
              {[
                { id: 'bowl', name: 'Elliptic Bowl' },
                { id: 'saddle', name: 'Saddle Point' },
                { id: 'himmelblau', name: 'Himmelblau' }
              ].map((item) => (
                <button
                  key={item.id}
                  className={`pill-btn ${surfaceType === item.id ? 'active' : ''}`}
                  onClick={() => setSurfaceType(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Optimizer Type */}
          <div className="param-group">
            <label className="param-label">Optimization Algorithm:</label>
            <div className="pill-selector">
              {[
                { id: 'sgd', name: 'Vanilla SGD' },
                { id: 'momentum', name: 'SGD + Momentum' },
                { id: 'nesterov', name: 'Nesterov (NAG)' }
              ].map((item) => (
                <button
                  key={item.id}
                  className={`pill-btn ${optType === item.id ? 'active' : ''}`}
                  onClick={() => setOptType(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Rate Slider */}
          <div className="param-group">
            <div className="param-header">
              <label className="param-label">Learning Rate ($\alpha$):</label>
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

          {/* Momentum Coefficient Slider */}
          {optType !== 'sgd' && (
            <div className="param-group">
              <div className="param-header">
                <label className="param-label">Momentum Coefficient ($\beta$):</label>
                <span className="param-val">{momentum}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.95"
                step="0.05"
                value={momentum}
                onChange={(e) => setMomentum(parseFloat(e.target.value))}
                className="styled-slider"
              />
            </div>
          )}

          {/* Parameter Live Monitor Card */}
          <div className="weights-monitor-box glass">
            <h4>Live Weight Tensors</h4>
            <div className="weight-row">
              <span>$\theta_1$ (Weight 1):</span>
              <span className="code-badge">{theta.t1.toFixed(4)}</span>
            </div>
            <div className="weight-row">
              <span>$\theta_2$ (Weight 2):</span>
              <span className="code-badge">{theta.t2.toFixed(4)}</span>
            </div>
            <div className="weight-row">
              <span>$v_1$ (Velocity 1):</span>
              <span className="code-badge">{velocity.v1.toFixed(4)}</span>
            </div>
            <div className="weight-row">
              <span>$v_2$ (Velocity 2):</span>
              <span className="code-badge">{velocity.v2.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
