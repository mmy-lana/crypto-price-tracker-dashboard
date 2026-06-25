import React from 'react';
import type { ActiveTab } from '../../context/AppContext';
import { useApp } from '../../hooks/useApps';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen, watchlist, apiStatus } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
    {
      id: 'portfolio',
      label: 'PORTFOLIO',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-cyan-400/20 bg-gray-900 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-cyan-400/20 px-6">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 animate-ping rounded-full bg-cyan-400"></span>
            <span className="font-mono text-lg font-bold tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
              NEXUS_SYS
            </span>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded border border-cyan-400/30 p-1 text-cyan-400 hover:bg-cyan-400/10 md:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Auto-close on mobile
                }}
                className={`group flex w-full items-center space-x-3 rounded-lg border px-4 py-3 font-mono text-sm tracking-wider transition-all duration-300 ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                    : 'border-transparent text-gray-400 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 hover:text-fuchsia-500'
                }`}
              >
                <span className="transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer System Status & Legally Required CoinGecko Attribution */}
        <div className="border-t border-cyan-400/20 p-4 font-mono text-[11px] text-gray-500 space-y-2.5">
          <div className="flex items-center justify-between">
            <span>WATCHLIST_NODES:</span>
            <span className="text-emerald-400 font-bold">{watchlist.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>FEED STATUS:</span>
            <span className={`font-bold ${apiStatus === 200 ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {apiStatus === 200 ? 'LIVE_API' : 'LIVE_MOCK'}
            </span>
          </div>

          {/* Legal Attribution Link (CoinGecko Style Guidelines) */}
          <div className="pt-1.5 border-t border-gray-800/60 text-center">
            <a
              href="https://www.coingecko.com"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-gray-600 hover:text-cyan-400 font-mono italic tracking-wider transition-colors duration-200"
            >
              Data provided by CoinGecko
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}