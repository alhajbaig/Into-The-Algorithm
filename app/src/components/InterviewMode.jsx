import { useState } from 'react'
import { INTERVIEWS } from '../data/content'
import { useGame } from '../context/GameContext'

export default function InterviewMode({ levelId }) {
  const items = INTERVIEWS[levelId] || []
  const { completeInterview, cheer } = useGame()
  const [i, setI] = useState(0)
  const [show, setShow] = useState(false)
  const [done, setDone] = useState(false)

  if (!items.length) return <p className="empty">No interview set for this level.</p>

  const item = items[i]

  const next = () => {
    if (i + 1 >= items.length) {
      completeInterview(levelId)
      cheer('interview')
      setDone(true)
    } else {
      setI((x) => x + 1)
      setShow(false)
    }
  }

  if (done) {
    return (
      <div className="result-panel">
        <div className="result-burst">🎤</div>
        <h2>Interview round complete!</h2>
        <p>You practiced key talking points — hire-ready energy!</p>
      </div>
    )
  }

  return (
    <div className="interview">
      <p className="q-count">
        Prompt {i + 1} / {items.length}
      </p>
      <div className="interview-card">
        <h2>{item.q}</h2>
        <p className="tips">
          <strong>Talking points:</strong> {item.tips}
        </p>
        {show ? (
          <div className="sample-answer">
            <h3>Sample answer</h3>
            <p>{item.sample}</p>
          </div>
        ) : (
          <p className="muted">Answer out loud (or in notes), then reveal a sample.</p>
        )}
        <div className="flash-actions">
          <button type="button" className="btn" onClick={() => setShow(true)} disabled={show}>
            Reveal sample
          </button>
          <button type="button" className="btn primary" onClick={next}>
            {i + 1 >= items.length ? 'Finish round' : 'Next question'}
          </button>
        </div>
      </div>
    </div>
  )
}
