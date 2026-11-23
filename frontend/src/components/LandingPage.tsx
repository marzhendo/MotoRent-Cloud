import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { type Vehicle, fetchVehicles } from '../api';
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
  Compass,
  Mountain,
  MapPin,
  ChevronDown,
  Sparkles,
  LogIn,
  UserPlus,
  Shield,
  Layers,
  Fuel
} from 'lucide-react';

interface LandingPageProps {
  onRequireLogin: (vehicleId?: string) => void;
  onNavigateToRegister: () => void;
  onEnterApp: () => void;
  pendingVehicleId?: string | null;
  onClearPendingVehicle?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onRequireLogin,
  onNavigateToRegister,
  onEnterApp,
  pendingVehicleId,
  onClearPendingVehicle,
}) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for Sticky Search Bar
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

  // FAQ state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVehicles(
        activeCategory || undefined,
        statusFilter || undefined,
        search || undefined
      );
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat katalog armada.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
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
    loadVehicles();
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
    setSuccessToast(`Pemesanan berhasil dikonfirmasi! Kendaraan telah dijadwalkan untuk Anda.`);
    setTimeout(() => setSuccessToast(null), 5000);
    loadVehicles();
  };

  const handleSelectRouteVehicle = (modelNameKeyword: string) => {
    const match = vehicles.find((v) =>
      v.model_name.toLowerCase().includes(modelNameKeyword.toLowerCase())
    );
    if (match) {
      handleBookClick(match);
    } else {
      // scroll to fleet section
      const el = document.getElementById('katalog-armada');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const totalArmada = vehicles.length;
  const unitTersedia = vehicles.filter((v) => v.status === 'Available').length;
  const unitDisewa = vehicles.filter((v) => v.status === 'Rented').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-sm font-semibold">{successToast}</span>
        </div>
      )}

      {/* ================= 1. PUBLIC COMMERCIAL TOP NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-600/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <img src="/logo.svg" alt="MotoRent" className="w-7 h-7" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">MotoRent</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  Cloud
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                Rental Motor &amp; Mobil Terpercaya Purwokerto
              </p>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#katalog-armada" className="hover:text-cyan-400 transition-colors">Pilihan Armada</a>
            <a href="#rute-wisata" className="hover:text-cyan-400 transition-colors">Panduan Wisata</a>
            <a href="#keunggulan" className="hover:text-cyan-400 transition-colors">Standar Layanan</a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">Tanya Jawab</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Buka Dashboard {isAdmin ? '(Admin)' : `(${user?.name.split(' ')[0]})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onRequireLogin()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-blue-400" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={onNavigateToRegister}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftar Akun</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= 2. COMMERCIAL HERO SECTION ================= */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-cyan-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Garansi Unit Terawat &amp; Siap Pakai 24/7 di Banyumas Raya</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Sewa Motor &amp; Mobil Tanpa Ribet. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200">
              Siap Jelajahi Purwokerto.
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Pilihan armada matic lincah hingga mobil keluarga prima dengan tarif harian transparan, servis bengkel resmi berkala, dan verifikasi SIM instan tanpa birokrasi berbelit.
          </p>

          {/* Three Key Value Tickers */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-1.5 rounded-xl border border-slate-700/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Unit 100% Bersih &amp; Terdisinfeksi</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-1.5 rounded-xl border border-slate-700/80">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Gratis 2 Helm SNI + Jas Hujan (Motor)</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-1.5 rounded-xl border border-slate-700/80">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Antar-Jemput Stasiun Purwokerto</span>
            </div>
          </div>

          {/* Live Quick Counter Badges */}
          <div className="pt-6 grid grid-cols-3 max-w-lg mx-auto gap-3 text-center">
            <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-xs">
              <span className="text-2xl font-black text-white block">{totalArmada} Unit</span>
              <span className="text-[11px] font-medium text-slate-400">Total Armada</span>
            </div>
            <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-xs">
              <span className="text-2xl font-black text-emerald-400 block">{unitTersedia} Siap</span>
              <span className="text-[11px] font-medium text-slate-400">Tersedia Hari Ini</span>
            </div>
            <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-xs">
              <span className="text-2xl font-black text-amber-400 block">{unitDisewa} Jalan</span>
              <span className="text-[11px] font-medium text-slate-400">Sedang Disewa</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. STICKY IMMERSIVE SEARCH & FILTER BAR ================= */}
      <section id="katalog-armada" className="sticky top-20 z-30 bg-slate-950/90 backdrop-blur-2xl border-y border-slate-800 shadow-xl py-4 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Category Segmented Control */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start lg:self-auto shrink-0">
              <button
                onClick={() => setActiveCategory('')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === ''
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Semua Armada ({vehicles.length})</span>
              </button>
              <button
                onClick={() => setActiveCategory('Motor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'Motor'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Motor Matic &amp; Maxi</span>
              </button>
              <button
                onClick={() => setActiveCategory('Mobil')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === 'Mobil'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Mobil Keluarga</span>
              </button>
            </div>

            {/* Keyword Search & Status Dropdown */}
            <div className="flex items-center gap-3 flex-1 lg:max-w-xl">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari model unit, NMAX, Vario, Avanza..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </form>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-blue-500 shrink-0 cursor-pointer"
              >
                <option value="">Status: Semua</option>
                <option value="Available">Hanya Yang Tersedia</option>
                <option value="Rented">Sedang Disewa</option>
                <option value="Maintenance">Perawatan</option>
              </select>

              <button
                onClick={loadVehicles}
                title="Muat Ulang Katalog"
                className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. FLEET CATALOG GRID (WITH AUTHENTIC STUDIO PHOTOS) ================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Koleksi Armada Siap Sewa</h2>
            <p className="text-xs text-slate-400 mt-1">
              Seluruh unit dilengkapi surat lengkap, pajak hidup, dan telah lulus inspeksi kelayakan fisik.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800/80 font-bold">
            {vehicles.length} Unit Terdaftar
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-rose-300 text-xs mb-8">
            {error}
          </div>
        )}

        {loading && vehicles.length === 0 ? (
          <div className="p-16 text-center text-slate-500 bg-slate-950/50 rounded-3xl border border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
            <p className="text-sm font-semibold">Menghubungkan ke inventaris armada...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-16 text-center text-slate-500 bg-slate-950/50 rounded-3xl border border-slate-800">
            <p className="text-sm font-semibold text-slate-400">Tidak ada unit kendaraan yang sesuai kriteria filter.</p>
            <button
              onClick={() => {
                setActiveCategory('');
                setStatusFilter('');
                setSearch('');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((veh) => {
              const isAvailable = veh.status === 'Available';
              return (
                <div
                  key={veh.id}
                  className="group bg-slate-950 rounded-3xl border border-slate-800/90 overflow-hidden shadow-xl hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Authentic Vehicle Photo Container */}
                    <div className="relative aspect-[16/10] bg-slate-900/90 overflow-hidden flex items-center justify-center p-4 border-b border-slate-800">
                      {veh.image_url ? (
                        <img
                          src={veh.image_url}
                          alt={veh.model_name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-slate-600 flex flex-col items-center">
                          {veh.category === 'Motor' ? <Bike className="w-12 h-12" /> : <Car className="w-12 h-12" />}
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 backdrop-blur-md text-white border border-slate-700">
                          {veh.category === 'Motor' ? <Bike className="w-3.5 h-3.5 text-blue-400" /> : <Car className="w-3.5 h-3.5 text-blue-400" />}
                          <span>{veh.category}</span>
                        </span>
                      </div>

                      <div className="absolute top-4 right-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs ${
                            isAvailable
                              ? 'bg-emerald-500/90 text-white'
                              : veh.status === 'Rented'
                              ? 'bg-amber-500/90 text-white'
                              : 'bg-rose-500/90 text-white'
                          }`}
                        >
                          {isAvailable ? <CheckCircle2 className="w-3 h-3" /> : veh.status === 'Rented' ? <Clock className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                          <span>{isAvailable ? 'Siap Sewa' : veh.status === 'Rented' ? 'Sedang Jalan' : 'Perawatan'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                            {veh.model_name}
                          </h3>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 text-xs font-mono text-slate-400">
                          <span className="px-2 py-0.5 bg-slate-900 rounded-md border border-slate-800 font-semibold text-slate-300">
                            {veh.plate_number}
                          </span>
                          <span>•</span>
                          <span>ID: {veh.id}</span>
                        </div>
                      </div>

                      {/* Specs Badges */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                        <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                          <Users className="w-3.5 h-3.5 text-blue-400" />
                          <span>{veh.seats || (veh.category === 'Motor' ? 2 : 7)} Kursi</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                          <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{veh.transmission || (veh.category === 'Motor' ? 'Matic' : 'Manual')}</span>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                        <span className="text-xs text-slate-400 font-medium">Tarif Sewa Harian</span>
                        <div className="text-right">
                          <span className="text-2xl font-black text-cyan-400">
                            {formatIDR(veh.daily_rate)}
                          </span>
                          <span className="text-xs font-normal text-slate-400"> /24 jam</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="p-6 pt-0">
                    <button
                      disabled={!isAvailable}
                      onClick={() => handleBookClick(veh)}
                      className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                        isAvailable
                          ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white cursor-pointer shadow-blue-600/25'
                          : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
                      }`}
                    >
                      <span>{isAvailable ? 'Sewa Unit Ini Sekarang' : 'Sedang Tidak Tersedia'}</span>
                      {isAvailable && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= 5. VISUAL STORYTELLING & DESTINATION GUIDE (PURWOKERTO & BANYUMAS) ================= */}
      <section id="rute-wisata" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>Panduan Rute Eksplorasi Banyumas Raya</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Pilih Kendaraan Tepat Sesuai Destinasi Anda
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Karakter jalanan di Purwokerto bervariasi dari jalan aspal perkotaan hingga tanjakan berkelok lereng Gunung Slamet. Rekomendasi armada kami disesuaikan untuk kenyamanan rute Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Guide Card 1: Baturraden & Dataran Tinggi Slamet */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between hover:border-blue-500/60 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-cyan-400 flex items-center justify-center border border-blue-500/30">
                  <Mountain className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">Rute Dataran Tinggi</span>
                  <h3 className="text-xl font-bold text-white mt-1">Baturraden &amp; Curug Telu</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Jalur menanjak dan aspal berkelok sejuk di lereng Gunung Slamet. Membutuhkan torsi bertenaga dan suspensi nyaman.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">Rekomendasi Unit:</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <Bike className="w-4 h-4 text-blue-400" />
                    <span>Yamaha NMAX 155 (Torsi VVA 155cc)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <Car className="w-4 h-4 text-blue-400" />
                    <span>Mitsubishi Xpander (Ground Clearance Tinggi)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectRouteVehicle('NMAX')}
                className="mt-6 w-full py-3 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Pilih Unit untuk Baturraden</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Guide Card 2: City Tour & Kuliner Purwokerto */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between hover:border-blue-500/60 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">Rute Perkotaan &amp; Kuliner</span>
                  <h3 className="text-xl font-bold text-white mt-1">City Tour Alun-Alun &amp; Kafe</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Lincah menembus jalanan kota, singgah di pusat oleh-oleh Sawangan, mendoan hangat, dan kawasan kampus Telkom University.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">Rekomendasi Unit:</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <Bike className="w-4 h-4 text-cyan-400" />
                    <span>Honda BeAT Deluxe (Sangat Irit BBM)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <Bike className="w-4 h-4 text-cyan-400" />
                    <span>Honda Vario 160 (Agile &amp; Bagasi Lapang)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectRouteVehicle('BeAT')}
                className="mt-6 w-full py-3 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Pilih Unit untuk City Tour</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Guide Card 3: Family Roadtrip Limpakuwus & Pagubugan */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between hover:border-blue-500/60 transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">Rombongan Keluarga</span>
                  <h3 className="text-xl font-bold text-white mt-1">Limpakuwus &amp; Wisata Alam</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Wisata keluarga besar ke hutan pinus Limpakuwus dan agrowisata Pagubugan Melung. Kapasitas 7 kursi nyaman ber-AC sejuk.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 block">Rekomendasi Unit:</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <Car className="w-4 h-4 text-indigo-400" />
                    <span>Toyota Avanza 1.5G (7 Kursi, Bagasi Lega)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <Car className="w-4 h-4 text-indigo-400" />
                    <span>Mitsubishi Xpander (Kenyamanan Maksimal)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectRouteVehicle('Avanza')}
                className="mt-6 w-full py-3 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Pilih Unit untuk Rombongan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. STANDAR KUALITAS & KEAMANAN ================= */}
      <section id="keunggulan" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Standar Industri Mobilitas</span>
          <h2 className="text-3xl font-black text-white">4 Jaminan Layanan MotoRent Cloud</h2>
          <p className="text-xs text-slate-400">Kenyamanan dan keselamatan perjalanan Anda adalah prioritas mutlak kami.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">01</div>
            <h4 className="font-bold text-white text-sm">Servis Berkala Bengkel Resmi</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Oli mesin rutin, rem prima, ban tebal berstandar pabrik. Kami tidak menyewakan unit yang kurang prima.
            </p>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold">02</div>
            <h4 className="font-bold text-white text-sm">Sanitasi &amp; Kebersihan Penuh</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Setiap unit dicuci bersih dan helm disemprot disinfektan wangi sebelum diserahterimakan kepada Anda.
            </p>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">03</div>
            <h4 className="font-bold text-white text-sm">Tarif Pasti Tanpa Biaya Tersembunyi</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Harga sewa yang tertera adalah tarif final per 24 jam. Tidak ada biaya admin siluman saat pengembalian.
            </p>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">04</div>
            <h4 className="font-bold text-white text-sm">Bantuan Darurat Operasional</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tim mekanik kami siap membantu jika terjadi kendala teknis ban bocor atau aki di wilayah Purwokerto kota.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 7. FAQ ACCORDION ================= */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-xs text-slate-400">Informasi seputar syarat sewa, penyerahan unit, dan metode konfirmasi.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Apa saja syarat dokumen untuk menyewa motor atau mobil?',
                a: 'Cukup memiliki KTP asli yang masih berlaku dan Surat Izin Mengemudi yang sesuai (SIM C untuk motor, SIM A untuk mobil). Dokumen diverifikasi langsung saat registrasi akun.'
              },
              {
                q: 'Bisakah kendaraan diantar ke Stasiun Purwokerto atau hotel?',
                a: 'Bisa! Kami melayani antar-jemput unit ke Stasiun Purwokerto, terminal bus, kampus, dan hotel di area Purwokerto kota tanpa biaya tambahan pada jam operasional garasi (07:00 - 22:00 WIB).'
              },
              {
                q: 'Apakah fasilitas helm dan jas hujan sudah termasuk?',
                a: 'Setiap sewa motor otomatis kami pinjamkan 2 helm SNI bersih dan 1 set jas hujan ponco/setelan tanpa dikenakan biaya sewa tambahan.'
              },
              {
                q: 'Bagaimana prosedur jika saya ingin memperpanjang durasi sewa?',
                a: 'Anda cukup menghubungi admin melalui WhatsApp atau mengajukan sewa baru melalui dashboard akun sebelum masa sewa aktif berakhir, selama unit belum dibooking pelanggan lain.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-cyan-400 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 8. COMMERCIAL FOOTER ================= */}
      <footer className="bg-black text-slate-400 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="font-black text-xl text-white tracking-tight">MotoRent</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                  Cloud
                </span>
              </div>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Platform rental motor dan mobil terpercaya di Banyumas Raya. Menghadirkan armada berkualitas, tarif harian transparan, dan verifikasi SIM instan untuk kenyamanan mobilitas Anda.
              </p>
              <div className="text-[11px] text-slate-500 pt-1">
                Operasional Garasi: 07:00 – 22:00 WIB • Lokasi: Purwokerto, Jawa Tengah
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Kategori Armada</div>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li>Motor Matic (Honda BeAT, Honda Vario)</li>
                <li>Maxi Scooter (Yamaha NMAX 155)</li>
                <li>Mobil Keluarga (Toyota Avanza, Mitsubishi Xpander)</li>
                <li>Sewa Harian, 3 Hari Hemat &amp; Mingguan</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Standar Jaminan</div>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unit Rutin Servis Resmi</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Bebas Biaya Helm &amp; Jas Hujan</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tarif Pasti Tanpa Biaya Tersembunyi</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Siap Antar-Jemput Stasiun</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              &copy; 2026 MotoRent Cloud. Hak Cipta Dilindungi &bull; Telkom University Purwokerto
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
              <span>Cluster Multi-AZ Distributed</span>
              <span>&bull;</span>
              <span>FastAPI High-Performance Engine</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Guest Authentication Modal */}
      {showGuestPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-cyan-400 flex items-center justify-center border border-blue-500/30 mx-auto">
              <Shield className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Masuk untuk Menyewa Unit Ini</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Untuk konfirmasi pemesanan dan validasi nomor SIM penyewa, silakan masuk ke akun Anda atau daftar sebagai penyewa baru.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowGuestPrompt(false);
                  onRequireLogin(targetGuestVehicleId || undefined);
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun Saya</span>
              </button>

              <button
                onClick={() => {
                  setShowGuestPrompt(false);
                  onNavigateToRegister();
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun Penyewa Baru</span>
              </button>

              <button
                onClick={() => setShowGuestPrompt(false)}
                className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Kembali ke Katalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Transaction Modal */}
      <BookingModal
        vehicle={bookingVehicle}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setBookingVehicle(null);
        }}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};
