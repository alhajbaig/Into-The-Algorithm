import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, Network, Sliders, Compass, Layers, Calendar, Sparkles, Search, Activity, Bot } from 'lucide-react'
import { useModelGenome } from '../hooks/useModelGenome'
import { useGame } from '../../app/src/context/GameContext'
import EvolutionaryTreeCanvas from './EvolutionaryTreeCanvas'
import GeneticTraitsRadar from './GeneticTraitsRadar'
import ModelGenomeInspectorModal from './ModelGenomeInspectorModal'
import ModelMutationLabView from './ModelMutationLabView'
import EvolutionSimulatorView from './EvolutionSimulatorView'
import GenomeComparisonMatrix from './GenomeComparisonMatrix'
import ModelTimelineView from './ModelTimelineView'
import EcosystemNavigator from './EcosystemNavigator'
import AiGenomeTeacherCard from './AiGenomeTeacherCard'
import IntegrationBadgeCard from './IntegrationBadgeCard'
import '../styles/modelGenome.css'

/**
 * Model Genome Explorer — Main Sci-Fi Feature Container View
 */
export default function ModelGenomeExplorerView() {
  const { progress } = useGame()
  const {
    activeTab,
    setActiveTab,
    selectedModel,
    setSelectedModelId,
    searchQuery,
    setSearchQuery,
    selectedFamily,
    setSelectedFamily,
    selectedEcosystem,
    setSelectedEcosystem,
    filteredModelsList,
    families,
    ecosystems,
    mutationParams,
    setMutationParams,
    mutationResult,
    comparisonIds,
    toggleComparisonModel,
    comparisonResult,
    timelineData,
    aiQnA,
    synergy,
    activeTrajectoryId,
    setActiveTrajectoryId,
    activeSimulatorStep,
    setActiveSimulatorStep,
    currentTrajectory,
  } = useModelGenome(progress.clearedLevels || [])

  const [inspectorOpen, setInspectorOpen] = useState(false)

  const handleSelectModel = (id) => {
    setSelectedModelId(id)
    setInspectorOpen(true)
  }

  return (
    <div className="model-genome-page-wrap">
      {/* Sci-Fi Hero Header */}
      <motion.div
        className="model-genome-hero glass"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-title-block">
          <div className="dna-avatar-pulse">
            <Dna size={28} color="#34d399" />
          </div>
          <div className="title-text-group">
            <h1>MODEL GENOME EXPLORER</h1>
            <p>The Evolutionary Phylogenetic Tree &amp; Genetic DNA Matrix of Machine Intelligence</p>
          </div>
        </div>

        <div className="genome-status-pill glass">
          <Activity size={15} color="#34d399" className="icon-pulse" />
          <span>GENOME ENGINE ACTIVE • 30+ SPECIES CATALOGED</span>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="genome-tabs-nav glass">
        {[
          { id: 'tree', label: 'Evolutionary Tree', icon: Network },
          { id: 'mutation', label: 'Mutation Lab', icon: Sliders },
          { id: 'simulator', label: 'Evolution Simulator', icon: Compass },
          { id: 'comparison', label: 'Species Comparison', icon: Layers },
          { id: 'timeline', label: 'Chronological Timeline', icon: Calendar },
          { id: 'ecosystem', label: 'Ecosystem Navigator', icon: Sparkles },
        ].map((tab) => {
          const IconComponent = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              className={`genome-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Views Display */}
      <AnimatePresence mode="wait">
        {activeTab === 'tree' && (
          <motion.div
            key="tree"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="genome-tab-content"
          >
            {/* Interactive Evolutionary Tree Canvas */}
            <EvolutionaryTreeCanvas
              onSelectModel={handleSelectModel}
              selectedModelId={selectedModel.id}
            />

            {/* Selected Species Preview & Traits */}
            <div className="tree-bottom-grid mt-4">
              <GeneticTraitsRadar model={selectedModel} />
              <AiGenomeTeacherCard model={selectedModel} aiQnA={aiQnA} />
            </div>

            {/* Quest & AI Twin Integration */}
            <div className="mt-4">
              <IntegrationBadgeCard synergy={synergy} onSelectModel={handleSelectModel} />
            </div>
          </motion.div>
        )}

        {activeTab === 'mutation' && (
          <motion.div
            key="mutation"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="genome-tab-content"
          >
            <ModelMutationLabView
              model={selectedModel}
              mutationParams={mutationParams}
              setMutationParams={setMutationParams}
              mutationResult={mutationResult}
            />
          </motion.div>
        )}

        {activeTab === 'simulator' && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="genome-tab-content"
          >
            <EvolutionSimulatorView
              activeTrajectoryId={activeTrajectoryId}
              setActiveTrajectoryId={setActiveTrajectoryId}
              activeSimulatorStep={activeSimulatorStep}
              setActiveSimulatorStep={setActiveSimulatorStep}
              currentTrajectory={currentTrajectory}
              onSelectModel={handleSelectModel}
            />
          </motion.div>
        )}

        {activeTab === 'comparison' && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="genome-tab-content"
          >
            <GenomeComparisonMatrix
              comparisonResult={comparisonResult}
              comparisonIds={comparisonIds}
              toggleComparisonModel={toggleComparisonModel}
              onSelectModel={handleSelectModel}
            />
          </motion.div>
        )}

        {activeTab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="genome-tab-content"
          >
            <ModelTimelineView
              timelineData={timelineData}
              onSelectModel={handleSelectModel}
            />
          </motion.div>
        )}

        {activeTab === 'ecosystem' && (
          <motion.div
            key="ecosystem"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="genome-tab-content"
          >
            <EcosystemNavigator
              ecosystems={ecosystems}
              selectedEcosystem={selectedEcosystem}
              setSelectedEcosystem={setSelectedEcosystem}
              filteredModelsList={filteredModelsList}
              onSelectModel={handleSelectModel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Inspector Drawer */}
      {inspectorOpen && (
        <ModelGenomeInspectorModal
          model={selectedModel}
          onClose={() => setInspectorOpen(false)}
        />
      )}
    </div>
  )
}
