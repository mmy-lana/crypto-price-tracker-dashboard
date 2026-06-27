import { useState, type SyntheticEvent } from 'react';
import { useApp } from '../hooks/useApps';
import { useMarketData } from '../hooks/useCoinGecko';
import { coingeckoService } from '../services/coingecko';
import { type CoinMarketData } from '../utils/mockData';
import CoinGrid from '../components/crypto/CoinGrid';
import CoinRow from '../components/crypto/CoinRow';

export default function Dashboard() {
  const { setActiveTab, setActiveCoinId } = useApp();
  const { data: defaultCoins, loading: defaultLoading, error: defaultError, refetch } = useMarketData('usd', 20);
  
  // Search state variables
  const [searchInput, setSearchInput] = useState('');
  const [searchCoinsResult, setSearchCoinsResult] = useState<CoinMarketData[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const selectCoin = (id: string) => {
    setActiveCoinId(id);
    setActiveTab('coin-detail');
  };

const handleSearchSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const query = searchInput.trim();

    if (!query) {
      setSearchCoinsResult(null);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      // 1. Resolve asset node listings from CoinGecko's global index lookup
      const searchRes = await coingeckoService.searchCoins(query);
      const matchedCoins = searchRes.coins || [];

      if (matchedCoins.length === 0) {
        setSearchCoinsResult([]);
        return;
      }

      // 2. FIX: Remove explicit 'any' - TypeScript automatically infers that 'coin' is typed as 'CoinSearchMatch'
      const idsToFetch = matchedCoins.slice(0, 12).map((coin) => coin.id);

      // 3. Resolve historical market data metrics for matches
      const marketTelemetry = await coingeckoService.getMarketDataByIds(idsToFetch);
      setSearchCoinsResult(marketTelemetry);
    } catch (err) { // FIX: Changed 'catch (err: any)' to standard safe 'catch (err)' (which defaults to type 'unknown')
      console.error("SEARCH RESOLUTION FAILURE: Falling back to local filters.", err);
      setSearchError("Dynamic API search failed. Reverting to local fallback list.");
      
      // Fallback: search locally within the loaded default list
      const fallbackList = defaultCoins.filter(coin =>
        coin.name.toLowerCase().includes(query.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(query.toLowerCase())
      );
      setSearchCoinsResult(fallbackList);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchCoinsResult(null);
    setSearchError(null);
  };

  const activeCoinsList = searchCoinsResult !== null ? searchCoinsResult : defaultCoins;
  const isCurrentlyLoading = defaultLoading || searchLoading;

  return (
    <div className="space-y-6">
      {/* Top Search Controls Frame */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="RESOLVE_COIN_NODE (e.g. BTC)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-cyan-400/20 bg-gray-900 pl-4 pr-10 py-2.5 font-mono text-sm text-cyan-400 placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-3 text-gray-500 hover:text-cyan-400 font-mono text-xs"
              >
                [X]
              </button>
            )}
          </div>
          <button
            type="submit"
            className="rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 font-mono text-xs text-cyan-400 hover:bg-cyan-400/20 hover:border-cyan-400"
          >
            RESOLVE
          </button>
        </form>

        {/* View Toggle and Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="flex items-center space-x-2 rounded-lg border border-cyan-400/20 bg-gray-800 px-4 py-2 font-mono text-xs text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400"
          >
            <span>LAYOUT:</span>
            <span className="font-bold uppercase text-white">{viewMode}</span>
          </button>

          <button
            onClick={refetch}
            disabled={isCurrentlyLoading}
            className="flex items-center space-x-2 rounded-lg border border-fuchsia-500/20 bg-gray-800 px-4 py-2 font-mono text-xs text-fuchsia-500 hover:bg-fuchsia-500/10 hover:border-fuchsia-500 disabled:opacity-50"
          >
            <span>{isCurrentlyLoading ? 'INGESTING...' : 'FORCE_INGEST_FEED'}</span>
          </button>
        </div>
      </div>

      {/* API warnings/errors */}
      {(defaultError || searchError) && (
        <div className="rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 p-4 font-mono text-xs text-fuchsia-400">
          <span className="font-bold">// ALERT:</span> {searchError || defaultError} (Using offline fallback buffer).
        </div>
      )}

      {/* Main viewport */}
      {isCurrentlyLoading ? (
        <div className="flex h-64 items-center justify-center font-mono text-sm text-cyan-400">
          <span className="animate-pulse">// RETRIEVING_NETWORK_COORDINATES...</span>
        </div>
      ) : activeCoinsList.length === 0 ? (
        <div className="flex flex-col h-64 items-center justify-center rounded-xl border border-dashed border-gray-800 space-y-4">
          <span className="font-mono text-sm text-gray-500">// INDEX_QUERY_RETURNED_ZERO_RESULTS</span>
          <button
            onClick={clearSearch}
            className="rounded border border-cyan-400/30 px-4 py-1.5 font-mono text-xs text-cyan-400 hover:bg-cyan-400/10"
          >
            CLEAR_QUERY
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {searchCoinsResult !== null && (
            <div className="font-mono text-xs text-gray-500 flex items-center space-x-2">
              <span>// SEARCH_RESULTS_FOR:</span>
              <span className="text-cyan-400 font-bold uppercase">"{searchInput}"</span>
              <span>({searchCoinsResult.length} assets resolved)</span>
            </div>
          )}
          
          {viewMode === 'grid' ? (
            <CoinGrid coins={activeCoinsList} onSelect={selectCoin} />
          ) : (
            <CoinRow coins={activeCoinsList} onSelect={selectCoin} />
          )}

          {/* Table Footer Legal Compliance Attribution (CoinGecko Style Guidelines) */}
          <div className="text-right pr-2">
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-gray-600 hover:text-cyan-400 font-mono tracking-wider transition-colors duration-200"
            >
              Data provided by CoinGecko
            </a>
          </div>
        </div>
      )}
    </div>
  );
}