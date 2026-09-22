// Selection Tool — Filters category parsers.
//
// Parker AO/AA: a clean, consistently-delimited flow-rate table once
// rotated text is stripped — anchored on the "P###XX" replacement-element
// code token, since pipe-size fractions ("1 1/2\"") tokenize inconsistently
// and can't be used as a fixed-position anchor.
//
// Trident Cleansweep+: same "model number = flow rating" naming convention
// already used for the Coldspell/Dryspell dryers (T40 = 40 m³/hr) — reused
// here with the m³/hr->cfm conversion applied.
const M3HR_TO_CFM = 0.588578;

function findDocPressureBar(allLines) {
  const line = allLines.find((l) => /operation at\s+\d+(\.\d+)?\s*bar/i.test(l));
  if (!line) return null;
  const m = line.match(/operation at\s+(\d+(?:\.\d+)?)\s*bar/i);
  return m ? Number(m[1]) : null;
}

export function parseParkerFlowTable(allLines) {
  const pressureBar = findDocPressureBar(allLines);
  const variants = [];

  // Parker's AOPX010A-style codes are reused verbatim across two physically
  // different product lines (Coalescing vs Dry Particulate elements) — the
  // page's own section heading is the only thing that disambiguates them,
  // so it has to be folded into the model code or the two tables collide
  // and silently overwrite each other on ingest (confirmed in testing).
  const headingLine = allLines.find((l) => /^Grade A[OA]/.test(l));
  const sectionTag = headingLine && /dry particulate/i.test(headingLine) ? 'DP' : 'COAL';

  for (const line of allLines) {
    const tokens = line.trim().split(/\s+/);
    if (!/^A[OA]PX\d{3}[A-Z]$/.test(tokens[0] || '')) continue;
    const elIdx = tokens.findIndex((t) => /^P\d+A[OA]$/.test(t));
    if (elIdx < 4) continue;

    const [ls, m3min, m3hr, cfm] = tokens.slice(elIdx - 4, elIdx);
    const modelCode = `${tokens[0]}-${sectionTag}`;
    variants.push({
      modelCode,
      driveType: null,
      filter: { capacityCfm: Number(cfm), workingPressureBar: pressureBar ?? undefined },
      specs: [
        { groupLabel: 'Flow Rate', key: 'Flow (L/S)', value: ls },
        { groupLabel: 'Flow Rate', key: 'Flow (m³/min)', value: m3min },
        { groupLabel: 'Flow Rate', key: 'Flow (m³/hr)', value: m3hr },
        { groupLabel: 'Flow Rate', key: 'Flow (cfm)', value: cfm },
        { groupLabel: 'Flow Rate', key: 'Replacement element no.', value: tokens[elIdx] },
        { groupLabel: 'General', key: 'Full row (as printed)', value: line.trim() },
      ],
    });
  }
  return variants;
}

const CLEANSWEEP_ROW_RE = /^T(\d+)\s+(\d+)\b(.*)$/;

export function parseCleansweepTable(allLines) {
  const variants = [];
  for (const line of allLines) {
    const m = line.match(CLEANSWEEP_ROW_RE);
    if (!m) continue;
    const m3hr = Number(m[2]);
    variants.push({
      modelCode: `T${m[1]}`,
      driveType: null,
      filter: { capacityCfm: Math.round(m3hr * M3HR_TO_CFM * 10) / 10 },
      specs: [
        { groupLabel: 'Performance', key: 'Flow', value: String(m3hr), unit: 'm³/hr' },
        { groupLabel: 'General', key: 'Full row (as printed)', value: m[3].trim() },
      ],
    });
  }
  return variants;
}
