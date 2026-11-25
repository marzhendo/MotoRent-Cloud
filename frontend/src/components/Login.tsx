import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onSuccess?: () => void;
  onNavigateToRegister: () => void;
  onBackToHome: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onNavigateToRegister, onBackToHome }) => {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<'admin' | 'customer' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'admin' | 'customer') => {
    setError(null);
    setDemoLoading(role);
    try {
      await quickDemoLogin(role);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk akun demo.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-lg overflow-hidden w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
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
                <span className="text-[11px] font-medium text-[#A8A29E]">Purwokerto</span>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-3 leading-snug">
              Masuk untuk mengelola penyewaan Anda
            </h1>
            <p className="text-sm text-[#A8A29E] leading-relaxed mb-8">
              Pesan unit motor atau mobil lebih cepat karena profil SIM Anda sudah tersimpan di akun.
            </p>

            <div className="space-y-3 text-xs text-[#D6D3D1]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                <span>Status ketersediaan unit diperbarui langsung</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                <span>Pantau jadwal kembali dan bukti transaksi mandiri</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#EA580C] shrink-0" aria-hidden="true" />
                <span>Pengantaran ke Stasiun Purwokerto dan hotel kota</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#262523] text-xs text-[#78716C]">
            Operasional garasi: setiap hari 07.00 - 22.00 WIB.
          </div>
        </div>

        {/* Right Side: Login Form & Quick Demo */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[#141413] tracking-tight">Masuk ke Akun</h2>
              <p className="text-xs text-[#57534E] mt-1">
                Masukkan email terdaftar atau gunakan akun demo pengujian di bawah.
              </p>
            </div>

            {/* Quick Demo Login Bar */}
            <div className="mb-6 p-4 rounded-xl bg-[#F7F7F5] border border-[#E7E5E4]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] mb-2.5 flex items-center justify-between">
                <span>Akun Demo Pengujian</span>
                <span className="text-[10px] font-normal text-[#78716C]">1-Klik Masuk</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={demoLoading !== null}
                  onClick={() => handleDemo('admin')}
                  className="p-3 rounded-lg border border-[#E7E5E4] bg-white hover:border-[#141413] active:scale-[0.98] text-[#141413] text-left transition-[border-color,transform] duration-150"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Shield className="w-3.5 h-3.5 text-[#EA580C]" aria-hidden="true" />
                    <span>Demo Admin</span>
                  </div>
                  <div className="text-[11px] text-[#57534E] font-mono mt-0.5 truncate">admin@motorent.cloud</div>
                </button>

                <button
                  type="button"
                  disabled={demoLoading !== null}
                  onClick={() => handleDemo('customer')}
                  className="p-3 rounded-lg border border-[#E7E5E4] bg-white hover:border-[#141413] active:scale-[0.98] text-[#141413] text-left transition-[border-color,transform] duration-150"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                    <span>Demo Pelanggan</span>
                  </div>
                  <div className="text-[11px] text-[#57534E] font-mono mt-0.5 truncate">andi@motorent.cloud</div>
                </button>
              </div>
            </div>

            <div className="relative mb-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E7E5E4]" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium text-[#78716C]">
                atau masuk dengan email
              </span>
            </div>

            {error && (
              <div role="alert" className="mb-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold text-[#141413] mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-[#141413] focus:bg-white focus:border-[#141413] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-bold text-[#141413] mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 text-sm bg-[#F7F7F5] border border-[#E7E5E4] rounded-lg text-[#141413] focus:bg-white focus:border-[#141413] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || demoLoading !== null}
                className="w-full min-h-[46px] py-2.5 bg-[#EA580C] hover:bg-[#C2410C] active:scale-[0.96] disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-[background-color,transform] duration-150"
              >
                {loading ? 'Memeriksa akun...' : 'Masuk ke Akun'}
              </button>
            </form>
          </div>

          <div className="pt-6 text-center text-xs text-[#57534E]">
            Belum punya akun?{' '}
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-bold text-[#EA580C] hover:text-[#C2410C] underline underline-offset-2"
            >
              Daftar akun penyewa baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
