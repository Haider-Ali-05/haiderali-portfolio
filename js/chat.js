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

  // Toggle chat window
  function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
      chatWindow.style.display = 'flex';
      // Small delay to allow display:flex to apply before animating opacity/transform
      setTimeout(() => {
        chatWindow.classList.remove('chat-hidden');
        inputField.focus();
      }, 10);
      fab.style.transform = 'scale(0)';
    } else {
      chatWindow.classList.add('chat-hidden');
      fab.style.transform = 'scale(1)';
      // Wait for animation to finish before hiding
      setTimeout(() => {
        chatWindow.style.display = 'none';
      }, 300);
    }
  }

  // Initial setup: ensure hidden class is applied
  chatWindow.classList.add('chat-hidden');

  fab.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'ai-message'}`;
    
    // Simple sanitization for basic text
    const p = document.createElement('p');
    p.textContent = text;
    msgDiv.appendChild(p);

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

  // Real API Integration (Phase 2)
  async function mockSendMessageToAI(message) {
    // Add user message to history
    messageHistory.push({ role: 'user', text: message });

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
      
      return data.reply;
    } catch (error) {
      console.error('Error talking to AI:', error);
      // Remove the last user message from history if the request failed
      messageHistory.pop(); 
      throw error;
    }
  }
});
