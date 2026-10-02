/* js/palette.js */
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.createElement('div');
  overlay.className = 'palette-overlay';
  overlay.innerHTML = `
    <div class="palette-modal">
      <div class="palette-header">
        <i class="ph ph-magnifying-glass"></i>
        <input type="text" id="palette-input" placeholder="Search commands, navigate, or run tools..." autocomplete="off">
        <span class="palette-esc">ESC</span>
      </div>
      <div class="palette-results" id="palette-results"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = document.getElementById('palette-input');
  const resultsContainer = document.getElementById('palette-results');
  let isVisible = false;

  const commands = [
    { id: 'nav-home', icon: 'ph-house', title: 'Go to Home', action: () => window.location.hash = 'hero' },
    { id: 'nav-exp', icon: 'ph-briefcase', title: 'Go to Experience', action: () => window.location.hash = 'experience' },
    { id: 'nav-proj', icon: 'ph-code', title: 'Go to Projects', action: () => window.location.hash = 'projects' },
    { id: 'nav-tools', icon: 'ph-wrench', title: 'Go to Tools', action: () => window.location.hash = 'tools' },
    { id: 'nav-blog', icon: 'ph-article', title: 'Go to Write-ups', action: () => window.location.hash = 'blog' },
    { id: 'act-email', icon: 'ph-envelope-simple', title: 'Copy Email Address', action: () => { // SECURITY FIX (L1): Dynamically read email from DOM instead of hardcoding
    const emailLink = document.querySelector('.social-btn.email');
    const email = emailLink ? emailLink.getAttribute('href').replace('mailto:', '') : '';
    navigator.clipboard.writeText(email); showToast('Email copied to clipboard'); } },
    { id: 'easter-flag', icon: 'ph-flag', title: 'Submit Flag', action: () => { showToast('Use the terminal for this.', 'info'); } }
  ];

  let selectedIndex = 0;
  let filtered = [...commands];

  function togglePalette() {
    isVisible = !isVisible;
    if (isVisible) {
      overlay.classList.add('visible');
      input.value = '';
      input.focus();
      filterResults('');
    } else {
      overlay.classList.remove('visible');
    }
  }

  function filterResults(query) {
    const q = query.toLowerCase();
    filtered = commands.filter(c => c.title.toLowerCase().includes(q));
    selectedIndex = 0;
    renderResults();
  }

  function renderResults() {
    resultsContainer.innerHTML = '';
    if (filtered.length === 0) {
      resultsContainer.innerHTML = '<div class="palette-empty">No results found.</div>';
      return;
    }
    filtered.forEach((cmd, i) => {
      const el = document.createElement('div');
      el.className = `palette-item ${i === selectedIndex ? 'selected' : ''}`;
      el.innerHTML = `<i class="ph ${cmd.icon}"></i> <span>${cmd.title}</span>`;
      el.addEventListener('click', () => {
        cmd.action();
        togglePalette();
      });
      el.addEventListener('mouseenter', () => {
        selectedIndex = i;
        renderResults();
      });
      resultsContainer.appendChild(el);
    });
  }

  input.addEventListener('input', (e) => filterResults(e.target.value));
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % filtered.length;
      renderResults();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
      renderResults();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        togglePalette();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      togglePalette();
    }
    if (e.key === 'Escape' && isVisible) {
      togglePalette();
    }
  });

  const btn = document.getElementById('cmd-k-btn');
  if (btn) btn.addEventListener('click', togglePalette);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) togglePalette();
  });
});

