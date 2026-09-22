// Selection Tool — read API + matching engine.
//
// Matching rule is the literal prose from Questionnaire.xlsx (sheet
// "Questionnaire - Air Comp.", rows 8-9): Working Pressure must fall inside
// the model's [min, effective] range, Capacity must be <= the model's
// capacity at that pressure. Since the ingested compressor sheets only carry
// a single "Effective Working Pressure" per row (no separate min column yet
// — PDF ingestion will fill working_pressure_min_bar), the min bound
// defaults to the effective pressure itself until then.
import { Router } from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import db, { SERVER_DIR } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { upsertVariant, upsertVariants } from '../selectionTool/upsert.js';
import { parseSheet, parseTransposedSheet } from '../selectionTool/parsers.js';
import { loadPdfPages, extractGridRows, extractLines } from '../selectionTool/pdfGrid.js';
import { parsePressureSweepLines } from '../selectionTool/pdfLineParsers.js';
import { parseSingleModelLines } from '../selectionTool/pdfSingleModelParser.js';
import { parseDryerCatalogTable } from '../selectionTool/pdfDryerCatalogParser.js';
import { parseParkerFlowTable, parseCleansweepTable } from '../selectionTool/pdfFilterParsers.js';
import { coldspellCorrectionFactor, krdCorrectionFactor } from '../selectionTool/dryerCorrection.js';
import { parkerRequiredCapacity, kftRequiredCapacity } from '../selectionTool/filterCorrection.js';
import { getSetting, getSettingNumber, setSetting } from '../selectionTool/settings.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
}

// Reference-series PDFs live under uploads/selection-reference/, alongside
// the site's other uploads — not multer's memoryStorage path like the
// catalog ingest above, since these files are read back later (served via
// /api/uploads, same convention as server/routes/upload.js) rather than
// parsed once and discarded. Built from SERVER_DIR (see db.js), not this
// module's own __dirname — the latter resolves one level off inside the
// esbuild bundle (see db.js's comment on SERVER_DIR for why).
const REFERENCE_PDF_DIR = path.join(SERVER_DIR, '..', 'uploads', 'selection-reference');
if (!fs.existsSync(REFERENCE_PDF_DIR)) fs.mkdirSync(REFERENCE_PDF_DIR, { recursive: true });
const referencePdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/\.pdf$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Only PDF files are allowed.'));
  },
});

// GET /api/selection-tool/questionnaire/:category
router.get('/questionnaire/:category', (req, res) => {
  const { category } = req.params;
  const questionnaire = db.prepare('SELECT * FROM st_questionnaire WHERE category = ?').get(category);
  if (!questionnaire) return res.status(404).json({ error: `No questionnaire for category "${category}".` });
  const questions = db
    .prepare('SELECT label, param_key, unit, role, sort_order FROM st_questions WHERE questionnaire_id = ? ORDER BY sort_order')
    .all(questionnaire.id);
  res.json({ category, version: questionnaire.version, questions });
});

// GET /api/selection-tool/catalog/sync?category=compressor&since=0
// Delta pull for the IndexedDB offline store (Section 03/05 of the arch spec).
router.get('/catalog/sync', authenticateToken, (req, res) => {
  const { category, since } = req.query;
  const sinceVersion = Number(since) || 0;

  let variants = db.prepare(`
    SELECT v.*, p.category, p.brand, p.family
    FROM st_variants v JOIN st_products p ON p.id = v.product_id
    WHERE v.active = 1 AND v.spec_version > ?
    ${category ? 'AND p.category = ?' : ''}
    ORDER BY v.model_code
  `).all(...(category ? [sinceVersion, category] : [sinceVersion]));

  const specStmt = db.prepare('SELECT group_label, key, value, unit FROM st_specs WHERE variant_id = ? ORDER BY sort_order');
  variants = variants.map((v) => ({ ...v, specs: specStmt.all(v.id) }));

  const maxVersion = variants.reduce((m, v) => Math.max(m, v.spec_version), sinceVersion);
  res.json({ variants, version: maxVersion, count: variants.length });
});

// POST /api/selection-tool/match
// body: { category, workingPressureBar, capacityCfm, sort: 'price'|'efficiency' }
//
// Match direction is the opposite of itself between categories — confirmed
// against Questionnaire.xlsx's own prose, not assumed:
//  - compressor: client states the pressure they NEED and the flow they
//    NEED; a model qualifies if that pressure sits inside its operating
//    range and its capacity *at that pressure* covers the flow.
//  - dryer/filter: client states the MINIMUM pressure the model must handle
//    and the MAXIMUM flow it must pass; a model qualifies if its rated
//    pressure floor is at or below the client's minimum and its rated flow
//    ceiling is at or above the client's maximum.
// Every category pulls its full active candidate list here (pressure is
// never filtered in SQL) — each category's own *Ok() function below decides
// pressure fit in JS, since several brands need a correction factor (not a
// hard cutoff) applied to the client's stated pressure before a plain
// comparison means anything.
const CATEGORY_CANDIDATES_QUERY = `
  SELECT v.*, p.brand, p.family
  FROM st_variants v JOIN st_products p ON p.id = v.product_id
  WHERE p.category = ? AND v.active = 1
    AND v.working_pressure_bar IS NOT NULL AND v.capacity_cfm IS NOT NULL
`;

// A client condition outside a model's published envelope isn't a capacity
// shortfall, it's "this unit cannot legally/safely run there" — Kaishan KRD
// sheets publish this as a hard Min/Max, unrelated to the correction-factor
// question below.
function withinEnvelope(v, { inletTempC, ambientTempC }) {
  if (inletTempC != null && v.max_inlet_temp_c != null && inletTempC > v.max_inlet_temp_c) return false;
  if (ambientTempC != null && v.min_ambient_temp_c != null && ambientTempC < v.min_ambient_temp_c) return false;
  if (ambientTempC != null && v.max_ambient_temp_c != null && ambientTempC > v.max_ambient_temp_c) return false;
  return true;
}

const isColdspell = (v) => v.brand === 'Trident' && /coldspell/i.test(v.family || '');
const isKrd = (v) => v.brand === 'Kaishan' && v.family === 'KRD';
const isParkerFilter = (v) => v.brand === 'Parker';
const isKftFilter = (v) => v.brand === 'Kaishan' && v.family === 'KFT';

// A model's capacity must sit within ±capacityTolerancePct of the figure
// the client asked for (or, for a corrected category, of the corrected
// requirement) — not just "at least as much". An uncapped ">=" let a much
// bigger, pricier machine match just as readily as a close fit, which read
// as nonsensical results (a 7 bar / 40 cfm request returning a 1500 cfm
// unit). Admin-configurable so the band can be widened/narrowed per
// deployment, same as the pressure tolerance.
function capacityWithinTolerance(modelCapacity, requiredCapacity, capacityTolerancePct) {
  if (modelCapacity == null || requiredCapacity == null) return false;
  const band = requiredCapacity * (capacityTolerancePct / 100);
  return modelCapacity >= requiredCapacity - band && modelCapacity <= requiredCapacity + band;
}

// Dryers: brands with a digitized correction table get the client's stated
// pressure fed into that formula instead of a hard floor (a single
// published "working pressure" is a *reference* point the factor adjusts
// away from — filtering on it as a hard cutoff for every brand alike
// rejected every Coldspell whenever pressure differed from 7 bar, caught
// live, see dryerCorrection.js). Brands with no correction table (Trident
// Dryspell, for now) fall back to a plain pressure-range + capacity-band
// check, same shape as compressor/filter's default path.
function dryerVariantOk(v, { workingPressureBar, capacityCfm, inletTempC, ambientTempC, targetPdpC, toleranceBar, capacityTolerancePct }) {
  if (isColdspell(v)) {
    const factor = coldspellCorrectionFactor({ inletTempC, ambientTempC, workingPressureBar });
    return capacityWithinTolerance(v.capacity_cfm, capacityCfm / factor, capacityTolerancePct);
  }
  if (isKrd(v)) {
    const factor = krdCorrectionFactor({ inletTempC, ambientTempC, workingPressureBar, targetPdpC });
    return capacityWithinTolerance(v.capacity_cfm, capacityCfm / factor, capacityTolerancePct);
  }
  if (Math.abs(v.working_pressure_bar - workingPressureBar) > toleranceBar) return false;
  return capacityWithinTolerance(v.capacity_cfm, capacityCfm, capacityTolerancePct);
}

// Filters: Parker's own datasheet spells out "Minimum Filtration Capacity =
// Flow x CFMIP" (multiply). Trident Cleansweep+ publishes no correction
// table of its own — confirmed with the client to use Parker's CFMIP table
// for Trident too rather than a plain pressure-range check, since it's the
// same category of filter and Trident doesn't publish an alternative. KFT
// keeps its own (divide-convention, unconfirmed) table for when that brand
// eventually has catalog data — currently has none, so this branch is dead
// code in practice, not deleted since it costs nothing to keep ready.
function filterVariantOk(v, { workingPressureBar, capacityCfm, capacityTolerancePct }) {
  if (isKftFilter(v)) {
    return capacityWithinTolerance(v.capacity_cfm, kftRequiredCapacity(capacityCfm, workingPressureBar), capacityTolerancePct);
  }
  // Parker and Trident (Cleansweep+) both use Parker's CFMIP table.
  return capacityWithinTolerance(v.capacity_cfm, parkerRequiredCapacity(capacityCfm, workingPressureBar), capacityTolerancePct);
}

// Compressor: the client names an exact pressure and flow point, not a
// floor/ceiling — a model qualifies only if its own rated pressure sits
// within ±toleranceBar of that point (not "inside a widened [min,max]
// band", which let models rated far outside the requested range through)
// and its capacity sits within ±capacityTolerancePct of the requested flow.
function compressorVariantOk(v, { workingPressureBar, capacityCfm }, toleranceBar, capacityTolerancePct) {
  const pressureDiff = Math.abs(v.working_pressure_bar - workingPressureBar);
  if (pressureDiff > toleranceBar) return { ok: false, approx: false };
  if (!capacityWithinTolerance(v.capacity_cfm, capacityCfm, capacityTolerancePct)) return { ok: false, approx: false };
  return { ok: true, approx: pressureDiff > 0 };
}

router.post('/match', authenticateToken, (req, res) => {
  const { category, workingPressureBar, capacityCfm, inletTempC, ambientTempC, targetPdpC, sort } = req.body || {};
  if (!category || workingPressureBar == null || capacityCfm == null) {
    return res.status(400).json({ error: 'category, workingPressureBar, and capacityCfm are required.' });
  }
  if (!['compressor', 'dryer', 'filter'].includes(category)) {
    return res.status(400).json({ error: `Unknown category "${category}".` });
  }
  const toleranceBar = getSettingNumber('pressure_tolerance_bar', 3);
  // Filter has its own capacity tolerance, separate from
  // capacity_tolerance_pct (compressor/dryer) — see schema.js's comment.
  const capacityTolerancePct = category === 'filter'
    ? getSettingNumber('filter_capacity_tolerance_pct', 10)
    : getSettingNumber('capacity_tolerance_pct', 5);
  const candidates = db.prepare(CATEGORY_CANDIDATES_QUERY).all(category);

  let rows;
  if (category === 'compressor') {
    rows = candidates
      .map((v) => ({ v, r: compressorVariantOk(v, { workingPressureBar, capacityCfm }, toleranceBar, capacityTolerancePct) }))
      .filter((x) => x.r.ok)
      .map((x) => ({ ...x.v, approxMatch: x.r.approx }));
  } else if (category === 'dryer') {
    rows = candidates
      .filter((v) => withinEnvelope(v, { inletTempC, ambientTempC }))
      .filter((v) => dryerVariantOk(v, { workingPressureBar, capacityCfm, inletTempC, ambientTempC, targetPdpC, toleranceBar: 0, capacityTolerancePct }))
      .map((v) => ({ ...v, approxMatch: false }));
    if (rows.length === 0 && toleranceBar > 0) {
      rows = candidates
        .filter((v) => withinEnvelope(v, { inletTempC, ambientTempC }))
        .filter((v) => dryerVariantOk(v, { workingPressureBar, capacityCfm, inletTempC, ambientTempC, targetPdpC, toleranceBar, capacityTolerancePct }))
        .map((v) => ({ ...v, approxMatch: true }));
    }
  } else {
    // Every filter brand now runs a pressure-correction formula (Parker's
    // CFMIP table, shared with Trident — see filterVariantOk — or KFT's own
    // table), so the client's pressure input already feeds the required-
    // capacity calculation directly. There's no separate pressure-range
    // check left to widen with toleranceBar the way compressor/dryer do —
    // a single pass covers it, and every filter result is a genuine match,
    // never "nearest available".
    rows = candidates.filter((v) => filterVariantOk(v, { workingPressureBar, capacityCfm, capacityTolerancePct })).map((v) => ({ ...v, approxMatch: false }));
  }

  if (sort === 'efficiency') {
    rows.sort((a, b) => (a.specific_power ?? Infinity) - (b.specific_power ?? Infinity));
  } else {
    rows.sort((a, b) => (a.list_price ?? Infinity) - (b.list_price ?? Infinity));
  }

  const specStmt = db.prepare('SELECT group_label, key, value, unit FROM st_specs WHERE variant_id = ? ORDER BY sort_order');
  const results = rows.map((v) => ({ ...v, specs: specStmt.all(v.id) }));

  res.json({
    criteria: { category, workingPressureBar, capacityCfm, inletTempC, ambientTempC, targetPdpC, sort: sort || 'price', toleranceBar, capacityTolerancePct },
    count: results.length,
    results,
  });
});

// POST /api/selection-tool/match/comprehensive
// body: same shape as /match — { category, workingPressureBar, capacityCfm,
// inletTempC, ambientTempC, targetPdpC }
//
// An alternate, opt-in view (toggled in the UI, not a replacement for
// /match) — confirmed with the client: for every bar point from the
// client's requested pressure up to +toleranceBar (never below — a 5 bar
// request with a 3 bar tolerance sweeps 5,6,7,8, never 2,3,4), show the
// model whose capacity sits CLOSEST BELOW the client's requested capacity
// and the model whose capacity sits CLOSEST ABOVE it — a client asking for
// 1000 cfm sees the nearest-under and nearest-over model at each bar, not
// the catalog's overall smallest/largest (that was the first cut of this
// feature, corrected after the client clarified — "closest to what I
// asked for", not "the full range that exists"). The ±% capacity-tolerance
// band still doesn't apply here — that's the point of this view. Where
// compressor's rated pressure is a real per-model spec, dryer/filter's
// "bar" is a correction-formula input (see dryerVariantOk/filterVariantOk
// in /match above) — so for those two categories each bar in the sweep
// first runs through that category's own correction formula to get a
// required capacity, and "closest below/above" is judged against each
// candidate's own required-capacity at that bar (not a shared target),
// since no catalog row is itself "rated at" a dryer/filter bar value.
router.post('/match/comprehensive', authenticateToken, (req, res) => {
  const { category, workingPressureBar, capacityCfm, inletTempC, ambientTempC, targetPdpC } = req.body || {};
  if (!category || workingPressureBar == null || capacityCfm == null) {
    return res.status(400).json({ error: 'category, workingPressureBar, and capacityCfm are required.' });
  }
  if (!['compressor', 'dryer', 'filter'].includes(category)) {
    return res.status(400).json({ error: `Unknown category "${category}".` });
  }
  const toleranceBar = getSettingNumber('pressure_tolerance_bar', 3);
  const candidates = db.prepare(CATEGORY_CANDIDATES_QUERY).all(category);
  const specStmt = db.prepare('SELECT group_label, key, value, unit FROM st_specs WHERE variant_id = ? ORDER BY sort_order');
  const withSpecs = (v) => ({ ...v, specs: specStmt.all(v.id) });

  const barPoints = [];
  for (let b = Math.round(workingPressureBar); b <= Math.round(workingPressureBar) + toleranceBar; b++) barPoints.push(b);

  const bands = barPoints.map((bar) => {
    let pool;
    if (category === 'compressor') {
      // Exact-bar match — a compressor's working_pressure_bar is its own
      // rated spec, not a formula input, so "at this bar" means literally
      // that column's value, same as /match's compressorVariantOk.
      pool = candidates.filter((v) => Math.round(v.working_pressure_bar) === bar);
    } else if (category === 'dryer') {
      // Coldspell/KRD correction is per-brand — each candidate gets its own
      // required-capacity for this bar; brands with no correction table
      // (Trident Dryspell) just use the client's raw figure.
      pool = candidates
        .filter((v) => withinEnvelope(v, { inletTempC, ambientTempC }))
        .map((v) => {
          let req = capacityCfm;
          if (isColdspell(v)) req = capacityCfm / coldspellCorrectionFactor({ inletTempC, ambientTempC, workingPressureBar: bar });
          else if (isKrd(v)) req = capacityCfm / krdCorrectionFactor({ inletTempC, ambientTempC, workingPressureBar: bar, targetPdpC });
          return { v, requiredCapacity: req };
        });
    } else {
      pool = candidates.map((v) => {
        const req = isKftFilter(v) ? kftRequiredCapacity(capacityCfm, bar) : parkerRequiredCapacity(capacityCfm, bar);
        return { v, requiredCapacity: req };
      });
    }

    // "Below" = candidate's capacity < target, keep the one closest to the
    // target (largest such capacity). "Above" = candidate's capacity >=
    // target, keep the one closest to the target (smallest such capacity).
    // A capacity exactly equal to the target counts as "above" (found via
    // >=) so it isn't silently dropped by neither bucket.
    let below = null;
    let above = null;
    if (category === 'compressor') {
      pool.forEach((v) => {
        if (v.capacity_cfm < capacityCfm) {
          if (!below || v.capacity_cfm > below.capacity_cfm) below = v;
        } else {
          if (!above || v.capacity_cfm < above.capacity_cfm) above = v;
        }
      });
    } else {
      pool.forEach(({ v, requiredCapacity }) => {
        if (requiredCapacity == null) return;
        if (v.capacity_cfm < requiredCapacity) {
          if (!below || v.capacity_cfm > below.v.capacity_cfm) below = { v, requiredCapacity };
        } else {
          if (!above || v.capacity_cfm < above.v.capacity_cfm) above = { v, requiredCapacity };
        }
      });
      below = below ? below.v : null;
      above = above ? above.v : null;
    }

    // Keeping the response field names "lowest"/"highest" (not "below"/
    // "above") — same wire shape the frontend already reads, just meaning
    // "nearest below" and "nearest above" the target now instead of the
    // catalog's overall min/max.
    return {
      bar,
      lowest: below ? withSpecs(below) : null,
      highest: above ? withSpecs(above) : null,
    };
  });

  res.json({
    criteria: { category, workingPressureBar, capacityCfm, inletTempC, ambientTempC, targetPdpC, toleranceBar },
    bands,
  });
});

// GET /api/selection-tool/pricing/mine — the assigned pricing set for the
// logged-in salesman, or null if unassigned (unassigned means the real
// catalog list_price, no markup, per the client's explicit rule).
router.get('/pricing/mine', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT pricing_set_id FROM users WHERE id = ?').get(req.user.id);
  if (!user?.pricing_set_id) return res.json({ pricingSet: null });

  const pricingSet = db.prepare('SELECT * FROM st_pricing_sets WHERE id = ?').get(user.pricing_set_id);
  if (!pricingSet) return res.json({ pricingSet: null });
  res.json({
    pricingSet: {
      id: pricingSet.id,
      name: pricingSet.name,
      compressorMarkupPct: pricingSet.compressor_markup_pct,
      dryerMarkupPct: pricingSet.dryer_markup_pct,
      filterMarkupPct: pricingSet.filter_markup_pct,
    },
  });
});

// GET /api/selection-tool/settings — matching-engine knobs, synced down to
// every salesman's offline store so offline matching uses the same
// tolerance the server would (salesman-readable, not admin-only: the value
// has to reach the device before a diagnosis can run offline).
router.get('/settings', authenticateToken, (req, res) => {
  res.json({
    pressureToleranceBar: getSettingNumber('pressure_tolerance_bar', 3),
    capacityTolerancePct: getSettingNumber('capacity_tolerance_pct', 5),
    filterCapacityTolerancePct: getSettingNumber('filter_capacity_tolerance_pct', 10),
  });
});

router.patch('/admin/settings', authenticateToken, requireAdmin, (req, res) => {
  const { pressureToleranceBar, capacityTolerancePct, filterCapacityTolerancePct } = req.body || {};
  if (pressureToleranceBar == null || Number.isNaN(Number(pressureToleranceBar)) || Number(pressureToleranceBar) < 0) {
    return res.status(400).json({ error: 'pressureToleranceBar must be a non-negative number.' });
  }
  if (capacityTolerancePct == null || Number.isNaN(Number(capacityTolerancePct)) || Number(capacityTolerancePct) < 0 || Number(capacityTolerancePct) > 100) {
    return res.status(400).json({ error: 'capacityTolerancePct must be a number between 0 and 100.' });
  }
  if (filterCapacityTolerancePct == null || Number.isNaN(Number(filterCapacityTolerancePct)) || Number(filterCapacityTolerancePct) < 0 || Number(filterCapacityTolerancePct) > 100) {
    return res.status(400).json({ error: 'filterCapacityTolerancePct must be a number between 0 and 100.' });
  }
  setSetting('pressure_tolerance_bar', Number(pressureToleranceBar));
  setSetting('capacity_tolerance_pct', Number(capacityTolerancePct));
  setSetting('filter_capacity_tolerance_pct', Number(filterCapacityTolerancePct));
  res.json({
    pressureToleranceBar: Number(pressureToleranceBar),
    capacityTolerancePct: Number(capacityTolerancePct),
    filterCapacityTolerancePct: Number(filterCapacityTolerancePct),
  });
});

// ---- Questionnaire input limits (min/max a salesman can type per field) ---
//
// Pressure is only a real per-model rating for compressor — dryer/filter's
// "pressure" question feeds a correction formula (see dryerCorrection.js /
// filterCorrection.js), it isn't a spec any catalog row actually has, so no
// data-derived range exists for it there and none is offered.
const VALIDATION_FIELDS = [
  { category: 'compressor', field: 'pressureBar', column: 'working_pressure_bar', settingPrefix: 'compressor_pressure' },
  { category: 'compressor', field: 'capacityCfm', column: 'capacity_cfm', settingPrefix: 'compressor_capacity' },
  { category: 'dryer', field: 'capacityCfm', column: 'capacity_cfm', settingPrefix: 'dryer_capacity' },
  { category: 'filter', field: 'capacityCfm', column: 'capacity_cfm', settingPrefix: 'filter_capacity' },
];

function computeDataRange(category, column) {
  const row = db.prepare(`
    SELECT MIN(v.${column}) lo, MAX(v.${column}) hi
    FROM st_variants v JOIN st_products p ON p.id = v.product_id
    WHERE p.category = ? AND v.${column} IS NOT NULL
  `).get(category);
  return { lo: row?.lo ?? null, hi: row?.hi ?? null };
}

// GET /api/selection-tool/validation-limits — the min/max each questionnaire
// field will accept. Every field resolves to an admin override when one has
// been saved, falling back to the catalog's own current min/max otherwise —
// so a fresh install with no override yet still gets a sane, data-driven
// limit instead of accepting anything.
router.get('/validation-limits', authenticateToken, (req, res) => {
  const limits = {};
  for (const { category, field, column, settingPrefix } of VALIDATION_FIELDS) {
    const dataRange = computeDataRange(category, column);
    const overrideMin = getSetting(`${settingPrefix}_min_override`);
    const overrideMax = getSetting(`${settingPrefix}_max_override`);
    limits[category] = limits[category] || {};
    limits[category][field] = {
      min: overrideMin != null ? Number(overrideMin) : dataRange.lo,
      max: overrideMax != null ? Number(overrideMax) : dataRange.hi,
      dataMin: dataRange.lo,
      dataMax: dataRange.hi,
      isOverridden: overrideMin != null || overrideMax != null,
    };
  }
  res.json(limits);
});

// PATCH /api/selection-tool/admin/validation-limits — set or clear an
// override for one field. Passing null for both min and max clears the
// override, reverting that field to tracking the catalog's live min/max.
router.patch('/admin/validation-limits', authenticateToken, requireAdmin, (req, res) => {
  const { category, field, min, max } = req.body || {};
  const target = VALIDATION_FIELDS.find((f) => f.category === category && f.field === field);
  if (!target) return res.status(400).json({ error: `Unknown category/field combination "${category}/${field}".` });
  if (min != null && (Number.isNaN(Number(min)))) return res.status(400).json({ error: 'min must be a number or null.' });
  if (max != null && (Number.isNaN(Number(max)))) return res.status(400).json({ error: 'max must be a number or null.' });
  if (min != null && max != null && Number(min) > Number(max)) return res.status(400).json({ error: 'min cannot be greater than max.' });

  // Clearing an override means deleting its row outright — getSetting()
  // returns null for a missing key, which is exactly what the GET handler's
  // "fall back to the catalog's data range" check above is looking for.
  if (min == null) db.prepare(`DELETE FROM st_settings WHERE key = ?`).run(`${target.settingPrefix}_min_override`);
  else setSetting(`${target.settingPrefix}_min_override`, Number(min));
  if (max == null) db.prepare(`DELETE FROM st_settings WHERE key = ?`).run(`${target.settingPrefix}_max_override`);
  else setSetting(`${target.settingPrefix}_max_override`, Number(max));

  const dataRange = computeDataRange(target.category, target.column);
  res.json({
    category, field,
    min: min != null ? Number(min) : dataRange.lo,
    max: max != null ? Number(max) : dataRange.hi,
    dataMin: dataRange.lo,
    dataMax: dataRange.hi,
    isOverridden: min != null || max != null,
  });
});

// ---- Salesman lifecycle — admin only (Section 03) --------------------------

router.get('/admin/salesmen', authenticateToken, requireAdmin, (req, res) => {
  const rows = db.prepare(`
    SELECT id, username, email, role, status, pricing_set_id, created_at
    FROM users WHERE role = 'salesman' ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

router.post('/admin/salesmen', authenticateToken, requireAdmin, (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required.' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
  if (existing) return res.status(409).json({ error: 'A user with that username or email already exists.' });

  const hashed = bcrypt.hashSync(password, 10);
  db.prepare(`INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, 'salesman', 'active')`)
    .run(username, email, hashed);
  const created = db.prepare('SELECT id, username, email, role, status FROM users WHERE username = ?').get(username);
  res.status(201).json(created);
});

// PUT /api/selection-tool/admin/salesmen/:id — edit username/email, optionally reset password.
router.put('/admin/salesmen/:id', authenticateToken, requireAdmin, (req, res) => {
  const { username, email, password } = req.body || {};
  const existing = db.prepare(`SELECT * FROM users WHERE id = ? AND role = 'salesman'`).get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Salesman not found.' });

  if (username || email) {
    const clash = db.prepare('SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?')
      .get(username || existing.username, email || existing.email, req.params.id);
    if (clash) return res.status(409).json({ error: 'Another user already has that username or email.' });
  }

  db.prepare('UPDATE users SET username = ?, email = ? WHERE id = ?')
    .run(username || existing.username, email || existing.email, req.params.id);
  if (password) {
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), req.params.id);
  }
  const updated = db.prepare('SELECT id, username, email, role, status, pricing_set_id FROM users WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.patch('/admin/salesmen/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!['active', 'inactive', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'status must be active, inactive, or archived.' });
  }
  const user = db.prepare(`SELECT id FROM users WHERE id = ? AND role = 'salesman'`).get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Salesman not found.' });
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ id: Number(req.params.id), status });
});

router.patch('/admin/salesmen/:id/pricing-set', authenticateToken, requireAdmin, (req, res) => {
  const { pricingSetId } = req.body || {}; // null/undefined unassigns
  const user = db.prepare(`SELECT id FROM users WHERE id = ? AND role = 'salesman'`).get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Salesman not found.' });
  if (pricingSetId) {
    const set = db.prepare('SELECT id FROM st_pricing_sets WHERE id = ?').get(pricingSetId);
    if (!set) return res.status(404).json({ error: 'Pricing set not found.' });
  }
  db.prepare('UPDATE users SET pricing_set_id = ? WHERE id = ?').run(pricingSetId || null, req.params.id);
  res.json({ id: Number(req.params.id), pricingSetId: pricingSetId || null });
});

// ---- Pricing sets — admin only ----------------------------------------------
//
// A pricing set is a percentage markup/markdown applied to the catalog's
// own list_price at read time, one value per category (compressor/dryer/
// filter) — "same % everywhere" is just all three columns holding the same
// number. Replaces the old per-model price-entry table entirely (see
// schema.js's comment on st_pricing_sets). A salesman with no set assigned
// sees the real, unmarked-up list_price — enforced in /pricing/mine and by
// the frontend treating a null pricingSet as "no markup".

function formatPricingSet(row) {
  return {
    id: row.id,
    name: row.name,
    isActive: !!row.is_active,
    compressorMarkupPct: row.compressor_markup_pct,
    dryerMarkupPct: row.dryer_markup_pct,
    filterMarkupPct: row.filter_markup_pct,
    createdAt: row.created_at,
  };
}

function validateMarkupPct(value, label) {
  if (value == null || Number.isNaN(Number(value))) return `${label} must be a number.`;
  if (Number(value) <= -100) return `${label} must be greater than -100 (a -100% markup would zero out every price).`;
  return null;
}

router.get('/admin/pricing-sets', authenticateToken, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM st_pricing_sets ORDER BY created_at DESC').all();
  res.json(rows.map(formatPricingSet));
});

router.post('/admin/pricing-sets', authenticateToken, requireAdmin, (req, res) => {
  const { name, compressorMarkupPct, dryerMarkupPct, filterMarkupPct } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required.' });
  for (const [value, label] of [[compressorMarkupPct, 'compressorMarkupPct'], [dryerMarkupPct, 'dryerMarkupPct'], [filterMarkupPct, 'filterMarkupPct']]) {
    const err = validateMarkupPct(value, label);
    if (err) return res.status(400).json({ error: err });
  }
  const id = uuidv4();
  db.prepare('INSERT INTO st_pricing_sets (id, name, compressor_markup_pct, dryer_markup_pct, filter_markup_pct) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, Number(compressorMarkupPct), Number(dryerMarkupPct), Number(filterMarkupPct));
  res.status(201).json(formatPricingSet(db.prepare('SELECT * FROM st_pricing_sets WHERE id = ?').get(id)));
});

router.put('/admin/pricing-sets/:id', authenticateToken, requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM st_pricing_sets WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Pricing set not found.' });
  const { name, compressorMarkupPct, dryerMarkupPct, filterMarkupPct, isActive } = req.body || {};
  for (const [value, label] of [[compressorMarkupPct, 'compressorMarkupPct'], [dryerMarkupPct, 'dryerMarkupPct'], [filterMarkupPct, 'filterMarkupPct']]) {
    if (value === undefined) continue; // PUT allows partial updates
    const err = validateMarkupPct(value, label);
    if (err) return res.status(400).json({ error: err });
  }
  db.prepare(`
    UPDATE st_pricing_sets SET
      name = ?, compressor_markup_pct = ?, dryer_markup_pct = ?, filter_markup_pct = ?, is_active = ?
    WHERE id = ?
  `).run(
    name ?? existing.name,
    compressorMarkupPct !== undefined ? Number(compressorMarkupPct) : existing.compressor_markup_pct,
    dryerMarkupPct !== undefined ? Number(dryerMarkupPct) : existing.dryer_markup_pct,
    filterMarkupPct !== undefined ? Number(filterMarkupPct) : existing.filter_markup_pct,
    isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
    req.params.id
  );
  res.json(formatPricingSet(db.prepare('SELECT * FROM st_pricing_sets WHERE id = ?').get(req.params.id)));
});

router.delete('/admin/pricing-sets/:id', authenticateToken, requireAdmin, (req, res) => {
  const assigned = db.prepare(`SELECT COUNT(*) c FROM users WHERE pricing_set_id = ?`).get(req.params.id).c;
  if (assigned > 0) {
    return res.status(409).json({ error: `Blocked: ${assigned} salesman(s) still assigned to this set. Reassign them first.` });
  }
  db.prepare('DELETE FROM st_pricing_sets WHERE id = ?').run(req.params.id);
  res.json({ message: 'Pricing set deleted.' });
});

// ---- Reference series — vendor spec tables + PDFs, admin-managed ----------
//
// Each series (KRD, PMV, Cleansweep+, Parker AO, ...) is matched to a
// salesman's results by category/brand/family — see the salesman-facing GET
// below, which is the only endpoint a non-admin can hit. The admin CRUD
// here mirrors the shape the client asked for: a name, the match rule,
// optional table data (rendered as columns/rows), and an optional PDF with
// an optional page number so many series can share one multi-page catalog.

function formatReferenceSeries(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    family: row.family,
    tableData: row.table_data_json ? JSON.parse(row.table_data_json) : null,
    pdfUrl: row.pdf_asset_path ? `/api/uploads/selection-reference/${path.basename(row.pdf_asset_path)}` : null,
    pdfOriginalName: row.pdf_original_name,
    pdfPage: row.pdf_page,
    sortOrder: row.sort_order,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get('/admin/reference-series', authenticateToken, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM st_reference_series ORDER BY category, sort_order, name').all();
  res.json(rows.map(formatReferenceSeries));
});

// POST /api/selection-tool/admin/reference-series — multipart form:
// name, category, brand, family, tableData (JSON string, optional),
// pdfPage (optional), file (PDF, optional — either tableData or a file
// must be present, checked below).
router.post('/admin/reference-series', authenticateToken, requireAdmin, referencePdfUpload.single('file'), (req, res) => {
  const { name, category, brand, family, tableData, pdfPage } = req.body || {};
  if (!name || !category) return res.status(400).json({ error: 'name and category are required.' });
  if (!['compressor', 'dryer', 'filter'].includes(category)) return res.status(400).json({ error: `Unknown category "${category}".` });

  let parsedTableData = null;
  if (tableData) {
    try { parsedTableData = JSON.parse(tableData); } catch { return res.status(400).json({ error: 'tableData must be valid JSON.' }); }
  }
  if (!parsedTableData && !req.file) {
    return res.status(400).json({ error: 'Provide table data, a PDF, or both — a reference entry with neither has nothing to show.' });
  }

  let pdfAssetPath = null;
  let pdfOriginalName = null;
  if (req.file) {
    const filename = `${uuidv4()}.pdf`;
    fs.writeFileSync(path.join(REFERENCE_PDF_DIR, filename), req.file.buffer);
    pdfAssetPath = `selection-reference/${filename}`;
    pdfOriginalName = req.file.originalname;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO st_reference_series (id, name, category, brand, family, table_data_json, pdf_asset_path, pdf_original_name, pdf_page)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, category, brand || null, family || null, parsedTableData ? JSON.stringify(parsedTableData) : null, pdfAssetPath, pdfOriginalName, pdfPage ? Number(pdfPage) : null);
  res.status(201).json(formatReferenceSeries(db.prepare('SELECT * FROM st_reference_series WHERE id = ?').get(id)));
});

// PUT /api/selection-tool/admin/reference-series/:id — same multipart shape
// as POST; a new file replaces the old one (old file is deleted), omitting
// `file` keeps whatever PDF is already attached. isActive toggles listing
// without deleting the entry.
router.put('/admin/reference-series/:id', authenticateToken, requireAdmin, referencePdfUpload.single('file'), (req, res) => {
  const existing = db.prepare('SELECT * FROM st_reference_series WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Reference series not found.' });
  const { name, category, brand, family, tableData, pdfPage, isActive, removePdf } = req.body || {};

  if (category && !['compressor', 'dryer', 'filter'].includes(category)) {
    return res.status(400).json({ error: `Unknown category "${category}".` });
  }
  let parsedTableData = existing.table_data_json ? JSON.parse(existing.table_data_json) : null;
  if (tableData !== undefined) {
    if (tableData === '' || tableData === null) parsedTableData = null;
    else {
      try { parsedTableData = JSON.parse(tableData); } catch { return res.status(400).json({ error: 'tableData must be valid JSON.' }); }
    }
  }

  let pdfAssetPath = existing.pdf_asset_path;
  let pdfOriginalName = existing.pdf_original_name;
  if (req.file) {
    if (existing.pdf_asset_path) {
      const oldPath = path.join(REFERENCE_PDF_DIR, path.basename(existing.pdf_asset_path));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const filename = `${uuidv4()}.pdf`;
    fs.writeFileSync(path.join(REFERENCE_PDF_DIR, filename), req.file.buffer);
    pdfAssetPath = `selection-reference/${filename}`;
    pdfOriginalName = req.file.originalname;
  } else if (removePdf === 'true' || removePdf === true) {
    if (existing.pdf_asset_path) {
      const oldPath = path.join(REFERENCE_PDF_DIR, path.basename(existing.pdf_asset_path));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    pdfAssetPath = null;
    pdfOriginalName = null;
  }

  if (!parsedTableData && !pdfAssetPath) {
    return res.status(400).json({ error: 'A reference entry needs table data, a PDF, or both — cannot remove the last one.' });
  }

  db.prepare(`
    UPDATE st_reference_series SET
      name = ?, category = ?, brand = ?, family = ?, table_data_json = ?,
      pdf_asset_path = ?, pdf_original_name = ?, pdf_page = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    name ?? existing.name,
    category ?? existing.category,
    brand !== undefined ? (brand || null) : existing.brand,
    family !== undefined ? (family || null) : existing.family,
    parsedTableData ? JSON.stringify(parsedTableData) : null,
    pdfAssetPath,
    pdfOriginalName,
    pdfPage !== undefined ? (pdfPage ? Number(pdfPage) : null) : existing.pdf_page,
    isActive !== undefined ? (isActive === 'true' || isActive === true ? 1 : 0) : existing.is_active,
    req.params.id
  );
  res.json(formatReferenceSeries(db.prepare('SELECT * FROM st_reference_series WHERE id = ?').get(req.params.id)));
});

router.delete('/admin/reference-series/:id', authenticateToken, requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT * FROM st_reference_series WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Reference series not found.' });
  if (existing.pdf_asset_path) {
    const filePath = path.join(REFERENCE_PDF_DIR, path.basename(existing.pdf_asset_path));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.prepare('DELETE FROM st_reference_series WHERE id = ?').run(req.params.id);
  res.json({ message: 'Reference series deleted.' });
});

// GET /api/selection-tool/reference-series?category=compressor — every
// active entry for a category, synced down to the offline store like the
// catalog/questionnaire (Section 05) so matching a series to results still
// works with no connection. The salesman-side match (which entries apply
// to a given set of results) happens client-side against brand/family —
// see src/selectionTool/db.js.
router.get('/reference-series', authenticateToken, (req, res) => {
  const { category } = req.query;
  const rows = category
    ? db.prepare('SELECT * FROM st_reference_series WHERE category = ? AND is_active = 1 ORDER BY sort_order, name').all(category)
    : db.prepare('SELECT * FROM st_reference_series WHERE is_active = 1 ORDER BY category, sort_order, name').all();
  res.json(rows.map(formatReferenceSeries));
});

// ---- Catalog — admin browse / manual add-edit-delete (Tier 2: always works,
// regardless of source-file format; the fallback when upload-ingestion below
// can't make sense of a new vendor's document) --------------------------------

router.get('/admin/variants', authenticateToken, requireAdmin, (req, res) => {
  const { category, q } = req.query;
  const rows = db.prepare(`
    SELECT v.id, v.model_code, v.drive_type, v.working_pressure_bar, v.capacity_cfm, v.list_price, p.category, p.brand, p.family
    FROM st_variants v JOIN st_products p ON p.id = v.product_id
    WHERE v.active = 1
      ${category ? 'AND p.category = ?' : ''}
      ${q ? 'AND v.model_code LIKE ?' : ''}
    ORDER BY p.family, v.model_code
  `).all(...[category, q ? `%${q}%` : null].filter((x) => x !== null && x !== undefined));
  res.json(rows);
});

// GET /api/selection-tool/admin/variants/specs?ids=uuid1,uuid2 — full spec
// rows for a batch of variants (st_variants.id is a UUID string, not an
// int) in one query, used by the catalog page's Excel export so it doesn't
// fire one request per row.
router.get('/admin/variants/specs', authenticateToken, requireAdmin, (req, res) => {
  const ids = String(req.query.ids || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return res.json({});
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`SELECT variant_id, group_label, key, value, unit FROM st_specs WHERE variant_id IN (${placeholders}) ORDER BY variant_id, sort_order`).all(...ids);
  const byVariant = {};
  rows.forEach((r) => {
    if (!byVariant[r.variant_id]) byVariant[r.variant_id] = [];
    byVariant[r.variant_id].push({ groupLabel: r.group_label, key: r.key, value: r.value, unit: r.unit });
  });
  res.json(byVariant);
});

router.get('/admin/variants/:id', authenticateToken, requireAdmin, (req, res) => {
  const variant = db.prepare(`
    SELECT v.*, p.category, p.brand, p.family
    FROM st_variants v JOIN st_products p ON p.id = v.product_id
    WHERE v.id = ?
  `).get(req.params.id);
  if (!variant) return res.status(404).json({ error: 'Variant not found.' });
  variant.specs = db.prepare('SELECT id, group_label, key, value, unit FROM st_specs WHERE variant_id = ? ORDER BY sort_order').all(variant.id);
  res.json(variant);
});

function specsFromBody(body) {
  return Array.isArray(body.specs)
    ? body.specs.filter((s) => s.key).map((s) => ({ groupLabel: s.groupLabel || 'General', key: s.key, value: s.value ?? '', unit: s.unit || null }))
    : [];
}

// POST /api/selection-tool/admin/variants — manual create, any category/brand,
// no dependency on a source file existing or being parseable at all.
router.post('/admin/variants', authenticateToken, requireAdmin, (req, res) => {
  const { category, brand, family, modelCode, driveType, workingPressureBar, workingPressureMinBar, capacityCfm, capacityM3Min, listPrice, specificPower } = req.body || {};
  if (!category || !modelCode) return res.status(400).json({ error: 'category and modelCode are required.' });
  const existing = db.prepare('SELECT id FROM st_variants WHERE model_code = ?').get(modelCode);
  if (existing) return res.status(409).json({ error: `Model code "${modelCode}" already exists.` });

  const id = upsertVariant(
    {
      modelCode,
      driveType: driveType || null,
      family: family || undefined,
      filter: { workingPressureBar, workingPressureMinBar, capacityCfm, capacityM3Min, specificPower },
      specs: specsFromBody(req.body),
    },
    { category, brand }
  );
  if (listPrice != null) db.prepare('UPDATE st_variants SET list_price = ? WHERE id = ?').run(listPrice, id);
  res.status(201).json(db.prepare('SELECT * FROM st_variants WHERE id = ?').get(id));
});

router.put('/admin/variants/:id', authenticateToken, requireAdmin, (req, res) => {
  const existing = db.prepare(`SELECT v.*, p.category, p.brand FROM st_variants v JOIN st_products p ON p.id=v.product_id WHERE v.id = ?`).get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Variant not found.' });
  const { category, brand, family, modelCode, driveType, workingPressureBar, workingPressureMinBar, capacityCfm, capacityM3Min, listPrice, specificPower } = req.body || {};

  if (modelCode && modelCode !== existing.model_code) {
    const clash = db.prepare('SELECT id FROM st_variants WHERE model_code = ? AND id != ?').get(modelCode, req.params.id);
    if (clash) return res.status(409).json({ error: `Model code "${modelCode}" already exists.` });
    db.prepare('UPDATE st_variants SET model_code = ? WHERE id = ?').run(modelCode, req.params.id);
  }

  db.prepare(`
    UPDATE st_variants SET drive_type=?, working_pressure_bar=?, working_pressure_min_bar=?, capacity_cfm=?, capacity_m3min=?, specific_power=?, updated_at=CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    driveType ?? existing.drive_type,
    workingPressureBar ?? existing.working_pressure_bar,
    workingPressureMinBar ?? existing.working_pressure_min_bar,
    capacityCfm ?? existing.capacity_cfm,
    capacityM3Min ?? existing.capacity_m3min,
    specificPower ?? existing.specific_power,
    req.params.id
  );
  if (listPrice !== undefined) db.prepare('UPDATE st_variants SET list_price = ? WHERE id = ?').run(listPrice, req.params.id);

  if (Array.isArray(req.body.specs)) {
    db.prepare('DELETE FROM st_specs WHERE variant_id = ?').run(req.params.id);
    const insertSpec = db.prepare('INSERT INTO st_specs (variant_id, group_label, key, value, unit, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
    specsFromBody(req.body).forEach((s, i) => insertSpec.run(req.params.id, s.groupLabel, s.key, s.value, s.unit, i));
  }

  res.json(db.prepare('SELECT * FROM st_variants WHERE id = ?').get(req.params.id));
});

router.delete('/admin/variants/:id', authenticateToken, requireAdmin, (req, res) => {
  const existing = db.prepare('SELECT id FROM st_variants WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Variant not found.' });
  db.prepare('DELETE FROM st_variants WHERE id = ?').run(req.params.id); // cascades to specs/source_docs/price_entries
  res.json({ message: 'Variant deleted.' });
});

// ---- Catalog — file upload ingestion (Tier 1) --------------------------------
//
// Category is always chosen explicitly by the admin, not guessed from
// content — filter/dryer/compressor language overlaps too much ("pressure",
// "flow", "temperature" appear in all three) to detect reliably. The parser
// shape *is* auto-tried: every known PDF layout runs against the upload and
// whichever extracts the most variants wins, since these hand-written
// parsers are narrow by nature (see file headers in server/selectionTool/).
// Nothing is written to the DB here — this only returns a preview for the
// admin to review, trim, or edit in the browser before POSTing to /save.

async function extractFromPdf(buffer, password) {
  const pages = await loadPdfPages(buffer, password || undefined);
  const allLines = pages.flatMap((p) => extractLines(p));

  let gridVariants = [];
  pages.forEach((p) => {
    const grid = extractGridRows(p);
    if (grid.length) gridVariants = gridVariants.concat(parseTransposedSheet(grid, {}));
  });

  const singleModel = parseSingleModelLines(allLines);
  const attempts = [
    { shape: 'Model/variant table (compressor datasheet style)', variants: gridVariants },
    { shape: 'Single model, pressure-sweep table (VSD compressor style)', variants: parsePressureSweepLines(allLines, {}) },
    { shape: 'Single model, label:value sheet (dryer datasheet style)', variants: singleModel ? [singleModel] : [] },
    { shape: 'Multi-model catalogue table (dryer catalogue style)', variants: parseDryerCatalogTable(allLines) },
    { shape: 'Parker-style flow-rate table', variants: parseParkerFlowTable(allLines) },
    { shape: 'Cleansweep-style flow table', variants: parseCleansweepTable(allLines) },
  ];

  // Rank by how many variants actually got a filter attribute (pressure or
  // capacity), not raw variant count — a wrong parser can still produce
  // "variants" (e.g. the grid parser splitting a single model name like
  // "krd 220" into two bogus columns, "krd" and "220", because the PDF
  // happened to render it as two separate text runs) but they come out with
  // no real data. Confirmed by a Kaishan dryer upload where the grid parser
  // "won" on count (2 empty rows) over the correct single-model parser's 1
  // fully-populated row.
  const withData = (v) => v.filter?.workingPressureBar != null || v.filter?.capacityCfm != null || v.filter?.capacityM3Min != null;
  attempts.sort((a, b) => {
    const scoreA = a.variants.filter(withData).length;
    const scoreB = b.variants.filter(withData).length;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.variants.length - a.variants.length;
  });
  return attempts[0];
}

function extractFromExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  let variants = [];
  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, raw: true, defval: null });
    variants = variants.concat(parseSheet(rows, {}));
  }
  return { shape: 'Excel workbook (auto-detected per-sheet layout)', variants };
}

router.post('/admin/ingest/preview', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const { password } = req.body;
  const name = req.file.originalname.toLowerCase();

  try {
    let result;
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      result = extractFromExcel(req.file.buffer);
    } else if (name.endsWith('.pdf')) {
      result = await extractFromPdf(req.file.buffer, password);
    } else {
      return res.status(400).json({ error: 'Only .xlsx, .xls, or .pdf files are supported.' });
    }
    res.json({
      fileName: req.file.originalname,
      shapeUsed: result.shape,
      count: result.variants.length,
      variants: result.variants,
      warning: result.variants.length === 0
        ? 'Could not extract any models from this file — its layout doesn\'t match a known format. Use "Add product manually" instead.'
        : null,
    });
  } catch (err) {
    if (/password/i.test(err.message)) {
      return res.status(422).json({ error: 'This PDF is password-protected. Enter the password and try again.' });
    }
    res.status(500).json({ error: `Could not read this file: ${err.message}` });
  }
});

// POST /api/selection-tool/admin/ingest/save — commits a (possibly
// admin-edited) preview result. category/brand come from the upload form,
// not re-detected, since that choice was already made explicitly.
router.post('/admin/ingest/save', authenticateToken, requireAdmin, (req, res) => {
  const { category, brand, fileName, variants } = req.body || {};
  if (!category || !Array.isArray(variants) || variants.length === 0) {
    return res.status(400).json({ error: 'category and a non-empty variants array are required.' });
  }
  const ids = upsertVariants(variants, { category, brand, fileName });
  res.json({ saved: ids.filter(Boolean).length });
});

export default router;
