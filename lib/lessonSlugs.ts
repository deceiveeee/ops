/**
 * Which lessons have an interactive component, as slugs only.
 *
 * Deliberately free of component imports. Course pages and the progress rail
 * need nothing but this boolean, and when the answer lived beside the loaders
 * every page that asked it pulled the whole lesson bundle in: /courses/[slug]
 * shipped 1.11 MB of First Load JS to decide whether to print "In development".
 *
 * components/lessons/LessonMount.tsx holds the matching loaders. A test asserts
 * the two lists stay identical, because nothing else would notice them drifting.
 */
export const INTERACTIVE_LESSON_SLUGS: readonly string[] = [
  "what-is-finance-value-time-risk",
  "price-discovery-and-accounting-language",
  "corporate-and-personal-financial-systems",
  "time-risk-and-financial-principles",
  "finance-roadmap-and-personal-application",
  "present-value-cashflows-assets-npv",
  "present-value-perpetuities-annuities-compounding",
  "present-value-inflation-real-nominal",
  "present-value-cfo-decision-room",
  "fixed-income-bond-markets-cash-flows-discount-bonds",
  "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
  "fixed-income-law-one-price-arbitrage-duration-convexity",
  "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization",
  "equity-what-does-owning-a-stock-mean",
  "equity-why-does-a-stock-have-value-today",
  "equity-gordon-growth-model",
  "equity-multi-stage-growth-valuation",
  "equity-earnings-dividend-growth",
  "equity-growth-opportunities-pvgo-pe",
  "equity-valuation-case-lab",
  "risk-return-what-they-mean",
  "risk-measuring-historical-return-volatility",
  "risk-covariance-correlation-diversification",
  "risk-systematic-idiosyncratic-beta",
  "risk-empirical-properties-stock-returns",
  "risk-portfolio-risk-lab",
  "portfolio-weights-returns",
  "portfolio-risk-covariance-correlation",
  "portfolio-diversification-many-assets",
  "portfolio-efficient-frontier",
  "portfolio-risk-free-tangency-sharpe",
  "capm-tangency-becomes-market-portfolio",
  "security-market-line",
  "capm-estimating-beta",
  "capm-apt-in-practice",
  "required-return-to-discount-rate",
  "determining-the-discount-rate",
  "when-risk-changes-over-time",
  "npv-rule",
  "irr-and-payback",
  "project-cash-flows",
  "sensitivity-and-scenario-analysis",
  "efficient-market-hypothesis",
  "active-vs-passive-investing",
  "anomalies-and-limits-to-arbitrage",
  "building-investment-philosophy",
  "if-1-1-how-an-investor-builds-a-philosophy",
  "if-1-2-where-philosophy-enters-the-investment-process",
  "if-1-3-comparing-investment-philosophy-families",
  "if-1-4-when-a-philosophy-fits-the-investor",
  "if-2-1-reading-a-bonds-promise",
  "if-2-2-why-market-rates-change-bond-prices",
  "if-2-3-duration-measuring-interest-rate-sensitivity",
  "if-2-4-default-risk-can-the-issuer-deliver",
  "if-2-5-from-credit-rating-to-bond-price",
  "if-3-1-what-risk-means-for-a-shareholder",
  "if-3-2-why-diversification-changes-the-question",
  "if-3-3-what-beta-measures",
  "if-3-4-what-makes-beta-rise-or-fall",
  "if-3-5-choosing-a-risk-measure",
  "if-3-6-build-an-equity-risk-policy",
  "if-pb-05-set-allocation-and-risk-limits",
  "if-4-1-the-three-financial-statements",
  "if-4-2-read-the-balance-sheet",
  "if-4-3-recast-the-business",
  "if-4-4-read-profit-and-leverage",
  "if-4-5-repair-the-investor-view",
  "if-4-6-trace-cash-to-the-investor",
  "if-5-1-estimate-a-valuation-range",
  "if-6-1-count-the-friction",
  "if-7-1-test-the-claim",
  "if-8-1-choose-passive-or-prove-an-edge",
  "if-pb-11-set-a-market-timing-policy",
  "if-pb-12-choose-the-actual-holdings",
  "if-pb-13-write-the-rules-and-defend-the-portfolio",
];

const interactive = new Set(INTERACTIVE_LESSON_SLUGS);

/** Whether an interactive lesson exists for this slug, without loading it. */
export function hasLessonComponent(slug: string): boolean {
  return interactive.has(slug);
}
