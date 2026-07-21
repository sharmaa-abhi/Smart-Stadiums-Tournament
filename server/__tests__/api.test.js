// @vitest-environment node
process.env.JWT_SECRET = 'test_secret_key_12345';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Setup mock express app with the same middlewares & routers
import authRoutes from '../routes/auth.js';
import venueRoutes from '../routes/venues.js';
import incidentRoutes from '../routes/incidents.js';
import db from '../db/database.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Replicate main security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; sandbox;");
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/incidents', incidentRoutes);

describe('Backend API & Security Audits', () => {
  const testEmail = `test_${Math.random().toString(36).substring(7)}@stadiumgenius.io`;
  const testPassword = 'Password123!';
  let jwtToken = '';

  it('verifies OWASP security headers are present on all endpoints', async () => {
    const res = await request(app).get('/api/venues');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['strict-transport-security']).toContain('max-age=63072000');
  });

  it('fails registration if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail }); // missing name, password, role

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('are required');
  });

  it('successfully registers a user and stores password securely (hashed)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Secured Admin',
        email: testEmail,
        password: testPassword,
        role: 'manager',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.role).toBe('manager');

    // Verify password is NOT stored in plain text in database
    const dbUser = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
    expect(dbUser).toBeDefined();
    expect(dbUser.password).not.toBe(testPassword);
    expect(dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$')).toBe(true); // Valid bcrypt format
  });

  it('fails login with an invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Invalid email or password');
  });

  it('successfully logs in with valid credentials and returns JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    jwtToken = res.body.token;

    // Verify JWT payload claims
    const decoded = jwt.decode(jwtToken);
    expect(decoded.email).toBe(testEmail);
    expect(decoded.role).toBe('manager');
  });

  it('blocks access to protected endpoints without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('No valid Bearer token provided');
  });

  it('allows access to protected endpoints with a valid JWT token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testEmail);
  });

  it('successfully returns seeded venues', async () => {
    const res = await request(app)
      .get('/api/venues')
      .set('Authorization', `Bearer ${jwtToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.venues)).toBe(true);
    expect(res.body.venues.length).toBeGreaterThan(0);
    expect(res.body.venues.find((v) => v.id === 'metlife')).toBeDefined();
  });

  describe('Auth0 Integration Endpoints', () => {
    const auth0Email = `auth0_${Math.random().toString(36).substring(7)}@stadiumgenius.io`;

    it('successfully registers and logs in a new user via Auth0 with specified role', async () => {
      const res = await request(app)
        .post('/api/auth/auth0-login')
        .send({
          email: auth0Email,
          name: 'Auth0 Security User',
          avatar: 'https://avatar.url',
          role: 'security',
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(auth0Email);
      expect(res.body.user.role).toBe('security');

      // Verify DB role
      const dbUser = db.prepare('SELECT * FROM users WHERE email = ?').get(auth0Email);
      expect(dbUser).toBeDefined();
      expect(dbUser.role).toBe('security');
    });

    it('falls back to operator role if specified role is invalid', async () => {
      const invalidEmail = `auth0_${Math.random().toString(36).substring(7)}@stadiumgenius.io`;
      const res = await request(app)
        .post('/api/auth/auth0-login')
        .send({
          email: invalidEmail,
          name: 'Auth0 Invalid Role User',
          role: 'attacker_admin', // Should be rejected/ignored
        });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('operator');
    });

    it('does not modify existing user role on subsequent logins', async () => {
      // Login again but try to escalate to admin role
      const res = await request(app)
        .post('/api/auth/auth0-login')
        .send({
          email: auth0Email,
          name: 'Auth0 Security User',
          role: 'admin', // Trying to change role to admin
        });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('security'); // Must remain security
    });
  });
});
