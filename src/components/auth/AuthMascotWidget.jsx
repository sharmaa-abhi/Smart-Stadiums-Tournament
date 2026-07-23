import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, ChevronRight, HelpCircle, ShieldCheck, Ticket } from 'lucide-react';

const MASCOT_TIPS = [
  {
    title: "⚡ Matchday Tip",
    text: "Gate B and North Stand entry lanes have zero queue times right now. Enter swiftly!",
    icon: Ticket,
    color: "text-cyan-400"
  },
  {
    title: "🛡️ Fast Security Pass",
    text: "Ensure facial recognition or QR ticket is ready on your screen for seamless biometric entry.",
    icon: ShieldCheck,
    color: "text-amber-400"
  },
  {
    title: "🏟️ Smart Stadium AI",
    text: "Select your section on the map preview to get real-time concession stand & parking updates!",
    icon: Sparkles,
    color: "text-violet-400"
  }
];

export default function AuthMascotWidget() {
  const [tipIndex, setTipIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const currentTip = MASCOT_TIPS[tipIndex];
  const Icon = currentTip.icon;

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % MASCOT_TIPS.length);
  };

  return (
    <div className="relative">
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mascot Avatar with Glow */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="relative p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 shadow-[0_0_15px_rgba(51,120,255,0.4)]"
            >
              <Bot className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </motion.div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">StadiaBot</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  AI Tour Guide
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Smart Arena Virtual Assistant</p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {isExpanded ? 'Hide' : 'Ask AI'}
          </button>
        </div>

        {/* Mascot Speech Bubble Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/90 relative">
                {/* Speech arrow */}
                <div className="absolute -top-1.5 left-5 w-3 h-3 bg-slate-950 border-t border-l border-slate-800 rotate-45" />

                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className={`text-xs font-bold flex items-center gap-1.5 ${currentTip.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {currentTip.title}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{currentTip.text}</p>
                  </div>

                  <button
                    onClick={nextTip}
                    className="mt-0.5 p-1 rounded-lg bg-slate-800 hover:bg-brand-600 text-slate-300 hover:text-white transition-colors"
                    title="Next Stadium Tip"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
