import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// ── GET /api/analytics/overview ──
router.get('/overview', (req, res) => {
  const venues = [
    { venue: 'MetLife Stadium', attendance: 79820, revenue: 4280000, satisfaction: 4.7, incidents: 5, resolved: 4 },
    { venue: 'SoFi Stadium', attendance: 68100, revenue: 3920000, satisfaction: 4.5, incidents: 3, resolved: 3 },
    { venue: 'AT&T Stadium', attendance: 77400, revenue: 4100000, satisfaction: 4.6, incidents: 4, resolved: 4 },
    { venue: 'Arrowhead', attendance: 73200, revenue: 3650000, satisfaction: 4.4, incidents: 2, resolved: 2 },
    { venue: 'Lumen Field', attendance: 65800, revenue: 3410000, satisfaction: 4.3, incidents: 3, resolved: 2 },
  ];

  const summary = {
    totalAttendance: venues.reduce((s, v) => s + v.attendance, 0),
    totalRevenue: venues.reduce((s, v) => s + v.revenue, 0),
    avgSatisfaction: (venues.reduce((s, v) => s + v.satisfaction, 0) / venues.length).toFixed(2),
    totalIncidents: venues.reduce((s, v) => s + v.incidents, 0),
    resolutionRate: Math.round((venues.reduce((s, v) => s + v.resolved, 0) / venues.reduce((s, v) => s + v.incidents, 0)) * 100),
  };

  res.json({ overview: { venues, summary } });
});

// ── GET /api/analytics/trends ──
router.get('/trends', (req, res) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trends = days.map((day) => ({
    day,
    attendance: Math.floor(Math.random() * 20000 + 60000),
    revenue: Math.floor(Math.random() * 500000 + 3500000),
    satisfaction: parseFloat((Math.random() * 0.8 + 4.0).toFixed(2)),
    incidents: Math.floor(Math.random() * 6 + 1),
    concessionRevenue: Math.floor(Math.random() * 200000 + 800000),
    parkingRevenue: Math.floor(Math.random() * 80000 + 150000),
  }));

  res.json({ trends });
});

// ── GET /api/analytics/performance ──
router.get('/performance', (req, res) => {
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Zone E', 'Zone F', 'Zone G', 'Zone H'];
  const performance = zones.map((zone) => ({
    zone,
    crowdScore: Math.floor(Math.random() * 25 + 70),
    safetyScore: Math.floor(Math.random() * 20 + 75),
    concessionScore: Math.floor(Math.random() * 30 + 65),
    transitScore: Math.floor(Math.random() * 25 + 70),
    overallScore: Math.floor(Math.random() * 20 + 72),
  }));

  // Top metrics summary
  const metrics = [
    { label: 'Fastest Gate Throughput', value: 'Gate A', detail: '520 fans/min' },
    { label: 'Lowest Queue Wait', value: 'Concourse W', detail: '2.1 min avg' },
    { label: 'Highest Fan Rating', value: 'VIP Level', detail: '4.9 / 5.0' },
    { label: 'Best Security Score', value: 'Zone C', detail: '98/100' },
    { label: 'Peak Crowd Hour', value: '14:30 – 15:00', detail: '82,100 fans' },
    { label: 'Concession Revenue', value: '$1.2M', detail: 'Match day total' },
  ];

  res.json({ performance, metrics });
});

// ── GET /api/analytics/revenue ──
router.get('/revenue', (req, res) => {
  const breakdown = [
    { category: 'Tickets', amount: 3200000, pct: 58 },
    { category: 'Concessions', amount: 1100000, pct: 20 },
    { category: 'Merchandise', amount: 650000, pct: 12 },
    { category: 'Parking', amount: 280000, pct: 5 },
    { category: 'Sponsorship', amount: 250000, pct: 5 },
  ];
  const hourly = [];
  for (let h = 10; h <= 22; h++) {
    hourly.push({
      hour: `${h}:00`,
      revenue: Math.floor(Math.random() * 400000 + (h >= 14 && h <= 18 ? 800000 : 100000)),
      transactions: Math.floor(Math.random() * 2000 + (h >= 14 && h <= 18 ? 5000 : 500)),
    });
  }
  res.json({ breakdown, hourly });
});

export default router;
