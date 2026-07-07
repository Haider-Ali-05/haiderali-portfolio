document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('login-btn');
  const passwordInput = document.getElementById('admin-password');
  const passwordScreen = document.getElementById('password-screen');
  const chatScreen = document.getElementById('chat-screen');
  const chatMessages = document.getElementById('chat-messages');
  const adminInput = document.getElementById('admin-input');
  const sendBtn = document.getElementById('send-btn');

  const showPwdBtn = document.getElementById('show-change-pwd-btn');
  const pwdSection = document.getElementById('change-pwd-section');
  const savePwdBtn = document.getElementById('save-pwd-btn');
  const cancelPwdBtn = document.getElementById('cancel-pwd-btn');
  const newPwdInput = document.getElementById('new-password');
  const pwdMsg = document.getElementById('pwd-msg');

  let adminPassword = '';
  let messageHistory = [];

  loginBtn.addEventListener('click', () => {
    adminPassword = passwordInput.value.trim();
    if (adminPassword) {
      passwordScreen.style.display = 'none';
      chatScreen.style.display = 'flex';
    }
  });

  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  // Change Password UI Toggle
  showPwdBtn.addEventListener('click', () => {
    pwdSection.style.display = 'block';
    pwdMsg.textContent = '';
  });
  cancelPwdBtn.addEventListener('click', () => {
    pwdSection.style.display = 'none';
    newPwdInput.value = '';
  });

  // Change Password API Call
  savePwdBtn.addEventListener('click', async () => {
    const newPassword = newPwdInput.value.trim();
    if (!newPassword) return;

    pwdMsg.textContent = 'Saving...';
    pwdMsg.style.color = 'var(--text-main)';

    try {
      const response = await fetch('https://haider-ai-backend.futurehacker-7-8-7.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          adminPassword: adminPassword,
          newPassword: newPassword
        })
      });

      if (!response.ok) throw new Error('Failed to update password');
      
      const data = await response.json();
      if (data.success) {
        pwdMsg.textContent = 'Password updated successfully!';
        pwdMsg.style.color = '#4ade80'; // green
        adminPassword = newPassword; // Update local state
        setTimeout(() => {
          pwdSection.style.display = 'none';
          newPwdInput.value = '';
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (error) {
      pwdMsg.textContent = 'Error: Check current password or try again.';
      pwdMsg.style.color = '#f87171'; // red
    }
  });

  function appendMessage(role, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `message ${role}-message`;
    wrapper.style.marginBottom = '1rem';
    wrapper.style.textAlign = role === 'user' ? 'right' : 'left';
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;
    bubble.style.display = 'inline-block';
    bubble.style.padding = '0.8rem';
    bubble.style.borderRadius = '8px';
    bubble.style.maxWidth = '80%';
    
    if (role === 'user') {
      bubble.style.background = 'rgba(255,255,255,0.1)';
      bubble.style.border = '1px solid var(--border-color)';
    } else {
      bubble.style.background = 'var(--primary-color)';
      bubble.style.color = 'var(--bg-main)';
    }

    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function handleSend() {
    const text = adminInput.value.trim();
    if (!text) return;

    appendMessage('user', text);
    adminInput.value = '';
    
    // Add a temporary typing indicator
    const typingId = 'typing-' + Date.now();
    const typingWrapper = document.createElement('div');
    typingWrapper.id = typingId;
    typingWrapper.className = 'message ai-message';
    typingWrapper.style.marginBottom = '1rem';
    typingWrapper.innerHTML = `<div class="message-bubble" style="background: var(--primary-color); color: var(--bg-main); padding: 0.8rem; border-radius: 8px; display: inline-block;">Teaching AI...</div>`;
    chatMessages.appendChild(typingWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    messageHistory.push({ role: 'user', text: text });

    try {
      const response = await fetch('https://haider-ai-backend.futurehacker-7-8-7.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messageHistory,
          adminPassword: adminPassword
        })
      });

      document.getElementById(typingId)?.remove();

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();
      messageHistory.push({ role: 'ai', text: data.reply });
      appendMessage('ai', data.reply);

    } catch (error) {
      console.error(error);
      document.getElementById(typingId)?.remove();
      messageHistory.pop();
      appendMessage('ai', 'Error connecting to backend. Did you type the right password?');
    }
  }

  sendBtn.addEventListener('click', handleSend);
  adminInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});
