import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, AlertTriangle, CheckCircle2,
  Mic, Paperclip, MoreHorizontal, Copy, ThumbsUp, ThumbsDown,
  Zap, Brain, Radio, History
} from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const USER_ROLE_BG = {
  admin: 'bg-rose-500/20 text-rose-400',
  manager: 'bg-violet-500/20 text-violet-400',
  security: 'bg-amber-500/20 text-amber-400',
  operator: 'bg-brand-500/20 text-brand-400',
};

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm StadiumAI, your intelligent stadium operations assistant. I'm monitoring MetLife Stadium in real-time. Ask me about crowd density, security incidents, concession queues, or anything match day related!" },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [suggestions, setSuggestions] = useState([]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.aiSuggestions().then(d => setSuggestions(d.suggestions || [])).catch(() => {});
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
      const res = await api.aiChat(msg, sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: res.content }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI service. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, sessionId]);

  const handleQuickAction = (template) => handleSend(template);

  const formatContent = (content) => {
    return content.split('\n').map((line, i) => {
      // Bold
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white/90">$1</strong>');
      return (
        <span key={i} className="block" dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar title="GenAI Operational Assistant" subtitle="Multimodal AI assistant for real-time operations" />

      <div className="flex-1 flex p-6 gap-6 max-h-[calc(100vh-64px)]">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">StadiumGenius AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                  <span className="text-[10px] text-emerald-400">Connected to MetLife digital twin • 47 edge nodes active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] transition-all">
                <History className="w-4 h-4 text-white/40" />
              </button>
              <button className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] transition-all">
                <MoreHorizontal className="w-4 h-4 text-white/40" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'user' && user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover flex-shrink-0 border border-white/[0.08]"
                    />
                  ) : (
                    <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center
                      ${msg.role === 'user'
                        ? (USER_ROLE_BG[user?.role || 'operator'])
                        : msg.role === 'system'
                          ? 'bg-accent-500/20'
                          : 'bg-gradient-to-br from-brand-500/30 to-accent-500/30'
                      }`}>
                      {msg.role === 'user' ? (
                        <User className="w-3.5 h-3.5" />
                      ) : msg.role === 'system' ? (
                        <Radio className="w-3.5 h-3.5 text-accent-400" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                      )}
                    </div>
                  )}
                  <div>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-brand-500/15 text-white/90 rounded-tr-md'
                        : msg.role === 'system'
                          ? 'bg-accent-500/10 text-accent-300/80 border border-accent-500/20 rounded-tl-md text-xs'
                          : 'bg-white/[0.04] text-white/70 border border-white/[0.06] rounded-tl-md'
                      }`}>
                      {formatContent(msg.content)}
                    </div>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-1.5 ml-1">
                        <button className="p-1 rounded hover:bg-white/[0.05] transition-colors">
                          <Copy className="w-3 h-3 text-white/20 hover:text-white/50" />
                        </button>
                        <button className="p-1 rounded hover:bg-white/[0.05] transition-colors">
                          <ThumbsUp className="w-3 h-3 text-white/20 hover:text-emerald-400" />
                        </button>
                        <button className="p-1 rounded hover:bg-white/[0.05] transition-colors">
                          <ThumbsDown className="w-3 h-3 text-white/20 hover:text-rose-400" />
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
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500/30 to-accent-500/30 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-all">
                <Paperclip className="w-4 h-4 text-white/40" />
              </button>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about crowd status, generate reports, dispatch resources..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                    text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-brand-500/40
                    focus:bg-white/[0.06] transition-all duration-200"
                />
              </div>
              <button className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-all">
                <Mic className="w-4 h-4 text-white/40" />
              </button>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:hover:bg-brand-500
                  transition-all duration-200 glow-brand"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="w-72 hidden xl:flex flex-col gap-4">
          {/* Model Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent-400" />
              <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">Model Status</h4>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Model', value: 'StadiumGPT-4o', color: 'text-accent-400' },
                { label: 'Inference', value: 'Edge + Cloud', color: 'text-emerald-400' },
                { label: 'Latency', value: '142ms avg', color: 'text-brand-400' },
                { label: 'Context', value: 'Digital Twin + Live', color: 'text-amber-400' },
                { label: 'Confidence', value: '94.2%', color: 'text-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] text-white/40">{item.label}</span>
                  <span className={`text-[11px] font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4 flex-1"
          >
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-3">Quick Prompts</h4>
            <div className="space-y-2">
              {suggestions.map((template, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(template)}
                  className="w-full text-left p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05]
                    border border-white/[0.04] hover:border-white/[0.10] transition-all duration-200
                    text-xs text-white/50 hover:text-white/70 leading-relaxed"
                >
                  {template}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Safety */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Safety Checks</h4>
            </div>
            <div className="space-y-1.5">
              {['Human-in-the-loop: ON', 'Confidence threshold: 85%', 'Audit trail: Active', 'PII filter: Enabled'].map((check, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-white/40">{check}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
