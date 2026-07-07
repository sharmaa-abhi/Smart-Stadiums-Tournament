import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  ShieldAlert,
  MessageSquareText,
  Users,
  UtensilsCrossed,
  Radio,
  BarChart3,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/digital-twin', icon: Map, label: 'Digital Twin' },
  { to: '/crowd', icon: Users, label: 'Crowd Management' },
  { to: '/security', icon: ShieldAlert, label: 'Security & Safety' },
  { to: '/concessions', icon: UtensilsCrossed, label: 'Concessions' },
  { to: '/assistant', icon: MessageSquareText, label: 'AI Assistant' },
  { to: '/broadcast', icon: Radio, label: 'Broadcast' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        bg-surface-950/80 backdrop-blur-xl border-r border-white/[0.06]`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center glow-brand">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full pulse-dot border-2 border-surface-950" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold font-display tracking-tight text-white whitespace-nowrap">
              Stadium<span className="text-gradient">Genius</span>
            </h1>
            <p className="text-[10px] text-white/40 tracking-wider uppercase">FIFA WC 2026</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-brand-500/15 text-brand-400 shadow-[inset_0_0_0_1px_rgba(51,120,255,0.2)]'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
              }
              ${collapsed ? 'justify-center' : ''}`
            }
          >
            <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors`} />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/[0.06] pt-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${isActive
              ? 'bg-brand-500/15 text-brand-400'
              : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
            }
            ${collapsed ? 'justify-center' : ''}`
          }
        >
          <Settings className="w-[18px] h-[18px]" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full
            text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all duration-200"
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
