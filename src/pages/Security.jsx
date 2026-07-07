import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Eye, AlertTriangle, CheckCircle2, Radio,
  MapPin, Lock, Unlock, Camera, Scan, UserX, Baby,
  ArrowRight, Clock, ChevronRight, Shield, Siren,
  Video, Route, Users, Phone, FileText, X,
  TriangleAlert, Activity, Megaphone, BellRing, Footprints
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import api from '../lib/api';

// ── Security zone data with expanded detail ──
const securityZones = [
  { id: 1, name: 'North Perimeter', status: 'secure', cameras: 32, alerts: 0, level: 'green', patrols: 4, lastSweep: '2 min ago' },
  { id: 2, name: 'East Gate Complex', status: 'elevated', cameras: 24, alerts: 2, level: 'amber', patrols: 6, lastSweep: '1 min ago' },
  { id: 3, name: 'VIP & Media Level', status: 'secure', cameras: 18, alerts: 0, level: 'green', patrols: 3, lastSweep: '4 min ago' },
  { id: 4, name: 'South Concourse', status: 'alert', cameras: 28, alerts: 1, level: 'red', patrols: 8, lastSweep: '30s ago' },
  { id: 5, name: 'West Parking', status: 'secure', cameras: 16, alerts: 0, level: 'green', patrols: 2, lastSweep: '5 min ago' },
  { id: 6, name: 'Field Perimeter', status: 'secure', cameras: 12, alerts: 0, level: 'green', patrols: 4, lastSweep: '1 min ago' },
];

const VENUE_ID = 'metlife';

const accessLog = [
  { time: '15:10:23', event: 'VIP credential scan — authorized', zone: 'VIP-3', type: 'success' },
  { time: '15:09:47', event: 'Staff badge — maintenance crew', zone: 'Service-A', type: 'success' },
  { time: '15:08:12', event: 'Invalid credential — blocked entry', zone: 'VIP-2', type: 'denied' },
  { time: '15:06:55', event: 'Emergency exit opened — alarm triggered', zone: 'Gate-F', type: 'alert' },
  { time: '15:05:31', event: 'Media pass verified — press area', zone: 'Media-1', type: 'success' },
  { time: '15:03:44', event: 'Duplicate ticket detected', zone: 'Gate-A', type: 'denied' },
  { time: '15:01:18', event: 'Contractor badge — catering supply', zone: 'Service-B', type: 'success' },
  { time: '14:59:02', event: 'Expired credential — re-validation needed', zone: 'Gate-C', type: 'denied' },
];

// CCTV camera feeds
const cctvFeeds = [
  { id: 'CAM-N01', name: 'Gate A Entrance', zone: 'North', status: 'active', anomaly: false },
  { id: 'CAM-E03', name: 'East Concourse', zone: 'East', status: 'active', anomaly: true },
  { id: 'CAM-S02', name: 'South Stand L2', zone: 'South', status: 'active', anomaly: false },
  { id: 'CAM-V01', name: 'VIP Lobby', zone: 'VIP', status: 'active', anomaly: false },
  { id: 'CAM-P04', name: 'Parking Lot D', zone: 'West', status: 'active', anomaly: false },
  { id: 'CAM-F01', name: 'Field Tunnel', zone: 'Field', status: 'active', anomaly: false },
  { id: 'CAM-N05', name: 'Gate B Queue', zone: 'North', status: 'active', anomaly: true },
  { id: 'CAM-S06', name: 'Concourse E', zone: 'South', status: 'maintenance', anomaly: false },
];

// Evacuation routes
const evacuationRoutes = [
  { id: 'EVR-1', name: 'North Primary', status: 'clear', capacity: '12,000', estTime: '8 min' },
  { id: 'EVR-2', name: 'East Emergency', status: 'clear', capacity: '8,500', estTime: '6 min' },
  { id: 'EVR-3', name: 'South Main', status: 'partially_blocked', capacity: '10,000', estTime: '12 min' },
  { id: 'EVR-4', name: 'West Parking', status: 'clear', capacity: '15,000', estTime: '10 min' },
  { id: 'EVR-5', name: 'VIP Helipad', status: 'standby', capacity: '200', estTime: '3 min' },
];

// Threat timeline data
function generateThreatTimeline() {
  const data = [];
  for (let i = 12; i >= 0; i--) {
    data.push({
      time: `${14 + Math.floor((12 - i) / 4)}:${String(((12 - i) % 4) * 15).padStart(2, '0')}`,
      threatLevel: Math.floor(Math.random() * 20 + 15),
      anomalies: Math.floor(Math.random() * 5),
      accessDenied: Math.floor(Math.random() * 3),
    });
  }
  return data;
}

export default function Security() {
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [threatData] = useState(generateThreatTimeline());
  const [liveAccessLog, setLiveAccessLog] = useState(accessLog);
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [newIncidentForm, setNewIncidentForm] = useState({ type: '', zone: '', priority: 'medium', description: '' });

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await api.getIncidents(VENUE_ID);
      setIncidents(res.incidents || []);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
    } finally {
      setLoadingIncidents(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  // Simulate live access log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvents = [
        'Badge scan — authorized entry',
        'Facial recognition match — watchlist clear',
        'Turnstile passage — ticket validated',
        'Staff credential verified — operations',
        'Vehicle plate scanned — authorized',
      ];
      const newZones = ['Gate-A', 'Gate-B', 'VIP-1', 'Service-C', 'Parking-D'];
      const newTypes = ['success', 'success', 'success', 'success', 'success'];

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const idx = Math.floor(Math.random() * newEvents.length);

      setLiveAccessLog(prev => [
        { time: timeStr, event: newEvents[idx], zone: newZones[idx], type: newTypes[idx] },
        ...prev.slice(0, 9),
      ]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const levelColors = {
    green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
    red: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-500 pulse-dot' },
  };

  const priorityColors = {
    critical: 'bg-rose-500/20 text-rose-300',
    high: 'bg-amber-500/20 text-amber-300',
    medium: 'bg-brand-500/20 text-brand-300',
  };

  const statusColors = {
    active: 'text-rose-400',
    investigating: 'text-amber-400',
    monitoring: 'text-accent-400',
    resolved: 'text-emerald-400',
  };

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'cctv', label: 'CCTV Grid', icon: Video },
    { id: 'evacuation', label: 'Evacuation', icon: Route },
    { id: 'patrols', label: 'Patrol Tracking', icon: Footprints },
  ];

  return (
    <div className="min-h-screen">
      <TopBar title="Security & Safety Orchestration" subtitle="Real-time anomaly detection, incident management & access control" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Shield} label="Threat Level" value="ELEVATED" color="amber" delay={0} />
          <StatCard icon={Camera} label="Active CCTV Feeds" value="128" color="brand" delay={0.05} trend="stable" trendValue="All nominal" />
          <StatCard icon={Scan} label="Access Scans Today" value="48,293" color="accent" delay={0.1} trend="up" trendValue="+2,140/hr" />
          <StatCard icon={Siren} label="Active Incidents" value={incidents.filter(i => i.status !== 'resolved').length.toString()} color="rose" delay={0.15} />
        </div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                    : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/70'
                  }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}

          <div className="ml-auto">
            <button
              onClick={() => setShowIncidentModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20
              text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-all"
            >
              <Siren className="w-3.5 h-3.5" />
              Report Incident
            </button>
          </div>
        </motion.div>

        {/* ═══ TAB: OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Security Zones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-2 glass-card rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-brand-400" />
                    <h3 className="text-sm font-semibold text-white/90">Security Zones</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {['green', 'amber', 'red'].map(level => (
                      <div key={level} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${levelColors[level].dot}`} />
                        <span className="text-[10px] text-white/40 capitalize">{level === 'green' ? 'Secure' : level === 'amber' ? 'Elevated' : 'Alert'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {securityZones.map((zone, i) => {
                    const lc = levelColors[zone.level];
                    return (
                      <motion.div
                        key={zone.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 + 0.2 }}
                        onClick={() => setSelectedZone(zone)}
                        className={`${lc.bg} border ${lc.border} rounded-xl p-4 cursor-pointer
                          hover:border-opacity-60 transition-all duration-300 group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${lc.dot}`} />
                            <h4 className="text-sm font-semibold text-white/85">{zone.name}</h4>
                          </div>
                          {zone.status === 'secure' ? (
                            <Lock className="w-3.5 h-3.5 text-emerald-400/60" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Camera className="w-3 h-3 text-white/30" />
                            <span className="text-xs text-white/50">{zone.cameras}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Footprints className="w-3 h-3 text-white/30" />
                            <span className="text-xs text-white/50">{zone.patrols} patrols</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className={`w-3 h-3 ${zone.alerts > 0 ? 'text-amber-400' : 'text-white/20'}`} />
                            <span className={`text-xs ${zone.alerts > 0 ? 'text-amber-400 font-semibold' : 'text-white/30'}`}>
                              {zone.alerts} alerts
                            </span>
                          </div>
                          <span className={`ml-auto text-[10px] font-semibold uppercase ${lc.text}`}>{zone.status}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                          <span className="text-[10px] text-white/25">Last sweep: {zone.lastSweep}</span>
                          <ChevronRight className="w-3 h-3 text-white/15 group-hover:text-white/40 transition-colors" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Access Log */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Scan className="w-4 h-4 text-accent-400" />
                    <h3 className="text-sm font-semibold text-white/90">Live Access Log</h3>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10">
                    <Radio className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[9px] text-emerald-400 font-semibold uppercase">Live</span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {liveAccessLog.map((entry, i) => (
                      <motion.div
                        key={entry.time + i}
                        initial={{ opacity: 0, x: -10, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                      >
                        <div className={`w-1.5 h-1.5 mt-1.5 rounded-full flex-shrink-0
                          ${entry.type === 'success' ? 'bg-emerald-500' : entry.type === 'denied' ? 'bg-rose-500' : 'bg-amber-500 pulse-dot'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/70 leading-relaxed">{entry.event}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-white/30 font-mono">{entry.time}</span>
                            <span className="text-[10px] text-white/20">•</span>
                            <span className="text-[10px] text-white/30">{entry.zone}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Threat Timeline Chart + Incident Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Threat Assessment Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white/90">Threat Assessment Timeline</h3>
                  </div>
                  <span className="text-[10px] text-white/30">Last 3 hours</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={threatData}>
                    <defs>
                      <linearGradient id="gradThreat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="time" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="threatLevel" name="Threat Score" stroke="#f59e0b" fill="url(#gradThreat)" strokeWidth={2} />
                    <Area type="monotone" dataKey="anomalies" name="Anomalies" stroke="#f43f5e" fill="none" strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Quick Actions Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card rounded-2xl p-5"
              >
                <h3 className="text-sm font-semibold text-white/90 mb-4">Emergency Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Siren, label: 'Trigger Lockdown', color: 'rose', desc: 'Seal all gates & exits' },
                    { icon: Megaphone, label: 'PA Announcement', color: 'amber', desc: 'Broadcast to all zones' },
                    { icon: Route, label: 'Evacuation Mode', color: 'rose', desc: 'Activate evac routes' },
                    { icon: Phone, label: 'Call Emergency', color: 'brand', desc: 'Contact 911 / Police' },
                    { icon: Users, label: 'Deploy Backup', color: 'accent', desc: 'Request additional teams' },
                    { icon: FileText, label: 'Generate Report', color: 'emerald', desc: 'AI incident summary' },
                  ].map((action, i) => {
                    const ActionIcon = action.icon;
                    return (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.06 + 0.4 }}
                        className={`p-3 rounded-xl border transition-all duration-200 text-left group
                          ${action.color === 'rose' ? 'bg-rose-500/5 border-rose-500/15 hover:bg-rose-500/15' :
                            action.color === 'amber' ? 'bg-amber-500/5 border-amber-500/15 hover:bg-amber-500/15' :
                            action.color === 'brand' ? 'bg-brand-500/5 border-brand-500/15 hover:bg-brand-500/15' :
                            action.color === 'accent' ? 'bg-accent-500/5 border-accent-500/15 hover:bg-accent-500/15' :
                            'bg-emerald-500/5 border-emerald-500/15 hover:bg-emerald-500/15'}`}
                      >
                        <ActionIcon className={`w-4 h-4 mb-2
                          ${action.color === 'rose' ? 'text-rose-400' :
                            action.color === 'amber' ? 'text-amber-400' :
                            action.color === 'brand' ? 'text-brand-400' :
                            action.color === 'accent' ? 'text-accent-400' :
                            'text-emerald-400'}`} />
                        <p className="text-xs font-semibold text-white/80">{action.label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{action.desc}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Incident Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white/90">Incident Management</h3>
                </div>
                <span className="text-xs text-white/30">{incidents.length} total • {incidents.filter(i => i.status !== 'resolved').length} active</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      {['ID', 'Type', 'Zone', 'Time', 'Priority', 'Status', 'Response', 'Assignee', ''].map(h => (
                        <th key={h} className="text-left text-[10px] font-semibold text-white/40 uppercase tracking-wider py-2.5 px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((inc, i) => (
                      <motion.tr
                        key={inc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.06 }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-3 text-xs font-mono text-accent-400">{inc.id}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {inc.type === 'Lost Child' ? <Baby className="w-3.5 h-3.5 text-rose-400" /> :
                             inc.type === 'Unauthorized Access' ? <UserX className="w-3.5 h-3.5 text-amber-400" /> :
                             inc.type === 'Medical Emergency' ? <Activity className="w-3.5 h-3.5 text-rose-400" /> :
                             <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                            <span className="text-xs text-white/80">{inc.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-xs text-white/50">{inc.zone}</td>
                        <td className="py-3 px-3 text-xs text-white/40 font-mono">{inc.time}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${priorityColors[inc.priority]}`}>
                            {inc.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-xs font-medium capitalize ${statusColors[inc.status]}`}>{inc.status}</span>
                        </td>
                        <td className="py-3 px-3 text-xs text-emerald-400 font-mono">{inc.response}</td>
                        <td className="py-3 px-3 text-xs text-white/40">{inc.assignee}</td>
                        <td className="py-3 px-3">
                          <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {/* ═══ TAB: CCTV GRID ═══ */}
        {activeTab === 'cctv' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-semibold text-white/90">Live CCTV Monitoring Grid</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">128 cameras active</span>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10">
                    <Radio className="w-2.5 h-2.5 text-emerald-400" />
                    <span className="text-[9px] text-emerald-400 font-semibold uppercase">All Live</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cctvFeeds.map((cam, i) => (
                  <motion.div
                    key={cam.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className={`relative rounded-xl overflow-hidden cursor-pointer group
                      ${cam.anomaly ? 'ring-2 ring-rose-500/50' : 'ring-1 ring-white/[0.06]'}`}
                  >
                    {/* Simulated camera feed */}
                    <div className={`aspect-video flex items-center justify-center relative
                      ${cam.status === 'maintenance' ? 'bg-surface-800' : 'bg-gradient-to-br from-surface-900 to-surface-800'}`}>
                      <div className="stadium-grid absolute inset-0 opacity-40" />
                      <Camera className={`w-8 h-8 relative z-10 ${cam.status === 'maintenance' ? 'text-white/10' : 'text-white/15'}`} />

                      {/* Anomaly overlay */}
                      {cam.anomaly && (
                        <div className="absolute inset-0 bg-rose-500/5 flex items-center justify-center">
                          <div className="px-2 py-1 rounded bg-rose-500/80 text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                            <TriangleAlert className="w-2.5 h-2.5" />
                            Anomaly Detected
                          </div>
                        </div>
                      )}

                      {/* Live badge */}
                      {cam.status === 'active' && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-[8px] text-white/80 font-bold">REC</span>
                        </div>
                      )}

                      {cam.status === 'maintenance' && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500/20 text-[8px] text-amber-400 font-bold">
                          MAINTENANCE
                        </div>
                      )}

                      {/* Camera ID */}
                      <div className="absolute top-2 right-2 text-[8px] text-white/30 font-mono">{cam.id}</div>
                    </div>

                    {/* Camera info */}
                    <div className="p-2.5 bg-white/[0.02]">
                      <p className="text-xs font-medium text-white/70 truncate">{cam.name}</p>
                      <p className="text-[10px] text-white/30">{cam.zone} Zone</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Anomaly Detection Feed */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-accent-400" />
                <h3 className="text-sm font-semibold text-white/90">AI Anomaly Detection Feed</h3>
              </div>
              <div className="space-y-2">
                {[
                  { time: '15:09', cam: 'CAM-E03', desc: 'Unusual crowd clustering detected — 12 persons stationary for >3 min', conf: '87%', severity: 'medium' },
                  { time: '15:07', cam: 'CAM-N05', desc: 'Rapid density increase — possible queue breakdown at Gate B', conf: '93%', severity: 'high' },
                  { time: '14:58', cam: 'CAM-S02', desc: 'Object left unattended — flagged for review (bag near seat 204-F)', conf: '78%', severity: 'medium' },
                  { time: '14:42', cam: 'CAM-V01', desc: 'Credential mismatch — person identity differs from badge photo', conf: '91%', severity: 'high' },
                ].map((anomaly, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer
                      ${anomaly.severity === 'high' ? 'bg-rose-500/5 border-rose-500/15 hover:bg-rose-500/10' : 'bg-amber-500/5 border-amber-500/15 hover:bg-amber-500/10'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/40">{anomaly.time}</span>
                        <span className="text-[10px] text-accent-400 font-mono">{anomaly.cam}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30">Confidence: {anomaly.conf}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase
                          ${anomaly.severity === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {anomaly.severity}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-white/60">{anomaly.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ TAB: EVACUATION ═══ */}
        {activeTab === 'evacuation' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold text-white/90">Evacuation Route Status</h3>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20
                  text-xs text-rose-400 hover:bg-rose-500/20 transition-all">
                  <BellRing className="w-3 h-3" />
                  Activate All Routes
                </button>
              </div>

              <div className="space-y-3">
                {evacuationRoutes.map((route, i) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                          ${route.status === 'clear' ? 'bg-emerald-500/10' : route.status === 'standby' ? 'bg-brand-500/10' : 'bg-amber-500/10'}`}>
                          <Route className={`w-4 h-4
                            ${route.status === 'clear' ? 'text-emerald-400' : route.status === 'standby' ? 'text-brand-400' : 'text-amber-400'}`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white/85">{route.name}</h4>
                          <p className="text-[10px] text-white/30">{route.id}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase
                        ${route.status === 'clear' ? 'bg-emerald-500/15 text-emerald-400' :
                          route.status === 'standby' ? 'bg-brand-500/15 text-brand-400' :
                          'bg-amber-500/15 text-amber-400'}`}>
                        {route.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[9px] text-white/30 uppercase">Capacity</p>
                        <p className="text-sm font-bold text-white/70">{route.capacity}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/30 uppercase">Est. Clear Time</p>
                        <p className="text-sm font-bold text-white/70">{route.estTime}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-white/30 uppercase">Action</p>
                        <button className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
                          Activate →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ TAB: PATROL TRACKING ═══ */}
        {activeTab === 'patrols' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-brand-400" />
                  <h3 className="text-sm font-semibold text-white/90">Active Patrol Units</h3>
                </div>
                <span className="text-xs text-white/30">27 units deployed</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { unit: 'Alpha-1', members: 4, zone: 'North Perimeter', status: 'patrolling', lastCheck: '1m ago', coverage: 92 },
                  { unit: 'Bravo-2', members: 3, zone: 'Gate B Complex', status: 'responding', lastCheck: '30s ago', coverage: 88 },
                  { unit: 'Charlie-3', members: 4, zone: 'East Concourse', status: 'patrolling', lastCheck: '2m ago', coverage: 95 },
                  { unit: 'Delta-4', members: 6, zone: 'South Stand', status: 'stationary', lastCheck: '45s ago', coverage: 78 },
                  { unit: 'K9-Unit', members: 2, zone: 'Parking West', status: 'sweep', lastCheck: '3m ago', coverage: 85 },
                  { unit: 'Echo-5', members: 4, zone: 'VIP Level', status: 'patrolling', lastCheck: '1m ago', coverage: 97 },
                ].map((patrol, i) => (
                  <motion.div
                    key={patrol.unit}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-brand-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white/85">{patrol.unit}</h4>
                          <p className="text-[10px] text-white/30">{patrol.members} members</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase
                        ${patrol.status === 'responding' ? 'bg-rose-500/20 text-rose-300' :
                          patrol.status === 'patrolling' ? 'bg-emerald-500/20 text-emerald-300' :
                          patrol.status === 'sweep' ? 'bg-accent-500/20 text-accent-300' :
                          'bg-amber-500/20 text-amber-300'}`}>
                        {patrol.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40">Zone</span>
                        <span className="text-xs text-white/60">{patrol.zone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/40">Last Check-in</span>
                        <span className="text-xs text-white/60">{patrol.lastCheck}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white/40">Coverage</span>
                          <span className="text-xs font-semibold text-emerald-400">{patrol.coverage}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${patrol.coverage}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className={`h-full rounded-full ${patrol.coverage > 90 ? 'bg-emerald-500' : patrol.coverage > 80 ? 'bg-brand-500' : 'bg-amber-500'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ INCIDENT REPORT MODAL ═══ */}
        <AnimatePresence>
          {showIncidentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setShowIncidentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="glass-card rounded-2xl p-6 w-full max-w-lg border border-white/[0.10]"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Siren className="w-5 h-5 text-rose-400" />
                    <h3 className="text-base font-bold text-white/90">Report New Incident</h3>
                  </div>
                  <button onClick={() => setShowIncidentModal(false)} className="p-1 rounded-lg hover:bg-white/[0.06] transition-colors">
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 font-medium block mb-1.5">Incident Type</label>
                    <select className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 focus:outline-none focus:border-brand-500/40">
                      <option>Unauthorized Access</option>
                      <option>Lost Child</option>
                      <option>Crowd Surge</option>
                      <option>Medical Emergency</option>
                      <option>Suspicious Package</option>
                      <option>Fire / Smoke</option>
                      <option>Structural Hazard</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-medium block mb-1.5">Location / Zone</label>
                    <input type="text" placeholder="e.g., Section 108, Gate B, VIP Level 3..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-brand-500/40" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-medium block mb-1.5">Priority</label>
                    <div className="flex gap-2">
                      {['Critical', 'High', 'Medium', 'Low'].map(p => (
                        <button key={p} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                          ${p === 'Critical' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' :
                            'bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06]'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-medium block mb-1.5">Description</label>
                    <textarea rows={3} placeholder="Describe the incident..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 placeholder:text-white/25 focus:outline-none focus:border-brand-500/40 resize-none" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowIncidentModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white/50 hover:bg-white/[0.07] transition-all">
                      Cancel
                    </button>
                    <button onClick={() => setShowIncidentModal(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 text-sm font-semibold text-white hover:bg-rose-600 transition-all glow-rose">
                      Submit Incident
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
