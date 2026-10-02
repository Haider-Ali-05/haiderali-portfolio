/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\theme.js */

export function initTheme(settings = null) {
  const toggleBtn = document.getElementById('theme-toggle');
  // SECURITY FIX (L6): Whitelist theme values to prevent attribute injection
  const ALLOWED_THEMES = ['cyber', 'company'];
  const storedTheme = localStorage.getItem('theme');
  let currentTheme = ALLOWED_THEMES.includes(storedTheme) ? storedTheme : 'cyber';

  setTheme(currentTheme);
  
  if (settings && settings.company) {
    applyCompanyColors(settings.company);
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      let nextTheme;
      if (currentTheme === 'cyber') nextTheme = 'company';
      else nextTheme = 'cyber';
      
      setTheme(nextTheme);
      currentTheme = nextTheme;
    });
  }
}

export function setTheme(theme) {
  // SECURITY FIX (L6): Validate theme name
  const VALID = ['cyber', 'company'];
  if (!VALID.includes(theme)) theme = 'cyber';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    if (theme === 'cyber') toggleBtn.innerHTML = '<i class="ph-fill ph-sun" style="font-size: 1.2rem;"></i>';
    else toggleBtn.innerHTML = '<i class="ph-fill ph-moon" style="font-size: 1.2rem;"></i>';
  }
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'cyber';
}

function applyCompanyColors(company) {
  const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  // SECURITY FIX: Validate hex colors before applying
  if (company.primaryColor && HEX_REGEX.test(company.primaryColor)) {
    document.documentElement.style.setProperty('--company-color', company.primaryColor);
  }
  if (company.secondaryColor && HEX_REGEX.test(company.secondaryColor)) {
    document.documentElement.style.setProperty('--company-secondary', company.secondaryColor);
  }
}
