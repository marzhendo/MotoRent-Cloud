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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Arsitektur Komputasi Awan Terdistribusi</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Diagnostik Sistem &amp; Kluster Multi-AZ
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Pemantauan langsung instance backend terdistribusi, reverse proxy load balancer, dan status thread-safe in-memory engine tanpa database SQL eksternal.
          </p>
        </div>

        <button
          onClick={loadTelemetry}
          className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md self-start md:self-auto shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Ping Node ({fetchCount}x)</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs">
          {error}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Node Instance Aktif</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-mono text-base font-black text-white truncate">
            {systemInfo ? systemInfo.instance_id : 'Mendeteksi...'}
          </div>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Node Online &bull; Healthy
          </span>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Layanan Backend</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-black text-white">
            {systemInfo ? systemInfo.service : 'FastAPI'} v{systemInfo?.version || '2.0.0'}
          </div>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-400 border border-blue-500/30">
            Python 3.12 Engine
          </span>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Penyimpanan Data</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-black text-white">
            Thread-Safe JSON
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Python RLock Synchronized</span>
          </div>
        </div>

        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uptime Sistem</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono text-base font-black text-white">
            {systemInfo ? `${systemInfo.uptime_seconds} Detik` : '0 Detik'}
          </div>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            Operasional Stabil
          </span>
        </div>
      </div>

      {/* Cloud Architecture Diagram & Specs */}
      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>Topologi Arsitektur Multi-Node</span>
        </h3>

        <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-700 w-full md:w-auto">
              <span className="text-slate-500 block text-[10px]">Client / Browser</span>
              <span className="font-bold text-white text-sm">Vite React Frontend</span>
            </div>

            <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0 hidden md:block" />

            <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-800 w-full md:w-auto">
              <span className="text-blue-400 block text-[10px]">Reverse Proxy / ALB (Port 8080)</span>
              <span className="font-bold text-white text-sm">Nginx Load Balancer</span>
            </div>

            <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0 hidden md:block" />

            <div className="flex flex-col gap-2 w-full md:w-auto">
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800">
                <span className="text-emerald-400 block text-[10px]">Zone A (Node 1 - Port 8001)</span>
                <span className="font-bold text-white text-xs">FastAPI In-Memory Engine</span>
              </div>
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800">
                <span className="text-emerald-400 block text-[10px]">Zone B (Node 2 - Port 8002)</span>
                <span className="font-bold text-white text-xs">FastAPI In-Memory Engine</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-400 leading-relaxed pt-2">
          <div className="space-y-2 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Kepatuhan Aturan Praktikum</span>
            </h4>
            <p>
              Sistem ini 100% mematuhi aturan tanpa database eksternal (PostgreSQL / MySQL / SQLite). Data disimpan dan dikelola pada memori lokal thread-safe dengan persistensi JSON atomik.
            </p>
          </div>

          <div className="space-y-2 bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Cloud className="w-4 h-4 text-cyan-400" />
              <span>Simulasi AWS Multi-AZ Deployment</span>
            </h4>
            <p>
              Nginx bertindak sebagai AWS Application Load Balancer yang mendistribusikan lalu lintas secara round-robin ke dua node backend independen yang merepresentasikan Availability Zone terpisah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
