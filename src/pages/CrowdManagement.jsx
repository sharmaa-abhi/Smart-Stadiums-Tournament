import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, ArrowUpRight, ArrowDownRight, AlertTriangle,
  CheckCircle2, Clock, MapPin, Navigation, UserCheck
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar
} from 'recharts';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import api from '../lib/api';
import { useAuth } from '../context/useAuth';
import { CrowdManagementSkeleton } from '../components/skeleton';

export default function CrowdManagement() {
  const { activeVenueId } = useAuth();
  const [occupancy, setOccupancy] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [occRes, timeRes] = await Promise.all([
          api.getVenueOccupancy(activeVenueId),
          api.getVenueTimeseries(activeVenueId, 30),
        ]);
        setOccupancy(occRes.occupancy || []);
        setTimeData(timeRes.timeseries || []);
      } catch (err) {
        console.error('Failed to fetch crowd management data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, [activeVenueId]);

  if (loading) {
    return <CrowdManagementSkeleton />;
  }

  const totalFans = occupancy.reduce((sum, z) => sum + z.current, 0);
  const totalCapacity = occupancy.reduce((sum, z) => sum + z.capacity, 0);
  const overallOccupancy = totalCapacity > 0 ? ((totalFans / totalCapacity) * 100).toFixed(1) : '0.0';

  const radialData = occupancy.slice(0, 6).map((z) => ({
    name: `Zone ${z.zone}`,
    value: z.occupancy,
    fill: z.occupancy > 80 ? '#f43f5e' : z.occupancy > 65 ? '#f59e0b' : '#22c55e',
  }));

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

  const predictions = [
    { time: '+5 min', density: '78%', trend: 'rising', action: 'Monitor Zone B corridor' },
    { time: '+15 min', density: '85%', trend: 'rising', action: 'Consider opening Gate C overflow' },
    { time: '+30 min', density: '72%', trend: 'stabilizing', action: 'Half-time exit flow begins' },
    { time: '+60 min', density: '45%', trend: 'declining', action: 'Normal operations resume' },
  ];

  return (
    <div className="min-h-screen pb-12">
      <TopBar title="Crowd Flow & Predictive Analytics" subtitle="Real-time density distribution and ingress load balancing" />

      <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <StatCard
            icon={Users}
            label="Total In-Venue"
            value={totalFans.toLocaleString()}
            color="brand"
            delay={0}
            trend="up"
            trendValue="+890 / 15m"
          />
          <StatCard
            icon={TrendingUp}
            label="Overall Occupancy"
            value={overallOccupancy}
            unit="%"
            color={parseFloat(overallOccupancy) > 80 ? 'rose' : 'accent'}
            delay={0.04}
          />
          <StatCard
            icon={Navigation}
            label="Dynamic Reroutes"
            value="3"
            color="amber"
            delay={0.08}
            contextNote="Active bypass paths"
          />
          <StatCard
            icon={UserCheck}
            label="Stewards Deployed"
            value="247"
            color="emerald"
            delay={0.12}
            trend="up"
            trendValue="+12 assigned"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Density Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="lg:col-span-2 glass-card rounded-xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                  Crowd Density Forecast vs Telemetry
                </h3>
                <p className="text-[11px] text-white/40 mt-0.5 font-sans">
                  Real-time turnstile ingress load compared with historical projection
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                AI PROJECTION ACTIVE
              </span>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="crowdDensity" name="Actual Density" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="concessionQueue" name="Queue Buffer" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Radial Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
            className="glass-card rounded-xl p-4 sm:p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/[0.06]">
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                  Zone Ingress Distribution
                </h3>
                <span className="text-[10px] font-mono text-white/40">Sectors 1-6</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <RadialBarChart innerRadius="25%" outerRadius="95%" data={radialData} startAngle={180} endAngle={0}>
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.02)' }} dataKey="value" cornerRadius={6} />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/[0.05]">
              {radialData.map((d, i) => (
                <div key={i} className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.fill }} />
                  <span className="text-white/60 truncate">{d.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Predictions Table */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.25 }}
            className="glass-card rounded-xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                  Next 60-Minute Density Projection
                </h3>
              </div>
              <span className="text-[10px] font-mono text-white/40">ML Engine v4</span>
            </div>
            <div className="space-y-2">
              {predictions.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs">
                  <div className="w-14 font-mono font-bold text-cyan-400 text-[11px]">
                    {p.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 font-mono">
                      <span className="font-bold text-white/90">{p.density}</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        p.trend === 'rising' ? 'text-rose-400' : p.trend === 'declining' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {p.trend === 'rising' ? '▲ Rising' : p.trend === 'declining' ? '▼ Declining' : '▶ Stable'}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/45 truncate">{p.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Zone Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.3 }}
            className="glass-card rounded-xl p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                Zone Operational Directives
              </h3>
              <span className="text-[10px] font-mono text-white/40">{occupancy.length} Zones Live</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {occupancy.map((zone, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 ${zone.occupancy > 80 ? 'text-rose-400' : zone.occupancy > 65 ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <span className="font-bold text-white/85">Zone {zone.zone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${zone.occupancy > 80 ? 'text-rose-400' : zone.occupancy > 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {zone.occupancy}%
                      </span>
                      {zone.occupancy > 80 ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">ALERT</span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">NOMINAL</span>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      style={{ width: `${zone.occupancy}%` }}
                      className={`h-full rounded-full ${
                        zone.occupancy > 80 ? 'bg-rose-500' : zone.occupancy > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-white/35">
                    <span>{zone.current.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                    <span>{zone.trend === 'rising' ? '↑ Increasing Ingress' : '→ Steady Flow'}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
