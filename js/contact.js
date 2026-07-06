/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\contact.js */

export function initContact(web3formsKey, showToast) {
  const form = document.getElementById('contact-form');
  const statusDiv = document.getElementById('form-status');
  const keyInput = document.getElementById('web3forms-access-key');

  if (keyInput) {
    keyInput.value = web3formsKey || '';
  }

  if (!form) return;

  // Rate Limiting (max 3 submissions per 5 mins in localStorage)
  const RATE_LIMIT_PERIOD = 5 * 60 * 1000; // 5 minutes
  const MAX_ATTEMPTS = 3;

  function isRateLimited() {
    const attempts = JSON.parse(localStorage.getItem('contact_attempts') || '[]');
    const now = Date.now();
    const activeAttempts = attempts.filter(time => now - time < RATE_LIMIT_PERIOD);
    
    localStorage.setItem('contact_attempts', JSON.stringify(activeAttempts));
    
    return activeAttempts.length >= MAX_ATTEMPTS;
  }

  function recordSubmissionAttempt() {
    const attempts = JSON.parse(localStorage.getItem('contact_attempts') || '[]');
    attempts.push(Date.now());
    localStorage.setItem('contact_attempts', JSON.stringify(attempts));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isRateLimited()) {
      showToast('Too many messages sent. Please wait a few minutes before trying again.', 'error');
      statusDiv.className = 'form-status error';
      statusDiv.innerText = 'Rate limit exceeded. Try again in 5 minutes.';
      return;
    }

    // Botcheck honeypot field
    const botcheck = form.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.checked) {
      showToast('Bot detected.', 'error');
      return;
    }

    const submitBtn = document.getElementById('contact-submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    statusDiv.style.display = 'none';

    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      // Save a local copy in localStorage for the Admin messages panel
      const localMessages = JSON.parse(localStorage.getItem('messages_log') || '[]');
      localMessages.push({
        id: 'msg-' + Math.random().toString(36).substr(2, 9),
        name: payload.name,
        email: payload.email,
        message: payload.message,
        timestamp: new Date().toISOString(),
        unread: true
      });
      localStorage.setItem('messages_log', JSON.stringify(localMessages));

      // Post to Web3Forms API
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.status === 200 && result.success) {
        showToast('Message sent successfully!', 'success');
        statusDiv.className = 'form-status success';
        statusDiv.innerText = 'Your message has been delivered to the console.';
        recordSubmissionAttempt();
        form.reset();
      } else {
        throw new Error(result.message || 'Transmission failure.');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to transmit message.', 'error');
      statusDiv.className = 'form-status error';
      statusDiv.innerText = `Error: ${err.message || 'Please check network connection.'}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Send Message';
    }
  });
}
