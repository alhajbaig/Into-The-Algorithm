/* ═══════════════════════════════════════════════════
   Socratic Engine Agent
   Guides users to understanding via questions
═══════════════════════════════════════════════════ */

window.SocraticAgent = (function () {

  const GROQ_KEY  = import.meta.env.VITE_GROQ_API_KEY;
  const MODEL     = 'llama-3.3-70b-versatile';
  const API_URL   = 'https://api.groq.com/openai/v1/chat/completions';

  let state = {
    topic:    '',
    history:  [],
    step:     0,
  };

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

Keep questions focused on ML concepts only.`;

  async function callGroq(messages) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0.7, max_tokens: 500 }),
    });
    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
  }

  async function start(topic) {
    state = { topic, history: [], step: 0 };

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: `The student wants to understand: "${topic}". Start the Socratic dialogue with your first foundational question.` },
    ];

    const response = await callGroq(messages);
    state.history.push({ role: 'assistant', content: response });
    state.step++;
    return response;
  }

  async function respond(userAnswer) {
    state.history.push({ role: 'user', content: userAnswer });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: `The student is learning about: "${state.topic}"` },
      ...state.history,
    ];

    const response = await callGroq(messages);
    state.history.push({ role: 'assistant', content: response });
    state.step++;

    // After 5 exchanges, hint at synthesis
    const isSynthesis = state.step >= 5 && response.toLowerCase().includes('synthesis');
    return { text: response, isSynthesis };
  }

  function reset() {
    state = { topic: '', history: [], step: 0 };
  }

  // ── UI ──
  function init() {
    const startBtn  = document.getElementById('btn-socratic-start');
    const answerBtn = document.getElementById('btn-socratic-answer');
    const topicTA   = document.getElementById('socratic-topic');
    const answerTA  = document.getElementById('socratic-answer');
    const dialogue  = document.getElementById('socratic-dialogue');
    const messages  = document.getElementById('socratic-messages');
    const answerWrap = document.getElementById('socratic-answer-wrap');

    if (!startBtn) return;

    startBtn.addEventListener('click', async () => {
      const topic = topicTA.value.trim();
      if (!topic) { Toast.error('Please enter an ML topic first.'); return; }

      startBtn.disabled = true;
      startBtn.innerHTML = '<span class="spinner"></span> Starting...';
      reset();
      messages.innerHTML = '';
      dialogue.classList.remove('hidden');
      answerWrap.classList.add('hidden');

      try {
        const response = await start(topic);
        appendSocraticQ(messages, response);
        answerWrap.classList.remove('hidden');
        answerTA.value = '';
        answerTA.focus();
      } catch (e) {
        Toast.error('Failed to start Socratic dialogue. Check connection.');
        console.error(e);
      } finally {
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Socratic Dialogue';
      }
    });

    answerBtn.addEventListener('click', async () => {
      const answer = answerTA.value.trim();
      if (!answer) { Toast.error('Please type your answer first.'); return; }

      // Show user answer
      appendUserAnswer(messages, answer);
      answerTA.value = '';
      answerBtn.disabled = true;
      answerBtn.innerHTML = '<span class="spinner"></span> Thinking...';

      try {
        const { text } = await respond(answer);
        appendSocraticQ(messages, text);
        answerTA.focus();
      } catch (e) {
        Toast.error('Failed to get response.');
        console.error(e);
      } finally {
        answerBtn.disabled = false;
        answerBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Submit Answer';
      }
    });

    // Enter key on answer textarea
    answerTA.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); answerBtn.click(); }
    });
  }

  function appendSocraticQ(container, text) {
    const parts = text.split('**Hint:**');
    const questionPart = parts[0].replace('**Question:**', '').trim();
    const hintPart     = parts[1]?.trim();

    const el = document.createElement('div');
    el.className = 'socratic-q';
    el.innerHTML = `
      <div class="q-label"><i class="fas fa-lightbulb"></i> Socratic Question</div>
      <div class="q-text">${MDRenderer.render(questionPart)}</div>
      ${hintPart ? `<div class="socratic-hint"><i class="fas fa-circle-info"></i> ${hintPart}</div>` : ''}
    `;
    container.appendChild(el);
    el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  function appendUserAnswer(container, text) {
    const el = document.createElement('div');
    el.className = 'message user';
    el.style.margin = '8px 0';
    el.innerHTML = `
      <div class="msg-avatar"><i class="fas fa-user"></i></div>
      <div class="msg-content">
        <div class="msg-bubble">${text}</div>
      </div>
    `;
    container.appendChild(el);
  }

  return { init };
})();
