import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sliders, Cpu, Activity, Zap, RefreshCw, Sparkles, Terminal, Flame } from 'lucide-react'

export function MutationEngineConsole() {
  const canvasRef = useRef(null)

  const [depth, setDepth] = useState(24)
  const [width, setWidth] = useState(4096)
  const [learningRate, setLearningRate] = useState(0.0003)
  const [attentionHeads, setAttentionHeads] = useState(32)
  const [mutationPct, setMutationPct] = useState(15)
  const [optimizer, setOptimizer] = useState('AdamW')

  // Calculate dynamic live telemetry outputs
  const estimatedParams = Math.round((depth * width * width * 2) / 1e6) / 10 // in Billions
  const estimatedFlops = (depth * width * attentionHeads * 0.12).toFixed(1)
  const accuracyPred = Math.min(99.4, (82 + Math.log2(depth * width) * 1.1 + (attentionHeads / 10)).toFixed(1))
  const latencyMs = Math.round(depth * 0.85 + (width / 512) * 2.2)
  const trainingCost = Math.round(depth * width * 0.08)
  const powerWatts = Math.round(depth * width * 0.15 + attentionHeads * 12)

  // Live Canvas Organism effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let t = 0

    const render = () => {
      const w = canvas.width
      const h = canvas.height
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)
      t += 0.04

      const numLayers = Math.min(12, Math.max(4, Math.floor(depth / 3)))
      const nodesPerLayer = Math.min(10, Math.max(3, Math.floor(width / 512)))

      const layerSpacing = (w - 140) / (numLayers - 1)

      // Draw active synaptic connections
      for (let l = 0; l < numLayers - 1; l++) {
        const x1 = 70 + l * layerSpacing
        const x2 = 70 + (l + 1) * layerSpacing

        for (let n1 = 0; n1 < nodesPerLayer; n1++) {
          const y1 = cy + (n1 - (nodesPerLayer - 1) / 2) * 28
          for (let n2 = 0; n2 < nodesPerLayer; n2++) {
            const y2 = cy + (n2 - (nodesPerLayer - 1) / 2) * 28

            const alpha = 0.1 + 0.3 * Math.sin(t + l + n1 + n2)
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.strokeStyle = `rgba(192, 132, 252, ${Math.max(0.05, alpha)})`
            ctx.lineWidth = 1.2
            ctx.stroke()
          }
        }
      }

      // Draw evolving layer nodes
      for (let l = 0; l < numLayers; l++) {
        const x = 70 + l * layerSpacing
        for (let n = 0; n < nodesPerLayer; n++) {
          const y = cy + (n - (nodesPerLayer - 1) / 2) * 28
          const nodePulse = Math.sin(t * 2 + l * 0.5 + n) * 2

          ctx.beginPath()
          ctx.arc(x, y, 6 + nodePulse, 0, Math.PI * 2)
          ctx.fillStyle = l === 0 ? '#38bdf8' : l === numLayers - 1 ? '#34d399' : '#c084fc'
          ctx.shadowColor = ctx.fillStyle
          ctx.shadowBlur = 10
          ctx.fill()
        }
      }

      ctx.shadowBlur = 0
      animId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(animId)
  }, [depth, width, attentionHeads, mutationPct])

  return (
    <div className="mutation-console-container">
      {/* Header */}
      <div className="chamber-header-block">
        <div className="chamber-badge-tag" style={{ '--accent-color': '#c084fc' }}>
          <Sliders size={14} />
          <span>RESEARCH CHAMBER 03 • GENETIC HYPERPARAMETER MUTATION CONSOLE</span>
        </div>
        <h2 className="chamber-title-text">AI Mutation Laboratory Console</h2>
        <p className="chamber-subtitle-text">
          Edit genetic hyperparameter sequences. Watch the living neural organism physically grow, adapt, and recalculate compute, FLOPs, and accuracy live.
        </p>
      </div>

      <div className="mutation-console-layout">
        {/* Left Side: DNA Editing Tools */}
        <div className="mutation-tools-panel observatory-glass">
          <div className="flex items-center gap-2 mb-6 text-purple-400 font-bold text-sm">
            <Terminal size={18} />
            <span>GENETIC DNA EDITING TOOLS</span>
          </div>

          {/* Slider 1: Layer Depth */}
          <div className="mutation-tool-slider-group">
            <div className="slider-label-row">
              <span>Transformer Depth (Layers)</span>
              <strong className="text-purple-400">{depth} Layers</strong>
            </div>
            <input
              type="range"
              min="6"
              max="96"
              step="6"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="mutation-slider-input"
            />
          </div>

          {/* Slider 2: Hidden Dimension */}
          <div className="mutation-tool-slider-group">
            <div className="slider-label-row">
              <span>Hidden Dimension Width</span>
              <strong className="text-purple-400">{width} d_model</strong>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="256"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="mutation-slider-input"
            />
          </div>

          {/* Slider 3: Attention Heads */}
          <div className="mutation-tool-slider-group">
            <div className="slider-label-row">
              <span>Attention Heads (H)</span>
              <strong className="text-cyan-400">{attentionHeads} Heads</strong>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              step="8"
              value={attentionHeads}
              onChange={(e) => setAttentionHeads(Number(e.target.value))}
              className="mutation-slider-input"
            />
          </div>

          {/* Slider 4: Learning Rate */}
          <div className="mutation-tool-slider-group">
            <div className="slider-label-row">
              <span>Learning Rate (η)</span>
              <strong className="text-emerald-400">{learningRate}</strong>
            </div>
            <input
              type="range"
              min="0.00005"
              max="0.005"
              step="0.00005"
              value={learningRate}
              onChange={(e) => setLearningRate(Number(e.target.value))}
              className="mutation-slider-input"
            />
          </div>

          {/* Slider 5: Mutation % */}
          <div className="mutation-tool-slider-group">
            <div className="slider-label-row">
              <span>Genome Mutation Rate</span>
              <strong className="text-rose-400">{mutationPct}%</strong>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={mutationPct}
              onChange={(e) => setMutationPct(Number(e.target.value))}
              className="mutation-slider-input"
            />
          </div>

          {/* Optimizer Selector */}
          <div className="mt-4">
            <span className="text-xs font-bold text-slate-400 block mb-2">OPTIMIZER SPECIES:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {['AdamW', 'Lion', 'Sophia', 'SGD'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOptimizer(opt)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                    optimizer === opt
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Live Evolving Organism & Telemetry */}
        <div className="mutation-organism-viewport observatory-glass">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono font-bold text-purple-400 tracking-wider">
                LIVE NEURAL ORGANISM PHENOTYPE • ACTIVE SYNAPSES
              </span>
              <span className="text-xs px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-full font-mono font-bold">
                {estimatedParams}B Parameters
              </span>
            </div>

            {/* Live Organism Canvas */}
            <canvas ref={canvasRef} width={700} height={380} className="organism-canvas" />
          </div>

          {/* Dynamic Telemetry Readout Cards */}
          <div className="mutation-telemetry-readout">
            <div className="readout-tile">
              <span className="lbl">Accuracy Pred.</span>
              <span className="val text-emerald">{accuracyPred}%</span>
            </div>

            <div className="readout-tile">
              <span className="lbl">Estimated FLOPs</span>
              <span className="val text-cyan">{estimatedFlops} TFLOPs</span>
            </div>

            <div className="readout-tile">
              <span className="lbl">Inference Latency</span>
              <span className="val text-purple">{latencyMs} ms</span>
            </div>

            <div className="readout-tile">
              <span className="lbl">Power Draw</span>
              <span className="val text-amber">{powerWatts} W</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
