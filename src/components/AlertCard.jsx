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
    bg: 'bg-[#150a16]/90 border-rose-500/40 hover:border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.18)]',
    text: 'text-rose-400',
    badge: 'bg-rose-500 text-white font-mono font-bold shadow-[0_0_10px_rgba(244,63,94,0.5)]',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border border-rose-500/30',
    dot: 'bg-rose-500',
  },
  warning: {
    bg: 'bg-[#15120a]/90 border-amber-500/35 hover:border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border border-amber-500/30',
    dot: 'bg-amber-400',
  },
  info: {
    bg: 'bg-[#0b1426]/90 border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.12)]',
    text: 'text-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
};

export default function AlertCard({ alert, index = 0 }) {
  const Icon = iconMap[alert.type] || Server;
  const sev = severityMap[alert.severity] || severityMap.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 group relative overflow-hidden backdrop-blur-xl ${sev.bg}`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-2.5 rounded-xl ${sev.iconBg} ${sev.iconColor} flex-shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${sev.badge}`}>
              {alert.severity}
            </span>
            <span className="text-[11px] font-mono text-white/40 flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3 text-white/30" />
              {alert.time}
            </span>
          </div>
          <h4 className="text-sm font-bold text-white/95 mb-1 truncate font-display">{alert.title}</h4>
          <p className="text-xs text-white/50 leading-relaxed line-clamp-2 font-sans">{alert.description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-colors mt-2" />
      </div>
    </motion.div>
  );
}

