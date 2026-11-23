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
import { fetchSystemInfo, fetchRentals, type SystemInfo } from './api';
import {
  Car,
  FileText,
  Cloud,
  ArrowRight,
  Globe
} from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isAdmin, isCustomer } = useAuth();
  const [view, setView] = useState<'app' | 'login' | 'register'>('app');
  const [portalMode, setPortalMode] = useState<'portal' | 'public'>('portal');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'customers' | 'rentals' | 'my-rentals' | 'diagnostics'>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [pendingVehicleId, setPendingVehicleId] = useState<string | null>(null);
  const [activeRentalCount, setActiveRentalCount] = useState<number>(0);

  useEffect(() => {
    fetchSystemInfo()
      .then(setSystemInfo)
      .catch((err) => console.error('Telemetry fetch failed:', err));
  }, []);

  // Update active rentals count
  useEffect(() => {
    if (isAuthenticated) {
      fetchRentals('Ongoing', isCustomer ? (user?.customer_id || undefined) : undefined)
        .then((res) => setActiveRentalCount(res.length))
        .catch(() => setActiveRentalCount(0));
    }
  }, [isAuthenticated, isCustomer, user]);

  // Adjust default tab based on role
  useEffect(() => {
    if (isCustomer && (activeTab === 'customers' || activeTab === 'rentals' || activeTab === 'diagnostics')) {
      setActiveTab('my-rentals');
    }
  }, [isCustomer, activeTab]);

  // Views for Auth
  if (view === 'login') {
    return (
      <Login
        onSuccess={() => {
          setView('app');
          setPortalMode('portal');
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
          setPortalMode('portal');
        }}
        onNavigateToLogin={() => setView('login')}
        onBackToHome={() => setView('app')}
      />
    );
  }

  // If user is guest OR explicitly viewing the public landing page:
  if (!isAuthenticated || portalMode === 'public') {
    return (
      <div className="relative">
        {/* Banner if authenticated user is previewing public landing page */}
        {isAuthenticated && (
          <div className="bg-blue-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between sticky top-0 z-50 shadow-md">
            <span>Anda sedang melihat tampilan Publik sebagai <strong>{user?.name} ({isAdmin ? 'Admin' : 'Pelanggan'})</strong></span>
            <button
              onClick={() => setPortalMode('portal')}
              className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Buka Dashboard Aplikasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
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

  // ================= AUTHENTICATED PRO PORTAL LAYOUT (CUSTOMER & ADMIN) =================
  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return isAdmin ? 'Ringkasan Bisnis & Operasional' : 'Katalog Armada Sewa';
      case 'catalog':
        return isAdmin ? 'Master Armada Kendaraan' : 'Katalog Sewa Armada';
      case 'customers':
        return 'Direktori & Manajemen Pelanggan';
      case 'rentals':
        return 'Audit & Kelola Seluruh Transaksi';
      case 'my-rentals':
        return 'Portal Sewa Saya (Unit Aktif & Riwayat)';
      case 'diagnostics':
        return 'Diagnostik Kluster Multi-AZ & Telemetri';
      default:
        return 'Portal Aplikasi';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Collapsible Left Pro Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onGoToPublic={() => setPortalMode('public')}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeRentalCount={activeRentalCount}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top App Header */}
        <header className="h-18 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between gap-4 shrink-0 z-20 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>MotoRent Pro</span>
              <span>/</span>
              <span className="text-blue-600 font-semibold">{isAdmin ? 'Admin Console' : 'Customer Workspace'}</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {getBreadcrumbTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Multi-AZ Telemetry Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400">Node:</span>
              <span className="font-bold text-slate-700 truncate max-w-[150px]">
                {systemInfo ? systemInfo.instance_id : 'connecting...'}
              </span>
            </div>

            {/* Quick Switch to Public */}
            <button
              onClick={() => setPortalMode('public')}
              title="Lihat Tampilan Web Publik"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Web Publik</span>
            </button>

            {/* User Avatar Capsule */}
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{user?.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Content Area (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100/70">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              isAdmin ? (
                /* Admin Executive Operations Summary */
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Armada Aktif Jalan</span>
                      <span className="text-3xl font-black text-amber-600 block">{activeRentalCount} Unit</span>
                      <span className="text-[11px] text-slate-400">Unit sedang disewa pelanggan</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Master Unit</span>
                      <span className="text-3xl font-black text-slate-900 block">5 Unit</span>
                      <span className="text-[11px] text-slate-400">Motor &amp; Mobil terdaftar</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pelanggan Terdaftar</span>
                      <span className="text-3xl font-black text-blue-600 block">3 Penyewa</span>
                      <span className="text-[11px] text-slate-400">SIM terverifikasi aktif</span>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status Arsitektur</span>
                      <span className="text-3xl font-black text-emerald-600 block">Multi-AZ</span>
                      <span className="text-[11px] text-slate-400">2 Node In-Memory sync</span>
                    </div>
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className="p-6 bg-white hover:border-blue-400 border border-slate-200/90 rounded-2xl text-left transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Car className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">Kelola Master Armada</h3>
                      <p className="text-xs text-slate-500 mt-1">Tambah unit baru, sesuaikan tarif sewa, atau ubah status ke perawatan.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('rentals')}
                      className="p-6 bg-white hover:border-blue-400 border border-slate-200/90 rounded-2xl text-left transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">Audit Transaksi Sewa</h3>
                      <p className="text-xs text-slate-500 mt-1">Pantau seluruh sewa aktif, proses pengembalian unit, dan rekap omset.</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('diagnostics')}
                      className="p-6 bg-white hover:border-blue-400 border border-slate-200/90 rounded-2xl text-left transition-all cursor-pointer shadow-xs group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">Diagnostik Kluster Cloud</h3>
                      <p className="text-xs text-slate-500 mt-1">Inspeksi topologi multi-node dan in-memory engine untuk evaluasi dosen.</p>
                    </button>
                  </div>

                  {/* Transaction Quick Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">Daftar Transaksi Terkini</h3>
                      <button
                        onClick={() => setActiveTab('rentals')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Buka Semua Transaksi &rarr;
                      </button>
                    </div>
                    <RentalManagement isCustomerView={false} />
                  </div>
                </div>
              ) : (
                /* Customer Hub: Immediate Fleet Catalog */
                <VehicleCatalog />
              )
            )}

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
