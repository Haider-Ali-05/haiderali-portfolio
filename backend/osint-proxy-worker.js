/* ═══════════════════════════════════════════════════════════════
   ShadowTrace OSINT Proxy — Cloudflare Worker
   Handles CORS proxy for username checks, email breach lookups,
   phone carrier analysis, and domain reconnaissance.
   Deploy with: wrangler deploy
   ═══════════════════════════════════════════════════════════════ */

const ALLOWED_ORIGINS = [
  'https://ihaiderali.dev',
  'https://haider-ali-05.github.io',
  'http://localhost',
  'http://127.0.0.1'
];

// Simple in-memory rate limiter (resets on worker restart)
const rateLimits = new Map();

function checkRateLimit(ip, endpoint, maxReqs = 10, windowMs = 60000) {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const entry = rateLimits.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  rateLimits.set(key, entry);

  return entry.count <= maxReqs;
}

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.some(o => origin?.startsWith(o));
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
}

function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin)
  });
}

// ── Country Code Database ─────────────────────────────────────
const COUNTRY_CODES = {
  "1": { country: "United States / Canada", code: "US" },
  "7": { country: "Russia / Kazakhstan", code: "RU" },
  "20": { country: "Egypt", code: "EG" },
  "27": { country: "South Africa", code: "ZA" },
  "30": { country: "Greece", code: "GR" },
  "31": { country: "Netherlands", code: "NL" },
  "33": { country: "France", code: "FR" },
  "34": { country: "Spain", code: "ES" },
  "39": { country: "Italy", code: "IT" },
  "44": { country: "United Kingdom", code: "GB" },
  "49": { country: "Germany", code: "DE" },
  "55": { country: "Brazil", code: "BR" },
  "61": { country: "Australia", code: "AU" },
  "62": { country: "Indonesia", code: "ID" },
  "63": { country: "Philippines", code: "PH" },
  "81": { country: "Japan", code: "JP" },
  "82": { country: "South Korea", code: "KR" },
  "86": { country: "China", code: "CN" },
  "90": { country: "Turkey", code: "TR" },
  "91": { country: "India", code: "IN" },
  "92": { country: "Pakistan", code: "PK" },
  "93": { country: "Afghanistan", code: "AF" },
  "94": { country: "Sri Lanka", code: "LK" },
  "98": { country: "Iran", code: "IR" },
  "212": { country: "Morocco", code: "MA" },
  "234": { country: "Nigeria", code: "NG" },
  "254": { country: "Kenya", code: "KE" },
  "351": { country: "Portugal", code: "PT" },
  "353": { country: "Ireland", code: "IE" },
  "358": { country: "Finland", code: "FI" },
  "380": { country: "Ukraine", code: "UA" },
  "880": { country: "Bangladesh", code: "BD" },
  "966": { country: "Saudi Arabia", code: "SA" },
  "971": { country: "UAE", code: "AE" },
  "972": { country: "Israel", code: "IL" },
  "974": { country: "Qatar", code: "QA" },
  "977": { country: "Nepal", code: "NP" }
};

// ── Private IP check (SSRF prevention) ────────────────────────
function isPrivateUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') return true;
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) return true;
    if (hostname.endsWith('.local') || hostname.endsWith('.internal')) return true;
    return false;
  } catch {
    return true;
  }
}

// ── Request Handler ───────────────────────────────────────────
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const origin = request.headers.get('Origin') || '';
  const url = new URL(request.url);
  const path = url.pathname;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // CORS Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  // Health check
  if (path === '/' || path === '/health') {
    return jsonResponse({ status: 'ok', service: 'ShadowTrace OSINT Proxy', version: '1.0' }, 200, origin);
  }

  // ── Route: Check Username ─────────────────────────────────
  if (path === '/check-username') {
    if (!checkRateLimit(ip, 'username', 200, 60000)) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
    }

    const platformUrl = url.searchParams.get('platform');
    const username = url.searchParams.get('username');

    if (!platformUrl || !username) {
      return jsonResponse({ error: 'Missing platform or username' }, 400, origin);
    }

    const targetUrl = platformUrl.replace('{}', encodeURIComponent(username));

    if (isPrivateUrl(targetUrl)) {
      return jsonResponse({ error: 'Invalid URL' }, 400, origin);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(targetUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ShadowTrace/1.0; +https://ihaiderali.dev)',
          'Accept': 'text/html'
        },
        redirect: 'follow',
        signal: controller.signal
      });

      clearTimeout(timeout);

      const found = response.status >= 200 && response.status < 400;

      return jsonResponse({
        found,
        status: response.status,
        url: targetUrl
      }, 200, origin);

    } catch (err) {
      // Timeout or network error — try GET as fallback
      try {
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 5000);

        const response2 = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ShadowTrace/1.0; +https://ihaiderali.dev)',
            'Accept': 'text/html'
          },
          redirect: 'follow',
          signal: controller2.signal
        });

        clearTimeout(timeout2);

        return jsonResponse({
          found: response2.status >= 200 && response2.status < 400,
          status: response2.status,
          url: targetUrl
        }, 200, origin);

      } catch {
        return jsonResponse({
          found: false,
          status: 0,
          url: targetUrl,
          error: 'timeout'
        }, 200, origin);
      }
    }
  }

  // ── Route: Check Email ────────────────────────────────────
  if (path === '/check-email') {
    if (!checkRateLimit(ip, 'email', 10, 60000)) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
    }

    const email = url.searchParams.get('email');
    if (!email) {
      return jsonResponse({ error: 'Missing email parameter' }, 400, origin);
    }

    try {
      const response = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (response.status === 404) {
        return jsonResponse({ breaches: [], found: false }, 200, origin);
      }

      const data = await response.json();

      // XposedOrNot returns breaches in the ExposedBreaches field
      let breaches = [];
      if (data.ExposedBreaches?.breaches_details) {
        breaches = data.ExposedBreaches.breaches_details.map(b => ({
          name: b.breach || b.name || 'Unknown',
          domain: b.domain || '',
          date: b.xposed_date || b.added_date || '',
          dataTypes: b.xposed_data ? b.xposed_data.split(';').map(s => s.trim()) : [],
          records: b.xposed_records || 0
        }));
      }

      return jsonResponse({ breaches, found: breaches.length > 0 }, 200, origin);

    } catch (err) {
      return jsonResponse({ breaches: [], found: false, error: err.message }, 200, origin);
    }
  }

  // ── Route: Check Phone ────────────────────────────────────
  if (path === '/check-phone') {
    if (!checkRateLimit(ip, 'phone', 10, 60000)) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
    }

    const number = url.searchParams.get('number');
    if (!number) {
      return jsonResponse({ error: 'Missing number parameter' }, 400, origin);
    }

    // Parse locally
    const cleaned = number.replace(/[^0-9]/g, '');
    let countryInfo = null;

    // Try to match country code (longest match first)
    for (let len = 3; len >= 1; len--) {
      const code = cleaned.substring(0, len);
      if (COUNTRY_CODES[code]) {
        countryInfo = COUNTRY_CODES[code];
        break;
      }
    }

    return jsonResponse({
      valid: cleaned.length >= 7 && cleaned.length <= 15,
      number: number,
      country: countryInfo?.country || 'Unknown',
      countryCode: countryInfo?.code || 'XX',
      carrier: 'Not available (requires API key)',
      lineType: 'Mobile'
    }, 200, origin);
  }

  // ── Route: Domain Recon ───────────────────────────────────
  if (path === '/domain-recon') {
    if (!checkRateLimit(ip, 'domain', 5, 60000)) {
      return jsonResponse({ error: 'Rate limit exceeded' }, 429, origin);
    }

    const domain = url.searchParams.get('domain');
    if (!domain) {
      return jsonResponse({ error: 'Missing domain parameter' }, 400, origin);
    }

    const results = { domain, dns: {}, geo: null, whois: null };

    // DNS lookups
    const dnsTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS'];
    await Promise.all(dnsTypes.map(async (type) => {
      try {
        const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
        const data = await res.json();
        results.dns[type] = data.Answer || [];
      } catch {
        results.dns[type] = [];
      }
    }));

    // IP Geolocation
    const aRecords = results.dns['A'] || [];
    if (aRecords.length > 0) {
      try {
        const res = await fetch(`http://ip-api.com/json/${aRecords[0].data}`);
        results.geo = await res.json();
      } catch {}
    }

    // WHOIS via RDAP
    try {
      const res = await fetch(`https://rdap.org/domain/${domain}`);
      if (res.ok) {
        const data = await res.json();
        results.whois = {
          name: data.ldhName,
          status: data.status,
          events: data.events,
          nameservers: data.nameservers?.map(ns => ns.ldhName) || []
        };
      }
    } catch {}

    return jsonResponse(results, 200, origin);
  }

  // 404 for unknown routes
  return jsonResponse({ error: 'Not found' }, 404, origin);
}
