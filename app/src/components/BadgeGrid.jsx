import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BADGES } from '../data/badges'
import { useGame } from '../context/GameContext'
import { useGSAPAnimations } from '../hooks/useGSAPAnimations'
import {
  Search,
  Filter,
  Award,
  Lock,
  CheckCircle2,
  EyeOff,
  X,
  ChevronDown,
  LayoutGrid,
  ListFilter,
  Zap,
  Coins,
  Star,
  Sparkles
} from 'lucide-react'

const RARITY_WEIGHT = {
  Mythic: 5,
  Legendary: 4,
  Epic: 3,
  Rare: 2,
  Common: 1
}

const RARITY_COLORS = {
  Mythic: { border: 'rgba(232, 121, 249, 0.4)', text: '#e879f9', glow: 'rgba(232, 121, 249, 0.25)' },
  Legendary: { border: 'rgba(251, 191, 36, 0.4)', text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.25)' },
  Epic: { border: 'rgba(192, 132, 252, 0.35)', text: '#c084fc', glow: 'rgba(192, 132, 252, 0.2)' },
  Rare: { border: 'rgba(56, 189, 248, 0.35)', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.2)' },
  Common: { border: 'rgba(148, 163, 184, 0.2)', text: '#94a3b8', glow: 'rgba(148, 163, 184, 0.1)' }
}

export default function BadgeGrid({ ownedOnly = false }) {
  const { progress } = useGame()
  const containerRef = useRef(null)

  const [catFilter, setCatFilter] = useState('All')
  const [rarityFilter, setRarityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('completion')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [showcaseBadgeId, setShowcaseBadgeId] = useState(() => {
    return localStorage.getItem('ml_quest_showcase_badge') || null
  })

  // Category list with badge counts
  const categoryCounts = useMemo(() => {
    const cats = ['All', 'Learning', 'Quiz', 'Coding', 'Interview', 'Streak', 'Secret', 'Legendary']
    const counts = {}
    cats.forEach((c) => {
      if (c === 'All') counts[c] = BADGES.length
      else if (c === 'Secret') counts[c] = BADGES.filter((b) => b.secret).length
      else if (c === 'Legendary') counts[c] = BADGES.filter((b) => b.rarity === 'Legendary' || b.rarity === 'Mythic').length
      else counts[c] = BADGES.filter((b) => b.category === c).length
    })
    return { list: cats, counts }
  }, [])

  // Filter & sort logic
  const filteredList = useMemo(() => {
    let list = ownedOnly ? BADGES.filter((b) => progress.badges?.includes(b.id)) : BADGES

    if (catFilter !== 'All') {
      if (catFilter === 'Secret') {
        list = list.filter((b) => b.secret)
      } else if (catFilter === 'Legendary') {
        list = list.filter((b) => b.rarity === 'Legendary' || b.rarity === 'Mythic')
      } else {
        list = list.filter((b) => b.category === catFilter)
      }
    }

    if (rarityFilter !== 'All') {
      list = list.filter((b) => b.rarity === rarityFilter)
    }

    if (statusFilter === 'Unlocked') {
      list = list.filter((b) => progress.badges?.includes(b.id))
    } else if (statusFilter === 'Locked') {
      list = list.filter((b) => !progress.badges?.includes(b.id))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.desc.toLowerCase().includes(q) ||
          (b.category && b.category.toLowerCase().includes(q))
      )
    }

    // Sort logic
    return [...list].sort((a, b) => {
      const aUnlocked = progress.badges?.includes(a.id)
      const bUnlocked = progress.badges?.includes(b.id)

      if (sortBy === 'completion') {
        if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1
        return (RARITY_WEIGHT[b.rarity] || 1) - (RARITY_WEIGHT[a.rarity] || 1)
      }
      if (sortBy === 'rarity') {
        return (RARITY_WEIGHT[b.rarity] || 1) - (RARITY_WEIGHT[a.rarity] || 1)
      }
      if (sortBy === 'xp') {
        return (b.xp || 0) - (a.xp || 0)
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })
  }, [ownedOnly, catFilter, rarityFilter, statusFilter, searchQuery, sortBy, progress.badges])

  // Initialize GSAP scroll triggers & 3D tilt effects
  useGSAPAnimations(containerRef, [filteredList, viewMode, catFilter, rarityFilter, statusFilter])

  const handleToggleShowcase = (badgeId) => {
    if (showcaseBadgeId === badgeId) {
      setShowcaseBadgeId(null)
      localStorage.removeItem('ml_quest_showcase_badge')
    } else {
      setShowcaseBadgeId(badgeId)
      localStorage.setItem('ml_quest_showcase_badge', badgeId)
    }
  }

  return (
    <div className="saas-gallery-wrapper" ref={containerRef}>
      {/* SECTION 4: ACHIEVEMENT GALLERY TOOLBAR */}
      {!ownedOnly && (
        <div className="saas-gallery-toolbar saas-card" data-gsap="reveal">
          <div className="toolbar-primary-row">
            {/* Search Bar */}
            <div className="saas-search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-btn" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Pills Track */}
            <div className="toolbar-pills-scroll">
              {categoryCounts.list.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`saas-toolbar-pill ${catFilter === cat ? 'active' : ''}`}
                  onClick={() => setCatFilter(cat)}
                >
                  <span>{cat}</span>
                  <span className="pill-counter">{categoryCounts.counts[cat]}</span>
                </button>
              ))}
            </div>

            {/* Right Controls: Sort & View Mode */}
            <div className="toolbar-end-actions">
              <div className="saas-dropdown">
                <Filter size={13} className="drop-icon" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="completion">Sort: Completion</option>
                  <option value="rarity">Sort: Rarity</option>
                  <option value="xp">Sort: XP Reward</option>
                  <option value="name">Sort: Name (A-Z)</option>
                </select>
                <ChevronDown size={13} className="drop-arrow" />
              </div>

              <div className="saas-view-toggle">
                <button
                  type="button"
                  className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <ListFilter size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Filters Row */}
          <div className="toolbar-secondary-row">
            <div className="secondary-pills-group">
              <span className="group-lbl">Rarity:</span>
              {['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`saas-sub-pill rarity-${r.toLowerCase()} ${rarityFilter === r ? 'active' : ''}`}
                  onClick={() => setRarityFilter(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="secondary-pills-group">
              <span className="group-lbl">Status:</span>
              {['All', 'Unlocked', 'Locked'].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`saas-sub-pill ${statusFilter === st ? 'active' : ''}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="gallery-count-tag">
              Showing <strong>{filteredList.length}</strong> of <strong>{BADGES.length}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 4-COLUMN RESPONSIVE ACHIEVEMENT GRID */}
      {filteredList.length === 0 ? (
        <div className="saas-empty-gallery saas-card" data-gsap="reveal">
          <Award size={40} className="empty-icon" />
          <h3>No matching achievements</h3>
          <p className="muted-desc">Try clearing search query or category filters.</p>
          <button
            type="button"
            className="saas-btn-primary"
            onClick={() => {
              setCatFilter('All')
              setRarityFilter('All')
              setStatusFilter('All')
              setSearchQuery('')
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={`saas-gallery-grid ${viewMode === 'grid' ? 'grid-4-col' : 'grid-1-col'}`}
          data-gsap="stagger"
        >
          <AnimatePresence mode="popLayout">
            {filteredList.map((b) => {
              const owned = progress.badges?.includes(b.id)
              const isSecret = b.secret && !owned
              const rarity = b.rarity || 'Common'
              const isLegendary = rarity === 'Legendary' || rarity === 'Mythic'
              const progData = b.getProgress ? b.getProgress(progress) : { current: owned ? 1 : 0, max: 1 }
              const progPercent = Math.min(100, Math.round((progData.current / (progData.max || 1)) * 100))
              const isShowcase = showcaseBadgeId === b.id
              const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.Common

              return (
                <motion.div
                  layout
                  key={b.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`saas-badge-card ${owned ? 'state-unlocked' : 'state-locked'} ${
                    isSecret ? 'state-secret' : ''
                  } ${isLegendary ? 'state-legendary-shimmer' : ''} ${isShowcase ? 'state-showcase' : ''}`}
                  onClick={() => setSelectedBadge(b)}
                  data-tilt
                  style={{
                    '--rarity-accent': rarityStyle.text,
                    '--rarity-border': rarityStyle.border,
                    '--rarity-glow': rarityStyle.glow
                  }}
                >
                  <div className="card-gloss-overlay" />

                  {/* Header Meta Row */}
                  <div className="badge-card-header">
                    <span className={`saas-rarity-chip rarity-${rarity.toLowerCase()}`}>
                      {rarity}
                    </span>
                    <span className="badge-cat-label">{b.category || 'General'}</span>
                  </div>

                  {/* Icon & Details */}
                  <div className="badge-card-body">
                    <div className={`badge-portal-frame ${owned ? 'frame-active' : 'frame-muted'}`}>
                      <span className="badge-emoji">
                        {isSecret ? '🔒' : b.icon || '🏆'}
                      </span>
                      {owned && <CheckCircle2 className="icon-check-badge" size={14} />}
                      {!owned && isSecret && <EyeOff className="icon-lock-badge" size={14} />}
                      {!owned && !isSecret && <Lock className="icon-lock-badge" size={12} />}
                    </div>

                    <div className="badge-card-titles">
                      <h4 className="badge-name">
                        {isSecret ? 'Secret Achievement' : b.name}
                      </h4>
                      <p className="badge-desc">
                        {isSecret ? 'Keep completing quests to uncover this secret badge.' : b.desc}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar for locked badges */}
                  {!owned && (
                    <div className="badge-micro-progress">
                      <div className="progress-top-lbl">
                        <span>Progress</span>
                        <span>{progData.current}/{progData.max} ({progPercent}%)</span>
                      </div>
                      <div className="saas-progress-rail">
                        <div
                          className="saas-progress-fill"
                          style={{ width: `${progPercent}%`, background: rarityStyle.text }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer Row */}
                  <div className="badge-card-footer">
                    <div className="reward-badge-tags">
                      <span className="reward-tag xp">+{b.xp || 50} XP</span>
                      <span className="reward-tag coin">+{b.coins || 15} 🪙</span>
                    </div>

                    {owned ? (
                      <span className="unlocked-text">✓ Unlocked</span>
                    ) : (
                      <span className="locked-text">Locked</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 3D MODAL SHOWCASE */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            className="saas-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
          >
            {(() => {
              const b = selectedBadge
              const owned = progress.badges?.includes(b.id)
              const isSecret = b.secret && !owned
              const rarity = b.rarity || 'Common'
              const progData = b.getProgress ? b.getProgress(progress) : { current: owned ? 1 : 0, max: 1 }
              const progPercent = Math.min(100, Math.round((progData.current / (progData.max || 1)) * 100))
              const isShowcase = showcaseBadgeId === b.id
              const rarityStyle = RARITY_COLORS[rarity] || RARITY_COLORS.Common

              return (
                <motion.div
                  className="saas-badge-modal saas-card"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="modal-close-icon"
                    onClick={() => setSelectedBadge(null)}
                  >
                    <X size={16} />
                  </button>

                  <div className="modal-icon-center">
                    <div
                      className="modal-portal-lg"
                      style={{
                        borderColor: rarityStyle.text,
                        boxShadow: `0 0 35px ${rarityStyle.glow}`
                      }}
                    >
                      <span className="emoji-lg">{isSecret ? '🔒' : b.icon || '🏆'}</span>
                    </div>
                    <span className="modal-rarity-tag" style={{ color: rarityStyle.text }}>
                      {rarity} Achievement
                    </span>
                  </div>

                  <div className="modal-details-center">
                    <h3>{isSecret ? 'Secret Achievement' : b.name}</h3>
                    <p className="modal-cat-sub">Category: {b.category || 'General'}</p>
                    <p className="modal-desc-text">
                      {isSecret
                        ? 'This is a classified secret achievement. Solve machine learning levels and complete practice challenges to discover it!'
                        : b.desc}
                    </p>

                    <div className="modal-rewards-row">
                      <div className="reward-chip">
                        <Zap size={14} color="#c084fc" />
                        <span>+{b.xp || 50} XP</span>
                      </div>
                      <div className="reward-chip">
                        <Coins size={14} color="#fbbf24" />
                        <span>+{b.coins || 15} Coins</span>
                      </div>
                    </div>

                    {!owned && (
                      <div className="modal-prog-wrap">
                        <div className="prog-text-row">
                          <span>Requirement Progress</span>
                          <span>{progData.current} / {progData.max} ({progPercent}%)</span>
                        </div>
                        <div className="saas-progress-rail">
                          <div
                            className="saas-progress-fill"
                            style={{ width: `${progPercent}%`, background: rarityStyle.text }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-actions-row">
                    {owned && (
                      <button
                        type="button"
                        className={`saas-btn-showcase ${isShowcase ? 'active' : ''}`}
                        onClick={() => handleToggleShowcase(b.id)}
                      >
                        <Star size={14} fill={isShowcase ? '#fbbf24' : 'none'} color={isShowcase ? '#fbbf24' : '#fff'} />
                        {isShowcase ? 'Featured on Profile' : 'Feature as Showcase Trophy'}
                      </button>
                    )}

                    <button
                      type="button"
                      className="saas-btn-secondary"
                      onClick={() => setSelectedBadge(null)}
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
