import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { LEVELS } from '../../data/content'
import { BADGES } from '../../data/badges'
import { CheckCircle2, Trophy, Sparkles, Coins, Star, Zap, Clock } from 'lucide-react'

const sectionV = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function JourneyTimeline() {
  const { progress } = useGame()

  // Build timeline events from real progress
  const events = []

  // Mission claims
  if (progress.lastMissionClaimDate) {
    events.push({
      id: 'mission-claim',
      type: 'reward',
      title: 'Claimed Daily Mission Bonus',
      sub: `${progress.lastMissionClaimDate}`,
      rewards: [{ icon: Coins, label: '+25 Coins', color: '#fbbf24' }, { icon: Star, label: '+1 Star', color: '#fbbf24' }],
      icon: Sparkles,
      color: '#fbbf24',
    })
  }

  // Cleared levels (last 5)
  ;(progress.clearedLevels || []).slice(-5).reverse().forEach((lvlId) => {
    const lvlObj = LEVELS.find((l) => l.id === lvlId)
    const stars = progress.levelStars?.[lvlId] || 1
    events.push({
      id: `lvl-${lvlId}`,
      type: 'level',
      title: `Cleared Level ${lvlId}: ${lvlObj?.title || 'Algorithm Level'}`,
      sub: `${lvlObj?.tier || 'Campaign'} · ${lvlObj?.chapterTitle || ''}`,
      rewards: [
        { icon: Star, label: `${stars}/3 Stars`, color: '#fbbf24' },
        { icon: Zap, label: '+100 XP', color: '#8b5cf6' },
      ],
      icon: CheckCircle2,
      color: '#10b981',
    })
  })

  // Badges earned (last 3)
  ;(progress.badges || []).slice(-3).reverse().forEach((bId) => {
    const bObj = BADGES.find((b) => b.id === bId)
    if (bObj) {
      events.push({
        id: `badge-${bId}`,
        type: 'badge',
        title: `Unlocked "${bObj.name}" Badge`,
        sub: `${bObj.rarity || 'Common'} · ${bObj.category}`,
        rewards: [{ icon: Zap, label: `+${bObj.xp || 50} XP`, color: '#8b5cf6' }],
        icon: Trophy,
        color: '#fbbf24',
      })
    }
  })

  // Fallback
  if (!events.length) {
    events.push({
      id: 'init',
      type: 'init',
      title: 'Command Center Initialized',
      sub: 'Ready to begin Level 1 — Python Foundations',
      rewards: [],
      icon: Zap,
      color: '#3b82f6',
    })
  }

  return (
    <motion.section
      className="cc-journey-timeline"
      variants={sectionV}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="cc-section-header">
        <Clock size={18} className="cc-icon-green" />
        <h2 className="cc-section-title">Learning Journey</h2>
      </div>

      <div className="cc-timeline-container">
        {/* Glowing vertical line */}
        <div className="cc-timeline-line" />

        {events.map((ev, i) => {
          const Icon = ev.icon
          return (
            <motion.div
              key={ev.id}
              className="cc-timeline-event"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
            >
              {/* Node dot */}
              <div className="cc-timeline-node" style={{ '--node-c': ev.color }}>
                <Icon size={14} style={{ color: ev.color }} />
              </div>

              {/* Event Card */}
              <div className="cc-timeline-card glass">
                <div className="cc-timeline-card-top">
                  <h4 className="cc-timeline-title">{ev.title}</h4>
                  <span className={`cc-timeline-type-tag cc-type-${ev.type}`}>{ev.type}</span>
                </div>
                <p className="cc-timeline-sub">{ev.sub}</p>

                {ev.rewards.length > 0 && (
                  <div className="cc-timeline-rewards">
                    {ev.rewards.map((r, ri) => {
                      const RIcon = r.icon
                      return (
                        <span key={ri} className="cc-timeline-reward-chip">
                          <RIcon size={12} style={{ color: r.color }} />
                          {r.label}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
