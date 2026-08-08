import { useState } from 'react'
import { motion } from 'framer-motion'
import { Swords, Sparkles, CheckCircle2, AlertTriangle, Cpu, Zap, Activity } from 'lucide-react'
import { GENOME_DATABASE } from '../../explorer/engine/genomeDatabase'
import GeneticTraitsRadar from '../../explorer/components/GeneticTraitsRadar'

export function ComparisonArena() {
  const [selectedIds, setSelectedIds] = useState(['resnet-50', 'transformer-attention', 'gpt-4o'])

  const selectedModels = selectedIds.map((id) => GENOME_DATABASE.find((m) => m.id === id) || GENOME_DATABASE[0])

  const toggleModel = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) setSelectedIds(selectedIds.filter((m) => m !== id))
    } else {
      if (selectedIds.length < 3) setSelectedIds([...selectedIds, id])
    }
  }

  return (
    <div className="comparison-arena-container">
      {/* Header */}
      <div className="chamber-header-block">
        <div className="chamber-badge-tag" style={{ '--accent-color': '#3b82f6' }}>
          <Swords size={14} />
          <span>RESEARCH CHAMBER 06 • HOLOGRAPHIC SPEC COMPARISON ARENA</span>
        </div>
        <h2 className="chamber-title-text">Model Comparison Arena</h2>
        <p className="chamber-subtitle-text">
          Compare up to 3 AI model species side-by-side. Analyze architectural parameters, context windows, loss functions, radar trait metrics, and latency trade-offs.
        </p>
      </div>

      {/* Model Selection Chips Bar */}
      <div className="observatory-glass p-4 mb-8">
        <span className="text-xs font-bold text-slate-400 block mb-2">SELECT MODELS TO COMPARE (MAX 3):</span>
        <div className="flex flex-wrap gap-2">
          {GENOME_DATABASE.slice(0, 10).map((m) => {
            const isSel = selectedIds.includes(m.id)
            return (
              <button
                key={m.id}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSel
                    ? 'bg-blue-500/20 border border-blue-400 text-blue-300 shadow-md shadow-blue-500/20'
                    : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
                }`}
                onClick={() => toggleModel(m.id)}
              >
                {isSel ? '✓ ' : '+ '}{m.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Side-by-Side Holographic Columns */}
      <div className="arena-comparison-grid">
        {selectedModels.map((m, idx) => {
          const colors = ['#38bdf8', '#c084fc', '#34d399']
          const colColor = colors[idx % colors.length]

          return (
            <div
              key={m.id + idx}
              className="arena-model-column observatory-glass"
              style={{ borderColor: colColor + '44' }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono font-bold" style={{ color: colColor }}>
                  SLOT 0{idx + 1} • {m.family}
                </span>
                <span className="text-xs font-bold text-slate-400">{m.introducedYear}</span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2">{m.name}</h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">{m.blurb || m.description}</p>

              {/* Holographic Radar Chart */}
              <div className="mb-6 p-2 bg-slate-900/50 rounded-2xl border border-white/5">
                <GeneticTraitsRadar model={m} />
              </div>

              {/* Spec Bars */}
              <div className="space-y-3 font-mono text-xs mb-6">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Parameters</span>
                  <span className="font-bold text-white">{m.specifications?.parameterCount || '175B'}</span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Context Window</span>
                  <span className="font-bold text-cyan-400">{m.specifications?.contextWindow ? `${m.specifications.contextWindow}k` : '128k'} tokens</span>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-slate-400">Loss Function</span>
                  <span className="font-bold text-purple-300">{m.specifications?.lossFunction || 'Cross-Entropy'}</span>
                </div>
              </div>

              {/* Key Advantage */}
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                  <CheckCircle2 size={14} />
                  <span>KEY ADVANTAGE:</span>
                </div>
                <p className="text-xs text-slate-200">{m.pros || 'High parallel computational efficiency and scalable attention.'}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
