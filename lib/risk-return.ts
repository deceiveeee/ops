/**
 * Risk and return financial/statistical calculation utilities.
 * Typed functions for Lessons 5.1–5.3.
 */

// ===================== Return calculations =====================

/** Holding-period total return from price change + dividend. */
export function holdingPeriodReturn(p0: number, p1: number, d1: number): number {
  if (p0 === 0) return NaN;
  return (d1 + p1 - p0) / p0;
}

/** Arithmetic mean of a return series. */
export function arithmeticMean(returns: number[]): number {
  if (!returns.length) return NaN;
  return returns.reduce((a, b) => a + b, 0) / returns.length;
}

/** Geometric mean of a return series. Returns NaN if any return ≤ -1. */
export function geometricMean(returns: number[]): number {
  if (!returns.length) return NaN;
  if (returns.some((r) => r <= -1)) return NaN;
  const product = returns.reduce((acc, r) => acc * (1 + r), 1);
  return Math.pow(product, 1 / returns.length) - 1;
}

/** Ending wealth from an initial investment and a return series. */
export function endingWealth(initial: number, returns: number[]): number {
  return returns.reduce((wealth, r) => wealth * (1 + r), initial);
}

/** Required return to recover from a given loss. lossFraction e.g. 0.20 for -20%. */
export function requiredRecoveryReturn(lossFraction: number): number {
  if (lossFraction >= 1) return NaN;
  return 1 / (1 - lossFraction) - 1;
}

// ===================== Volatility calculations =====================

/** Sample variance (divides by T-1). Returns NaN for fewer than 2 observations. */
export function sampleVariance(returns: number[]): number {
  if (returns.length < 2) return NaN;
  const mean = arithmeticMean(returns);
  const sumSq = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0);
  return sumSq / (returns.length - 1);
}

/** Sample standard deviation. */
export function sampleStandardDeviation(returns: number[]): number {
  const v = sampleVariance(returns);
  return isNaN(v) ? NaN : Math.sqrt(v);
}

// ===================== Annualization =====================

/** Simple arithmetic annualization: multiply periodic return by periods per year. */
export function annualizeArithmeticReturn(periodicReturn: number, periodsPerYear: number): number {
  return periodicReturn * periodsPerYear;
}

/** Compound annualization: (1+r)^n - 1. */
export function compoundPeriodicReturn(periodicReturn: number, periodsPerYear: number): number {
  return Math.pow(1 + periodicReturn, periodsPerYear) - 1;
}

/** Annualize volatility: σ_periodic × √n. */
export function annualizeVolatility(periodicVol: number, periodsPerYear: number): number {
  return periodicVol * Math.sqrt(periodsPerYear);
}

// ===================== Expected return from states =====================

export type StateOutcome = { probability: number; return: number };

/** Expected return from a list of probability/return pairs. Validates probabilities sum to ~1. */
export function expectedReturnFromStates(states: StateOutcome[]): number {
  const totalProb = states.reduce((sum, s) => sum + s.probability, 0);
  if (Math.abs(totalProb - 1) > 0.001) return NaN;
  return states.reduce((sum, s) => sum + s.probability * s.return, 0);
}

// ===================== Portfolio calculations =====================

/** Portfolio expected return from weights and expected returns. */
export function portfolioExpectedReturn(weights: number[], expectedReturns: number[]): number {
  if (weights.length !== expectedReturns.length) return NaN;
  if (Math.abs(weights.reduce((a, b) => a + b, 0) - 1) > 0.001) return NaN;
  return weights.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
}

/** Covariance of two return series (sample covariance, divides by T-1). */
export function covariance(returnsA: number[], returnsB: number[]): number {
  if (returnsA.length !== returnsB.length || returnsA.length < 2) return NaN;
  const meanA = arithmeticMean(returnsA);
  const meanB = arithmeticMean(returnsB);
  const T = returnsA.length;
  let sum = 0;
  for (let i = 0; i < T; i++) {
    sum += (returnsA[i] - meanA) * (returnsB[i] - meanB);
  }
  return sum / (T - 1);
}

/** Correlation between two return series. Returns NaN if either std dev is 0. */
export function correlation(returnsA: number[], returnsB: number[]): number {
  const cov = covariance(returnsA, returnsB);
  const sdA = sampleStandardDeviation(returnsA);
  const sdB = sampleStandardDeviation(returnsB);
  if (sdA === 0 || sdB === 0 || isNaN(cov)) return NaN;
  const corr = cov / (sdA * sdB);
  return Math.max(-1, Math.min(1, corr));
}

/** Two-asset portfolio variance from weights, vols, and correlation. */
export function twoAssetPortfolioVariance(
  wA: number,
  wB: number,
  sigmaA: number,
  sigmaB: number,
  rhoAB: number,
): number {
  if (rhoAB < -1 || rhoAB > 1) return NaN;
  return (
    wA * wA * sigmaA * sigmaA +
    wB * wB * sigmaB * sigmaB +
    2 * wA * wB * rhoAB * sigmaA * sigmaB
  );
}

/** Two-asset portfolio volatility. */
export function twoAssetPortfolioVolatility(
  wA: number,
  wB: number,
  sigmaA: number,
  sigmaB: number,
  rhoAB: number,
): number {
  const v = twoAssetPortfolioVariance(wA, wB, sigmaA, sigmaB, rhoAB);
  return isNaN(v) || v < 0 ? NaN : Math.sqrt(v);
}
