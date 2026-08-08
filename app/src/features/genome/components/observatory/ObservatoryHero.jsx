import { motion } from 'framer-motion'
import { Play, Compass, Dna, Activity, Zap, Trophy, ShieldCheck, Sparkles } from 'lucide-react'
import { GenomeCoreSphereCanvas } from './GenomeCoreSphereCanvas'

export function ObservatoryHero({
  clearedCount = 0,
  genomeHealth = 85,
  synapticStability = 92,
  onEnterFacility,
  onExploreTimeline
}) {
  const rankName =
    clearedCount > 30 ? 'Grand Architect' : clearedCount > 15 ? 'Senior Researcher' : 'Neural Initiate'

  return (
    <section className="observatory-hero-section">
      <div className="hero-text-container">
        {/* Facility Pill Tag */}
        <motion.div
          className="hero-facility-tag"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="pulsing-emerald-dot" />
          <Dna size={14} className="text-emerald" />
          <span>DEEPMIND & NASA CLASS AI RESEARCH OBSERVATORY</span>
        </motion.div>

        {/* Cinematic Headline */}
        <motion.h1
          className="hero-headline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          The Living Genome of <br />
          <span className="gradient-alien-glow">Artificial Intelligence</span>
        </motion.h1>

        {/* Subdescription */}
        <motion.p
          className="hero-subdescription"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Explore the evolutionary DNA, mathematical lineage, and living architectural intelligence of every machine learning model ever created.
        </motion.p>

        {/* Telemetry HUD Grid */}
        <motion.div
          className="hero-telemetry-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="telemetry-tile">
            <span className="lbl">AI Species</span>
            <span className="val text-cyan">30+ Cataloged</span>
          </div>

          <div className="telemetry-tile">
            <span className="lbl">Evolution Stage</span>
            <span className="val text-purple">Stage V</span>
          </div>

          <div className="telemetry-tile">
            <span className="lbl">Research Progress</span>
            <span className="val text-emerald">{clearedCount} Milestones</span>
          </div>

          <div className="telemetry-tile">
            <span className="lbl">Knowledge Rank</span>
            <span className="val text-gold">{rankName}</span>
          </div>

          <div className="telemetry-tile">
            <span className="lbl">Genome Health</span>
            <span className="val text-emerald">{genomeHealth}%</span>
          </div>

          <div className="telemetry-tile">
            <span className="lbl">Stability</span>
            <span className="val text-blue">{synapticStability}%</span>
          </div>
        </motion.div>

        {/* Hero CTA Group */}
        <motion.div
          className="hero-cta-group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button type="button" className="cta-btn-primary" onClick={onEnterFacility} data-magnetic>
            <Play size={18} fill="#ffffff" />
            <span>▶ Enter Research Facility</span>
          </button>

          <button type="button" className="cta-btn-secondary" onClick={onExploreTimeline} data-magnetic>
            <Compass size={18} />
            <span>View Evolution Timeline</span>
          </button>
        </motion.div>
      </div>

      {/* 3D Floating Particle Sphere Viewport */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <GenomeCoreSphereCanvas />
      </motion.div>
    </section>
  )
}
