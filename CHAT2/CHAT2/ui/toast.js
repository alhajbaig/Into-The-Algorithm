/* ═══════════════════════════════════════════════════
   Toast Notification System
═══════════════════════════════════════════════════ */

window.Toast = (function () {
  const container = document.getElementById('toast-container');
  const icons = {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    info:    'fa-circle-info',
    warn:    'fa-triangle-exclamation',
  };

  function show(message, type = 'info', duration = 3500) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <i class="fas ${icons[type] || icons.info} toast-icon"></i>
      <span>${message}</span>
    `;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    }, duration);
    return el;
  }

  return { show, success: (m, d) => show(m, 'success', d), error: (m, d) => show(m, 'error', d), info: (m, d) => show(m, 'info', d) };
})();
