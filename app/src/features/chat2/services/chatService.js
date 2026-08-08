/**
 * NeuralMind CHAT2 — Core Chat Engine Service (Groq API + Llama 3.3 70B)
 */

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
const MODEL = 'llama-3.3-70b-versatile'
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT = `You are NeuralMind, an elite AI assistant specializing exclusively in Machine Learning, hosted inside a premium AI learning platform called "Into The Algorithm".

Your expertise covers:
- Classical ML (regression, classification, clustering, dimensionality reduction)
- Deep Learning (CNNs, RNNs, LSTMs, Transformers, attention mechanisms)
- Generative AI (GANs, VAEs, Diffusion models, LLMs)
- Reinforcement Learning (Q-learning, policy gradient, PPO, etc.)
- MLOps, model evaluation, optimization, regularization
- Mathematical foundations (linear algebra, calculus, probability, statistics)
- Frameworks (PyTorch, TensorFlow, Keras, scikit-learn, JAX, HuggingFace)

## STRICT RESPONSE FORMAT RULES — ALWAYS FOLLOW THESE:

Every response MUST be structured using the following markdown elements:
1. **Use ## H2 headers** to label each major section (e.g., ## Overview, ## How It Works, ## Key Formula, ## Code Example, ## Summary)
2. **Use bullet lists** (- item) or numbered lists (1. item) for enumerating concepts, steps, or comparisons
3. **Use bold** (**text**) to highlight key terms, algorithm names, and important values
4. **Use code blocks** with language tags (\`\`\`python ... \`\`\`) for ALL code
5. **Use tables** when comparing multiple algorithms or approaches
6. **Use blockquotes** (> text) for key insights, rules of thumb, or pro tips
7. **NEVER write one long unbroken paragraph** — always break into labeled sections
8. Always end with a "## 💡 Key Takeaway" section summarizing the core insight in 1–2 sentences

Example structure:
## Overview
Brief intro sentence.

## How It Works
- Step 1: ...
- Step 2: ...

## Key Formula
\`\`\`math
Loss = ...
\`\`\`

## Code Example
\`\`\`python
...
\`\`\`

## Summary
> Core insight or rule of thumb

## 💡 Key Takeaway
One crisp sentence with the most important thing to remember.

If asked something unrelated to ML/AI/Data Science, politely redirect to ML topics.`

let history = []

export async function streamChat(userMessage, onChunk, onDone) {
  history.push({ role: 'user', content: userMessage })

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-20)
  ]

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: true,
      top_p: 0.9
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API Error (${res.status}): ${err}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

    for (const line of lines) {
      const data = line.slice(6)
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices[0]?.delta?.content || ''
        if (delta) {
          fullText += delta
          onChunk(delta, fullText)
        }
      } catch {
        /* skip malformed chunks */
      }
    }
  }

  history.push({ role: 'assistant', content: fullText })
  if (onDone) onDone(fullText)
  return fullText
}

export function clearChatHistory() {
  history = []
}

export function getChatHistory() {
  return history
}
