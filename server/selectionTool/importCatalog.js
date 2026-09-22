// Selection Tool â€” import the JSON produced by exportCatalog.js into this
// machine's shah_admin.db. Written to be run on the LIVE server after the
// backend code has been deployed there, so the disk-heavy Excel/PDF parsing
// never has to run on the production box (that's what caused the earlier
// disk-quota crash) â€” this script just replays already-ingested rows.
//
// SAFETY (read before running against a live DB):
//  - Touches ONLY the st_* tables listed below. Never touches `users`, or
//    any pre-existing website CMS table (products, blog_posts, hero_slides,
//    etc.) that shares the same shah_admin.db file.
//  - Wipes and replaces the st_* tables' rows inside one transaction (all-
//    or-nothing â€” if anything fails, the whole import rolls back and the
//    tables are left exactly as they were before this script ran).
//  - Does NOT touch st_price_entries or st_pricing_sets (pricing is set up
//    separately per deployment, per environment, from the admin panel) or
//    any salesman/admin user row's pricing_set_id assignment.
//  - Does NOT touch the `uploads/` folder or any other file on disk.
//
// Run with:  node server/selectionTool/importCatalog.js <path-to-json>
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import ensureSelectionToolSchema from './schema.js';

ensureSelectionToolSchema();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TABLES_IN_DELETE_ORDER = ['st_specs', 'st_source_docs', 'st_variants', 'st_products', 'st_questions', 'st_questionnaire', 'st_settings'];
const TABLES_IN_INSERT_ORDER = ['st_products', 'st_variants', 'st_specs', 'st_source_docs', 'st_questionnaire', 'st_questions', 'st_settings'];

// Default path matches where the deploy guide says to upload the export â€”
// same folder as this script (server/selectionTool/) â€” so this also works
// when invoked with no parameter at all (e.g. cPanel's "Run JS Script" UI,
// which doesn't reliably forward a `--` args separator to npm).
const DEFAULT_PATH = path.join(__dirname, 'selection-tool-catalog-export.json');
const inPath = process.argv[2] || DEFAULT_PATH;
if (!fs.existsSync(inPath)) {
  console.error('File not found:', inPath);
  console.error('Usage: node server/selectionTool/importCatalog.js [path-to-json]');
  console.error(`(no path given â€” looked for the default: ${DEFAULT_PATH})`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));

function columnsFor(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
}

function insertRows(table, rows) {
  if (!rows || !rows.length) return 0;
  const cols = columnsFor(table);
  const presentCols = cols.filter((c) => Object.prototype.hasOwnProperty.call(rows[0], c));
  const placeholders = presentCols.map((c) => `@${c}`).join(', ');
  const stmt = db.prepare(`INSERT INTO ${table} (${presentCols.join(', ')}) VALUES (${placeholders})`);
  let n = 0;
  for (const row of rows) {
    const params = {};
    presentCols.forEach((c) => { params[c] = row[c] === undefined ? null : row[c]; });
    stmt.run(params);
    n += 1;
  }
  return n;
}

console.log('Source file:', inPath);

// node:sqlite's DatabaseSync has no better-sqlite3-style .transaction()
// helper â€” wrap manually so a mid-import failure rolls everything back
// instead of leaving the st_* tables half-deleted/half-imported.
db.exec('BEGIN');
try {
  for (const table of TABLES_IN_DELETE_ORDER) {
    db.prepare(`DELETE FROM ${table}`).run();
  }
  const counts = {};
  for (const table of TABLES_IN_INSERT_ORDER) {
    counts[table] = insertRows(table, data[table]);
  }
  db.exec('COMMIT');
  console.log('\n--- Import summary --------------------------------------');
  for (const [table, n] of Object.entries(counts)) {
    console.log(`  ${table}: ${n} row(s)`);
  }
  console.log('-----------------------------------------------------------');
  console.log('Done. No other tables (users, products, blog_posts, ...) were touched.');
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Import failed â€” transaction rolled back, no partial changes were made.');
  console.error(err);
  process.exitCode = 1;
}

