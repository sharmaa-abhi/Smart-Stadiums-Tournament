import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Zap } from 'lucide-react';

/**
 * PWAInstallBanner — shows "Install App" prompt when browser fires
 * the beforeinstallprompt event. Works on Chrome/Edge/Android.
 */
export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          if (import.meta.env.DEV) console.log('[PWA] Service worker registered:', reg.scope);
          setSwReady(true);
        })
        .catch((err) => console.error('[PWA] SW registration failed:', err));
    }

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 3 seconds
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShow(false);
      setDeferredPrompt(null);
      if (import.meta.env.DEV) console.log('[PWA] App installed successfully');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (import.meta.env.DEV) console.log('[PWA] Install outcome:', outcome);
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-dismissed', 'true');
  };

  if (!show || installed || sessionStorage.getItem('pwa-dismissed')) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90vw] max-w-sm animate-slide-up">
      <div className="glass-card rounded-2xl p-4 border border-brand-500/30 shadow-[0_0_40px_rgba(51,120,255,0.2)]">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(51,120,255,0.4)]">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-sm font-semibold text-white">Install StadiumGenius</p>
            <p className="text-xs text-white/50 mt-0.5">
              Add to home screen for instant access, offline support & push alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5 flex-1">
            {[
              { icon: Smartphone, label: 'Works offline' },
              { icon: Download, label: 'Native feel' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1 text-[10px] text-white/40">
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-[0_0_12px_rgba(51,120,255,0.3)]"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
        </div>

        {swReady && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-white/[0.06]">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-white/30">Service worker active — offline ready</span>
          </div>
        )}
      </div>
    </div>
  );
}
