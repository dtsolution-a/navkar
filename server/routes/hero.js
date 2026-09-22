import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all hero slides (admin)
router.get('/', authenticateToken, (req, res) => {
  res.json(db.prepare('SELECT * FROM hero_slides ORDER BY sort_order ASC, created_at DESC').all());
});

// CREATE hero slide
router.post('/', authenticateToken, (req, res) => {
  const { image, tag, headline, sub, accent = 'from-blue-600/20 to-indigo-900/60', sort_order = 0, is_active = 1 } = req.body;
  if (!image || !headline) return res.status(400).json({ error: 'Image and Headline are required' });
  const result = db.prepare(`
    INSERT INTO hero_slides (image, tag, headline, sub, accent, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(image, tag || '', headline, sub || '', accent, sort_order, is_active ? 1 : 0);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

// UPDATE hero slide
router.put('/:id', authenticateToken, (req, res) => {
  const { image, tag, headline, sub, accent, sort_order, is_active } = req.body;
  db.prepare(`
    UPDATE hero_slides
    SET image=?, tag=?, headline=?, sub=?, accent=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(image, tag || '', headline, sub || '', accent, sort_order, is_active ? 1 : 0, req.params.id);
  res.json({ success: true });
});

// DELETE hero slide
router.delete('/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM hero_slides WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

export default router;
