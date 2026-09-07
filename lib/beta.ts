/**
 * Public beta boundary.
 *
 * Accounts are now offered and optional, so this no longer closes the auth
 * routes. Catalog-only lesson records are still withheld below: a route that
 * renders nothing is worse than one that is not advertised.
 *
 * Turning this back on would make /privacy false as written -- that page states
 * there are no accounts and no cookies, and Supabase's session cookie makes the
 * second claim untrue the moment anyone signs in. Change them together.
 */
export const GUEST_ONLY_BETA = false;

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
