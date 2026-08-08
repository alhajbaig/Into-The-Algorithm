/**
 * NeuralMind CHAT2 — Socratic Engine Service
 */

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
const MODEL = 'llama-3.3-70b-versatile'
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'

let state = {
  topic: '',
  history: [],
  step: 0
}

const SYSTEM_PROMPT = `You are a world-class Socratic tutor specializing exclusively in Machine Learning.
Your role is NOT to explain — your role is to guide the student to discover the answer themselves through carefully crafted questions.

Rules:
1. Ask ONLY ONE question at a time
2. Start with foundational questions and progressively go deeper
3. When the student answers, acknowledge what's correct, gently correct what's wrong, and ask the next probing question
4. Use the Socratic method: analogy, hypothetical, contradiction, definition
5. After 4-5 exchanges, give a brief "synthesis" summarizing what the student discovered
6. Format your response as:
   **Question:** [your single question]
   **Hint:** [optional 1-line hint if needed]

Keep questions focused on ML concepts only.`

async function callGroq(messages) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.7, max_tokens: 500 })
  })
  if (!res.ok) throw new Error(`Groq API error: ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content
}

export async function startSocraticDialogue(topic) {
  state = { topic, history: [], step: 0 }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `The student wants to understand: "${topic}". Start the Socratic dialogue with your first foundational question.` }
  ]

  const response = await callGroq(messages)
  state.history.push({ role: 'assistant', content: response })
  state.step++
  return response
}

export async function submitSocraticAnswer(userAnswer) {
  state.history.push({ role: 'user', content: userAnswer })

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `The student is learning about: "${state.topic}"` },
    ...state.history
  ]

  const response = await callGroq(messages)
  state.history.push({ role: 'assistant', content: response })
  state.step++

  const isSynthesis = state.step >= 5 && response.toLowerCase().includes('synthesis')
  return { text: response, isSynthesis }
}

export function resetSocratic() {
  state = { topic: '', history: [], step: 0 }
}
