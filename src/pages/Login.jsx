import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, AlertCircle, Shield, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StadiumBackdrop } from '../components/StadiumBackdrop';

import AuthThemeToggle, { THEMES } from '../components/auth/AuthThemeToggle';
import MatchDayHypeWidget from '../components/auth/MatchDayHypeWidget';
import AuthMascotWidget from '../components/auth/AuthMascotWidget';
import StadiumGateMapPreview from '../components/auth/StadiumGateMapPreview';

const ROLE_BRAND = {
  admin: {
    gradient: 'from-rose-500 to-orange-500',
    glow: 'shadow-[0_0_25px_rgba(239,68,68,0.45)]',
    buttonGradient: 'from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    text: 'text-rose-400 hover:text-rose-300',
    icon: 'text-rose-400',
  },
  manager: {
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-[0_0_25px_rgba(139,92,246,0.45)]',
    buttonGradient: 'from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-[0_0_20px_rgba(139,92,246,0.2)]',
    text: 'text-violet-400 hover:text-violet-300',
    icon: 'text-violet-400',
  },
  security: {
    gradient: 'from-amber-500 to-yellow-500',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.45)]',
    buttonGradient: 'from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    text: 'text-amber-400 hover:text-amber-300',
    icon: 'text-amber-400',
  },
  operator: {
    gradient: 'from-brand-500 to-accent-500',
    glow: 'shadow-[0_0_25px_rgba(51,120,255,0.45)]',
    buttonGradient: 'from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 glow-brand',
    text: 'text-brand-400 hover:text-brand-300',
    icon: 'text-brand-400',
  },
};

const ROLE_SCANLINE = {
  admin: 'via-rose-500/35 via-orange-400/50 via-rose-500/35 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
  manager: 'via-violet-500/35 via-purple-400/50 via-violet-500/35 shadow-[0_0_15px_rgba(139,92,246,0.4)]',
  security: 'via-amber-500/35 via-yellow-400/50 via-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
  operator: 'via-brand-500/35 via-accent-400/50 via-brand-500/35 shadow-[0_0_15px_rgba(34,211,238,0.4)]',
};

export default function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('operator');
  const [activeTheme, setActiveTheme] = useState('cyberpunk');
  const [selectedSector, setSelectedSector] = useState('north_stand');

  const { login } = useAuth();

  const brand = ROLE_BRAND[role] || ROLE_BRAND.operator;
  const themeObj = THEMES[activeTheme] || THEMES.cyberpunk;

  const handleAuth0Login = async (connection = null) => {
    setError('');
    setIsLoading(true);
    try {
      await login(role, connection);
    } catch (err) {
      setError(err.message || 'Auth0 redirection failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeObj.bgClass} p-4 md:p-8 overflow-x-hidden relative z-0 flex flex-col justify-center items-center`}>
      <StadiumBackdrop role={role} />
      <div className={`fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent to-transparent animate-scanline pointer-events-none z-1 transition-all duration-1000 ease-in-out ${ROLE_SCANLINE[role] || ROLE_SCANLINE.operator}`} />

      {/* Top Header & Theme Switcher */}
      <div className="w-full max-w-6xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center ${brand.glow}`}
          >
            <Zap className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              Stadium<span className="text-gradient">Genius</span>
            </h1>
            <p className="text-xs text-slate-400">Next-Gen Matchday Platform</p>
          </div>
        </div>

        <AuthThemeToggle activeTheme={activeTheme} onThemeChange={setActiveTheme} />
      </div>

      {/* Main Grid: Interactive Widgets + Login Console */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-start">
        {/* Left Side: Match Hype & Interactive Gate Map */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-4 space-y-4"
        >
          <MatchDayHypeWidget />
          <StadiumGateMapPreview selectedSector={selectedSector} onSelectSector={setSelectedSector} />
        </motion.div>

        {/* Center: Auth0 Authentication Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5"
        >
          <div className={`glass-card rounded-2xl p-6 border ${themeObj.cardBorder} shadow-2xl backdrop-blur-2xl`}>
            <div className="mb-5 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Operations Console</h2>
                <p className="text-xs text-slate-400">Select role & sign in via Auth0</p>
              </div>

              {/* Role Switcher */}
              <div className="flex gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
                {['operator', 'security', 'manager', 'admin'].map((r) => {
                  const colors = {
                    operator: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
                    security: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                    manager: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
                    admin: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  };
                  const activeColor = {
                    operator: 'bg-brand-500 text-white font-bold shadow-glow',
                    security: 'bg-amber-500 text-white font-bold shadow-glow',
                    manager: 'bg-violet-500 text-white font-bold shadow-glow',
                    admin: 'bg-rose-500 text-white font-bold shadow-glow'
                  };
                  return (
                    <button
                      key={r}
                      type="button"
                      title={`Role: ${r.toUpperCase()}`}
                      onClick={() => setRole(r)}
                      className={`px-2 py-1 text-[10px] rounded-lg border transition-all duration-200 cursor-pointer capitalize ${
                        role === r ? activeColor[r] + ' scale-105' : colors[r] + ' opacity-50 hover:opacity-100'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auth0 Social Logins */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                type="button"
                onClick={() => handleAuth0Login('google-oauth2')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white border border-slate-700/60 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google Login
              </button>

              <button
                type="button"
                onClick={() => handleAuth0Login('windowslive')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white border border-slate-700/60 transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Microsoft Login
              </button>
            </div>

            {/* Auth0 Universal Login — Primary CTA */}
            <button
              type="button"
              onClick={() => handleAuth0Login()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-sm font-bold text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4 text-cyan-200" />
                  Sign In with Auth0 (PKCE + OIDC)
                </>
              )}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mt-4"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="text-xs text-rose-300">{error}</span>
              </motion.div>
            )}

            {/* Security Badge */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Auth0 Enterprise Security — No Passwords Stored Locally</span>
              </div>

              <div className="text-center">
                <span className="text-xs text-slate-400">Don't have a Fan or Ops account? </span>
                <Link to="/register" className="text-xs font-bold text-cyan-400 hover:underline">
                  Register Fan Pass
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: AI Mascot & Tour Tips */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-3 space-y-4"
        >
          <AuthMascotWidget />
        </motion.div>
      </div>

      <p className="text-center text-[10px] text-slate-600 mt-6 uppercase tracking-wider relative z-10">
        StadiumGenius v1.0 • Auth0 RBAC Enterprise Security • No Local Passwords
      </p>
    </div>
  );
}
