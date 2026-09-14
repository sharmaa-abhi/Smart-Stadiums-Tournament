import { motion } from 'framer-motion';

const colorStyles = {
  brand: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/25',
    iconText: 'text-emerald-400',
    border: 'hover:border-emerald-500/40',
    badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  accent: {
    iconBg: 'bg-cyan-500/10 border-cyan-500/25',
    iconText: 'text-cyan-400',
    border: 'hover:border-cyan-500/40',
    badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 border-emerald-500/25',
    iconText: 'text-emerald-400',
    border: 'hover:border-emerald-500/40',
    badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  amber: {
    iconBg: 'bg-amber-500/10 border-amber-500/25',
    iconText: 'text-amber-400',
    border: 'hover:border-amber-500/40',
    badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  rose: {
    iconBg: 'bg-rose-500/10 border-rose-500/30',
    iconText: 'text-rose-400',
    border: 'hover:border-rose-500/45 border-rose-500/30',
    badge: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendValue,
  color = 'brand',
  delay = 0,
  contextNote,
}) {
  const c = colorStyles[color] || colorStyles.brand;
  const isCritical = color === 'rose';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className={`relative overflow-hidden rounded-xl p-4 bg-[#0a0d14]/90 border ${
        isCritical ? 'border-rose-500/35 bg-rose-950/10' : 'border-white/[0.07]'
      } ${c.border} transition-all duration-200 group cursor-default shadow-sm hover:shadow-md`}
    >
      {/* Subtle Micro-Accent Corner Lines */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-emerald-400/60 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-emerald-400/60 transition-colors" />

      {/* Card Header: Label & Icon */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white/50 truncate">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg border ${c.iconBg} transition-transform duration-150 group-hover:scale-105`}>
          <Icon className={`w-3.5 h-3.5 ${c.iconText}`} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-white/40">
            {unit}
          </span>
        )}
      </div>

      {/* Footer: Trend / Context description */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/[0.04]">
        {trend ? (
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
              trend === 'up'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                : trend === 'down'
                ? 'text-rose-400 bg-rose-500/10 border-rose-500/25'
                : 'text-white/50 bg-white/[0.04] border-white/10'
            }`}
          >
            <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
            <span>{trendValue}</span>
          </div>
        ) : (
          <span className="text-[10px] font-mono text-white/35">
            {contextNote || 'Nominal status'}
          </span>
        )}

        <span className="text-[10px] font-mono text-white/30 ml-auto">
          realtime
        </span>
      </div>
    </motion.div>
  );
}
