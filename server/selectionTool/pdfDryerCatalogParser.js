// Selection Tool — parser for Trident's multi-model dryer catalogue tables
// (Coldspell leaflet, coldspell-alpha, Dryspell Plus). These are magazine
// layouts, but the model table rows themselves are regular once rotated
// sidebar text is filtered out (see pdfGrid.js). Every one of these product
// lines names the model after its own flow rating in scfm ("Coldspell 60" =
// 60 scfm, "Dryspell Plus 100" = 100 scfm) — confirmed by cross-checking the
// number against the row's own flow column — so that number is both the
// model identity and the one filter attribute we can extract with
// confidence. Everything else on the row is kept verbatim as a single spec
// string rather than force-split into fields the layout doesn't reliably
// delimit.
const MODEL_ROW_RE = /^((?:COLDSPELL\s*\+?\s*|Dryspell\s+Plus\s+)(\d+))\b\s*(.*)$/i;

function findDocPressureBar(allLines) {
  // Must be the *rated/reference* pressure ("Working pressure: 7 bar (g)"),
  // not the ceiling ("Maximum working pressure: 16 bar") — confirmed both
  // appear in these leaflets and grabbing the wrong one silently mislabeled
  // every coldspell-alpha variant as rated for 16 bar instead of 7.
  const line = allLines.find((l) => /working pressure[:\s]/i.test(l) && /bar/i.test(l) && !/maximum/i.test(l));
  if (!line) return null;
  const m = line.match(/(\d+(?:\.\d+)?)\s*bar/i);
  return m ? Number(m[1]) : null;
}

export function parseDryerCatalogTable(allLines) {
  const pressureBar = findDocPressureBar(allLines);
  const variants = [];

  for (const line of allLines) {
    const m = line.match(MODEL_ROW_RE);
    if (!m) continue;
    // Reject descriptive lines like "COLDSPELL + 20 to 150: R134a" (a
    // refrigerant-type note, not a table row) — confirmed by a real upload
    // producing duplicate "COLDSPELL + 20"/"+200" entries traced back to
    // exactly this line shape. A genuine model row is never phrased as a
    // range ("X to Y").
    if (/\bto\b/i.test(m[3])) continue;
    const modelCode = m[1].trim().replace(/\s+/g, ' ').toUpperCase();
    const flowCfm = Number(m[2]);
    variants.push({
      modelCode,
      driveType: null,
      filter: { capacityCfm: flowCfm, workingPressureBar: pressureBar ?? undefined },
      specs: [
        { groupLabel: 'Performance', key: 'Inlet capacity', value: String(flowCfm), unit: 'scfm' },
        { groupLabel: 'Performance', key: 'Full row (as printed)', value: m[3].trim() },
      ],
    });
  }
  return variants;
}
