// Selection Tool — ingestion pipeline (Section 02 of the architecture spec).
//
// Walks the raw data folder and ingests both source shapes:
//  - Excel workbooks (KRSA/KRSA2/KRSD/KRSP) via parsers.js.
//  - PDF datasheets, in the two page layouts confirmed in the compressor
//    folders: "Model" + N-column grids (KRSB, Low Pressure, Two Stage —
//    reuses parseTransposedSheet via a PDF->grid reconstruction) and
//    single-model pressure-sweep sheets (PMV, PMV2 — pdfLineParsers.js).
// Also parses Questionnaire.xlsx into st_questionnaire / st_questions.
//
// Run with:  npm run ingest:selection
//
// STILL NOT COVERED: Air Dryer and Filters folders use yet another page
// layout (label:value tables with multiple unit columns per line, no
// "Model" grid and no pressure sweep — see server/selectionTool/pdfGrid.js
// header comment) and need a third, dedicated line parser — follow-up
// increment.

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import db from '../db.js';
import ensureSelectionToolSchema from './schema.js';
import { parseSheet, parseTransposedSheet } from './parsers.js';
import { loadPdfPages, extractGridRows, extractLines } from './pdfGrid.js';
import { parsePressureSweepLines } from './pdfLineParsers.js';
import { parseSingleModelLines } from './pdfSingleModelParser.js';
import { parseDryerCatalogTable } from './pdfDryerCatalogParser.js';
import { parseParkerFlowTable, parseCleansweepTable } from './pdfFilterParsers.js';
import { upsertVariant as upsertVariantShared } from './upsert.js';

// Passwords found in Password.txt / Password KRSP2.txt next to the protected
// PDFs — tried in order since each file turned out to hold a slightly
// different literal string (trailing "=" vs "." vs none).
const PDF_PASSWORD_CANDIDATES = [undefined, 'Kaishan123', 'Kaishan123=', 'Kaishan123.'];

async function loadPdfWithFallbackPassword(buffer) {
  let lastErr;
  for (const pw of PDF_PASSWORD_CANDIDATES) {
    try {
      return await loadPdfPages(buffer, pw);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The raw data dump lives two levels above server/ at the moment (it's the
// extracted client hand-off zip, not yet relocated into the repo proper).
const DATA_ROOT = path.join(
  __dirname,
  '..',
  '..',
  'Selection Tool Data-20260812T090710Z-1-001',
  'Selection Tool Data'
);

ensureSelectionToolSchema();

const COMPRESSOR_FILES = [
  { file: '2024 - KRSA.xls', brand: 'Kaishan' },
  { file: '2024 - KRSA2-5.0.xls', brand: 'Kaishan' },
  { file: 'KRSD Data Sheet.xls', brand: 'Kaishan' },
  { file: 'KRSP.xls', brand: 'Kaishan' },
];

function driveTypeHintFromSheetName(name) {
  if (/non[\s-]?vsd/i.test(name)) return 'fixed';
  if (/vsd|vfd/i.test(name)) return 'vsd';
  if (/fixed/i.test(name)) return 'fixed';
  return null; // let parseTransposedSheet infer from model codes
}

function ingestVariant(v, { category, brand, fileName, sheetName }) {
  upsertVariantShared(v, { category, brand, fileName, sheetName });
}

function ingestCompressorWorkbook({ file, brand }) {
  const full = path.join(DATA_ROOT, 'Air Compressor', file);
  let wb;
  try {
    wb = XLSX.readFile(full);
  } catch (err) {
    console.warn(`  ! could not open ${file}: ${err.message}`);
    return 0;
  }
  let count = 0;
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, raw: true, defval: null });
    const driveTypeHint = driveTypeHintFromSheetName(sheetName);
    const variants = parseSheet(rows, { driveTypeHint });
    variants.forEach((v) => {
      ingestVariant(v, { category: 'compressor', brand, fileName: file, sheetName });
      count += 1;
    });
    console.log(`  - ${file} :: ${sheetName} -> ${variants.length} variant(s)`);
  }
  return count;
}

// ---- Compressor PDFs --------------------------------------------------------

// folder -> shape. 'grid' = Model + N-column datasheet (KRSB-style).
// 'sweep' = single Model line + a pressure-sweep row (PMV-style).
const COMPRESSOR_PDF_FOLDERS = [
  { folder: 'KRSB', shape: 'grid', brand: 'Kaishan' },
  { folder: 'Low Pressure', shape: 'grid', brand: 'Kaishan' },
  { folder: 'Two Stage', shape: 'grid', brand: 'Kaishan' },
  { folder: 'PMV', shape: 'sweep', brand: 'Kaishan' },
  { folder: 'PMV2 Inline FP', shape: 'sweep', brand: 'Kaishan' },
];

async function ingestCompressorPdf(file, { shape, brand }) {
  const buffer = fs.readFileSync(file.fullPath);
  let pages;
  try {
    pages = await loadPdfWithFallbackPassword(buffer);
  } catch (err) {
    console.warn(`  ! could not open ${file.name}: ${err.message}`);
    return 0;
  }

  let count = 0;
  pages.forEach((pageItems, pageIdx) => {
    let variants = [];
    if (shape === 'grid') {
      const grid = extractGridRows(pageItems);
      if (grid.length) variants = parseTransposedSheet(grid, {});
    } else {
      const lines = extractLines(pageItems);
      variants = parsePressureSweepLines(lines, {});
    }
    variants.forEach((v) => {
      ingestVariant(v, { category: 'compressor', brand, fileName: file.name, sheetName: `page ${pageIdx + 1}` });
      count += 1;
    });
    if (variants.length) console.log(`  - ${file.name} :: page ${pageIdx + 1} -> ${variants.length} variant(s)`);
  });
  return count;
}

async function ingestCompressorPdfFolders() {
  let total = 0;
  for (const { folder, shape, brand } of COMPRESSOR_PDF_FOLDERS) {
    const dir = path.join(DATA_ROOT, 'Air Compressor', folder);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));
    for (const name of files) {
      total += await ingestCompressorPdf({ name, fullPath: path.join(dir, name) }, { shape, brand });
    }
  }
  return total;
}

// ---- Air Dryer PDFs ---------------------------------------------------------

async function ingestKaishanDryerPdfs() {
  const dir = path.join(DATA_ROOT, 'Air Dryer', 'Kaishan');
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.toLowerCase().endsWith('.pdf') || !/air cooled/i.test(name)) continue; // skips the general multi-model catalogue PDF
    const buffer = fs.readFileSync(path.join(dir, name));
    let pages;
    try {
      pages = await loadPdfWithFallbackPassword(buffer);
    } catch (err) {
      console.warn(`  ! could not open ${name}: ${err.message}`);
      continue;
    }
    const lines = extractLines(pages[0]);
    const variant = parseSingleModelLines(lines);
    if (!variant) { console.warn(`  ! no "Model" line found in ${name}`); continue; }
    ingestVariant(variant, { category: 'dryer', brand: 'Kaishan', fileName: name, sheetName: 'page 1' });
    console.log(`  - ${name} -> ${variant.modelCode}`);
    count += 1;
  }
  return count;
}

const TRIDENT_DRYER_FILES = ['Coldspell leaflet.pdf', 'coldspell-alpha 11-22.pdf', 'Dryspell Plus-new - Catalogue.pdf'];

async function ingestTridentDryerPdfs() {
  const dir = path.join(DATA_ROOT, 'Air Dryer', 'Trident');
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const name of TRIDENT_DRYER_FILES) {
    const full = path.join(dir, name);
    if (!fs.existsSync(full)) continue;
    const pages = await loadPdfWithFallbackPassword(fs.readFileSync(full));
    const allLines = pages.flatMap((p) => extractLines(p));
    const variants = parseDryerCatalogTable(allLines);
    variants.forEach((v) => ingestVariant(v, { category: 'dryer', brand: 'Trident', fileName: name, sheetName: 'catalogue table' }));
    console.log(`  - ${name} -> ${variants.length} variant(s)`);
    count += variants.length;
  }
  return count;
}

// ---- Filters PDFs -----------------------------------------------------------

async function ingestFilterPdfs() {
  let count = 0;

  const parkerFull = path.join(DATA_ROOT, 'Filters', 'Parker Filters', 'Parker AO & AA Filter-2021.pdf');
  if (fs.existsSync(parkerFull)) {
    const pages = await loadPdfWithFallbackPassword(fs.readFileSync(parkerFull));
    // Flow-rate tables are on the AO and AA grade pages (pages 4-5, 0-indexed 3-4);
    // scan every page so a future revision with shifted page numbers still works.
    for (let i = 0; i < pages.length; i++) {
      const lines = extractLines(pages[i]);
      const variants = parseParkerFlowTable(lines);
      if (!variants.length) continue;
      variants.forEach((v) => ingestVariant(v, { category: 'filter', brand: 'Parker', fileName: 'Parker AO & AA Filter-2021.pdf', sheetName: `page ${i + 1}` }));
      console.log(`  - Parker AO & AA Filter-2021.pdf :: page ${i + 1} -> ${variants.length} variant(s)`);
      count += variants.length;
    }
  }

  const cleansweepFull = path.join(DATA_ROOT, 'Filters', 'Trident Filters', 'Cleansweep Plus.pdf');
  if (fs.existsSync(cleansweepFull)) {
    const pages = await loadPdfWithFallbackPassword(fs.readFileSync(cleansweepFull));
    const allLines = pages.flatMap((p) => extractLines(p));
    const variants = parseCleansweepTable(allLines);
    variants.forEach((v) => ingestVariant(v, { category: 'filter', brand: 'Trident', fileName: 'Cleansweep Plus.pdf', sheetName: 'technical data table' }));
    console.log(`  - Cleansweep Plus.pdf -> ${variants.length} variant(s)`);
    count += variants.length;
  }

  return count;
}

// ---- Questionnaire ---------------------------------------------------------

const QUESTION_RULES = [
  [/minimum working pressure/i, 'minWorkingPressureBar', 'filter'],
  [/min\.?\s*working pressure/i, 'minWorkingPressureBar', 'filter'],
  [/^working pressure \(/i, 'workingPressureBar', 'filter'],
  [/capacity at working pressure/i, 'capacityCfm', 'filter'],
  [/maximum inlet flow/i, 'maxInletFlowCfm', 'filter'],
  [/maximum inlet air temp/i, 'inletTempC', 'correction'],
  [/maximum ambient temp/i, 'ambientTempC', 'correction'],
  [/pressure dew point/i, 'targetPdpC', 'correction'],
  [/lowest list price/i, 'sortListPrice', 'sort'],
  [/lowest specific power/i, 'sortSpecificPower', 'sort'],
];

const SHEET_CATEGORY = {
  'Questionnaire - Air Comp.': 'compressor',
  'Questionnaire - Air Dryer': 'dryer',
  'Questionnaire - Filters': 'filter',
};

const upsertQuestionnaire = db.prepare(`
  INSERT INTO st_questionnaire (id, category, version) VALUES (?, ?, 1)
  ON CONFLICT(id) DO UPDATE SET version = version + 1, updated_at = CURRENT_TIMESTAMP
`);
const clearQuestions = db.prepare(`DELETE FROM st_questions WHERE questionnaire_id = ?`);
const insertQuestion = db.prepare(`
  INSERT INTO st_questions (questionnaire_id, label, param_key, unit, role, sort_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);

function classifyQuestionLabel(label) {
  for (const [re, paramKey, role] of QUESTION_RULES) {
    if (re.test(label)) return { paramKey, role };
  }
  return null;
}

function ingestQuestionnaire() {
  const full = path.join(DATA_ROOT, 'Questionnaire.xlsx');
  const wb = XLSX.readFile(full);
  let total = 0;
  for (const sheetName of wb.SheetNames) {
    const category = SHEET_CATEGORY[sheetName];
    if (!category) continue;
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, raw: true, defval: null });
    const questionnaireId = `qn-${category}`;
    upsertQuestionnaire.run(questionnaireId, category);
    clearQuestions.run(questionnaireId);

    let order = 0;
    rows.forEach((row) => {
      const label = row && row[0] != null ? String(row[0]).trim() : '';
      if (!label) return;
      if (/should be|selection criteria/i.test(label)) return; // rule prose / section headers, not a question
      const hit = classifyQuestionLabel(label);
      if (!hit) return;
      const unitMatch = label.match(/\(([^)]+)\)\s*$/);
      insertQuestion.run(questionnaireId, label, hit.paramKey, unitMatch ? unitMatch[1] : null, hit.role, order++);
      total += 1;
    });
    console.log(`  - ${sheetName} -> ${order} question(s)`);
  }
  return total;
}

// ---- main -------------------------------------------------------------------

async function run() {
  console.log('Ingesting Questionnaire.xlsx...');
  const qCount = ingestQuestionnaire();

  console.log('\nIngesting Air Compressor workbooks (.xls)...');
  let variantCount = 0;
  for (const spec of COMPRESSOR_FILES) {
    variantCount += ingestCompressorWorkbook(spec);
  }

  console.log('\nIngesting Air Compressor PDFs (KRSB / Low Pressure / Two Stage / PMV / PMV2)...');
  variantCount += await ingestCompressorPdfFolders();

  console.log('\nIngesting Air Dryer PDFs (Kaishan KRD)...');
  variantCount += await ingestKaishanDryerPdfs();

  console.log('\nIngesting Air Dryer PDFs (Trident Coldspell / Dryspell)...');
  variantCount += await ingestTridentDryerPdfs();

  console.log('\nIngesting Filters PDFs (Parker AO/AA, Trident Cleansweep+)...');
  variantCount += await ingestFilterPdfs();

  const jobId = uuidv4();
  db.prepare(`INSERT INTO st_ingest_jobs (id, source_path, status, variants_touched) VALUES (?, ?, 'done', ?)`)
    .run(jobId, DATA_ROOT, variantCount);

  const productCount = db.prepare('SELECT COUNT(*) c FROM st_products').get().c;
  const distinctVariants = db.prepare('SELECT COUNT(*) c FROM st_variants').get().c;
  const specCount = db.prepare('SELECT COUNT(*) c FROM st_specs').get().c;

  console.log('\n--- Ingest summary --------------------------------------');
  console.log(`Questions ingested:      ${qCount}`);
  console.log(`Variant rows parsed:     ${variantCount} (across all sheets, incl. duplicates re-describing the same model)`);
  console.log(`Distinct products:       ${productCount}`);
  console.log(`Distinct variants (DB):  ${distinctVariants}`);
  console.log(`Spec attribute rows:     ${specCount}`);
  console.log('-----------------------------------------------------------');
}

run().catch((err) => {
  console.error('Ingest failed:', err);
  process.exitCode = 1;
});

