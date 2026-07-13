import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed, TrendingUp, DollarSign, Clock, Users,
  ShoppingBag, Coffee, Beer, ChefHat, Zap, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import api from '../lib/api';
import { ConcessionsSkeleton } from '../components/skeleton';

const COLORS = ['#3378ff', '#22d3ee', '#34d399', '#f59e0b', '#f43f5e', '#a78bfa'];

const revenueData = [
  { time: '12:00', revenue: 12400 },
  { time: '12:30', revenue: 18700 },
  { time: '13:00', revenue: 24300 },
  { time: '13:30', revenue: 31200 },
  { time: '14:00', revenue: 38500 },
  { time: '14:30', revenue: 42100 },
  { time: '15:00', revenue: 35800 },
  { time: '15:30', revenue: 28400 },
];

const categoryBreakdown = [
  { name: 'Food', value: 42, icon: ChefHat },
  { name: 'Beer & Drinks', value: 31, icon: Beer },
  { name: 'Coffee', value: 12, icon: Coffee },
  { name: 'Merchandise', value: 15, icon: ShoppingBag },
];

const topItems = [
  { name: 'Stadium Burger Combo', sales: 2847, revenue: '$42,705', trend: '+12%' },
  { name: 'Craft Beer (Pint)', sales: 2234, revenue: '$33,510', trend: '+8%' },
  { name: 'Hot Dog Classic', sales: 1956, revenue: '$19,560', trend: '+15%' },
  { name: 'Nachos Supreme', sales: 1678, revenue: '$20,136', trend: '+5%' },
  { name: 'Water Bottle', sales: 1543, revenue: '$7,715', trend: '+22%' },
  { name: 'Team Jersey', sales: 412, revenue: '$32,960', trend: '+3%' },
];

export default function Concessions() {
  const [concessions, setConcessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConcessions = async () => {
    try {
      const res = await api.getVenueConcessions('metlife');
      setConcessions(res.concessions || []);
    } catch (err) {
      console.error('Failed to fetch concessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcessions();
    const interval = setInterval(fetchConcessions, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <ConcessionsSkeleton />;
  }

  const totalRevenue = concessions.reduce((sum, c) => sum + c.revenue, 0);
  const avgWaitAll = concessions.length > 0
    ? (concessions.reduce((sum, c) => sum + parseFloat(c.avgWait), 0) / concessions.length).toFixed(1)
    : '0.0';

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass-card rounded-lg px-3 py-2 text-xs border border-white/10">
        <p className="text-white/60 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {typeof p.value === 'number' && p.name?.includes('Revenue') ? `$${p.value.toLocaleString()}` : p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Concessions & POS" subtitle="Real-time sales analytics, queue management & demand optimization" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={`$${(totalRevenue).toLocaleString()}`} color="emerald" delay={0} trend="up" trendValue="+$12,400/hr" />
          <StatCard icon={Clock} label="Avg Queue Wait" value={avgWaitAll} unit="min" color="accent" delay={0.05} trend="down" trendValue="-1.2 min" />
          <StatCard icon={ShoppingBag} label="Transactions Today" value="14,293" color="brand" delay={0.1} trend="up" trendValue="+890/hr" />
          <StatCard icon={Zap} label="Express Lanes Active" value="8" color="amber" delay={0.15} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white/90">Revenue Trend</h3>
                <p className="text-xs text-white/40 mt-0.5">Real-time cumulative sales</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">+18.3% vs last match</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#34d399" strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ r: 3, fill: '#34d399' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/90 mb-4">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {categoryBreakdown.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                      <Icon className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-xs text-white/60">{cat.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-white/80">{cat.value}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* POS Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/90">Point-of-Sale Status</h3>
              <span className="text-xs text-white/30">{concessions.length} locations</span>
            </div>
            <div className="space-y-3">
              {concessions.map((pos, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className={`w-3.5 h-3.5 ${pos.status === 'high-demand' ? 'text-amber-400' : 'text-emerald-400'}`} />
                      <span className="text-sm font-medium text-white/80">{pos.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase
                      ${pos.status === 'high-demand' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {pos.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-[9px] text-white/30 uppercase">Queue</p>
                      <p className={`text-sm font-bold ${pos.queueLength > 25 ? 'text-amber-400' : 'text-white/80'}`}>{pos.queueLength}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-white/30 uppercase">Wait</p>
                      <p className={`text-sm font-bold ${parseFloat(pos.avgWait) > 8 ? 'text-rose-400' : 'text-white/80'}`}>{pos.avgWait}m</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-white/30 uppercase">Revenue</p>
                      <p className="text-sm font-bold text-emerald-400">${(pos.revenue / 1000).toFixed(1)}k</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Top Selling Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/90">Top Selling Items</h3>
              <button className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                View All <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {topItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-400">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">{item.name}</p>
                    <p className="text-[10px] text-white/30">{item.sales.toLocaleString()} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-400">{item.revenue}</p>
                    <p className="text-[10px] text-emerald-400/60">{item.trend}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
