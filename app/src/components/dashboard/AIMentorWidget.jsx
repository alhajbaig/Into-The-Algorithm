import { Bot, Lightbulb, AlertTriangle, Sparkles, Trophy } from 'lucide-react'
import { useGame } from '../../context/GameContext'
import { LEVELS } from '../../data/content'

export function AIMentorWidget() {
  const { progress } = useGame()

  const clearedCount = progress.clearedLevels?.length || 0
  const nextLevelId = Math.min(LEVELS.length, clearedCount + 1)
  const nextLevel = LEVELS.find((l) => l.id === nextLevelId) || LEVELS[0]

  // Find any cleared level with < 3 stars for optimization recommendation
  const levelToImprove = progress.clearedLevels?.find((id) => (progress.levelStars?.[id] || 0) < 3)
  const improveLevelObj = levelToImprove ? LEVELS.find((l) => l.id === levelToImprove) : null

  return (
    <div className="ai-mentor-widget glass" data-gsap="reveal">
      <div className="card-head-row">
        <div className="card-head-title">
          <Bot size={18} className="text-cyan" />
          <span>ATLAS AI Assistant &amp; Advisor</span>
        </div>
        <span className="card-badge-muted">Live Analysis</span>
      </div>

      <div className="mentor-suggestions-stack">
        {/* Recommendation 1: Next Level Focus */}
        <div className="suggestion-item glass">
          <div className="item-icon-box text-gold">
            <Lightbulb size={16} />
          </div>
          <div className="item-text">
            <h5>Recommended Next Action: Level {nextLevel.id}</h5>
            <p>
              Focus on <strong>{nextLevel.title}</strong> to expand your {nextLevel.tier || 'ML'} foundation ({clearedCount}/{LEVELS.length} levels completed).
            </p>
          </div>
        </div>

        {/* Recommendation 2: Weak Area / 3-Star Optimization */}
        <div className="suggestion-item glass">
          <div className="item-icon-box text-purple">
            <AlertTriangle size={16} />
          </div>
          <div className="item-text">
            <h5>
              {improveLevelObj ? `Improve Score: Level ${improveLevelObj.id}` : 'Daily Streak & Mastery'}
            </h5>
            <p>
              {improveLevelObj
                ? `You earned ${progress.levelStars?.[improveLevelObj.id] || 1}/3 stars on "${improveLevelObj.title}". Try Coding mode to reach 3 stars!`
                : `Awesome job! You have a ${progress.streak || 0}-day streak active. Complete today's quiz to keep momentum.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
