import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Shield, Key, Mail, CheckCircle2, AlertTriangle, 
  LogOut, X, Clock, Settings, Sparkles, Activity 
} from 'lucide-react';

export default function UserProfilePopup({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen || !user) return null;

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'manager':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'security':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'operator':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-surface-900 border border-surface-700/60 rounded-2xl shadow-2xl overflow-hidden text-surface-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="h-28 bg-gradient-to-r from-cyan-600/30 via-indigo-600/30 to-purple-600/30 border-b border-surface-700/50 relative p-4 flex justify-between items-start">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-950/60 backdrop-blur-sm border border-surface-700/50 rounded-full text-xs font-mono text-cyan-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>SESSION ACTIVE</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-surface-950/60 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Main */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar positioning */}
          <div className="-mt-14 mb-4 flex justify-between items-end">
            <div className="relative">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-24 h-24 rounded-2xl border-4 border-surface-900 object-cover shadow-xl" 
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl border-4 border-surface-900 bg-surface-800 flex items-center justify-center text-3xl font-bold text-cyan-400 shadow-xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-surface-900 shadow-glow" />
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </span>
          </div>

          {/* Name & Email */}
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {user.name || 'Stadium User'}
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </h3>
            <p className="text-sm text-surface-400 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-surface-500" />
              {user.email}
              {user.email_verified !== false && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-1" title="Email Verified" />
              )}
            </p>
          </div>

          {/* Account Status & Last Login */}
          <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-surface-950/60 border border-surface-800 rounded-xl text-xs">
            <div>
              <span className="text-surface-500 block mb-0.5">Account Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {user.account_status || 'Active'}
              </span>
            </div>
            <div>
              <span className="text-surface-500 block mb-0.5">Last Authentication</span>
              <span className="font-mono text-surface-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-surface-400" />
                {user.last_login ? new Date(user.last_login).toLocaleTimeString() : 'Just Now'}
              </span>
            </div>
          </div>

          {/* Permissions Chips */}
          <div className="mt-5 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-surface-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              Granted System Permissions ({user.permissions?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {user.permissions && user.permissions.length > 0 ? (
                user.permissions.map((perm, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 bg-surface-800/80 hover:bg-surface-800 border border-surface-700/50 rounded-lg text-xs font-mono text-cyan-300 transition-colors"
                  >
                    {perm}
                  </span>
                ))
              ) : (
                <span className="text-xs text-surface-500 italic">Default role permissions active</span>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-surface-800 flex justify-between items-center">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-medium text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Session
            </button>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 bg-surface-950/90 backdrop-blur-md flex items-center justify-center p-6 z-20 animate-fade-in">
            <div className="text-center space-y-4 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Confirm Sign Out</h4>
              <p className="text-xs text-surface-400">
                Are you sure you want to log out of StadiumGenius? Active session tokens will be revoked.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-medium rounded-xl border border-surface-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
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
