const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

js = js.replace('let tagsHtml = \'\';', 'let tagsHtml = \'\';');
js = js.replace('tagsHtml = `<div class="post-tags">${post.tags.map(t => `#${t}`).join(\'\')}</div>`;', 'tagsHtml = `<div class="post-tags">${post.tags.map(t => `<span class="post-tag">#${t}</span>`).join(" ")}</div>`;');

fs.writeFileSync('js/app.js', js, 'utf8');
