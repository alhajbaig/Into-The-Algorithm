import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { LEVELS } from '../data/content'
import { useGame } from '../context/GameContext'
import QuizMode from '../components/QuizMode'
import FlashcardMode from '../components/FlashcardMode'
import InterviewMode from '../components/InterviewMode'
import CodingMode from '../components/CodingMode'

const MODE_LABEL = {
  quiz: 'Quiz',
  flashcards: 'Flashcards',
  interview: 'Interview',
  coding: 'Coding',
}

export default function LevelPlay() {
  const { id } = useParams()
  const levelId = Number(id)
  const level = LEVELS.find((l) => l.id === levelId)
  const { isUnlocked, progress, modeStatus } = useGame()
  const navigate = useNavigate()
  const [mode, setMode] = useState(() => level?.modes?.[0] || 'quiz')
  const done = modeStatus(levelId)

  if (!level) {
    return (
      <div className="page">
        <p>Level not found.</p>
        <Link to="/">Back to map</Link>
      </div>
    )
  }

  if (!isUnlocked(levelId)) {
    return (
      <div className="page locked-page">
        <h2>Level locked</h2>
        <p className="muted">Pass the quiz on level {levelId - 1} (≥50%) to unlock this one.</p>
        <button type="button" className="btn primary" onClick={() => navigate('/')}>
          Back to map
        </button>
      </div>
    )
  }

  const cleared = progress.clearedLevels.includes(levelId)

  return (
    <div className="page level-play">
      <div className="level-head">
        <button type="button" className="back-link" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Map
        </button>
        <div className="level-title-row">
          <span className="level-emoji">{level.emoji}</span>
          <div>
            <p className="eyebrow">
              Level {level.id} · {level.type}
              {cleared ? ' · Cleared' : ''}
            </p>
            <h1>{level.title}</h1>
            <p className="lede tight">{level.blurb}</p>
          </div>
        </div>
        <div className="mode-tabs">
          {level.modes.map((m) => (
            <button
              key={m}
              type="button"
              className={`mode-tab ${mode === m ? 'active' : ''} ${done[m] ? 'done' : ''}`}
              onClick={() => setMode(m)}
            >
              {done[m] ? '✓ ' : ''}
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
        <p className="unlock-hint">
          {cleared
            ? 'Level cleared — next level is unlocked on the map. Keep earning from other modes.'
            : 'Pass the Quiz with ≥50% to clear this level and unlock the next.'}
        </p>
      </div>

      <div className="mode-stage" key={`${levelId}-${mode}`}>
        {mode === 'quiz' && <QuizMode levelId={levelId} />}
        {mode === 'flashcards' && <FlashcardMode levelId={levelId} />}
        {mode === 'interview' && <InterviewMode levelId={levelId} />}
        {mode === 'coding' && <CodingMode levelId={levelId} />}
      </div>
    </div>
  )
}
