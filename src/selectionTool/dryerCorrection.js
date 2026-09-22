// Selection Tool — refrigerant-dryer correction-factor tables, one module
// per brand since each publishes its own table shape and reference
// conditions. A dryer's *rated* capacity only holds at reference
// conditions; away from them its real throughput is capacity × (combined
// factor). So sizing one for a client means working the formula backwards:
// requiredCapacity = clientFlow ÷ (combined factor).

// ---- Trident Coldspell --------------------------------------------------
// Digitized from the "Correction Factor" panel printed on Trident's own
// leaflets — confirmed against the Coldspell leaflet and coldspell-alpha
// catalogue, both print identical Ti/Ta/Pi numbers.
const TI_TABLE = [[30, 1.3], [38, 1.0], [45, 0.75], [50, 0.65], [55, 0.5], [60, 0.4]]; // inlet temp °C -> factor
const TA_TABLE = [[25, 1.36], [30, 1.18], [38, 1.0], [43, 0.86]]; // ambient temp °C -> factor
const PI_TABLE = [[3, 0.6], [5, 0.84], [7, 1.0], [9, 1.11], [12, 1.21]]; // inlet pressure kg/cm² -> factor

const BAR_TO_KGCM2 = 1.01972;

/** Linear interpolation over a sorted [x, y] table; clamps outside the table's own range rather than extrapolating. */
function interpolate(table, x) {
  if (x <= table[0][0]) return table[0][1];
  if (x >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i];
    const [x1, y1] = table[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
  }
  return 1; // unreachable given the bounds checks above
}

/**
 * Returns the combined correction factor (Ti × Ta × Pi) for a client's
 * stated conditions. Any input left blank is treated as the table's
 * reference point (factor 1.0) rather than skipped, so a partially-filled
 * questionnaire still produces a sane, conservative-ish estimate instead of
 * silently ignoring the correction entirely.
 */
export function coldspellCorrectionFactor({ inletTempC, ambientTempC, workingPressureBar }) {
  const ti = inletTempC != null ? interpolate(TI_TABLE, inletTempC) : 1;
  const ta = ambientTempC != null ? interpolate(TA_TABLE, ambientTempC) : 1;
  const pi = workingPressureBar != null ? interpolate(PI_TABLE, workingPressureBar * BAR_TO_KGCM2) : 1;
  return ti * ta * pi;
}

// ---- Kaishan KRD ----------------------------------------------------------
// Digitized from "KRD AIR DRYER new.pdf" page 6. Reference conditions
// (factor = 1.0): ambient 35°C, inlet air pressure 7 bar, dew point
// ISO 8573-1 Class 5. Two independent tables multiply together:
//  1. A genuinely 3-axis table — ambient temp × dew point × inlet air temp
//     — since Kaishan's own PDF prints it as 5 side-by-side blocks (one per
//     ambient temp) each a dew-point-by-inlet-temp grid.
//  2. A 1-axis inlet-pressure table, same shape as Trident's Pi.
const KRD_DEWPOINT_AXIS = [3, 5, 7, 10];
const KRD_INLET_TEMP_AXIS = [40, 45, 50, 55, 60, 65, 70];
// factors[ambientIdx][inletTempIdx][dewPointIdx]
const KRD_AMBIENT_AXIS = [30, 35, 40, 45, 50];
const KRD_FACTORS = [
  // Ambient 30°C
  [[0.86, 1.03, 1.26, 1.46], [0.69, 0.85, 1.04, 1.20], [0.56, 0.69, 0.84, 0.97], [0.51, 0.59, 0.72, 0.83], [0.43, 0.51, 0.62, 0.72], [0.38, 0.46, 0.56, 0.65], [0.35, 0.43, 0.52, 0.60]],
  // Ambient 35°C (reference — dew point Class 5 / 3°C column, inlet 40°C... reference cell used is wherever the client's own inputs land, not a single fixed cell)
  [[0.82, 0.99, 1.21, 1.39], [0.66, 0.82, 1.00, 1.15], [0.53, 0.66, 0.81, 0.93], [0.48, 0.57, 0.69, 0.79], [0.40, 0.49, 0.60, 0.69], [0.35, 0.42, 0.51, 0.59], [0.32, 0.39, 0.48, 0.55]],
  // Ambient 40°C
  [[0.73, 0.94, 1.15, 1.32], [0.61, 0.78, 0.95, 1.09], [0.49, 0.63, 0.77, 0.88], [0.42, 0.54, 0.66, 0.76], [0.37, 0.47, 0.57, 0.66], [0.33, 0.42, 0.51, 0.59], [0.30, 0.39, 0.48, 0.55]],
  // Ambient 45°C
  [[0.68, 0.87, 1.06, 1.22], [0.56, 0.72, 0.88, 1.01], [0.45, 0.58, 0.71, 0.82], [0.39, 0.50, 0.61, 0.70], [0.33, 0.43, 0.53, 0.61], [0.30, 0.39, 0.47, 0.55], [0.28, 0.36, 0.44, 0.51]],
  // Ambient 50°C
  [[0.60, 0.78, 0.96, 1.10], [0.51, 0.65, 0.79, 0.91], [0.40, 0.52, 0.64, 0.74], [0.35, 0.45, 0.55, 0.63], [0.31, 0.39, 0.47, 0.55], [0.27, 0.35, 0.43, 0.49], [0.24, 0.32, 0.40, 0.45]],
];
const KRD_PRESSURE_TABLE = [[3, 0.66], [4, 0.77], [5, 0.86], [6, 0.93], [7, 1.0], [8, 1.05], [10, 1.14], [12, 1.21], [14, 1.27]];

function clampAxisIndex(axis, value) {
  if (value <= axis[0]) return { lo: 0, hi: 0, frac: 0 };
  if (value >= axis[axis.length - 1]) return { lo: axis.length - 1, hi: axis.length - 1, frac: 0 };
  for (let i = 0; i < axis.length - 1; i++) {
    if (value >= axis[i] && value <= axis[i + 1]) {
      return { lo: i, hi: i + 1, frac: (value - axis[i]) / (axis[i + 1] - axis[i]) };
    }
  }
  return { lo: 0, hi: 0, frac: 0 };
}

function lerp(a, b, frac) {
  return a + (b - a) * frac;
}

/** Trilinear interpolation over the ambient × inletTemp × dewPoint cube. */
function krdTempDewFactor(ambientC, inletTempC, dewPointC) {
  const amb = clampAxisIndex(KRD_AMBIENT_AXIS, ambientC);
  const inl = clampAxisIndex(KRD_INLET_TEMP_AXIS, inletTempC);
  const dp = clampAxisIndex(KRD_DEWPOINT_AXIS, dewPointC);

  const at = (ai, ii, di) => KRD_FACTORS[ai][ii][di];
  // interpolate over dew point at each of the 4 (ambient, inletTemp) corners
  const c00 = lerp(at(amb.lo, inl.lo, dp.lo), at(amb.lo, inl.lo, dp.hi), dp.frac);
  const c01 = lerp(at(amb.lo, inl.hi, dp.lo), at(amb.lo, inl.hi, dp.hi), dp.frac);
  const c10 = lerp(at(amb.hi, inl.lo, dp.lo), at(amb.hi, inl.lo, dp.hi), dp.frac);
  const c11 = lerp(at(amb.hi, inl.hi, dp.lo), at(amb.hi, inl.hi, dp.hi), dp.frac);
  // interpolate over inlet temp
  const c0 = lerp(c00, c01, inl.frac);
  const c1 = lerp(c10, c11, inl.frac);
  // interpolate over ambient
  return lerp(c0, c1, amb.frac);
}

/**
 * Returns the combined correction factor for a Kaishan KRD dryer. Any
 * input left blank falls back to the reference value for that axis (35°C
 * ambient, 7 bar, 3°C dew point — the mildest/tightest column, a
 * conservative default) so a partially-filled questionnaire still produces
 * a sane estimate.
 */
export function krdCorrectionFactor({ inletTempC, ambientTempC, workingPressureBar, targetPdpC }) {
  const tempDewFactor = krdTempDewFactor(ambientTempC ?? 35, inletTempC ?? 40, targetPdpC ?? 3);
  const pressureFactor = workingPressureBar != null ? interpolate(KRD_PRESSURE_TABLE, workingPressureBar) : 1;
  return tempDewFactor * pressureFactor;
}
