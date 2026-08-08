import { LEVELS } from '../../../data/content'
import { BADGES } from '../../../data/badges'

/**
 * AI Neural Genome Calculation Engine
 * Computes multidimensional ML chromosomes, gene traits, and evolutionary health.
 */
export function calculateNeuralGenome(progress) {
  const clearedLevels = progress?.clearedLevels || []
  const levelStars = progress?.levelStars || {}
  const completedModes = progress?.completedModes || {}
  const streak = progress?.streak || 0
  const coins = progress?.coins || 0
  const totalStars = progress?.totalStars || 0
  const badges = progress?.badges || []

  const clearedCount = clearedLevels.length
  const totalLevels = LEVELS.length || 100

  // 1. Overall Genome Adaptability Score (0-100%)
  const genomeHealth = Math.min(100, Math.round((clearedCount / totalLevels) * 100))

  // 2. Star Accuracy & Synaptic Stability
  let maxPossibleStars = clearedCount * 3
  let earnedStars = 0
  clearedLevels.forEach((id) => {
    earnedStars += levelStars[id] || 1
  })
  const synapticStability = maxPossibleStars > 0 ? Math.round((earnedStars / maxPossibleStars) * 100) : 0

  // 3. Define 6 Core ML Chromosomes
  const CHROMOSOMES_DEF = [
    {
      id: 'chr_math',
      code: 'CHR-01-MATH',
      name: 'Mathematics & Logical Foundations',
      symbol: 'Σ',
      color: '#3b82f6',
      levels: [1, 2, 3, 4, 5],
      desc: 'Python vectorization, linear algebra matrices, matrix calculus, and probability distributions.'
    },
    {
      id: 'chr_prep',
      code: 'CHR-02-PREP',
      name: 'Data & Feature Engineering',
      symbol: '⚙️',
      color: '#06b6d4',
      levels: [6, 7, 8, 9, 10],
      desc: 'Feature scaling, missing value imputation, one-hot encoding, and dimensionality reduction.'
    },
    {
      id: 'chr_models',
      code: 'CHR-03-MODELS',
      name: 'Classical Machine Learning',
      symbol: '🧠',
      color: '#10b981',
      levels: [11, 12, 13, 14, 15, 16],
      desc: 'Linear & Logistic Regression, Decision Trees, Random Forests, SVMs, and K-Means.'
    },
    {
      id: 'chr_optim',
      code: 'CHR-04-OPTIM',
      name: 'Optimization & Loss Landscapes',
      symbol: '📉',
      color: '#8b5cf6',
      levels: [17, 18, 19, 20],
      desc: 'Gradient Descent, SGD, Adam Optimizer, Backpropagation, and loss surface convergence.'
    },
    {
      id: 'chr_deep',
      code: 'CHR-05-DEEP',
      name: 'Neural Architectures & Deep Learning',
      symbol: '🌐',
      color: '#ec4899',
      levels: [21, 22, 23, 24, 25],
      desc: 'Convolutional Neural Networks, LSTMs, Attention Mechanisms, and Transformer Blocks.'
    },
    {
      id: 'chr_ops',
      code: 'CHR-06-OPS',
      name: 'Generative AI & MLOps Infrastructure',
      symbol: '🚀',
      color: '#fbbf24',
      levels: [26, 27, 28, 29, 30],
      desc: 'RAG pipelines, vector databases, model deployment, monitoring, and AI alignment.'
    }
  ]

  const chromosomes = CHROMOSOMES_DEF.map((chr) => {
    const clearedInChr = chr.levels.filter((id) => clearedLevels.includes(id)).length
    const pct = Math.round((clearedInChr / chr.levels.length) * 100)
    const status = pct >= 80 ? 'Mastered' : pct > 0 ? 'Evolving' : 'Dormant'

    return {
      ...chr,
      cleared: clearedInChr,
      total: chr.levels.length,
      percentage: pct,
      status
    }
  })

  // 4. Define 12 Specific Gene Traits
  const GENES_DEF = [
    { id: 'gene_linreg', levelId: 6, code: 'GENE-LIN-06', name: 'Least Squares Optimization', formula: 'J(w) = \\frac{1}{2m}\\sum (h_w(x) - y)^2', color: '#06b6d4' },
    { id: 'gene_logreg', levelId: 8, code: 'GENE-LOG-08', name: 'Sigmoidal Boundary Partition', formula: '\\sigma(z) = \\frac{1}{1 + e^{-z}}', color: '#06b6d4' },
    { id: 'gene_trees', levelId: 11, code: 'GENE-TRE-11', name: 'Gini & Entropy Impurity Split', formula: 'Gini = 1 - \\sum p_i^2', color: '#10b981' },
    { id: 'gene_rf', levelId: 12, code: 'GENE-ENS-12', name: 'Ensemble Bagging Subsampling', formula: '\\hat{y} = \\frac{1}{B}\\sum T_b(x)', color: '#10b981' },
    { id: 'gene_svm', levelId: 14, code: 'GENE-SVM-14', name: 'Hyperplane Margin Maximization', formula: '\\min \\frac{1}{2}\\|w\\|^2', color: '#3b82f6' },
    { id: 'gene_pca', levelId: 16, code: 'GENE-PCA-16', name: 'Eigenvector Projection Matrix', formula: 'C = \\frac{1}{n}X^T X', color: '#8b5cf6' },
    { id: 'gene_neural', levelId: 17, code: 'GENE-ANN-17', name: 'Feedforward Layer Synapse', formula: 'a^{(l)} = \\sigma(W^{(l)}a^{(l-1)} + b^{(l)})', color: '#8b5cf6' },
    { id: 'gene_cnn', levelId: 18, code: 'GENE-CNN-18', name: 'Spatial Feature Kernel Mapping', formula: '(I * K)_{ij} = \\sum m n I_{i-m, j-n} K_{m,n}', color: '#0284c7' },
    { id: 'gene_transformer', levelId: 20, code: 'GENE-TRN-20', name: 'Scaled Dot-Product Attention', formula: '\\text{Attention}(Q,K,V) = \\text{softmax}(\\frac{QK^T}{\\sqrt{d_k}})V', color: '#ec4899' },
    { id: 'gene_rag', levelId: 24, code: 'GENE-RAG-24', name: 'Vector Embedding Retrieval', formula: '\\text{CosSim}(u,v) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|}', color: '#ec4899' },
    { id: 'gene_adam', levelId: 28, code: 'GENE-ADM-28', name: 'Adaptive Moment Estimation', formula: 'm_t = \\beta_1 m_{t-1} + (1-\\beta_1)g_t', color: '#fbbf24' },
    { id: 'gene_mlops', levelId: 30, code: 'GENE-OPS-30', name: 'Model Drift Monitoring', formula: 'KS = \\max |F_1(x) - F_2(x)|', color: '#fbbf24' }
  ]

  const genes = GENES_DEF.map((g) => {
    const isCleared = clearedLevels.includes(g.levelId)
    const stars = levelStars[g.levelId] || 0
    const isUnlocked = g.levelId === 1 || clearedLevels.includes(g.levelId - 1)

    let mastery = 0
    if (isCleared) {
      mastery = Math.min(100, 60 + stars * 12 + (completedModes[`${g.levelId}:coding`] ? 14 : 0))
    } else if (isUnlocked) {
      mastery = 25
    }

    return {
      ...g,
      isCleared,
      isUnlocked,
      stars,
      mastery,
      status: isCleared ? 'Active' : isUnlocked ? 'Unlocked' : 'Mutating'
    }
  })

  // 5. Unique AI DNA Sequence Identifier
  const dnaSequenceCode = `GENOME-ML${clearedCount.toString().padStart(2, '0')}-ST${totalStars}-STK${streak}-${badges.length}B`

  return {
    genomeHealth,
    synapticStability,
    clearedCount,
    totalLevels,
    streak,
    coins,
    totalStars,
    badgeCount: badges.length,
    totalBadges: BADGES.length,
    chromosomes,
    genes,
    dnaSequenceCode
  }
}
