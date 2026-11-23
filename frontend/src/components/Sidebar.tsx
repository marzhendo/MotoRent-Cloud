import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  Users,
  FileText,
  BookmarkCheck,
  Cloud,
  LogOut,
  Globe,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onGoToPublic: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeRentalCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onGoToPublic,
  isCollapsed,
  onToggleCollapse,
  activeRentalCount = 0,
}) => {
  const { user, isAdmin, isCustomer, logout } = useAuth();

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/80">
          <div
            onClick={onGoToPublic}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-400 p-0.5 shadow-md shadow-blue-600/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <img src="/logo.svg" alt="MotoRent" className="w-6 h-6" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-white">MotoRent</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-blue-500/20 text-cyan-400 border border-blue-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {isAdmin ? 'Back-Office Portal' : 'Customer Workspace'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Pill Banner */}
        {!isCollapsed && (
          <div className="px-5 py-3.5 border-b border-slate-800/60 bg-slate-900/30">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  {isAdmin ? 'Akses Penuh Administrator' : `Penyewa Terverifikasi`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <div className="p-3 space-y-6">
          {/* Admin Navigation */}
          {isAdmin && (
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Operasional Rental
                </div>
              )}
              <button
                onClick={() => onSelectTab('dashboard')}
                title="Ringkasan Operasional"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Ringkasan Bisnis</span>}
              </button>

              <button
                onClick={() => onSelectTab('catalog')}
                title="Kelola Master Armada"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Car className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Master Armada</span>}
              </button>

              <button
                onClick={() => onSelectTab('customers')}
                title="Direktori Pelanggan"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'customers'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Data Pelanggan</span>}
              </button>

              <button
                onClick={() => onSelectTab('rentals')}
                title="Kelola Semua Transaksi"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'rentals'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Semua Transaksi</span>}
              </button>

              {!isCollapsed && (
                <div className="pt-4 px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Arsitektur Cloud
                </div>
              )}
              <button
                onClick={() => onSelectTab('diagnostics')}
                title="Diagnostik Kluster Multi-AZ"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'diagnostics'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Cloud className="w-4 h-4 shrink-0 text-cyan-400" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Diagnostik Cloud</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Customer Navigation */}
          {isCustomer && (
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Menu Pelanggan
                </div>
              )}
              <button
                onClick={() => onSelectTab('catalog')}
                title="Katalog Armada Sewa"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Car className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Katalog Sewa</span>}
              </button>

              <button
                onClick={() => onSelectTab('my-rentals')}
                title="Sewa Saya & Riwayat"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'my-rentals'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <BookmarkCheck className="w-4 h-4 shrink-0" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Sewa Saya</span>
                    {activeRentalCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950">
                        {activeRentalCount} Aktif
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onGoToPublic}
          title="Lihat Web Publik / Landing Page"
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 shrink-0 text-cyan-400" />
          {!isCollapsed && <span>Lihat Web Publik</span>}
        </button>

        <button
          onClick={logout}
          title="Keluar dari Akun"
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Keluar Akun</span>}
        </button>
      </div>
    </aside>
  );
};
