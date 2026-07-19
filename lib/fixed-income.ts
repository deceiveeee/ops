/**
 * Fixed-income finance utilities.
 * Pure functions used by Lesson 3.1 and 3.2 interactives.
 * No live data fetching. All inputs/outputs are plain numbers.
 */

/** Price of a pure discount (zero-coupon) bond. */
export function priceZeroCoupon(
  faceValue: number,
  rate: number,
  maturity: number,
): number {
  return faceValue / Math.pow(1 + rate, maturity);
}

/** Solve the yield of a zero-coupon bond from its price. */
export function solveZeroCouponRate(
  faceValue: number,
  price: number,
  maturity: number,
): number {
  if (price <= 0 || maturity === 0) return NaN;
  return Math.pow(faceValue / price, 1 / maturity) - 1;
}

/** One-year forward rate from spot rates, for the period (t-1 → t). */
export function forwardRateFromSpotRates(
  rPrev: number,
  rCurr: number,
  t: number,
): number {
  if (t <= 1) return NaN;
  return Math.pow(1 + rCurr, t) / Math.pow(1 + rPrev, t - 1) - 1;
}

/** One-year forward rate from discount bond prices. */
export function forwardRateFromPrices(
  pricePrev: number,
  priceCurr: number,
): number {
  if (priceCurr === 0) return NaN;
  return pricePrev / priceCurr - 1;
}

/** Build a coupon bond's cash-flow schedule. */
export function couponCashFlows(
  faceValue: number,
  couponRate: number,
  maturity: number,
  frequency: number,
): number[] {
  const periods = Math.round(maturity * frequency);
  const couponPerPeriod = (faceValue * couponRate) / frequency;
  const flows: number[] = [];
  for (let i = 1; i <= periods; i++) {
    flows.push(i === periods ? couponPerPeriod + faceValue : couponPerPeriod);
  }
  return flows;
}

/** Price a coupon bond from a yield-to-maturity. cashFlows are per-period. */
export function priceCouponBondFromYTM(
  cashFlows: number[],
  ytm: number,
  frequency: number,
): number {
  const perRate = ytm / frequency;
  return cashFlows.reduce(
    (sum, cf, idx) => sum + cf / Math.pow(1 + perRate, idx + 1),
    0,
  );
}

/** Classify a bond as premium / par / discount based on coupon vs YTM. */
export function classifyBondPrice(
  couponRate: number,
  ytm: number,
): "premium" | "par" | "discount" {
  const diff = couponRate - ytm;
  if (Math.abs(diff) < 0.0005) return "par";
  return diff > 0 ? "premium" : "discount";
}

/**
 * Solve YTM by bisection. Robust (not Newton-only). Guards invalid inputs.
 * cashFlows are per-period; frequency compounds per period.
 */
export function solveYTM(
  cashFlows: number[],
  price: number,
  frequency: number,
): number {
  if (!cashFlows.length || price <= 0) return NaN;
  const npv = (y: number) =>
    cashFlows.reduce(
      (sum, cf, idx) => sum + cf / Math.pow(1 + y / frequency, idx + 1),
      0,
    );

  let lo = -0.99;
  let hi = 10; // 1000% upper bound
  // sanity: price must be within plausible npv range at extremes
  if (price > npv(lo) || price < npv(hi)) {
    // expand search a touch; if still out of range, fall back to midpoint
    if (price > npv(lo)) return NaN;
  }
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const val = npv(mid);
    if (Math.abs(val - price) < 1e-6) return mid;
    if (val > price) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Decimal → percent string with 2 decimals. */
export function formatPercent(value: number, digits = 2): string {
  if (!isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

/** Sensible currency formatting. */
export function formatMoney(value: number): string {
  if (!isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ===================== Duration & Convexity =====================

/** Macaulay duration in periods (not annualized). cashFlows are per-period. */
export function macaulayDuration(
  cashFlows: number[],
  ytm: number,
  frequency: number,
): number {
  const perRate = ytm / frequency;
  let pvSum = 0;
  let weightedSum = 0;
  cashFlows.forEach((cf, i) => {
    const t = i + 1;
    const pv = cf / Math.pow(1 + perRate, t);
    pvSum += pv;
    weightedSum += t * pv;
  });
  return pvSum === 0 ? 0 : weightedSum / pvSum;
}

/** Modified duration from Macaulay duration (periods). Returns in same units. */
export function modifiedDuration(
  macaulayInPeriods: number,
  ytm: number,
  frequency: number,
): number {
  return macaulayInPeriods / (1 + ytm / frequency);
}

/** Convert period-based Macaulay duration to annual. */
export function annualMacaulay(
  macaulayInPeriods: number,
  frequency: number,
): number {
  return macaulayInPeriods / frequency;
}

/** Convert period-based modified duration to annual. */
export function annualModifiedDuration(
  macaulayInPeriods: number,
  ytm: number,
  frequency: number,
): number {
  return modifiedDuration(macaulayInPeriods, ytm, frequency) / frequency;
}

/** Bond convexity in periods. cashFlows are per-period; ytm is annual; frequency compounds per period. */
export function bondConvexity(
  cashFlows: number[],
  ytm: number,
  frequency: number,
): number {
  const perRate = ytm / frequency;
  let pvSum = 0;
  let convSum = 0;
  cashFlows.forEach((cf, i) => {
    const t = i + 1;
    const factor = Math.pow(1 + perRate, t);
    pvSum += cf / factor;
    // d²P/dy² term: t(t+1) * C_k / (1+y/q)^{t+2}, scaled by (1/q²) for annual yield
    convSum += (t * (t + 1) * cf) / Math.pow(1 + perRate, t + 2);
  });
  if (pvSum === 0) return 0;
  return convSum / pvSum / (frequency * frequency);
}

/** Duration-only approximate percentage price change. */
export function durationPctChange(modDur: number, deltaY: number): number {
  return -modDur * deltaY;
}

/** Duration + convexity approximate new price. */
export function durationConvexityPrice(
  price: number,
  modDur: number,
  convexity: number,
  deltaY: number,
): number {
  const factor = 1 - modDur * deltaY + 0.5 * convexity * deltaY * deltaY;
  return price * factor;
}

/** Portfolio modified duration as value-weighted average. */
export function portfolioDuration(
  values: number[],
  modDurations: number[],
): number {
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return values.reduce(
    (sum, v, i) => sum + (v / total) * (modDurations[i] ?? 0),
    0,
  );
}

/** Portfolio convexity as value-weighted average. */
export function portfolioConvexity(
  values: number[],
  convexities: number[],
): number {
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return values.reduce(
    (sum, v, i) => sum + (v / total) * (convexities[i] ?? 0),
    0,
  );
}
