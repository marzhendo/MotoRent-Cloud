import React, { useState, useEffect } from 'react';
import {
  type Vehicle,
  type VehicleCreate,
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../api';
import { BookingModal } from './BookingModal';
import {
  Car,
  Bike,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Trash2,
  Edit2,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export const VehicleCatalog: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');

  // Booking Modal State
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<VehicleCreate>({
    model_name: '',
    category: 'Motor',
    plate_number: '',
    daily_rate: 100000,
    status: 'Available'
  });
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      setError(err.message || 'Gagal memuat data armada');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [activeCategory, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadVehicles();
  };

  const openCreateModal = () => {
    setEditingVehicle(null);
    setFormData({
      model_name: '',
      category: 'Motor',
      plate_number: '',
      daily_rate: 100000,
      status: 'Available'
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (veh: Vehicle) => {
    setEditingVehicle(veh);
    setFormData({
      model_name: veh.model_name,
      category: veh.category,
      plate_number: veh.plate_number,
      daily_rate: veh.daily_rate,
      status: veh.status
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, formData);
      } else {
        await createVehicle(formData);
      }
      setShowModal(false);
      await loadVehicles();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data armada');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleMaintenance = async (veh: Vehicle) => {
    const nextStatus = veh.status === 'Maintenance' ? 'Available' : 'Maintenance';
    try {
      await updateVehicle(veh.id, { status: nextStatus });
      await loadVehicles();
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const handleDelete = async (veh: Vehicle) => {
    if (!window.confirm(`Yakin ingin menghapus unit armada ${veh.model_name} (${veh.id})?`)) return;
    try {
      await deleteVehicle(veh.id);
      await loadVehicles();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleBookingSuccess = (rentalId: string) => {
    alert(`Transaksi sewa berhasil diterbitkan dengan ID: ${rentalId}!\nStatus armada telah otomatis diperbarui menjadi Rented.`);
    loadVehicles();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Armada Rental Kendaraan</h2>
          <p className="text-sm text-slate-500 mt-1">
            Pusat katalog unit motor dan mobil, pemantauan ketersediaan langsung, dan manajemen tarif harian.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('public')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'public'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Katalog Publik
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'admin'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manajemen Admin
            </button>
          </div>

          {viewMode === 'admin' && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Unit
            </button>
          )}
        </div>
      </div>

      {/* Filter and Category Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeCategory === ''
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semua Kategori
          </button>
          <button
            onClick={() => setActiveCategory('Motor')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeCategory === 'Motor'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            Motor
          </button>
          <button
            onClick={() => setActiveCategory('Mobil')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeCategory === 'Mobil'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Mobil
          </button>
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari armada / plat..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="Available">Available (Tersedia)</option>
            <option value="Rented">Rented (Sedang Sewa)</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <button
            onClick={loadVehicles}
            title="Refresh Data"
            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ================= VIEW MODE 1: PUBLIC VEHICLE CATALOG (CARDS) ================= */}
      {viewMode === 'public' && (
        <div>
          {loading && vehicles.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
              Memuat katalog armada...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
              Tidak ada unit armada yang sesuai filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((veh) => (
                <div
                  key={veh.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    {/* Header Card: Category & Status */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {veh.category === 'Motor' ? <Bike className="w-3.5 h-3.5 text-blue-600" /> : <Car className="w-3.5 h-3.5 text-blue-600" />}
                        {veh.category}
                      </span>

                      {veh.status === 'Available' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Tersedia
                        </span>
                      )}
                      {veh.status === 'Rented' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Sedang Disewa
                        </span>
                      )}
                      {veh.status === 'Maintenance' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <Wrench className="w-3 h-3" />
                          Perawatan
                        </span>
                      )}
                    </div>

                    {/* Vehicle Title & Plate */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {veh.model_name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 font-semibold text-slate-700">
                          {veh.plate_number}
                        </span>
                        <span>•</span>
                        <span>ID: {veh.id}</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-xs text-slate-400 font-medium">Tarif Harian</span>
                      <span className="text-xl font-extrabold text-blue-600">
                        {formatIDR(veh.daily_rate)}
                        <span className="text-xs font-normal text-slate-400"> /hari</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                    <button
                      disabled={veh.status !== 'Available'}
                      onClick={() => {
                        setBookingVehicle(veh);
                        setShowBookingModal(true);
                      }}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        veh.status === 'Available'
                          ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      {veh.status === 'Available' ? 'Sewa Sekarang' : 'Tidak Tersedia'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW MODE 2: ADMIN FLEET MANAGEMENT (TABLE) ================= */}
      {viewMode === 'admin' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">ID Unit</th>
                  <th className="px-6 py-4">Model Kendaraan</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Plat Nomor</th>
                  <th className="px-6 py-4">Tarif / Hari</th>
                  <th className="px-6 py-4">Status Operasional</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Memuat daftar armada...
                    </td>
                  </tr>
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Tidak ada data armada yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((veh) => (
                    <tr key={veh.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-slate-800">
                        {veh.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {veh.model_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {veh.category === 'Motor' ? <Bike className="w-3 h-3 text-blue-600" /> : <Car className="w-3 h-3 text-blue-600" />}
                          {veh.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                        {veh.plate_number}
                      </td>
                      <td className="px-6 py-4 font-semibold text-blue-600">
                        {formatIDR(veh.daily_rate)}
                      </td>
                      <td className="px-6 py-4">
                        {veh.status === 'Available' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Available
                          </span>
                        )}
                        {veh.status === 'Rented' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Rented
                          </span>
                        )}
                        {veh.status === 'Maintenance' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <Wrench className="w-3.5 h-3.5" />
                            Maintenance
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleMaintenance(veh)}
                          title={veh.status === 'Maintenance' ? 'Kembalikan ke Available' : 'Set ke Maintenance'}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            veh.status === 'Maintenance'
                              ? 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                              : 'text-amber-600 border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(veh)}
                          title="Edit Armada"
                          className="p-1.5 text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(veh)}
                          title="Hapus Unit"
                          className="p-1.5 text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog for Add / Edit Vehicle */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingVehicle ? `Edit Armada (${editingVehicle.id})` : 'Pendaftaran Unit Armada Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Model Kendaraan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.model_name}
                  onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                  placeholder="Contoh: Yamaha NMAX 155 / Toyota Avanza"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Motor">Motor</option>
                    <option value="Mobil">Mobil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Plat Nomor *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.plate_number}
                    onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                    placeholder="Contoh: R 1234 AB"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tarif Sewa Harian (IDR) *
                </label>
                <input
                  type="number"
                  required
                  min={10000}
                  step={5000}
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({ ...formData, daily_rate: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Status Operasional
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Available">Available (Tersedia)</option>
                  <option value="Rented">Rented (Sedang Disewa)</option>
                  <option value="Maintenance">Maintenance (Perawatan)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium shadow-sm transition-all cursor-pointer"
                >
                  {formSubmitting ? 'Menyimpan...' : editingVehicle ? 'Simpan Perubahan' : 'Daftarkan Armada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Booking Transaction Modal (Multi-Entity) */}
      <BookingModal
        vehicle={bookingVehicle}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};
