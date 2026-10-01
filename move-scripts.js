const fs = require('fs');
const path = require('path');
const f = path.join(process.cwd(), 'index.html');
let content = fs.readFileSync(f, 'utf8');

const scripts = [
  '<script src="https://unpkg.com/@phosphor-icons/web"></script>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>',
  '<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"></script>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.0/vanilla-tilt.min.js"></script>',
  '<script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.19/bundled/lenis.min.js"></script>'
];

scripts.forEach(s => {
  content = content.replace('  ' + s + '\n', '');
  content = content.replace('  ' + s + '\r\n', '');
  content = content.replace(s + '\n', '');
  content = content.replace(s + '\r\n', '');
});

const insertPos = content.indexOf('<script src="js/chat.js"></script>');
if (insertPos !== -1) {
  content = content.slice(0, insertPos) + scripts.map(s => '  ' + s + '\n').join('') + content.slice(insertPos);
  fs.writeFileSync(f, content);
  console.log("Success");
} else {
  console.log("Failed to find insertion point");
}
