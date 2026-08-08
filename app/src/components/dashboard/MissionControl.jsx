import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Target, Swords, Clock, Star, Coins, Zap, CheckCircle2,
  Sparkles, Play, ArrowRight, BookOpen, Code, MessageSquare, Award
} from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { LEVELS } from '../../data/content'

/* ── Mini Completion Ring ── */
function CompletionRing({ done, size = 28, strokeWidth = 3 }) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="cc-obj-ring">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={done ? '#10b981' : 'rgba(255,255,255,0.12)'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: done ? 0 : c }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
      />
      {done && <CheckCircle2 x={size/2-6} y={size/2-6} width={12} height={12} stroke="#10b981" />}
    </svg>
  )
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function MissionControl({ currentLevel }) {
  const { progress, claimDailyMission } = useGame()
  const navigate = useNavigate()

  const todayStr = new Date().toISOString().slice(0, 10)
  const isClaimed = progress.lastMissionClaimDate === todayStr
  const clearedLevels = progress.clearedLevels?.length || 0
  const difficultyLabel = currentLevel.id <= 20 ? 'Normal' : currentLevel.id <= 50 ? 'Hard' : currentLevel.id <= 80 ? 'Expert' : 'Legendary'
  const difficultyColor = currentLevel.id <= 20 ? '#10b981' : currentLevel.id <= 50 ? '#3b82f6' : currentLevel.id <= 80 ? '#8b5cf6' : '#fbbf24'

  // Daily objectives based on real progress
  const hasQuiz = !!progress.completedModes?.[`${currentLevel.id}:quiz`]
  const hasFlash = !!progress.completedModes?.[`${currentLevel.id}:flashcards`]
  const hasCoding = !!progress.completedModes?.[`${currentLevel.id}:coding`]
  const hasBadgeToday = isClaimed

  const objectives = [
    { id: 'quiz', label: 'Complete Quiz', icon: Target, done: hasQuiz },
    { id: 'lesson', label: 'Finish Flashcards', icon: BookOpen, done: hasFlash },
    { id: 'coding', label: 'Practice Coding', icon: Code, done: hasCoding },
    { id: 'badge', label: 'Claim Daily Reward', icon: Award, done: hasBadgeToday },
  ]

  const completedCount = objectives.filter(o => o.done).length
  const missionPct = Math.round((completedCount / objectives.length) * 100)

  return (
    <motion.section
      className="cc-mission-control"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {/* ── Left: Today's Mission ── */}
      <div className="cc-mission-card glass">
        <div className="cc-section-label">
          <Swords size={16} className="cc-icon-gold" />
          <span>Today's Mission</span>
        </div>

        <div className="cc-mission-body">
          <div className="cc-mission-top">
            <h3 className="cc-mission-title">
              Master {currentLevel.title}
            </h3>
            <div className="cc-mission-tags">
              <span className="cc-difficulty-tag" style={{ '--diff-color': difficultyColor }}>
                {difficultyLabel}
              </span>
              <span className="cc-time-tag">
                <Clock size={12} /> ~10 min
              </span>
            </div>
          </div>

          <p className="cc-mission-desc">
            Complete all learning modes for Level {currentLevel.id} to earn bonus rewards and advance your campaign.
          </p>

          {/* Rewards Row */}
          <div className="cc-mission-rewards">
            <div className="cc-reward-item">
              <Star size={14} className="cc-icon-gold" />
              <span>3 Stars</span>
            </div>
            <div className="cc-reward-item">
              <Zap size={14} className="cc-icon-purple" />
              <span>+100 XP</span>
            </div>
            <div className="cc-reward-item">
              <Coins size={14} className="cc-icon-gold" />
              <span>+25 Coins</span>
            </div>
          </div>

          {/* Completion Arc */}
          <div className="cc-mission-progress-row">
            <div className="cc-mission-progress-bar">
              <motion.div
                className="cc-mission-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${missionPct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
              />
            </div>
            <span className="cc-mission-pct">{missionPct}%</span>
          </div>

          <motion.button
            type="button"
            className="cc-mission-start-btn"
            onClick={() => navigate(`/quest/level/${currentLevel.id}`)}
            whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}
            whileTap={{ scale: 0.97 }}
          >
            <Play size={16} fill="currentColor" />
            <span>Start Mission</span>
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </div>

      {/* ── Right: Daily Objectives ── */}
      <div className="cc-objectives-card glass">
        <div className="cc-section-label">
          <Target size={16} className="cc-icon-cyan" />
          <span>Daily Objectives</span>
          <span className="cc-obj-count">{completedCount}/{objectives.length}</span>
        </div>

        <div className="cc-objectives-list">
          {objectives.map((obj, i) => {
            const Icon = obj.icon
            return (
              <motion.div
                key={obj.id}
                className={`cc-objective-item ${obj.done ? 'done' : ''}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <CompletionRing done={obj.done} />
                <Icon size={16} className={obj.done ? 'cc-icon-green' : 'cc-icon-muted'} />
                <span className="cc-obj-label">{obj.label}</span>
                {obj.done && (
                  <motion.span
                    className="cc-obj-done-tag"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    Done
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </div>

        {!isClaimed && (
          <motion.button
            type="button"
            className="cc-claim-daily-btn"
            onClick={() => claimDailyMission?.()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Sparkles size={14} />
            <span>Claim Daily Bonus</span>
          </motion.button>
        )}
        {isClaimed && (
          <div className="cc-claimed-tag">
            <CheckCircle2 size={14} />
            <span>Daily Bonus Claimed!</span>
          </div>
        )}
      </div>
    </motion.section>
  )
}
