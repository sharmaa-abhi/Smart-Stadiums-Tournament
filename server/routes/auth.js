import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import authMiddleware from '../middleware/auth.js';
import { sanitizeUser } from '../utils/sanitize.js';

const router = Router();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── POST /api/auth/auth0-login ── (The ONLY login method)
router.post('/auth0-login', async (req, res) => {
  const { email, name, avatar, role } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Check if user already exists
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    const allowedRoles = isDev
      ? ['operator', 'security', 'manager', 'admin']
      : ['operator', 'security', 'manager'];

    if (!user) {
      const safeRole = (role && allowedRoles.includes(role)) ? role : 'operator';

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);
      const stmt = db.prepare(`
        INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(name || email.split('@')[0], email, hashedPassword, safeRole, avatar || null);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    } else if (role && allowedRoles.includes(role) && user.role !== role) {
      db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, user.id);
      user.role = role;
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful via Auth0.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Auth0 login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── POST /api/auth/sync ── (Sync Auth0 user with backend)
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;
    const role = req.user.role || 'operator';

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      // Auto-create user from Auth0 token data
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);
      const stmt = db.prepare(`
        INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(email.split('@')[0], email, hashedPassword, role);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    res.json({
      user: sanitizeUser(user),
      permissions: [],
    });
  } catch (err) {
    console.error('Auth sync error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── GET /api/auth/me ──
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── POST /api/auth/logout ──
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

export default router;
