import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import brandRoutes from './routes/brands.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import blogRoutes from './routes/blog.js';
import uploadRoutes from './routes/upload.js';
import contactRoutes from './routes/contacts.js';
import publicRoutes from './routes/public.js';
import testimonialsRoutes from './routes/testimonials.js';
import jobsRoutes from './routes/jobs.js';
import solutionsRoutes from './routes/solutions.js';
import galleryRoutes from './routes/gallery.js';
import heroRoutes from './routes/hero.js';
import applicationsRoutes from './routes/applications.js';
import timelineRoutes from './routes/timeline.js';
import settingsRoutes from './routes/settings.js';
import selectionToolRoutes from './routes/selectionTool.js';
import ensureSelectionToolSchema from './selectionTool/schema.js';

ensureSelectionToolSchema();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Normalize request URL for cPanel Passenger subdirectory routing
app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  next();
});

// â”€â”€ CORS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Allow requests from Vercel frontend + localhost for development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://navkarengineering.com',
  'https://www.navkarengineering.com',
  process.env.FRONTEND_URL, // e.g. https://navkar-website.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app subdomain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// â”€â”€ API Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/solutions', solutionsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/hero-slides', heroRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/selection-tool', selectionToolRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    __dirname,
    cwd: process.cwd(),
    uploadsPath: path.join(__dirname, '../uploads'),
    uploadsExists: fs.existsSync(path.join(__dirname, '../uploads'))
  });
});

app.listen(PORT, () => {
  console.log(`Admin API server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

