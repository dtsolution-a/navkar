import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all gallery photos (admin)
router.get('/', authenticateToken, (req, res) => {
  res.json(db.prepare('SELECT * FROM gallery_photos ORDER BY sort_order ASC, created_at DESC').all());
});

// CREATE gallery photo
router.post('/', authenticateToken, (req, res) => {
  const { url, title, sort_order = 0, is_active = 1 } = req.body;
  if (!url) return res.status(400).json({ error: 'Image URL is required' });
  const result = db.prepare(`
    INSERT INTO gallery_photos (url, title, sort_order, is_active)
    VALUES (?, ?, ?, ?)
  `).run(url, title || '', sort_order, is_active ? 1 : 0);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

// UPDATE gallery photo
router.put('/:id', authenticateToken, (req, res) => {
  const { url, title, sort_order, is_active } = req.body;
  db.prepare(`
    UPDATE gallery_photos
    SET url=?, title=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(url, title || '', sort_order, is_active ? 1 : 0, req.params.id);
  res.json({ success: true });
});

// DELETE gallery photo
router.delete('/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM gallery_photos WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

export default router;
