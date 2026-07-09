import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// ── Notification templates pool ─────────────────────────────────────────────
const NOTIFICATIONS = [
  // ⚽ Match Events
  { type: 'match', severity: 'info', title: '⚽ GOAL! Argentina scores!', message: 'Lionel Messi finds the back of the net — 2-1 in the 67th minute. Crowd eruption detected in Zones A-D.' },
  { type: 'match', severity: 'info', title: '⚽ GOAL! Brazil equalizes!', message: 'Vinícius Jr. strikes from the edge of the box — 2-2. Fan energy index spiked to 9.4/10.' },
  { type: 'match', severity: 'warning', title: '🟨 Yellow Card — Player #7', message: 'Tactical foul near the halfway line. Referee shows yellow. Crowd tension rising in Section 112-114.' },
  { type: 'match', severity: 'critical', title: '🟥 Red Card — Player #4', message: 'Dangerous tackle — straight red. Security teams on standby near away supporter zones.' },
  { type: 'match', severity: 'info', title: '🔄 Substitution — 72nd minute', message: 'Tactical change: fresh legs coming on. Concession queues expected to drop as fans return to seats.' },
  { type: 'match', severity: 'info', title: '⏱️ Half-Time Whistle', message: 'First half ends 1-1. Expect surge at concessions and restrooms. Gate flow reversal protocols active.' },
  { type: 'match', severity: 'info', title: '⏱️ Second Half Kick-Off', message: 'Match resumed. Concession queues clearing. 94% of fans back in seats.' },
  { type: 'match', severity: 'info', title: '🏆 Full-Time! Final score 3-2', message: 'Match concluded. Exit management protocol initiated. All gates opening in sequence.' },
  { type: 'match', severity: 'warning', title: '⚽ VAR Review in Progress', message: 'Potential penalty situation. Crowd noise levels exceeding 108 dB in lower bowl sections.' },
  { type: 'match', severity: 'info', title: '⚽ Penalty Kick Awarded!', message: 'Penalty to the home side. Medical teams prepped — high emotional intensity detected.' },

  // 👥 Crowd Alerts
  { type: 'crowd', severity: 'warning', title: 'Zone B density exceeding threshold', message: 'Crowd density at 4.3 persons/m² near Gate B corridor. Recommend opening overflow route via Gate C.' },
  { type: 'crowd', severity: 'critical', title: 'Crowd surge detected — Gate A', message: 'Sudden influx at Gate A. Throughput spiked to 420 fans/min. Activating crowd throttling protocol.' },
  { type: 'crowd', severity: 'info', title: 'Zone D crowd thinning', message: 'Density dropped below 2.0 persons/m². Normal flow restored. Overflow routes can be closed.' },
  { type: 'crowd', severity: 'warning', title: 'Concourse Level 2 congestion', message: 'Foot traffic bottleneck near restroom cluster L2-R3. Suggest opening alternate route through service corridor.' },
  { type: 'crowd', severity: 'info', title: 'Gate F flow rate optimal', message: 'Throughput steady at 280 fans/min. Queue length: 45 persons. Average wait: 2.1 minutes.' },
  { type: 'crowd', severity: 'warning', title: 'Exit rush beginning — South gates', message: 'Early leavers detected. Gates D-F experiencing 35% flow increase. Transport coordination notified.' },

  // 🛡️ Security Events
  { type: 'security', severity: 'critical', title: 'Unauthorized access — VIP Level 3', message: 'Invalid credential scan at VIP entrance Level 3, Section 214. Security team dispatched. ETA: 45 seconds.' },
  { type: 'security', severity: 'warning', title: 'Unattended bag — Section 305', message: 'Object detected by Camera EN-12. Nearest patrol unit alerted. Bomb squad on standby per protocol.' },
  { type: 'security', severity: 'critical', title: 'Fight reported — Section 128', message: 'Physical altercation between fans. Security units Alpha-3 and Alpha-7 responding. Medical standby activated.' },
  { type: 'security', severity: 'info', title: 'Perimeter sweep complete', message: 'All 16 sectors cleared. No anomalies detected. Next sweep scheduled in 30 minutes.' },
  { type: 'security', severity: 'warning', title: 'Suspicious behavior — Camera 47', message: 'AI flagged unusual movement pattern near equipment room B. Security officer dispatched for visual check.' },
  { type: 'security', severity: 'info', title: 'Credential scan anomaly resolved', message: 'False positive at Gate E — expired staff badge. Staff member verified and re-credentialed.' },

  // 🍔 Concessions
  { type: 'concession', severity: 'warning', title: 'Food Court North — queue spike', message: 'Queue length: 42 persons, avg wait: 14.2 min. Recommend activating Express Lane and mobile ordering push.' },
  { type: 'concession', severity: 'info', title: 'Beverage Bar East — revenue milestone', message: 'Revenue hit $28,500 — 15% above projection. Top seller: craft beer flight ($18).' },
  { type: 'concession', severity: 'warning', title: 'Premium Lounge — low stock alert', message: 'Wagyu sliders inventory at 12% (18 remaining). Resupply ETA: 8 minutes from central kitchen.' },
  { type: 'concession', severity: 'info', title: 'Quick Bites West — all queues clear', message: 'Average wait time dropped to 1.8 min. Staffing levels optimal.' },
  { type: 'concession', severity: 'info', title: 'Half-time rush handled successfully', message: 'Peak throughput: 340 orders/min across all outlets. Zero stockouts. Revenue: $52,300 in 15 min.' },

  // 📡 System Events
  { type: 'system', severity: 'warning', title: 'Edge Node EN-07 latency spike', message: 'Camera cluster 7 inference latency increased to 340ms (threshold: 200ms). Auto-failover to EN-08 initiated.' },
  { type: 'system', severity: 'info', title: 'All 47 edge nodes reporting nominal', message: 'System health check complete. Average latency: 42ms. GPU utilization: 67%. No anomalies.' },
  { type: 'system', severity: 'critical', title: 'Sensor offline — Zone G thermal', message: 'Temperature sensor array in Zone G not responding. Last reading: 31.2°C. Maintenance dispatched.' },
  { type: 'system', severity: 'info', title: '5G mesh network — optimal throughput', message: 'Fan WiFi: 12.4 Gbps aggregate. 34,200 connected devices. Latency: 8ms average.' },
  { type: 'system', severity: 'warning', title: 'CCTV Camera 23 image degraded', message: 'Night-vision mode artifacts detected on Camera 23 (Zone D entrance). Lens cleaning scheduled.' },
  { type: 'system', severity: 'info', title: 'AI model update deployed', message: 'Crowd density v3.2 model pushed to all edge nodes. Accuracy improved from 94.1% to 96.3%.' },

  // 🚑 Emergency
  { type: 'emergency', severity: 'critical', title: 'Medical emergency — Section 108', message: 'Fan reporting cardiac symptoms. Nearest AED unit: Station M3 (22m away). Paramedic team dispatched, ETA: 60s.' },
  { type: 'emergency', severity: 'warning', title: 'Weather alert — lightning detected', message: 'Lightning strike 8.2 km from venue. Monitoring closely. Covered route guidance on standby.' },
  { type: 'emergency', severity: 'critical', title: 'Fire alarm — Concession Kitchen B', message: 'Smoke detector triggered in Kitchen B. Sprinkler system activated. Fire marshal responding. No evacuation yet.' },
  { type: 'emergency', severity: 'info', title: 'Medical all-clear — Section 108', message: 'Patient stabilized and transported to on-site medical center. Incident report filed. Area cleared.' },
  { type: 'emergency', severity: 'warning', title: 'Heat advisory — field level', message: 'Temperature at field level: 38°C. Cooling stations activated. Water distribution increased in Zones A-C.' },
];

let notificationCounter = 0;

function generateNotification() {
  const template = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)];
  notificationCounter++;
  return {
    id: `notif-${Date.now()}-${notificationCounter}`,
    ...template,
    timestamp: new Date().toISOString(),
    read: false,
  };
}

// ── SSE Stream ──────────────────────────────────────────────────────────────
router.get('/stream', authMiddleware, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial batch of 3 notifications
  const initial = Array.from({ length: 3 }, () => generateNotification());
  initial.forEach(n => {
    res.write(`data: ${JSON.stringify(n)}\n\n`);
  });

  // Stream new notifications at random intervals (8-15 seconds)
  function scheduleNext() {
    const delay = Math.floor(Math.random() * 7000) + 8000; // 8-15s
    return setTimeout(() => {
      try {
        const notification = generateNotification();
        res.write(`data: ${JSON.stringify(notification)}\n\n`);
        timerId = scheduleNext();
      } catch {
        // Client disconnected
      }
    }, delay);
  }

  let timerId = scheduleNext();

  req.on('close', () => {
    clearTimeout(timerId);
  });
});

export default router;
