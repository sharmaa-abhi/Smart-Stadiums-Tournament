import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, MapPin, ShoppingCart, Star, Ticket, Clock, ChevronRight,
  CheckCircle, Plus, Minus, Trash2, Wifi, Battery, Signal,
  Trophy, Zap, Users, X, ArrowLeft, Bell, Search
} from 'lucide-react';
import { FanPortalSkeleton } from '../components/skeleton';

// ── Mock Data ─────────────────────────────────────────────────────────────
const MATCH = {
  home: { name: 'Brazil', flag: '🇧🇷', score: 2 },
  away: { name: 'Argentina', flag: '🇦🇷', score: 1 },
  venue: 'MetLife Stadium, NJ',
  time: '76\'',
  date: 'July 8, 2026',
  section: 'C', row: '12', seat: '34',
  gate: 'Gate C — East',
  ticketId: 'SG-2026-NYC-048291',
};

const MENU = {
  'Hot Food': [
    { id: 1, name: 'Stadium Burger', desc: 'Double beef, cheese, lettuce', price: 14.99, emoji: '🍔', popular: true },
    { id: 2, name: 'Hot Dog Deluxe', desc: 'All-beef frank, mustard, relish', price: 9.99, emoji: '🌭', popular: false },
    { id: 3, name: 'Nachos Grande', desc: 'Tortilla chips, salsa, jalapeños', price: 12.99, emoji: '🧀', popular: true },
    { id: 4, name: 'Chicken Tenders', desc: '5 pcs with dipping sauce', price: 13.99, emoji: '🍗', popular: false },
  ],
  'Drinks': [
    { id: 5, name: 'Cold Beer', desc: '500ml premium lager', price: 8.99, emoji: '🍺', popular: true },
    { id: 6, name: 'Soft Drink', desc: 'Pepsi, Diet Pepsi, 7UP', price: 4.99, emoji: '🥤', popular: false },
    { id: 7, name: 'Water Bottle', desc: '750ml still water', price: 3.49, emoji: '💧', popular: false },
    { id: 8, name: 'Energy Drink', desc: 'Red Bull 250ml', price: 5.99, emoji: '⚡', popular: false },
  ],
  'Snacks': [
    { id: 9, name: 'Popcorn (Large)', desc: 'Butter or salted', price: 7.99, emoji: '🍿', popular: true },
    { id: 10, name: 'Pretzel', desc: 'Warm, salted, mustard dip', price: 6.49, emoji: '🥨', popular: false },
    { id: 11, name: 'Ice Cream', desc: 'Vanilla, choc, strawberry', price: 5.99, emoji: '🍦', popular: false },
  ],
};

const SEAT_MAP = [
  { section: 'A', color: '#3378ff', occupied: 95, total: 120 },
  { section: 'B', color: '#22d3ee', occupied: 87, total: 110 },
  { section: 'C', color: '#8b5cf6', occupied: 72, total: 100 },
  { section: 'D', color: '#f59e0b', occupied: 65, total: 90 },
  { section: 'E', color: '#10b981', occupied: 54, total: 80 },
  { section: 'F', color: '#f43f5e', occupied: 88, total: 95 },
];

// ── Tab Components ────────────────────────────────────────────────────────

function DigitalTicket() {
  const [scanned, setScanned] = useState(false);
  return (
    <div className="space-y-4 pb-8">
      {/* Live Match Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl p-6"
        style={{ background: 'linear-gradient(135deg, #1a0533 0%, #0c1a40 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #8b5cf6 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3378ff 0%, transparent 50%)'
        }} />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-bold uppercase tracking-widest">LIVE</span>
            </div>
            <span className="text-white/40 text-xs">{MATCH.date}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-4xl mb-1">{MATCH.home.flag}</div>
              <div className="text-white font-bold text-sm">{MATCH.home.name}</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-white">
                {MATCH.home.score} <span className="text-white/30">:</span> {MATCH.away.score}
              </div>
              <div className="text-white/40 text-xs mt-1">{MATCH.time} played</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-1">{MATCH.away.flag}</div>
              <div className="text-white font-bold text-sm">{MATCH.away.name}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Digital Ticket Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative overflow-hidden rounded-3xl"
        style={{ background: 'linear-gradient(145deg, #1e2035 0%, #141728 100%)' }}
      >
        {/* Ticket perforations top */}
        <div className="flex justify-between px-6 -mt-0">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-surface-950 mt-0" />
          ))}
        </div>

        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Match Ticket</p>
              <p className="text-white font-bold">FIFA World Cup 2026</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-bold uppercase">Verified</span>
            </div>
          </div>

          {/* Seat Info */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Section', value: MATCH.section },
              { label: 'Row', value: MATCH.row },
              { label: 'Seat', value: MATCH.seat },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/[0.04] rounded-xl p-3 text-center border border-white/[0.06]">
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
                <p className="text-xl font-black text-white mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <MapPin className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">{MATCH.gate}</p>
              <p className="text-[10px] text-white/40">{MATCH.venue}</p>
            </div>
          </div>
        </div>

        {/* Dashed separator */}
        <div className="flex items-center px-4 gap-2">
          <div className="w-5 h-5 rounded-full bg-surface-950" />
          <div className="flex-1 border-t border-dashed border-white/[0.08]" />
          <div className="w-5 h-5 rounded-full bg-surface-950" />
        </div>

        {/* QR Code */}
        <div className="px-6 py-5 flex flex-col items-center">
          <div
            onClick={() => setScanned(!scanned)}
            className={`relative w-40 h-40 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 ${
              scanned ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-white/[0.06] border-2 border-white/10'
            }`}
          >
            {scanned ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-emerald-400 text-xs font-bold mt-2">SCANNED ✓</p>
              </motion.div>
            ) : (
              <QrCode className="w-24 h-24 text-white/80" strokeWidth={1} />
            )}
          </div>
          <p className="text-xs text-white/30 mt-3 font-mono">{MATCH.ticketId}</p>
          <p className="text-[10px] text-white/20 mt-1">Tap QR to simulate scan</p>
        </div>

        {/* Perforations bottom */}
        <div className="flex justify-between px-6 pb-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-surface-950" />
          ))}
        </div>
      </motion.div>

      {/* Amenities */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: Wifi, label: 'Free Wi-Fi', sub: 'StadiumNet_5G' },
          { icon: Battery, label: 'Charging', sub: 'Section C-3' },
          { icon: Bell, label: 'Alerts ON', sub: 'Push enabled' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="glass-card rounded-2xl p-3 text-center">
            <Icon className="w-5 h-5 text-brand-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-white">{label}</p>
            <p className="text-[10px] text-white/30">{sub}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function SeatNavigation() {
  const [selected, setSelected] = useState('C');
  const selectedSec = SEAT_MAP.find(s => s.section === selected);
  const pct = Math.round((selectedSec.occupied / selectedSec.total) * 100);

  return (
    <div className="space-y-4 pb-8">
      {/* Stadium SVG map */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Venue Map</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-400">Live occupancy</span>
          </div>
        </div>

        {/* Simplified oval stadium diagram */}
        <div className="relative flex items-center justify-center" style={{ height: 240 }}>
          <svg viewBox="0 0 300 200" className="w-full max-w-xs">
            {/* Pitch */}
            <ellipse cx="150" cy="100" rx="80" ry="55" fill="#1a4d1a" stroke="#2d7a2d" strokeWidth="1.5" />
            <ellipse cx="150" cy="100" rx="50" ry="35" fill="none" stroke="#2d7a2d" strokeWidth="1" strokeDasharray="4,3" />
            <line x1="150" y1="65" x2="150" y2="135" stroke="#2d7a2d" strokeWidth="1" />
            <text x="150" y="105" textAnchor="middle" fill="#4ade80" fontSize="10" fontWeight="bold">PITCH</text>

            {/* Sections */}
            {SEAT_MAP.map((sec, i) => {
              const angle = (i / SEAT_MAP.length) * Math.PI * 2 - Math.PI / 2;
              const rx = 130, ry = 88;
              const x = 150 + rx * Math.cos(angle);
              const y = 100 + ry * Math.sin(angle);
              const isSelected = sec.section === selected;
              return (
                <g key={sec.section} onClick={() => setSelected(sec.section)} style={{ cursor: 'pointer' }}>
                  <ellipse
                    cx={x} cy={y} rx={20} ry={14}
                    fill={isSelected ? sec.color : sec.color + '55'}
                    stroke={isSelected ? sec.color : 'transparent'}
                    strokeWidth={isSelected ? 2 : 0}
                    style={{ filter: isSelected ? `drop-shadow(0 0 6px ${sec.color})` : 'none' }}
                  />
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize="11" fontWeight="bold">
                    {sec.section}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Your seat indicator */}
        <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
          <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse" />
          <p className="text-xs text-brand-300">Your seat: <span className="font-bold">Section {MATCH.section}, Row {MATCH.row}, Seat {MATCH.seat}</span></p>
        </div>
      </motion.div>

      {/* Section details */}
      <motion.div
        key={selected}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Section {selected} Details</h3>
          <span className="text-xs text-white/40">{selectedSec.occupied}/{selectedSec.total} occupied</span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full"
            style={{ background: selectedSec.color }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Occupancy', value: `${pct}%`, color: pct > 85 ? 'text-rose-400' : 'text-emerald-400' },
            { label: 'Available', value: selectedSec.total - selectedSec.occupied, color: 'text-white' },
            { label: 'Nearest Exit', value: `Exit ${selected}2`, color: 'text-brand-400' },
            { label: 'Concession', value: `Stand ${selected}-A`, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
              <p className={`text-base font-bold mt-0.5 ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Navigation steps */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-white mb-3">How to reach your seat</h3>
        {[
          { step: 1, text: `Enter through ${MATCH.gate}`, icon: '🚪' },
          { step: 2, text: 'Go up to Level 2 via Escalator B', icon: '🏃' },
          { step: 3, text: 'Turn right at Concourse C', icon: '➡️' },
          { step: 4, text: 'Your seat is Row 12, Seat 34', icon: '🪑' },
        ].map(({ step, text, icon }) => (
          <div key={step} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 flex-shrink-0">
              {step}
            </div>
            <p className="text-sm text-white/60">{icon} {text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FoodOrdering() {
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState('Hot Food');
  const [ordered, setOrdered] = useState(false);
  const [orderTime, setOrderTime] = useState(null);

  const addItem = (item) => setCart(c => ({ ...c, [item.id]: { ...item, qty: (c[item.id]?.qty || 0) + 1 } }));
  const removeItem = (id) => setCart(c => {
    const updated = { ...c };
    if (updated[id]?.qty > 1) updated[id] = { ...updated[id], qty: updated[id].qty - 1 };
    else delete updated[id];
    return updated;
  });

  const cartItems = Object.values(cart);
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const placeOrder = () => {
    setOrdered(true);
    const now = new Date();
    const delivery = new Date(now.getTime() + 12 * 60000);
    setOrderTime(delivery.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    setCart({});
  };

  if (ordered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </motion.div>
        <h3 className="text-xl font-bold text-white">Order Placed! 🎉</h3>
        <p className="text-white/50 text-sm">Your food will be delivered to<br /><span className="text-white font-semibold">Section {MATCH.section}, Row {MATCH.row}, Seat {MATCH.seat}</span></p>
        <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300 font-semibold text-sm">Estimated delivery: {orderTime}</span>
        </div>
        <button onClick={() => setOrdered(false)} className="mt-4 text-brand-400 text-sm hover:text-brand-300 transition-colors">
          Order More →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="pb-32">
      {/* Category tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {Object.keys(MENU).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-brand-500 text-white shadow-[0_0_12px_rgba(51,120,255,0.4)]'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:text-white/70'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu items */}
      <div className="space-y-3 mb-4">
        {MENU[activeCategory].map(item => (
          <motion.div
            key={item.id}
            layout
            className="glass-card rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="text-3xl flex-shrink-0">{item.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{item.name}</p>
                {item.popular && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                    🔥 Popular
                  </span>
                )}
              </div>
              <p className="text-xs text-white/40 mt-0.5 truncate">{item.desc}</p>
              <p className="text-brand-400 font-bold text-sm mt-1">${item.price}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {cart[item.id] ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-white/60 hover:text-white transition-colors">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-white font-bold text-sm w-5 text-center">{cart[item.id].qty}</span>
                  <button onClick={() => addItem(item)} className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white hover:bg-brand-400 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => addItem(item)} className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 hover:bg-brand-500 hover:text-white transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Cart */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm z-50"
          >
            <button
              onClick={placeOrder}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-500 shadow-[0_8px_32px_rgba(51,120,255,0.5)]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-white" />
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-brand-600 text-[9px] font-black flex items-center justify-center">
                    {cartCount}
                  </div>
                </div>
                <span className="text-white font-semibold text-sm">Place Order</span>
              </div>
              <span className="text-white font-bold">${total.toFixed(2)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Fan Portal ───────────────────────────────────────────────────────
const TABS = [
  { id: 'ticket', label: 'My Ticket', icon: Ticket },
  { id: 'map', label: 'Seat Nav', icon: MapPin },
  { id: 'food', label: 'Food Order', icon: ShoppingCart },
];

export default function FanPortal() {
  const [activeTab, setActiveTab] = useState('ticket');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <FanPortalSkeleton />;
  }

  return (
    <div className="min-h-screen bg-surface-950"
      style={{ background: 'linear-gradient(180deg, #080c14 0%, #0d1120 100%)' }}
    >
      {/* Mobile-style status bar */}
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex items-center gap-1">
          <Signal className="w-4 h-4 text-white/60" />
          <Wifi className="w-4 h-4 text-white/60" />
        </div>
        <div className="text-white/50 text-xs font-medium">StadiumGenius Fan</div>
        <div className="flex items-center gap-1">
          <Battery className="w-4 h-4 text-white/60" />
        </div>
      </div>

      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-[0_0_16px_rgba(51,120,255,0.4)]">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Fan Portal</h1>
              <p className="text-[10px] text-white/40">FIFA World Cup 2026</p>
            </div>
          </div>
          <button className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
            <Bell className="w-4 h-4 text-white/50" />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 px-6 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
              activeTab === id
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30 shadow-[0_0_16px_rgba(51,120,255,0.2)]'
                : 'bg-white/[0.03] text-white/40 border border-white/[0.05] hover:text-white/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'ticket' && <DigitalTicket />}
            {activeTab === 'map' && <SeatNavigation />}
            {activeTab === 'food' && <FoodOrdering />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav (mobile-style) */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2"
        style={{ background: 'linear-gradient(to top, #080c14, transparent)' }}
      >
        <div className="max-w-sm mx-auto flex justify-center">
          <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-surface-950/80 backdrop-blur border border-white/[0.06]">
            {TABS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`p-2.5 rounded-xl transition-all ${
                  activeTab === id ? 'bg-brand-500 text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
