// ── Simulated real-time data for StadiumGenius ──

export const VENUES = [
  { id: 'metlife', name: 'MetLife Stadium', city: 'New York/New Jersey', capacity: 82500, country: 'USA', lat: 40.8135, lng: -74.0745 },
  { id: 'sofi', name: 'SoFi Stadium', city: 'Los Angeles', capacity: 70240, country: 'USA', lat: 33.9535, lng: -118.3392 },
  { id: 'attstadium', name: 'AT&T Stadium', city: 'Dallas', capacity: 80000, country: 'USA', lat: 32.7473, lng: -97.0945 },
  { id: 'arrowhead', name: 'Arrowhead Stadium', city: 'Kansas City', capacity: 76416, country: 'USA', lat: 39.0489, lng: -94.4839 },
  { id: 'lumen', name: 'Lumen Field', city: 'Seattle', capacity: 68740, country: 'USA', lat: 47.5952, lng: -122.3316 },
  { id: 'azteca', name: 'Estadio Azteca', city: 'Mexico City', capacity: 87523, country: 'Mexico', lat: 19.3029, lng: -99.1505 },
  { id: 'bmo', name: 'BMO Field', city: 'Toronto', capacity: 45736, country: 'Canada', lat: 43.6332, lng: -79.4186 },
];

export const ZONES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function generateOccupancy() {
  return ZONES.map(zone => ({
    zone,
    occupancy: Math.floor(Math.random() * 40 + 55),
    capacity: Math.floor(Math.random() * 2000 + 8000),
    current: Math.floor(Math.random() * 1500 + 5000),
    trend: Math.random() > 0.5 ? 'rising' : 'stable',
  }));
}

export function generateGateData() {
  const gates = ['Gate A', 'Gate B', 'Gate C', 'Gate D', 'Gate E', 'Gate F'];
  return gates.map(gate => ({
    name: gate,
    throughput: Math.floor(Math.random() * 300 + 100),
    queue: Math.floor(Math.random() * 150),
    status: Math.random() > 0.15 ? 'open' : 'congested',
    avgWait: (Math.random() * 8 + 1).toFixed(1),
  }));
}

export function generateConcessions() {
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

export function generateAlerts() {
  const alertTypes = [
    { type: 'crowd', severity: 'warning', title: 'High density detected in Zone B corridor', description: 'Density exceeds 4.2 persons/m² near Gate B entrance. Recommend opening overflow route via Gate C.', time: '2 min ago' },
    { type: 'security', severity: 'critical', title: 'Unauthorized access attempt — VIP Level 3', description: 'Invalid credential scan at VIP entrance Level 3, Section 214. Security team dispatched.', time: '5 min ago' },
    { type: 'medical', severity: 'warning', title: 'Medical assistance requested — Section 108', description: 'Fan reporting heat-related symptoms. Nearest medical team ETA: 90 seconds. AED unit available at Station M3.', time: '8 min ago' },
    { type: 'concession', severity: 'info', title: 'Food Court North queue exceeds threshold', description: 'Queue length: 35 persons, avg wait: 11.2 min. Recommend activating Express Lane and diverting via digital signage.', time: '12 min ago' },
    { type: 'transport', severity: 'info', title: 'Parking Lot D nearing capacity', description: '92% full. Redirecting incoming vehicles to Lot F via variable message signs. Shuttle service activated.', time: '15 min ago' },
    { type: 'system', severity: 'info', title: 'Edge node EN-07 latency spike', description: 'Camera cluster 7 inference latency increased to 340ms (threshold: 200ms). Failover to EN-08 initiated.', time: '18 min ago' },
  ];
  return alertTypes;
}

export function generateTimeSeriesData(points = 24) {
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

export function generateKPIs() {
  return {
    totalFans: Math.floor(Math.random() * 5000 + 72000),
    avgQueueTime: (Math.random() * 3 + 2.5).toFixed(1),
    incidentsResolved: Math.floor(Math.random() * 5 + 12),
    activeAlerts: Math.floor(Math.random() * 4 + 2),
    fanSatisfaction: (Math.random() * 0.5 + 4.2).toFixed(1),
    edgeNodeUptime: (Math.random() * 2 + 97.5).toFixed(1),
    securityEvents: Math.floor(Math.random() * 3 + 1),
    transportCapacity: Math.floor(Math.random() * 10 + 78),
  };
}

export const CHAT_MESSAGES = [
  { role: 'system', content: 'StadiumGenius AI Assistant initialized. Connected to MetLife Stadium digital twin. All 47 edge nodes reporting nominal. Ready for queries.' },
  { role: 'user', content: 'What\'s the current crowd status at Gate B?' },
  { role: 'assistant', content: 'Gate B is currently experiencing **elevated density** (4.2 persons/m²) with a throughput of 287 fans/min. The queue has grown to approximately 120 people with an average wait time of 6.3 minutes.\n\n**Recommendation:** I suggest opening Gate C overflow pathway and activating dynamic signage to redistribute incoming fans. Shall I trigger the reroute protocol?' },
  { role: 'user', content: 'Yes, activate the reroute protocol for Gate B overflow.' },
  { role: 'assistant', content: '✅ **Reroute Protocol Activated**\n\n• Gate C overflow pathway: **OPENED**\n• Dynamic signage updated at intersections B1, B2, B3\n• Push notifications sent to **2,147 incoming ticket holders** in Gate B zone\n• Usher dispatch: 3 additional ushers routed to Gate C\n\nI\'m monitoring density levels and will auto-deactivate when Gate B falls below 2.5 persons/m². Current projected relief: **4-6 minutes**.' },
];

export const INCIDENT_TEMPLATES = [
  'Crowd density alert — recommend gate redistribution',
  'Medical emergency — dispatch nearest response team',
  'Security breach — unauthorized zone access detected',
  'Concession queue spike — activate express service',
  'Transport congestion — redirect parking & shuttles',
  'Weather alert — initiate covered route guidance',
];

export function generateStadiumHeatmap() {
  const rows = 12;
  const cols = 16;
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      // Create realistic crowd patterns — denser near gates and concessions
      let base = Math.random() * 0.4 + 0.3;
      if ((r < 2 || r > 9) && (c < 3 || c > 12)) base += 0.2;
      if (r >= 4 && r <= 7 && c >= 5 && c <= 10) base = Math.random() * 0.2 + 0.1; // field area
      row.push(Math.min(1, base));
    }
    grid.push(row);
  }
  return grid;
}
