import { motion } from 'framer-motion';

const colorStyles = {
  brand: {
    iconBg: 'bg-brand-500/10',
    iconText: 'text-brand-400',
    glow: 'glow-brand',
  },
  accent: {
    iconBg: 'bg-accent-500/10',
    iconText: 'text-accent-400',
    glow: 'glow-accent',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10',
    iconText: 'text-emerald-400',
    glow: 'glow-emerald',
  },
  amber: {
    iconBg: 'bg-amber-500/10',
    iconText: 'text-amber-400',
    glow: 'glow-amber',
  },
  rose: {
    iconBg: 'bg-rose-500/10',
    iconText: 'text-rose-400',
    glow: 'glow-rose',
  },
};

export default function StatCard({ icon: Icon, label, value, unit, trend, trendValue, color = 'brand', delay = 0 }) {
  const c = colorStyles[color] || colorStyles.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden group cursor-default"
    >
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
            {unit && <span className="text-sm text-white/40">{unit}</span>}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium
              ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-white/40'}`}>
              <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`${c.iconBg} p-2.5 rounded-xl ${c.glow}`}>
          <Icon className={`w-5 h-5 ${c.iconText}`} />
        </div>
      </div>
    </motion.div>
  );
}
