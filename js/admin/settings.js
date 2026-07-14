/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\admin\settings.js */

class AdminSettings {
  constructor(api, auth) {
    this.api = api;
    this.auth = auth;
    this.cache = {};
  }

  async loadData(filename) {
    try {
      const data = await this.api.readFile(`data/${filename}`);
      this.cache[filename] = data;
      return data.content;
    } catch (e) {
      throw e;
    }
  }

  async saveData(filename, content, message) {
    try {
      const cached = this.cache[filename];
      const res = await this.api.writeFile(`data/${filename}`, content, message, cached ? cached.sha : null);
      this.cache[filename] = {
        content: content,
        sha: res.content.sha
      };
      this.showToast('Settings saved to repository.', 'success');
      return true;
    } catch (e) {
      console.error(e);
      this.showToast(`Settings commit error: ${e.message}`, 'error');
      return false;
    }
  }

  async render(container) {
    container.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';

    try {
      const settings = await this.loadData('settings.json');
      const social = await this.loadData('social.json');

      container.innerHTML = `
        <div class="admin-card glass glow">
          <h2 class="admin-card-title">passcode_auth_reset</h2>
          <form id="form-reset-password" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="sett-curr-pass">Current Password:</label>
              <input class="form-input" type="password" id="sett-curr-pass" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="sett-new-pass">New Password:</label>
              <input class="form-input" type="password" id="sett-new-pass" required placeholder="Min 8 chars">
            </div>
            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Update Password</button>
            </div>
          </form>
        </div>

        <div class="admin-card glass glow">
          <h2 class="admin-card-title">ai_teacher_password_reset</h2>
          <form id="form-ai-password" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="sett-ai-curr-pass">Current AI Chat Password:</label>
              <input class="form-input" type="password" id="sett-ai-curr-pass" required placeholder="Default: haideradmin">
            </div>
            <div class="form-group">
              <label class="form-label" for="sett-ai-new-pass">New AI Chat Password:</label>
              <input class="form-input" type="password" id="sett-ai-new-pass" required>
            </div>
            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Update AI Password</button>
            </div>
          </form>
        </div>

        <div class="admin-card glass glow">
          <h2 class="admin-card-title">site_access_control</h2>
          <form id="form-site-access" class="admin-form-grid">
            <div class="form-group admin-form-full">
              <div class="toggle-switch-container">
                <div class="toggle-switch ${settings.siteLoginEnabled ? 'active' : ''}" id="sett-site-auth-toggle">
                  <div class="toggle-knob"></div>
                </div>
                <span class="form-label" style="margin:0;">Lock entire portfolio view behind access password</span>
              </div>
            </div>
            <div class="form-group" id="sett-site-pass-group" style="${settings.siteLoginEnabled ? '' : 'display:none;'}">
              <label class="form-label" for="sett-site-pass">Portfolio Passphrase:</label>
              <input class="form-input" type="text" id="sett-site-pass" value="${sanitizeHTML(settings.siteLoginPassword || '')}">
            </div>
            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Save Access Settings</button>
            </div>
          </form>
        </div>

        <div class="admin-card glass glow">
          <h2 class="admin-card-title">social_accounts_links</h2>
          <form id="form-social" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="soc-li">LinkedIn Profile URL:</label>
              <input class="form-input" type="url" id="soc-li" value="${sanitizeHTML(social.linkedin)}" placeholder="https://linkedin.com/in/...">
            </div>
            <div class="form-group">
              <label class="form-label" for="soc-gh">GitHub Profile URL:</label>
              <input class="form-input" type="url" id="soc-gh" value="${sanitizeHTML(social.github)}" placeholder="https://github.com/...">
            </div>
            <div class="form-group">
              <label class="form-label" for="soc-ig">Instagram URL:</label>
              <input class="form-input" type="url" id="soc-ig" value="${sanitizeHTML(social.instagram)}" placeholder="https://instagram.com/...">
            </div>
            <div class="form-group">
              <label class="form-label" for="soc-email">Public Email Address:</label>
              <input class="form-input" type="email" id="soc-email" value="${sanitizeHTML(social.email)}" placeholder="contact@haiderali.dev">
            </div>
            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Save Social Profiles</button>
            </div>
          </form>
        </div>

        <div class="admin-card glass glow">
          <h2 class="admin-card-title">company_brand_theme</h2>
          <form id="form-company" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="sett-comp-name">Company Name:</label>
              <input class="form-input" type="text" id="sett-comp-name" value="${sanitizeHTML(settings.company.name)}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="sett-comp-url">Company Website URL:</label>
              <div style="display:flex; gap:0.5rem;">
                <input class="form-input" type="url" id="sett-comp-url" value="${sanitizeHTML(settings.company.url)}" required style="flex:1;">
                <button type="button" id="btn-extract-theme" class="admin-btn" style="padding: 0 1rem; background: var(--bg-card); border: 1px solid var(--primary-color); color: var(--primary-color);">🪄 Auto-Extract</button>
              </div>
              <input type="hidden" id="sett-comp-logo" value="${sanitizeHTML(settings.company.logoUrl || '')}">
              <div id="extract-status" style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-muted);"></div>
            </div>
            <div class="form-group">
              <label class="form-label">Brand Primary Color (affects Company Theme):</label>
              <div class="color-picker-group">
                <input class="color-picker-input" type="color" id="sett-comp-col1" value="${settings.company.primaryColor || '#2563eb'}">
                <span style="font-family:monospace;">${settings.company.primaryColor || '#2563eb'}</span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Brand Secondary Color:</label>
              <div class="color-picker-group">
                <input class="color-picker-input" type="color" id="sett-comp-col2" value="${settings.company.secondaryColor || '#1e40af'}">
                <span style="font-family:monospace;">${settings.company.secondaryColor || '#1e40af'}</span>
              </div>
            </div>
            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Save Company Styling</button>
            </div>
          </form>
        </div>

        <div class="admin-card glass glow">
          <h2 class="admin-card-title">seo_optimization_settings</h2>
          <form id="form-seo" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="sett-seo-title">Meta Title:</label>
              <input class="form-input" type="text" id="sett-seo-title" value="${sanitizeHTML(settings.seo.title)}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="sett-seo-keywords">Keywords (comma-separated):</label>
              <input class="form-input" type="text" id="sett-seo-keywords" value="${sanitizeHTML(settings.seo.keywords)}" required>
            </div>
            <div class="form-group admin-form-full">
              <label class="form-label" for="sett-seo-desc">Meta Description:</label>
              <textarea class="form-textarea" id="sett-seo-desc" required style="min-height: 80px;">${sanitizeHTML(settings.seo.description)}</textarea>
            </div>
            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Save SEO Rules</button>
            </div>
          </form>
        </div>

        <div class="admin-card glass glow">
          <h2 class="admin-card-title">web3forms_contact_gateway</h2>
          <form id="form-web3forms" class="admin-form-grid">
            <div class="form-group admin-form-full">
              <label class="form-label" for="sett-web3key">Web3Forms Access Key:</label>
              <input class="form-input" type="password" id="sett-web3key" value="${sanitizeHTML(settings.web3formsKey || '')}" placeholder="Paste access key token here">
              <p style="font-size:0.8rem; color:var(--text-secondary); margin-top: 5px;">
                Get a free delivery API key from <a href="https://web3forms.com" target="_blank" style="color:var(--accent-primary)">web3forms.com</a> to receive contact form emails.
              </p>
            </div>
            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Link Gateway Key</button>
            </div>
          </form>
        </div>
      `;

      // 1. Password Reset Handler
      container.querySelector('#form-reset-password').addEventListener('submit', async (e) => {
        e.preventDefault();
        const curr = document.getElementById('sett-curr-pass').value;
        const nPass = document.getElementById('sett-new-pass').value;

        if (nPass.length < 8) {
          this.showToast('New password must be at least 8 characters long.', 'error');
          return;
        }

        const bcrypt = window.bcrypt || (window.dcodeIO && window.dcodeIO.bcrypt);
        let isValid = false;

        if (settings.defaultPassword && curr === 'admin123') {
          isValid = true;
        } else if (bcrypt && bcrypt.compareSync(curr, settings.adminPasswordHash)) {
          isValid = true;
        }

        if (isValid) {
          const newHash = bcrypt.hashSync(nPass, 12);
          settings.adminPasswordHash = newHash;
          settings.defaultPassword = false;

          const success = await this.saveData('settings.json', settings, 'Reset admin control password');
          if (success) {
            document.getElementById('sett-curr-pass').value = '';
            document.getElementById('sett-new-pass').value = '';
          }
        } else {
          this.showToast('Current passphrase confirmation rejected.', 'error');
        }
      });

      // 1b. AI Teacher Password Reset
      container.querySelector('#form-ai-password').addEventListener('submit', async (e) => {
        e.preventDefault();
        const curr = document.getElementById('sett-ai-curr-pass').value;
        const nPass = document.getElementById('sett-ai-new-pass').value;
        
        try {
          const response = await fetch('https://haider-ai-backend.futurehacker-7-8-7.workers.dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'change_password',
              adminPassword: curr,
              newPassword: nPass
            })
          });

          if (!response.ok) throw new Error('Failed to update password');
          
          const data = await response.json();
          if (data.success) {
            this.showToast('AI Teacher Password updated successfully in Cloudflare!', 'success');
            document.getElementById('sett-ai-curr-pass').value = '';
            document.getElementById('sett-ai-new-pass').value = '';
          } else {
            throw new Error(data.error || 'Failed');
          }
        } catch (error) {
          this.showToast('AI Password reset rejected. Check current password.', 'error');
        }
      });

      // 2. Site Access Switch Toggles
      const accessToggle = container.querySelector('#sett-site-auth-toggle');
      const passGroup = container.querySelector('#sett-site-pass-group');
      let siteAuthEnabled = settings.siteLoginEnabled;

      accessToggle.addEventListener('click', () => {
        accessToggle.classList.toggle('active');
        siteAuthEnabled = accessToggle.classList.contains('active');
        passGroup.style.display = siteAuthEnabled ? 'block' : 'none';
      });

      container.querySelector('#form-site-access').addEventListener('submit', async (e) => {
        e.preventDefault();
        settings.siteLoginEnabled = siteAuthEnabled;
        settings.siteLoginPassword = document.getElementById('sett-site-pass').value;
        await this.saveData('settings.json', settings, 'Update site access policy');
      });

      // 3. Social Media URLs
      container.querySelector('#form-social').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
          linkedin: document.getElementById('soc-li').value,
          github: document.getElementById('soc-gh').value,
          instagram: document.getElementById('soc-ig').value,
          email: document.getElementById('soc-email').value
        };
        await this.saveData('social.json', payload, 'Update social media account links');
      });

      // 4. Company Styling Settings
      container.querySelectorAll('.color-picker-input').forEach(picker => {
        picker.addEventListener('input', () => {
          picker.nextElementSibling.innerText = picker.value;
        });
      });

      const extractBtn = container.querySelector('#btn-extract-theme');
      const urlInput = container.querySelector('#sett-comp-url');
      const statusText = container.querySelector('#extract-status');
      const col1Input = container.querySelector('#sett-comp-col1');
      const col2Input = container.querySelector('#sett-comp-col2');
      const logoInput = container.querySelector('#sett-comp-logo');

      if (settings.company.logoUrl) {
         statusText.innerHTML = `Current Logo: <img src="${settings.company.logoUrl}" style="height:20px; vertical-align:middle; margin-left:10px; border-radius:4px;">`;
      }

      extractBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
          statusText.innerText = 'Please enter a valid URL first.';
          return;
        }
        
        statusText.innerText = 'Analyzing website...';
        extractBtn.disabled = true;

        try {
          const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&palette=true`);
          const data = await res.json();

          if (data.status === 'success') {
            const logo = data.data.logo?.url || data.data.image?.url;
            // Fallback to existing colors if microlink doesn't find palette
            const primary = data.data.logo?.background_color || data.data.image?.background_color || col1Input.value;
            const secondary = data.data.logo?.color || data.data.image?.color || col2Input.value;

            col1Input.value = primary;
            col1Input.nextElementSibling.innerText = primary;
            col2Input.value = secondary;
            col2Input.nextElementSibling.innerText = secondary;
            
            if (logo) {
              logoInput.value = logo;
              statusText.innerHTML = `<span style="color:#4ade80;">Theme extracted successfully!</span> <img src="${logo}" style="height:20px; vertical-align:middle; margin-left:10px; border-radius:4px;">`;
            } else {
              logoInput.value = '';
              statusText.innerHTML = `<span style="color:#4ade80;">Colors extracted, but no logo found.</span>`;
            }
          } else {
            throw new Error('Failed to parse website');
          }
        } catch (e) {
          statusText.innerHTML = `<span style="color:#f87171;">Extraction failed: ${e.message}</span>`;
        } finally {
          extractBtn.disabled = false;
        }
      });

      container.querySelector('#form-company').addEventListener('submit', async (e) => {
        e.preventDefault();
        settings.company = {
          name: document.getElementById('sett-comp-name').value,
          url: document.getElementById('sett-comp-url').value,
          primaryColor: document.getElementById('sett-comp-col1').value,
          secondaryColor: document.getElementById('sett-comp-col2').value,
          logoUrl: document.getElementById('sett-comp-logo').value
        };
        await this.saveData('settings.json', settings, 'Update current company styling profile');
      });

      // 5. SEO optimization
      container.querySelector('#form-seo').addEventListener('submit', async (e) => {
        e.preventDefault();
        settings.seo = {
          title: document.getElementById('sett-seo-title').value,
          keywords: document.getElementById('sett-seo-keywords').value,
          description: document.getElementById('sett-seo-desc').value
        };
        await this.saveData('settings.json', settings, 'Update global search index metadata');
      });

      // 6. Web3Forms Key Link
      container.querySelector('#form-web3forms').addEventListener('submit', async (e) => {
        e.preventDefault();
        settings.web3formsKey = document.getElementById('sett-web3key').value;
        await this.saveData('settings.json', settings, 'Link Web3Forms gateway token');
      });

    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="form-status error" style="display:block;">Settings renderer failure: ${err.message}</div>`;
    }
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

function sanitizeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#039;';
    }
  });
}

window.AdminSettings = AdminSettings;
