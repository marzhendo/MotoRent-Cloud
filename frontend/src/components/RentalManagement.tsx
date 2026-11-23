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
  Clock,
  XCircle,
  RotateCcw,
  Ban,
  Car,
  Bike
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rentalData, customerList, vehicleList] = await Promise.all([
        fetchRentals(statusFilter || undefined, customerId),
        fetchCustomers(),
        fetchVehicles()
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
    if (!window.confirm(`Konfirmasi pengembalian unit ${vehName} untuk transaksi ${rental.id}?\nStatus unit akan otomatis kembali menjadi Tersedia.`)) {
      return;
    }

    try {
      setActionLoadingId(rental.id);
      await returnRental(rental.id);
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
    if (!window.confirm(`Konfirmasi pembatalan transaksi ${rental.id}?\nArmada ${vehName} akan dilepaskan kembali menjadi Tersedia.`)) {
      return;
    }

    try {
      setActionLoadingId(rental.id);
      await cancelRental(rental.id);
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {isCustomerView ? 'Riwayat Sewa Saya' : 'Kelola Transaksi Sewa'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isCustomerView
              ? 'Monitoring armada yang sedang Anda sewa dan riwayat transaksi sewa masa lalu Anda.'
              : 'Monitoring transaksi sewa berjalan, proses pengembalian armada, dan audit histori sewa.'}
          </p>
        </div>

        <button
          onClick={loadData}
          title="Refresh Data"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-xs cursor-pointer w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari transaksi berdasarkan ID, nama penyewa, armada, atau plat..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Status Sewa</option>
            <option value="Ongoing">Sedang Berjalan (Ongoing)</option>
            <option value="Completed">Selesai (Completed)</option>
            <option value="Canceled">Dibatalkan (Canceled)</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Rentals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Penyewa</th>
                <th className="px-6 py-4">Armada Kendaraan</th>
                <th className="px-6 py-4">Durasi & Biaya</th>
                <th className="px-6 py-4">Jadwal Sewa</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && rentals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Memuat data transaksi sewa...
                  </td>
                </tr>
              ) : filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Belum ada transaksi sewa yang tercatat.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((r) => {
                  const cust = customers[r.customer_id];
                  const veh = vehicles[r.vehicle_id];

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/75 transition-colors">
                      {/* ID */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {r.id}
                      </td>

                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{cust ? cust.name : r.customer_id}</div>
                        <div className="text-xs text-slate-500 font-mono">SIM: {cust ? cust.license_number : '-'}</div>
                      </td>

                      {/* Vehicle Info */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 flex items-center gap-1.5">
                          {veh && veh.category === 'Motor' ? (
                            <Bike className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <Car className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {veh ? veh.model_name : r.vehicle_id}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">{veh ? veh.plate_number : '-'}</div>
                      </td>

                      {/* Financials */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-blue-600">{formatIDR(r.total_cost)}</div>
                        <div className="text-xs text-slate-500">{r.duration_days} Hari ({formatIDR(r.daily_rate_snapshot)}/hari)</div>
                      </td>

                      {/* Schedule */}
                      <td className="px-6 py-4 text-xs">
                        <div className="text-slate-700">Mulai: {formatDate(r.rented_at)}</div>
                        <div className="text-slate-500">Estimasi: {formatDate(r.expected_return_at)}</div>
                        {r.returned_at && (
                          <div className="text-emerald-700 font-medium mt-0.5">Kembali: {formatDate(r.returned_at)}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {r.rental_status === 'Ongoing' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Ongoing
                          </span>
                        )}
                        {r.rental_status === 'Completed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                        {r.rental_status === 'Canceled' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3 h-3" />
                            Canceled
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {r.rental_status === 'Ongoing' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={actionLoadingId === r.id}
                              onClick={() => handleReturn(r)}
                              title="Kembalikan Armada"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Kembalikan
                            </button>
                            <button
                              disabled={actionLoadingId === r.id}
                              onClick={() => handleCancel(r)}
                              title="Batalkan Sewa"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              Batal
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Selesai</span>
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
