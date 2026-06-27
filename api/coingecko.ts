// api/coingecko.ts

// Declare the Node process global type locally so 'tsc' builds without warnings
declare const process: {
  env: {
    COINGECKO_API_KEY?: string;
  };
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // 1. Get the Origin or Referer of the incoming request
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';

  // 2. Define your allowed domain
  const allowedDomain = 'https://crypto-price-tracker-dashboard-five.vercel.app';

  // 3. Reject the request if it doesn't come from your live site
  // (We allow bypassing this check on localhost so you can still test locally!)
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  const isAllowedOrigin = origin.startsWith(allowedDomain) || referer.startsWith(allowedDomain);

  if (!isLocalhost && !isAllowedOrigin) {
    return new Response(JSON.stringify({ error: "Unauthorized access blocked by CORS guard." }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 4. Extract the target endpoint (e.g., "/api/coins/markets" -> "/coins/markets")
  const apiPath = url.pathname.replace(/^\/api/, '');

  // 5. Safely retrieve the private API Key from Vercel's secure environment
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Backend API key is missing." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 6. Reconstruct the full CoinGecko target URL with incoming query parameters
    const targetUrl = `https://api.coingecko.com/api/v3${apiPath}${url.search}`;

    const response = await fetch(targetUrl, {
      headers: {
        "x-cg-demo-api-key": apiKey,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Upstream error: ${response.statusText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();

    // 7. Send the safe data back to your React app
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: unknown) {
    console.error("API REQUEST FAILURE:", error);
    return new Response(JSON.stringify({ error: "Failed to connect to upstream api." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}