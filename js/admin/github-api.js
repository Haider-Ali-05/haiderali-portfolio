/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\admin\github-api.js */

class GitHubAPI {
  constructor(token, owner, repo) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `token ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };

    const config = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `GitHub HTTP Error: ${response.status}`);
    }

    if (response.status === 204) return null; // No content response (delete actions)
    return response.json();
  }

  // Read a file from the repository
  async readFile(path) {
    // Add random parameter to prevent cache
    const data = await this.request(`/contents/${path}?t=${Date.now()}`);
    // base64 decode
    const decoded = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
    return {
      content: JSON.parse(decoded),
      sha: data.sha
    };
  }

  // Write or update a file in the repository
  async writeFile(path, content, message, sha = null) {
    const jsonStr = JSON.stringify(content, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));
    
    const body = {
      message: message,
      content: base64Content
    };

    if (sha) {
      body.sha = sha;
    }

    return this.request(`/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  // Upload raw binary base64 file (e.g. image, zip file)
  async uploadBinary(path, base64Content, message, sha = null) {
    const body = {
      message: message,
      content: base64Content
    };

    if (sha) {
      body.sha = sha;
    }

    return this.request(`/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  // Delete a file
  async deleteFile(path, sha, message) {
    const body = {
      message: message,
      sha: sha
    };

    return this.request(`/contents/${path}`, {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  }

  // Validate GitHub PAT token details
  async verifyRepo() {
    return this.request('');
  }
}

window.GitHubAPI = GitHubAPI;
