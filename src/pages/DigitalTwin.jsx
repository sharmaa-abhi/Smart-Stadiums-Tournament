import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, Eye, RotateCcw, ZoomIn, ZoomOut, Maximize2, Play,
  MapPin, Thermometer, Wind, Droplets, Wifi, Radio, Cpu, ShieldCheck
} from 'lucide-react';
import TopBar from '../components/TopBar';
import StadiumHeatmap from '../components/StadiumHeatmap';
import { generateStadiumHeatmap, generateGateData } from '../data/mockData';
import { DigitalTwinSkeleton } from '../components/skeleton';

export default function DigitalTwin() {
  const [heatmap, setHeatmap] = useState(generateStadiumHeatmap());
  const [gates, setGates] = useState(generateGateData());
  const [activeLayer, setActiveLayer] = useState('density');
  const [selectedZone, setSelectedZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    const interval = setInterval(() => {
      setHeatmap(generateStadiumHeatmap());
      setGates(generateGateData());
    }, 5000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const layers = [
    { id: 'density', label: 'Density Stream', icon: Layers },
    { id: 'security', label: 'Security Sectors', icon: ShieldCheck },
    { id: 'environmental', label: 'Environmental Telemetry', icon: Thermometer },
    { id: 'infrastructure', label: 'IoT Infrastructure', icon: Cpu },
  ];

  const envData = useMemo(() => ({
    temperature: (Math.random() * 4 + 26).toFixed(1),
    humidity: Math.floor(Math.random() * 15 + 48),
    windSpeed: (Math.random() * 8 + 6).toFixed(1),
    airQuality: Math.floor(Math.random() * 20 + 65),
  }), []);

  if (loading) {
    return <DigitalTwinSkeleton />;
  }

  return (
    <div className="min-h-screen pb-12">
      <TopBar title="Digital Twin Simulation" subtitle="Real-time 3D telemetry virtual model — MetLife Stadium" />

      <div className="p-4 sm:p-6 space-y-5 max-w-[1700px] mx-auto">
        {/* Layer Controls Bar */}
        <div className="p-3 rounded-xl bg-[#0a0d14]/85 border border-white/[0.07] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {layers.map(layer => {
              const LayerIcon = layer.icon;
              const isActive = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/[0.02] text-white/50 border border-white/[0.05] hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <LayerIcon className="w-3.5 h-3.5" />
                  <span>{layer.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-white/50 hover:text-white transition-all cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-white/50 hover:text-white transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-white/50 hover:text-white transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] text-white/50 hover:text-white transition-all cursor-pointer"
              title="Full View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Main 3D Twin Model */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="lg:col-span-3 glass-card rounded-xl p-4 sm:p-5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                  3D Digital Twin Spatial Array
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-secondary py-1 px-2.5 text-xs font-mono">
                  <Play className="w-3 h-3 text-emerald-400" />
                  Live Replay
                </button>
                <button className="btn-secondary py-1 px-2.5 text-xs font-mono">
                  <Eye className="w-3 h-3 text-cyan-400" />
                  Annotations
                </button>
              </div>
            </div>

            {/* Stadium Visualization Area */}
            <div className="relative">
              <StadiumHeatmap data={heatmap} />

              {/* Gate Array Pins */}
              {gates.map((gate, i) => {
                const positions = [
                  { top: '8%', left: '25%' }, { top: '8%', left: '55%' },
                  { top: '50%', left: '5%' }, { top: '50%', left: '92%' },
                  { top: '88%', left: '25%' }, { top: '88%', left: '55%' },
                ];
                const pos = positions[i] || { top: '50%', left: '50%' };
                return (
                  <div
                    key={gate.name}
                    className="absolute cursor-pointer group"
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => setSelectedZone(gate)}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-mono font-bold ${
                        gate.status === 'open'
                          ? 'bg-emerald-500/90 text-black'
                          : 'bg-rose-500/90 text-white'
                      } shadow-md`}
                    >
                      {gate.name.split(' ')[1]}
                    </div>
                    <div className="hidden group-hover:block absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0a0d14] border border-white/15 rounded-lg px-2.5 py-1 text-[10px] font-mono z-20 shadow-xl">
                      <p className="font-bold text-white">{gate.name}</p>
                      <p className="text-white/50">{gate.throughput}/min • Wait: {gate.avgWait}m</p>
                    </div>
                  </div>
                );
              })}

              {/* Fixed Telemetry Stream Chip */}
              <div className="absolute top-3 right-3 space-y-1">
                {[
                  { label: 'LiDAR Arrays', count: '24/24' },
                  { label: 'CCTV Feeds', count: '128 live' },
                  { label: '5G NSA Nodes', count: '47 sync' },
                ].map((sensor, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 px-2 py-0.5 rounded bg-[#07090d]/85 border border-white/10 text-[9px] font-mono">
                    <span className="text-white/40">{sensor.label}:</span>
                    <span className="text-emerald-400 font-bold">{sensor.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Zone Directive Drawer */}
            {selectedZone && (
              <div className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] font-mono">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white uppercase">{selectedZone.name} Sector Telemetry</h4>
                  <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                    selectedZone.status === 'open' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                  }`}>
                    {selectedZone.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase block">Flow Rate</span>
                    <span className="font-bold text-white">{selectedZone.throughput} fans/min</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase block">Queue Depth</span>
                    <span className="font-bold text-white">{selectedZone.queue} fans</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase block">Ingress Latency</span>
                    <span className="font-bold text-white">{selectedZone.avgWait} min wait</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Panel Telemetry Widgets */}
          <div className="space-y-4">
            {/* Environmental Monitoring */}
            <div className="glass-card rounded-xl p-4">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-white mb-2.5 pb-2 border-b border-white/[0.06]">
                Environmental Telemetry
              </h4>
              <div className="space-y-2 font-mono text-xs">
                {[
                  { icon: Thermometer, label: 'Temperature', value: `${envData.temperature}°C`, color: 'text-amber-400' },
                  { icon: Droplets, label: 'Relative Humidity', value: `${envData.humidity}%`, color: 'text-cyan-400' },
                  { icon: Wind, label: 'Pitch Wind Vector', value: `${envData.windSpeed} km/h`, color: 'text-emerald-400' },
                  { icon: Wifi, label: 'Air Quality (AQI)', value: `${envData.airQuality} Good`, color: 'text-emerald-400' },
                ].map(({ icon: Icon, label, value, color }, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-white/[0.03]">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="text-white/50 text-[11px]">{label}</span>
                    </div>
                    <span className="font-bold text-white text-[11px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gate Flow Monitor */}
            <div className="glass-card rounded-xl p-4">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-white mb-2.5 pb-2 border-b border-white/[0.06]">
                Turnstile Gate Status
              </h4>
              <div className="space-y-1.5 font-mono text-xs">
                {gates.map((gate, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedZone(gate)}
                    className="flex items-center justify-between p-1.5 rounded bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${gate.status === 'open' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span className="text-white/80 text-[11px]">{gate.name}</span>
                    </div>
                    <span className="text-white/40 text-[10px]">{gate.throughput}/m</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sensor Nodes */}
            <div className="glass-card rounded-xl p-4">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-white mb-2.5 pb-2 border-b border-white/[0.06]">
                Active Edge Sensors
              </h4>
              <div className="grid grid-cols-2 gap-1.5 font-mono">
                {[
                  { label: 'Cameras', value: 128 },
                  { label: 'LiDAR Arrays', value: 24 },
                  { label: 'Turnstiles', value: 48 },
                  { label: 'IoT Sensors', value: 312 },
                  { label: 'POS Terminals', value: 67 },
                  { label: 'Wi-Fi 7 APs', value: 156 },
                ].map((s, i) => (
                  <div key={i} className="p-2 rounded bg-white/[0.02] border border-white/[0.04] text-center">
                    <p className="text-sm font-bold text-white">{s.value}</p>
                    <p className="text-[8px] text-white/40 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
