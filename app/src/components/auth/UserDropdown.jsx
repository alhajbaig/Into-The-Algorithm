import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import {
  User,
  LayoutDashboard,
  Award,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Zap,
  Coins,
  ShieldCheck,
  Dna,
  Cpu
} from 'lucide-react'

export default function UserDropdown() {
  const { user, logout } = useAuth()
  const { progress } = useGame()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'AI Explorer'
  const userEmail = user?.email || 'explorer@intothealgorithm.ai'
  const userRole = user?.user_metadata?.role || 'ML Engineer'

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsOpen(false)
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="user-dropdown-wrapper" ref={dropdownRef}>
      {/* Trigger Button: Avatar & Name */}
      <button
        type="button"
        className={`dropdown-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        data-magnetic
      >
        <div className="user-avatar-frame">
          <span className="avatar-initials">{userName.slice(0, 2).toUpperCase()}</span>
          <span className="online-indicator-dot" />
        </div>
        <div className="trigger-user-meta">
          <span className="meta-name">{userName}</span>
          <span className="meta-role">{userRole}</span>
        </div>
        <ChevronDown size={14} className={`trigger-arrow ${isOpen ? 'open' : ''}`} />
      </button>

      {/* Glassmorphism Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-dropdown-menu"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header info */}
            <div className="dropdown-head-box">
              <div className="head-name-row">
                <strong>{userName}</strong>
                <span className="role-tag-badge">{userRole}</span>
              </div>
              <span className="head-email-text">{userEmail}</span>

              <div className="head-stats-bar">
                <span title="Coins Balance">
                  <Coins size={13} color="#fbbf24" /> {progress.coins || 0}
                </span>
                <span title="Streak Days">
                  <Zap size={13} color="#c084fc" /> {progress.streak || 0}d
                </span>
                <span title="Badges Count">
                  <Award size={13} color="#34d399" /> {progress.badges?.length || 0}
                </span>
              </div>
            </div>

            {/* Menu Options */}
            <div className="dropdown-links-list">
              <Link
                to="/dashboard"
                className="dropdown-link-item"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={16} className="text-blue" />
                <span>User Dashboard</span>
              </Link>

              <Link
                to="/genome"
                className="dropdown-link-item"
                onClick={() => setIsOpen(false)}
              >
                <Dna size={16} className="text-emerald" />
                <span>AI Model Genome Matrix</span>
              </Link>

              <Link
                to="/neural-lab"
                className="dropdown-link-item"
                onClick={() => setIsOpen(false)}
              >
                <Cpu size={16} className="text-purple" />
                <span>Neural Simulator Lab</span>
              </Link>

              <Link
                to="/profile"
                className="dropdown-link-item"
                onClick={() => setIsOpen(false)}
              >
                <User size={16} className="text-purple" />
                <span>AI Profile &amp; Stats</span>
              </Link>

              <Link
                to="/quest/badges"
                className="dropdown-link-item"
                onClick={() => setIsOpen(false)}
              >
                <Award size={16} className="text-gold" />
                <span>Achievements &amp; Badges</span>
              </Link>

              <Link
                to="/settings"
                className="dropdown-link-item"
                onClick={() => setIsOpen(false)}
              >
                <Settings size={16} className="text-cyan" />
                <span>Account Settings</span>
              </Link>
            </div>

            {/* Logout Action */}
            <div className="dropdown-footer-box">
              <button type="button" className="logout-btn-item" onClick={handleLogout}>
                <LogOut size={15} />
                <span>Secure Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
