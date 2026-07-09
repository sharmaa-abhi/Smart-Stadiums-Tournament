import { motion } from 'framer-motion';
import {
  Trophy, Users, ShieldAlert, UtensilsCrossed, Server, Siren,
  X, Check, Trash2, BellOff, Clock
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
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
  info: 'text-brand-400 border-brand-500/25 bg-brand-500/10',
  success: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
};

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, unreadCount, markAllRead, dismissNotification, clearAll } = useNotifications();
  const panelRef = useRef(null);

  // Close on click outside
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
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute right-0 top-14 w-96 glass-card rounded-2xl border border-white/[0.08] 
        shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 flex flex-col max-h-[500px] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold font-display text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500 text-white animate-pulse">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllRead}
                title="Mark all as read"
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={clearAll}
                title="Clear all"
                className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/[0.04] 
              flex items-center justify-center text-white/20 mb-3">
              <BellOff className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-white/60">No notification alerts</p>
            <p className="text-[10px] text-white/30 mt-1">Live updates will stream in as events occur.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Server;
            const sevColor = SEVERITY_COLORS[notif.severity] || SEVERITY_COLORS.info;

            return (
              <div
                key={notif.id}
                className={`flex gap-3 p-4 transition-all hover:bg-white/[0.02] group relative
                  ${notif.read ? 'opacity-70' : 'bg-brand-500/[0.02]'}`}
              >
                {/* Indicator Dot */}
                {!notif.read && (
                  <span className="absolute left-2 top-[22px] w-1.5 h-1.5 rounded-full bg-brand-500 pulse-dot" />
                )}

                {/* Type Icon Badge */}
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 ${sevColor}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      {notif.type}
                    </span>
                    <span className="text-[9px] text-white/25 ml-auto flex items-center gap-1 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(notif.timestamp)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white/90 leading-normal mb-0.5">
                    {notif.title}
                  </h4>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Individual Dismiss Button */}
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="absolute right-2 top-2 p-1 rounded-md text-white/10 hover:text-rose-400 
                    hover:bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-all"
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
        <div className="p-3 text-center border-t border-white/[0.06] bg-white/[0.01]">
          <p className="text-[9px] text-white/30 uppercase tracking-widest">
            Connected to 5G stadium control network
          </p>
        </div>
      )}
    </motion.div>
  );
}
