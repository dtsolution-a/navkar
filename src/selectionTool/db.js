// Selection Tool — offline store (Dexie / IndexedDB).
// Mirrors Section 05 of the architecture spec: catalog, questions, and
// prices are synced in from the server; `activeSession` is local-only and
// is never synced back out anywhere — that's the zero-server-history rule.
import Dexie from 'dexie';
import { coldspellCorrectionFactor, krdCorrectionFactor } from './dryerCorrection';
import { parkerRequiredCapacity, kftRequiredCapacity } from './filterCorrection';

// Renamed (was 'shah-selection-tool') to force every device onto a clean
// IndexedDB store — the old name accumulated inconsistent cached catalog
// data across several re-ingests/re-syncs during rollout (a device's
// offline count drifting to a number that matched none of the server's
// actual catalog sizes at any point), and Dexie has no clean "wipe and
// resync" primitive short of a new database identity.
export const db = new Dexie('shah-selection-tool-v2');

// version 2: drops the old per-model `prices` table (superseded by the
// pricingSet markup-percentages stored in `meta` — see savePricingSet
// below) — Dexie needs an explicit version bump + stores() diff to retire
// a table that existed in a prior version, a plain edit of version(1)
// wouldn't touch it for devices that already have it on disk.
db.version(1).stores({
  variants: 'id, category, family, workingPressureBar, capacityCfm',
  specs: '++id, variantId',
  questions: '++id, category, sortOrder',
  prices: '[variantId+tier], variantId',
  meta: 'key', // { key: 'catalogVersion' | 'pressureToleranceBar', value }
  activeSession: 'key', // singleton: { key: 'current', category, answers, results, savedAt }
});
db.version(2).stores({
  variants: 'id, category, family, workingPressureBar, capacityCfm',
  specs: '++id, variantId',
  questions: '++id, category, sortOrder',
  prices: null, // dropped — see comment above
  meta: 'key', // { key: 'catalogVersion' | 'pressureToleranceBar' | 'pricingSet', value }
  activeSession: 'key',
});
// version 3: adds referenceSeries — admin-managed vendor spec tables/PDFs,
// synced down like everything else so a series still shows on the results
// screen with no connection (Section 05's offline-first rule).
db.version(3).stores({
  variants: 'id, category, family, workingPressureBar, capacityCfm',
  specs: '++id, variantId',
  questions: '++id, category, sortOrder',
  referenceSeries: 'id, category',
  meta: 'key',
  activeSession: 'key',
});

export async function saveCatalog({ category, variants, version }) {
  await db.transaction('rw', db.variants, db.specs, db.meta, async () => {
    // The API always returns the category's full active set today (no true
    // delta cursor yet), so a sync must replace, not append — otherwise a
    // variant whose model_code (and therefore id) changed between ingests
    // leaves its old row behind forever as an orphaned duplicate.
    if (category) {
      const stale = await db.variants.where('category').equals(category).toArray();
      await db.variants.bulkDelete(stale.map((v) => v.id));
      await db.specs.where('variantId').anyOf(stale.map((v) => v.id)).delete();
    }
    for (const v of variants) {
      await db.variants.put({
        id: v.id,
        category: v.category,
        brand: v.brand,
        family: v.family,
        modelCode: v.model_code,
        driveType: v.drive_type,
        workingPressureBar: v.working_pressure_bar,
        workingPressureMinBar: v.working_pressure_min_bar,
        capacityCfm: v.capacity_cfm,
        capacityM3Min: v.capacity_m3min,
        listPrice: v.list_price,
        specificPower: v.specific_power,
        minInletTempC: v.min_inlet_temp_c,
        maxInletTempC: v.max_inlet_temp_c,
        minAmbientTempC: v.min_ambient_temp_c,
        maxAmbientTempC: v.max_ambient_temp_c,
      });
      await db.specs.where('variantId').equals(v.id).delete();
      if (v.specs?.length) {
        await db.specs.bulkAdd(v.specs.map((s) => ({ variantId: v.id, ...s })));
      }
    }
    await db.meta.put({ key: 'catalogVersion', value: version });
  });
}

export async function saveQuestionnaire(category, questions) {
  await db.transaction('rw', db.questions, async () => {
    await db.questions.where('category').equals(category).delete();
    await db.questions.bulkAdd(questions.map((q, i) => ({ category, sortOrder: i, ...q })));
  });
}

export async function saveReferenceSeries(category, series) {
  await db.transaction('rw', db.referenceSeries, async () => {
    await db.referenceSeries.where('category').equals(category).delete();
    if (series?.length) await db.referenceSeries.bulkAdd(series);
  });
}

/**
 * The admin-managed reference series matched to one set of results — a
 * series applies when its brand/family rule fits at least one result
 * (blank brand/family means "matches anything" — see schema.js's comment
 * on st_reference_series). A series can show up for more than one variant
 * (e.g. every Cleansweep+ grade in the results triggers the same
 * Cleansweep+ entry), so this returns the deduplicated set for the whole
 * results list, not per-variant.
 */
export function referenceSeriesForResults(allSeries, results) {
  return allSeries.filter((s) =>
    results.some((v) => (!s.brand || v.brand === s.brand) && (!s.family || v.family === s.family))
  );
}

// pricingSet is null when the logged-in salesman has no set assigned (the
// real, unmarked-up list_price applies then — see priceForVariant below).
export async function savePricingSet(pricingSet) {
  await db.meta.put({ key: 'pricingSet', value: pricingSet });
}

export async function getPricingSet() {
  const row = await db.meta.get('pricingSet');
  return row?.value ?? null;
}

const CATEGORY_TO_MARKUP_FIELD = {
  compressor: 'compressorMarkupPct',
  dryer: 'dryerMarkupPct',
  filter: 'filterMarkupPct',
};

/**
 * Applies the salesman's assigned pricing set's markup % (per category) to
 * a variant's real listPrice. Returns null when there's no listPrice to
 * mark up, or the real listPrice unchanged when no set is assigned.
 */
export function priceForVariant(variant, pricingSet) {
  if (variant.listPrice == null) return null;
  if (!pricingSet) return variant.listPrice;
  const field = CATEGORY_TO_MARKUP_FIELD[variant.category];
  const pct = field ? pricingSet[field] : 0;
  return variant.listPrice * (1 + (pct ?? 0) / 100);
}

export async function getCatalogVersion() {
  const row = await db.meta.get('catalogVersion');
  return row?.value || 0;
}

export async function savePressureTolerance(bar) {
  await db.meta.put({ key: 'pressureToleranceBar', value: bar });
}

export async function getPressureTolerance() {
  const row = await db.meta.get('pressureToleranceBar');
  return row?.value ?? 3;
}

export async function saveCapacityTolerancePct(pct) {
  await db.meta.put({ key: 'capacityTolerancePct', value: pct });
}

export async function getCapacityTolerancePct() {
  const row = await db.meta.get('capacityTolerancePct');
  return row?.value ?? 5;
}

export async function saveFilterCapacityTolerancePct(pct) {
  await db.meta.put({ key: 'filterCapacityTolerancePct', value: pct });
}

export async function getFilterCapacityTolerancePct() {
  const row = await db.meta.get('filterCapacityTolerancePct');
  return row?.value ?? 10;
}

// Per-field min/max a salesman is allowed to type into the questionnaire —
// keeps the same shape the server returns: { compressor: { pressureBar: {min,max,...}, capacityCfm: {...} }, dryer: {...}, filter: {...} }.
export async function saveValidationLimits(limits) {
  await db.meta.put({ key: 'validationLimits', value: limits });
}

export async function getValidationLimits() {
  const row = await db.meta.get('validationLimits');
  return row?.value ?? null;
}

// A client condition outside a model's published envelope is a hard "this
// unit can't run there" — unrelated to the capacity correction below.
function withinEnvelope(v, { inletTempC, ambientTempC }) {
  if (inletTempC != null && v.maxInletTempC != null && inletTempC > v.maxInletTempC) return false;
  if (ambientTempC != null && v.minAmbientTempC != null && ambientTempC < v.minAmbientTempC) return false;
  if (ambientTempC != null && v.maxAmbientTempC != null && ambientTempC > v.maxAmbientTempC) return false;
  return true;
}

const isColdspell = (v) => v.brand === 'Trident' && /coldspell/i.test(v.family || '');
const isKrd = (v) => v.brand === 'Kaishan' && v.family === 'KRD';
const isParkerFilter = (v) => v.brand === 'Parker';
const isKftFilter = (v) => v.brand === 'Kaishan' && v.family === 'KFT';

// A model's capacity must sit within ±capacityTolerancePct of the figure
// the client asked for (or, for a corrected category, of the corrected
// requirement) — not just "at least as much" (an uncapped ">=" let a much
// bigger, pricier machine match just as readily as a close fit). Mirrors
// server/routes/selectionTool.js#capacityWithinTolerance exactly.
function capacityWithinTolerance(modelCapacity, requiredCapacity, capacityTolerancePct) {
  if (modelCapacity == null || requiredCapacity == null) return false;
  const band = requiredCapacity * (capacityTolerancePct / 100);
  return modelCapacity >= requiredCapacity - band && modelCapacity <= requiredCapacity + band;
}

// Dryers: brands with a digitized correction table (Coldspell, KRD) get the
// client's stated pressure fed into that formula instead of a hard floor —
// a single published "working pressure" is a *reference* point the factor
// adjusts away from, not a cutoff (filtering on it as a hard floor for
// every brand alike zeroed every Coldspell result whenever pressure
// differed from 7 bar — caught live, see dryerCorrection.js). Brands with
// no table (Trident Dryspell, for now) fall back to a plain pressure-range
// + capacity-band check, same shape as compressor/filter's default path.
function dryerVariantOk(v, { workingPressureBar, capacityCfm, inletTempC, ambientTempC, targetPdpC, toleranceBar = 0, capacityTolerancePct }) {
  if (isColdspell(v)) {
    const factor = coldspellCorrectionFactor({ inletTempC, ambientTempC, workingPressureBar });
    return capacityWithinTolerance(v.capacityCfm, capacityCfm / factor, capacityTolerancePct);
  }
  if (isKrd(v)) {
    const factor = krdCorrectionFactor({ inletTempC, ambientTempC, workingPressureBar, targetPdpC });
    return capacityWithinTolerance(v.capacityCfm, capacityCfm / factor, capacityTolerancePct);
  }
  if (Math.abs(v.workingPressureBar - workingPressureBar) > toleranceBar) return false;
  return capacityWithinTolerance(v.capacityCfm, capacityCfm, capacityTolerancePct);
}

// Filters: Parker's own datasheet formula is "Minimum Filtration Capacity =
// Flow x CFMIP" (multiply). Trident Cleansweep+ publishes no correction
// table of its own — uses Parker's CFMIP table too rather than a plain
// pressure-range check, confirmed with the client (same filter category,
// Trident doesn't publish an alternative). KFT keeps its own (divide-
// convention) table for when that brand has catalog data — currently has
// none, so this branch is dead code in practice. Mirrors
// server/routes/selectionTool.js#filterVariantOk exactly.
function filterVariantOk(v, { workingPressureBar, capacityCfm, capacityTolerancePct }) {
  if (isKftFilter(v)) return capacityWithinTolerance(v.capacityCfm, kftRequiredCapacity(capacityCfm, workingPressureBar), capacityTolerancePct);
  return capacityWithinTolerance(v.capacityCfm, parkerRequiredCapacity(capacityCfm, workingPressureBar), capacityTolerancePct);
}

// Compressor: the client names an exact pressure and flow point, not a
// floor/ceiling — a model qualifies only if its own rated pressure sits
// within ±toleranceBar of that point (not "inside a widened [min,max]
// band", which let models rated far outside the requested range through)
// and its capacity sits within ±capacityTolerancePct of the requested flow.
function compressorVariantOk(v, { workingPressureBar, capacityCfm }, toleranceBar, capacityTolerancePct) {
  const pressureDiff = Math.abs(v.workingPressureBar - workingPressureBar);
  if (pressureDiff > toleranceBar) return { ok: false, approx: false };
  if (!capacityWithinTolerance(v.capacityCfm, capacityCfm, capacityTolerancePct)) return { ok: false, approx: false };
  return { ok: true, approx: pressureDiff > 0 };
}

export async function matchLocally(category, answers) {
  const variants = (await db.variants.where('category').equals(category).toArray()).filter((v) => v.workingPressureBar != null && v.capacityCfm != null);
  // Compressor questions use workingPressureBar/capacityCfm; dryer/filter
  // questions use minWorkingPressureBar/maxInletFlowCfm — same two physical
  // quantities (pressure, flow), different param_key per Questionnaire.xlsx.
  const pressureInput = answers.workingPressureBar ?? answers.minWorkingPressureBar;
  const flowInput = answers.capacityCfm ?? answers.maxInletFlowCfm;
  const toleranceBar = await getPressureTolerance();
  // Filter has its own capacity tolerance, separate from the shared one
  // compressor/dryer use — mirrors server/routes/selectionTool.js's /match.
  const capacityTolerancePct = category === 'filter'
    ? await getFilterCapacityTolerancePct()
    : await getCapacityTolerancePct();

  let matches;
  if (category === 'compressor') {
    matches = variants
      .map((v) => ({ v, r: compressorVariantOk(v, { workingPressureBar: pressureInput, capacityCfm: flowInput }, toleranceBar, capacityTolerancePct) }))
      .filter((x) => x.r.ok)
      .map((x) => ({ ...x.v, approxMatch: x.r.approx }));
  } else if (category === 'dryer') {
    const envelopeOk = variants.filter((v) => withinEnvelope(v, { inletTempC: answers.inletTempC, ambientTempC: answers.ambientTempC }));
    matches = envelopeOk
      .filter((v) => dryerVariantOk(v, { workingPressureBar: pressureInput, capacityCfm: flowInput, inletTempC: answers.inletTempC, ambientTempC: answers.ambientTempC, targetPdpC: answers.targetPdpC, capacityTolerancePct }))
      .map((v) => ({ ...v, approxMatch: false }));
    if (matches.length === 0 && toleranceBar > 0) {
      matches = envelopeOk
        .filter((v) => dryerVariantOk(v, { workingPressureBar: pressureInput, capacityCfm: flowInput, inletTempC: answers.inletTempC, ambientTempC: answers.ambientTempC, targetPdpC: answers.targetPdpC, toleranceBar, capacityTolerancePct }))
        .map((v) => ({ ...v, approxMatch: true }));
    }
  } else {
    // Every filter brand now runs a pressure-correction formula, so there's
    // no separate pressure-range check left to widen — mirrors the server's
    // /match route exactly (see its comment on this same simplification).
    matches = variants.filter((v) => filterVariantOk(v, { workingPressureBar: pressureInput, capacityCfm: flowInput, capacityTolerancePct })).map((v) => ({ ...v, approxMatch: false }));
  }

  const withSpecs = await Promise.all(
    matches.map(async (v) => ({ ...v, specs: await db.specs.where('variantId').equals(v.id).toArray() }))
  );
  return withSpecs;
}

/**
 * Opt-in "comprehensive view" — for every bar from the client's requested
 * pressure up to +toleranceBar (never below), returns the single lowest-
 * and single highest-capacity model available at that bar (by each
 * candidate's own raw catalog capacity — the ±% tolerance band this view
 * exists to bypass never enters the comparison). Compressor picks its pool
 * by an exact working-pressure match (a real per-model spec); dryer/filter
 * pick their pool by whichever candidates are valid at all for this bar
 * (envelope check for dryer, nothing extra for filter — "bar" there is a
 * correction-formula input, not a catalog spec, so it doesn't narrow the
 * candidate pool the way compressor's does). Mirrors
 * server/routes/selectionTool.js#POST /match/comprehensive exactly.
 */
export async function matchComprehensive(category, answers) {
  const variants = (await db.variants.where('category').equals(category).toArray()).filter((v) => v.workingPressureBar != null && v.capacityCfm != null);
  const pressureInput = answers.workingPressureBar ?? answers.minWorkingPressureBar;
  const flowInput = answers.capacityCfm ?? answers.maxInletFlowCfm;
  const toleranceBar = await getPressureTolerance();

  const withSpecs = async (v) => (v ? { ...v, specs: await db.specs.where('variantId').equals(v.id).toArray() } : null);

  const start = Math.round(pressureInput);
  const barPoints = [];
  for (let b = start; b <= start + toleranceBar; b++) barPoints.push(b);

  // Mirrors server/routes/selectionTool.js#POST /match/comprehensive
  // exactly — "below"/"above" is the model nearest under/over the client's
  // requested capacity (or, for dryer/filter, each candidate's own
  // correction-formula-adjusted required capacity at this bar), not the
  // catalog's overall min/max. See that route's comment for the full
  // reasoning (this was corrected after shipping the wrong interpretation
  // once already — flagged here so it isn't silently reverted).
  const bands = [];
  for (const bar of barPoints) {
    let below = null;
    let above = null;

    if (category === 'compressor') {
      variants.forEach((v) => {
        if (Math.round(v.workingPressureBar) !== bar) return;
        if (v.capacityCfm < flowInput) {
          if (!below || v.capacityCfm > below.capacityCfm) below = v;
        } else if (!above || v.capacityCfm < above.capacityCfm) {
          above = v;
        }
      });
    } else if (category === 'dryer') {
      variants
        .filter((v) => withinEnvelope(v, { inletTempC: answers.inletTempC, ambientTempC: answers.ambientTempC }))
        .forEach((v) => {
          let required = flowInput;
          if (isColdspell(v)) required = flowInput / coldspellCorrectionFactor({ inletTempC: answers.inletTempC, ambientTempC: answers.ambientTempC, workingPressureBar: bar });
          else if (isKrd(v)) required = flowInput / krdCorrectionFactor({ inletTempC: answers.inletTempC, ambientTempC: answers.ambientTempC, workingPressureBar: bar, targetPdpC: answers.targetPdpC });
          if (required == null) return;
          if (v.capacityCfm < required) {
            if (!below || v.capacityCfm > below.capacityCfm) below = v;
          } else if (!above || v.capacityCfm < above.capacityCfm) {
            above = v;
          }
        });
    } else {
      variants.forEach((v) => {
        const required = isKftFilter(v) ? kftRequiredCapacity(flowInput, bar) : parkerRequiredCapacity(flowInput, bar);
        if (required == null) return;
        if (v.capacityCfm < required) {
          if (!below || v.capacityCfm > below.capacityCfm) below = v;
        } else if (!above || v.capacityCfm < above.capacityCfm) {
          above = v;
        }
      });
    }

    bands.push({ bar, lowest: await withSpecs(below), highest: await withSpecs(above) });
  }

  return { criteria: { category, workingPressureBar: pressureInput, capacityCfm: flowInput, toleranceBar }, bands };
}

export async function saveActiveSession(session) {
  await db.activeSession.put({ key: 'current', ...session, savedAt: new Date().toISOString() });
}

export async function getActiveSession() {
  return db.activeSession.get('current');
}

export async function clearActiveSession() {
  await db.activeSession.delete('current');
}
