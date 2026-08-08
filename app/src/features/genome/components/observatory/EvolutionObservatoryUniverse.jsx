import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn, ZoomOut, RotateCcw, Compass, Sparkles, Network, ArrowRight, X } from 'lucide-react'
import { GENOME_DATABASE } from '../../explorer/engine/genomeDatabase'
import ModelGenomeInspectorModal from '../../explorer/components/ModelGenomeInspectorModal'

export function EvolutionObservatoryUniverse({ onSelectModel }) {
  const canvasRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedModel, setSelectedModel] = useState(null)

  // Celestial algorithm species map
  const universeSpecies = [
    { id: 'perceptron', name: 'Rosenblatt Perceptron', family: 'Foundations', year: 1957, x: -380, y: 0, color: '#38bdf8', parents: [] },
    { id: 'backprop', name: 'Backpropagation', family: 'Foundations', year: 1986, x: -280, y: -90, color: '#38bdf8', parents: ['perceptron'] },
    { id: 'lenet5', name: 'LeNet-5', family: 'Vision', year: 1998, x: -180, y: 110, color: '#a78bfa', parents: ['backprop'] },
    { id: 'alexnet', name: 'AlexNet', family: 'Vision', year: 2012, x: -60, y: 140, color: '#a78bfa', parents: ['lenet5'] },
    { id: 'resnet', name: 'ResNet-50', family: 'Vision', year: 2015, x: 80, y: 160, color: '#a78bfa', parents: ['alexnet'] },
    { id: 'vit', name: 'Vision Transformer', family: 'Vision', year: 2020, x: 220, y: 170, color: '#a78bfa', parents: ['resnet', 'transformer'] },
    { id: 'yolo', name: 'YOLOv8', family: 'Vision', year: 2023, x: 340, y: 190, color: '#a78bfa', parents: ['resnet'] },
    { id: 'transformer', name: 'Transformer (Attention)', family: 'Generative', year: 2017, x: 60, y: -120, color: '#fbbf24', parents: ['backprop'] },
    { id: 'bert', name: 'BERT', family: 'Generative', year: 2018, x: 180, y: -200, color: '#fbbf24', parents: ['transformer'] },
    { id: 'gpt3', name: 'GPT-3', family: 'Generative', year: 2020, x: 200, y: -60, color: '#fbbf24', parents: ['transformer'] },
    { id: 'llama3', name: 'LLaMA 3', family: 'Generative', year: 2024, x: 340, y: -100, color: '#fbbf24', parents: ['gpt3'] },
    { id: 'deepseek-r1', name: 'DeepSeek-R1', family: 'Reasoning', year: 2025, x: 460, y: -40, color: '#f43f5e', parents: ['llama3'] },
    { id: 'diffusion', name: 'Stable Diffusion', family: 'Generative', year: 2022, x: 280, y: 40, color: '#34d399', parents: ['transformer'] }
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let pulseTime = 0

    const render = () => {
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2 + pan.x
      const cy = h / 2 + pan.y

      ctx.clearRect(0, 0, w, h)
      pulseTime += 0.03

      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(zoom, zoom)

      // Draw energy beams connecting parent-child model lineages
      universeSpecies.forEach((node) => {
        node.parents.forEach((parentId) => {
          const parent = universeSpecies.find((p) => p.id === parentId)
          if (parent) {
            ctx.beginPath()
            ctx.moveTo(parent.x, parent.y)
            ctx.lineTo(node.x, node.y)

            const gradient = ctx.createLinearGradient(parent.x, parent.y, node.x, node.y)
            gradient.addColorStop(0, parent.color + '66')
            gradient.addColorStop(1, node.color + 'aa')

            ctx.strokeStyle = gradient
            ctx.lineWidth = 2
            ctx.setLineDash([6, 6])
            ctx.lineDashOffset = -pulseTime * 10
            ctx.stroke()
            ctx.setLineDash([])
          }
        })
      })

      // Draw celestial model nodes
      universeSpecies.forEach((node) => {
        const pulse = Math.sin(pulseTime + node.x) * 3

        // Outer glow
        const radGrad = ctx.createRadialGradient(node.x, node.y, 4, node.x, node.y, 22 + pulse)
        radGrad.addColorStop(0, node.color + 'aa')
        radGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = radGrad
        ctx.beginPath()
        ctx.arc(node.x, node.y, 24 + pulse, 0, Math.PI * 2)
        ctx.fill()

        // Core star node
        ctx.beginPath()
        ctx.arc(node.x, node.y, 7, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.shadowColor = node.color
        ctx.shadowBlur = 12
        ctx.fill()
        ctx.shadowBlur = 0

        // Label
        ctx.font = 'bold 11px Inter, sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.fillText(node.name, node.x, node.y + 24)

        ctx.font = '10px "JetBrains Mono", monospace'
        ctx.fillStyle = node.color
        ctx.fillText(`${node.year} • ${node.family}`, node.x, node.y + 36)
      })

      ctx.restore()
      animId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animId)
  }, [zoom, pan])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clickX = (e.clientX - rect.left - canvas.width / 2 - pan.x) / zoom
    const clickY = (e.clientY - rect.top - canvas.height / 2 - pan.y) / zoom

    // Find clicked celestial node
    const found = universeSpecies.find((s) => {
      const dx = s.x - clickX
      const dy = s.y - clickY
      return Math.sqrt(dx * dx + dy * dy) < 30
    })

    if (found) {
      const fullModel = GENOME_DATABASE.find((m) => m.id === found.id || m.name.toLowerCase().includes(found.name.split(' ')[0].toLowerCase())) || GENOME_DATABASE[0]
      setSelectedModel(fullModel)
      if (onSelectModel) onSelectModel(fullModel.id)
    }
  }

  return (
    <div className="observatory-universe-container">
      {/* Chamber Header */}
      <div className="chamber-header-block">
        <div className="chamber-badge-tag" style={{ '--accent-color': '#38bdf8' }}>
          <Compass size={14} />
          <span>RESEARCH CHAMBER 02 • THE CELESTIAL AI UNIVERSE</span>
        </div>
        <h2 className="chamber-title-text">Evolution Observatory Galaxy</h2>
        <p className="chamber-subtitle-text">
          Google Maps for Artificial Intelligence. Drag to navigate decades of AI model lineage, click nodes to inspect architectural genetics, and zoom to view microscopic details.
        </p>
      </div>

      {/* Universe Canvas Container */}
      <div className="observatory-universe-viewport observatory-glass">
        {/* Navigation Floating Controls */}
        <div className="universe-controls-overlay">
          <button type="button" className="universe-control-btn" onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}>
            <ZoomIn size={16} />
          </button>
          <button type="button" className="universe-control-btn" onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}>
            <ZoomOut size={16} />
          </button>
          <button type="button" className="universe-control-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}>
            <RotateCcw size={16} />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={1200}
          height={650}
          className="universe-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
        />
      </div>

      {/* Slide-out Inspector Drawer */}
      {selectedModel && (
        <ModelGenomeInspectorModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  )
}
