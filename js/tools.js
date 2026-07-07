/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\tools.js */

export function initTools(showToast) {
  const container = document.getElementById('tools-container');
  if (!container) return;

  fetch('data/tools.json')
    .then(res => res.json())
    .then(tools => {
      container.innerHTML = '';
      tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'tool-card glass glow';
        card.innerHTML = `
          <span class="tool-icon">${tool.icon}</span>
          <h3 class="tool-name">${tool.name}</h3>
          <p class="tool-description">${tool.description}</p>
          <button class="tool-launch-btn" data-id="${tool.id}">Launch Tool</button>
        `;
        container.appendChild(card);
      });

      // Bind Launch Buttons
      container.querySelectorAll('.tool-launch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const toolId = btn.dataset.id;
          const tool = tools.find(t => t.id === toolId);
          if (tool) {
            openTool(tool, showToast);
          }
        });
      });
    })
    .catch(err => {
      console.error('Tools load error:', err);
      container.innerHTML = '<p class="terminal-output">Failed to boot interactive tools.</p>';
    });
}

function openTool(tool, showToast) {
  const modal = document.getElementById('tool-modal');
  const modalTitle = document.getElementById('modal-tool-name');
  const modalDesc = document.getElementById('modal-tool-desc');
  const modalBody = document.getElementById('tool-modal-body');

  if (!modal || !modalTitle || !modalDesc || !modalBody) return;

  modalTitle.innerText = tool.name;
  modalDesc.innerText = tool.description;
  modalBody.innerHTML = '';

  // Render specific UI based on component
  switch (tool.component) {
    case 'hashGenerator':
      renderHashGenerator(modalBody, showToast);
      break;
    case 'base64Codec':
      renderBase64Codec(modalBody, showToast);
      break;
    case 'passwordGenerator':
      renderPasswordGenerator(modalBody, showToast);
      break;
    case 'urlCodec':
      renderUrlCodec(modalBody, showToast);
      break;
    case 'jwtDecoder':
      renderJwtDecoder(modalBody, showToast);
      break;
    case 'calculator':
      renderCalculator(modalBody);
      break;
    default:
      modalBody.innerHTML = `<p class="terminal-output">Tool [${tool.component}] is not installed.</p>`;
  }

  modal.classList.add('visible');
}

/* 1. Hash Generator */
function renderHashGenerator(container, showToast) {
  container.innerHTML = `
    <div class="tool-ui">
      <div class="tool-input-group">
        <label for="hash-src">Input Text:</label>
        <textarea class="tool-textarea" id="hash-src" placeholder="Type text to hash..."></textarea>
      </div>
      <div class="tool-input-group">
        <label for="hash-algo">Algorithm:</label>
        <select class="tool-select" id="hash-algo">
          <option value="SHA-256">SHA-256</option>
          <option value="SHA-512">SHA-512</option>
          <option value="SHA-1">SHA-1</option>
          <option value="MD5">MD5</option>
        </select>
      </div>
      <button class="tool-btn" id="btn-calc-hash">Generate Hash</button>
      <div class="tool-output-area">
        <button class="tool-copy-btn" id="btn-copy-hash">Copy</button>
        <div class="tool-output-text" id="hash-output">Hash output will appear here.</div>
      </div>
    </div>
  `;

  const btnCalc = container.querySelector('#btn-calc-hash');
  const btnCopy = container.querySelector('#btn-copy-hash');
  const inputVal = container.querySelector('#hash-src');
  const algoVal = container.querySelector('#hash-algo');
  const output = container.querySelector('#hash-output');

  btnCalc.addEventListener('click', async () => {
    const text = inputVal.value;
    const algo = algoVal.value;

    if (!text) {
      output.innerText = 'Input is empty.';
      return;
    }

    if (algo === 'MD5') {
      output.innerText = calculateMD5(text);
    } else {
      try {
        const msgBuffer = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest(algo, msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        output.innerText = hashHex;
      } catch (e) {
        output.innerText = `Crypto Error: ${e.message}`;
      }
    }
  });

  btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(output.innerText);
    showToast('Copied hash to clipboard.', 'success');
  });
}

// MD5 Implementation using window.md5 CDN library
function calculateMD5(string) {
  return window.md5 ? window.md5(string) : "Error: MD5 library failed to load";
}

/* 2. Base64 Codec */
function renderBase64Codec(container, showToast) {
  container.innerHTML = `
    <div class="tool-ui">
      <div class="tool-input-group">
        <label for="b64-src">Input Data:</label>
        <textarea class="tool-textarea" id="b64-src" placeholder="Type text to encode or decode..."></textarea>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <button class="tool-btn" id="btn-b64-enc">Encode</button>
        <button class="tool-btn" id="btn-b64-dec" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);">Decode</button>
      </div>
      <div class="tool-output-area">
        <button class="tool-copy-btn" id="btn-copy-b64">Copy</button>
        <div class="tool-output-text" id="b64-output">Output will appear here.</div>
      </div>
    </div>
  `;

  const input = container.querySelector('#b64-src');
  const output = container.querySelector('#b64-output');

  container.querySelector('#btn-b64-enc').addEventListener('click', () => {
    try {
      output.innerText = btoa(unescape(encodeURIComponent(input.value)));
    } catch (e) {
      output.innerText = `Encoding failed: ${e.message}`;
    }
  });

  container.querySelector('#btn-b64-dec').addEventListener('click', () => {
    try {
      output.innerText = decodeURIComponent(escape(atob(input.value)));
    } catch (e) {
      output.innerText = `Invalid Base64 payload: ${e.message}`;
    }
  });

  container.querySelector('#btn-copy-b64').addEventListener('click', () => {
    navigator.clipboard.writeText(output.innerText);
    showToast('Copied Base64 string.', 'success');
  });
}

/* 3. Password Generator */
function renderPasswordGenerator(container, showToast) {
  container.innerHTML = `
    <div class="tool-ui">
      <div class="tool-input-group">
        <label>Password Length: <span id="pwd-len-display">16</span></label>
        <input type="range" id="pwd-len" min="8" max="64" value="16" style="width: 100%; cursor: pointer;">
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: monospace;">
        <label><input type="checkbox" id="pwd-upper" checked> ABC</label>
        <label><input type="checkbox" id="pwd-lower" checked> abc</label>
        <label><input type="checkbox" id="pwd-nums" checked> 123</label>
        <label><input type="checkbox" id="pwd-syms" checked> !@#</label>
      </div>
      <button class="tool-btn" id="btn-gen-pwd">Generate Password</button>
      <div class="tool-output-area">
        <button class="tool-copy-btn" id="btn-copy-pwd">Copy</button>
        <div class="tool-output-text" id="pwd-output" style="font-size: 1.1rem; letter-spacing: 1px; color: var(--accent-secondary);">Password will appear here.</div>
      </div>
    </div>
  `;

  const lengthInput = container.querySelector('#pwd-len');
  const lengthDisplay = container.querySelector('#pwd-len-display');
  const upper = container.querySelector('#pwd-upper');
  const lower = container.querySelector('#pwd-lower');
  const nums = container.querySelector('#pwd-nums');
  const syms = container.querySelector('#pwd-syms');
  const output = container.querySelector('#pwd-output');

  lengthInput.addEventListener('input', () => {
    lengthDisplay.innerText = lengthInput.value;
  });

  container.querySelector('#btn-gen-pwd').addEventListener('click', () => {
    const len = parseInt(lengthInput.value);
    const charsUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charsLower = 'abcdefghijklmnopqrstuvwxyz';
    const charsNums = '0123456789';
    const charsSyms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let allowed = '';
    if (upper.checked) allowed += charsUpper;
    if (lower.checked) allowed += charsLower;
    if (nums.checked) allowed += charsNums;
    if (syms.checked) allowed += charsSyms;

    if (!allowed) {
      output.innerText = 'Select at least one character type.';
      return;
    }

    // Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
    const array = new Uint32Array(len);
    crypto.getRandomValues(array);
    let pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += allowed[array[i] % allowed.length];
    }
    output.innerText = pwd;
  });

  container.querySelector('#btn-copy-pwd').addEventListener('click', () => {
    navigator.clipboard.writeText(output.innerText);
    showToast('Copied password.', 'success');
  });
}

/* 4. URL Codec */
function renderUrlCodec(container, showToast) {
  container.innerHTML = `
    <div class="tool-ui">
      <div class="tool-input-group">
        <label for="url-src">URL / Data:</label>
        <textarea class="tool-textarea" id="url-src" placeholder="Type URL or query parameter data..."></textarea>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <button class="tool-btn" id="btn-url-enc">Encode</button>
        <button class="tool-btn" id="btn-url-dec" style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color);">Decode</button>
      </div>
      <div class="tool-output-area">
        <button class="tool-copy-btn" id="btn-copy-url">Copy</button>
        <div class="tool-output-text" id="url-output">Output will appear here.</div>
      </div>
    </div>
  `;

  const input = container.querySelector('#url-src');
  const output = container.querySelector('#url-output');

  container.querySelector('#btn-url-enc').addEventListener('click', () => {
    try {
      output.innerText = encodeURIComponent(input.value);
    } catch (e) {
      output.innerText = e.message;
    }
  });

  container.querySelector('#btn-url-dec').addEventListener('click', () => {
    try {
      output.innerText = decodeURIComponent(input.value);
    } catch (e) {
      output.innerText = e.message;
    }
  });

  container.querySelector('#btn-copy-url').addEventListener('click', () => {
    navigator.clipboard.writeText(output.innerText);
    showToast('Copied URL payload.', 'success');
  });
}

/* 5. JWT Decoder */
function renderJwtDecoder(container, showToast) {
  container.innerHTML = `
    <div class="tool-ui">
      <div class="tool-input-group">
        <label for="jwt-src">JWT Token:</label>
        <textarea class="tool-textarea" id="jwt-src" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."></textarea>
      </div>
      <button class="tool-btn" id="btn-dec-jwt">Decode Token</button>
      <div style="display: grid; gap: 10px;">
        <div>
          <label style="font-size: 0.8rem; font-family: monospace; color: var(--accent-primary);">Header:</label>
          <pre class="tool-output-area" id="jwt-header" style="font-size:0.85rem; padding: 0.5rem;"></pre>
        </div>
        <div>
          <label style="font-size: 0.8rem; font-family: monospace; color: var(--accent-secondary);">Payload:</label>
          <pre class="tool-output-area" id="jwt-payload" style="font-size:0.85rem; padding: 0.5rem;"></pre>
        </div>
      </div>
    </div>
  `;

  const input = container.querySelector('#jwt-src');
  const headOut = container.querySelector('#jwt-header');
  const payOut = container.querySelector('#jwt-payload');

  container.querySelector('#btn-dec-jwt').addEventListener('click', () => {
    const token = input.value.trim();
    const parts = token.split('.');

    if (parts.length !== 3) {
      showToast('Invalid JWT segment count.', 'error');
      return;
    }

    try {
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      headOut.innerText = JSON.stringify(header, null, 2);
      payOut.innerText = JSON.stringify(payload, null, 2);
    } catch (e) {
      showToast('Base64/JSON decode failure.', 'error');
    }
  });
}

// Safe Math Parser (Replaces eval)
function evaluateMath(expression) {
  const tokens = expression.match(/(?:Math\.sqrt|\d+\.?\d*|\+|-|\*|\/|\^|\(|\)|Math\.PI)/g) || [];
  let pos = 0;
  function parseExpression() {
      let node = parseTerm();
      while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
          let operator = tokens[pos++];
          let right = parseTerm();
          node = operator === '+' ? node + right : node - right;
      }
      return node;
  }
  function parseTerm() {
      let node = parseFactor();
      while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
          let operator = tokens[pos++];
          let right = parseFactor();
          node = operator === '*' ? node * right : node / right;
      }
      return node;
  }
  function parseFactor() {
      let node = parsePower();
      while (pos < tokens.length && tokens[pos] === '^') {
          pos++;
          let right = parseFactor();
          node = Math.pow(node, right);
      }
      return node;
  }
  function parsePower() {
      if (pos >= tokens.length) return 0;
      let token = tokens[pos++];
      if (token === '-') return -parsePower();
      if (token === '+') return parsePower();
      if (token === '(') {
          let node = parseExpression();
          if (tokens[pos] === ')') pos++;
          return node;
      }
      if (token === 'Math.sqrt') {
          if (tokens[pos] === '(') {
              pos++;
              let node = parseExpression();
              if (tokens[pos] === ')') pos++;
              return Math.sqrt(node);
          }
      }
      if (token === 'Math.PI') return Math.PI;
      return parseFloat(token);
  }
  const result = parseExpression();
  if (pos < tokens.length) throw new Error("Unexpected token");
  return result;
}

function renderCalculator(container) {
  container.innerHTML = `
    <div class="calc-container" style="max-width: 340px; margin: 0 auto; background: rgba(15, 22, 41, 0.85); border: 1px solid var(--border-color); border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-glow);">
      <div class="calc-display" id="calc-disp" style="background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; color: var(--accent-primary); font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; padding: 1rem; text-align: right; word-break: break-all; min-height: 60px; display: flex; align-items: center; justify-content: flex-end; text-shadow: 0 0 10px rgba(0, 240, 255, 0.3);">0</div>
      <div class="calc-grid" style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <button class="calc-btn calc-action" data-val="C" style="background: rgba(255, 56, 96, 0.15); border: 1px solid rgba(255, 56, 96, 0.3); color: var(--accent-danger);">C</button>
        <button class="calc-btn calc-action" data-val="sqrt" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.15); color: var(--accent-primary);">√</button>
        <button class="calc-btn calc-action" data-val="pow" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.15); color: var(--accent-primary);">^</button>
        <button class="calc-btn calc-action" data-val="/" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.15); color: var(--accent-primary);">/</button>
        
        <button class="calc-btn" data-val="7" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">7</button>
        <button class="calc-btn" data-val="8" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">8</button>
        <button class="calc-btn" data-val="9" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">9</button>
        <button class="calc-btn calc-action" data-val="*" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.15); color: var(--accent-primary);">*</button>
        
        <button class="calc-btn" data-val="4" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">4</button>
        <button class="calc-btn" data-val="5" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">5</button>
        <button class="calc-btn" data-val="6" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">6</button>
        <button class="calc-btn calc-action" data-val="-" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.15); color: var(--accent-primary);">-</button>
        
        <button class="calc-btn" data-val="1" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">1</button>
        <button class="calc-btn" data-val="2" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">2</button>
        <button class="calc-btn" data-val="3" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">3</button>
        <button class="calc-btn calc-action" data-val="+" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.15); color: var(--accent-primary);">+</button>
        
        <button class="calc-btn" data-val="0" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">0</button>
        <button class="calc-btn" data-val="." style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); color: var(--text-primary);">.</button>
        <button class="calc-btn calc-action" data-val="pi" style="background: rgba(0, 240, 255, 0.08); border: 1px solid rgba(0, 240, 255, 0.15); color: var(--accent-primary);">π</button>
        <button class="calc-btn calc-equals" data-val="=" style="background: rgba(57, 255, 20, 0.15); border: 1px solid rgba(57, 255, 20, 0.3); color: var(--accent-secondary); font-weight: bold;">=</button>
      </div>
    </div>
    <style>
      .calc-btn {
        padding: 1rem 0;
        font-family: 'JetBrains Mono', monospace;
        font-size: 1.1rem;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
        outline: none;
      }
      .calc-btn:hover {
        background: rgba(0, 240, 255, 0.2) !important;
        border-color: var(--accent-primary) !important;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
        transform: translateY(-2px);
      }
      .calc-btn.calc-action:hover {
        background: rgba(0, 240, 255, 0.25) !important;
      }
      .calc-btn.calc-equals:hover {
        background: rgba(57, 255, 20, 0.3) !important;
        border-color: var(--accent-secondary) !important;
        box-shadow: 0 0 12px rgba(57, 255, 20, 0.3);
      }
    </style>
  `;

  const disp = container.querySelector('#calc-disp');
  let displayExpr = '';
  let evalExpr = '';

  container.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;

      if (val === 'C') {
        displayExpr = '';
        evalExpr = '';
        disp.innerText = '0';
      } else if (val === '=') {
        if (!evalExpr) return;
        try {
          // Balance parentheses automatically
          const openP = (evalExpr.split('(').length - 1) - (evalExpr.split(')').length - 1);
          for (let i = 0; i < openP; i++) {
            evalExpr += ')';
            displayExpr += ')';
          }

          // Evaluate using a safe function execution
          const result = evaluateMath(evalExpr);
          
          if (result === undefined || !Number.isFinite(result)) {
            throw new Error('Invalid math');
          }
          
          // Render result cleanly
          disp.innerText = Number(result.toFixed(8)).toString(); // Limit decimals, clean floats
          displayExpr = disp.innerText;
          evalExpr = disp.innerText;
        } catch (e) {
          disp.innerText = 'Error';
          displayExpr = '';
          evalExpr = '';
        }
      } else if (val === 'sqrt') {
        // Smart multiply if previous char is a number
        const lastChar = evalExpr.slice(-1);
        if (/[0-9.]$/.test(lastChar)) {
          evalExpr += '*';
          displayExpr += '*';
        }
        evalExpr += 'Math.sqrt(';
        displayExpr += '√(';
        disp.innerText = displayExpr;
      } else if (val === 'pow') {
        evalExpr += '**';
        displayExpr += '^';
        disp.innerText = displayExpr;
      } else if (val === 'pi') {
        const lastChar = evalExpr.slice(-1);
        if (/[0-9.]$/.test(lastChar)) {
          evalExpr += '*';
          displayExpr += '*';
        }
        evalExpr += 'Math.PI';
        displayExpr += 'π';
        disp.innerText = displayExpr;
      } else {
        // Standard digits / operators
        if (displayExpr === '0' || disp.innerText === 'Error') {
          displayExpr = '';
          evalExpr = '';
        }
        displayExpr += val;
        evalExpr += val;
        disp.innerText = displayExpr;
      }
    });
  });
}


