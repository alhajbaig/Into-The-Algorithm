import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { Cpu, Upload, Sparkles, FileSpreadsheet, Check, Database, Zap } from 'lucide-react'
import { SAMPLE_DATASETS } from '../engine/sampleDatasets'

export function ModelHeroSection({
  onFileUpload,
  onSelectSample,
  selectedSampleId,
  isAnalyzing
}) {
  const fileInputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0])
    }
  }

  return (
    <motion.section
      className="ml-hero-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="ml-hero-grid">
        {/* Left Content */}
        <div>
          <div className="ml-hero-pill">
            <Sparkles size={13} />
            <span>AUTOMATED MACHINE LEARNING &amp; INTELLIGENCE</span>
          </div>

          <h1 className="ml-hero-title">
            AI Model <em className="cc-gradient-name">Intelligence Lab</em>
          </h1>

          <p className="ml-hero-desc">
            Upload any machine learning dataset and let ATLAS AI analyze every aspect of the data,
            train multiple algorithms, compare their performance, and recommend the optimal model with complete scientific reasoning.
          </p>

          {/* Quick Preset Datasets Bar */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>
              ⚡ Instant Sample ML Datasets
            </span>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {SAMPLE_DATASETS.map((ds) => {
                const isSelected = selectedSampleId === ds.id
                return (
                  <motion.button
                    key={ds.id}
                    type="button"
                    className={`fl-export-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => onSelectSample(ds)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileSpreadsheet size={15} color={isSelected ? '#38bdf8' : '#94a3b8'} />
                    <span>{ds.title.split(' (')[0]}</span>
                    {isSelected && <Check size={14} color="#38bdf8" />}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Dropzone Area */}
        <div>
          <motion.div
            className="ml-dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="ml-drop-icon">
              <Upload size={28} />
            </div>

            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
              {isAnalyzing ? 'Analyzing CSV Dataset...' : 'Upload CSV Dataset'}
            </p>

            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Drag &amp; drop file here or click to browse (.csv only)
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
