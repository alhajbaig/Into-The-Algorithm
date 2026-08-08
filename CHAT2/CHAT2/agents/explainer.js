/* ═══════════════════════════════════════════════════
   Easy Explanation Agent
   Three-level ML explainer (Beginner / Intermediate / Expert)
═══════════════════════════════════════════════════ */

window.ExplainerAgent = (function () {

  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const MODEL    = 'llama-3.3-70b-versatile';
  const API_URL  = 'https://api.groq.com/openai/v1/chat/completions';

  let selectedLevel = 'beginner';

  const LEVEL_PROMPTS = {
    beginner: `You are a friendly, enthusiastic ML teacher explaining to a complete beginner.
Rules:
- Use simple everyday analogies and metaphors
- Avoid jargon; if you must use a term, immediately define it in plain language
- Use short sentences and bullet points
- Include a real-world example they can relate to (like Netflix, Spotify, etc.)
- End with a "Key Takeaway" in one sentence
- Use emojis sparingly to make it friendly
Format: Start with a one-line hook, then explain step by step`,

    intermediate: `You are an ML instructor explaining to someone with programming background who has heard of ML.
Rules:
- Use technical terms but always give intuition behind them
- Include the mathematical concept at a high level (no full derivations)
- Mention why this matters in practice
- Include a brief Python pseudocode example
- Discuss common pitfalls or misconceptions
- End with "Real-World Applications" section
Format: Structured explanation with headers`,

    expert: `You are a senior ML researcher explaining to a fellow ML practitioner/researcher.
Rules:
- Use precise mathematical notation (LaTeX: $...$ for inline, $$...$$ for display)
- Discuss theoretical foundations, convergence properties, complexity
- Compare with related methods and state-of-the-art variants
- Mention key papers and when they were published
- Include implementation considerations (numerical stability, hyperparameter sensitivity)
- Discuss open problems or limitations
Format: Dense, technical, no hand-holding`,
  };

  async function explain(topic, level) {
    const systemPrompt = LEVEL_PROMPTS[level] || LEVEL_PROMPTS.beginner;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: `Explain this ML concept in depth: "${topic}"` },
        ],
        temperature: 0.6,
        max_tokens:  1200,
        stream: false,
      }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
  }

  function getLevelBadge(level) {
    const badges = {
      beginner:     { icon: 'fa-seedling',  label: 'Beginner',     color: '#10b981' },
      intermediate: { icon: 'fa-fire',      label: 'Intermediate', color: '#f59e0b' },
      expert:       { icon: 'fa-atom',      label: 'Expert',       color: '#a855f7' },
    };
    return badges[level] || badges.beginner;
  }

  function init() {
    const levelBtns  = document.querySelectorAll('.level-btn');
    const explainBtn = document.getElementById('btn-explain');
    const topicTA    = document.getElementById('explain-topic');
    const output     = document.getElementById('explain-output');

    if (!explainBtn) return;

    // Level selection
    levelBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLevel = btn.dataset.level;
      });
    });

    explainBtn.addEventListener('click', async () => {
      const topic = topicTA.value.trim();
      if (!topic) { Toast.error('Please enter an ML concept to explain.'); return; }

      explainBtn.disabled = true;
      explainBtn.innerHTML = '<span class="spinner"></span> Generating...';
      output.classList.add('hidden');
      output.innerHTML = '';

      try {
        const text  = await explain(topic, selectedLevel);
        const badge = getLevelBadge(selectedLevel);
        const html  = MDRenderer.render(text);

        output.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);">
            <i class="fas ${badge.icon}" style="color:${badge.color};font-size:18px;"></i>
            <span style="font-weight:700;color:${badge.color};">${badge.label} Level</span>
            <span style="color:var(--text-muted);font-size:13px;">— ${topic}</span>
          </div>
          <div class="msg-bubble" style="background:transparent;padding:0;">${html}</div>
        `;

        output.classList.remove('hidden');
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (e) {
        Toast.error('Failed to generate explanation.');
        console.error(e);
      } finally {
        explainBtn.disabled = false;
        explainBtn.innerHTML = '<i class="fas fa-magic"></i> Explain It!';
      }
    });

    // Enter on textarea
    topicTA.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); explainBtn.click(); }
    });
  }

  return { init };
})();
