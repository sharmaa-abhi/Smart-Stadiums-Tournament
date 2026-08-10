// Auth theme configuration constants
import { Sparkles, Moon, Flame } from 'lucide-react';

export const THEMES = {
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Floodlight',
    icon: Sparkles,
    bgClass: 'from-slate-950 via-purple-950/40 to-slate-950',
    cardBorder: 'border-cyan-500/30',
    glowColor: 'rgba(6, 182, 212, 0.25)',
    accentText: 'text-cyan-400',
    badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    activeGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.5)]',
  },
  nightMatch: {
    id: 'nightMatch',
    name: 'Night Match Glow',
    icon: Moon,
    bgClass: 'from-slate-950 via-slate-900 to-indigo-950/50',
    cardBorder: 'border-indigo-500/30',
    glowColor: 'rgba(99, 102, 241, 0.25)',
    accentText: 'text-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    activeGlow: 'shadow-[0_0_20px_rgba(99,102,241,0.5)]',
  },
  stadiumTurf: {
    id: 'stadiumTurf',
    name: 'Matchday Turf',
    icon: Flame,
    bgClass: 'from-slate-950 via-emerald-950/30 to-slate-950',
    cardBorder: 'border-emerald-500/30',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    accentText: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
  },
};
