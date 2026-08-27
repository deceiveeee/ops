export type CurriculumRequirement = "core" | "lab" | "reference";

export type PortfolioMissionStatus = "available" | "planned";

/**
 * One checkpoint per mission. All checkpoints compile into the persistent
 * Portfolio Workbench and final Dossier. Ids are internal; `label` is what the
 * learner sees.
 * Source of truth for this spine:
 * docs/lesson-plans/portfolio-builder-mission-curriculum.md
 */
export type PortfolioArtifactId =
  | "mandate"
  | "beliefs"
  | "bond-risk"
  | "required-return"
  | "allocation"
  | "evidence"
  | "valuation"
  | "friction"
  | "evidence-test"
  | "architecture"
  | "timing"
  | "holdings"
  | "policy";

export type PortfolioMission = {
  id: string;
  order: number;
  title: string;
  decision: string;
  outcome: string;
  artifactId: PortfolioArtifactId;
  artifactLabel: string;
  targetMinutes: number;
  status: PortfolioMissionStatus;
  startLessonSlug?: string;
  /**
   * Existing lesson completions that earn credit for this mission. These are the
   * keys in `ops-if-completion-v1`, so they must never be renamed: doing so would
   * silently erase saved learner progress.
   */
  legacyCompletionSlugs: string[];
  optionalLabSlugs: string[];
  sourceSessions: number[];
  /**
   * Named when a mission needs a primary source Damodaran does not provide and
   * that source has not been obtained. An open gap blocks the mission, so a
   * mission carrying one must stay `planned`.
   */
  sourceGap?: string;
  /**
   * A source limit that was resolved by narrowing the mission's scope rather
   * than by obtaining the source. The mission is buildable and shippable; the
   * note records what it therefore does not claim.
   *
   * Deliberately separate from `sourceGap`: collapsing the two would either
   * hide the limit or make an unresolved blocker look shippable.
   */
  sourceBoundary?: string;
};

export type PortfolioArtifact = {
  id: PortfolioArtifactId;
  label: string;
  missionIds: string[];
};

export type PortfolioDepthLab = {
  id: string;
  title: string;
  sourceSessions: number[];
  lessonSlugs: string[];
  status: PortfolioMissionStatus;
};

export type PortfolioBuilderPath = {
  id: "portfolio-builder";
  title: string;
  promise: string;
  targetMinutes: number;
  missions: PortfolioMission[];
  artifacts: PortfolioArtifact[];
  depthLabs: PortfolioDepthLab[];
};

const MANDATE_CORE = [
  "if-1-2-where-philosophy-enters-the-investment-process",
  "if-1-4-when-a-philosophy-fits-the-investor",
];

const BELIEF_CORE = ["if-1-1-how-an-investor-builds-a-philosophy"];

const BOND_CORE = [
  "if-2-1-reading-a-bonds-promise",
  "if-2-2-why-market-rates-change-bond-prices",
  "if-2-4-default-risk-can-the-issuer-deliver",
  "if-2-5-from-credit-rating-to-bond-price",
];

const EQUITY_RISK_CORE = [
  "if-3-1-what-risk-means-for-a-shareholder",
  "if-3-2-why-diversification-changes-the-question",
  "if-3-6-build-an-equity-risk-policy",
];

const ALLOCATION_CORE = ["if-pb-05-set-allocation-and-risk-limits"];

const STATEMENT_CORE = [
  "if-4-1-the-three-financial-statements",
  "if-4-2-read-the-balance-sheet",
  "if-4-4-read-profit-and-leverage",
  "if-4-6-trace-cash-to-the-investor",
];

const VALUATION_CORE = ["if-5-1-estimate-a-valuation-range"];

const FRICTION_CORE = ["if-6-1-count-the-friction"];

const EVIDENCE_TEST_CORE = ["if-7-1-test-the-claim"];
const ARCHITECTURE_CORE = ["if-8-1-choose-passive-or-prove-an-edge"];

export const portfolioBuilderPath: PortfolioBuilderPath = {
  id: "portfolio-builder",
  title: "Portfolio Builder",
  promise:
    "Build, explain, and operate a diversified long-term portfolio for a stated goal—or prove the same decisions in a realistic practice case—with written rules for readiness, allocation, security selection, costs, evidence, rebalancing, and mistakes.",
  // Built missions use the real summed lesson time; planned missions carry
  // estimates. The total stays stable as missions move from planned to built.
  targetMinutes: 629,
  artifacts: [
    { id: "mandate", label: "Mandate", missionIds: ["pb-01"] },
    { id: "beliefs", label: "Beliefs", missionIds: ["pb-02"] },
    { id: "bond-risk", label: "Bond risk", missionIds: ["pb-03"] },
    { id: "required-return", label: "Required return", missionIds: ["pb-04"] },
    { id: "allocation", label: "Allocation", missionIds: ["pb-05"] },
    { id: "evidence", label: "Evidence", missionIds: ["pb-06"] },
    { id: "valuation", label: "Value", missionIds: ["pb-07"] },
    { id: "friction", label: "Friction", missionIds: ["pb-08"] },
    { id: "evidence-test", label: "Evidence test", missionIds: ["pb-09"] },
    { id: "architecture", label: "Architecture", missionIds: ["pb-10"] },
    { id: "timing", label: "Timing", missionIds: ["pb-11"] },
    { id: "holdings", label: "Holdings", missionIds: ["pb-12"] },
    { id: "policy", label: "Policy", missionIds: ["pb-13"] },
  ],
  missions: [
    {
      id: "pb-01",
      order: 1,
      title: "Define your investor mandate",
      decision: "Who is this money for, and what could derail the plan?",
      outcome:
        "Choose a personal or practice path, then state the goal, horizon, cash needs, readiness, loss capacity and behavioural limits the portfolio must respect.",
      artifactId: "mandate",
      artifactLabel: "Investor Mandate",
      targetMinutes: 40,
      status: "available",
      startLessonSlug: MANDATE_CORE[0],
      legacyCompletionSlugs: MANDATE_CORE,
      optionalLabSlugs: [],
      sourceSessions: [1, 38],
    },
    {
      id: "pb-02",
      order: 2,
      // Curriculum amendment 1. The mission asked a new learner to originate a
      // market belief before anything had given them grounds for one; it now
      // records what they can observe, and the belief moves to Mission 9 where
      // the evidence method that makes one defensible is taught.
      title: "Observe what markets actually do",
      decision: "What can you observe about markets, and what does it not prove?",
      outcome:
        "Read three dated disclosures before seeing the price, and record one observation you could defend alongside what it does not establish.",
      artifactId: "beliefs",
      artifactLabel: "Market Observation Note",
      targetMinutes: 17,
      status: "available",
      startLessonSlug: BELIEF_CORE[0],
      legacyCompletionSlugs: BELIEF_CORE,
      optionalLabSlugs: ["if-1-3-comparing-investment-philosophy-families"],
      sourceSessions: [1, 7],
    },
    {
      id: "pb-03",
      order: 3,
      title: "Price the risk in a bond",
      decision: "What can a bond do to you, and what would you pay for it?",
      outcome:
        "Separate interest-rate risk from default risk, measure sensitivity with duration, and turn a credit view into a required yield.",
      artifactId: "bond-risk",
      artifactLabel: "Bond Risk Brief",
      targetMinutes: 82,
      status: "available",
      startLessonSlug: BOND_CORE[0],
      legacyCompletionSlugs: BOND_CORE,
      optionalLabSlugs: ["if-2-3-duration-measuring-interest-rate-sensitivity"],
      sourceSessions: [2],
    },
    {
      id: "pb-04",
      order: 4,
      title: "Set your equity risk policy",
      decision: "What can a stock do to you, and what return should you demand?",
      outcome:
        "Define equity risk, read beta with its limits, choose the measures you rely on, and fix a price rule.",
      artifactId: "required-return",
      artifactLabel: "Equity Risk Policy",
      targetMinutes: 70,
      status: "available",
      startLessonSlug: EQUITY_RISK_CORE[0],
      legacyCompletionSlugs: EQUITY_RISK_CORE,
      optionalLabSlugs: [
        "if-3-3-what-beta-measures",
        "if-3-4-what-makes-beta-rise-or-fall",
        "if-3-5-choosing-a-risk-measure",
      ],
      sourceSessions: [3],
    },
    {
      id: "pb-05",
      order: 5,
      title: "Set allocation and risk limits",
      decision: "How much goes where, and what loss is unacceptable?",
      outcome:
        "Use a short portfolio-theory preflight, then set strategic weights, a liquidity bucket and a transparent stress-loss budget without treating a model as a personal answer.",
      artifactId: "allocation",
      artifactLabel: "Allocation and Risk Policy",
      targetMinutes: 45,
      status: "available",
      startLessonSlug: ALLOCATION_CORE[0],
      legacyCompletionSlugs: ALLOCATION_CORE,
      optionalLabSlugs: [],
      sourceSessions: [1, 2, 3, 30],
    },
    {
      id: "pb-06",
      order: 6,
      title: "Read the business evidence",
      decision: "What economic reality sits behind the ticker or the fund?",
      outcome:
        "Connect the three statements, then read profitability, leverage and investor cash flow while keeping the candidate on a research-only watchlist.",
      artifactId: "evidence",
      artifactLabel: "Business Evidence Brief",
      targetMinutes: 100,
      status: "available",
      startLessonSlug: STATEMENT_CORE[0],
      legacyCompletionSlugs: STATEMENT_CORE,
      optionalLabSlugs: [
        "if-4-3-recast-the-business",
        "if-4-5-repair-the-investor-view",
      ],
      sourceSessions: [4],
    },
    {
      id: "pb-07",
      order: 7,
      title: "Estimate value and a decision range",
      decision: "What is it worth, and at what price would you act?",
      outcome:
        "Build an internally consistent value range, cross-check it against peers, and save action and thesis-break rules without treating research as ownership.",
      artifactId: "valuation",
      artifactLabel: "Valuation and Return Range",
      targetMinutes: 50,
      status: "available",
      startLessonSlug: VALUATION_CORE[0],
      legacyCompletionSlugs: VALUATION_CORE,
      optionalLabSlugs: [],
      sourceSessions: [3, 4, 5],
    },
    {
      id: "pb-08",
      order: 8,
      title: "Count the friction",
      decision: "What will acting actually cost you?",
      outcome:
        "Quantify spread, price impact, the cost of waiting, turnover and tax drag before deciding how actively to trade.",
      artifactId: "friction",
      artifactLabel: "Friction Budget",
      targetMinutes: 35,
      status: "available",
      startLessonSlug: FRICTION_CORE[0],
      legacyCompletionSlugs: FRICTION_CORE,
      optionalLabSlugs: [],
      sourceSessions: [6],
    },
    {
      id: "pb-09",
      order: 9,
      title: "Judge a market-beating claim",
      decision: "How would you know if a strategy really works — including your own?",
      outcome:
        "Apply event, portfolio and regression tests, name the cardinal sins that make backtests lie, then state the market belief those tests would have to survive.",
      artifactId: "evidence-test",
      // Two artifacts since curriculum amendment 1: the belief arrives here,
      // where the learner can finally test one.
      artifactLabel: "Evidence Test Checklist and Market Belief Statement",
      targetMinutes: 40,
      status: "available",
      startLessonSlug: EVIDENCE_TEST_CORE[0],
      legacyCompletionSlugs: EVIDENCE_TEST_CORE,
      optionalLabSlugs: [],
      sourceSessions: [8, 7, 1],
    },
    {
      id: "pb-10",
      order: 10,
      title: "Choose passive, or prove an edge",
      decision: "Is active risk justified for this investor?",
      outcome:
        "Default to passive unless a falsifiable edge survives the current base rate, evidence, friction, capacity, durability, size and thesis-break tests.",
      artifactId: "architecture",
      artifactLabel: "Architecture and Edge Decision",
      targetMinutes: 40,
      status: "available",
      startLessonSlug: ARCHITECTURE_CORE[0],
      legacyCompletionSlugs: ARCHITECTURE_CORE,
      optionalLabSlugs: [],
      sourceSessions: [6, 7, 8, 35, 36],
      sourceBoundary:
        "Built under an approved narrowing on 2026-08-14: the June 2026 active/passive base rate is locked and cited, but the canonical S&P DJI persistence artifact could not be cached, so this mission makes no claim about current manager persistence and teaches the 25% no-continuity null as a test instead.",
    },
    {
      id: "pb-11",
      order: 11,
      title: "Set a market-timing policy",
      decision: "Will you try to time the market?",
      outcome:
        "Price the cost of being out of the market, then write a no-timing or explicitly bounded timing rule.",
      artifactId: "timing",
      artifactLabel: "Timing Policy",
      targetMinutes: 30,
      status: "available",
      startLessonSlug: "if-pb-11-set-a-market-timing-policy",
      legacyCompletionSlugs: ["if-pb-11-set-a-market-timing-policy"],
      optionalLabSlugs: [],
      sourceSessions: [30, 32, 33, 34],
      sourceBoundary:
        "Resolved by narrowing on 2026-08-16: Session 32 has no official caption track, so its narration was never reviewed and every Session 32 claim in this mission rests on canonical slides alone. The consequence is stated rather than papered over — the two macro tables give year counts (83 and 82) but no start or end date, and are presented as 'period not stated on the source slide'. Session 34's tactical-fund comparison carries Damodaran's own caveat that it covers one period. The 5-10% speculative sleeve that appears only in Session 34 narration is not offered at any size. Full reconciliation: docs/source-audits/mission-11-timing.md.",
    },
    {
      id: "pb-12",
      order: 12,
      title: "Choose the actual holdings",
      decision: "What do you actually buy?",
      outcome:
        "Verify each product's exact identity, exposure, structure, fees, tracking, liquidity, source date and overlap, then rehearse an order without submitting it.",
      artifactId: "holdings",
      artifactLabel: "Holdings Slate",
      targetMinutes: 40,
      status: "available",
      startLessonSlug: "if-pb-12-choose-the-actual-holdings",
      legacyCompletionSlugs: ["if-pb-12-choose-the-actual-holdings"],
      optionalLabSlugs: [],
      sourceSessions: [37],
      sourceBoundary:
        "Resolved by verification on 2026-08-16, not by narrowing. Session 37 supplies the passive-product taxonomy only and is labelled a source-era framework: its data ends in 2010, and its claim that ETFs cost slightly more than index funds is falsified by the filings this mission uses, so it is not repeated. Every product figure comes from that product's own current EDGAR filing, named on the page with its accession and as-of date. Three limits stay visible to the learner rather than being resolved: no filing in the slate publishes a bid-ask spread or premium/discount figure, so those fields remain qualitative; material changes are recorded only where a filing states one, which in this slate is SGOV alone; and the two sponsors file on different fiscal calendars, so no cross-sponsor overlap figure comes from a single snapshot.",
    },
    {
      id: "pb-13",
      order: 13,
      title: "Write the rules and defend the portfolio",
      decision: "How is this maintained, and why is it coherent for you?",
      outcome:
        "Specify contribution, withdrawal, rebalance, tax-warning, sell and thesis-break rules, then pass a portfolio flight test and defend the whole policy.",
      artifactId: "policy",
      artifactLabel: "Operating Plan and IPS",
      targetMinutes: 40,
      status: "available",
      startLessonSlug: "if-pb-13-write-the-rules-and-defend-the-portfolio",
      legacyCompletionSlugs: ["if-pb-13-write-the-rules-and-defend-the-portfolio"],
      optionalLabSlugs: [],
      sourceSessions: [1, 6, 36, 38],
      sourceBoundary:
        "Closed by claim-level review on 2026-08-17. All four Damodaran sessions carry official caption tracks; the IPS skeleton is CFA Institute’s 2010 elements document, cited for structure only. Four limits stay visible rather than resolved: Session 36’s performance percentages are dated and appear as labelled history under Mission 10’s quarantine; Session 6’s dividend-versus-capital-gains rate premise is source-era and is not reproduced; Vanguard’s rebalancing research studies target-date funds, frames its benefit as return and omits tax from its cost model, so it is not cited for the rebalancing rule; and the cached IRS publications extract with interleaved columns, so they are cited by edition as the pointer of record and never quoted. Rebalancing method and trigger types come from the SEC, which leaves the number to the investor.",
    },
  ],
  depthLabs: [
    {
      id: "philosophy-families",
      title: "Six ways investors claim an edge",
      sourceSessions: [1],
      lessonSlugs: ["if-1-3-comparing-investment-philosophy-families"],
      status: "available",
    },
    {
      id: "bond-risk",
      title: "Duration and interest-rate sensitivity",
      sourceSessions: [2],
      lessonSlugs: ["if-2-3-duration-measuring-interest-rate-sensitivity"],
      status: "available",
    },
    {
      id: "equity-risk",
      title: "Beta, required return, and alternative risk measures",
      sourceSessions: [3],
      lessonSlugs: [
        "if-3-3-what-beta-measures",
        "if-3-4-what-makes-beta-rise-or-fall",
        "if-3-5-choosing-a-risk-measure",
      ],
      status: "available",
    },
    {
      id: "accounting-recasts",
      title: "Accounting recasts and analyst adjustments",
      sourceSessions: [4],
      lessonSlugs: [
        "if-4-3-recast-the-business",
        "if-4-5-repair-the-investor-view",
      ],
      status: "available",
    },
    { id: "valuation", title: "Full company valuation case", sourceSessions: [5], lessonSlugs: [], status: "planned" },
    { id: "momentum", title: "Momentum, temporal patterns, and technical analysis", sourceSessions: [9, 10, 11, 31], lessonSlugs: [], status: "planned" },
    { id: "value", title: "Value screens, contrarian, and activist approaches", sourceSessions: [12, 13, 14, 15, 16], lessonSlugs: [], status: "planned" },
    { id: "growth", title: "Growth, small-cap, IPO, and GARP approaches", sourceSessions: [17, 18, 19, 20, 21], lessonSlugs: [], status: "planned" },
    { id: "information", title: "Information and event trading", sourceSessions: [22, 23, 24, 25, 26], lessonSlugs: [], status: "planned" },
    { id: "arbitrage", title: "Pure, near, and speculative arbitrage", sourceSessions: [27, 28, 29], lessonSlugs: [], status: "planned" },
  ],
};

const lessonRequirements: Record<string, CurriculumRequirement> = {
  ...Object.fromEntries(MANDATE_CORE.map((slug) => [slug, "core" as const])),
  ...Object.fromEntries(BELIEF_CORE.map((slug) => [slug, "core" as const])),
  // Surveying six philosophy families before the learner can test any of them
  // repeats the source course's ordering mistake, so this is optional depth
  // opened from mission 10 rather than part of the required opening.
  "if-1-3-comparing-investment-philosophy-families": "lab",
  ...Object.fromEntries(BOND_CORE.map((slug) => [slug, "core" as const])),
  "if-2-3-duration-measuring-interest-rate-sensitivity": "lab",
  ...Object.fromEntries(EQUITY_RISK_CORE.map((slug) => [slug, "core" as const])),
  ...Object.fromEntries(ALLOCATION_CORE.map((slug) => [slug, "core" as const])),
  "if-3-3-what-beta-measures": "lab",
  "if-3-4-what-makes-beta-rise-or-fall": "lab",
  "if-3-5-choosing-a-risk-measure": "lab",
  ...Object.fromEntries(STATEMENT_CORE.map((slug) => [slug, "core" as const])),
  "if-4-3-recast-the-business": "lab",
  "if-4-5-repair-the-investor-view": "lab",
  ...Object.fromEntries(VALUATION_CORE.map((slug) => [slug, "core" as const])),
  ...Object.fromEntries(FRICTION_CORE.map((slug) => [slug, "core" as const])),
  ...Object.fromEntries(EVIDENCE_TEST_CORE.map((slug) => [slug, "core" as const])),
  ...Object.fromEntries(ARCHITECTURE_CORE.map((slug) => [slug, "core" as const])),
};

export function getPortfolioLessonRequirement(
  lessonSlug: string,
): CurriculumRequirement | undefined {
  return lessonRequirements[lessonSlug];
}

export const portfolioBuilderCoreLessonSlugs = Object.entries(lessonRequirements)
  .filter(([, requirement]) => requirement === "core")
  .map(([slug]) => slug);

export const portfolioBuilderLabLessonSlugs = Object.entries(lessonRequirements)
  .filter(([, requirement]) => requirement === "lab")
  .map(([slug]) => slug);
