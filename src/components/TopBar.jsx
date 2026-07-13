import { Bell, Search, Globe, Wifi, Clock, Shield, TrendingUp, ShieldAlert, Zap, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ROLE_BRAND = {
  admin: {
    gradient: 'from-rose-500 to-orange-500',
    glow: 'hover:shadow-rose-500/20',
    icon: Shield,
    iconColor: 'text-rose-400',
  },
  manager: {
    gradient: 'from-violet-500 to-purple-600',
    glow: 'hover:shadow-violet-500/20',
    icon: TrendingUp,
    iconColor: 'text-violet-400',
  },
  security: {
    gradient: 'from-amber-500 to-yellow-500',
    glow: 'hover:shadow-amber-500/20',
    icon: ShieldAlert,
    iconColor: 'text-amber-400',
  },
  operator: {
    gradient: 'from-brand-500 to-accent-500',
    glow: 'hover:shadow-brand-500/20',
    icon: Zap,
    iconColor: 'text-brand-400',
  },
};

export default function TopBar({ title, subtitle }) {
  const [time, setTime] = useState(new Date());
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
    // Use mousedown with capture phase or verify targets
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="hidden sm:block text-right">
              <p className="topbar-profile-name text-xs font-semibold text-white/85 group-hover:text-white transition-colors">{user?.name || 'Operations Operator'}</p>
              <div className="flex items-center gap-1.5 justify-end mt-0.5">
                <RoleIcon className={`w-3 h-3 ${brand.iconColor}`} />
                <p className="topbar-profile-role text-[10px] text-white/45 capitalize leading-none">{user?.role || 'operator'}</p>
              </div>
            </div>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-xl object-cover border border-white/[0.08] hover:shadow-lg transition-all duration-200"
              />
            ) : (
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${brand.gradient}
                flex items-center justify-center text-xs font-bold text-white
                hover:shadow-lg ${brand.glow} transition-all duration-200`}>
                {initials}
              </div>
            )}
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-72 bg-surface-900/98 backdrop-blur-2xl rounded-2xl border border-white/[0.08] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[60] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Profile Overview</span>
                  <button onClick={() => setIsProfileOpen(false)} className="p-1 rounded-lg hover:bg-white/[0.04] text-white/40 hover:text-white/60">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-xl object-cover border border-white/[0.08]" />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center text-sm font-bold text-white`}>
                      {initials}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-white/30 truncate capitalize font-semibold">{user?.role || 'operator'}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-white/[0.06] pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40">Email:</span>
                    <span className="text-white/70 truncate max-w-[160px]">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Status:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active On Duty
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Last Login:</span>
                    <span className="text-white/50 font-mono text-[10px]">Today, 18:10</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white transition-all"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white transition-all"
                  >
                    Settings
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                    navigate('/login', { replace: true });
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-400 transition-all"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
