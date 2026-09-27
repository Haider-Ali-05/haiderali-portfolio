/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\admin\auth.js */

class AdminAuth {
  constructor() {
    this.storageKey = 'admin_session';
    this.patKey = 'github_pat_info';
  }

  init() {
    this.setupLoginHandler();
    this.setupLogoutHandler();

    // Check if password is valid in session
    if (this.isPasswordAuthenticated()) {
      const password = sessionStorage.getItem('admin_pwd_secret');
      if (password) {
        const api = new window.GitHubAPI(password);
        window.onAdminReady(api);
      }
    }
  }

  setupLoginHandler() {
    const form = document.getElementById('admin-login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const passInput = document.getElementById('admin-pass');
      const password = passInput.value;

      if (this.isRateLimited()) {
        this.showToast('Login locked due to suspicious activity. Wait 15 minutes.', 'error');
        return;
      }

      try {
        const res = await fetch('data/settings.json?t=' + Date.now());
        const settings = await res.json();
        
        const hash = settings.adminPasswordHash;
        
        // Strictly verify via bcrypt hash
        const bcrypt = window.bcrypt || (window.dcodeIO && window.dcodeIO.bcrypt);
        let isValid = false;
        
        if (bcrypt && hash) {
          isValid = bcrypt.compareSync(password, hash);
        } else {
          throw new Error('Security verification module failed to load.');
        }
        
        if (isValid) {
          sessionStorage.setItem(this.storageKey, 'true');
          sessionStorage.setItem('admin_pwd_secret', password);
          this.showToast('Authentication validated. Welcome back.', 'success');
          
          if (settings.defaultPassword) {
            this.showToast('Security Warning: You are using the default password. Reset it in Settings.', 'error');
          }

          const api = new window.GitHubAPI(password);
          window.onAdminReady(api);
        } else {
          this.recordFailedAttempt();
          this.showToast('Invalid access credentials.', 'error');
          passInput.value = '';
        }
      } catch (err) {
        console.error(err);
        this.showToast(`Error: ${err.message}`, 'error');
      }
    });
  }

  // PAT logic completely removed for security

  setupLogoutHandler() {
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  logout() {
    sessionStorage.removeItem(this.storageKey);
    sessionStorage.removeItem('admin_pwd_secret');
    this.showToast('Console session terminated.', 'info');
    setTimeout(() => window.location.reload(), 1000);
  }

  isPasswordAuthenticated() {
    return sessionStorage.getItem(this.storageKey) === 'true';
  }

  // showPatView and isPatLinked removed

  /* Brute force lock control (max 5 attempts, 15 minutes lock) */
  isRateLimited() {
    const attempts = JSON.parse(localStorage.getItem('admin_login_attempts') || '[]');
    const now = Date.now();
    const active = attempts.filter(time => now - time < 15 * 60 * 1000);
    return active.length >= 5;
  }

  recordFailedAttempt() {
    const attempts = JSON.parse(localStorage.getItem('admin_login_attempts') || '[]');
    attempts.push(Date.now());
    localStorage.setItem('admin_login_attempts', JSON.stringify(attempts));
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

window.AdminAuth = AdminAuth;
