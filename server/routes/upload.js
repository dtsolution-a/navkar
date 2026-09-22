import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getUploadsDir = (dir) => {
  const normalized = dir.replace(/\\/g, '/');
  if (normalized.endsWith('/server/routes') || normalized.endsWith('/server/routes/')) {
    return path.join(dir, '../../uploads');
  }
  return path.join(dir, '../uploads');
};
const uploadsDir = getUploadsDir(__dirname);

// Ensure upload directories exist
const dirs = ['brands', 'categories', 'products', 'blog', 'general', 'resumes'];
dirs.forEach(dir => {
  const fullPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = req.body.folder || 'general';
    const dest = path.join(uploadsDir, subfolder);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp, svg, bmp)'));
    }
  }
});

// Upload single file
router.post('/', authenticateToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const url = `/api/uploads/${req.body.folder || 'general'}/${req.file.filename}`;
    res.json({
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  });
});

// Delete file
router.post('/delete', authenticateToken, (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required.' });

  const relativePath = url.replace(/^\/api\//, '');
  const filePath = path.join(uploadsDir, '..', relativePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully.' });
  } else {
    res.status(404).json({ error: 'File not found.' });
  }
});

export default router;