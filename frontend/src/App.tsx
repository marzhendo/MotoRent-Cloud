import { useState, useEffect } from 'react';
import { CustomerManagement } from './components/CustomerManagement';
import { VehicleCatalog } from './components/VehicleCatalog';
import { RentalManagement } from './components/RentalManagement';
import { fetchSystemInfo, type SystemInfo } from './api';
import { Car, Users, FileText, Cloud } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'customers' | 'rentals'>('catalog');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    fetchSystemInfo()
      .then(setSystemInfo)
      .catch((err) => console.error('Telemetry fetch failed:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-950 tracking-tight text-lg">MotoRent</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">CAK3EAB3 Komputasi Awan Terdistribusi</p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-sm">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Katalog Armada</span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Data Pelanggan</span>
            </button>
            <button
              onClick={() => setActiveTab('rentals')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'rentals'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Transaksi Sewa</span>
            </button>
          </nav>

          {/* Cloud Telemetry Badge */}
          <div className="hidden md:flex items-center gap-2.5 bg-slate-900 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-800">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <span className="text-slate-400">Node:</span>
            <span className="font-semibold text-white">{systemInfo ? systemInfo.instance_id : 'connecting...'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'catalog' && <VehicleCatalog />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'rentals' && <RentalManagement />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MotoRent Cloud • Telkom University Purwokerto</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>FastAPI In-Memory JSON Persistence</span>
            <span>•</span>
            <span>Target AWS EC2 / S3 Hosting</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
