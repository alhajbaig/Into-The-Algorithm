import { useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGame } from '../context/GameContext'
import { LEVELS } from '../data/content'
import { BADGES } from '../data/badges'
import { useGSAPAnimations } from '../hooks/useGSAPAnimations'

/* ── 11-Section Command Center Components ── */
import { AIWelcomeHero } from '../components/dashboard/AIWelcomeHero'
import { MissionControl } from '../components/dashboard/MissionControl'
import { PlayerProgress } from '../components/dashboard/PlayerProgress'
import { SkillGalaxy } from '../components/dashboard/SkillGalaxy'
import { JourneyTimeline } from '../components/dashboard/JourneyTimeline'
import { AchievementVault } from '../components/dashboard/AchievementVault'
import { MasteryUniverse } from '../components/dashboard/MasteryUniverse'
import { PerformanceInsights } from '../components/dashboard/PerformanceInsights'
import { AtlasAdvisor } from '../components/dashboard/AtlasAdvisor'
import { RewardShelf } from '../components/dashboard/RewardShelf'
import { CommandDock } from '../components/dashboard/CommandDock'

export default function DashboardPage() {
  const { user } = useAuth()
  const { progress } = useGame()
  const dashboardRef = useRef(null)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'AI Explorer'
  const userRole = user?.user_metadata?.role || 'ML Engineer'

  // Core calculations
  const clearedLevels = progress.clearedLevels?.length || 0
  const currentLevelId = Math.min(LEVELS.length, clearedLevels + 1)
  const currentLevel = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0]
  const streak = progress.bestStreak || 0
  const coins = progress.coins || 0
  const totalBadges = progress.badges?.length || 0
  const totalXP = clearedLevels * 100 + totalBadges * 50 + (progress.totalStars || 0) * 25
  const completionPct = Math.round((clearedLevels / LEVELS.length) * 100)

  useGSAPAnimations(dashboardRef)

  return (
    <div className="cc-dashboard-canvas" ref={dashboardRef}>
      <div className="cc-dashboard-container">

        {/* SECTION 1: Hero Command Center */}
        <AIWelcomeHero
          userName={userName}
          userRole={userRole}
          currentLevel={currentLevel}
          totalXP={totalXP}
          streak={streak}
          coins={coins}
          completionPct={completionPct}
        />

        {/* SECTION 2: Mission Control */}
        <MissionControl currentLevel={currentLevel} />

        {/* SECTION 3: Player Progress */}
        <PlayerProgress
          totalXP={totalXP}
          clearedLevels={clearedLevels}
          totalBadges={totalBadges}
          streak={streak}
          completionPct={completionPct}
        />

        {/* SECTION 4: Interactive Skill Galaxy */}
        <SkillGalaxy />

        {/* SECTION 5: Learning Journey Timeline */}
        <JourneyTimeline />

        {/* SECTION 6: Achievement Vault */}
        <AchievementVault />

        {/* SECTION 7: AI Mastery Universe */}
        <MasteryUniverse />

        {/* SECTION 8: Performance Insights */}
        <PerformanceInsights />

        {/* SECTION 9: ATLAS AI Advisor */}
        <AtlasAdvisor />

        {/* SECTION 10: Reward Shelf */}
        <RewardShelf />

        {/* SECTION 11: Command Dock */}
        <CommandDock />

      </div>
    </div>
  )
}
