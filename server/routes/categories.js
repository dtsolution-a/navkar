import { Router } from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET all categories (public)
router.get('/', (req, res) => {
  const { brandId } = req.query;
  let categories;
  if (brandId) {
    categories = db.prepare('SELECT * FROM categories WHERE brandId = ? ORDER BY sort_order ASC, name ASC').all(brandId);
  } else {
    categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, name ASC').all();
  }
  res.json(categories);
});

// GET single category
router.get('/:id', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found.' });
  res.json(cat);
});

// CREATE category
router.post('/', authenticateToken, (req, res) => {
  const { id, brandId, name, slug, icon, description, heroImage, sort_order } = req.body;
  if (!id || !brandId || !name || !slug) {
    return res.status(400).json({ error: 'id, brandId, name, and slug are required.' });
  }

  const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(id);
  if (existing) return res.status(409).json({ error: 'Category with this ID already exists.' });

  db.prepare(`
    INSERT INTO categories (id, brandId, name, slug, icon, description, heroImage, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, brandId, name, slug, icon || 'Package', description || '', heroImage || '', sort_order || 0);

  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.status(201).json(cat);
});

// UPDATE category
router.put('/:id', authenticateToken, (req, res) => {
  const { brandId, name, slug, icon, description, heroImage, sort_order, is_active } = req.body;
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found.' });

  db.prepare(`
    UPDATE categories SET brandId=?, name=?, slug=?, icon=?, description=?, heroImage=?, sort_order=?, is_active=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    brandId || cat.brandId,
    name || cat.name,
    slug || cat.slug,
    icon !== undefined ? icon : cat.icon,
    description !== undefined ? description : cat.description,
    heroImage !== undefined ? heroImage : cat.heroImage,
    sort_order !== undefined ? sort_order : cat.sort_order,
    is_active !== undefined ? is_active : cat.is_active,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE category
router.delete('/:id', authenticateToken, (req, res) => {
  const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found.' });

  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted successfully.' });
});

export default router;