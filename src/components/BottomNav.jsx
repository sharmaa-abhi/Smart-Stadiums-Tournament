import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquareText, ShieldAlert, Users, Ticket, Settings, UserCog, TrendingUp, Map, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const BOTTOM_NAV_BY_ROLE = {
  admin: [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin-panel', icon: UserCog, label: 'Users' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI' },
    { to: '/fan', icon: Ticket, label: 'Fan Portal' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ],
  manager: [
    { to: '/', icon: LayoutDashboard, label: 'Ops' },
    { to: '/analytics', icon: TrendingUp, label: 'KPIs' },
    { to: '/crowd', icon: Users, label: 'Crowd' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI Advisor' },
    { to: '/fan', icon: Ticket, label: 'Fan Portal' },
  ],
  security: [
    { to: '/', icon: LayoutDashboard, label: 'Threats' },
    { to: '/security', icon: ShieldAlert, label: 'Incidents' },
    { to: '/crowd', icon: Users, label: 'Surveillance' },
    { to: '/digital-twin', icon: Map, label: 'Venue' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI' },
  ],
  operator: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/digital-twin', icon: Map, label: 'Digital Twin' },
    { to: '/crowd', icon: Users, label: 'Crowd' },
    { to: '/concessions', icon: UtensilsCrossed, label: 'Food' },
    { to: '/assistant', icon: MessageSquareText, label: 'AI' },
  ],
};

export default function BottomNav() {
  const { user } = useAuth();
  const role = user?.role || 'operator';
  const navItems = BOTTOM_NAV_BY_ROLE[role] || BOTTOM_NAV_BY_ROLE.operator;

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070a18]/95 backdrop-blur-2xl border-t border-cyan-500/20 px-2 py-1.5 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-[56px] min-h-[44px] ${
              isActive
                ? 'text-cyan-300 font-bold bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-white/45 hover:text-white/80 active:scale-95'
            }`
          }
        >
          <Icon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-tight truncate max-w-[64px]">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
