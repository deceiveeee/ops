"use client";

// Re-export the generic OPS primitives so Investment Foundations lessons
// have a single import surface and stay visually consistent with the
// rest of OPS (Finance Foundations).
export {
  Reveal,
  SectionHeading,
  Panel,
  Feedback,
  DefinitionCard,
  InteractiveFrame,
  TryItTag,
  ConceptTag,
  type ConceptKey,
} from "@/components/lessons/intro-course-overview/shared";
export { InlineMath, BlockMath } from "@/components/ui/Math";
export {
  default as MasteryCheck,
  type MasteryQuestion,
} from "@/components/lessons/present-value-relations/MasteryCheck";

export const IF_1_1_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Missions 1-2 · Lesson 1.1 — Philosophy Before Strategy",
  instructor: "Adapted from Aswath Damodaran, Investment Philosophies (Session 1)",
  note: "Adapted from Damodaran's distinction between investment philosophy and strategy, and his argument for beginning with a defensible view of how markets work. Examples, interactions, and wording are original OPS implementations. No live market data.",
} as const;

export const IF_1_2_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Missions 1-2 · Lesson 1.2 — Where Philosophy Enters the Process",
  instructor: "Adapted from Aswath Damodaran, Investment Philosophies (Session 1)",
  note: "Adapted from Damodaran's framing of the investment process and the stages where different philosophies seek an advantage. Examples, interactions, and wording are original OPS implementations. No live market data.",
} as const;

export const IF_1_3_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Missions 1-2 · Lesson 1.3 — Six Ways Investors Claim an Edge",
  instructor: "Adapted from Aswath Damodaran, Investment Philosophies (Session 1)",
  note: "Adapted from Damodaran's overview of investment-philosophy families and the market beliefs, decision stages, and implementation challenges associated with them. Examples, interactions, and wording are original OPS implementations. No live market data.",
} as const;

export const IF_1_4_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Missions 1-2 · Lesson 1.4 — When a Philosophy Fits the Investor",
  instructor: "Adapted from Aswath Damodaran, Investment Philosophies (Session 1)",
  note: "Adapted from Damodaran's discussion of investor risk preference, time horizon, tax status, wealth, liquidity, and resources as constraints on investment-philosophy choice. Examples, interactions, and wording are original OPS implementations. No live market data.",
} as const;

const IF_MODULE_2_SOURCE_NOTE =
  "Source-authentic claims and verified calculations follow Damodaran's 38-webcast Investment Philosophies course, Session 2 of 38: Understanding Risk I — The risk in bonds. The scholarship-fund case, interactions, and guide dialogue are original OPS pedagogy. Historical 2013 spreads and rating thresholds are dated wherever used; no live market data.";

export const IF_2_1_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 3 · Lesson 2.1 — Reading a Bond’s Promise",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 2 of 38)",
  note: IF_MODULE_2_SOURCE_NOTE,
} as const;

export const IF_2_2_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 3 · Lesson 2.2 — Why Market Rates Change Bond Prices",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 2 of 38)",
  note: IF_MODULE_2_SOURCE_NOTE,
} as const;

export const IF_2_3_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 3 · Lesson 2.3 — Duration",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 2 of 38)",
  note: IF_MODULE_2_SOURCE_NOTE,
} as const;

export const IF_2_4_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 3 · Lesson 2.4 — Default Risk",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 2 of 38)",
  note: IF_MODULE_2_SOURCE_NOTE,
} as const;

export const IF_2_5_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 3 · Lesson 2.5 — From Credit Rating to Bond Price",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 2 of 38)",
  note: IF_MODULE_2_SOURCE_NOTE,
} as const;

const IF_MODULE_3_SOURCE_NOTE =
  "Source-authentic claims follow Damodaran's 38-webcast Investment Philosophies course, Session 3 of 38: Understanding Risk II — The risk in stocks. All 18 slides, the complete official caption track, and the test and solutions were audited. OPS corrects the source's false Chinese-character etymology, uses the slide's weekly regression frequency, and rewrites two defective assessment items. The Northstar and scholarship-fund interactions are original OPS pedagogy; no live market data.";

export const IF_3_1_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 4 · Lesson 3.1 — What Risk Means for a Shareholder",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 3 of 38)",
  note: IF_MODULE_3_SOURCE_NOTE,
} as const;

export const IF_3_2_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 4 · Lesson 3.2 — Why Diversification Changes the Question",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 3 of 38)",
  note: IF_MODULE_3_SOURCE_NOTE,
} as const;

export const IF_3_3_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 4 · Lesson 3.3 — What Beta Measures",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 3 of 38)",
  note: IF_MODULE_3_SOURCE_NOTE,
} as const;

export const IF_3_4_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 4 · Lesson 3.4 — What Makes Beta Rise or Fall",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 3 of 38)",
  note: IF_MODULE_3_SOURCE_NOTE,
} as const;

export const IF_3_5_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 4 · Lesson 3.5 — Choosing a Risk Measure",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 3 of 38)",
  note: IF_MODULE_3_SOURCE_NOTE,
} as const;

export const IF_3_6_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 4 · Lesson 3.6 — Build an Equity Risk Policy",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 3 of 38)",
  note: IF_MODULE_3_SOURCE_NOTE,
} as const;

const IF_MODULE_4_SOURCE_NOTE =
  "Source-authentic claims follow Damodaran's 38-webcast Investment Philosophies course, Session 4 of 38: Financial Statement Analysis. All 18 slides, the complete official caption track, and the test and solutions were audited. OPS updates the source-era treatment of leases and extraordinary items, distinguishes US GAAP from IFRS R&D treatment, and labels every financial-statement recast as analyst work rather than reported accounting. The Cedar Works filing and all interactions are original OPS pedagogy; no live market data.";

export const IF_4_1_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 6 · Lesson 4.1 — The Three Statements",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 4 of 38)",
  note: IF_MODULE_4_SOURCE_NOTE,
} as const;

export const IF_4_2_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 6 · Lesson 4.2 — Read the Balance Sheet",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 4 of 38)",
  note: IF_MODULE_4_SOURCE_NOTE,
} as const;

export const IF_4_3_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 6 · Lesson 4.3 — Recast the Business",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 4 of 38)",
  note: IF_MODULE_4_SOURCE_NOTE,
} as const;

export const IF_4_4_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 6 · Lesson 4.4 — Read Profit and Leverage",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 4 of 38)",
  note: IF_MODULE_4_SOURCE_NOTE,
} as const;

export const IF_4_5_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 6 · Lesson 4.5 — Repair the Investor View",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 4 of 38)",
  note: IF_MODULE_4_SOURCE_NOTE,
} as const;

export const IF_4_6_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 6 · Lesson 4.6 — Trace Cash to the Investor",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 4 of 38)",
  note: IF_MODULE_4_SOURCE_NOTE,
} as const;

export const IF_5_1_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 7 · Estimate a Valuation Range",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 5 of 38)",
  note: "Source-authentic claims follow the official Session 5 slide deck, complete valuation narration, and test/solutions. The official Session 5 and Session 6 YouTube uploads are swapped: OPS audited the valuation content in video FNF3ncQgABk. OPS also repairs test item 1, whose negative stem conflicts with its answer explanation. The 8%/10%/12% growth-quality comparison, $1.1b observed price, range, and decision buffer are labeled OPS adaptations; no live market data.",
} as const;

export const IF_6_1_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 8 · Count the Friction",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 6 of 38)",
  note: "Source-authentic claims follow the official Session 6 slide deck (23 pages), the complete trading-costs narration, and the test/solutions. The official Session 5 and Session 6 uploads are swapped: OPS audited the trading-costs narration in video bUJUGsDQ16w. OPS repairs two test-versus-solution mismatches — item 1's option (f) reads \"lots of analysts\" in the test but \"few\" in the solution, and item 4's options (c) and (d) differ between the two. The 12.22% hurdle is recomputed independently from the source's own worked example. Turnover and holding-period figures are illustrative; current US tax rules are handled in mission 13. No live market data.",
} as const;

export const IF_SOURCE_BASIS = IF_1_1_SOURCE_BASIS;
export type IFSourceBasis = {
  course: string;
  lecture: string;
  instructor: string;
  note: string;
};

export const IF_MODULE_1_LESSONS = [
  {
    slug: "if-1-1-how-an-investor-builds-a-philosophy",
    title: "Philosophy Before Strategy",
    shortTitle: "Philosophy Before Strategy",
    n: 1,
  },
  {
    slug: "if-1-2-where-philosophy-enters-the-investment-process",
    title: "Where Philosophy Enters the Process",
    shortTitle: "Where Philosophy Enters",
    n: 2,
  },
  {
    slug: "if-1-3-comparing-investment-philosophy-families",
    title: "Six Ways Investors Claim an Edge",
    shortTitle: "Six Ways Investors Claim an Edge",
    n: 3,
  },
  {
    slug: "if-1-4-when-a-philosophy-fits-the-investor",
    title: "When a Philosophy Fits the Investor",
    shortTitle: "Investor–Philosophy Fit",
    n: 4,
  },
] as const;

export const IF_MODULE_LESSONS = IF_MODULE_1_LESSONS;

export const IF_MODULE_2_LESSONS = [
  {
    slug: "if-2-1-reading-a-bonds-promise",
    title: "Reading a Bond’s Promise",
    shortTitle: "Reading the Promise",
    n: "2.1",
  },
  {
    slug: "if-2-2-why-market-rates-change-bond-prices",
    title: "Why Market Rates Change Bond Prices",
    shortTitle: "Rates and Bond Prices",
    n: "2.2",
  },
  {
    slug: "if-2-3-duration-measuring-interest-rate-sensitivity",
    title: "Duration: Measuring Interest-Rate Sensitivity",
    shortTitle: "Measuring Duration",
    n: "2.3",
  },
  {
    slug: "if-2-4-default-risk-can-the-issuer-deliver",
    title: "Default Risk: Can the Issuer Deliver?",
    shortTitle: "Default Risk",
    n: "2.4",
  },
  {
    slug: "if-2-5-from-credit-rating-to-bond-price",
    title: "From Credit Rating to Bond Price",
    shortTitle: "Rating to Price",
    n: "2.5",
  },
] as const;

export const IF_MODULE_3_LESSONS = [
  {
    slug: "if-3-1-what-risk-means-for-a-shareholder",
    title: "What Risk Means for a Shareholder",
    shortTitle: "Shareholder Risk",
    n: "3.1",
  },
  {
    slug: "if-3-2-why-diversification-changes-the-question",
    title: "Why Diversification Changes the Question",
    shortTitle: "Diversification",
    n: "3.2",
  },
  {
    slug: "if-3-3-what-beta-measures",
    title: "What Beta Measures",
    shortTitle: "What Beta Measures",
    n: "3.3",
  },
  {
    slug: "if-3-4-what-makes-beta-rise-or-fall",
    title: "What Makes Beta Rise or Fall",
    shortTitle: "Beta Drivers",
    n: "3.4",
  },
  {
    slug: "if-3-5-choosing-a-risk-measure",
    title: "Choosing a Risk Measure",
    shortTitle: "Risk Measures",
    n: "3.5",
  },
  {
    slug: "if-3-6-build-an-equity-risk-policy",
    title: "Build an Equity Risk Policy",
    shortTitle: "Equity Risk Policy",
    n: "3.6",
  },
] as const;

export const IF_MODULE_4_LESSONS = [
  {
    slug: "if-4-1-the-three-financial-statements",
    title: "The Three Financial Statements",
    shortTitle: "Three Statements",
    n: "4.1",
  },
  {
    slug: "if-4-2-read-the-balance-sheet",
    title: "Read the Balance Sheet",
    shortTitle: "Balance-Sheet X-ray",
    n: "4.2",
  },
  {
    slug: "if-4-3-recast-the-business",
    title: "Recast the Business",
    shortTitle: "Financial Balance Sheet",
    n: "4.3",
  },
  {
    slug: "if-4-4-read-profit-and-leverage",
    title: "Read Profit and Leverage",
    shortTitle: "Profit and Leverage",
    n: "4.4",
  },
  {
    slug: "if-4-5-repair-the-investor-view",
    title: "Repair the Investor View",
    shortTitle: "Analyst Adjustments",
    n: "4.5",
  },
  {
    slug: "if-4-6-trace-cash-to-the-investor",
    title: "Trace Cash to the Investor",
    shortTitle: "Cash to Investors",
    n: "4.6",
  },
] as const;

export const IF_MODULE_5_LESSONS = [
  {
    slug: "if-5-1-estimate-a-valuation-range",
    title: "Estimate a Valuation Range",
    shortTitle: "Valuation Range",
    n: "5.1",
  },
] as const;

export const IF_MODULE_6_LESSONS = [
  {
    slug: "if-6-1-count-the-friction",
    title: "Count the Friction",
    shortTitle: "Count the Friction",
    n: "6.1",
  },
] as const;

export const IF_LEARNING_OBJECTIVES = [
  "Distinguish a market belief, an investment philosophy, a strategy, and an individual trade.",
  "Connect evidence to a market belief and then to a strategy that logically follows from it.",
  "Explain why recent performance alone is not a sound reason to adopt or abandon a strategy.",
  "Write one provisional market hypothesis that later lessons can test.",
] as const;

/** Course-accent color used across IF components (amber = research lens). */
export const IF_ACCENT = "amber" as const;
