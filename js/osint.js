/* ═══════════════════════════════════════════════════════════════
   ShadowTrace — OSINT Reconnaissance Engine
   Author: Haider Ali | https://ihaiderali.dev
   ═══════════════════════════════════════════════════════════════ */

// ── Configuration ──────────────────────────────────────────────
const WORKER_URL = 'https://haider-osint-proxy.futurehacker-7-8-7.workers.dev';
const SCAN_DELAY = 150; // ms between platform checks

// ── Platform Database (100+) ──────────────────────────────────
const PLATFORMS = [
  // Social Media
  { name: "Instagram", url: "https://instagram.com/{}", cat: "social", icon: "📸" },
  { name: "Twitter/X", url: "https://x.com/{}", cat: "social", icon: "🐦" },
  { name: "TikTok", url: "https://tiktok.com/@{}", cat: "social", icon: "🎵" },
  { name: "Reddit", url: "https://reddit.com/user/{}", cat: "social", icon: "🤖" },
  { name: "Pinterest", url: "https://pinterest.com/{}", cat: "social", icon: "📌" },
  { name: "Tumblr", url: "https://{}.tumblr.com", cat: "social", icon: "📝" },
  { name: "Mastodon", url: "https://mastodon.social/@{}", cat: "social", icon: "🐘" },
  { name: "Snapchat", url: "https://snapchat.com/add/{}", cat: "social", icon: "👻" },
  { name: "Facebook", url: "https://facebook.com/{}", cat: "social", icon: "📘" },
  { name: "VK", url: "https://vk.com/{}", cat: "social", icon: "🔵" },
  { name: "Flickr", url: "https://flickr.com/people/{}", cat: "social", icon: "📷" },
  { name: "WeHeartIt", url: "https://weheartit.com/{}", cat: "social", icon: "💜" },
  { name: "VSCO", url: "https://vsco.co/{}", cat: "social", icon: "🎞️" },
  { name: "500px", url: "https://500px.com/p/{}", cat: "social", icon: "📸" },
  { name: "Threads", url: "https://threads.net/@{}", cat: "social", icon: "🧵" },

  // Developer
  { name: "GitHub", url: "https://github.com/{}", cat: "dev", icon: "💻" },
  { name: "GitLab", url: "https://gitlab.com/{}", cat: "dev", icon: "🦊" },
  { name: "Bitbucket", url: "https://bitbucket.org/{}", cat: "dev", icon: "🪣" },
  { name: "Dev.to", url: "https://dev.to/{}", cat: "dev", icon: "📰" },
  { name: "CodePen", url: "https://codepen.io/{}", cat: "dev", icon: "🖊️" },
  { name: "HackerRank", url: "https://hackerrank.com/profile/{}", cat: "dev", icon: "⌨️" },
  { name: "LeetCode", url: "https://leetcode.com/u/{}", cat: "dev", icon: "🧩" },
  { name: "Replit", url: "https://replit.com/@{}", cat: "dev", icon: "⚡" },
  { name: "Hashnode", url: "https://{}.hashnode.dev", cat: "dev", icon: "📝" },
  { name: "npm", url: "https://npmjs.com/~{}", cat: "dev", icon: "📦" },
  { name: "PyPI", url: "https://pypi.org/user/{}", cat: "dev", icon: "🐍" },
  { name: "Codewars", url: "https://codewars.com/users/{}", cat: "dev", icon: "⚔️" },
  { name: "Kaggle", url: "https://kaggle.com/{}", cat: "dev", icon: "📊" },
  { name: "StackOverflow", url: "https://stackoverflow.com/users/{}", cat: "dev", icon: "📚" },

  // Security / Hacking
  { name: "HackTheBox", url: "https://app.hackthebox.com/users/{}", cat: "security", icon: "🟩" },
  { name: "TryHackMe", url: "https://tryhackme.com/p/{}", cat: "security", icon: "🔐" },
  { name: "BugCrowd", url: "https://bugcrowd.com/{}", cat: "security", icon: "🐛" },
  { name: "HackerOne", url: "https://hackerone.com/{}", cat: "security", icon: "🛡️" },
  { name: "Keybase", url: "https://keybase.io/{}", cat: "security", icon: "🔑" },
  { name: "Exploit-DB", url: "https://exploit-db.com/author/?a={}", cat: "security", icon: "💀" },
  { name: "PentesterLab", url: "https://pentesterlab.com/profile/{}", cat: "security", icon: "🧪" },
  { name: "CyberDefenders", url: "https://cyberdefenders.org/p/{}", cat: "security", icon: "🛡️" },

  // Professional
  { name: "LinkedIn", url: "https://linkedin.com/in/{}", cat: "professional", icon: "💼" },
  { name: "About.me", url: "https://about.me/{}", cat: "professional", icon: "👤" },
  { name: "Behance", url: "https://behance.net/{}", cat: "professional", icon: "🎨" },
  { name: "Dribbble", url: "https://dribbble.com/{}", cat: "professional", icon: "🏀" },
  { name: "AngelList", url: "https://angel.co/u/{}", cat: "professional", icon: "😇" },
  { name: "Gravatar", url: "https://gravatar.com/{}", cat: "professional", icon: "🌐" },
  { name: "Linktree", url: "https://linktr.ee/{}", cat: "professional", icon: "🌳" },
  { name: "Bio.link", url: "https://bio.link/{}", cat: "professional", icon: "🔗" },

  // Gaming
  { name: "Steam", url: "https://steamcommunity.com/id/{}", cat: "gaming", icon: "🎮" },
  { name: "Twitch", url: "https://twitch.tv/{}", cat: "gaming", icon: "🟣" },
  { name: "Xbox", url: "https://xboxgamertag.com/search/{}", cat: "gaming", icon: "🟢" },
  { name: "Chess.com", url: "https://chess.com/member/{}", cat: "gaming", icon: "♟️" },
  { name: "Lichess", url: "https://lichess.org/@/{}", cat: "gaming", icon: "♜" },
  { name: "Roblox", url: "https://roblox.com/user.aspx?username={}", cat: "gaming", icon: "🧱" },
  { name: "Minecraft", url: "https://namemc.com/profile/{}", cat: "gaming", icon: "⛏️" },
  { name: "Epic Games", url: "https://fortnitetracker.com/profile/all/{}", cat: "gaming", icon: "🎯" },
  { name: "Riot Games", url: "https://tracker.gg/valorant/profile/riot/{}%231", cat: "gaming", icon: "🎮" },
  { name: "osu!", url: "https://osu.ppy.sh/users/{}", cat: "gaming", icon: "🎵" },

  // Media & Content
  { name: "YouTube", url: "https://youtube.com/@{}", cat: "media", icon: "▶️" },
  { name: "Vimeo", url: "https://vimeo.com/{}", cat: "media", icon: "🎬" },
  { name: "SoundCloud", url: "https://soundcloud.com/{}", cat: "media", icon: "🎧" },
  { name: "Spotify", url: "https://open.spotify.com/user/{}", cat: "media", icon: "🎵" },
  { name: "Medium", url: "https://medium.com/@{}", cat: "media", icon: "✍️" },
  { name: "Substack", url: "https://{}.substack.com", cat: "media", icon: "📰" },
  { name: "Goodreads", url: "https://goodreads.com/{}", cat: "media", icon: "📖" },
  { name: "Last.fm", url: "https://last.fm/user/{}", cat: "media", icon: "🎶" },
  { name: "Bandcamp", url: "https://{}.bandcamp.com", cat: "media", icon: "💿" },
  { name: "Dailymotion", url: "https://dailymotion.com/{}", cat: "media", icon: "📹" },
  { name: "Mixcloud", url: "https://mixcloud.com/{}", cat: "media", icon: "🎛️" },

  // Messaging
  { name: "Telegram", url: "https://t.me/{}", cat: "messaging", icon: "✈️" },
  { name: "Skype", url: "https://join.skype.com/invite/{}", cat: "messaging", icon: "💬" },
  { name: "Discord (ID)", url: "https://discord.com/users/{}", cat: "messaging", icon: "🎙️" },
  { name: "Signal", url: "https://signal.me/#p/{}", cat: "messaging", icon: "📡" },

  // Forums & Community
  { name: "HackerNews", url: "https://news.ycombinator.com/user?id={}", cat: "forums", icon: "🔶" },
  { name: "ProductHunt", url: "https://producthunt.com/@{}", cat: "forums", icon: "🐱" },
  { name: "Quora", url: "https://quora.com/profile/{}", cat: "forums", icon: "❓" },
  { name: "Disqus", url: "https://disqus.com/by/{}", cat: "forums", icon: "💬" },
  { name: "SlideShare", url: "https://slideshare.net/{}", cat: "forums", icon: "📊" },
  { name: "HubPages", url: "https://hubpages.com/@{}", cat: "forums", icon: "📄" },

  // Finance & Crypto
  { name: "PayPal.me", url: "https://paypal.me/{}", cat: "other", icon: "💰" },
  { name: "Cash.app", url: "https://cash.app/${}", cat: "other", icon: "💵" },
  { name: "Patreon", url: "https://patreon.com/{}", cat: "other", icon: "🎁" },
  { name: "Ko-fi", url: "https://ko-fi.com/{}", cat: "other", icon: "☕" },
  { name: "BuyMeACoffee", url: "https://buymeacoffee.com/{}", cat: "other", icon: "🍵" },

  // Other
  { name: "Imgur", url: "https://imgur.com/user/{}", cat: "other", icon: "🖼️" },
  { name: "Pastebin", url: "https://pastebin.com/u/{}", cat: "other", icon: "📋" },
  { name: "Archive.org", url: "https://archive.org/details/@{}", cat: "other", icon: "📚" },
  { name: "Fiverr", url: "https://fiverr.com/{}", cat: "other", icon: "💼" },
  { name: "Freelancer", url: "https://freelancer.com/u/{}", cat: "other", icon: "🧑‍💻" },
  { name: "Trello", url: "https://trello.com/{}", cat: "other", icon: "📋" },
  { name: "Notion", url: "https://{}.notion.site", cat: "other", icon: "📓" },
  { name: "Giphy", url: "https://giphy.com/{}", cat: "other", icon: "🎞️" },
  { name: "Unsplash", url: "https://unsplash.com/@{}", cat: "other", icon: "📷" },
  { name: "Pexels", url: "https://pexels.com/@{}", cat: "other", icon: "🖼️" },
  { name: "Wattpad", url: "https://wattpad.com/user/{}", cat: "other", icon: "📖" },
  { name: "Letterboxd", url: "https://letterboxd.com/{}", cat: "other", icon: "🎬" },
  { name: "MyAnimeList", url: "https://myanimelist.net/profile/{}", cat: "other", icon: "🌸" },
  { name: "AniList", url: "https://anilist.co/user/{}", cat: "other", icon: "📺" },
  { name: "Instructables", url: "https://instructables.com/member/{}", cat: "other", icon: "🔧" },
  { name: "Thingiverse", url: "https://thingiverse.com/{}", cat: "other", icon: "🖨️" },
];

// ── Category Labels ───────────────────────────────────────────
const CAT_LABELS = {
  social: { label: "Social Media", color: "#e91e63" },
  dev: { label: "Developer", color: "#4caf50" },
  security: { label: "Security", color: "#ff5722" },
  professional: { label: "Professional", color: "#2196f3" },
  gaming: { label: "Gaming", color: "#9c27b0" },
  media: { label: "Media", color: "#ff9800" },
  messaging: { label: "Messaging", color: "#00bcd4" },
  forums: { label: "Forums", color: "#795548" },
  other: { label: "Other", color: "#607d8b" }
};

// ── Country Code Database ─────────────────────────────────────
const COUNTRY_CODES = {
  "+1": "United States / Canada", "+7": "Russia / Kazakhstan",
  "+20": "Egypt", "+27": "South Africa", "+30": "Greece",
  "+31": "Netherlands", "+32": "Belgium", "+33": "France",
  "+34": "Spain", "+36": "Hungary", "+39": "Italy",
  "+40": "Romania", "+41": "Switzerland", "+43": "Austria",
  "+44": "United Kingdom", "+45": "Denmark", "+46": "Sweden",
  "+47": "Norway", "+48": "Poland", "+49": "Germany",
  "+51": "Peru", "+52": "Mexico", "+53": "Cuba",
  "+54": "Argentina", "+55": "Brazil", "+56": "Chile",
  "+57": "Colombia", "+58": "Venezuela", "+60": "Malaysia",
  "+61": "Australia", "+62": "Indonesia", "+63": "Philippines",
  "+64": "New Zealand", "+65": "Singapore", "+66": "Thailand",
  "+81": "Japan", "+82": "South Korea", "+84": "Vietnam",
  "+86": "China", "+90": "Turkey", "+91": "India",
  "+92": "Pakistan", "+93": "Afghanistan", "+94": "Sri Lanka",
  "+95": "Myanmar", "+98": "Iran", "+212": "Morocco",
  "+213": "Algeria", "+216": "Tunisia", "+218": "Libya",
  "+220": "Gambia", "+221": "Senegal", "+234": "Nigeria",
  "+249": "Sudan", "+251": "Ethiopia", "+254": "Kenya",
  "+255": "Tanzania", "+256": "Uganda", "+260": "Zambia",
  "+263": "Zimbabwe", "+351": "Portugal", "+352": "Luxembourg",
  "+353": "Ireland", "+354": "Iceland", "+355": "Albania",
  "+358": "Finland", "+370": "Lithuania", "+371": "Latvia",
  "+372": "Estonia", "+380": "Ukraine", "+381": "Serbia",
  "+385": "Croatia", "+386": "Slovenia", "+420": "Czech Republic",
  "+421": "Slovakia", "+880": "Bangladesh", "+960": "Maldives",
  "+961": "Lebanon", "+962": "Jordan", "+963": "Syria",
  "+964": "Iraq", "+965": "Kuwait", "+966": "Saudi Arabia",
  "+967": "Yemen", "+968": "Oman", "+970": "Palestine",
  "+971": "UAE", "+972": "Israel", "+973": "Bahrain",
  "+974": "Qatar", "+975": "Bhutan", "+976": "Mongolia",
  "+977": "Nepal", "+993": "Turkmenistan", "+994": "Azerbaijan",
  "+995": "Georgia", "+998": "Uzbekistan"
};

// ── Global State ──────────────────────────────────────────────
let scanResults = [];
let currentScanType = '';
let isScanning = false;

// ── Username Variation Generator ──────────────────────────────
function generateVariations(username) {
  const u = username.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  const variations = new Set([u]);

  // Split common patterns
  const parts = u.split(/[_.\-]/);
  if (parts.length >= 2) {
    variations.add(parts.join(''));
    variations.add(parts.join('_'));
    variations.add(parts.join('-'));
    variations.add(parts.join('.'));
  } else if (u.length > 5) {
    // Try splitting CamelCase-ish or at common points
    for (let i = 3; i < u.length - 2; i++) {
      if (/[aeiou]/.test(u[i - 1]) && /[^aeiou]/.test(u[i])) {
        const p1 = u.slice(0, i), p2 = u.slice(i);
        variations.add(p1 + '_' + p2);
        variations.add(p1 + '.' + p2);
        break;
      }
    }
  }

  // Common suffixes
  ['1', '01', '05', '123', '007', '99'].forEach(s => variations.add(u + s));

  // Common prefixes
  ['the', 'iam', 'its', 'x', 'mr', 'real'].forEach(p => variations.add(p + u));

  return [...variations].slice(0, 15);
}


// ══════════════════════════════════════════════════════════════
//  MODULE 1: USERNAME RECON
// ══════════════════════════════════════════════════════════════
async function scanUsername(username, includeVariations) {
  const usernames = includeVariations ? generateVariations(username) : [username];
  const allPlatforms = [];

  usernames.forEach(u => {
    PLATFORMS.forEach(p => {
      allPlatforms.push({ ...p, username: u, fullUrl: p.url.replace('{}', u) });
    });
  });

  const total = allPlatforms.length;
  let checked = 0;
  const results = [];

  updateScanStatus(`Scanning ${total} targets for "${username}"...`);
  updateProgressCount(`0/${total}`);

  for (const platform of allPlatforms) {
    if (!isScanning) break;

    appendScanLine(platform.name, platform.fullUrl, 'checking', platform.username);

    try {
      const response = await fetch(`${WORKER_URL}/check-username?platform=${encodeURIComponent(platform.url)}&username=${encodeURIComponent(platform.username)}`, {
        signal: AbortSignal.timeout(8000)
      });
      const data = await response.json();

      const result = {
        ...platform,
        found: data.found,
        status: data.status
      };
      results.push(result);
      updateLastScanLine(platform.name, platform.fullUrl, data.found ? 'found' : 'not-found', platform.username);
    } catch (err) {
      // Worker failed or is not deployed yet. Fallback to client-side no-cors mode.
      // Warning: no-cors responses are opaque, so status is 0. This is a weak heuristic.
      try {
          const fbResponse = await fetch(platform.fullUrl, { mode: 'no-cors', signal: AbortSignal.timeout(5000) });
          // If the fetch succeeds (even with status 0), we mark it as potentially found.
          // This will have false positives for platforms that return 200 for 404 pages.
          results.push({ ...platform, found: true, status: 0, error: false, note: 'Fallback check' });
          updateLastScanLine(platform.name, platform.fullUrl, 'found', platform.username + ' (unverified)');
      } catch (fbErr) {
          results.push({ ...platform, found: false, status: 0, error: true });
          updateLastScanLine(platform.name, platform.fullUrl, 'error', platform.username);
      }
    }

    checked++;
    updateProgress(checked, total);
    updateProgressCount(`${checked}/${total}`);

    await sleep(SCAN_DELAY);
  }

  return results;
}


// ══════════════════════════════════════════════════════════════
//  MODULE 2: EMAIL RECON
// ══════════════════════════════════════════════════════════════
async function scanEmail(email) {
  const results = { email, breaches: [], gravatarUrl: null, mxRecords: [], valid: false };

  // 1. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  results.valid = emailRegex.test(email);
  if (!results.valid) return results;

  appendScanLine('Email Format', email, 'found', 'Valid ✓');

  // 2. Gravatar lookup
  try {
    appendScanLine('Gravatar', 'Checking avatar...', 'checking');
    const hash = await md5Hash(email.trim().toLowerCase());
    const gravatarUrl = `https://gravatar.com/avatar/${hash}?d=404&s=200`;
    const gRes = await fetch(gravatarUrl, { method: 'HEAD', mode: 'no-cors' });
    results.gravatarUrl = `https://gravatar.com/avatar/${hash}?s=200`;
    updateLastScanLine('Gravatar', results.gravatarUrl, 'found');
  } catch {
    updateLastScanLine('Gravatar', 'No avatar found', 'not-found');
  }

  // 3. XposedOrNot Breach Check
  try {
    appendScanLine('Breach Database', 'Querying XposedOrNot...', 'checking');
    let data;
    try {
      const response = await fetch(`${WORKER_URL}/check-email?email=${encodeURIComponent(email)}`, {
        signal: AbortSignal.timeout(10000)
      });
      data = await response.json();
    } catch (err) {
      // Fallback: direct API call if worker isn't deployed (XposedOrNot supports CORS)
      const directResponse = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });
      if (directResponse.status === 404) {
        data = { breaches: [], found: false };
      } else {
        const directData = await directResponse.json();
        let breaches = [];
        if (directData.ExposedBreaches && directData.ExposedBreaches.breaches_details) {
          breaches = directData.ExposedBreaches.breaches_details.map(b => ({
            name: b.breach || b.name || 'Unknown',
            domain: b.domain || '',
            date: b.xposed_date || b.added_date || '',
            dataTypes: b.xposed_data ? b.xposed_data.split(';').map(s => s.trim()) : [],
            records: b.xposed_records || 0
          }));
        }
        data = { breaches, found: breaches.length > 0 };
      }
    }
    if (data.breaches && data.breaches.length > 0) {
      results.breaches = data.breaches;
      updateLastScanLine('Breach Database', `${data.breaches.length} breach(es) found!`, 'found');
    } else {
      updateLastScanLine('Breach Database', 'No breaches found', 'not-found');
    }
  } catch {
    updateLastScanLine('Breach Database', 'Could not reach API', 'error');
  }

  // 4. Domain MX check
  const domain = email.split('@')[1];
  try {
    appendScanLine('MX Records', `Checking ${domain}...`, 'checking');
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await response.json();
    if (data.Answer) {
      results.mxRecords = data.Answer.map(a => a.data);
      updateLastScanLine('MX Records', `${results.mxRecords.length} mail server(s)`, 'found');
    } else {
      updateLastScanLine('MX Records', 'No MX records', 'not-found');
    }
  } catch {
    updateLastScanLine('MX Records', 'Lookup failed', 'error');
  }

  return results;
}


// ══════════════════════════════════════════════════════════════
//  MODULE 3: PHONE RECON
// ══════════════════════════════════════════════════════════════
async function scanPhone(countryCode, phoneNumber) {
  const fullNumber = countryCode + phoneNumber;
  const results = {
    number: fullNumber,
    countryCode,
    phoneNumber,
    country: COUNTRY_CODES[countryCode] || 'Unknown',
    valid: false,
    lineType: 'Mobile',
    carrier: 'Unknown',
    whatsapp: null,
    telegram: null
  };

  // Validate
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  results.valid = digitsOnly.length >= 7 && digitsOnly.length <= 15;

  if (!results.valid) return results;

  appendScanLine('Phone Validation', fullNumber, 'found', 'Valid format ✓');
  appendScanLine('Country', results.country, 'found', countryCode);

  // Detect line type heuristic
  if (digitsOnly.startsWith('3') || digitsOnly.startsWith('7') || digitsOnly.startsWith('9')) {
    results.lineType = 'Mobile';
  } else if (digitsOnly.startsWith('2') || digitsOnly.startsWith('4')) {
    results.lineType = 'Landline';
  } else if (digitsOnly.startsWith('800') || digitsOnly.startsWith('0800')) {
    results.lineType = 'Toll-Free';
  }
  appendScanLine('Line Type', results.lineType, 'found');

  // WhatsApp check
  appendScanLine('WhatsApp', 'Generating check link...', 'checking');
  results.whatsapp = `https://wa.me/${countryCode.replace('+', '')}${digitsOnly}`;
  updateLastScanLine('WhatsApp', 'Link generated', 'found');

  // Telegram check (if username-based, limited)
  appendScanLine('Telegram', 'Limited without username', 'not-found');

  // Carrier lookup via worker
  try {
    appendScanLine('Carrier Lookup', 'Querying...', 'checking');
    const response = await fetch(`${WORKER_URL}/check-phone?number=${encodeURIComponent(fullNumber)}`, {
      signal: AbortSignal.timeout(8000)
    });
    const data = await response.json();
    if (data.carrier) results.carrier = data.carrier;
    if (data.lineType) results.lineType = data.lineType;
    updateLastScanLine('Carrier Lookup', results.carrier || 'Unknown', data.carrier ? 'found' : 'not-found');
  } catch {
    updateLastScanLine('Carrier Lookup', 'Using local analysis', 'not-found');
  }

  return results;
}


// ══════════════════════════════════════════════════════════════
//  MODULE 4: IMAGE EXIF ANALYSIS (fully client-side)
// ══════════════════════════════════════════════════════════════
function analyzeImage(file) {
  return new Promise((resolve) => {
    const results = {
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + ' KB',
      fileType: file.type,
      metadata: {},
      gps: null,
      previewUrl: null
    };

    // Create preview
    const reader = new FileReader();
    reader.onload = function (e) {
      results.previewUrl = e.target.result;

      const img = new Image();
      img.onload = function () {
        results.metadata['Resolution'] = `${img.width} × ${img.height}`;
        results.metadata['Aspect Ratio'] = (img.width / img.height).toFixed(2);

        // Use EXIF.js
        if (typeof EXIF !== 'undefined') {
          EXIF.getData(img, function () {
            const allTags = EXIF.getAllTags(this);

            // Camera info
            if (allTags.Make) results.metadata['Camera Make'] = allTags.Make;
            if (allTags.Model) results.metadata['Camera Model'] = allTags.Model;
            if (allTags.LensModel) results.metadata['Lens'] = allTags.LensModel;
            if (allTags.FNumber) results.metadata['Aperture'] = `f/${allTags.FNumber}`;
            if (allTags.ISOSpeedRatings) results.metadata['ISO'] = allTags.ISOSpeedRatings;
            if (allTags.ExposureTime) results.metadata['Shutter Speed'] = `1/${Math.round(1 / allTags.ExposureTime)}s`;
            if (allTags.FocalLength) results.metadata['Focal Length'] = `${allTags.FocalLength}mm`;
            if (allTags.Flash) results.metadata['Flash'] = allTags.Flash;

            // Software
            if (allTags.Software) results.metadata['Software'] = allTags.Software;
            if (allTags.Artist) results.metadata['Artist / Author'] = allTags.Artist;
            if (allTags.Copyright) results.metadata['Copyright'] = allTags.Copyright;

            // Timestamps
            if (allTags.DateTime) results.metadata['Date Modified'] = allTags.DateTime;
            if (allTags.DateTimeOriginal) results.metadata['Date Taken'] = allTags.DateTimeOriginal;
            if (allTags.DateTimeDigitized) results.metadata['Date Digitized'] = allTags.DateTimeDigitized;

            // Device
            if (allTags.Orientation) results.metadata['Orientation'] = allTags.Orientation;
            if (allTags.XResolution) results.metadata['DPI (X)'] = allTags.XResolution;
            if (allTags.YResolution) results.metadata['DPI (Y)'] = allTags.YResolution;
            if (allTags.ColorSpace) results.metadata['Color Space'] = allTags.ColorSpace === 1 ? 'sRGB' : 'Adobe RGB';

            // GPS
            const lat = EXIF.getTag(this, 'GPSLatitude');
            const lon = EXIF.getTag(this, 'GPSLongitude');
            const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
            const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');

            if (lat && lon) {
              const latDec = convertDMSToDD(lat, latRef);
              const lonDec = convertDMSToDD(lon, lonRef);
              results.gps = { lat: latDec, lon: lonDec };
              results.metadata['GPS Latitude'] = latDec.toFixed(6);
              results.metadata['GPS Longitude'] = lonDec.toFixed(6);
              if (EXIF.getTag(this, 'GPSAltitude')) {
                results.metadata['GPS Altitude'] = EXIF.getTag(this, 'GPSAltitude') + 'm';
              }
            }

            appendScanLine('EXIF Data', `${Object.keys(results.metadata).length} fields extracted`, 'found');
            if (results.gps) {
              appendScanLine('GPS Location', `${results.gps.lat.toFixed(4)}, ${results.gps.lon.toFixed(4)}`, 'found');
            } else {
              appendScanLine('GPS Location', 'Not embedded in image', 'not-found');
            }

            resolve(results);
          });
        } else {
          results.metadata['Note'] = 'EXIF library not loaded';
          resolve(results);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function convertDMSToDD(dms, ref) {
  const dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
  return (ref === 'S' || ref === 'W') ? -dd : dd;
}


// ══════════════════════════════════════════════════════════════
//  MODULE 5: DOMAIN RECON
// ══════════════════════════════════════════════════════════════
async function scanDomain(domain) {
  domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  const results = { domain, dns: {}, whois: null, geo: null, headers: null };

  // DNS Records
  const dnsTypes = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'SOA'];
  for (const type of dnsTypes) {
    try {
      appendScanLine(`DNS ${type}`, `Resolving...`, 'checking');
      const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
      const data = await res.json();
      results.dns[type] = data.Answer || [];
      updateLastScanLine(`DNS ${type}`, results.dns[type].length > 0 ? `${results.dns[type].length} record(s)` : 'No records', results.dns[type].length > 0 ? 'found' : 'not-found');
    } catch {
      updateLastScanLine(`DNS ${type}`, 'Failed', 'error');
    }
  }

  // Get IP from A record for geolocation
  const aRecords = results.dns['A'] || [];
  if (aRecords.length > 0) {
    const ip = aRecords[0].data;
    try {
      appendScanLine('IP Geolocation', `Locating ${ip}...`, 'checking');
      const res = await fetch(`http://ip-api.com/json/${ip}`);
      const data = await res.json();
      results.geo = data;
      updateLastScanLine('IP Geolocation', `${data.city}, ${data.country}`, 'found');
    } catch {
      updateLastScanLine('IP Geolocation', 'Failed', 'error');
    }
  }

  // WHOIS via RDAP
  try {
    appendScanLine('WHOIS (RDAP)', 'Querying...', 'checking');
    const res = await fetch(`https://rdap.org/domain/${domain}`);
    if (res.ok) {
      const data = await res.json();
      results.whois = {
        name: data.ldhName,
        status: data.status,
        events: data.events,
        nameservers: data.nameservers?.map(ns => ns.ldhName) || [],
        registrar: data.entities?.[0]?.vcardArray?.[1]?.find(v => v[0] === 'fn')?.[3] || 'Unknown'
      };
      updateLastScanLine('WHOIS (RDAP)', results.whois.registrar, 'found');
    } else {
      updateLastScanLine('WHOIS (RDAP)', 'Not available', 'not-found');
    }
  } catch {
    updateLastScanLine('WHOIS (RDAP)', 'Failed', 'error');
  }

  return results;
}


// ══════════════════════════════════════════════════════════════
//  MODULE 6: REPORT EXPORT
// ══════════════════════════════════════════════════════════════
function exportJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `shadowtrace-report-${Date.now()}.json`);
}

function exportCSV(data) {
  if (!Array.isArray(data)) {
    data = scanResults;
  }
  let csv = 'Platform,URL,Status,Category,Username\n';
  data.forEach(r => {
    csv += `"${r.name}","${r.fullUrl}","${r.found ? 'Found' : 'Not Found'}","${r.cat}","${r.username || ''}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadBlob(blob, `shadowtrace-report-${Date.now()}.csv`);
}

function exportPDF(data) {
  if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
    alert('PDF library not loaded');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(0, 240, 255);
  doc.text('ShadowTrace — OSINT Report', 20, 25);

  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(`Generated: ${new Date().toISOString()}`, 20, 33);
  doc.text(`Tool: https://ihaiderali.dev/osint.html`, 20, 39);

  doc.setDrawColor(0, 240, 255);
  doc.line(20, 44, 190, 44);

  let y = 55;
  doc.setFontSize(12);
  doc.setTextColor(0);

  if (Array.isArray(data)) {
    const found = data.filter(r => r.found);
    doc.text(`Scan Type: Username Enumeration`, 20, y); y += 8;
    doc.text(`Total Platforms Checked: ${data.length}`, 20, y); y += 8;
    doc.text(`Accounts Found: ${found.length}`, 20, y); y += 12;

    doc.setFontSize(10);
    found.forEach(r => {
      if (y > 270) { doc.addPage(); y = 25; }
      doc.text(`${r.icon} ${r.name}: ${r.fullUrl}`, 25, y);
      y += 7;
    });
  } else {
    doc.text(JSON.stringify(data, null, 2).substring(0, 3000), 20, y);
  }

  doc.save(`shadowtrace-report-${Date.now()}.pdf`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


// ══════════════════════════════════════════════════════════════
//  UI HELPERS
// ══════════════════════════════════════════════════════════════
function updateScanStatus(text) {
  const el = document.getElementById('scan-status-text');
  if (el) el.textContent = text;
}

function updateProgressCount(text) {
  const el = document.getElementById('scan-progress-count');
  if (el) el.textContent = text;
}

function updateProgress(current, total) {
  const fill = document.getElementById('progress-bar-fill');
  if (fill) fill.style.width = `${(current / total) * 100}%`;
}

function appendScanLine(platform, detail, status, extra) {
  const terminal = document.getElementById('scan-terminal');
  if (!terminal) return;

  const div = document.createElement('div');
  div.className = 'scan-line';
  div.dataset.platform = platform;

  const statusIcons = {
    'found': '✅',
    'not-found': '❌',
    'error': '⚠️',
    'checking': '⏳'
  };

  div.innerHTML = `
    <span class="status-${status}">${statusIcons[status] || '•'}</span>
    <span class="platform-name">${platform}</span>
    <span class="platform-url">${detail}</span>
    ${extra ? `<span style="color:var(--text-muted);font-size:0.7rem;">[${extra}]</span>` : ''}
  `;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

function updateLastScanLine(platform, detail, status) {
  const terminal = document.getElementById('scan-terminal');
  if (!terminal) return;

  const lines = terminal.querySelectorAll('.scan-line');
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].dataset.platform === platform) {
      const statusIcons = { 'found': '✅', 'not-found': '❌', 'error': '⚠️', 'checking': '⏳' };
      const statusSpan = lines[i].querySelector('[class^="status-"]');
      const urlSpan = lines[i].querySelector('.platform-url');
      if (statusSpan) {
        statusSpan.className = `status-${status}`;
        statusSpan.textContent = statusIcons[status] || '•';
      }
      if (urlSpan) urlSpan.textContent = detail;
      break;
    }
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function md5Hash(str) {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function clearResults() {
  document.getElementById('scan-terminal').innerHTML = '';
  document.getElementById('results-grid').innerHTML = '';
  document.getElementById('results-summary').innerHTML = '';
  document.getElementById('category-filters').style.display = 'none';
  document.getElementById('results-dashboard').classList.remove('active');
  document.getElementById('export-section').style.display = 'none';
  ['exif', 'breach', 'phone', 'domain'].forEach(id => {
    const el = document.getElementById(`${id}-results-container`);
    if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  });
  updateProgress(0, 1);
  scanResults = [];
}


// ══════════════════════════════════════════════════════════════
//  RESULTS RENDERERS
// ══════════════════════════════════════════════════════════════
function renderUsernameResults(results) {
  scanResults = results;
  const found = results.filter(r => r.found);
  const dashboard = document.getElementById('results-dashboard');
  const summary = document.getElementById('results-summary');
  const grid = document.getElementById('results-grid');
  const filters = document.getElementById('category-filters');

  // Summary cards
  const catCounts = {};
  found.forEach(r => { catCounts[r.cat] = (catCounts[r.cat] || 0) + 1; });

  summary.innerHTML = `
    <div class="summary-card found"><div class="summary-number">${found.length}</div><div class="summary-label">Accounts Found</div></div>
    <div class="summary-card not-found"><div class="summary-number">${results.length - found.length}</div><div class="summary-label">Not Found</div></div>
    <div class="summary-card"><div class="summary-number">${results.length}</div><div class="summary-label">Total Checked</div></div>
    <div class="summary-card"><div class="summary-number">${Object.keys(catCounts).length}</div><div class="summary-label">Categories</div></div>
  `;

  // Category filters
  filters.style.display = 'flex';
  filters.innerHTML = `<button class="cat-filter active" data-cat="all">All <span class="cat-count">${found.length}</span></button>`;
  Object.entries(catCounts).forEach(([cat, count]) => {
    filters.innerHTML += `<button class="cat-filter" data-cat="${cat}">${CAT_LABELS[cat]?.label || cat} <span class="cat-count">${count}</span></button>`;
  });

  // Result cards (found only)
  renderFilteredCards(found, 'all');

  // Filter click handlers
  filters.querySelectorAll('.cat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      filters.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFilteredCards(found, btn.dataset.cat);
    });
  });

  dashboard.classList.add('active');
  document.getElementById('export-section').style.display = 'flex';
}

function renderFilteredCards(found, category) {
  const grid = document.getElementById('results-grid');
  const filtered = category === 'all' ? found : found.filter(r => r.cat === category);

  grid.innerHTML = filtered.map(r => `
    <a class="result-card osint-glass" href="${r.fullUrl}" target="_blank" rel="noopener noreferrer">
      <span class="card-icon">${r.icon}</span>
      <div class="card-info">
        <div class="card-platform">${r.name}</div>
        <div class="card-url">${r.fullUrl}</div>
      </div>
      <span class="card-status found">Found</span>
    </a>
  `).join('');
}

function renderEmailResults(results) {
  const dashboard = document.getElementById('results-dashboard');
  const summary = document.getElementById('results-summary');
  const container = document.getElementById('breach-results-container');

  summary.innerHTML = `
    <div class="summary-card ${results.breaches.length > 0 ? 'breaches' : 'found'}">
      <div class="summary-number">${results.breaches.length}</div>
      <div class="summary-label">Breaches Found</div>
    </div>
    <div class="summary-card"><div class="summary-number">${results.mxRecords.length}</div><div class="summary-label">Mail Servers</div></div>
    <div class="summary-card found"><div class="summary-number">${results.valid ? '✓' : '✗'}</div><div class="summary-label">Valid Email</div></div>
  `;

  let html = '';

  if (results.gravatarUrl) {
    html += `<div class="osint-glass" style="padding: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1.5rem;">
      <img src="${results.gravatarUrl}" alt="Gravatar" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--accent-primary);">
      <div>
        <div style="font-weight: 600; color: var(--text-primary);">Gravatar Profile Found</div>
        <div style="color: var(--text-muted); font-size: 0.85rem;">${results.email}</div>
      </div>
    </div>`;
  }

  if (results.breaches.length > 0) {
    html += '<h3 style="color: var(--accent-danger); margin-bottom: 1rem; font-family: JetBrains Mono;">⚠️ Data Breaches</h3>';
    results.breaches.forEach(b => {
      const breach = typeof b === 'string' ? { name: b } : b;
      html += `<div class="breach-card critical osint-glass">
        <div class="breach-name">${breach.name || breach}</div>
        ${breach.date ? `<div class="breach-date">${breach.date}</div>` : ''}
        ${breach.dataTypes ? `<div class="breach-data-types">${breach.dataTypes.map(t => `<span class="breach-tag">${t}</span>`).join('')}</div>` : ''}
      </div>`;
    });
  } else {
    html += '<div class="osint-glass" style="padding: 1.5rem; text-align: center; color: var(--accent-secondary);">✅ No known breaches found for this email</div>';
  }

  if (results.mxRecords.length > 0) {
    html += '<h3 style="color: var(--text-primary); margin: 1.5rem 0 1rem; font-family: JetBrains Mono;">📧 Mail Servers (MX Records)</h3>';
    results.mxRecords.forEach(mx => {
      html += `<div class="dns-record">${mx}</div>`;
    });
  }

  container.innerHTML = html;
  container.style.display = 'block';
  dashboard.classList.add('active');
  document.getElementById('export-section').style.display = 'flex';
  scanResults = results;
}

function renderPhoneResults(results) {
  const dashboard = document.getElementById('results-dashboard');
  const summary = document.getElementById('results-summary');
  const container = document.getElementById('phone-results-container');

  summary.innerHTML = `
    <div class="summary-card found"><div class="summary-number">${results.valid ? '✓' : '✗'}</div><div class="summary-label">Valid Format</div></div>
    <div class="summary-card"><div class="summary-number">${results.countryCode}</div><div class="summary-label">Country Code</div></div>
  `;

  container.innerHTML = `
    <div class="phone-info-grid">
      <div class="phone-info-card osint-glass"><div class="info-icon">🌍</div><div class="info-label">Country</div><div class="info-value">${results.country}</div></div>
      <div class="phone-info-card osint-glass"><div class="info-icon">📱</div><div class="info-label">Line Type</div><div class="info-value">${results.lineType}</div></div>
      <div class="phone-info-card osint-glass"><div class="info-icon">📡</div><div class="info-label">Carrier</div><div class="info-value">${results.carrier}</div></div>
      <div class="phone-info-card osint-glass"><div class="info-icon">📞</div><div class="info-label">Full Number</div><div class="info-value">${results.number}</div></div>
    </div>
    ${results.whatsapp ? `
    <div style="margin-top: 1.5rem; text-align: center;">
      <a href="${results.whatsapp}" target="_blank" rel="noopener" class="scan-btn" style="display: inline-flex; text-decoration: none;">
        <span>💬</span> Open WhatsApp Chat
      </a>
    </div>` : ''}
  `;

  container.style.display = 'block';
  dashboard.classList.add('active');
  document.getElementById('export-section').style.display = 'flex';
  scanResults = results;
}

function renderExifResults(results) {
  const dashboard = document.getElementById('results-dashboard');
  const summary = document.getElementById('results-summary');
  const container = document.getElementById('exif-results-container');

  const metaCount = Object.keys(results.metadata).length;

  summary.innerHTML = `
    <div class="summary-card found"><div class="summary-number">${metaCount}</div><div class="summary-label">Metadata Fields</div></div>
    <div class="summary-card ${results.gps ? 'breaches' : ''}"><div class="summary-number">${results.gps ? '📍' : '—'}</div><div class="summary-label">GPS Data</div></div>
    <div class="summary-card"><div class="summary-number">${results.fileSize}</div><div class="summary-label">File Size</div></div>
  `;

  let html = '<div class="exif-results">';

  // Left: Image preview + metadata table
  html += '<div>';
  if (results.previewUrl) {
    html += `<img src="${results.previewUrl}" alt="Uploaded image" class="exif-image-preview">`;
  }
  html += '<table class="exif-table">';
  html += '<tr><th colspan="2">Extracted Metadata</th></tr>';
  Object.entries(results.metadata).forEach(([key, val]) => {
    html += `<tr><td class="label">${key}</td><td>${val}</td></tr>`;
  });
  html += '</table></div>';

  // Right: Map if GPS
  html += '<div>';
  if (results.gps) {
    html += `
      <h3 style="color: var(--accent-danger); margin-bottom: 1rem; font-family: JetBrains Mono;">⚠️ GPS Location Found</h3>
      <div class="exif-map">
        <iframe 
          width="100%" height="100%" frameborder="0" scrolling="no"
          src="https://www.openstreetmap.org/export/embed.html?bbox=${results.gps.lon - 0.01},${results.gps.lat - 0.01},${results.gps.lon + 0.01},${results.gps.lat + 0.01}&layer=mapnik&marker=${results.gps.lat},${results.gps.lon}"
          style="border-radius: 10px;">
        </iframe>
      </div>
      <p style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-muted);">
        📍 ${results.gps.lat.toFixed(6)}, ${results.gps.lon.toFixed(6)} — 
        <a href="https://www.google.com/maps?q=${results.gps.lat},${results.gps.lon}" target="_blank" rel="noopener" style="color: var(--accent-primary);">Open in Google Maps</a>
      </p>
    `;
  } else {
    html += '<div class="osint-glass" style="padding: 2rem; text-align: center; color: var(--accent-secondary);">✅ No GPS data embedded — Location is private</div>';
  }
  html += '</div></div>';

  container.innerHTML = html;
  container.style.display = 'block';
  dashboard.classList.add('active');
  document.getElementById('export-section').style.display = 'flex';
  scanResults = results;
}

function renderDomainResults(results) {
  const dashboard = document.getElementById('results-dashboard');
  const summary = document.getElementById('results-summary');
  const container = document.getElementById('domain-results-container');

  const totalRecords = Object.values(results.dns).reduce((s, r) => s + r.length, 0);

  summary.innerHTML = `
    <div class="summary-card found"><div class="summary-number">${totalRecords}</div><div class="summary-label">DNS Records</div></div>
    <div class="summary-card"><div class="summary-number">${results.geo ? '📍' : '—'}</div><div class="summary-label">Geolocation</div></div>
    <div class="summary-card"><div class="summary-number">${results.whois ? '✓' : '—'}</div><div class="summary-label">WHOIS</div></div>
  `;

  let html = '<div class="domain-results">';

  // DNS Records
  html += '<div>';
  html += '<h3 style="color: var(--text-primary); margin-bottom: 1rem; font-family: JetBrains Mono;">🔍 DNS Records</h3>';
  Object.entries(results.dns).forEach(([type, records]) => {
    if (records.length > 0) {
      records.forEach(r => {
        html += `<div class="dns-record"><span class="record-type">${type}</span> ${r.data || JSON.stringify(r)}</div>`;
      });
    }
  });
  html += '</div>';

  // Right column: WHOIS + Geo
  html += '<div>';
  if (results.whois) {
    html += '<h3 style="color: var(--text-primary); margin-bottom: 1rem; font-family: JetBrains Mono;">📋 WHOIS</h3>';
    html += '<table class="exif-table">';
    html += `<tr><td class="label">Domain</td><td>${results.whois.name || results.domain}</td></tr>`;
    html += `<tr><td class="label">Registrar</td><td>${results.whois.registrar}</td></tr>`;
    if (results.whois.nameservers?.length > 0) {
      html += `<tr><td class="label">Nameservers</td><td>${results.whois.nameservers.join(', ')}</td></tr>`;
    }
    if (results.whois.events) {
      results.whois.events.forEach(e => {
        html += `<tr><td class="label">${e.eventAction}</td><td>${new Date(e.eventDate).toLocaleDateString()}</td></tr>`;
      });
    }
    html += '</table>';
  }

  if (results.geo) {
    html += '<h3 style="color: var(--text-primary); margin: 1.5rem 0 1rem; font-family: JetBrains Mono;">🌍 IP Geolocation</h3>';
    html += '<table class="exif-table">';
    html += `<tr><td class="label">IP</td><td>${results.geo.query}</td></tr>`;
    html += `<tr><td class="label">Country</td><td>${results.geo.country}</td></tr>`;
    html += `<tr><td class="label">City</td><td>${results.geo.city}</td></tr>`;
    html += `<tr><td class="label">ISP</td><td>${results.geo.isp}</td></tr>`;
    html += `<tr><td class="label">ASN</td><td>${results.geo.as}</td></tr>`;
    html += `<tr><td class="label">Org</td><td>${results.geo.org}</td></tr>`;
    html += '</table>';
  }
  html += '</div></div>';

  container.innerHTML = html;
  container.style.display = 'block';
  dashboard.classList.add('active');
  document.getElementById('export-section').style.display = 'flex';
  scanResults = results;
}


// ══════════════════════════════════════════════════════════════
//  UI INITIALIZATION & EVENT HANDLERS
// ══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // Tab switching
  document.querySelectorAll('.input-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.input-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.input-area').forEach(a => a.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });

  // Username scan
  document.getElementById('username-scan-btn')?.addEventListener('click', async () => {
    const username = document.getElementById('username-input').value.trim();
    if (!username) return;
    const includeVariations = document.getElementById('variation-check')?.checked;

    clearResults();
    isScanning = true;
    currentScanType = 'username';
    document.getElementById('scan-output').classList.add('active');
    document.getElementById('username-scan-btn').disabled = true;

    try {
      const results = await scanUsername(username, includeVariations);
      renderUsernameResults(results);
      updateScanStatus('Scan complete!');
    } catch (err) {
      updateScanStatus('Scan failed: ' + err.message);
    } finally {
      isScanning = false;
      document.getElementById('username-scan-btn').disabled = false;
    }
  });

  // Email scan
  document.getElementById('email-scan-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('email-input').value.trim();
    if (!email) return;

    clearResults();
    isScanning = true;
    currentScanType = 'email';
    document.getElementById('scan-output').classList.add('active');
    document.getElementById('email-scan-btn').disabled = true;

    try {
      updateScanStatus(`Investigating ${email}...`);
      const results = await scanEmail(email);
      renderEmailResults(results);
      updateScanStatus('Investigation complete!');
    } catch (err) {
      updateScanStatus('Investigation failed: ' + err.message);
    } finally {
      isScanning = false;
      document.getElementById('email-scan-btn').disabled = false;
    }
  });

  // Phone scan
  document.getElementById('phone-scan-btn')?.addEventListener('click', async () => {
    const code = document.getElementById('country-code-input').value.trim();
    const phone = document.getElementById('phone-input').value.trim();
    if (!code || !phone) return;

    clearResults();
    isScanning = true;
    currentScanType = 'phone';
    document.getElementById('scan-output').classList.add('active');
    document.getElementById('phone-scan-btn').disabled = true;

    try {
      updateScanStatus(`Looking up ${code}${phone}...`);
      updateProgressCount('');
      const results = await scanPhone(code, phone);
      renderPhoneResults(results);
      updateScanStatus('Lookup complete!');
    } catch (err) {
      updateScanStatus('Lookup failed: ' + err.message);
    } finally {
      isScanning = false;
      document.getElementById('phone-scan-btn').disabled = false;
    }
  });

  // Image upload
  const dropZone = document.getElementById('image-drop-zone');
  const fileInput = document.getElementById('image-file-input');

  dropZone?.addEventListener('click', () => fileInput.click());
  dropZone?.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleImageFile(e.dataTransfer.files[0]);
  });
  fileInput?.addEventListener('change', (e) => {
    if (e.target.files[0]) handleImageFile(e.target.files[0]);
  });

  async function handleImageFile(file) {
    if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }

    clearResults();
    currentScanType = 'image';
    document.getElementById('scan-output').classList.add('active');
    updateScanStatus(`Analyzing ${file.name}...`);
    appendScanLine('File', `${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'found');

    try {
      const results = await analyzeImage(file);
      renderExifResults(results);
      updateScanStatus('Analysis complete!');
    } catch (err) {
      updateScanStatus('Analysis failed: ' + err.message);
    }
  }

  // Domain scan
  document.getElementById('domain-scan-btn')?.addEventListener('click', async () => {
    const domain = document.getElementById('domain-input').value.trim();
    if (!domain) return;

    clearResults();
    isScanning = true;
    currentScanType = 'domain';
    document.getElementById('scan-output').classList.add('active');
    document.getElementById('domain-scan-btn').disabled = true;

    try {
      updateScanStatus(`Reconnaissance on ${domain}...`);
      updateProgressCount('');
      const results = await scanDomain(domain);
      renderDomainResults(results);
      updateScanStatus('Recon complete!');
    } catch (err) {
      updateScanStatus('Recon failed: ' + err.message);
    } finally {
      isScanning = false;
      document.getElementById('domain-scan-btn').disabled = false;
    }
  });

  // Export buttons
  document.getElementById('export-json-btn')?.addEventListener('click', () => exportJSON(scanResults));
  document.getElementById('export-csv-btn')?.addEventListener('click', () => exportCSV(scanResults));
  document.getElementById('export-pdf-btn')?.addEventListener('click', () => exportPDF(scanResults));

  // Enter key triggers scan
  ['username-input', 'email-input', 'phone-input', 'domain-input'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const btnMap = {
          'username-input': 'username-scan-btn',
          'email-input': 'email-scan-btn',
          'phone-input': 'phone-scan-btn',
          'domain-input': 'domain-scan-btn'
        };
        document.getElementById(btnMap[id])?.click();
      }
    });
  });

  // Mobile menu
  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('nav-links')?.classList.toggle('active');
  });

});
