/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\chat.js */

document.addEventListener('DOMContentLoaded', () => {
  const inputField = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');
  const messagesContainer = document.getElementById('ai-chat-messages');
  const suggestionPills = document.querySelectorAll('.suggestion-pill');
  const nexusStatus = document.getElementById('nexus-status');

  let isAiTyping = false;
  let messageHistory = [];

  // Restore history
  try {
    const stored = sessionStorage.getItem('nexus_chat_history');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) {
        messagesContainer.innerHTML = ''; // Clear default greeting if we have history
        parsed.forEach(msg => appendMessage(msg.role, msg.text));
        messageHistory = parsed;
      }
    }
  } catch (e) {
    console.warn('Could not restore chat history', e);
  }

  // Suggestion Pills
  suggestionPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const query = pill.dataset.query;
      if (query && !isAiTyping) {
        inputField.value = query;
        handleSend();
      }
    });
  });

  function appendMessage(sender, text, isError = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
    
    if (isError) {
      msgDiv.style.border = '1px solid var(--accent-danger)';
      msgDiv.style.color = 'var(--accent-danger)';
    }

    if (sender === 'ai' && typeof marked !== 'undefined') {
      const rawHtml = marked.parse(text);
      msgDiv.innerHTML = (typeof window.DOMPurify !== 'undefined') ? window.DOMPurify.sanitize(rawHtml) : rawHtml;
    } else {
      const p = document.createElement('p');
      p.textContent = text;
      msgDiv.appendChild(p);
    }

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

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
    // Add keyframes inline just for the chat indicator
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

  function updateStatus(state) {
    if (!nexusStatus) return;
    if (state === 'offline') {
      nexusStatus.innerText = 'offline';
      nexusStatus.style.color = 'var(--text-muted)';
    }
  }

  async function handleSend() {
    const text = inputField.value.trim();
    if (!text || isAiTyping) return;

    appendMessage('user', text);
    inputField.value = '';
    showTypingIndicator();

    messageHistory.push({ role: 'user', text: text });
    saveHistory();

    try {
      const response = await fetch('https://haider-ai-backend.futurehacker-7-8-7.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messageHistory }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      removeTypingIndicator();
      
      const reply = data.reply || "I didn't receive a valid response from the core.";
      appendMessage('ai', reply);
      
      messageHistory.push({ role: 'ai', text: reply });
      saveHistory();

    } catch (error) {
      console.error('Nexus AI connection error:', error);
      removeTypingIndicator();
      
      // Graceful fallback UI
      updateStatus('offline');
      appendMessage('ai', 'Nexus AI core is currently unreachable or degraded. Please try again later or contact Haider directly via the form below.', true);
      
      // We don't save the error message to history so it doesn't pollute context when it comes back online
      messageHistory.pop(); // Remove the user's message that failed
      saveHistory();
    }
  }

  function saveHistory() {
    try {
      sessionStorage.setItem('nexus_chat_history', JSON.stringify(messageHistory));
    } catch (e) {
      console.warn('Storage quota exceeded');
    }
  }

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
