import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Star, ChevronRight, Search, Shield, Trophy, Sparkles, Filter, Award, Zap } from 'lucide-react'
import { LEVELS } from '../data/content'
import { useGame } from '../context/GameContext'
import { useGSAPAnimations } from '../hooks/useGSAPAnimations'

const CHAPTER_FILTERS = [
  { id: 'all', name: 'All 100 Levels' },
  { id: 1, name: 'Ch 1: Foundations (1-12)' },
  { id: 2, name: 'Ch 2: Preprocessing (13-24)' },
  { id: 3, name: 'Ch 3: Classical ML (25-40)' },
  { id: 4, name: 'Ch 4: Ensembles (41-52)' },
  { id: 5, name: 'Ch 5: Advanced ML (53-64)' },
  { id: 6, name: 'Ch 6: Deep Learning (65-76)' },
  { id: 7, name: 'Ch 7: LLMs & GenAI (77-88)' },
  { id: 8, name: 'Ch 8: MLOps & Capstone (89-100)' },
]

export default function LevelMap() {
  const { progress, isUnlocked, modeStatus } = useGame()
  const containerRef = useRef(null)

  const [activeChapter, setActiveChapter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize GSAP scroll triggers
  useGSAPAnimations(containerRef)

  // Overall Campaign Stats
  const campaignStats = useMemo(() => {
    const total = LEVELS.length
    const cleared = progress.clearedLevels?.length || 0
    const percent = Math.round((cleared / total) * 100)
    const stars = progress.totalStars || 0
    const currentLevel = cleared + 1
    const currentTier = LEVELS.find((l) => l.id === currentLevel)?.tier || 'AI Architect'

    return { total, cleared, percent, stars, currentTier, currentLevel }
  }, [progress.clearedLevels, progress.totalStars])

  // Filtered Levels List
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
          `level ${l.id}`.includes(q),
      )
    }

    return list
  }, [activeChapter, searchQuery])

  return (
    <section className="map-wrap aaa-campaign-wrap" ref={containerRef}>
      {/* 1. AAA Campaign Header */}
      <div className="map-hero aaa-campaign-hero glass">
        <div className="hero-title-group">
          <p className="eyebrow"><Trophy size={14} className="text-gold" /> 100-LEVEL MACHINE LEARNING CAMPAIGN</p>
          <h1>
            <span className="logo-mark">ML Quest: Beginner to AI Architect</span>
          </h1>
          <p className="lede">
            Master the complete ML Engineering roadmap—from Python &amp; Linear Algebra to XGBoost, PyTorch, LLMs, RAG, and MLOps.
          </p>
        </div>

        {/* Campaign Stats Bar */}
        <div className="campaign-stats-grid">
          <div className="camp-stat-card">
            <div className="stat-label">CAMPAIGN PROGRESS</div>
            <div className="stat-val">{campaignStats.percent}% <span className="sub">({campaignStats.cleared} / {campaignStats.total})</span></div>
            <div className="camp-progress-rail">
              <div className="camp-progress-fill" style={{ width: `${campaignStats.percent}%` }} />
            </div>
          </div>

          <div className="camp-stat-card">
            <div className="stat-label">CURRENT TIER RANK</div>
            <div className="stat-val text-gold">{campaignStats.currentTier}</div>
          </div>

          <div className="camp-stat-card">
            <div className="stat-label">TOTAL STARS EARNED</div>
            <div className="stat-val text-yellow">{campaignStats.stars} ⭐</div>
          </div>
        </div>
      </div>

      {/* 2. Chapter Tabs & Search Bar */}
      <div className="campaign-controls glass">
        <div className="controls-search-row">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search 100 levels by topic (e.g., PyTorch, XGBoost, Transformers, RAG, MLOps)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="chapter-tabs-scroll">
          {CHAPTER_FILTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              className={`chapter-tab-pill ${activeChapter === ch.id ? 'active' : ''}`}
              onClick={() => setActiveChapter(ch.id)}
            >
              {ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Level Board */}
      <div className="map-board" data-gsap="stagger">
        {filteredLevels.length === 0 ? (
          <div className="empty-level-search glass">
            <Search size={40} className="muted-icon" />
            <h3>No levels found matching &quot;{searchQuery}&quot;</h3>
            <button type="button" className="btn primary" onClick={() => { setSearchQuery(''); setActiveChapter('all'); }}>
              Reset Search &amp; Filters
            </button>
          </div>
        ) : (
          filteredLevels.map((level, i) => {
            const unlocked = isUnlocked(level.id)
            const cleared = progress.clearedLevels?.includes(level.id)
            const stars = progress.levelStars?.[level.id] || 0
            const modes = modeStatus(level.id)

            const card = (
              <motion.div
                className={`level-row ${unlocked ? 'open' : 'locked'}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                data-gsap="hover"
              >
                <div className="level-index">
                  <div className={`level-orb ${cleared ? 'cleared' : ''} ${!unlocked ? 'locked-orb' : ''}`}>
                    {unlocked ? level.emoji : <Lock size={18} />}
                  </div>
                </div>

                <div className="level-card aaa-level-card" data-tilt style={{ borderColor: unlocked ? level.color + '40' : undefined }}>
                  <div>
                    <div className="level-header-row">
                      <span className="tier-tag">{level.tier}</span>
                      <span className="chapter-num-tag">Level {level.id}</span>
                    </div>

                    <h3>{level.title}</h3>
                    <p className="muted" style={{ margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
                      {level.blurb}
                    </p>

                    <div className="level-meta">
                      <span className="chip type-chip" style={{ background: level.color + '20', color: level.color }}>
                        {level.type}
                      </span>
                      {level.modes.map((m) => (
                        <span key={m} className={`chip ${modes[m] ? 'done' : ''}`}>
                          {modes[m] ? '✓ ' : ''}
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="level-side">
                    <div className="stars">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          fill={stars >= s ? '#fbbf24' : 'transparent'}
                          color={stars >= s ? '#fbbf24' : '#6b5a8a'}
                        />
                      ))}
                    </div>

                    <div className={`status-label ${cleared ? 'cleared' : unlocked ? 'ready' : ''}`}>
                      {!unlocked ? 'Locked' : cleared ? 'Cleared' : 'Play'}
                      {unlocked && <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />}
                    </div>
                  </div>
                </div>
              </motion.div>
            )

            return unlocked ? (
              <Link key={level.id} to={`/quest/level/${level.id}`} className="level-row-link">
                {card}
              </Link>
            ) : (
              <div key={level.id}>{card}</div>
            )
          })
        )}
      </div>
    </section>
  )
}
