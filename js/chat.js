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

  // MOCK API for Phase 1
  async function mockSendMessageToAI(message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerMsg = message.toLowerCase();
        let reply = "I am Haider's AI assistant. I'm currently in Phase 1 of my development. Soon, I'll have a direct link to his brain (and his social media data)!";
        
        if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
          reply = "Hello! I'm Nexus. How can I help you learn more about Haider?";
        } else if (lowerMsg.includes('skills') || lowerMsg.includes('tech')) {
          reply = "Haider is skilled in Penetration Testing, Vulnerability Assessment, and Secure Application Development.";
        } else if (lowerMsg.includes('contact') || lowerMsg.includes('email')) {
          reply = "You can reach Haider via the contact form on this site, or through his linked social accounts.";
        } else if (lowerMsg.includes('resume') || lowerMsg.includes('cv')) {
          reply = "You can download his full resume from the Hero section above!";
        }

        resolve(reply);
      }, 1500); // Simulate network delay
    });
  }
});
