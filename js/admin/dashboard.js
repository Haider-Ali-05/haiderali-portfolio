/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\admin\dashboard.js */

class AdminDashboard {
  async render(container, api) {
    container.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';

    try {
      // Fetch dynamic analytics data
      const visitors = JSON.parse(localStorage.getItem('portfolio_visitors') || '[]');
      const localMessages = JSON.parse(localStorage.getItem('messages_log') || '[]');
      const unreadCount = localMessages.filter(m => m.unread).length;

      // Fetch projects & skills to count
      const projectsData = await api.readFile('data/projects.json').catch(() => ({ content: [] }));
      const skillsData = await api.readFile('data/skills.json').catch(() => ({ content: [] }));
      
      let totalSkillsCount = 0;
      skillsData.content.forEach(cat => {
        totalSkillsCount += (cat.items || []).length;
      });

      container.innerHTML = `
        <!-- Stats Row -->
        <div class="stats-grid">
          <div class="stat-card glass glow">
            <div class="stat-header">
              <span>Total Traffic (local)</span>
              <span>📈</span>
            </div>
            <div class="stat-number accent">${visitors.length}</div>
          </div>
          <div class="stat-card glass glow">
            <div class="stat-header">
              <span>Active Projects</span>
              <span>📁</span>
            </div>
            <div class="stat-number">${projectsData.content.length}</div>
          </div>
          <div class="stat-card glass glow">
            <div class="stat-header">
              <span>Skills Cataloged</span>
              <span>⚡</span>
            </div>
            <div class="stat-number">${totalSkillsCount}</div>
          </div>
          <div class="stat-card glass glow">
            <div class="stat-header">
              <span>Unread Messages</span>
              <span style="${unreadCount > 0 ? 'color: var(--accent-danger)' : ''}">📨</span>
            </div>
            <div class="stat-number" style="${unreadCount > 0 ? 'color: var(--accent-danger)' : ''}">${unreadCount}</div>
          </div>
        </div>

        <!-- Recent Visitors Section -->
        <div class="admin-card glass glow">
          <h2 class="admin-card-title">recent_visitor_traffic_log</h2>
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                  <th>Location</th>
                  <th>Screen Size</th>
                  <th>Referrer</th>
                </tr>
              </thead>
              <tbody id="visitors-table-body">
                ${visitors.length === 0 ? '<tr><td colspan="5" style="text-align:center;">No traffic logged.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Fill recent visitor logs (show up to 10 latest)
      const tableBody = container.querySelector('#visitors-table-body');
      if (tableBody && visitors.length > 0) {
        const latest = [...visitors].reverse().slice(0, 10);
        latest.forEach(v => {
          const tr = document.createElement('tr');
          const date = new Date(v.timestamp).toLocaleString();
          tr.innerHTML = `
            <td style="font-family: monospace;">${date}</td>
            <td style="font-family: monospace; color: var(--accent-primary);">${sanitizeHTML(v.ip)}</td>
            <td>${sanitizeHTML(v.location)}</td>
            <td style="font-family: monospace;">${sanitizeHTML(v.screen)}</td>
            <td style="font-size:0.85rem;">${sanitizeHTML(v.referrer)}</td>
          `;
          tableBody.appendChild(tr);
        });
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="form-status error" style="display:block;">Dashboard Engine Error: ${err.message}</div>`;
    }
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

window.AdminDashboard = AdminDashboard;
