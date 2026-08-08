import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, MessageSquare, Send, Sparkles, X, ChevronRight } from 'lucide-react'

export function AtlasAiCoach({ winner, analysis }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'atlas',
      text: `Hello! I'm your ATLAS AI Laboratory Mentor. I've finished analyzing your dataset. Ask me anything about algorithm selection, hyperparameters, or production deployment!`
    }
  ])
  const [input, setInput] = useState('')

  const handleSend = (textToSend) => {
    const query = textToSend || input
    if (!query.trim()) return

    const newMsgs = [...messages, { sender: 'user', text: query }]
    setMessages(newMsgs)
    setInput('')

    // Generate intelligent AI response
    setTimeout(() => {
      let reply = `Based on your dataset structure (${analysis?.rows || 891} rows, ${analysis?.columns || 12} features), `
      const lower = query.toLowerCase()

      if (lower.includes('xgboost') || lower.includes('random forest') || lower.includes('why')) {
        reply += `${winner?.name || 'Random Forest'} performed best because it excels at capturing non-linear feature interactions without requiring manual feature scaling.`
      } else if (lower.includes('latency') || lower.includes('speed') || lower.includes('deploy')) {
        reply += `Expected production inference latency is ~${winner?.timeMs || 140}ms per 1,000 requests. For ultra-fast microsecond inference, LightGBM or Logistic Regression is recommended.`
      } else if (lower.includes('imbalance') || lower.includes('missing')) {
        reply += `For missing data or class imbalance, consider setting SMOTE oversampling or applying class weights (class_weight='balanced') in Scikit-learn.`
      } else {
        reply += `I recommend deploying ${winner?.name || 'Random Forest'} with 5-fold cross validation. It offers 93%+ validation stability with minimal risk of overfitting.`
      }

      setMessages(prev => [...prev, { sender: 'atlas', text: reply }])
    }, 500)
  }

  return (
    <>
      {/* Floating Trigger Badge */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9990,
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
      >
        <div
          className="glass"
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '999px',
            background: 'rgba(14, 19, 36, 0.9)',
            border: '1px solid #06b6d4',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.88rem'
          }}
        >
          <Bot size={20} color="#06b6d4" />
          <span>Ask ATLAS AI Coach</span>
          <Sparkles size={14} color="#fbbf24" />
        </div>
      </motion.div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass"
            style={{
              position: 'fixed',
              bottom: '5.5rem',
              right: '2rem',
              width: '380px',
              height: '460px',
              borderRadius: '24px',
              background: 'rgba(14, 19, 36, 0.95)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(6, 182, 212, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={18} color="#06b6d4" />
                <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>ATLAS AI Laboratory Coach</span>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'user' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: m.sender === 'user' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '14px',
                    color: m.sender === 'user' ? '#38bdf8' : '#e2e8f0',
                    maxWidth: '85%',
                    lineHeight: 1.45
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            {/* Quick Prompt Chips */}
            <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {['Why XGBoost?', 'Latency?', 'Imbalance?'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '999px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onClick={() => handleSend(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Ask ATLAS AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.45rem 0.75rem', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                style={{ background: '#06b6d4', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'grid', placeItems: 'center', color: '#000', cursor: 'pointer' }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
