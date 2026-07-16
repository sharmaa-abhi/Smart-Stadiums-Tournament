import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, ShieldAlert, MessageSquareText, Users,
  UtensilsCrossed, Radio, BarChart3, Settings, Zap, ChevronLeft,
  ChevronRight, LogOut, UserCog, TrendingUp,
  Building2, Eye, Siren, DollarSign, Shield, Activity, Ticket,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

// ── Unique nav items per role ──────────────────────────────────────────────
const NAV_BY_ROLE = {
  admin: [
    { to: '/', icon: LayoutDashboard, label: 'Command Center', desc: 'System overview' },
    { to: '/admin-panel', icon: UserCog, label: 'User Management', desc: 'Roles & accounts' },
    { to: '/analytics', icon: BarChart3, label: 'System Analytics', desc: 'Full KPI reports' },
    { to: '/broadcast', icon: Radio, label: 'Broadcast Control', desc: 'All channels' },
    { to: '/settings', icon: Building2, label: 'Venue Settings', desc: 'Config & policies' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI Command', desc: 'AI insights' },
    { to: '/fan', icon: Ticket, label: 'Fan Portal', desc: 'Fan-facing app' },
  ],
  manager: [
    { to: '/', icon: LayoutDashboard, label: 'Ops Dashboard', desc: 'Live operations' },
    { to: '/analytics', icon: TrendingUp, label: 'Revenue & KPIs', desc: 'Financial metrics' },
    { to: '/concessions', icon: DollarSign, label: 'Concessions', desc: 'Sales & queues' },
    { to: '/crowd', icon: Users, label: 'Crowd Flow', desc: 'Capacity planning' },
    { to: '/broadcast', icon: Radio, label: 'Announcements', desc: 'Staff broadcasts' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI Advisor', desc: 'Operational AI' },
    { to: '/fan', icon: Ticket, label: 'Fan Portal', desc: 'Fan-facing app' },
    { to: '/settings', icon: Settings, label: 'My Settings', desc: 'Profile & prefs' },
  ],
  security: [
    { to: '/', icon: Activity, label: 'Threat Dashboard', desc: 'Live security feed' },
    { to: '/security', icon: ShieldAlert, label: 'Incident Control', desc: 'Active incidents' },
    { to: '/crowd', icon: Eye, label: 'Zone Surveillance', desc: 'Crowd monitoring' },
    { to: '/digital-twin', icon: Map, label: 'Venue Map', desc: 'Zones & hotspots' },
    { to: '/broadcast', icon: Siren, label: 'Emergency Alerts', desc: 'PA & alerts' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI Threat Advisor', desc: 'Security AI' },
    { to: '/settings', icon: Settings, label: 'My Settings', desc: 'Profile & prefs' },
  ],
  operator: [
    { to: '/', icon: LayoutDashboard, label: 'Live Dashboard', desc: 'Real-time KPIs' },
    { to: '/digital-twin', icon: Map, label: 'Digital Twin', desc: '3D venue model' },
    { to: '/crowd', icon: Users, label: 'Crowd Management', desc: 'Flow & density' },
    { to: '/concessions', icon: UtensilsCrossed, label: 'Concessions', desc: 'Queue tracking' },
    { to: '/broadcast', icon: Radio, label: 'Broadcast', desc: 'Announcements' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI Assistant', desc: 'Operations AI' },
    { to: '/fan', icon: Ticket, label: 'Fan Portal', desc: 'Fan-facing app' },
    { to: '/settings', icon: Settings, label: 'Settings', desc: 'Profile & prefs' },
  ],
};


// ── Role branding ──────────────────────────────────────────────────────────
const ROLE_BRAND = {
  admin: {
    gradient: 'from-rose-500 to-orange-500',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    label: 'Administrator',
    icon: Shield,
  },
  manager: {
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    label: 'Manager',
    icon: TrendingUp,
  },
  security: {
    gradient: 'from-amber-500 to-yellow-500',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    label: 'Security Officer',
    icon: ShieldAlert,
  },
  operator: {
    gradient: 'from-brand-500 to-accent-500',
    glow: 'shadow-[0_0_20px_rgba(51,120,255,0.4)]',
    badge: 'bg-brand-500/20 text-brand-300 border-brand-500/30',
    label: 'Operator',
    icon: Zap,
  },
};

// ── Active link color per role ─────────────────────────────────────────────
const ACTIVE_STYLE = {
  admin: 'bg-rose-500/15 text-rose-400 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.25)]',
  manager: 'bg-violet-500/15 text-violet-400 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.25)]',
  security: 'bg-amber-500/15 text-amber-400 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.25)]',
  operator: 'bg-brand-500/15 text-brand-400 shadow-[inset_0_0_0_1px_rgba(51,120,255,0.2)]',
};

export default function Sidebar() {
  const { user, logout, sidebarCollapsed: collapsed, toggleSidebar } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'operator';
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.operator;
  const brand = ROLE_BRAND[role] || ROLE_BRAND.operator;
  const activeStyle = ACTIVE_STYLE[role] || ACTIVE_STYLE.operator;
  const RoleIcon = brand.icon;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        bg-surface-950/80 backdrop-blur-xl border-r border-white/[0.06]`}
    >
      {/* Logo + Role Badge */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="relative flex-shrink-0">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center ${brand.glow}`}>
            <RoleIcon className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full pulse-dot border-2 border-surface-950" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold font-display tracking-tight text-white whitespace-nowrap">
              Stadium<span className="text-gradient">Genius</span>
            </h1>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${brand.badge}`}>
              {brand.label}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, desc }) => (
          <NavLink
            key={`${role}-${to}`}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive ? activeStyle : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'}
              ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon className="w-[18px] h-[18px] flex-shrink-0 transition-colors" />
            {!collapsed && (
              <div className="overflow-hidden">
                <span className="block whitespace-nowrap leading-tight">{label}</span>
                <span className="block text-[10px] text-white/30 leading-tight whitespace-nowrap">{desc}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — User info + Logout */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/[0.06] pt-3">
        {user && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-xl object-cover flex-shrink-0 border border-white/[0.08]"
              />
            ) : (
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white/80 truncate">{user.name}</p>
              <p className="text-[10px] text-white/30 capitalize">{brand.label}</p>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center py-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-xl object-cover border border-white/[0.08]"
              />
            ) : (
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center text-xs font-bold text-white`}>
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full
            text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-all duration-200
            ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full
            text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all duration-200
            ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? (
            <ChevronRight className="w-[18px] h-[18px] mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-[18px] h-[18px]" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
