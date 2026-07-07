import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, AlertTriangle, CheckCircle2,
  Mic, Paperclip, MoreHorizontal, Copy, ThumbsUp, ThumbsDown,
  Zap, Brain, Radio, History
} from 'lucide-react';
import TopBar from '../components/TopBar';
import { CHAT_MESSAGES, INCIDENT_TEMPLATES } from '../data/mockData';

const aiResponses = [
  `Based on current telemetry, I'm observing the following key metrics:\n\n**Crowd Status:**\n- Overall occupancy: 87.3% (72,140 / 82,500)\n- Zones above threshold: Zone B (92%), Zone D (89%)\n- 3 gates operating above 80% throughput capacity\n\n**Recommendations:**\n1. ⚡ Activate overflow routing for Gate B → Gate C\n2. 📢 Push notifications to 2,100 incoming fans with alternative routes\n3. 👥 Redeploy 4 ushers from Zone H to Zone B corridor\n\nShall I execute these recommendations?`,

  `✅ **Incident Report Generated — INC-2026-0852**\n\n**Type:** Crowd density anomaly\n**Location:** Gate B / North Concourse\n**Severity:** Medium\n**Time:** ${new Date().toLocaleTimeString()}\n\n**Summary:** Crowd density at Gate B exceeded safe threshold (4.5 persons/m²) for 3 consecutive minutes. Automated reroute protocol activated at 15:12. Gate C overflow opened. Digital signage updated at 4 waypoints.\n\n**Resolution:** Density reduced to 2.8 persons/m² within 6 minutes of intervention. No injuries. Staff response time: 23 seconds.\n\n**AI Confidence:** 94% — based on 128 CCTV frames + 12 LiDAR readings + 3 turnstile sensors.`,

  `🔍 **Fan Wayfinding Query — Zone 108**\n\nBased on the current venue state, here are the optimal routes for the family arriving at Gate D:\n\n**Primary Route (fastest):** Gate D → Concourse West → Ramp W3 → Section 108\n- 📏 Distance: 180m\n- ⏱️ Est. time: 2m 45s\n- 👥 Corridor density: Low (1.2 persons/m²)\n\n**Alternative Route:** Gate D → Elevator E2 → Level 2 → Section 108\n- 📏 Distance: 210m\n- ⏱️ Est. time: 3m 15s\n- ♿ Accessible: Yes\n\nI've notified Usher Team 7 to assist at the Gate D entrance. A 10% concession voucher has been queued for their ticket account.`,

  `📊 **Half-time Prediction Summary**\n\nBased on historical patterns and current match state:\n\n**Concession demand surge expected in T-3 minutes:**\n- Food Court North: +180% demand predicted → **Activating 2 express lanes**\n- Beverage Bar East: +220% demand predicted → **Pre-staging inventory**\n- Restroom Level 2: +150% predicted → **Deploying additional cleaning crew**\n\n**Transport (post-match):**\n- Parking utilization: 94% — Lot D overflow active\n- Subway demand: ~18,000 passengers estimated → Transit authority notified\n- Ride-share staging: 340 vehicles queued\n\nAll predictions have 88-93% confidence based on 14 prior matches at this venue.`,
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  };

  const handleQuickAction = (template) => {
    setMessages(prev => [...prev, { role: 'user', content: template }]);
    setIsTyping(true);

    setTimeout(() => {
      const response = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  };

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
                  <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center
                    ${msg.role === 'user'
                      ? 'bg-brand-500/20'
                      : msg.role === 'system'
                        ? 'bg-accent-500/20'
                        : 'bg-gradient-to-br from-brand-500/30 to-accent-500/30'
                    }`}>
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-brand-400" />
                    ) : msg.role === 'system' ? (
                      <Radio className="w-3.5 h-3.5 text-accent-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                    )}
                  </div>
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
                onClick={handleSend}
                disabled={!input.trim()}
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
              {INCIDENT_TEMPLATES.map((template, i) => (
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
