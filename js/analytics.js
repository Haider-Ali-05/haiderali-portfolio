/* C:\Users\Haider Ali\.gemini\antigravity\scratch\haiderali-portfolio\js\analytics.js */

export async function trackVisit() {
  try {
    const now = new Date();
    const referrer = document.referrer || 'Direct';
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const userAgent = navigator.userAgent;

    let ip = 'Unknown';
    let location = 'Localhost/Unknown';

    // Fetch IP and Location via free IP API
    try {
      const res = await fetch('https://ip-api.com/json/', { signal: AbortSignal.timeout(3000) });
      const data = await res.json();
      if (data && data.status === 'success') {
        ip = data.query;
        location = `${data.city}, ${data.country}`;
      }
    } catch (e) {
      console.warn('Geolocation lookup failed or timed out:', e);
    }

    const visitors = JSON.parse(localStorage.getItem('portfolio_visitors') || '[]');
    
    const currentVisit = {
      ip,
      location,
      timestamp: now.toISOString(),
      screen: screenRes,
      referrer,
      agent: userAgent
    };

    visitors.push(currentVisit);

    // Limit to 500 records
    if (visitors.length > 500) {
      visitors.shift();
    }

    localStorage.setItem('portfolio_visitors', JSON.stringify(visitors));
  } catch (err) {
    console.error('Analytics tracking failure:', err);
  }
}

export function getVisitorData() {
  return JSON.parse(localStorage.getItem('portfolio_visitors') || '[]');
}
