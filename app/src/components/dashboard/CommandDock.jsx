import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dna, Network, BookOpen, Eye, Trophy, Settings, User, Activity, Bot } from 'lucide-react'

const DOCK_ITEMS = [
  { title: 'Genome', icon: Dna, link: '/genome', color: '#34d399' },
  { title: 'Model Lab', icon: Activity, link: '/model-lab', color: '#06b6d4' },
  { title: 'AI Tutor', icon: Bot, link: '/chat', color: '#a855f7' },
  { title: 'Quest Map', icon: BookOpen, link: '/quest', color: '#3b82f6' },
  { title: 'Visualizer', icon: Eye, link: '/learn/main.html', external: true, color: '#38bdf8' },
  { title: 'Neural Lab', icon: Network, link: '/neural-lab', color: '#c084fc' },
  { title: 'Trophies', icon: Trophy, link: '/quest/badges', color: '#fbbf24' },
  { title: 'Settings', icon: Settings, link: '/settings', color: '#94a3b8' },
  { title: 'Profile', icon: User, link: '/profile', color: '#8b5cf6' },
]

export function CommandDock() {
  return (
    <motion.section
      className="cc-command-dock-section"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      <nav className="cc-dock glass">
        {DOCK_ITEMS.map((item) => {
          const Icon = item.icon
          const content = (
            <motion.div
              className="cc-dock-item"
              style={{ '--dock-c': item.color }}
              whileHover={{ scale: 1.25, y: -8 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <div className="cc-dock-icon-box">
                <Icon size={24} style={{ color: item.color }} />
              </div>
              <span className="cc-dock-label">{item.title}</span>
            </motion.div>
          )

          return item.external ? (
            <a key={item.title} href={item.link} className="cc-dock-link">
              {content}
            </a>
          ) : (
            <Link key={item.title} to={item.link} className="cc-dock-link">
              {content}
            </Link>
          )
        })}
      </nav>
    </motion.section>
  )
}
