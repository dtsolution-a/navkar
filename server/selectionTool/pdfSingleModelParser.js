// Selection Tool — line-based parser for single-model label:value datasheets
// with no pressure/variant sweep (Kaishan KRD dryer sheets confirmed; this
// shape is "one model per PDF, one row per spec line, several unit systems
// crammed onto some rows"). Every line becomes a spec row verbatim; the two
// filter params are pulled out with small, targeted rules rather than the
// generic column classifier, because the numbers here don't sit at a
// predictable position in the line (units and parenthetical ranges get in
// the way — e.g. "Working pressure air side bar / psi 7.00 101.53 (Max
// 16/232)").
const FIRST_NUMBER_RE = /-?\d[\d,]*\.?\d*/;

function firstNumber(line) {
  const m = line.match(FIRST_NUMBER_RE);
  return m ? Number(m[0].replace(/,/g, '')) : null;
}

// label/value split for the spec dump: label = text up to the first digit
// or unit token, value = the rest, trimmed.
function splitLabelValue(line) {
  const m = line.match(/^([^\d]+?)\s{0,2}((?:[\d].*)|(?:[A-Za-z][\d/].*))$/);
  if (m) return { label: m[1].trim(), value: m[2].trim() };
  return { label: line.trim(), value: '' };
}

const FILTER_RULES = [
  { re: /^cfm\b/i, key: 'capacityCfm' },
  { re: /^m\s*³?\s*\/\s*min\b|^m3\/min\b/i, key: 'capacityM3Min' },
  { re: /working pressure/i, key: 'workingPressureBar' },
];

// Kaishan KRD sheets publish an operating envelope as a parenthetical on the
// inlet/ambient temperature rows, e.g. "Air inlet temperature °C / °F 35.00
// 95.00 (Max 70/158)" and "Ambient temperature °C / °F 25.00 77.00 (MIN
// 5/41 Max 50/122)" — first number in each clause is the °C value (second
// is the °F conversion). No correction-factor formula is published for this
// brand (unlike Trident), so this is a hard pass/fail range, not something
// to interpolate.
const ENVELOPE_RULES = [
  { re: /^air inlet temperature/i, minKey: null, maxKey: 'maxInletTempC' },
  { re: /^ambient temperature/i, minKey: 'minAmbientTempC', maxKey: 'maxAmbientTempC' },
];

function extractEnvelope(line, variant) {
  const rule = ENVELOPE_RULES.find((r) => r.re.test(line));
  if (!rule) return;
  const minMatch = line.match(/MIN\s+(-?[\d.]+)\s*\//i);
  const maxMatch = line.match(/Max\s+(-?[\d.]+)\s*\//i);
  if (rule.minKey && minMatch) variant.filter[rule.minKey] = Number(minMatch[1]);
  if (rule.maxKey && maxMatch) variant.filter[rule.maxKey] = Number(maxMatch[1]);
}

export function parseSingleModelLines(lines, { modelPrefix = 'Model' } = {}) {
  const modelLineIdx = lines.findIndex((l) => new RegExp(`^${modelPrefix}\\s+\\S`, 'i').test(l));
  if (modelLineIdx === -1) return null;
  const modelCode = lines[modelLineIdx]
    .replace(new RegExp(`^${modelPrefix}\\s+`, 'i'), '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');

  const variant = { modelCode, driveType: null, filter: {}, specs: [] };
  let group = 'General';

  for (let i = 0; i < lines.length; i++) {
    if (i === modelLineIdx) continue;
    const line = lines[i].trim();
    if (!line) continue;
    if (!/\d/.test(line) && line === line.toUpperCase() && line.length > 2) { group = line; continue; } // ALL-CAPS no-digit line = section header

    for (const rule of FILTER_RULES) {
      if (rule.re.test(line)) {
        const n = firstNumber(line);
        if (n !== null) variant.filter[rule.key] = n;
      }
    }
    extractEnvelope(line, variant);

    const { label, value } = splitLabelValue(line);
    if (label && value) variant.specs.push({ groupLabel: group, key: label, value });
  }

  return variant;
}
