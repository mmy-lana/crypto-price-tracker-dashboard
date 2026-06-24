export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  sparkline_in_7d?: { price: number[] };
}

export interface CoinDetailData {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_percentage_24h: number;
  };
}

export const MOCK_MARKETS: CoinMarketData[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    current_price: 64173.00,
    market_cap: 1260000000000,
    market_cap_rank: 1,
    price_change_percentage_24h: 1.24,
    sparkline_in_7d: {
      price: [63100, 63400, 62900, 63800, 64100, 63900, 64173]
    }
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
    current_price: 3482.50,
    market_cap: 418000000000,
    market_cap_rank: 2,
    price_change_percentage_24h: 2.87,
    sparkline_in_7d: {
      price: [3320, 3350, 3310, 3400, 3450, 3420, 3482.5]
    }
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
    current_price: 142.15,
    market_cap: 66000000000,
    market_cap_rank: 5,
    price_change_percentage_24h: -1.45,
    sparkline_in_7d: {
      price: [148.5, 146.2, 141.0, 143.2, 145.0, 140.8, 142.15]
    }
  },
  {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
    current_price: 0.385,
    market_cap: 13700000000,
    market_cap_rank: 10,
    price_change_percentage_24h: -0.12,
    sparkline_in_7d: {
      price: [0.392, 0.388, 0.375, 0.381, 0.389, 0.382, 0.385]
    }
  }
];

export const MOCK_DETAILS: Record<string, CoinDetailData> = {
  bitcoin: {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    description: { en: "Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries." },
    image: { large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
    market_data: {
      current_price: { usd: 64173.00 },
      market_cap: { usd: 1260000000000 },
      total_volume: { usd: 28500000000 },
      high_24h: { usd: 64850.00 },
      low_24h: { usd: 62910.00 },
      price_change_percentage_24h: 1.24
    }
  },
  ethereum: {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    description: { en: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform." },
    image: { large: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
    market_data: {
      current_price: { usd: 3482.50 },
      market_cap: { usd: 418000000000 },
      total_volume: { usd: 14200000000 },
      high_24h: { usd: 3510.00 },
      low_24h: { usd: 3305.00 },
      price_change_percentage_24h: 2.87
    }
  }
};