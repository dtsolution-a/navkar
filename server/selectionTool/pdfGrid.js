// Selection Tool — PDF text extraction helpers.
//
// pdfjs-dist gives us each text run with its (x, y) position on the page —
// close enough to a spreadsheet cell grid that we can reuse the same shapes
// parsers.js already knows how to read. Two extraction modes:
//
//  - extractGridRows(): for "Model" + N-column datasheets (the KRSB style),
//    reconstructs a transposed-sheet grid identical to what XLSX.sheet_to_json
//    produces, so parseTransposedSheet() from parsers.js works unmodified.
//  - extractLines(): for everything else (single-model datasheets, leaflets),
//    groups text into reading-order lines for a line-based parser.
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

// Lazy-loaded (not top-level await): esbuild's CJS output — used to produce
// server/app.cjs for cPanel/LiteSpeed, see server/build.js — can't bundle a
// top-level `await import()` at all ("Top-level await is currently not
// supported with the cjs output format"), so this only runs the first time
// a PDF is actually parsed, inside an async function instead of at module
// load time.
let pdfjsPromise = null;
function getPdfjs() {
  if (!pdfjsPromise) {
    const require = createRequire(import.meta.url);
    const pdfjsPath = require.resolve('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjsPromise = import(pathToFileURL(pdfjsPath).href);
  }
  return pdfjsPromise;
}

const Y_TOLERANCE = 3; // points; merges baseline jitter within one visual row

async function loadPages(buffer, password) {
  const pdfjs = await getPdfjs();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer), isEvalSupported: false, password }).promise;
  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const items = content.items
      // Drop rotated text (vertical sidebar notices, watermarks): a normal
      // horizontal run has transform = [scaleX, 0, 0, scaleY, x, y]; a
      // rotated run swaps the diagonal for the off-diagonal, e.g. Coldspell
      // leaflet's vertical safety-notice column reads [0, 5.5, -5.5, 0, …].
      .filter((i) => i.str.trim() !== '' && Math.abs(i.transform[0]) >= Math.abs(i.transform[1]))
      .map((i) => ({ str: i.str.trim(), x: i.transform[4], y: i.transform[5] }));
    pages.push(items);
  }
  return pages;
}

/** Clusters items into rows by y (descending = top-to-bottom reading order). */
function clusterRows(items) {
  const sorted = [...items].sort((a, b) => b.y - a.y);
  const rows = [];
  for (const item of sorted) {
    let row = rows.find((r) => Math.abs(r.y - item.y) <= Y_TOLERANCE);
    if (!row) { row = { y: item.y, items: [] }; rows.push(row); }
    row.items.push(item);
  }
  rows.forEach((r) => r.items.sort((a, b) => a.x - b.x));
  return rows;
}

/**
 * Reconstructs a transposed-sheet grid from a "Model" + N-column PDF page.
 * Returns rows shaped like XLSX.sheet_to_json({header:1}) output — ready for
 * parsers.js#parseTransposedSheet. Column anchors come from the x-positions
 * on the header row (the row whose first cell is literally "Model").
 */
export function extractGridRows(pageItems) {
  const rows = clusterRows(pageItems);
  const headerRow = rows.find((r) => r.items[0] && r.items[0].str.toLowerCase() === 'model');
  if (!headerRow) return [];

  const labelMaxX = headerRow.items[0].x + 100; // generous margin past "Model"
  const anchors = headerRow.items.filter((i) => i.x > labelMaxX).map((i) => i.x);
  if (anchors.length === 0) return [];

  const grid = [];
  for (const row of rows) {
    if (row.y > headerRow.y + Y_TOLERANCE) continue; // skip anything above the header (titles, etc.)
    const labelParts = row.items.filter((i) => i.x <= labelMaxX).map((i) => i.str);
    const cells = new Array(anchors.length).fill(null);
    row.items
      .filter((i) => i.x > labelMaxX)
      .forEach((i) => {
        let best = 0, bestDist = Infinity;
        anchors.forEach((a, idx) => {
          const d = Math.abs(a - i.x);
          if (d < bestDist) { bestDist = d; best = idx; }
        });
        cells[best] = cells[best] ? `${cells[best]} ${i.str}` : i.str;
      });
    grid.push([labelParts.join(' ') || null, ...cells]);
  }
  return grid;
}

/** Flat reading-order lines, one string per visual row — for single-model docs. */
export function extractLines(pageItems) {
  return clusterRows(pageItems).map((r) => r.items.map((i) => i.str).join(' '));
}

export async function loadPdfPages(buffer, password) {
  return loadPages(buffer, password);
}
