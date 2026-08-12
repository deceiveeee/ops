export type CurriculumRequirement = "core" | "lab" | "reference";

export type PortfolioMissionStatus = "available" | "planned";

/**
 * One artifact per mission. Ids are internal; `label` is what the learner sees.
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
  /** Named when a mission needs a primary source Damodaran does not provide. */
  sourceGap?: string;
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

const STATEMENT_CORE = [
  "if-4-1-the-three-financial-statements",
  "if-4-2-read-the-balance-sheet",
  "if-4-4-read-profit-and-leverage",
  "if-4-6-trace-cash-to-the-investor",
];

const VALUATION_CORE = ["if-5-1-estimate-a-valuation-range"];

const FRICTION_CORE = ["if-6-1-count-the-friction"];

export const portfolioBuilderPath: PortfolioBuilderPath = {
  id: "portfolio-builder",
  title: "Portfolio Builder",
  promise:
    "Build a portfolio you can defend, holding by holding, and leave with written rules for what you own, what it costs, when you change it, and when you admit you were wrong.",
  // Built missions use the real summed lesson time; planned missions carry
  // estimates. 357 built + 265 planned.
  targetMinutes: 622,
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
        "State the goal, horizon, cash needs, job security, tax status, loss capacity and behavioural limits you actually face.",
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
      title: "Commit to a market belief",
      decision: "What do you believe about markets, and what would prove it wrong?",
      outcome:
        "Write a testable belief about how prices behave, and name the evidence that would make you abandon it.",
      artifactId: "beliefs",
      artifactLabel: "Market Belief Statement",
      targetMinutes: 15,
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
        "Turn the frontier you already know into a real allocation for your horizon, with a risk budget and concentration limits.",
      artifactId: "allocation",
      artifactLabel: "Allocation and Risk Policy",
      targetMinutes: 45,
      status: "planned",
      legacyCompletionSlugs: [],
      optionalLabSlugs: [],
      sourceSessions: [1, 2, 3, 30],
      sourceGap:
        "Allocation theory is already taught in Finance Foundations. The implementation step and position-sizing policy need primary sources; sizing has none locked yet.",
    },
    {
      id: "pb-06",
      order: 6,
      title: "Read the business evidence",
      decision: "What economic reality sits behind the ticker or the fund?",
      outcome:
        "Connect the three statements, then read profitability, leverage and the cash that actually reaches investors.",
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
        "Build an internally consistent value range, cross-check it against peers, and convert uncertainty into a buy-below rule.",
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
      decision: "How would you know if a strategy really works?",
      outcome:
        "Apply event, portfolio and regression tests, and name the cardinal sins that make backtests lie.",
      artifactId: "evidence-test",
      artifactLabel: "Evidence Test Checklist",
      targetMinutes: 35,
      status: "planned",
      legacyCompletionSlugs: [],
      optionalLabSlugs: [],
      sourceSessions: [8],
    },
    {
      id: "pb-10",
      order: 10,
      title: "Choose passive, or prove an edge",
      decision: "Is active risk justified for this investor?",
      outcome:
        "Default to passive unless a falsifiable edge survives friction, taxes, capacity, behaviour and the manager-performance record.",
      artifactId: "architecture",
      artifactLabel: "Architecture and Edge Decision",
      targetMinutes: 40,
      status: "planned",
      legacyCompletionSlugs: [],
      optionalLabSlugs: [],
      sourceSessions: [6, 7, 8, 35, 36],
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
      status: "planned",
      legacyCompletionSlugs: [],
      optionalLabSlugs: [],
      sourceSessions: [30, 32, 33, 34],
    },
    {
      id: "pb-12",
      order: 12,
      title: "Choose the actual holdings",
      decision: "What do you actually buy?",
      outcome:
        "Compare index funds, ETFs and enhanced index funds on cost, tracking, liquidity and tax, and record why each was kept or rejected.",
      artifactId: "holdings",
      artifactLabel: "Holdings Slate",
      targetMinutes: 40,
      status: "planned",
      legacyCompletionSlugs: [],
      optionalLabSlugs: [],
      sourceSessions: [37],
      sourceGap:
        "Session 37's product landscape predates the modern ETF market. Current fund disclosures come from SEC EDGAR; index methodology is not machine-accessible and is read from a prospectus instead.",
    },
    {
      id: "pb-13",
      order: 13,
      title: "Write the rules and defend the portfolio",
      decision: "How is this maintained, and why is it coherent for you?",
      outcome:
        "Specify contribution, rebalance, tax, sell and thesis-break rules, choose a benchmark, then defend the whole policy against the misfit test.",
      artifactId: "policy",
      artifactLabel: "Operating Plan and IPS",
      targetMinutes: 40,
      status: "planned",
      legacyCompletionSlugs: [],
      optionalLabSlugs: [],
      sourceSessions: [6, 36, 38],
      sourceGap:
        "Rebalancing method, current US tax and account rules, and IPS structure come from supplemental primary sources (Vanguard, IRS, CFA Institute), all locked in scripts/source/supplemental-manifest.json.",
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
  "if-3-3-what-beta-measures": "lab",
  "if-3-4-what-makes-beta-rise-or-fall": "lab",
  "if-3-5-choosing-a-risk-measure": "lab",
  ...Object.fromEntries(STATEMENT_CORE.map((slug) => [slug, "core" as const])),
  "if-4-3-recast-the-business": "lab",
  "if-4-5-repair-the-investor-view": "lab",
  ...Object.fromEntries(VALUATION_CORE.map((slug) => [slug, "core" as const])),
  ...Object.fromEntries(FRICTION_CORE.map((slug) => [slug, "core" as const])),
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
