import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Shield, Users, Ticket, CheckCircle2 } from 'lucide-react';

const SECTORS = [
  {
    id: 'north_stand',
    name: 'North Stand (Curva Ultra)',
    gate: 'Gate A - Fast Track',
    capacity: '96% Full',
    queue: '3 mins wait',
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500',
    svgPath: 'M 40 20 Q 150 5 260 20 L 240 50 Q 150 40 60 50 Z',
  },
  {
    id: 'vip_lounge',
    name: 'VIP Skybox & Director Suite',
    gate: 'Gate V - Executive Entry',
    capacity: '42% Reserved',
    queue: '0 mins wait',
    color: 'from-amber-400 to-yellow-600',
    borderColor: 'border-amber-400',
    svgPath: 'M 260 20 Q 295 100 280 180 L 250 170 Q 260 100 240 50 Z',
  },
  {
    id: 'south_stand',
    name: 'South Family Tribune',
    gate: 'Gate C - Access Gate',
    capacity: '88% Full',
    queue: '5 mins wait',
    color: 'from-emerald-400 to-teal-600',
    borderColor: 'border-emerald-500',
    svgPath: 'M 280 180 Q 150 200 20 180 L 40 150 Q 150 165 250 170 Z',
  },
  {
    id: 'west_press',
    name: 'West Media & Operations Sector',
    gate: 'Gate M - Staff/Press',
    capacity: '55% Active',
    queue: '1 min wait',
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-400',
    svgPath: 'M 20 180 Q 5 100 40 20 L 60 50 Q 40 100 40 150 Z',
  },
];

export default function StadiumGateMapPreview({ selectedSector, onSelectSector }) {
  const [hoveredSector, setHoveredSector] = useState(null);

  const activeSectorObj = SECTORS.find((s) => s.id === (selectedSector || 'north_stand')) || SECTORS[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Navigation className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Interactive Stadium Gate Preview</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
          Click Sector to Select
        </span>
      </div>

      {/* SVG Interactive Arena Graphic */}
      <div className="relative bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-center">
        <svg viewBox="0 0 300 200" className="w-full h-44 drop-shadow-[0_0_15px_rgba(51,120,255,0.2)]">
          {/* Pitch Outer Ring */}
          <ellipse cx="150" cy="100" rx="135" ry="85" fill="none" stroke="#1e293b" strokeWidth="6" />

          {/* Green Grass Turf Center */}
          <ellipse cx="150" cy="100" rx="90" ry="50" fill="#064e3b" stroke="#10b981" strokeWidth="2" opacity="0.8" />
          <line x1="150" y1="50" x2="150" y2="150" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="150" cy="100" r="18" fill="none" stroke="#34d399" strokeWidth="1.5" />

          {/* Interactive Sectors */}
          {SECTORS.map((sector) => {
            const isSelected = (selectedSector || 'north_stand') === sector.id;
            const isHovered = hoveredSector === sector.id;

            return (
              <path
                key={sector.id}
                d={sector.svgPath}
                className={`cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'fill-cyan-500/60 stroke-cyan-300 stroke-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                    : isHovered
                    ? 'fill-brand-500/40 stroke-brand-400 stroke-1'
                    : 'fill-slate-800/60 stroke-slate-700 hover:fill-slate-700/80'
                }`}
                onClick={() => onSelectSector && onSelectSector(sector.id)}
                onMouseEnter={() => setHoveredSector(sector.id)}
                onMouseLeave={() => setHoveredSector(null)}
              />
            );
          })}
        </svg>

        {/* Floating Sector Tag on Hover/Select */}
        <div className="absolute top-2 right-2 text-right">
          <div className="text-[11px] font-bold text-white flex items-center justify-end gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" />
            {activeSectorObj.name}
          </div>
          <div className="text-[10px] text-slate-400">{activeSectorObj.gate}</div>
        </div>
      </div>

      {/* Sector Quick Details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" /> Stand Density
          </span>
          <span className="font-bold text-slate-200">{activeSectorObj.capacity}</span>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Ticket className="w-3.5 h-3.5 text-amber-400" /> Gate Queue
          </span>
          <span className="font-bold text-emerald-400">{activeSectorObj.queue}</span>
        </div>
      </div>
    </div>
  );
}
