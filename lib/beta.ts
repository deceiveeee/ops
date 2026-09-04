/**
 * Public beta boundary.
 *
 * Accounts, the placeholder Studio, and catalog-only lesson records remain in
 * the repository for later work, but they are not part of the product OPS is
 * advertising in this release.
 */
export const GUEST_ONLY_BETA = true;

export const BETA_HIDDEN_LESSON_SLUGS: ReadonlySet<string> = new Set([
  "calls-and-puts",
  "capm-alpha-and-performance",
  "course-integration-map",
  "final-investment-decision-framework",
  "forms-of-market-efficiency",
  "forward-contract-basics",
  "futures-contract-basics",
  "hedging-with-futures",
  "information-and-prices",
  "integrated-security-analysis-case",
  "multiples-and-market-expectations",
  "no-arbitrage-forward-pricing",
  "option-payoffs",
  "option-pricing-intuition",
  "portfolio-studio-application",
  "put-call-parity",
  "real-options-intuition",
  "risk-and-option-greeks",
] as const);

export function isPublicBetaLesson(slug: string) {
  return !BETA_HIDDEN_LESSON_SLUGS.has(slug);
}
