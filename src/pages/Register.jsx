import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Shield, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const brand = ROLE_BRAND[role] || ROLE_BRAND.operator;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 stadium-grid p-4 overflow-hidden relative z-0">
      {/* Animated scanline */}
      <div className={`fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent to-transparent animate-scanline pointer-events-none z-1 transition-all duration-500 ${ROLE_SCANLINE[role] || ROLE_SCANLINE.operator}`} />

      {/* Ambient glows */}
      <div className={`fixed top-0 right-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-500 z-1
        ${role === 'admin' ? 'bg-rose-500/8' : role === 'manager' ? 'bg-violet-500/8' : role === 'security' ? 'bg-amber-500/8' : 'bg-accent-500/8'}`} />
      <div className={`fixed bottom-0 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none transition-all duration-500 z-1
        ${role === 'admin' ? 'bg-orange-500/6' : role === 'manager' ? 'bg-purple-500/6' : role === 'security' ? 'bg-yellow-500/6' : 'bg-brand-500/6'}`} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center mx-auto mb-4 ${brand.glow}`}
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Stadium<span className="text-gradient">Genius</span>
          </h1>
          <p className="text-sm text-white/40 mt-1">Join the operations team</p>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-2xl p-8 border border-white/[0.08]">
          <div className="mb-6">
            <h2 className="text-lg font-bold font-display text-white/90">Create account</h2>
            <p className="text-sm text-white/40 mt-1">Set up your credentials</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 mb-5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span className="text-xs text-rose-300">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-white/50 font-medium block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                    text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-brand-500/40
                    focus:bg-white/[0.06] transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-white/50 font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@stadiumgenius.io"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                    text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-brand-500/40
                    focus:bg-white/[0.06] transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white/50 font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                    text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-brand-500/40
                    focus:bg-white/[0.06] transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="text-xs text-white/50 font-medium block mb-1.5">
                <Shield className="w-3 h-3 inline mr-1 text-white/40" />
                Role Profile
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-2.5 rounded-xl text-left transition-all duration-200 border
                      ${role === r.value
                        ? ROLE_HIGHLIGHTS[r.value]
                        : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:text-white/70'
                      }`}
                  >
                    <p className="text-xs font-semibold">{r.label}</p>
                    <p className="text-[9px] opacity-60 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r ${brand.buttonGradient}
                text-sm font-semibold text-white transition-all duration-200 ${brand.logoGlow} mt-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/30">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-white/20 mt-6 uppercase tracking-wider">
          FIFA World Cup 2026 — Venue Operations Platform
        </p>
      </motion.div>
    </div>
  );
}
