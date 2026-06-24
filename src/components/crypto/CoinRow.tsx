import React from 'react';
import { useApp } from '../../context/AppProvider';
import type { CoinMarketData } from '../../utils/mockData';
import Sparkline from './Sparkline';

interface CoinRowProps {
  coins: CoinMarketData[];
  onSelect: (id: string) => void;
}

export default function CoinRow({ coins, onSelect }: CoinRowProps) {
  const { watchlist, toggleWatchlist } = useApp();

  return (
    <div className="overflow-x-auto rounded-xl border border-cyan-400/20 bg-gray-800/20 backdrop-blur">
      <table className="w-full text-left font-mono text-sm">
        <thead className="border-b border-cyan-400/10 bg-gray-900/60 text-gray-500">
          <tr>
            <th className="p-4 text-center">WATCH</th>
            <th className="p-4 text-center">RANK</th>
            <th className="p-4">ASSET</th>
            <th className="p-4 text-right">PRICE</th>
            <th className="p-4 text-right">CHANGE (24H)</th>
            <th className="p-4 text-right hidden md:table-cell">MARKET CAP</th>
            <th className="p-4 text-center hidden sm:table-cell">TELEMETRY CHART</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/40">
          {coins.map((coin) => {
            const isUp = coin.price_change_percentage_24h >= 0;
            const isWatchlisted = watchlist.includes(coin.id);

            return (
              <tr
                key={coin.id}
                onClick={() => onSelect(coin.id)}
                className="group cursor-pointer transition-colors hover:bg-cyan-400/5"
              >
                {/* Interactive Watchlist Star Button Column */}
                <td className="p-4 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Stops the row click navigation event
                      toggleWatchlist(coin.id);
                    }}
                    className={`text-base p-1 rounded focus:outline-none transition-all duration-200 ${
                      isWatchlisted
                        ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        : 'text-gray-700 hover:text-gray-400'
                    }`}
                    title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    {isWatchlisted ? '★' : '☆'}
                  </button>
                </td>
                <td className="p-4 text-center text-gray-400 group-hover:text-cyan-400">
                  {coin.market_cap_rank}
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                    <div>
                      <span className="font-bold text-white uppercase group-hover:text-cyan-400">
                        {coin.symbol}
                      </span>
                      <span className="ml-2 text-xs text-gray-400 hidden lg:inline">{coin.name}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right font-bold text-white">
                  ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`p-4 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-fuchsia-500'}`}>
                  {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="p-4 text-right text-gray-400 hidden md:table-cell">
                  ${(coin.market_cap / 1e9).toFixed(2)}B
                </td>
                <td className="p-4 text-center hidden sm:table-cell">
                  {coin.sparkline_in_7d?.price && (
                    <div className="inline-block">
                      <Sparkline prices={coin.sparkline_in_7d.price} />
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}