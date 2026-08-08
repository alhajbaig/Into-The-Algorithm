import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, Sparkles, CheckCircle2, Lock, BookOpen, Building2, Code2, Award, Zap, X, ChevronRight } from 'lucide-react'
import { GenomeHelixCanvas } from '../GenomeHelixCanvas'

export function DNAResearchChamber({ genes = [], chromosomes = [], clearedCount = 0 }) {
  const [selectedChromosome, setSelectedChromosome] = useState(null)
  const [selectedGene, setSelectedGene] = useState(null)

  const detailedChromosomes = [
    {
      id: 'chr-01',
      code: 'CHR-01: FOUNDATIONS',
      name: 'Linear Models & Matrix Algebra',
      rarity: 'LEGENDARY CORE',
      color: '#38bdf8',
      symbol: '∑',
      count: '15 Models',
      cleared: 15,
      total: 15,
      status: 'Mastered',
      math: 'y = W^T x + b \\quad | \\quad \\mathcal{L} = \\frac{1}{2n}\\sum(y_i - \\hat{y}_i)^2',
      difficulty: 'Level 1-20 (Foundational)',
      prereqs: 'Linear Algebra, Calculus, Python Basics',
      apps: 'Predictive analytics, financial credit scoring, Medical diagnosis baselines',
      companies: ['Google', 'Meta', 'JPMorgan Chase', 'Tesla'],
      papers: ['Rosenblatt (1958) - The Perceptron', 'Hoerl & Kennard (1970) - Ridge Regression'],
      description: 'The fundamental atomic strand of AI intelligence containing linear regression, logistic classification, vector spaces, and loss landscapes.'
    },
    {
      id: 'chr-02',
      code: 'CHR-02: OPTIMIZATION',
      name: 'Gradient Descent & Synaptic Backprop',
      rarity: 'EPIC ENGINE',
      color: '#34d399',
      symbol: '∇',
      count: '20 Models',
      cleared: 18,
      total: 20,
      status: 'Evolving',
      math: '\\theta_{t+1} = \\theta_t - \\eta \\frac{\\nabla E}{\\sqrt{v_t} + \\epsilon}',
      difficulty: 'Level 21-40 (Intermediate)',
      prereqs: 'Multivariable Calculus, Automatic Differentiation',
      apps: 'Deep learning backpropagation, AdamW, SGD momentum optimization',
      companies: ['OpenAI', 'DeepMind', 'NVIDIA', 'Anthropic'],
      papers: ['Rumelhart & Hinton (1986) - Backpropagation', 'Kingma & Ba (2014) - Adam Optimizer'],
      description: 'The engine of neural learning governing loss optimization, automatic backpropagation gradients, AdamW, and learning rate schedules.'
    },
    {
      id: 'chr-03',
      code: 'CHR-03: VISION',
      name: 'Convolutional & Spatial Networks',
      rarity: 'RARE VISUAL',
      color: '#a78bfa',
      symbol: '👁',
      count: '18 Models',
      cleared: 14,
      total: 18,
      status: 'Evolving',
      math: '(S * K)(i, j) = \\sum_{m}\\sum_{n} S(i-m, j-n) K(m, n)',
      difficulty: 'Level 41-60 (Advanced)',
      prereqs: 'Matrix Convolutions, Feature Maps, Pooling',
      apps: 'Autonomous driving perception, Medical MRI segmentation, FaceID',
      companies: ['Tesla', 'Apple', 'Waymo', 'Mobileye'],
      papers: ['LeCun et al. (1998) - LeNet-5', 'Krizhevsky et al. (2012) - AlexNet', 'He et al. (2015) - ResNet'],
      description: 'Spatial receptive fields, convolutional feature extractors, residual skip-connections, and vision transformers.'
    },
    {
      id: 'chr-04',
      code: 'CHR-04: SEQUENTIAL',
      name: 'Recurrent & Temporal Memory',
      rarity: 'EPIC TEMPORAL',
      color: '#c084fc',
      symbol: '⏱',
      count: '12 Models',
      cleared: 10,
      total: 12,
      status: 'Evolving',
      math: 'c_t = f_t \\odot c_{t-1} + i_t \\odot \\tilde{c}_t',
      difficulty: 'Level 61-75 (Advanced)',
      prereqs: 'Time-series analysis, Gated recurrent units',
      apps: 'Stock market forecasting, Speech recognition, Machine translation',
      companies: ['Apple', 'Microsoft', 'Bloomberg', 'IBM'],
      papers: ['Hochreiter & Schmidhuber (1997) - Long Short-Term Memory (LSTM)', 'Cho et al. (2014) - GRU'],
      description: 'Sequential temporal dynamics, gated recurrent cells (LSTM/GRU), and hidden state memory mechanisms.'
    },
    {
      id: 'chr-05',
      code: 'CHR-05: GENERATIVE',
      name: 'Attention, Transformers & Diffusion',
      rarity: 'MYTHIC FRONTIER',
      color: '#fbbf24',
      symbol: '⚡',
      count: '25 Models',
      cleared: 22,
      total: 25,
      status: 'Mastered',
      math: '\\text{Attention}(Q, K, V) = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
      difficulty: 'Level 76-90 (Frontier)',
      prereqs: 'Multi-Head Self-Attention, Positional Encoding, Latent Diffusion',
      apps: 'ChatGPT, Midjourney, Claude 3.5, Code Generation',
      companies: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Midjourney'],
      papers: ['Vaswani et al. (2017) - Attention Is All You Need', 'Rombach et al. (2022) - Stable Diffusion'],
      description: 'Self-attention mechanisms, multi-head transformer blocks, causal decoder masks, and latent score-based diffusion models.'
    },
    {
      id: 'chr-06',
      code: 'CHR-06: REASONING',
      name: 'Reinforcement & Frontier Reasoning',
      rarity: 'ULTRA FRONTIER',
      color: '#f43f5e',
      symbol: '🧠',
      count: '15 Models',
      cleared: 12,
      total: 15,
      status: 'Evolving',
      math: 'Q(s, a) \\leftarrow Q(s, a) + \\alpha \\left[ r + \\gamma \\max_{a\'} Q(s\', a\') - Q(s, a) \\right]',
      difficulty: 'Level 91-100 (Mastery)',
      prereqs: 'Markov Decision Processes, Policy Gradients, Chain-of-Thought',
      apps: 'DeepSeek-R1, AlphaGo, O1 Reasoning, Autonomous Robotics',
      companies: ['DeepMind', 'DeepSeek', 'OpenAI', 'Boston Dynamics'],
      papers: ['Mnih et al. (2015) - Human-level RL (DQN)', 'DeepSeek Team (2025) - DeepSeek-R1 Reasoning'],
      description: 'Reinforcement Learning from Human Feedback (RLHF), Monte Carlo Tree Search (MCTS), and test-time reasoning compute.'
    }
  ]

  return (
    <div className="dna-lab-layout">
      {/* Header */}
      <div className="chamber-header-block">
        <div className="chamber-badge-tag" style={{ '--accent-color': '#34d399' }}>
          <Dna size={14} />
          <span>RESEARCH CHAMBER 01 • BIOLUMINESCENT GENOME LAB</span>
        </div>
        <h2 className="chamber-title-text">Neural DNA &amp; Chromosome Matrix</h2>
        <p className="chamber-subtitle-text">
          Inspect your living double-helix strand, master the 6 foundational ML chromosomes, and unlock genetic algorithm blueprints.
        </p>
      </div>

      {/* 3D Bioluminescent Helix Canvas Viewport */}
      <div className="dna-lab-hero-viewport observatory-glass">
        <GenomeHelixCanvas genes={genes} onSelectGene={setSelectedGene} />
      </div>

      {/* 6 Collectible Chromosomes Grid */}
      <div className="chromosome-collectibles-grid">
        {detailedChromosomes.map((chr) => (
          <motion.div
            key={chr.id}
            className="chromosome-collectible-card observatory-glass"
            style={{
              '--card-color': chr.color,
              '--card-color-glow': chr.color + '33'
            }}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => setSelectedChromosome(chr)}
          >
            <span className="chr-rarity-chip" style={{ color: chr.color }}>
              {chr.rarity}
            </span>

            <div className="chr-card-header">
              <span className="chr-code-badge" style={{ color: chr.color }}>
                {chr.code}
              </span>
            </div>

            <div className="chr-card-title-row mt-2">
              <div className="chr-symbol" style={{ borderColor: chr.color, color: chr.color }}>
                {chr.symbol}
              </div>
              <div className="chr-meta">
                <h4>{chr.name}</h4>
                <span className="chr-count-text">{chr.count} • {chr.cleared}/{chr.total} Cleared</span>
              </div>
            </div>

            <p className="chr-desc mt-3">{chr.description}</p>

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-400 font-semibold">Click to Open Research Blueprint</span>
              <ChevronRight size={16} color={chr.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Drawer for Chromosome Blueprint */}
      <AnimatePresence>
        {selectedChromosome && (
          <div className="gene-modal-backdrop" onClick={() => setSelectedChromosome(null)}>
            <motion.div
              className="gene-modal-card observatory-glass"
              style={{ maxWidth: '640px' }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
                onClick={() => setSelectedChromosome(null)}
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-bold rounded-full" style={{ background: selectedChromosome.color + '22', color: selectedChromosome.color, border: `1px solid ${selectedChromosome.color}` }}>
                  {selectedChromosome.rarity}
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">{selectedChromosome.code}</span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2">{selectedChromosome.name}</h3>
              <p className="text-sm text-slate-300 mb-4">{selectedChromosome.description}</p>

              {/* Mathematical Blueprint Formula Box */}
              <div className="gene-formula-box">
                <span className="formula-label">FOUNDATIONAL MATHEMATICAL BLUEPRINT:</span>
                <code className="formula-code block text-cyan mt-1 font-mono text-sm">{selectedChromosome.math}</code>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 font-bold block mb-1">DIFFICULTY TIER</span>
                  <span className="text-xs font-semibold text-emerald-400">{selectedChromosome.difficulty}</span>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 font-bold block mb-1">PREREQUISITES</span>
                  <span className="text-xs font-semibold text-sky-400">{selectedChromosome.prereqs}</span>
                </div>
              </div>

              {/* Companies Using It */}
              <div className="mb-4">
                <span className="text-xs font-bold text-slate-400 block mb-2">INDUSTRY DEPLOYMENT (COMPANIES):</span>
                <div className="flex flex-wrap gap-2">
                  {selectedChromosome.companies.map((comp) => (
                    <span key={comp} className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 text-xs text-slate-200 font-medium rounded-lg">
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Research Papers */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-2">LANDMARK RESEARCH PAPERS:</span>
                <div className="space-y-1.5">
                  {selectedChromosome.papers.map((paper) => (
                    <div key={paper} className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                      <BookOpen size={13} />
                      <span>{paper}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
