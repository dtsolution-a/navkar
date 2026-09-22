import { Router } from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET all products (public)
router.get('/', (req, res) => {
  const { categoryId } = req.query;
  let products;
  if (categoryId) {
    products = db.prepare('SELECT * FROM products WHERE categoryId = ? ORDER BY sort_order ASC, name ASC').all(categoryId);
  } else {
    products = db.prepare('SELECT * FROM products ORDER BY sort_order ASC, name ASC').all();
  }
  // Parse specs from JSON string
  products = products.map(p => ({
    ...p,
    specs: p.specs ? JSON.parse(p.specs) : []
  }));
  res.json(products);
});

// GET single product
router.get('/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  product.specs = product.specs ? JSON.parse(product.specs) : [];
  res.json(product);
});

// CREATE product
router.post('/', authenticateToken, (req, res) => {
  const { id, categoryId, name, description, image, specs, sort_order, catalogue_page } = req.body;
  if (!id || !categoryId || !name) {
    return res.status(400).json({ error: 'id, categoryId, and name are required.' });
  }

  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id);
  if (existing) return res.status(409).json({ error: 'Product with this ID already exists.' });

  db.prepare(`
    INSERT INTO products (id, categoryId, name, description, image, specs, sort_order, catalogue_page)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, categoryId, name, description || '', image || '', JSON.stringify(specs || []), sort_order || 0, catalogue_page || null);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  product.specs = product.specs ? JSON.parse(product.specs) : [];
  res.status(201).json(product);
});

// UPDATE product
router.put('/:id', authenticateToken, (req, res) => {
  const { categoryId, name, description, image, specs, sort_order, is_active, catalogue_page } = req.body;
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  db.prepare(`
    UPDATE products SET categoryId=?, name=?, description=?, image=?, specs=?, sort_order=?, is_active=?, catalogue_page=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    categoryId || product.categoryId,
    name || product.name,
    description !== undefined ? description : product.description,
    image !== undefined ? image : product.image,
    specs ? JSON.stringify(specs) : product.specs,
    sort_order !== undefined ? sort_order : product.sort_order,
    is_active !== undefined ? is_active : product.is_active,
    catalogue_page !== undefined ? (catalogue_page || null) : product.catalogue_page,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  updated.specs = updated.specs ? JSON.parse(updated.specs) : [];
  res.json(updated);
});

// DELETE product
router.delete('/:id', authenticateToken, (req, res) => {
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted successfully.' });
});

export default router;