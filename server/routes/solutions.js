import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all solutions (admin)
router.get('/', authenticateToken, (req, res) => {
  res.json(db.prepare('SELECT * FROM solutions ORDER BY sort_order ASC, name ASC').all());
});

// CREATE solution
router.post('/', authenticateToken, (req, res) => {
  const { icon = 'Package', name, description, brands, href, image, accent = '#2563EB', number, sort_order = 0, is_active = 1 } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare(`
    INSERT INTO solutions (icon, name, description, brands, href, image, accent, number, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(icon, name, description || '', brands || '', href || '', image || '', accent, number || '', sort_order, is_active ? 1 : 0);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

// UPDATE solution
router.put('/:id', authenticateToken, (req, res) => {
  const { icon, name, description, brands, href, image, accent, number, sort_order, is_active } = req.body;
  db.prepare(`
    UPDATE solutions
    SET icon=?, name=?, description=?, brands=?, href=?, image=?, accent=?, number=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(icon, name, description || '', brands || '', href || '', image || '', accent, number || '', sort_order, is_active ? 1 : 0, req.params.id);
  res.json({ success: true });
});

// DELETE solution
router.delete('/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM solutions WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

export default router;
