import React, { useState, useEffect } from 'react';
import { fetchSystemInfo, type SystemInfo } from '../api';
import {
  Cloud,
  Server,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Activity,
  Layers,
  Database,
  Lock,
  ArrowRight
} from 'lucide-react';

export const CloudDiagnostics: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState<number>(0);

  const loadTelemetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSystemInfo();
      setSystemInfo(data);
      setFetchCount((prev) => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat telemetri kluster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#15803D]">
            <span className="w-2 h-2 rounded-full bg-[#15803D]" aria-hidden="true" />
            <span>Komputasi Awan Terdistribusi (Panel Khusus Admin)</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#141413] tracking-tight">
            Diagnostik Sistem dan Kluster Multi-AZ
          </h2>
          <p className="text-sm text-[#57534E] max-w-2xl">
            Pemantauan instance backend terdistribusi, Nginx load balancer, dan status in-memory JSON store tanpa database SQL eksternal.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTelemetry}
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-[#141413] hover:bg-[#EA580C] active:scale-[0.96] text-white rounded-lg text-xs font-bold transition-[background-color,transform] duration-150 self-start md:self-auto shrink-0 tabular-nums"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>Ping Node ({fetchCount}x)</span>
        </button>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#57534E]">
            <span>Node Instance Aktif</span>
            <Server className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
          </div>
          <div className="font-mono text-sm font-bold text-[#141413] truncate">
            {systemInfo ? systemInfo.instance_id : 'Mendeteksi...'}
          </div>
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]">
            Online &middot; Healthy
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#57534E]">
            <span>Layanan Backend</span>
            <Cpu className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
          </div>
          <div className="text-sm font-bold text-[#141413]">
            {systemInfo ? systemInfo.service : 'FastAPI'} v{systemInfo?.version || '2.0.0'}
          </div>
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F7F5] text-[#57534E] border border-[#E7E5E4]">
            Python 3.12 Runtime
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#57534E]">
            <span>Penyimpanan Data</span>
            <Database className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
          </div>
          <div className="text-sm font-bold text-[#141413]">Thread-Safe JSON</div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#57534E]">
            <Lock className="w-3 h-3 text-[#B45309]" aria-hidden="true" />
            <span>Python RLock Synchronized</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E7E5E4] space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#57534E]">
            <span>Uptime Sistem</span>
            <Activity className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
          </div>
          <div className="font-mono text-sm font-bold text-[#141413] tabular-nums">
            {systemInfo ? `${systemInfo.uptime_seconds} detik` : '0 detik'}
          </div>
          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#F7F7F5] text-[#57534E] border border-[#E7E5E4]">
            Operasional Stabil
          </span>
        </div>
      </div>

      {/* Topology Diagram */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E5E4] space-y-6">
        <h3 className="text-base font-bold text-[#141413] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
          <span>Topologi Arsitektur Multi-Node</span>
        </h3>

        <div className="p-5 bg-[#141413] rounded-xl font-mono text-xs text-[#D6D3D1]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="p-4 bg-[#1C1B1A] rounded-lg border border-[#262523] w-full md:w-auto">
              <span className="text-[#A8A29E] block text-[10px]">Client / Browser</span>
              <span className="font-bold text-white text-sm">React + Vite SPA</span>
            </div>

            <ArrowRight className="w-5 h-5 text-[#EA580C] shrink-0 hidden md:block" aria-hidden="true" />

            <div className="p-4 bg-[#1C1B1A] rounded-lg border border-[#EA580C]/50 w-full md:w-auto">
              <span className="text-[#EA580C] block text-[10px]">Reverse Proxy / ALB (Port 8080)</span>
              <span className="font-bold text-white text-sm">Nginx Load Balancer</span>
            </div>

            <ArrowRight className="w-5 h-5 text-[#EA580C] shrink-0 hidden md:block" aria-hidden="true" />

            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="p-3 bg-[#1C1B1A] rounded-lg border border-[#15803D]/50">
                <span className="text-emerald-400 block text-[10px]">Zone A (Node 1 - Port 8001)</span>
                <span className="font-bold text-white text-xs">FastAPI In-Memory Engine</span>
              </div>
              <div className="p-3 bg-[#1C1B1A] rounded-lg border border-[#15803D]/50">
                <span className="text-emerald-400 block text-[10px]">Zone B (Node 2 - Port 8002)</span>
                <span className="font-bold text-white text-xs">FastAPI In-Memory Engine</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-[#57534E] leading-relaxed">
          <div className="space-y-1.5 bg-[#F7F7F5] p-5 rounded-xl border border-[#E7E5E4]">
            <h4 className="font-bold text-[#141413] text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
              <span>Kepatuhan Aturan Praktikum</span>
            </h4>
            <p>
              Sistem mematuhi aturan tanpa database eksternal (PostgreSQL, MySQL, atau SQLite). Data dikelola di memori lokal thread-safe dengan persistensi JSON atomik.
            </p>
          </div>

          <div className="space-y-1.5 bg-[#F7F7F5] p-5 rounded-xl border border-[#E7E5E4]">
            <h4 className="font-bold text-[#141413] text-sm flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
              <span>Simulasi AWS Multi-AZ Deployment</span>
            </h4>
            <p>
              Nginx bertindak sebagai Application Load Balancer yang mendistribusikan permintaan secara round-robin ke dua node backend independen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
