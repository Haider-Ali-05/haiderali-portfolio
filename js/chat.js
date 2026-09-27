/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\chat.js */

document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('ai-chat-fab');
  const chatWindow = document.getElementById('ai-chat-window');
  const closeBtn = document.getElementById('ai-chat-close');
  const inputField = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');
  const messagesContainer = document.getElementById('ai-chat-messages');

  let isChatOpen = false;
  let isAiTyping = false;

  // Toggle chat window (floating mode only)
  function toggleChat() {
    if (!chatWindow) return;
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
      chatWindow.style.display = 'flex';
      setTimeout(() => {
        chatWindow.classList.remove('chat-hidden');
        if (inputField) inputField.focus();
      }, 10);
      if (fab) fab.style.transform = 'scale(0)';
    } else {
      chatWindow.classList.add('chat-hidden');
      if (fab) fab.style.transform = 'scale(1)';
      setTimeout(() => {
        chatWindow.style.display = 'none';
      }, 300);
    }
  }

  // Initial setup: ensure hidden class is applied if floating
  if (chatWindow) {
    chatWindow.classList.add('chat-hidden');
  }

  if (fab) fab.addEventListener('click', toggleChat);
  if (closeBtn) closeBtn.addEventListener('click', toggleChat);

  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
    
    if (sender === 'ai' && typeof marked !== 'undefined') {
      const rawHtml = marked.parse(text);
      msgDiv.innerHTML = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(rawHtml) : rawHtml;
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
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message typing-indicator-container';
    typingDiv.id = 'ai-typing-indicator';
    typingDiv.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function removeTypingIndicator() {
    isAiTyping = false;
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  async function handleSend() {
    const text = inputField.value.trim();
    if (!text || isAiTyping) return;

    // 1. Show user message
    appendMessage('user', text);
    inputField.value = '';
    
    // 2. Show typing indicator
    showTypingIndicator();

    // 3. Send to Mock API (Phase 1)
    try {
      const response = await mockSendMessageToAI(text);
      removeTypingIndicator();
      appendMessage('ai', response);
    } catch (error) {
      removeTypingIndicator();
      appendMessage('ai', 'Sorry, I encountered an error connecting to my server. Please try again later.');
    }
  }

  sendBtn.addEventListener('click', handleSend);

  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  let messageHistory = [];
  try {
    const stored = sessionStorage.getItem('ai_chat_history');
    if (stored) {
      messageHistory = JSON.parse(stored);
      // Restore visible messages (skip system hidden messages if any)
      messageHistory.forEach(msg => {
        appendMessage(msg.role, msg.text);
      });
    }
  } catch (e) { console.error('Error loading chat history', e); }

  function saveHistory() {
    sessionStorage.setItem('ai_chat_history', JSON.stringify(messageHistory));
  }

  // Real API Integration (Phase 2)
  async function mockSendMessageToAI(message) {
    // Add user message to history
    messageHistory.push({ role: 'user', text: message });
    saveHistory();

    try {
      const response = await fetch('https://haider-ai-backend.futurehacker-7-8-7.workers.dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messageHistory
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Add AI response to history
      messageHistory.push({ role: 'ai', text: data.reply });
      saveHistory();
      
      return data.reply;
    } catch (error) {
      console.error('Error talking to AI:', error);
      // Remove the last user message from history if the request failed
      messageHistory.pop(); 
      saveHistory();
      throw error;
    }
  }
});
