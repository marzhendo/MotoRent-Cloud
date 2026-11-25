import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Lock, User, Phone, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterProps {
  onSuccess?: () => void;
  onNavigateToLogin: () => void;
  onBackToHome: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSuccess, onNavigateToLogin, onBackToHome }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    license_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Pendaftaran gagal. Pastikan format email, nomor telepon, dan SIM sesuai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-lg overflow-hidden w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Side: Asphalt Brand Panel */}
        <div className="lg:col-span-5 bg-[#141413] p-8 sm:p-10 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#262523]">
          <div>
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#A8A29E] hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Kembali ke Beranda</span>
            </button>

            <div className="flex items-center gap-3 mb-7">
              <img src="/logo.svg" alt="" width={40} height={40} className="w-10 h-10 rounded-lg" />
              <div className="leading-none">
                <span className="text-lg font-extrabold tracking-tight text-white block">MotoRent</span>
                <span className="text-[11px] font-medium text-[#A8A29E]">Registrasi Penyewa</span>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-3 leading-snug">
              Satu akun untuk sewa motor dan mobil
            </h1>
            <p className="text-sm text-[#A8A29E] leading-relaxed mb-8">
              Catat data KTP dan nomor SIM Anda satu kali saat mendaftar agar pemesanan berikutnya lebih cepat.
            </p>

            <div className="space-y-3 text-xs text-[#D6D3D1]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                <span>Profil SIM langsung aktif untuk pemesanan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                <span>Riwayat sewa dan bukti pembayaran tersimpan rapi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                <span>Kembalikan kendaraan langsung dari portal Anda</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#262523] text-xs text-[#78716C]">
            Gunakan nomor SIM C untuk motor atau SIM A untuk mobil.
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[#141413] tracking-tight">Daftar Akun Penyewa Baru</h2>
              <p className="text-xs text-[#57534E] mt-1">
                Lengkapi data di bawah ini untuk mengaktifkan akun Anda.
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-bold text-[#141413] mb-1">
                  Nama Lengkap Sesuai KTP/SIM
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Budi Setiawan"
                    className="w-full min-h-[42px] pl-10 pr-3 py-2 text-sm bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-[#141413] focus:bg-white focus:border-[#141413] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-bold text-[#141413] mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="budi@email.com"
                      className="w-full min-h-[42px] pl-10 pr-3 py-2 text-sm bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-[#141413] focus:bg-white focus:border-[#141413] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-xs font-bold text-[#141413] mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="reg-password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      className="w-full min-h-[42px] pl-10 pr-3 py-2 text-sm bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-[#141413] focus:bg-white focus:border-[#141413] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-bold text-[#141413] mb-1">
                    Nomor HP / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full min-h-[42px] pl-10 pr-3 py-2 text-sm bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-[#141413] focus:bg-white focus:border-[#141413] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-sim" className="block text-xs font-bold text-[#141413] mb-1">
                    Nomor SIM (A / C)
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      id="reg-sim"
                      type="text"
                      required
                      value={formData.license_number}
                      onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      placeholder="SIM-C-123456"
                      className="w-full min-h-[42px] pl-10 pr-3 py-2 text-sm font-mono bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-[#141413] focus:bg-white focus:border-[#141413] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[46px] mt-2 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] active:scale-[0.96] disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-[background-color,transform] duration-150"
              >
                {loading ? 'Mendaftarkan akun...' : 'Daftar Sekarang'}
              </button>
            </form>
          </div>

          <div className="pt-6 text-center text-xs text-[#57534E]">
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-bold text-[#EA580C] hover:text-[#C2410C] underline underline-offset-2"
            >
              Masuk di sini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
