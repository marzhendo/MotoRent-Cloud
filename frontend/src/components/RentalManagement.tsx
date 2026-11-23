import React, { useState, useEffect } from 'react';
import {
  type Rental,
  type Customer,
  type Vehicle,
  fetchRentals,
  fetchCustomers,
  fetchVehicles,
  returnRental,
  cancelRental
} from '../api';
import {
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Printer
} from 'lucide-react';

interface RentalManagementProps {
  customerId?: string;
  isCustomerView?: boolean;
}

export const RentalManagement: React.FC<RentalManagementProps> = ({ customerId, isCustomerView = false }) => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [vehicles, setVehicles] = useState<Record<string, Vehicle>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rentalData, customerList, vehicleList] = await Promise.all([
        fetchRentals(statusFilter || undefined, customerId),
        fetchCustomers().catch(() => []),
        fetchVehicles().catch(() => [])
      ]);

      const custMap: Record<string, Customer> = {};
      customerList.forEach((c) => {
        custMap[c.id] = c;
      });

      const vehMap: Record<string, Vehicle> = {};
      vehicleList.forEach((v) => {
        vehMap[v.id] = v;
      });

      setCustomers(custMap);
      setVehicles(vehMap);
      setRentals(rentalData);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat transaksi sewa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleReturn = async (rental: Rental) => {
    const veh = vehicles[rental.vehicle_id];
    const vehName = veh ? veh.model_name : rental.vehicle_id;
    if (!window.confirm(`Konfirmasi pengembalian unit ${vehName} (${rental.id})?\nStatus kendaraan akan otomatis kembali menjadi Tersedia.`)) {
      return;
    }

    try {
      setActionLoadingId(rental.id);
      await returnRental(rental.id);
      setSuccessToast(`Pengembalian unit ${vehName} berhasil diproses.`);
      setTimeout(() => setSuccessToast(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(`Gagal memproses pengembalian: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (rental: Rental) => {
    const veh = vehicles[rental.vehicle_id];
    const vehName = veh ? veh.model_name : rental.vehicle_id;
    if (!window.confirm(`Konfirmasi pembatalan pemesanan ${rental.id}?\nArmada ${vehName} akan dilepaskan kembali menjadi Tersedia.`)) {
      return;
    }

    try {
      setActionLoadingId(rental.id);
      await cancelRental(rental.id);
      setSuccessToast(`Pemesanan ${rental.id} berhasil dibatalkan.`);
      setTimeout(() => setSuccessToast(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(`Gagal membatalkan transaksi: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  const filteredRentals = rentals.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const cust = customers[r.customer_id];
    const veh = vehicles[r.vehicle_id];
    return (
      r.id.toLowerCase().includes(s) ||
      r.customer_id.toLowerCase().includes(s) ||
      (cust && cust.name.toLowerCase().includes(s)) ||
      (veh && veh.model_name.toLowerCase().includes(s)) ||
      (veh && veh.plate_number.toLowerCase().includes(s))
    );
  });

  // Admin Metrics
  const totalRentals = rentals.length;
  const activeRentals = rentals.filter((r) => r.rental_status === 'Ongoing').length;
  const completedRentals = rentals.filter((r) => r.rental_status === 'Completed').length;
  const totalRevenue = rentals
    .filter((r) => r.rental_status === 'Completed' || r.rental_status === 'Ongoing')
    .reduce((acc, curr) => acc + (curr.total_cost || 0), 0);

  // CUSTOMER VIEW (Portal Sewa Saya)
  if (isCustomerView) {
    const ongoingList = filteredRentals.filter((r) => r.rental_status === 'Ongoing');
    const pastList = filteredRentals.filter((r) => r.rental_status !== 'Ongoing');

    return (
      <div className="space-y-8">
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className="text-xs font-semibold">{successToast}</span>
          </div>
        )}

        {/* Portal Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Portal Pelanggan
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Riwayat Sewa Saya</h2>
            <p className="text-xs text-slate-500 mt-1">
              Pantau armada yang sedang Anda sewa, jadwal pengembalian, dan riwayat transaksi sewa Anda.
            </p>
          </div>

          <button
            onClick={loadData}
            title="Segarkan data sewa"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer w-fit"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Status</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Rentals Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Unit Sedang Disewa ({ongoingList.length})</span>
            </h3>
          </div>

          {ongoingList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Saat ini Anda tidak memiliki kendaraan yang sedang aktif disewa.
            </div>
          ) : (
            <div className="space-y-4">
              {ongoingList.map((rental) => {
                const veh = vehicles[rental.vehicle_id];
                return (
                  <div
                    key={rental.id}
                    className="bg-white rounded-3xl border border-blue-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={veh?.image_url || '/vehicles/placeholder.svg'}
                          alt={veh?.model_name || 'Kendaraan'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                            {rental.id}
                          </span>
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                            • Sedang Berjalan
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 leading-snug">
                          {veh?.model_name || rental.vehicle_id}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">
                          Plat: <span className="font-bold text-slate-700">{veh?.plate_number}</span> • Durasi: {rental.duration_days} Hari
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Mulai: {formatDate(rental.rented_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-medium">Total Tarif Sewa</span>
                        <span className="text-xl font-black text-blue-600 block">
                          {formatIDR(rental.total_cost)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">Lunas Terbayar</span>
                      </div>

                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <button
                          disabled={actionLoadingId === rental.id}
                          onClick={() => handleReturn(rental)}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                        >
                          {actionLoadingId === rental.id ? 'Memproses...' : 'Kembalikan Kendaraan'}
                        </button>
                        <button
                          disabled={actionLoadingId === rental.id}
                          onClick={() => handleCancel(rental)}
                          className="px-3 py-1.5 text-slate-400 hover:text-rose-600 text-[11px] font-medium transition-colors cursor-pointer text-center"
                        >
                          Batalkan Pemesanan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past History Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-slate-900">Histori Transaksi Sebelumnya ({pastList.length})</h3>

          {pastList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Belum ada riwayat transaksi selesai.
            </div>
          ) : (
            <div className="space-y-3">
              {pastList.map((rental) => {
                const veh = vehicles[rental.vehicle_id];
                const isCompleted = rental.rental_status === 'Completed';
                return (
                  <div
                    key={rental.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={veh?.image_url || '/vehicles/placeholder.svg'}
                          alt={veh?.model_name || 'Armada'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 font-semibold">{rental.id}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isCompleted ? '✓ Selesai' : '✕ Dibatalkan'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                          {veh?.model_name || rental.vehicle_id} ({veh?.plate_number})
                        </h4>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>{rental.duration_days} Hari</span>
                          <span>•</span>
                          <span>{formatDate(rental.rented_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Total Biaya</span>
                        <span className="text-base font-extrabold text-slate-900">
                          {formatIDR(rental.total_cost)}
                        </span>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Cetak Bukti</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ADMIN VIEW (Back-Office Manajerial)
  return (
    <div className="space-y-6">
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
            Back-Office Manajerial
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kelola Seluruh Transaksi Rental</h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring rental aktif, validasi proses serah terima pengembalian unit, pembatalan, dan rekap pendapatan.
          </p>
        </div>

        <button
          onClick={loadData}
          title="Segarkan Data"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-xs cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 4 Summary Metric Cards for Admin */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Transaksi</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalRentals}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Semua Riwayat</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">Sedang Berjalan</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{activeRentals} Unit</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Di Tangan Penyewa</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">Selesai / Kembali</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{completedRentals} Unit</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Unit Telah Kembali</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">Total Omset Sewa</span>
          <span className="text-xl font-black text-blue-600 mt-1 block">{formatIDR(totalRevenue)}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Pendapatan Bersih</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi berdasarkan ID sewa, nama penyewa, armada, atau plat..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer w-full sm:w-auto"
        >
          <option value="">Semua Status Sewa</option>
          <option value="Ongoing">Sedang Berjalan (Ongoing)</option>
          <option value="Completed">Selesai (Completed)</option>
          <option value="Canceled">Dibatalkan (Canceled)</option>
        </select>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Rentals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-5 py-3.5">KODE RENTAL</th>
                <th className="px-5 py-3.5">PENYEWA</th>
                <th className="px-5 py-3.5">ARMADA</th>
                <th className="px-5 py-3.5">DURASI &amp; BIAYA</th>
                <th className="px-5 py-3.5">JADWAL SEWA</th>
                <th className="px-5 py-3.5">STATUS</th>
                <th className="px-5 py-3.5 text-right">AKSI MANAJERIAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && rentals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Memuat data transaksi...
                  </td>
                </tr>
              ) : filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Tidak ada transaksi sewa yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rental) => {
                  const cust = customers[rental.customer_id];
                  const veh = vehicles[rental.vehicle_id];
                  return (
                    <tr key={rental.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">{rental.id}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{cust?.name || rental.customer_id}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{cust?.phone || '-'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-7 rounded bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <img
                              src={veh?.image_url || '/vehicles/placeholder.svg'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{veh?.model_name || rental.vehicle_id}</div>
                            <div className="text-[10px] font-mono text-slate-400">{veh?.plate_number}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{formatIDR(rental.total_cost)}</div>
                        <div className="text-[10px] text-slate-400">{rental.duration_days} Hari</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-800">{formatDate(rental.rented_at)}</div>
                        {rental.returned_at && (
                          <div className="text-[10px] text-emerald-600">Selesai: {formatDate(rental.returned_at)}</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rental.rental_status === 'Ongoing'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : rental.rental_status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {rental.rental_status === 'Ongoing' && '• Berjalan'}
                          {rental.rental_status === 'Completed' && '✓ Selesai'}
                          {rental.rental_status === 'Canceled' && '✕ Dibatalkan'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {rental.rental_status === 'Ongoing' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              disabled={actionLoadingId === rental.id}
                              onClick={() => handleReturn(rental)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Selesai
                            </button>
                            <button
                              disabled={actionLoadingId === rental.id}
                              onClick={() => handleCancel(rental)}
                              className="px-2.5 py-1 border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Batalkan
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => window.print()}
                            className="px-2.5 py-1 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Cetak</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
