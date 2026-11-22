import React, { useState, useEffect } from 'react';
import {
  type Customer,
  type Rental,
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchRentals
} from '../api';
import {
  UserCheck,
  UserX,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Trash2,
  Edit2,
  ShieldAlert,
  History
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Form State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    license_number: '',
    status: 'Active' as 'Active' | 'Blacklisted'
  });
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Customer History Modal State
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [customerRentals, setCustomerRentals] = useState<Rental[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCustomers(statusFilter || undefined, search || undefined);
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', phone: '', license_number: '', status: 'Active' });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      phone: cust.phone,
      license_number: cust.license_number,
      status: cust.status
    });
    setFormError(null);
    setShowModal(true);
  };

  const openHistoryModal = async (cust: Customer) => {
    setHistoryCustomer(cust);
    setLoadingHistory(true);
    try {
      const data = await fetchRentals(undefined, cust.id);
      setCustomerRentals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (cust: Customer) => {
    const nextStatus = cust.status === 'Active' ? 'Blacklisted' : 'Active';
    try {
      await updateCustomer(cust.id, { status: nextStatus });
      await loadData();
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err.message}`);
    }
  };

  const handleDelete = async (cust: Customer) => {
    if (!window.confirm(`Yakin ingin menghapus data pelanggan ${cust.name} (${cust.id})?`)) return;
    try {
      await deleteCustomer(cust.id);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const totalSpent = customerRentals.reduce((sum, r) => sum + (r.rental_status !== 'Canceled' ? r.total_cost : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Pelanggan</h2>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data identitas penyewa, verifikasi SIM, dan kontrol status blacklist rental.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg shadow-sm transition-all text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Pelanggan
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, telepon, atau nomor SIM..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="Active">Status: Active</option>
            <option value="Blacklisted">Status: Blacklisted</option>
          </select>

          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Customer Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">ID Pelanggan</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Nomor Kontak</th>
                <th className="px-6 py-4">Nomor SIM</th>
                <th className="px-6 py-4">Status Rental</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Memuat data pelanggan...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data pelanggan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">
                      {cust.id}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {cust.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {cust.phone}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      {cust.license_number}
                    </td>
                    <td className="px-6 py-4">
                      {cust.status === 'Active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <UserCheck className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Blacklisted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => openHistoryModal(cust)}
                        title="Lihat Riwayat Sewa"
                        className="p-1.5 text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(cust)}
                        title={cust.status === 'Active' ? 'Set Blacklist' : 'Set Active'}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          cust.status === 'Active'
                            ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {cust.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEditModal(cust)}
                        title="Edit Data"
                        className="p-1.5 text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cust)}
                        title="Hapus Data"
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

      {/* Customer Rental History Modal (2 Entitas: Customer + Rental) */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Riwayat Sewa: {historyCustomer.name} ({historyCustomer.id})
                  </h3>
                  <p className="text-xs text-slate-500">SIM: {historyCustomer.license_number} • Kontak: {historyCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setHistoryCustomer(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-medium">Total Transaksi</span>
                  <span className="text-lg font-bold text-slate-900">{customerRentals.length} Kali</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-medium">Total Pengeluaran</span>
                  <span className="text-lg font-bold text-blue-600">{formatIDR(totalSpent)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-400 block font-medium">Status Akun</span>
                  <span className={`text-sm font-bold ${historyCustomer.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {historyCustomer.status}
                  </span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="px-4 py-2.5">ID Sewa</th>
                      <th className="px-4 py-2.5">Unit Armada</th>
                      <th className="px-4 py-2.5">Durasi & Biaya</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingHistory ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          Memuat riwayat sewa...
                        </td>
                      </tr>
                    ) : customerRentals.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          Pelanggan ini belum pernah melakukan transaksi sewa.
                        </td>
                      </tr>
                    ) : (
                      customerRentals.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/75">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.id}</td>
                          <td className="px-4 py-3 font-mono text-slate-700">{r.vehicle_id}</td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-blue-600">{formatIDR(r.total_cost)}</span>
                            <span className="text-slate-400"> ({r.duration_days} hari)</span>
                          </td>
                          <td className="px-4 py-3">
                            {r.rental_status === 'Ongoing' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Ongoing
                              </span>
                            )}
                            {r.rental_status === 'Completed' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Completed
                              </span>
                            )}
                            {r.rental_status === 'Canceled' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Canceled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setHistoryCustomer(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog for Add / Edit Customer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingCustomer ? `Edit Pelanggan (${editingCustomer.id})` : 'Pendaftaran Pelanggan Baru'}
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
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Rian Muhammad"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nomor Telepon (WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nomor SIM (Surat Izin Mengemudi) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="Contoh: SIM-C-1029384"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Status Kelayakan Sewa
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Active">Active (Dapat Menyewa)</option>
                  <option value="Blacklisted">Blacklisted (Dilarang Menyewa)</option>
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
                  {formSubmitting ? 'Menyimpan...' : editingCustomer ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
