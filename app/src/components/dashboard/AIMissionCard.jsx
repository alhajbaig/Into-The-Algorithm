import { Target, CheckCircle2, Sparkles, Coins, Zap } from 'lucide-react'
import { useGame } from '../../context/GameContext'

export function AIMissionCard({ currentLevelTitle }) {
  const { progress, claimDailyMission } = useGame()

  const todayStr = new Date().toISOString().slice(0, 10)
  const isClaimed = progress.lastMissionClaimDate === todayStr

  const handleClaim = () => {
    if (!isClaimed && claimDailyMission) {
      claimDailyMission()
    }
  }

  return (
    <div className="ai-mission-card glass" data-gsap="reveal">
      <div className="card-head-row">
        <div className="card-head-title">
          <Target size={18} className="text-gold" />
          <span>Today&apos;s AI Mission</span>
        </div>
        <span className="card-badge-gold">Daily Reward</span>
      </div>

      <div className="mission-content-box">
        <div className="mission-header-info">
          <h4>Master {currentLevelTitle || 'Linear Regression'} &amp; Practice</h4>
          <p>Complete any level mode or daily practice to claim your daily bonus tokens.</p>
        </div>

        <div className="mission-rewards-row">
          <div className="reward-chip">
            <Zap size={14} color="#c084fc" />
            <span>+1 Star</span>
          </div>
          <div className="reward-chip">
            <Coins size={14} color="#fbbf24" />
            <span>+25 Coins</span>
          </div>
        </div>

        <button
          type="button"
          className={`mission-claim-btn ${isClaimed ? 'claimed' : ''}`}
          onClick={handleClaim}
          disabled={isClaimed}
        >
          {isClaimed ? (
            <>
              <CheckCircle2 size={16} />
              <span>Mission Accomplished (+25 Coins)</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Claim Mission Bonus</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
