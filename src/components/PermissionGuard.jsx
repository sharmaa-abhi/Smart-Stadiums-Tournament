import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

/**
 * PermissionGuard — restricts access based on explicit JWT permissions claims.
 * Usage: <PermissionGuard permission="manage:users"><UserManagementPage /></PermissionGuard>
 */
export default function PermissionGuard({ permission, children, fallback = null }) {
  const { hasPermission, user } = useAuth();
  const navigate = useNavigate();

  const allowed = hasPermission(permission);

  if (!allowed) {
    if (fallback) return fallback;
    return (
      <div className="p-6 rounded-2xl bg-surface-900/80 border border-surface-800 text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Permission Required</h3>
        <p className="text-xs text-surface-400 max-w-sm mx-auto">
          Your current role (<span className="text-cyan-400 font-semibold">{user?.role}</span>) lacks the permission claim 
          <code className="ml-1 px-2 py-0.5 bg-surface-950 text-amber-300 rounded text-xs font-mono">{permission}</code>.
        </p>
      </div>
    );
  }

  return children;
}
