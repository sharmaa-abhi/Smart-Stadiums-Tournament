import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Users, ShieldAlert, UtensilsCrossed, Server, Siren,
  X, AlertTriangle, Info, CheckCircle2
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const TYPE_ICONS = {
  match: Trophy,
  crowd: Users,
  security: ShieldAlert,
  concession: UtensilsCrossed,
  system: Server,
  emergency: Siren,
};

const SEVERITY_STYLES = {
  critical: {
    bg: 'bg-surface-900/98',
    border: 'border-rose-500/40',
    icon: AlertTriangle,
    iconColor: 'text-rose-400',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
    badge: 'bg-rose-500',
  },
  warning: {
    bg: 'bg-surface-900/98',
    border: 'border-amber-500/30',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    badge: 'bg-amber-500',
  },
  info: {
    bg: 'bg-surface-900/98',
    border: 'border-brand-500/25',
    icon: Info,
    iconColor: 'text-brand-400',
    glow: 'shadow-[0_0_15px_rgba(51,120,255,0.15)]',
    badge: 'bg-brand-500',
  },
  success: {
    bg: 'bg-surface-900/98',
    border: 'border-emerald-500/25',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    badge: 'bg-emerald-500',
  },
};

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 5000;

export default function NotificationToast() {
  const { notifications, dismissNotification } = useNotifications();
  const [visibleToasts, setVisibleToasts] = useState([]);
  const shownIdsRef = useRef(new Set());

  // Watch for new notifications and add them as toasts
  useEffect(() => {
    if (notifications.length === 0) return;

    const latest = notifications[0];
    if (!latest || shownIdsRef.current.has(latest.id)) return;

    shownIdsRef.current.add(latest.id);

    setVisibleToasts(prev => {
      const next = [latest, ...prev].slice(0, MAX_TOASTS);
      return next;
    });

    // Auto-dismiss after timeout
    const timer = setTimeout(() => {
      setVisibleToasts(prev => prev.filter(t => t.id !== latest.id));
    }, AUTO_DISMISS_MS);

    return () => clearTimeout(timer);
  }, [notifications]);

  const handleDismiss = (id) => {
    setVisibleToasts(prev => prev.filter(t => t.id !== id));
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col-reverse gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast) => {
          const sev = SEVERITY_STYLES[toast.severity] || SEVERITY_STYLES.info;
          const TypeIcon = TYPE_ICONS[toast.type] || Server;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`pointer-events-auto ${sev.bg} ${sev.glow} border ${sev.border}
                backdrop-blur-xl rounded-2xl p-4 cursor-pointer group relative overflow-hidden`}
              onClick={() => handleDismiss(toast.id)}
            >
              {/* Progress bar */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-[2px] w-full origin-left ${sev.badge}`}
              />

              {/* Critical pulse */}
              {toast.severity === 'critical' && (
                <div className="absolute inset-0 rounded-2xl animate-pulse bg-rose-500/5 pointer-events-none" />
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-xl bg-white/[0.06] border border-white/[0.08] flex-shrink-0`}>
                  <TypeIcon className={`w-4 h-4 ${sev.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${sev.badge} ${toast.severity === 'critical' ? 'pulse-dot' : ''}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${sev.iconColor}`}>
                      {toast.type}
                    </span>
                    <span className="text-[9px] text-white/25 ml-auto font-mono">
                      {formatTime(toast.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white/90 leading-snug line-clamp-2">
                    {toast.title}
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDismiss(toast.id); }}
                  className="p-1 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.06]
                    transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
