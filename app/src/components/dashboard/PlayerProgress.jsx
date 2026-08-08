import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ChevronUp, Trophy, TrendingUp, Gem, Star } from 'lucide-react'
import { LEVELS } from '../../data/content'

/* ── Rank System (shared with hero) ── */
const RANKS = [
  { name: 'Recruit', min: 0, color: '#64748b', icon: '🔰' },
  { name: 'Cadet', min: 300, color: '#3b82f6', icon: '🛡️' },
  { name: 'Operative', min: 800, color: '#06b6d4', icon: '⚡' },
  { name: 'Specialist', min: 1800, color: '#8b5cf6', icon: '💎' },
  { name: 'Commander', min: 3500, color: '#f59e0b', icon: '⚔️' },
  { name: 'Architect', min: 6000, color: '#ec4899', icon: '🏗️' },
  { name: 'Grandmaster', min: 10000, color: '#ef4444', icon: '👑' },
]

function getRank(xp) {
  let rank = RANKS[0]
  for (const r of RANKS) if (xp >= r.min) rank = r
  return rank
}
function getNextRank(xp) {
  for (const r of RANKS) if (xp < r.min) return r
  return null
}

function getRankIndex(xp) {
  let idx = 0
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].min) idx = i
  return idx
}

/* ── Leagues ── */
const LEAGUES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Masters']
function getLeague(cleared) {
  if (cleared >= 80) return LEAGUES[5]
  if (cleared >= 60) return LEAGUES[4]
  if (cleared >= 40) return LEAGUES[3]
  if (cleared >= 25) return LEAGUES[2]
  if (cleared >= 10) return LEAGUES[1]
  return LEAGUES[0]
}

/* Counting animation */
function Counter({ value }) {
  const [n, setN] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / 1000, 1)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value])
  return <>{n.toLocaleString()}</>
}

const sectionV = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function PlayerProgress({ totalXP, clearedLevels, totalBadges, streak, completionPct }) {
  const rank = getRank(totalXP)
  const nextRank = getNextRank(totalXP)
  const rankIdx = getRankIndex(totalXP)
  const league = getLeague(clearedLevels)

  const xpInRank = totalXP - rank.min
  const xpNeeded = nextRank ? nextRank.min - rank.min : 1
  const xpPct = nextRank ? Math.min(100, Math.round((xpInRank / xpNeeded) * 100)) : 100

  // 7-day weekly activity (simulated from streak)
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const today = new Date().getDay()
  const weekActivity = weekDays.map((d, i) => ({
    label: d,
    active: i <= Math.min(6, streak) && i <= (today === 0 ? 6 : today - 1),
  }))

  return (
    <motion.section
      className="cc-player-progress"
      variants={sectionV}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="cc-section-header">
        <TrendingUp size={18} className="cc-icon-cyan" />
        <h2 className="cc-section-title">Player Progression</h2>
      </div>

      <div className="cc-progress-card glass">
        <div className="cc-progress-top-row">
          {/* Rank Emblem */}
          <div className="cc-rank-emblem" style={{ '--rank-c': rank.color }}>
            <span className="cc-rank-icon">{rank.icon}</span>
            <div className="cc-rank-info">
              <span className="cc-rank-name" style={{ color: rank.color }}>{rank.name}</span>
              <span className="cc-rank-league">{league} League</span>
            </div>
          </div>

          {/* Quick badges */}
          <div className="cc-progress-badges">
            <div className="cc-pbadge">
              <Shield size={14} style={{ color: rank.color }} />
              <span>Rank {rankIdx + 1}/{RANKS.length}</span>
            </div>
            <div className="cc-pbadge">
              <Trophy size={14} className="cc-icon-gold" />
              <span>{totalBadges} Badges</span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="cc-xp-bar-section">
          <div className="cc-xp-bar-labels">
            <span className="cc-xp-current"><Counter value={totalXP} /> XP</span>
            {nextRank && <span className="cc-xp-next">{nextRank.min.toLocaleString()} XP — {nextRank.name}</span>}
          </div>
          <div className="cc-xp-bar-track">
            <motion.div
              className="cc-xp-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
            />
            {/* Rank Markers */}
            {RANKS.slice(1).map((r) => {
              const markerPct = nextRank
                ? ((r.min - rank.min) / (nextRank.min - rank.min)) * 100
                : 100
              if (markerPct < 0 || markerPct > 100) return null
              return (
                <div
                  key={r.name}
                  className="cc-xp-marker"
                  style={{ left: `${markerPct}%` }}
                  title={r.name}
                />
              )
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="cc-progress-stats-grid">
          <div className="cc-progress-stat">
            <span className="cc-ps-val">{completionPct}%</span>
            <span className="cc-ps-lbl">Campaign</span>
          </div>
          <div className="cc-progress-stat">
            <span className="cc-ps-val">{clearedLevels}/{LEVELS.length}</span>
            <span className="cc-ps-lbl">Levels</span>
          </div>
          <div className="cc-progress-stat">
            <span className="cc-ps-val">{streak}d</span>
            <span className="cc-ps-lbl">Streak</span>
          </div>
          <div className="cc-progress-stat">
            <span className="cc-ps-val">{league}</span>
            <span className="cc-ps-lbl">League</span>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="cc-weekly-row">
          <span className="cc-weekly-label">This Week</span>
          <div className="cc-weekly-dots">
            {weekActivity.map((d, i) => (
              <div key={i} className={`cc-week-dot ${d.active ? 'active' : ''}`}>
                <span className="cc-dot-day">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Reward */}
        {nextRank && (
          <div className="cc-next-reward">
            <Gem size={14} className="cc-icon-purple" />
            <span>Next Reward: <strong style={{ color: nextRank.color }}>{nextRank.name} Rank</strong> — {(nextRank.min - totalXP).toLocaleString()} XP away</span>
          </div>
        )}
      </div>
    </motion.section>
  )
}
