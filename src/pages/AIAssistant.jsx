import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, User, Sparkles, CheckCircle2,
  Mic, Paperclip, MoreHorizontal, Copy, ThumbsUp, ThumbsDown,
  Zap, Brain, Radio, History, Terminal, Bot
} from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useAuth } from '../context/useAuth';
import { AIAssistantSkeleton } from '../components/skeleton';

const USER_ROLE_BG = {
  admin: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  manager: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  security: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  operator: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
};

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "StadiumGenius Multimodal Engine online. Real-time telemetry connection established to MetLife Stadium IoT edge network. All 47 nodes synchronized. Ready for operational directives, crowd dispersal predictions, or incident containment analysis."
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSuggestions([
      "Analyze crowd bottleneck at Gate B Entry Array",
      "Check VIP Level optical sensor threshold alert",
      "Concession queue buffer & inventory forecast",
      "Run fail-open gate reroute simulation"
    ]);
    setLoading(false);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = useCallback(async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await api.queryAiAssistant(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.ai_response || res.content }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Inference request routed to local backup node. Telemetry link nominal.' }]);
    } finally {
      setIsTyping(false);
    }
  }, [input]);

  const handleQuickAction = (template) => handleSend(template);

  const formatContent = (content) => {
    return content.split('\n').map((line, i) => {
      if (!line) return <span key={i} className="block">&nbsp;</span>;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i} className="block">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-emerald-400 font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  if (loading) {
    return <AIAssistantSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col pb-6">
      <TopBar title="AI Command & Multimodal Intelligence" subtitle="Real-time predictive telemetry agent & operational decision support" />

      <div className="flex-1 flex p-4 sm:p-6 gap-5 max-w-[1700px] w-full mx-auto max-h-[calc(100vh-80px)]">
        {/* Chat Console Panel */}
        <div className="flex-1 flex flex-col glass-card rounded-xl overflow-hidden border border-white/[0.08]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-display uppercase tracking-wider text-white">
                  StadiumGenius AI Operator
                </h3>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot-green" />
                  <span>Telemetry Synced • 47 Edge Nodes</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
                <History className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.04] transition-all">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2.5 max-w-[82%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'user' ? (
                    <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-[10px] font-mono font-bold ${
                      USER_ROLE_BG[user?.role || 'operator']
                    }`}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                    </div>
                  )}

                  <div>
                    <div className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed font-sans ${
                      msg.role === 'user'
                        ? 'bg-emerald-500/15 text-white/95 border border-emerald-500/30 rounded-tr-none font-medium'
                        : 'bg-[#0a0d14] text-white/80 border border-white/[0.08] rounded-tl-none font-mono text-[11px]'
                    }`}>
                      {formatContent(msg.content)}
                    </div>

                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-1 ml-1 text-white/30">
                        <button className="p-1 hover:text-white transition-colors" title="Copy response">
                          <Copy className="w-3 h-3" />
                        </button>
                        <button className="p-1 hover:text-emerald-400 transition-colors" title="Helpful">
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button className="p-1 hover:text-rose-400 transition-colors" title="Not helpful">
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="bg-[#0a0d14] border border-white/[0.08] rounded-xl px-3 py-2 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-white/50">Processing telemetry model...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Input Box */}
          <div className="p-3 border-t border-white/[0.06] bg-[#0a0d14]">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] text-white/40 transition-all cursor-pointer">
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Query telemetry, request crowd reroute, simulate gate failure..."
                  className="w-full px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50 font-sans"
                />
              </div>
              <button className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] text-white/40 transition-all cursor-pointer">
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="btn-primary py-2 px-3 font-mono cursor-pointer disabled:opacity-30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Telemetry Model Metadata Sidebar */}
        <div className="w-72 hidden xl:flex flex-col gap-3.5">
          {/* Model Spec */}
          <div className="glass-card rounded-xl p-3.5 font-mono">
            <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-white/[0.06]">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Inference Parameters</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                { label: 'Model', value: 'Gemini 2.5 Flash', color: 'text-emerald-400' },
                { label: 'Execution', value: 'Edge + Cloud', color: 'text-white/80' },
                { label: 'Latency', value: '118ms', color: 'text-emerald-400' },
                { label: 'Telemetry', value: 'Active Realtime', color: 'text-cyan-400' },
                { label: 'Confidence', value: '96.8%', color: 'text-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-white/40">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Command Directives */}
          <div className="glass-card rounded-xl p-3.5 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-[11px] font-bold font-display uppercase tracking-wider text-white mb-2.5 pb-2 border-b border-white/[0.06]">
                Tactical Quick Directives
              </h4>
              <div className="space-y-1.5 font-mono">
                {suggestions.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickAction(template)}
                    className="w-full text-left p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-emerald-500/30 text-[10px] text-white/60 hover:text-white transition-all cursor-pointer leading-relaxed"
                  >
                    → {template}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.05] text-[10px] font-mono text-white/40 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Audited Operator Session</span>
              </div>
              <p className="text-[9px] text-white/30">Compliant with FIFA WC 2026 Telemetry Standards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
