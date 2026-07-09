import { Bell, Search, Globe, Wifi, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import { AnimatePresence } from 'framer-motion';

const ROLE_BRAND = {
  admin: {
    gradient: 'from-rose-500 to-orange-500',
    glow: 'hover:shadow-rose-500/20',
  },
  manager: {
    gradient: 'from-violet-500 to-purple-600',
    glow: 'hover:shadow-violet-500/20',
  },
  security: {
    gradient: 'from-amber-500 to-yellow-500',
    glow: 'hover:shadow-amber-500/20',
  },
  operator: {
    gradient: 'from-brand-500 to-accent-500',
    glow: 'hover:shadow-brand-500/20',
  },
};

export default function TopBar({ title, subtitle }) {
  const [time, setTime] = useState(new Date());
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const role = user?.role || 'operator';
  const brand = ROLE_BRAND[role] || ROLE_BRAND.operator;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SG';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3
      bg-surface-950/70 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Left - Title */}
      <div>
        <h1 className="text-lg font-bold font-display text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right - Controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search venues, zones, alerts..."
            className="w-64 pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]
              text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-brand-500/40
              focus:bg-white/[0.06] transition-all duration-200"
          />
        </div>

        {/* Status indicators */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">5G Connected</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Globe className="w-3.5 h-3.5 text-accent-400" />
          <span className="text-xs text-white/50">47 Edge Nodes</span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <Clock className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/60 font-mono tabular-nums">
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`relative p-2 rounded-xl border transition-all duration-200 group
              ${isPanelOpen 
                ? 'bg-brand-500/10 border-brand-500/30 text-brand-400 shadow-[0_0_15px_rgba(51,120,255,0.25)]' 
                : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.07] hover:text-white/80'}`}
          >
            <Bell className="w-4 h-4 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-bold
                flex items-center justify-center text-white pulse-dot">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isPanelOpen && (
              <NotificationPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
            )}
          </AnimatePresence>
        </div>

        {/* Avatar & User Details */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-white/85">{user?.name || 'Operations Operator'}</p>
            <p className="text-[9px] text-white/45 capitalize">{user?.role || 'operator'}</p>
          </div>
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${brand.gradient}
            flex items-center justify-center text-xs font-bold text-white cursor-pointer
            hover:shadow-lg ${brand.glow} transition-all duration-200`}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
