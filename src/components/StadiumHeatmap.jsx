import { useMemo } from 'react';
import { motion } from 'framer-motion';

function getHeatColor(value) {
  if (value < 0.3) return 'rgba(16, 185, 129, 0.6)';   // green — low density
  if (value < 0.5) return 'rgba(34, 211, 238, 0.5)';    // cyan — moderate
  if (value < 0.7) return 'rgba(251, 191, 36, 0.6)';    // amber — elevated
  if (value < 0.85) return 'rgba(249, 115, 22, 0.7)';   // orange — high
  return 'rgba(244, 63, 94, 0.8)';                       // red — critical
}

export default function StadiumHeatmap({ data }) {
  const grid = useMemo(() => data || generateDefaultGrid(), [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#0a0d1e]/90 border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
    >
      {/* Stadium outline */}
      <div className="absolute inset-4 rounded-[40px] border-2 border-cyan-500/20 overflow-hidden shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
        {/* Grid cells */}
        <div className="w-full h-full grid" style={{
          gridTemplateRows: `repeat(${grid.length}, 1fr)`,
          gridTemplateColumns: `repeat(${grid[0]?.length || 16}, 1fr)`,
          gap: '1px'
        }}>
          {grid.flat().map((value, i) => (
            <div
              key={i}
              className="rounded-sm transition-all duration-700 hover:scale-125 hover:z-20 cursor-crosshair"
              style={{ backgroundColor: getHeatColor(value) }}
              title={`Density: ${(value * 100).toFixed(0)}%`}
            />
          ))}
        </div>

        {/* Field area overlay */}
        <div className="absolute top-1/3 left-1/4 w-1/2 h-1/3 border border-cyan-400/30 bg-emerald-950/20 rounded-lg
          flex items-center justify-center backdrop-blur-[2px]">
          <span className="text-[10px] text-cyan-300/60 font-mono font-bold uppercase tracking-widest">
            Pitch Arena (Sec A/B)
          </span>
        </div>
      </div>

      {/* Zone labels */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] text-cyan-400/60 font-mono uppercase tracking-widest font-bold">
        North Stand [Gate A/B]
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] text-cyan-400/60 font-mono uppercase tracking-widest font-bold">
        South Stand [Gate E/F]
      </div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-cyan-400/60 font-mono uppercase tracking-widest font-bold">
        West Stand
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[9px] text-cyan-400/60 font-mono uppercase tracking-widest font-bold">
        East Concourse
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-4 flex items-center gap-1.5 px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-sm">
        <span className="text-[9px] font-mono text-white/40">0%</span>
        <div className="flex gap-0.5">
          {['rgba(16,185,129,0.7)', 'rgba(34,211,238,0.7)', 'rgba(251,191,36,0.7)', 'rgba(249,115,22,0.8)', 'rgba(244,63,94,0.9)'].map((c, i) => (
            <div key={i} className="w-4 h-2 rounded-sm shadow-sm" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-[9px] font-mono text-rose-400 font-bold">100%</span>
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
