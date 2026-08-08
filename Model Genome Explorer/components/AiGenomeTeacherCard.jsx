import { useState } from 'react'
import { Bot, Sparkles, MessageSquare, ChevronRight } from 'lucide-react'

/**
 * AI Genome Teacher Card Component — Interactive Q&A for model evolution & ancestry
 */
export default function AiGenomeTeacherCard({ model, aiQnA }) {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0)

  if (!model || !aiQnA || aiQnA.length === 0) return null

  const currentQA = aiQnA[activeQuestionIdx] || aiQnA[0]

  return (
    <div className="ai-teacher-card glass">
      <div className="card-head">
        <div className="bot-pulse">
          <Bot size={22} color="#60a5fa" />
        </div>
        <div>
          <h4>AI SPECIES EXPLANATION ENGINE</h4>
          <p className="sub">Ask {model.name} about its lineage, evolutionary purpose, and weaknesses</p>
        </div>
      </div>

      <div className="ai-qna-layout">
        {/* Questions Selector List */}
        <div className="qna-list-col">
          {aiQnA.map((qa, idx) => (
            <button
              key={idx}
              type="button"
              className={`qna-btn ${activeQuestionIdx === idx ? 'active' : ''}`}
              onClick={() => setActiveQuestionIdx(idx)}
            >
              <MessageSquare size={13} />
              <span>{qa.question}</span>
              <ChevronRight size={12} />
            </button>
          ))}
        </div>

        {/* Answer Display Box */}
        <div className="qna-answer-box glass">
          <div className="answer-header">
            <Sparkles size={14} color="#34d399" />
            <span>AI EXPLANATION RESPONSE</span>
          </div>
          <p className="answer-text">{currentQA.answer}</p>
        </div>
      </div>
    </div>
  )
}
