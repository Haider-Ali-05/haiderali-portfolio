const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

js = js.replace('const chips = cat.items.map(item => `<span class="skill-chip">${item.name}</span>`).join(\'\');', 
`const chips = cat.items.map(item => {
        let dots = "";
        if (item.proficiency) {
          dots = \`<span class="prof-dots">\` + Array(5).fill(0).map((_, i) => \`<span class="dot \${i < item.proficiency ? "active" : ""}"></span>\`).join("") + \`</span>\`;
        }
        return \`<span class="skill-chip">\${item.name}\${dots}</span>\`;
      }).join("");`);

js = js.replace('const sorted = repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 10);',
`
      // Deduplicate repos with similar names
      const uniqueRepos = [];
      const seenNames = new Set();
      for (const r of repos) {
        const normalized = (r.name || "").toLowerCase().replace(/-/g, "");
        if (!seenNames.has(normalized)) {
          seenNames.add(normalized);
          uniqueRepos.push(r);
        }
      }
      const sorted = uniqueRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 10);
`);

js = js.replace('const tags = post.tags ? `<div class="post-tags">${post.tags.map(t => `#${t}`).join(\'\')}</div>` : \'\';',
'const tags = post.tags ? `<div class="post-tags">${post.tags.map(t => `<span class="post-tag">#${t}</span>`).join(" ")}</div>` : "";');

fs.writeFileSync('js/app.js', js);
