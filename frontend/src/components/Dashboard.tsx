import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  type Vehicle,
  type Customer,
  fetchVehicles,
  fetchCustomers,
  fetchSystemInfo,
  type SystemInfo
} from '../api';
import { BookingModal } from './BookingModal';
import {
  Car,
  Bike,
  Users,
  Clock,
  CheckCircle2,
  Wrench,
  Search,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Shield,
  Gauge,
  AlertCircle,
  BookmarkCheck,
  LogIn
} from 'lucide-react';

interface DashboardProps {
  onRequireLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToMyRentals: () => void;
  onManageFleet?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onRequireLogin,
  onNavigateToRegister,
  onNavigateToMyRentals,
  onManageFleet,
}) => {
  const { isAuthenticated, isCustomer, isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Booking Modal
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Guest prompt modal
  const [showGuestPrompt, setShowGuestPrompt] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vehData, custList, sysInfo] = await Promise.all([
        fetchVehicles(activeCategory || undefined, statusFilter || undefined, search || undefined),
        fetchCustomers(),
        fetchSystemInfo().catch(() => null)
      ]);
      setVehicles(vehData);
      setCustomers(custList);
      if (sysInfo) setSystemInfo(sysInfo);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCategory, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleBookClick = (veh: Vehicle) => {
    if (!isAuthenticated) {
      setShowGuestPrompt(true);
      return;
    }
    setBookingVehicle(veh);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (rentalId: string) => {
    setShowBookingModal(false);
    setSuccessToast(`Pemesanan armada berhasil dibuat (ID: ${rentalId})! Status unit telah diperbarui.`);
    loadData();
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Metric Computations
  const totalFleet = vehicles.length;
  const availableFleet = vehicles.filter((v) => v.status === 'Available').length;
  const rentedFleet = vehicles.filter((v) => v.status === 'Rented').length;
  const activeCustomers = customers.filter((c) => c.status === 'Active').length;

  return (
    <div className="space-y-8">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Hero Banner Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white p-8 sm:p-10 shadow-lg overflow-hidden border border-blue-500/20">
        {/* Subtle decorative circles */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-medium text-blue-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Komputasi Awan Terdistribusi</span>
            <span className="text-white/40">•</span>
            <span className="font-mono text-emerald-300">
              {systemInfo ? systemInfo.instance_id : 'motorent-node'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Sewa Kendaraan Cepat, Transparan, dan Siap Jalan
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed font-normal">
            Pusat rental motor dan mobil terpercaya. Nikmati proses pemesanan instan terintegrasi dengan verifikasi Surat Izin Mengemudi (SIM) tanpa perantara database eksternal.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#catalog-grid"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Jelajahi Armada</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {!isAuthenticated ? (
              <button
                onClick={onNavigateToRegister}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/30 hover:bg-blue-500/40 text-white font-semibold text-xs rounded-xl border border-white/20 transition-colors cursor-pointer"
              >
                <span>Daftar Akun Pelanggan</span>
              </button>
            ) : isCustomer ? (
              <button
                onClick={onNavigateToMyRentals}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Lihat Sewa Saya</span>
              </button>
            ) : (
              isAdmin && onManageFleet && (
                <button
                  onClick={onManageFleet}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Kelola Master Armada</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 4 Quick Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Armada */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Armada
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
              {totalFleet}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Motor & Mobil Terdaftar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Tersedia */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Unit Tersedia
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 block">
              {availableFleet}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Siap Disewa Sekarang</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Sedang Disewa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Sedang Disewa
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 block">
              {rentedFleet}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Transaksi Aktif Berjalan</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Pelanggan Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Pelanggan Aktif
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1 block">
              {activeCustomers}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">SIM Terverifikasi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fleet Catalog Grid Section */}
      <div id="catalog-grid" className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Katalog Pilihan Armada</h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih kendaraan sesuai kebutuhan perjalanan Anda, mulai dari skuter lincah hingga MPV keluarga.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === ''
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kategori
            </button>
            <button
              onClick={() => setActiveCategory('Motor')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'Motor'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Motor</span>
            </button>
            <button
              onClick={() => setActiveCategory('Mobil')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === 'Mobil'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>
          </div>
        </div>

        {/* Search & Status Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari model armada atau plat nomor..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="Available">Tersedia (Siap Sewa)</option>
              <option value="Rented">Sedang Disewa</option>
              <option value="Maintenance">Perawatan</option>
            </select>

            <button
              onClick={loadData}
              title="Refresh Data"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Visual Fleet Cards Grid */}
        {loading && vehicles.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
            Memuat armada kendaraan MotoRent...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
            Tidak ada armada yang sesuai dengan pencarian atau filter Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((veh) => (
              <div
                key={veh.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Vehicle Image Box (16:9 Studio Preview) */}
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img
                      src={veh.image_url || '/vehicles/placeholder.svg'}
                      onError={(e) => {
                        e.currentTarget.src = '/vehicles/placeholder.svg';
                      }}
                      alt={veh.model_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category Tag Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs border border-white/60">
                      {veh.category === 'Motor' ? (
                        <Bike className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Car className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{veh.category}</span>
                    </div>

                    {/* Status Pill Overlay */}
                    <div className="absolute top-3 right-3">
                      {veh.status === 'Available' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tersedia</span>
                        </span>
                      )}
                      {veh.status === 'Rented' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                          <Clock className="w-3 h-3" />
                          <span>Disewa</span>
                        </span>
                      )}
                      {veh.status === 'Maintenance' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-xs">
                          <Wrench className="w-3 h-3" />
                          <span>Perawatan</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                        {veh.model_name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 font-semibold text-slate-700">
                          {veh.plate_number}
                        </span>
                        <span>•</span>
                        <span>{veh.id}</span>
                      </div>
                    </div>

                    {/* Quick Specs (Seats & Transmission) */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                        <Users className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{veh.seats || (veh.category === 'Motor' ? 2 : 7)} Kursi</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                        <Gauge className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{veh.transmission || 'Matic'}</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs text-slate-400 font-medium">Tarif Harian</span>
                      <span className="text-xl font-black text-blue-600">
                        {formatIDR(veh.daily_rate)}
                        <span className="text-xs font-normal text-slate-400"> /hari</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Action */}
                <div className="p-5 pt-0">
                  <button
                    disabled={veh.status !== 'Available'}
                    onClick={() => handleBookClick(veh)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      veh.status === 'Available'
                        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{veh.status === 'Available' ? 'Sewa Sekarang' : 'Unit Tidak Tersedia'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          vehicle={bookingVehicle}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Guest Sign-In Required Prompt Modal */}
      {showGuestPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <LogIn className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              Masuk untuk Menyewa Armada
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 font-normal">
              Untuk melakukan pemesanan sewa kendaraan, Anda perlu masuk dengan akun terdaftar atau mendaftar profil pelanggan baru dengan nomor Surat Izin Mengemudi (SIM).
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowGuestPrompt(false);
                  onRequireLogin();
                }}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Masuk ke Akun
              </button>

              <button
                onClick={() => {
                  setShowGuestPrompt(false);
                  onNavigateToRegister();
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Daftar Akun Pelanggan Baru
              </button>

              <button
                onClick={() => setShowGuestPrompt(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-600 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
