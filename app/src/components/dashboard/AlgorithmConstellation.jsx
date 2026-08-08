import { Cpu, CheckCircle2, Lock } from 'lucide-react'
import { useGame } from '../../context/GameContext'

const CONSTELLATIONS_DEF = [
  { id: 'linreg', levelId: 6, name: 'Linear Regression', domain: 'Regression', color: '#06b6d4' },
  { id: 'logreg', levelId: 8, name: 'Logistic Regression', domain: 'Classification', color: '#06b6d4' },
  { id: 'trees', levelId: 11, name: 'Decision Trees', domain: 'Ensembles', color: '#10b981' },
  { id: 'rf', levelId: 12, name: 'Random Forest', domain: 'Ensembles', color: '#10b981' },
  { id: 'svm', levelId: 14, name: 'Support Vector Machines', domain: 'Optimization', color: '#3b82f6' },
  { id: 'pca', levelId: 16, name: 'Principal Component Analysis', domain: 'Dimensionality', color: '#8b5cf6' },
  { id: 'cnn', levelId: 18, name: 'Convolutional Neural Networks', domain: 'Computer Vision', color: '#0284c7' },
  { id: 'transformer', levelId: 20, name: 'Transformers & Attention', domain: 'LLMs & GenAI', color: '#ec4899' },
  { id: 'rag', levelId: 24, name: 'Retrieval Augmented Gen (RAG)', domain: 'LLMs & GenAI', color: '#ec4899' },
  { id: 'mlops', levelId: 30, name: 'MLOps & Model Monitoring', domain: 'Engineering', color: '#fbbf24' }
]

export function AlgorithmConstellation() {
  const { progress, isUnlocked } = useGame()

  const nodes = CONSTELLATIONS_DEF.map((algo) => {
    const unlocked = isUnlocked(algo.levelId)
    const cleared = progress.clearedLevels?.includes(algo.levelId)
    const stars = progress.levelStars?.[algo.levelId] || 0

    let modesDone = 0
    ;['quiz', 'flashcards', 'interview', 'coding'].forEach((m) => {
      if (progress.completedModes?.[`${algo.levelId}:${m}`]) modesDone++
    })

    let mastery = 0
    if (cleared) {
      mastery = Math.min(100, 60 + stars * 10 + modesDone * 5)
    } else if (unlocked) {
      mastery = 25
    }

    const status = cleared ? 'cleared' : unlocked ? 'unlocked' : 'locked'

    return {
      ...algo,
      mastery,
      status
    }
  })

  return (
    <section className="algorithm-constellation-card glass" data-gsap="reveal">
      <div className="card-head-row">
        <div className="card-head-title">
          <Cpu size={18} className="text-purple" />
          <span>Algorithm Mastery Constellation</span>
        </div>
        <span className="card-badge-muted">Interactive Node Constellation</span>
      </div>

      <p className="constellation-desc">
        Visual representation of algorithm domain mastery. Cleared algorithms illuminate with topic color halos.
      </p>

      <div className="constellation-grid">
        {nodes.map((algo) => (
          <div
            key={algo.id}
            className={`constellation-node glass ${algo.status}`}
            style={{ '--node-color': algo.color }}
          >
            <div className="node-head-row">
              <span className="domain-lbl" style={{ color: algo.color }}>{algo.domain}</span>
              {algo.status === 'cleared' ? (
                <CheckCircle2 size={15} color="#10b981" />
              ) : algo.status === 'locked' ? (
                <Lock size={13} className="text-muted" />
              ) : null}
            </div>

            <h4 className="node-title">{algo.name}</h4>

            <div className="node-mastery-bar">
              <div className="bar-rail">
                <div
                  className="bar-fill"
                  style={{ width: `${algo.mastery}%`, background: algo.color }}
                />
              </div>
              <span className="pct-val">{algo.mastery}% Mastery</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
