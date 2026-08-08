import { useCallback, useEffect, useMemo, useState } from 'react'
import { BADGES, REWARDS } from '../data/badges'
import { LEVELS } from '../data/content'

const KEY = 'ml-quest-progress-v2'

const blank = () => ({
  coins: 0,
  totalStars: 0,
  clearedLevels: [],
  levelStars: {},
  completedModes: {},
  streak: 0,
  bestStreak: 0,
  lastPlayDate: null,
  perfectQuizzes: 0,
  flashDecksDone: 0,
  codingSolved: 0,
  interviewsDone: 0,
  badges: [],
  solvedCodingIds: [],
})

const today = () => new Date().toISOString().slice(0, 10)

function dayGap(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

function applyStreak(p) {
  const t = today()
  if (p.lastPlayDate === t) return p
  const streak = p.lastPlayDate && dayGap(p.lastPlayDate, t) === 1 ? p.streak + 1 : 1
  return { ...p, streak, bestStreak: Math.max(p.bestStreak, streak), lastPlayDate: t }
}

/** Candy Crush rule: clearing a level (via quiz pass) unlocks the next. */
function markLevelCleared(next, levelId) {
  if (next.clearedLevels.includes(levelId)) return next
  return {
    ...next,
    clearedLevels: [...next.clearedLevels, levelId],
    coins: next.coins + REWARDS.levelClear.coins,
    totalStars: next.totalStars + REWARDS.levelClear.stars,
    levelStars: {
      ...next.levelStars,
      [levelId]: Math.max(next.levelStars[levelId] || 0, 1),
    },
    _levelCleared: true,
  }
}

function applyBadges(next) {
  const earned = BADGES.filter((b) => !next.badges.includes(b.id) && b.condition(next))
  if (!earned.length) return { next, earned: [] }
  return {
    next: {
      ...next,
      badges: [...next.badges, ...earned.map((e) => e.id)],
      coins: next.coins + earned.length * 10,
    },
    earned,
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem('ml-quest-progress-v1')
      return { ...blank(), ...JSON.parse(raw || '{}') }
    } catch {
      return blank()
    }
  })
  const [newBadges, setNewBadges] = useState([])
  const [lastReward, setLastReward] = useState(null)
  const [levelJustCleared, setLevelJustCleared] = useState(false)

  useEffect(() => {
    const { _levelCleared, ...rest } = progress
    void _levelCleared
    localStorage.setItem(KEY, JSON.stringify(rest))
  }, [progress])

  const commit = useCallback((updater, reward) => {
    setProgress((p) => {
      let next = applyStreak(typeof updater === 'function' ? updater(p) : { ...p, ...updater })
      const clearedFlag = next._levelCleared
      delete next._levelCleared
      const { next: withBadges, earned } = applyBadges(next)
      if (earned.length) queueMicrotask(() => setNewBadges(earned))
      if (clearedFlag) queueMicrotask(() => setLevelJustCleared(true))
      return withBadges
    })
    if (reward) setLastReward(reward)
  }, [])

  const isUnlocked = useCallback(
    (levelId) => levelId === 1 || progress.clearedLevels.includes(levelId - 1),
    [progress.clearedLevels],
  )

  const completeQuiz = useCallback(
    (levelId, score, total) => {
      const ratio = total ? score / total : 0
      const perfect = score === total && total > 0
      const passed = ratio >= 0.5
      const starsEarned = perfect ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.5 ? 1 : 0
      const reward = perfect ? REWARDS.quizPerfect : passed ? REWARDS.quizPass : { coins: 5, stars: 0 }

      commit((p) => {
        let next = {
          ...p,
          coins: p.coins + reward.coins,
          totalStars: p.totalStars + reward.stars,
          perfectQuizzes: p.perfectQuizzes + (perfect ? 1 : 0),
          levelStars: { ...p.levelStars, [levelId]: Math.max(p.levelStars[levelId] || 0, starsEarned) },
          completedModes: { ...p.completedModes },
        }
        if (passed) {
          next.completedModes[`${levelId}:quiz`] = true
          next = markLevelCleared(next, levelId)
        }
        return next
      }, reward)

      return { perfect, passed, ratio }
    },
    [commit],
  )

  const completeFlash = useCallback(
    (levelId) => {
      commit((p) => ({
        ...p,
        coins: p.coins + REWARDS.flashComplete.coins,
        totalStars: p.totalStars + REWARDS.flashComplete.stars,
        flashDecksDone: p.flashDecksDone + 1,
        completedModes: { ...p.completedModes, [`${levelId}:flashcards`]: true },
      }), REWARDS.flashComplete)
    },
    [commit],
  )

  const completeInterview = useCallback(
    (levelId) => {
      commit((p) => ({
        ...p,
        coins: p.coins + REWARDS.interviewComplete.coins,
        totalStars: p.totalStars + REWARDS.interviewComplete.stars,
        interviewsDone: p.interviewsDone + 1,
        completedModes: { ...p.completedModes, [`${levelId}:interview`]: true },
      }), REWARDS.interviewComplete)
    },
    [commit],
  )

  const completeCoding = useCallback(
    (levelId, codingId) => {
      commit((p) => {
        if (p.solvedCodingIds.includes(codingId)) return p
        return {
          ...p,
          coins: p.coins + REWARDS.codingSolved.coins,
          totalStars: p.totalStars + REWARDS.codingSolved.stars,
          codingSolved: p.codingSolved + 1,
          solvedCodingIds: [...p.solvedCodingIds, codingId],
          completedModes: { ...p.completedModes, [`${levelId}:coding`]: true },
          levelStars: { ...p.levelStars, [levelId]: Math.max(p.levelStars[levelId] || 0, 2) },
        }
      }, REWARDS.codingSolved)
    },
    [commit],
  )

  const resetProgress = useCallback(() => {
    setProgress(blank())
    setNewBadges([])
    setLastReward(null)
    setLevelJustCleared(false)
    localStorage.removeItem(KEY)
    localStorage.removeItem('ml-quest-progress-v1')
  }, [])

  const ownedBadges = useMemo(() => BADGES.filter((b) => progress.badges.includes(b.id)), [progress.badges])

  const modeStatus = useCallback(
    (levelId) => {
      const level = LEVELS.find((l) => l.id === levelId)
      if (!level) return {}
      const map = {}
      level.modes.forEach((m) => {
        map[m] = !!progress.completedModes[`${levelId}:${m}`]
      })
      return map
    },
    [progress.completedModes],
  )

  return {
    progress,
    newBadges,
    lastReward,
    levelJustCleared,
    isUnlocked,
    completeQuiz,
    completeFlash,
    completeInterview,
    completeCoding,
    resetProgress,
    dismissBadges: () => setNewBadges([]),
    dismissReward: () => setLastReward(null),
    dismissLevelClear: () => setLevelJustCleared(false),
    ownedBadges,
    modeStatus,
  }
}
