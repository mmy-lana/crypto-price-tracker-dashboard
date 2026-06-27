// api/[...path].ts

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // 1. Extract the target endpoint (e.g., "/api/coins/markets" -> "/coins/markets")
  const apiPath = url.pathname.replace(/^\/api/, '');

  // 2. Safely retrieve the private API Key from Vercel's secure environment
  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Backend API key is missing." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 3. Reconstruct the full CoinGecko target URL with incoming query parameters
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

    // 4. Send the safe data back to your React app
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to connect to upstream api." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}