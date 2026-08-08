import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Star, ChevronRight, Search, Trophy, Sparkles, Filter, CheckCircle2, Zap } from 'lucide-react'
import { LEVELS } from '../data/content'
import { useGame } from '../context/GameContext'
import { useGSAPAnimations } from '../hooks/useGSAPAnimations'

const CHAPTER_FILTERS = [
  { id: 'all', name: 'All 100 Levels' },
  { id: 1, name: 'Ch 1: Foundations (1-12)', domain: 'fundamentals', color: '#3b82f6' },
  { id: 2, name: 'Ch 2: Preprocessing (13-24)', domain: 'preprocessing', color: '#f97316' },
  { id: 3, name: 'Ch 3: Classical ML (25-40)', domain: 'regression', color: '#06b6d4' },
  { id: 4, name: 'Ch 4: Ensembles (41-52)', domain: 'trees', color: '#10b981' },
  { id: 5, name: 'Ch 5: Advanced ML (53-64)', domain: 'advanced', color: '#6366f1' },
  { id: 6, name: 'Ch 6: Deep Learning (65-76)', domain: 'nn', color: '#8b5cf6' },
  { id: 7, name: 'Ch 7: LLMs & GenAI (77-88)', domain: 'nlp', color: '#ec4899' },
  { id: 8, name: 'Ch 8: MLOps & Capstone (89-100)', domain: 'interview', color: '#fbbf24' }
]

function getDomainColor(type, color) {
  if (color) return color
  const lower = (type || '').toLowerCase()
  if (lower.includes('regression')) return '#06b6d4'
  if (lower.includes('tree') || lower.includes('forest')) return '#10b981'
  if (lower.includes('deep') || lower.includes('nn')) return '#8b5cf6'
  if (lower.includes('nlp') || lower.includes('llm')) return '#ec4899'
  if (lower.includes('coding')) return '#6366f1'
  if (lower.includes('interview')) return '#fbbf24'
  return '#3b82f6'
}

export default function LevelMap() {
  const { progress, isUnlocked, modeStatus } = useGame()
  const containerRef = useRef(null)

  const [activeChapter, setActiveChapter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Campaign Stats calculation
  const campaignStats = useMemo(() => {
    const total = LEVELS.length
    const cleared = progress.clearedLevels?.length || 0
    const percent = Math.round((cleared / total) * 100)
    const stars = progress.totalStars || 0
    const currentLevel = cleared + 1
    const currentTier = LEVELS.find((l) => l.id === currentLevel)?.tier || 'AI Architect'

    return { total, cleared, percent, stars, currentTier, currentLevel }
  }, [progress.clearedLevels, progress.totalStars])

  // Filtered Levels
  const filteredLevels = useMemo(() => {
    let list = LEVELS

    if (activeChapter !== 'all') {
      list = list.filter((l) => l.chapter === activeChapter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.blurb.toLowerCase().includes(q) ||
          (l.tier && l.tier.toLowerCase().includes(q)) ||
          `level ${l.id}`.includes(q)
      )
    }

    return list
  }, [activeChapter, searchQuery])

  // Initialize GSAP scroll triggers and 3D card tilt
  useGSAPAnimations(containerRef, [filteredLevels, activeChapter])

  return (
    <section className="futuristic-map-wrapper" ref={containerRef}>
      {/* 1. HERO CAMPAIGN BANNER */}
      <div className="map-hero-banner glass" data-gsap="reveal">
        <div className="banner-left">
          <div className="hero-eyebrow-pill">
            <Trophy size={14} className="text-gold" />
            <span>MACHINE LEARNING CAMPAIGN</span>
          </div>
          <h1 className="hero-title">
            ML Quest: <em>Beginner to AI Architect</em>
          </h1>
          <p className="hero-desc">
            Master the complete Machine Learning Engineering roadmap—from Python &amp; Linear Algebra to XGBoost, PyTorch, LLMs, RAG, and MLOps.
          </p>
        </div>

        {/* Campaign Metrics Bar */}
        <div className="campaign-metrics-row">
          <div className="metric-box">
            <span className="box-lbl">PROGRESS</span>
            <span className="box-val">{campaignStats.percent}%</span>
            <div className="mini-rail">
              <div className="mini-fill" style={{ width: `${campaignStats.percent}%` }} />
            </div>
            <span className="box-sub">({campaignStats.cleared} / {campaignStats.total} Cleared)</span>
          </div>

          <div className="metric-box">
            <span className="box-lbl">CURRENT RANK</span>
            <span className="box-val text-gold">{campaignStats.currentTier}</span>
            <span className="box-sub">Level {campaignStats.currentLevel} Active</span>
          </div>

          <div className="metric-box">
            <span className="box-lbl">STARS EARNED</span>
            <span className="box-val text-amber">{campaignStats.stars} ⭐</span>
            <span className="box-sub">Total Trophies</span>
          </div>
        </div>
      </div>

      {/* 2. CHAPTER FILTERS & SEARCH CONTROL BAR */}
      <div className="map-controls-bar glass" data-gsap="reveal">
        <div className="search-row">
          <div className="search-input-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search 100 levels by topic (e.g., PyTorch, XGBoost, Transformers, RAG, MLOps)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="chapter-pills-scroll">
          {CHAPTER_FILTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              className={`chapter-pill-btn ${activeChapter === ch.id ? 'active' : ''}`}
              onClick={() => setActiveChapter(ch.id)}
              style={activeChapter === ch.id && ch.color ? { borderColor: ch.color, background: ch.color + '25' } : undefined}
            >
              {ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONNECTED ROADMAP BOARD */}
      <div className="roadmap-board-container" data-gsap="stagger">
        {filteredLevels.length === 0 ? (
          <div className="empty-search-box glass">
            <Search size={40} className="muted-icon" />
            <h3>No levels found matching &quot;{searchQuery}&quot;</h3>
            <button
              type="button"
              className="modern-btn-primary"
              onClick={() => {
                setSearchQuery('')
                setActiveChapter('all')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="roadmap-levels-list">
            {filteredLevels.map((level, i) => {
              const unlocked = isUnlocked(level.id)
              const cleared = progress.clearedLevels?.includes(level.id)
              const stars = progress.levelStars?.[level.id] || 0
              const modes = modeStatus(level.id)
              const domainColor = getDomainColor(level.type, level.color)

              const cardContent = (
                <motion.div
                  className={`roadmap-level-row ${unlocked ? 'is-unlocked' : 'is-locked'} ${cleared ? 'is-cleared' : ''}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                >
                  {/* Glowing Connected Node Orb */}
                  <div className="node-portal-column">
                    <div
                      className={`node-orb ${cleared ? 'cleared-orb' : ''} ${!unlocked ? 'locked-orb' : ''}`}
                      style={{ '--domain-accent': domainColor }}
                    >
                      {unlocked ? (
                        cleared ? (
                          <CheckCircle2 size={20} color="#10b981" />
                        ) : (
                          <span className="emoji-icon">{level.emoji}</span>
                        )
                      ) : (
                        <Lock size={16} />
                      )}
                    </div>
                    {i < filteredLevels.length - 1 && <div className="connected-vertical-line" />}
                  </div>

                  {/* 3D Tilt Level Card */}
                  <div
                    className="roadmap-level-card glass"
                    data-tilt
                    style={{
                      '--domain-accent': domainColor,
                      borderColor: unlocked ? domainColor + '40' : undefined
                    }}
                  >
                    <div className="card-gloss-overlay" />

                    <div className="card-main-info">
                      <div className="card-top-tags">
                        <span className="tier-tag-chip" style={{ color: domainColor, borderColor: domainColor + '40', background: domainColor + '15' }}>
                          {level.tier || 'AI Recruit'}
                        </span>
                        <span className="level-number-tag">Level {level.id}</span>
                      </div>

                      <h3 className="level-title-text">{level.title}</h3>
                      <p className="level-blurb-text">{level.blurb}</p>

                      <div className="level-meta-row">
                        <span className="chip-type-tag" style={{ background: domainColor + '20', color: domainColor }}>
                          {level.type}
                        </span>
                        {level.modes?.map((m) => (
                          <span key={m} className={`chip-mode-tag ${modes[m] ? 'done' : ''}`}>
                            {modes[m] ? '✓ ' : ''}
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="card-side-actions">
                      <div className="stars-row">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={stars >= s ? '#fbbf24' : 'transparent'}
                            color={stars >= s ? '#fbbf24' : '#475569'}
                          />
                        ))}
                      </div>

                      <div className={`status-pill-badge ${cleared ? 'cleared' : unlocked ? 'ready' : 'locked'}`}>
                        {!unlocked ? 'Locked' : cleared ? 'Cleared' : 'Play Level'}
                        {unlocked && <ChevronRight size={14} className="arr-icon" />}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )

              if (!unlocked) {
                return (
                  <div key={level.id} className="roadmap-link-wrapper" style={{ cursor: 'not-allowed' }}>
                    {cardContent}
                  </div>
                )
              }

              return (
                <Link key={level.id} to={`/quest/level/${level.id}`} className="roadmap-link-wrapper">
                  {cardContent}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
