import { type CoinMarketData, type CoinDetailData, MOCK_MARKETS, MOCK_DETAILS } from '../utils/mockData';

// Vite exposes env configurations inside import.meta.env
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const headers = {
  "x-cg-demo-api-key": API_KEY,
  "Accept": "application/json"
};

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

export const coingeckoService = {
  /**
   * Retrieves active node arrays from CoinGecko Markets endpoint.
   */
  async getMarketData(vsCurrency = 'usd', perPage = 20): Promise<CoinMarketData[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/coins/markets?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=true`,
        { headers }
      );
      
      if (!response.ok) {
        updateStatus(response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      updateStatus(200);
      return await response.json();
    } catch (error) {
      console.error("TELEMETRY ERROR: Fetch failed. Defaulting to local data core.", error);
      updateStatus('MOCK');
      return MOCK_MARKETS;
    }
  },

  /**
   * Resolves specific lists of coin IDs to fetch full market telemetry.
   */
  async getMarketDataByIds(ids: string[], vsCurrency = 'usd'): Promise<CoinMarketData[]> {
    if (ids.length === 0) return [];
    try {
      const response = await fetch(
        `${BASE_URL}/coins/markets?vs_currency=${vsCurrency}&ids=${ids.join(',')}&order=market_cap_desc&sparkline=true`,
        { headers }
      );
      if (!response.ok) {
        updateStatus(response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      updateStatus(200);
      return await response.json();
    } catch (error) {
      console.error("RESOLVED TELEMETRY ERROR: Multi-node query failed.", error);
      updateStatus('MOCK');
      return MOCK_MARKETS.filter(coin => ids.includes(coin.id));
    }
  },

  /**
   * Resolve and search coin structures from dynamic user terms.
   */
  async searchCoins(query: string): Promise<any> {
    try {
      const response = await fetch(
        `${BASE_URL}/search?query=${encodeURIComponent(query)}`,
        { headers }
      );
      if (!response.ok) {
        updateStatus(response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      updateStatus(200);
      return await response.json();
    } catch (error) {
      console.error("SEARCH ERROR: Falling back to local index matches.", error);
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
    try {
      const response = await fetch(
        `${BASE_URL}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`,
        { headers }
      );
      if (!response.ok) {
        updateStatus(response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      updateStatus(200);
      return await response.json();
    } catch (error) {
      console.error(`DETAIL ERROR: Node lookup failed for ${id}. Pulling safe state.`, error);
      updateStatus('MOCK');
      return MOCK_DETAILS[id] || {
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
    }
  },

  async getMarketChart(id: string, days = 7): Promise<ChartDataResponse> {
    try {
      const response = await fetch(
        `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
        { headers }
      );
      if (!response.ok) {
        updateStatus(response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      updateStatus(200);
      return await response.json();
    } catch (error) {
      console.warn(`CHART ERROR: Trend query failed for ${id}. Simulating offline telemetry.`);
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