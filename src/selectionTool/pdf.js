// Selection Tool — client-side PDF export (Section 2.6 of the arch spec:
// zero server history — this runs entirely in the browser, nothing here is
// ever sent to the backend).
import jsPDF from 'jspdf';
import { priceForVariant } from './db';

const CATEGORY_LABELS = { compressor: 'Air Compressor', dryer: 'Air Dryer', filter: 'Air Filter' };
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Brand palette — matches tailwind.config.js (accent / primary).
const NAVY = [15, 23, 42]; // primary
const ACCENT = [37, 99, 235]; // accent
const ACCENT_TINT = [219, 234, 254]; // accent-muted
const INK = [23, 23, 23];
const SUBTLE = [107, 114, 128];
const LINE = [225, 227, 231];
const CARD_BG = [250, 250, 251];

let logoDataUrlCache = null;
async function loadLogoDataUrl() {
  if (logoDataUrlCache) return logoDataUrlCache;
  try {
    const res = await fetch('/images/navkar-logo.png');
    const blob = await res.blob();
    logoDataUrlCache = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    logoDataUrlCache = null; // report still generates fine without the logo
  }
  return logoDataUrlCache;
}

// jsPDF's built-in "helvetica" font only covers WinAnsi (~codepage 1252) — a
// handful of unicode characters that turn up in free-typed spec text (µ, ³,
// ², the multiplication sign) fall outside it and render as garbage glyphs
// (e.g. "ÿ3 PPM"). WinAnsi actually does include µ, ², ³ and ° natively, so
// the real culprits are things like NBSP or smart quotes pasted from Excel/
// Word — normalize those down to plain ASCII equivalents before drawing.
function pdfSafeText(text) {
  if (text == null) return '';
  return String(text)
    .replace(/ /g, ' ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x00-\xFF]/g, ''); // strip anything still outside WinAnsi rather than render a broken glyph
}

function labelizeParamKey(key) {
  const map = {
    workingPressureBar: 'Working Pressure (bar)',
    capacityCfm: 'Capacity (cfm)',
    minWorkingPressureBar: 'Min. Working Pressure (bar)',
    maxInletFlowCfm: 'Max Inlet Flow (cfm)',
    inletTempC: 'Max Inlet Air Temp (°C)',
    ambientTempC: 'Max Ambient Temp (°C)',
    targetPdpC: 'Required PDP (°C)',
  };
  return map[key] || key;
}

function drawRunningHeader(doc, { category, pageNum }) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('SHAH GROUP', MARGIN, 7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 195, 220);
  doc.text(`${CATEGORY_LABELS[category] || category} — Equipment Selection Report`, MARGIN + 32, 7.5);
  doc.setTextColor(180, 195, 220);
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, 7.5, { align: 'right' });
  return 18;
}

/** Faint diagonal "SHAH GROUP" wordmark behind the page content — drawn under everything else, low opacity via jsPDF's GState so it never competes with real text. */
function drawWatermark(doc) {
  const gState = new doc.GState({ opacity: 0.06 });
  doc.saveGraphicsState();
  doc.setGState(gState);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(52);
  doc.setTextColor(...NAVY);
  doc.text('SHAH GROUP', PAGE_W / 2, PAGE_H / 2, { align: 'center', angle: 35 });
  doc.restoreGraphicsState();
}

function drawFooter(doc, pageNum, pageCount) {
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...SUBTLE);
  doc.text('Generated on-device — this report and the diagnosis behind it are never stored on a server.', MARGIN, PAGE_H - 7);
  doc.text(`${pageNum} / ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 7, { align: 'right' });
}

/** A small labelled stat tile — used for the client-requirement row and each card's key numbers. */
function drawStat(doc, x, y, w, label, value) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...SUBTLE);
  doc.text(label.toUpperCase(), x, y, { maxWidth: w });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(pdfSafeText(String(value)), x, y + 5.2, { maxWidth: w });
}

function groupSpecs(specs) {
  const groups = [];
  const byLabel = new Map();
  (specs || []).forEach((s) => {
    const label = s.groupLabel || 'General';
    if (!byLabel.has(label)) {
      const g = { label, items: [] };
      byLabel.set(label, g);
      groups.push(g);
    }
    byLabel.get(label).items.push(s);
  });
  return groups;
}

const SPEC_ROW_LINE_H = 3.6;
const SPEC_ROW_MIN_H = 4.3;

/** Wrapped line counts (key col, value col) for one spec row at a given column width — keeps measurement and drawing using identical wrap math so rows never overlap. */
function specRowLines(doc, s, colW) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const keyLines = doc.splitTextToSize(pdfSafeText(s.key), colW * 0.56);
  const valText = `${s.value}${s.unit ? ' ' + s.unit : ''}`;
  doc.setFont('helvetica', 'bold');
  const valLines = doc.splitTextToSize(pdfSafeText(valText), colW * 0.42);
  return Math.max(keyLines.length, valLines.length, 1);
}

function measureGroupsHeight(doc, groups, colW) {
  let h = 0;
  groups.forEach((g) => {
    h += 5.2; // group label
    let col = 0;
    let rowMaxLines = 1;
    g.items.forEach((s, i) => {
      const lines = specRowLines(doc, s, colW);
      rowMaxLines = Math.max(rowMaxLines, lines);
      const isLastInRow = col === 1 || i === g.items.length - 1;
      if (isLastInRow) {
        h += Math.max(SPEC_ROW_MIN_H, rowMaxLines * SPEC_ROW_LINE_H);
        rowMaxLines = 1;
      }
      col = col === 0 ? 1 : 0;
    });
  });
  return h;
}

function measureCardHeight(doc, v, showPricing, price, groups, colW) {
  let h = 9; // header row (model name + tag)
  h += 15; // stat row (pressure / capacity / drive / price)
  h += measureGroupsHeight(doc, groups, colW);
  return h + 6; // bottom padding
}

function drawCard(doc, v, y, { rank, showPricing, price, groups }) {
  const x = MARGIN;
  const w = CONTENT_W;
  const colW = (w - 12) / 2;
  const cardH = measureCardHeight(doc, v, showPricing, price, groups, colW);

  doc.setFillColor(...CARD_BG);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, cardH, 2, 2, 'FD');

  // Rank badge
  doc.setFillColor(...ACCENT);
  doc.circle(x + 8, y + 8, 4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(String(rank), x + 8, y + 9.3, { align: 'center' });

  // Model name + brand/family tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(...INK);
  doc.text(pdfSafeText(v.modelCode), x + 15, y + 9.5);

  const tag = `${v.brand || ''} ${v.family || ''}`.trim();
  let tagRightEdge = x + w - 4;
  if (v.approxMatch) {
    const approxLabel = 'NEAREST AVAILABLE';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    const approxW = doc.getTextWidth(approxLabel) + 6;
    doc.setFillColor(254, 243, 199); // amber tint
    doc.roundedRect(tagRightEdge - approxW, y + 4.5, approxW, 6, 1.5, 1.5, 'F');
    doc.setTextColor(146, 64, 14); // amber ink
    doc.text(approxLabel, tagRightEdge - approxW / 2, y + 8.5, { align: 'center' });
    tagRightEdge -= approxW + 3;
  }
  if (tag) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const tagW = doc.getTextWidth(tag) + 6;
    doc.setFillColor(...ACCENT_TINT);
    doc.roundedRect(tagRightEdge - tagW, y + 4.5, tagW, 6, 1.5, 1.5, 'F');
    doc.setTextColor(...ACCENT);
    doc.text(pdfSafeText(tag), tagRightEdge - tagW / 2, y + 8.5, { align: 'center' });
  }

  doc.setDrawColor(...LINE);
  doc.line(x + 4, y + 13, x + w - 4, y + 13);

  // Stat row
  let sy = y + 20;
  const statW = w / (showPricing ? 4 : 3);
  drawStat(doc, x + 6, sy, statW, 'Pressure', `${v.workingPressureBar} bar`);
  drawStat(doc, x + 6 + statW, sy, statW, 'Capacity', `${v.capacityCfm} cfm`);
  drawStat(doc, x + 6 + statW * 2, sy, statW, 'Drive', v.driveType || '—');
  if (showPricing) {
    drawStat(doc, x + 6 + statW * 3, sy, statW, 'Price', price != null ? `Rs ${Math.round(price).toLocaleString('en-IN')}` : '—');
  }
  let cy = sy + 10;

  // Grouped spec table
  groups.forEach((g) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...ACCENT);
    doc.text(g.label.toUpperCase(), x + 6, cy + 3.6);
    doc.setDrawColor(...ACCENT_TINT);
    doc.setLineWidth(0.5);
    doc.line(x + 6, cy + 4.6, x + w - 6, cy + 4.6);
    cy += 5.2;

    let col = 0;
    let rowY = cy;
    let rowMaxLines = 1;
    g.items.forEach((s, i) => {
      const colX = x + 6 + col * colW;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...SUBTLE);
      const keyLines = doc.splitTextToSize(pdfSafeText(s.key), colW * 0.56);
      doc.text(keyLines, colX, rowY + 2.9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      const valText = `${s.value}${s.unit ? ' ' + s.unit : ''}`;
      const valLines = doc.splitTextToSize(pdfSafeText(valText), colW * 0.42);
      doc.text(valLines, colX + colW - 2, rowY + 2.9, { align: 'right' });
      rowMaxLines = Math.max(rowMaxLines, keyLines.length, valLines.length);

      const isLastInRow = col === 1 || i === g.items.length - 1;
      if (isLastInRow) {
        rowY += Math.max(SPEC_ROW_MIN_H, rowMaxLines * SPEC_ROW_LINE_H);
        rowMaxLines = 1;
      }
      col = col === 0 ? 1 : 0;
    });
    cy = rowY;
  });

  return y + cardH + 5;
}

/** Height a reference-series block needs — a header row, the table (if any), and a "View PDF" link row (if any). */
function measureReferenceHeight(series) {
  let h = 9; // name row
  if (series.tableData) {
    h += 6; // column header
    h += series.tableData.rows.length * 4.3;
  }
  if (series.pdfUrl) h += 7;
  return h + 5;
}

/** Draws one reference series' name, table (if present), and a clickable "View PDF" link (if present) — not merged into the file, jsPDF's own link annotation opens the vendor PDF in a new tab. */
function drawReferenceSeries(doc, series, y, apiOrigin) {
  const x = MARGIN;
  const w = CONTENT_W;
  const h = measureReferenceHeight(series);

  doc.setFillColor(...CARD_BG);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(pdfSafeText(series.name), x + 6, y + 6.5);
  let cy = y + 11;

  if (series.tableData) {
    const { columns, rows } = series.tableData;
    const colW = (w - 12) / columns.length;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...ACCENT);
    columns.forEach((c, i) => doc.text(pdfSafeText(String(c)), x + 6 + i * colW, cy, { maxWidth: colW - 2 }));
    doc.setDrawColor(...ACCENT_TINT);
    doc.setLineWidth(0.4);
    doc.line(x + 6, cy + 1.4, x + w - 6, cy + 1.4);
    cy += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...INK);
    rows.forEach((row) => {
      row.forEach((cell, i) => doc.text(pdfSafeText(String(cell ?? '')), x + 6 + i * colW, cy, { maxWidth: colW - 2 }));
      cy += 4.3;
    });
    cy += 2;
  }

  if (series.pdfUrl) {
    const label = pdfSafeText(`View PDF — ${series.pdfOriginalName || series.name}`);
    const origin = apiOrigin || (typeof window !== 'undefined' ? window.location.origin : '');
    const fullUrl = /^https?:\/\//i.test(series.pdfUrl) ? series.pdfUrl : `${origin}${series.pdfUrl}${series.pdfPage ? `#page=${series.pdfPage}` : ''}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    const labelY = cy + 3;
    doc.textWithLink(label, x + 6, labelY, { url: fullUrl });
    // Underline + an explicit link annotation over the same box — some
    // viewers don't reliably register textWithLink's own rect once a PDF
    // has been re-printed/re-exported, so we duplicate it with doc.link().
    const labelW = doc.getTextWidth(label);
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.2);
    doc.line(x + 6, labelY + 0.8, x + 6 + labelW, labelY + 0.8);
    doc.link(x + 6, labelY - 3, labelW, 4, { url: fullUrl });
  }

  return y + h + 5;
}

export async function generateReport({ category, answers, results, showPricing, pricingSet, salesmanName, referenceSeries, apiOrigin }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const logo = await loadLogoDataUrl();
  let pageNum = 1;

  function newPage() {
    doc.addPage();
    pageNum += 1;
    return drawRunningHeader(doc, { category, pageNum });
  }
  function ensureSpace(y, needed) {
    if (y + needed > PAGE_H - 16) return newPage();
    return y;
  }

  // ---- Title header (page 1 only) ----
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 38, 'F');
  if (logo) {
    // The source logo is a wide wordmark (~3:1) — fit it into the white
    // plate by its own aspect ratio instead of stretching it to a fixed
    // box, which is what was squashing it in the exported PDF.
    const plateW = 40;
    const plateH = 22;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN, 8, plateW, plateH, 2, 2, 'F');
    try {
      const props = doc.getImageProperties(logo);
      const ratio = props.width / props.height;
      const maxW = plateW - 6;
      const maxH = plateH - 6;
      let drawW = maxW;
      let drawH = drawW / ratio;
      if (drawH > maxH) {
        drawH = maxH;
        drawW = drawH * ratio;
      }
      const imgX = MARGIN + (plateW - drawW) / 2;
      const imgY = 8 + (plateH - drawH) / 2;
      doc.addImage(logo, 'PNG', imgX, imgY, drawW, drawH, undefined, 'FAST');
    } catch {
      /* corrupt/unsupported image — header still reads fine without it */
    }
  }
  const titleX = logo ? MARGIN + 48 : MARGIN;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Equipment Selection Report', titleX, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(190, 205, 230);
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`${CATEGORY_LABELS[category] || category}  ·  ${dateStr}${salesmanName ? '  ·  Prepared by ' + salesmanName : ''}`, titleX, 27);

  let y = 48;

  // ---- Client requirement panel ----
  const answerEntries = Object.entries(answers).filter(([, val]) => val !== undefined && val !== null && val !== '');
  const reqRows = Math.ceil(answerEntries.length / 3);
  const reqH = 10 + reqRows * 12;
  doc.setFillColor(...CARD_BG);
  doc.setDrawColor(...LINE);
  doc.roundedRect(MARGIN, y, CONTENT_W, reqH, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text('CLIENT REQUIREMENT', MARGIN + 6, y + 7);
  const reqColW = CONTENT_W / 3;
  answerEntries.forEach(([key, val], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    drawStat(doc, MARGIN + 6 + col * reqColW, y + 15 + row * 12, reqColW - 4, labelizeParamKey(key), val);
  });
  y += reqH + 10;

  // ---- Recommended models heading ----
  doc.setFillColor(...ACCENT);
  doc.rect(MARGIN, y, 1.4, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(`Recommended Models (${results.length})`, MARGIN + 5, y + 5);
  y += 12;

  if (results.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...SUBTLE);
    doc.text('No models were selected for this report.', MARGIN, y);
  }

  results.forEach((v, idx) => {
    const price = showPricing ? priceForVariant(v, pricingSet) : null;
    const visibleSpecs = (v.specs || []).filter((s) => !/list price/i.test(s.key));
    const groups = groupSpecs(visibleSpecs);
    const colW = (CONTENT_W - 12) / 2;
    const cardH = measureCardHeight(doc, v, showPricing, price, groups, colW);
    y = ensureSpace(y, cardH);
    y = drawCard(doc, v, y, { rank: idx + 1, showPricing, price, groups });
  });

  if (referenceSeries?.length) {
    y = ensureSpace(y, 16);
    doc.setFillColor(...ACCENT);
    doc.rect(MARGIN, y, 1.4, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text('Reference Series', MARGIN + 5, y + 5);
    y += 12;

    referenceSeries.forEach((s) => {
      const h = measureReferenceHeight(s);
      y = ensureSpace(y, h);
      y = drawReferenceSeries(doc, s, y, apiOrigin || '');
    });
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    drawWatermark(doc);
    drawFooter(doc, p, pageCount);
  }

  return doc;
}
