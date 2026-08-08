import { BadgeGrid } from '../components/RewardToasts'
import { useGame } from '../context/GameContext'
import { BADGES } from '../data/badges'

export default function BadgesPage() {
  const { progress } = useGame()
  return (
    <div className="page badges-page">
      <header className="page-intro">
        <p className="eyebrow">Trophy case</p>
        <h1>Badges & rewards</h1>
        <p className="lede">
          You own {progress.badges.length} / {BADGES.length} badges · Best streak {progress.bestStreak} days · {progress.coins}{' '}
          coins
        </p>
      </header>
      <BadgeGrid />
    </div>
  )
}
