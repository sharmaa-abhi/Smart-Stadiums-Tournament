import { Router } from 'express';
import db from '../db/database.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

// ── GET /api/incidents ──
router.get('/', (req, res) => {
  const { venue_id, status } = req.query;
  let query = 'SELECT * FROM incidents';
  const conditions = [];
  const params = [];

  if (venue_id) {
    conditions.push('venue_id = ?');
    params.push(venue_id);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY id DESC';

  const incidents = db.prepare(query).all(...params);
  res.json({ incidents });
});

// ── POST /api/incidents ──
router.post('/', (req, res) => {
  try {
    const { type, zone, priority, description, venue_id } = req.body;

    if (!type || !zone) {
      return res.status(400).json({ error: 'Type and zone are required.' });
    }

    const now = new Date();
    const incidentId = `INC-${now.getFullYear()}-${String(now.getTime()).slice(-4)}`;
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const stmt = db.prepare(`
      INSERT INTO incidents (incident_id, type, zone, time, status, priority, response, assignee, venue_id, description, created_by)
      VALUES (?, ?, ?, ?, 'active', ?, '-', 'Unassigned', ?, ?, ?)
    `);

    const result = stmt.run(
      incidentId, type, zone, time,
      priority || 'medium',
      venue_id || 'metlife',
      description || '',
      req.user.id
    );

    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Incident created.', incident });
  } catch (err) {
    console.error('Create incident error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ── PATCH /api/incidents/:id ──
router.patch('/:id', (req, res) => {
  try {
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    const { status, assignee, response } = req.body;
    const updates = [];
    const params = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (assignee) { updates.push('assignee = ?'); params.push(assignee); }
    if (response) { updates.push('response = ?'); params.push(response); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    params.push(req.params.id);
    db.prepare(`UPDATE incidents SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    res.json({ message: 'Incident updated.', incident: updated });
  } catch (err) {
    console.error('Update incident error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
