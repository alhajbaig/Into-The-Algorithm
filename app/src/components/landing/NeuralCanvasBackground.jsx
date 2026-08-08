import { useEffect, useRef, useState, useCallback } from 'react'

export default function NeuralCanvasBackground({ theme = 'cyber' }) {
  const canvasRef = useRef(null)
  const themeModeRef = useRef(theme)
  const [, setTick] = useState(0)

  const setThemeMode = useCallback((newTheme) => {
    themeModeRef.current = newTheme
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Floating AI & Mathematical Formulas
    const mathSymbols = [
      'σ(z) = 1 / (1 + e⁻ᶻ)',
      'WᵀX + b',
      '∇L(θ)',
      'ReLU(x) = max(0, x)',
      '∂L / ∂w',
      'ŷ = softmax(Z)',
      'L₂ = λ ||w||²',
      'E[(y - ŷ)²]',
      'η = 0.001',
      'Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V',
      'xᵢ ~ N(μ, Σ)',
      'KL(P || Q)',
      'mₜ = β₁mₜ₋₁ + (1-β₁)gₜ',
      'Loss = -∑ y log(ŷ)'
    ]

    const floatingTexts = Array.from({ length: 16 }, () => ({
      text: mathSymbols[Math.floor(Math.random() * mathSymbols.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: -0.18 - Math.random() * 0.35,
      opacity: 0.14 + Math.random() * 0.16,
      size: 11 + Math.floor(Math.random() * 4)
    }))

    // Floating Neural Network Nodes
    const nodeCount = Math.min(Math.floor((width * height) / 16000), 65)
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: 2 + Math.random() * 2.5,
      pulse: Math.random() * Math.PI * 2,
      activeSignal: Math.random() < 0.35
    }))

    // Mouse interactive force tracking
    let mouse = { x: -1000, y: -1000, active: false }
    const onMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.active = true
    }
    const onMouseLeave = () => {
      mouse.active = false
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Theme Colors Mapping
      let nodeColor = '59, 130, 246' // Cyber Blue
      let lineBaseColor = '96, 165, 250'
      let accentColor = '6, 182, 212' // Cyan

      if (themeModeRef.current === 'matrix') {
        nodeColor = '16, 185, 129' // Emerald
        lineBaseColor = '52, 211, 153'
        accentColor = '139, 92, 246' // Purple
      } else if (themeModeRef.current === 'violet') {
        nodeColor = '139, 92, 246' // AI Purple
        lineBaseColor = '192, 132, 252'
        accentColor = '236, 72, 153' // Pink
      }

      // 1. Draw floating mathematical formulas
      ctx.font = '12px "JetBrains Mono", ui-monospace, monospace'
      floatingTexts.forEach((ft) => {
        ft.y += ft.speedY
        if (ft.y < -30) {
          ft.y = height + 30
          ft.x = Math.random() * width
        }
        ctx.fillStyle = `rgba(${nodeColor}, ${ft.opacity})`
        ctx.fillText(ft.text, ft.x, ft.y)
      })

      // 2. Update and render particle nodes
      nodes.forEach((node, i) => {
        node.x += node.vx
        node.y += node.vy
        node.pulse += 0.025

        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1

        // Mouse interaction attraction
        if (mouse.active) {
          const dx = mouse.x - node.x
          const dy = mouse.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const force = (150 - dist) / 150
            node.x -= (dx / dist) * force * 1.6
            node.y -= (dy / dist) * force * 1.6

            // Draw connecting line to mouse pointer
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.strokeStyle = `rgba(${accentColor}, ${force * 0.4})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        // Draw node-to-node network connections
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j]
          const dx = other.x - node.x
          const dy = other.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.22
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(${lineBaseColor}, ${alpha})`
            ctx.lineWidth = 0.75
            ctx.stroke()

            // Travelling pulse signal along active connections
            if (node.activeSignal && Math.sin(node.pulse) > 0.75) {
              const progress = (Math.sin(node.pulse * 2) + 1) / 2
              const px = node.x + dx * progress
              const py = node.y + dy * progress
              ctx.beginPath()
              ctx.arc(px, py, 1.6, 0, Math.PI * 2)
              ctx.fillStyle = `rgba(${accentColor}, ${alpha * 2.2})`
              ctx.fill()
            }
          }
        }

        // Draw node dot with ambient glow
        const glowRadius = node.radius + Math.sin(node.pulse) * 1.1
        ctx.beginPath()
        ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${nodeColor}, 0.75)`
        ctx.shadowColor = `rgba(${nodeColor}, 0.6)`
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="neural-canvas-wrapper">
      <canvas ref={canvasRef} className="neural-canvas" />
      <div className="theme-switcher-pill" title="Toggle AI Canvas Theme">
        <span className="pill-lbl">Canvas Theme:</span>
        <button
          type="button"
          className={themeModeRef.current === 'cyber' ? 'active' : ''}
          onClick={() => setThemeMode('cyber')}
        >
          Cyber Blue
        </button>
        <button
          type="button"
          className={themeModeRef.current === 'matrix' ? 'active' : ''}
          onClick={() => setThemeMode('matrix')}
        >
          Emerald
        </button>
        <button
          type="button"
          className={themeModeRef.current === 'violet' ? 'active' : ''}
          onClick={() => setThemeMode('violet')}
        >
          AI Purple
        </button>
      </div>
    </div>
  )
}
