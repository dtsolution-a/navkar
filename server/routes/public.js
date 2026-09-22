import { Router } from 'express';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../uploads');

const router = Router();

// Setup multer for resume CV uploads (PDF only, max 1MB)
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(uploadsDir, 'resumes');
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB size limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  }
}).single('resume');

// GET brands with category & product counts
router.get('/brands', (req, res) => {
  const brands = db.prepare('SELECT * FROM brands WHERE is_active = 1 ORDER BY sort_order ASC, name ASC').all();
  
  const result = brands.map(b => {
    const categories = db.prepare('SELECT * FROM categories WHERE brandId = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC').all(b.id);
    const totalProducts = categories.reduce((sum, cat) => {
      const count = db.prepare('SELECT COUNT(*) as cnt FROM products WHERE categoryId = ? AND is_active = 1').get(cat.id);
      return sum + count.cnt;
    }, 0);
    return {
      ...b,
      categoryCount: categories.length,
      productCount: totalProducts,
    };
  });
  const sortedResult = result.sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));
  res.json(sortedResult);
});

// GET categories (optionally by brandId)
router.get('/categories', (req, res) => {
  const { brandId } = req.query;
  let categories;
  if (brandId) {
    categories = db.prepare('SELECT * FROM categories WHERE brandId = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC').all(brandId);
  } else {
    categories = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC').all();
  }

  // Attach products to each category
  const result = categories.map(cat => {
    const products = db.prepare('SELECT * FROM products WHERE categoryId = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC').all(cat.id);
    return {
      ...cat,
      products: products.map(p => ({
        ...p,
        specs: p.specs ? JSON.parse(p.specs) : []
      }))
    };
  });
  res.json(result);
});

// GET single category by slug and brandId
router.get('/categories/:brandId/:slug', (req, res) => {
  const cat = db.prepare('SELECT * FROM categories WHERE brandId = ? AND slug = ? AND is_active = 1').get(req.params.brandId, req.params.slug);
  if (!cat) return res.status(404).json({ error: 'Category not found' });

  const products = db.prepare('SELECT * FROM products WHERE categoryId = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC').all(cat.id);
  cat.products = products.map(p => ({
    ...p,
    specs: p.specs ? JSON.parse(p.specs) : []
  }));
  res.json(cat);
});

// GET single brand by id
router.get('/brands/:id', (req, res) => {
  const brand = db.prepare('SELECT * FROM brands WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!brand) return res.status(404).json({ error: 'Brand not found' });
  res.json(brand);
});

// GET all products (optionally by categoryId)
router.get('/products', (req, res) => {
  const { categoryId } = req.query;
  let products;
  if (categoryId) {
    products = db.prepare('SELECT * FROM products WHERE categoryId = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC').all(categoryId);
  } else {
    products = db.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY sort_order ASC, name ASC').all();
  }
  products = products.map(p => ({
    ...p,
    specs: p.specs ? JSON.parse(p.specs) : []
  }));
  res.json(products);
});

// GET single product
router.get('/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  product.specs = product.specs ? JSON.parse(product.specs) : [];
  res.json(product);
});

// GET all blog posts (published only)
router.get('/blog', (req, res) => {
  const posts = db.prepare("SELECT * FROM blog_posts WHERE is_published = 1 ORDER BY created_at DESC").all();
  res.json(posts);
});

// GET single blog post by slug
router.get('/blog/slug/:slug', (req, res) => {
  const post = db.prepare("SELECT * FROM blog_posts WHERE slug = ? AND is_published = 1").get(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Blog post not found' });
  res.json(post);
});


// GET testimonials by page (home or career)
router.get('/testimonials', (req, res) => {
  const { page } = req.query;
  let query = 'SELECT * FROM testimonials WHERE is_active = 1';
  const params = [];
  if (page) { query += ' AND page = ?'; params.push(page); }
  query += ' ORDER BY sort_order ASC, created_at DESC';
  res.json(db.prepare(query).all(...params));
});

// GET active career jobs (public)
router.get('/jobs', (req, res) => {
  const jobs = db.prepare('SELECT * FROM career_jobs WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC').all();
  res.json(jobs);
});

// GET active industrial solutions
router.get('/solutions', (req, res) => {
  const list = db.prepare('SELECT * FROM solutions WHERE is_active = 1 ORDER BY sort_order ASC, name ASC').all();
  res.json(list);
});

// GET active gallery photos
router.get('/gallery', (req, res) => {
  const list = db.prepare('SELECT * FROM gallery_photos WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC').all();
  res.json(list);
});

// GET active hero slides
router.get('/hero-slides', (req, res) => {
  const list = db.prepare('SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC').all();
  res.json(list);
});

// POST upload PDF resume
router.post('/upload-resume', (req, res) => {
  uploadResume(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const url = `/uploads/resumes/${req.file.filename}`;
    res.json({ url });
  });
});

// POST submit career application
router.post('/apply', (req, res) => {
  const { name, email, phone, message, resume_url } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const result = db.prepare(`
    INSERT INTO career_applications (name, email, phone, message, resume_url, is_read)
    VALUES (?, ?, ?, ?, ?, 0)
  `).run(name, email, phone || '', message || '', resume_url || '');

  res.status(201).json({ id: result.lastInsertRowid, message: 'Application submitted successfully!' });
});

// GET active timeline events
router.get('/timeline', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM timeline_events WHERE is_active = 1 ORDER BY sort_order ASC, year ASC').all();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET public settings (e.g. indiamart_link)
router.get('/settings', (req, res) => {
  try {
    const item = db.prepare("SELECT value FROM settings WHERE key = 'indiamart_link'").get();
    res.json({ indiamart_link: item ? item.value : '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
