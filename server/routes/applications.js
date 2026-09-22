import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// GET all applications (admin)
router.get('/', authenticateToken, (req, res) => {
  const { is_read } = req.query;
  let list;
  if (is_read !== undefined) {
    list = db.prepare('SELECT * FROM career_applications WHERE is_read = ? ORDER BY created_at DESC').all(Number(is_read));
  } else {
    list = db.prepare('SELECT * FROM career_applications ORDER BY created_at DESC').all();
  }
  res.json(list);
});

// GET single application (admin, marks as read)
router.get('/:id', authenticateToken, (req, res) => {
  const app = db.prepare('SELECT * FROM career_applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found.' });
  
  // Mark as read
  db.prepare('UPDATE career_applications SET is_read = 1 WHERE id = ?').run(req.params.id);
  app.is_read = 1;
  res.json(app);
});

// DELETE application (admin, deletes resume file from disk too)
router.delete('/:id', authenticateToken, (req, res) => {
  const app = db.prepare('SELECT * FROM career_applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  // Delete resume PDF from disk if exists
  if (app.resume_url) {
    const filePath = path.join(__dirname, '../..', app.resume_url);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✓ Deleted resume file from disk: ${filePath}`);
      }
    } catch (err) {
      console.error('Failed to delete resume file:', err);
    }
  }

  db.prepare('DELETE FROM career_applications WHERE id = ?').run(req.params.id);
  res.json({ message: 'Application deleted successfully.' });
});

// Mark application as read/unread (admin)
router.patch('/:id/read', authenticateToken, (req, res) => {
  const { is_read } = req.body;
  const app = db.prepare('SELECT id FROM career_applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  db.prepare('UPDATE career_applications SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, req.params.id);
  res.json({ message: 'Updated successfully.' });
});

export default router;
