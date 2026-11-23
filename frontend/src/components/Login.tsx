import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, UserCheck, ArrowRight, ArrowLeft, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

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
      setError(err.message || 'Gagal login demo.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Side: Brand Visual Panel (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Background Ring */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div>
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-medium text-blue-100 hover:text-white transition-colors mb-8 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.svg" alt="MotoRent Cloud Logo" className="w-12 h-12 drop-shadow-md" />
              <div>
                <h1 className="text-xl font-black tracking-tight text-white leading-none">MotoRent</h1>
                <span className="text-[11px] font-semibold text-blue-200 tracking-wider uppercase">Cloud Mobility</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
              Solusi Rental Kendaraan Modern
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed mb-6 font-normal">
              Platform komputasi awan terdistribusi tanpa database eksternal. Akses armada mobil dan motor dengan data ketersediaan real-time.
            </p>

            <div className="space-y-3 pt-2 text-xs text-blue-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Pemesanan cepat langsung terhubung ke profil SIM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Validasi ketersediaan unit armada atomik</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Load balancing multi-node andal</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-blue-500/30 text-[11px] text-blue-200">
            CAK3EAB3 Komputasi Awan dan Terdistribusi • Telkom University Purwokerto
          </div>
        </div>

        {/* Right Side: Form & Demo Access (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Masuk ke Akun Anda</h2>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan kredensial terdaftar atau pilih akun demo pengujian di bawah.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? 'Memproses Masuk...' : 'Masuk Sekarang'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                ⚡ 1-Click Demo Login (Untuk Pengujian & Dosen)
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemo('admin')}
                  disabled={demoLoading !== null}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>{demoLoading === 'admin' ? 'Masuk...' : 'Demo Admin'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemo('customer')}
                  disabled={demoLoading !== null}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{demoLoading === 'customer' ? 'Masuk...' : 'Demo Pelanggan'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Belum memiliki akun?{' '}
            <button
              onClick={onNavigateToRegister}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Daftar Akun Pelanggan Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
