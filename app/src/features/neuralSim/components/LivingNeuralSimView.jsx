import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Play, Pause, RotateCcw, StepForward, Activity, Box, TrendingDown, Layers, Target, Sliders } from 'lucide-react'
import { useNeuralSimulator } from '../hooks/useNeuralSimulator'
import { generateDataset } from '../engine/datasetEngine'
import { ACTIVATION_FUNCTIONS } from '../engine/activationFunctions'
import { generateAiExplanations } from '../engine/aiExplanationEngine'
import NeuralNetworkCanvas from './NeuralNetworkCanvas'
import NeuralUniverse3DCanvas from './NeuralUniverse3DCanvas'
import LossLandscape3DView from './LossLandscape3DView'
import DecisionBoundaryCanvas from './DecisionBoundaryCanvas'
import TelemetryHud from './TelemetryHud'
import NeuronInspectorDrawer from './NeuronInspectorDrawer'
import AiExplanationCard from './AiExplanationCard'
import GenomeTelemetryCard from './GenomeTelemetryCard'
import '../styles/neuralSim.css'

/**
 * Living Neural Network Intelligence Laboratory View Component
 * 3D Neural Universe, 2D Learned Decision Boundary Map, 3D Loss Surface, Dataset Generator & Playground Controls.
 */
export default function LivingNeuralSimView() {
  const {
    model,
    telemetry,
    topology,
    setTopology,
    activationKey,
    setActivationKey,
    optimizerKey,
    setOptimizerKey,
    learningRate,
    setLearningRate,
    mode,
    setMode,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
    selectedNeuron,
    setSelectedNeuron,
    stepManual,
    resetModel,
    failureModes,
  } = useNeuralSimulator([4, 8, 4, 1])

  // Playground Dataset Controls
  const [datasetType, setDatasetType] = useState('circle')
  const [noise, setNoise] = useState(0.1)
  const [trainSplit, setTrainSplit] = useState(0.8)

  const dataset = useMemo(
    () => generateDataset(datasetType, 220, noise, trainSplit),
    [datasetType, noise, trainSplit]
  )

  const [activeCanvasTab, setActiveCanvasTab] = useState('3d_universe') // '3d_universe' | 'decision_boundary' | 'loss_landscape' | '2d_graph'

  const currentActObj = ACTIVATION_FUNCTIONS[activationKey] || ACTIVATION_FUNCTIONS.relu

  const explanations = useMemo(
    () => generateAiExplanations(model, selectedNeuron, failureModes),
    [model, selectedNeuron, failureModes]
  )

  const presets = [
    { label: 'Standard (4-8-4-1)', value: [4, 8, 4, 1] },
    { label: 'Deep Multi-Layer (4-12-12-2)', value: [4, 12, 12, 2] },
    { label: 'Wide Bottleneck (8-16-16-4)', value: [8, 16, 16, 4] },
    { label: 'Binary Classifier (2-4-1)', value: [2, 4, 1] },
  ]

  return (
    <div className="neural-sim-page-wrap">
      {/* Hero Sci-Fi Scanner Header */}
      <motion.div
        className="neural-sim-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hero-sim-title">
          <div className="sim-avatar-pulse">
            <Cpu size={26} color="#c084fc" />
          </div>
          <div className="sim-title-text">
            <h1>NEURAL INTELLIGENCE LABORATORY</h1>
            <p>Real-Time Playground Engine • 3D Spatial Galaxy & 2D Learned Decision Boundaries</p>
          </div>
        </div>

        <div className="sim-status-pill">
          <Activity size={15} color="#c084fc" className="icon-pulse" />
          <span>PLAYGROUND ENGINE ACTIVE • 60 FPS</span>
        </div>
      </motion.div>

      {/* Dataset & Hyperparameter Controls Bar */}
      <div className="sim-controls-bar">
        <div className="controls-group">
          <span className="ctrl-label">Dataset Benchmark</span>
          <select
            className="sim-select"
            value={datasetType}
            onChange={(e) => setDatasetType(e.target.value)}
          >
            <option value="circle">Concentric Circles</option>
            <option value="xor">XOR 4-Quadrant</option>
            <option value="spiral">Dual Spirals</option>
            <option value="moons">Interlocking Moons</option>
            <option value="blobs">Gaussian Blobs</option>
          </select>
        </div>

        <div className="controls-group">
          <span className="ctrl-label">Noise Level: {noise}</span>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={noise}
            onChange={(e) => setNoise(parseFloat(e.target.value))}
            style={{ width: '90px' }}
          />
        </div>

        <div className="controls-group">
          <span className="ctrl-label">Preset Architecture</span>
          <select
            className="sim-select"
            value={topology.join('-')}
            onChange={(e) => {
              const matched = presets.find((p) => p.value.join('-') === e.target.value)
              if (matched) setTopology(matched.value)
            }}
          >
            {presets.map((p) => (
              <option key={p.label} value={p.value.join('-')}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="controls-group">
          <span className="ctrl-label">Activation Function</span>
          <select
            className="sim-select"
            value={activationKey}
            onChange={(e) => setActivationKey(e.target.value)}
          >
            <option value="relu">ReLU</option>
            <option value="sigmoid">Sigmoid</option>
            <option value="tanh">Tanh</option>
            <option value="leaky_relu">Leaky ReLU</option>
            <option value="gelu">GELU</option>
          </select>
        </div>

        <div className="controls-group">
          <span className="ctrl-label">Optimizer</span>
          <select
            className="sim-select"
            value={optimizerKey}
            onChange={(e) => setOptimizerKey(e.target.value)}
          >
            <option value="adam">Adam</option>
            <option value="sgd">SGD</option>
            <option value="momentum">Momentum</option>
          </select>
        </div>

        <div className="controls-group">
          <button
            type="button"
            className="action-btn play"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button type="button" className="action-btn" onClick={stepManual}>
            <StepForward size={14} />
            <span>Step</span>
          </button>
          <button type="button" className="action-btn" onClick={resetModel}>
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Mode View Tabs */}
      <div className="controls-group" style={{ gap: '0.5rem' }}>
        <button
          type="button"
          className={`action-btn ${activeCanvasTab === '3d_universe' ? 'play' : ''}`}
          onClick={() => setActiveCanvasTab('3d_universe')}
        >
          <Box size={14} />
          <span>3D Neural Universe</span>
        </button>
        <button
          type="button"
          className={`action-btn ${activeCanvasTab === 'decision_boundary' ? 'play' : ''}`}
          onClick={() => setActiveCanvasTab('decision_boundary')}
        >
          <Target size={14} />
          <span>2D Decision Boundary</span>
        </button>
        <button
          type="button"
          className={`action-btn ${activeCanvasTab === 'loss_landscape' ? 'play' : ''}`}
          onClick={() => setActiveCanvasTab('loss_landscape')}
        >
          <TrendingDown size={14} />
          <span>3D Loss Surface</span>
        </button>
        <button
          type="button"
          className={`action-btn ${activeCanvasTab === '2d_graph' ? 'play' : ''}`}
          onClick={() => setActiveCanvasTab('2d_graph')}
        >
          <Layers size={14} />
          <span>2D Layer Graph</span>
        </button>
      </div>

      {/* Telemetry HUD & Genome */}
      <TelemetryHud
        telemetry={telemetry}
        optimizerKey={optimizerKey}
        learningRate={learningRate}
        activationKey={activationKey}
        failureModes={failureModes}
      />
      <GenomeTelemetryCard topology={topology} loss={telemetry.loss} />

      {/* Interactive Canvas Display */}
      <div style={{ position: 'relative', width: '100%' }}>
        {activeCanvasTab === '3d_universe' && (
          <NeuralUniverse3DCanvas
            model={model}
            onSelectNeuron={setSelectedNeuron}
            selectedNeuron={selectedNeuron}
            mode={mode}
          />
        )}
        {activeCanvasTab === 'decision_boundary' && (
          <DecisionBoundaryCanvas model={model} dataset={dataset} />
        )}
        {activeCanvasTab === 'loss_landscape' && (
          <LossLandscape3DView epoch={telemetry.epoch} optimizerKey={optimizerKey} />
        )}
        {activeCanvasTab === '2d_graph' && (
          <NeuralNetworkCanvas
            model={model}
            onSelectNeuron={setSelectedNeuron}
            selectedNeuron={selectedNeuron}
            mode={mode}
          />
        )}

        <NeuronInspectorDrawer
          neuron={selectedNeuron}
          onClose={() => setSelectedNeuron(null)}
          model={model}
        />
      </div>

      {/* AI Teacher Explanation Card */}
      <AiExplanationCard explanations={explanations} />
    </div>
  )
}
