import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { CustomerManagement } from './components/CustomerManagement';
import { VehicleCatalog } from './components/VehicleCatalog';
import { RentalManagement } from './components/RentalManagement';
import { CloudDiagnostics } from './components/CloudDiagnostics';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { fetchSystemInfo, fetchRentals, fetchVehicles, fetchCustomers, type SystemInfo } from './api';
import { Car, FileText, Cloud, Globe } from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isAdmin, isCustomer } = useAuth();
  const [view, setView] = useState<'app' | 'login' | 'register'>('app');
  const [portalMode, setPortalMode] = useState<'portal' | 'public'>('portal');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'customers' | 'rentals' | 'my-rentals' | 'diagnostics'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [pendingVehicleId, setPendingVehicleId] = useState<string | null>(null);
  const [activeRentalCount, setActiveRentalCount] = useState<number>(0);
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);

  useEffect(() => {
    fetchSystemInfo()
      .then(setSystemInfo)
      .catch((err) => console.error('Telemetry fetch failed:', err));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRentals('Ongoing', isCustomer ? (user?.customer_id || undefined) : undefined)
        .then((res) => setActiveRentalCount(res.length))
        .catch(() => setActiveRentalCount(0));

      if (isAdmin) {
        fetchVehicles().then((v) => setTotalVehicles(v.length)).catch(() => {});
        fetchCustomers().then((c) => setTotalCustomers(c.length)).catch(() => {});
      }
    }
  }, [isAuthenticated, isCustomer, isAdmin, user]);

  useEffect(() => {
    if (isCustomer && (activeTab === 'customers' || activeTab === 'rentals' || activeTab === 'diagnostics')) {
      setActiveTab('my-rentals');
    }
  }, [isCustomer, activeTab]);

  if (view === 'login') {
    return (
      <Login
        onSuccess={() => {
          setView('app');
          setPortalMode(pendingVehicleId ? 'public' : 'portal');
        }}
        onNavigateToRegister={() => setView('register')}
        onBackToHome={() => setView('app')}
      />
    );
  }

  if (view === 'register') {
    return (
      <Register
        onSuccess={() => {
          setView('app');
          setPortalMode(pendingVehicleId ? 'public' : 'portal');
        }}
        onNavigateToLogin={() => setView('login')}
        onBackToHome={() => setView('app')}
      />
    );
  }

  if (!isAuthenticated || portalMode === 'public') {
    return (
      <div className="relative">
        {isAuthenticated && (
          <div className="bg-[#141413] text-white px-4 py-2 text-xs font-medium flex items-center justify-between sticky top-0 z-50 border-b border-[#262523]">
            <span>
              Mode pratinjau publik sebagai <strong className="font-bold">{user?.name}</strong> ({isAdmin ? 'Admin' : 'Penyewa'})
            </span>
            <button
              type="button"
              onClick={() => setPortalMode('portal')}
              className="bg-[#EA580C] hover:bg-[#C2410C] text-white px-3.5 py-1.5 rounded-md font-bold text-xs transition-colors"
            >
              Kembali ke Portal
            </button>
          </div>
        )}

        <LandingPage
          onRequireLogin={(vehicleId?: string) => {
            if (vehicleId) setPendingVehicleId(vehicleId);
            setView('login');
          }}
          onNavigateToRegister={() => setView('register')}
          onEnterApp={() => setPortalMode('portal')}
          pendingVehicleId={pendingVehicleId}
          onClearPendingVehicle={() => setPendingVehicleId(null)}
        />
      </div>
    );
  }

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? 'Ringkasan Bisnis' : 'Katalog Armada Sewa';
      case 'catalog':
        return isAdmin ? 'Master Armada Kendaraan' : 'Katalog Sewa Armada';
      case 'customers':
        return 'Data Pelanggan';
      case 'rentals':
        return 'Semua Transaksi Sewa';
      case 'my-rentals':
        return 'Sewa Saya';
      case 'diagnostics':
        return 'Diagnostik Kluster Cloud';
      default:
        return 'Portal MotoRent';
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F7F5] text-[#141413] overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onGoToPublic={() => setPortalMode('public')}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeRentalCount={activeRentalCount}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Workspace Bar */}
        <header className="h-18 bg-white border-b border-[#E7E5E4] px-6 sm:px-8 flex items-center justify-between gap-4 shrink-0 z-20">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#78716C] font-medium">
              <span>MotoRent</span>
              <span>/</span>
              <span className="text-[#EA580C] font-semibold">{isAdmin ? 'Admin' : 'Penyewa'}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-[#141413] tracking-tight">
              {getBreadcrumbTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="hidden md:flex items-center gap-2 bg-[#F7F7F5] border border-[#E7E5E4] px-3 py-1.5 rounded-lg text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#15803D]" aria-hidden="true" />
                <span className="text-[#57534E]">Node:</span>
                <span className="font-semibold text-[#141413] truncate max-w-[160px]">
                  {systemInfo ? systemInfo.instance_id : 'connecting...'}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPortalMode('public')}
              className="hidden sm:inline-flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 bg-[#F7F7F5] hover:bg-[#EFEEEA] text-[#141413] rounded-lg text-xs font-semibold border border-[#E7E5E4] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#EA580C]" aria-hidden="true" />
              <span>Web Publik</span>
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-[#E7E5E4]">
              <div className="w-9 h-9 rounded-lg bg-[#141413] text-white font-bold flex items-center justify-center text-xs">
                {user?.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-[#141413] truncate max-w-[130px]">{user?.name}</div>
                <div className="text-[11px] text-[#78716C] font-mono">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Workspace Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F7F7F5]">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' &&
              (isAdmin ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-1.5">
                      <span className="text-xs font-semibold text-[#57534E] block">Unit Sedang Disewa</span>
                      <span className="text-3xl font-extrabold text-[#B45309] tabular-nums block">
                        {activeRentalCount} Unit
                      </span>
                      <span className="text-xs text-[#78716C]">Transaksi berjalan saat ini</span>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-1.5">
                      <span className="text-xs font-semibold text-[#57534E] block">Total Armada</span>
                      <span className="text-3xl font-extrabold text-[#141413] tabular-nums block">
                        {totalVehicles || 5} Unit
                      </span>
                      <span className="text-xs text-[#78716C]">Motor dan mobil terdaftar</span>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-1.5">
                      <span className="text-xs font-semibold text-[#57534E] block">Pelanggan Terdaftar</span>
                      <span className="text-3xl font-extrabold text-[#141413] tabular-nums block">
                        {totalCustomers || 3} Orang
                      </span>
                      <span className="text-xs text-[#78716C]">Data SIM tercatat</span>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-1.5">
                      <span className="text-xs font-semibold text-[#57534E] block">Node Aktif</span>
                      <span className="text-lg font-extrabold text-[#15803D] font-mono block truncate pt-1">
                        {systemInfo ? systemInfo.instance_id : 'Multi-AZ'}
                      </span>
                      <span className="text-xs text-[#78716C]">In-Memory JSON Store</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('catalog')}
                      className="p-5 bg-white hover:border-[#EA580C] border border-[#E7E5E4] rounded-xl text-left transition-colors"
                    >
                      <Car className="w-5 h-5 text-[#EA580C] mb-3" aria-hidden="true" />
                      <h2 className="font-bold text-[#141413] text-sm">Kelola Master Armada</h2>
                      <p className="text-xs text-[#57534E] mt-1">Tambah unit baru, ubah tarif harian, atau atur status perawatan.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('rentals')}
                      className="p-5 bg-white hover:border-[#EA580C] border border-[#E7E5E4] rounded-xl text-left transition-colors"
                    >
                      <FileText className="w-5 h-5 text-[#EA580C] mb-3" aria-hidden="true" />
                      <h2 className="font-bold text-[#141413] text-sm">Audit Transaksi Sewa</h2>
                      <p className="text-xs text-[#57534E] mt-1">Proses pengembalian kendaraan dan pantau rekap omset harian.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('diagnostics')}
                      className="p-5 bg-white hover:border-[#EA580C] border border-[#E7E5E4] rounded-xl text-left transition-colors"
                    >
                      <Cloud className="w-5 h-5 text-[#EA580C] mb-3" aria-hidden="true" />
                      <h2 className="font-bold text-[#141413] text-sm">Diagnostik Kluster Cloud</h2>
                      <p className="text-xs text-[#57534E] mt-1">Inspeksi node multi-AZ dan kesehatan in-memory store.</p>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-[#141413] text-base">Transaksi Terkini</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('rentals')}
                        className="text-xs font-bold text-[#EA580C] hover:text-[#C2410C]"
                      >
                        Lihat semua transaksi
                      </button>
                    </div>
                    <RentalManagement isCustomerView={false} />
                  </div>
                </div>
              ) : (
                <VehicleCatalog />
              ))}

            {activeTab === 'catalog' && <VehicleCatalog />}
            {activeTab === 'customers' && isAdmin && <CustomerManagement />}
            {activeTab === 'rentals' && isAdmin && <RentalManagement isCustomerView={false} />}
            {activeTab === 'my-rentals' && isCustomer && (
              <RentalManagement customerId={user?.customer_id || undefined} isCustomerView={true} />
            )}
            {activeTab === 'diagnostics' && isAdmin && <CloudDiagnostics />}
          </div>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
