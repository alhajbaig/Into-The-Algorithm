/* ═══════════════════════════════════════════════════
   App Bootstrap — Module Router + Initialization
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Module Router ──
  const modules = ['chat', 'socratic', 'explain', 'notes', 'image'];

  function switchModule(name) {
    // Hide all modules
    modules.forEach(m => {
      document.getElementById(`module-${m}`)?.classList.remove('active');
    });
    // Deactivate all nav tabs
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    // Show selected
    document.getElementById(`module-${name}`)?.classList.add('active');
    document.querySelector(`.nav-tab[data-module="${name}"]`)?.classList.add('active');
  }

  // Bind nav tabs
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchModule(tab.dataset.module));
  });

  // ── Theme Toggle ──
  const themes = ['default', 'cyber', 'aurora'];
  let themeIdx = 0;
  const themeColors = [
    { primary: '#7c3aed', secondary: '#2563eb' },  // default purple/blue
    { primary: '#06b6d4', secondary: '#7c3aed' },  // cyber cyan/purple
    { primary: '#10b981', secondary: '#2563eb' },  // aurora green/blue
  ];

  document.getElementById('btn-theme')?.addEventListener('click', () => {
    themeIdx = (themeIdx + 1) % themes.length;
    const c = themeColors[themeIdx];
    document.documentElement.style.setProperty('--purple-500', c.primary);
    document.documentElement.style.setProperty('--electric',   c.primary);
    document.documentElement.style.setProperty('--blue-600',   c.secondary);
    document.documentElement.style.setProperty('--neon-purple', c.primary);
    document.documentElement.style.setProperty('--grad-primary',
      `linear-gradient(135deg, ${c.primary}, ${c.secondary})`);
    document.documentElement.style.setProperty('--shadow-glow',
      `0 0 32px ${c.primary}4d`);
    Toast.info(`Theme: ${themes[themeIdx]}`);
  });

  // ── Keyboard Shortcuts ──
  document.addEventListener('keydown', (e) => {
    // Ctrl+1-5 switch modules
    if (e.ctrlKey && !e.shiftKey && !e.altKey) {
      const n = parseInt(e.key);
      if (n >= 1 && n <= 5) {
        e.preventDefault();
        switchModule(modules[n - 1]);
      }
    }
    // Escape → close / focus input
    if (e.key === 'Escape') {
      const input = document.getElementById('chat-input');
      if (input) input.focus();
    }
  });

  // ── Init All Modules ──
  ChatEngine.init();
  SocraticAgent.init();
  ExplainerAgent.init();
  NotesAgent.init();
  ImageAgent.init();

  // ── Startup Animation ──
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.6s ease';
    document.body.style.opacity    = '1';
  });

  // ── Console Branding ──
  console.log(
    '%c🧠 NeuralMind%c v1.0 — ML Intelligence Engine\n' +
    '%cPowered by Groq · llama-3.3-70b-versatile · Three.js',
    'font-size:24px;font-weight:900;color:#a78bfa;font-family:Orbitron,monospace;',
    'font-size:14px;color:#7c3aed;font-weight:600;',
    'font-size:12px;color:#60a5fa;'
  );

  console.log('%cModules ready:', 'color:#10b981;font-weight:600;', modules);

})();
