import { Router } from 'express';
import db from '../db/database.js';
import authMiddleware from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

// ── Smart AI response system ──
const STADIUM_KB = {
  greetings: ['hello', 'hi', 'hey', 'howdy', 'good morning', 'good evening'],
  crowd: ['crowd', 'density', 'occupancy', 'fans', 'attendance', 'zone', 'section'],
  security: ['security', 'incident', 'threat', 'access', 'unauthorized', 'suspicious', 'camera', 'cctv'],
  concession: ['food', 'concession', 'queue', 'wait', 'beverage', 'line', 'bar', 'restaurant'],
  transport: ['parking', 'transport', 'bus', 'shuttle', 'traffic', 'lot', 'gate', 'exit'],
  medical: ['medical', 'emergency', 'injury', 'ambulance', 'medic', 'health', 'first aid'],
  weather: ['weather', 'rain', 'temperature', 'wind', 'storm', 'forecast'],
  broadcast: ['broadcast', 'announcement', 'pa', 'message', 'alert', 'notify'],
  analytics: ['analytics', 'revenue', 'performance', 'kpi', 'metric', 'report', 'trend'],
  help: ['help', 'what can you', 'commands', 'capabilities', 'features', 'assist'],
};

const RESPONSES = {
  greetings: [
    "Hello! I'm StadiumAI, your intelligent stadium operations assistant. I'm monitoring MetLife Stadium in real-time. How can I help you today?",
    "Hey there! I'm StadiumAI — ready to help with crowd management, security, concessions, or anything else you need for the match day operations.",
  ],
  crowd: [
    "Current crowd analysis: **82,100 fans** are in-venue (99.5% capacity). Zone B shows elevated density at **4.2 persons/m²** near the main concourse. I recommend opening the overflow corridor via Gate C. Zones D and H are well below threshold at 72% and 68% respectively.",
    "Real-time crowd data shows steady inflow at Gate A and B. Peak density detected in the South Stand upper tier. I suggest activating dynamic signage to redirect fans to Zone F which has 28% spare capacity. Queue time average is 3.4 minutes — within acceptable range.",
  ],
  security: [
    "Security status: **4 zones secure**, **1 elevated** (East Gate Complex), **1 alert** (South Concourse). Active incidents: INC-2026-0848 (Lost Child - Critical, Team Delta assigned), INC-2026-0850 (Suspicious Package - Investigating, K9 Unit en route). All 130 cameras are operational. Recommend increasing patrols at South Concourse by 2 units.",
    "I've analyzed the past 30-minute security log. 3 access denials at VIP Level 2 — all flagged as credential mismatches, not hostile. The crowd surge at Gate B is subsiding. No new critical threats detected. Evacuation routes EVR-1 and EVR-2 are fully clear.",
  ],
  concession: [
    "Concession status: Food Court North has the longest queue at **35 persons**, avg wait **11.2 min** — I recommend activating the Express Lane and redirecting via digital signage. Craft Beer Garden is operational with 8-person queue. Overall concession revenue is on track for **$1.2M** this match.",
    "Current busiest concession: **Beverage Bar East** (22-person queue, 9.4 min wait). Quick Bites West has capacity — consider pushing an in-app offer to route fans there. Premium Lounge is at 65% capacity with minimal wait. Estimated revenue so far: $840K, projecting $1.1M by match end.",
  ],
  transport: [
    "Transport update: **Parking Lot D is 92% full** — variable message signs are redirecting to Lot F. Shuttle service is running on 10-minute intervals. Gate traffic flow is normal except Gate B (slight congestion due to bag check delays). Recommend opening Gate C express lane. ETA for peak departure: 3-4 hours from now.",
    "Bus and transit is running on schedule. Metro Line 2 has 15% increased capacity for tonight. Parking revenue is $280K so far. I estimate 65% of fans will use public transport post-match. Recommend coordinating with transport authorities 30 minutes before final whistle.",
  ],
  medical: [
    "Medical status: 3 active medical stations (Sections 101, 210, 308). INC-2026-0851 (Medical Emergency, Section 108) is active — Medic-3 is on scene, ETA was 15 seconds ago. 2 AED units on standby. No critical medical emergencies in the last 30 minutes. Heat index is elevated — recommend hydration reminders via PA system.",
    "Medical briefing: All 3 medical stations are staffed. Minor incidents: 2 cases of heat-related symptoms (both treated). 1 minor injury from crowd movement (treated on-site). All medical staff are in position. Consider a PA announcement reminding fans about hydration given the current temperature of 34°C.",
  ],
  weather: [
    "Current weather at MetLife Stadium: **34°C**, humidity 62%, UV index High. Wind 12 km/h from the southwest — no significant impact on play. No precipitation expected in the next 6 hours. Recommend alerting concessions to increase cold beverage stock by 25% and activating cooling mist stations at Gates A and D.",
    "Weather is clear. Temperature will peak at **36°C** around 16:00. Sunset at 20:12 — lighting system will activate automatically at 19:30. No storm warnings in the vicinity. Ideal match conditions.",
  ],
  broadcast: [
    "I can help draft broadcast messages. Currently **4 active broadcasts** are live across PA, digital screens, and the fan app. Would you like me to create a new announcement? I can target: All Channels, PA System, Digital Screens, or the Fan App. What's the message?",
    "Broadcast system status: PA operational, all 340 digital screens active, fan app push notifications enabled. Last broadcast was 8 minutes ago (Transport Advisory). Engagement rate on app broadcasts: 73% open rate. What would you like to announce?",
  ],
  analytics: [
    "Today's match performance summary: **Attendance: 82,100** (99.5% capacity). **Revenue: $4.28M** (on track for record). **Fan satisfaction: 4.7/5.0**. Incident resolution rate: **95%**. Best performing zone: VIP Level (4.9 satisfaction). Areas for improvement: Gate B throughput and Zone C concession queues.",
    "Analytics update: Revenue breakdown — Tickets $3.2M (75%), Concessions $0.85M (20%), Merchandise $0.22M (5%). Concession revenue is 12% above last match. Fan app usage: 48,000 active users. Top complaint category: Queue times (Gate B). I recommend a post-match feedback prompt to capture real-time ratings.",
  ],
  help: [
    "I'm StadiumAI, your real-time stadium intelligence assistant. I can help you with:\n\n🏟️ **Crowd Management** — density, flow, zone occupancy\n🔐 **Security** — incidents, access control, threats\n🍔 **Concessions** — queues, revenue, optimization\n🚌 **Transport** — parking, shuttles, gate flow\n🏥 **Medical** — station status, emergency alerts\n🌤️ **Weather** — conditions and advisories\n📢 **Broadcasts** — draft announcements, PA alerts\n📊 **Analytics** — revenue, KPIs, performance\n\nJust ask me anything about match day operations!",
  ],
  default: [
    "I'm analyzing your request against real-time stadium data. Based on current operations at MetLife Stadium, all systems are functioning within normal parameters. Crowd flow is steady, security is at standard alert level, and concessions are operational. Is there a specific area you'd like me to focus on?",
    "That's an interesting operational query. Let me cross-reference with our edge node data... Current status across all 8 zones is stable. I recommend checking the Security dashboard for the latest incident log and the Analytics panel for live KPI tracking. Can I help you with something more specific?",
    "Understood. I'm monitoring 247 data streams across MetLife Stadium right now. The most critical attention point right now is the elevated crowd density near Gate B — I've flagged this for the crowd management team. What else would you like to know?",
  ],
};

function getResponseCategory(message) {
  const lower = message.toLowerCase();
  for (const [category, keywords] of Object.entries(STADIUM_KB)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'default';
}

function getSmartResponse(message) {
  const category = getResponseCategory(message);
  const responses = RESPONSES[category] || RESPONSES.default;
  return responses[Math.floor(Math.random() * responses.length)];
}

// ── POST /api/ai/chat ──
router.post('/chat', (req, res) => {
  try {
    const { message, session_id } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const sid = session_id || crypto.randomUUID();
    const aiResponse = getSmartResponse(message);

    // Persist user message
    db.prepare(`
      INSERT INTO ai_conversations (session_id, role, content, user_id) VALUES (?, 'user', ?, ?)
    `).run(sid, message, req.user.id);

    // Persist AI response
    db.prepare(`
      INSERT INTO ai_conversations (session_id, role, content, user_id) VALUES (?, 'assistant', ?, ?)
    `).run(sid, aiResponse, req.user.id);

    res.json({
      session_id: sid,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── GET /api/ai/history ──
router.get('/history', (req, res) => {
  try {
    const { session_id, limit = 50 } = req.query;
    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required.' });
    }
    const history = db.prepare(`
      SELECT * FROM ai_conversations
      WHERE session_id = ? AND user_id = ?
      ORDER BY created_at ASC
      LIMIT ?
    `).all(session_id, req.user.id, parseInt(limit));

    res.json({ history });
  } catch (err) {
    console.error('AI history error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── GET /api/ai/suggestions ──
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "What's the current crowd density?",
    "Show me security incidents",
    "How are concession queues looking?",
    "What's the parking situation?",
    "Any medical emergencies?",
    "Give me the analytics overview",
    "Draft a crowd advisory broadcast",
    "What's the weather like?",
  ];
  res.json({ suggestions });
});

export default router;
