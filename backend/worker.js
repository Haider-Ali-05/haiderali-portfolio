/**
 * Cloudflare Worker for AI Personal Assistant Chatbot
 * Powered by Google Gemini API
 */

const SYSTEM_PROMPT = `You are Nexus, the personal AI assistant for Haider Ali. 
You live on his portfolio website (ihaiderali.dev).
Your primary goal is to answer questions about Haider, his skills, his projects, and his background accurately and professionally.
However, because Haider is an elite Cybersecurity Specialist and Full Stack Developer, YOU are also equipped to handle highly technical requests!
You are fully authorized to write code (HTML, JS, Python, Bash, etc.), analyze security vulnerabilities, explain exploits, and assist with general programming tasks.

Here is the core information you know about Haider Ali:
- Profession: Cybersecurity Specialist & Ethical Hacker
- Expertise: Web Security, Network Security, SIEM/SOC, Penetration Testing, Secure Application Development.
- Key Skills: Python, Bash, JavaScript, React, Node.js, Linux, Burp Suite, Metasploit.
- Tone: Professional, highly intelligent, slightly edgy hacker persona, but always helpful.

If asked about Haider's personal life or things outside this scope, direct the user to the Contact section. But if asked ANY technical or coding question, answer it brilliantly to showcase the level of tech expertise Haider possesses. Keep responses concise and fast. Always format code using markdown blocks.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://ihaiderali.dev',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
};

// In-memory IP rate limiter
const rateLimits = new Map();

function checkRateLimit(ip, maxReqs = 20, windowMs = 60000) {
  const now = Date.now();
  const entry = rateLimits.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  rateLimits.set(ip, entry);

  return entry.count <= maxReqs;
}

// Constant-time string comparison
function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!checkRateLimit(clientIp, 20, 60000)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const payload = await request.json();
      const messages = payload.messages;
      const adminPassword = payload.adminPassword;
      const action = payload.action;

      const GEMINI_API_KEY = env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return new Response('API key not configured', { status: 500, headers: corsHeaders });
      }

      // Check dynamic admin password
      let ADMIN_PASSWORD = env.ADMIN_PASSWORD;
      if (env.AI_MEMORY) {
        const customPassword = await env.AI_MEMORY.get("admin_password");
        if (customPassword) {
          ADMIN_PASSWORD = customPassword;
        }
      }
      const isAdmin = Boolean(ADMIN_PASSWORD && adminPassword && timingSafeCompare(adminPassword, ADMIN_PASSWORD));

      if (action === 'change_password') {
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
        }
        if (env.AI_MEMORY && payload.newPassword) {
          await env.AI_MEMORY.put("admin_password", payload.newPassword.trim());
          return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: 'KV not configured' }), { status: 500, headers: corsHeaders });
      }

      if (!messages || !Array.isArray(messages)) {
        return new Response('Invalid request payload', { status: 400, headers: corsHeaders });
      }

      // 1. Read existing dynamic memory from KV
      let dynamicMemory = "";
      if (env.AI_MEMORY) {
        dynamicMemory = await env.AI_MEMORY.get("dynamic_facts") || "";
      }

      // 2. If Admin, extract facts in the background (Non-blocking! Massive speedup)
      if (isAdmin && messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1].text;
        
        const extractFactTask = async () => {
          try {
            const factUrl = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=\${GEMINI_API_KEY}\`;
            const factResponse = await fetch(factUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: "Extract any new facts about Haider Ali from the user's message. Output ONLY the new facts as a concise bulleted list. If there are no clear facts to remember, output exactly 'NONE'." }] },
                contents: [{ role: 'user', parts: [{ text: lastUserMessage }] }]
              })
            });
            if (factResponse.ok) {
              const factData = await factResponse.json();
              const extractedFact = factData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
              if (extractedFact && extractedFact !== "NONE") {
                const newMem = (dynamicMemory + "\\n" + extractedFact).trim();
                await env.AI_MEMORY.put("dynamic_facts", newMem);
              }
            }
          } catch (e) {
            console.error("Background fact extraction failed", e);
          }
        };
        // Fire and forget - do not await
        ctx.waitUntil(extractFactTask());
      }

      const FINAL_SYSTEM_PROMPT = SYSTEM_PROMPT + "\\n\\nHere is newly learned dynamic information about Haider:\\n" + dynamicMemory;

      // 3. Optimize payload size: Keep only the last 6 messages (3 interactions max)
      const recentMessages = messages.slice(-6);

      const geminiContents = recentMessages.map(msg => ({
        role: msg.role === 'ai' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // 4. Set strict 7-second timeout so the frontend falls back offline immediately if it hangs
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 7000);

      const geminiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=\${GEMINI_API_KEY}\`;
      
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: FINAL_SYSTEM_PROMPT }]
          },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 400 // Reduced max tokens for faster TTFB (Time to First Byte)
          }
        })
      });

      clearTimeout(timeoutId);

      if (!geminiResponse.ok) {
        throw new Error('Failed to communicate with AI provider');
      }

      const data = await geminiResponse.json();
      
      let replyText = "I'm sorry, I couldn't generate a response.";
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
        replyText = data.candidates[0].content.parts[0].text;
      } else if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === "SAFETY") {
        replyText = "I'm sorry, my safety filters prevented me from generating an answer to that question.";
      }

      return new Response(JSON.stringify({ reply: replyText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.name === 'AbortError' ? 504 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
