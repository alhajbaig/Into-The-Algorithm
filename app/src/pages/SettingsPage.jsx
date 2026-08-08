import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGSAPAnimations } from '../hooks/useGSAPAnimations'
import { Settings, Shield, Bell, Volume2, Key, Trash2, CheckCircle2, Moon } from 'lucide-react'

export default function SettingsPage() {
  const { user, resetPassword } = useAuth()
  const settingsRef = useRef(null)

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [themeTheme, setThemeTheme] = useState('cyber')
  const [resetSuccess, setResetSuccess] = useState(false)

  useGSAPAnimations(settingsRef)

  const handleTriggerReset = async () => {
    if (user?.email) {
      await resetPassword(user.email)
      setResetSuccess(true)
      setTimeout(() => setResetSuccess(false), 3000)
    }
  }

  return (
    <div className="saas-dashboard-canvas" ref={settingsRef}>
      <div className="saas-container-1400">
        <section className="saas-hero-section saas-card" data-gsap="reveal">
          <div className="hero-tag-badge">
            <Settings size={13} className="text-cyan" />
            <span>PLATFORM CONFIGURATION</span>
          </div>
          <h1 className="hero-display-title">
            Account <em>Settings</em>
          </h1>
          <p className="hero-subtitle">
            Configure sound effects, preferences, security credentials, and platform themes.
          </p>
        </section>

        <div className="analytics-grid-layout">
          {/* Preferences Box */}
          <div className="saas-card" data-gsap="reveal">
            <div className="card-head-row">
              <div className="card-head-title">
                <Volume2 size={16} className="text-blue" />
                <span>Audio &amp; Voice Effects</span>
              </div>
            </div>

            <div className="settings-option-row">
              <div>
                <h4>Interactive Cheer Sounds</h4>
                <p className="muted">Play audio sound effects when clearing levels and unlocking badges.</p>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
            </div>
          </div>

          {/* Security Box */}
          <div className="saas-card" data-gsap="reveal">
            <div className="card-head-row">
              <div className="card-head-title">
                <Shield size={16} className="text-purple" />
                <span>Security &amp; Credentials</span>
              </div>
            </div>

            {resetSuccess && (
              <div className="auth-alert success" style={{ marginBottom: '1rem' }}>
                <span>✓ Password reset instructions sent to {user?.email}!</span>
              </div>
            )}

            <div className="settings-option-row">
              <div>
                <h4>Reset Password</h4>
                <p className="muted">Send password recovery link to your registered email.</p>
              </div>
              <button
                type="button"
                className="saas-btn-secondary"
                onClick={handleTriggerReset}
              >
                <Key size={14} />
                <span>Send Reset Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
