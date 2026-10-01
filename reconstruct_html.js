const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Vanta BG div inside hero section
html = html.replace('<section class="hero-section" id="hero">', '<section class="hero-section" id="hero">\n    <div id="vanta-bg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;"></div>');

// 2. Replace Theme Toggle with Command Palette button
const cmdBtn = `<button class="theme-toggle" id="cmd-k-btn" aria-label="Command Palette">
        <i class="ph ph-command"></i> <span style="font-size:0.75rem; font-family:'JetBrains Mono',monospace;">K</span>
      </button>`;
html = html.replace(/<button class="theme-toggle" id="theme-toggle" aria-label="Toggle Theme">[\s\S]*?<\/button>/, cmdBtn);

// 3. Social Icons
html = html.replace(/<a class="social-btn linkedin"[\s\S]*?<\/a>/g, '<a class="social-btn linkedin" href="#" target="_blank" aria-label="LinkedIn"><i class="ph ph-linkedin-logo"></i></a>');
html = html.replace(/<a class="social-btn github"[\s\S]*?<\/a>/g, '<a class="social-btn github" href="#" target="_blank" aria-label="GitHub"><i class="ph ph-github-logo"></i></a>');
html = html.replace(/<a class="social-btn instagram"[\s\S]*?<\/a>/g, '<a class="social-btn instagram" href="#" target="_blank" aria-label="Instagram"><i class="ph ph-instagram-logo"></i></a>');
html = html.replace(/<a class="social-btn email"[\s\S]*?<\/a>/g, '<a class="social-btn email" href="#" aria-label="Email"><i class="ph ph-envelope-simple"></i></a>');

// 4. Quick Access / Action buttons in hero
const actionsHtml = `<div class="hero-actions">
            <a href="#projects" class="btn-primary">View Projects <i class="ph ph-arrow-right"></i></a>
            <a href="resume.pdf" target="_blank" class="btn-secondary">Resume <i class="ph ph-download-simple"></i></a>
            <a href="#contact" class="btn-outline">Contact <i class="ph ph-paper-plane-right"></i></a>
          </div>`;
html = html.replace(/<div class="hero-actions">[\s\S]*?<\/div>/, actionsHtml);

// 5. Remove AI Chat docked and terminal dual-grid structure
html = html.replace(/<!-- Interactive Terminal -->/, `<!-- Interactive Terminal -->`);
html = html.replace(/<div class="dual-grid">/, '');
html = html.replace(/<!-- AI Chat \(Docked\) -->[\s\S]*?<\/section>/, `
          </div> <!-- End container -->
      </section>
`);

// 6. Append Nexus, Command Palette Modal, and CDNs before </body>
const nexusHtml = `
  <!-- Persistent Nexus AI Floating Bubble -->
  <div id="nexus-floating-widget" class="nexus-floating">
    <button id="nexus-bubble-btn" class="nexus-bubble">
      <i class="ph ph-robot"></i>
    </button>
    <div id="nexus-chat-popup" class="nexus-chat-popup hidden">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">N</div>
          <div>
            <h4 style="margin: 0; font-size: 0.85rem; color: var(--accent-primary); font-weight: 600;">Nexus AI Assistant</h4>
            <span class="nexus-status" id="nexus-status" style="font-size: 0.65rem; color: var(--accent-success);">online</span>
          </div>
        </div>
        <button id="nexus-close-btn" class="nexus-close"><i class="ph ph-x"></i></button>
      </div>
      <div id="ai-chat-messages" class="chat-messages">
        <div class="chat-message ai-message">
          <p>Hi! I'm Nexus, Haider's AI assistant. Ask me anything about his skills, projects, or experience.</p>
        </div>
      </div>
      <div class="chat-input-area">
        <textarea id="ai-chat-input" placeholder="Ask about Haider..." rows="1"></textarea>
        <button id="ai-chat-send" aria-label="Send message">
          <i class="ph ph-paper-plane-right" style="font-size: 1.2rem;"></i>
        </button>
      </div>
    </div>
  </div>
`;

const cmdModal = `
  <!-- Command Palette Modal -->
  <div id="cmd-palette-modal" class="cmd-palette-overlay hidden">
    <div class="cmd-palette-container">
      <div class="cmd-palette-header">
        <i class="ph ph-magnifying-glass"></i>
        <input type="text" id="cmd-palette-input" placeholder="Type a command or search..." autocomplete="off">
        <span class="cmd-palette-esc">ESC</span>
      </div>
      <div class="cmd-palette-results" id="cmd-palette-results">
        <!-- populated dynamically -->
      </div>
    </div>
  </div>
`;

const cdns = `
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.0/vanilla-tilt.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js"></script>
  <script type="module" src="js/palette.js"></script>
`;

html = html.replace('</body>', `${nexusHtml}\n${cmdModal}\n${cdns}\n</body>`);

// 7. Fix ShadowTrace
const shadowHtml = `
          <div class="featured-tool-card glass" data-tilt>
            <div class="featured-tool-content" style="flex: 1; padding: 2rem;">
              <div class="card-label" style="margin-bottom: 1rem;"><span class="dot"></span> FEATURED OSINT PLATFORM</div>
              <h3 class="featured-tool-name" style="font-size: 2rem; color: var(--accent-primary); margin-bottom: 1rem;">ShadowTrace</h3>
              <p class="featured-tool-desc" style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">Username search, EXIF analysis, and email breach checking toolkit for reconnaissance and open-source intelligence.</p>
              <div class="featured-tool-status" style="margin-bottom: 1.5rem;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; padding: 4px 8px; background: rgba(16,185,129,0.1); color: var(--accent-success); border-radius: 4px;">STATUS: ACTIVE</span>
              </div>
              <a href="osint.html" class="btn-primary">Launch Tool <i class="ph ph-rocket-launch"></i></a>
            </div>
            <div class="featured-tool-visual" style="flex: 1; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; min-height: 250px; border-left: 1px solid var(--border-color);">
              <span style="color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">[ SCREENSHOT COMING SOON ]</span>
            </div>
          </div>
`;
html = html.replace(/<div class="featured-tool-card glass">[\s\S]*?Launch Tool.*?<\/a>[\s\S]*?<\/div>[\s\S]*?<\/div>/, shadowHtml);

// 8. Footer Nav
const footerNav = `      <div class="footer-links">
        <a href="#hero">Home</a>
        <a href="#experience">Experience</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#tools">Tools</a>
        <a href="#blog">Write-ups</a>
        <a href="#contact">Contact</a>
      </div>`;
html = html.replace(/<div class="footer-links">[\s\S]*?<\/div>/, footerNav);

fs.writeFileSync('index.html', html, 'utf8');
