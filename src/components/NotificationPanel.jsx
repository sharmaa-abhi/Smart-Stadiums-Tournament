import { motion } from 'framer-motion';
import {
  Trophy, Users, ShieldAlert, UtensilsCrossed, Server, Siren,
  X, Check, Trash2, BellOff, Clock
} from 'lucide-react';
import { useNotifications } from '../context/useNotifications';
import { useEffect, useRef } from 'react';

const TYPE_ICONS = {
  match: Trophy,
  crowd: Users,
  security: ShieldAlert,
  concession: UtensilsCrossed,
  system: Server,
  emergency: Siren,
};

const SEVERITY_COLORS = {
  critical: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  warning: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  info: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/10',
  success: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
};

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, unreadCount, markAllRead, dismissNotification, clearAll } = useNotifications();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (event.target.closest('#notification-bell-btn')) {
        return;
      }
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatRelativeTime = (timestamp) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1h ago';
    return `${diffHours}h ago`;
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0a0d14]/98 backdrop-blur-2xl rounded-xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-50 flex flex-col max-h-[460px] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/[0.07] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot-green" />
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
            Telemetry Stream Alerts
          </h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500 text-white">
              {unreadCount} NEW
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllRead}
                title="Mark all as read"
                className="p-1 rounded text-white/40 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={clearAll}
                title="Clear all"
                className="p-1 rounded text-white/40 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded text-white/30 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-9 h-9 rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-white/20 mb-2">
              <BellOff className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-white/60">No pending alert events</p>
            <p className="text-[10px] text-white/30 mt-0.5 font-mono">Telemetry feeds nominal.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Server;
            const sevColor = SEVERITY_COLORS[notif.severity] || SEVERITY_COLORS.info;

            return (
              <div
                key={notif.id}
                className={`flex gap-2.5 p-3 transition-all hover:bg-white/[0.02] group relative ${
                  notif.read ? 'opacity-65' : 'bg-white/[0.01]'
                }`}
              >
                {!notif.read && (
                  <span className="absolute left-1.5 top-[18px] w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}

                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${sevColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white/45">
                      {notif.type}
                    </span>
                    <span className="text-[9px] text-white/30 ml-auto flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white/90 leading-tight mb-0.5 truncate font-sans">
                    {notif.title}
                  </h4>
                  <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                </div>

                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="absolute right-2 top-2 p-1 rounded text-white/20 hover:text-rose-400 hover:bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-all"
                  title="Dismiss notification"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2 text-center border-t border-white/[0.06] bg-white/[0.01]">
          <p className="text-[9px] font-mono text-white/35 uppercase tracking-wider">
            Telemetry Stream Connected • 5G NSA Live
          </p>
        </div>
      )}
    </motion.div>
  );
}
