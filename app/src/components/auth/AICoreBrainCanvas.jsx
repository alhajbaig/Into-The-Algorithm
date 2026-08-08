import { useEffect, useRef } from 'react'

export default function AICoreBrainCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationFrameId
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth * 0.6)
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight)

    const handleResize = () => {
      if (!canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight
    }
    window.addEventListener('resize', handleResize)

    // Math formulas floating around the AI core
    const mathFormulas = [
      'σ(z) = 1 / (1 + e⁻ᶻ)',
      'WᵀX + b = Z',
      '∇L(θ) = ∂L/∂θ',
      'ŷ = softmax(Z)',
      'L₂ = λ||w||²',
      'Attention(Q,K,V)',
      'xᵢ ~ N(μ, Σ)',
      'KL(P || Q)'
    ]

    const floatingMath = Array.from({ length: 12 }, () => ({
      text: mathFormulas[Math.floor(Math.random() * mathFormulas.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: -0.15 - Math.random() * 0.3,
      opacity: 0.15 + Math.random() * 0.25,
      size: 11 + Math.floor(Math.random() * 4)
    }))

    // Generate 3D Neural Brain Nodes in spherical/oval cluster
    const centerX = width / 2
    const centerY = height / 2
    const nodeCount = 90

    const brainNodes = Array.from({ length: nodeCount }, () => {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 90 + Math.random() * 80

      return {
        x3d: r * Math.sin(phi) * Math.cos(theta),
        y3d: r * Math.sin(phi) * Math.sin(theta) * 0.75, // flatten oval
        z3d: r * Math.cos(phi),
        radius: 2 + Math.random() * 2.5,
        pulse: Math.random() * Math.PI * 2,
        active: Math.random() < 0.4
      }
    })

    // Orbital ring particles
    const ringParticles = Array.from({ length: 45 }, (_, i) => ({
      angle: (i / 45) * Math.PI * 2,
      radius: 190 + Math.random() * 30,
      speed: 0.005 + Math.random() * 0.005,
      size: 1.5 + Math.random() * 1.5
    }))

    // Mouse tracking
    let mouse = { x: -1000, y: -1000, active: false }
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    const onMouseLeave = () => {
      mouse.active = false
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    let rotationY = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      rotationY += 0.004

      const cx = width / 2
      const cy = height / 2

      // 1. Draw floating mathematical formulas
      ctx.font = '12px "JetBrains Mono", monospace'
      floatingMath.forEach((fm) => {
        fm.y += fm.speedY
        if (fm.y < -30) {
          fm.y = height + 30
          fm.x = Math.random() * width
        }
        ctx.fillStyle = `rgba(96, 165, 250, ${fm.opacity})`
        ctx.fillText(fm.text, fm.x, fm.y)
      })

      // 2. Draw outer orbital rings
      ringParticles.forEach((p) => {
        p.angle += p.speed
        const rx = cx + Math.cos(p.angle) * p.radius
        const ry = cy + Math.sin(p.angle) * (p.radius * 0.35)

        ctx.beginPath()
        ctx.arc(rx, ry, p.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.6)'
        ctx.shadowColor = 'rgba(6, 182, 212, 0.8)'
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // 3. Transform 3D brain nodes
      const projectedNodes = brainNodes.map((node) => {
        // Rotate around Y axis
        const cosY = Math.cos(rotationY)
        const sinY = Math.sin(rotationY)

        const xRot = node.x3d * cosY - node.z3d * sinY
        const zRot = node.x3d * sinY + node.z3d * cosY
        const yRot = node.y3d

        // Perspective scale
        const scale = 320 / (320 + zRot)
        let projX = cx + xRot * scale
        let projY = cy + yRot * scale

        // Mouse attraction
        if (mouse.active) {
          const dx = mouse.x - projX
          const dy = mouse.y - projY
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            const force = (130 - dist) / 130
            projX += (dx / dist) * force * 12
            projY += (dy / dist) * force * 12
          }
        }

        return {
          projX,
          projY,
          scale,
          radius: node.radius * scale,
          pulse: node.pulse + 0.03,
          active: node.active
        }
      })

      // 4. Draw connecting axon lines
      for (let i = 0; i < projectedNodes.length; i++) {
        const n1 = projectedNodes[i]
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n2 = projectedNodes[j]
          const dx = n2.projX - n1.projX
          const dy = n2.projY - n1.projY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 85) {
            const alpha = (1 - dist / 85) * 0.35 * n1.scale
            ctx.beginPath()
            ctx.moveTo(n1.projX, n1.projY)
            ctx.lineTo(n2.projX, n2.projY)
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // 5. Draw 3D brain nodes
      projectedNodes.forEach((node) => {
        ctx.beginPath()
        ctx.arc(node.projX, node.projY, Math.max(1, node.radius), 0, Math.PI * 2)
        ctx.fillStyle = node.active ? 'rgba(59, 130, 246, 0.95)' : 'rgba(167, 139, 250, 0.7)'
        ctx.shadowColor = 'rgba(59, 130, 246, 0.9)'
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      })

      // Center glowing core aura
      ctx.beginPath()
      ctx.arc(cx, cy, 45, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.08)'
      ctx.shadowColor = 'rgba(59, 130, 246, 0.4)'
      ctx.shadowBlur = 30
      ctx.fill()
      ctx.shadowBlur = 0

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

  return <canvas ref={canvasRef} className="ai-core-canvas-engine" />
}
