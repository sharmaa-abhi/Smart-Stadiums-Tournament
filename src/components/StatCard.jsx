import { motion } from 'framer-motion';

const colorStyles = {
  brand: {
    iconBg: 'bg-cyan-500/10 border-cyan-500/30',
    iconText: 'text-cyan-400',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    border: 'hover:border-cyan-500/40',
  },
  accent: {
    iconBg: 'bg-blue-500/10 border-blue-500/30',
    iconText: 'text-blue-400',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    border: 'hover:border-blue-500/40',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/30',
    iconText: 'text-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    border: 'hover:border-emerald-500/40',
  },
  amber: {
    iconBg: 'bg-amber-500/10 border-amber-500/30',
    iconText: 'text-amber-400',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    border: 'hover:border-amber-500/40',
  },
  rose: {
    iconBg: 'bg-rose-500/10 border-rose-500/30',
    iconText: 'text-rose-400',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    border: 'hover:border-rose-500/40',
  },
};

export default function StatCard({ icon: Icon, label, value, unit, trend, trendValue, color = 'brand', delay = 0 }) {
  const c = colorStyles[color] || colorStyles.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#0e1428]/90 to-[#090c1a]/95 border border-white/[0.08] ${c.border} transition-all duration-300 group cursor-default shadow-lg`}
    >
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/20 group-hover:border-cyan-400 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/20 group-hover:border-cyan-400 transition-colors" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-mono font-medium text-white/50 uppercase tracking-wider mb-1.5">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">{value}</span>
            {unit && <span className="text-xs font-mono text-white/40">{unit}</span>}
          </div>
          {trend && (
            <div className={`flex items-center gap-1.5 mt-2 text-xs font-mono font-medium
              ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white/40'}`}>
              <span className="font-bold">{trend === 'up' ? '▲' : trend === 'down' ? '▼' : '▶'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`${c.iconBg} border p-2.5 rounded-xl ${c.glow} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`w-5 h-5 ${c.iconText}`} />
        </div>
      </div>
    </motion.div>
  );
}
