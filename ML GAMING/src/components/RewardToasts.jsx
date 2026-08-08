import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BADGES } from '../data/badges'
import { useGame } from '../context/GameContext'
import { Trophy, Shield, Star, Flame, CheckCircle2, Lock, Sparkles, Filter, Search, Award, Zap, EyeOff } from 'lucide-react'

export function RewardToasts() {
  const { lastReward, newBadges, levelJustCleared, dismissReward, dismissBadges, dismissLevelClear, cheer } =
    useGame()

  useEffect(() => {
    if (levelJustCleared) {
      cheer('level')
      const t = setTimeout(dismissLevelClear, 3200)
      return () => clearTimeout(t)
    }
  }, [levelJustCleared, cheer, dismissLevelClear])

  useEffect(() => {
    if (newBadges.length) {
      const t = setTimeout(dismissBadges, 4000)
      return () => clearTimeout(t)
    }
  }, [newBadges, dismissBadges])

  useEffect(() => {
    if (lastReward) {
      const t = setTimeout(dismissReward, 2800)
      return () => clearTimeout(t)
    }
  }, [lastReward, dismissReward])

  return (
    <div className="toast-stack">
      <AnimatePresence>
        {levelJustCleared && (
          <motion.div
            key="level"
            className="toast toast-level"
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            🎉 Level cleared! New world unlocked!
          </motion.div>
        )}
        {newBadges.map((b) => (
          <motion.div
            key={b.id}
            className="toast toast-badge aaa-unlock-toast"
            initial={{ y: 50, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          >
            <div className="toast-badge-glow" />
            <div className="toast-icon-wrap">{b.icon || '🏆'}</div>
            <div className="toast-text-wrap">
              <span className="toast-eyebrow">ACHIEVEMENT UNLOCKED</span>
              <strong>{b.name}</strong>
              <span className="toast-rewards">+{b.xp || 100} XP · +{b.coins || 25} Coins</span>
            </div>
          </motion.div>
        ))}
        {lastReward && (
          <motion.div
            key="reward"
            className="toast toast-reward"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            +{lastReward.coins} 🪙 {lastReward.stars ? `+${lastReward.stars} ⭐` : ''}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const RARITY_WEIGHT = {
  Mythic: 5,
  Legendary: 4,
  Epic: 3,
  Rare: 2,
  Common: 1,
}

export function BadgeGrid({ ownedOnly = false }) {
  const { progress } = useGame()
  const [catFilter, setCatFilter] = useState('All')
  const [rarityFilter, setRarityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('completion')
  const [searchQuery, setSearchQuery] = useState('')

  // Statistics calculation
  const stats = useMemo(() => {
    const total = BADGES.length
    const unlocked = BADGES.filter((b) => progress.badges?.includes(b.id))
    const unlockedCount = unlocked.length
    const percent = Math.round((unlockedCount / total) * 100)
    const xpEarned = unlocked.reduce((acc, b) => acc + (b.xp || 50), 0)
    const legendaryCount = unlocked.filter((b) => b.rarity === 'Legendary' || b.rarity === 'Mythic').length
    const rarityScore = unlocked.reduce((acc, b) => acc + (RARITY_WEIGHT[b.rarity] || 1) * 100, 0)

    return { total, unlockedCount, percent, xpEarned, legendaryCount, rarityScore }
  }, [progress.badges])

  // Filter & sort logic
  const filteredList = useMemo(() => {
    let list = ownedOnly ? BADGES.filter((b) => progress.badges?.includes(b.id)) : BADGES

    if (catFilter !== 'All') {
      list = list.filter((b) => b.category === catFilter)
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
          (b.category && b.category.toLowerCase().includes(q)),
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

  const categories = ['All', 'Learning', 'Quiz', 'Coding', 'Interview', 'Streak', 'Coins', 'Secret', 'Legendary']
  const rarities = ['All', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic']

  return (
    <div className="aaa-achievement-system">
      {/* 1. AAA Statistics Banner */}
      {!ownedOnly && (
        <div className="achievement-stats-banner glass">
          <div className="stat-card main-progress-stat">
            <div className="stat-header-row">
              <Trophy size={20} className="text-gold" />
              <span>OVERALL COMPLETION</span>
            </div>
            <div className="stat-big-value">
              {stats.percent}% <span className="stat-sub">({stats.unlockedCount} / {stats.total})</span>
            </div>
            <div className="banner-progress-rail">
              <div className="banner-progress-fill" style={{ width: `${stats.percent}%` }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header-row">
              <Zap size={18} color="#a855f7" />
              <span>TOTAL XP EARNED</span>
            </div>
            <div className="stat-value text-purple">+{stats.xpEarned.toLocaleString()} XP</div>
          </div>

          <div className="stat-card">
            <div className="stat-header-row">
              <Star size={18} color="#eab308" />
              <span>LEGENDARY & MYTHIC</span>
            </div>
            <div className="stat-value text-gold">{stats.legendaryCount} Unlocked</div>
          </div>

          <div className="stat-card">
            <div className="stat-header-row">
              <Shield size={18} color="#38bdf8" />
              <span>RARITY SCORE</span>
            </div>
            <div className="stat-value text-cyan">{stats.rarityScore.toLocaleString()} PTS</div>
          </div>
        </div>
      )}

      {/* 2. Interactive Filter & Search Controls */}
      {!ownedOnly && (
        <div className="achievement-controls glass">
          <div className="controls-row-top">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search achievements by title, description or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="sort-selector">
              <Filter size={15} />
              <label>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="completion">Status & Rarity</option>
                <option value="rarity">Rarity (Highest First)</option>
                <option value="xp">XP Reward (Highest First)</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="controls-row-pills">
            <div className="pill-group">
              <span className="group-label">Category:</span>
              <div className="pills-scroll">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`filter-pill ${catFilter === cat ? 'active' : ''}`}
                    onClick={() => setCatFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="pill-group">
              <span className="group-label">Rarity:</span>
              <div className="pills-scroll">
                {rarities.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`filter-pill rarity-pill-${r.toLowerCase()} ${rarityFilter === r ? 'active' : ''}`}
                    onClick={() => setRarityFilter(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="pill-group">
              <span className="group-label">Status:</span>
              <div className="pills-scroll">
                {['All', 'Unlocked', 'Locked'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Badge Grid Display */}
      {filteredList.length === 0 ? (
        <div className="empty-badge-state glass">
          <Award size={48} className="empty-icon" />
          <h3>No achievements match your filters</h3>
          <p>Try resetting filters or search query to explore more achievements.</p>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              setCatFilter('All')
              setRarityFilter('All')
              setStatusFilter('All')
              setSearchQuery('')
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="badge-grid aaa-badge-grid">
          <AnimatePresence>
            {filteredList.map((b) => {
              const owned = progress.badges?.includes(b.id)
              const isSecret = b.secret && !owned
              const rarity = b.rarity || 'Common'
              const progData = b.getProgress ? b.getProgress(progress) : { current: owned ? 1 : 0, max: 1 }
              const progPercent = Math.min(100, Math.round((progData.current / (progData.max || 1)) * 100))

              return (
                <motion.div
                  layout
                  key={b.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`badge-card aaa-badge-card rarity-${rarity.toLowerCase()} ${owned ? 'owned' : 'locked'} ${
                    isSecret ? 'secret-locked' : ''
                  }`}
                >
                  <div className="card-top-bar">
                    <span className={`rarity-badge rarity-tag-${rarity.toLowerCase()}`}>{rarity}</span>
                    <span className="category-tag">{b.category || 'General'}</span>
                  </div>

                  <div className="badge-card-main">
                    <div className="badge-icon-wrapper">
                      <div className="icon-glow" />
                      <span className="badge-icon">{isSecret ? '❓' : owned ? b.icon : b.icon || '🔒'}</span>
                      {owned && <CheckCircle2 className="unlocked-check" size={16} />}
                      {!owned && isSecret && <EyeOff className="secret-lock-icon" size={16} />}
                      {!owned && !isSecret && <Lock className="locked-icon" size={14} />}
                    </div>

                    <div className="badge-details">
                      <h3>{isSecret ? 'Hidden Secret Achievement' : b.name}</h3>
                      <p className="badge-desc">
                        {isSecret
                          ? 'Keep exploring algorithms and completing ML Quests to uncover this secret achievement!'
                          : b.desc}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  {!owned && (
                    <div className="badge-progress-block">
                      <div className="progress-text-row">
                        <span>Progress</span>
                        <span>
                          {progData.current} / {progData.max} ({progPercent}%)
                        </span>
                      </div>
                      <div className="badge-progress-rail">
                        <div className="badge-progress-fill" style={{ width: `${progPercent}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Reward Footprint */}
                  <div className="badge-card-footer">
                    <div className="reward-pills">
                      <span className="pill-reward-xp">+{b.xp || 50} XP</span>
                      <span className="pill-reward-coins">+{b.coins || 15} 🪙</span>
                    </div>

                    {owned ? (
                      <span className="unlocked-status-tag">✓ UNLOCKED</span>
                    ) : (
                      <span className="locked-status-tag">LOCKED</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
