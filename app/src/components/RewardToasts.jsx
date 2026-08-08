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
      const t = setTimeout(dismissLevelClear, 3200)
      return () => clearTimeout(t)
    }
  }, [levelJustCleared, dismissLevelClear])

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

import BadgeGrid from './BadgeGrid'
export { BadgeGrid }

