import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'stadiumgenius.db');

const db = new DatabaseSync(dbPath);

// Compatibility wrappers for better-sqlite3 API
db.pragma = (pragmaStr) => {
  try {
    return db.prepare(`PRAGMA ${pragmaStr}`).get();
  } catch (err) {
    db.exec(`PRAGMA ${pragmaStr}`);
  }
};

db.transaction = (fn) => {
  return (...args) => {
    db.exec('BEGIN TRANSACTION');
    try {
      const res = fn(...args);
      db.exec('COMMIT');
      return res;
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  };
};

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Create Tables ──
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'operator',
    avatar TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS venues (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    country TEXT NOT NULL,
    lat REAL,
    lng REAL
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    zone TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    priority TEXT DEFAULT 'medium',
    response TEXT,
    assignee TEXT,
    venue_id TEXT,
    description TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    time TEXT,
    venue_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (venue_id) REFERENCES venues(id)
  );

  CREATE TABLE IF NOT EXISTS broadcast_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'all',
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'active',
    venue_id TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (venue_id) REFERENCES venues(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS ai_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_incidents_venue_id ON incidents(venue_id);
  CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
  CREATE INDEX IF NOT EXISTS idx_alerts_venue_id ON alerts(venue_id);
  CREATE INDEX IF NOT EXISTS idx_broadcast_messages_venue_id ON broadcast_messages(venue_id);
  CREATE INDEX IF NOT EXISTS idx_broadcast_messages_status ON broadcast_messages(status);
  CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_user ON ai_conversations(session_id, user_id);
`);


// ── Seed Venues ──
const venueCount = db.prepare('SELECT COUNT(*) as count FROM venues').get();
if (venueCount.count === 0) {
  const insertVenue = db.prepare(`
    INSERT INTO venues (id, name, city, capacity, country, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const venues = [
    ['metlife', 'MetLife Stadium', 'New York/New Jersey', 82500, 'USA', 40.8135, -74.0745],
    ['sofi', 'SoFi Stadium', 'Los Angeles', 70240, 'USA', 33.9535, -118.3392],
    ['attstadium', 'AT&T Stadium', 'Dallas', 80000, 'USA', 32.7473, -97.0945],
    ['arrowhead', 'Arrowhead Stadium', 'Kansas City', 76416, 'USA', 39.0489, -94.4839],
    ['lumen', 'Lumen Field', 'Seattle', 68740, 'USA', 47.5952, -122.3316],
    ['azteca', 'Estadio Azteca', 'Mexico City', 87523, 'Mexico', 19.3029, -99.1505],
    ['bmo', 'BMO Field', 'Toronto', 45736, 'Canada', 43.6332, -79.4186],
  ];

  const insertMany = db.transaction((venues) => {
    for (const v of venues) insertVenue.run(...v);
  });
  insertMany(venues);
  console.log('✅ Seeded 7 venues');
}

// ── Seed Default Alerts ──
const alertCount = db.prepare('SELECT COUNT(*) as count FROM alerts').get();
if (alertCount.count === 0) {
  const insertAlert = db.prepare(`
    INSERT INTO alerts (type, severity, title, description, time, venue_id) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const alerts = [
    ['crowd', 'warning', 'High density detected in Zone B corridor', 'Density exceeds 4.2 persons/m² near Gate B entrance. Recommend opening overflow route via Gate C.', '2 min ago', 'metlife'],
    ['security', 'critical', 'Unauthorized access attempt — VIP Level 3', 'Invalid credential scan at VIP entrance Level 3, Section 214. Security team dispatched.', '5 min ago', 'metlife'],
    ['medical', 'warning', 'Medical assistance requested — Section 108', 'Fan reporting heat-related symptoms. Nearest medical team ETA: 90 seconds. AED unit available at Station M3.', '8 min ago', 'metlife'],
    ['concession', 'info', 'Food Court North queue exceeds threshold', 'Queue length: 35 persons, avg wait: 11.2 min. Recommend activating Express Lane and diverting via digital signage.', '12 min ago', 'metlife'],
    ['transport', 'info', 'Parking Lot D nearing capacity', '92% full. Redirecting incoming vehicles to Lot F via variable message signs. Shuttle service activated.', '15 min ago', 'metlife'],
    ['system', 'info', 'Edge node EN-07 latency spike', 'Camera cluster 7 inference latency increased to 340ms (threshold: 200ms). Failover to EN-08 initiated.', '18 min ago', 'metlife'],
  ];

  const insertManyAlerts = db.transaction((alerts) => {
    for (const a of alerts) insertAlert.run(...a);
  });
  insertManyAlerts(alerts);
  console.log('✅ Seeded 6 alerts');
}

// ── Seed Default Incidents ──
const incidentCount = db.prepare('SELECT COUNT(*) as count FROM incidents').get();
if (incidentCount.count === 0) {
  const insertIncident = db.prepare(`
    INSERT INTO incidents (incident_id, type, zone, time, status, priority, response, assignee, venue_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const incidents = [
    ['INC-2026-0847', 'Unauthorized Access', 'VIP Level 3', '14:32', 'resolved', 'high', '47s', 'Team Alpha', 'metlife'],
    ['INC-2026-0848', 'Lost Child', 'Section 204', '14:45', 'active', 'critical', '12s', 'Team Delta', 'metlife'],
    ['INC-2026-0849', 'Crowd Surge', 'Gate B', '14:51', 'monitoring', 'high', '23s', 'Team Bravo', 'metlife'],
    ['INC-2026-0850', 'Suspicious Package', 'Concourse E', '15:02', 'investigating', 'critical', '8s', 'K9 Unit', 'metlife'],
    ['INC-2026-0851', 'Medical Emergency', 'Section 108', '15:08', 'active', 'high', '15s', 'Medic-3', 'metlife'],
  ];

  const insertManyIncidents = db.transaction((incidents) => {
    for (const inc of incidents) insertIncident.run(...inc);
  });
  insertManyIncidents(incidents);
  console.log('✅ Seeded 5 incidents');
}

// ── Seed Broadcast Messages ──
const broadcastCount = db.prepare('SELECT COUNT(*) as count FROM broadcast_messages').get();
if (broadcastCount.count === 0) {
  const insertBroadcast = db.prepare(`
    INSERT INTO broadcast_messages (title, message, channel, priority, status, venue_id) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const broadcasts = [
    ['Match Day Welcome', 'Welcome to MetLife Stadium! FIFA World Cup 2026. Gates open — enjoy the match!', 'all', 'normal', 'active', 'metlife'],
    ['Transport Advisory', 'Parking Lot D is 92% full. Overflow parking available in Lot F. Shuttle service active every 10 minutes.', 'screens', 'normal', 'active', 'metlife'],
    ['Medical Notice', 'Medical assistance stations located at Sections 101, 210, 308. Staff available 24/7.', 'pa', 'high', 'active', 'metlife'],
    ['Concession Offer', 'Happy Hour at Craft Beer Garden — 20% off selected beverages until 16:00.', 'app', 'normal', 'scheduled', 'metlife'],
    ['Security Alert', 'Enhanced bag checks at Gate B. Please allow extra time for entry.', 'pa', 'urgent', 'active', 'metlife'],
  ];

  const insertManyBroadcasts = db.transaction((msgs) => {
    for (const b of msgs) insertBroadcast.run(...b);
  });
  insertManyBroadcasts(broadcasts);
  console.log('✅ Seeded 5 broadcast messages');
}

export default db;
