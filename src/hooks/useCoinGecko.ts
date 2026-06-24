import { useState, useEffect } from 'react';
import { coingeckoService } from '../services/coingecko';
import type { CoinMarketData, CoinDetailData } from '../utils/mockData';

export function useMarketData(vsCurrency = 'usd', limit = 10) {
  const [data, setData] = useState<CoinMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    try {
      const result = await coingeckoService.getMarketData(vsCurrency, limit);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch telemetry streams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [vsCurrency, limit]);

  return { data, loading, error, refetch };
}

export function useCoinDetail(id: string | null) {
  const [data, setData] = useState<CoinDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const coinId = id;
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const result = await coingeckoService.getCoinDetail(coinId);
        if (active) {
          setData(result);
          setError(null);
        }
      } catch (err: any) {
        if (active) setError(err.message || "Could not query specific subnode details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  return { data, loading, error };
}

export function useCoinChart(id: string | null, days = 7) {
  const [prices, setPrices] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const coinId = id;
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const result = await coingeckoService.getMarketChart(coinId, days);
        if (active) {
          setPrices(result.prices);
          setError(null);
        }
      } catch (err: any) {
        if (active) setError(err.message || "Failed to parse historical telemetry charts.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id, days]);

  return { prices, loading, error };
}