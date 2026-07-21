/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\terminal.js */
export function initTerminal(profile) {
  const terminal = document.getElementById('interactive-terminal');
  if (!terminal) return;

  const output = document.getElementById('terminal-out');
  const input = document.getElementById('terminal-in');
  const termClose = document.getElementById('terminal-close');
  const termHeader = document.getElementById('terminal-drag-handle');

  let isDragging = false;
  let offsetX, offsetY;

  // Toggle with ~
  document.addEventListener('keydown', (e) => {
    if (e.key === '~' || e.key === '`') {
      e.preventDefault();
      toggleTerminal();
    }
  });

  if (termClose) {
    termClose.addEventListener('click', () => {
      terminal.style.display = 'none';
    });
  }

  // Draggable logic
  termHeader.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - terminal.getBoundingClientRect().left;
    offsetY = e.clientY - terminal.getBoundingClientRect().top;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    terminal.style.left = (e.clientX - offsetX) + 'px';
    terminal.style.top = (e.clientY - offsetY) + 'px';
    terminal.style.bottom = 'auto'; // Disable default bottom positioning
    terminal.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      input.value = '';
      processCommand(cmd);
    }
  });

  function toggleTerminal() {
    if (terminal.style.display === 'none' || !terminal.style.display) {
      terminal.style.display = 'flex';
      input.focus();
    } else {
      terminal.style.display = 'none';
    }
  }

  function printOut(text, isError = false, isHtml = false) {
    const div = document.createElement('div');
    if (isError) div.style.color = 'var(--accent-danger)';
    if (isHtml) {
      div.innerHTML = text;
    } else {
      div.innerText = text;
    }
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  function processCommand(cmd) {
    printOut(`> ${cmd}`);
    const args = cmd.split(' ');
    const base = args[0].toLowerCase();

    switch (base) {
      case 'help':
        printOut('Available commands:');
        printOut('  whoami       - current user info');
        printOut('  skills       - list top skills');
        printOut('  contact      - get contact email');
        printOut('  clear        - clear terminal output');
        printOut('  submit_flag  - submit a CTF flag (e.g. submit_flag FLAG{...})');
        break;
      case 'whoami':
        printOut(profile ? profile.name : 'haider_ali');
        break;
      case 'skills':
        printOut('Loading skills...', false, true);
        setTimeout(() => printOut('Penetration Testing, Web Security, React, Python, C++'), 500);
        break;
      case 'contact':
        printOut('Email: contact@haiderali.dev');
        break;
      case 'clear':
        output.innerHTML = '';
        break;
      case 'submit_flag':
        if (args[1] === 'FLAG{c0ns0l3_h4ck3r}') {
          printOut('SUCCESS: Flag 1 captured!', false, true);
          printOut('<span style="color: gold;">🏆 You found the Console Flag!</span>', false, true);
        } else if (args[1] === 'FLAG{r0b0ts_ar3_f0r_s30}') {
          printOut('SUCCESS: Flag 2 captured!', false, true);
          printOut('<span style="color: gold;">🏆 You found the HTML Comment Flag!</span>', false, true);
        } else {
          printOut('Error: Invalid or missing flag.', true);
        }
        break;
      case 'sudo':
        printOut('Nice try. This incident will be reported.', true);
        break;
      case '':
        break;
      default:
        printOut(`bash: ${base}: command not found`, true);
    }
  }
}
