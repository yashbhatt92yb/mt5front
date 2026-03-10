import React from 'react';
import { useTrading } from './context/TradingContext';
import { useMT5Socket } from './hooks/useMT5Socket';
import Login from './components/Login';
import AccountSummary from './components/AccountSummary';
import TradeForm from './components/TradeForm';
import PositionsTable from './components/PositionsTable';
import { TrendingUp, LayoutDashboard, History, Settings, LogOut } from 'lucide-react';

function Dashboard() {
  const { login, setLogin } = useTrading();
  // Initialize WebSocket connection
  useMT5Socket();

  const handleLogout = () => {
    setLogin(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">MT5 Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs text-slate-500 font-medium">Account ID</span>
              <span className="text-sm text-slate-200 font-bold">{login}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm font-semibold ring-1 ring-slate-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-8">
        {/* Top Summary Metrics */}
        <AccountSummary />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area - Positions Table */}
          <div className="lg:col-span-8 space-y-8">
             <div className="flex items-center gap-2 mb-2">
                <LayoutDashboard className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-bold text-white">Market Overview</h2>
             </div>
             <PositionsTable />

             {/* Future extensions could include charts here */}
             <div className="rounded-2xl bg-slate-900/50 border border-slate-800 border-dashed h-48 flex items-center justify-center">
                <p className="text-slate-500 text-sm">Real-time Charting (Coming Soon)</p>
             </div>
          </div>

          {/* Sidebar Area - Trade Form */}
          <aside className="lg:col-span-4 space-y-6">
             <div className="sticky top-24">
               <TradeForm />
             </div>
          </aside>
        </div>
      </main>

      <footer className="py-8 border-t border-slate-800 bg-slate-900/20">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs text-slate-600 font-medium tracking-wide">
              MT5 GATEWAY FRONTEND DASHBOARD &copy; {new Date().getFullYear()} - TRADING INVOLVES SIGNIFICANT RISK
            </p>
         </div>
      </footer>
    </div>
  );
}

function App() {
  const { login } = useTrading();

  if (!login) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;
