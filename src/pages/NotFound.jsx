import { motion } from 'framer-motion';
import { EyeOff, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 stadium-grid p-6 relative overflow-hidden">
      {/* Animated scanline */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-500/20 via-accent-400/30 via-brand-500/20 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-scanline pointer-events-none z-0" />
      
      {/* Ambient glows */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] bg-brand-500/5 pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] bg-accent-500/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card max-w-md w-full rounded-2xl p-8 border border-white/[0.08] text-center relative z-10 space-y-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
          <EyeOff className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display text-white tracking-tight">404 — Sector Uncharted</h2>
          <p className="text-sm text-white/50 leading-relaxed">
            The coordinates you requested do not map to any active zone in StadiumGenius. It might be under maintenance or offline.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/25 text-xs font-semibold text-brand-400 transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Return Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
