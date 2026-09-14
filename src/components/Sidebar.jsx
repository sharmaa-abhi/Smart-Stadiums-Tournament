import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, ShieldAlert, MessageSquareText, Users,
  UtensilsCrossed, Radio, BarChart3, Settings, Zap, ChevronLeft,
  ChevronRight, LogOut, UserCog, TrendingUp,
  Building2, Eye, Siren, DollarSign, Shield, Activity, Ticket,
  Terminal
} from 'lucide-react';

import { useAuth } from '../context/useAuth';
import UserProfilePopup from './UserProfilePopup';

// ── Navigation configuration per role ──
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
    { to: '/admin-panel', icon: UserCog, label: 'User Management', desc: 'Roles & accounts' },
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
    { to: '/admin-panel', icon: UserCog, label: 'User Management', desc: 'Roles & accounts' },
    { to: '/security', icon: ShieldAlert, label: 'Incident Control', desc: 'Active incidents' },
    { to: '/crowd', icon: Eye, label: 'Zone Surveillance', desc: 'Crowd monitoring' },
    { to: '/digital-twin', icon: Map, label: 'Venue Map', desc: 'Zones & hotspots' },
    { to: '/broadcast', icon: Siren, label: 'Emergency Alerts', desc: 'PA & alerts' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI Threat Advisor', desc: 'Security AI' },
    { to: '/settings', icon: Settings, label: 'My Settings', desc: 'Profile & prefs' },
  ],
  operator: [
    { to: '/', icon: LayoutDashboard, label: 'Live Dashboard', desc: 'Real-time KPIs' },
    { to: '/admin-panel', icon: UserCog, label: 'User Management', desc: 'Roles & accounts' },
    { to: '/digital-twin', icon: Map, label: 'Digital Twin', desc: '3D venue model' },
    { to: '/crowd', icon: Users, label: 'Crowd Management', desc: 'Flow & density' },
    { to: '/concessions', icon: UtensilsCrossed, label: 'Concessions', desc: 'Queue tracking' },
    { to: '/broadcast', icon: Radio, label: 'Broadcast', desc: 'Announcements' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI Assistant', desc: 'Operations AI' },
    { to: '/fan', icon: Ticket, label: 'Fan Portal', desc: 'Fan-facing app' },
    { to: '/settings', icon: Settings, label: 'Settings', desc: 'Profile & prefs' },
  ],
};

const ROLE_BRAND = {
  admin: {
    accentBg: 'bg-rose-500/15',
    accentText: 'text-rose-400',
    border: 'border-rose-500/30',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    label: 'ADMIN',
    icon: Shield,
  },
  manager: {
    accentBg: 'bg-violet-500/15',
    accentText: 'text-violet-400',
    border: 'border-violet-500/30',
    badge: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    label: 'MANAGER',
    icon: TrendingUp,
  },
  security: {
    accentBg: 'bg-amber-500/15',
    accentText: 'text-amber-400',
    border: 'border-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    label: 'SECURITY',
    icon: ShieldAlert,
  },
  operator: {
    accentBg: 'bg-emerald-500/15',
    accentText: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    label: 'OPERATOR',
    icon: Zap,
  },
};

export default function Sidebar() {
  const { user, logout, sidebarCollapsed: collapsed, toggleSidebar, isProfileOpen, openProfile, closeProfile, mobileSidebarOpen, closeMobileSidebar } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'operator';
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.operator;
  const brand = ROLE_BRAND[role] || ROLE_BRAND.operator;

  const handleLogout = () => {
    closeMobileSidebar();
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-250 ease-out
          ${collapsed ? 'w-[68px]' : 'w-[252px]'}
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          bg-[#07090d] border-r border-white/[0.07] select-none`}
      >
        {/* Modern Clean Command Center Logo */}
        <div className="flex items-center justify-between px-3.5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Minimal Technical Emblem */}
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 relative group">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot-green absolute -top-0.5 -right-0.5" />
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>

            {(!collapsed || mobileSidebarOpen) && (
              <div className="overflow-hidden min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black font-display tracking-tight text-white whitespace-nowrap">
                    STADIUM<span className="text-emerald-400">GENIUS</span>
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase tracking-wider border ${brand.badge}`}>
                    {brand.label}
                  </span>
                  <span className="text-[9px] font-mono text-white/40 tracking-tighter">
                    FIFA'26 • V2.4
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobileSidebar}
            className="md:hidden text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06]"
            aria-label="Close menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          {navItems.map(({ to, icon: Icon, label, desc }) => (
            <NavLink
              key={`${role}-${to}`}
              to={to}
              end={to === '/'}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150
                ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 shadow-[inset_0_1px_0_rgba(74,222,128,0.2)]'
                    : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                }
                ${collapsed && !mobileSidebarOpen ? 'justify-center px-0' : ''}`
              }
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${collapsed && !mobileSidebarOpen ? '' : ''}`} />
              {(!collapsed || mobileSidebarOpen) && (
                <div className="overflow-hidden min-w-0">
                  <span className="block whitespace-nowrap leading-snug">{label}</span>
                  <span className="block text-[10px] text-white/30 leading-none whitespace-nowrap font-mono mt-0.5">{desc}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section: Profile + Actions */}
        <div className="p-2 border-t border-white/[0.07] space-y-1">
          {user && (!collapsed || mobileSidebarOpen) && (
            <button
              onClick={() => { closeMobileSidebar(); openProfile(); }}
              className="flex items-center gap-2.5 p-2 w-full rounded-lg hover:bg-white/[0.05] transition-colors text-left group border border-transparent hover:border-white/[0.06]"
              aria-label="Open User Profile"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-md object-cover flex-shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center text-[11px] font-mono font-bold text-white flex-shrink-0">
                  {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/85 truncate group-hover:text-white leading-tight">{user.name}</p>
                <p className="text-[10px] text-white/35 truncate font-mono">{user.email}</p>
              </div>
            </button>
          )}

          {user && collapsed && !mobileSidebarOpen && (
            <div className="flex justify-center py-1">
              <button
                onClick={openProfile}
                title="View Profile"
                aria-label="View Profile"
                className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/10 flex items-center justify-center text-[11px] font-mono font-bold text-white hover:border-emerald-400"
              >
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1 pt-1">
            <button
              onClick={handleLogout}
              aria-label="Logout"
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 transition-all ${
                collapsed && !mobileSidebarOpen ? 'col-span-2 justify-center' : ''
              }`}
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              {(!collapsed || mobileSidebarOpen) && <span className="font-mono text-[11px]">Logout</span>}
            </button>

            <button
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`hidden md:flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-white/35 hover:text-white/70 hover:bg-white/[0.04] transition-all justify-center ${
                collapsed ? 'col-span-2' : ''
              }`}
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <>
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px]">Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      <UserProfilePopup isOpen={isProfileOpen} onClose={closeProfile} />
    </>
  );
}
