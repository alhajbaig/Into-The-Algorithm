import { motion } from 'framer-motion'
import { Play, Pause, ChevronRight, ChevronLeft, Sparkles, Zap, Compass, CheckCircle2 } from 'lucide-react'
import { EVOLUTION_TRAJECTORIES } from '../engine/evolutionSimulatorEngine'
import { getModelById } from '../engine/genomeEngine'

/**
 * Evolution Simulator View Component — Animated step-by-step story walkthrough
 */
export default function EvolutionSimulatorView({
  activeTrajectoryId,
  setActiveTrajectoryId,
  activeSimulatorStep,
  setActiveSimulatorStep,
  currentTrajectory,
  onSelectModel,
}) {
  const stepData = currentTrajectory.steps[activeSimulatorStep] || currentTrajectory.steps[0]
  const currentModel = getModelById(stepData.modelId)

  const handleNext = () => {
    if (activeSimulatorStep < currentTrajectory.steps.length - 1) {
      setActiveSimulatorStep((s) => s + 1)
    }
  }

  const handlePrev = () => {
    if (activeSimulatorStep > 0) {
      setActiveSimulatorStep((s) => s - 1)
    }
  }

  return (
    <div className="simulator-view-container">
      {/* Hero Header & Lineage Selector */}
      <div className="simulator-hero glass">
        <div className="sim-title-group">
          <h3>
            <Compass className="icon-pulse" size={20} color="#f472b6" />
            <span>EVOLUTIONARY TRAJECTORY SIMULATOR</span>
          </h3>
          <p>{currentTrajectory.description}</p>
        </div>

        <div className="trajectory-selector-pills">
          {EVOLUTION_TRAJECTORIES.map((traj) => (
            <button
              key={traj.id}
              type="button"
              className={`traj-pill ${activeTrajectoryId === traj.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTrajectoryId(traj.id)
                setActiveSimulatorStep(0)
              }}
            >
              {traj.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Stepper Pipeline */}
      <div className="stepper-pipeline glass">
        {currentTrajectory.steps.map((st, idx) => (
          <div
            key={st.step}
            className={`step-node ${activeSimulatorStep === idx ? 'active' : ''} ${activeSimulatorStep > idx ? 'completed' : ''}`}
            onClick={() => setActiveSimulatorStep(idx)}
          >
            <div className="step-number">{st.step}</div>
            <span className="step-title">{st.title.split(':')[0]}</span>
          </div>
        ))}
      </div>

      {/* Active Step Story Card */}
      <motion.div
        key={stepData.step}
        className="simulator-story-card glass"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="story-header-row">
          <div>
            <span className="code-badge">{currentModel.speciesCode}</span>
            <h2>{stepData.title}</h2>
          </div>

          <div className="story-nav-buttons">
            <button
              type="button"
              className="nav-step-btn"
              onClick={handlePrev}
              disabled={activeSimulatorStep === 0}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              type="button"
              className="nav-step-btn primary"
              onClick={handleNext}
              disabled={activeSimulatorStep === currentTrajectory.steps.length - 1}
            >
              Next Step <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="story-body-grid">
          <div className="story-explanation-box glass">
            <h4><Zap size={16} color="#fbbf24" /> WHY DID THIS SPECIES EVOLVE?</h4>
            <p className="explanation-text">{stepData.whyEvolved}</p>

            <div className="key-mutation-tag">
              <span>KEY GENETIC MUTATION:</span>
              <strong className="text-purple">{stepData.keyMutation}</strong>
            </div>
          </div>

          <div className="story-traits-box glass">
            <h4><CheckCircle2 size={16} color="#34d399" /> SPECIES IMPACT & TRAIT DRIFT</h4>
            <p className="mutation-summary">{stepData.mutationSummary}</p>

            <div className="trait-deltas-grid">
              {Object.entries(stepData.traitDelta).map(([trait, delta]) => (
                <div key={trait} className="delta-chip">
                  <span className="label">{trait.toUpperCase()}</span>
                  <span className="val text-green">{delta}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="inspect-model-btn"
              onClick={() => onSelectModel(currentModel.id)}
            >
              Inspect {currentModel.name} Genome →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
