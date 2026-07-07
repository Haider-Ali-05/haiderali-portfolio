/**
 * Cloudflare Worker for AI Personal Assistant Chatbot
 * Powered by Google Gemini API
 */

const SYSTEM_PROMPT = `You are Nexus, the personal AI assistant for Haider Ali. 
You live on his portfolio website (ihaiderali.dev).
Your goal is to answer questions about Haider, his skills, his projects, and his background accurately and professionally.
Always be polite, concise, and helpful. Do not break character. 

Here is the information you know about Haider Ali:
- Profession: Cybersecurity Specialist
- Expertise: Penetration testing, vulnerability assessment, secure application development.
- Key Skills: Network Security, Web Application Security, Cryptography, Incident Response, Python, Bash, JavaScript.
- Projects: 
  1. "SecureNet Framework" - A custom vulnerability scanner.
  2. "CryptoAuth" - A secure authentication library.
- Tone: Professional, slightly tech-savvy, friendly.

If asked a question you don't know the answer to based on this context, politely state that you are still learning and direct the user to contact Haider directly via the Contact section.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, change this to 'https://ihaiderali.dev'
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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
      const { messages } = await request.json();

      if (!messages || !Array.isArray(messages)) {
        return new Response('Invalid request payload', { status: 400, headers: corsHeaders });
      }

      // We need an API key stored in Cloudflare Environment Variables
      const GEMINI_API_KEY = env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        return new Response('API key not configured in backend', { status: 500, headers: corsHeaders });
      }

      // Convert standard chat history to Gemini's format
      const geminiContents = messages.map(msg => ({
        role: msg.role === 'ai' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      // Call Google Gemini API using the latest Flash model
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
      
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: geminiContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200, // Reduced from 800 for much faster response times
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
