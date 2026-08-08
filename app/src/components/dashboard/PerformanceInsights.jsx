import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { BADGES } from '../../data/badges'
import { Activity, Zap } from 'lucide-react'

const sectionV = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

/* ── SVG Circular Arc ── */
function CircularArc({ label, value, max, color, size = 100 }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div className="cc-insight-arc">
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
        <text x={size/2} y={size/2 - 4} textAnchor="middle" fill="#fff" fontSize="16" fontWeight="800"
          fontFamily="var(--font-display)">{pct}%</text>
        <text x={size/2} y={size/2 + 12} textAnchor="middle" fill="#94a3b8" fontSize="9">{label}</text>
      </svg>
    </div>
  )
}

/* ── Gradient Progress Bar ── */
function GradientBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="cc-insight-bar">
      <div className="cc-ibar-header">
        <span className="cc-ibar-label">{label}</span>
        <span className="cc-ibar-val" style={{ color }}>{value}/{max}</span>
      </div>
      <div className="cc-ibar-track">
        <motion.div
          className="cc-ibar-fill"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}

/* ── Mini Heatmap ── */
function MiniHeatmap({ progress }) {
  const weeks = useMemo(() => {
    const data = []
    const cleared = progress.clearedLevels?.length || 0
    const streak = progress.bestStreak || 0
    for (let w = 0; w < 12; w++) {
      const days = []
      for (let d = 0; d < 7; d++) {
        const idx = w * 7 + d
        let level = 0
        if (idx > 84 - Math.min(30, cleared * 2 + streak)) {
          const pseudo = (idx * 17 + cleared * 3) % 10
          if (pseudo > 7) level = 4
          else if (pseudo > 4) level = 3
          else if (pseudo > 2) level = 2
          else if (pseudo > 0) level = 1
        }
        days.push(level)
      }
      data.push(days)
    }
    return data
  }, [progress.clearedLevels, progress.bestStreak])

  return (
    <div className="cc-mini-heatmap">
      <span className="cc-heatmap-title">12-Week Activity</span>
      <div className="cc-heatmap-grid">
        {weeks.map((w, wi) => (
          <div key={wi} className="cc-hm-col">
            {w.map((lvl, di) => (
              <div key={di} className={`cc-hm-cell cc-hm-${lvl}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function PerformanceInsights() {
  const { progress } = useGame()

  const clearedCount = progress.clearedLevels?.length || 0
  const badgeCount = (progress.badges || []).length
  const quizzes = clearedCount + (progress.perfectQuizzes || 0)
  const flashcards = progress.flashDecksDone || 0
  const coding = progress.codingSolved || 0
  const interview = progress.interviewsDone || 0
  const totalModes = Math.max(1, quizzes + flashcards + coding + interview)

  const categories = ['Learning', 'Quiz', 'Coding', 'Interview', 'Streak', 'Secret']
  const catStats = categories.map((cat) => {
    const catBadges = BADGES.filter((b) => b.category === cat)
    const total = catBadges.length || 1
    const unlocked = catBadges.filter((b) => progress.badges?.includes(b.id)).length
    return { cat, unlocked, total }
  })

  const modeData = [
    { name: 'Quiz', count: quizzes, color: '#3b82f6' },
    { name: 'Flash', count: flashcards, color: '#8b5cf6' },
    { name: 'Code', count: coding, color: '#06b6d4' },
    { name: 'Interview', count: interview, color: '#fbbf24' },
  ]

  return (
    <motion.section
      className="cc-performance-insights"
      variants={sectionV}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="cc-section-header">
        <Activity size={18} className="cc-icon-cyan" />
        <h2 className="cc-section-title">Performance Insights</h2>
      </div>

      <div className="cc-insights-grid glass">
        {/* Circular Arcs */}
        <div className="cc-arcs-row">
          <CircularArc label="Levels" value={clearedCount} max={100} color="#3b82f6" />
          <CircularArc label="Badges" value={badgeCount} max={BADGES.length} color="#fbbf24" />
          <CircularArc label="Modes" value={totalModes} max={Math.max(totalModes, 20)} color="#8b5cf6" />
        </div>

        {/* Mode Distribution Bars */}
        <div className="cc-mode-bars">
          {modeData.map((m) => (
            <GradientBar key={m.name} label={m.name} value={m.count} max={Math.max(...modeData.map(d => d.count), 1)} color={m.color} />
          ))}
        </div>

        {/* Category Bars */}
        <div className="cc-cat-bars">
          {catStats.slice(0, 4).map((cs) => (
            <GradientBar key={cs.cat} label={cs.cat} value={cs.unlocked} max={cs.total} color="#06b6d4" />
          ))}
        </div>

        {/* Mini Heatmap */}
        <MiniHeatmap progress={progress} />
      </div>
    </motion.section>
  )
}
