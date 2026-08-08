import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, LogOut, ChevronRight, CheckCircle2, Lock } from 'lucide-react'
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
        <h2>Level Not Found</h2>
        <p className="muted">Level {id} does not exist in the 100-level Machine Learning campaign.</p>
        <button type="button" className="btn primary" onClick={() => navigate('/quest')}>
          Back to Roadmap
        </button>
      </div>
    )
  }

  const unlocked = isUnlocked(levelId)
  
  if (!unlocked) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: '10vh' }}>
        <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <h2>Level Locked</h2>
        <p className="muted" style={{ marginBottom: '2rem' }}>You must complete the previous levels to unlock Level {id}.</p>
        <button type="button" className="btn primary" onClick={() => navigate('/quest')}>
          Back to Roadmap
        </button>
      </div>
    )
  }

  const cleared = progress.clearedLevels?.includes(levelId) || false
  const hasNextLevel = levelId < LEVELS.length
  const nextUnlocked = hasNextLevel && (cleared || isUnlocked(levelId + 1) || levelId >= 1)
  const hasPrevLevel = levelId > 1

  return (
    <div className="page level-play">
      {/* Level Header Navigation */}
      <div className="level-head">
        <div className="head-navigation-bar">
          <button type="button" className="exit-level-btn glass" onClick={() => navigate('/quest')}>
            <LogOut size={16} /> Exit to Roadmap
          </button>

          {hasNextLevel && (
            <button
              type="button"
              className={`next-level-head-btn ${cleared ? 'active' : ''}`}
              disabled={!cleared}
              onClick={() => navigate(`/quest/level/${levelId + 1}`)}
              title={!cleared ? 'Clear this level to unlock next' : ''}
            >
              {!cleared && <Lock size={14} style={{ marginRight: 6 }} />}
              <span>Next Level ({levelId + 1})</span>
              {cleared && <ArrowRight size={16} />}
            </button>
          )}
        </div>

        <div className="level-title-row">
          <span className="level-emoji">{level.emoji}</span>
          <div>
            <p className="eyebrow">
              Level {level.id} · {level.type}
              {cleared ? ' · Cleared ✓' : !unlocked ? ' · Practice Mode' : ''}
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
            ? 'Level cleared — next level is unlocked on the roadmap! Practice modes still earn bonus coins.'
            : 'Pass the Quiz with ≥50% score to clear this level and unlock the next level.'}
        </p>
      </div>

      {/* Main Mode Interactive Stage */}
      <div className="mode-stage" key={`${levelId}-${mode}`}>
        {mode === 'quiz' && <QuizMode levelId={levelId} />}
        {mode === 'flashcards' && <FlashcardMode levelId={levelId} />}
        {mode === 'interview' && <InterviewMode levelId={levelId} />}
        {mode === 'coding' && <CodingMode levelId={levelId} />}
      </div>

      {/* Bottom Sticky Action Footer Bar */}
      <div className="level-footer-action-bar glass">
        <button
          type="button"
          className="level-nav-footer-btn secondary"
          onClick={() => navigate('/quest')}
        >
          <LogOut size={15} /> Exit to Roadmap
        </button>

        <div className="footer-nav-group">
          {hasPrevLevel && (
            <button
              type="button"
              className="level-nav-footer-btn secondary"
              onClick={() => navigate(`/quest/level/${levelId - 1}`)}
            >
              <ArrowLeft size={15} /> Prev Level ({levelId - 1})
            </button>
          )}

          {hasNextLevel && (
            <button
              type="button"
              className={`level-nav-footer-btn primary ${cleared ? 'active' : ''}`}
              disabled={!cleared}
              onClick={() => navigate(`/quest/level/${levelId + 1}`)}
              title={!cleared ? 'Clear this level to unlock next' : ''}
            >
              {!cleared && <Lock size={14} style={{ marginRight: 6 }} />}
              <span>Next Level ({levelId + 1})</span>
              {cleared && <ArrowRight size={15} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
