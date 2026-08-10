import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

// ── Auto-generate JWT_SECRET fallback with production warning ──
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: JWT_SECRET environment variable must be set in production mode.');
  }
  process.env.JWT_SECRET = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️  WARNING: JWT_SECRET is not set in .env — using auto-generated random secret.');
}

// Import database engine
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

// Trust reverse proxy for IP rate limiting behind Nginx/ALB
app.set('trust proxy', 1);

// ── Rate Limiting (auth endpoints) ──
const authRateLimitMap = new Map();
const AUTH_RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_RATE_MAX = process.env.NODE_ENV === 'production' ? 20 : 200;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of authRateLimitMap.entries()) {
    if (now - entry.start > AUTH_RATE_WINDOW_MS) {
      authRateLimitMap.delete(key);
    }
  }
}, 60 * 1000);

function authRateLimiter(req, res, next) {
  const key = req.ip || req.connection.remoteAddress || '127.0.0.1';
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

// ── CORS Middleware ──
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:5178', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000', 'https://stadiumgenius.io'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy rejection: Origin not permitted.'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

// ── Security Headers ──
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.auth0.com https://*.supabase.co http://127.0.0.1:8000 http://localhost:8000 http://localhost:5000; img-src 'self' data: https:; font-src 'self' data: https:; frame-ancestors 'none';"
  );
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
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
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start Server ──
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🏟️  StadiumGenius API Server`);
    console.log(`   ├─ Port:    ${PORT}`);
    console.log(`   ├─ Env:     ${process.env.NODE_ENV || 'development'}`);
    console.log(`   ├─ Auth:    JWT (${process.env.JWT_EXPIRES_IN || '7d'} expiry)`);
    console.log(`   └─ Status:  Ready ✅\n`);
  });
}

export default app;
