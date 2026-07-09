import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Timer, ShieldCheck, AlertTriangle, Star, Server, Shield, Bus,
  TrendingUp, Activity, ArrowUpRight, UserCog, BarChart3, Eye, Siren,
  UtensilsCrossed, Map, Radio, DollarSign
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import StadiumHeatmap from '../components/StadiumHeatmap';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ── Role-specific dashboard config ─────────────────────────────────────────
const ROLE_CONFIG = {
  admin: {
    title: 'Command Center',
    subtitle: 'Full system access — MetLife Stadium • FIFA WC 2026',
    gradient: 'from-rose-500 to-orange-500',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
    border: 'border-rose-500/20',
    quick: [
      { label: 'User Management', icon: UserCog, to: '/admin-panel', color: 'text-rose-400' },
      { label: 'System Analytics', icon: BarChart3, to: '/analytics', color: 'text-violet-400' },
      { label: 'Broadcast Control', icon: Radio, to: '/broadcast', color: 'text-sky-400' },
      { label: 'Security Overview', icon: Shield, to: '/security', color: 'text-amber-400' },
    ],
  },
  manager: {
    title: 'Operations Dashboard',
    subtitle: 'Revenue & KPI monitoring — MetLife Stadium • FIFA WC 2026',
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.2)]',
    border: 'border-violet-500/20',
    quick: [
      { label: 'Revenue & KPIs', icon: TrendingUp, to: '/analytics', color: 'text-violet-400' },
      { label: 'Concessions Sales', icon: DollarSign, to: '/concessions', color: 'text-emerald-400' },
      { label: 'Crowd Flow', icon: Users, to: '/crowd', color: 'text-brand-400' },
      { label: 'Announcements', icon: Radio, to: '/broadcast', color: 'text-sky-400' },
    ],
  },
  security: {
    title: 'Threat Dashboard',
    subtitle: 'Real-time security monitoring — MetLife Stadium • FIFA WC 2026',
    gradient: 'from-amber-500 to-yellow-500',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    border: 'border-amber-500/20',
    quick: [
      { label: 'Incident Control', icon: ShieldCheck, to: '/security', color: 'text-amber-400' },
      { label: 'Zone Surveillance', icon: Eye, to: '/crowd', color: 'text-rose-400' },
      { label: 'Venue Map', icon: Map, to: '/digital-twin', color: 'text-brand-400' },
      { label: 'Emergency Alerts', icon: Siren, to: '/broadcast', color: 'text-rose-500' },
    ],
  },
  operator: {
    title: 'Live Dashboard',
    subtitle: 'Real-time operations — MetLife Stadium • FIFA WC 2026',
    gradient: 'from-brand-500 to-accent-500',
    glow: 'shadow-[0_0_30px_rgba(51,120,255,0.2)]',
    border: 'border-brand-500/20',
    quick: [
      { label: 'Digital Twin', icon: Map, to: '/digital-twin', color: 'text-brand-400' },
      { label: 'Crowd Management', icon: Users, to: '/crowd', color: 'text-accent-400' },
      { label: 'Concessions', icon: UtensilsCrossed, to: '/concessions', color: 'text-emerald-400' },
      { label: 'Broadcast', icon: Radio, to: '/broadcast', color: 'text-sky-400' },
    ],
  },
};

const getVenueId = () => localStorage.getItem('sg_active_venue_id') || 'metlife';

export default function Dashboard() {
  const VENUE_ID = getVenueId();
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'operator';
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.operator;
  const [kpis, setKpis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOthers = async () => {
      try {
        const [alertsRes, timeRes, occRes, heatRes] = await Promise.all([
          api.getVenueAlerts(VENUE_ID),
          api.getVenueTimeseries(VENUE_ID, 24),
          api.getVenueOccupancy(VENUE_ID),
          api.getVenueHeatmap(VENUE_ID),
        ]);
        setAlerts(alertsRes.alerts);
        setTimeData(timeRes.timeseries);
        setOccupancy(occRes.occupancy);
        setHeatmap(heatRes.heatmap);
      } catch (err) {
        console.error('Dashboard fetch others error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOthers();
    const interval = setInterval(fetchOthers, 10000);

    // SSE connection for KPIs
    const token = localStorage.getItem('sg_token');
    const sseUrl = `${api.baseUrl}/venues/${VENUE_ID}/live-kpis?token=${token}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setKpis(data);
      } catch (err) {
        console.error('Error parsing live KPIs:', err);
      }
    };

    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card rounded-lg px-3 py-2 text-xs border border-white/10">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar title={config.title} subtitle={config.subtitle} />
        <div className="p-6 space-y-6">
          {/* Welcome Banner Skeleton */}
          <div className="h-28 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 animate-pulse flex items-center justify-between">
            <div className="space-y-2.5 flex-1">
              <div className="h-3 w-36 bg-white/[0.04] rounded-md" />
              <div className="h-5 w-64 bg-white/[0.04] rounded-md" />
              <div className="h-3.5 w-80 bg-white/[0.04] rounded-md" />
            </div>
            <div className="w-48 h-10 bg-white/[0.04] rounded-xl flex-shrink-0 hidden md:block" />
          </div>

          {/* Stats Row Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-16 bg-white/[0.04] rounded-md" />
                  <div className="h-3 w-24 bg-white/[0.04] rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 h-96 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 animate-pulse" />
            <div className="h-96 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar title={config.title} subtitle={config.subtitle} />

      <div className="p-6 space-y-6">
        {/* Role Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`relative overflow-hidden rounded-2xl border ${config.border} ${config.glow} p-5`}
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-5`} />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-1">Welcome back, {user?.name?.split(' ')[0]}</p>
              <h2 className="text-lg font-bold text-white">{config.title}</h2>
              <p className="text-sm text-white/50 mt-0.5">{config.subtitle}</p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              {config.quick.map(({ label, icon: Icon, to, color }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 group"
                >
                  <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[10px] text-white/50 whitespace-nowrap">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Fans In-Venue" value={kpis?.totalFans?.toLocaleString() ?? '—'} color="brand" delay={0} trend="up" trendValue="+1,240 last 15m" />
          <StatCard icon={Timer} label="Avg Queue Time" value={kpis?.avgQueueTime ?? '—'} unit="min" color="accent" delay={0.05} trend="down" trendValue="-0.8 min" />
          <StatCard icon={ShieldCheck} label="Incidents Resolved" value={kpis?.incidentsResolved ?? '—'} color="emerald" delay={0.1} trend="up" trendValue="+3 today" />
          <StatCard icon={AlertTriangle} label="Active Alerts" value={kpis?.activeAlerts ?? '—'} color={kpis?.activeAlerts > 3 ? 'rose' : 'amber'} delay={0.15} />
        </div>

        {/* Second row KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Star} label="Fan Satisfaction" value={kpis?.fanSatisfaction ?? '—'} unit="/5.0" color="amber" delay={0.2} trend="up" trendValue="+0.2 vs last match" />
          <StatCard icon={Server} label="Edge Node Uptime" value={kpis?.edgeNodeUptime ?? '—'} unit="%" color="emerald" delay={0.25} />
          <StatCard icon={Shield} label="Security Events" value={kpis?.securityEvents ?? '—'} color="rose" delay={0.3} />
          <StatCard icon={Bus} label="Transport Capacity" value={kpis?.transportCapacity ?? '—'} unit="%" color="accent" delay={0.35} trend="stable" trendValue="Nominal" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Area - 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white/90">Real-Time Telemetry</h3>
                <p className="text-xs text-white/40 mt-0.5">Live venue metrics — 5-minute intervals</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Live</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="gradCrowd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3378ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3378ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradGate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="crowdDensity" name="Crowd Density %" stroke="#3378ff" fill="url(#gradCrowd)" strokeWidth={2} />
                <Area type="monotone" dataKey="gateFlow" name="Gate Flow/min" stroke="#22d3ee" fill="url(#gradGate)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Alerts - 1 col */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/90">Active Alerts</h3>
              <span className="text-xs text-white/30">{alerts.length} alerts</span>
            </div>
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {alerts.length > 0 ? alerts.map((alert, i) => (
                <AlertCard key={alert.id || i} alert={alert} index={i} />
              )) : (
                <p className="text-xs text-white/30 text-center py-8">No active alerts</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white/90">Crowd Density Heatmap</h3>
                <p className="text-xs text-white/40 mt-0.5">Live occupancy visualization</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/30">
                <TrendingUp className="w-3 h-3" />
                Updated 5s ago
              </div>
            </div>
            {heatmap.length > 0 && <StadiumHeatmap data={heatmap} />}
          </motion.div>

          {/* Zone Occupancy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white/90">Zone Occupancy</h3>
                <p className="text-xs text-white/40 mt-0.5">Current fan distribution by zone</p>
              </div>
              <button className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                View All <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            {occupancy.length > 0 && (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={occupancy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="zone" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="occupancy" name="Occupancy %" radius={[6, 6, 0, 0]}>
                      {occupancy.map((entry, index) => (
                        <Cell key={index} fill={entry.occupancy > 80 ? '#f43f5e' : entry.occupancy > 65 ? '#f59e0b' : '#3378ff'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Zone table */}
                <div className="mt-4 space-y-2">
                  {occupancy.slice(0, 4).map((z, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${z.occupancy > 80 ? 'bg-rose-500' : z.occupancy > 65 ? 'bg-amber-500' : 'bg-brand-500'}`} />
                        <span className="text-xs text-white/70 font-medium">Zone {z.zone}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-white/40">{z.current?.toLocaleString()} / {z.capacity?.toLocaleString()}</span>
                        <span className={`text-xs font-semibold ${z.occupancy > 80 ? 'text-rose-400' : z.occupancy > 65 ? 'text-amber-400' : 'text-brand-400'}`}>
                          {z.occupancy}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
