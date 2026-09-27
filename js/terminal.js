/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\terminal.js */

export function initTerminal(profile, fullData) {
  const terminalWidget = document.getElementById('terminal-widget-card');
  const output = document.getElementById('terminal-out');
  const input = document.getElementById('terminal-in');
  
  if (!output || !input) return;

  // Command History
  const commandHistory = [];
  let historyIndex = -1;

  // Available commands for tab completion
  const commands = [
    'help', 'whoami', 'about', 'skills', 'experience', 
    'projects', 'tools', 'education', 'contact', 'clear'
  ];

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim();
      if (cmd) {
        commandHistory.push(cmd);
        historyIndex = commandHistory.length;
      }
      input.value = '';
      processCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = input.value.toLowerCase();
      const match = commands.find(c => c.startsWith(current));
      if (match) {
        input.value = match;
      }
    }
  });

  // Focus terminal input when clicking anywhere on the terminal body
  output.parentElement.addEventListener('click', () => {
    input.focus();
  });

  function printOut(text, isError = false, isHtml = false) {
    const div = document.createElement('div');
    div.className = 'terminal-line';
    if (isError) div.style.color = 'var(--accent-danger)';
    
    if (isHtml) {
      div.innerHTML = text;
    } else {
      div.innerText = text;
    }
    
    output.appendChild(div);
    
    // Auto scroll to bottom
    output.scrollTop = output.scrollHeight;
  }

  function processCommand(cmd) {
    if (!cmd) {
      printOut('<span class="terminal-prompt">></span>', false, true);
      return;
    }

    printOut(`<span class="terminal-prompt">></span> ${cmd}`, false, true);
    
    const args = cmd.split(' ');
    const base = args[0].toLowerCase();

    switch (base) {
      case 'help':
        printOut('Available commands:');
        printOut('  whoami       - Current user identifier');
        printOut('  about        - View professional bio');
        printOut('  skills       - List technical expertise');
        printOut('  experience   - List work history');
        printOut('  projects     - View project portfolio');
        printOut('  tools        - List interactive security tools');
        printOut('  education    - Academic background & certs');
        printOut('  contact      - Get contact details');
        printOut('  clear        - Clear terminal output');
        break;
      
      case 'whoami':
        printOut(profile ? profile.name : 'haider_ali');
        if (profile && profile.title) printOut(profile.title);
        break;
        
      case 'about':
        if (profile && profile.bio) {
          printOut(profile.bio);
        } else {
          printOut('Bio not loaded.');
        }
        break;
        
      case 'skills':
        if (fullData && fullData.skills && fullData.skills.length > 0) {
          printOut('Loading skills...', false, true);
          setTimeout(() => {
            fullData.skills.forEach(cat => {
              const items = cat.items.map(i => i.name).join(', ');
              printOut(`<span style="color:var(--accent-primary)">${cat.category}</span>: ${items}`, false, true);
            });
          }, 300);
        } else {
          printOut('No skills data found.', true);
        }
        break;

      case 'experience':
        if (fullData && fullData.experience && fullData.experience.length > 0) {
          fullData.experience.forEach(exp => {
            const end = exp.isCurrent ? 'Present' : exp.endDate;
            printOut(`[${exp.startDate} - ${end}] ${exp.company} - ${exp.position}`);
          });
        } else {
          printOut('No experience data found.', true);
        }
        break;

      case 'projects':
        if (fullData && fullData.projects && fullData.projects.length > 0) {
          printOut(`Found ${fullData.projects.length} verified projects:`);
          fullData.projects.forEach(p => {
            printOut(`- ${p.name} (${p.category || 'misc'})`);
          });
        } else {
          printOut('No projects loaded.', true);
        }
        break;
        
      case 'tools':
        if (fullData && fullData.tools && fullData.tools.length > 0) {
          printOut(`Available interactive tools:`);
          fullData.tools.forEach(t => {
            printOut(`- ${t.name}`);
          });
        } else {
          printOut('No tools loaded.', true);
        }
        break;

      case 'education':
        if (fullData && fullData.education && fullData.education.length > 0) {
          fullData.education.forEach(edu => {
            printOut(`- ${edu.institution}: ${edu.degree} (${edu.field})`);
          });
        } else {
          printOut('No education data found.', true);
        }
        break;
        
      case 'contact':
        if (fullData && fullData.social) {
          if (fullData.social.email) printOut(`Email: ${fullData.social.email}`);
          if (fullData.social.linkedin) printOut(`LinkedIn: ${fullData.social.linkedin}`);
          if (fullData.social.github) printOut(`GitHub: ${fullData.social.github}`);
        } else {
          printOut('Email: contact@haiderali.dev');
        }
        break;
        
      case 'clear':
        output.innerHTML = '';
        break;
        
      case 'sudo':
        printOut('Nice try. This incident will be reported.', true);
        break;
        
      case 'submit_flag':
        if (!args[1]) {
          printOut('Usage: submit_flag FLAG{...}', true);
        } else {
          const flagUpper = args[1].toUpperCase();
          if (flagUpper === 'FLAG{C0NS0L3_H4CK3R}') {
            printOut('SUCCESS: Flag 1 captured!', false, true);
            printOut('<span style="color: gold;">🏆 You found the Console Flag!</span>', false, true);
          } else if (flagUpper === 'FLAG{R0B0TS_AR3_F0R_S30}') {
            printOut('SUCCESS: Flag 2 captured!', false, true);
            printOut('<span style="color: gold;">🏆 You found the HTML Comment Flag!</span>', false, true);
          } else {
            printOut('Error: Invalid flag.', true);
          }
        }
        break;
        
      default:
        printOut(`bash: ${base}: command not found`, true);
    }
  }
}
