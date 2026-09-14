import { useMemo } from 'react';
import { motion } from 'framer-motion';

function getHeatColor(value) {
  if (value < 0.3) return 'rgba(34, 197, 94, 0.45)';    // neon green — low density / optimal
  if (value < 0.5) return 'rgba(6, 182, 212, 0.5)';     // cyan — moderate
  if (value < 0.7) return 'rgba(245, 158, 11, 0.55)';   // amber — elevated
  if (value < 0.85) return 'rgba(249, 115, 22, 0.65)';  // orange — high
  return 'rgba(244, 63, 94, 0.8)';                      // controlled red — critical
}

export default function StadiumHeatmap({ data }) {
  const grid = useMemo(() => data || generateDefaultGrid(), [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[#07090d] border border-white/[0.08]"
    >
      {/* Subtle micro technical grid background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }} />

      {/* Stadium outline border */}
      <div className="absolute inset-3 sm:inset-4 rounded-[28px] sm:rounded-[36px] border border-white/10 overflow-hidden bg-black/40">
        {/* Grid cells */}
        <div
          className="w-full h-full grid"
          style={{
            gridTemplateRows: `repeat(${grid.length}, 1fr)`,
            gridTemplateColumns: `repeat(${grid[0]?.length || 16}, 1fr)`,
            gap: '1px'
          }}
        >
          {grid.flat().map((value, i) => (
            <div
              key={i}
              className="rounded-[1px] transition-all duration-300 hover:scale-125 hover:z-20 cursor-crosshair"
              style={{ backgroundColor: getHeatColor(value) }}
              title={`Sector Sensor Telemetry: ${(value * 100).toFixed(0)}% occupancy`}
            />
          ))}
        </div>

        {/* Pitch area representation */}
        <div className="absolute top-1/3 left-1/4 w-1/2 h-1/3 border border-emerald-500/30 bg-emerald-950/20 rounded-md flex items-center justify-center backdrop-blur-[1px]">
          <span className="text-[9px] sm:text-[10px] text-emerald-300/80 font-mono font-bold uppercase tracking-widest">
            Pitch Arena (Sec A/B)
          </span>
        </div>
      </div>

      {/* Cardinal Labels */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] text-white/50 font-mono uppercase tracking-wider font-semibold">
        North Stand [Gate A/B]
      </div>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] text-white/50 font-mono uppercase tracking-wider font-semibold">
        South Stand [Gate E/F]
      </div>
      <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] sm:text-[9px] text-white/50 font-mono uppercase tracking-wider font-semibold">
        West Stand
      </div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-[8px] sm:text-[9px] text-white/50 font-mono uppercase tracking-wider font-semibold">
        East Concourse
      </div>

      {/* Clean Legend */}
      <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-[#07090d]/90 border border-white/10 text-[9px] font-mono">
        <span className="text-white/40">0%</span>
        <div className="flex gap-0.5">
          {['rgba(34,197,94,0.6)', 'rgba(6,182,212,0.6)', 'rgba(245,158,11,0.6)', 'rgba(249,115,22,0.7)', 'rgba(244,63,94,0.8)'].map((c, i) => (
            <div key={i} className="w-3.5 h-1.5 rounded-[1px]" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-rose-400 font-bold">100%</span>
      </div>
    </motion.div>
  );
}

function generateDefaultGrid() {
  const rows = 12, cols = 16, grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      let base = Math.random() * 0.4 + 0.3;
      if ((r < 2 || r > 9) && (c < 3 || c > 12)) base += 0.2;
      if (r >= 4 && r <= 7 && c >= 5 && c <= 10) base = Math.random() * 0.2 + 0.1;
      row.push(Math.min(1, base));
    }
    grid.push(row);
  }
  return grid;
}
