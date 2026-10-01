import sys, re
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix social SVG icons
html = re.sub(r'<a class="social-btn linkedin".*?</svg>\s*</a>', '<a class="social-btn linkedin" href="#" target="_blank" aria-label="LinkedIn"><i class="ph ph-linkedin-logo"></i></a>', html, flags=re.DOTALL)
html = re.sub(r'<a class="social-btn github".*?</svg>\s*</a>', '<a class="social-btn github" href="#" target="_blank" aria-label="GitHub"><i class="ph ph-github-logo"></i></a>', html, flags=re.DOTALL)
html = re.sub(r'<a class="social-btn instagram".*?</svg>\s*</a>', '<a class="social-btn instagram" href="#" target="_blank" aria-label="Instagram"><i class="ph ph-instagram-logo"></i></a>', html, flags=re.DOTALL)
html = re.sub(r'<a class="social-btn email".*?</svg>\s*</a>', '<a class="social-btn email" href="#" aria-label="Email"><i class="ph ph-envelope-simple"></i></a>', html, flags=re.DOTALL)

# 2. Extract Nexus and append it before </body>
nexusHtml = """
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
      <div class="chat-suggestion-pills" id="chat-suggestions">
        <button class="suggestion-pill" data-query="Who is Haider Ali?">Who is Haider?</button>
        <button class="suggestion-pill" data-query="What security projects has he built?">His projects</button>
        <button class="suggestion-pill" data-query="What tools does he use?">Tools used</button>
        <button class="suggestion-pill" data-query="Tell me about his cybersecurity experience">Experience</button>
      </div>
      <div class="chat-input-area">
        <textarea id="ai-chat-input" placeholder="Ask about Haider..." rows="1"></textarea>
        <button id="ai-chat-send" aria-label="Send message">
          <i class="ph ph-paper-plane-right" style="font-size: 1.2rem;"></i>
        </button>
      </div>
    </div>
  </div>
"""

# Remove Nexus docked
html = re.sub(r'<!-- AI Chat \(Docked\).*?</div>\s*</div>\s*</div>', '<!-- AI Chat removed -->\n          </div>\n        </div>\n', html, flags=re.DOTALL)

# Remove .dual-grid wrapper from the terminal section
# wait, .dual-grid is not in index.html, it's just <div class="container"> in <section class="dual-section">
# I'll just append Nexus before </body>
html = html.replace('</body>', f'{nexusHtml}\n</body>')

# 3. Update ShadowTrace
shadowHtml = """
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
"""
html = re.sub(r'<div class="featured-tool-card glass">.*?Launch Tool.*?</div>\s*</div>', shadowHtml, html, flags=re.DOTALL)

# 4. Footer links
footerNav = """      <div class="footer-links">
        <a href="#hero">Home</a>
        <a href="#experience">Experience</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#tools">Tools</a>
        <a href="#blog">Write-ups</a>
        <a href="#contact">Contact</a>
      </div>"""
html = re.sub(r'<div class="footer-links">.*?</div>', footerNav, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
