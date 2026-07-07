/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\theme.js */

export function initTheme(settings = null) {
  const toggleBtn = document.getElementById('theme-toggle');
  let currentTheme = localStorage.getItem('theme') || 'cyber';

  setTheme(currentTheme);
  
  if (settings && settings.company) {
    applyCompanyColors(settings.company);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const nextTheme = currentTheme === 'cyber' ? 'company' : 'cyber';
      setTheme(nextTheme);
      currentTheme = nextTheme;
    });
  }
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.innerText = theme === 'cyber' ? '🌙' : '☀️';
  }
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'cyber';
}

function applyCompanyColors(company) {
  if (company.primaryColor) {
    document.documentElement.style.setProperty('--company-color', company.primaryColor);
  }
  if (company.secondaryColor) {
    document.documentElement.style.setProperty('--company-secondary', company.secondaryColor);
  }
}
