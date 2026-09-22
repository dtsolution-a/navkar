// Selection Tool — compressed-air filter correction-factor tables.
//
// Both Parker and Kaishan KFT use the same multiply convention — confirmed
// with the client: requiredCapacity = clientFlow × factor(pressure), same
// arithmetic direction as Parker's own literal datasheet formula
// ("Minimum Filtration Capacity = Compressed Air Flow Rate x CFMIP").
// KFT's table has no Kaishan-published worked example, but is read the same
// way here rather than the inverse.
const PARKER_CFMIP_TABLE = [
  [1, 2.65], [2, 1.87], [3, 1.53], [4, 1.32], [5, 1.18], [6, 1.08], [7, 1.0],
  [8, 0.94], [9, 0.88], [10, 0.84], [11, 0.8], [12, 0.76], [13, 0.73], [14, 0.71],
  [15, 0.68], [16, 0.66], [17, 0.64], [18, 0.62], [19, 0.61], [20, 0.59],
];
const KFT_TABLE = [[3, 0.55], [5, 0.8], [7, 1.0], [9, 1.25], [11, 1.5], [13, 1.75], [15, 1.88]];

function interpolate(table, x) {
  if (x <= table[0][0]) return table[0][1];
  if (x >= table[table.length - 1][0]) return table[table.length - 1][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i];
    const [x1, y1] = table[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
  }
  return 1;
}

/** Parker AO/AA: requiredNominalCapacity = clientFlow × CFMIP(pressure). */
export function parkerRequiredCapacity(clientFlowCfm, workingPressureBar) {
  const factor = workingPressureBar != null ? interpolate(PARKER_CFMIP_TABLE, workingPressureBar) : 1;
  return clientFlowCfm * factor;
}

/** Kaishan KFT: requiredNominalCapacity = clientFlow × factor(pressure) — same convention as Parker (see file header). */
export function kftRequiredCapacity(clientFlowCfm, workingPressureBar) {
  const factor = workingPressureBar != null ? interpolate(KFT_TABLE, workingPressureBar) : 1;
  return clientFlowCfm * factor;
}
