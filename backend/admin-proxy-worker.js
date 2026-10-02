/**
 * Cloudflare Worker for Secure GitHub Admin Proxy
 * This hides the GitHub PAT from the client side.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://ihaiderali.dev',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
};

// SECURITY FIX (L7): Constant-time string comparison to prevent timing attacks
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
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Authenticate Request
      const adminPassword = request.headers.get('X-Admin-Password');
      const ADMIN_PASSWORD_SECRET = env.ADMIN_PASSWORD;
      
      if (!ADMIN_PASSWORD_SECRET) {
        return new Response(JSON.stringify({ error: 'Server Error: ADMIN_PASSWORD not configured in worker environment variables' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      if (!adminPassword || !timingSafeCompare(adminPassword, ADMIN_PASSWORD_SECRET)) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Invalid Admin Password' }), { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // 2. Extract GitHub credentials from Environment Variables
      const GITHUB_PAT = env.GITHUB_PAT;
      const GITHUB_OWNER = env.GITHUB_OWNER || "Haider-Ali-05";
      const GITHUB_REPO = env.GITHUB_REPO || "haiderali-portfolio";

      if (!GITHUB_PAT) {
        return new Response(JSON.stringify({ error: 'Server Error: GITHUB_PAT not configured' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // 3. Parse Request Path (e.g., /contents/data/skills.json)
      const url = new URL(request.url);
      const githubPath = url.pathname; // This will be /contents/something
      
      // If the path is empty or just root, it's a verify request
      const githubEndpoint = githubPath === '/' ? '' : githubPath;
      
      const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}${githubEndpoint}`;

      // 4. Construct GitHub API Request
      const githubHeaders = {
        'Authorization': `token ${GITHUB_PAT}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Cloudflare-Worker-Admin-Proxy',
      };

      const requestInit = {
        method: request.method,
        headers: githubHeaders
      };

      // Pass the body along if it's a PUT or DELETE
      if (['PUT', 'DELETE'].includes(request.method)) {
        requestInit.body = await request.text();
      }

      // 5. Send to GitHub
      const githubResponse = await fetch(githubUrl, requestInit);

      // 6. Return GitHub's response to the client
      const responseBody = await githubResponse.text();
      
      return new Response(responseBody, {
        status: githubResponse.status,
        headers: {
          ...corsHeaders,
          'Content-Type': githubResponse.headers.get('Content-Type') || 'application/json'
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: `Internal Server Error: ${err.message}` }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  }
};
