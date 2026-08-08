import { motion } from 'framer-motion'
import { Dna, Compass, Sliders, Calendar, Layers, Swords, BookOpen, Sparkles } from 'lucide-react'

export function ObservatoryChamberNav({ activeChamber, onSelectChamber, onSwitchToSpeciesCatalog }) {
  const chambers = [
    { id: 'dna', label: 'DNA Lab', icon: Dna, accent: '#34d399', accentGlow: 'rgba(52, 211, 153, 0.3)' },
    { id: 'observatory', label: 'Evolution Observatory', icon: Compass, accent: '#38bdf8', accentGlow: 'rgba(56, 189, 248, 0.3)' },
    { id: 'mutation', label: 'Mutation Engine', icon: Sliders, accent: '#c084fc', accentGlow: 'rgba(192, 132, 252, 0.3)' },
    { id: 'timeline', label: 'Timeline Journey', icon: Calendar, accent: '#fbbf24', accentGlow: 'rgba(251, 191, 36, 0.3)' },
    { id: 'atlas', label: 'Species Atlas', icon: Layers, accent: '#f43f5e', accentGlow: 'rgba(244, 63, 94, 0.3)' },
    { id: 'arena', label: 'Comparison Arena', icon: Swords, accent: '#3b82f6', accentGlow: 'rgba(59, 130, 246, 0.3)' },
    { id: 'archive', label: 'Research Archive', icon: BookOpen, accent: '#10b981', accentGlow: 'rgba(16, 185, 129, 0.3)' },
  ]

  return (
    <div className="chamber-nav-sticky-bar">
      <div className="chamber-nav-items-grid">
        {chambers.map((ch) => {
          const IconComp = ch.icon
          const isActive = activeChamber === ch.id
          return (
            <button
              key={ch.id}
              type="button"
              className={`chamber-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectChamber(ch.id)}
              style={{
                '--chamber-accent': ch.accent,
                '--chamber-accent-glow': ch.accentGlow,
                '--chamber-accent-bg': ch.accent + '22'
              }}
              data-magnetic
            >
              <IconComp size={16} color={isActive ? ch.accent : '#94a3b8'} />
              <span>{ch.label}</span>
            </button>
          )
        })}

        {onSwitchToSpeciesCatalog && (
          <button
            type="button"
            className="chamber-nav-btn"
            onClick={onSwitchToSpeciesCatalog}
            style={{
              '--chamber-accent': '#10b981',
              '--chamber-accent-glow': 'rgba(16, 185, 129, 0.35)',
              '--chamber-accent-bg': 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)'
            }}
            data-magnetic
          >
            <Sparkles size={16} color="#10b981" />
            <span style={{ color: '#34d399', fontWeight: 800 }}>30+ Model Catalog</span>
          </button>
        )}
      </div>
    </div>
  )
}

