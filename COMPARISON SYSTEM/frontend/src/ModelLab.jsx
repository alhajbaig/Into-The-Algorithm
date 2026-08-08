import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, Cell
} from 'recharts';
import { 
  Upload, Activity, ChevronDown, CheckCircle, Database, BarChart2, 
  Cpu, GitBranch, Share2, Layers, AlertTriangle, Zap, Check, Search, TrendingUp, SearchCode,
  Target, Brain, Sparkles, ArrowRight, Eye
} from 'lucide-react';
import { algorithmData } from './algorithmData';
import './modelLab.css';

const TABS = [
  { id: 'analyze', label: '1. Upload & Analyze', icon: Database },
  { id: 'train', label: '2. Train & Compare', icon: Activity },
  { id: 'recommend', label: '3. AI Recommendation', icon: Cpu },
  { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
  { id: 'learn', label: 'Learn', icon: SearchCode }
];

function Sliders(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="21" y2="21" />
      <line x1="4" x2="20" y1="14" y2="14" />
      <line x1="4" x2="20" y1="7" y2="7" />
      <polyline points="9 21 9 19 15 19 15 21" />
      <polyline points="14 14 14 12 18 12 18 14" />
      <polyline points="8 7 8 5 12 5 12 7" />
    </svg>
  );
}

const CHART_COLORS = ['#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#f87171', '#818cf8'];

export default function ModelLab() {
  const [activeTab, setActiveTab] = useState('analyze');
  const [file, setFile] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [headers, setHeaders] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeResults, setAnalyzeResults] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainResults, setTrainResults] = useState(null);
  const [autoFlowStep, setAutoFlowStep] = useState('idle'); // idle | analyzing | training | done
  
  // Simulator State
  const [simState, setSimState] = useState({
    datasetSize: 1000,
    missingValues: 0,
    classImbalance: 1,
    features: 10,
    categorical: 0,
    interpretability: false,
    speed: false,
    nonlinear: true,
    problemType: 'classification'
  });

  const fileInputRef = useRef(null);

  const parseCSVHeaders = (selectedFile) => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r\n|\n/);
      if (lines.length > 0 && lines[0].trim()) {
        const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const cleanHeaders = rawHeaders.filter(h => h.length > 0);
        if (cleanHeaders.length > 0) {
          setHeaders(cleanHeaders);
          // Don't auto-set target — let the backend's smart detection handle it
          setTargetColumn('');
        }
      }
    };
    reader.readAsText(selectedFile.slice(0, 8192));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setAnalyzeResults(null);
      setTrainResults(null);
      parseCSVHeaders(selected);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      setFile(dropped);
      setAnalyzeResults(null);
      setTrainResults(null);
      parseCSVHeaders(dropped);
    }
  };

  const runAnalyze = useCallback(async (selectedFile, target) => {
    setIsAnalyzing(true);
    setAutoFlowStep('analyzing');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (target) formData.append('target_column', target);
      
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to analyze dataset');
        setIsAnalyzing(false);
        setAutoFlowStep('idle');
        return null;
      }
      
      if (data.column_names && data.column_names.length > 0) {
        setHeaders(data.column_names);
      }
      
      // Use the target the backend detected
      if (data.target_column) {
        setTargetColumn(data.target_column);
      }

      const results = {
        rows: data.rows,
        columns: data.columns,
        missingValues: data.total_missing,
        duplicates: data.duplicate_rows,
        problemType: data.problem_type === 'classification' ? 'Classification' : 'Regression',
        problemTypeRaw: data.problem_type,
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        aiSummary: data.ai_summary,
        domain: data.domain,
        outliers: Object.values(data.outlier_counts || {}).reduce((a, b) => a + b, 0),
        numericalFeatures: data.numerical_features || [],
        categoricalFeatures: data.categorical_features || [],
        targetColumn: data.target_column,
        classDistribution: data.class_distribution,
        preview: data.preview || []
      };
      
      setAnalyzeResults(results);
      setIsAnalyzing(false);
      return results;
    } catch (e) {
      console.error(e);
      alert('Error connecting to ML backend: ' + e.message);
      setIsAnalyzing(false);
      setAutoFlowStep('idle');
      return null;
    }
  }, []);

  const runTrain = useCallback(async (selectedFile, target) => {
    setIsTraining(true);
    setAutoFlowStep('training');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (target) formData.append('target_column', target);

      const res = await fetch('http://localhost:5000/api/train', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to train models');
        setIsTraining(false);
        setAutoFlowStep('idle');
        return;
      }

      const models = (data.results || []).map(r => ({
        name: r.model_name,
        accuracy: r.metrics.accuracy !== undefined ? r.metrics.accuracy : null,
        precision: r.metrics.precision !== undefined ? r.metrics.precision : null,
        recall: r.metrics.recall !== undefined ? r.metrics.recall : null,
        f1: r.metrics.f1 !== undefined ? r.metrics.f1 : null,
        roc_auc: r.metrics.roc_auc !== undefined ? r.metrics.roc_auc : null,
        mae: r.metrics.mae !== undefined ? r.metrics.mae : null,
        rmse: r.metrics.rmse !== undefined ? r.metrics.rmse : null,
        r2: r.metrics.r2 !== undefined ? r.metrics.r2 : null,
        trainTime: r.train_time || 0,
        predTime: r.predict_time || 0,
        isBest: r.is_best || false
      }));

      // Feature importance is already an array of {name, value}
      const featureImportance = Array.isArray(data.feature_importance) 
        ? data.feature_importance 
        : [];

      setTrainResults({
        bestModel: data.best_model,
        models: models,
        recommendation: data.recommendation,
        featureImportance: featureImportance,
        problemType: data.problem_type,
        targetColumnUsed: data.target_column_used,
        samplePredictions: data.sample_predictions || []
      });
      setIsTraining(false);
      setAutoFlowStep('done');
    } catch (e) {
      console.error(e);
      alert('Error training models: ' + e.message);
      setIsTraining(false);
      setAutoFlowStep('idle');
    }
  }, []);

  // Auto-flow: When file is selected, automatically analyze then train
  const handleAutoFlow = useCallback(async () => {
    if (!file) return;
    
    const analyzeResult = await runAnalyze(file, targetColumn || '');
    if (analyzeResult) {
      // Automatically train after analysis
      await runTrain(file, analyzeResult.targetColumn || targetColumn || '');
      setActiveTab('train');
    }
  }, [file, targetColumn, runAnalyze, runTrain]);

  const handleAnalyze = async () => {
    if (!file) return;
    await runAnalyze(file, targetColumn);
  };

  const handleTrain = async () => {
    if (!file) return;
    await runTrain(file, targetColumn || analyzeResults?.targetColumn || '');
  };

  // Build real radar chart data from top 3 models
  const radarData = useMemo(() => {
    if (!trainResults || !trainResults.models.length) return [];
    
    const top3 = [...trainResults.models]
      .sort((a, b) => {
        if (trainResults.problemType === 'classification') {
          return (b.accuracy || 0) - (a.accuracy || 0);
        }
        return (b.r2 || 0) - (a.r2 || 0);
      })
      .slice(0, 3);
    
    if (trainResults.problemType === 'classification') {
      const subjects = ['Accuracy', 'Precision', 'Recall', 'F1 Score'];
      return subjects.map(sub => {
        const entry = { subject: sub };
        top3.forEach((m, i) => {
          const key = sub.toLowerCase().replace(' score', '');
          entry[m.name] = m[key] || 0;
        });
        return entry;
      });
    } else {
      // For regression, normalize metrics for radar display
      const maxMAE = Math.max(...top3.map(m => m.mae || 1));
      const maxRMSE = Math.max(...top3.map(m => m.rmse || 1));
      return [
        (() => { const e = { subject: 'R² Score' }; top3.forEach(m => { e[m.name] = Math.max(0, m.r2 || 0); }); return e; })(),
        (() => { const e = { subject: 'MAE (inv)' }; top3.forEach(m => { e[m.name] = maxMAE > 0 ? 1 - ((m.mae || 0) / maxMAE) : 0; }); return e; })(),
        (() => { const e = { subject: 'RMSE (inv)' }; top3.forEach(m => { e[m.name] = maxRMSE > 0 ? 1 - ((m.rmse || 0) / maxRMSE) : 0; }); return e; })(),
      ];
    }
  }, [trainResults]);

  const top3ModelNames = useMemo(() => {
    if (!trainResults || !trainResults.models.length) return [];
    return [...trainResults.models]
      .sort((a, b) => {
        if (trainResults.problemType === 'classification') return (b.accuracy || 0) - (a.accuracy || 0);
        return (b.r2 || 0) - (a.r2 || 0);
      })
      .slice(0, 3)
      .map(m => m.name);
  }, [trainResults]);

  const getSimulatedRecommendations = () => {
    const algos = algorithmData.filter(a => a.type === 'both' || a.type === simState.problemType);
    
    const scored = algos.map(a => {
      let score = 100;
      let reasons = [];

      if (simState.datasetSize > 50000) {
        if (['SVM', 'KNN'].includes(a.name)) { score -= 40; reasons.push('Slow on large data'); }
        if (['XGBoost', 'Random Forest'].includes(a.name)) { score += 20; reasons.push('Handles large data well'); }
      }
      
      if (simState.interpretability) {
        if (['Logistic Regression', 'Decision Tree', 'Linear Regression'].includes(a.name)) { score += 30; reasons.push('Highly interpretable'); }
        else { score -= 30; reasons.push('Black-box model'); }
      }

      if (simState.speed) {
        if (['Naive Bayes', 'Logistic Regression', 'KNN'].includes(a.name)) { score += 20; reasons.push('Fast training'); }
        if (['SVM', 'Random Forest', 'XGBoost'].includes(a.name)) { score -= 20; reasons.push('Slower training'); }
      }

      if (simState.nonlinear && ['Logistic Regression', 'Linear Regression', 'Ridge Regression', 'Lasso Regression'].includes(a.name)) {
        score -= 40; reasons.push('Assumes linearity');
      }

      return { ...a, score, reasons: reasons.slice(0, 2) };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  const topSimAlgos = useMemo(() => getSimulatedRecommendations(), [simState]);

  return (
    <div className="ml-lab-container">
      <div className="ml-lab-hero">
        <h1 className="ml-lab-title">ML Model Lab</h1>
        <p className="ml-lab-subtitle">Upload any dataset — AI auto-detects the target, trains 7 models, and gives you predictions.</p>
      </div>

      <div className="ml-lab-tabs">
        {TABS.map(tab => (
          <button 
            key={tab.id}
            className={`ml-lab-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="ml-lab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'analyze' && (
            <motion.div 
              key="analyze"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ml-tab-panel"
            >
              <div className="upload-section">
                <div 
                  className="upload-zone"
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept=".csv,.xlsx"
                    onChange={handleFileChange}
                  />
                  <Upload size={48} className="upload-icon" />
                  <h3>{file ? file.name : "Drag & Drop Dataset or Click to Browse"}</h3>
                  <p>Supports CSV, Excel (Max 50MB)</p>
                </div>

                {headers.length > 0 && (
                  <div className="config-section">
                    <div className="config-group">
                      <label>Target Column <span style={{color: 'var(--muted)', fontSize: '0.8rem'}}>(auto-detected if left blank)</span></label>
                      <select 
                        value={targetColumn} 
                        onChange={(e) => setTargetColumn(e.target.value)}
                        className="ml-select"
                      >
                        <option value="">🤖 Auto-detect (Recommended)</option>
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    <button 
                      className="ml-btn primary"
                      onClick={handleAutoFlow}
                      disabled={isAnalyzing || isTraining}
                    >
                      {(isAnalyzing || isTraining) ? <span className="spinner"></span> : <Sparkles size={18} />}
                      {isAnalyzing ? 'Analyzing...' : isTraining ? 'Training Models...' : '🚀 Analyze & Train'}
                    </button>
                  </div>
                )}

                {/* Auto-flow progress */}
                {autoFlowStep !== 'idle' && autoFlowStep !== 'done' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="auto-flow-progress"
                  >
                    <div className={`flow-step ${autoFlowStep === 'analyzing' ? 'active' : 'completed'}`}>
                      <Database size={16} />
                      <span>{autoFlowStep === 'analyzing' ? 'Interpreting dataset...' : 'Dataset analyzed ✓'}</span>
                    </div>
                    <ArrowRight size={14} className="flow-arrow" />
                    <div className={`flow-step ${autoFlowStep === 'training' ? 'active' : ''}`}>
                      <Cpu size={16} />
                      <span>{autoFlowStep === 'training' ? 'Training 7 models...' : 'Train models'}</span>
                    </div>
                    <ArrowRight size={14} className="flow-arrow" />
                    <div className="flow-step">
                      <Target size={16} />
                      <span>Predictions</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {analyzeResults && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="analysis-results"
                >
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-label">Rows</span>
                      <span className="stat-value">{analyzeResults.rows.toLocaleString()}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Columns</span>
                      <span className="stat-value">{analyzeResults.columns}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Missing</span>
                      <span className="stat-value warning">{analyzeResults.missingValues}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Problem Type</span>
                      <span className="stat-value highlight">{analyzeResults.problemType}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Target</span>
                      <span className="stat-value" style={{fontSize: '1rem', color: 'var(--gold)'}}>{analyzeResults.targetColumn}</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-label">Outliers</span>
                      <span className="stat-value warning">{analyzeResults.outliers}</span>
                    </div>
                  </div>

                  <div className="ai-summary-card glass-card">
                    <div className="card-header">
                      <Brain className="text-gold" />
                      <h3>AI Dataset Interpretation</h3>
                    </div>
                    <div className="ai-summary-text" dangerouslySetInnerHTML={{ 
                      __html: analyzeResults.aiSummary
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                        .replace(/\n\n/g, '<br/><br/>')
                        .replace(/✅/g, '<span style="color:#34d399">✅</span>')
                        .replace(/⚠️/g, '<span style="color:#fbbf24">⚠️</span>')
                        .replace(/🔍/g, '🔍')
                        .replace(/🎯/g, '🎯')
                        .replace(/📊/g, '📊')
                    }} />
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'train' && (
            <motion.div 
              key="train"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ml-tab-panel"
            >
              {!analyzeResults ? (
                <div className="empty-state">
                  <AlertTriangle size={48} className="text-muted" />
                  <h3>Analyze dataset first</h3>
                  <p>Please upload and analyze a dataset before training models.</p>
                </div>
              ) : (
                <div className="train-section">
                  <div className="train-header">
                    <h2>Train & Compare Models {trainResults && <span className="target-badge">Target: {trainResults.targetColumnUsed}</span>}</h2>
                    <button 
                      className="ml-btn primary"
                      onClick={handleTrain}
                      disabled={isTraining}
                    >
                      {isTraining ? <span className="spinner"></span> : <Cpu size={18} />}
                      {isTraining ? 'Training in progress...' : 'Re-train All Models'}
                    </button>
                  </div>

                  {trainResults && (
                    <div className="results-dashboard">
                      {/* Dynamic table based on problem type */}
                      <div className="glass-card table-container">
                        <table className="ml-table">
                          <thead>
                            <tr>
                              <th>Model</th>
                              {trainResults.problemType === 'classification' ? (
                                <>
                                  <th>Accuracy</th>
                                  <th>Precision</th>
                                  <th>Recall</th>
                                  <th>F1 Score</th>
                                </>
                              ) : (
                                <>
                                  <th>R² Score</th>
                                  <th>MAE</th>
                                  <th>RMSE</th>
                                </>
                              )}
                              <th>Train Time (s)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trainResults.models.map(model => (
                              <tr key={model.name} className={model.isBest ? 'best-model' : ''}>
                                <td>
                                  <div className="model-name-cell">
                                    {model.isBest && <Zap size={14} className="text-gold" />}
                                    {model.name}
                                  </div>
                                </td>
                                {trainResults.problemType === 'classification' ? (
                                  <>
                                    <td>{model.accuracy != null ? (model.accuracy * 100).toFixed(2) + '%' : 'N/A'}</td>
                                    <td>{model.precision != null ? model.precision.toFixed(4) : 'N/A'}</td>
                                    <td>{model.recall != null ? model.recall.toFixed(4) : 'N/A'}</td>
                                    <td>{model.f1 != null ? model.f1.toFixed(4) : 'N/A'}</td>
                                  </>
                                ) : (
                                  <>
                                    <td>{model.r2 != null ? model.r2.toFixed(4) : 'N/A'}</td>
                                    <td>{model.mae != null ? model.mae.toFixed(4) : 'N/A'}</td>
                                    <td>{model.rmse != null ? model.rmse.toFixed(4) : 'N/A'}</td>
                                  </>
                                )}
                                <td>{model.trainTime.toFixed(3)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Charts */}
                      <div className="charts-grid">
                        <div className="glass-card chart-card">
                          <h3>{trainResults.problemType === 'classification' ? 'Accuracy' : 'R² Score'} Comparison</h3>
                          <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={trainResults.models}>
                                <XAxis dataKey="name" stroke="var(--muted)" tick={{fill: 'var(--muted)'}} fontSize={11} angle={-20} textAnchor="end" height={60} />
                                <YAxis stroke="var(--muted)" tick={{fill: 'var(--muted)'}} domain={trainResults.problemType === 'classification' ? [0, 1] : ['auto', 'auto']} />
                                <Tooltip contentStyle={{backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)'}} />
                                <Bar 
                                  dataKey={trainResults.problemType === 'classification' ? 'accuracy' : 'r2'} 
                                  radius={[4, 4, 0, 0]}
                                >
                                  {trainResults.models.map((entry, idx) => (
                                    <Cell key={idx} fill={entry.isBest ? '#fbbf24' : CHART_COLORS[idx % CHART_COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="glass-card chart-card">
                          <h3>Performance Radar (Top 3)</h3>
                          <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                              <RadarChart data={radarData}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--muted)', fontSize: 10}} />
                                <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} />
                                {top3ModelNames.map((name, i) => (
                                  <Radar 
                                    key={name}
                                    name={name} 
                                    dataKey={name} 
                                    stroke={CHART_COLORS[i]} 
                                    fill={CHART_COLORS[i]} 
                                    fillOpacity={0.3} 
                                  />
                                ))}
                                <Tooltip contentStyle={{backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)'}} />
                                <Legend wrapperStyle={{fontSize: '11px'}} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Predictions Table */}
                      {trainResults.samplePredictions && trainResults.samplePredictions.length > 0 && (
                        <div className="glass-card predictions-card">
                          <div className="card-header">
                            <Eye className="text-gold" />
                            <h3>Sample Predictions (Best Model: {trainResults.bestModel})</h3>
                          </div>
                          <table className="ml-table predictions-table">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Actual</th>
                                <th>Predicted</th>
                                <th>{trainResults.problemType === 'classification' ? 'Match' : 'Error'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {trainResults.samplePredictions.map((p, i) => (
                                <tr key={i} className={
                                  trainResults.problemType === 'classification' 
                                    ? (p.correct ? 'pred-correct' : 'pred-wrong')
                                    : ''
                                }>
                                  <td>{i + 1}</td>
                                  <td>{p.actual}</td>
                                  <td>{p.predicted}</td>
                                  <td>
                                    {trainResults.problemType === 'classification' ? (
                                      p.correct 
                                        ? <span className="pred-badge correct">✓ Correct</span>
                                        : <span className="pred-badge wrong">✗ Wrong</span>
                                    ) : (
                                      <span className="pred-badge error">{p.error}</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'recommend' && (
            <motion.div 
              key="recommend"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ml-tab-panel"
            >
              {!trainResults ? (
                <div className="empty-state">
                  <Cpu size={48} className="text-muted" />
                  <h3>Train models first</h3>
                  <p>AI recommendations will appear after model training is complete.</p>
                </div>
              ) : (
                <div className="recommendation-dashboard">
                  <div className="glass-card hero-recommendation">
                    <div className="hero-badge">🏆 Top Recommendation</div>
                    <h2>{trainResults.bestModel}</h2>
                    <div className="rec-text" dangerouslySetInnerHTML={{
                      __html: trainResults.recommendation
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                    
                    <div className="rec-stats">
                      <div className="rec-stat">
                        <span className="label">{trainResults.problemType === 'classification' ? 'Accuracy' : 'R² Score'}</span>
                        <span className="value text-gold">
                          {(() => {
                            const best = trainResults.models.find(m => m.name === trainResults.bestModel);
                            if (!best) return 'N/A';
                            if (trainResults.problemType === 'classification') return ((best.accuracy || 0) * 100).toFixed(2) + '%';
                            return (best.r2 || 0).toFixed(4);
                          })()}
                        </span>
                      </div>
                      <div className="rec-stat">
                        <span className="label">Training Speed</span>
                        <span className="value">
                          {(() => {
                            const best = trainResults.models.find(m => m.name === trainResults.bestModel);
                            return best ? best.trainTime.toFixed(3) + 's' : 'N/A';
                          })()}
                        </span>
                      </div>
                      <div className="rec-stat">
                        <span className="label">Problem Type</span>
                        <span className="value">{trainResults.problemType === 'classification' ? 'Classification' : 'Regression'}</span>
                      </div>
                    </div>
                  </div>

                  {trainResults.featureImportance && trainResults.featureImportance.length > 0 && (
                    <div className="glass-card feature-importance-card">
                      <h3>Feature Importance</h3>
                      <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={trainResults.featureImportance} layout="vertical" margin={{ left: 80 }}>
                            <XAxis type="number" stroke="var(--muted)" tick={{fill: 'var(--muted)'}} />
                            <YAxis dataKey="name" type="category" stroke="var(--muted)" tick={{fill: 'var(--muted)', fontSize: 11}} width={80} />
                            <Tooltip contentStyle={{backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)'}} />
                            <Bar dataKey="value" fill="var(--pink)" radius={[0, 4, 4, 0]}>
                              {(trainResults.featureImportance || []).map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'simulator' && (
            <motion.div 
              key="simulator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ml-tab-panel simulator-panel"
            >
              <div className="simulator-grid">
                <div className="glass-card controls-card">
                  <h3>Dataset Parameters</h3>
                  
                  <div className="control-group">
                    <label>Problem Type</label>
                    <div className="toggle-group">
                      <button 
                        className={`toggle-btn ${simState.problemType === 'classification' ? 'active' : ''}`}
                        onClick={() => setSimState({...simState, problemType: 'classification'})}
                      >Classification</button>
                      <button 
                        className={`toggle-btn ${simState.problemType === 'regression' ? 'active' : ''}`}
                        onClick={() => setSimState({...simState, problemType: 'regression'})}
                      >Regression</button>
                    </div>
                  </div>

                  <div className="slider-group">
                    <label>Dataset Size: {simState.datasetSize.toLocaleString()} rows</label>
                    <input 
                      type="range" min="100" max="100000" step="100"
                      value={simState.datasetSize}
                      onChange={(e) => setSimState({...simState, datasetSize: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="slider-group">
                    <label>Number of Features: {simState.features}</label>
                    <input 
                      type="range" min="2" max="500"
                      value={simState.features}
                      onChange={(e) => setSimState({...simState, features: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="toggles-grid">
                    <label className="switch-label">
                      <input type="checkbox" checked={simState.interpretability} onChange={(e) => setSimState({...simState, interpretability: e.target.checked})} />
                      Need Interpretability
                    </label>
                    <label className="switch-label">
                      <input type="checkbox" checked={simState.speed} onChange={(e) => setSimState({...simState, speed: e.target.checked})} />
                      Fast Training Required
                    </label>
                    <label className="switch-label">
                      <input type="checkbox" checked={simState.nonlinear} onChange={(e) => setSimState({...simState, nonlinear: e.target.checked})} />
                      Non-linear Relationships
                    </label>
                  </div>
                </div>

                <div className="glass-card sim-results-card">
                  <h3>Real-time Recommendations</h3>
                  <div className="sim-algo-list">
                    <AnimatePresence>
                      {topSimAlgos.map((algo, idx) => (
                        <motion.div 
                          key={algo.name}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={`sim-algo-item ${idx === 0 ? 'top-pick' : ''}`}
                        >
                          <div className="algo-header">
                            <span className="rank">#{idx + 1}</span>
                            <h4>{algo.name}</h4>
                            <span className="score">Score: {algo.score}</span>
                          </div>
                          <ul className="reasons">
                            {algo.reasons.map((r, i) => <li key={i}><Check size={12}/> {r}</li>)}
                          </ul>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'learn' && (
            <motion.div 
              key="learn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="ml-tab-panel"
            >
              <div className="learn-grid">
                {algorithmData.map(algo => (
                  <ExpandableCard key={algo.name} algo={algo} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExpandableCard({ algo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      layout 
      className="glass-card algo-learn-card"
      onClick={() => setExpanded(!expanded)}
    >
      <motion.div layout className="algo-card-header">
        <h3>{algo.name}</h3>
        <span className={`type-badge ${algo.type}`}>{algo.type}</span>
      </motion.div>
      <motion.p layout className="text-muted text-sm">{algo.whenToUse}</motion.p>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="algo-card-details"
          >
            <div className="detail-section">
              <h4>Advantages</h4>
              <ul>{algo.advantages.map(a => <li key={a}>{a}</li>)}</ul>
            </div>
            <div className="detail-section">
              <h4>Disadvantages</h4>
              <ul>{algo.disadvantages.map(a => <li key={a}>{a}</li>)}</ul>
            </div>
            <div className="complexity-grid">
              <div className="comp-item">
                <span className="label">Time</span>
                <span className="val">{algo.timeComplexity}</span>
              </div>
              <div className="comp-item">
                <span className="label">Space</span>
                <span className="val">{algo.spaceComplexity}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
