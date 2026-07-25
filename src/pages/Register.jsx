import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StadiumBackdrop } from '../components/StadiumBackdrop';

import AuthThemeToggle, { THEMES } from '../components/auth/AuthThemeToggle';
import MatchDayHypeWidget from '../components/auth/MatchDayHypeWidget';
import AuthMascotWidget from '../components/auth/AuthMascotWidget';
import StadiumGateMapPreview from '../components/auth/StadiumGateMapPreview';

const roles = [
  { value: 'operator', label: 'Operator', desc: 'Stadium operations control' },
  { value: 'security', label: 'Security', desc: 'Security & safety monitoring' },
  { value: 'manager', label: 'Manager', desc: 'Full venue management access' },
  { value: 'admin', label: 'Admin', desc: 'System administration' },
];

const ROLE_BRAND = {
  admin: {
    gradient: 'from-rose-500 to-orange-500',
    glow: 'shadow-[0_0_25px_rgba(239,68,68,0.45)]',
    logoGlow: 'shadow-[0_0_30px_rgba(239,68,68,0.25)]',
    buttonGradient: 'from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600',
  },
  manager: {
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-[0_0_25px_rgba(139,92,246,0.45)]',
    logoGlow: 'shadow-[0_0_30px_rgba(139,92,246,0.25)]',
    buttonGradient: 'from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700',
  },
  security: {
    gradient: 'from-amber-500 to-yellow-500',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.45)]',
    logoGlow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    buttonGradient: 'from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600',
  },
  operator: {
    gradient: 'from-brand-500 to-accent-500',
    glow: 'shadow-[0_0_25px_rgba(51,120,255,0.45)]',
    logoGlow: 'shadow-[0_0_30px_rgba(51,120,255,0.25)]',
    buttonGradient: 'from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600',
  },
};

const ROLE_HIGHLIGHTS = {
  admin: 'bg-rose-500/15 border-rose-500/35 text-rose-400',
  manager: 'bg-violet-500/15 border-violet-500/35 text-violet-400',
  security: 'bg-amber-500/15 border-amber-500/35 text-amber-400',
  operator: 'bg-brand-500/15 border-brand-500/35 text-brand-400',
};

const ROLE_SCANLINE = {
  admin: 'via-rose-500/35 via-orange-400/50 via-rose-500/35 shadow-[0_0_15px_rgba(244,63,94,0.4)]',
  manager: 'via-violet-500/35 via-purple-400/50 via-violet-500/35 shadow-[0_0_15px_rgba(139,92,246,0.4)]',
  security: 'via-amber-500/35 via-yellow-400/50 via-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
  operator: 'via-brand-500/35 via-accent-400/50 via-brand-500/35 shadow-[0_0_15px_rgba(34,211,238,0.4)]',
};

export default function Register() {
  const [role, setRole] = useState('operator');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState('cyberpunk');
  const [selectedSector, setSelectedSector] = useState('north_stand');

  const { signup } = useAuth();

  const brand = ROLE_BRAND[role] || ROLE_BRAND.operator;
  const themeObj = THEMES[activeTheme] || THEMES.cyberpunk;

  const handleAuth0Signup = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signup(role);
    } catch (err) {
      setError(err.message || 'Auth0 signup redirection failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeObj.bgClass} p-4 md:p-8 overflow-x-hidden relative z-0 flex flex-col justify-center items-center`}>
      <StadiumBackdrop role={role} />
      <div className={`fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent to-transparent animate-scanline pointer-events-none z-1 transition-all duration-1000 ease-in-out ${ROLE_SCANLINE[role] || ROLE_SCANLINE.operator}`} />

      {/* Header & Theme Switcher */}
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
            <p className="text-xs text-slate-400">Join Venue Operations & Fan Pass</p>
          </div>
        </div>

        <AuthThemeToggle activeTheme={activeTheme} onThemeChange={setActiveTheme} />
      </div>

      {/* Main Grid Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-start">
        {/* Left Side: Stadium Map Preview */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-4 space-y-4"
        >
          <StadiumGateMapPreview selectedSector={selectedSector} onSelectSector={setSelectedSector} />
          <MatchDayHypeWidget />
        </motion.div>

        {/* Center: Register Card — Auth0 Only */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5"
        >
          <div className={`glass-card rounded-2xl p-6 border ${themeObj.cardBorder} shadow-2xl backdrop-blur-2xl`}>
            <div className="mb-5">
              <h2 className="text-lg font-bold font-display text-white">Create Account</h2>
              <p className="text-xs text-slate-400 mt-0.5">Select your role & register securely via Auth0</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-4"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span className="text-xs text-rose-300">{error}</span>
              </motion.div>
            )}

            {/* Role Selector */}
            <div className="mb-5">
              <label className="text-xs text-slate-400 font-medium block mb-2">Select Role Profile</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-2.5 rounded-xl text-left transition-all duration-200 border ${
                      role === r.value
                        ? ROLE_HIGHLIGHTS[r.value]
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    <p className="text-xs font-semibold">{r.label}</p>
                    <p className="text-[9px] opacity-60">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Auth0 Signup — Primary CTA */}
            <button
              type="button"
              onClick={handleAuth0Signup}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r ${brand.buttonGradient} text-sm font-bold text-white shadow-lg transition-all cursor-pointer disabled:opacity-50`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4 text-white/80" />
                  Register via Auth0 Secure Signup
                </>
              )}
            </button>

            {/* Security Info */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Auth0 Enterprise Signup — Secure & Verified</span>
              </div>

              <div className="text-center">
                <span className="text-xs text-slate-400">Already registered? </span>
                <Link to="/login" className="text-xs font-bold text-cyan-400 hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: AI Mascot */}
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
        FIFA World Cup 2026 — Venue Operations Platform • Auth0 Verified
      </p>
    </div>
  );
}
