import { ShieldAlert, Users, Heart, UtensilsCrossed, Bus, Server, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const iconMap = {
  crowd: Users,
  security: ShieldAlert,
  medical: Heart,
  concession: UtensilsCrossed,
  transport: Bus,
  system: Server,
};

const severityMap = {
  critical: {
    bg: 'bg-[#12080d] border-rose-500/35 hover:border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.12)]',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10 border border-rose-500/25',
    dot: 'bg-rose-500 pulse-dot-red',
  },
  warning: {
    bg: 'bg-[#121008] border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.08)]',
    text: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border border-amber-500/20',
    dot: 'bg-amber-400',
  },
  info: {
    bg: 'bg-[#090d16] border-cyan-500/25 hover:border-cyan-500/45',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 font-mono font-bold',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border border-cyan-500/20',
    dot: 'bg-cyan-400',
  },
};

export default function AlertCard({ alert, index = 0 }) {
  const Icon = iconMap[alert.type] || Server;
  const sev = severityMap[alert.severity] || severityMap.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className={`border rounded-xl p-3.5 cursor-pointer transition-all duration-150 group relative overflow-hidden ${sev.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${sev.iconBg} ${sev.iconColor} flex-shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.2 rounded text-[9px] uppercase tracking-wider ${sev.badge}`}>
              {alert.severity}
            </span>
            <span className="text-[10px] font-mono text-white/40 flex items-center gap-1 ml-auto">
              <Clock className="w-2.5 h-2.5 text-white/30" />
              {alert.time}
            </span>
          </div>
          <h4 className="text-xs font-bold text-white/95 mb-0.5 truncate font-sans">
            {alert.title}
          </h4>
          <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2 font-sans">
            {alert.description}
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-emerald-400 transition-colors mt-1" />
      </div>
    </motion.div>
  );
}
