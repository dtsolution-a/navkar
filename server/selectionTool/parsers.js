// Selection Tool — Excel parsers.
//
// The source workbooks come in exactly two shapes (confirmed by inspecting
// every Air Compressor .xls file): a "transposed" shape (one row per spec
// attribute, one column per model — KRSA / KRSA2 / KRSD / KRSP's VSD & Fixed
// Speed sheets) and an already-normalized "columnar summary" shape (one row
// per pressure variant — KRSP's *Summary sheets). Both parsers flatten into
// the same { modelCode, driveType, filter, specs[] } shape consumed by ingest.js.

function isBlankRow(row) {
  return !row || row.every((c) => c === null || c === undefined || c === '');
}

function isSectionHeaderRow(row) {
  if (!row || row[0] === null || row[0] === undefined || row[0] === '') return false;
  return row.slice(1).every((c) => c === null || c === undefined || c === '');
}

function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(/[^\d.\-]/g, ''));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100; // clip Excel float-formula artifacts (204.82699999999997 -> 204.83)
}

// Same rounding, but for building a spec row's *display* value — must pass
// non-numeric cells (motor codes, "Y-△", "IP54"...) through untouched,
// only numbers get cleaned. Confirmed necessary: Datasheet (AI).xlsx's
// formula-computed capacity/specific-power cells were printing 17-digit
// floats straight into both the results screen and the exported PDF.
export function cleanValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return Number.isFinite(val) ? String(Math.round(val * 100) / 100) : String(val);
  return String(val);
}

// Label-only test (no value needed) — "Effective/Full Load/Minimum effective
// Working Pressure - bar" across every source layout, but not "Pressure
// Drop" (different spec) or any label that also mentions power/kW: one
// source row is a genuinely malformed header, "Total input Power at Max 5
// bar Pressure Full Load Pressure – kW" (confirmed in 2024 - KRSA2-5.0.xls),
// which otherwise matches "pressure"+"bar" and silently overwrites the real
// value with a kW figure — caught by spotting "149.7 bar" in the admin
// catalog table.
function isRatedPressureLabel(label) {
  const l = label.toLowerCase();
  return /pressure/.test(l) && l.includes('bar') && !l.includes('drop') && !l.includes('power') && !l.includes('kw') && !/min/.test(l);
}

export function classifyFilterAttr(label, valueRaw) {
  const l = label.toLowerCase();
  const v = num(valueRaw);
  if (v === null) return null;
  // "List Price (INR)" / "List Price" rows (confirmed in Datasheet (AI).xlsx)
  // — check before the pressure rule below since neither mentions "bar".
  if (l.includes('price')) return { key: 'listPrice', value: v };
  if (isRatedPressureLabel(label)) return { key: 'workingPressureBar', value: v };
  // "Min. Working Pressure" is a distinct field from the rated/effective
  // pressure — routing both to the same key let the min row (which appears
  // second in Datasheet (AI).xlsx) silently overwrite the real rated value.
  if (/pressure/.test(l) && l.includes('bar') && /min/.test(l) && !l.includes('drop')) {
    return { key: 'workingPressureMinBar', value: v };
  }
  // "Capacity ... cfm" (compressors) and "Flow cfm" / "Inlet Capacity scfm"
  // (dryers/filters, confirmed in Dryer ver 2.xlsx) are the same underlying
  // field under two different vendor conventions — silently dropped for
  // every Kaishan-Dryer variant until this matched "flow" too.
  if ((l.includes('capacity') || l.includes('flow')) && /acfm|cfm/.test(l)) return { key: 'capacityCfm', value: v };
  if ((l.includes('capacity') || l.includes('flow')) && /m3\/min/.test(l)) return { key: 'capacityM3Min', value: v };
  if (l.includes('specific power')) return { key: 'specificPower', value: v };
  return null;
}

export function splitUnit(label) {
  // "Effective Working Pressure - bar " -> { text: 'Effective Working Pressure', unit: 'bar' }
  const m = label.match(/^(.*?)[\s\-–—]*[\(\-–—]\s*([A-Za-z0-9°/.%]+)\s*\)?\s*$/);
  if (m && m[2] && m[2].length <= 12) return { text: m[1].trim(), unit: m[2].trim() };
  return { text: label.trim(), unit: null };
}

// The source files' own pressure-column names are swapped from what they
// actually mean — confirmed with the client: the standalone row labelled
// "Effective Working Pressure" is really the minimum working pressure, and
// the standalone row labelled "Full Load Pressure" is really the effective
// working pressure (the one matching runs off, see pressureLabelPriority).
// Fixes the *display* text only, and ONLY these two exact standalone
// labels — deliberately does NOT touch derived labels that happen to
// contain the same phrase ("Capacity at Effective Working Pressure",
// "Total input Power at Effective Working Pressure", ...): those describe
// real capacity/power data tied to whichever pressure point the source
// sheet actually measured them at, and renaming just the word inside them
// would make the label lie about which row's number it's paired with —
// confirmed with the client to leave those alone, exact-match only.
function relabelPressureText(text) {
  const trimmed = text.trim();
  if (/^effective working pressure$/i.test(trimmed)) return 'Minimum Working Pressure';
  if (/^full load pressure$/i.test(trimmed)) return 'Effective Working Pressure';
  return text;
}

// "Full Load Pressure" beats every other pressure label when a sheet has
// more than one — confirmed with the client that the column the source
// files label "Full Load Pressure" is the one matching should run off (what
// the sheet calls "Effective Working Pressure" is actually the *minimum*
// working pressure, a different, non-matching figure — the two source
// column names don't mean what they look like they mean). Used for both the
// matching value (working_pressure_bar) and for naming grouped sweep
// columns (see parseTransposedSheet) — Compressor Ver2.xlsx's PMV
// pressure-sweep block only varies per column on "Full Load Pressure"
// (6/7/8/9/10), so using anything else there would collapse all five real
// products onto a single model_code.
function pressureLabelPriority(label) {
  return /full load pressure/.test(label.toLowerCase()) ? 2 : 1;
}

/**
 * Transposed sheet: row containing "Model" in col 0 holds model codes across
 * the remaining columns; subsequent single-cell rows are section headers;
 * everything else is an attribute row (col0 = label, colN = value for model N).
 *
 * A blank model-name cell means "same model as the nearest non-blank cell to
 * its left" — confirmed in Compressor Ver2.xlsx: PMV/PMV2 pressure-sweep
 * blocks name only their first column (e.g. "PMV-15s" then 4 blanks for
 * 7/8/9/10 bar). Columns are grouped on that basis; a group of size 1 keeps
 * its name as-is, a group of size >1 gets that column's pressure appended
 * so the sweep points don't collide on model_code.
 */
export function parseTransposedSheet(rows, { driveTypeHint } = {}) {
  const modelRowIdx = rows.findIndex((r) => r && String(r[0] ?? '').trim().toLowerCase() === 'model');
  if (modelRowIdx === -1) return [];
  const modelRow = rows[modelRowIdx];

  // Pre-scan for the canonical pressure row (used only to suffix grouped
  // sweep columns below) before the main attribute pass.
  let pressureRow = null;
  let pressureRowPriority = -1;
  for (let r = modelRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (isBlankRow(row) || isSectionHeaderRow(row)) continue;
    const label = String(row[0] ?? '');
    if (!isRatedPressureLabel(label)) continue;
    const priority = pressureLabelPriority(label);
    if (priority >= pressureRowPriority) { pressureRow = row; pressureRowPriority = priority; }
  }

  const groups = [];
  for (let i = 1; i < modelRow.length; i++) {
    const raw = modelRow[i];
    if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
      groups.push({ baseCode: String(raw).trim(), cols: [i] });
    } else if (groups.length) {
      groups[groups.length - 1].cols.push(i);
    }
  }

  const variants = [];
  groups.forEach((g) => {
    // KRSA2 "Fixed Speed" sheet packs two aliased model codes per cell,
    // newline-separated — keep the primary code, record the alias as a spec.
    const codes = g.baseCode.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const primary = codes[0];
    const alias = codes.length > 1 ? codes.slice(1).join(', ') : null;
    const driveType = driveTypeHint || (/vsd/i.test(primary) ? 'vsd' : 'fixed');

    g.cols.forEach((colIdx) => {
      let modelCode = primary;
      if (g.cols.length > 1) {
        const p = pressureRow ? num(pressureRow[colIdx]) : null;
        if (p !== null) modelCode = `${primary}-${p}`;
      }
      variants.push({
        colIdx,
        modelCode,
        driveType,
        filter: {},
        _filterPriority: {},
        specs: alias ? [{ groupLabel: 'General', key: 'Alias model code', value: alias }] : [],
      });
    });
  });

  let group = 'General';
  for (let r = modelRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (isBlankRow(row)) continue;
    if (isSectionHeaderRow(row)) { group = String(row[0]).trim(); continue; }
    const rawLabel = row[0];
    if (rawLabel === null || rawLabel === undefined || String(rawLabel).trim() === '') continue;
    const { text: rawText, unit } = splitUnit(String(rawLabel));
    const text = relabelPressureText(rawText);

    variants.forEach((v) => {
      if (!v) return;
      const val = row[v.colIdx];
      if (val === null || val === undefined || val === '') return;
      v.specs.push({ groupLabel: group, key: text, value: cleanValue(val), unit });
      const filterHit = classifyFilterAttr(String(rawLabel), val);
      if (!filterHit) return;
      const priority = filterHit.key === 'workingPressureBar' ? pressureLabelPriority(String(rawLabel)) : 1;
      if (priority >= (v._filterPriority[filterHit.key] ?? -1)) {
        v.filter[filterHit.key] = filterHit.value;
        v._filterPriority[filterHit.key] = priority;
      }
    });
  }

  variants.forEach((v) => delete v._filterPriority);
  return variants;
}

/**
 * Columnar summary sheet: header row (Model No | Discharge Pressure | Flow |
 * Motor power | Discharge Connection | Dimension | Weight), a units row, then
 * repeating groups — only the first row of a group carries Model No / motor
 * power / connection / dims / weight, the rest are extra pressure points for
 * the same physical model.
 */
export function parseColumnarSummary(rows, { driveTypeHint } = {}) {
  if (rows.length < 3) return [];
  const groups = [];
  let current = null;

  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (isBlankRow(row)) continue;
    if (row[0] !== null && row[0] !== undefined && String(row[0]).trim() !== '') {
      current = {
        baseModel: String(row[0]).trim().replace(/\s+/g, ' '),
        motorPowerKw: num(row[3]),
        connection: row[4] ?? null,
        dims: row[5] ?? null,
        weightKg: num(row[6]),
        points: [],
      };
      groups.push(current);
    }
    if (current && row[1] !== null && row[1] !== undefined) {
      current.points.push({ pressureBar: num(row[1]), flowCfm: num(row[2]) });
    }
  }

  const flat = [];
  groups.forEach((g) => {
    g.points.forEach((p) => {
      if (p.pressureBar === null) return;
      // "Fixed Speed Summary" and "VFD Summary" sheets use identical base
      // model text (e.g. "KRSP-18") with no VSD marker in the code itself —
      // without a suffix here they'd collide on model_code and silently
      // overwrite each other on ingest (confirmed: they did, in testing).
      const driveType = driveTypeHint || 'fixed';
      const suffix = driveType === 'vsd' && !/vsd/i.test(g.baseModel) ? ' VSD' : '';
      flat.push({
        modelCode: `${g.baseModel}-${p.pressureBar}${suffix}`,
        driveType,
        filter: { workingPressureBar: p.pressureBar, capacityCfm: p.flowCfm ?? undefined },
        specs: [
          { groupLabel: 'Performance', key: 'Discharge Pressure', value: String(p.pressureBar), unit: 'bar' },
          p.flowCfm !== null && { groupLabel: 'Performance', key: 'Flow', value: String(p.flowCfm), unit: 'cfm' },
          g.motorPowerKw !== null && { groupLabel: 'Motor', key: 'Motor power', value: String(g.motorPowerKw), unit: 'kW' },
          g.connection && { groupLabel: 'Dimensions', key: 'Discharge Connection', value: String(g.connection) },
          g.dims && { groupLabel: 'Dimensions', key: 'Dimension L x B x H', value: String(g.dims), unit: 'mm' },
          g.weightKg !== null && { groupLabel: 'Dimensions', key: 'Weight', value: String(g.weightKg), unit: 'Kg' },
        ].filter(Boolean),
      });
    });
  });
  return flat;
}

/**
 * Parker "Filters ver 2.xlsx" shape: header row reading "Model | Pipe Size |
 * cfm | mm | ins | mm | ins | mm | ins | kg | lb", with a merged "List
 * Price" header two rows above the last column (confirmed via the sheet's
 * !merges). One row = one sellable model, capacity already in cfm (no unit
 * conversion needed, unlike the PDF-sourced Parker table). No pressure
 * column exists in this file — Parker's own literature states every flow
 * figure is "for operation at 7 bar (g)", so 7 bar is used as the rated
 * reference pressure here, matching the PDF-derived Parker rows already in
 * the catalog.
 */
export function parseParkerModelRowSheet(rows) {
  const headerIdx = rows.findIndex((r) => r && String(r[0] ?? '').trim().toLowerCase() === 'model' && /pipe size/i.test(String(r[1] ?? '')));
  if (headerIdx === -1) return [];
  const priceColIdx = rows[headerIdx - 2]?.findIndex((c) => /list price/i.test(String(c ?? '')));

  const variants = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (isBlankRow(row)) continue;
    const modelCode = row[0] != null ? String(row[0]).trim() : null;
    if (!modelCode) continue;
    const capacityCfm = num(row[2]);
    const listPrice = priceColIdx > 0 ? num(row[priceColIdx]) : null;
    variants.push({
      modelCode,
      driveType: null,
      filter: { capacityCfm: capacityCfm ?? undefined, workingPressureBar: 7, listPrice: listPrice ?? undefined },
      specs: [
        row[1] != null && { groupLabel: 'General', key: 'Pipe Size', value: cleanValue(row[1]) },
        capacityCfm !== null && { groupLabel: 'Performance', key: 'Flow', value: String(capacityCfm), unit: 'cfm' },
        row[3] != null && { groupLabel: 'Dimensions', key: 'Height', value: cleanValue(row[3]), unit: 'mm' },
        row[5] != null && { groupLabel: 'Dimensions', key: 'Width', value: cleanValue(row[5]), unit: 'mm' },
        row[7] != null && { groupLabel: 'Dimensions', key: 'Depth', value: cleanValue(row[7]), unit: 'mm' },
        row[9] != null && { groupLabel: 'Dimensions', key: 'Weight', value: cleanValue(row[9]), unit: 'kg' },
      ].filter(Boolean),
    });
  }
  return variants;
}

/**
 * Trident "Filters ver 2.xlsx" (Cleansweep+) shape: header "Model | Flow
 * (m3/hr) | Flow (Cfm) | New CFM | Element | List Price", one base-model
 * row (flow given once) followed by up to 4 blank-model rows — one per
 * element grade (P/X/Y/A) — each with its own price. Each (model, grade)
 * pair is a genuinely distinct sellable part (different filtration micron
 * rating, different price), so the grade is folded into the model code,
 * same treatment as Parker's AOPX/AAPX-COAL/DP split earlier. Capacity uses
 * "Flow (Cfm)" (the plain unit-converted figure) — confirmed this is the
 * one to use, NOT "New CFM" despite that column sitting one to the right
 * (it was read for a while, wrongly — caught live). No pressure rating is
 * given anywhere in Trident's Cleansweep+ literature (confirmed — no
 * correction table like Coldspell/Parker publish), so 7 bar is used here
 * only as an assumed industry-typical reference, not a documented Trident
 * figure — flagged, not asserted as fact.
 */
export function parseTridentFilterGradeSheet(rows) {
  const header = (rows[0] || []).map((c) => String(c ?? '').trim().toLowerCase());
  if (header[0] !== 'model') return [];
  const variants = [];
  let baseModel = null;
  let flowCfm = null;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (isBlankRow(row)) continue;
    if (row[0] != null && String(row[0]).trim() !== '') {
      baseModel = String(row[0]).trim();
      flowCfm = num(row[2]);
    }
    const element = row[4] != null ? String(row[4]).trim() : null;
    if (!baseModel || !element) continue;
    const listPrice = num(row[5]);
    const newCfm = num(row[3]);
    variants.push({
      modelCode: `${baseModel}-${element}`,
      driveType: null,
      filter: { capacityCfm: flowCfm ?? undefined, workingPressureBar: 7, listPrice: listPrice ?? undefined },
      specs: [
        { groupLabel: 'General', key: 'Element grade', value: element },
        row[1] != null && { groupLabel: 'Performance', key: 'Flow', value: cleanValue(row[1]), unit: 'm3/hr' },
        flowCfm !== null && { groupLabel: 'Performance', key: 'Flow', value: String(flowCfm), unit: 'cfm' },
        newCfm !== null && { groupLabel: 'Performance', key: 'New CFM', value: String(newCfm) },
      ].filter(Boolean),
    });
  }
  return variants;
}

/** Picks the right parser for a sheet by inspecting its first two rows. */
export function parseSheet(rows, opts = {}) {
  const header = (rows[0] || []).map((c) => String(c ?? '').trim().toLowerCase());
  if (header[0] === 'model no') return parseColumnarSummary(rows, opts);

  // Several product families stacked vertically in one sheet, each with its
  // own "Model" row (confirmed in Datasheet (AI).xlsx: KRSD/KRSP/KRSP2 blocks
  // back to back) — parseTransposedSheet only ever finds the first "Model"
  // row and would read every later block's numbers against the first
  // block's model columns. Split into independent blocks and parse each.
  const modelRowIndices = rows
    .map((r, i) => (r && String(r[0] ?? '').trim().toLowerCase() === 'model' ? i : -1))
    .filter((i) => i >= 0);
  if (modelRowIndices.length > 1) {
    let all = [];
    modelRowIndices.forEach((start, idx) => {
      const end = idx + 1 < modelRowIndices.length ? modelRowIndices[idx + 1] : rows.length;
      all = all.concat(parseTransposedSheet(rows.slice(start, end), opts));
    });
    return all;
  }

  return parseTransposedSheet(rows, opts);
}
