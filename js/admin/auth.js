/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\admin\auth.js */

class AdminAuth {
  constructor() {
    this.storageKey = 'admin_session';
    this.patKey = 'github_pat_info';
  }

  init() {
    this.setupLoginHandler();
    this.setupPatHandler();
    this.setupLogoutHandler();

    // Check if password and PAT are already validated in session
    if (this.isPasswordAuthenticated()) {
      if (this.isPatLinked()) {
        const patInfo = this.getPatInfo();
        const api = new window.GitHubAPI(patInfo.token, patInfo.owner, patInfo.repo);
        window.onAdminReady(api);
      } else {
        this.showPatView();
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
        console.log("Fetching settings.json...");
        const res = await fetch('data/settings.json?t=' + Date.now());
        const settings = await res.json();
        
        const hash = settings.adminPasswordHash;
        console.log("Fetched Hash from settings.json:", hash);
        console.log("Entered Password:", password);
        
        // Verify via bcrypt or default fallback
        const bcrypt = window.bcrypt || (window.dcodeIO && window.dcodeIO.bcrypt);
        let isValid = false;
        
        if (settings.defaultPassword && password === 'admin123') {
          console.log("Default credentials bypass matched.");
          isValid = true;
        } else if (bcrypt) {
          console.log("Bcrypt library found. Comparing...");
          isValid = bcrypt.compareSync(password, hash);
          console.log("Bcrypt compare sync result:", isValid);
        } else {
          throw new Error('Bcrypt security module failed to load.');
        }
        
        if (isValid) {
          sessionStorage.setItem(this.storageKey, 'true');
          this.showToast('Authentication validated. Welcome back.', 'success');
          
          if (settings.defaultPassword) {
            this.showToast('Security Warning: You are using the default password. Reset it in Settings.', 'error');
          }

          this.showPatView();
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

  setupPatHandler() {
    const form = document.getElementById('github-pat-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = document.getElementById('github-token').value.trim();
      const owner = document.getElementById('github-owner').value.trim();
      const repo = document.getElementById('github-repo').value.trim();

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.innerText = 'Linking...';
      submitBtn.disabled = true;

      try {
        const api = new window.GitHubAPI(token, owner, repo);
        // Verify if token and repository config works
        await api.verifyRepo();

        // Save in session only (secure, cleared on tab close)
        sessionStorage.setItem(this.patKey, JSON.stringify({ token, owner, repo }));
        
        this.showToast('Repository successfully synchronized.', 'success');
        window.onAdminReady(api);
      } catch (err) {
        console.error(err);
        this.showToast(`Verification Failed: ${err.message}. Check parameters.`, 'error');
      } finally {
        submitBtn.innerText = 'Authorize and Link Repo';
        submitBtn.disabled = false;
      }
    });
  }

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
    sessionStorage.removeItem(this.patKey);
    this.showToast('Console session terminated.', 'info');
    setTimeout(() => window.location.reload(), 1000);
  }

  isPasswordAuthenticated() {
    return sessionStorage.getItem(this.storageKey) === 'true';
  }

  isPatLinked() {
    return sessionStorage.getItem(this.patKey) !== null;
  }

  getPatInfo() {
    return JSON.parse(sessionStorage.getItem(this.patKey) || '{}');
  }

  showPatView() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('github-pat-view').style.display = 'flex';
    document.getElementById('admin-layout').style.display = 'none';
  }

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
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }
}

window.AdminAuth = AdminAuth;
