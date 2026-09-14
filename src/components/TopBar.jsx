import { Bell, Search, Globe, Clock, Shield, TrendingUp, ShieldAlert, Zap, X, Menu, Radio } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/useAuth';
import { useNotifications } from '../context/useNotifications';
import NotificationPanel from './NotificationPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ROLE_BRAND = {
  admin: {
    accentText: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    icon: Shield,
    label: 'ADMIN',
  },
  manager: {
    accentText: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    icon: TrendingUp,
    label: 'MANAGER',
  },
  security: {
    accentText: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: ShieldAlert,
    label: 'SECURITY',
  },
  operator: {
    accentText: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: Zap,
    label: 'OPERATIONS',
  },
};

export default function TopBar({ title, subtitle }) {
  const [time, setTime] = useState(new Date());
  const { user, logout, openMobileSidebar } = useAuth();
  const { unreadCount } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [radioActive, setRadioActive] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const role = user?.role || 'operator';
  const brand = ROLE_BRAND[role] || ROLE_BRAND.operator;
  const RoleIcon = brand.icon;

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SG';

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-5 py-2.5 bg-[#07090d]/90 backdrop-blur-xl border-b border-white/[0.07] transition-all">
      {/* Left - Hamburger & Page Title Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={openMobileSidebar}
          className="md:hidden text-white/70 hover:text-white p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] active:scale-95 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot-green" />
              LIVE
            </span>
            <h1 className="text-sm sm:text-base font-bold font-display text-white tracking-tight leading-tight truncate">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[11px] text-white/45 mt-0.5 truncate font-sans">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right - Global Command Center Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search venue telemetry, zones, alerts..."
            className="w-56 lg:w-72 pl-8 pr-7 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white/80 placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-all font-sans"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-white/30 bg-white/[0.05] px-1 py-0.5 rounded border border-white/10">
            ⌘K
          </kbd>
        </div>

        {/* Telemetry Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.07]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot-green" />
          <span className="text-[10px] font-mono text-white/75 font-semibold tracking-wider">
            5G SA <span className="text-emerald-400">99.98%</span>
          </span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.07]">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-mono text-white/75 font-semibold">
            47 NODES SYNCED
          </span>
        </div>

        {/* Radio Comms Quick Channel */}
        <button
          onClick={() => {
            setRadioActive(!radioActive);
          }}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 border ${
            radioActive
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Toggle Tactical Radio Comms (Channel 4)"
          aria-label="Tactical radio communications toggle"
        >
          <Radio className={`w-3.5 h-3.5 ${radioActive ? 'text-rose-400 animate-pulse' : 'text-white/40'}`} />
          <span className="text-[11px]">{radioActive ? 'CH 4 LIVE' : 'COMMS'}</span>
        </button>

        {/* Tactical Clock */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07]">
          <Clock className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/90 font-mono font-bold tabular-nums">
            {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            id="notification-bell-btn"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            aria-label="View notifications"
            className={`relative p-2 rounded-lg border transition-all duration-150 group ${
              isPanelOpen
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_14px_rgba(34,197,94,0.25)]'
                : 'bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.07] hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-rose-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white font-mono pulse-dot-red">
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

        {/* User Profile Dropdown Pill */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(prev => !prev)}
            aria-label="User profile options"
            className="flex items-center gap-2 p-1 pl-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all text-left group"
          >
            <div className="hidden sm:block text-right">
              <p className="topbar-profile-name text-xs font-semibold text-white/90 group-hover:text-white leading-tight">
                {user?.name || 'Operations Operator'}
              </p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <RoleIcon className={`w-2.5 h-2.5 ${brand.accentText}`} />
                <span className="topbar-profile-role text-[9px] font-mono uppercase tracking-wider text-white/40 leading-none">
                  {brand.label}
                </span>
              </div>
            </div>

            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-md object-cover border border-white/10"
              />
            ) : (
              <div className="w-7 h-7 rounded-md bg-white/[0.07] border border-white/10 flex items-center justify-center text-[11px] font-mono font-bold text-white">
                {initials}
              </div>
            )}
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 bg-[#0a0d14]/98 backdrop-blur-2xl rounded-xl border border-white/[0.09] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[60] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-bold">
                    Operator Identity
                  </span>
                  <button onClick={() => setIsProfileOpen(false)} className="p-1 rounded text-white/40 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-sm font-mono font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-white/40 font-mono truncate">{user?.email || 'operator@stadium.io'}</p>
                  </div>
                </div>

                <div className="space-y-1.5 py-2 text-xs font-mono border-t border-b border-white/[0.06]">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">Role:</span>
                    <span className="text-white/80 font-bold uppercase">{user?.role || 'operator'}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot-green" />
                      ON DUTY
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">Console:</span>
                    <span className="text-white/60">Node-East-44</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="btn-secondary text-[11px] py-1.5"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate('/login', { replace: true });
                    }}
                    className="btn-danger text-[11px] py-1.5"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
