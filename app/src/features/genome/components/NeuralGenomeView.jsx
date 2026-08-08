import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, Compass, Sparkles, Activity } from 'lucide-react'
import { useNeuralGenome } from '../hooks/useNeuralGenome'
import { useGame } from '../../../context/GameContext'

// Observatory Components
import { ObservatoryHero } from './observatory/ObservatoryHero'
import { ObservatoryChamberNav } from './observatory/ObservatoryChamberNav'
import { DNAResearchChamber } from './observatory/DNAResearchChamber'
import { EvolutionObservatoryUniverse } from './observatory/EvolutionObservatoryUniverse'
import { MutationEngineConsole } from './observatory/MutationEngineConsole'
import { MilestoneTimelineJourney } from './observatory/MilestoneTimelineJourney'
import { SpeciesAtlasGallery } from './observatory/SpeciesAtlasGallery'
import { ComparisonArena } from './observatory/ComparisonArena'
import { ResearchArchiveLibrary } from './observatory/ResearchArchiveLibrary'

// Model Species Catalog View
import ModelGenomeExplorerView from '../explorer/components/ModelGenomeExplorerView'

import '../styles/observatory.css'

/**
 * Unified AI Genome Feature Hub
 * Seamlessly integrates Live Neural Observatory & 30+ Model Species Catalog
 */
export default function NeuralGenomeView() {
  const { progress } = useGame()
  const {
    genomeHealth,
    synapticStability,
    clearedCount,
    chromosomes,
    genes,
  } = useNeuralGenome()

  // Main Mode Switcher: 'observatory' (Personal Live DNA) or 'species' (30+ Canonical Model Species)
  const [viewMode, setViewMode] = useState('observatory')
  const [activeChamber, setActiveChamber] = useState('dna')
  const chamberRef = useRef(null)

  const handleEnterFacility = () => {
    setViewMode('observatory')
    setActiveChamber('dna')
    chamberRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleExploreTimeline = () => {
    setViewMode('observatory')
    setActiveChamber('timeline')
    chamberRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="observatory-page-wrapper">
      {/* Ambient Volumetric Lighting Glow Orbs */}
      <div className="observatory-bg-glows">
        <div className="glow-orb glow-orb-1" />
        <div className="glow-orb glow-orb-2" />
        <div className="glow-orb glow-orb-3" />
      </div>

      {/* TOP DUAL-MODE COMMAND HEADER BANNER */}
      <header className="genome-mode-header-bar">
        <div className="genome-mode-title-group">
          <div className="genome-mode-icon-pulse">
            <Dna size={22} color="#34d399" />
          </div>
          <div>
            <h2>GENOME ENGINE HUB</h2>
            <p>
              {viewMode === 'observatory'
                ? 'Live Neural Progress DNA • Realtime Synaptic Observatory'
                : 'Phylogenetic Species Tree • 30+ Canonical AI Model DNA'}
            </p>
          </div>
        </div>

        <div className="genome-mode-toggle-group">
          <button
            type="button"
            className={`genome-mode-btn ${viewMode === 'observatory' ? 'active' : ''}`}
            onClick={() => setViewMode('observatory')}
          >
            <Compass size={16} />
            <span>Live Observatory</span>
          </button>

          <button
            type="button"
            className={`genome-mode-btn species-mode ${viewMode === 'species' ? 'active' : ''}`}
            onClick={() => setViewMode('species')}
          >
            <Sparkles size={16} />
            <span>30+ Model Catalog</span>
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {viewMode === 'species' ? (
          <motion.div
            key="species-explorer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <ModelGenomeExplorerView />
          </motion.div>
        ) : (
          <motion.div
            key="observatory-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            {/* HERO EXPERIENCE: 100vh Holographic Core & Telemetry */}
            <ObservatoryHero
              clearedCount={clearedCount || progress.clearedLevels?.length || 0}
              genomeHealth={genomeHealth || 85}
              synapticStability={synapticStability || 92}
              onEnterFacility={handleEnterFacility}
              onExploreTimeline={handleExploreTimeline}
            />

            {/* FLOATING CHAMBER NAVIGATION RAIL */}
            <div ref={chamberRef}>
              <ObservatoryChamberNav
                activeChamber={activeChamber}
                onSelectChamber={setActiveChamber}
                onSwitchToSpeciesCatalog={() => setViewMode('species')}
              />
            </div>

            {/* IMMERSIVE RESEARCH CHAMBER WORKSPACES */}
            <main className="observatory-chamber-viewport">
              <AnimatePresence mode="wait">
                {activeChamber === 'dna' && (
                  <motion.div
                    key="dna"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <DNAResearchChamber
                      genes={genes}
                      chromosomes={chromosomes}
                      clearedCount={clearedCount}
                    />
                  </motion.div>
                )}

                {activeChamber === 'observatory' && (
                  <motion.div
                    key="observatory"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <EvolutionObservatoryUniverse />
                  </motion.div>
                )}

                {activeChamber === 'mutation' && (
                  <motion.div
                    key="mutation"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <MutationEngineConsole />
                  </motion.div>
                )}

                {activeChamber === 'timeline' && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <MilestoneTimelineJourney />
                  </motion.div>
                )}

                {activeChamber === 'atlas' && (
                  <motion.div
                    key="atlas"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <SpeciesAtlasGallery />
                  </motion.div>
                )}

                {activeChamber === 'arena' && (
                  <motion.div
                    key="arena"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ComparisonArena />
                  </motion.div>
                )}

                {activeChamber === 'archive' && (
                  <motion.div
                    key="archive"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ResearchArchiveLibrary />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

