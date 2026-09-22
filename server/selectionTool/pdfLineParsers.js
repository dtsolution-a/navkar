// Selection Tool — line-based PDF parser for "single physical unit, pressure
// sweep" datasheets (PMV / PMV2 / KRSP-3 / PMV-3 style): one Model line, then
// an "Effective/Full Load Working Pressure - bar" row listing N pressure
// points as trailing numbers, and every following spec row listing either N
// values (one per pressure point) or 1 shared value (applies to all of them).
import { classifyFilterAttr, splitUnit } from './parsers.js';

const NUM_RE = /^-?\d+(?:\.\d+)?$/;

/** Splits a line into { label, values[] } by peeling numeric tokens off the end. */
function splitTrailingNumbers(line) {
  const tokens = line.trim().split(/\s+/);
  const values = [];
  let i = tokens.length - 1;
  while (i >= 0 && NUM_RE.test(tokens[i])) { values.unshift(tokens[i]); i--; }
  return { label: tokens.slice(0, i + 1).join(' '), values };
}

export function parsePressureSweepLines(lines, { driveTypeHint } = {}) {
  const modelLine = lines.find((l) => /^Model\s+\S/i.test(l));
  if (!modelLine) return [];
  const baseModel = modelLine.replace(/^Model\s+/i, '').trim();

  const pressureLine = lines.find((l) => /^(Effective Working Pressure|Full Load Pressure)\s*-\s*bar\s/i.test(l));
  if (!pressureLine) return []; // not a pressure-sweep doc — caller should try another parser

  const { values: pressureTokens } = splitTrailingNumbers(pressureLine);
  const pressurePoints = pressureTokens.map(Number);
  const n = pressurePoints.length;
  if (n === 0) return [];

  const minPressureLine = lines.find((l) => /^Minimum (effective )?working pressure/i.test(l));
  const minPressureBar = minPressureLine ? Number(splitTrailingNumbers(minPressureLine).values[0]) : null;

  const driveType = driveTypeHint || (/variable speed|vsd/i.test(lines.join(' ')) ? 'vsd' : 'fixed');
  const variants = pressurePoints.map((p) => ({
    modelCode: `${baseModel}-${p}`,
    driveType,
    filter: { workingPressureBar: p, workingPressureMinBar: minPressureBar ?? undefined },
    specs: [],
  }));

  let group = 'General';
  for (const line of lines) {
    if (line === modelLine || line === minPressureLine) continue;
    if (!/\d/.test(line)) { group = line.trim(); continue; } // no numbers at all -> section header

    const { label, values } = splitTrailingNumbers(line);
    if (!label || values.length === 0) continue;
    const { text, unit } = splitUnit(label);

    if (values.length === n) {
      values.forEach((v, i) => {
        variants[i].specs.push({ groupLabel: group, key: text, value: v, unit });
        const hit = classifyFilterAttr(label, v);
        if (hit && !/minimum/i.test(label)) variants[i].filter[hit.key] = hit.value;
      });
    } else if (values.length === 1) {
      variants.forEach((v) => v.specs.push({ groupLabel: group, key: text, value: values[0], unit }));
    }
    // else: value count doesn't match points or 1 — skip rather than misattribute.
  }

  return variants;
}
