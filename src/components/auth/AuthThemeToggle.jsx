import React from 'react';
import { Sparkles } from 'lucide-react';
import { THEMES } from './authThemes';

// Re-export for backward compatibility
export { THEMES };

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
