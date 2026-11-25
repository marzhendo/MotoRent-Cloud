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
      aria-label="Navigasi portal"
      className={`bg-[#141413] border-r border-[#262523] text-[#D6D3D1] flex flex-col justify-between transition-[width] duration-200 z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-68'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-18 flex items-center justify-between px-4 border-b border-[#262523]">
          <button
            type="button"
            onClick={onGoToPublic}
            className="flex items-center gap-3 overflow-hidden text-left"
            aria-label="Kembali ke halaman utama MotoRent"
          >
            <img src="/logo.svg" alt="" width={36} height={36} className="w-9 h-9 rounded-lg shrink-0" />
            {!isCollapsed && (
              <div className="leading-none">
                <span className="font-extrabold text-base tracking-tight text-white block">MotoRent</span>
                <span className="text-[11px] text-[#A8A29E] font-medium block mt-0.5">
                  {isAdmin ? 'Panel Admin' : 'Portal Penyewa'}
                </span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            title={isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#A8A29E] hover:text-white hover:bg-[#262523] rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" aria-hidden="true" /> : <ChevronLeft className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        {/* Role Strip */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-[#262523] bg-[#1C1B1A]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#262523] text-[#EA580C] flex items-center justify-center shrink-0">
                {isAdmin ? <Shield className="w-3.5 h-3.5" aria-hidden="true" /> : <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                <div className="text-[11px] text-[#A8A29E] truncate">
                  {isAdmin ? 'Administrator' : 'Penyewa Aktif'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-5">
          {isAdmin && (
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 text-[11px] font-semibold text-[#78716C]">
                  Operasional
                </div>
              )}

              {[
                { id: 'dashboard', label: 'Ringkasan Bisnis', title: 'Ringkasan Operasional', icon: LayoutDashboard },
                { id: 'catalog', label: 'Master Armada', title: 'Kelola Master Armada', icon: Car },
                { id: 'customers', label: 'Data Pelanggan', title: 'Direktori Pelanggan', icon: Users },
                { id: 'rentals', label: 'Semua Transaksi', title: 'Kelola Semua Transaksi', icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    title={item.title}
                    aria-current={active ? 'page' : undefined}
                    className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#EA580C] text-white'
                        : 'text-[#A8A29E] hover:text-white hover:bg-[#262523]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}

              {!isCollapsed && (
                <div className="pt-4 px-3 pb-1.5 text-[11px] font-semibold text-[#78716C]">
                  Infrastruktur
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelectTab('diagnostics')}
                title="Diagnostik Kluster Multi-AZ"
                aria-current={activeTab === 'diagnostics' ? 'page' : undefined}
                className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'diagnostics'
                    ? 'bg-[#EA580C] text-white'
                    : 'text-[#A8A29E] hover:text-white hover:bg-[#262523]'
                }`}
              >
                <Cloud className="w-4 h-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Diagnostik Cloud</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  </div>
                )}
              </button>
            </div>
          )}

          {isCustomer && (
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 text-[11px] font-semibold text-[#78716C]">
                  Menu Penyewa
                </div>
              )}
              <button
                type="button"
                onClick={() => onSelectTab('catalog')}
                title="Katalog Armada Sewa"
                aria-current={activeTab === 'catalog' || activeTab === 'dashboard' ? 'page' : undefined}
                className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'catalog' || activeTab === 'dashboard'
                    ? 'bg-[#EA580C] text-white'
                    : 'text-[#A8A29E] hover:text-white hover:bg-[#262523]'
                }`}
              >
                <Car className="w-4 h-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span>Katalog Sewa</span>}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('my-rentals')}
                title="Sewa Saya & Riwayat"
                aria-current={activeTab === 'my-rentals' ? 'page' : undefined}
                className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'my-rentals'
                    ? 'bg-[#EA580C] text-white'
                    : 'text-[#A8A29E] hover:text-white hover:bg-[#262523]'
                }`}
              >
                <BookmarkCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>Sewa Saya</span>
                    {activeRentalCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF7ED] text-[#C2410C] tabular-nums">
                        {activeRentalCount} Aktif
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Utility Actions */}
      <div className="p-3 border-t border-[#262523] space-y-1">
        <button
          type="button"
          onClick={onGoToPublic}
          title="Lihat Halaman Publik"
          className="w-full min-h-[42px] flex items-center gap-3 px-3 py-2 text-xs font-semibold text-[#A8A29E] hover:text-white hover:bg-[#262523] rounded-lg transition-colors"
        >
          <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>Halaman Publik</span>}
        </button>

        <button
          type="button"
          onClick={logout}
          title="Keluar dari Akun"
          className="w-full min-h-[42px] flex items-center gap-3 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>Keluar Akun</span>}
        </button>
      </div>
    </aside>
  );
};
