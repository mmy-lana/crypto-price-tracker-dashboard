import React, { useState, useEffect, type ReactNode } from 'react';
import { registerStatusCallback } from '../services/coingecko';
import { AppContext, type ActiveTab } from './AppContext';

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTabState] = useState<ActiveTab>('dashboard');
  const [activeCoinId, setActiveCoinId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    const cached = localStorage.getItem('nexus_watchlist');
    return cached ? JSON.parse(cached) : ['bitcoin', 'ethereum', 'solana'];
  });
  
  const [apiStatus, setApiStatus] = useState<number | 'MOCK' | 'CONNECTING'>('CONNECTING');

  useEffect(() => {
    registerStatusCallback((status) => {
      setApiStatus(status);
    });
  }, []);

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (tab !== 'coin-detail') {
      setActiveCoinId(null);
    }
  };

  const toggleWatchlist = (coinId: string) => {
    setWatchlist((prev) => {
      const next = prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId];
      
      localStorage.setItem('nexus_watchlist', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeCoinId,
        setActiveCoinId,
        sidebarOpen,
        setSidebarOpen,
        watchlist,
        toggleWatchlist,
        apiStatus,
        setApiStatus
      }}
    >
      {children}
    </AppContext.Provider>
  );
}