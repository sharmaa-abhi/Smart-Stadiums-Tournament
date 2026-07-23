import React from 'react';
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

export default function AuthThemeToggle({ activeTheme, onThemeChange }) {
  return (
    <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md p-1.5 rounded-full border border-slate-800 shadow-lg">
      <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" /> Ambiance:
      </span>
      <div className="flex items-center gap-1">
        {Object.values(THEMES).map((theme) => {
          const Icon = theme.icon;
          const isActive = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                isActive
                  ? `${theme.badge} ${theme.activeGlow} scale-105 font-bold`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title={theme.name}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? theme.accentText : ''}`} />
              <span className="hidden sm:inline">{theme.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
