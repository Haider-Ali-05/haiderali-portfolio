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

// Simple JS MD5 Implementation for browser fallback
function calculateMD5(string) {
  function RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX, lY) {
    var lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  function FF(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a, b, c, d, x, s, ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1 = lMessageLength + 8;
    var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    var lWordArray = Array(lNumberOfWords);
    var lBytePosition = 0;
    var lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function WordToHex(lValue) {
    var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }
  function Utf8Encode(string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  var x = Array();
  var k, AA, BB, CC, DD, a, b, c, d;
  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  string = Utf8Encode(string);
  x = ConvertToWordArray(string);
  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756); c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB); b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A); c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613); b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8); d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF); c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122); d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193); c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E); b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340); c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51); b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], S22, 0x2441453); c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6); c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8); c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681); c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9); c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6); d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA); c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5); c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244); d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97); c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3); d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92); c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0); c = II(c, d, a, b, x[k + 6], S43, 0xA3014314); b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82); d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235); c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
    a = AddUnsigned(a, AA); b = AddUnsigned(b, BB); c = AddUnsigned(c, CC); d = AddUnsigned(d, DD);
  }
  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
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

/* 6. Scientific Calculator */
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
          const result = new Function(\`return \${evalExpr}\`)();
          
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


