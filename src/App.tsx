import React from 'react';
import { AppProvider } from './context/AppProvider';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;