import React from 'react';
import { Wifi, WifiOff, RefreshCw, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { ConnectionStatus } from '../lib/realtime/useRealtimeRoom';

interface NavbarProps {
  connectionStatus: ConnectionStatus;
  activePeers: number;
}

export const Navbar: React.FC<NavbarProps> = ({ connectionStatus, activePeers }) => {
  const { user, logout } = useAuthStore();

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wifi className="w-3.5 h-3.5" />
            <span>متصل ({activePeers} کاربر آنلاین)</span>
          </span>
        );
      case 'connecting':
      case 'syncing':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>در حال اتصال و همگام‌سازی...</span>
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <WifiOff className="w-3.5 h-3.5" />
            <span>اتصال قطع است (تلاش مجدد)</span>
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30">
            چ
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm tracking-tight">سامانه ارزیابی عملکرد و کوچینگ هوشمند</h1>
            <p className="text-[11px] text-slate-400">اصفهان چالاک (هلدینگ گیتی‌پسند) - نسخه ابری Cloudflare</p>
          </div>
        </div>
        <div className="mr-4">{getStatusBadge()}</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
          <UserIcon className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-slate-200">{user?.name}</span>
          <span className="text-slate-400 text-[10px] bg-slate-700/60 px-1.5 py-0.5 rounded">{user?.role}</span>
        </div>

        <button
          onClick={() => logout()}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="خروج از سیستم"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
