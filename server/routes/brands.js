import { Router } from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET all brands (public)
router.get('/', (req, res) => {
  const brands = db.prepare('SELECT * FROM brands ORDER BY sort_order ASC, name ASC').all();
  res.json(brands);
});

// GET single brand
router.get('/:id', (req, res) => {
  const brand = db.prepare('SELECT * FROM brands WHERE id = ?').get(req.params.id);
  if (!brand) return res.status(404).json({ error: 'Brand not found.' });
  res.json(brand);
});

// CREATE brand (protected)
router.post('/', authenticateToken, (req, res) => {
  const { id, name, shortName, tagline, color, description, logo, sort_order } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'Brand ID and name are required.' });

  const existing = db.prepare('SELECT id FROM brands WHERE id = ?').get(id);
  if (existing) return res.status(409).json({ error: 'Brand with this ID already exists.' });

  db.prepare(`
    INSERT INTO brands (id, name, shortName, tagline, color, description, logo, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, shortName || name, tagline || '', color || '#3B82F6', description || '', logo || '', sort_order || 0);

  const brand = db.prepare('SELECT * FROM brands WHERE id = ?').get(id);
  res.status(201).json(brand);
});

// UPDATE brand
router.put('/:id', authenticateToken, (req, res) => {
  const { name, shortName, tagline, color, description, logo, sort_order, is_active } = req.body;
  const brand = db.prepare('SELECT * FROM brands WHERE id = ?').get(req.params.id);
  if (!brand) return res.status(404).json({ error: 'Brand not found.' });

  db.prepare(`
    UPDATE brands SET name=?, shortName=?, tagline=?, color=?, description=?, logo=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    name || brand.name,
    shortName !== undefined ? shortName : brand.shortName,
    tagline !== undefined ? tagline : brand.tagline,
    color || brand.color,
    description !== undefined ? description : brand.description,
    logo !== undefined ? logo : brand.logo,
    sort_order !== undefined ? sort_order : brand.sort_order,
    is_active !== undefined ? is_active : brand.is_active,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM brands WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE brand
router.delete('/:id', authenticateToken, (req, res) => {
  const brand = db.prepare('SELECT id FROM brands WHERE id = ?').get(req.params.id);
  if (!brand) return res.status(404).json({ error: 'Brand not found.' });

  db.prepare('DELETE FROM brands WHERE id = ?').run(req.params.id);
  res.json({ message: 'Brand deleted successfully.' });
});

export default router;