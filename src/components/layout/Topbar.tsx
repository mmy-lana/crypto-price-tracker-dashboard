import React from 'react';
import { useApp } from '../../hooks/useApps';

export default function Topbar() {
  const { sidebarOpen, setSidebarOpen, activeTab, apiStatus } = useApp();

  // Get dynamic visual feedback based on status codes
  const getStatusColor = () => {
    if (apiStatus === 200) return 'bg-emerald-500';
    if (apiStatus === 'CONNECTING') return 'bg-amber-500';
    if (apiStatus === 'MOCK') return 'bg-cyan-500';
    return 'bg-fuchsia-500'; // 429 limit, 404 error, etc.
  };

  const getStatusText = () => {
    if (apiStatus === 200) return 'API_OK 200';
    if (apiStatus === 'CONNECTING') return 'API_CONNECTING';
    if (apiStatus === 'MOCK') return 'API_MOCK';
    return `API_ERR ${apiStatus}`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-cyan-400/20 bg-gray-900/90 px-6 backdrop-blur">
      <div className="flex items-center space-x-4">
        {/* Mobile menu Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded border border-cyan-400/30 p-2 text-cyan-400 hover:bg-cyan-400/10 focus:outline-none"
          aria-label="Toggle navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Current Module Breadcrumb */}
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm text-gray-500">// ACTIVE_MODULE:</span>
          <span className="font-mono text-sm font-bold uppercase tracking-widest text-fuchsia-500">
            {activeTab === 'coin-detail' ? 'COIN_METRICS' : activeTab}
          </span>
        </div>
      </div>

      {/* Global Preview Feed Status */}
      <div className="flex items-center space-x-4">
        <div className="hidden items-center space-x-4 rounded-lg border border-cyan-400/10 bg-gray-800/50 px-3 py-1.5 font-mono text-xs md:flex">
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-400">BTC</span>
            <span className="text-emerald-400">$64,520</span>
            <span className="text-[10px] text-emerald-500">+1.2%</span>
          </div>
          <div className="h-3 w-[1px] bg-cyan-400/20"></div>
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-400">ETH</span>
            <span className="text-emerald-400">$3,480</span>
            <span className="text-[10px] text-emerald-500">+2.4%</span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${getStatusColor()}`}></span>
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${getStatusColor()}`}></span>
          </span>
          <span className="hidden font-mono text-xs text-cyan-400 lg:inline">
            {getStatusText()}
          </span>
        </div>
      </div>
    </header>
  );
}