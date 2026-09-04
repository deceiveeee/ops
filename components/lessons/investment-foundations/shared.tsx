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
  lecture: "Mission 2 · Lesson 1.1 — Observe the Market First",
  instructor: "Adapted from Aswath Damodaran, Investment Philosophies (Session 1)",
  note: "Adapted from Damodaran's distinction between investment philosophy and strategy, and his argument for beginning with a defensible view of how markets work. Examples, interactions, and wording are original OPS implementations. No live market data.",
} as const;

export const IF_1_2_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 1 · Lesson 1.2 — Where Philosophy Enters the Process",
  instructor: "Adapted from Aswath Damodaran, Investment Philosophies (Session 1)",
  note: "Adapted from Damodaran's framing of the investment process and the stages where different philosophies seek an advantage. Examples, interactions, and wording are original OPS implementations. No live market data.",
} as const;

export const IF_1_3_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Optional lab · Lesson 1.3 — Six Ways Investors Claim an Edge",
  instructor: "Adapted from Aswath Damodaran, Investment Philosophies (Session 1)",
  note: "Adapted from Damodaran's overview of investment-philosophy families and the market beliefs, decision stages, and implementation challenges associated with them. Examples, interactions, and wording are original OPS implementations. No live market data.",
} as const;

export const IF_1_4_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 1 · Lesson 1.4 — When a Philosophy Fits the Investor",
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

export const IF_PB_05_SOURCE_BASIS = {
  course: "Portfolio Builder",
  lecture: "Mission 5 · Set Allocation and Risk Limits",
  instructor:
    "Damodaran Sessions 1, 2, 3, and 30; SEC/Investor.gov and CFPB guidance; Vanguard provider framework",
  note: "Gate A reviewed every locked deck, caption track, quiz, regulator page, and the complete 32-page Vanguard principles artifact. Source-authentic relationships stop at investor-first planning, capacity versus willingness, broad asset roles, diversification limits, and strategic allocation. Ready / Steady / Grow, all cases, stress losses, target ranges, loss budgets, and candidate ceilings are visibly labelled OPS or learner policy. They are not forecasts, recommendations, guarantees, or regulator limits. No live market data or optimizer output.",
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
  note: "Source-authentic claims follow the official Session 6 slide deck (22 pages), the complete trading-costs narration, and the test/solutions. The official Session 5 and Session 6 uploads are swapped: OPS audited the trading-costs narration in video bUJUGsDQ16w. OPS repairs two test-versus-solution mismatches — item 1's option (f) reads \"lots of analysts\" in the test but \"few\" in the solution, and item 4's options (c) and (d) differ between the two. Damodaran publishes a 12.22% hurdle approximation; OPS independently recalculates the exact bid/ask treatment as about 12.24% and labels the difference. Friction Budget percentages are illustrative OPS scenario assumptions, not measured account costs or forecasts; current US tax rules are handled in mission 13. No live market data.",
} as const;

export const IF_7_1_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 9 · Lesson 7.1 — Test the Claim",
  instructor: "Aswath Damodaran, Investment Philosophies (Session 8 of 38)",
  note: "Source-authentic claims and verified calculations follow Damodaran's 38-webcast Investment Philosophies course, Session 8 of 38: Market Efficiency II — testing market-beating schemes and strategies. William F. Sharpe's official Stanford article, The Sharpe Ratio (1994), controls the modern methodology: OPS uses (return minus risk-free rate) divided by standard deviation, with a clearly labelled 3% illustrative risk-free rate, rather than reproducing the session quiz's omission. The checklist, interactions, and guide dialogue are original OPS pedagogy. The option-listing and low-PE studies are dated historical evidence and are labelled as such; no live market data.",
} as const;

export const IF_8_1_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 10 · Lesson 8.1 — Choose Passive, or Prove an Edge",
  instructor:
    "Aswath Damodaran, Investment Philosophies (Sessions 35, 36, 7, 8 and 6 of 38)",
  note: "Source-authentic mechanisms follow Damodaran Sessions 35 and 36 (the active-investor record, the persistence question, and the named channels through which active management leaks return), Session 7 (market efficiency and what an edge requires), Session 8 (fair test design) and Session 6 (trading friction). The current active/passive base rate is Morningstar Manager Research, US Active/Passive Barometer, June 2026, with data through 30 June 2026: figures are dated, carry their denominator and survivorship handling, and describe success only against the average investable passive peer. Damodaran's own historical performance percentages are not reused as current evidence. Fee-quintile differences are reported as association, not causation. Current manager-persistence evidence is deliberately out of scope by approved narrowing on 2026-08-14 — the canonical S&P Dow Jones Indices Persistence Scorecard could not be cached, so this lesson teaches persistence as a test against a 25% no-continuity null rather than citing any current persistence result. The Edge Licence, switchboard and all interactions are original OPS pedagogy and are not attributed to any source. Nothing here is investment advice, and no live market data is used.",
} as const;

export const IF_SOURCE_BASIS = IF_1_1_SOURCE_BASIS;
export type IFSourceBasis = {
  course: string;
  lecture: string;
  instructor: string;
  note: string;
};

/**
 * Missions 1 and 2, kept apart.
 *
 * These four lessons were one group labelled "Missions 1-2", so the rail sent
 * both missions to the same place and clicking either one landed the learner in
 * the same four-lesson list. They are separate decisions: Mission 1 asks who the
 * portfolio is for, Mission 2 asks what can be observed about markets. The
 * course data has always split them - MANDATE_CORE is 1.2 and 1.4, BELIEF_CORE
 * is 1.1 - and only the presentation had them merged.
 *
 * 1.3 is neither. The retrofit plan moved it out of the required opening to the
 * optional catalogue beside Mission 10, and `portfolioBuilder.ts` lists it as a
 * depth lab; the page was the last place still claiming it as mission work.
 */
export const IF_MISSION_1_LESSONS = [
  {
    slug: "if-1-2-where-philosophy-enters-the-investment-process",
    title: "Where Philosophy Enters the Process",
    shortTitle: "Where Philosophy Enters",
    n: 1,
  },
  {
    slug: "if-1-4-when-a-philosophy-fits-the-investor",
    title: "When a Philosophy Fits the Investor",
    shortTitle: "Investor–Philosophy Fit",
    n: 2,
  },
] as const;

export const IF_MISSION_2_LESSONS = [
  {
    slug: "if-1-1-how-an-investor-builds-a-philosophy",
    title: "Observe the Market First",
    shortTitle: "Observe the Market First",
    n: 1,
  },
] as const;

export const IF_EDGE_FAMILIES_LESSONS = [
  {
    slug: "if-1-3-comparing-investment-philosophy-families",
    title: "Six Ways Investors Claim an Edge",
    shortTitle: "Six Ways Investors Claim an Edge",
    n: 1,
  },
] as const;

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

export const IF_MODULE_PB5_LESSONS = [
  {
    slug: "if-pb-05-set-allocation-and-risk-limits",
    title: "Set Allocation and Risk Limits",
    shortTitle: "Allocation Policy",
    n: "5",
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

export const IF_MODULE_7_LESSONS = [
  {
    slug: "if-7-1-test-the-claim",
    title: "Test the Claim",
    shortTitle: "Test the Claim",
    n: "7.1",
  },
] as const;

export const IF_MODULE_8_LESSONS = [
  {
    slug: "if-8-1-choose-passive-or-prove-an-edge",
    title: "Choose Passive, or Prove an Edge",
    shortTitle: "Passive or Edge",
    n: "8.1",
  },
] as const;

export const IF_MODULE_11_LESSONS = [
  {
    slug: "if-pb-11-set-a-market-timing-policy",
    title: "Set a Market-Timing Policy",
    shortTitle: "Timing Policy",
    n: "11.1",
  },
] as const;

export const IF_LEARNING_OBJECTIVES = [
  "Distinguish a market belief, an investment philosophy, a strategy, and an individual trade.",
  "Connect evidence to a market belief and then to a strategy that logically follows from it.",
  "Explain why recent performance alone is not a sound reason to adopt or abandon a strategy.",
  "Write one provisional market hypothesis that later lessons can test.",
] as const;

export const IF_PB_11_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 11 · Lesson 11.1 — Set a Market-Timing Policy",
  instructor:
    "Aswath Damodaran, Investment Philosophies (Sessions 30, 32, 33 and 34 of 38)",
  note: "Source-authentic claims follow Damodaran Sessions 30 (the payoff and the cost of market timing), 32 (mean reversion and macro fundamentals), 33 (valuing the market) and 34 (whether timing works). The break-even bar is Sharpe's 1975 seven-in-ten and the Chua, Woodward and To 70–80% figure, both from Session 30. The newsletter evidence is Campbell and Harvey (1996), 237 newsletters over 1980–1992. Session 32 has no official caption track, so its narration was not reviewed and every Session 32 claim here rests on canonical slides alone; the two macro tables state year counts but no start or end date, and are labelled accordingly. Damodaran's caveat on his own tactical-fund comparison — that it covers one period — is carried. The 5–10% speculative sleeve mentioned only in Session 34 narration is deliberately not offered, at any size, because it is conditional on a hit rate the same course shows is very hard to reach. The Missing-Time Timeline path is illustrative and original OPS pedagogy: it is not historical data, not any real index, and not a forecast. Nothing here is investment advice, no live market data is used, and no personal tax liability is calculated. Full audit: docs/source-audits/mission-11-timing.md.",
} as const;

export const IF_MODULE_12_LESSONS = [
  {
    slug: "if-pb-12-choose-the-actual-holdings",
    title: "Choose the Actual Holdings",
    shortTitle: "Holdings List",
    n: "12.1",
  },
] as const;

export const IF_PB_12_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 12 · Lesson 12.1 — Choose the Actual Holdings",
  instructor:
    "Aswath Damodaran, Investment Philosophies (Session 37 of 38); SEC EDGAR filings; SEC Form N-1A",
  note: "Damodaran Session 37 supplies the passive-product taxonomy only — classic index funds, enhanced index funds and exchange-traded funds — and is treated as a source-era framework rather than a current product guide: its data ends in 2010, its examples are SPDRs and the Wilshire 5000, and its claim that ETFs cost slightly more than index funds is falsified by the current filings this mission uses, so it is not repeated. Session 37 quiz item 1 is numbered a–d in the test and a–e in the solution; the answer text is unambiguous and OPS cites the text, not the letter. Session 37's own quiz supplies the standard applied to tracking: a good index fund is one that tracks its index, not one that beats it. Every product figure comes from that product's own current SEC filing, retrieved 2026-08-16 and named on the page — Vanguard Total Stock Market Index Fund ETF Shares (VTI) and Vanguard 500 Index Fund ETF Shares (VOO) from 497K accessions 0000036405-26-000197 and 0000036405-26-000183; iShares Core U.S. Aggregate Bond ETF (AGG) and iShares 0-3 Month Treasury Bond ETF (SGOV) from 497K accessions 0001193125-26-287958 and 0001193125-26-287938; holdings from N-PORT accessions 0000036405-26-000323, 0000036405-26-000325, 0001410368-26-075254 and 0002071691-26-016719. The share-class table is read from the SGML header of 485BPOS accession 0000036405-26-000181. The portfolio-turnover exclusion is Form N-1A Item 3 instruction (d)(ii). Quarterly N-PORT data is not live holdings: every as-of date and its age at retrieval is shown, and because the two sponsors file on different fiscal calendars, no cross-sponsor overlap figure comes from a single snapshot. Reported position weights sum to 100.25%, 100.14%, 101.88% and 108.82% and are never normalised. Overlap is keyed on legal-entity identifier with a CUSIP fallback, and the share of each fund that could not be keyed is disclosed; one CUSIP in the slate is filed under three names and two LEIs, so the limits of both keys are shown rather than hidden. No filing in this slate publishes a bid-ask spread or premium/discount figure, so those fields stay qualitative. The four products are worked examples of a category, chosen for verification and overlap teaching value and deliberately spread across two sponsors. Nothing here ranks, scores or recommends a fund; no order is ever transmitted; no brokerage is contacted; no credential is requested; and no personal tax liability is calculated. Full audit: docs/source-audits/mission-12-holdings.md.",
} as const;

export const IF_MODULE_13_LESSONS = [
  {
    slug: "if-pb-13-write-the-rules-and-defend-the-portfolio",
    title: "Write the Rules and Defend the Portfolio",
    shortTitle: "Operating Plan",
    n: "13.1",
  },
] as const;

export const IF_PB_13_SOURCE_BASIS = {
  course: "Investment Foundations",
  lecture: "Mission 13 · Lesson 13.1 — Write the Rules and Defend the Portfolio",
  instructor:
    "Aswath Damodaran, Investment Philosophies (Sessions 1, 6, 36 and 38 of 38); CFA Institute; SEC / Investor.gov",
  note: "Source-authentic claims follow Damodaran Sessions 1 (the investment process and why a philosophy is what you return to when strategies stop working), 6 (trading costs and how to manage taxes), 36 (why active managers fail, and that activity generates negative returns) and 38 (the self-assessment, the sleep, life-change and second-guessing tests, and the rule against mixing strategies with contradictory assumptions). All four carry official caption tracks. The IPS skeleton is CFA Institute's Elements of an Investment Policy Statement for Individual Investors, May 2010, cited for structure only — it specifies elements, not rates, so its age does not date it; its governance section assumes an institution and OPS states the adaptation for a solo investor on the page rather than dropping it silently. Rebalancing method and trigger types are the SEC's Beginners' Guide to Asset Allocation, Diversification, and Rebalancing, which gives two trigger types and explicitly leaves the number to the investor; any cadence or band the learner chooses is personal policy and is labelled as such. Order mechanics are the SEC's order-types guidance, including that a stop order becomes a market order once the stop price is reached. Four defects are recorded and handled rather than repeated: Session 36's performance percentages are dated and inherit Mission 10's quarantine, appearing as labelled history or not at all; Session 6's premise that dividends are taxed at a higher rate than capital gains is source-era and is not reproduced, since under current US rules the distinction turns on qualification and holding period; Vanguard's rebalancing research studies target-date funds, frames its benefit as higher returns and omits tax from its cost model, so it is not cited for the rebalancing rule at all; and the cached IRS publications extract with interleaved columns that splice unrelated sentences, so nothing is quoted from them — Publications 550, 590-A and 590-B (2025 editions) are cited by edition as the pointer of record. Tax appears only as directional warnings. Nothing here calculates personal tax liability, recommends account placement, rules on eligibility, ranks or scores a product, or authorizes a trade. Current portfolio weights in the rebalancing control room are an illustration: OPS stores targets and bands, not balances. The 80/100 transfer threshold is an OPS pilot design choice and is not represented as validated. Full audit: docs/source-audits/mission-13-capstone.md.",
} as const;

/** Course-accent color used across IF components (amber = research lens). */
export const IF_ACCENT = "amber" as const;
