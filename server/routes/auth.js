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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ── POST /api/auth/register ──
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log(`[API] Register attempt: name="${name}", email="${email}", role="${role}"`);
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    const allowedRoles = isDev
      ? ['operator', 'security', 'manager', 'admin']
      : ['operator', 'security', 'manager'];

    const safeRole = (role && allowedRoles.includes(role)) ? role : 'operator';

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(name, email, hashedPassword, safeRole);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = generateToken(user);
    console.log(`[API] Register success for ${email}`);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('[API] Register error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── POST /api/auth/auth0-login ──
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

export default router;
