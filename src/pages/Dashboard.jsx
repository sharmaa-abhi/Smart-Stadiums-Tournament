import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Timer, ShieldCheck, AlertTriangle, Star, Server, Shield, Bus,
  TrendingUp, Activity, ArrowUpRight, UserCog, BarChart3, Eye, Siren,
  UtensilsCrossed, Map, Radio, DollarSign, Filter, CheckCircle2, ChevronRight
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
import { useAuth } from '../context/useAuth';
import { DashboardSkeleton } from '../components/skeleton';

// ── Role-specific dashboard config ─────────────────────────────────────────
const ROLE_CONFIG = {
  admin: {
    title: 'Command Center',
    subtitle: 'System Root Console — MetLife Stadium • FIFA WC 2026',
    border: 'border-white/[0.08]',
    quick: [
      { label: 'User Management', icon: UserCog, to: '/admin-panel' },
      { label: 'System Analytics', icon: BarChart3, to: '/analytics' },
      { label: 'Broadcast Control', icon: Radio, to: '/broadcast' },
      { label: 'Security Overview', icon: Shield, to: '/security' },
    ],
  },
  manager: {
    title: 'Operations Dashboard',
    subtitle: 'Revenue & Venue Monitoring — MetLife Stadium • FIFA WC 2026',
    border: 'border-white/[0.08]',
    quick: [
      { label: 'Revenue & KPIs', icon: TrendingUp, to: '/analytics' },
      { label: 'Concessions Sales', icon: DollarSign, to: '/concessions' },
      { label: 'Crowd Flow', icon: Users, to: '/crowd' },
      { label: 'Announcements', icon: Radio, to: '/broadcast' },
    ],
  },
  security: {
    title: 'Threat Dashboard',
    subtitle: 'Real-time Security Telemetry — MetLife Stadium • FIFA WC 2026',
    border: 'border-white/[0.08]',
    quick: [
      { label: 'Incident Control', icon: ShieldCheck, to: '/security' },
      { label: 'Zone Surveillance', icon: Eye, to: '/crowd' },
      { label: 'Venue Map', icon: Map, to: '/digital-twin' },
      { label: 'Emergency Alerts', icon: Siren, to: '/broadcast' },
    ],
  },
  operator: {
    title: 'Live Command Console',
    subtitle: 'Real-time Operations & Telemetry — MetLife Stadium • FIFA WC 2026',
    border: 'border-white/[0.08]',
    quick: [
      { label: 'Digital Twin', icon: Map, to: '/digital-twin' },
      { label: 'Crowd Management', icon: Users, to: '/crowd' },
      { label: 'Concessions', icon: UtensilsCrossed, to: '/concessions' },
      { label: 'Broadcast', icon: Radio, to: '/broadcast' },
    ],
  },
};

export default function Dashboard() {
  const { user, activeVenueId } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'operator';
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.operator;
  const [kpis, setKpis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('telemetry');

  useEffect(() => {
    const fetchOthers = async () => {
      try {
        const [alertsRes, timeRes, occRes, heatRes] = await Promise.all([
          api.getVenueAlerts(activeVenueId),
          api.getVenueTimeseries(activeVenueId, 24),
          api.getVenueOccupancy(activeVenueId),
          api.getVenueHeatmap(activeVenueId),
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
    const sseUrl = `${api.baseUrl}/venues/${activeVenueId}/live-kpis`;
    const sseController = new AbortController();

    async function connectKpiSSE() {
      try {
        const response = await fetch(sseUrl, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: sseController.signal,
        });
        if (!response.ok) throw new Error('SSE response not ok');
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader');
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                setKpis(data);
              } catch (err) {
                console.error('Error parsing live KPIs:', err);
              }
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setKpis({
            venueId: activeVenueId,
            venueName: 'MetLife Stadium',
            totalFans: 78420,
            avgQueueTime: 4.2,
            incidentsResolved: 18,
            activeAlerts: 2,
            fanSatisfaction: 4.8,
            edgeNodeUptime: 99.98,
            securityEvents: 3,
            transportCapacity: 88,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    connectKpiSSE();

    return () => {
      clearInterval(interval);
      sseController.abort();
    };
  }, [activeVenueId]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[#0a0d14] border border-white/10 rounded-lg p-2.5 text-xs shadow-xl font-mono">
        <p className="text-white/40 mb-1 font-sans">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return <DashboardSkeleton title={config.title} subtitle={config.subtitle} />;
  }

  return (
    <div className="min-h-screen pb-12">
      <TopBar title={config.title} subtitle={config.subtitle} />

      <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto">
        {/* Status / Context Control Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0a0d14]/80 border border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot-green" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-white/50 font-bold">Venue Status:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">ACTIVE MATCHPLAY</span>
                <span className="text-white/20">•</span>
                <span className="text-xs text-white/60 font-mono">Quarter-Final 2 (MetLife)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {config.quick.map(({ label, icon: Icon, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="btn-secondary text-xs py-1.5 px-2.5 cursor-pointer font-mono"
              >
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard
            icon={Users}
            label="Total Fans In-Venue"
            value={kpis?.totalFans?.toLocaleString() ?? '78,420'}
            color="brand"
            delay={0}
            trend="up"
            trendValue="+1,240 vs last hr"
          />
          <StatCard
            icon={Timer}
            label="Avg Gate Wait Time"
            value={kpis?.avgQueueTime ?? '4.2'}
            unit="min"
            color="accent"
            delay={0.03}
            trend="down"
            trendValue="-0.8 min flow"
          />
          <StatCard
            icon={ShieldCheck}
            label="Incidents Resolved"
            value={kpis?.incidentsResolved ?? '18'}
            color="emerald"
            delay={0.06}
            trend="up"
            trendValue="+3 this half"
          />
          <StatCard
            icon={AlertTriangle}
            label="Active Alert Queue"
            value={kpis?.activeAlerts ?? '2'}
            color={kpis?.activeAlerts > 3 ? 'rose' : 'amber'}
            delay={0.09}
            contextNote={kpis?.activeAlerts > 0 ? '2 high priority alerts' : 'Queue clear'}
          />
        </div>

        {/* Secondary Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <StatCard
            icon={Star}
            label="Fan CSAT Rating"
            value={kpis?.fanSatisfaction ?? '4.8'}
            unit="/5.0"
            color="amber"
            delay={0.12}
            trend="up"
            trendValue="+0.2 rating"
          />
          <StatCard
            icon={Server}
            label="Edge Node Uptime"
            value={kpis?.edgeNodeUptime ?? '99.98'}
            unit="%"
            color="emerald"
            delay={0.15}
            contextNote="47/47 nodes online"
          />
          <StatCard
            icon={Shield}
            label="Security Intercepts"
            value={kpis?.securityEvents ?? '3'}
            color="rose"
            delay={0.18}
            contextNote="Turnstile gate blocks"
          />
          <StatCard
            icon={Bus}
            label="Transit Flow Capacity"
            value={kpis?.transportCapacity ?? '88'}
            unit="%"
            color="accent"
            delay={0.21}
            trend="stable"
            trendValue="Nominal flow"
          />
        </div>

        {/* Main Command Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Telemetry Graph Panel (2 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
            className="lg:col-span-2 glass-card rounded-xl p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                    Venue Telemetry & Throughput
                  </h3>
                  <span className="badge-live text-[9px] px-2 py-0.5 rounded">
                    LIVE STREAM
                  </span>
                </div>
                <p className="text-[11px] text-white/40 mt-0.5 font-sans">
                  Real-time turnstile ingress velocity vs concourse density
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/40">5m frequency</span>
                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>SYNCHRONIZED</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timeData}>
                <defs>
                  <linearGradient id="gradDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="crowdDensity" name="Crowd Density %" stroke="#22c55e" fill="url(#gradDensity)" strokeWidth={2} />
                <Area type="monotone" dataKey="gateFlow" name="Gate Flow / min" stroke="#06b6d4" fill="url(#gradFlow)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.05] text-[11px] font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Crowd Density
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Gate Flow Velocity
                </span>
              </div>
              <span className="text-white/40">Latency: 14ms</span>
            </div>
          </motion.div>

          {/* Active Alerts Feed (1 Col) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
            className="glass-card rounded-xl p-4 sm:p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-display uppercase tracking-wider text-white">
                    Critical Alert Queue
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/35">
                    {alerts.length}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/security')}
                  className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                >
                  Triage Panel <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {alerts.length > 0 ? (
                  alerts.map((alert, i) => (
                    <AlertCard key={alert.id || i} alert={alert} index={i} />
                  ))
                ) : (
                  <div className="text-center py-10 text-white/30 text-xs font-mono">
                    All telemetry alert queues clear.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>Auto-dispatch enabled</span>
              <span className="text-emerald-400 font-semibold">AI Assistant ON</span>
            </div>
          </motion.div>
        </div>

        {/* Secondary Row: Heatmap & Zone Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Crowd Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.3 }}
            className="glass-card rounded-xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                  Stadium Sector Density Heatmap
                </h3>
                <p className="text-[11px] text-white/40 mt-0.5 font-sans">
                  Optical & mmWave sensor array distribution
                </p>
              </div>
              <span className="text-[10px] font-mono text-white/40">Refresh: 5s</span>
            </div>
            {heatmap.length > 0 && <StadiumHeatmap data={heatmap} />}
          </motion.div>

          {/* Zone Occupancy */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.35 }}
            className="glass-card rounded-xl p-4 sm:p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                    Zone Capacity Allocation
                  </h3>
                  <p className="text-[11px] text-white/40 mt-0.5 font-sans">
                    Current occupancy vs safe egress limit
                  </p>
                </div>
                <button
                  onClick={() => navigate('/crowd')}
                  className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                >
                  Crowd Flow <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              {occupancy.length > 0 && (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={occupancy}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="zone" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="occupancy" name="Occupancy %" radius={[4, 4, 0, 0]}>
                        {occupancy.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={entry.occupancy > 80 ? '#f43f5e' : entry.occupancy > 65 ? '#f59e0b' : '#22c55e'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-3 space-y-1.5">
                    {occupancy.slice(0, 4).map((z, i) => (
                      <div key={i} className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-white/[0.02] text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              z.occupancy > 80 ? 'bg-rose-500' : z.occupancy > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="text-white/80">Zone {z.zone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white/40 text-[11px]">
                            {z.current?.toLocaleString()} / {z.capacity?.toLocaleString()}
                          </span>
                          <span
                            className={`font-bold ${
                              z.occupancy > 80 ? 'text-rose-400' : z.occupancy > 65 ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {z.occupancy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
