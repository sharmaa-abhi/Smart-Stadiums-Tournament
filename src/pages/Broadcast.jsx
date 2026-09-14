import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Layers3,
  Eye, Play, Pause, Volume2, Maximize2, Share2,
  Sparkles, Trophy, Timer, Signal,
  Megaphone, Plus, Trash2, Radio
} from 'lucide-react';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import api from '../lib/api';
import { useAuth } from '../context/useAuth';
import { BroadcastSkeleton } from '../components/skeleton';

const feeds = [
  { id: 1, name: 'Main Cam — Tactical Pitch', angle: 'Wide', status: 'live', fps: 60, resolution: '4K HDR', viewers: '2.4M' },
  { id: 2, name: 'Tactical Overhead Drone', angle: 'Top-down', status: 'live', fps: 60, resolution: '4K', viewers: '890K' },
  { id: 3, name: 'Referee Optical POV', angle: 'POV', status: 'live', fps: 120, resolution: '1080p Stabilized', viewers: '1.2M' },
  { id: 4, name: 'Goal-line North Sensor', angle: 'Fixed', status: 'live', fps: 240, resolution: '4K Ultra Slow', viewers: '450K' },
  { id: 5, name: '3D Spatial Reconstruction', angle: 'Virtual', status: 'processing', fps: 60, resolution: '4K Rendered', viewers: '670K' },
  { id: 6, name: 'Concourse Fan Cam 108', angle: 'Crowd', status: 'live', fps: 30, resolution: '1080p', viewers: '180K' },
];

const aiOverlays = [
  { name: 'Player Spatial Tracking', status: 'active', type: 'Real-time' },
  { name: 'Ball Trajectory & Velocity', status: 'active', type: 'Real-time' },
  { name: 'Tactical Formation Overlay', status: 'active', type: 'Real-time' },
  { name: 'xG Expected Probability', status: 'active', type: 'ML Inference' },
  { name: 'Sprint Velocity Heatmap', status: 'standby', type: 'On-Demand' },
  { name: 'Offside Projection Plane', status: 'active', type: 'Real-time' },
];

const highlights = [
  { time: "23'", event: 'Goal — Strike #10 (Bottom Left)', type: 'goal', confidence: '99%', clips: 4 },
  { time: "31'", event: 'Tactical Booking — Defense #7', type: 'card', confidence: '97%', clips: 2 },
  { time: "45'", event: 'Goalkeeper Reaction Save', type: 'save', confidence: '95%', clips: 3 },
  { time: "52'", event: 'Formation Shift — 4-3-3 → 3-5-2', type: 'tactical', confidence: '91%', clips: 1 },
  { time: "67'", event: 'Near Miss — Crossbar Deflection', type: 'chance', confidence: '98%', clips: 3 },
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
    urgent: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    high: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    normal: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
  };

  if (loadingBroadcasts) {
    return <BroadcastSkeleton />;
  }

  return (
    <div className="min-h-screen pb-12">
      <TopBar title="Broadcast & Media Distribution" subtitle="Low-latency stream orchestration, AI overlays & PA audio channels" />

      <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <StatCard
            icon={Eye}
            label="Global OTT Viewers"
            value="5.8M"
            color="brand"
            delay={0}
            trend="up"
            trendValue="+340K / 10m"
          />
          <StatCard
            icon={Camera}
            label="Live Pitch Feeds"
            value="42"
            color="accent"
            delay={0.04}
            contextNote="All cameras 4K HDR"
          />
          <StatCard
            icon={Sparkles}
            label="AI Overlays Active"
            value={aiOverlays.filter(a => a.status === 'active').length.toString()}
            color="emerald"
            delay={0.08}
            contextNote="Computer Vision synced"
          />
          <StatCard
            icon={Timer}
            label="Glass-to-Glass Latency"
            value="1.2"
            unit="sec"
            color="amber"
            delay={0.12}
            trend="down"
            trendValue="-0.3s target"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Feed Video Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            className="lg:col-span-2 glass-card rounded-xl overflow-hidden"
          >
            {/* Video Viewport */}
            <div className="relative aspect-video bg-[#05070a] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-25" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }} />

              {/* Video Placeholder Content */}
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/[0.12] flex items-center justify-center mb-2.5 mx-auto group cursor-pointer hover:bg-white/[0.08] transition-all">
                  <Play className="w-6 h-6 text-white/80 group-hover:text-emerald-400 transition-colors ml-0.5" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">{selectedFeed.name}</h3>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">{selectedFeed.resolution} • {selectedFeed.fps} FPS</p>
              </div>

              {/* Live Badge */}
              {selectedFeed.status === 'live' && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/90 text-white font-mono text-[9px] font-bold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white pulse-dot-red" />
                  <span>LIVE</span>
                </div>
              )}

              {/* Viewer Telemetry */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[10px] font-mono text-white/80">
                <Eye className="w-3 h-3 text-white/50" />
                <span>{selectedFeed.viewers} stream viewers</span>
              </div>

              {/* Overlays Tags */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 font-mono text-[9px]">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/35">
                  AI CV Active
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/35">
                  Optical Calibration 0.2ms
                </span>
              </div>

              {/* Quick Controls */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1">
                <button className="p-1 rounded bg-black/50 hover:bg-black text-white/60 hover:text-white transition-all">
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded bg-black/50 hover:bg-black text-white/60 hover:text-white transition-all">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button className="p-1 rounded bg-black/50 hover:bg-black text-white/60 hover:text-white transition-all">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Camera Grid */}
            <div className="p-3 border-t border-white/[0.06] bg-[#07090d]">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {feeds.map((feed) => (
                  <button
                    key={feed.id}
                    onClick={() => setSelectedFeed(feed)}
                    className={`flex-shrink-0 w-28 p-1.5 rounded-lg transition-all text-left cursor-pointer border ${
                      selectedFeed.id === feed.id
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="aspect-video bg-[#0a0d14] rounded mb-1 flex items-center justify-center relative overflow-hidden border border-white/[0.05]">
                      <Camera className="w-3.5 h-3.5 text-white/25" />
                      {feed.status === 'live' && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                    </div>
                    <p className="text-[9px] font-mono text-white/70 truncate">{feed.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Panel Telemetry & Overlays */}
          <div className="space-y-4">
            {/* Visual Overlays */}
            <div className="glass-card rounded-xl p-3.5 font-mono text-xs">
              <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/[0.06]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Active Visual Overlays</h4>
              </div>
              <div className="space-y-1.5">
                {aiOverlays.map((overlay, i) => (
                  <div key={i} className="flex items-center justify-between p-1.5 rounded bg-white/[0.02] border border-white/[0.03]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${overlay.status === 'active' ? 'bg-emerald-400' : 'bg-white/20'}`} />
                      <span className="text-white/75 text-[11px] font-sans">{overlay.name}</span>
                    </div>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                      overlay.status === 'active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/[0.04] text-white/30'
                    }`}>
                      {overlay.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Generated Highlights */}
            <div className="glass-card rounded-xl p-3.5 font-mono text-xs">
              <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/[0.06]">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Auto Highlight Feed</h4>
              </div>
              <div className="space-y-1.5">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer border border-white/[0.03]">
                    <span className="font-bold text-cyan-400 text-[11px] w-6">{h.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-sans font-semibold text-white/80 truncate">{h.event}</p>
                      <p className="text-[9px] text-white/30">{h.clips} clips • {h.confidence}</p>
                    </div>
                    <Play className="w-3 h-3 text-white/30 hover:text-emerald-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* CDN Metrics */}
            <div className="glass-card rounded-xl p-3.5 font-mono text-xs">
              <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/[0.06]">
                <Signal className="w-3.5 h-3.5 text-emerald-400" />
                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Distribution Telemetry</h4>
              </div>
              <div className="space-y-1 text-[11px]">
                {[
                  { label: 'Edge Bandwidth', value: '48.2 Gbps', color: 'text-emerald-400' },
                  { label: 'Packet Drop', value: '0.01%', color: 'text-emerald-400' },
                  { label: 'Encoding Bitrate', value: '14.8 Mbps', color: 'text-white/80' },
                  { label: 'Edge POPs', value: '142 / 142', color: 'text-emerald-400' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-0.5">
                    <span className="text-white/40">{m.label}:</span>
                    <span className={`font-bold ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stadium Broadcast Announcements */}
        <div className="glass-card rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                Venue PA & Visual Broadcast Control
              </h3>
              <span className="text-xs font-mono text-white/40 ml-2">
                {broadcasts.filter(b => b.status === 'active').length} Active Channels
              </span>
            </div>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="btn-secondary text-xs py-1.5 px-3 font-mono cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              {showNewForm ? 'Close Form' : 'New Broadcast Message'}
            </button>
          </div>

          {/* Form */}
          <AnimatePresence>
            {showNewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-3 rounded-lg bg-[#0a0d14] border border-white/[0.08] space-y-2.5 font-mono"
              >
                <input
                  type="text"
                  placeholder="Broadcast alert headline..."
                  value={newMsg.title}
                  onChange={e => setNewMsg(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
                />
                <textarea
                  placeholder="Full audio transcription / text content..."
                  value={newMsg.message}
                  onChange={e => setNewMsg(p => ({ ...p, message: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={newMsg.channel}
                    onChange={e => setNewMsg(p => ({ ...p, channel: e.target.value }))}
                    className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs text-white/80 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="all">All Channels (PA + Displays + App)</option>
                    <option value="screens">LED Jumbotrons Only</option>
                    <option value="pa">PA Audio Speaker Array</option>
                    <option value="app">Fan Portal Push</option>
                  </select>
                  <select
                    value={newMsg.priority}
                    onChange={e => setNewMsg(p => ({ ...p, priority: e.target.value }))}
                    className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-xs text-white/80 focus:outline-none focus:border-emerald-500/50"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent / Emergency</option>
                  </select>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => setShowNewForm(false)}
                      className="btn-secondary py-1 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateBroadcast}
                      disabled={!newMsg.title || !newMsg.message || submitting}
                      className="btn-primary py-1 px-3 text-xs disabled:opacity-40"
                    >
                      {submitting ? 'Transmitting...' : 'Dispatch Broadcast'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Broadcast List */}
          <div className="space-y-1.5 font-mono text-xs">
            {broadcasts.length === 0 ? (
              <p className="text-white/30 text-center py-6">No broadcast messages in active queue.</p>
            ) : broadcasts.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-white/90 text-xs font-sans">{b.title}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${priorityColors[b.priority] || priorityColors.normal}`}>
                      {b.priority}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                      b.status === 'active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/[0.04] text-white/40'
                    }`}>
                      {b.status}
                    </span>
                    <span className="text-[10px] text-white/30 ml-auto">{new Date(b.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-white/50 font-sans truncate">{b.message}</p>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleToggleBroadcast(b)}
                    className="p-1 rounded text-white/40 hover:text-white transition-all"
                  >
                    {b.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => handleDeleteBroadcast(b.id)}
                    className="p-1 rounded text-white/30 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
