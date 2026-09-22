import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all testimonials (admin)
router.get('/', authenticateToken, (req, res) => {
  try {
    const { page } = req.query;
    let query = 'SELECT * FROM testimonials';
    const params = [];
    if (page) { query += ' WHERE page = ?'; params.push(page); }
    query += ' ORDER BY sort_order ASC, created_at DESC';
    res.json(db.prepare(query).all(...params));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE testimonial
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, designation, company, message, rating = 5, avatar, page = 'home', sort_order = 0, is_active = 1 } = req.body;
    if (!name || !message) return res.status(400).json({ error: 'Name and message required' });
    const result = db.prepare(
      'INSERT INTO testimonials (name, designation, company, message, rating, avatar, page, sort_order, is_active) VALUES (?,?,?,?,?,?,?,?,?)'
    ).run(name, designation, company, message, rating, avatar, page, sort_order, is_active ? 1 : 0);
    res.status(201).json({ id: result.lastInsertRowid, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE testimonial
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, designation, company, message, rating, avatar, page, sort_order, is_active } = req.body;
    db.prepare(
      'UPDATE testimonials SET name=?, designation=?, company=?, message=?, rating=?, avatar=?, page=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
    ).run(name, designation, company, message, rating, avatar, page, sort_order, is_active ? 1 : 0, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE testimonial
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM testimonials WHERE id=?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
