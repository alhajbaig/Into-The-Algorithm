import { useEffect, useRef } from 'react'

export function GenomeCoreSphereCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let rotationX = 0
    let rotationY = 0
    let mouseX = 0
    let mouseY = 0

    const resize = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth || 540
        canvas.height = parent.clientHeight || 540
      }
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate 3D sphere particles
    const numSpherePoints = 240
    const sphereRadius = 180
    const points = []

    for (let i = 0; i < numSpherePoints; i++) {
      const phi = Math.acos(-1 + (2 * i) / numSpherePoints)
      const theta = Math.sqrt(numSpherePoints * Math.PI) * phi

      points.push({
        x: sphereRadius * Math.cos(theta) * Math.sin(phi),
        y: sphereRadius * Math.sin(theta) * Math.sin(phi),
        z: sphereRadius * Math.cos(phi),
        color: i % 3 === 0 ? '#38bdf8' : i % 3 === 1 ? '#34d399' : '#c084fc'
      })
    }

    // Floating equations
    const mathFormulas = [
      'σ(Wx + b)',
      '∇L_θ(x)',
      'Softmax(QK^T / √d)',
      'ReLU(z)',
      'E_x[log D(x)]',
      'arg min E[(y - f(x))^2]'
    ]
    const floatingTex = mathFormulas.map((tex, i) => ({
      text: tex,
      x: (Math.random() - 0.5) * 360,
      y: (Math.random() - 0.5) * 360,
      z: (Math.random() - 0.5) * 200,
      vy: -0.2 - Math.random() * 0.3
    }))

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      mouseX = (e.clientX - cx) * 0.00015
      mouseY = (e.clientY - cy) * 0.00015
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Render loop
    let tAngle = 0
    const render = () => {
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      rotationX += 0.006 + mouseY
      rotationY += 0.009 + mouseX
      tAngle += 0.02

      const cosX = Math.cos(rotationX)
      const sinX = Math.sin(rotationX)
      const cosY = Math.cos(rotationY)
      const sinY = Math.sin(rotationY)

      // Draw outer glowing halo ring
      const grad = ctx.createRadialGradient(cx, cy, sphereRadius * 0.5, cx, cy, sphereRadius * 1.3)
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.08)')
      grad.addColorStop(0.5, 'rgba(192, 132, 252, 0.05)')
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, sphereRadius * 1.3, 0, Math.PI * 2)
      ctx.fill()

      // Perspective Projection Constant
      const fov = 400

      // Render 3D Sphere Particles
      points.forEach((p) => {
        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY
        let z1 = p.z * cosY + p.x * sinY

        // Rotate X
        let y1 = p.y * cosX - z1 * sinX
        let z2 = z1 * cosX + p.y * sinX

        const scale = fov / (fov + z2 + 220)
        const screenX = cx + x1 * scale
        const screenY = cy + y1 * scale

        const alpha = Math.max(0.1, (z2 + sphereRadius) / (sphereRadius * 2))
        const radius = Math.max(1.2, 2.8 * scale)

        ctx.beginPath()
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha * 0.85
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.fill()
      })

      // Render Inner Alien-Tech Rotating Double Helix
      const helixPoints = 20
      const helixRadius = 45
      for (let i = 0; i < helixPoints; i++) {
        const ht = i * 0.35 + tAngle
        const hy = (i - helixPoints / 2) * 14

        const hxA = Math.sin(ht) * helixRadius
        const hzA = Math.cos(ht) * helixRadius

        const hxB = Math.sin(ht + Math.PI) * helixRadius
        const hzB = Math.cos(ht + Math.PI) * helixRadius

        // Project A
        const sA = fov / (fov + hzA + 220)
        const pxA = cx + hxA * sA
        const pyA = cy + hy * sA

        // Project B
        const sB = fov / (fov + hzB + 220)
        const pxB = cx + hxB * sB
        const pyB = cy + hy * sB

        // Draw connecting rung
        ctx.beginPath()
        ctx.moveTo(pxA, pyA)
        ctx.lineTo(pxB, pyB)
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Strand A Node
        ctx.beginPath()
        ctx.arc(pxA, pyA, 4 * sA, 0, Math.PI * 2)
        ctx.fillStyle = '#38bdf8'
        ctx.globalAlpha = 0.9
        ctx.shadowBlur = 10
        ctx.shadowColor = '#38bdf8'
        ctx.fill()

        // Strand B Node
        ctx.beginPath()
        ctx.arc(pxB, pyB, 4 * sB, 0, Math.PI * 2)
        ctx.fillStyle = '#c084fc'
        ctx.fill()
      }

      // Render Floating Mathematical Formulas
      ctx.shadowBlur = 0
      floatingTex.forEach((ft) => {
        ft.y += ft.vy
        if (ft.y < -260) ft.y = 260

        const scale = 400 / (400 + ft.z + 200)
        const px = cx + ft.x * scale
        const py = cy + ft.y * scale

        ctx.font = '11px "JetBrains Mono", monospace'
        ctx.fillStyle = 'rgba(148, 163, 184, 0.45)'
        ctx.globalAlpha = 0.45
        ctx.fillText(ft.text, px, py)
      })

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="hero-canvas-viewport">
      <canvas ref={canvasRef} className="core-sphere-canvas" />
      <div className="canvas-floating-badge">
        HOLOGRAPHIC GENOME CORE • ACTIVE
      </div>
    </div>
  )
}
