import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StadiumBackdrop } from '../components/StadiumBackdrop';

const ROLE_BRAND = {
  admin: {
    gradient: 'from-rose-500 to-orange-500',
    glow: 'shadow-[0_0_25px_rgba(239,68,68,0.45)]',
    logoGlow: 'shadow-[0_0_30px_rgba(239,68,68,0.25)]',
    buttonGradient: 'from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    text: 'text-rose-400 hover:text-rose-300',
    icon: 'text-rose-400',
  },
  manager: {
    gradient: 'from-violet-500 to-purple-600',
    glow: 'shadow-[0_0_25px_rgba(139,92,246,0.45)]',
    logoGlow: 'shadow-[0_0_30px_rgba(139,92,246,0.25)]',
    buttonGradient: 'from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-[0_0_20px_rgba(139,92,246,0.2)]',
    text: 'text-violet-400 hover:text-violet-300',
    icon: 'text-violet-400',
  },
  security: {
    gradient: 'from-amber-500 to-yellow-500',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.45)]',
    logoGlow: 'shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    buttonGradient: 'from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    text: 'text-amber-400 hover:text-amber-300',
    icon: 'text-amber-400',
  },
  operator: {
    gradient: 'from-brand-500 to-accent-500',
    glow: 'shadow-[0_0_25px_rgba(51,120,255,0.45)]',
    logoGlow: 'shadow-[0_0_30px_rgba(51,120,255,0.25)]',
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState('operator');
  const { login } = useAuth();
  const navigate = useNavigate();

  const brand = ROLE_BRAND[role] || ROLE_BRAND.operator;

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    const lowerVal = val.toLowerCase();
    if (lowerVal.includes('admin')) {
      setRole('admin');
    } else if (lowerVal.includes('security') || lowerVal.includes('guard')) {
      setRole('security');
    } else if (lowerVal.includes('manager') || lowerVal.includes('director')) {
      setRole('manager');
    } else if (lowerVal.includes('operator') || lowerVal.includes('staff')) {
      setRole('operator');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4 overflow-hidden relative z-0">
      {/* Dynamic interactive stadium wireframe backdrop */}
      <StadiumBackdrop role={role} />

      {/* Animated scanline */}
      <div className={`fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent to-transparent animate-scanline pointer-events-none z-1 transition-all duration-1000 ease-in-out ${ROLE_SCANLINE[role] || ROLE_SCANLINE.operator}`} />

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
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${brand.gradient} flex items-center justify-center mx-auto mb-4 ${brand.glow} transition-all duration-500`}
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight">
            Stadium<span className="text-gradient">Genius</span>
          </h1>
          <p className="text-sm text-white/40 mt-1">AI-Powered Smart Stadium Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 border border-white/[0.08]">
          <div className="mb-6 flex justify-between items-start gap-4">
            <div>
              <h2 className="text-lg font-bold font-display text-white/90">Welcome back</h2>
              <p className="text-sm text-white/40 mt-1">Sign in to your operations console</p>
            </div>
            
            {/* Quick theme selector pill/icons */}
            <div className="flex gap-1.5 p-1.5 bg-white/[0.02] border border-white/[0.06] rounded-xl self-center shrink-0">
              {['operator', 'security', 'manager', 'admin'].map((r) => {
                const colors = {
                  operator: 'bg-brand-500 shadow-[0_0_8px_rgba(51,120,255,0.4)]',
                  security: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]',
                  manager: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]',
                  admin: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                };
                return (
                  <button
                    key={r}
                    type="button"
                    title={`Preview Console: ${r.charAt(0).toUpperCase() + r.slice(1)}`}
                    onClick={() => setRole(r)}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 hover:scale-125 cursor-pointer ${colors[r]} ${
                      role === r ? 'ring-2 ring-white scale-110' : 'opacity-35 hover:opacity-80'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setError('');
              try {
                await login(undefined, undefined, role);
                navigate('/', { replace: true });
              } catch (err) {
                setError(err.message || 'Auth0 login failed.');
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1]
              text-sm font-semibold text-white border border-white/[0.08] transition-all duration-200 mb-5 cursor-pointer"
          >
            <Shield className={`w-4 h-4 ${brand.icon} animate-pulse`} />
            Continue with Auth0
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-white/[0.06]"></div>
            <span className="flex-shrink mx-4 text-white/20 text-[10px] font-semibold uppercase tracking-wider">or sign in with email</span>
            <div className="flex-grow border-t border-white/[0.06]"></div>
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
            {/* Email */}
            <div>
              <label className="text-xs text-white/50 font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="operator@stadiumgenius.io"
                  required
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                    text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:bg-white/[0.06] transition-all duration-200
                    ${role === 'admin' ? 'focus:border-rose-500/40' : role === 'manager' ? 'focus:border-violet-500/40' : role === 'security' ? 'focus:border-amber-500/40' : 'focus:border-brand-500/40'}`}
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
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className={`w-full pl-11 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                    text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:bg-white/[0.06] transition-all duration-200
                    ${role === 'admin' ? 'focus:border-rose-500/40' : role === 'manager' ? 'focus:border-violet-500/40' : role === 'security' ? 'focus:border-amber-500/40' : 'focus:border-brand-500/40'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r ${brand.buttonGradient}
                text-sm font-semibold text-white transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white/30">
              Don't have an account?{' '}
              <Link to="/register" className={`${brand.text} font-medium transition-colors`}>
                Create one
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
