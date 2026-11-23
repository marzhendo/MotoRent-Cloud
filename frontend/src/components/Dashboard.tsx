import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  type Vehicle,
  type Customer,
  fetchVehicles,
  fetchCustomers,
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
  ArrowRight,
  Shield,
  Gauge,
  BookmarkCheck,
  LogIn,
  KeyRound,
  ShieldCheck,
  HelpCircle,
  Award,
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  onRequireLogin: (vehicleId?: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToMyRentals: () => void;
  onManageFleet?: () => void;
  pendingVehicleId?: string | null;
  onClearPendingVehicle?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onRequireLogin,
  onNavigateToRegister,
  onNavigateToMyRentals,
  onManageFleet,
  pendingVehicleId,
  onClearPendingVehicle,
}) => {
  const { isAuthenticated, isCustomer, isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
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
  const [targetGuestVehicleId, setTargetGuestVehicleId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vehData, custList] = await Promise.all([
        fetchVehicles(activeCategory || undefined, statusFilter || undefined, search || undefined),
        fetchCustomers().catch(() => [])
      ]);
      setVehicles(vehData);
      setCustomers(custList);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data armada');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCategory, statusFilter]);

  // Handle pending vehicle preservation after login
  useEffect(() => {
    if (pendingVehicleId && vehicles.length > 0) {
      const match = vehicles.find((v) => v.id === pendingVehicleId);
      if (match && match.status === 'Available') {
        setBookingVehicle(match);
        setShowBookingModal(true);
        if (onClearPendingVehicle) onClearPendingVehicle();
      }
    }
  }, [pendingVehicleId, vehicles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleBookClick = (veh: Vehicle) => {
    if (!isAuthenticated) {
      setTargetGuestVehicleId(veh.id);
      setShowGuestPrompt(true);
      return;
    }
    setBookingVehicle(veh);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (_rentalId: string) => {
    setShowBookingModal(false);
    setBookingVehicle(null);
    setSuccessToast(`Pemesanan berhasil dikonfirmasi! Unit siap diambil sesuai jadwal.`);
    setTimeout(() => setSuccessToast(null), 5000);
    loadData();
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Metrics
  const totalFleet = vehicles.length;
  const availableFleet = vehicles.filter((v) => v.status === 'Available').length;
  const rentedFleet = vehicles.filter((v) => v.status === 'Rented').length;
  const activeCustomers = customers.filter((c) => c.status === 'Active').length || 3;

  return (
    <div className="space-y-16">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-base cursor-pointer hover:text-rose-900">&times;</button>
        </div>
      )}

      {/* 1. Hero Banner: Modern Tech Mobility Style */}
      <div className="relative rounded-3xl bg-slate-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden border border-slate-800">
        {/* Subtle radial ambient glow */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs font-semibold text-blue-400 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Platform Rental Kendaraan Tepercaya</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Sewa Motor &amp; Mobil <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Tanpa Ribet, Siap Jalan.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
            Pusat rental kendaraan prima di Purwokerto dan sekitarnya. Unit selalu bersih dan rutin servis bengkel resmi. Tarif harian transparan tanpa biaya siluman, dan verifikasi SIM instan.
          </p>

          {/* Trust points line */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Unit Bersih &amp; Disinfeksi</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Tarif Pasti Tanpa Embel-Embel</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bisa Ambil Garasi / Antar Lokasi</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <a
              href="#katalog-armada"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              <span>Pilih Kendaraan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {!isAuthenticated ? (
              <button
                onClick={onNavigateToRegister}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                <span>Daftar Akun Pelanggan</span>
              </button>
            ) : isCustomer ? (
              <button
                onClick={onNavigateToMyRentals}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Lihat Sewa Saya</span>
              </button>
            ) : (
              isAdmin && onManageFleet && (
                <button
                  onClick={onManageFleet}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Kelola Master Armada</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 2. Quick Stats Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Armada
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {totalFleet}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Motor &amp; Mobil Siap Jalan</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Unit Tersedia
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 block">
              {availableFleet}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Bisa Langsung Dipesan</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Sedang Disewa
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
              {rentedFleet}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Unit di Tangan Penyewa</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Pelanggan Aktif
            </span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 mt-1 block">
              {activeCustomers}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">SIM Terverifikasi Sah</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Fleet Catalog Grid Section */}
      <div id="katalog-armada" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Katalog Lengkap
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pilihan Armada MotoRent
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih kendaraan sesuai kebutuhan perjalanan Anda. Seluruh unit dijamin prima, bersih, dan berdokumen lengkap.
            </p>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === ''
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Kategori
            </button>
            <button
              onClick={() => setActiveCategory('Motor')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'Mobil'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Mobil</span>
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Cari model atau plat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="Available">Hanya Tersedia</option>
              <option value="Rented">Sedang Disewa</option>
            </select>

            <button
              onClick={loadData}
              title="Perbarui data armada"
              className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Visual Fleet Cards Grid */}
        {loading && vehicles.length === 0 ? (
          <div className="bg-white p-16 text-center text-slate-400 rounded-3xl border border-slate-200">
            Memuat armada kendaraan MotoRent...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white p-16 text-center text-slate-400 rounded-3xl border border-slate-200">
            Tidak ada armada yang sesuai dengan pencarian atau filter Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((veh) => (
              <div
                key={veh.id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:border-slate-300"
              >
                <div>
                  {/* Vehicle Image Box (16:9 Studio Photo) */}
                  <div className="relative aspect-video w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                    <img
                      src={veh.image_url || '/vehicles/placeholder.svg'}
                      onError={(e) => {
                        e.currentTarget.src = '/vehicles/placeholder.svg';
                      }}
                      alt={veh.model_name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />

                    {/* Category Tag Overlay */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-xs text-slate-800 shadow-sm border border-slate-200/60">
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
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Tersedia</span>
                        </span>
                      )}
                      {veh.status === 'Rented' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                          <Clock className="w-3 h-3" />
                          <span>Disewa</span>
                        </span>
                      )}
                      {veh.status === 'Maintenance' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-sm">
                          <Wrench className="w-3 h-3" />
                          <span>Perawatan</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                        {veh.model_name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                        <span className="px-2 py-0.5 bg-slate-100 rounded font-mono font-bold text-slate-700 border border-slate-200">
                          {veh.plate_number}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{veh.id}</span>
                      </div>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                        <Users className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{veh.seats || (veh.category === 'Motor' ? 2 : 7)} Kursi</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-medium">
                        <Gauge className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{veh.transmission || 'Matic'}</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs text-slate-400 font-medium">Tarif Harian Bersih</span>
                      <span className="text-2xl font-black text-blue-600">
                        {formatIDR(veh.daily_rate)}
                        <span className="text-xs font-normal text-slate-400"> /hari</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card CTA Action */}
                <div className="p-6 pt-0">
                  <button
                    disabled={veh.status !== 'Available'}
                    onClick={() => handleBookClick(veh)}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      veh.status === 'Available'
                        ? 'bg-slate-900 hover:bg-blue-600 active:bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>{veh.status === 'Available' ? 'Sewa Sekarang' : 'Unit Tidak Tersedia'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Section: 3 Langkah Mudah Menyewa Kendaraan */}
      <div className="bg-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            Panduan Praktis
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            3 Langkah Mudah Memulai Sewa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Proses pemesanan transparan tanpa birokrasi rumit. Armada siap jalan hanya dalam beberapa menit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-base mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Pilih Unit &amp; Durasi</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Jelajahi katalog armada motor dan mobil. Tentukan tanggal sewa mulai 1 hari, 3 hari, hingga mingguan sesuai kebutuhan perjalanan Anda.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-base mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Verifikasi SIM Otomatis</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cukup masukkan data identitas dan nomor SIM yang sah saat reservasi. Sistem langsung memverifikasi kelayakan sewa tanpa perlu antre fisik.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-base mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Ambil Kunci &amp; Berangkat</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ambil unit di titik garasi kami atau gunakan opsi antar langsung ke stasiun, hotel, atau alamat Anda di area Purwokerto dan sekitarnya.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Section: Standar Keamanan & Kepercayaan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Rutin Servis Berkala</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Mesin, rem, lampu, dan tekanan ban selalu dicek dan diservis teratur di bengkel resmi terpercaya.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Higienis &amp; Bersih</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Setiap unit dicuci bersih dan interior disemprot disinfektan sebelum diserahkan kepada penyewa.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Tarif Pasti Transparan</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Harga tertera adalah harga final. Tanpa biaya siluman atau biaya tambahan tersembunyi.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Bantuan Jalan 24 Jam</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tim teknis siaga membantu kendala operasional ban atau mesin selama masa sewa berjalan.
          </p>
        </div>
      </div>

      {/* 6. Section: Pertanyaan yang Sering Diajukan (FAQ) */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-6">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pusat Bantuan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Informasi lengkap seputar persyaratan, kebijakan bahan bakar, dan durasi sewa di MotoRent Cloud.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              Dokumen apa saja yang dibutuhkan untuk menyewa?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anda hanya perlu menyiapkan KTP/identitas diri asli yang masih berlaku serta Surat Izin Mengemudi (SIM C untuk motor, SIM A untuk mobil).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              Bagaimana kebijakan bahan bakar (BBM)?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kami menerapkan prinsip *Fair Return*: kendaraan diserahkan dalam kondisi bensin cukup/penuh, dan dikembalikan pada posisi indikator yang sama saat serah terima.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              Apakah bisa memperpanjang masa sewa di tengah jalan?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bisa. Anda dapat menghubungi layanan pelanggan atau mengajukan perpanjangan melalui portal sebelum waktu pengembalian berakhir, selama unit belum dipesan penyewa lain.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              Apakah unit bisa diantar ke stasiun atau hotel?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ya, kami menyediakan fasilitas antar-jemput armada ke Stasiun Purwokerto, penginapan/hotel, dan lokasi Anda dengan konfirmasi jadwal saat pemesanan.
            </p>
          </div>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <LogIn className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
              Masuk untuk Menyewa Kendaraan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6 font-normal">
              Pilihan armada Anda akan disimpan secara otomatis. Silakan masuk atau daftar akun baru agar kami dapat menyiapkan dokumen sewa dan verifikasi SIM Anda.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowGuestPrompt(false);
                  onRequireLogin(targetGuestVehicleId || undefined);
                }}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Masuk ke Akun
              </button>

              <button
                onClick={() => {
                  setShowGuestPrompt(false);
                  onNavigateToRegister();
                }}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Daftar Akun Baru
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
