import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';
import { CustomerManagement } from './components/CustomerManagement';
import { VehicleCatalog } from './components/VehicleCatalog';
import { RentalManagement } from './components/RentalManagement';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { fetchSystemInfo, type SystemInfo } from './api';
import {
  Car,
  Users,
  FileText,
  Cloud,
  LogIn,
  UserPlus,
  LogOut,
  BookmarkCheck,
  LayoutDashboard
} from 'lucide-react';

function AppContent() {
  const { user, isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalog' | 'customers' | 'rentals' | 'my-rentals'>('dashboard');
  const [view, setView] = useState<'app' | 'login' | 'register'>('app');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [pendingVehicleId, setPendingVehicleId] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemInfo()
      .then(setSystemInfo)
      .catch((err) => console.error('Telemetry fetch failed:', err));
  }, []);

  // When switching role or logging out, ensure active tab is valid
  useEffect(() => {
    if (!isAuthenticated && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    } else if (isCustomer && (activeTab === 'customers' || activeTab === 'rentals' || activeTab === 'catalog')) {
      setActiveTab('dashboard');
    }
  }, [isAuthenticated, isCustomer, activeTab]);

  if (view === 'login') {
    return (
      <Login
        onSuccess={() => setView('app')}
        onNavigateToRegister={() => setView('register')}
        onBackToHome={() => setView('app')}
      />
    );
  }

  if (view === 'register') {
    return (
      <Register
        onSuccess={() => setView('app')}
        onNavigateToLogin={() => setView('login')}
        onBackToHome={() => setView('app')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div
            onClick={() => {
              setActiveTab('dashboard');
              setView('app');
            }}
            className="flex items-center gap-3 cursor-pointer shrink-0"
          >
            <img src="/logo.svg" alt="MotoRent Cloud Logo" className="w-10 h-10 drop-shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-950 tracking-tight text-lg">MotoRent</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Rental Motor &amp; Mobil Terpercaya
              </p>
            </div>
          </div>

          {/* Role-Aware Navigation Bar */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-sm overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* Admin Tabs */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'catalog'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Kelola Armada</span>
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'rentals'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Semua Transaksi</span>
                </button>
              </>
            )}

            {/* Customer Tab */}
            {isCustomer && (
              <button
                onClick={() => setActiveTab('my-rentals')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'my-rentals'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Sewa Saya</span>
              </button>
            )}
          </nav>

          {/* Right Header Actions: Auth Profile & Cloud Telemetry */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Authenticated User Capsule */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate">{user.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                        isAdmin
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {isAdmin ? 'Admin' : 'Pelanggan'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{user.email}</span>
                </div>

                <button
                  onClick={logout}
                  title="Keluar dari Akun"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Guest Actions: Login & Register */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={() => setView('register')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>
              </div>
            )}

            {/* For Admin: Show clean system badge */}
            {isAdmin && (
              <div className="hidden lg:flex items-center gap-2 bg-slate-900 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-400">Node:</span>
                <span className="font-semibold text-white">{systemInfo ? systemInfo.instance_id : 'connecting...'}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === 'dashboard' && (
          <Dashboard
            onRequireLogin={(vehicleId?: string) => {
              if (vehicleId) setPendingVehicleId(vehicleId);
              setView('login');
            }}
            onNavigateToRegister={() => setView('register')}
            onNavigateToMyRentals={() => setActiveTab('my-rentals')}
            onManageFleet={() => setActiveTab('catalog')}
            pendingVehicleId={pendingVehicleId}
            onClearPendingVehicle={() => setPendingVehicleId(null)}
          />
        )}
        {activeTab === 'catalog' && isAdmin && <VehicleCatalog />}
        {activeTab === 'customers' && isAdmin && <CustomerManagement />}
        {activeTab === 'rentals' && isAdmin && <RentalManagement />}
        {activeTab === 'my-rentals' && isCustomer && (
          <RentalManagement customerId={user?.customer_id || undefined} isCustomerView={true} />
        )}
      </main>

      {/* Commercial Mobility Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Brand & Bio */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-lg tracking-tight">MotoRent</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Cloud
                </span>
              </div>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Platform rental motor dan mobil terpercaya. Menghadirkan armada berkualitas, tarif harian transparan, dan verifikasi SIM cepat untuk kenyamanan mobilitas Anda di Purwokerto dan sekitarnya.
              </p>
              <div className="pt-2 text-[11px] text-slate-500">
                Layanan Pelanggan: 07:00 – 22:00 WIB • Pengambilan Garasi &amp; Antar-Jemput Unit
              </div>
            </div>

            {/* Col 2: Pilihan Armada */}
            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Kategori Armada</div>
              <ul className="space-y-1.5 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                  Motor Matic Harian (BeAT, Vario)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                  Maxi Scooter Premium (NMAX 155)
                </li>
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                  Mobil Keluarga &amp; Bisnis (Avanza, Xpander)
                </li>
                <li className="text-slate-500">Paket Sewa 1 Hari, 3 Hari, &amp; Mingguan</li>
              </ul>
            </div>

            {/* Col 3: Jaminan & Bantuan */}
            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Standar Layanan</div>
              <ul className="space-y-1.5 text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Unit Rutin Servis Resmi
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> 100% Bersih &amp; Disinfeksi
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Asuransi Proteksi Dasar
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Bantuan Darurat 24 Jam
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Discreet Academic/Telemetry info */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 MotoRent Cloud. Hak Cipta Dilindungi • Telkom University Purwokerto
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></span>
              <span>Cluster: {systemInfo ? systemInfo.instance_id : 'aws-multiaz-cluster'}</span>
              <span>•</span>
              <span>FastAPI In-Memory Engine</span>
            </div>
          </div>
        </div>
      </footer>
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
