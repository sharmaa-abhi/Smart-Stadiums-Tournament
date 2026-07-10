import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, ArrowUpRight, ArrowDownRight, AlertTriangle,
  CheckCircle2, Clock, MapPin, Navigation, UserCheck
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from 'recharts';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import api from '../lib/api';

export default function CrowdManagement() {
  const [occupancy, setOccupancy] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [occRes, timeRes] = await Promise.all([
        api.getVenueOccupancy('metlife'),
        api.getVenueTimeseries('metlife', 30),
      ]);
      setOccupancy(occRes.occupancy || []);
      setTimeData(timeRes.timeseries || []);
    } catch (err) {
      console.error('Failed to fetch crowd management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Crowd & Resource Management" subtitle="Predictive analytics & real-time flow optimization" />
        <div className="p-6 space-y-6">
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-16 bg-white/[0.04] rounded-md" />
                  <div className="h-3.5 w-24 bg-white/[0.04] rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="lg:col-span-2 h-96 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5" />
            <div className="h-96 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5" />
          </div>
        </div>
      </div>
    );
  }

  const totalFans = occupancy.reduce((sum, z) => sum + z.current, 0);
  const totalCapacity = occupancy.reduce((sum, z) => sum + z.capacity, 0);
  const overallOccupancy = totalCapacity > 0 ? ((totalFans / totalCapacity) * 100).toFixed(1) : '0.0';

  const radialData = occupancy.slice(0, 6).map((z, i) => ({
    name: `Zone ${z.zone}`,
    value: z.occupancy,
    fill: z.occupancy > 80 ? '#f43f5e' : z.occupancy > 65 ? '#f59e0b' : '#3378ff',
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card rounded-lg px-3 py-2 text-xs border border-white/10">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
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
    <div className="min-h-screen">
      <TopBar title="Crowd & Resource Management" subtitle="Predictive analytics & real-time flow optimization" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total In-Venue" value={totalFans.toLocaleString()} color="brand" delay={0} trend="up" trendValue="+890 / 15min" />
          <StatCard icon={TrendingUp} label="Overall Occupancy" value={overallOccupancy} unit="%" color={parseFloat(overallOccupancy) > 80 ? 'rose' : 'accent'} delay={0.05} />
          <StatCard icon={Navigation} label="Active Re-routes" value="3" color="amber" delay={0.1} />
          <StatCard icon={UserCheck} label="Staff Deployed" value="247" color="emerald" delay={0.15} trend="up" trendValue="+12 reassigned" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Density Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/90 mb-1">Crowd Density Forecast</h3>
            <p className="text-xs text-white/40 mb-4">Predicted vs actual density with ML-powered projections</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeData}>
                <defs>
                  <linearGradient id="gradDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3378ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3378ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="crowdDensity" name="Actual Density" stroke="#3378ff" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="concessionQueue" name="Queue Pressure" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Zone Radial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/90 mb-4">Zone Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart innerRadius="20%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} dataKey="value" cornerRadius={10} />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {radialData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                  <span className="text-[10px] text-white/50">{d.name}: {d.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Predictions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-accent-400" />
              <h3 className="text-sm font-semibold text-white/90">Short-term Predictions</h3>
            </div>
            <div className="space-y-3">
              {predictions.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="w-14 text-center">
                    <span className="text-xs font-bold text-accent-400">{p.time}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white/80">{p.density}</span>
                      {p.trend === 'rising' ? (
                        <ArrowUpRight className="w-3 h-3 text-rose-400" />
                      ) : p.trend === 'declining' ? (
                        <ArrowDownRight className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingUp className="w-3 h-3 text-amber-400" />
                      )}
                      <span className={`text-[10px] uppercase font-medium
                        ${p.trend === 'rising' ? 'text-rose-400' : p.trend === 'declining' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {p.trend}
                      </span>
                    </div>
                    <p className="text-xs text-white/40">{p.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Zone Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/90 mb-4">Zone Status & Recommendations</h3>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {occupancy.map((zone, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-3.5 h-3.5 ${zone.occupancy > 80 ? 'text-rose-400' : zone.occupancy > 65 ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <span className="text-sm font-semibold text-white/80">Zone {zone.zone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${zone.occupancy > 80 ? 'text-rose-400' : zone.occupancy > 65 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {zone.occupancy}%
                      </span>
                      {zone.occupancy > 80 ? (
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${zone.occupancy}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className={`h-full rounded-full ${zone.occupancy > 80 ? 'bg-rose-500' : zone.occupancy > 65 ? 'bg-amber-500' : 'bg-brand-500'}`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-white/30">{zone.current.toLocaleString()} / {zone.capacity.toLocaleString()}</span>
                    <span className={`text-[10px] font-medium ${zone.trend === 'rising' ? 'text-amber-400' : 'text-white/30'}`}>
                      {zone.trend === 'rising' ? '↑ Rising' : '→ Stable'}
                    </span>
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
