import React from 'react';
import { useApp } from '../../context/AppProvider';
import type { CoinMarketData } from '../../utils/mockData';
import Sparkline from './Sparkline';

interface CoinGridProps {
  coins: CoinMarketData[];
  onSelect: (id: string) => void;
}

export default function CoinGrid({ coins, onSelect }: CoinGridProps) {
  const { watchlist, toggleWatchlist } = useApp();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {coins.map((coin) => {
        const isUp = coin.price_change_percentage_24h >= 0;
        const isWatchlisted = watchlist.includes(coin.id);

        return (
          <div
            key={coin.id}
            onClick={() => onSelect(coin.id)}
            className="group relative cursor-pointer overflow-hidden rounded-xl border border-cyan-400/20 bg-gray-800/40 p-5 transition-all duration-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            {/* Corner Decorative Hacker Accent */}
            <div className="absolute top-0 right-0 h-2 w-2 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={coin.image} alt={coin.name} className="h-8 w-8 rounded-full" />
                <div>
                  <h3 className="font-mono text-sm font-bold tracking-wider text-white uppercase group-hover:text-cyan-400 transition-colors">
                    {coin.symbol}
                  </h3>
                  <span className="text-xs text-gray-400">{coin.name}</span>
                </div>
              </div>
              
              {/* Interactive Watchlist Star Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Stops the card click navigation event
                  toggleWatchlist(coin.id);
                }}
                className={`font-mono text-sm p-1.5 rounded transition-all focus:outline-none ${
                  isWatchlisted 
                    ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' 
                    : 'text-gray-600 hover:text-gray-400'
                }`}
                title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
              >
                {isWatchlisted ? '★' : '☆'}
              </button>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="font-mono text-lg font-bold text-white">
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`mt-1 font-mono text-xs ${isUp ? 'text-emerald-400' : 'text-fuchsia-500'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>

              {coin.sparkline_in_7d?.price && (
                <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                  <Sparkline prices={coin.sparkline_in_7d.price} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}