import db from './db.js';
import bcrypt from 'bcryptjs';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { blogPosts } from '../src/data/blog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.join(__dirname, '../public/images/p2');

// â”€â”€â”€ UTILS FOR RECURSIVE IMAGE SEARCH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function findFileRecursive(dir, filename) {
  if (!fs.existsSync(dir)) return null;
  const list = fs.readdirSync(dir);
  const baseNameWithoutExt = path.basename(filename, path.extname(filename)).toLowerCase();

  // Handle Trident drain typo
  let targetFilename = filename;
  if (filename.toLowerCase() === 'drain.webp') {
    targetFilename = 'frain.webp';
  }

  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory()) {
      if (item.toLowerCase() === targetFilename.toLowerCase()) {
        return fullPath;
      }
      const itemWithoutExt = path.basename(item, path.extname(item)).toLowerCase();
      if (itemWithoutExt === baseNameWithoutExt) {
        return fullPath;
      }
    }
  }

  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const found = findFileRecursive(fullPath, filename);
      if (found) return found;
    }
  }
  return null;
}

function getImagePath(company, filename) {
  if (!filename) return '';
  if (!fs.existsSync(baseDir)) return '';
  const list = fs.readdirSync(baseDir);
  const actualCompanyDir = list.find(d => d.toLowerCase() === company.toLowerCase());
  if (!actualCompanyDir) return '';
  
  const companyPath = path.join(baseDir, actualCompanyDir);
  const found = findFileRecursive(companyPath, filename);
  if (found) {
    const rel = path.relative(path.join(__dirname, '../public'), found);
    return '/' + rel.replace(/\\/g, '/');
  }
  return '';
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// â”€â”€â”€ SEED DEFAULT ADMIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
db.prepare('DELETE FROM users WHERE username = ?').run('admin');
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('shah_adOOPP');
if (!adminExists) {
  const hashed = bcrypt.hashSync('shah_adOOPP_pwd_placeholder', 10);
  db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run(
    'shah_adOOPP', 'admin@shahwebsite.com', hashed, 'admin'
  );
  console.log('âœ“ Default admin created: shah_adOOPP');
}

// â”€â”€â”€ CLEAR EXISTING CATALOG DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log('Clearing old product catalog data...');
db.prepare('DELETE FROM products').run();
db.prepare('DELETE FROM categories').run();
db.prepare('DELETE FROM brands').run();

// â”€â”€â”€ BRAND METADATA MAPPING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const brandMetadata = {
  'parker': {
    name: 'Parker Hannifin',
    shortName: 'Parker',
    tagline: 'Global leader in motion and control technologies',
    color: '#FFD100',
    description: 'Parker Hannifin is a Fortune 250 global leader in motion and control technologies, providing precision-engineered solutions for a wide variety of mobile, industrial and aerospace markets.',
    logo: '/images/brands/parker.jpg',
  },
  'kaishan': {
    name: 'Kaishan',
    shortName: 'Kaishan',
    tagline: 'World-class air compressor solutions',
    color: '#E63946',
    description: 'Kaishan is one of the world\'s largest manufacturers of air compressors, offering a comprehensive range from rotary screw to oil-free solutions for industrial applications.',
    logo: '/images/brands/kaishan.png',
  },
  'chicago-pneumatic': {
    name: 'Chicago Pneumatic',
    shortName: 'Chicago Pneumatic',
    tagline: 'Reliable compressed air solutions',
    color: '#FF6B00',
    description: 'Chicago Pneumatic has over 100 years of experience in industrial tools and air compressors, known globally for their reliability and performance.',
    logo: '/images/brands/chicago-pneumatic.svg',
  },
  'tubacex': {
    name: 'Tubacex',
    shortName: 'Tubacex',
    tagline: 'Premium stainless steel tubes & pipes',
    color: '#2D6A4F',
    description: 'Tubacex is a world leader in manufacturing seamless stainless steel tubes and pipes for the most demanding industrial applications.',
    logo: '/images/brands/tubacex.png',
  },
  'trident': {
    name: 'Trident',
    shortName: 'Trident',
    tagline: 'Advanced air purification systems',
    color: '#4361EE',
    description: 'Trident specializes in air drying, purification and separation systems, providing critical clean air solutions for industrial and breathing air applications.',
    logo: '/images/brands/trident.png',
  },
  'opw': {
    name: 'OPW Clean Energy Solutions',
    shortName: 'OPW',
    tagline: 'Fluid handling & clean energy fueling solutions',
    color: '#0284C7',
    description: 'OPW is a global leader in fluid handling solutions, offering clean energy fueling components for CNG, LNG, LPG and Hydrogen.',
    logo: '/images/brands/opw.png',
  },
  'gajjar-compressor': {
    name: 'Gajjar Compressor',
    shortName: 'Gajjar',
    tagline: 'High-quality industrial air compressors',
    color: '#DC2626',
    description: 'Gajjar Compressor offers durable and efficient air compressors designed for industrial applications.',
    logo: '/images/brands/gajjar-compressor.png',
  }
};

// â”€â”€â”€ PARSE EXCEL AND SEED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const excelPath = path.join(__dirname, '../public/Shah_Master_Product_Catalog_Detailed.xlsx');
if (!fs.existsSync(excelPath)) {
  console.error(`Error: Excel file not found at ${excelPath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log(`Parsing Excel file... Found ${rows.length} rows.`);

const seededBrands = new Set();
const seededCategories = new Set();

const insertBrand = db.prepare(`
  INSERT INTO brands (id, name, shortName, tagline, color, description, logo, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertCategory = db.prepare(`
  INSERT INTO categories (id, brandId, name, slug, icon, description, heroImage, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertProduct = db.prepare(`
  INSERT INTO products (id, categoryId, name, description, image, specs, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

rows.forEach((row, index) => {
  const company = row.Company;
  const category = row.Category;
  const name = row['Product Name'];
  const desc = row['Short Description'];
  const slug = row['SEO Slug'] || slugify(name);
  const imageFilename = row['Image Filename'];
  
  if (!company || !category || !name) return;

  const brandId = slugify(company);
  const catSlug = slugify(category);
  const catId = `${brandId}-${catSlug}`;
  const prodId = `prod-${brandId}-${catSlug}-${index}`;

  // 1. Seed Brand if not yet done
  if (!seededBrands.has(brandId)) {
    const meta = brandMetadata[brandId] || {
      name: company,
      shortName: company,
      tagline: `${company} products`,
      color: '#3B82F6',
      description: `Premium solutions from ${company}.`,
      logo: `/images/brands/${brandId}.png`
    };
    insertBrand.run(brandId, meta.name, meta.shortName, meta.tagline, meta.color, meta.description, meta.logo, 0);
    seededBrands.add(brandId);
    console.log(`âœ“ Brand seeded: ${meta.name}`);
  }

  // 2. Seed Category if not yet done
  if (!seededCategories.has(catId)) {
    let icon = 'Package';
    if (catSlug.includes('pneumatics')) icon = 'Wind';
    else if (catSlug.includes('control') || catSlug.includes('distribution')) icon = 'Settings2';
    else if (catSlug.includes('instrument')) icon = 'Gauge';
    else if (catSlug.includes('hydra')) icon = 'Cable';
    else if (catSlug.includes('gas') || catSlug.includes('gen')) icon = 'Zap';
    else if (catSlug.includes('clean') || catSlug.includes('cng') || catSlug.includes('hydro')) icon = 'Leaf';
    else if (catSlug.includes('tube') || catSlug.includes('pipe')) icon = 'Database';
    else if (catSlug.includes('treatment') || catSlug.includes('dry')) icon = 'Filter';

    const catDesc = `${category} solutions from ${company}`;
    insertCategory.run(catId, brandId, category, catSlug, icon, catDesc, '', 0);
    seededCategories.add(catId);
    console.log(`  âœ“ Category seeded: ${category} (${company})`);
  }

  // 3. Match and seed Product
  const imagePath = getImagePath(company, imageFilename);
  const tags = [row['Tag 1'], row['Tag 2'], row['Tag 3']].filter(Boolean);
  
  insertProduct.run(prodId, catId, name, desc || '', imagePath, JSON.stringify(tags), 0);
});

console.log(`âœ“ Seeded ${rows.length} products successfully!`);

// â”€â”€â”€ SEED HERO SLIDES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log('Seeding default hero slides...');
db.prepare('DELETE FROM hero_slides').run();

const insertHero = db.prepare(`
  INSERT INTO hero_slides (image, tag, headline, sub, accent, sort_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);

insertHero.run(
  '/images/hero/slide-1.jpg',
  'Parker Hannifin Â· Authorized Distributor',
  "India's Trusted Partner for Industrial Fluid Power",
  'Pneumatics Â· Hydraulics Â· Instrumentation Â· Compressed Air Systems',
  'from-blue-600/20 to-indigo-900/60',
  1
);
insertHero.run(
  '/images/hero/slide-2.jpg',
  'Kaishan & Chicago Pneumatic Â· Distributor',
  'World-Class Air Compressor Solutions for Every Industry',
  'Oil-Free Â· Rotary Screw Â· Reciprocating Â· Energy-Efficient Systems',
  'from-sky-700/20 to-blue-950/60',
  2
);
insertHero.run(
  '/images/hero/slide-3.jpg',
  'Tubacex & Trident Â· Authorized Representative',
  '30+ Years of Technical Excellence in Surat, Gujarat',
  'SS Tubes Â· Air Purification Â· Gas Generation Â· Clean Energy',
  'from-indigo-700/20 to-slate-950/60',
  3
);
insertHero.run(
  '/images/hero/slide-4.jpg',
  'Parker Clean Energy Â· CNG & Hydrogen',
  "Powering India's Clean Energy Future",
  'CNG Dispensers Â· Hydrogen Fueling Infrastructure Â· Zero-Emission',
  'from-teal-700/20 to-blue-950/60',
  4
);

// â”€â”€â”€ SEED SOLUTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log('Seeding default solutions...');
db.prepare('DELETE FROM solutions').run();

const insertSolution = db.prepare(`
  INSERT INTO solutions (icon, name, description, brands, href, image, accent, number, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertSolution.run(
  'Wind',
  'Compressed Air Systems',
  'Complete air generation, treatment & distribution from leading brands',
  'Parker, Kaishan, Chicago Pneumatic, Trident',
  '/products',
  '/images/categories/compressed-air.jpg',
  '#2563EB',
  '01',
  1
);
insertSolution.run(
  'Settings2',
  'Pneumatics & Automation',
  'Cylinders, solenoid valves, fittings, tubing & FRL units for automation',
  'Parker',
  '/products/parker/pneumatics',
  '/images/categories/pneumatics.jpg',
  '#6366f1',
  '02',
  2
);
insertSolution.run(
  'Gauge',
  'Instrumentation',
  'High-pressure fittings, needle valves, manifolds & process components',
  'Parker',
  '/products/parker/instrumentation',
  '/images/categories/instrumentation.jpg',
  '#8b5cf6',
  '03',
  3
);
insertSolution.run(
  'Cable',
  'Hydraulics',
  'Hoses, fittings, adapters, filters & condition monitoring equipment',
  'Parker',
  '/products/parker/hydraulic-connectors',
  '/images/categories/hydraulics.jpg',
  '#0891b2',
  '04',
  4
);
insertSolution.run(
  'Zap',
  'Gas Generation',
  'On-site nitrogen, hydrogen & zero-air generators for labs & industry',
  'Parker',
  '/products/parker/gas-generator',
  '/images/categories/gas-generation.jpg',
  '#d97706',
  '05',
  5
);
insertSolution.run(
  'Leaf',
  'Clean Energy â€” CNG & Hâ‚‚',
  'Fueling infrastructure for CNG and hydrogen stations across India',
  'Parker',
  '/products/parker/clean-energy',
  '/images/categories/clean-energy.jpg',
  '#16a34a',
  '06',
  6
);

// â”€â”€â”€ SEED GALLERY PHOTOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log('Seeding default gallery photos...');
db.prepare('DELETE FROM gallery_photos').run();

const insertGallery = db.prepare(`
  INSERT INTO gallery_photos (url, title, sort_order)
  VALUES (?, ?, ?)
`);

insertGallery.run('/images/gallery/team-1.jpg', 'Navkar Engineering Team Meeting', 1);
insertGallery.run('/images/gallery/team-2.jpg', 'Office Staff Workspace', 2);
insertGallery.run('/images/gallery/team-3.jpg', 'Technical Team Discussion', 3);
insertGallery.run('/images/gallery/team-4.jpg', 'Navkar Engineering Directors', 4);
insertGallery.run('/images/gallery/team-14.jpg', 'K. G. Shah â€” Founder', 5);
insertGallery.run('/images/gallery/teams .png', 'Company Portrait', 6);

// â”€â”€â”€ SEED TIMELINE EVENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log('Seeding default timeline events...');
db.prepare('DELETE FROM timeline_events').run();
const insertTimeline = db.prepare(`
  INSERT INTO timeline_events (year, event, sort_order, is_active)
  VALUES (?, ?, ?, 1)
`);
insertTimeline.run('1995', 'Shah Enterprise established in Surat, Gujarat', 1);
insertTimeline.run('2000', 'Became authorized Parker Hannifin distributor for Gujarat region', 2);
insertTimeline.run('2008', 'Expanded product portfolio with hydraulics and instrumentation', 3);
insertTimeline.run('2015', 'Added Kaishan air compressors to the portfolio', 4);
insertTimeline.run('2020', 'Entered clean energy segment â€” CNG & Hydrogen fueling solutions', 5);
insertTimeline.run('2025', 'Serving 1000+ clients across India with 500+ product lines', 6);

// â”€â”€â”€ SEED SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log('Seeding default settings...');
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('indiamart_link', '')").run();

// â”€â”€â”€ SEED BLOG POSTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
console.log('Seeding blog posts...');
db.prepare('DELETE FROM blog_posts').run();
const insertBlogPost = db.prepare(`
  INSERT OR IGNORE INTO blog_posts (title, slug, excerpt, content, author, image, category, tags, is_published, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

blogPosts.forEach((post) => {
  insertBlogPost.run(
    post.title,
    post.slug,
    post.excerpt,
    post.content,
    post.author || 'Admin',
    post.cover || '',
    post.category || 'General',
    Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
    1,
    post.date || new Date().toISOString()
  );
});
console.log(`âœ“ Seeded ${blogPosts.length} blog posts successfully!`);

console.log('\nâœ… Database seeding complete!');

