import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio, Tv, Camera, Clapperboard, Layers3, Gamepad2,
  Eye, Play, Pause, Volume2, Maximize2, Share2,
  Sparkles, Trophy, Timer, Activity, Signal,
  Megaphone, Plus, Trash2, Check, AlertCircle, X
} from 'lucide-react';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { BroadcastSkeleton } from '../components/skeleton';

const feeds = [
  { id: 1, name: 'Main Camera — Center', angle: 'Wide', status: 'live', fps: 60, resolution: '4K HDR', viewers: '2.4M' },
  { id: 2, name: 'Tactical Overhead', angle: 'Top-down', status: 'live', fps: 60, resolution: '4K', viewers: '890K' },
  { id: 3, name: 'Referee Bodycam', angle: 'POV', status: 'live', fps: 120, resolution: '1080p Stabilized', viewers: '1.2M' },
  { id: 4, name: 'Goal-line (North)', angle: 'Fixed', status: 'live', fps: 240, resolution: '4K Super Slow', viewers: '450K' },
  { id: 5, name: '3D Avatar Replay', angle: 'Virtual', status: 'processing', fps: 60, resolution: '4K Rendered', viewers: '670K' },
  { id: 6, name: 'Fan Cam Section 108', angle: 'Crowd', status: 'live', fps: 30, resolution: '1080p', viewers: '180K' },
];

const aiOverlays = [
  { name: 'Player Tracking Heatmap', status: 'active', type: 'real-time' },
  { name: 'Ball Speed & Trajectory', status: 'active', type: 'real-time' },
  { name: 'Tactical Formation View', status: 'active', type: 'real-time' },
  { name: 'xG Probability Meter', status: 'active', type: 'ML inference' },
  { name: 'Sprint Distance Overlay', status: 'standby', type: 'on-demand' },
  { name: 'Offside Line Projection', status: 'active', type: 'real-time' },
];

const highlights = [
  { time: "23'", event: 'Goal — Player #10', type: 'goal', confidence: '99%', clips: 4 },
  { time: "31'", event: 'Yellow Card — Player #7', type: 'card', confidence: '97%', clips: 2 },
  { time: "45'", event: 'Save of the Match', type: 'save', confidence: '95%', clips: 3 },
  { time: "52'", event: 'Tactical Shift — 4-3-3 → 3-5-2', type: 'tactical', confidence: '91%', clips: 1 },
  { time: "67'", event: 'Near Miss — Crossbar Hit', type: 'chance', confidence: '98%', clips: 3 },
];

export default function Broadcast() {
  const { activeVenueId } = useAuth();
  const [selectedFeed, setSelectedFeed] = useState(feeds[0]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newMsg, setNewMsg] = useState({ title: '', message: '', channel: 'all', priority: 'normal' });
  const [submitting, setSubmitting] = useState(false);

  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await api.getBroadcasts(activeVenueId);
      setBroadcasts(res.messages || []);
    } catch (err) {
      console.error('Broadcast fetch error:', err);
    } finally {
      setLoadingBroadcasts(false);
    }
  }, [activeVenueId]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const handleCreateBroadcast = async () => {
    if (!newMsg.title || !newMsg.message) return;
    setSubmitting(true);
    try {
      await api.createBroadcast({ ...newMsg, venue_id: activeVenueId });
      setNewMsg({ title: '', message: '', channel: 'all', priority: 'normal' });
      setShowNewForm(false);
      await fetchBroadcasts();
    } catch (err) {
      console.error('Create broadcast error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBroadcast = async (id) => {
    try {
      await api.deleteBroadcast(id);
      setBroadcasts(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Delete broadcast error:', err);
    }
  };

  const handleToggleBroadcast = async (b) => {
    try {
      const newStatus = b.status === 'active' ? 'paused' : 'active';
      await api.updateBroadcast(b.id, { status: newStatus });
      await fetchBroadcasts();
    } catch (err) {
      console.error('Toggle broadcast error:', err);
    }
  };

  const priorityColors = {
    urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
    high: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    normal: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
  };

  const channelIcons = {
    all: '📡', screens: '🖥️', pa: '📢', app: '📱',
  };

  if (loadingBroadcasts) {
    return <BroadcastSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Broadcast & Fan Engagement" subtitle="AI-enhanced production, real-time overlays & immersive fan experiences" />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Eye} label="Total Viewers" value="5.8M" color="brand" delay={0} trend="up" trendValue="+340K last 10m" />
          <StatCard icon={Camera} label="Active Cameras" value="42" color="accent" delay={0.05} />
          <StatCard icon={Sparkles} label="AI Overlays Active" value={aiOverlays.filter(a => a.status === 'active').length.toString()} color="emerald" delay={0.1} />
          <StatCard icon={Timer} label="Stream Latency" value="1.2" unit="sec" color="amber" delay={0.15} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed Viewer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 glass-card rounded-2xl overflow-hidden"
          >
            {/* Video Player Area */}
            <div className="relative aspect-video bg-gradient-to-br from-surface-900 to-surface-800 flex items-center justify-center overflow-hidden">
              {/* Simulated video feed with animated gradient */}
              <div className="absolute inset-0 stadium-grid opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/5 via-transparent to-accent-500/5" />

              {/* Center play area simulation */}
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.10]
                  flex items-center justify-center mb-3 mx-auto group cursor-pointer hover:bg-white/[0.10] transition-all">
                  <Play className="w-8 h-8 text-white/70 group-hover:text-white transition-colors ml-1" />
                </div>
                <h3 className="text-sm font-semibold text-white/80">{selectedFeed.name}</h3>
                <p className="text-[10px] text-white/40 mt-1">{selectedFeed.resolution} • {selectedFeed.fps}fps</p>
              </div>

              {/* Live badge */}
              {selectedFeed.status === 'live' && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/90 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">LIVE</span>
                </div>
              )}

              {/* Viewer count */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm">
                <Eye className="w-3 h-3 text-white/60" />
                <span className="text-[10px] text-white/70 font-medium">{selectedFeed.viewers} viewers</span>
              </div>

              {/* AI overlay badges */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent-500/20 backdrop-blur-sm border border-accent-500/30">
                  <Sparkles className="w-2.5 h-2.5 text-accent-400" />
                  <span className="text-[9px] text-accent-300 font-medium">AI Enhanced</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-500/20 backdrop-blur-sm border border-brand-500/30">
                  <Layers3 className="w-2.5 h-2.5 text-brand-400" />
                  <span className="text-[9px] text-brand-300 font-medium">3D Tracking</span>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button className="p-1.5 rounded-md bg-black/40 hover:bg-black/60 transition-colors">
                  <Volume2 className="w-3.5 h-3.5 text-white/60" />
                </button>
                <button className="p-1.5 rounded-md bg-black/40 hover:bg-black/60 transition-colors">
                  <Share2 className="w-3.5 h-3.5 text-white/60" />
                </button>
                <button className="p-1.5 rounded-md bg-black/40 hover:bg-black/60 transition-colors">
                  <Maximize2 className="w-3.5 h-3.5 text-white/60" />
                </button>
              </div>
            </div>

            {/* Feed Selector Thumbnails */}
            <div className="p-4 border-t border-white/[0.06]">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {feeds.map((feed) => (
                  <button
                    key={feed.id}
                    onClick={() => setSelectedFeed(feed)}
                    className={`flex-shrink-0 w-32 p-2 rounded-lg transition-all duration-200
                      ${selectedFeed.id === feed.id
                        ? 'bg-brand-500/15 border border-brand-500/30'
                        : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05]'
                      }`}
                  >
                    <div className="aspect-video bg-surface-800 rounded-md mb-1.5 flex items-center justify-center relative overflow-hidden">
                      <div className="stadium-grid absolute inset-0 opacity-30" />
                      <Camera className="w-4 h-4 text-white/20 relative z-10" />
                      {feed.status === 'live' && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[9px] text-white/60 font-medium truncate">{feed.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* AI Overlays */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent-400" />
                <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">AI Visual Overlays</h4>
              </div>
              <div className="space-y-2">
                {aiOverlays.map((overlay, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${overlay.status === 'active' ? 'bg-emerald-500' : 'bg-white/20'}`} />
                      <span className="text-xs text-white/70">{overlay.name}</span>
                    </div>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded
                      ${overlay.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.04] text-white/30'}`}>
                      {overlay.type}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">AI-Generated Highlights</h4>
              </div>
              <div className="space-y-2">
                {highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 + 0.5 }}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  >
                    <div className="w-10 text-center">
                      <span className="text-xs font-bold text-accent-400">{h.time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 font-medium truncate">{h.event}</p>
                      <p className="text-[9px] text-white/30">{h.clips} clips • {h.confidence} confidence</p>
                    </div>
                    <Play className="w-3 h-3 text-white/20 group-hover:text-brand-400 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stream Health */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Signal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Stream Health</h4>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'CDN Bandwidth', value: '48.2 Gbps', color: 'text-emerald-400' },
                  { label: 'Buffer Rate', value: '0.02%', color: 'text-emerald-400' },
                  { label: 'Avg Bitrate', value: '12.4 Mbps', color: 'text-brand-400' },
                  { label: 'Edge Nodes', value: '142 / 142', color: 'text-emerald-400' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-white/40">{m.label}</span>
                    <span className={`text-[11px] font-semibold ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Broadcast Messages Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-white/90">Stadium Broadcasts</h3>
              <span className="text-xs text-white/30">{broadcasts.filter(b => b.status === 'active').length} active</span>
            </div>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 border border-brand-500/30
                text-xs text-brand-400 hover:bg-brand-500/25 transition-all"
            >
              <Plus className="w-3 h-3" />
              New Broadcast
            </button>
          </div>

          {/* New Broadcast Form */}
          <AnimatePresence>
            {showNewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-3"
              >
                <input
                  type="text"
                  placeholder="Broadcast title..."
                  value={newMsg.title}
                  onChange={e => setNewMsg(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/80
                    placeholder:text-white/20 focus:outline-none focus:border-brand-500/40 transition-all"
                />
                <textarea
                  placeholder="Message content..."
                  value={newMsg.message}
                  onChange={e => setNewMsg(p => ({ ...p, message: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/80
                    placeholder:text-white/20 focus:outline-none focus:border-brand-500/40 transition-all resize-none"
                />
                <div className="flex items-center gap-3">
                  <select
                    value={newMsg.channel}
                    onChange={e => setNewMsg(p => ({ ...p, channel: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/60
                      focus:outline-none focus:border-brand-500/40 transition-all"
                  >
                    <option value="all">📡 All Channels</option>
                    <option value="screens">🖥️ Screens</option>
                    <option value="pa">📢 PA System</option>
                    <option value="app">📱 Fan App</option>
                  </select>
                  <select
                    value={newMsg.priority}
                    onChange={e => setNewMsg(p => ({ ...p, priority: e.target.value }))}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/60
                      focus:outline-none focus:border-brand-500/40 transition-all"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <div className="flex-1 flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setShowNewForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/40 hover:text-white/60 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateBroadcast}
                      disabled={!newMsg.title || !newMsg.message || submitting}
                      className="px-4 py-1.5 rounded-lg bg-brand-500 text-xs text-white font-medium
                        hover:bg-brand-600 disabled:opacity-40 transition-all"
                    >
                      {submitting ? 'Sending...' : 'Send Broadcast'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Broadcast List */}
          <div className="space-y-2">
            {broadcasts.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-6">No broadcasts yet</p>
            ) : broadcasts.map((b) => (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all group"
              >
                <span className="text-lg leading-none mt-0.5">{channelIcons[b.channel] || '📡'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-white/80 truncate">{b.title}</span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${priorityColors[b.priority] || priorityColors.normal}`}>
                      {b.priority?.toUpperCase()}
                    </span>
                    <span className={`ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded ${
                      b.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      b.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-white/[0.04] text-white/30'
                    }`}>{b.status}</span>
                  </div>
                  <p className="text-[11px] text-white/40 line-clamp-2">{b.message}</p>
                  <p className="text-[9px] text-white/20 mt-1">{b.channel} • {new Date(b.created_at).toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleBroadcast(b)}
                    title={b.status === 'active' ? 'Pause' : 'Activate'}
                    className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-all"
                  >
                    {b.status === 'active' ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => handleDeleteBroadcast(b.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400/60 hover:text-rose-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
