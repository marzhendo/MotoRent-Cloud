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
      setError(err.message || 'Gagal masuk akun demo.');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Side: Modern Tech Mobility Brand Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute -right-20 -bottom-20 w-72 h-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
          <div className="absolute left-0 top-0 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-8 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.svg" alt="MotoRent Cloud Logo" className="w-12 h-12 drop-shadow-md" />
              <div>
                <h1 className="text-xl font-black tracking-tight text-white leading-none">MotoRent</h1>
                <span className="text-[11px] font-bold text-blue-400 tracking-wider uppercase">Cloud Mobility</span>
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white mb-3 leading-snug">
              Kenyamanan Sewa di Ujung Jari Anda
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8 font-normal">
              Akses cepat armada motor dan mobil terawat dengan tarif pasti, verifikasi SIM instan, dan proses sewa tanpa birokrasi rumit.
            </p>

            <div className="space-y-3.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pemesanan cepat langsung terhubung ke profil SIM</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Validasi ketersediaan armada langsung &amp; akurat</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Layanan antar-jemput unit ke stasiun atau hotel</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-slate-800 text-[11px] text-slate-500">
            Keamanan akun terlindungi dengan enkripsi PBKDF2 SHA-256 standard industri.
          </div>
        </div>

        {/* Right Side: Form & Quick Demo Access (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke Akun Anda</h2>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan kredensial terdaftar atau pilih akun demo pengujian di bawah.
              </p>
            </div>

            {/* Quick Demo Login Bar for Evaluator / Lecturer */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
                <span>Akses Cepat Akun Demo (Evaluasi)</span>
                <span className="text-[10px] font-normal text-slate-400">1-Click Login</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={demoLoading !== null}
                  onClick={() => handleDemo('admin')}
                  className="p-2.5 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 text-purple-900 text-left transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-purple-600" />
                      <span>Demo Admin</span>
                    </span>
                    <span className="text-[10px] text-purple-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">admin@motorent.cloud</div>
                </button>

                <button
                  type="button"
                  disabled={demoLoading !== null}
                  onClick={() => handleDemo('customer')}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-900 text-left transition-all cursor-pointer shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Demo Pelanggan</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">andi@motorent.cloud</div>
                </button>
              </div>
            </div>

            <div className="relative mb-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                atau gunakan email terdaftar
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? 'Memproses Masuk...' : 'Masuk ke Sistem'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="pt-6 text-center text-xs text-slate-500">
            Belum memiliki akun?{' '}
            <button
              onClick={onNavigateToRegister}
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Daftar Akun Pelanggan Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
