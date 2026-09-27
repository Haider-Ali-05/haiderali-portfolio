import sys, re
with open('js/app.js', 'r') as f:
    js = f.read()

# 1. Update skill rendering
js = js.replace('const chips = cat.items.map(item => `<span class=\"skill-chip\">${item.name}</span>`).join(\\'\\');', 
'''const chips = cat.items.map(item => {
        let dots = \"\";
        if (item.proficiency) {
          dots = `<span class=\"prof-dots\">` + Array(5).fill(0).map((_, i) => `<span class=\"dot ${i < item.proficiency ? \"active\" : \"\"}\"></span>`).join(\"\") + `</span>`;
        }
        return `<span class=\"skill-chip\">${item.name}${dots}</span>`;
      }).join(\"\");''')

# 2. Fix Github deduplication
js = js.replace('const sorted = repos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 10);',
'''
      // Deduplicate repos with similar names
      const uniqueRepos = [];
      const seenNames = new Set();
      for (const r of repos) {
        const normalized = (r.name || \"\").toLowerCase().replace(/-/g, \"\");
        if (!seenNames.has(normalized)) {
          seenNames.add(normalized);
          uniqueRepos.push(r);
        }
      }
      const sorted = uniqueRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 10);
''')

# 3. Fix Blog tags rendering
js = js.replace('const tags = post.tags ? `<div class=\"post-tags\">${post.tags.map(t => `#${t}`).join(\\'\\')}</div>` : \\'\\';',
'const tags = post.tags ? `<div class=\"post-tags\">${post.tags.map(t => `<span class=\"post-tag\">#${t}</span>`).join(\" \")}</div>` : \"\";')

with open('js/app.js', 'w') as f:
    f.write(js)
