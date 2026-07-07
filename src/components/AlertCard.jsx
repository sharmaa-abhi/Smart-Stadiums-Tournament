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
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300',
    dot: 'bg-rose-500',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300',
    dot: 'bg-amber-500',
  },
  info: {
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    text: 'text-brand-400',
    badge: 'bg-brand-500/20 text-brand-300',
    dot: 'bg-brand-500',
  },
};

export default function AlertCard({ alert, index = 0 }) {
  const Icon = iconMap[alert.type] || Server;
  const sev = severityMap[alert.severity] || severityMap.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`${sev.bg} border ${sev.border} rounded-xl p-4 cursor-pointer
        hover:border-opacity-60 transition-all duration-300 group`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${sev.badge}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} ${alert.severity === 'critical' ? 'pulse-dot' : ''}`} />
            <span className={`text-xs font-semibold uppercase tracking-wider ${sev.text}`}>
              {alert.severity}
            </span>
            <span className="text-[10px] text-white/30 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {alert.time}
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white/90 mb-1 truncate">{alert.title}</h4>
          <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{alert.description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors mt-1" />
      </div>
    </motion.div>
  );
}
