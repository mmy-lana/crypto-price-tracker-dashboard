import { type CoinMarketData, type CoinDetailData, MOCK_MARKETS, MOCK_DETAILS } from '../utils/mockData';

// Vite exposes env configurations inside import.meta.env
const BASE_URL = '/api';
// const API_KEY = import.meta.env.VITE_API_KEY;

const headers = {
  "Accept": "application/json"
};

export interface CoinSearchMatch {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number | null;
  thumb?: string;
  large?: string;
}

export interface SearchCoinsResponse {
  coins: CoinSearchMatch[];
}

export interface ChartDataResponse {
  prices: [number, number][];
}

let statusCallback: ((status: number | 'MOCK') => void) | null = null;
export const registerStatusCallback = (cb: (status: number | 'MOCK') => void) => {
  statusCallback = cb;
};

const updateStatus = (status: number | 'MOCK') => {
  if (statusCallback) {
    statusCallback(status);
  }
};

// Caching structure definitions
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 45000; // 45-second Cache Time-to-Live (TTL)

/**
 * Executes or resolves fetch requests through a local cache barrier
 */
async function fetchWithCache<T>(url: string, mockFallback: T): Promise<T> {
  const now = Date.now();
  const cached = cache.get(url);

  if (cached && cached.expiry > now) {
    updateStatus(200);
    // FIX: Assert the retrieved data matches the expected generic type T
    return cached.data as T;
  }

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      updateStatus(response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    cache.set(url, {
      data,
      expiry: now + CACHE_TTL_MS
    });

    updateStatus(200);
    return data as T;
  } catch (error) {
    console.warn(`FETCH ERROR on ${url}. Reverting to local fallback core.`, error);
    updateStatus('MOCK');
    return mockFallback;
  }
}

export const coingeckoService = {
  /**
   * Retrieves active node arrays from CoinGecko Markets endpoint.
   */
  async getMarketData(vsCurrency = 'usd', perPage = 20): Promise<CoinMarketData[]> {
    const url = `${BASE_URL}/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true`;
    return fetchWithCache<CoinMarketData[]>(url, MOCK_MARKETS);
  },

  /**
   * Resolves specific lists of coin IDs to fetch full market telemetry.
   */
  async getMarketDataByIds(ids: string[], vsCurrency = 'usd'): Promise<CoinMarketData[]> {
    if (ids.length === 0) return [];
    const url = `${BASE_URL}/coins/markets?vs_currency=${vsCurrency}&ids=${ids.join(',')}&order=market_cap_desc&sparkline=true`;
    const fallback = MOCK_MARKETS.filter(coin => ids.includes(coin.id));
    return fetchWithCache<CoinMarketData[]>(url, fallback);
  },

  /**
   * Resolve and search coin structures from dynamic user terms.
   */
async searchCoins(query: string): Promise<SearchCoinsResponse> {
    const url = `${BASE_URL}/search?query=${encodeURIComponent(query)}`;
    
    try {
      const now = Date.now();
      const cached = cache.get(url);
      if (cached && cached.expiry > now) {
        updateStatus(200);
        // FIX: Assert to SearchCoinsResponse
        return cached.data as SearchCoinsResponse;
      }


      const response = await fetch(url, { headers });
      if (!response.ok) {
        updateStatus(response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      cache.set(url, { data, expiry: now + CACHE_TTL_MS });
      updateStatus(200);
      return data;
    } catch (error) {
      console.error("SEARCH ERROR: Reverting to local matches.", error);
      updateStatus('MOCK');
      const lower = query.toLowerCase();
      const filtered = MOCK_MARKETS.filter(
        c => c.name.toLowerCase().includes(lower) || c.symbol.toLowerCase().includes(lower)
      );
      return { coins: filtered };
    }
  },

  /**
   * Resolve details of specific isolated coin entities.
   */
  async getCoinDetail(id: string): Promise<CoinDetailData> {
    const url = `${BASE_URL}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const fallback = MOCK_DETAILS[id] || {
      id,
      symbol: "unknown",
      name: id.toUpperCase(),
      description: { en: "Dynamic offline payload structure generated. Real-time data feed failed to load." },
      image: { large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
      market_data: {
        current_price: { usd: 0 },
        market_cap: { usd: 0 },
        total_volume: { usd: 0 },
        high_24h: { usd: 0 },
        low_24h: { usd: 0 },
        price_change_percentage_24h: 0
      }
    };
    return fetchWithCache<CoinDetailData>(url, fallback);
  },

  /**
   * Resolve market charting historical telemetry.
   */
async getMarketChart(id: string, days = 7): Promise<ChartDataResponse> {
    const url = `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
    
    try {
      const now = Date.now();
      const cached = cache.get(url);
      if (cached && cached.expiry > now) {
        updateStatus(200);
        // FIX: Assert to ChartDataResponse
        return cached.data as ChartDataResponse;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) {
        updateStatus(response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      cache.set(url, { data, expiry: now + CACHE_TTL_MS });
      updateStatus(200);
      return data;
    } catch (error) {
      console.warn(`CHART ERROR: Trend query failed for ${id}. Simulating offline telemetry.`, error);
      updateStatus('MOCK');
      
      const prices: [number, number][] = [];
      const now = Date.now();
      const steps = days === 1 ? 24 : days === 7 ? 168 : 720;
      const intervalMs = (days * 24 * 60 * 60 * 1000) / steps;
      
      let basePrice = 100;
      if (id === 'bitcoin') basePrice = 64173;
      if (id === 'ethereum') basePrice = 3482;
      if (id === 'solana') basePrice = 142;
      if (id === 'cardano') basePrice = 0.385;

      for (let i = steps; i >= 0; i--) {
        const timestamp = now - (i * intervalMs);
        const noise = (Math.random() - 0.49) * 0.015; 
        basePrice = basePrice * (1 + noise);
        prices.push([timestamp, basePrice]);
      }
      return { prices };
    }
  }
};