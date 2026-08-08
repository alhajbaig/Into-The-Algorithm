import { Link, NavLink } from 'react-router-dom'
import { Flame, Coins, Star, Trophy, RotateCcw } from 'lucide-react'
import { useGame } from '../context/GameContext'

export default function Header() {
  const { progress, resetProgress } = useGame()

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-candy" aria-hidden>
          ◆
        </span>
        <span>
          ML <em>Quest</em>
        </span>
      </Link>

      <nav className="topnav">
        <NavLink to="/" end>
          Map
        </NavLink>
        <NavLink to="/badges">Badges</NavLink>
      </nav>

      <div className="stats-pill">
        <span title="Streak">
          <Flame size={15} color="#e879f9" /> {progress.streak}d
        </span>
        <span title="Stars">
          <Star size={15} color="#fbbf24" /> {progress.totalStars}
        </span>
        <span title="Coins">
          <Coins size={15} color="#a78bfa" /> {progress.coins}
        </span>
        <span title="Badges">
          <Trophy size={15} color="#34d399" /> {progress.badges.length}
        </span>
        <button
          type="button"
          className="ghost-btn"
          title="Reset progress"
          onClick={() => {
            if (window.confirm('Reset all progress, badges, and streaks?')) resetProgress()
          }}
        >
          <RotateCcw size={14} />
        </button>
      </div>
    </header>
  )
}
