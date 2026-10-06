/* ============================================================
   NEXUS AI CHAT — v2.0 (Resilient + Offline Fallback + Optimized)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const bubbleBtn = document.getElementById('nexus-bubble-btn');
  const closeBtn = document.getElementById('nexus-close-btn');
  const popup = document.getElementById('nexus-chat-popup');
  if (bubbleBtn) bubbleBtn.addEventListener('click', () => popup.classList.toggle('hidden'));
  if (closeBtn) closeBtn.addEventListener('click', () => popup.classList.add('hidden'));
  const inputField = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');
  const messagesContainer = document.getElementById('ai-chat-messages');
  const suggestionPills = document.querySelectorAll('.suggestion-pill');
  const nexusStatus = document.getElementById('nexus-status');

  let isAiTyping = false;
  let messageHistory = [];
  const API_URL = 'https://haider-ai-backend.futurehacker-7-8-7.workers.dev';

  // ── Offline Knowledge Base (keyword-weighted intent matching) ──
  const KNOWLEDGE_BASE = [
    {
      intent: 'about_haider',
      keywords: ['haider', 'who', 'about', 'tell', 'describe', 'owner', 'portfolio', 'made', 'built', 'behind', 'yourself', 'introduce', 'creator', 'guy', 'person', 'man'],
      answer: "**Haider Ali** is a Cybersecurity Specialist & Ethical Hacker based in Pakistan. He's the Managing Director at **XSEC Solutions**, leading offensive security operations and penetration testing engagements. He's also currently pursuing a **BS in Cybersecurity** at Capital University of Sciences & Technology (CUST). His expertise spans web security, network security, SIEM/SOC, and secure application development."
    },
    {
      intent: 'skills',
      keywords: ['skills', 'tech', 'technologies', 'stack', 'expertise', 'good', 'know', 'proficient', 'capable', 'specializ', 'expert'],
      answer: "Haider's core skill areas:\n\n🛡️ **Security:** Penetration Testing, Vulnerability Assessment, Network Security, Incident Response, SIEM/SOC, Cryptography\n\n💻 **Languages:** Python, JavaScript, Bash/Shell, C/C++, SQL\n\n🔧 **Tools:** Burp Suite, Metasploit, Wireshark, Nmap, Kali Linux, Docker\n\n⚙️ **Frameworks:** Django, Node.js, React, Flask"
    },
    {
      intent: 'projects',
      keywords: ['project', 'projects', 'work', 'portfolio', 'built', 'create', 'develop', 'tools', 'made', 'showcase', 'app'],
      answer: "Here are some of Haider's key projects:\n\n1. **NetShield Firewall Analyzer** — Automated network traffic analysis & threat detection using Python + Suricata IDS rules\n2. **VaultCrypt Password Manager** — Zero-knowledge encrypted vault using AES-256-GCM & Argon2, entirely CLI-based\n3. **WebRecon OSINT Framework** — Open-source intelligence gathering toolkit that aggregates subdomain enumeration, email harvesting & tech fingerprinting\n\nYou can view them in the **Projects** section below!"
    },
    {
      intent: 'contact',
      keywords: ['contact', 'reach', 'email', 'hire', 'message', 'connect', 'talk', 'touch', 'available', 'freelance', 'work together', 'collaborate'],
      answer: "You can reach Haider through:\n\n📧 **Email:** Use the contact form in the **Contact** section below\n💼 **LinkedIn:** [linkedin.com/in/haider-ali](https://www.linkedin.com/in/haider-ali-239438418)\n🐙 **GitHub:** [github.com/haider-ali-05](https://github.com/haider-ali-05)\n📸 **Instagram:** [@ch.haider.alii](https://instagram.com/ch.haider.alii)"
    },
    {
      intent: 'experience',
      keywords: ['experience', 'work', 'job', 'company', 'career', 'role', 'position', 'employ', 'where', 'xsec', 'x-group'],
      answer: "Haider's current roles:\n\n🏢 **XSEC Solutions** — Managing Director (MD) *(June 2026 – Present)*\nLeading offensive security operations, penetration testing engagements, and directing a team of security researchers.\n\n🏢 **X-Group** — Admin / Spokesperson *(Jan 2026 – Present)*\nRepresenting the collective at cybersecurity conferences and managing public vulnerability disclosures."
    },
    {
      intent: 'education',
      keywords: ['education', 'study', 'university', 'degree', 'college', 'school', 'student', 'learn', 'academic', 'cust', 'capital'],
      answer: "🎓 **BS Cybersecurity** — Capital University of Sciences & Technology (CUST)\n📅 2025 – 2029\n\nSpecializing in network security, cryptography, and ethical hacking. Dean's list recipient and leader of the university's CTF team at national competitions."
    },
    {
      intent: 'certifications',
      keywords: ['certification', 'certified', 'cert', 'certificate', 'tryhackme', 'oscp', 'ceh', 'badge', 'credential', 'qualified'],
      answer: "📜 **TryHackMe Pre Security** — Issued by TryHackMe (2025)\nSuccessfully completed the Penetration Testing with Kali Linux course and passed the hands-on exam.\n\nHaider is continuously expanding his certifications in offensive security."
    },
    {
      intent: 'nexus_identity',
      keywords: ['nexus', 'you', 'your', 'name', 'bot', 'ai', 'assistant', 'chatbot', 'what are you', 'who are you'],
      answer: "I'm **Nexus**, Haider Ali's AI assistant. I live on this portfolio site and I'm here to answer questions about Haider — his skills, experience, projects, and background. I can also help with technical cybersecurity questions! 🧠"
    },
    {
      intent: 'greeting',
      keywords: ['hi', 'hello', 'hey', 'sup', 'yo', 'greetings', 'good morning', 'good evening', 'assalam', 'salam', 'howdy'],
      answer: "Hey there! 👋 I'm Nexus, Haider's AI assistant. I can tell you about his **skills**, **projects**, **experience**, or **how to contact him**. What would you like to know?"
    },
    {
      intent: 'thanks',
      keywords: ['thanks', 'thank', 'thx', 'appreciate', 'helpful', 'great', 'awesome', 'nice', 'cool', 'perfect'],
      answer: "You're welcome! 😊 Feel free to ask anything else about Haider or his work. I'm here to help!"
    },
    {
      intent: 'services',
      keywords: ['service', 'offer', 'provide', 'help', 'what do', 'can you', 'penetration', 'pentest', 'audit', 'security audit', 'assessment'],
      answer: "Haider offers professional cybersecurity services through **XSEC Solutions**:\n\n🔍 **Penetration Testing** — Web apps, networks, and APIs\n🛡️ **Vulnerability Assessment** — Full-scope security audits\n📊 **SIEM/SOC** — Security monitoring and incident response\n🔐 **Secure Development** — Building applications with security-first architecture\n\nReach out via the **Contact** section to discuss your needs!"
    },
    {
      intent: 'tools_used',
      keywords: ['tool', 'software', 'use', 'burp', 'metasploit', 'wireshark', 'nmap', 'kali', 'linux'],
      answer: "Haider's go-to toolkit:\n\n🔧 **Burp Suite** — Web vulnerability scanning & exploitation\n🔧 **Metasploit** — Penetration testing framework\n🔧 **Wireshark** — Network protocol analysis\n🔧 **Nmap** — Network discovery & port scanning\n🔧 **Kali Linux** — Primary offensive security OS\n🔧 **Docker** — Containerized security lab environments"
    },
    {
      intent: 'programming',
      keywords: ['code', 'program', 'language', 'python', 'javascript', 'js', 'bash', 'develop', 'developer', 'coding', 'frontend', 'backend', 'fullstack', 'full stack'],
      answer: "Haider is proficient in multiple programming languages:\n\n🐍 **Python** (Expert) — Security scripts, automation, Django/Flask backends\n⚡ **JavaScript** (Advanced) — Node.js, React, full-stack web development\n🐚 **Bash/Shell** (Advanced) — System automation, Linux scripting\n🔷 **C/C++** (Intermediate) — Low-level security research\n🗄️ **SQL** (Advanced) — Database querying & injection testing"
    },
    {
      intent: 'website',
      keywords: ['website', 'site', 'portfolio', 'page', 'how', 'design', 'theme', 'dark', 'build this'],
      answer: "This portfolio is built with **vanilla HTML, CSS, and JavaScript** — no frameworks. It features a custom dark cyber theme with cyan accents, animated network-graph canvas background, and a terminal-style interface. Haider designed and coded it himself! 🖥️"
    },
    {
      intent: 'location',
      keywords: ['where', 'location', 'country', 'city', 'live', 'based', 'from', 'pakistan', 'islamabad'],
      answer: "Haider is based in **Pakistan** and currently studying at Capital University of Sciences & Technology (CUST) in Islamabad. He works remotely for his security engagements."
    },
    {
      intent: 'ctf',
      keywords: ['ctf', 'capture', 'flag', 'competition', 'hack', 'challenge', 'game', 'wargame'],
      answer: "Haider leads his university's **CTF team** and has competed at national-level competitions. CTF challenges are a core part of his skill development in areas like reverse engineering, web exploitation, cryptography, and forensics. Check the **terminal** on this site for some hidden Easter eggs! 🏁"
    },
    {
      intent: 'age',
      keywords: ['age', 'old', 'young', 'born', 'birthday', 'birth'],
      answer: "Haider started his BS in Cybersecurity in 2025. Beyond that, he prefers to let his work speak for itself! Feel free to check out his **projects** and **experience** sections."
    },
    {
      intent: 'hobby',
      keywords: ['hobby', 'hobbies', 'fun', 'free time', 'interest', 'like', 'enjoy', 'passion', 'outside'],
      answer: "Beyond cybersecurity, Haider is passionate about:\n\n🏁 CTF competitions & wargames\n💻 Building open-source security tools\n📖 Continuous learning in offensive security\n🌐 Exploring emerging technologies in AI and blockchain security"
    }
  ];

  // ── Intent Matcher ──
  function matchOfflineIntent(query) {
    const tokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of KNOWLEDGE_BASE) {
      let score = 0;
      for (const keyword of entry.keywords) {
        // Check if any token starts with the keyword or equals it
        for (const token of tokens) {
          if (token === keyword || token.startsWith(keyword) || keyword.startsWith(token)) {
            score++;
            break; // Count each keyword only once
          }
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    // Need at least 2 keyword hits, or 1 hit if query is very short (1-2 words)
    const threshold = tokens.length <= 2 ? 1 : 2;
    return bestScore >= threshold ? bestMatch : null;
  }

  // ── Retry with Exponential Backoff ──
  async function fetchWithRetry(url, options, maxRetries = 2) {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }
        return response;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          // Wait 2s, then 4s (exponential backoff)
          await new Promise(r => setTimeout(r, Math.pow(2, attempt + 1) * 1000));
        }
      }
    }
    throw lastError;
  }

  // ── Restore History ──
  try {
    const stored = sessionStorage.getItem('nexus_chat_history');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) {
        messagesContainer.innerHTML = '';
        parsed.forEach(msg => appendMessage(msg.role, msg.text));
        messageHistory = parsed;
      }
    }
  } catch (e) {
    console.warn('Could not restore chat history', e);
  }

  // ── Suggestion Pills ──
  suggestionPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const query = pill.dataset.query;
      if (query && !isAiTyping) {
        inputField.value = query;
        handleSend();
      }
    });
  });

  // ── Message Rendering ──
  function appendMessage(sender, text, meta = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'ai-message'}`;

    if (sender === 'ai' && typeof marked !== 'undefined') {
      const rawHtml = marked.parse(text);
      if (typeof window.DOMPurify !== 'undefined') {
        msgDiv.innerHTML = window.DOMPurify.sanitize(rawHtml);
      } else {
        msgDiv.textContent = text;
      }
    } else {
      const p = document.createElement('p');
      p.textContent = text;
      msgDiv.appendChild(p);
    }

    // Add subtle meta label (e.g., "⚡ instant reply")
    if (meta) {
      const metaSpan = document.createElement('span');
      metaSpan.style.cssText = 'display:block;font-size:0.6rem;color:var(--text-muted);margin-top:6px;opacity:0.7;';
      metaSpan.textContent = meta;
      msgDiv.appendChild(metaSpan);
    }

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // ── Typing Indicator ──
  function showTypingIndicator() {
    isAiTyping = true;
    if (nexusStatus) {
      nexusStatus.innerText = 'computing...';
      nexusStatus.style.color = 'var(--accent-primary)';
    }

    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message typing-indicator-container';
    typingDiv.id = 'ai-typing-indicator';
    typingDiv.innerHTML = `
      <div class="typing-indicator" style="display:flex; gap:4px; padding: 4px 0;">
        <div style="width:6px;height:6px;border-radius:50%;background:var(--accent-primary);animation:bounce 1.4s infinite ease-in-out both;"></div>
        <div style="width:6px;height:6px;border-radius:50%;background:var(--accent-primary);animation:bounce 1.4s infinite ease-in-out both;animation-delay:-0.32s;"></div>
        <div style="width:6px;height:6px;border-radius:50%;background:var(--accent-primary);animation:bounce 1.4s infinite ease-in-out both;animation-delay:-0.16s;"></div>
      </div>
    `;
    if (!document.getElementById('bounce-keyframes')) {
      const style = document.createElement('style');
      style.id = 'bounce-keyframes';
      style.innerHTML = `@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }`;
      document.head.appendChild(style);
    }
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    isAiTyping = false;
    if (nexusStatus) {
      nexusStatus.innerText = 'online';
      nexusStatus.style.color = 'var(--accent-success)';
    }
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.remove();
  }

  // ── Main Send Handler ──
  async function handleSend() {
    const text = inputField.value.trim();
    if (!text || isAiTyping) return;

    appendMessage('user', text);
    inputField.value = '';
    showTypingIndicator();

    messageHistory.push({ role: 'user', text: text });
    saveHistory();

    try {
      // Attempt API call with retry (up to 3 total attempts)
      const response = await fetchWithRetry(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messageHistory })
      }, 2);

      const data = await response.json();
      removeTypingIndicator();

      const reply = data.reply || "I didn't receive a valid response from the core.";
      appendMessage('ai', reply);

      messageHistory.push({ role: 'ai', text: reply });
      saveHistory();

    } catch (error) {
      console.warn('Nexus AI API unavailable, switching to offline mode:', error.message);
      removeTypingIndicator();

      // ── Offline Fallback: Intent Matching ──
      const match = matchOfflineIntent(text);

      if (match) {
        // We found a relevant offline answer — serve it seamlessly
        appendMessage('ai', match.answer, '⚡ instant reply');
        messageHistory.push({ role: 'ai', text: match.answer });
      } else {
        // No match — give a helpful generic response, NOT an error
        const fallback = "I'm Nexus, Haider's AI assistant. I'm currently operating in offline mode, but I can still help! Try asking about:\n\n• **Skills & expertise**\n• **Projects**\n• **Experience & work history**\n• **Education & certifications**\n• **How to contact Haider**\n\nOr scroll through the portfolio sections below for detailed information!";
        appendMessage('ai', fallback, '⚡ instant reply');
        messageHistory.push({ role: 'ai', text: fallback });
      }

      saveHistory();
    }
  }

  // ── Persistence ──
  function saveHistory() {
    try {
      // Cap history at 30 messages to keep it lightweight
      if (messageHistory.length > 30) {
        messageHistory = messageHistory.slice(-30);
      }
      sessionStorage.setItem('nexus_chat_history', JSON.stringify(messageHistory));
    } catch (e) {
      console.warn('Storage quota exceeded');
    }
  }

  // ── Event Listeners ──
  if (sendBtn) sendBtn.addEventListener('click', handleSend);

  if (inputField) {
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }
});
