import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useApp } from '../../hooks/useApps';
import Dashboard from '../../views/Dashboard';
import CoinDetail from '../../views/CoinDetail';
import Portfolio from '../../views/Portfolio';

export default function MainLayout() {
  const { activeTab } = useApp();

  return (
    <div className="flex min-h-screen bg-gray-900 text-white selection:bg-cyan-400 selection:text-black">
      {/* Global Navigation Shell */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col md:pl-64">
        <Topbar />

        {/* Content Area viewport */}
        <main className="flex-1 p-6 md:p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'coin-detail' && <CoinDetail />}
          {activeTab === 'portfolio' && <Portfolio />}
        </main>
      </div>
    </div>
  );
}