import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Timer, ShieldCheck, AlertTriangle, Star, Server, Shield, Bus,
  TrendingUp, Activity, ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import StadiumHeatmap from '../components/StadiumHeatmap';
import api from '../lib/api';

const VENUE_ID = 'metlife';

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [kpisRes, alertsRes, timeRes, occRes, heatRes] = await Promise.all([
        api.getVenueKPIs(VENUE_ID),
        api.getVenueAlerts(VENUE_ID),
        api.getVenueTimeseries(VENUE_ID, 24),
        api.getVenueOccupancy(VENUE_ID),
        api.getVenueHeatmap(VENUE_ID),
      ]);
      setKpis(kpisRes.kpis);
      setAlerts(alertsRes.alerts);
      setTimeData(timeRes.timeseries);
      setOccupancy(occRes.occupancy);
      setHeatmap(heatRes.heatmap);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // Live update every 5 seconds
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Operations Dashboard" subtitle="MetLife Stadium — FIFA World Cup 2026 • Match Day Live" />

      <div className="p-6 space-y-6">
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
