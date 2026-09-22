import { Router } from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET all blog posts (public)
router.get('/', (req, res) => {
  const posts = db.prepare('SELECT * FROM blog_posts ORDER BY created_at DESC').all();
  res.json(posts);
});

// GET single blog post by slug (public)
router.get('/slug/:slug', (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ?').get(req.params.slug);
  if (!post) return res.status(404).json({ error: 'Blog post not found.' });
  res.json(post);
});

// GET single blog post by id
router.get('/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Blog post not found.' });
  res.json(post);
});

// CREATE blog post
router.post('/', authenticateToken, (req, res) => {
  const { title, slug, excerpt, content, author, image, category, tags, is_published } = req.body;
  if (!title || !slug) return res.status(400).json({ error: 'Title and slug are required.' });

  const existing = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(slug);
  if (existing) return res.status(409).json({ error: 'A post with this slug already exists.' });

  const result = db.prepare(`
    INSERT INTO blog_posts (title, slug, excerpt, content, author, image, category, tags, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    title, slug, excerpt || '', content || '', author || 'Admin',
    image || '', category || 'General', tags || '', is_published !== undefined ? is_published : 1
  );

  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(post);
});

// UPDATE blog post
router.put('/:id', authenticateToken, (req, res) => {
  const { title, slug, excerpt, content, author, image, category, tags, is_published } = req.body;
  const post = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Blog post not found.' });

  // If slug changed, check for conflicts
  if (slug && slug !== post.slug) {
    const conflict = db.prepare('SELECT id FROM blog_posts WHERE slug = ? AND id != ?').get(slug, req.params.id);
    if (conflict) return res.status(409).json({ error: 'Another post with this slug already exists.' });
  }

  db.prepare(`
    UPDATE blog_posts SET title=?, slug=?, excerpt=?, content=?, author=?, image=?, category=?, tags=?, is_published=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    title || post.title,
    slug || post.slug,
    excerpt !== undefined ? excerpt : post.excerpt,
    content !== undefined ? content : post.content,
    author || post.author,
    image !== undefined ? image : post.image,
    category || post.category,
    tags !== undefined ? tags : post.tags,
    is_published !== undefined ? is_published : post.is_published,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE blog post
router.delete('/:id', authenticateToken, (req, res) => {
  const post = db.prepare('SELECT id FROM blog_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Blog post not found.' });

  db.prepare('DELETE FROM blog_posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Blog post deleted successfully.' });
});

export default router;