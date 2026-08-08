import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { Coins, Star, Gem, Gift, Sparkles, Lock, ChevronRight, Package } from 'lucide-react'

const sectionV = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function RewardShelf() {
  const { progress } = useGame()

  const coins = progress.coins || 0
  const stars = progress.totalStars || 0
  const badges = progress.badges?.length || 0
  const streak = progress.bestStreak || 0

  // Next reward chest threshold
  const nextChestAt = Math.ceil(coins / 100) * 100
  const chestProgress = coins > 0 ? Math.round((coins % 100) / 100 * 100) : 0

  const rewards = [
    {
      id: 'coins',
      icon: Coins,
      label: 'Coins',
      value: coins,
      color: '#fbbf24',
      delay: 0,
    },
    {
      id: 'stars',
      icon: Star,
      label: 'Stars',
      value: stars,
      color: '#f59e0b',
      delay: 0.06,
    },
    {
      id: 'badges',
      icon: Gem,
      label: 'Badges',
      value: badges,
      color: '#8b5cf6',
      delay: 0.12,
    },
    {
      id: 'streak',
      icon: Sparkles,
      label: 'Best Streak',
      value: `${streak}d`,
      color: '#06b6d4',
      delay: 0.18,
    },
  ]

  return (
    <motion.section
      className="cc-reward-shelf"
      variants={sectionV}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="cc-section-header">
        <Gift size={18} className="cc-icon-gold" />
        <h2 className="cc-section-title">Rewards</h2>
      </div>

      <div className="cc-shelf-card glass">
        {/* Floating reward items */}
        <div className="cc-shelf-items">
          {rewards.map((r) => {
            const Icon = r.icon
            return (
              <motion.div
                key={r.id}
                className="cc-shelf-item"
                style={{ '--item-color': r.color }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + r.delay }}
                whileHover={{ scale: 1.08, y: -4 }}
              >
                <motion.div
                  className="cc-shelf-icon-wrap"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3 + r.delay * 10, ease: 'easeInOut' }}
                >
                  <Icon size={22} style={{ color: r.color }} />
                </motion.div>
                <span className="cc-shelf-val">{typeof r.value === 'number' ? r.value.toLocaleString() : r.value}</span>
                <span className="cc-shelf-lbl">{r.label}</span>
              </motion.div>
            )
          })}

          {/* Mystery Box */}
          <motion.div
            className="cc-shelf-item cc-mystery-box"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.08, y: -4 }}
          >
            <motion.div
              className="cc-shelf-icon-wrap cc-mystery-icon"
              animate={{ rotateY: [0, 10, -10, 0], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            >
              <Package size={22} />
            </motion.div>
            <span className="cc-shelf-val">?</span>
            <span className="cc-shelf-lbl">Mystery</span>
          </motion.div>
        </div>

        {/* Next Chest Progress */}
        <div className="cc-chest-progress">
          <div className="cc-chest-info">
            <Gift size={14} className="cc-icon-gold" />
            <span>Next Reward Chest at {nextChestAt} Coins</span>
          </div>
          <div className="cc-chest-bar">
            <motion.div
              className="cc-chest-fill"
              initial={{ width: 0 }}
              animate={{ width: `${chestProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            />
          </div>
          <span className="cc-chest-pct">{chestProgress}%</span>
        </div>
      </div>
    </motion.section>
  )
}
