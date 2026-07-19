/**
 * Portfolio theory calculation utilities.
 * Analytical solutions for GMV, target-return, and tangency portfolios.
 * All inputs/outputs use decimal form internally.
 */

// ===================== Matrix operations =====================

export function inv3x3(m: number[][]): number[][] | null {
  const [a, b, c] = m[0];
  const [d, e, f] = m[1];
  const [g, h, i] = m[2];
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-15) return null;
  const id = 1 / det;
  return [
    [(e * i - f * h) * id, (c * h - b * i) * id, (b * f - c * e) * id],
    [(f * g - d * i) * id, (a * i - c * g) * id, (c * d - a * f) * id],
    [(d * h - e * g) * id, (b * g - a * h) * id, (a * e - b * d) * id],
  ];
}

export function matVec(m: number[][], v: number[]): number[] {
  return m.map((row) => row.reduce((s, val, i) => s + val * v[i], 0));
}

export function matMat(a: number[][], b: number[][]): number[][] {
  const rows = a.length;
  const cols = b[0].length;
  const inner = b.length;
  const r: number[][] = Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0));
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      for (let k = 0; k < inner; k++) r[i][j] += a[i][k] * b[k][j];
  return r;
}

export function transpose(m: number[][]): number[][] {
  return m[0].map((_, i) => m.map((r) => r[i]));
}

// ===================== Basic portfolio calculations =====================

export function portfolioExpectedReturn(weights: number[], expectedReturns: number[]): number {
  if (weights.length !== expectedReturns.length) return NaN;
  return weights.reduce((s, w, i) => s + w * expectedReturns[i], 0);
}

export function portfolioVariance(weights: number[], covarianceMatrix: number[][]): number {
  const n = weights.length;
  if (covarianceMatrix.length !== n || covarianceMatrix[0].length !== n) return NaN;
  let v = 0;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) v += weights[i] * weights[j] * covarianceMatrix[i][j];
  return v;
}

export function portfolioStandardDeviation(weights: number[], covarianceMatrix: number[][]): number {
  const v = portfolioVariance(weights, covarianceMatrix);
  return isNaN(v) || v < 0 ? NaN : Math.sqrt(Math.max(0, v));
}

// ===================== Optimization =====================

export function globalMinVariancePortfolio(covarianceMatrix: number[][]): number[] | null {
  const n = covarianceMatrix.length;
  const ones = Array(n).fill(1);
  const sigInv = inv3x3(covarianceMatrix);
  if (!sigInv) return null;
  const sigInvOnes = matVec(sigInv, ones);
  const denom = ones.reduce((s, _, i) => s + sigInvOnes[i], 0);
  if (Math.abs(denom) < 1e-15) return null;
  return sigInvOnes.map((x) => x / denom);
}

export function minVarianceForTargetReturn(
  covarianceMatrix: number[][],
  expectedReturns: number[],
  targetReturn: number,
): number[] | null {
  const n = covarianceMatrix.length;
  const sigInv = inv3x3(covarianceMatrix);
  if (!sigInv) return null;

  // A = [mu | ones] (n×2)
  const A = expectedReturns.map((mu, i) => [mu, 1]);
  // SigInv * A (n×2)
  const sigInvA = matMat(sigInv, A);
  // A' * SigInv * A (2×2)
  const ATSigInvA = matMat(transpose(A), sigInvA);
  // Invert 2×2
  const [[p, q], [r2, s]] = ATSigInvA;
  const det2 = p * s - q * r2;
  if (Math.abs(det2) < 1e-15) return null;
  const inv2 = [
    [s / det2, -q / det2],
    [-r2 / det2, p / det2],
  ];
  // b = [target, 1]
  const b = [targetReturn, 1];
  // temp = inv2 * b (2-vector)
  const temp = inv2.map((row) => row.reduce((sum, val, i) => sum + val * b[i], 0));
  // w = sigInvA * temp
  return sigInvA.map((row) => row.reduce((sum, val, i) => sum + val * temp[i], 0));
}

export function tangencyPortfolio(
  covarianceMatrix: number[][],
  expectedReturns: number[],
  riskFreeRate: number,
): number[] | null {
  const n = covarianceMatrix.length;
  const ones = Array(n).fill(1);
  const sigInv = inv3x3(covarianceMatrix);
  if (!sigInv) return null;
  const excess = expectedReturns.map((mu) => mu - riskFreeRate);
  const sigInvExcess = matVec(sigInv, excess);
  const denom = ones.reduce((s, _, i) => s + sigInvExcess[i], 0);
  if (Math.abs(denom) < 1e-15) return null;
  return sigInvExcess.map((x) => x / denom);
}

// ===================== Sharpe ratio =====================

export function sharpeRatio(expectedReturn: number, riskFreeRate: number, standardDeviation: number): number {
  if (standardDeviation === 0) return NaN;
  return (expectedReturn - riskFreeRate) / standardDeviation;
}

// ===================== Complete portfolio (risky + risk-free) =====================

export function completePortfolioReturn(
  riskFreeRate: number,
  riskyReturn: number,
  riskyWeight: number,
): number {
  return (1 - riskyWeight) * riskFreeRate + riskyWeight * riskyReturn;
}

export function completePortfolioVolatility(
  riskyVolatility: number,
  riskyWeight: number,
): number {
  return Math.abs(riskyWeight) * riskyVolatility;
}

// ===================== Dominance =====================

export type DominanceResult = "A_dominates" | "B_dominates" | "neither";

export function classifyDominance(
  erA: number, sdA: number, erB: number, sdB: number,
): DominanceResult {
  if (erA >= erB && sdA <= sdB && (erA > erB || sdA < sdB)) return "A_dominates";
  if (erB >= erA && sdB <= sdA && (erB > erA || sdB < sdA)) return "B_dominates";
  return "neither";
}

// ===================== MIT dataset =====================

export const MIT_ASSETS = ["General Motors", "IBM", "Motorola"] as const;

export const MIT_EXPECTED_RETURNS = [0.0108, 0.0132, 0.0175];

export const MIT_COVARIANCE_MATRIX = [
  [0.00388, 0.001613, 0.002243],
  [0.001613, 0.004021, 0.002399],
  [0.002243, 0.002399, 0.009463],
];

export const MIT_RISK_FREE_RATE = 0.0012;
