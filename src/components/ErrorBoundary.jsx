import React from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an uncaught rendering error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-950 stadium-grid p-6">
          {/* Animated scanline */}
          <div className="fixed top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/20 via-orange-400/30 via-rose-500/20 to-transparent shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-scanline pointer-events-none z-0" />
          
          <div className="glass-card max-w-lg w-full rounded-2xl p-8 border border-rose-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative z-10 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display text-white tracking-tight">System Glitch Intercepted</h2>
              <p className="text-sm text-white/50 leading-relaxed">
                StadiumAI has caught an unexpected rendering exception on this dashboard screen. Telemetry feeds remain secure in the background.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/10 text-left">
                <p className="text-[10px] uppercase font-bold text-rose-400 tracking-wider mb-1">Diagnostic Log</p>
                <p className="font-mono text-[11px] text-rose-300/80 break-words leading-normal">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/25 text-xs font-semibold text-brand-400 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset & Retry
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-semibold text-white/70 hover:text-white transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
