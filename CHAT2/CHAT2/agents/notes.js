/* ═══════════════════════════════════════════════════
   Notes Generation Agent
   Structured Markdown notes → PDF export via html2pdf.js
═══════════════════════════════════════════════════ */

window.NotesAgent = (function () {

  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
  const MODEL    = 'llama-3.3-70b-versatile';
  const API_URL  = 'https://api.groq.com/openai/v1/chat/completions';

  let currentRaw   = '';
  let currentTopic = '';

  const SYSTEM_PROMPT = `You are an expert ML educator creating comprehensive study notes.
Generate structured, thorough Markdown study notes about the given ML topic.

Notes must include:
## 📌 Overview
Brief definition and context

## 🎯 Key Concepts
Bullet list of core concepts with short explanations

## 🧮 Mathematical Foundation (if requested)
Key formulas in LaTeX format ($...$ for inline, $$...$$ for display equations)
Explain each variable

## 💻 Code Example (if requested)
Working Python code demonstrating the concept
Use sklearn, numpy, or PyTorch as appropriate

## 🌍 Real-World Applications
3-5 practical use cases with industry examples

## ⚠️ Common Pitfalls
What beginners get wrong

## 🔗 Related Concepts
Brief list of related ML topics to explore next

## ❓ Quiz (if requested)
3-5 multiple choice or short answer questions to test understanding
Include answers in a collapsible section using > tags

Rules:
- Use emojis for visual scanning
- Keep explanations precise but accessible
- Use tables for comparisons
- Bold key terms on first mention`;

  async function generate(topic, options) {
    const optionStr = [
      options.math ? 'Include all mathematical formulas and derivations.' : 'Skip mathematical formulas.',
      options.code ? 'Include Python code examples.' : 'Skip code examples.',
      options.quiz ? 'Include a quiz section with answers.' : 'Skip the quiz section.',
    ].join(' ');

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: `Generate comprehensive study notes for: "${topic}"\n\n${optionStr}` },
        ],
        temperature: 0.5,
        max_tokens:  2500,
      }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
    const data = await res.json();
    return data.choices[0].message.content;
  }

  /* ── PDF Export ──────────────────────────────────────
     Builds a standalone HTML document styled for print,
     then uses html2pdf.js to render it as a PDF blob.
  ─────────────────────────────────────────────────── */
  async function downloadPDF(topic, renderedHTML) {
    // Build a clean white-background print document
    const printDoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 13px;
            line-height: 1.7;
            color: #1a1a2e;
            background: #ffffff;
            padding: 0;
          }
          /* ── Header Banner ── */
          .pdf-header {
            background: linear-gradient(135deg, #7c3aed, #2563eb);
            color: white;
            padding: 28px 40px 24px;
            margin-bottom: 32px;
          }
          .pdf-header h1 {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }
          .pdf-header p {
            font-size: 12px;
            opacity: 0.85;
            letter-spacing: 0.3px;
          }
          .pdf-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            padding: 3px 12px;
            font-size: 11px;
            font-weight: 600;
            margin-top: 8px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          /* ── Content Area ── */
          .pdf-body {
            padding: 0 40px 40px;
          }
          h1, h2, h3, h4 {
            color: #1a1a2e;
            font-weight: 700;
            margin: 20px 0 10px;
          }
          h2 {
            font-size: 16px;
            border-bottom: 2px solid #7c3aed;
            padding-bottom: 6px;
            color: #5b21b6;
          }
          h3 { font-size: 14px; color: #3730a3; }
          p  { margin: 8px 0; }
          ul, ol { margin: 8px 0 8px 24px; }
          li { margin: 4px 0; }
          strong { color: #5b21b6; }
          em     { color: #1d4ed8; font-style: italic; }
          code {
            background: #f3f0ff;
            border: 1px solid #ddd6fe;
            border-radius: 3px;
            padding: 1px 5px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #5b21b6;
          }
          pre {
            background: #f8f8f8;
            border: 1px solid #e0e0e0;
            border-left: 4px solid #7c3aed;
            border-radius: 4px;
            padding: 14px 16px;
            overflow-x: auto;
            margin: 12px 0;
            font-size: 11.5px;
            line-height: 1.6;
          }
          pre code {
            background: transparent;
            border: none;
            padding: 0;
            color: #333;
          }
          blockquote {
            border-left: 3px solid #7c3aed;
            margin: 10px 0;
            padding: 8px 16px;
            background: #f3f0ff;
            border-radius: 0 4px 4px 0;
            color: #374151;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ddd6fe;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background: #ede9fe;
            font-weight: 700;
            color: #5b21b6;
          }
          tr:nth-child(even) { background: #faf5ff; }
          hr {
            border: none;
            border-top: 1px solid #e9d5ff;
            margin: 20px 0;
          }
          /* ── Footer ── */
          .pdf-footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e9d5ff;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
          }
          /* ── Page break hints ── */
          h2 { page-break-before: auto; }
          pre, table { page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <h1>🧠 ${topic}</h1>
          <p>Machine Learning Study Notes</p>
          <span class="pdf-badge">NeuralMind AI · Generated ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
        </div>
        <div class="pdf-body">
          ${renderedHTML}
          <div class="pdf-footer">
            Generated by NeuralMind — ML Intelligence Engine &nbsp;|&nbsp; Powered by Groq llama-3.3-70b
          </div>
        </div>
      </body>
      </html>`;

    // Create an off-screen container for html2pdf
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;left:-9999px;top:0;width:794px;background:white;';
    container.innerHTML = printDoc;
    document.body.appendChild(container);

    const filename = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_ml_notes.pdf`;

    const opt = {
      margin:       [0, 0, 0, 0],
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.97 },
      html2canvas:  { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
    };

    try {
      await html2pdf().set(opt).from(container).save();
      Toast.success(`Downloaded: ${filename}`);
    } finally {
      document.body.removeChild(container);
    }
  }

  function init() {
    const genBtn   = document.getElementById('btn-notes-generate');
    const topicTA  = document.getElementById('notes-topic');
    const output   = document.getElementById('notes-output');
    const content  = document.getElementById('notes-content');
    const dlBtn    = document.getElementById('btn-notes-download');
    const copyBtn  = document.getElementById('btn-notes-copy');
    const titleEl  = document.getElementById('notes-title-display');

    if (!genBtn) return;

    let renderedHTML = '';

    genBtn.addEventListener('click', async () => {
      const topic = topicTA.value.trim();
      if (!topic) { Toast.error('Please enter a topic for notes.'); return; }

      const options = {
        math: document.getElementById('notes-include-math')?.checked ?? true,
        code: document.getElementById('notes-include-code')?.checked ?? true,
        quiz: document.getElementById('notes-include-quiz')?.checked ?? false,
      };

      genBtn.disabled = true;
      genBtn.innerHTML = '<span class="spinner"></span> Generating Notes...';
      output.classList.add('hidden');

      try {
        currentRaw   = await generate(topic, options);
        currentTopic = topic;
        renderedHTML = MDRenderer.render(currentRaw);

        if (titleEl) titleEl.textContent = `📝 ${topic} — Study Notes`;
        content.innerHTML = `<div class="msg-bubble" style="background:transparent;padding:0;">${renderedHTML}</div>`;
        output.classList.remove('hidden');
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
        Toast.success('Notes generated! Download as PDF or copy.');
      } catch (e) {
        Toast.error('Failed to generate notes.');
        console.error(e);
      } finally {
        genBtn.disabled = false;
        genBtn.innerHTML = '<i class="fas fa-file-alt"></i> Generate Notes';
      }

      // Store rendered HTML for PDF
      dlBtn._renderedHTML = renderedHTML;
    });

    dlBtn?.addEventListener('click', async () => {
      if (!currentRaw) { Toast.error('No notes to download. Generate notes first.'); return; }

      if (typeof html2pdf === 'undefined') {
        Toast.error('PDF library not loaded. Check your internet connection.');
        return;
      }

      dlBtn.disabled = true;
      dlBtn.innerHTML = '<span class="spinner"></span> Building PDF...';

      try {
        const html = MDRenderer.render(currentRaw);
        await downloadPDF(currentTopic, html);
      } catch (e) {
        Toast.error('PDF export failed. Try copying instead.');
        console.error(e);
      } finally {
        dlBtn.disabled = false;
        dlBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
      }
    });

    copyBtn?.addEventListener('click', () => {
      if (!currentRaw) { Toast.error('No notes to copy.'); return; }
      navigator.clipboard.writeText(currentRaw).then(() => {
        Toast.success('Notes copied to clipboard!');
      });
    });

    // Enter on textarea
    topicTA.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); genBtn.click(); }
    });
  }

  return { init };
})();
