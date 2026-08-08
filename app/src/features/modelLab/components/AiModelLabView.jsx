import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ModelHeroSection } from './ModelHeroSection'
import { DatasetAnalysisSection } from './DatasetAnalysisSection'
import { PreprocessingPipelineSection } from './PreprocessingPipelineSection'
import { InteractiveDecisionTree } from './InteractiveDecisionTree'
import { AiRecommendationSection } from './AiRecommendationSection'
import { LeaderboardCardsSection } from './LeaderboardCardsSection'
import { InteractiveRadarSection } from './InteractiveRadarSection'
import { TradeoffMatrixSection } from './TradeoffMatrixSection'
import { IndustryUseCasesSection } from './IndustryUseCasesSection'
import { WhatIfSimulatorSection } from './WhatIfSimulatorSection'
import { ExplainabilitySection } from './ExplainabilitySection'
import { VisualizationsSection } from './VisualizationsSection'
import { HyperparameterLabSection } from './HyperparameterLabSection'
import { LearningModeModal } from './LearningModeModal'
import { ExportReportSection } from './ExportReportSection'
import { AtlasAiCoach } from './AtlasAiCoach'

import { parseCSV, analyzeDataset, runAutoMlTraining } from '../engine/modelAnalysisEngine'
import { SAMPLE_DATASETS } from '../engine/sampleDatasets'
import { useGSAPAnimations } from '../../../hooks/useGSAPAnimations'
import '../styles/modelLab.css'

export default function AiModelLabView() {
  const containerRef = useRef(null)

  const [selectedSampleId, setSelectedSampleId] = useState(SAMPLE_DATASETS[0].id)
  const [analysis, setAnalysis] = useState(null)
  const [trainingResults, setTrainingResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedLearningModel, setSelectedLearningModel] = useState(null)
  const [whatIfState, setWhatIfState] = useState({ missingPct: 0, noiseLevel: 0 })

  useGSAPAnimations(containerRef)

  // Auto-run analysis on default sample dataset on load
  useEffect(() => {
    loadSampleDataset(SAMPLE_DATASETS[0])
  }, [])

  const loadSampleDataset = (sample) => {
    setSelectedSampleId(sample.id)
    setIsAnalyzing(true)

    setTimeout(() => {
      const parsed = parseCSV(sample.csvContent)
      if (parsed) {
        const ana = analyzeDataset(parsed.headers, parsed.rows, sample.targetColumn)
        setAnalysis(ana)
        const tr = runAutoMlTraining(ana, whatIfState)
        setTrainingResults(tr)
      }
      setIsAnalyzing(false)
    }, 400)
  }

  const handleFileUpload = (file) => {
    if (!file) return
    setIsAnalyzing(true)
    setSelectedSampleId(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const csvStr = e.target.result
      const parsed = parseCSV(csvStr)
      if (parsed) {
        const ana = analyzeDataset(parsed.headers, parsed.rows, null)
        setAnalysis(ana)
        const tr = runAutoMlTraining(ana, whatIfState)
        setTrainingResults(tr)
      } else {
        alert('Invalid CSV file format')
      }
      setIsAnalyzing(false)
    }
    reader.readAsText(file)
  }

  const handleTargetChange = (newTarget) => {
    if (!analysis) return
    setIsAnalyzing(true)
    setTimeout(() => {
      const sample = SAMPLE_DATASETS.find(s => s.id === selectedSampleId)
      const parsed = sample ? parseCSV(sample.csvContent) : null
      if (parsed) {
        const ana = analyzeDataset(parsed.headers, parsed.rows, newTarget)
        setAnalysis(ana)
        const tr = runAutoMlTraining(ana, whatIfState)
        setTrainingResults(tr)
      }
      setIsAnalyzing(false)
    }, 200)
  }

  const handleWhatIfChange = (newOverrides) => {
    setWhatIfState(newOverrides)
    if (analysis) {
      const tr = runAutoMlTraining(analysis, newOverrides)
      setTrainingResults(tr)
    }
  }

  return (
    <div className="ml-canvas" ref={containerRef}>
      <div className="ml-container">
        {/* HERO SECTION & DATASET UPLOAD */}
        <ModelHeroSection
          onFileUpload={handleFileUpload}
          onSelectSample={loadSampleDataset}
          selectedSampleId={selectedSampleId}
          isAnalyzing={isAnalyzing}
        />

        {/* DATASET INTELLIGENCE & AUTOMATED ANALYSIS */}
        {analysis && (
          <DatasetAnalysisSection
            analysis={analysis}
            onTargetChange={handleTargetChange}
          />
        )}

        {/* INTERACTIVE DECISION TREE FLOW DIAGRAM */}
        {analysis && (
          <InteractiveDecisionTree
            path={analysis.decisionPath}
          />
        )}

        {/* AUTOMATED PREPROCESSING PIPELINE */}
        {analysis && (
          <PreprocessingPipelineSection
            steps={analysis.preprocessingSteps}
          />
        )}

        {/* ATLAS AI SCIENTIFIC RECOMMENDATION ENGINE */}
        {trainingResults && analysis && (
          <AiRecommendationSection
            recommendation={trainingResults.recommendation}
            winner={trainingResults.winner}
            analysis={analysis}
          />
        )}

        {/* MODEL EVALUATION LEADERBOARD SHOWCASE (3D GLASS CARDS) */}
        {trainingResults && analysis && (
          <LeaderboardCardsSection
            evaluatedModels={trainingResults.evaluatedModels}
            onSelectLearnMore={(modelName) => setSelectedLearningModel(modelName)}
            problemType={analysis.problemType}
          />
        )}

        {/* MULTI-DIMENSIONAL RADAR COMPARISON */}
        {trainingResults && (
          <InteractiveRadarSection
            evaluatedModels={trainingResults.evaluatedModels}
          />
        )}

        {/* INTERACTIVE TRADEOFF MATRIX MAP */}
        {trainingResults && (
          <TradeoffMatrixSection
            evaluatedModels={trainingResults.evaluatedModels}
          />
        )}

        {/* REAL-WORLD ENTERPRISE ADOPTION */}
        {trainingResults && (
          <IndustryUseCasesSection
            winner={trainingResults.winner}
          />
        )}

        {/* INTERACTIVE "WHAT-IF?" SIMULATOR */}
        {analysis && (
          <WhatIfSimulatorSection
            onWhatIfChange={handleWhatIfChange}
          />
        )}

        {/* INTERACTIVE VISUALIZATIONS */}
        {trainingResults && analysis && (
          <VisualizationsSection
            featureImportances={trainingResults.featureImportances}
            correlations={analysis.correlations}
          />
        )}

        {/* SHAP & LIME EXPLAINABILITY */}
        {trainingResults && (
          <ExplainabilitySection
            winner={trainingResults.winner}
            featureImportances={trainingResults.featureImportances}
          />
        )}

        {/* LIVE HYPERPARAMETER TUNING PLAYGROUND */}
        {trainingResults && (
          <HyperparameterLabSection
            winner={trainingResults.winner}
          />
        )}

        {/* DOWNLOADABLE AUTOML OUTPUTS & CODE EXPORT */}
        {analysis && trainingResults && (
          <ExportReportSection
            analysis={analysis}
            trainingResults={trainingResults}
          />
        )}

        {/* EDUCATIONAL DEEP DIVE MODAL */}
        <LearningModeModal
          modelName={selectedLearningModel}
          onClose={() => setSelectedLearningModel(null)}
        />

        {/* ATLAS AI FLOATING COACH */}
        {analysis && (
          <AtlasAiCoach
            winner={trainingResults?.winner}
            analysis={analysis}
          />
        )}
      </div>
    </div>
  )
}
