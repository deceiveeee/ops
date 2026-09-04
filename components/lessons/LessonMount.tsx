"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Loads one lesson's component, and only that one.
 *
 * This map used to live in lib/lessonRegistry.ts as 75 eager imports, so
 * every lesson page carried every lesson: one 3.7 MB chunk, 1.11 MB over the
 * wire, to render a single page. Making those imports lazy there was not
 * enough — next/dynamic inside a Server Component still resolves to a plain
 * client reference, so all 75 stayed in the route's chunk group. The loaders
 * have to sit inside a Client Component for the import() to become a real
 * webpack boundary, which is what this file is for.
 *
 * Keep the entries as literal inline import() calls. Building the path from
 * the slug would defeat webpack's static analysis and re-merge the lot.
 */
const lessonLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  "what-is-finance-value-time-risk": () =>
    import("@/components/lessons/intro-course-overview/Lesson1"),
  "price-discovery-and-accounting-language": () =>
    import("@/components/lessons/intro-course-overview/Lesson2"),
  "corporate-and-personal-financial-systems": () =>
    import("@/components/lessons/intro-course-overview/Lesson3"),
  "time-risk-and-financial-principles": () =>
    import("@/components/lessons/intro-course-overview/Lesson4"),
  "finance-roadmap-and-personal-application": () =>
    import("@/components/lessons/intro-course-overview/Lesson5"),
  "present-value-cashflows-assets-npv": () =>
    import("@/components/lessons/present-value-relations/Lesson1"),
  "present-value-perpetuities-annuities-compounding": () =>
    import("@/components/lessons/present-value-relations/Lesson2"),
  "present-value-inflation-real-nominal": () =>
    import("@/components/lessons/present-value-relations/Lesson3"),
  "present-value-cfo-decision-room": () =>
    import("@/components/lessons/present-value-relations/Lesson4"),
  "fixed-income-bond-markets-cash-flows-discount-bonds": () =>
    import("@/components/lessons/fixed-income-securities/Lesson3_1"),
  "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds": () =>
    import("@/components/lessons/fixed-income-securities/Lesson3_2"),
  "fixed-income-law-one-price-arbitrage-duration-convexity": () =>
    import("@/components/lessons/fixed-income-securities/Lesson3_3"),
  "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization": () =>
    import("@/components/lessons/fixed-income-securities/Lesson3_4"),
  "equity-what-does-owning-a-stock-mean": () => import("@/components/lessons/equities/Lesson4_1"),
  "equity-why-does-a-stock-have-value-today": () =>
    import("@/components/lessons/equities/Lesson4_2"),
  "equity-gordon-growth-model": () => import("@/components/lessons/equities/Lesson4_3"),
  "equity-multi-stage-growth-valuation": () => import("@/components/lessons/equities/Lesson4_4"),
  "equity-earnings-dividend-growth": () => import("@/components/lessons/equities/Lesson4_5"),
  "equity-growth-opportunities-pvgo-pe": () => import("@/components/lessons/equities/Lesson4_6"),
  "equity-valuation-case-lab": () => import("@/components/lessons/equities/Lesson4_7"),
  "risk-return-what-they-mean": () => import("@/components/lessons/risk-and-return/Lesson5_1"),
  "risk-measuring-historical-return-volatility": () =>
    import("@/components/lessons/risk-and-return/Lesson5_2"),
  "risk-covariance-correlation-diversification": () =>
    import("@/components/lessons/risk-and-return/Lesson5_3"),
  "risk-systematic-idiosyncratic-beta": () =>
    import("@/components/lessons/risk-and-return/Lesson5_4"),
  "risk-empirical-properties-stock-returns": () =>
    import("@/components/lessons/risk-and-return/Lesson5_5"),
  "risk-portfolio-risk-lab": () => import("@/components/lessons/risk-and-return/Lesson5_6"),
  "portfolio-weights-returns": () => import("@/components/lessons/portfolio-theory/Lesson6_1"),
  "portfolio-risk-covariance-correlation": () =>
    import("@/components/lessons/portfolio-theory/Lesson6_2"),
  "portfolio-diversification-many-assets": () =>
    import("@/components/lessons/portfolio-theory/Lesson6_3"),
  "portfolio-efficient-frontier": () => import("@/components/lessons/portfolio-theory/Lesson6_4"),
  "portfolio-risk-free-tangency-sharpe": () =>
    import("@/components/lessons/portfolio-theory/Lesson6_5"),
  "capm-tangency-becomes-market-portfolio": () =>
    import("@/components/lessons/the-capm-and-apt/Lesson7_1"),
  "security-market-line": () => import("@/components/lessons/the-capm-and-apt/Lesson7_3"),
  "capm-estimating-beta": () => import("@/components/lessons/the-capm-and-apt/Lesson7_4"),
  "capm-apt-in-practice": () => import("@/components/lessons/the-capm-and-apt/Lesson7_7"),
  "required-return-to-discount-rate": () =>
    import("@/components/lessons/capital-budgeting/Lesson8_1"),
  "determining-the-discount-rate": () => import("@/components/lessons/capital-budgeting/Lesson8_2"),
  "when-risk-changes-over-time": () => import("@/components/lessons/capital-budgeting/Lesson8_3"),
  "npv-rule": () => import("@/components/lessons/capital-budgeting/Lesson8_4"),
  "irr-and-payback": () => import("@/components/lessons/capital-budgeting/Lesson8_5"),
  "project-cash-flows": () => import("@/components/lessons/capital-budgeting/Lesson8_6"),
  "sensitivity-and-scenario-analysis": () =>
    import("@/components/lessons/capital-budgeting/Lesson8_7"),
  "efficient-market-hypothesis": () => import("@/components/lessons/efficient-markets/Lesson9_1"),
  "active-vs-passive-investing": () => import("@/components/lessons/efficient-markets/Lesson9_2"),
  "anomalies-and-limits-to-arbitrage": () =>
    import("@/components/lessons/efficient-markets/Lesson9_3"),
  "building-investment-philosophy": () =>
    import("@/components/lessons/efficient-markets/Lesson9_4"),
  "if-1-1-how-an-investor-builds-a-philosophy": () =>
    import("@/components/lessons/investment-foundations/LessonIF_1_1"),
  "if-1-2-where-philosophy-enters-the-investment-process": () =>
    import("@/components/lessons/investment-foundations/LessonIF_1_2"),
  "if-1-3-comparing-investment-philosophy-families": () =>
    import("@/components/lessons/investment-foundations/LessonIF_1_3"),
  "if-1-4-when-a-philosophy-fits-the-investor": () =>
    import("@/components/lessons/investment-foundations/LessonIF_1_4"),
  "if-2-1-reading-a-bonds-promise": () =>
    import("@/components/lessons/investment-foundations/LessonIF_2_1"),
  "if-2-2-why-market-rates-change-bond-prices": () =>
    import("@/components/lessons/investment-foundations/LessonIF_2_2"),
  "if-2-3-duration-measuring-interest-rate-sensitivity": () =>
    import("@/components/lessons/investment-foundations/LessonIF_2_3"),
  "if-2-4-default-risk-can-the-issuer-deliver": () =>
    import("@/components/lessons/investment-foundations/LessonIF_2_4"),
  "if-2-5-from-credit-rating-to-bond-price": () =>
    import("@/components/lessons/investment-foundations/LessonIF_2_5"),
  "if-3-1-what-risk-means-for-a-shareholder": () =>
    import("@/components/lessons/investment-foundations/LessonIF_3_1"),
  "if-3-2-why-diversification-changes-the-question": () =>
    import("@/components/lessons/investment-foundations/LessonIF_3_2"),
  "if-3-3-what-beta-measures": () =>
    import("@/components/lessons/investment-foundations/LessonIF_3_3"),
  "if-3-4-what-makes-beta-rise-or-fall": () =>
    import("@/components/lessons/investment-foundations/LessonIF_3_4"),
  "if-3-5-choosing-a-risk-measure": () =>
    import("@/components/lessons/investment-foundations/LessonIF_3_5"),
  "if-3-6-build-an-equity-risk-policy": () =>
    import("@/components/lessons/investment-foundations/LessonIF_3_6"),
  "if-pb-05-set-allocation-and-risk-limits": () =>
    import("@/components/lessons/investment-foundations/LessonIF_PB_05"),
  "if-4-1-the-three-financial-statements": () =>
    import("@/components/lessons/investment-foundations/LessonIF_4_1"),
  "if-4-2-read-the-balance-sheet": () =>
    import("@/components/lessons/investment-foundations/LessonIF_4_2"),
  "if-4-3-recast-the-business": () =>
    import("@/components/lessons/investment-foundations/LessonIF_4_3"),
  "if-4-4-read-profit-and-leverage": () =>
    import("@/components/lessons/investment-foundations/LessonIF_4_4"),
  "if-4-5-repair-the-investor-view": () =>
    import("@/components/lessons/investment-foundations/LessonIF_4_5"),
  "if-4-6-trace-cash-to-the-investor": () =>
    import("@/components/lessons/investment-foundations/LessonIF_4_6"),
  "if-5-1-estimate-a-valuation-range": () =>
    import("@/components/lessons/investment-foundations/LessonIF_5_1"),
  "if-6-1-count-the-friction": () =>
    import("@/components/lessons/investment-foundations/LessonIF_6_1"),
  "if-7-1-test-the-claim": () => import("@/components/lessons/investment-foundations/LessonIF_7_1"),
  "if-8-1-choose-passive-or-prove-an-edge": () =>
    import("@/components/lessons/investment-foundations/LessonIF_8_1"),
  "if-pb-11-set-a-market-timing-policy": () =>
    import("@/components/lessons/investment-foundations/LessonIF_PB_11"),
  "if-pb-12-choose-the-actual-holdings": () =>
    import("@/components/lessons/investment-foundations/LessonIF_PB_12"),
  "if-pb-13-write-the-rules-and-defend-the-portfolio": () =>
    import("@/components/lessons/investment-foundations/LessonIF_PB_13"),
};

/** Exported for the test that keeps this in step with INTERACTIVE_LESSON_SLUGS. */
export const LOADER_SLUGS: readonly string[] = Object.keys(lessonLoaders);

/**
 * dynamic() returns a new component on every call and a new component type
 * remounts its subtree, so each slug keeps one identity.
 */
const resolved = new Map<string, ComponentType>();

function lessonComponent(slug: string): ComponentType | undefined {
  const loader = lessonLoaders[slug];
  if (!loader) return undefined;
  const cached = resolved.get(slug);
  if (cached) return cached;
  const component = dynamic(loader);
  resolved.set(slug, component);
  return component;
}

export default function LessonMount({ slug }: { slug: string }) {
  const Lesson = lessonComponent(slug);
  if (!Lesson) return null;
  return <Lesson />;
}
