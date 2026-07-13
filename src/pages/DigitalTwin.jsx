import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Eye, RotateCcw, ZoomIn, ZoomOut, Maximize2, Play,
  MapPin, Thermometer, Wind, Droplets, Wifi
} from 'lucide-react';
import TopBar from '../components/TopBar';
import StadiumHeatmap from '../components/StadiumHeatmap';
import { generateStadiumHeatmap, generateGateData, ZONES } from '../data/mockData';
import { DigitalTwinSkeleton } from '../components/skeleton';

export default function DigitalTwin() {
  const [heatmap, setHeatmap] = useState(generateStadiumHeatmap());
  const [gates, setGates] = useState(generateGateData());
  const [activeLayer, setActiveLayer] = useState('density');
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    const interval = setInterval(() => {
      setHeatmap(generateStadiumHeatmap());
      setGates(generateGateData());
    }, 4000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const layers = [
    { id: 'density', label: 'Crowd Density', icon: '🔥' },
    { id: 'security', label: 'Security Zones', icon: '🛡️' },
    { id: 'environmental', label: 'Environmental', icon: '🌡️' },
    { id: 'infrastructure', label: 'Infrastructure', icon: '⚡' },
  ];

  const envData = useMemo(() => ({
    temperature: (Math.random() * 5 + 27).toFixed(1),
    humidity: Math.floor(Math.random() * 20 + 45),
    windSpeed: (Math.random() * 10 + 5).toFixed(1),
    airQuality: Math.floor(Math.random() * 30 + 60),
  }), []);

  if (loading) {
    return <DigitalTwinSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Digital Twin" subtitle="Real-time virtual model — MetLife Stadium" />

      <div className="p-6 space-y-6">
        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-2">
            {layers.map(layer => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200
                  ${activeLayer === layer.id
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white/70'
                  }`}
              >
                <span>{layer.icon}</span>
                <span>{layer.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">
              <RotateCcw className="w-4 h-4 text-white/50" />
            </button>
            <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">
              <ZoomIn className="w-4 h-4 text-white/50" />
            </button>
            <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">
              <ZoomOut className="w-4 h-4 text-white/50" />
            </button>
            <button className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all">
              <Maximize2 className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Twin View - Main */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 glass-card rounded-2xl p-5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-white/90">3D Venue Model</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400 hover:bg-brand-500/20 transition-all">
                  <Play className="w-3 h-3" />
                  Live Replay
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/50 hover:bg-white/[0.07] transition-all">
                  <Eye className="w-3 h-3" />
                  Toggle Annotations
                </button>
              </div>
            </div>

            {/* Stadium Visualization */}
            <div className="relative">
              <StadiumHeatmap data={heatmap} />

              {/* Animated gate markers */}
              {gates.map((gate, i) => {
                const positions = [
                  { top: '8%', left: '25%' }, { top: '8%', left: '55%' },
                  { top: '50%', left: '5%' }, { top: '50%', left: '92%' },
                  { top: '88%', left: '25%' }, { top: '88%', left: '55%' },
                ];
                const pos = positions[i] || { top: '50%', left: '50%' };
                return (
                  <motion.div
                    key={gate.name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="absolute cursor-pointer group"
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setSelectedZone(gate)}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold
                      ${gate.status === 'open'
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-rose-500/80 text-white pulse-dot'
                      } shadow-lg`}>
                      {gate.name.split(' ')[1]}
                    </div>
                    <div className="hidden group-hover:block absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
                      glass-card rounded-lg px-3 py-1.5 text-[10px] z-10 border border-white/10">
                      <p className="font-semibold text-white/90">{gate.name}</p>
                      <p className="text-white/50">Flow: {gate.throughput}/min • Wait: {gate.avgWait}m</p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Sensor indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute top-4 right-4 space-y-1.5"
              >
                {[
                  { icon: '📡', label: 'LiDAR Active', count: 24 },
                  { icon: '📷', label: 'CCTV Feeds', count: 128 },
                  { icon: '📶', label: '5G Nodes', count: 47 },
                ].map((sensor, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[9px]">
                    <span>{sensor.icon}</span>
                    <span className="text-white/50">{sensor.label}:</span>
                    <span className="text-emerald-400 font-semibold">{sensor.count}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Selected zone info panel */}
            {selectedZone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white/90">{selectedZone.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase
                    ${selectedZone.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {selectedZone.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">Throughput</p>
                    <p className="text-sm font-bold text-white/80">{selectedZone.throughput}/min</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">Queue</p>
                    <p className="text-sm font-bold text-white/80">{selectedZone.queue} fans</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase">Avg Wait</p>
                    <p className="text-sm font-bold text-white/80">{selectedZone.avgWait} min</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Panel — Info Cards */}
          <div className="space-y-4">
            {/* Environmental */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-4"
            >
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Environment</h4>
              <div className="space-y-3">
                {[
                  { icon: Thermometer, label: 'Temperature', value: `${envData.temperature}°C`, color: 'text-amber-400' },
                  { icon: Droplets, label: 'Humidity', value: `${envData.humidity}%`, color: 'text-accent-400' },
                  { icon: Wind, label: 'Wind Speed', value: `${envData.windSpeed} km/h`, color: 'text-brand-400' },
                  { icon: Wifi, label: 'Air Quality', value: `${envData.airQuality} AQI`, color: 'text-emerald-400' },
                ].map(({ icon: Icon, label, value, color }, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="text-xs text-white/50">{label}</span>
                    </div>
                    <span className="text-xs font-semibold text-white/80">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Gate Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-4"
            >
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Gate Status</h4>
              <div className="space-y-2">
                {gates.map((gate, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
                    onClick={() => setSelectedZone(gate)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${gate.status === 'open' ? 'bg-emerald-400' : 'bg-rose-400 pulse-dot'}`} />
                      <span className="text-xs text-white/70">{gate.name}</span>
                    </div>
                    <span className="text-xs font-mono text-white/40">{gate.throughput}/m</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Zone Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-4"
            >
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">
                <MapPin className="w-3 h-3 inline mr-1.5" />
                Active Sensors
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Cameras', value: 128, status: 'online' },
                  { label: 'LiDAR', value: 24, status: 'online' },
                  { label: 'Turnstiles', value: 48, status: 'online' },
                  { label: 'IoT Sensors', value: 312, status: 'online' },
                  { label: 'POS Units', value: 67, status: 'online' },
                  { label: 'Wi-Fi APs', value: 156, status: 'online' },
                ].map((s, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white/[0.02] text-center">
                    <p className="text-lg font-bold text-white/80">{s.value}</p>
                    <p className="text-[9px] text-white/40 uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
