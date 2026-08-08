/* ═══════════════════════════════════════════════════
   Markdown + KaTeX + Highlight.js Renderer
═══════════════════════════════════════════════════ */

window.MDRenderer = (function () {

  // Configure marked
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks:   true,
      gfm:      true,
      headerIds: false,
    });

    // Custom renderer for code blocks with copy button
    const renderer = new marked.Renderer();
    renderer.code = function (code, language) {
      const lang = language || 'plaintext';
      let highlighted = code;
      try {
        if (typeof hljs !== 'undefined' && hljs.getLanguage(lang)) {
          highlighted = hljs.highlight(code, { language: lang }).value;
        } else if (typeof hljs !== 'undefined') {
          highlighted = hljs.highlightAuto(code).value;
        }
      } catch (e) { /* ignore */ }

      return `
        <div class="code-block-wrap">
          <pre><code class="hljs language-${lang}">${highlighted}</code></pre>
          <button class="copy-code-btn" onclick="MDRenderer.copyCode(this)">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>`;
    };
    marked.use({ renderer });
  }

  function render(text) {
    if (!text) return '';

    // Pre-process: protect LaTeX blocks from marked processing
    const latexBlocks = [];
    let processed = text
      .replace(/\$\$[\s\S]*?\$\$/g, (m) => {
        latexBlocks.push({ type: 'block', src: m });
        return `__LATEX_BLOCK_${latexBlocks.length - 1}__`;
      })
      .replace(/\$[^\n$]+?\$/g, (m) => {
        latexBlocks.push({ type: 'inline', src: m });
        return `__LATEX_INLINE_${latexBlocks.length - 1}__`;
      });

    // Parse markdown
    let html = typeof marked !== 'undefined' ? marked.parse(processed) : processed;

    // Restore LaTeX
    html = html.replace(/__LATEX_BLOCK_(\d+)__/g, (_, idx) => {
      try {
        const math = latexBlocks[idx].src.slice(2, -2).trim();
        return `<div class="katex-block">${katex.renderToString(math, { displayMode: true, throwOnError: false })}</div>`;
      } catch { return latexBlocks[idx].src; }
    });
    html = html.replace(/__LATEX_INLINE_(\d+)__/g, (_, idx) => {
      try {
        const math = latexBlocks[idx].src.slice(1, -1).trim();
        return katex.renderToString(math, { displayMode: false, throwOnError: false });
      } catch { return latexBlocks[idx].src; }
    });

    return html;
  }

  function copyCode(btn) {
    const pre  = btn.previousElementSibling;
    const text = pre ? pre.innerText : '';
    navigator.clipboard.writeText(text).then(() => {
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2000);
    });
  }

  return { render, copyCode };
})();
