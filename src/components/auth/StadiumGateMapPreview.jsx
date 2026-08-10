import React, { useState } from 'react';
import { MapPin, Navigation, Users, Ticket, ChevronRight } from 'lucide-react';

const SECTORS = [
  {
    id: 'north_stand',
    name: 'North Stand (Curva Ultra)',
    shortName: 'North Stand',
    gate: 'Gate A - Fast Track',
    capacity: '96% Full',
    queue: '3 mins wait',
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500',
    svgPath: 'M 40 20 Q 150 5 260 20 L 240 50 Q 150 40 60 50 Z',
    labelPos: { x: 150, y: 33 },
    badgeText: 'NORTH',
  },
  {
    id: 'vip_lounge',
    name: 'VIP Skybox & Director Suite',
    shortName: 'VIP Skybox',
    gate: 'Gate V - Executive Entry',
    capacity: '42% Reserved',
    queue: '0 mins wait',
    color: 'from-amber-400 to-yellow-600',
    borderColor: 'border-amber-400',
    svgPath: 'M 260 20 Q 295 100 280 180 L 250 170 Q 260 100 240 50 Z',
    labelPos: { x: 260, y: 100 },
    badgeText: 'VIP',
  },
  {
    id: 'south_stand',
    name: 'South Family Tribune',
    shortName: 'South Stand',
    gate: 'Gate C - Access Gate',
    capacity: '88% Full',
    queue: '5 mins wait',
    color: 'from-emerald-400 to-teal-600',
    borderColor: 'border-emerald-500',
    svgPath: 'M 280 180 Q 150 200 20 180 L 40 150 Q 150 165 250 170 Z',
    labelPos: { x: 150, y: 167 },
    badgeText: 'SOUTH',
  },
  {
    id: 'west_press',
    name: 'West Media & Operations Sector',
    shortName: 'West Media',
    gate: 'Gate M - Staff/Press',
    capacity: '55% Active',
    queue: '1 min wait',
    color: 'from-purple-500 to-indigo-600',
    borderColor: 'border-purple-400',
    svgPath: 'M 20 180 Q 5 100 40 20 L 60 50 Q 40 100 40 150 Z',
    labelPos: { x: 40, y: 100 },
    badgeText: 'WEST',
  },
];

export default function StadiumGateMapPreview({ selectedSector, onSelectSector }) {
  const [hoveredSector, setHoveredSector] = useState(null);

  const activeSectorId = selectedSector || 'north_stand';
  const activeSectorObj = SECTORS.find((s) => s.id === activeSectorId) || SECTORS[0];

  const handleSectorClick = (sectorId) => {
    if (onSelectSector) {
      onSelectSector(sectorId);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Navigation className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Interactive Stadium Gate Preview</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
          Click Map or Sector Pill
        </span>
      </div>

      {/* SVG Interactive Arena Graphic */}
      <div className="relative bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-center">
        <svg viewBox="0 0 300 200" className="w-full h-44 drop-shadow-[0_0_15px_rgba(51,120,255,0.2)] select-none">
          {/* Pitch Outer Ring */}
          <ellipse cx="150" cy="100" rx="135" ry="85" fill="none" stroke="#1e293b" strokeWidth="6" />

          {/* Green Grass Turf Center */}
          <ellipse cx="150" cy="100" rx="90" ry="50" fill="#064e3b" stroke="#10b981" strokeWidth="2" opacity="0.8" />
          <line x1="150" y1="50" x2="150" y2="150" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="150" cy="100" r="18" fill="none" stroke="#34d399" strokeWidth="1.5" />

          {/* Interactive Sectors */}
          {SECTORS.map((sector) => {
            const isSelected = activeSectorId === sector.id;
            const isHovered = hoveredSector === sector.id;

            return (
              <g
                key={sector.id}
                onClick={() => handleSectorClick(sector.id)}
                onMouseEnter={() => setHoveredSector(sector.id)}
                onMouseLeave={() => setHoveredSector(null)}
                className="cursor-pointer group"
              >
                {/* Wide invisible hit area stroke for effortless clicking */}
                <path
                  d={sector.svgPath}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Main sector path */}
                <path
                  d={sector.svgPath}
                  className={`transition-all duration-300 ${
                    isSelected
                      ? 'fill-cyan-500/70 stroke-cyan-300 stroke-2 drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]'
                      : isHovered
                      ? 'fill-cyan-500/40 stroke-cyan-400 stroke-2 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                      : 'fill-slate-800/80 stroke-slate-700 hover:fill-slate-700/90'
                  }`}
                />

                {/* Sector Badge Label on SVG Map */}
                <g transform={`translate(${sector.labelPos.x}, ${sector.labelPos.y})`}>
                  <rect
                    x="-22"
                    y="-8"
                    width="44"
                    height="16"
                    rx="8"
                    className={`transition-all duration-200 ${
                      isSelected
                        ? 'fill-cyan-400 stroke-cyan-200'
                        : isHovered
                        ? 'fill-slate-700 stroke-cyan-400'
                        : 'fill-slate-900/90 stroke-slate-700'
                    }`}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    className={`text-[9px] font-black tracking-wider transition-colors pointer-events-none ${
                      isSelected
                        ? 'fill-slate-950 font-bold'
                        : isHovered
                        ? 'fill-cyan-300'
                        : 'fill-slate-300'
                    }`}
                  >
                    {sector.badgeText}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Active Sector Tag */}
        <div className="absolute top-2 right-2 text-right pointer-events-none">
          <div className="text-[11px] font-bold text-white flex items-center justify-end gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            {activeSectorObj.name}
          </div>
          <div className="text-[10px] text-cyan-300/80 font-mono">{activeSectorObj.gate}</div>
        </div>
      </div>

      {/* Sector Quick Selector Buttons */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        {SECTORS.map((s) => {
          const isSelected = activeSectorId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSectorClick(s.id)}
              className={`py-1.5 px-1 text-[10px] font-bold rounded-xl border transition-all cursor-pointer text-center truncate ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)] scale-[1.02]'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
              title={s.name}
            >
              {s.shortName}
            </button>
          );
        })}
      </div>

      {/* Sector Quick Details */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Users className="w-3.5 h-3.5 text-cyan-400" /> Stand Density
          </span>
          <span className="font-bold text-slate-200 text-[11px]">{activeSectorObj.capacity}</span>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Ticket className="w-3.5 h-3.5 text-amber-400" /> Gate Queue
          </span>
          <span className="font-bold text-emerald-400 text-[11px]">{activeSectorObj.queue}</span>
        </div>
      </div>
    </div>
  );
}

