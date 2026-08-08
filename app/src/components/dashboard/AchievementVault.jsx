import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import { BADGES } from '../../data/badges'
import { Trophy, ChevronRight, Lock, Sparkles } from 'lucide-react'

const RARITY_STYLES = {
  Common:    { border: 'rgba(148,163,184,0.3)', glow: 'rgba(148,163,184,0.1)', text: '#94a3b8', bg: 'rgba(148,163,184,0.06)' },
  Rare:      { border: 'rgba(59,130,246,0.5)',   glow: 'rgba(59,130,246,0.15)', text: '#60a5fa', bg: 'rgba(59,130,246,0.08)' },
  Epic:      { border: 'rgba(139,92,246,0.5)',   glow: 'rgba(139,92,246,0.15)', text: '#a78bfa', bg: 'rgba(139,92,246,0.08)' },
  Legendary: { border: 'rgba(251,191,36,0.5)',   glow: 'rgba(251,191,36,0.15)', text: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  Mythic:    { border: 'rgba(236,72,153,0.5)',   glow: 'rgba(236,72,153,0.2)',  text: '#f472b6', bg: 'rgba(236,72,153,0.08)' },
}

const sectionV = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function AchievementVault() {
  const { progress } = useGame()

  const displayBadges = BADGES.slice(0, 8).map((badge) => {
    const unlocked = progress.badges?.includes(badge.id)
    const rarity = badge.rarity || 'Common'
    const style = RARITY_STYLES[rarity] || RARITY_STYLES.Common
    return { ...badge, unlocked, rarity, style }
  })

  const unlockedCount = (progress.badges || []).length

  return (
    <motion.section
      className="cc-achievement-vault"
      variants={sectionV}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="cc-section-header">
        <Trophy size={18} className="cc-icon-gold" />
        <h2 className="cc-section-title">Achievement Vault</h2>
        <Link to="/quest/badges" className="cc-section-link">
          View All {BADGES.length} <ChevronRight size={14} />
        </Link>
      </div>

      <div className="cc-vault-summary">
        <span className="cc-vault-count">{unlockedCount}/{BADGES.length}</span>
        <span className="cc-vault-lbl">Achievements Unlocked</span>
      </div>

      <div className="cc-vault-grid">
        {displayBadges.map((badge, i) => (
          <motion.div
            key={badge.id}
            className={`cc-badge-card glass ${badge.unlocked ? 'unlocked' : 'locked'}`}
            style={{
              '--badge-border': badge.style.border,
              '--badge-glow': badge.style.glow,
              '--badge-bg': badge.style.bg,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileHover={{
              scale: 1.04,
              rotateX: badge.unlocked ? 3 : 0,
              rotateY: badge.unlocked ? -3 : 0,
            }}
          >
            {/* Rarity indicator */}
            <span className="cc-badge-rarity" style={{ color: badge.style.text }}>
              {badge.rarity}
            </span>

            {/* Icon */}
            <div className={`cc-badge-icon-wrap ${badge.unlocked ? '' : 'ghost'}`}>
              <span className="cc-badge-emoji">{badge.icon}</span>
              {!badge.unlocked && <Lock size={14} className="cc-lock-overlay" />}
            </div>

            {/* Name */}
            <span className="cc-badge-name">{badge.name}</span>

            {/* XP Reward */}
            <span className="cc-badge-xp">
              {badge.unlocked ? (
                <><Sparkles size={11} /> +{badge.xp || 50} XP</>
              ) : (
                <><Lock size={11} /> Locked</>
              )}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
