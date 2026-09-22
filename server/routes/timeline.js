import { Router } from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET all timeline events (admin view, returns all sorted)
router.get('/', authenticateToken, (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM timeline_events ORDER BY sort_order ASC, year ASC').all();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single timeline event
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM timeline_events WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Timeline event not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE timeline event (protected)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { year, event, sort_order, is_active } = req.body;
    if (!year || !event) {
      return res.status(400).json({ error: 'Year and event details are required.' });
    }

    db.prepare(`
      INSERT INTO timeline_events (year, event, sort_order, is_active)
      VALUES (?, ?, ?, ?)
    `).run(year, event, sort_order || 0, is_active !== undefined ? is_active : 1);

    res.status(201).json({ message: 'Timeline event created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE timeline event (protected)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { year, event, sort_order, is_active } = req.body;
    const item = db.prepare('SELECT * FROM timeline_events WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Timeline event not found.' });

    db.prepare(`
      UPDATE timeline_events
      SET year = ?, event = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      year !== undefined ? year : item.year,
      event !== undefined ? event : item.event,
      sort_order !== undefined ? sort_order : item.sort_order,
      is_active !== undefined ? is_active : item.is_active,
      req.params.id
    );

    res.json({ message: 'Timeline event updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE timeline event (protected)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM timeline_events WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Timeline event not found.' });

    db.prepare('DELETE FROM timeline_events WHERE id = ?').run(req.params.id);
    res.json({ message: 'Timeline event deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
