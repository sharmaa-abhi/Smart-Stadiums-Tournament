import { Router } from 'express';
import db from '../db/database.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Apply auth to all venue routes
router.use(authMiddleware);

const ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// ── Helper generators (same logic as frontend mockData but server-side) ──
function generateKPIs(venue) {
  return {
    venueId: venue.id,
    venueName: venue.name,
    totalFans: Math.floor(Math.random() * 5000 + (venue.capacity * 0.85)),
    avgQueueTime: (Math.random() * 3 + 2.5).toFixed(1),
    incidentsResolved: Math.floor(Math.random() * 5 + 12),
    activeAlerts: Math.floor(Math.random() * 4 + 2),
    fanSatisfaction: (Math.random() * 0.5 + 4.2).toFixed(1),
    edgeNodeUptime: (Math.random() * 2 + 97.5).toFixed(1),
    securityEvents: Math.floor(Math.random() * 3 + 1),
    transportCapacity: Math.floor(Math.random() * 10 + 78),
    timestamp: new Date().toISOString(),
  };
}

function generateOccupancy() {
  return ZONES.map(zone => ({
    zone,
    occupancy: Math.floor(Math.random() * 40 + 55),
    capacity: Math.floor(Math.random() * 2000 + 8000),
    current: Math.floor(Math.random() * 1500 + 5000),
    trend: Math.random() > 0.5 ? 'rising' : 'stable',
  }));
}

function generateTimeSeries(points = 24) {
  const data = [];
  const now = new Date();
  for (let i = points; i >= 0; i--) {
    const time = new Date(now - i * 5 * 60000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      crowdDensity: Math.floor(Math.random() * 30 + 60),
      gateFlow: Math.floor(Math.random() * 200 + 300),
      concessionQueue: Math.floor(Math.random() * 20 + 10),
      temperature: (Math.random() * 5 + 28).toFixed(1),
    });
  }
  return data;
}

function generateHeatmap() {
  const rows = 12, cols = 16, grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      let base = Math.random() * 0.4 + 0.3;
      if ((r < 2 || r > 9) && (c < 3 || c > 12)) base += 0.2;
      if (r >= 4 && r <= 7 && c >= 5 && c <= 10) base = Math.random() * 0.2 + 0.1;
      row.push(Math.min(1, base));
    }
    grid.push(row);
  }
  return grid;
}

function generateGateData() {
  const gates = ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E', 'Gate F'];
  return gates.map(gate => ({
    name: gate,
    throughput: Math.floor(Math.random() * 300 + 100),
    queue: Math.floor(Math.random() * 150),
    status: Math.random() > 0.15 ? 'open' : 'congested',
    avgWait: (Math.random() * 8 + 1).toFixed(1),
  }));
}

function generateConcessions() {
  const items = [
    { name: 'Food Court North', type: 'food' },
    { name: 'Beverage Bar East', type: 'beverage' },
    { name: 'Food Court South', type: 'food' },
    { name: 'Premium Lounge', type: 'premium' },
    { name: 'Quick Bites West', type: 'food' },
    { name: 'Craft Beer Garden', type: 'beverage' },
  ];
  return items.map(item => ({
    ...item,
    queueLength: Math.floor(Math.random() * 40),
    avgWait: (Math.random() * 12 + 2).toFixed(1),
    revenue: Math.floor(Math.random() * 15000 + 5000),
    status: Math.random() > 0.2 ? 'operational' : 'high-demand',
  }));
}

// ── GET /api/venues ──
router.get('/', (req, res) => {
  const venues = db.prepare('SELECT * FROM venues').all();
  res.json({ venues });
});

// ── GET /api/venues/:id ──
router.get('/:id', (req, res) => {
  const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id);
  if (!venue) return res.status(404).json({ error: 'Venue not found.' });
  res.json({ venue });
});

// ── GET /api/venues/:id/kpis ──
router.get('/:id/kpis', (req, res) => {
  const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id);
  if (!venue) return res.status(404).json({ error: 'Venue not found.' });
  res.json({ kpis: generateKPIs(venue) });
});

// ── GET /api/venues/:id/live-kpis (SSE) ──
router.get('/:id/live-kpis', (req, res) => {
  const venue = db.prepare('SELECT * FROM venues WHERE id = ?').get(req.params.id);
  if (!venue) return res.status(404).json({ error: 'Venue not found.' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial data
  res.write(`data: ${JSON.stringify(generateKPIs(venue))}\n\n`);

  // Send updates periodically
  const intervalId = setInterval(() => {
    res.write(`data: ${JSON.stringify(generateKPIs(venue))}\n\n`);
  }, 2000);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

// ── GET /api/venues/:id/alerts ──
router.get('/:id/alerts', (req, res) => {
  const alerts = db.prepare('SELECT * FROM alerts WHERE venue_id = ? ORDER BY id DESC').all(req.params.id);
  res.json({ alerts });
});

// ── GET /api/venues/:id/occupancy ──
router.get('/:id/occupancy', (req, res) => {
  res.json({ occupancy: generateOccupancy() });
});

// ── GET /api/venues/:id/timeseries ──
router.get('/:id/timeseries', (req, res) => {
  const points = parseInt(req.query.points) || 24;
  res.json({ timeseries: generateTimeSeries(points) });
});

// ── GET /api/venues/:id/heatmap ──
router.get('/:id/heatmap', (req, res) => {
  res.json({ heatmap: generateHeatmap() });
});

// ── GET /api/venues/:id/gates ──
router.get('/:id/gates', (req, res) => {
  res.json({ gates: generateGateData() });
});

// ── GET /api/venues/:id/concessions ──
router.get('/:id/concessions', (req, res) => {
  res.json({ concessions: generateConcessions() });
});

export default router;
