import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('./server/shah_admin.db');

const brandsOrder = [
  'parker', // Parker
  'opw', // Opw
  'kaishan', // Kaishan
  'tubacex', // Tubacex
  'trident', // Trident
  'anest-iwata', // Anesta net
  'airnet', // Airnet
  'gajjar-compressor' // Gajjar
];

// Ensure missing brands exist
const insertBrand = db.prepare(`
  INSERT OR IGNORE INTO brands (id, name, shortName, tagline, color, description, logo, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

insertBrand.run('anest-iwata', 'Anest Iwata', 'Anest Iwata', 'Premium Air Compressors', '#3B82F6', 'Anest Iwata products.', '/images/brands/anest-iwata.png', 6);
insertBrand.run('airnet', 'AirNet', 'AirNet', 'Piping Solutions', '#3B82F6', 'AirNet piping solutions.', '/images/brands/airnet.png', 7);

const updateBrand = db.prepare('UPDATE brands SET sort_order = ? WHERE id = ?');
brandsOrder.forEach((id, index) => {
  updateBrand.run(index + 1, id);
});

// Update Parker categories order
const parkerCategoriesOrder = [
  'parker-instrumentation', // Instrumentation
  'parker-clean-energy', // Clean Energy (CNG)
  'parker-pneumatics', // Pneumatic
  'parker-hydraulic', // Hydraulic
  'parker-gas-generator', // Gas generator
  'parker-distribution-control', 
  'parker-filtration-separation',
  'parker-special-applications',
  'parker-hydrogen-solutions'
];

const updateCat = db.prepare('UPDATE categories SET sort_order = ? WHERE id = ?');
parkerCategoriesOrder.forEach((id, index) => {
  updateCat.run(index + 1, id);
});

console.log('Database sorted successfully.');
