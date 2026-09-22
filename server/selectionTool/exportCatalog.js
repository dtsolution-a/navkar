// Selection Tool â€” export the st_* catalog tables to a single JSON file, so
// that catalog data built/ingested on one machine (e.g. local dev, where the
// heavy Excel/PDF parsing already ran) can be transferred to another (e.g.
// production, where running that same heavy ingest risked the disk-quota
// crash this file's twin, importCatalog.js, was written to avoid).
//
// Exports ONLY the st_* tables â€” never touches `users`, or any of the
// pre-existing website CMS tables (products, blog_posts, etc.) that live in
// the same shah_admin.db file. Safe to run against a live DB.
//
// Run with:  node server/selectionTool/exportCatalog.js [output-path]
import fs from 'fs';
import path from 'path';
import db from '../db.js';
import ensureSelectionToolSchema from './schema.js';

ensureSelectionToolSchema();

const TABLES = ['st_products', 'st_variants', 'st_specs', 'st_source_docs', 'st_questionnaire', 'st_questions', 'st_settings'];

function exportAll() {
  const data = {};
  for (const table of TABLES) {
    data[table] = db.prepare(`SELECT * FROM ${table}`).all();
  }
  return data;
}

const outPath = process.argv[2] || path.join(process.cwd(), 'selection-tool-catalog-export.json');
const data = exportAll();
fs.writeFileSync(outPath, JSON.stringify(data, null, 0));

console.log('Exported to:', outPath);
for (const table of TABLES) {
  console.log(`  ${table}: ${data[table].length} row(s)`);
}
console.log('Size:', (fs.statSync(outPath).size / 1024 / 1024).toFixed(2), 'MB');

