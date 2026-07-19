/**
 * Northstar Systems — equity valuation case calculations.
 * Typed financial utilities for Lesson 4.7.
 * All calculations use full floating-point precision; rounding is for display only.
 */

export type StageConfig = {
  roe: number; // e.g. 0.15
  payout: number; // e.g. 0.30
};

export type CaseConfig = {
  bvps0: number;
  highGrowthYears: number;
  highGrowth: StageConfig;
  stable: StageConfig;
  costOfEquity: number;
};

export const NORTHSTAR_BASE: CaseConfig = {
  bvps0: 100,
  highGrowthYears: 3,
  highGrowth: { roe: 0.15, payout: 0.30 },
  stable: { roe: 0.10, payout: 0.60 },
  costOfEquity: 0.10,
};

export type ForecastRow = {
  year: number;
  beginBVPS: number;
  eps: number;
  dps: number;
  retained: number;
  endBVPS: number;
};

export type ValuationResult = {
  forecast: ForecastRow[];
  stableGrowth: number;
  highGrowthRate: number;
  dps4: number;
  terminalValue: number;
  pvDividends: number[];
  pvTerminal: number;
  pvExplicitTotal: number;
  totalValue: number;
  terminalShare: number;
};

export function buildForecast(config: CaseConfig): ForecastRow[] {
  const rows: ForecastRow[] = [];
  let bvps = config.bvps0;

  for (let t = 1; t <= config.highGrowthYears; t++) {
    const eps = config.highGrowth.roe * bvps;
    const dps = config.highGrowth.payout * eps;
    const retained = (1 - config.highGrowth.payout) * eps;
    const endBVPS = bvps + retained;
    rows.push({ year: t, beginBVPS: bvps, eps, dps, retained, endBVPS });
    bvps = endBVPS;
  }

  return rows;
}

export function valueCase(config: CaseConfig): ValuationResult {
  const forecast = buildForecast(config);
  const r = config.costOfEquity;
  const N = config.highGrowthYears;

  const lastRow = forecast[N - 1];
  const lastBVPS = lastRow.endBVPS;

  // Stable stage
  const g_S = (1 - config.stable.payout) * config.stable.roe;
  const eps4 = config.stable.roe * lastBVPS;
  const dps4 = config.stable.payout * eps4;

  // Terminal value at end of year N
  let terminalValue = 0;
  if (r > g_S) {
    terminalValue = dps4 / (r - g_S);
  }

  // PV of explicit dividends
  const pvDividends = forecast.map((row) => row.dps / Math.pow(1 + r, row.year));
  const pvExplicitTotal = pvDividends.reduce((a, b) => a + b, 0);
  const pvTerminal = terminalValue / Math.pow(1 + r, N);
  const totalValue = pvExplicitTotal + pvTerminal;
  const terminalShare = totalValue > 0 ? pvTerminal / totalValue : 0;

  // High-growth rate
  const highGrowthRate = (1 - config.highGrowth.payout) * config.highGrowth.roe;

  return {
    forecast,
    stableGrowth: g_S,
    highGrowthRate,
    dps4,
    terminalValue,
    pvDividends,
    pvTerminal,
    pvExplicitTotal,
    totalValue,
    terminalShare,
  };
}

/** Value a case with different cost of equity but same operating assumptions. */
export function valueAtRate(config: CaseConfig, r: number): ValuationResult {
  return valueCase({ ...config, costOfEquity: r });
}

/** Value a case with modified payout for a given stage. */
export function valueWithPayout(
  config: CaseConfig,
  stage: "high" | "stable" | "both",
  payout: number,
): ValuationResult {
  if (stage === "high") {
    return valueCase({ ...config, highGrowth: { ...config.highGrowth, payout } });
  }
  if (stage === "stable") {
    return valueCase({ ...config, stable: { ...config.stable, payout } });
  }
  return valueCase({
    ...config,
    highGrowth: { ...config.highGrowth, payout },
    stable: { ...config.stable, payout },
  });
}

/** Gordon model value for the market-expectations challenge. */
export function gordonValue(d1: number, r: number, g: number): number {
  if (r <= g) return NaN;
  return d1 / (r - g);
}

/** Solve for r given P, D1, g: P = D1/(r-g) → r = D1/P + g */
export function solveRForGordon(p: number, d1: number, g: number): number {
  return d1 / p + g;
}

/** Solve for g given P, D1, r: P = D1/(r-g) → g = r - D1/P */
export function solveGForGordon(p: number, d1: number, r: number): number {
  return r - d1 / p;
}
