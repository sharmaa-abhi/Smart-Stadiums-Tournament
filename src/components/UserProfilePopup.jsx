import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { 
  Shield, Mail, CheckCircle2, AlertTriangle, 
  LogOut, X, Clock, Sparkles 
} from 'lucide-react';

export default function UserProfilePopup({ isOpen, onClose }) {
  const { user, logout, switchRole } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen || !user) return null;

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/35';
      case 'manager':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/35';
      case 'security':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/35';
      case 'operator':
      default:
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md bg-[#0a0d14] border border-white/[0.09] rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="h-20 bg-gradient-to-r from-emerald-950/40 via-surface-900 to-black border-b border-white/[0.07] relative p-3 flex justify-between items-start">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/60 border border-white/10 rounded text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot-green" />
            <span>SESSION ACTIVE • 5G NSA</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close user profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card Main */}
        <div className="px-5 pb-5 pt-0 relative">
          {/* Avatar positioning */}
          <div className="-mt-10 mb-3 flex justify-between items-end">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-xl border-2 border-[#0a0d14] object-cover shadow-lg" 
                />
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-[#0a0d14] bg-white/[0.07] flex items-center justify-center text-xl font-mono font-bold text-white shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border border-[#0a0d14]" />
            </div>

            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </div>

          {/* Name & Email */}
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
              {user.name || 'Stadium User'}
            </h3>
            <p className="text-xs text-white/45 flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-white/30" />
              {user.email}
              {user.email_verified !== false && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-1" title="Email Verified" />
              )}
            </p>
          </div>

          {/* Account Status & Last Login */}
          <div className="mt-3 grid grid-cols-2 gap-2 p-2.5 bg-black/40 border border-white/[0.05] rounded-lg text-xs font-mono">
            <div>
              <span className="text-white/40 text-[10px] block mb-0.5">Account Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {user.account_status || 'Active On Duty'}
              </span>
            </div>
            <div>
              <span className="text-white/40 text-[10px] block mb-0.5">Last Authentication</span>
              <span className="text-white/70 flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/30" />
                {user.last_login ? new Date(user.last_login).toLocaleTimeString() : 'Just Now'}
              </span>
            </div>
          </div>

          {/* Permissions Chips */}
          <div className="mt-4 space-y-1.5">
            <h4 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              Assigned Permissions ({user.permissions?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
              {user.permissions && user.permissions.length > 0 ? (
                user.permissions.map((perm, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded text-[10px] font-mono text-emerald-300/80"
                  >
                    {perm}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-white/40 italic">Default role permissions active</span>
              )}
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div className="mt-4 space-y-1.5">
            <h4 className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Switch Active Role Profile
            </h4>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'admin', label: 'Admin', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
                { id: 'manager', label: 'Manager', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
                { id: 'security', label: 'Security', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                { id: 'operator', label: 'Operator', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => switchRole?.(r.id)}
                  className={`py-1 px-1 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer text-center ${
                    user.role?.toLowerCase() === r.id
                      ? `${r.color} font-bold ring-1 ring-white/20`
                      : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-5 pt-3 border-t border-white/[0.06] flex justify-between items-center">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="btn-danger w-full py-2 font-mono text-xs cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out Session
            </button>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-20">
            <div className="text-center space-y-3 max-w-xs">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white font-display">Confirm Session Sign Out</h4>
              <p className="text-xs text-white/50 leading-relaxed font-sans">
                Active telemetry session tokens will be cleared and you will be returned to the main portal.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="btn-secondary py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-danger py-1.5"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
