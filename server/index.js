import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

// ── Auto-generate JWT_SECRET if not provided ──
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️  WARNING: JWT_SECRET is not set in .env — using auto-generated random secret.');
  console.warn('   Sessions will be invalidated on every server restart. Set a persistent secret in server/.env');
}

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

// ── Rate Limiting (auth endpoints) ──
const authRateLimitMap = new Map();
const AUTH_RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_RATE_MAX = process.env.NODE_ENV === 'production' ? 20 : 200; // max attempts per window

// Periodically clean up expired rate limit entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of authRateLimitMap.entries()) {
    if (now - entry.start > AUTH_RATE_WINDOW_MS) {
      authRateLimitMap.delete(key);
    }
  }
}, 60 * 1000); // run every 1 minute

function authRateLimiter(req, res, next) {
  const key = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = authRateLimitMap.get(key);

  if (!entry || now - entry.start > AUTH_RATE_WINDOW_MS) {
    authRateLimitMap.set(key, { start: now, count: 1 });
    return next();
  }

  entry.count++;
  if (entry.count > AUTH_RATE_MAX) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  return next();
}

// ── Middleware ──
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// ── Security Headers ──
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; sandbox;");
  next();
});

// ── API Routes ──
app.use('/api/auth', authRateLimiter, authRoutes);
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
