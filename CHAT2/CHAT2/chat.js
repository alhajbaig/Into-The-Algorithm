/* ═══════════════════════════════════════════════════
   Chat Engine — Groq API + Streaming
   Core ML chatbot with agentic routing
═══════════════════════════════════════════════════ */

window.ChatEngine = (function () {

  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const MODEL    = 'llama-3.3-70b-versatile';
  const API_URL  = 'https://api.groq.com/openai/v1/chat/completions';

  const SYSTEM_PROMPT = `You are NeuralMind, an elite AI assistant specializing exclusively in Machine Learning. You are brilliant, enthusiastic, and deeply knowledgeable about all aspects of ML.

Your expertise covers:
- Classical ML (regression, classification, clustering, dimensionality reduction)
- Deep Learning (CNNs, RNNs, LSTMs, Transformers, attention mechanisms)
- Generative AI (GANs, VAEs, Diffusion models, LLMs)
- Reinforcement Learning (Q-learning, policy gradient, PPO, etc.)
- MLOps, model evaluation, optimization, regularization
- Mathematical foundations (linear algebra, calculus, probability, statistics)
- Frameworks (PyTorch, TensorFlow, Keras, scikit-learn, JAX, HuggingFace)
- Research papers and latest advances

Communication style:
- Use markdown formatting generously (headers, bullet points, bold, tables)
- For math, use LaTeX: $inline$ and $$display$$
- For code, always specify the language in code blocks
- Be precise but engaging — make learning exciting
- Use helpful analogies and real-world examples
- When appropriate, structure answers with: Concept → Intuition → Math → Code → Application
- Always stay on topic: Machine Learning and related fields only

If asked something unrelated to ML/AI/Data Science, politely redirect to ML topics.`;

  let history = [];
  let isStreaming = false;

  // ── API Call with Streaming ──
  async function streamChat(userMessage, onChunk, onDone) {
    history.push({ role: 'user', content: userMessage });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-20), // Keep last 20 messages for context
    ];

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature:   0.7,
        max_tokens:    2048,
        stream:        true,
        top_p:         0.9,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API ${res.status}: ${err}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta  = parsed.choices[0]?.delta?.content || '';
          if (delta) {
            fullText += delta;
            onChunk(delta, fullText);
          }
        } catch { /* skip malformed chunks */ }
      }
    }

    history.push({ role: 'assistant', content: fullText });
    if (onDone) onDone(fullText);
    return fullText;
  }

  function clearHistory() { history = []; }

  // ── Message Rendering ──
  let msgList;
  let typingIndicator;
  let welcomeScreen;
  let messagesArea;
  let chatInput;
  let sendBtn;
  let charCount;

  function createMessageEl(role, content, isStreaming = false) {
    const el = document.createElement('div');
    el.className = `message ${role}`;

    const avatar = role === 'ai'
      ? `<div class="msg-avatar"><i class="fas fa-brain"></i></div>`
      : `<div class="msg-avatar"><i class="fas fa-user"></i></div>`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const actions = role === 'ai' ? `
      <div class="msg-actions">
        <button class="msg-action-btn" onclick="ChatEngine.copyMessage(this)"><i class="fas fa-copy"></i> Copy</button>
        <button class="msg-action-btn" onclick="ChatEngine.speakMessage(this)"><i class="fas fa-volume-up"></i> Listen</button>
        <button class="msg-action-btn" onclick="ChatEngine.saveAsNote(this)"><i class="fas fa-bookmark"></i> Save Note</button>
      </div>` : '';

    el.innerHTML = `
      ${avatar}
      <div class="msg-content">
        <div class="msg-bubble" id="bubble-${Date.now()}">${
          role === 'user'
            ? content.replace(/</g, '&lt;')
            : (isStreaming ? '' : MDRenderer.render(content))
        }</div>
        <div class="msg-time">${time}</div>
        ${actions}
      </div>`;

    return el;
  }

  function scrollToBottom() {
    const area = document.getElementById('messages-area');
    if (area) area.scrollTop = area.scrollHeight;
  }

  function showTyping() {
    typingIndicator?.classList.remove('hidden');
    scrollToBottom();
    if (typeof window.setThinkingMode === 'function') window.setThinkingMode(true);
  }
  function hideTyping() {
    typingIndicator?.classList.add('hidden');
    if (typeof window.setThinkingMode === 'function') window.setThinkingMode(false);
  }

  function showMessages() {
    welcomeScreen?.classList.add('hidden');
    messagesArea?.classList.remove('hidden');
  }

  // ── Send Message ──
  async function sendMessage(text) {
    if (isStreaming || !text.trim()) return;
    isStreaming = true;

    showMessages();

    // User bubble
    const userEl = createMessageEl('user', text);
    msgList.appendChild(userEl);
    scrollToBottom();

    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    if (charCount) charCount.textContent = '0/4000';
    sendBtn.disabled = true;
    chatInput.disabled = true;
    showTyping();

    try {
      // Create empty AI bubble
      const aiEl = createMessageEl('ai', '', true);
      let bubbleEl = null;

      await streamChat(text,
        (delta, fullText) => {
          // First chunk — replace typing indicator with bubble
          if (!bubbleEl) {
            hideTyping();
            msgList.appendChild(aiEl);
            bubbleEl = aiEl.querySelector('.msg-bubble');
          }
          // Stream raw text, re-render markdown periodically
          bubbleEl.innerHTML = MDRenderer.render(fullText);
          scrollToBottom();
        },
        (fullText) => {
          // Final render
          if (bubbleEl) bubbleEl.innerHTML = MDRenderer.render(fullText);
          scrollToBottom();
        }
      );

    } catch (e) {
      hideTyping();
      const errEl = createMessageEl('ai', `⚠️ **Error:** ${e.message || 'Failed to get response. Check your API key or network.'}`);
      msgList.appendChild(errEl);
      Toast.error('Failed to get AI response.');
      console.error(e);
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  // ── Action handlers ──
  function copyMessage(btn) {
    const bubble = btn.closest('.msg-content')?.querySelector('.msg-bubble');
    if (!bubble) return;
    navigator.clipboard.writeText(bubble.innerText).then(() => {
      Toast.success('Copied to clipboard!');
    });
  }

  function speakMessage(btn) {
    const bubble = btn.closest('.msg-content')?.querySelector('.msg-bubble');
    if (!bubble) return;
    Voice.speak(bubble.innerText);
    Toast.info('Speaking...');
  }

  function saveAsNote(btn) {
    const bubble = btn.closest('.msg-content')?.querySelector('.msg-bubble');
    if (!bubble) return;
    const text = bubble.innerText;
    const ta = document.getElementById('notes-topic');
    if (ta) {
      ta.value = 'Saved from Chat: ' + text.slice(0, 80) + '...';
      Toast.success('Switch to Notes tab to generate structured notes!');
    }
  }

  // ── Init ──
  function init() {
    msgList         = document.getElementById('messages-list');
    typingIndicator = document.getElementById('typing-indicator');
    welcomeScreen   = document.getElementById('welcome-screen');
    messagesArea    = document.getElementById('messages-area');
    chatInput       = document.getElementById('chat-input');
    sendBtn         = document.getElementById('btn-send');
    charCount       = document.getElementById('char-count');

    if (!chatInput || !sendBtn) return;

    // Send on button click
    sendBtn.addEventListener('click', () => sendMessage(chatInput.value.trim()));

    // Send on Enter (Shift+Enter = newline)
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(chatInput.value.trim());
      }
    });

    // Auto-resize textarea + char count
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 160) + 'px';
      if (charCount) charCount.textContent = `${chatInput.value.length}/4000`;
    });

    // Quick prompt cards
    document.querySelectorAll('.prompt-card').forEach(card => {
      card.addEventListener('click', () => {
        chatInput.value = card.dataset.prompt;
        sendMessage(card.dataset.prompt);
      });
    });

    // Clear button
    document.getElementById('btn-clear')?.addEventListener('click', () => {
      clearHistory();
      msgList.innerHTML = '';
      welcomeScreen?.classList.remove('hidden');
      messagesArea?.classList.add('hidden');
      Toast.info('Conversation cleared.');
    });

    // Voice button
    Voice.init(
      (transcript, isFinal) => {
        chatInput.value = transcript;
        if (isFinal && transcript.trim()) {
          setTimeout(() => sendMessage(transcript.trim()), 200);
        }
      },
      (err) => Toast.error(`Voice error: ${err}`)
    );

    document.getElementById('btn-voice')?.addEventListener('click', () => {
      if (!Voice.isSupported) { Toast.error('Voice not supported in this browser.'); return; }
      Voice.startListening();
      Toast.info('Listening... speak now');
    });
  }

  return { init, sendMessage, clearHistory, copyMessage, speakMessage, saveAsNote };
})();
