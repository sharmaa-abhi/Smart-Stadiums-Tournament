import { Router } from 'express';
import db from '../db/database.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// ── GET /api/broadcast/messages ──
router.get('/messages', (req, res) => {
  const { venue_id, status } = req.query;
  let query = 'SELECT * FROM broadcast_messages';
  const conditions = [];
  const params = [];

  if (venue_id) { conditions.push('venue_id = ?'); params.push(venue_id); }
  if (status) { conditions.push('status = ?'); params.push(status); }

  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY id DESC';

  const messages = db.prepare(query).all(...params);
  res.json({ messages });
});

// ── POST /api/broadcast/messages ──
router.post('/messages', (req, res) => {
  try {
    const { title, message, channel, priority, venue_id, expires_at } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required.' });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or fewer.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message must be 2000 characters or fewer.' });
    }

    const stmt = db.prepare(`
      INSERT INTO broadcast_messages (title, message, channel, priority, status, venue_id, created_by, expires_at)
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?)
    `);
    const result = stmt.run(
      title, message,
      channel || 'all',
      priority || 'normal',
      venue_id || 'metlife',
      req.user.id,
      expires_at || null
    );

    const created = db.prepare('SELECT * FROM broadcast_messages WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Broadcast created.', broadcast: created });
  } catch (err) {
    console.error('Broadcast create error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── PATCH /api/broadcast/messages/:id ──
router.patch('/messages/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM broadcast_messages WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Broadcast not found.' });

    const { title, message, channel, priority, status } = req.body;
    const updates = [];
    const params = [];

    if (title) { updates.push('title = ?'); params.push(title); }
    if (message) { updates.push('message = ?'); params.push(message); }
    if (channel) { updates.push('channel = ?'); params.push(channel); }
    if (priority) { updates.push('priority = ?'); params.push(priority); }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    params.push(req.params.id);
    db.prepare(`UPDATE broadcast_messages SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM broadcast_messages WHERE id = ?').get(req.params.id);
    res.json({ message: 'Broadcast updated.', broadcast: updated });
  } catch (err) {
    console.error('Broadcast update error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── DELETE /api/broadcast/messages/:id ──
router.delete('/messages/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM broadcast_messages WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Broadcast not found.' });

    db.prepare('DELETE FROM broadcast_messages WHERE id = ?').run(req.params.id);
    res.json({ message: 'Broadcast deleted.' });
  } catch (err) {
    console.error('Broadcast delete error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
