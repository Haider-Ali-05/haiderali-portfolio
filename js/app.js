/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\app.js */

import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initTools } from './tools.js';
import { trackVisit } from './analytics.js';
import { initMatrix } from './matrix.js';
import { initTerminal } from './terminal.js';

// Global Data State
let siteData = {};

document.addEventListener('DOMContentLoaded', () => {
  init().catch(err => {
    console.error('System boot failure:', err);
    // Always hide loading screen even on failure
    const loader = document.getElementById('loading-screen');
    if (loader) loader.classList.add('hidden');
    showToast('Failed to initialize system core.', 'error');
  });
});

async function init() {
  console.info('%cSTOP!', 'color: red; font-size: 40px; font-weight: bold;');
  console.info('%cThis is a browser feature intended for developers. But since you are here... FLAG{c0ns0l3_h4ck3r}', 'color: #00ff00; font-size: 14px; font-family: monospace;');

  // 1. Fetch all data in parallel
  siteData = await loadData();

  // 2. Access Protection Check
  if (siteData.settings.siteLoginEnabled) {
    if (!checkSiteAccess()) {
      showSiteLoginOverlay();
      return;
    }
  }

  // 3. Initialize core systems
  initTheme(siteData.settings);
  initContact(siteData.settings.web3formsKey, showToast);
  initTools(showToast);
  initMatrix();
  trackVisit().catch(e => console.warn('Visitor tracking error:', e));

  // 4. Populate layout content
  applySEO(siteData.settings, siteData.profile, siteData.social);
  applyBrand(siteData.settings);
  renderHero(siteData.profile, siteData.social);
  initTerminal(siteData.profile);
  renderAbout(siteData.profile);
  renderExperience(siteData.experience);
  renderEducation(siteData.education);
  renderSkills(siteData.skills);
  renderProjects(siteData.projects);
  renderBlog(siteData.blog);

  // 5. Setup UI listeners and animations
  initNavbar();
  initBackToTop();
  initScrollAnimations();
  initModalListeners();

  // 6. Hide Boot Loader
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.classList.add('hidden');
  }
}

async function loadData() {
  const endpoints = [
    'profile', 'projects', 'experience', 'education', 
    'skills', 'tools', 'social', 'settings', 'blog'
  ];
  
  try {
    const fetchPromises = endpoints.map(ep => 
      fetch(`data/${ep}.json`).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status} on data/${ep}.json`);
        return res.json();
      })
    );
    
    const results = await Promise.all(fetchPromises);
    
    const data = {};
    endpoints.forEach((ep, idx) => {
      data[ep] = results[idx];
    });
    return data;
  } catch (err) {
    console.error('Core data load error:', err);
    throw err;
  }
}

function checkSiteAccess() {
  return sessionStorage.getItem('portfolio_unlocked') === 'true';
}

function showSiteLoginOverlay() {
  const overlay = document.getElementById('site-login-overlay');
  const loader = document.getElementById('loading-screen');
  
  if (loader) loader.classList.add('hidden');
  if (!overlay) return;

  overlay.style.display = 'flex';
  
  const form = document.getElementById('site-login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const passInput = document.getElementById('site-pass');
    const password = passInput.value;
    const hash = siteData.settings.visitorPasswordHash;
    
    const bcrypt = window.bcrypt || (window.dcodeIO && window.dcodeIO.bcrypt);
    let isValid = false;
    
    if (bcrypt && hash) {
      isValid = bcrypt.compareSync(password, hash);
    }
    
    if (isValid) {
      sessionStorage.setItem('portfolio_unlocked', 'true');
      overlay.style.display = 'none';
      window.location.reload();
    } else {
      showToast('Authentication failed. Passphrase rejected.', 'error');
      passInput.value = '';
    }
  });
}

function applySEO(settings, profile, social) {
  if (settings.seo) {
    document.title = settings.seo.title || `${profile.name} | Portfolio`;
    
    // Update meta tags
    updateMetaTag('description', settings.seo.description);
    updateMetaTag('keywords', settings.seo.keywords);
    
    // Update JSON-LD
    const jsonLdScript = document.getElementById('seo-jsonld');
    if (jsonLdScript) {
      const jsonLd = JSON.parse(jsonLdScript.innerHTML);
      jsonLd.name = profile.name;
      jsonLd.jobTitle = profile.title;
      jsonLd.description = settings.seo.description;
      jsonLd.sameAs = [social.linkedin, social.github, social.instagram].filter(Boolean);
      jsonLdScript.innerHTML = JSON.stringify(jsonLd, null, 2);
    }
  }
}

function updateMetaTag(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function applyBrand(settings) {
  if (settings.company) {
    const logoEl = document.getElementById('nav-brand-logo');
    if (settings.company.logoUrl && logoEl) {
      logoEl.src = settings.company.logoUrl;
      logoEl.style.display = 'block';
    }
  }
}

function renderHero(profile, social) {
  const nameEl = document.getElementById('hero-name');
  const titleEl = document.getElementById('title-text');
  const bioEl = document.getElementById('bio-text');
  const picEl = document.getElementById('profile-pic');

  if (nameEl) nameEl.innerText = profile.name;
  if (titleEl) titleEl.innerText = profile.title;
  if (bioEl) bioEl.innerText = profile.bio;
  if (picEl && profile.profilePic) picEl.src = profile.profilePic;

  // Render social links
  const socialLinksContainer = document.getElementById('social-links');
  if (socialLinksContainer) {
    const linkedinBtn = socialLinksContainer.querySelector('.linkedin');
    const githubBtn = socialLinksContainer.querySelector('.github');
    const instagramBtn = socialLinksContainer.querySelector('.instagram');
    const emailBtn = socialLinksContainer.querySelector('.email');

    if (linkedinBtn) linkedinBtn.href = social.linkedin || '#';
    if (githubBtn) githubBtn.href = social.github || '#';
    if (instagramBtn) instagramBtn.href = social.instagram || '#';
    if (emailBtn) emailBtn.href = `mailto:${social.email}`;
  }

  // Start Typing Animation
  const typingEl = document.getElementById('typing-text');
  if (typingEl && profile.typingTexts && profile.typingTexts.length > 0) {
    startTypingAnimation(profile.typingTexts, typingEl);
  }
}

function startTypingAnimation(texts, element) {
  let textIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function tick() {
    const currentText = texts[textIdx];
    
    if (isDeleting) {
      element.innerText = currentText.substring(0, charIdx - 1);
      charIdx--;
    } else {
      element.innerText = currentText.substring(0, charIdx + 1);
      charIdx++;
    }

    let delta = isDeleting ? 40 : 80;

    if (!isDeleting && charIdx === currentText.length) {
      isDeleting = true;
      delta = 2000; // Pause at end of text
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      textIdx = (textIdx + 1) % texts.length;
      delta = 500; // Pause before typing next word
    }

    setTimeout(tick, delta);
  }

  tick();
}

function renderAbout(profile) {
  const aboutText = document.getElementById('about-text');
  if (aboutText && profile.bio) {
    aboutText.innerText = profile.bio;
  }
}

function renderExperience(experience) {
  const container = document.getElementById('experience-container');
  if (!container) return;

  container.innerHTML = '';
  experience.forEach(item => {
    const div = document.createElement('div');
    div.className = `timeline-item ${item.isCurrent ? 'current' : ''}`;
    
    const endStr = item.endDate ? formatDate(item.endDate) : 'Present';
    const currentBadge = item.isCurrent ? '<span class="current-badge">Active</span>' : '';

    div.innerHTML = `
      <div class="timeline-card glass glow">
        <span class="timeline-date">${formatDate(item.startDate)} — ${endStr} ${currentBadge}</span>
        <h3 class="timeline-company">${sanitizeHTML(item.company)}</h3>
        <h4 class="timeline-position">${sanitizeHTML(item.position)}</h4>
        <p class="timeline-description">${sanitizeHTML(item.description)}</p>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderEducation(education) {
  const container = document.getElementById('education-container');
  if (!container) return;

  container.innerHTML = '';
  education.forEach(item => {
    const div = document.createElement('div');
    div.className = 'education-card glass glow';
    div.innerHTML = `
      <h3 class="education-institution">${sanitizeHTML(item.institution)}</h3>
      <h4 class="education-degree">${sanitizeHTML(item.degree)}</h4>
      <p class="education-field">${sanitizeHTML(item.field)}</p>
      <span class="education-dates">${item.startDate} — ${item.endDate}</span>
      ${item.description ? `<p class="timeline-description" style="margin-top: 1rem;">${sanitizeHTML(item.description)}</p>` : ''}
    `;
    container.appendChild(div);
  });
}

function renderSkills(skills) {
  const container = document.getElementById('skills-container');
  if (!container) return;

  container.innerHTML = '';
  skills.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'skill-category glass glow';
    
    let skillsHTML = '';
    cat.items.forEach(skill => {
      skillsHTML += `
        <div class="skill-item">
          <div class="skill-info">
            <span class="skill-name">${sanitizeHTML(skill.name)}</span>
            <span class="skill-level">${skill.level}%</span>
          </div>
          <div class="skill-bar-bg">
            <div class="skill-bar-fill" data-level="${skill.level}"></div>
          </div>
        </div>
      `;
    });

    card.innerHTML = `
      <h3 class="skill-category-title">{ ${sanitizeHTML(cat.category)} }</h3>
      <div class="skill-list">
        ${skillsHTML}
      </div>
    `;
    container.appendChild(card);
  });
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) return;

  container.innerHTML = '';
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card glass glow';

    const screenshotImg = project.screenshots && project.screenshots.length > 0
      ? `<img src="${project.screenshots[0]}" alt="${sanitizeHTML(project.name)}">`
      : `<div class="project-screenshot-placeholder">&lt; no_media_available &gt;</div>`;

    const tagsHTML = (project.tags || []).map(t => `<span class="project-tag">${sanitizeHTML(t)}</span>`).join('');

    const lockIcon = project.downloadAllowed 
      ? '<span class="unlock-icon">🔓</span>' 
      : '<span class="lock-icon">🔒</span>';

    const lockedClass = project.downloadAllowed ? '' : 'locked';

    card.innerHTML = `
      <div class="project-screenshot">
        ${screenshotImg}
      </div>
      <div class="project-info">
        <div class="project-tags">${tagsHTML}</div>
        <h3 class="project-name">${sanitizeHTML(project.name)}</h3>
        <span class="project-date">${formatDate(project.publicationDate)}</span>
        <p class="project-short-info">${sanitizeHTML(project.shortInfo)}</p>
        <div class="project-actions">
          <button class="btn-download ${lockedClass}" data-id="${project.id}" title="${project.downloadAllowed ? 'Download Assets' : 'Locked by admin'}">
            ${lockIcon} Download
          </button>
          <button class="btn-details" data-id="${project.id}">Details &gt;&gt;</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Bind download & detail button clicks
  container.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projId = btn.dataset.id;
      const proj = projects.find(p => p.id === projId);
      if (proj) {
        if (proj.downloadAllowed) {
          window.open(proj.downloadFile, '_blank');
          showToast('Initiating code download...', 'info');
        } else {
          showToast('Security Alert: Download access denied by admin.', 'error');
        }
      }
    });
  });

  container.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const projId = btn.dataset.id;
      const proj = projects.find(p => p.id === projId);
      if (proj) {
        openProjectModal(proj);
      }
    });
  });
}

function openProjectModal(project) {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  document.getElementById('modal-project-name').innerText = project.name;
  document.getElementById('modal-project-date').innerText = formatDate(project.publicationDate);
  
  const tagsContainer = document.getElementById('modal-project-tags');
  tagsContainer.innerHTML = (project.tags || []).map(t => `<span class="project-tag">${sanitizeHTML(t)}</span>`).join('');

  const screenshotContainer = document.getElementById('modal-project-screenshot');
  screenshotContainer.innerHTML = project.screenshots && project.screenshots.length > 0
    ? `<img src="${project.screenshots[0]}" style="width:100%; height:100%; object-fit:cover;">`
    : `<div class="project-screenshot-placeholder">&lt; no_media_available &gt;</div>`;

  const descContainer = document.getElementById('modal-project-description');
  if (window.marked) {
    descContainer.innerHTML = window.DOMPurify.sanitize(window.marked.parse(project.description));
  } else {
    descContainer.innerText = project.description;
  }

  const dlBtn = document.getElementById('modal-project-download-btn');
  dlBtn.className = `btn-download ${project.downloadAllowed ? '' : 'locked'}`;
  dlBtn.innerHTML = `${project.downloadAllowed ? '🔓' : '🔒'} Download Assets`;
  
  // Clone button to strip old event listener
  const newDlBtn = dlBtn.cloneNode(true);
  dlBtn.parentNode.replaceChild(newDlBtn, dlBtn);

  newDlBtn.addEventListener('click', () => {
    if (project.downloadAllowed) {
      window.open(project.downloadFile, '_blank');
      showToast('Initiating code download...', 'info');
    } else {
      showToast('Security Alert: Download access denied by admin.', 'error');
    }
  });

  modal.classList.add('visible');
}

function initModalListeners() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    
    const close = () => modal.classList.remove('visible');
    
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  });
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  // Scroll transparency
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      mobileMenuBtn.innerText = navLinks.classList.contains('active') ? '✕' : '☰';
    });
    
    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.innerText = '☰';
      });
    });
  }
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
function initScrollAnimations() {
  // 1. Scroll Progress Bar updates
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrollPercentage = (window.scrollY / scrollHeight) * 100;
        progressBar.style.width = `${scrollPercentage}%`;
      }
    }, { passive: true });
  }

  // 2. Initialize Stagger Delay for Grid Items
  const staggerContainers = document.querySelectorAll('[data-stagger]');
  staggerContainers.forEach(container => {
    const applyStagger = () => {
      const children = container.children;
      Array.from(children).forEach((child, index) => {
        child.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        child.style.transitionDelay = `${index * 0.08}s`;
        if (!container.closest('.fade-in-section').classList.contains('visible')) {
          child.style.opacity = '0';
          child.style.transform = 'translateY(30px)';
        }
      });
    };

    applyStagger();
    
    // MutationObserver to stagger dynamic items once loaded via fetch
    const observer = new MutationObserver(applyStagger);
    observer.observe(container, { childList: true });
  });

  // 3. IntersectionObserver for Section Fade-Ins
  const sections = document.querySelectorAll('.fade-in-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // If skill section, trigger skill bar filling
        if (entry.target.id === 'skills') {
          initSkillBarAnimations();
        }
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(sec => observer.observe(sec));
}
function initSkillBarAnimations() {
  const fills = document.querySelectorAll('.skill-bar-fill');
  fills.forEach(fill => {
    const lvl = fill.dataset.level;
    fill.style.width = `${lvl}%`;
  });
}

// ==========================================
// Blog Rendering
// ==========================================
function renderBlog(blogPosts) {
  const container = document.getElementById('blog-container');
  if (!container || !blogPosts || blogPosts.length === 0) return;

  const modal = document.getElementById('blog-modal');
  const modalClose = document.getElementById('blog-modal-close');
  const modalTitle = document.getElementById('blog-modal-title');
  const modalMeta = document.getElementById('blog-modal-meta');
  const modalBody = document.getElementById('blog-modal-body');

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('visible');
      document.body.style.overflow = 'auto'; // Restore scroll
    });
  }

  container.innerHTML = blogPosts.map((post) => `
    <div class="glass glow" style="padding: 1.5rem; border-radius: 10px; cursor: pointer; display: flex; flex-direction: column; height: 100%; transition: transform 0.3s ease;" 
         onmouseover="this.style.transform='translateY(-5px)'" 
         onmouseout="this.style.transform='translateY(0)'"
         onclick="openBlogModal('${post.id}')">
      <div style="color: var(--accent-primary); font-family: monospace; font-size: 0.85rem; margin-bottom: 0.5rem;">${post.date}</div>
      <h3 style="color: var(--text-primary); font-size: 1.25rem; margin-bottom: 1rem;">${post.title}</h3>
      <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5; flex-grow: 1;">${post.summary}</p>
      <div style="margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
        ${(post.tags || []).map(tag => `<span style="background: var(--bg-tertiary); color: var(--accent-secondary); padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid var(--border-color);">#${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');

  // Make the function globally available for onclick handlers
  window.openBlogModal = (postId) => {
    const post = blogPosts.find(p => p.id === postId);
    if (!post || !modal) return;
    
    modalTitle.innerText = post.title;
    modalMeta.innerText = `${post.date} | Tags: ${(post.tags || []).join(', ')}`;
    
    // Very basic markdown parsing
    let html = post.content
      .replace(/^### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 style="margin-top:1.5rem;margin-bottom:0.5rem;">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 style="margin-top:1.5rem;margin-bottom:1rem;color:var(--accent-primary);">$1</h2>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code style="background:var(--bg-tertiary);padding:2px 4px;border-radius:3px;">$1</code>')
      .replace(/\n\n/gim, '<br><br>');
      
    modalBody.innerHTML = html;
    
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };
}

// Helpers
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + '-02'); // Add day value to prevent zone shifts
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
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

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast glass ${type}`;
  toast.innerHTML = `
    <span>${sanitizeHTML(message)}</span>
    <button class="toast-close">&times;</button>
  `;

  container.appendChild(toast);

  const dismiss = () => {
    toast.style.animation = 'toastIn 0.3s reverse';
    setTimeout(() => toast.remove(), 300);
  };

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, 5000);
}
