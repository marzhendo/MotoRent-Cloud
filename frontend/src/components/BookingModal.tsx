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
  ShieldCheck,
  X
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
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setError(null);

      if (isCustomer && user?.customer_id) {
        setSelectedCustomerId(user.customer_id);
      }

      fetchCustomers()
        .then((data) => {
          setCustomers(data);
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
      setError('Silakan pilih profil penyewa.');
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
      setError(err.message || 'Gagal memproses transaksi sewa.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#141413]/70 p-4"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E7E5E4] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E7E5E4] flex items-center justify-between bg-[#F7F7F5]">
          <div>
            <h3 id="booking-modal-title" className="font-extrabold text-[#141413] text-base">
              Konfirmasi Pemesanan Unit
            </h3>
            <p className="text-xs text-[#57534E] mt-0.5">
              Periksa rincian kendaraan dan durasi pemakaian sebelum konfirmasi.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal pemesanan"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-[#57534E] hover:text-[#141413] rounded-lg"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div role="alert" className="flex items-start gap-2.5 p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl text-[#B91C1C] text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {/* Selected Vehicle Preview */}
          <div className="p-4 bg-[#F7F7F5] rounded-xl border border-[#E7E5E4] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 rounded-lg bg-white border border-[#E7E5E4] overflow-hidden flex items-center justify-center shrink-0 p-1">
                {vehicle.image_url ? (
                  <img src={vehicle.image_url} alt={vehicle.model_name} className="w-full h-full object-contain" />
                ) : vehicle.category === 'Motor' ? (
                  <Bike className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />
                ) : (
                  <Car className="w-6 h-6 text-[#EA580C]" aria-hidden="true" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-[#EA580C]">
                  {vehicle.category} &middot; <span className="font-mono">{vehicle.plate_number}</span>
                </span>
                <h4 className="font-bold text-[#141413] text-sm">{vehicle.model_name}</h4>
                <span className="text-xs text-[#78716C] font-mono">{vehicle.id}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#78716C] block">Tarif Harian</span>
              <span className="text-sm font-extrabold text-[#141413] tabular-nums">{formatIDR(vehicle.daily_rate)}</span>
            </div>
          </div>

          {/* Customer Profile */}
          <div>
            <label htmlFor="booking-customer" className="text-xs font-bold text-[#141413] mb-1.5 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-[#57534E]" aria-hidden="true" />
              <span>Profil Penyewa</span>
            </label>

            {isCustomer && user?.customer_id ? (
              <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0" aria-hidden="true" />
                  <div>
                    <span className="text-xs font-bold text-[#141413] block">{user.name}</span>
                    <span className="text-[11px] text-[#57534E] font-mono">
                      {user.customer_id} &middot; Status Aktif
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-white text-[#15803D] border border-[#BBF7D0] rounded-md text-[11px] font-bold">
                  Terverifikasi
                </span>
              </div>
            ) : (
              <>
                <select
                  id="booking-customer"
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-sm text-[#141413] focus:bg-white focus:border-[#141413]"
                >
                  <option value="">Pilih penyewa...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id} disabled={c.status === 'Blacklisted'}>
                      {c.name} ({c.id}) - SIM: {c.license_number} [{c.status === 'Blacklisted' ? 'Diblokir' : 'Aktif'}]
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <p className="mt-1.5 text-xs text-[#57534E] flex items-center gap-1.5">
                    <span>Kontak: {selectedCustomer.phone}</span>
                    <span>&middot;</span>
                    <span className={selectedCustomer.status === 'Active' ? 'text-[#15803D] font-semibold' : 'text-[#B91C1C] font-semibold'}>
                      {selectedCustomer.status === 'Active' ? 'Layak menyewa' : 'Diblokir'}
                    </span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="booking-days" className="text-xs font-bold text-[#141413] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#57534E]" aria-hidden="true" />
                <span>Durasi Sewa (Hari)</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 3, 7, 14].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    className={`min-h-[32px] px-2.5 py-1 text-xs font-bold rounded-md border tabular-nums transition-colors ${
                      durationDays === days
                        ? 'bg-[#141413] text-white border-[#141413]'
                        : 'bg-white text-[#57534E] border-[#E7E5E4] hover:border-[#141413]'
                    }`}
                  >
                    {days} hr
                  </button>
                ))}
              </div>
            </div>
            <input
              id="booking-days"
              type="number"
              min={1}
              max={90}
              required
              value={durationDays}
              onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-sm font-semibold tabular-nums text-[#141413] focus:bg-white focus:border-[#141413]"
            />
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 bg-[#FFF7ED] rounded-xl border border-[#FED7AA] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#57534E]">
              <span className="flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#EA580C]" aria-hidden="true" />
                <span>Tarif harian</span>
              </span>
              <span className="tabular-nums font-medium">{formatIDR(vehicle.daily_rate)}</span>
            </div>
            <div className="flex items-center justify-between text-[#57534E]">
              <span>Durasi</span>
              <span className="tabular-nums font-medium">{durationDays} hari</span>
            </div>
            <div className="pt-2 border-t border-[#FED7AA] flex items-baseline justify-between text-[#141413] font-extrabold">
              <span className="text-sm">Total Biaya</span>
              <span className="text-lg text-[#C2410C] tabular-nums">{formatIDR(totalCost)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 border border-[#E7E5E4] rounded-lg text-sm font-semibold text-[#57534E] hover:bg-[#F7F7F5] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || (selectedCustomer && selectedCustomer.status === 'Blacklisted')}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] active:scale-[0.96] disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-[background-color,transform] duration-150"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>{submitting ? 'Memproses...' : 'Konfirmasi Sewa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
