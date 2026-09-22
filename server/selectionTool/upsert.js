// Selection Tool — shared DB-write logic for ingested variants.
// Used by both the bulk CLI ingest (server/selectionTool/ingest.js) and the
// admin file-upload endpoint (server/routes/selectionTool.js) so the two
// paths can never drift into different upsert behaviour.
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import ensureSelectionToolSchema from './schema.js';

// Guarantee the schema (including any newly-added columns) exists before the
// module-level db.prepare() calls below run — those execute at import time,
// which can happen before a caller gets a chance to call this itself
// (confirmed: this exact ordering bug hit twice now, first in ingest.js).
ensureSelectionToolSchema();

export const FAMILY_PREFIXES = ['KRSA2', 'KRSP2', 'KRSA', 'KRSB', 'KRSD', 'KRSP', 'PMV2', 'PMV', 'KRD'];

// Treats space and hyphen as the same separator, applied to every model
// code at write time — this exact class of bug ("KRSP-90-8" vs "KRSP 90-8"
// vs "KRSP- 90-8") has hit multiple source files now, always the same
// physical model with the separator character typed inconsistently.
// Collapsing it here fixes it at the root instead of per-file. Deliberately
// does NOT strip separators entirely (that would risk merging genuinely
// different codes) and does NOT touch "+" (e.g. "Coldspell+20" vs
// "Coldspell 20") — that may be a real product-line distinction (Trident's
// current marketing name is literally "Coldspell+"), so a code with that
// ambiguity still gets flagged for a human decision, not silently merged.
export function normalizeModelCode(code) {
  return String(code)
    .trim()
    .replace(/\s*-\s*/g, '-') // "KRSP - 90" / "KRSP- 90" -> "KRSP-90"
    .replace(/\s+/g, '-') // "KRSP 90" (bare space) -> "KRSP-90"
    .replace(/-?\+-?/g, '+'); // the hyphen-insertion above can land right next to a real "+" (e.g. source "COLDSPELL + 20" -> "COLDSPELL-+-20") — collapse back to a bare "+" so it correctly merges with "COLDSPELL+20" from another source file describing the same model.
}

export function familyFromModelCode(code) {
  if (/^A[OA]PX/i.test(code)) return code.slice(0, 2).toUpperCase(); // AO / AA
  // Bare "T40" (PDF-derived) and grade-suffixed "T40-P" (Filters ver 2.xlsx,
  // one row per element grade P/X/Y/A — see parseTridentFilterGradeSheet)
  // are the same Cleansweep+ product line.
  if (/^T\d+(-[A-Z])?$/i.test(code)) return 'Cleansweep+';
  // Trident's dryer marketing name is literally "Coldspell+" (current line)
  // vs "Coldspell" (older/alt line, no "+") — both are still the Coldspell
  // family for correction-factor purposes (isColdspell matches on
  // /coldspell/i), but folding the "+20"/"20" size suffix out here keeps
  // every Coldspell variant under one product family for the admin catalog
  // view, instead of one throwaway family per model.
  if (/^COLDSPELL\+?/i.test(code)) return code.startsWith('COLDSPELL+') || code.includes('+') ? 'Coldspell+' : 'Coldspell';
  const candidate = code.trim().split(/[\s-]/)[0].toUpperCase();
  if (FAMILY_PREFIXES.includes(candidate)) return candidate;
  return FAMILY_PREFIXES.find((p) => candidate.startsWith(p)) || candidate;
}

const upsertProductStmt = db.prepare(`
  INSERT INTO st_products (id, category, brand, family)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(id) DO NOTHING
`);

const upsertVariantStmt = db.prepare(`
  INSERT INTO st_variants
    (id, product_id, model_code, drive_type, working_pressure_bar, working_pressure_min_bar, capacity_cfm, capacity_m3min, specific_power,
     min_inlet_temp_c, max_inlet_temp_c, min_ambient_temp_c, max_ambient_temp_c, list_price)
  VALUES (@id, @productId, @modelCode, @driveType, @workingPressureBar, @workingPressureMinBar, @capacityCfm, @capacityM3Min, @specificPower,
     @minInletTempC, @maxInletTempC, @minAmbientTempC, @maxAmbientTempC, @listPrice)
  ON CONFLICT(model_code) DO UPDATE SET
    drive_type = excluded.drive_type,
    -- Pressure/capacity/envelope columns COALESCE onto the existing value
    -- instead of overwriting unconditionally: several genuine source files
    -- describe a model's dimensions/price/specs without repeating its
    -- pressure rating at all (e.g. Dryer ver 2.xlsx has no pressure column —
    -- see ingestVer2.js), and a plain overwrite blanked every existing
    -- Coldspell/KRD row's working_pressure_bar to NULL on that re-ingest —
    -- caught live. A source that DOES carry a real value for a column still
    -- updates it normally, since excluded.<col> is only NULL when that
    -- source genuinely had nothing to say about it.
    working_pressure_bar = COALESCE(excluded.working_pressure_bar, working_pressure_bar),
    working_pressure_min_bar = COALESCE(excluded.working_pressure_min_bar, working_pressure_min_bar),
    capacity_cfm = COALESCE(excluded.capacity_cfm, capacity_cfm),
    capacity_m3min = COALESCE(excluded.capacity_m3min, capacity_m3min),
    specific_power = COALESCE(excluded.specific_power, specific_power),
    min_inlet_temp_c = COALESCE(excluded.min_inlet_temp_c, min_inlet_temp_c),
    max_inlet_temp_c = COALESCE(excluded.max_inlet_temp_c, max_inlet_temp_c),
    min_ambient_temp_c = COALESCE(excluded.min_ambient_temp_c, min_ambient_temp_c),
    max_ambient_temp_c = COALESCE(excluded.max_ambient_temp_c, max_ambient_temp_c),
    -- Price data is sparse (only a couple of source files carry it) — keep
    -- whatever price is already on file (ingested or admin-typed) rather
    -- than blanking it out every time a price-less source re-ingests.
    list_price = COALESCE(excluded.list_price, list_price),
    spec_version = spec_version + 1,
    updated_at = CURRENT_TIMESTAMP
`);

const getVariantIdStmt = db.prepare(`SELECT id FROM st_variants WHERE model_code = ?`);
const clearSpecsStmt = db.prepare(`DELETE FROM st_specs WHERE variant_id = ?`);
const clearSourceDocsStmt = db.prepare(`DELETE FROM st_source_docs WHERE variant_id = ?`);
const insertSpecStmt = db.prepare(`
  INSERT INTO st_specs (variant_id, group_label, key, value, unit, sort_order)
  VALUES (?, ?, ?, ?, ?, ?)
`);
const insertSourceDocStmt = db.prepare(`
  INSERT INTO st_source_docs (variant_id, file_name, sheet_name) VALUES (?, ?, ?)
`);

/**
 * Upserts one parsed variant ({ modelCode, driveType, filter, specs }) into
 * the DB. Product row is created/reused from category+family. Specs and
 * source-doc rows are fully replaced on every call — idempotent rebuild.
 */
export function upsertVariant(v, { category, brand, fileName, sheetName }) {
  if (!v.modelCode) return null;
  const modelCode = normalizeModelCode(v.modelCode);
  const family = v.family || familyFromModelCode(modelCode);
  const productId = `${category}-${family}`.toLowerCase();
  upsertProductStmt.run(productId, category, brand || null, family);

  const newId = uuidv4();
  upsertVariantStmt.run({
    id: newId,
    productId,
    modelCode,
    driveType: v.driveType || null,
    workingPressureBar: v.filter?.workingPressureBar ?? null,
    workingPressureMinBar: v.filter?.workingPressureMinBar ?? null,
    capacityCfm: v.filter?.capacityCfm ?? null,
    capacityM3Min: v.filter?.capacityM3Min ?? null,
    specificPower: v.filter?.specificPower ?? null,
    minInletTempC: v.filter?.minInletTempC ?? null,
    maxInletTempC: v.filter?.maxInletTempC ?? null,
    minAmbientTempC: v.filter?.minAmbientTempC ?? null,
    maxAmbientTempC: v.filter?.maxAmbientTempC ?? null,
    listPrice: v.filter?.listPrice ?? null,
  });

  const id = getVariantIdStmt.get(modelCode).id;
  clearSpecsStmt.run(id);
  clearSourceDocsStmt.run(id);
  (v.specs || []).forEach((s, i) => insertSpecStmt.run(id, s.groupLabel || 'General', s.key, s.value, s.unit || null, i));
  if (fileName) insertSourceDocStmt.run(id, fileName, sheetName || null);
  return id;
}

export function upsertVariants(variants, ctx) {
  return variants.map((v) => upsertVariant(v, ctx));
}
