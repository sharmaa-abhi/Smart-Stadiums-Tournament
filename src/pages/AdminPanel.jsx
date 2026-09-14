import { useState, useEffect } from 'react';
import {
  Users, Shield, RefreshCw, Search, BarChart3, Eye,
  ChevronDown, Trash2, Activity, CheckCircle, Clock
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import api from '../lib/api';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import { AdminPanelSkeleton } from '../components/skeleton';

const AUDIT_LOG = [
  { id: 1, time: '17:52:01', user: 'Security Officer', action: 'Created Incident INC-2026-0848 (Turnstile sensor)', level: 'info' },
  { id: 2, time: '17:51:44', user: 'Operations Manager', action: 'Exported concession analytics telemetry report', level: 'info' },
  { id: 3, time: '17:50:12', user: 'Field Operator', action: 'Activated Gate C optical overflow corridor', level: 'warning' },
  { id: 4, time: '17:49:30', user: 'System Admin', action: 'Updated security thresholds for MetLife Zone 3', level: 'info' },
  { id: 5, time: '17:48:55', user: 'Security Officer', action: 'Resolved Incident INC-2026-0841', level: 'success' },
  { id: 6, time: '17:47:22', user: 'Operations Manager', action: 'Synced mobile POS queue buffer parameters', level: 'warning' },
  { id: 7, time: '17:46:10', user: 'System Admin', action: 'Provisioned role permissions for Operator unit', level: 'info' },
  { id: 8, time: '17:44:03', user: 'Field Operator', action: 'PA announcement broadcast to North Perimeter', level: 'critical' },
];

const SYSTEM_HEALTH = [
  { label: 'Core API Gateway', status: 'online', uptime: '99.98%', latency: '12ms' },
  { label: 'Primary Telemetry DB', status: 'online', uptime: '100%', latency: '3ms' },
  { label: 'Multimodal AI Engine', status: 'online', uptime: '99.7%', latency: '48ms' },
  { label: 'Realtime SSE Stream', status: 'online', uptime: '99.9%', latency: '8ms' },
  { label: 'Tactical Audio Comms', status: 'online', uptime: '100%', latency: '2ms' },
  { label: 'Camera Optical Feeds', status: 'degraded', uptime: '97.2%', latency: '65ms' },
];

const ROLE_COLORS = {
  admin: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
  manager: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
  security: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  operator: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
};

const LEVEL_COLORS = {
  info: 'text-cyan-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-rose-400',
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    api.request('/users/all')
      .then(d => setUsers(d.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const roleCount = role => users.filter(u => u.role === role).length;

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.request(`/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.message || 'Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.request(`/users/${userId}`, {
        method: 'DELETE',
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return <AdminPanelSkeleton />;
  }

  return (
    <div className="min-h-screen pb-12">
      <TopBar title="User & Access Governance" subtitle="System administration, role elevation & audit logs" />

      <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <StatCard
            icon={Users}
            label="Total Personnel"
            value={users.length}
            color="brand"
            delay={0}
            trend="up"
            trendValue="+2 this week"
          />
          <StatCard
            icon={Shield}
            label="Admins Provisioned"
            value={roleCount('admin')}
            color="rose"
            delay={0.04}
            contextNote="Superuser scope"
          />
          <StatCard
            icon={BarChart3}
            label="Operations Managers"
            value={roleCount('manager')}
            color="accent"
            delay={0.08}
            contextNote="Manager scope"
          />
          <StatCard
            icon={Eye}
            label="Security Officers"
            value={roleCount('security')}
            color="amber"
            delay={0.12}
            contextNote="Active field patrol"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* User Management Table */}
          <div className="lg:col-span-2 glass-card rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                  Personnel Accounts & Role Delegation
                </h2>
                <p className="text-[11px] text-white/40 mt-0.5 font-sans">
                  Manage authenticated operator access tokens and security permissions
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/50 hover:text-white transition-colors"
                title="Refresh Table"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filters Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter personnel by name or email..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 font-sans"
                />
              </div>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/70 focus:outline-none focus:border-emerald-500/50 font-mono cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="security">Security</option>
                <option value="operator">Operator</option>
              </select>
            </div>

            {/* Table Rows */}
            <div className="overflow-auto max-h-[380px] space-y-1.5 pr-1">
              {filtered.map(u => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-colors"
                >
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-7 h-7 rounded-md object-cover flex-shrink-0 border border-white/[0.08]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.06] flex items-center justify-center text-[10px] font-mono font-bold text-white flex-shrink-0">
                      {(u.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate font-sans">{u.name}</p>
                    <p className="text-[10px] text-white/35 truncate font-mono">{u.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === user?.id}
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border appearance-none pr-6 cursor-pointer focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                          ROLE_COLORS[u.role] || ROLE_COLORS.operator
                        }`}
                      >
                        <option value="operator">Operator</option>
                        <option value="security">Security</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/40" />
                    </div>

                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user?.id}
                      className="p-1 rounded text-white/25 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title={u.id === user?.id ? "Cannot delete self" : "Delete User"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-white/30 text-xs font-mono">
                  No personnel match search parameters.
                </div>
              )}
            </div>
          </div>

          {/* System Health Overview */}
          <div className="glass-card rounded-xl p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                    Platform Telemetry Health
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">99.98% OK</span>
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {SYSTEM_HEALTH.map(({ label, status, uptime, latency }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="text-white/70 text-[11px] font-sans">{label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white/50 text-[10px] mr-2">{uptime}</span>
                      <span className="text-emerald-400 font-bold text-[10px]">{latency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-emerald-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>5/6 Services Operational</span>
              </span>
              <span className="text-white/30 text-[10px]">Zero Downtime</span>
            </div>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="glass-card rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/40" />
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                Immutable System Audit Trail
              </h2>
            </div>
            <span className="text-[10px] font-mono text-white/40">RFC 5424 Log Compliance</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {AUDIT_LOG.map(({ id, time, user: u, action, level }) => (
              <div
                key={id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px]"
              >
                <span className="text-white/30 w-16 flex-shrink-0">{time}</span>
                <span className="font-semibold text-white/70 w-36 flex-shrink-0 truncate font-sans">{u}</span>
                <span className="flex-1 text-white/50 truncate">{action}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${LEVEL_COLORS[level]}`}>
                  {level}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
