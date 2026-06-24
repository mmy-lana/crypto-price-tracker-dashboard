import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { registerStatusCallback } from '../services/coingecko';

export type ActiveTab = 'dashboard' | 'coin-detail' | 'portfolio';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeCoinId: string | null;
  setActiveCoinId: (id: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  watchlist: string[];
  toggleWatchlist: (coinId: string) => void;
  apiStatus: number | 'MOCK' | 'CONNECTING';
  setApiStatus: (status: number | 'MOCK' | 'CONNECTING') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTabState] = useState<ActiveTab>('dashboard');
  const [activeCoinId, setActiveCoinId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Load watchlist from localStorage on initialization, fallback to default seed list if empty
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
      
      // Save changes to localStorage so they persist on refresh
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

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}