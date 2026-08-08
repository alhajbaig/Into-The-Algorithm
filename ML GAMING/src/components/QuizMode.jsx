import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZZES } from '../data/content'
import { useGame } from '../context/GameContext'

export default function QuizMode({ levelId }) {
  const questions = useMemo(() => QUIZZES[levelId] || [], [levelId])
  const { completeQuiz, cheer, playCorrectSound, playWrongSound } = useGame()
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState(null)
  const [finalScore, setFinalScore] = useState(0)

  if (!questions.length) {
    return <p className="empty">No quiz for this level yet.</p>
  }

  const q = questions[idx]

  const choose = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === q.answer) {
      playCorrectSound()
    } else {
      playWrongSound()
    }
  }


  const next = () => {
    const newScore = score + (picked === q.answer ? 1 : 0)
    if (idx + 1 >= questions.length) {
      const res = completeQuiz(levelId, newScore, questions.length)
      setFinalScore(newScore)
      setResult(res)
      setFinished(true)
      if (res.perfect) cheer('perfect')
      else if (res.passed) cheer('pass')
      else cheer('fail')
    } else {
      setScore(newScore)
      setIdx((i) => i + 1)
      setPicked(null)
    }
  }

  if (finished && result) {
    return (
      <motion.div className="result-panel" initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="result-burst">{result.perfect ? '🌟' : result.passed ? '🎉' : '💪'}</div>
        <h2>
          {result.perfect
            ? 'Perfect! You are an ML Star!'
            : result.passed
              ? 'Hurray! Level unlocked ahead!'
              : 'Keep practicing!'}
        </h2>
        <p>
          Score: <strong style={{ color: '#f4edff' }}>{finalScore}</strong> / {questions.length}
        </p>
        <p className="muted">
          {result.passed
            ? 'This level is cleared. Head back to the map to open the next level. Bonus modes still earn coins.'
            : 'You need at least 50% to clear the level and unlock the next one.'}
        </p>
      </motion.div>
    )
  }

  return (
    <div className="quiz">
      <div className="progress-rail">
        <div style={{ width: `${((idx + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      <p className="q-count">
        Question {idx + 1} / {questions.length} · Current score {score}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -24, opacity: 0 }}
          className="q-card"
        >
          <h2>{q.q}</h2>
          <div className="options">
            {q.options.map((opt, i) => {
              let cls = 'option'
              if (picked !== null) {
                if (i === q.answer) cls += ' correct'
                else if (i === picked) cls += ' wrong'
              }
              return (
                <button key={i} type="button" className={cls} onClick={() => choose(i)} disabled={picked !== null}>
                  {opt}
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <div className="explain">
              <p>{q.explain}</p>
              <button type="button" className="btn primary" onClick={next}>
                {idx + 1 >= questions.length ? 'See results' : 'Next question'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
