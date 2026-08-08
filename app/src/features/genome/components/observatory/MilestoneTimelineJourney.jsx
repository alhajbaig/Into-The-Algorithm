import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Award, BookOpen, ArrowRight, Sparkles, ChevronRight, Play } from 'lucide-react'

export function MilestoneTimelineJourney() {
  const milestones = [
    { year: 1957, title: 'Perceptron', author: 'Frank Rosenblatt', icon: '⚡', impact: 'The birth of hardware neural learning and single-layer decision boundaries.', paper: 'The Perceptron: A Probabilistic Model for Information Storage' },
    { year: 1986, title: 'Backpropagation', author: 'Rumelhart, Hinton & Williams', icon: '∇', impact: 'Enabled deep multi-layer neural networks to adjust weights via chain rule gradient calculation.', paper: 'Learning representations by back-propagating errors' },
    { year: 1998, title: 'LeNet-5 (CNN)', author: 'Yann LeCun et al.', icon: '👁', impact: 'Pioneered spatial convolutions and weight sharing for digit and character recognition.', paper: 'Gradient-Based Learning Applied to Document Recognition' },
    { year: 2012, title: 'AlexNet (GPU AI)', author: 'Krizhevsky, Sutskever & Hinton', icon: '🚀', impact: 'Ignited the modern deep learning revolution by leveraging GPU acceleration on ImageNet.', paper: 'ImageNet Classification with Deep Convolutional Neural Networks' },
    { year: 2014, title: 'GANs (Generative Adversarial)', author: 'Ian Goodfellow et al.', icon: '🎨', impact: 'Introduced min-max zero-sum game training between a generator and discriminator network.', paper: 'Generative Adversarial Nets' },
    { year: 2015, title: 'ResNet (Skip Connections)', author: 'Kaiming He et al.', icon: '⛓', impact: 'Residual identity skip-connections enabled training ultra-deep networks over 100+ layers without vanishing gradients.', paper: 'Deep Residual Learning for Image Recognition' },
    { year: 2017, title: 'Transformer (Attention)', author: 'Vaswani et al. (Google Brain)', icon: '💡', impact: 'Replaced recurrence with self-attention mechanisms, founding modern LLMs.', paper: 'Attention Is All You Need' },
    { year: 2018, title: 'BERT', author: 'Devlin et al. (Google AI)', icon: '📖', impact: 'Bidirectional Transformer representations that revolutionized NLP benchmarks.', paper: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding' },
    { year: 2020, title: 'GPT-3', author: 'OpenAI', icon: '🧠', impact: 'Demonstrated massive few-shot and zero-shot emergent capabilities at 175B scale.', paper: 'Language Models are Few-Shot Learners' },
    { year: 2022, title: 'Stable Diffusion', author: 'Rombach et al. (CompVis)', icon: '✨', impact: 'Democratized high-resolution text-to-image synthesis using latent score-based diffusion.', paper: 'High-Resolution Image Synthesis with Latent Diffusion Models' },
    { year: 2023, title: 'LLaMA 3', author: 'Meta AI', icon: '🦙', impact: 'Open-weights frontier LLM matching proprietary models across reasoning benchmarks.', paper: 'The LLaMA 3 Herd of Models' },
    { year: 2024, title: 'GPT-4o (Omni)', author: 'OpenAI', icon: '🌐', impact: 'Native end-to-end multimodal intelligence spanning vision, audio, text, and real-time conversation.', paper: 'GPT-4o System Card' },
    { year: 2025, title: 'DeepSeek-R1 (Reasoning)', author: 'DeepSeek AI', icon: '🔮', impact: 'Open-weights test-time reasoning models trained via pure reinforcement learning and chain-of-thought.', paper: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via RL' }
  ]

  const [activeIdx, setActiveIdx] = useState(6) // Default Transformer 2017
  const activeMilestone = milestones[activeIdx]

  return (
    <div className="timeline-journey-container">
      {/* Chamber Header */}
      <div className="chamber-header-block">
        <div className="chamber-badge-tag" style={{ '--accent-color': '#fbbf24' }}>
          <Calendar size={14} />
          <span>RESEARCH CHAMBER 04 • CINEMATIC CHRONOLOGICAL MUSEUM</span>
        </div>
        <h2 className="chamber-title-text">Breakthrough Timeline Exhibit</h2>
        <p className="chamber-subtitle-text">
          Traverse 68 years of artificial intelligence history from 1957 Rosenblatt Perceptron to 2025 DeepSeek-R1 Test-Time Reasoning.
        </p>
      </div>

      {/* Interactive Horizon Slider */}
      <div className="observatory-glass p-6 mb-8 overflow-x-auto">
        <div className="flex items-center gap-3 min-w-max pb-2">
          {milestones.map((m, idx) => {
            const isActive = activeIdx === idx
            return (
              <button
                key={m.year + m.title}
                type="button"
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/30'
                }`}
                onClick={() => setActiveIdx(idx)}
              >
                <span className="text-xl">{m.icon}</span>
                <span className="text-xs font-mono font-bold">{m.year}</span>
                <span className="text-xs font-bold truncate max-w-[100px]">{m.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Featured Milestone Museum Exhibit Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMilestone.year + activeMilestone.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="observatory-glass p-8 relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold rounded-full">
                MILESTONE YEAR: {activeMilestone.year}
              </span>
              <h3 className="text-3xl font-black text-white mt-2">{activeMilestone.title}</h3>
              <span className="text-sm text-slate-400 font-medium">Architect(s): {activeMilestone.author}</span>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-3xl">
              {activeMilestone.icon}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-900/70 border border-white/10 rounded-2xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                HISTORICAL SIGNIFICANCE &amp; IMPACT:
              </span>
              <p className="text-slate-200 text-sm leading-relaxed">{activeMilestone.impact}</p>
            </div>

            <div className="p-4 bg-slate-900/70 border border-white/10 rounded-2xl flex items-center gap-3">
              <BookOpen size={18} className="text-amber-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase block">LANDMARK RESEARCH PAPER:</span>
                <span className="text-sm font-mono text-cyan-300">{activeMilestone.paper}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
