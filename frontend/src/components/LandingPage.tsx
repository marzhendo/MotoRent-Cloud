import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { type Vehicle, fetchVehicles } from '../api';
import { BookingModal } from './BookingModal';
import {
  Car,
  Bike,
  Users,
  Search,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  X
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
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

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
      setError(err.message || 'Gagal memuat daftar armada. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [activeCategory, statusFilter]);

  // Close guest modal with Escape key (R-32)
  useEffect(() => {
    if (!showGuestPrompt) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowGuestPrompt(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showGuestPrompt]);

  // Preserve chosen vehicle across login redirect
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
    setSuccessToast('Pemesanan dikonfirmasi. Unit telah dijadwalkan untuk Anda.');
    setTimeout(() => setSuccessToast(null), 5000);
    loadVehicles();
  };

  const handleSelectRouteVehicle = (modelNameKeyword: string) => {
    const match = vehicles.find(
      (v) =>
        v.model_name.toLowerCase().includes(modelNameKeyword.toLowerCase()) &&
        v.status === 'Available'
    );
    if (match) {
      handleBookClick(match);
    } else {
      const el = document.getElementById('katalog-armada');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalArmada = vehicles.length;
  const unitTersedia = vehicles.filter((v) => v.status === 'Available').length;
  const lowestRate = vehicles.length > 0 ? Math.min(...vehicles.map((v) => v.daily_rate)) : 75000;

  return (
    <div className="min-h-screen bg-white text-[#141413] flex flex-col">
      {/* Toast Notification */}
      {successToast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 bg-[#141413] text-white px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 border border-white/10"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="text-sm font-medium">{successToast}</span>
        </div>
      )}

      {/* ================= 1. COMMERCIAL TOP NAVBAR (LIGHT-FIRST) ================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Mark & Wordmark */}
          <a
            href="#beranda"
            className="flex items-center gap-3 shrink-0"
            aria-label="MotoRent Purwokerto Beranda"
          >
            <img src="/logo.svg" alt="" width={36} height={36} className="w-9 h-9 rounded-lg" />
            <div className="leading-none">
              <span className="font-extrabold text-lg tracking-tight text-[#141413] block">
                MotoRent
              </span>
              <span className="text-[11px] font-medium text-[#57534E]">
                Purwokerto
              </span>
            </div>
          </a>

          {/* Primary Anchor Navigation */}
          <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#57534E]">
            <a href="#katalog-armada" className="hover:text-[#141413] transition-colors">
              Armada
            </a>
            <a href="#rute-wisata" className="hover:text-[#141413] transition-colors">
              Panduan Rute
            </a>
            <a href="#layanan" className="hover:text-[#141413] transition-colors">
              Standar Layanan
            </a>
            <a href="#faq" className="hover:text-[#141413] transition-colors">
              Tanya Jawab
            </a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onEnterApp}
                className="min-h-[44px] px-5 py-2.5 bg-[#141413] hover:bg-[#EA580C] active:scale-[0.96] text-white rounded-lg text-sm font-semibold transition-[background-color,transform] duration-150"
              >
                Buka Portal {isAdmin ? 'Admin' : user?.name.split(' ')[0]}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onRequireLogin()}
                  className="min-h-[44px] px-4 py-2 text-sm font-semibold text-[#141413] hover:bg-[#F7F7F5] active:scale-[0.96] rounded-lg transition-[background-color,transform] duration-150"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="min-h-[44px] px-5 py-2 bg-[#EA580C] hover:bg-[#C2410C] active:scale-[0.96] text-white rounded-lg text-sm font-semibold transition-[background-color,transform] duration-150"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="beranda" className="flex-1">
        {/* ================= 2. ASYMMETRIC COMMERCIAL HERO ================= */}
        <section className="bg-white pt-10 pb-14 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Direct Value Prop & Action */}
            <div className="lg:col-span-6 space-y-6">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#141413] leading-[1.1]">
                Sewa motor dan mobil di Purwokerto. Ambil di garasi atau antar ke stasiun.
              </h1>

              <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-xl">
                Pilih unit sesuai kebutuhan perjalanan Anda. Tarif harian jelas sejak awal, sudah termasuk 2 helm SNI dan jas hujan untuk semua motor.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#katalog-armada"
                  className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] active:scale-[0.96] text-white font-bold text-sm rounded-lg transition-[background-color,transform] duration-150"
                >
                  Lihat Armada Tersedia
                </a>
                <a
                  href="#rute-wisata"
                  className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 bg-white hover:bg-[#F7F7F5] active:scale-[0.96] text-[#141413] font-semibold text-sm rounded-lg border border-[#D6D3D1] transition-[background-color,transform] duration-150"
                >
                  Rekomendasi Rute
                </a>
              </div>

              {/* Real Live Data Facts Strip */}
              <div className="pt-6 border-t border-[#E7E5E4] grid grid-cols-3 gap-4 max-w-md">
                <div>
                  <span className="text-2xl font-extrabold text-[#141413] tabular-nums block">
                    {unitTersedia}/{totalArmada || 5}
                  </span>
                  <span className="text-xs font-medium text-[#57534E]">Unit siap hari ini</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-[#141413] tabular-nums block">
                    {formatIDR(lowestRate)}
                  </span>
                  <span className="text-xs font-medium text-[#57534E]">Mulai per hari</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-[#141413] tabular-nums block">
                    07.00-22.00
                  </span>
                  <span className="text-xs font-medium text-[#57534E]">Jam garasi (WIB)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Framed Real Vehicle Showcase */}
            <div className="lg:col-span-6">
              <div className="bg-[#F7F7F5] rounded-2xl p-4 sm:p-6 img-outline-light">
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-white flex items-center justify-center p-4 img-outline-light">
                  <img
                    src="/vehicles/yamaha-nmax.png"
                    alt="Yamaha NMAX 155 armada MotoRent Purwokerto"
                    width={800}
                    height={480}
                    fetchPriority="high"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 px-1">
                  <div>
                    <div className="text-sm font-bold text-[#141413]">Yamaha NMAX 155 &amp; Toyota Avanza 1.5G</div>
                    <div className="text-xs text-[#57534E]">Lepas kunci dengan KTP dan SIM aktif</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] px-2.5 py-1 rounded-md shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" aria-hidden="true" />
                    Stok langsung
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. FULL-WIDTH STICKY SEARCH & FILTER BAR ================= */}
        <section
          id="katalog-armada"
          aria-label="Filter dan pencarian armada"
          className="sticky top-18 z-30 bg-white/95 backdrop-blur-md border-y border-[#E7E5E4] py-3.5"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Category Segmented Tabs */}
              <div
                role="tablist"
                aria-label="Kategori kendaraan"
                className="inline-flex items-center bg-[#F7F7F5] p-1 rounded-xl border border-[#E7E5E4] self-start lg:self-auto shrink-0"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === ''}
                  onClick={() => setActiveCategory('')}
                  className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeCategory === ''
                      ? 'bg-[#141413] text-white'
                      : 'text-[#57534E] hover:text-[#141413]'
                  }`}
                >
                  Semua ({vehicles.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === 'Motor'}
                  onClick={() => setActiveCategory('Motor')}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeCategory === 'Motor'
                      ? 'bg-[#141413] text-white'
                      : 'text-[#57534E] hover:text-[#141413]'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Motor</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === 'Mobil'}
                  onClick={() => setActiveCategory('Mobil')}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeCategory === 'Mobil'
                      ? 'bg-[#141413] text-white'
                      : 'text-[#57534E] hover:text-[#141413]'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Mobil</span>
                </button>
              </div>

              {/* Search & Status Controls */}
              <div className="flex items-center gap-2.5 flex-1 lg:max-w-xl">
                <form onSubmit={handleSearchSubmit} className="relative flex-1">
                  <label htmlFor="fleet-search" className="sr-only">
                    Cari model motor, mobil, atau plat nomor
                  </label>
                  <Search
                    className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="fleet-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari NMAX, Vario, Avanza, atau plat nomor..."
                    className="w-full min-h-[42px] pl-10 pr-4 py-2 bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-sm text-[#141413] placeholder-[#78716C] focus:bg-white focus:border-[#141413] transition-colors"
                  />
                </form>

                <label htmlFor="fleet-status" className="sr-only">
                  Filter status ketersediaan
                </label>
                <select
                  id="fleet-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-h-[42px] px-3 py-2 bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-xs font-semibold text-[#141413] focus:bg-white focus:border-[#141413] shrink-0"
                >
                  <option value="">Semua Status</option>
                  <option value="Available">Tersedia</option>
                  <option value="Rented">Sedang Disewa</option>
                  <option value="Maintenance">Perawatan</option>
                </select>

                <button
                  type="button"
                  onClick={loadVehicles}
                  aria-label="Muat ulang daftar armada"
                  className="min-h-[42px] min-w-[42px] flex items-center justify-center bg-[#F7F7F5] border border-[#E7E5E4] hover:bg-[#EFEEEA] rounded-lg text-[#57534E] hover:text-[#141413] transition-colors shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. FLEET CATALOG GRID ================= */}
        <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight">
                Daftar Armada Purwokerto
              </h2>
              <p className="text-sm text-[#57534E] mt-1">
                Harga harian berlaku untuk 24 jam pemakaian. STNK aktif dan servis rutin bengkel resmi.
              </p>
            </div>
            <p className="text-xs font-semibold text-[#57534E] tabular-nums">
              Menampilkan {vehicles.length} unit
            </p>
          </div>

          {error && (
            <div role="alert" className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-sm mb-8">
              {error}
            </div>
          )}

          {loading && vehicles.length === 0 ? (
            <div className="p-16 text-center text-[#57534E] bg-[#F7F7F5] rounded-2xl border border-[#E7E5E4]">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#EA580C] mb-3" aria-hidden="true" />
              <p className="text-sm font-medium">Memuat daftar armada...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-16 text-center bg-[#F7F7F5] rounded-2xl border border-[#E7E5E4]">
              <p className="text-sm font-semibold text-[#141413]">
                Tidak ada unit yang cocok dengan pencarian Anda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('');
                  setStatusFilter('');
                  setSearch('');
                }}
                className="mt-4 min-h-[44px] px-5 py-2 bg-[#141413] hover:bg-[#EA580C] text-white rounded-lg text-xs font-bold transition-colors"
              >
                Tampilkan Semua Unit
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {vehicles.map((veh) => {
                const isAvailable = veh.status === 'Available';
                return (
                  <article
                    key={veh.id}
                    className="group bg-white rounded-2xl border border-[#E7E5E4] hover:border-[#D6D3D1] hover:shadow-md transition-[border-color,box-shadow] duration-200 flex flex-col justify-between p-4"
                  >
                    <div>
                      {/* Concentric Inner Photo Stage (outer 16px - padding 16px -> 8px/12px inner) */}
                      <div className="relative aspect-[16/10] bg-[#F7F7F5] rounded-xl overflow-hidden flex items-center justify-center p-4 img-outline-light">
                        {veh.image_url ? (
                          <img
                            src={veh.image_url}
                            alt={veh.model_name}
                            width={800}
                            height={480}
                            loading="lazy"
                            className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-[#78716C]">
                            {veh.category === 'Motor' ? (
                              <Bike className="w-10 h-10" aria-hidden="true" />
                            ) : (
                              <Car className="w-10 h-10" aria-hidden="true" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Metadata */}
                      <div className="pt-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[#57534E]">
                            {veh.category} &middot; <span className="font-mono text-[#141413]">{veh.plate_number}</span>
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                              isAvailable
                                ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                                : veh.status === 'Rented'
                                ? 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                                : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isAvailable
                                  ? 'bg-[#15803D]'
                                  : veh.status === 'Rented'
                                  ? 'bg-[#B45309]'
                                  : 'bg-[#B91C1C]'
                              }`}
                              aria-hidden="true"
                            />
                            {isAvailable ? 'Tersedia' : veh.status === 'Rented' ? 'Disewa' : 'Perawatan'}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[#141413] tracking-tight">
                          {veh.model_name}
                        </h3>

                        {/* Concise Spec Line */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#57534E]">
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#78716C]" aria-hidden="true" />
                            {veh.seats || (veh.category === 'Motor' ? 2 : 7)} Kursi
                          </span>
                          <span>{veh.transmission || (veh.category === 'Motor' ? 'Matic' : 'Manual')}</span>
                          <span>{veh.category === 'Motor' ? '2 Helm SNI' : 'Lepas Kunci'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Footer */}
                    <div className="mt-5 pt-4 border-t border-[#E7E5E4] flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xl font-extrabold text-[#141413] tabular-nums">
                          {formatIDR(veh.daily_rate)}
                        </span>
                        <span className="text-xs text-[#57534E]"> / hari</span>
                      </div>

                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => handleBookClick(veh)}
                        className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold transition-[background-color,transform] duration-150 ${
                          isAvailable
                            ? 'bg-[#141413] hover:bg-[#EA580C] active:scale-[0.96] text-white'
                            : 'bg-[#F7F7F5] text-[#78716C] border border-[#E7E5E4]'
                        }`}
                      >
                        {isAvailable ? 'Pesan Unit Ini' : 'Tidak Tersedia'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= 5. VISUAL STORYTELLING: PANDUAN RUTE PURWOKERTO ================= */}
        <section id="rute-wisata" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#F7F7F5] border-t border-[#E7E5E4]">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight">
                Pilih kendaraan sesuai rute perjalanan di Banyumas
              </h2>
              <p className="text-sm sm:text-base text-[#57534E] mt-2">
                Medan di Purwokerto beragam, mulai dari jalan kota yang padat hingga tanjakan lereng Gunung Slamet. Berikut padanan unit yang paling nyaman untuk tiap rute.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {[
                {
                  title: 'Baturraden dan Curug Telu',
                  photo: '/destinations/baturraden.jpg',
                  alt: 'Pemandangan alam pegunungan Baturraden Purwokerto',
                  desc: 'Jalur menanjak dan berkelok di lereng Gunung Slamet. Butuh torsi mesin kuat dan pengereman stabil.',
                  unitLabel: 'Yamaha NMAX 155 atau Mitsubishi Xpander',
                  keyword: 'NMAX',
                },
                {
                  title: 'Pusat Kota dan Kuliner Sawangan',
                  photo: '/destinations/purwokerto-city.jpg',
                  alt: 'Suasana pusat kota Alun-Alun Purwokerto',
                  desc: 'Parkir ringkas di area Alun-Alun, sentra oleh-oleh mendoan Sawangan, dan kawasan kampus.',
                  unitLabel: 'Honda BeAT Deluxe atau Honda Vario 160',
                  keyword: 'BeAT',
                },
                {
                  title: 'Hutan Pinus Limpakuwus',
                  photo: '/destinations/limpakuwus.jpg',
                  alt: 'Lanskap Gunung Slamet dan kawasan wisata alam Limpakuwus',
                  desc: 'Cocok untuk perjalanan rombongan keluarga dengan kabin 7 penumpang dan bagasi lapang.',
                  unitLabel: 'Toyota Avanza 1.5G',
                  keyword: 'Avanza',
                },
              ].map((route) => (
                <article
                  key={route.title}
                  className="bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/10] bg-[#EFEEEA] overflow-hidden img-outline-light">
                      <img
                        src={route.photo}
                        alt={route.alt}
                        width={800}
                        height={500}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 space-y-2.5">
                      <h3 className="text-lg font-bold text-[#141413]">{route.title}</h3>
                      <p className="text-sm text-[#57534E] leading-relaxed">{route.desc}</p>
                      <p className="text-xs font-semibold text-[#141413] pt-2">
                        Rekomendasi: <span className="text-[#EA580C]">{route.unitLabel}</span>
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button
                      type="button"
                      onClick={() => handleSelectRouteVehicle(route.keyword)}
                      className="w-full min-h-[44px] px-4 py-2.5 bg-[#F7F7F5] hover:bg-[#141413] hover:text-white active:scale-[0.96] text-[#141413] rounded-lg text-xs font-bold border border-[#E7E5E4] hover:border-[#141413] transition-[background-color,color,border-color,transform] duration-150"
                    >
                      Pilih Unit untuk Rute Ini
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 6. STANDAR LAYANAN (ASPHALT DARK CONTRAST BAND) ================= */}
        <section id="layanan" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#141413] text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Tarif jelas di awal, unit siap pakai sejak kilometer pertama.
              </h2>
              <p className="text-sm sm:text-base text-[#A8A29E] leading-relaxed">
                Seluruh armada kami rawat sendiri di bengkel resmi Purwokerto agar perjalanan wisata maupun agenda dinas Anda berjalan tenang.
              </p>
              <div className="pt-4 text-xs text-[#A8A29E] space-y-1">
                <p className="font-semibold text-white">Garasi Operasional Purwokerto</p>
                <p>Buka setiap hari pukul 07.00 - 22.00 WIB</p>
                <p>Layanan antar ke Stasiun Purwokerto, terminal, dan hotel kota</p>
              </div>
            </div>

            <div className="lg:col-span-7 divide-y divide-[#262523] border-y border-[#262523]">
              {[
                {
                  num: '01',
                  title: 'Perawatan rutin bengkel resmi',
                  body: 'Penggantian oli terjadwal, kondisi rem diperiksa sebelum serah terima, dan ketebalan ban terpantau.',
                },
                {
                  num: '02',
                  title: 'Perlengkapan berkendara sudah termasuk',
                  body: 'Setiap sewa motor dilengkapi 2 helm SNI bersih yang disemprot disinfektan serta 1 jas hujan tanpa biaya tambahan.',
                },
                {
                  num: '03',
                  title: 'Tanpa biaya tersembunyi',
                  body: 'Tarif yang tampil di halaman armada adalah tarif harian final untuk 24 jam pemakaian.',
                },
                {
                  num: '04',
                  title: 'Bantuan teknis wilayah Purwokerto',
                  body: 'Jika terjadi kendala ban atau aki saat berkendara di area Purwokerto kota, tim kami siap datang membantu.',
                },
              ].map((item) => (
                <div key={item.num} className="py-6 flex gap-6 items-start">
                  <span className="font-mono text-sm font-semibold text-[#EA580C] tabular-nums pt-0.5">
                    {item.num}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-[#A8A29E] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 7. FAQ AKORDION ================= */}
        <section id="faq" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141413] tracking-tight">
                Pertanyaan yang sering diajukan
              </h2>
              <p className="text-sm text-[#57534E]">
                Hal penting seputar dokumen sewa, pengantaran unit ke stasiun, dan durasi pemakaian.
              </p>
            </div>

            <div className="lg:col-span-8 divide-y divide-[#E7E5E4] border-y border-[#E7E5E4]">
              {[
                {
                  q: 'Dokumen apa yang perlu disiapkan saat menyewa?',
                  a: 'Siapkan KTP asli yang masih berlaku dan SIM sesuai kategori kendaraan (SIM C untuk motor, SIM A untuk mobil). Data SIM Anda langsung dicatat saat pendaftaran akun.',
                },
                {
                  q: 'Apakah unit bisa diantar ke Stasiun Purwokerto atau hotel?',
                  a: 'Bisa. Pengantaran dan penjemputan unit ke Stasiun Purwokerto, terminal, kampus, atau hotel di dalam kota tersedia selama jam operasional 07.00 sampai 22.00 WIB.',
                },
                {
                  q: 'Apakah helm dan jas hujan dikenakan biaya tambahan?',
                  a: 'Tidak. Setiap penyewaan motor sudah termasuk 2 helm SNI dan 1 jas hujan.',
                },
                {
                  q: 'Bagaimana jika ingin memperpanjang masa sewa?',
                  a: 'Anda dapat mengonfirmasi perpanjangan sebelum waktu kembali berakhir melalui dashboard akun atau admin, selama unit belum dipesan penyewa berikutnya.',
                },
              ].map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full py-5 text-left flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-[#141413] hover:text-[#EA580C] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#57534E] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-[#EA580C]' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-5 text-sm text-[#57534E] leading-relaxed max-w-2xl">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ================= 8. CLEAN COMMERCIAL FOOTER ================= */}
      <footer className="bg-[#141413] text-[#A8A29E] border-t border-[#262523] text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="" width={28} height={28} className="w-7 h-7 rounded-md" />
                <span className="font-extrabold text-base text-white tracking-tight">MotoRent Purwokerto</span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs">
                Layanan sewa motor dan mobil harian di Purwokerto dan Banyumas. Operasional setiap hari pukul 07.00 - 22.00 WIB.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Kategori Armada</div>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#katalog-armada" className="hover:text-white transition-colors">Motor Matic Harian (BeAT, Vario)</a></li>
                <li><a href="#katalog-armada" className="hover:text-white transition-colors">Skuter Maxi (Yamaha NMAX 155)</a></li>
                <li><a href="#katalog-armada" className="hover:text-white transition-colors">Mobil Keluarga (Avanza, Xpander)</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="font-bold text-white text-xs uppercase tracking-wider">Navigasi</div>
              <ul className="space-y-1.5 text-xs">
                <li><a href="#rute-wisata" className="hover:text-white transition-colors">Panduan Rute Wisata Banyumas</a></li>
                <li><a href="#layanan" className="hover:text-white transition-colors">Standar Perawatan Unit</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Syarat dan Tanya Jawab</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#262523] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#78716C]">
            <p>&copy; 2026 MotoRent Cloud &middot; Telkom University Purwokerto</p>
            <p>Foto kendaraan dan destinasi bersumber dari Wikimedia Commons (CC BY-SA)</p>
          </div>
        </div>
      </footer>

      {/* Guest Authentication Modal */}
      {showGuestPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141413]/70 p-4"
        >
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#E7E5E4] shadow-2xl p-6 sm:p-7 space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowGuestPrompt(false)}
              aria-label="Tutup dialog"
              className="absolute top-4 right-4 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#57534E] hover:text-[#141413] rounded-lg"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="space-y-2 pr-8">
              <h3 id="guest-modal-title" className="text-xl font-extrabold text-[#141413]">
                Masuk untuk melanjutkan pemesanan
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Silakan masuk ke akun Anda agar data SIM penyewa langsung terhubung ke transaksi. Unit yang Anda pilih akan otomatis terbuka setelah masuk.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowGuestPrompt(false);
                  onRequireLogin(targetGuestVehicleId || undefined);
                }}
                className="w-full min-h-[46px] py-2.5 bg-[#EA580C] hover:bg-[#C2410C] active:scale-[0.96] text-white rounded-lg text-sm font-bold transition-[background-color,transform] duration-150"
              >
                Masuk ke Akun
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowGuestPrompt(false);
                  onNavigateToRegister();
                }}
                className="w-full min-h-[46px] py-2.5 bg-[#F7F7F5] hover:bg-[#EFEEEA] active:scale-[0.96] text-[#141413] rounded-lg text-sm font-semibold border border-[#E7E5E4] transition-[background-color,transform] duration-150"
              >
                Daftar Akun Baru
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
