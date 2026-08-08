import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BadgeGrid from '../components/BadgeGrid'
import { BadgeAnalytics } from '../components/BadgeAnalytics'
import { useGame } from '../context/GameContext'
import { BADGES } from '../data/badges'
import { useGSAPAnimations } from '../hooks/useGSAPAnimations'
import {
  Trophy,
  Zap,
  Flame,
  Coins,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Share2,
  ExternalLink,
  Target,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react'

// Rank definitions for timeline
const RANKS = [
  { id: 'recruit', name: 'Recruit', minXP: 0, icon: '🌱' },
  { id: 'explorer', name: 'Explorer', minXP: 300, icon: '🚀' },
  { id: 'practitioner', name: 'Practitioner', minXP: 800, icon: '⚡' },
  { id: 'engineer', name: 'Engineer', minXP: 1500, icon: '⚙️' },
  { id: 'master', name: 'Master', minXP: 2500, icon: '🧠' },
  { id: 'legend', name: 'Legend', minXP: 4000, icon: '👑' }
]

export default function BadgesPage() {
  const { progress } = useGame()
  const pageRef = useRef(null)
  const [copiedShare, setCopiedShare] = useState(false)

  // Calculate user stats & XP
  const stats = useMemo(() => {
    const totalBadges = BADGES.length
    const unlockedBadges = BADGES.filter((b) => progress.badges?.includes(b.id))
    const unlockedCount = unlockedBadges.length
    const badgeXP = unlockedBadges.reduce((acc, b) => acc + (b.xp || 50), 0)
    const levelXP = (progress.clearedLevels?.length || 0) * 100
    const totalXP = badgeXP + levelXP

    const clearedLevels = progress.clearedLevels?.length || 0
    const streak = progress.bestStreak || 0
    const coins = progress.coins || 0
    const completionPct = totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0

    // Current & Next Rank
    let currentRankIdx = 0
    for (let i = 0; i < RANKS.length; i++) {
      if (totalXP >= RANKS[i].minXP) currentRankIdx = i
    }
    const currentRank = RANKS[currentRankIdx]
    const nextRank = RANKS[currentRankIdx + 1] || RANKS[currentRankIdx]

    // Progress to next rank
    const currentRankXP = currentRank.minXP
    const nextRankXP = nextRank.minXP
    const xpInCurrentRank = totalXP - currentRankXP
    const xpNeededForNext = nextRankXP - currentRankXP
    const rankProgressPct =
      nextRankXP > currentRankXP
        ? Math.min(100, Math.round((xpInCurrentRank / xpNeededForNext) * 100))
        : 100

    // Current Level calculation based on levels cleared
    const currentLevel = Math.max(1, clearedLevels + 1)

    return {
      totalBadges,
      unlockedCount,
      totalXP,
      clearedLevels,
      streak,
      coins,
      completionPct,
      currentRankIdx,
      currentRank,
      nextRank,
      rankProgressPct,
      xpNeededForNext,
      currentLevel,
      unlockedBadges
    }
  }, [progress])

  useGSAPAnimations(pageRef)

  // Circular gauge circumference (r=42 -> ~264)
  const ringCircumference = 264
  const xpRingDashoffset = ringCircumference - (ringCircumference * stats.rankProgressPct) / 100
  const masteryRingDashoffset = ringCircumference - (ringCircumference * stats.completionPct) / 100

  // Latest unlocked badge
  const latestBadge = useMemo(() => {
    if (!stats.unlockedBadges.length) return null
    return stats.unlockedBadges[stats.unlockedBadges.length - 1]
  }, [stats.unlockedBadges])

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  return (
    <div className="saas-dashboard-canvas" ref={pageRef}>
      <div className="saas-container-1400">
        {/* =========================================================================
            SECTION 1: HERO (Apple Fitness Style)
            ========================================================================= */}
        <section className="saas-hero-section saas-card" data-gsap="reveal">
          <div className="hero-grid-split">
            {/* Left Content */}
            <div className="hero-left-content">
              <div className="hero-tag-badge">
                <Trophy size={13} className="text-gold" />
                <span>BADGES &amp; MASTERY</span>
              </div>
              <h1 className="hero-display-title">
                Mastery <em>Dashboard</em>
              </h1>
              <p className="hero-subtitle">
                Track your ML journey, unlock achievements, earn XP and become an AI Master.
              </p>
            </div>

            {/* Right Widget: Apple Fitness XP Ring */}
            <div className="hero-fitness-widget saas-card-inner">
              <div className="fitness-ring-container">
                <svg width="110" height="110" viewBox="0 0 110 110" className="fitness-ring-svg">
                  <circle cx="55" cy="55" r="42" className="ring-bg-track" />
                  <circle
                    cx="55"
                    cy="55"
                    r="42"
                    className="ring-fill-xp"
                    style={{
                      strokeDasharray: ringCircumference,
                      strokeDashoffset: xpRingDashoffset
                    }}
                  />
                </svg>
                <div className="fitness-ring-text">
                  <span className="fitness-level-num">{stats.currentLevel}</span>
                  <span className="fitness-level-lbl">LEVEL</span>
                </div>
              </div>

              <div className="fitness-meta-details">
                <div className="rank-title-row">
                  <span className="rank-emoji">{stats.currentRank.icon}</span>
                  <span className="rank-name-text">{stats.currentRank.name}</span>
                </div>
                <div className="xp-stat-line">
                  <span>{stats.totalXP.toLocaleString()} XP</span>
                  <span className="muted">/ {stats.nextRank.minXP.toLocaleString()} XP</span>
                </div>
                <div className="fitness-milestone-rail">
                  <div
                    className="fitness-milestone-fill"
                    style={{ width: `${stats.rankProgressPct}%` }}
                  />
                </div>
                <div className="fitness-next-lbl">
                  Next Rank: <strong>{stats.nextRank.name}</strong> ({stats.rankProgressPct}%)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: QUICK STATISTICS (Horizontal Row of 6 Identical Cards)
            ========================================================================= */}
        <section className="saas-quick-stats-row" data-gsap="reveal">
          <div className="stats-cards-6-grid">
            {/* Card 1: XP */}
            <div className="saas-stat-card" data-tilt>
              <div className="stat-card-icon-box text-purple">
                <Zap size={18} />
              </div>
              <div className="stat-card-body">
                <span className="stat-card-label">XP</span>
                <div className="stat-card-value">+{stats.totalXP.toLocaleString()}</div>
                <div className="stat-growth-tag pos">+120 XP this week</div>
              </div>
            </div>

            {/* Card 2: Badges */}
            <div className="saas-stat-card" data-tilt>
              <div className="stat-card-icon-box text-gold">
                <Trophy size={18} />
              </div>
              <div className="stat-card-body">
                <span className="stat-card-label">Badges</span>
                <div className="stat-card-value">
                  {stats.unlockedCount} <span className="stat-sub-val">/ {stats.totalBadges}</span>
                </div>
                <div className="stat-growth-tag pos">{stats.completionPct}% Unlocked</div>
              </div>
            </div>

            {/* Card 3: Streak */}
            <div className="saas-stat-card" data-tilt>
              <div className="stat-card-icon-box text-cyan">
                <Flame size={18} />
              </div>
              <div className="stat-card-body">
                <span className="stat-card-label">Streak</span>
                <div className="stat-card-value">{stats.streak}d</div>
                <div className="stat-growth-tag pos">Best streak active</div>
              </div>
            </div>

            {/* Card 4: Coins */}
            <div className="saas-stat-card" data-tilt>
              <div className="stat-card-icon-box text-amber">
                <Coins size={18} />
              </div>
              <div className="stat-card-body">
                <span className="stat-card-label">Coins</span>
                <div className="stat-card-value">{stats.coins}</div>
                <div className="stat-growth-tag pos">Quest tokens</div>
              </div>
            </div>

            {/* Card 5: Levels Cleared */}
            <div className="saas-stat-card" data-tilt>
              <div className="stat-card-icon-box text-blue">
                <BookOpen size={18} />
              </div>
              <div className="stat-card-body">
                <span className="stat-card-label">Levels Cleared</span>
                <div className="stat-card-value">{stats.clearedLevels}</div>
                <div className="stat-growth-tag pos">Chapters completed</div>
              </div>
            </div>

            {/* Card 6: Completion % */}
            <div className="saas-stat-card" data-tilt>
              <div className="stat-card-icon-box text-green">
                <Target size={18} />
              </div>
              <div className="stat-card-body">
                <span className="stat-card-label">Completion %</span>
                <div className="stat-card-value">{stats.completionPct}%</div>
                <div className="stat-growth-tag pos">Overall Progress</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: ACHIEVEMENT PROGRESS (Split Layout)
            ========================================================================= */}
        <section className="saas-progress-split-section saas-card" data-gsap="reveal">
          <div className="split-progress-grid">
            {/* Left: Mastery Gauge Card */}
            <div className="mastery-ring-panel">
              <div className="mastery-svg-wrapper">
                <svg width="120" height="120" viewBox="0 0 120 120" className="mastery-ring-svg">
                  <circle cx="60" cy="60" r="42" className="ring-bg-track" />
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    className="ring-fill-mastery"
                    style={{
                      strokeDasharray: ringCircumference,
                      strokeDashoffset: masteryRingDashoffset
                    }}
                  />
                </svg>
                <div className="mastery-center-label">
                  <span className="mastery-val">{stats.completionPct}%</span>
                  <span className="mastery-sub">COMPLETION</span>
                </div>
              </div>
              <div className="mastery-rank-badge">
                <span className="badge-icon">{stats.currentRank.icon}</span>
                <span className="badge-text">{stats.currentRank.name}</span>
              </div>
            </div>

            {/* Right: Connected Rank Timeline */}
            <div className="rank-timeline-panel">
              <div className="timeline-header-row">
                <span className="timeline-title">Rank Progression Path</span>
                <span className="timeline-xp-needed">
                  Next Rank in <strong>{Math.max(0, stats.nextRank.minXP - stats.totalXP)} XP</strong>
                </span>
              </div>

              {/* Connected Timeline Track */}
              <div className="rank-track-container">
                <div className="rank-track-line" />
                <div className="rank-nodes-grid">
                  {RANKS.map((rk, idx) => {
                    const isReached = idx <= stats.currentRankIdx
                    const isCurrent = idx === stats.currentRankIdx
                    return (
                      <div
                        key={rk.id}
                        className={`rank-node-item ${isReached ? 'reached' : ''} ${
                          isCurrent ? 'current' : ''
                        }`}
                      >
                        <div className="node-circle">
                          <span>{rk.icon}</span>
                        </div>
                        <span className="node-name">{rk.name}</span>
                        <span className="node-xp">{rk.minXP} XP</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Progress Rail until next rank */}
              <div className="rank-next-rail-wrapper">
                <div className="rail-info-line">
                  <span>Progress towards {stats.nextRank.name}</span>
                  <span>{stats.rankProgressPct}%</span>
                </div>
                <div className="saas-progress-rail">
                  <div
                    className="saas-progress-fill"
                    style={{ width: `${stats.rankProgressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: ACHIEVEMENT GALLERY
            ========================================================================= */}
        <BadgeGrid />

        {/* =========================================================================
            SECTION 5: RECENT ACHIEVEMENTS (Timeline Activity Feed)
            ========================================================================= */}
        <section className="saas-recent-activity-section saas-card" data-gsap="reveal">
          <div className="activity-card-header">
            <div className="activity-title-group">
              <Sparkles size={16} className="text-purple" />
              <h3>Recent Unlocked Achievement</h3>
            </div>
            <button type="button" className="share-action-btn" onClick={handleShare}>
              <Share2 size={14} />
              <span>{copiedShare ? 'Link Copied!' : 'Share Milestone'}</span>
            </button>
          </div>

          {latestBadge ? (
            <div className="recent-badge-banner">
              <div className="recent-badge-icon">
                <span className="emoji">{latestBadge.icon || '🏆'}</span>
              </div>
              <div className="recent-badge-info">
                <div className="info-top">
                  <span className="recent-tag">LATEST UNLOCK</span>
                  <span className="recent-date">Just Now</span>
                </div>
                <h4>{latestBadge.name}</h4>
                <p>{latestBadge.desc}</p>
                <div className="recent-rewards-pills">
                  <span className="reward-tag xp">+{latestBadge.xp || 100} XP</span>
                  <span className="reward-tag coin">+{latestBadge.coins || 25} Coins</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="recent-empty-banner">
              <p className="muted">Complete your first ML level to unlock achievements!</p>
            </div>
          )}
        </section>

        {/* =========================================================================
            FOOTER: ACHIEVEMENT STATISTICS & ANALYTICS
            ========================================================================= */}
        <BadgeAnalytics />
      </div>
    </div>
  )
}
