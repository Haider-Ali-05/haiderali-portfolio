/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\admin\ai-teach.js */

class AiTeacher {
  constructor(auth) {
    this.auth = auth;
    this.backendUrl = 'https://haider-ai-backend.futurehacker-7-8-7.workers.dev';
    this.messageHistory = [];
  }

  getPassword() {
    if (this.auth && typeof this.auth.getPassword === 'function') {
      const pwd = this.auth.getPassword();
      if (pwd) return pwd;
    }
    return sessionStorage.getItem('admin_pwd_secret') || '';
  }

  async render(container) {
    container.innerHTML = `
      <div class="admin-card glass glow">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 1.2rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 class="admin-card-title" style="margin-bottom: 0.3rem; border: none; padding: 0;">ai_memory_teacher</h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
              Teach Nexus new facts about yourself. The AI automatically extracts new information and saves it permanently to Cloudflare KV.
            </p>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <span style="display: inline-flex; align-items: center; gap: 6px; background: rgba(0, 240, 255, 0.1); color: var(--accent-primary); border: 1px solid var(--border-color); padding: 0.4rem 0.9rem; border-radius: 20px; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #4ade80; display: inline-block;"></span>
              auth: active_session
            </span>
            <button type="button" id="btn-toggle-ai-settings" class="admin-btn admin-btn-secondary admin-btn-sm">
              ⚙️ AI Options
            </button>
          </div>
        </div>

        <!-- Optional AI Credentials & Password Drawer -->
        <div id="ai-settings-drawer" style="display: none; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.2rem; margin-bottom: 1.5rem;">
          <h3 style="font-size: 0.95rem; margin-top: 0; margin-bottom: 0.5rem; font-family: 'JetBrains Mono', monospace; color: var(--accent-primary);">&gt; ai_teacher_credentials</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
            AI Teach automatically uses your current admin session password. You can also change the AI backend password stored in Cloudflare KV below.
          </p>
          <div class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="custom-ai-pass">Custom AI Passphrase (Optional):</label>
              <input class="form-input" type="password" id="custom-ai-pass" placeholder="Leave empty to use active session password">
            </div>
            <div class="form-group">
              <label class="form-label" for="new-ai-pass">Change Cloudflare AI Password:</label>
              <input class="form-input" type="password" id="new-ai-pass" placeholder="Enter new AI password">
            </div>
            <div class="admin-btn-group admin-form-full" style="margin-top: 0.5rem; display: flex; align-items: center; gap: 1rem;">
              <button type="button" id="btn-save-new-ai-pass" class="admin-btn admin-btn-primary admin-btn-sm">Update AI Password</button>
              <span id="ai-pass-status" style="font-size: 0.85rem; font-family: monospace;"></span>
            </div>
          </div>
        </div>

        <!-- Cyber AI Chat Console -->
        <div class="ai-console-wrapper" style="display: flex; flex-direction: column; height: 530px; background: rgba(0, 0, 0, 0.35); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden;">
          
          <!-- Terminal Header Bar -->
          <div style="background: var(--bg-secondary); padding: 0.6rem 1rem; border-bottom: 1px solid var(--border-color); font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--accent-primary); display: flex; align-items: center; gap: 8px;">
              <span>🤖</span> <span>nexus_core &gt; persistent_memory_sync</span>
            </span>
            <span style="color: var(--text-muted); font-size: 0.78rem;">Target: Cloudflare KV (dynamic_facts)</span>
          </div>

          <!-- Chat Stream -->
          <div id="ai-teach-stream" style="flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
            <!-- Welcome message -->
            <div class="ai-bubble-row" style="display: flex; justify-content: flex-start;">
              <div style="max-width: 85%; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 1rem 1.2rem; border-radius: 10px; font-size: 0.95rem; line-height: 1.6; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <div style="font-weight: 700; color: var(--accent-primary); font-size: 0.8rem; margin-bottom: 0.4rem; font-family: 'JetBrains Mono', monospace;">NEXUS AI ASSISTANT</div>
                Hello Haider! What would you like to teach me today? Share any recent achievements, current projects, certifications, or facts about you. I will extract and save them permanently to my memory.
              </div>
            </div>
          </div>

          <!-- Quick Suggestion Chips -->
          <div style="padding: 0.6rem 1rem; background: rgba(0, 0, 0, 0.2); border-top: 1px solid var(--border-color); display: flex; gap: 0.6rem; overflow-x: auto; white-space: nowrap;">
            <button type="button" class="ai-teach-chip" data-prompt="I recently achieved a new milestone: " style="background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.8rem; padding: 0.35rem 0.8rem; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-family: monospace;">+ Achievement</button>
            <button type="button" class="ai-teach-chip" data-prompt="I am currently building " style="background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.8rem; padding: 0.35rem 0.8rem; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-family: monospace;">+ Active Project</button>
            <button type="button" class="ai-teach-chip" data-prompt="I recently added expertise in " style="background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.8rem; padding: 0.35rem 0.8rem; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-family: monospace;">+ New Skill</button>
            <button type="button" class="ai-teach-chip" data-prompt="My current availability status is " style="background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.8rem; padding: 0.35rem 0.8rem; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-family: monospace;">+ Availability</button>
          </div>

          <!-- Input Bar -->
          <div style="padding: 1rem; background: var(--bg-secondary); border-top: 1px solid var(--border-color); display: flex; gap: 0.75rem;">
            <input type="text" id="ai-teach-input" class="form-input" style="margin: 0; flex: 1;" placeholder="Teach Nexus something new (e.g. I recently earned a new certification...)">
            <button type="button" id="ai-teach-submit" class="admin-btn admin-btn-primary" style="white-space: nowrap; display: inline-flex; align-items: center; gap: 8px;">
              <span>Teach AI</span> ⚡
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  bindEvents(container) {
    const stream = container.querySelector('#ai-teach-stream');
    const input = container.querySelector('#ai-teach-input');
    const submitBtn = container.querySelector('#ai-teach-submit');
    const chips = container.querySelectorAll('.ai-teach-chip');
    const toggleSettingsBtn = container.querySelector('#btn-toggle-ai-settings');
    const settingsDrawer = container.querySelector('#ai-settings-drawer');
    const saveNewPassBtn = container.querySelector('#btn-save-new-ai-pass');
    const customPassInput = container.querySelector('#custom-ai-pass');
    const newPassInput = container.querySelector('#new-ai-pass');
    const passStatus = container.querySelector('#ai-pass-status');

    // Chips click handler
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        input.value = chip.dataset.prompt;
        input.focus();
      });
    });

    // Toggle settings drawer
    if (toggleSettingsBtn && settingsDrawer) {
      toggleSettingsBtn.addEventListener('click', () => {
        settingsDrawer.style.display = settingsDrawer.style.display === 'none' ? 'block' : 'none';
      });
    }

    // Change password handler
    if (saveNewPassBtn) {
      saveNewPassBtn.addEventListener('click', async () => {
        const newPass = newPassInput.value.trim();
        if (!newPass) {
          passStatus.textContent = 'Enter a new password first.';
          passStatus.style.color = 'var(--accent-danger)';
          return;
        }

        const effectivePassword = customPassInput.value.trim() || this.getPassword();
        passStatus.textContent = 'Updating...';
        passStatus.style.color = 'var(--text-muted)';

        try {
          const res = await fetch(this.backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'change_password',
              adminPassword: effectivePassword,
              newPassword: newPass
            })
          });

          const data = await res.json();
          if (res.ok && data.success) {
            passStatus.textContent = '✓ Password updated successfully in KV!';
            passStatus.style.color = '#4ade80';
            sessionStorage.setItem('admin_pwd_secret', newPass);
            newPassInput.value = '';
            setTimeout(() => {
              settingsDrawer.style.display = 'none';
              passStatus.textContent = '';
            }, 2500);
          } else {
            throw new Error(data.error || 'Failed to update password');
          }
        } catch (err) {
          passStatus.textContent = `Error: ${err.message}`;
          passStatus.style.color = 'var(--accent-danger)';
        }
      });
    }

    // Send Message Handler
    const handleSend = async () => {
      const text = input.value.trim();
      if (!text) return;

      const effectivePassword = (customPassInput && customPassInput.value.trim()) || this.getPassword();
      if (!effectivePassword) {
        this.appendRow(stream, 'ai', 'No admin credentials detected in session. Please relogin or provide custom password in AI Options.');
        return;
      }

      // Add user message
      this.appendRow(stream, 'user', text);
      input.value = '';
      this.messageHistory.push({ role: 'user', text: text });

      // Add temporary loading indicator
      const loaderId = 'ai-teaching-' + Date.now();
      const loaderRow = document.createElement('div');
      loaderRow.id = loaderId;
      loaderRow.className = 'ai-bubble-row';
      loaderRow.style.display = 'flex';
      loaderRow.style.justifyContent = 'flex-start';
      loaderRow.innerHTML = `
        <div style="max-width: 85%; background: var(--bg-secondary); border: 1px dashed var(--accent-primary); color: var(--accent-primary); padding: 0.8rem 1.2rem; border-radius: 10px; font-size: 0.9rem; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 8px;">
          <span class="loading-spinner" style="width: 14px; height: 14px; border-width: 2px; margin: 0; display: inline-block;"></span>
          <span>nexus_learning: extracting & committing facts to Cloudflare KV...</span>
        </div>
      `;
      stream.appendChild(loaderRow);
      stream.scrollTop = stream.scrollHeight;

      submitBtn.disabled = true;

      try {
        const response = await fetch(this.backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: this.messageHistory,
            adminPassword: effectivePassword
          })
        });

        document.getElementById(loaderId)?.remove();

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply = data.reply || 'Fact processed successfully!';
        this.messageHistory.push({ role: 'ai', text: reply });
        this.appendRow(stream, 'ai', reply);
        this.showToast('Fact memorized into Cloudflare KV!', 'success');

      } catch (err) {
        console.error('AI Teach Error:', err);
        document.getElementById(loaderId)?.remove();
        this.messageHistory.pop(); // Remove the unanswered user message
        this.appendRow(stream, 'ai', `⚠️ Could not synchronize memory: ${err.message}. If the AI password differs from your admin session password, configure it via 'AI Options' above.`);
        this.showToast(`Error: ${err.message}`, 'error');
      } finally {
        submitBtn.disabled = false;
        input.focus();
      }
    };

    submitBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  appendRow(stream, role, text) {
    const row = document.createElement('div');
    row.className = 'ai-bubble-row';
    row.style.display = 'flex';
    row.style.justifyContent = role === 'user' ? 'flex-end' : 'flex-start';

    const bubble = document.createElement('div');
    bubble.style.maxWidth = '85%';
    bubble.style.padding = '0.9rem 1.2rem';
    bubble.style.borderRadius = '10px';
    bubble.style.fontSize = '0.95rem';
    bubble.style.lineHeight = '1.6';
    bubble.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';

    if (role === 'user') {
      bubble.style.background = 'var(--gradient-accent)';
      bubble.style.color = '#000';
      bubble.style.fontWeight = '500';
      bubble.textContent = text;
    } else {
      bubble.style.background = 'var(--bg-secondary)';
      bubble.style.border = '1px solid var(--border-color)';
      bubble.style.color = 'var(--text-primary)';
      
      const badge = document.createElement('div');
      badge.style.fontWeight = '700';
      badge.style.color = 'var(--accent-primary)';
      badge.style.fontSize = '0.8rem';
      badge.style.marginBottom = '0.4rem';
      badge.style.fontFamily = "'JetBrains Mono', monospace";
      badge.textContent = 'NEXUS AI ASSISTANT';
      bubble.appendChild(badge);

      const contentDiv = document.createElement('div');
      contentDiv.textContent = text;
      bubble.appendChild(contentDiv);
    }

    row.appendChild(bubble);
    stream.appendChild(row);
    stream.scrollTop = stream.scrollHeight;
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('admin-toast-container') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast glass ${type}`;
    toast.style.position = 'fixed';
    toast.style.top = '1rem';
    toast.style.right = '1rem';
    toast.style.zIndex = '3500';
    toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close">&times;</button>
    `;
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

window.AiTeacher = AiTeacher;
