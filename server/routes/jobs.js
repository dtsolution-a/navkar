import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all jobs (admin)
router.get('/', authenticateToken, (req, res) => {
  res.json(db.prepare('SELECT * FROM career_jobs ORDER BY sort_order ASC, created_at DESC').all());
});

// CREATE job
router.post('/', authenticateToken, (req, res) => {
  const { title, department, location = 'Surat, Gujarat', type = 'Full-time', experience, description, requirements, apply_url, sort_order = 0, is_active = 1 } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const result = db.prepare(
    'INSERT INTO career_jobs (title, department, location, type, experience, description, requirements, apply_url, sort_order, is_active) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).run(title, department, location, type, experience, description, requirements, apply_url, sort_order, is_active ? 1 : 0);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

// UPDATE job
router.put('/:id', authenticateToken, (req, res) => {
  const { title, department, location, type, experience, description, requirements, apply_url, sort_order, is_active } = req.body;
  db.prepare(
    'UPDATE career_jobs SET title=?, department=?, location=?, type=?, experience=?, description=?, requirements=?, apply_url=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
  ).run(title, department, location, type, experience, description, requirements, apply_url, sort_order, is_active ? 1 : 0, req.params.id);
  res.json({ success: true });
});

// DELETE job
router.delete('/:id', authenticateToken, (req, res) => {
  db.prepare('DELETE FROM career_jobs WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

export default router;
