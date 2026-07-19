import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Timer, Shield, Star, Bus, Target, Calendar, Award, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell
} from 'recharts';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { AnalyticsSkeleton } from '../components/skeleton';

const kpiCards = [
  { icon: Timer, label: 'Queue Time Reduction', value: '-47%', baseline: '4.8 min → 2.5 min', trend: 'down', color: 'accent' },
  { icon: Shield, label: 'Incident Response', value: '-67%', baseline: '45s → 15s avg', trend: 'down', color: 'emerald' },
  { icon: Users, label: 'Auto-resolved Events', value: '84%', baseline: '47 of 56 incidents', trend: 'up', color: 'brand' },
  { icon: Star, label: 'Fan NPS Score', value: '4.8/5.0', baseline: '+0.7 vs baseline', trend: 'up', color: 'amber' },
  { icon: Bus, label: 'Transport Efficiency', value: '+32%', baseline: 'Post-match exit improved', trend: 'up', color: 'accent' },
  { icon: Target, label: 'AI Prediction Accuracy', value: '94.2%', baseline: 'Crowd density models', trend: 'up', color: 'emerald' },
];

const COLORS = ['#3378ff', '#22d3ee', '#34d399', '#f59e0b', '#f43f5e'];

export default function Analytics() {
  const [trends, setTrends] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalyticsTrends(),
      api.getAnalyticsOverview(),
      api.getAnalyticsPerformance(),
      api.getAnalyticsRevenue(),
    ]).then(([trendsRes, overviewRes, perfRes, revRes]) => {
      setTrends(trendsRes.trends || []);
      setPerformance(perfRes.performance || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Fallback static data for charts that don't have dedicated API endpoints
  const radarData = performance.slice(0, 6).map(p => ({
    metric: p.zone.replace('Zone ', 'Zone '),
    value: p.overallScore,
    fullMark: 100,
  })).length > 0 ? performance.slice(0, 6).map(p => ({ metric: p.zone, value: p.overallScore, fullMark: 100 })) : [
    { metric: 'Crowd Flow', value: 92, fullMark: 100 },
    { metric: 'Safety', value: 95, fullMark: 100 },
    { metric: 'Concessions', value: 88, fullMark: 100 },
    { metric: 'Transport', value: 82, fullMark: 100 },
    { metric: 'Fan Satisfaction', value: 91, fullMark: 100 },
    { metric: 'AI Accuracy', value: 94, fullMark: 100 },
  ];

  const categoryPerformance = performance.slice(0, 5).map(p => ({
    name: p.zone,
    value: p.overallScore,
  })).length > 0 ? performance.slice(0, 5).map(p => ({ name: p.zone, value: p.overallScore })) : [
    { name: 'Crowd Mgmt', value: 92 },
    { name: 'Security', value: 95 },
    { name: 'Concessions', value: 88 },
    { name: 'Transport', value: 82 },
    { name: 'Broadcast', value: 96 },
  ];

  const matchHistory = trends.map(t => ({
    match: t.day,
    crowd: t.attendance,
    incidents: t.incidents,
    avgQueue: (Math.random() * 2 + 2.3).toFixed(1),
    satisfaction: t.satisfaction,
    response: Math.floor(Math.random() * 30 + 15),
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

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Post-Match Analytics" subtitle="Tournament-wide performance metrics & continuous improvement insights" />

      <div className="p-6 space-y-6">
        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/40" />
            <span className="text-sm text-white/60">Performance Period:</span>
            <div className="flex items-center gap-1">
              {['This Match', 'Last 5 Matches', 'Tournament', 'All Venues'].map((period, i) => (
                <button key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${i === 1
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                  }`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400 hover:bg-brand-500/20 transition-all">
            <Award className="w-3 h-3" />
            Generate Report
          </button>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card glass-card-hover rounded-2xl p-4 cursor-default"
              >
                <div className={`w-8 h-8 rounded-xl mb-3 flex items-center justify-center
                  ${kpi.color === 'brand' ? 'bg-brand-500/10' : kpi.color === 'accent' ? 'bg-accent-500/10' :
                    kpi.color === 'emerald' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                  <Icon className={`w-4 h-4
                    ${kpi.color === 'brand' ? 'text-brand-400' : kpi.color === 'accent' ? 'text-accent-400' :
                      kpi.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400'}`} />
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{kpi.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-white tracking-tight">{kpi.value}</span>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                  )}
                </div>
                <p className="text-[10px] text-white/30 mt-1">{kpi.baseline}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match Performance Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white/90">Performance Across Matches</h3>
                <p className="text-xs text-white/40 mt-0.5">Continuous improvement powered by AI learning</p>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Improving trend</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={matchHistory}>
                <defs>
                  <linearGradient id="gradSatisfaction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="match" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="satisfaction" name="Fan Satisfaction" stroke="#34d399" fill="url(#gradSatisfaction)" strokeWidth={2} />
                <Line type="monotone" dataKey="avgQueue" name="Avg Queue (min)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Radar Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/90 mb-4">Operational Excellence Score</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="#3378ff" fill="#3378ff" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <span className="text-3xl font-bold text-gradient">91.2</span>
              <span className="text-sm text-white/40 ml-1">/ 100</span>
              <p className="text-[10px] text-white/30 mt-1">Overall operational score</p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Response Time Improvement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/90 mb-4">Incident Response Time Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={matchHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="match" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} unit="s" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="response" name="Response Time (sec)" radius={[6, 6, 0, 0]} fill="#22d3ee">
                  {matchHistory.map((_, i) => (
                    <Cell key={i} fill={i >= matchHistory.length - 2 ? '#34d399' : '#22d3ee'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/90 mb-4">Category Performance</h3>
            <div className="space-y-4">
              {categoryPerformance.map((cat, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/60 font-medium">{cat.name}</span>
                    <span className={`text-xs font-bold ${cat.value >= 90 ? 'text-emerald-400' : cat.value >= 85 ? 'text-brand-400' : 'text-amber-400'}`}>
                      {cat.value}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.value}%` }}
                      transition={{ duration: 1.2, delay: i * 0.15 + 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">AI-Generated Insight</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Queue times have decreased 47% since tournament start, driven primarily by predictive crowd routing.
                Transport efficiency shows the most room for improvement — recommend expanding shuttle capacity for
                the next match day.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
