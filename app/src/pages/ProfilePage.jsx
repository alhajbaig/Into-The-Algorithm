import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useGame } from '../context/GameContext'
import { BadgeAnalytics } from '../components/BadgeAnalytics'
import { LEVELS } from '../data/content'
import { BADGES } from '../data/badges'
import { useGSAPAnimations } from '../hooks/useGSAPAnimations'
import {
  User,
  Zap,
  Flame,
  Coins,
  Trophy,
  Award,
  CheckCircle2,
  Settings,
  Mail,
  Layers,
  Save,
  BookOpen,
  Cpu,
  Sparkles
} from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { progress } = useGame()
  const profileRef = useRef(null)

  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'analytics' | 'edit'

  // Editable Profile State
  const [fullName, setFullName] = useState(() => user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'AI Explorer')
  const [role, setRole] = useState(() => user?.user_metadata?.role || 'ML Engineer')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync state if user context reloads
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name)
    }
    if (user?.user_metadata?.role) {
      setRole(user.user_metadata.role)
    }
  }, [user])

  // Calculations
  const clearedLevels = progress.clearedLevels?.length || 0
  const streak = progress.bestStreak || 0
  const coins = progress.coins || 0
  const totalBadges = progress.badges?.length || 0
  const totalXP = clearedLevels * 100 + totalBadges * 50
  const completionPct = Math.round((clearedLevels / LEVELS.length) * 100)

  const unlockedLevelObjects = useMemo(() => {
    return LEVELS.filter((l) => progress.clearedLevels?.includes(l.id))
  }, [progress.clearedLevels])

  useGSAPAnimations(profileRef)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await updateProfile({ full_name: fullName, role })
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="saas-dashboard-canvas" ref={profileRef}>
      <div className="saas-container-1400">

        {/* =========================================================================
            AI IDENTITY HERO BANNER (MATCHES DASHBOARD HERO THEME)
            ========================================================================= */}
        <section className="ai-welcome-hero-card glass" data-gsap="reveal">
          <div className="hero-content-split">
            {/* Left Avatar & Identity Meta */}
            <div className="profile-hero-flex">
              <div className="profile-avatar-large">
                <div className="avatar-circle">
                  <span>{fullName.slice(0, 2).toUpperCase()}</span>
                </div>
                <motion.div
                  className="ai-halo-pulse"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                />
              </div>

              <div className="profile-identity-info">
                <div className="identity-top-line">
                  <span className="rank-tag-chip">{role}</span>
                  <span className="email-lbl"><Mail size={13} /> {user?.email || 'explorer@intothealgorithm.ai'}</span>
                </div>
                <h1 className="profile-name-title">{fullName}</h1>
                <p className="profile-bio">
                  Machine Learning Engineer advancing through 100 campaign levels in Python, Neural Networks, and GenAI.
                </p>

                <div className="profile-stats-chips">
                  <div className="stat-chip">
                    <Zap size={14} color="#c084fc" />
                    <span>+{totalXP.toLocaleString()} XP</span>
                  </div>
                  <div className="stat-chip">
                    <Coins size={14} color="#fbbf24" />
                    <span>{coins} Coins</span>
                  </div>
                  <div className="stat-chip">
                    <Flame size={14} color="#67e8f9" />
                    <span>{streak}d Streak</span>
                  </div>
                  <div className="stat-chip">
                    <Trophy size={14} color="#34d399" />
                    <span>{totalBadges} Badges</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Rank Widget */}
            <div className="hero-assistant-widget glass">
              <div className="assistant-avatar-box">
                <div className="ai-core-emblem">
                  <Cpu size={24} className="text-cyan" />
                </div>
                <div className="assistant-meta">
                  <span className="assistant-name">AI Identity Rank</span>
                  <span className="rank-tag-chip">{role}</span>
                </div>
              </div>

              <div className="completion-bar-wrap">
                <div className="bar-label-row">
                  <span>Roadmap Mastery</span>
                  <strong>{completionPct}%</strong>
                </div>
                <div className="rail">
                  <div className="fill" style={{ width: `${completionPct}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PROFILE TABS NAVIGATION (GLASSMATCHED)
            ========================================================================= */}
        <div className="profile-tabs-bar glass" data-gsap="reveal">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={15} />
            <span>Identity &amp; Overview</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Layers size={15} />
            <span>Activity Analytics</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <Settings size={15} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: OVERVIEW & UNLOCKED ALGORITHMS
            ========================================================================= */}
        {activeTab === 'overview' && (
          <motion.div
            key="tab-overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="profile-tab-content"
          >
            <div className="analytics-grid-layout">
              {/* Unlocked Algorithms Card */}
              <div className="saas-card">
                <div className="card-head-row">
                  <div className="card-head-title">
                    <CheckCircle2 size={16} className="text-green" />
                    <span>Cleared Algorithms</span>
                  </div>
                  <span className="card-badge-muted">{clearedLevels} Cleared</span>
                </div>

                {unlockedLevelObjects.length === 0 ? (
                  <div className="empty-unlocked-state">
                    <BookOpen size={36} className="muted-icon" />
                    <p className="muted">No levels cleared yet. Play Quest to unlock algorithms!</p>
                  </div>
                ) : (
                  <div className="unlocked-levels-grid">
                    {unlockedLevelObjects.map((lvl) => (
                      <div key={lvl.id} className="mini-level-tile glass">
                        <span className="emoji">{lvl.emoji}</span>
                        <div className="details">
                          <span className="num">Level {lvl.id}</span>
                          <span className="title">{lvl.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements Showcase Preview */}
              <div className="saas-card">
                <div className="card-head-row">
                  <div className="card-head-title">
                    <Award size={16} className="text-gold" />
                    <span>Unlocked Trophies</span>
                  </div>
                  <span className="card-badge-muted">{totalBadges} / {BADGES.length}</span>
                </div>

                <div className="profile-badges-preview-grid">
                  {BADGES.filter((b) => progress.badges?.includes(b.id)).map((b) => (
                    <div key={b.id} className="badge-mini-preview glass" title={b.name}>
                      <span className="emoji">{b.icon}</span>
                      <span className="name">{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* =========================================================================
            TAB 2: ANALYTICS & HEATMAP
            ========================================================================= */}
        {activeTab === 'analytics' && (
          <motion.div
            key="tab-analytics"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BadgeAnalytics />
          </motion.div>
        )}

        {/* =========================================================================
            TAB 3: EDIT PROFILE SETTINGS
            ========================================================================= */}
        {activeTab === 'edit' && (
          <motion.div
            key="tab-edit"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="saas-card edit-profile-card"
          >
            <div className="card-head-row">
              <div className="card-head-title">
                <Settings size={16} className="text-cyan" />
                <span>Profile Settings</span>
              </div>
            </div>

            {savedSuccess && (
              <div className="auth-alert success" style={{ marginBottom: '1rem' }}>
                <span>✓ Profile settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="auth-form-stack">
              <div className="input-group-floating">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  id="edit-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <label htmlFor="edit-name">Display Name</label>
              </div>

              <div className="role-selection-group">
                <label className="group-label">Primary AI Role:</label>
                <div className="roles-grid">
                  {['ML Engineer', 'Student', 'Data Scientist', 'AI Researcher'].map((r) => (
                    <div
                      key={r}
                      className={`role-tile glass ${role === r ? 'active' : ''}`}
                      onClick={() => setRole(r)}
                    >
                      <span className="role-title">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="saas-btn-showcase" style={{ width: 'fit-content' }}>
                <Save size={16} />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
