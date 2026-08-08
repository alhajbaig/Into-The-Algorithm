import { Link } from 'react-router-dom'
import { BookOpen, Eye, Trophy, Cpu, Dna, Network, ChevronRight } from 'lucide-react'

export function QuickLaunchBar() {
  const launchItems = [
    { title: 'AI Model Genome', desc: 'Species Tree & DNA Matrix', link: '/genome', icon: Dna, color: '#34d399' },
    { title: 'Neural Simulator', desc: '3D Spatial Galaxy Playground', link: '/neural-lab', icon: Network, color: '#c084fc' },
    { title: 'Quest Roadmap', desc: '100 Campaign Levels', link: '/quest', icon: BookOpen, color: '#3b82f6' },
    { title: 'Visualizer Labs', desc: 'Interactive Algorithmic Demos', link: '/learn/main.html', external: true, icon: Eye, color: '#06b6d4' },
    { title: 'Trophy Vault', desc: 'Badges & Mastery Showcase', link: '/quest/badges', icon: Trophy, color: '#fbbf24' },
    { title: 'AI Profile & Stats', desc: 'Identity & Learning Heatmap', link: '/profile', icon: Cpu, color: '#8b5cf6' }
  ]

  return (
    <section className="quick-launch-bar-section" data-gsap="reveal">
      <h3 className="section-title-sm">Quick Platform Command Launch</h3>
      <div className="quick-launch-grid">
        {launchItems.map((item) => {
          const IconComp = item.icon
          const content = (
            <div className="quick-launch-tile glass" data-tilt style={{ '--tile-accent': item.color }}>
              <div className="tile-icon-box" style={{ background: item.color + '18', color: item.color }}>
                <IconComp size={20} />
              </div>
              <div className="tile-meta">
                <span className="tile-title">{item.title}</span>
                <span className="tile-desc">{item.desc}</span>
              </div>
              <ChevronRight size={16} className="tile-arr" />
            </div>
          )

          return item.external ? (
            <a key={item.title} href={item.link} className="quick-launch-link">
              {content}
            </a>
          ) : (
            <Link key={item.title} to={item.link} className="quick-launch-link">
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
