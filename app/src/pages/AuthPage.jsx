import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useGSAPAnimations } from '../hooks/useGSAPAnimations'
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  Key,
  Globe,
  GitBranch,
  Zap,
  BookOpen,
  Cpu,
  Compass,
  ChevronLeft,
  Home,
  Eye,
  EyeOff,
  Activity,
  Check,
  Radio,
  Layers,
  Terminal,
  ShieldCheck,
  Award
} from 'lucide-react'

export default function AuthPage() {
  const { login, signup, loginWithOAuth, loginAsDemoUser, resetPassword, saveOnboarding } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const containerRef = useRef(null)
  const videoRef = useRef(null)

  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot' | 'onboarding'
  const [signupStep, setSignupStep] = useState(1) // 1 | 2 | 3
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isZoomingOut, setIsZoomingOut] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Ensure background video plays muted reliably across browsers
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.defaultMuted = true
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Auth video autoplay lock:', err)
          const unlock = () => {
            if (videoRef.current) {
              videoRef.current.muted = true
              videoRef.current.play().catch(() => {})
            }
            window.removeEventListener('pointerdown', unlock)
            window.removeEventListener('scroll', unlock)
          }
          window.addEventListener('pointerdown', unlock, { once: true })
          window.addEventListener('scroll', unlock, { once: true })
        })
      }
    }
  }, [])

  // Form Fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('ML Engineer')
  const [rememberMe, setRememberMe] = useState(true)

  // Onboarding Options
  const [learningGoal, setLearningGoal] = useState('ML Engineer')
  const [favoriteDomain, setFavoriteDomain] = useState('Neural Networks')

  // Initialize GSAP reveals and magnetic button effects
  useGSAPAnimations(containerRef, [mode, signupStep])

  // Password strength logic
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '#475569' }
    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 10) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 2) return { score, label: 'Standard', color: '#f59e0b' }
    if (score <= 4) return { score, label: 'Strong Encryption', color: '#10b981' }
    return { score, label: 'Quantum Encrypted', color: '#06b6d4' }
  }, [password])

  const handleDemoAccess = () => {
    loginAsDemoUser(email || 'explorer@algorithm.ai', fullName || 'AI Explorer', role || 'ML Engineer')
    triggerCinematicTransition()
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.')
      return
    }

    setLoading(true)
    try {
      await login(email.trim(), password)
      triggerCinematicTransition()
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Invalid email or password. If you don\'t have an account yet, click "Create Account" above to sign up!')
      } else if (msg.includes('Email not confirmed') || err.code === 'email_not_confirmed') {
        setErrorMsg('Email not confirmed yet! Please check your email inbox to verify your account, or click "Instant Demo Access" below to log in immediately.')
      } else {
        setErrorMsg(msg || 'Authentication failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignupFormSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (signupStep === 1) {
      if (!fullName.trim() || !email.trim() || !password) {
        setErrorMsg('Please fill in all required credentials.')
        return
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.')
        return
      }
      setSignupStep(2)
    } else if (signupStep === 2) {
      setSignupStep(3)
    } else if (signupStep === 3) {
      handleCompleteSignup()
    }
  }

  const handleCompleteSignup = async () => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await signup(email.trim(), password, { full_name: fullName.trim(), role })
      if (res?.requiresConfirmation) {
        setSuccessMsg(
          'Account created! Check your email inbox to confirm your account, or use "Instant Demo Access" below to log in right now.'
        )
        setMode('login')
      } else {
        setMode('onboarding')
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.includes('is invalid') || err.code === 'email_address_invalid') {
        setErrorMsg('Supabase rejected this email domain. Please use a valid email format (e.g. name@gmail.com).')
      } else {
        setErrorMsg(msg || 'Sign up failed. Please check your email and password.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider) => {
    setErrorMsg('')
    setLoading(true)
    try {
      await loginWithOAuth(provider)
      triggerCinematicTransition()
    } catch (err) {
      setErrorMsg(
        err.message ||
          `${provider} OAuth is not enabled in your Supabase Auth Settings yet. Please log in with Email & Password!`
      )
      setLoading(false)
    }
  }

  const handleForgotReset = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setErrorMsg('Please enter your registered account email.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      await resetPassword(email.trim())
      setSuccessMsg('Password recovery instructions sent to your email.')
    } catch (err) {
      setErrorMsg(err.message || 'Could not send reset password email.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinishOnboarding = () => {
    saveOnboarding({ learningGoal, favoriteDomain })
    triggerCinematicTransition()
  }

  const triggerCinematicTransition = () => {
    setIsZoomingOut(true)
    setTimeout(() => {
      navigate(from, { replace: true })
    }, 1200)
  }

  return (
    <div className={`cinematic-auth-container ${isZoomingOut ? 'zooming-into-core' : ''}`} ref={containerRef}>
      {/* 🎥 HIGH-DEFINITION HERO BACKGROUND VIDEO STREAM */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="auth-bg-video-element"
      >
        <source src="/auth-bg-video.mp4" type="video/mp4" />
      </video>

      {/* ULTRA-CLEAN CINEMATIC VIGNETTE OVERLAY */}
      <div className="auth-video-overlay-shield" />

      {/* LEFT PANEL (60%): BRAND & IMMERSIVE REAL-TIME STATS */}
      <div className="auth-left-portal">
        <div className="left-portal-overlay">
          {/* Top Brand Header & Live Stream Status */}
          <div className="portal-header-row" data-gsap="reveal">
            <div className="portal-brand-logo">
              <span className="brand-gem">◆</span>
              <span className="brand-title">Into the <em>Algorithm</em></span>
            </div>
            <div className="live-matrix-badge">
              <Radio size={12} className="pulse-green-icon" />
              <span>LIVE NETWORK PIPELINE 2.4 TB/S</span>
            </div>
          </div>

          {/* Hero Text Box */}
          <motion.div
            className="portal-hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="portal-tag luxury-tag">
              <Sparkles size={13} className="text-gold spin-glow" />
              <span>ENTERPRISE AI PLATFORM</span>
            </div>

            <motion.h2
              className="luxury-hero-heading"
              initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Master Machine Learning From{' '}
              <span className="cyan-gradient-text">First Principles</span>
            </motion.h2>

            <motion.p
              className="luxury-hero-sub"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              Step into an interactive 3D learning matrix—where gradient descent, neural transformers, and real-time network streams come to life.
            </motion.p>

            {/* Live Terminal Status Line */}
            <motion.div
              className="hero-live-terminal-pill glass-pill"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Terminal size={13} className="text-cyan" />
              <span className="terminal-prompt">&gt; SYSTEM:</span>
              <span className="terminal-msg">Neural Pipeline Active · 99.98% Model Accuracy</span>
            </motion.div>
          </motion.div>

          {/* Bottom Live Metrics Bar */}
          <div className="portal-footer-specs" data-gsap="stagger">
            <div className="spec-chip glass-pill">
              <Cpu size={14} className="chip-icon-cyan" />
              <span>100 Interactive ML Quests</span>
            </div>
            <div className="spec-chip glass-pill">
              <Zap size={14} className="chip-icon-amber" />
              <span>Real-Time Model Visualizers</span>
            </div>
            <div className="spec-chip glass-pill">
              <ShieldCheck size={14} className="chip-icon-emerald" />
              <span>256-Bit Encrypted Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (40%): ULTRA-PREMIUM GLASS CARD */}
      <div className="auth-right-panel">
        <motion.div
          className="glass-auth-card luxury-card"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header Navigation & Main Return Link */}
          <div className="auth-card-header">
            <div className="header-top-nav-row">
              <div className="header-logo-row">
                <span className="mini-gem">◆</span>
                <span className="mini-brand">INTO THE ALGORITHM</span>
              </div>
              <Link to="/" className="auth-back-home-link" title="Return to Main Page">
                <Home size={13} />
                <span>Main Page</span>
              </Link>
            </div>

            {/* Mode Switcher Tabs for Login vs Signup */}
            {mode !== 'forgot' && mode !== 'onboarding' && (
              <div className="auth-mode-tab-bar">
                <button
                  type="button"
                  className={`mode-tab-btn ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => {
                    setErrorMsg('')
                    setSuccessMsg('')
                    setMode('login')
                  }}
                >
                  <Lock size={13} />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  className={`mode-tab-btn ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => {
                    setErrorMsg('')
                    setSuccessMsg('')
                    setSignupStep(1)
                    setMode('signup')
                  }}
                >
                  <User size={13} />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            <h2 className="header-title">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create AI Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'onboarding' && 'Personalize Roadmap'}
            </h2>

            <p className="header-sub">
              {mode === 'login' && 'Log in to sync your progress & unlock 100 ML levels.'}
              {mode === 'signup' && `Step ${signupStep} of 3 — Setup your research credentials.`}
              {mode === 'forgot' && 'Enter your email to receive password recovery instructions.'}
              {mode === 'onboarding' && 'Tailor your learning path to your career goals.'}
            </p>
          </div>

          {/* Error / Success Notifications */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                className="auth-alert error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span>⚠️ {errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                className="auth-alert success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span>✓ {successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =========================================================================
              MODE 1: LOGIN FORM
              ========================================================================= */}
          {mode === 'login' && (
            <motion.form
              key="login-form"
              onSubmit={handleLoginSubmit}
              className="auth-form-stack"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
            >
              {/* Email Field */}
              <div className="input-field-block">
                <label htmlFor="email" className="input-field-label">
                  Email Address
                </label>
                <div className="input-field-wrap">
                  <Mail size={16} className="input-field-icon" />
                  <input
                    type="email"
                    id="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="input-field-block">
                <label htmlFor="password" className="input-field-label">
                  Password
                </label>
                <div className="input-field-wrap">
                  <Lock size={16} className="input-field-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="form-options-row">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
                <button
                  type="button"
                  className="link-forgot"
                  onClick={() => {
                    setErrorMsg('')
                    setSuccessMsg('')
                    setMode('forgot')
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                className={`btn-auth-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner-dots" />
                ) : (
                  <>
                    <span>Launch AI Portal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Instant Demo Access Button */}
              <button
                type="button"
                className="btn-auth-demo glass-pill"
                onClick={handleDemoAccess}
                style={{
                  marginTop: '0.6rem',
                  width: '100%',
                  padding: '0.7rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '12px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Sparkles size={15} />
                <span>Instant Demo Access (Bypass Login)</span>
              </button>

              {/* Social Login Buttons */}
              <div className="social-divider">
                <span>OR SIGN IN WITH PROVIDER</span>
              </div>

              <div className="social-buttons-grid">
                <button
                  type="button"
                  className="social-btn glass"
                  onClick={() => handleOAuthLogin('google')}
                >
                  <Globe size={16} className="text-cyan" />
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className="social-btn glass"
                  onClick={() => handleOAuthLogin('github')}
                >
                  <GitBranch size={16} />
                  <span>GitHub</span>
                </button>
              </div>

              {/* Switch to Signup Footer */}
              <div className="mode-switch-footer">
                <span>Don&apos;t have an account yet?</span>
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => {
                    setErrorMsg('')
                    setSuccessMsg('')
                    setSignupStep(1)
                    setMode('signup')
                  }}
                >
                  Create Account →
                </button>
              </div>
            </motion.form>
          )}

          {/* =========================================================================
              MODE 2: SIGNUP WIZARD (3 STEPS)
              ========================================================================= */}
          {mode === 'signup' && (
            <motion.div
              key="signup-wizard"
              className="signup-wizard-container"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
            >
              {/* Step Progress Indicator Bar */}
              <div className="wizard-progress-bar">
                <div className="progress-steps-row">
                  {[
                    { step: 1, label: 'Identity' },
                    { step: 2, label: 'Role' },
                    { step: 3, label: 'Confirm' }
                  ].map(({ step, label }) => (
                    <div
                      key={step}
                      className={`step-dot-wrap ${signupStep >= step ? 'active' : ''} ${
                        signupStep === step ? 'current' : ''
                      }`}
                    >
                      <div className="step-dot">
                        {signupStep > step ? <Check size={12} /> : step}
                      </div>
                      <span className="step-label">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="progress-rail">
                  <div
                    className="progress-fill"
                    style={{ width: `${((signupStep - 1) / 2) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSignupFormSubmit} className="auth-form-stack">
                {signupStep === 1 && (
                  <>
                    <div className="input-field-block">
                      <label htmlFor="fullName" className="input-field-label">
                        Full Name
                      </label>
                      <div className="input-field-wrap">
                        <User size={16} className="input-field-icon" />
                        <input
                          type="text"
                          id="fullName"
                          placeholder="Alex Mercer"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-field-block">
                      <label htmlFor="signup-email" className="input-field-label">
                        Work or Personal Email
                      </label>
                      <div className="input-field-wrap">
                        <Mail size={16} className="input-field-icon" />
                        <input
                          type="email"
                          id="signup-email"
                          placeholder="alex@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-field-block">
                      <label htmlFor="signup-password" className="input-field-label">
                        Password (min 6 chars)
                      </label>
                      <div className="input-field-wrap">
                        <Lock size={16} className="input-field-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="signup-password"
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Password Security Meter */}
                    {password && (
                      <div className="password-strength-widget">
                        <div className="strength-bar-bg">
                          <div
                            className="strength-bar-fill"
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                              backgroundColor: passwordStrength.color
                            }}
                          />
                        </div>
                        <div className="strength-text-row">
                          <span>Security Grade:</span>
                          <span style={{ color: passwordStrength.color, fontWeight: 700 }}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}

                    <button type="submit" className="btn-auth-primary">
                      <span>Continue to Role Setup</span>
                      <ArrowRight size={16} />
                    </button>
                  </>
                )}

                {signupStep === 2 && (
                  <>
                    <div className="role-selection-group">
                      <label className="group-label">Choose Your Primary Track:</label>
                      <div className="roles-grid">
                        {[
                          { id: 'ML Engineer', title: 'ML Engineer', desc: 'Models & Systems', icon: Cpu },
                          { id: 'Student', title: 'Student / Learner', desc: 'Fundamentals & Quizzes', icon: BookOpen },
                          { id: 'Data Scientist', title: 'Data Scientist', desc: 'Analytics & Features', icon: Terminal },
                          { id: 'Researcher', title: 'AI Researcher', desc: 'Architectures & Deep Learning', icon: Layers }
                        ].map((r) => {
                          const IconComp = r.icon
                          const isSelected = role === r.id
                          return (
                            <div
                              key={r.id}
                              className={`role-tile glass ${isSelected ? 'active' : ''}`}
                              onClick={() => setRole(r.id)}
                            >
                              <div className="role-tile-top">
                                <IconComp size={18} className={isSelected ? 'text-cyan' : 'muted-icon'} />
                                {isSelected && <CheckCircle2 size={14} className="text-emerald" />}
                              </div>
                              <span className="role-title">{r.title}</span>
                              <span className="role-desc">{r.desc}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="wizard-actions-row">
                      <button
                        type="button"
                        className="btn-auth-secondary"
                        onClick={() => setSignupStep(1)}
                      >
                        <ChevronLeft size={16} /> Back
                      </button>
                      <button type="submit" className="btn-auth-primary">
                        <span>Review Account</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}

                {signupStep === 3 && (
                  <div className="signup-confirm-summary">
                    <div className="summary-box glass luxury-summary">
                      <div className="summary-item">
                        <span>Full Name:</span> <strong>{fullName}</strong>
                      </div>
                      <div className="summary-item">
                        <span>Account Email:</span> <strong>{email}</strong>
                      </div>
                      <div className="summary-item">
                        <span>Specialization Track:</span> <strong className="text-cyan">{role}</strong>
                      </div>
                      <div className="summary-item">
                        <span>Security Level:</span> <strong className="text-emerald">256-bit Encrypted</strong>
                      </div>
                    </div>

                    <div className="wizard-actions-row">
                      <button
                        type="button"
                        className="btn-auth-secondary"
                        onClick={() => setSignupStep(2)}
                      >
                        <ChevronLeft size={16} /> Back
                      </button>
                      <button
                        type="submit"
                        className={`btn-auth-primary ${loading ? 'loading' : ''}`}
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="spinner-dots" />
                        ) : (
                          <>
                            <span>Create AI Profile</span>
                            <CheckCircle2 size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <div className="mode-switch-footer">
                <span>Already have an account?</span>
                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => {
                    setErrorMsg('')
                    setSuccessMsg('')
                    setMode('login')
                  }}
                >
                  Log In →
                </button>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              MODE 3: FORGOT PASSWORD
              ========================================================================= */}
          {mode === 'forgot' && (
            <motion.form
              key="forgot-form"
              onSubmit={handleForgotReset}
              className="auth-form-stack"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <div className="input-field-block">
                <label htmlFor="reset-email" className="input-field-label">
                  Registered Account Email
                </label>
                <div className="input-field-wrap">
                  <Mail size={16} className="input-field-icon" />
                  <input
                    type="email"
                    id="reset-email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`btn-auth-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? <div className="spinner-dots" /> : <span>Send Recovery Link</span>}
              </button>

              <button
                type="button"
                className="btn-auth-secondary"
                onClick={() => setMode('login')}
              >
                <ChevronLeft size={16} /> Return to Log In
              </button>
            </motion.form>
          )}

          {/* =========================================================================
              MODE 4: POST-SIGNUP INTERACTIVE ONBOARDING
              ========================================================================= */}
          {mode === 'onboarding' && (
            <motion.div
              key="onboarding-flow"
              className="onboarding-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="onboarding-step-box">
                <span className="onboarding-lbl">CAREER TRACK</span>
                <div className="onboarding-grid">
                  {['ML Engineer', 'Data Scientist', 'AI Researcher', 'Student'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`onboard-tile glass ${learningGoal === g ? 'active' : ''}`}
                      onClick={() => setLearningGoal(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="onboarding-step-box">
                <span className="onboarding-lbl">PRIMARY DOMAIN</span>
                <div className="onboarding-grid">
                  {['Neural Networks', 'LLMs & GenAI', 'Computer Vision', 'Classical ML'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`onboard-tile glass ${favoriteDomain === d ? 'active' : ''}`}
                      onClick={() => setFavoriteDomain(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn-auth-primary"
                onClick={handleFinishOnboarding}
              >
                <span>Enter Personalized Portal</span>
                <Sparkles size={16} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
