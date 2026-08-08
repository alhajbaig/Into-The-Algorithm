import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, FileSpreadsheet, Code, Printer, Share2, Check } from 'lucide-react'
import { exportModelReportPdf, exportMetricsCsv, exportPythonScript } from '../engine/modelAnalysisEngine'

export function ExportReportSection({ analysis, trainingResults }) {
  const [copied, setCopied] = useState(false)

  if (!analysis || !trainingResults) return null

  const winner = trainingResults.winner

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrintPdf = () => {
    window.print()
  }

  return (
    <motion.section
      className="ml-export-section glass"
      style={{ padding: '1.75rem 2rem', borderRadius: '24px', background: 'rgba(10, 15, 30, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(6, 182, 212, 0.25)' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header" style={{ marginBottom: '1rem' }}>
        <Download size={18} className="cc-icon-cyan" />
        <h2 className="ml-section-title">Downloadable AutoML Outputs &amp; Code Export</h2>
      </div>

      <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
        <motion.button
          type="button"
          className="fl-export-btn"
          onClick={() => exportModelReportPdf(analysis, trainingResults)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Printer size={16} color="#a78bfa" />
          <span>Print PDF Analysis Report</span>
        </motion.button>

        <motion.button
          type="button"
          className="fl-export-btn"
          onClick={() => exportMetricsCsv(trainingResults.evaluatedModels)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <FileSpreadsheet size={16} color="#34d399" />
          <span>Export Metrics CSV</span>
        </motion.button>

        <motion.button
          type="button"
          className="fl-export-btn"
          onClick={() => exportPythonScript(analysis, winner)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Code size={16} color="#38bdf8" />
          <span>Export Scikit-Learn Python Script</span>
        </motion.button>

        <motion.button
          type="button"
          className="fl-export-btn"
          onClick={handleShare}
          style={{ marginLeft: 'auto' }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? <Check size={16} color="#34d399" /> : <Share2 size={16} color="#06b6d4" />}
          <span>{copied ? 'Link Copied!' : 'Share Report Link'}</span>
        </motion.button>
      </div>
    </motion.section>
  )
}
