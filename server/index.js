import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import database (runs table creation + seeding)
import './db/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import venueRoutes from './routes/venues.js';
import incidentRoutes from './routes/incidents.js';
import analyticsRoutes from './routes/analytics.js';
import broadcastRoutes from './routes/broadcast.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5178', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StadiumGenius API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found.` });
});

// ── Error Handler ──
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`\n🏟️  StadiumGenius API Server`);
  console.log(`   ├─ Port:    ${PORT}`);
  console.log(`   ├─ Env:     ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ├─ Auth:    JWT (${process.env.JWT_EXPIRES_IN || '7d'} expiry)`);
  console.log(`   └─ Status:  Ready ✅\n`);
});
