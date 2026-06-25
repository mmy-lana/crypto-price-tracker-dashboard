import React, { useState } from 'react';
import { useApp } from '../hooks/useApps';
import { useCoinDetail, useCoinChart } from '../hooks/useCoinGecko';
import PriceChart from '../components/crypto/PriceChart';

function extractSafeDescriptionText(htmlString: string): string {
  if (!htmlString) return 'No description log stored for this asset.';
  // Strips tags cleanly and decodes basic entities safely
  return htmlString
    .replace(/<[^>]*>?/gm, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'");
}

export default function CoinDetail() {
  const { activeCoinId, setActiveTab, watchlist, toggleWatchlist } = useApp();
  const [days, setDays] = useState(7);

  const { data: coin, loading: detailLoading, error: detailError } = useCoinDetail(activeCoinId);
  const { prices, loading: chartLoading } = useCoinChart(activeCoinId, days);

  if (detailLoading) {
    return (
      <div className="flex h-96 items-center justify-center font-mono text-sm text-cyan-400">
        <span className="animate-pulse">// LOADING_METRIC_MODULE...</span>
      </div>
    );
  }

  if (detailError || !coin) {
    return (
      <div className="rounded-xl border border-fuchsia-500/20 bg-gray-800/40 p-8 text-center backdrop-blur">
        <h3 className="font-mono text-lg font-bold text-fuchsia-500">// ERROR_RESOLVING_NODE</h3>
        <p className="mt-2 text-gray-400 font-mono text-xs">The system was unable to pull records for ID: {activeCoinId}</p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="mt-6 rounded border border-fuchsia-500/30 px-4 py-2 font-mono text-xs text-fuchsia-500 hover:bg-fuchsia-500/10"
        >
          ← RETREAT_TO_DASHBOARD
        </button>
      </div>
    );
  }

  const isUp = coin.market_data.price_change_percentage_24h >= 0;
  const isWatchlisted = watchlist.includes(coin.id);

  return (
    <div className="space-y-6">
      {/* Detail Navigation Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-cyan-400/10 pb-6">
        <div className="flex items-center space-x-4">
          <img src={coin.image.large} alt={coin.name} className="h-12 w-12 rounded-full" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-mono text-2xl font-bold uppercase tracking-wider text-white">
                {coin.name}
              </h2>
              <span className="font-mono text-xs text-cyan-400 border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 rounded uppercase">
                {coin.symbol}
              </span>
            </div>
            <p className="font-mono text-xs text-gray-500 mt-0.5">// NETWORK_IDENTITY_RESOLVED</p>
          </div>
        </div>

        {/* Dynamic header controls with integrated Watchlist Button */}
        <div className="flex items-center space-x-3 self-start sm:self-center">
          <button
            onClick={() => toggleWatchlist(coin.id)}
            className={`rounded border px-4 py-2 font-mono text-xs transition-all duration-200 ${
              isWatchlisted
                ? 'border-amber-400 bg-amber-400/10 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.15)]'
                : 'border-cyan-400/20 text-gray-400 hover:border-cyan-400/60 hover:text-cyan-400'
            }`}
          >
            {isWatchlisted ? '★ IN_WATCHLIST' : '☆ ADD_TO_WATCHLIST'}
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="rounded border border-cyan-400/20 px-4 py-2 font-mono text-xs text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/5 transition-colors"
          >
            ← EXIT_TO_MARKET
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side Chart Frame */}
        <div className="lg:col-span-2 space-y-6">
          {chartLoading ? (
            <div className="flex h-[380px] items-center justify-center rounded-xl border border-cyan-400/10 bg-gray-900/40 font-mono text-xs text-cyan-400">
              <span className="animate-pulse">// REFRESHING_CHRONO_GRAPH...</span>
            </div>
          ) : (
            <PriceChart prices={prices} days={days} onDaysChange={setDays} />
          )}

          {/* Description Container */}
          <div className="rounded-xl border border-cyan-400/20 bg-gray-900/40 p-6 backdrop-blur">
            <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest">// ARCHIVE_DESCRIPTION:</h3>
            <p className="mt-4 font-mono text-xs text-gray-400 leading-relaxed max-h-40 overflow-y-auto pr-2 scrollbar-thin whitespace-pre-line">
              {extractSafeDescriptionText(coin.description.en)}
            </p>
          </div>
        </div>

        {/* Right Side Stats Frame */}
        <div className="space-y-6">
          <div className="rounded-xl border border-cyan-400/20 bg-gray-900/60 p-6 backdrop-blur">
            <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-6">// TELEMETRY_BREAKDOWN:</h3>
            
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between border-b border-gray-800 pb-3">
                <span className="text-gray-400">CURRENT_PRICE:</span>
                <span className="font-bold text-white">
                  ${coin.market_data.current_price.usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between border-b border-gray-800 pb-3">
                <span className="text-gray-400">NET_24H_SHIFT:</span>
                <span className={`font-bold ${isUp ? 'text-emerald-400' : 'text-fuchsia-500'}`}>
                  {isUp ? '▲' : '▼'} {coin.market_data.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-800 pb-3">
                <span className="text-gray-400">H_BOUND (24H):</span>
                <span className="font-bold text-emerald-400">
                  ${coin.market_data.high_24h.usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-800 pb-3">
                <span className="text-gray-400">L_BOUND (24H):</span>
                <span className="font-bold text-fuchsia-500">
                  ${coin.market_data.low_24h.usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-800 pb-3">
                <span className="text-gray-400">NET_MARKET_CAP:</span>
                <span className="font-bold text-white">
                  ${coin.market_data.market_cap.usd.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between pb-1">
                <span className="text-gray-400">TRANSACTION_VOL:</span>
                <span className="font-bold text-white">
                  ${coin.market_data.total_volume.usd.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}