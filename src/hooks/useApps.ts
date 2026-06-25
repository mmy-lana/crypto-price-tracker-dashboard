import { useContext } from 'react';
import { AppContext, type AppContextType } from '../context/AppContext';

export type { ActiveTab, AppContextType } from '../context/AppContext';

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}