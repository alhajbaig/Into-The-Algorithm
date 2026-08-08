import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import Header from './components/Header'
import LevelMap from './components/LevelMap'
import { RewardToasts } from './components/RewardToasts'
import LevelPlay from './pages/LevelPlay'
import BadgesPage from './pages/BadgesPage'
import Home from './pages/Home'
import NeuralCanvasBackground from './components/landing/NeuralCanvasBackground'
import VideoIntroLoader from './components/VideoIntroLoader'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import './index.css'

import NeuralGenomeView from './features/genome/components/NeuralGenomeView'
import LivingNeuralSimView from './features/neuralSim/components/LivingNeuralSimView'
import AiModelLabView from './features/modelLab'
import NeuralMindView from './features/chat2/components/NeuralMindView'

function Shell() {
  const { pathname } = useLocation()
  const isAuthPage = pathname === '/auth'
  const isQuest = pathname.startsWith('/quest')
  const [showIntro, setShowIntro] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Initialize Lenis smooth scroll and sync with GSAP ScrollTrigger
  useSmoothScroll()

  const [showBackToTop, setShowBackToTop] = useState(false)

  // Track page scroll progress for top glowing bar & Back to Top button
  useEffect(() => {
    if (isAuthPage) return
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(progress)
      setShowBackToTop(scrollTop > 280)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isAuthPage])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isHomePage = pathname === '/'

  if (isAuthPage) {
    return <AuthPage />
  }

  return (
    <div className={`app-shell ${isQuest ? 'quest-mode' : 'hub-mode'}`}>
      {/* Top Scroll Progress Indicator */}
      <div
        className="top-scroll-progress-bar"
        style={{ width: `${Math.min(100, Math.max(0, scrollProgress))}%` }}
      />

      {showIntro && (
        <VideoIntroLoader onComplete={() => setShowIntro(false)} />
      )}
      {/* Neural Particle Canvas on inner pages; Home page uses High-Def Video Background */}
      {!isHomePage && <NeuralCanvasBackground theme="cyber" />}
      <Header />
      <main className={isQuest ? 'quest-main' : 'hub-main'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/genome" element={<NeuralGenomeView />} />
          <Route
            path="/neural-lab"
            element={
              <ProtectedRoute>
                <LivingNeuralSimView />
              </ProtectedRoute>
            }
          />
          <Route path="/model-lab" element={<AiModelLabView />} />
          <Route path="/chat" element={<NeuralMindView />} />
          <Route
            path="/quest"
            element={
              <ProtectedRoute>
                <LevelMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quest/level/:id"
            element={
              <ProtectedRoute>
                <LevelPlay />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quest/badges"
            element={
              <ProtectedRoute>
                <BadgesPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Floating Back to Top Button with Progress Ring */}
      <button
        type="button"
        className={`floating-back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        title="Back to Top"
        aria-label="Back to Top"
      >
        <svg className="progress-ring-svg" width="44" height="44" viewBox="0 0 44 44">
          <circle
            className="progress-ring-circle-bg"
            cx="22"
            cy="22"
            r="18"
            fill="none"
            strokeWidth="3"
          />
          <circle
            className="progress-ring-circle-val"
            cx="22"
            cy="22"
            r="18"
            fill="none"
            strokeWidth="3"
            style={{
              strokeDasharray: 113,
              strokeDashoffset: 113 - (113 * Math.min(100, scrollProgress)) / 100
            }}
          />
        </svg>
        <span className="back-to-top-arrow">↑</span>
      </button>

      {isQuest && <RewardToasts />}
      <footer className="site-foot">
        {isQuest ? (
          <>
            Questions inspired by{' '}
            <a
              href="https://github.com/amitshekhariitbhu/machine-learning-interview-questions"
              target="_blank"
              rel="noreferrer"
            >
              ML Interview Questions
            </a>{' '}
            &amp;{' '}
            <a
              href="https://www.datacamp.com/blog/top-machine-learning-interview-questions"
              target="_blank"
              rel="noreferrer"
            >
              DataCamp
            </a>
          </>
        ) : (
          <>Into the Algorithm · Visualize &amp; practice — all in your browser</>
        )}
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <Shell />
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  )
}
