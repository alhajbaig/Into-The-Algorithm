import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Flame, Play, ArrowRight, Cpu, Shield,
  Zap, Star, ChevronRight, CircuitBoard
} from 'lucide-react'

/* ── Rank System ── */
const RANKS = [
  { name: 'Recruit', min: 0, color: '#64748b' },
  { name: 'Cadet', min: 300, color: '#3b82f6' },
  { name: 'Operative', min: 800, color: '#06b6d4' },
  { name: 'Specialist', min: 1800, color: '#8b5cf6' },
  { name: 'Commander', min: 3500, color: '#f59e0b' },
  { name: 'Architect', min: 6000, color: '#ec4899' },
  { name: 'Grandmaster', min: 10000, color: '#ef4444' },
]

function getRank(xp) {
  let rank = RANKS[0]
  for (const r of RANKS) {
    if (xp >= r.min) rank = r
  }
  return rank
}

function getNextRank(xp) {
  for (const r of RANKS) {
    if (xp < r.min) return r
  }
  return null
}

/* ── Animated Counter ── */
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    let start = 0
    const end = value
    if (end === start) { setDisplay(end); return }
    const startTime = performance.now()
    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + (end - start) * eased))
      if (progress < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [value, duration])

  return <span>{display.toLocaleString()}</span>
}

/* ── Circular XP Ring SVG ── */
function XPRing({ percentage, size = 120, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} className="cc-xp-ring">
      <defs>
        <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="url(#xpGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
    </svg>
  )
}

export function AIWelcomeHero({ userName, userRole, currentLevel, totalXP, streak, coins, completionPct }) {
  const navigate = useNavigate()
  const rank = getRank(totalXP)
  const nextRank = getNextRank(totalXP)
  const xpToNext = nextRank ? nextRank.min - totalXP : 0
  const levelPct = nextRank
    ? Math.round(((totalXP - rank.min) / (nextRank.min - rank.min)) * 100)
    : 100

  const chapterNum = currentLevel.chapter || 1
  const chapterTitle = currentLevel.chapterTitle || 'Chapter 1'
  const tier = currentLevel.tier || 'Recruit'

  return (
    <motion.section
      className="cc-hero-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="cc-hero-split">
        {/* ── Left: Command Intel ── */}
        <div className="cc-hero-left">
          <div className="cc-status-pill">
            <span className="cc-pulse-dot" />
            <CircuitBoard size={13} />
            <span>AI COMMAND CENTER ONLINE</span>
          </div>

          <h1 className="cc-hero-title">
            Welcome back, <em className="cc-gradient-name">{userName}</em>
          </h1>

          <div className="cc-hero-meta-row">
            <div className="cc-rank-badge" style={{ '--rank-color': rank.color }}>
              <Shield size={14} />
              <span>{rank.name}</span>
            </div>
            <span className="cc-meta-divider">·</span>
            <span className="cc-meta-text">Campaign {chapterNum}</span>
            <span className="cc-meta-divider">·</span>
            <span className="cc-meta-text">Level {currentLevel.id}</span>
          </div>

          <p className="cc-hero-desc">
            <strong>{chapterTitle}</strong> — {tier} rank.
            {nextRank && <> <AnimatedNumber value={xpToNext} /> XP until {nextRank.name}.</>}
          </p>

          {/* Quick Stats Row */}
          <div className="cc-hero-stats-row">
            <div className="cc-stat-chip">
              <Flame size={16} className="cc-icon-fire" />
              <div className="cc-stat-info">
                <span className="cc-stat-val">{streak}d</span>
                <span className="cc-stat-lbl">Streak</span>
              </div>
            </div>
            <div className="cc-stat-chip">
              <Zap size={16} className="cc-icon-xp" />
              <div className="cc-stat-info">
                <span className="cc-stat-val"><AnimatedNumber value={totalXP} /></span>
                <span className="cc-stat-lbl">Total XP</span>
              </div>
            </div>
            <div className="cc-stat-chip">
              <Star size={16} className="cc-icon-star" />
              <div className="cc-stat-info">
                <span className="cc-stat-val">{coins}</span>
                <span className="cc-stat-lbl">Coins</span>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="cc-hero-cta-group">
            <motion.button
              type="button"
              className="cc-cta-primary"
              onClick={() => navigate(`/quest/level/${currentLevel.id}`)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Play size={18} fill="currentColor" />
              <span>Continue Today's Mission</span>
              <ArrowRight size={16} />
            </motion.button>

            <button
              type="button"
              className="cc-cta-ghost"
              onClick={() => navigate('/quest')}
            >
              <span>View Campaign Map</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ── Right: ATLAS AI Avatar ── */}
        <div className="cc-hero-right">
          <div className="cc-atlas-container">
            {/* XP Progress Ring */}
            <XPRing percentage={levelPct} size={160} strokeWidth={5} />

            {/* Floating Avatar Core */}
            <motion.div
              className="cc-atlas-core"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <Cpu size={36} className="cc-atlas-icon" />
              <motion.div
                className="cc-atlas-halo"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              />
              <motion.div
                className="cc-atlas-halo cc-atlas-halo-2"
                animate={{ scale: [1.1, 1.5, 1.1], opacity: [0.15, 0.4, 0.15] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 0.5 }}
              />
            </motion.div>

            {/* Orbit particles */}
            <div className="cc-orbit-ring">
              <motion.div
                className="cc-orbit-particle"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              />
              <motion.div
                className="cc-orbit-particle cc-orbit-p2"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              />
            </div>

            {/* Percentage in center */}
            <div className="cc-ring-center-text">
              <span className="cc-ring-pct">{levelPct}%</span>
              <span className="cc-ring-lbl">to {nextRank?.name || 'Max'}</span>
            </div>
          </div>

          <div className="cc-atlas-meta">
            <span className="cc-atlas-name">
              <Sparkles size={13} className="cc-icon-sparkle" />
              ATLAS AI
            </span>
            <span className="cc-atlas-role">{userRole}</span>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
