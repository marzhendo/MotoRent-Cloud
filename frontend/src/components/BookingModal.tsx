import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  type Vehicle,
  type Customer,
  fetchCustomers,
  createRental
} from '../api';
import {
  Car,
  Bike,
  User as UserIcon,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface BookingModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (rentalId: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, isCustomer } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(3);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      
      // If logged in as customer, automatically bind to their customer_id
      if (isCustomer && user?.customer_id) {
        setSelectedCustomerId(user.customer_id);
      }

      fetchCustomers()
        .then((data) => {
          setCustomers(data);
          // If not customer or customer_id not set yet, pick first active
          if (!isCustomer || !user?.customer_id) {
            const firstActive = data.find((c) => c.status === 'Active');
            if (firstActive) {
              setSelectedCustomerId(firstActive.id);
            }
          }
        })
        .catch((err) => setError('Gagal mengambil daftar penyewa: ' + err.message));
    }
  }, [isOpen, isCustomer, user]);

  if (!isOpen || !vehicle) return null;

  const totalCost = (vehicle.daily_rate || 0) * durationDays;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Silakan pilih profil pelanggan.');
      return;
    }
    if (durationDays < 1) {
      setError('Durasi sewa minimal 1 hari.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await createRental({
        customer_id: selectedCustomerId,
        vehicle_id: vehicle.id,
        duration_days: durationDays
      });
      onSuccess(res.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses transaksi rental');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Konfirmasi Pemesanan Sewa</h3>
              <p className="text-xs text-slate-500">Transaksi Multi-Entitas: Pelanggan, Armada & Rental</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Selected Vehicle Card Preview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                {vehicle.category === 'Motor' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                  {vehicle.category} • {vehicle.plate_number}
                </span>
                <h4 className="font-bold text-slate-900 text-sm">{vehicle.model_name}</h4>
                <span className="text-xs text-slate-500 font-mono">ID: {vehicle.id}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Tarif Harian</span>
              <span className="text-sm font-extrabold text-slate-900">{formatIDR(vehicle.daily_rate)}</span>
            </div>
          </div>

          {/* Select Customer */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              Profil Pelanggan Penyewa *
            </label>

            {isCustomer && user?.customer_id ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{user.name} (Profil Akun Anda)</span>
                    <span className="text-[11px] text-slate-500">
                      ID: {user.customer_id} • Status: Terverifikasi Aktif
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                  Terverifikasi
                </span>
              </div>
            ) : (
              <>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.status === 'Blacklisted'}>
                      {c.name} ({c.id}) - SIM: {c.license_number} {c.status === 'Blacklisted' ? '⛔ [BLACKLISTED]' : '✅ [Active]'}
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                    <span>Kontak: {selectedCustomer.phone}</span>
                    <span>•</span>
                    <span className={selectedCustomer.status === 'Active' ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                      {selectedCustomer.status === 'Active' ? 'Penyewa Terverifikasi' : 'Dilarang Menyewa'}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Durasi Sewa (Hari) *
              </label>
              <div className="flex items-center gap-1">
                {[1, 3, 7, 14].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    className={`px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer ${
                      durationDays === days
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {days}h
                  </button>
                ))}
              </div>
            </div>
            <input
              type="number"
              min={1}
              max={90}
              required
              value={durationDays}
              onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Pricing Computation Breakdown */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Receipt className="w-3.5 h-3.5 text-blue-600" />
                Tarif Dasar Harian:
              </span>
              <span>{formatIDR(vehicle.daily_rate)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Durasi Sewa:</span>
              <span>{durationDays} Hari</span>
            </div>
            <div className="pt-2 border-t border-blue-200/60 flex items-baseline justify-between text-slate-900 font-bold">
              <span className="text-sm">Total Biaya Sewa:</span>
              <span className="text-lg text-blue-600">{formatIDR(totalCost)}</span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || (selectedCustomer && selectedCustomer.status === 'Blacklisted')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Memproses Transaksi...' : 'Konfirmasi & Terbitkan Sewa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
