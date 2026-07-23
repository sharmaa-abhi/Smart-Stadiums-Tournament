import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Users, Zap, Volume2, VolumeX } from 'lucide-react';

export default function MatchDayHypeWidget() {
  const [hypeLevel, setHypeLevel] = useState(88);
  const [boosted, setBoosted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBoost = () => {
    setHypeLevel((prev) => Math.min(100, prev + 2));
    setBoosted(true);
    setTimeout(() => setBoosted(false), 800);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-xl relative overflow-hidden">
      {/* Background Flare */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Matchday Status</span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-slate-400 hover:text-white transition-colors p-1"
          title={soundEnabled ? 'Disable Ambiance Sound' : 'Enable Stadium Crowd Ambiance'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Countdown Grid */}
      <div className="flex items-center justify-around bg-slate-950/70 border border-slate-800/80 rounded-xl py-2 px-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-black text-amber-400 font-mono">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase">Hours</div>
        </div>
        <span className="text-slate-600 font-bold">:</span>
        <div className="text-center">
          <div className="text-lg font-black text-amber-400 font-mono">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase">Mins</div>
        </div>
        <span className="text-slate-600 font-bold">:</span>
        <div className="text-center">
          <div className="text-lg font-black text-amber-400 font-mono">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-[10px] text-slate-400 font-medium uppercase">Secs</div>
        </div>
      </div>

      {/* Hype Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> Stadium Hype Meter
          </span>
          <span className="font-bold text-amber-400">{hypeLevel}%</span>
        </div>

        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            initial={{ width: '0%' }}
            animate={{ width: `${hypeLevel}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Interactive Boost Action */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span><strong className="text-slate-200">84,210</strong> Fans Ready</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleBoost}
          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold transition-all shadow-md ${
            boosted
              ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-105'
              : 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          {boosted ? 'HYPE BOOSTED!' : 'CHEEER / BOOST'}
        </motion.button>
      </div>
    </div>
  );
}
