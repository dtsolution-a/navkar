// Selection Tool — "Ver 2" source-file ingest (Compressor / Dryer / Filters).
//
// These three workbooks are a separate, later hand-off from the client, each
// living outside the repo (in the analyst's Downloads folder) rather than in
// the original "Selection Tool Data" dump ingest.js walks. Kept as its own
// script — run it AFTER `npm run ingest:selection` — rather than folding it
// into ingest.js, since these paths are local-machine-specific, not part of
// the client hand-off folder structure.
//
// Run with:  node server/selectionTool/ingestVer2.js
//
// Covers:
//  - Compressor ver2.xlsx  (Kaishan Dryer-style transposed sheets; also
//    where the PMV/PMV2 forward-fill fix and "Full Load Pressure" priority
//    fix were confirmed — see parsers.js header comments)
//  - Dryer ver 2.xlsx      ("Kaishan Dryer" + "Trident Dryer" sheets, plain
//    transposed shape, multi-block on the Trident sheet)
//  - Filters ver 2.xlsx    ("Parker" sheet: row-per-model with merged
//    headers; "Trident" sheet: element-grade sub-rows)
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import ensureSelectionToolSchema from './schema.js';
import { parseSheet, parseParkerModelRowSheet, parseTridentFilterGradeSheet } from './parsers.js';
import { upsertVariant } from './upsert.js';

ensureSelectionToolSchema();

const DOWNLOADS = 'C:/Users/Dhiraj Singh/Downloads';

function ingestVariant(v, ctx) {
  return upsertVariant(v, ctx);
}

function readSheetRows(wb, sheetName) {
  return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, raw: true, defval: null });
}

function ingestCompressorVer2() {
  const full = path.join(DOWNLOADS, 'Compressor Ver2.xlsx');
  if (!fs.existsSync(full)) { console.log(`  (skip — not found: ${full})`); return 0; }
  const wb = XLSX.readFile(full);
  let count = 0;
  for (const sheetName of wb.SheetNames) {
    const rows = readSheetRows(wb, sheetName);
    const variants = parseSheet(rows, {});
    variants.forEach((v) => {
      ingestVariant(v, { category: 'compressor', brand: 'Kaishan', fileName: 'Compressor Ver2.xlsx', sheetName });
      count += 1;
    });
    console.log(`  - ${sheetName} -> ${variants.length} variant(s)`);
  }
  return count;
}

// Neither the "Kaishan Dryer" nor "Trident Dryer" sheet carries a pressure
// column at all — they only ever describe the model at its nameplate
// reference condition, with actual field capacity handled entirely by the
// correction-factor tables (dryerCorrection.js). Both brands' own
// correction tables use 7 bar as that reference point (KRD_PRESSURE_TABLE
// has [7, 1.0]; Coldspell's Pi table is likewise anchored at 7 bar) — so 7
// bar is filled in here as the variant's nameplate working_pressure_bar,
// matching the convention already used for Parker/PDF-sourced rows.
// IMPORTANT: without this, parseSheet's output has no working_pressure_bar
// key at all, and upsertVariantStmt's ON CONFLICT unconditionally overwrites
// working_pressure_bar with NULL on re-ingest (unlike list_price, which is
// COALESCEd) — caught live: a first pass without this line silently blanked
// the pressure on every existing Coldspell/KRD row already in the DB.
function withReferencePressure(variants, bar) {
  return variants.map((v) => ({ ...v, filter: { ...v.filter, workingPressureBar: v.filter.workingPressureBar ?? bar } }));
}

function ingestDryerVer2() {
  const full = path.join(DOWNLOADS, 'Dryer ver 2.xlsx');
  if (!fs.existsSync(full)) { console.log(`  (skip — not found: ${full})`); return 0; }
  const wb = XLSX.readFile(full);
  const BRAND_BY_SHEET = { 'Kaishan Dryer': 'Kaishan', 'Trident Dryer': 'Trident' };
  let count = 0;
  for (const sheetName of wb.SheetNames) {
    const brand = BRAND_BY_SHEET[sheetName] || null;
    const rows = readSheetRows(wb, sheetName);
    const variants = withReferencePressure(parseSheet(rows, {}), 7);
    variants.forEach((v) => {
      ingestVariant(v, { category: 'dryer', brand, fileName: 'Dryer ver 2.xlsx', sheetName });
      count += 1;
    });
    console.log(`  - ${sheetName} (${brand}) -> ${variants.length} variant(s)`);
  }
  return count;
}

function ingestFiltersVer2() {
  const full = path.join(DOWNLOADS, 'Filters ver 2.xlsx');
  if (!fs.existsSync(full)) { console.log(`  (skip — not found: ${full})`); return 0; }
  const wb = XLSX.readFile(full);
  let count = 0;

  if (wb.SheetNames.includes('Parker')) {
    const rows = readSheetRows(wb, 'Parker');
    const variants = parseParkerModelRowSheet(rows);
    variants.forEach((v) => ingestVariant(v, { category: 'filter', brand: 'Parker', fileName: 'Filters ver 2.xlsx', sheetName: 'Parker' }));
    console.log(`  - Parker -> ${variants.length} variant(s)`);
    count += variants.length;
  }

  if (wb.SheetNames.includes('Trident')) {
    const rows = readSheetRows(wb, 'Trident');
    const variants = parseTridentFilterGradeSheet(rows);
    variants.forEach((v) => ingestVariant(v, { category: 'filter', brand: 'Trident', fileName: 'Filters ver 2.xlsx', sheetName: 'Trident' }));
    console.log(`  - Trident -> ${variants.length} variant(s)`);
    count += variants.length;
  }

  return count;
}

async function run() {
  console.log('Ingesting Compressor ver2.xlsx...');
  const c = ingestCompressorVer2();

  console.log('\nIngesting Dryer ver 2.xlsx...');
  const d = ingestDryerVer2();

  console.log('\nIngesting Filters ver 2.xlsx...');
  const f = ingestFiltersVer2();

  console.log('\n--- Ver2 ingest summary -----------------------------------');
  console.log(`Compressor ver2.xlsx variant rows: ${c}`);
  console.log(`Dryer ver 2.xlsx variant rows:      ${d}`);
  console.log(`Filters ver 2.xlsx variant rows:    ${f}`);
  console.log('-------------------------------------------------------------');
}

run().catch((err) => {
  console.error('Ver2 ingest failed:', err);
  process.exitCode = 1;
});
