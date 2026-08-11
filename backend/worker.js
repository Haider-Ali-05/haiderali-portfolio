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

If asked about Haider's personal life or things outside this scope, direct the user to the Contact section. But if asked ANY technical or coding question, answer it brilliantly to showcase the level of tech expertise Haider possesses. Always format code using markdown blocks.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://ihaiderali.dev',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const payload = await request.json();
      const messages = payload.messages;
      const adminPassword = payload.adminPassword;
      const action = payload.action;

      // We need an API key stored in Cloudflare Environment Variables
      const GEMINI_API_KEY = env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return new Response('API key not configured in backend', { status: 500, headers: corsHeaders });
      }

      // Check dynamic admin password from KV
      let ADMIN_PASSWORD = env.ADMIN_PASSWORD || "haideradmin";
      if (env.AI_MEMORY) {
        const customPassword = await env.AI_MEMORY.get("admin_password");
        if (customPassword) {
          ADMIN_PASSWORD = customPassword;
        }
      }
      const isAdmin = adminPassword === ADMIN_PASSWORD;

      // Handle Change Password action
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

      // 1. Read existing dynamic memory from KV (if available)
      let dynamicMemory = "";
      if (env.AI_MEMORY) {
        dynamicMemory = await env.AI_MEMORY.get("dynamic_facts") || "";
      }

      // 2. If Admin, extract facts and save them
      if (isAdmin && messages.length > 0) {
        const lastUserMessage = messages[messages.length - 1].text;
        
        const factUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
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
              dynamicMemory += "\n" + extractedFact;
              if (env.AI_MEMORY) {
                 await env.AI_MEMORY.put("dynamic_facts", dynamicMemory.trim());
              }
           }
        }
      }

      const FINAL_SYSTEM_PROMPT = SYSTEM_PROMPT + "\n\nHere is newly learned dynamic information about Haider:\n" + dynamicMemory;

      // Convert standard chat history to Gemini's format
      const geminiContents = messages.map(msg => ({
        role: msg.role === 'ai' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Call Google Gemini API using the Lightning-Fast 2.5 Lite model
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
      
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: FINAL_SYSTEM_PROMPT }]
          },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800, // Restored to 800 so it can finish its sentences
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API Error:', errorText);
        throw new Error('Failed to communicate with AI provider');
      }

      const data = await geminiResponse.json();
      
      let replyText = "I'm sorry, I couldn't generate a response.";
      // Safely check if the response contains text (prevents crashing if blocked by safety)
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
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
