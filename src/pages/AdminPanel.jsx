import { useState, useEffect } from 'react';
import {
  Users, Shield, Activity, UserCheck, UserX, Trash2,
  RefreshCw, Search, ChevronDown, BarChart3, Clock,
  AlertTriangle, CheckCircle, Eye, Lock, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

// ── Mock audit log data ─────────────────────────────────────────────────────
const AUDIT_LOG = [
  { id: 1, time: '17:52:01', user: 'Security User', action: 'Created Incident INC-2026-0848', level: 'info' },
  { id: 2, time: '17:51:44', user: 'Manager User', action: 'Exported analytics report', level: 'info' },
  { id: 3, time: '17:50:12', user: 'Operator User', action: 'Activated Gate C express lane', level: 'warning' },
  { id: 4, time: '17:49:30', user: 'Admin User', action: 'Updated venue settings for MetLife', level: 'info' },
  { id: 5, time: '17:48:55', user: 'Security User', action: 'Resolved Incident INC-2026-0841', level: 'success' },
  { id: 6, time: '17:47:22', user: 'Manager User', action: 'Modified concession pricing', level: 'warning' },
  { id: 7, time: '17:46:10', user: 'Admin User', action: 'Created new user account (operator)', level: 'info' },
  { id: 8, time: '17:44:03', user: 'Operator User', action: 'Sent emergency broadcast to all zones', level: 'critical' },
];

const SYSTEM_HEALTH = [
  { label: 'API Server', status: 'online', uptime: '99.98%', latency: '12ms' },
  { label: 'Database', status: 'online', uptime: '100%', latency: '3ms' },
  { label: 'AI Engine', status: 'online', uptime: '99.7%', latency: '48ms' },
  { label: 'SSE Stream', status: 'online', uptime: '99.9%', latency: '8ms' },
  { label: 'Broadcast PA', status: 'online', uptime: '100%', latency: '2ms' },
  { label: 'Camera Grid', status: 'degraded', uptime: '97.2%', latency: '65ms' },
];

const ROLE_COLORS = {
  admin: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
  manager: 'text-violet-400 bg-violet-500/15 border-violet-500/30',
  security: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  operator: 'text-brand-400 bg-brand-500/15 border-brand-500/30',
};

const LEVEL_COLORS = {
  info: 'text-sky-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-rose-400',
};

const USER_ROLE_GRADIENTS = {
  admin: 'from-rose-500 to-orange-500',
  manager: 'from-violet-500 to-purple-600',
  security: 'from-amber-500 to-yellow-500',
  operator: 'from-brand-500 to-accent-500',
};

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Guard: admin only
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

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

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
              <Shield className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white font-display">Admin Control Panel</h1>
              <p className="text-sm text-white/40">User management • Audit logs • System health</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
          <span className="text-rose-300 text-xs font-medium uppercase tracking-wider">Admin Access</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'from-brand-500 to-accent-500' },
          { label: 'Admins', value: roleCount('admin'), icon: Shield, color: 'from-rose-500 to-orange-500' },
          { label: 'Managers', value: roleCount('manager'), icon: BarChart3, color: 'from-violet-500 to-purple-600' },
          { label: 'Security', value: roleCount('security'), icon: Eye, color: 'from-amber-500 to-yellow-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/40">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* User Table */}
        <div className="col-span-2 glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">All Users</h2>
            <button onClick={() => window.location.reload()} className="p-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-rose-500/50"
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-rose-500/50"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="security">Security</option>
              <option value="operator">Operator</option>
            </select>
          </div>

          {loading ? (
            <div className="space-y-2 max-h-[340px] pr-1 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-4 w-32 bg-white/[0.04] rounded-md" />
                    <div className="h-3 w-48 bg-white/[0.04] rounded-md" />
                  </div>
                  <div className="w-20 h-6 bg-white/[0.04] rounded-md flex-shrink-0" />
                  <div className="w-8 h-8 bg-white/[0.04] rounded-md flex-shrink-0 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-auto max-h-[340px] space-y-2 pr-1">
              {filtered.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-colors">
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-8 h-8 rounded-xl object-cover flex-shrink-0 border border-white/[0.08]"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${USER_ROLE_GRADIENTS[u.role] || 'from-white/20 to-white/10'} 
                      flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm border border-white/[0.04]`}>
                      {(u.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{u.name}</p>
                    <p className="text-xs text-white/30 truncate">{u.email}</p>
                  </div>
                  
                  <select
                    value={u.role}
                    disabled={u.id === user?.id}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border cursor-pointer focus:outline-none bg-surface-900 
                      disabled:cursor-not-allowed disabled:opacity-60 transition-all ${ROLE_COLORS[u.role] || 'text-white/40 border-white/10'}`}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="security">Security</option>
                    <option value="operator">Operator</option>
                  </select>

                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
                      <Lock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user?.id}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/30 hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title={u.id === user?.id ? "You cannot delete yourself" : "Delete User"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-white/30 text-sm">No users match your search.</div>
              )}
            </div>
          )}
        </div>

        {/* System Health */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> System Health
          </h2>
          <div className="space-y-2">
            {SYSTEM_HEALTH.map(({ label, status, uptime, latency }) => (
              <div key={label} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'} ${status === 'online' ? 'animate-pulse' : ''}`} />
                  <span className="text-sm text-white/70">{label}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/50">{uptime}</p>
                  <p className="text-[10px] text-white/30">{latency}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>5/6 services fully operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="glass-card p-5 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/50" /> System Audit Log
        </h2>
        <div className="space-y-1.5">
          {AUDIT_LOG.map(({ id, time, user: u, action, level }) => (
            <div key={id} className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-colors">
              <span className="text-xs text-white/30 font-mono w-16 flex-shrink-0">{time}</span>
              <span className="text-xs font-medium text-white/60 w-32 flex-shrink-0 truncate">{u}</span>
              <span className="flex-1 text-xs text-white/50 truncate">{action}</span>
              <span className={`text-[10px] font-bold uppercase ${LEVEL_COLORS[level]}`}>{level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
