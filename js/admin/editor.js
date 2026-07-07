/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\admin\editor.js */

class ContentEditor {
  constructor(api) {
    this.api = api;
    this.cache = {};
  }

  async loadData(filename) {
    document.getElementById('save-status-indicator').innerText = 'fetching...';
    try {
      const data = await this.api.readFile(`data/${filename}`);
      this.cache[filename] = data;
      document.getElementById('save-status-indicator').innerText = 'synced';
      return data.content;
    } catch (e) {
      document.getElementById('save-status-indicator').innerText = 'fetch failed';
      throw e;
    }
  }

  async saveData(filename, content, message) {
    document.getElementById('save-status-indicator').innerText = 'saving...';
    try {
      const cached = this.cache[filename];
      const res = await this.api.writeFile(`data/${filename}`, content, message, cached ? cached.sha : null);
      
      // Update cache
      this.cache[filename] = {
        content: content,
        sha: res.content.sha
      };
      
      document.getElementById('save-status-indicator').innerText = 'synced';
      this.showToast('Changes committed successfully.', 'success');
      return true;
    } catch (e) {
      console.error(e);
      document.getElementById('save-status-indicator').innerText = 'save error';
      this.showToast(`Git Commit Failed: ${e.message}`, 'error');
      return false;
    }
  }

  // ====== PROFILE EDITOR ======
  async renderProfileEditor(container) {
    container.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';
    const profile = await this.loadData('profile.json');

    container.innerHTML = `
      <div class="admin-card glass glow">
        <h2 class="admin-card-title">edit_profile_data</h2>
        <form id="profile-editor-form" class="admin-form-grid">
          <div class="form-group">
            <label class="form-label" for="prof-name">Name:</label>
            <input class="form-input" type="text" id="prof-name" value="${sanitizeHTML(profile.name)}" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="prof-title">Role Title:</label>
            <input class="form-input" type="text" id="prof-title" value="${sanitizeHTML(profile.title)}" required>
          </div>
          <div class="form-group admin-form-full">
            <label class="form-label" for="prof-bio">Biography:</label>
            <textarea class="form-textarea" id="prof-bio" required style="min-height: 120px;">${sanitizeHTML(profile.bio)}</textarea>
          </div>
          
          <!-- Avatar Picture Upload -->
          <div class="form-group">
            <label class="form-label">Profile Image:</label>
            <div class="file-upload-zone" id="avatar-dropzone">
              <span class="file-upload-icon">📷</span>
              <p>Drag & drop profile picture or click to browse</p>
              <input type="file" id="avatar-file" accept="image/*" style="display: none;">
            </div>
            <div class="file-preview" id="avatar-preview-area">
              ${profile.profilePic ? `<div class="file-preview-item"><img src="${profile.profilePic}"></div>` : ''}
            </div>
          </div>

          <!-- Typing Text Strings -->
          <div class="form-group">
            <label class="form-label">Typing texts (Console simulation):</label>
            <div id="typing-list-area" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
            <button class="admin-btn admin-btn-secondary admin-btn-sm" type="button" id="btn-add-typing">+ Add Item</button>
          </div>

          <div class="admin-btn-group admin-form-full">
            <button class="admin-btn admin-btn-primary" type="submit">Commit Changes</button>
          </div>
        </form>
      </div>
    `;

    // Render Typing lists
    const typingList = container.querySelector('#typing-list-area');
    const renderTypingRows = (texts) => {
      typingList.innerHTML = '';
      texts.forEach((txt, idx) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '10px';
        row.innerHTML = `
          <input class="form-input" type="text" value="${sanitizeHTML(txt)}" required style="flex-grow:1;">
          <button class="admin-btn admin-btn-danger admin-btn-sm btn-del-typing" type="button" data-idx="${idx}">&times;</button>
        `;
        typingList.appendChild(row);
      });

      // Bind delete rows
      typingList.querySelectorAll('.btn-del-typing').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          texts.splice(idx, 1);
          renderTypingRows(texts);
        });
      });
    };

    let localTyping = [...(profile.typingTexts || [])];
    renderTypingRows(localTyping);

    container.querySelector('#btn-add-typing').addEventListener('click', () => {
      localTyping.push('New Skill/Focus');
      renderTypingRows(localTyping);
    });

    // Avatar Drag & Drop logic
    const dropzone = container.querySelector('#avatar-dropzone');
    const fileInput = container.querySelector('#avatar-file');
    const previewArea = container.querySelector('#avatar-preview-area');
    let avatarBase64 = null;

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        avatarBase64 = await this.fileToBase64(file);
        previewArea.innerHTML = `<div class="file-preview-item"><img src="data:${file.type};base64,${avatarBase64}"></div>`;
      }
    });

    // Submit handler
    container.querySelector('#profile-editor-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const newProfile = {
        name: document.getElementById('prof-name').value,
        title: document.getElementById('prof-title').value,
        bio: document.getElementById('prof-bio').value,
        profilePic: profile.profilePic,
        typingTexts: Array.from(typingList.querySelectorAll('input')).map(input => input.value)
      };

      // Upload new avatar if selected
      if (avatarBase64) {
        const avatarPath = 'uploads/profile/avatar.jpg';
        try {
          this.showToast('Uploading profile image...', 'info');
          
          let oldSha = null;
          try {
            // Get sha for override
            const res = await this.api.request(`/contents/${avatarPath}`);
            oldSha = res.sha;
          } catch(e){}

          await this.api.uploadBinary(avatarPath, avatarBase64, 'Upload profile avatar', oldSha);
          newProfile.profilePic = avatarPath;
        } catch (err) {
          this.showToast(`Image upload error: ${err.message}`, 'error');
          return;
        }
      }

      await this.saveData('profile.json', newProfile, 'Update profile content');
    });
  }

  // ====== PROJECTS CRUD ======
  async renderProjectsEditor(container) {
    container.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';
    const projects = await this.loadData('projects.json');

    container.innerHTML = `
      <div class="admin-card glass glow">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h2 class="admin-card-title" style="margin:0;">projects_catalog_crud</h2>
          <button class="admin-btn admin-btn-primary admin-btn-sm" id="btn-new-project">+ Add Project</button>
        </div>
        <div id="project-form-container" style="display:none; margin-bottom: 2rem;"></div>
        
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Publication Date</th>
                <th>Download Auth</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="projects-table-body">
              <!-- Rendered list -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    const tableBody = container.querySelector('#projects-table-body');
    const formContainer = container.querySelector('#project-form-container');

    const renderList = () => {
      tableBody.innerHTML = '';
      if (projects.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No projects configured.</td></tr>';
        return;
      }

      projects.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:600;">${sanitizeHTML(p.name)}</td>
          <td style="font-family:monospace;">${p.publicationDate}</td>
          <td>${p.downloadAllowed ? '<span style="color:var(--accent-secondary)">🔓 Allowed</span>' : '<span style="color:var(--accent-danger)">🔒 Denied</span>'}</td>
          <td style="text-align:right;">
            <button class="admin-btn admin-btn-secondary admin-btn-sm btn-edit-proj" data-id="${p.id}">Edit</button>
            <button class="admin-btn admin-btn-danger admin-btn-sm btn-del-proj" data-id="${p.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Bind actions
      tableBody.querySelectorAll('.btn-edit-proj').forEach(btn => {
        btn.addEventListener('click', () => {
          showForm(projects.find(p => p.id === btn.dataset.id));
        });
      });

      tableBody.querySelectorAll('.btn-del-proj').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this project? This action will commit to git.')) {
            const idx = projects.findIndex(p => p.id === btn.dataset.id);
            if (idx !== -1) {
              projects.splice(idx, 1);
              const success = await this.saveData('projects.json', projects, 'Delete project');
              if (success) renderList();
            }
          }
        });
      });
    };

    const showForm = (proj = null) => {
      formContainer.style.display = 'block';
      formContainer.innerHTML = `
        <div class="glass" style="padding: 2rem; border-color: var(--accent-primary);">
          <h3 class="admin-card-title">${proj ? 'edit_project_record' : 'add_new_project'}</h3>
          <form id="project-form" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="proj-name">Project Name:</label>
              <input class="form-input" type="text" id="proj-name" value="${proj ? sanitizeHTML(proj.name) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="proj-date">Publish Date:</label>
              <input class="form-input" type="date" id="proj-date" value="${proj ? proj.publicationDate : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="proj-short">Short Info:</label>
              <input class="form-input" type="text" id="proj-short" value="${proj ? sanitizeHTML(proj.shortInfo) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="proj-tags">Tags (comma-separated):</label>
              <input class="form-input" type="text" id="proj-tags" value="${proj ? sanitizeHTML(proj.tags.join(', ')) : ''}" placeholder="e.g. Python, IDS, Security">
            </div>
            <div class="form-group admin-form-full">
              <label class="form-label" for="proj-desc">Description (Markdown Supported):</label>
              <textarea class="form-textarea" id="proj-desc" required style="min-height:150px;">${proj ? sanitizeHTML(proj.description) : ''}</textarea>
            </div>

            <!-- Download Permissions Toggle -->
            <div class="form-group admin-form-full">
              <div class="toggle-switch-container">
                <div class="toggle-switch ${proj && proj.downloadAllowed ? 'active' : ''}" id="proj-dl-toggle">
                  <div class="toggle-knob"></div>
                </div>
                <span class="form-label" style="margin:0;">Allow Visitors to Download Assets (🔒/🔓 Symbol control)</span>
              </div>
            </div>

            <!-- Screenshots Upload -->
            <div class="form-group">
              <label class="form-label">Screenshot Image:</label>
              <div class="file-upload-zone" id="screenshot-dropzone">
                <span class="file-upload-icon">🖼️</span>
                <p>Upload screenshot JPEG or click to browse</p>
                <input type="file" id="screenshot-file" accept="image/*" style="display: none;">
              </div>
              <div class="file-preview" id="screenshot-preview-area">
                ${proj && proj.screenshots && proj.screenshots.length > 0 ? `<div class="file-preview-item"><img src="${proj.screenshots[0]}"></div>` : ''}
              </div>
            </div>

            <!-- Zip File Asset Code Upload -->
            <div class="form-group">
              <label class="form-label">Project Assets Code (ZIP format):</label>
              <div class="file-upload-zone" id="zip-dropzone">
                <span class="file-upload-icon">📦</span>
                <p>Select ZIP file package</p>
                <input type="file" id="zip-file" accept=".zip" style="display: none;">
              </div>
              <div class="file-preview" id="zip-preview-area">
                ${proj && proj.downloadFile ? `<span style="font-size:0.85rem; word-break:break-all;">Asset linked: ${proj.downloadFile}</span>` : ''}
              </div>
            </div>

            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Save Project</button>
              <button class="admin-btn admin-btn-secondary" type="button" id="btn-cancel-proj">Cancel</button>
            </div>
          </form>
        </div>
      `;

      const form = formContainer.querySelector('#project-form');
      const dlToggle = form.querySelector('#proj-dl-toggle');
      let dlAllowed = proj ? proj.downloadAllowed : false;

      dlToggle.addEventListener('click', () => {
        dlToggle.classList.toggle('active');
        dlAllowed = dlToggle.classList.contains('active');
      });

      // Screenshot drag-and-drop
      const ssDrop = form.querySelector('#screenshot-dropzone');
      const ssInput = form.querySelector('#screenshot-file');
      const ssPreview = form.querySelector('#screenshot-preview-area');
      let ssBase64 = null;

      ssDrop.addEventListener('click', () => ssInput.click());
      ssInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          ssBase64 = await this.fileToBase64(file);
          ssPreview.innerHTML = `<div class="file-preview-item"><img src="data:${file.type};base64,${ssBase64}"></div>`;
        }
      });

      // Zip Code upload drop
      const zipDrop = form.querySelector('#zip-dropzone');
      const zipInput = form.querySelector('#zip-file');
      const zipPreview = form.querySelector('#zip-preview-area');
      let zipBase64 = null;
      let zipName = '';

      zipDrop.addEventListener('click', () => zipInput.click());
      zipInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          zipBase64 = await this.fileToBase64(file);
          zipName = file.name;
          zipPreview.innerHTML = `<span style="font-family:monospace; font-size:0.85rem;">Selected: ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)</span>`;
        }
      });

      form.querySelector('#btn-cancel-proj').addEventListener('click', () => {
        formContainer.style.display = 'none';
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = form.querySelector('#proj-name').value;
        const id = proj ? proj.id : 'proj-' + Math.random().toString(36).substr(2, 9);
        
        const tags = form.querySelector('#proj-tags').value
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);

        const projectPayload = {
          id,
          name,
          publicationDate: form.querySelector('#proj-date').value,
          shortInfo: form.querySelector('#proj-short').value,
          description: form.querySelector('#proj-desc').value,
          downloadAllowed: dlAllowed,
          tags,
          screenshots: proj ? [...(proj.screenshots || [])] : [],
          downloadFile: proj ? proj.downloadFile : ''
        };

        // Upload screenshot image if updated
        if (ssBase64) {
          const ssPath = `uploads/projects/${id}-ss.jpg`;
          try {
            this.showToast('Uploading project screenshot...', 'info');
            let oldSha = null;
            try {
              const res = await this.api.request(`/contents/${ssPath}`);
              oldSha = res.sha;
            } catch(e){}
            await this.api.uploadBinary(ssPath, ssBase64, `Upload project screenshot: ${name}`, oldSha);
            projectPayload.screenshots = [ssPath];
          } catch(err) {
            this.showToast(`Screenshot upload failed: ${err.message}`, 'error');
            return;
          }
        }

        // Upload zip file if chosen
        if (zipBase64) {
          const zipPath = `uploads/projects/${id}.zip`;
          try {
            this.showToast('Uploading project ZIP assets...', 'info');
            let oldSha = null;
            try {
              const res = await this.api.request(`/contents/${zipPath}`);
              oldSha = res.sha;
            } catch(e){}
            await this.api.uploadBinary(zipPath, zipBase64, `Upload project zip: ${name}`, oldSha);
            projectPayload.downloadFile = zipPath;
          } catch(err) {
            this.showToast(`ZIP upload failed: ${err.message}`, 'error');
            return;
          }
        }

        if (proj) {
          // Edit existing
          const idx = projects.findIndex(p => p.id === proj.id);
          projects[idx] = projectPayload;
        } else {
          // Add new
          projects.push(projectPayload);
        }

        const success = await this.saveData('projects.json', projects, `Commit project: ${name}`);
        if (success) {
          formContainer.style.display = 'none';
          renderList();
        }
      });
    };

    container.querySelector('#btn-new-project').addEventListener('click', () => showForm());
    renderList();
  }

  // ====== WORK EXPERIENCE CRUD ======
  async renderExperienceEditor(container) {
    container.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';
    const experience = await this.loadData('experience.json');

    container.innerHTML = `
      <div class="admin-card glass glow">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h2 class="admin-card-title" style="margin:0;">work_experience_crud</h2>
          <button class="admin-btn admin-btn-primary admin-btn-sm" id="btn-new-exp">+ Add Experience</button>
        </div>
        <div id="exp-form-container" style="display:none; margin-bottom: 2rem;"></div>
        
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Period</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="exp-table-body">
              <!-- Render list -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    const tableBody = container.querySelector('#exp-table-body');
    const formContainer = container.querySelector('#exp-form-container');

    const renderList = () => {
      tableBody.innerHTML = '';
      if (experience.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No experience data logged.</td></tr>';
        return;
      }

      experience.forEach(item => {
        const endStr = item.endDate ? item.endDate : 'Present';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:600;">${sanitizeHTML(item.company)}</td>
          <td>${sanitizeHTML(item.position)}</td>
          <td style="font-family:monospace;">${item.startDate} — ${endStr}</td>
          <td style="text-align:right;">
            <button class="admin-btn admin-btn-secondary admin-btn-sm btn-edit-exp" data-id="${item.id}">Edit</button>
            <button class="admin-btn admin-btn-danger admin-btn-sm btn-del-exp" data-id="${item.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Bind actions
      tableBody.querySelectorAll('.btn-edit-exp').forEach(btn => {
        btn.addEventListener('click', () => {
          showForm(experience.find(e => e.id === btn.dataset.id));
        });
      });

      tableBody.querySelectorAll('.btn-del-exp').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this work experience entry?')) {
            const idx = experience.findIndex(e => e.id === btn.dataset.id);
            if (idx !== -1) {
              experience.splice(idx, 1);
              const success = await this.saveData('experience.json', experience, 'Delete experience entry');
              if (success) renderList();
            }
          }
        });
      });
    };

    const showForm = (item = null) => {
      formContainer.style.display = 'block';
      formContainer.innerHTML = `
        <div class="glass" style="padding: 2rem; border-color: var(--accent-primary);">
          <h3 class="admin-card-title">${item ? 'edit_experience_record' : 'add_experience_record'}</h3>
          <form id="exp-form" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="exp-company">Company Name:</label>
              <input class="form-input" type="text" id="exp-company" value="${item ? sanitizeHTML(item.company) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="exp-pos">Position / Role:</label>
              <input class="form-input" type="text" id="exp-pos" value="${item ? sanitizeHTML(item.position) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="exp-start">Start Date (YYYY-MM):</label>
              <input class="form-input" type="month" id="exp-start" value="${item ? item.startDate : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="exp-end">End Date (YYYY-MM):</label>
              <input class="form-input" type="month" id="exp-end" value="${item && item.endDate ? item.endDate : ''}" ${item && item.isCurrent ? 'disabled' : ''}>
            </div>
            <div class="form-group admin-form-full">
              <div class="toggle-switch-container">
                <div class="toggle-switch ${item && item.isCurrent ? 'active' : ''}" id="exp-current-toggle">
                  <div class="toggle-knob"></div>
                </div>
                <span class="form-label" style="margin:0;">This is my current position</span>
              </div>
            </div>
            <div class="form-group admin-form-full">
              <label class="form-label" for="exp-desc">Description of Work:</label>
              <textarea class="form-textarea" id="exp-desc" required style="min-height: 120px;">${item ? sanitizeHTML(item.description) : ''}</textarea>
            </div>
            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Save Experience</button>
              <button class="admin-btn admin-btn-secondary" type="button" id="btn-cancel-exp">Cancel</button>
            </div>
          </form>
        </div>
      `;

      const form = formContainer.querySelector('#exp-form');
      const currentToggle = form.querySelector('#exp-current-toggle');
      const endDateInput = form.querySelector('#exp-end');
      let isCurrent = item ? item.isCurrent : false;

      currentToggle.addEventListener('click', () => {
        currentToggle.classList.toggle('active');
        isCurrent = currentToggle.classList.contains('active');
        if (isCurrent) {
          endDateInput.disabled = true;
          endDateInput.value = '';
        } else {
          endDateInput.disabled = false;
        }
      });

      form.querySelector('#btn-cancel-exp').addEventListener('click', () => {
        formContainer.style.display = 'none';
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
          id: item ? item.id : 'exp-' + Math.random().toString(36).substr(2, 9),
          company: form.querySelector('#exp-company').value,
          position: form.querySelector('#exp-pos').value,
          startDate: form.querySelector('#exp-start').value,
          endDate: isCurrent ? null : endDateInput.value || null,
          isCurrent,
          description: form.querySelector('#exp-desc').value
        };

        if (item) {
          const idx = experience.findIndex(x => x.id === item.id);
          experience[idx] = payload;
        } else {
          experience.push(payload);
        }

        // Sort by start date descending
        experience.sort((a,b) => b.startDate.localeCompare(a.startDate));

        const success = await this.saveData('experience.json', experience, 'Save work experience timeline');
        if (success) {
          formContainer.style.display = 'none';
          renderList();
        }
      });
    };

    container.querySelector('#btn-new-exp').addEventListener('click', () => showForm());
    renderList();
  }

  // ====== EDUCATION CRUD ======
  async renderEducationEditor(container) {
    container.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';
    const education = await this.loadData('education.json');

    container.innerHTML = `
      <div class="admin-card glass glow">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h2 class="admin-card-title" style="margin:0;">education_catalog_crud</h2>
          <button class="admin-btn admin-btn-primary admin-btn-sm" id="btn-new-edu">+ Add Education</button>
        </div>
        <div id="edu-form-container" style="display:none; margin-bottom: 2rem;"></div>
        
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Institution</th>
                <th>Degree / Cert</th>
                <th>Field</th>
                <th>Dates</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="edu-table-body">
              <!-- Render list -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    const tableBody = container.querySelector('#edu-table-body');
    const formContainer = container.querySelector('#edu-form-container');

    const renderList = () => {
      tableBody.innerHTML = '';
      if (education.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No education details entered.</td></tr>';
        return;
      }

      education.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:600;">${sanitizeHTML(item.institution)}</td>
          <td>${sanitizeHTML(item.degree)}</td>
          <td>${sanitizeHTML(item.field)}</td>
          <td style="font-family:monospace;">${item.startDate} — ${item.endDate}</td>
          <td style="text-align:right;">
            <button class="admin-btn admin-btn-secondary admin-btn-sm btn-edit-edu" data-id="${item.id}">Edit</button>
            <button class="admin-btn admin-btn-danger admin-btn-sm btn-del-edu" data-id="${item.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Bind actions
      tableBody.querySelectorAll('.btn-edit-edu').forEach(btn => {
        btn.addEventListener('click', () => {
          showForm(education.find(e => e.id === btn.dataset.id));
        });
      });

      tableBody.querySelectorAll('.btn-del-edu').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this education entry?')) {
            const idx = education.findIndex(e => e.id === btn.dataset.id);
            if (idx !== -1) {
              education.splice(idx, 1);
              const success = await this.saveData('education.json', education, 'Delete education entry');
              if (success) renderList();
            }
          }
        });
      });
    };

    const showForm = (item = null) => {
      formContainer.style.display = 'block';
      formContainer.innerHTML = `
        <div class="glass" style="padding: 2rem; border-color: var(--accent-primary);">
          <h3 class="admin-card-title">${item ? 'edit_education_record' : 'add_education_record'}</h3>
          <form id="edu-form" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="edu-inst">Institution / Board:</label>
              <input class="form-input" type="text" id="edu-inst" value="${item ? sanitizeHTML(item.institution) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="edu-degree">Degree / Title:</label>
              <input class="form-input" type="text" id="edu-degree" value="${item ? sanitizeHTML(item.degree) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="edu-field">Field of Study:</label>
              <input class="form-input" type="text" id="edu-field" value="${item ? sanitizeHTML(item.field) : ''}" required>
            </div>
            <div class="form-group" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label class="form-label" for="edu-start">Start Year:</label>
                <input class="form-input" type="number" id="edu-start" value="${item ? item.startDate : '2020'}" required>
              </div>
              <div>
                <label class="form-label" for="edu-end">End Year:</label>
                <input class="form-input" type="number" id="edu-end" value="${item ? item.endDate : '2024'}" required>
              </div>
            </div>
            <div class="form-group admin-form-full">
              <label class="form-label" for="edu-desc">Description (Optional):</label>
              <textarea class="form-textarea" id="edu-desc" style="min-height: 100px;">${item ? sanitizeHTML(item.description) : ''}</textarea>
            </div>
            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Save Education</button>
              <button class="admin-btn admin-btn-secondary" type="button" id="btn-cancel-edu">Cancel</button>
            </div>
          </form>
        </div>
      `;

      const form = formContainer.querySelector('#edu-form');

      form.querySelector('#btn-cancel-edu').addEventListener('click', () => {
        formContainer.style.display = 'none';
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
          id: item ? item.id : 'edu-' + Math.random().toString(36).substr(2, 9),
          institution: form.querySelector('#edu-inst').value,
          degree: form.querySelector('#edu-degree').value,
          field: form.querySelector('#edu-field').value,
          startDate: form.querySelector('#edu-start').value,
          endDate: form.querySelector('#edu-end').value,
          description: form.querySelector('#edu-desc').value
        };

        if (item) {
          const idx = education.findIndex(x => x.id === item.id);
          education[idx] = payload;
        } else {
          education.push(payload);
        }

        const success = await this.saveData('education.json', education, 'Save education catalog info');
        if (success) {
          formContainer.style.display = 'none';
          renderList();
        }
      });
    };

    container.querySelector('#btn-new-edu').addEventListener('click', () => showForm());
    renderList();
  }

  // ====== SKILLS EDITOR ======
  async renderSkillsEditor(container) {
    container.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';
    const skills = await this.loadData('skills.json');

    container.innerHTML = `
      <div class="admin-card glass glow">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h2 class="admin-card-title" style="margin:0;">skills_catalog_editor</h2>
          <button class="admin-btn admin-btn-primary admin-btn-sm" id="btn-new-skill-cat">+ Add Category</button>
        </div>
        
        <div id="skills-canvas-container" style="display:flex; flex-direction:column; gap:2rem;">
          <!-- Dynamically generated list -->
        </div>

        <div class="admin-btn-group" style="margin-top:2rem; border-top: 1px solid var(--border-color); padding-top:1.5rem;">
          <button class="admin-btn admin-btn-primary" id="btn-save-skills">Commit Skills Catalog</button>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#skills-canvas-container');

    const renderCanvas = () => {
      canvas.innerHTML = '';
      if (skills.length === 0) {
        canvas.innerHTML = '<p class="terminal-output">No skill categories defined.</p>';
        return;
      }

      skills.forEach((cat, catIdx) => {
        const catCard = document.createElement('div');
        catCard.className = 'glass';
        catCard.style.padding = '1.5rem';
        catCard.style.position = 'relative';

        let itemsHTML = '';
        (cat.items || []).forEach((item, itemIdx) => {
          itemsHTML += `
            <div class="skill-row" style="display:grid; grid-template-columns:1fr 1fr auto; gap:15px; align-items:center; margin-bottom:10px;">
              <input class="form-input skill-name-input" type="text" value="${sanitizeHTML(item.name)}" placeholder="Skill Name" required>
              <div style="display:flex; align-items:center; gap:10px;">
                <input type="range" class="skill-lvl-input" min="0" max="100" value="${item.level}" style="flex-grow:1; cursor:pointer;">
                <span class="skill-lvl-display" style="font-family:monospace; width:35px; text-align:right;">${item.level}%</span>
              </div>
              <button class="admin-btn admin-btn-danger admin-btn-sm btn-del-skill" data-cat="${catIdx}" data-item="${itemIdx}">&times;</button>
            </div>
          `;
        });

        catCard.innerHTML = `
          <button class="admin-btn admin-btn-danger admin-btn-sm btn-del-cat" data-cat="${catIdx}" style="position:absolute; top:1.25rem; right:1.5rem;">Delete Category</button>
          
          <div class="form-group" style="max-width:300px; margin-bottom:1.5rem;">
            <label class="form-label">Category Title:</label>
            <input class="form-input cat-title-input" type="text" value="${sanitizeHTML(cat.category)}" required>
          </div>

          <div style="margin-bottom:1.5rem;">
            <label class="form-label">Skills under Category:</label>
            <div class="skill-items-list">${itemsHTML}</div>
          </div>

          <button class="admin-btn admin-btn-secondary admin-btn-sm btn-add-skill" data-cat="${catIdx}">+ Add Skill</button>
        `;

        canvas.appendChild(catCard);
      });

      // Bind dynamic range slider values
      canvas.querySelectorAll('.skill-lvl-input').forEach(slider => {
        slider.addEventListener('input', () => {
          slider.nextElementSibling.innerText = `${slider.value}%`;
        });
      });

      // Bind skill actions
      canvas.querySelectorAll('.btn-add-skill').forEach(btn => {
        btn.addEventListener('click', () => {
          const catIdx = parseInt(btn.dataset.cat);
          // Save temporary DOM states first
          syncState();
          skills[catIdx].items.push({ name: 'New Skill', level: 80 });
          renderCanvas();
        });
      });

      canvas.querySelectorAll('.btn-del-skill').forEach(btn => {
        btn.addEventListener('click', () => {
          const catIdx = parseInt(btn.dataset.cat);
          const itemIdx = parseInt(btn.dataset.item);
          syncState();
          skills[catIdx].items.splice(itemIdx, 1);
          renderCanvas();
        });
      });

      canvas.querySelectorAll('.btn-del-cat').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Delete entire category?')) {
            const catIdx = parseInt(btn.dataset.cat);
            skills.splice(catIdx, 1);
            renderCanvas();
          }
        });
      });
    };

    // Save inputs from DOM to JSON model state
    const syncState = () => {
      const catCards = canvas.querySelectorAll('.glass');
      catCards.forEach((card, catIdx) => {
        const titleVal = card.querySelector('.cat-title-input').value;
        skills[catIdx].category = titleVal;

        const skillRows = card.querySelectorAll('.skill-row');
        skills[catIdx].items = [];
        skillRows.forEach(row => {
          const name = row.querySelector('.skill-name-input').value;
          const level = parseInt(row.querySelector('.skill-lvl-input').value);
          skills[catIdx].items.push({ name, level });
        });
      });
    };

    container.querySelector('#btn-new-skill-cat').addEventListener('click', () => {
      syncState();
      skills.push({ category: 'New Category', items: [] });
      renderCanvas();
    });

    container.querySelector('#btn-save-skills').addEventListener('click', async () => {
      syncState();
      await this.saveData('skills.json', skills, 'Update skills catalog');
    });

    renderCanvas();
  }

  // ====== TOOLS MANAGEMENT ======
  async renderToolsEditor(container) {
    container.innerHTML = '<div class="loading-spinner" style="margin: 5rem auto;"></div>';
    const tools = await this.loadData('tools.json');

    container.innerHTML = `
      <div class="admin-card glass glow">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h2 class="admin-card-title" style="margin:0;">interactive_tools_catalog</h2>
          <button class="admin-btn admin-btn-primary admin-btn-sm" id="btn-new-tool">+ Add Tool</button>
        </div>
        <div id="tool-form-container" style="display:none; margin-bottom: 2rem;"></div>
        
        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Tool Name</th>
                <th>Description</th>
                <th>Type</th>
                <th style="text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody id="tools-table-body">
              <!-- List -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    const tableBody = container.querySelector('#tools-table-body');
    const formContainer = container.querySelector('#tool-form-container');

    const renderList = () => {
      tableBody.innerHTML = '';
      if (tools.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tools enabled.</td></tr>';
        return;
      }

      tools.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-size:1.5rem;">${t.icon}</td>
          <td style="font-weight:600;">${sanitizeHTML(t.name)}</td>
          <td style="font-size:0.9rem; color:var(--text-secondary);">${sanitizeHTML(t.description)}</td>
          <td style="font-family:monospace;">${t.type}</td>
          <td style="text-align:right;">
            <button class="admin-btn admin-btn-secondary admin-btn-sm btn-edit-tool" data-id="${t.id}">Edit</button>
            <button class="admin-btn admin-btn-danger admin-btn-sm btn-del-tool" data-id="${t.id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(tr);
      });

      // Bind actions
      tableBody.querySelectorAll('.btn-edit-tool').forEach(btn => {
        btn.addEventListener('click', () => {
          showForm(tools.find(t => t.id === btn.dataset.id));
        });
      });

      tableBody.querySelectorAll('.btn-del-tool').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Remove this tool?')) {
            const idx = tools.findIndex(t => t.id === btn.dataset.id);
            if (idx !== -1) {
              tools.splice(idx, 1);
              const success = await this.saveData('tools.json', tools, 'Delete interactive tool');
              if (success) renderList();
            }
          }
        });
      });
    };

    const showForm = (tool = null) => {
      formContainer.style.display = 'block';
      formContainer.innerHTML = `
        <div class="glass" style="padding: 2rem; border-color: var(--accent-primary);">
          <h3 class="admin-card-title">${tool ? 'edit_tool_definition' : 'add_new_tool'}</h3>
          <form id="tool-form" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label" for="tool-name">Tool Name:</label>
              <input class="form-input" type="text" id="tool-name" value="${tool ? sanitizeHTML(tool.name) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="tool-icon">Icon (Emoji or SVG):</label>
              <input class="form-input" type="text" id="tool-icon" value="${tool ? sanitizeHTML(tool.icon) : '🛠️'}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="tool-desc">Description:</label>
              <input class="form-input" type="text" id="tool-desc" value="${tool ? sanitizeHTML(tool.description) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="tool-type">Execution Type:</label>
              <select class="form-select" id="tool-type">
                <option value="builtin" ${tool && tool.type === 'builtin' ? 'selected' : ''}>Built-in Client JavaScript</option>
                <option value="external" ${tool && tool.type === 'external' ? 'selected' : ''}>External Link</option>
              </select>
            </div>
            <div class="form-group" id="tool-component-group">
              <label class="form-label" for="tool-comp">Component Trigger Name:</label>
              <input class="form-input" type="text" id="tool-comp" value="${tool ? sanitizeHTML(tool.component) : 'newToolComponent'}">
            </div>

            <div class="admin-btn-group admin-form-full">
              <button class="admin-btn admin-btn-primary" type="submit">Save Tool</button>
              <button class="admin-btn admin-btn-secondary" type="button" id="btn-cancel-tool">Cancel</button>
            </div>
          </form>
        </div>
      `;

      const form = formContainer.querySelector('#tool-form');
      const typeSelect = form.querySelector('#tool-type');
      const compGroup = form.querySelector('#tool-component-group');
      const compLabel = compGroup.querySelector('label');
      const compInput = form.querySelector('#tool-comp');

      const toggleTypeUI = () => {
        if (typeSelect.value === 'external') {
          compLabel.innerText = 'External URL Link:';
          compInput.placeholder = 'https://example.com/tool';
        } else {
          compLabel.innerText = 'Component Trigger Name:';
          compInput.placeholder = 'calculator';
        }
      };

      typeSelect.addEventListener('change', toggleTypeUI);
      toggleTypeUI();

      form.querySelector('#btn-cancel-tool').addEventListener('click', () => {
        formContainer.style.display = 'none';
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
          id: tool ? tool.id : 'tool-' + Math.random().toString(36).substr(2, 9),
          name: form.querySelector('#tool-name').value,
          icon: form.querySelector('#tool-icon').value,
          description: form.querySelector('#tool-desc').value,
          type: typeSelect.value,
          component: compInput.value
        };

        if (tool) {
          const idx = tools.findIndex(t => t.id === tool.id);
          tools[idx] = payload;
        } else {
          tools.push(payload);
        }

        const success = await this.saveData('tools.json', tools, 'Commit interactive tool list');
        if (success) {
          formContainer.style.display = 'none';
          renderList();
        }
      });
    };

    container.querySelector('#btn-new-tool').addEventListener('click', () => showForm());
    renderList();
  }

  // ====== MESSAGES INBOX VIEW ======
  async renderMessagesView(container) {
    const localMessages = JSON.parse(localStorage.getItem('messages_log') || '[]');

    container.innerHTML = `
      <div class="admin-card glass glow">
        <h2 class="admin-card-title">visitor_messages_inbox</h2>
        <div class="messages-grid" id="messages-list">
          ${localMessages.length === 0 ? '<p class="terminal-output">Inbox is empty.</p>' : ''}
        </div>
      </div>
    `;

    const list = container.querySelector('#messages-list');
    
    const renderList = () => {
      list.innerHTML = '';
      if (localMessages.length === 0) {
        list.innerHTML = '<p class="terminal-output">Inbox is empty.</p>';
        return;
      }

      // Show latest first
      [...localMessages].reverse().forEach(msg => {
        const card = document.createElement('div');
        card.className = `message-card glass ${msg.unread ? 'unread' : ''}`;
        card.innerHTML = `
          <div class="message-header">
            <div>
              <span class="message-sender">${sanitizeHTML(msg.name)}</span>
              <span class="message-email">&lt;${sanitizeHTML(msg.email)}&gt;</span>
            </div>
            <span class="message-date">${new Date(msg.timestamp).toLocaleString()}</span>
          </div>
          <div class="message-body">${sanitizeHTML(msg.message)}</div>
          <div style="display:flex; gap:10px;">
            ${msg.unread ? `<button class="admin-btn admin-btn-secondary admin-btn-sm btn-mark-read" data-id="${msg.id}">Mark Read</button>` : ''}
            <button class="admin-btn admin-btn-danger admin-btn-sm btn-del-msg" data-id="${msg.id}">Delete</button>
          </div>
        `;
        list.appendChild(card);
      });

      // Bind message action logs
      list.querySelectorAll('.btn-mark-read').forEach(btn => {
        btn.addEventListener('click', () => {
          const msg = localMessages.find(m => m.id === btn.dataset.id);
          if (msg) {
            msg.unread = false;
            localStorage.setItem('messages_log', JSON.stringify(localMessages));
            renderList();
          }
        });
      });

      list.querySelectorAll('.btn-del-msg').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Delete this message permanently?')) {
            const idx = localMessages.findIndex(m => m.id === btn.dataset.id);
            if (idx !== -1) {
              localMessages.splice(idx, 1);
              localStorage.setItem('messages_log', JSON.stringify(localMessages));
              renderList();
            }
          }
        });
      });
    };

    renderList();
  }

  // ====== TRAFFIC ANALYTICS VIEW ======
  async renderAnalyticsView(container) {
    const visitors = JSON.parse(localStorage.getItem('portfolio_visitors') || '[]');

    container.innerHTML = `
      <div class="admin-card glass glow">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h2 class="admin-card-title" style="margin:0;">traffic_analytics_monitor</h2>
          <button class="admin-btn admin-btn-danger admin-btn-sm" id="btn-clear-analytics">Clear Logs</button>
        </div>

        <div class="stats-grid">
          <div class="stat-card glass">
            <div class="stat-header">Total Hits</div>
            <div class="stat-number accent">${visitors.length}</div>
          </div>
          <div class="stat-card glass">
            <div class="stat-header">Unique IP Nodes</div>
            <div class="stat-number">${new Set(visitors.map(v => v.ip)).size}</div>
          </div>
        </div>

        <div class="table-container">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Screen Size</th>
                <th>Referrer Source</th>
                <th>User Agent Details</th>
              </tr>
            </thead>
            <tbody>
              ${visitors.length === 0 ? '<tr><td colspan="6" style="text-align:center;">No visitor telemetry recorded.</td></tr>' : ''}
              ${[...visitors].reverse().map(v => `
                <tr>
                  <td style="font-family:monospace; font-size:0.85rem;">${new Date(v.timestamp).toLocaleString()}</td>
                  <td style="font-family:monospace; color:var(--accent-primary); font-size:0.85rem;">${sanitizeHTML(v.ip)}</td>
                  <td>${sanitizeHTML(v.location)}</td>
                  <td style="font-family:monospace; font-size:0.85rem;">${sanitizeHTML(v.screen)}</td>
                  <td style="font-size:0.85rem;">${sanitizeHTML(v.referrer)}</td>
                  <td style="font-size:0.75rem; color:var(--text-secondary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${sanitizeHTML(v.agent)}">${sanitizeHTML(v.agent)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelector('#btn-clear-analytics').addEventListener('click', () => {
      if (confirm('Purge all logged visitor analytics telemetry?')) {
        localStorage.removeItem('portfolio_visitors');
        this.renderAnalyticsView(container);
        this.showToast('Analytics cache successfully purged.', 'info');
      }
    });
  }

  // ====== GENERAL UTILITIES ======
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
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

window.ContentEditor = ContentEditor;
