import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, Sparkles, Star, Trophy, ArrowRight, Eye, Search } from 'lucide-react'
import { GENOME_DATABASE } from '../../explorer/engine/genomeDatabase'
import ModelGenomeInspectorModal from '../../explorer/components/ModelGenomeInspectorModal'

export function SpeciesAtlasGallery({ onSelectModel }) {
  const [selectedModel, setSelectedModel] = useState(null)
  const [filterFamily, setFilterFamily] = useState('All')
  const [search, setSearch] = useState('')

  const families = ['All', 'Linear', 'Neural', 'Convolutional', 'Attention', 'Generative', 'Frontier']

  const rarityMap = {
    'DeepSeek-R1': 'MYTHIC REASONING',
    'GPT-4o': 'MYTHIC FRONTIER',
    'Transformer': 'LEGENDARY ANCESTOR',
    'ResNet-50': 'EPIC RESIDUAL',
    'AlexNet': 'RARE GPU PIONEER',
    'LeNet-5': 'HISTORICAL CORE'
  }

  const filteredList = GENOME_DATABASE.filter((m) => {
    const matchesFamily = filterFamily === 'All' || m.family.toLowerCase().includes(filterFamily.toLowerCase())
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.family.toLowerCase().includes(search.toLowerCase())
    return matchesFamily && matchesSearch
  })

  return (
    <div className="species-atlas-container">
      {/* Header */}
      <div className="chamber-header-block">
        <div className="chamber-badge-tag" style={{ '--accent-color': '#f43f5e' }}>
          <Layers size={14} />
          <span>RESEARCH CHAMBER 05 • COLLECTIBLE ARTIFACT SPECIES GALLERY</span>
        </div>
        <h2 className="chamber-title-text">AI Species Atlas Vault</h2>
        <p className="chamber-subtitle-text">
          Every machine learning model represented as a rare collectible artifact. Explore rarity tiers, architectural genetics, and historical impact.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 observatory-glass p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {families.map((fam) => (
            <button
              key={fam}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterFamily === fam
                  ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 shadow-md shadow-rose-500/20'
                  : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
              }`}
              onClick={() => setFilterFamily(fam)}
            >
              {fam}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI species..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-1.5 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
          />
        </div>
      </div>

      {/* Collectible Cards Grid */}
      <div className="atlas-gallery-grid">
        {filteredList.map((m) => {
          const rarity = rarityMap[m.name] || 'EPIC ARTIFACT'
          const accentColor = m.family === 'Attention' ? '#fbbf24' : m.family === 'Convolutional' ? '#a78bfa' : m.family === 'Generative' ? '#34d399' : '#38bdf8'

          return (
            <motion.div
              key={m.id}
              className="atlas-collectible-card observatory-glass"
              style={{
                '--atlas-color': accentColor,
                '--atlas-color-glow': accentColor + '33'
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => {
                setSelectedModel(m)
                if (onSelectModel) onSelectModel(m.id)
              }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: accentColor + '22', color: accentColor, border: `1px solid ${accentColor}44` }}>
                  {rarity}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{m.introducedYear}</span>
              </div>

              <h3 className="text-xl font-black text-white mb-1">{m.name}</h3>
              <span className="text-xs font-semibold text-slate-400 block mb-3">{m.family} Family • Gen {m.generation}</span>

              <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">{m.description}</p>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5">
                <span className="text-slate-400 font-mono">Params: {m.specifications?.parameterCount || 'Varies'}</span>
                <div className="flex items-center gap-1 font-bold" style={{ color: accentColor }}>
                  <span>Inspect Spec</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Full Profile Modal */}
      {selectedModel && (
        <ModelGenomeInspectorModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  )
}
