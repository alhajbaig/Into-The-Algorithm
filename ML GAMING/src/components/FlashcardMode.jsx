import { useState } from 'react'
import { motion } from 'framer-motion'
import { FLASHCARDS } from '../data/content'
import { useGame } from '../context/GameContext'

export default function FlashcardMode({ levelId }) {
  const cards = FLASHCARDS[levelId] || []
  const { completeFlash, cheer } = useGame()
  const [i, setI] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)

  if (!cards.length) return <p className="empty">No flashcards here.</p>

  const card = cards[i]

  const next = () => {
    if (i + 1 >= cards.length) {
      completeFlash(levelId)
      cheer('flash')
      setDone(true)
    } else {
      setI((x) => x + 1)
      setFlipped(false)
    }
  }

  if (done) {
    return (
      <div className="result-panel">
        <div className="result-burst">🃏</div>
        <h2>Flash deck complete!</h2>
        <p className="muted">Coins and streak updated. Great work!</p>
      </div>
    )
  }

  return (
    <div className="flash">
      <p className="q-count">
        Card {i + 1} / {cards.length}
      </p>
      <motion.button
        type="button"
        className={`flash-card ${flipped ? 'is-flipped' : ''}`}
        onClick={() => setFlipped((f) => !f)}
        whileTap={{ scale: 0.98 }}
      >
        <span className="flash-label">{flipped ? 'Answer' : 'Question'}</span>
        <span className="flash-text">{flipped ? card.back : card.front}</span>
        <span className="flash-hint">Tap to flip</span>
      </motion.button>
      <div className="flash-actions">
        <button type="button" className="btn" onClick={() => setFlipped(true)} disabled={flipped}>
          Reveal
        </button>
        <button type="button" className="btn primary" onClick={next} disabled={!flipped}>
          {i + 1 >= cards.length ? 'Finish deck' : 'Got it →'}
        </button>
      </div>
    </div>
  )
}
