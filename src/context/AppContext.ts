import { createContext } from 'react';

export type ActiveTab = 'dashboard' | 'coin-detail' | 'portfolio';

export interface AppContextType {
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

export const AppContext = createContext<AppContextType | undefined>(undefined);