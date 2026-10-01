/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\app.js */


import { initContact } from './contact.js';
import { initTools } from './tools.js';
import { trackVisit } from './analytics.js';
import { initTerminal } from './terminal.js';

// Global Data State
let siteData = {};
let currentProjectFilter = 'ALL';

document.addEventListener('DOMContentLoaded', () => {
  init().catch(err => {
    console.error('System boot failure:', err);
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
  
  initContact(siteData.settings.web3formsKey, showToast);
  initTools(showToast);
  trackVisit().catch(e => console.warn('Visitor tracking error:', e));

  // 4. Populate layout content
  applySEO(siteData.settings, siteData.profile, siteData.social);
  applyBrand(siteData.settings);
  renderHero(siteData.profile, siteData.social);
  initTerminal(siteData.profile, siteData); // Pass full data to terminal for dynamic commands
  renderStatsStrip(siteData);
  renderExperience(siteData.experience);
  renderEducation(siteData.education);
  renderSkills(siteData.skills);
  setupProjectFilters(siteData.projects);
  renderProjects(siteData.projects);
  renderBlog(siteData.blog);
  loadGithubRepos(siteData.social.github);
  init3DEffects();

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
    updateMetaTag('description', settings.seo.description);
    updateMetaTag('keywords', settings.seo.keywords);
    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (jsonLdScript) {
      try {
        const jsonLd = JSON.parse(jsonLdScript.innerHTML);
        if (jsonLd['@graph']) {
          const person = jsonLd['@graph'].find(item => item['@type'] === 'Person');
          if (person) {
            person.name = profile.name;
            person.jobTitle = [profile.title];
            person.description = settings.seo.description;
            person.sameAs = Object.values(social).filter(v => v && v.startsWith('http'));
          }
        }
        jsonLdScript.innerHTML = JSON.stringify(jsonLd, null, 2);
      } catch (e) {
        console.warn('Failed to parse/update JSON-LD', e);
      }
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
  const contactEmailEl = document.getElementById('contact-email-display');

  if (nameEl) scrambleText(nameEl, profile.name);
  if (titleEl) titleEl.innerText = profile.title;
  if (bioEl) bioEl.innerText = profile.bio;
  if (picEl && profile.profilePic) picEl.src = profile.profilePic;
  if (contactEmailEl && social.email) contactEmailEl.innerText = social.email;

  const socialLinksContainer = document.getElementById('social-links');
  if (socialLinksContainer) {
    const linkedinBtn = socialLinksContainer.querySelector('.linkedin');
    const githubBtn = socialLinksContainer.querySelector('.github');
    const instagramBtn = socialLinksContainer.querySelector('.instagram');
    const emailBtn = socialLinksContainer.querySelector('.email');
    if (linkedinBtn) linkedinBtn.href = social.linkedin || '#';
    if (githubBtn) githubBtn.href = social.github || '#';
    if (instagramBtn) instagramBtn.href = social.instagram || '#';
    if (emailBtn && social.email) emailBtn.href = `mailto:${social.email}`;
  }

  const typingEl = document.getElementById('typing-text');
  if (typingEl && profile.typingTexts && profile.typingTexts.length > 0) {
    startTypingAnimation(profile.typingTexts, typingEl);
  }
}

function startTypingAnimation(texts, element) {
  let textIdx = 0, charIdx = 0, isDeleting = false;
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
      isDeleting = true; delta = 2000;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false; textIdx = (textIdx + 1) % texts.length; delta = 500;
    }
    setTimeout(tick, delta);
  }
  tick();
}

function renderStatsStrip(data) {
  const container = document.getElementById('stats-grid');
  if (!container) return;

  const orgCount = data.experience ? (Array.isArray(data.experience) ? data.experience.length : 0) : 0;
  const projCount = data.projects ? (Array.isArray(data.projects) ? data.projects.length : 0) : 0;
  const toolCount = data.tools ? (Array.isArray(data.tools) ? data.tools.length : 0) : 0;
  
  // Handle education.json being either an array or an object with {education:[], certifications:[]}
  let certCount = 0;
  if (data.education) {
    if (Array.isArray(data.education)) {
      certCount = data.education.filter(e => e.degree === 'Certification').length;
    } else if (data.education.certifications && Array.isArray(data.education.certifications)) {
      certCount = data.education.certifications.length;
    }
  }

  const statsHTML = [];
  if (orgCount > 0) {
    statsHTML.push(`<div class="stat-item"><span class="stat-value">${orgCount}+</span><span class="stat-label">Organizations</span></div>`);
  }
  if (projCount > 0) {
    statsHTML.push(`<div class="stat-item"><span class="stat-value">${projCount}+</span><span class="stat-label">Projects</span></div>`);
  }
  if (toolCount > 0) {
    statsHTML.push(`<div class="stat-item"><span class="stat-value">${toolCount}+</span><span class="stat-label">Tools</span></div>`);
  }
  if (certCount > 0) {
    statsHTML.push(`<div class="stat-item"><span class="stat-value">${certCount}+</span><span class="stat-label">Certifications</span></div>`);
  }

  container.innerHTML = statsHTML.join('');
}

function renderExperience(experience) {
  const container = document.getElementById('experience-container');
  if (!container || !experience || !Array.isArray(experience)) return;
  container.innerHTML = '';
  experience.forEach(exp => {
    const isCurrent = exp.isCurrent || (exp.status && exp.status.toLowerCase() === 'active') || (exp.period && exp.period.includes('Present'));
    const position = exp.position || exp.role || '';
    const dateRange = exp.period || `${exp.startDate || ''} — ${exp.isCurrent ? 'Present' : (exp.endDate || '')}`;
    
    const item = document.createElement('div');
    item.className = `timeline-item ${isCurrent ? 'current' : ''}`;
    item.innerHTML = `
      <div class="timeline-date">${dateRange}</div>
      <h3 class="timeline-company">${exp.company} ${isCurrent ? '<span class="current-badge">ACTIVE</span>' : ''}</h3>
      <div class="timeline-position">${position}</div>
      <p class="timeline-description">${exp.description}</p>
    `;
    container.appendChild(item);
  });
}

function renderEducation(educationData) {
  const eduContainer = document.getElementById('education-container');
  const certContainer = document.getElementById('certifications-container');
  if (!eduContainer || !certContainer || !educationData) return;

  eduContainer.innerHTML = '';
  certContainer.innerHTML = '';

  // Handle both formats: flat array or object with {education:[], certifications:[]}
  let degrees = [];
  let certs = [];

  if (Array.isArray(educationData)) {
    degrees = educationData.filter(e => e.degree !== 'Certification');
    certs = educationData.filter(e => e.degree === 'Certification');
  } else {
    degrees = educationData.education || [];
    certs = educationData.certifications || [];
  }

  if (degrees.length === 0) eduContainer.innerHTML = '<p class="text-muted">No education records found.</p>';
  degrees.forEach(edu => {
    const item = document.createElement('div');
    item.className = 'education-item';
    const dateStr = edu.period || `${edu.startDate || ''} - ${edu.endDate || ''}`;
    const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree;
    item.innerHTML = `
      <h3 class="education-institution">${edu.institution}</h3>
      <div class="education-degree">${degreeStr}</div>
      <div class="education-dates">${dateStr}</div>
      ${edu.description ? `<p class="text-muted" style="font-size: 0.85rem; margin-top: 8px;">${edu.description}</p>` : ''}
    `;
    eduContainer.appendChild(item);
  });

  if (certs.length === 0) certContainer.innerHTML = '<p class="text-muted">No certifications found.</p>';
  certs.forEach(cert => {
    const item = document.createElement('div');
    item.className = 'education-item';
    const institution = cert.institution || cert.issuer || '';
    const title = cert.field || cert.name || cert.degree || '';
    const dateStr = cert.period || cert.year || `${cert.startDate || ''} - ${cert.endDate || ''}`;
    item.innerHTML = `
      <h3 class="education-institution">${institution}</h3>
      <div class="education-degree">${title}</div>
      <div class="education-dates">${dateStr}</div>
      ${cert.description ? `<p class="text-muted" style="font-size: 0.85rem; margin-top: 8px;">${cert.description}</p>` : ''}
    `;
    certContainer.appendChild(item);
  });
}

function renderSkills(skills) {
  const container = document.getElementById('skills-container');
  if (!container || !skills) return;
  container.innerHTML = '';
  skills.forEach(category => {
    const card = document.createElement('div');
    card.className = 'skill-category-card';
    
    let chipsHtml = '';
    category.items.forEach(item => {
      chipsHtml += `<span class="skill-chip">${item.name}</span>`;
    });

    card.innerHTML = `
      <h3 class="skill-category-title">${category.category}</h3>
      <div class="skill-chips">${chipsHtml}</div>
    `;
    container.appendChild(card);
  });
}

function setupProjectFilters(projects) {
  const filterContainer = document.getElementById('project-filters');
  if (!filterContainer || !projects) return;
  
  const allCategories = new Set(['ALL']);
  projects.forEach(p => {
    if (p.category) allCategories.add(p.category.toUpperCase());
  });

  filterContainer.innerHTML = '';
  allCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${cat === 'ALL' ? 'active' : ''}`;
    btn.innerText = cat;
    btn.dataset.filter = cat;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentProjectFilter = cat;
      renderProjects(siteData.projects);
    });
    filterContainer.appendChild(btn);
  });
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container || !projects) return;
  container.innerHTML = '';
  
  const filteredProjects = currentProjectFilter === 'ALL' 
    ? projects 
    : projects.filter(p => p.category && p.category.toUpperCase() === currentProjectFilter);

  if (filteredProjects.length === 0) {
    container.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; text-align: center; padding: 2rem;">No projects found for this category.</p>';
    return;
  }

  filteredProjects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    let tagsHtml = '';
    if (proj.tags) {
      proj.tags.forEach(tag => {
        tagsHtml += `<span class="project-tag">${tag}</span>`;
      });
    }

    const hasScreenshot = proj.screenshots && proj.screenshots.length > 0;
    const imgHtml = hasScreenshot 
      ? `<img src="${proj.screenshots[0]}" alt="${proj.name}" loading="lazy">` 
      : `<div class="project-screenshot-placeholder">SCREENSHOT COMING SOON</div>`;

    card.innerHTML = `
      <div class="project-screenshot">${imgHtml}</div>
      <div class="project-info">
        <div class="project-header">
          <h3 class="project-name">${proj.name}</h3>
        </div>
        <span class="project-date">${proj.publicationDate || ''}</span>
        <div class="project-tags">${tagsHtml}</div>
        <p class="project-desc">${proj.shortInfo || proj.description.substring(0, 100) + '...'}</p>
        <div class="project-actions">
          <button class="btn-details" data-id="${proj.id}">Details →</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Bind details buttons
  container.querySelectorAll('.btn-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const proj = projects.find(p => p.id === btn.dataset.id);
      if (proj) openProjectModal(proj);
    });
  });
}

function renderBlog(blogPosts) {
  const container = document.getElementById('blog-container');
  if (!container || !blogPosts) return;
  container.innerHTML = '';
  
  if (blogPosts.length === 0) {
    container.innerHTML = '<p class="text-muted">No write-ups published yet.</p>';
    return;
  }

  blogPosts.forEach(post => {
    const item = document.createElement('div');
    item.className = 'blog-item';
    
    let tagsHtml = '';
    if (post.tags) {
      post.tags.forEach(t => tagsHtml += `<span>#${t}</span>`);
    }

    item.innerHTML = `
      <div class="blog-item-date">${post.date}</div>
      <h3 class="blog-item-title">${post.title}</h3>
      <p class="blog-item-summary">${post.summary}</p>
      <div class="blog-tags">${tagsHtml}</div>
    `;
    
    item.addEventListener('click', () => {
      openBlogModal(post);
    });
    
    container.appendChild(item);
  });
}

async function loadGithubRepos(githubUrl) {
  const container = document.getElementById('github-repos');
  if (!container || !githubUrl) return;

  const username = githubUrl.split('/').pop();
  if (!username) return;

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    if (!response.ok) throw new Error('GitHub API limits or error');
    const repos = await response.json();
    
    container.innerHTML = '';
    repos.forEach(repo => {
      const el = document.createElement('div');
      el.className = 'repo-card';
      el.innerHTML = `
        <a href="${repo.html_url}" target="_blank" class="repo-name" style="text-decoration: none;">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path></svg>
          ${repo.name}
        </a>
        <p class="repo-desc">${repo.description || 'No description provided'}</p>
        <div class="repo-meta">
          ${repo.language ? `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--accent-primary);margin-right:4px;"></span>${repo.language}</span>` : ''}
          <span>★ ${repo.stargazers_count}</span>
          <span>⑂ ${repo.forks_count}</span>
        </div>
      `;
      container.appendChild(el);
    });
  } catch (error) {
    console.warn('GitHub API failed, falling back to empty state:', error);
    container.innerHTML = '<p class="text-muted">Repository metrics unavailable at this time.</p>';
  }
}

// ── Modals & Interactivity ──

function openProjectModal(proj) {
  const modal = document.getElementById('project-modal');
  document.getElementById('modal-project-name').innerText = proj.name;
  document.getElementById('modal-project-date').innerText = proj.publicationDate || '';
  
  const tagsContainer = document.getElementById('modal-project-tags');
  tagsContainer.innerHTML = '';
  if (proj.tags) {
    proj.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'project-tag';
      span.innerText = tag;
      tagsContainer.appendChild(span);
    });
  }

  const screenshot = document.getElementById('modal-project-screenshot');
  if (proj.screenshots && proj.screenshots.length > 0) {
    screenshot.innerHTML = `<img src="${proj.screenshots[0]}" alt="${proj.name}" style="width:100%;height:100%;object-fit:cover;">`;
    screenshot.style.display = 'block';
  } else {
    screenshot.style.display = 'none';
  }

  document.getElementById('modal-project-description').innerHTML = proj.description;

  const btn = document.getElementById('modal-project-download-btn');
  if (proj.downloadAllowed && proj.downloadFile) {
    btn.className = 'btn-download';
    btn.innerHTML = '<span>Download Assets</span>';
    btn.onclick = () => window.open(proj.downloadFile, '_blank');
  } else {
    btn.className = 'btn-download locked';
    btn.innerHTML = '<span>Private Repository</span>';
    btn.onclick = null;
  }

  modal.classList.add('visible');
}

function openBlogModal(post) {
  const modal = document.getElementById('blog-modal');
  document.getElementById('blog-modal-title').innerText = post.title;
  document.getElementById('blog-modal-meta').innerText = post.date;
  
  const body = document.getElementById('blog-modal-body');
  if (window.marked) {
    body.innerHTML = window.DOMPurify ? window.DOMPurify.sanitize(window.marked.parse(post.content)) : window.marked.parse(post.content);
  } else {
    body.innerText = post.content;
  }
  
  modal.classList.add('visible');
}

function initModalListeners() {
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.remove('visible');
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('visible');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.visible').forEach(m => m.classList.remove('visible'));
    }
  });
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scroll-progress');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    if (scrollProgress) scrollProgress.style.width = scrolled + '%';

    updateActiveNavLink();
  });

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('main > section, main > div');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  let currentId = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      currentId = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentId}`) {
      link.classList.add('active');
    }
  });
}

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.hasAttribute('data-stagger')) {
          const children = Array.from(entry.target.children);
          children.forEach((child, i) => {
            child.style.opacity = '0';
            child.style.transform = 'translateY(20px)';
            child.style.transition = `all 0.4s ease ${i * 0.1}s`;
            
            // Trigger reflow
            void child.offsetWidth;
            
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
          });
          entry.target.removeAttribute('data-stagger'); // only animate once
        }
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
}

// Global Toast utility
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close">&times;</button>
  `;
  container.appendChild(toast);
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.onclick = () => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  };
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
};
function init3DEffects() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Initialize Vanta.js NET
  if (window.VANTA && window.VANTA.NET) {
    window.VANTA.NET({
      el: '#vanta-bg',
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x06B6D4,
      backgroundColor: 0x05070d,
      points: 12.00,
      maxDistance: 22.00,
      spacing: 18.00
    });
  }

    // Smooth Scroll
  if (window.Lenis) {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Initialize Vanilla Tilt
  if (window.VanillaTilt) {
    const avatarEl = document.querySelector('.hero-avatar-wrapper');
    if (avatarEl) {
      VanillaTilt.init(avatarEl, {
        max: 8,
        speed: 400,
        glare: true,
        'max-glare': 0.2,
      });
    }
    
    const tiltCards = document.querySelectorAll('.project-card, .tool-card');
    if (tiltCards.length > 0) {
      VanillaTilt.init(tiltCards, {
        max: 5,
        speed: 400,
        glare: true,
        'max-glare': 0.1,
      });
    }
  }
}

function scrambleText(element, newText) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    element.innerText = newText;
    return;
  }
  
  const chars = '!<>-_\\\\/[]{}?"+*^?#________';
  let iteration = 0;
  const originalText = newText;
  
  clearInterval(element.scrambleInterval);
  
  element.scrambleInterval = setInterval(() => {
    element.innerText = originalText
      .split('')
      .map((letter, index) => {
        if(index < iteration) {
          return originalText[index];
        }
        return chars[Math.floor(Math.random() * 26)] || '#';
      })
      .join('');
    
    if(iteration >= originalText.length){
      clearInterval(element.scrambleInterval);
    }
    
    iteration += 1 / 3;
  }, 30);
}




