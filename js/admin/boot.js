/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\admin\boot.js */
document.addEventListener('DOMContentLoaded', () => {
  const auth = new window.AdminAuth();
  let api = null;
  let editor = null;
  let dashboard = null;
  let settings = null;

  async function navigateTo(page) {
    const content = document.getElementById('admin-content');
    const pageTitle = document.getElementById('admin-page-title');
    
    content.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';
    pageTitle.innerText = page.charAt(0).toUpperCase() + page.slice(1);

    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    try {
      switch(page) {
        case 'dashboard':
          await dashboard.render(content, api);
          break;
        case 'profile':
          await editor.renderProfileEditor(content);
          break;
        case 'projects':
          await editor.renderProjectsEditor(content);
          break;
        case 'experience':
          await editor.renderExperienceEditor(content);
          break;
        case 'education':
          await editor.renderEducationEditor(content);
          break;
        case 'skills':
          await editor.renderSkillsEditor(content);
          break;
        case 'tools':
          await editor.renderToolsEditor(content);
          break;
        case 'messages':
          await editor.renderMessagesView(content);
          break;
        case 'analytics':
          await editor.renderAnalyticsView(content);
          break;
        case 'settings':
          await settings.render(content);
          break;
      }
    } catch (err) {
      console.error(err);
      content.innerHTML = `<div class="form-status error" style="display:block;">Failed to load view: ${err.message}</div>`;
    }
  }

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  window.onAdminReady = function(githubApi) {
    api = githubApi;
    editor = new window.ContentEditor(api);
    dashboard = new window.AdminDashboard();
    settings = new window.AdminSettings(api, auth);

    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('github-pat-view').style.display = 'none';
    document.getElementById('admin-layout').style.display = 'flex';

    navigateTo('dashboard');
  };

  // Initialize auth after all global callbacks are defined
  auth.init();
});
