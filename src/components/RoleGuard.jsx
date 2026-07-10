import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldOff } from 'lucide-react';

/**
 * RoleGuard — blocks access to pages restricted to specific roles.
 * Usage: <RoleGuard roles={['admin']}><AdminPanel /></RoleGuard>
 */
export default function RoleGuard({ roles = [], children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const allowed = roles.length === 0 || roles.includes(user?.role);

  useEffect(() => {
    // Auto-redirect after 3s
    if (!allowed) {
      const t = setTimeout(() => navigate('/', { replace: true }), 3000);
      return () => clearTimeout(t);
    }
  }, [allowed, navigate]);

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto">
            <ShieldOff className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Restricted</h2>
          <p className="text-white/50 text-sm">
            Your role (<span className="text-white/80 font-semibold capitalize">{user?.role}</span>) does not have
            permission to access this page.
          </p>
          <p className="text-white/30 text-xs">Redirecting to dashboard in 3 seconds…</p>
          <button
            onClick={() => navigate('/', { replace: true })}
            className="px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 text-sm font-medium border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
