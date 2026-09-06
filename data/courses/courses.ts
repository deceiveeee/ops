import type { Course, CourseModule, SourceSlot } from "./types";
import { getLesson } from "../lessons/lessons";
import { isPublicBetaLesson } from "@/lib/beta";

export * from "./types";

const moduleSourceSlots = (moduleId: string): SourceSlot[] => {
  const isPV = moduleId === "m02-present-value-relations";
  const isFI = moduleId === "m03-fixed-income-securities";
  if (moduleId === "if-m02-risk-in-bonds") {
    return [
      {
        id: "damodaran-ip-38-session-2-slides",
        title: "Investment Philosophies — Session 2: The risk in bonds",
        type: "course-note",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session2.pdf",
        note: "Official NYU Stern slide deck for Session 2 of the locked 38-webcast course sequence.",
      },
      {
        id: "damodaran-ip-38-session-2-test",
        title: "Investment Philosophies — Session 2 test and solutions",
        type: "external-link",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz2.pdf",
        note: "Official Session 2 assessment, independently recalculated for OPS.",
      },
    ];
  }
  if (moduleId === "if-m03-risk-in-stocks") {
    return [
      {
        id: "damodaran-ip-38-session-3-slides",
        title: "Investment Philosophies — Session 3: The risk in stocks",
        type: "course-note",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session3.pdf",
        note: "Official NYU Stern slide deck for Session 3 of the locked 38-webcast course sequence. All 18 slides were audited.",
      },
      {
        id: "damodaran-ip-38-session-3-test",
        title: "Investment Philosophies — Session 3 test and solutions",
        type: "external-link",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz3.pdf",
        note: "Official assessment source. OPS rewrites the duplicated answer choice and the question with a mismatched solution.",
      },
      {
        id: "damodaran-ip-38-session-3-video",
        title: "Investment Philosophies — Session 3 of 38 video",
        type: "external-link",
        required: true,
        url: "https://www.youtube.com/watch?v=Hqol9Fc0PLU",
        note: "Official Aswath Damodaran recording used for complete caption review. Slides and independently checked finance terminology control where auto-captions conflict.",
      },
    ];
  }
  if (moduleId === "if-pb05-allocation-policy") {
    return [
      {
        id: "damodaran-ip-38-session-1-slides",
        title: "Investment Philosophies — Session 1: Introduction",
        type: "course-note",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session1.pdf",
        note: "Official NYU Stern deck supporting the investor-first process and the role of horizon, cash needs, risk preference, and tax context. It does not prescribe an allocation.",
      },
      {
        id: "damodaran-ip-38-session-1-test",
        title: "Investment Philosophies - Session 1 quiz and solutions",
        type: "external-link",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz1.pdf",
        note: "Official Session 1 assessment reviewed completely with its solutions as part of the locked Mission 5 source set.",
      },
      {
        id: "damodaran-ip-38-session-1-video",
        title: "Investment Philosophies - Session 1 of 38 video",
        type: "external-link",
        required: true,
        url: "https://www.youtube.com/watch?v=CKuAStbkjuA",
        note: "Official Aswath Damodaran recording used for complete caption review alongside the Session 1 deck.",
      },
      {
        id: "damodaran-ip-38-session-2-slides",
        title: "Investment Philosophies — Session 2: Understanding Risk I: The risk in bonds",
        type: "course-note",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session2.pdf",
        note: "Official NYU Stern deck establishing that a stability slice can still carry interest-rate and default risk.",
      },
      {
        id: "damodaran-ip-38-session-2-test",
        title: "Investment Philosophies - Session 2 quiz and solutions",
        type: "external-link",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz2.pdf",
        note: "Official Session 2 assessment reviewed completely with its solutions as part of the locked Mission 5 source set.",
      },
      {
        id: "damodaran-ip-38-session-2-video",
        title: "Investment Philosophies - Session 2 content-matched video",
        type: "external-link",
        required: true,
        url: "https://www.youtube.com/watch?v=8E6b60eN2Mc",
        note: "The official index currently points Session 2 to the class-overview upload. This locked content-matched mirror is the artifact reconciled in docs/source-audits/damodaran-investment-philosophies-session-2.md; no newer or differently numbered session is substituted.",
      },
      {
        id: "damodaran-ip-38-session-3-slides",
        title: "Investment Philosophies — Session 3: Understanding Risk II: The risk in stocks",
        type: "course-note",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session3.pdf",
        note: "Official NYU Stern deck supporting price, cash-flow, downside, stand-alone, and portfolio risk, including diversification and model uncertainty.",
      },
      {
        id: "damodaran-ip-38-session-3-test",
        title: "Investment Philosophies - Session 3 quiz and solutions",
        type: "external-link",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz3.pdf",
        note: "Official Session 3 assessment reviewed completely with its solutions; documented source defects remain corrected in OPS adaptations.",
      },
      {
        id: "damodaran-ip-38-session-3-video",
        title: "Investment Philosophies - Session 3 of 38 video",
        type: "external-link",
        required: true,
        url: "https://www.youtube.com/watch?v=Hqol9Fc0PLU",
        note: "Official Aswath Damodaran recording used for complete caption review. The audited deck and independently checked finance terminology control where auto-captions conflict.",
      },
      {
        id: "damodaran-ip-38-session-30-slides",
        title: "Investment Philosophies — Session 30: Market Timing: Setting the table",
        type: "course-note",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session30.pdf",
        note: "Official NYU Stern deck supporting strategic allocation as the baseline before any later timing decision. Historical magnitudes are quarantined from Mission 5.",
      },
      {
        id: "damodaran-ip-38-session-30-test",
        title: "Investment Philosophies - Session 30 quiz and solutions",
        type: "external-link",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz30.pdf",
        note: "Official Session 30 assessment reviewed completely with its solutions; its historical timing magnitudes remain quarantined from Mission 5.",
      },
      {
        id: "damodaran-ip-38-session-30-video",
        title: "Investment Philosophies - Session 30 of 38 video",
        type: "external-link",
        required: true,
        url: "https://www.youtube.com/watch?v=2wYJJ_bw1QM",
        note: "Official Aswath Damodaran recording used for complete caption review alongside the Session 30 deck.",
      },
      {
        id: "investor-gov-preparedness",
        title: "Investor Preparedness Checklist",
        type: "external-link",
        required: true,
        url: "https://www.investor.gov/introduction-investing/general-resources/investor-preparedness-checklist",
        note: "SEC investor-education checklist used for readiness inputs. It is not an individualized suitability decision.",
      },
      {
        id: "cfpb-emergency-fund",
        title: "An essential guide to building an emergency fund",
        type: "external-link",
        required: true,
        url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",
        note: "CFPB guidance supporting a situation-dependent cash reserve. OPS does not invent a universal reserve amount.",
      },
      {
        id: "investor-gov-risk-tolerance",
        title: "Gauge Your Risk Tolerance",
        type: "external-link",
        required: true,
        url: "https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/gauge-your-risk-tolerance",
        note: "SEC investor-education guidance connecting time horizon, access needs, and the ability to tolerate loss. It does not determine a personal allocation.",
      },
      {
        id: "investor-gov-allocation",
        title: "Beginners' Guide to Asset Allocation, Diversification, and Rebalancing",
        type: "external-link",
        required: true,
        url: "https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset",
        note: "SEC investor-education guidance on horizon, risk tolerance, allocation, diversification, and rebalancing. Examples are mechanisms, not personal defaults.",
      },
      {
        id: "vanguard-principles-allocation",
        title: "Vanguard's Principles for Investing Success",
        type: "course-note",
        required: true,
        url: "https://corporate.vanguard.com/content/dam/corp/research/pdf/vanguards_principles_for_investing_success.pdf",
        note: "Provider framework used for the distinction between willingness and capacity and for goal-first allocation. Provider examples and weights are not personal rules.",
      },
    ];
  }
  if (moduleId === "if-m04-financial-statement-analysis") {
    return [
      {
        id: "damodaran-ip-38-session-4-slides",
        title: "Investment Philosophies — Session 4: Financial Statement Analysis",
        type: "course-note",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session4.pdf",
        note: "Official NYU Stern slide deck for Session 4 of the locked 38-webcast course sequence. All 18 slides were visually audited.",
      },
      {
        id: "damodaran-ip-38-session-4-test",
        title: "Investment Philosophies — Session 4 test and solutions",
        type: "external-link",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz4.pdf",
        note: "Official assessment source. All five answers were independently checked and rewritten for beginner accessibility.",
      },
      {
        id: "damodaran-ip-38-session-4-video",
        title: "Investment Philosophies — Session 4 of 38 video",
        type: "external-link",
        required: true,
        url: "https://www.youtube.com/watch?v=qaDFkAh3J4k",
        note: "Official Aswath Damodaran recording used for complete caption review. Slides and independently checked accounting terminology control where auto-captions conflict.",
      },
    ];
  }
  if (moduleId === "if-m06-friction") {
    return [
      {
        id: "damodaran-ip-38-session-6-slides",
        title: "Investment Philosophies — Session 6: Trading Costs and Taxes",
        type: "course-note",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session6.pdf",
        note: "Official NYU Stern slide deck for Session 6 of the locked 38-webcast course sequence. All 22 physical pages were read, including the block-trade cost table.",
      },
      {
        id: "damodaran-ip-38-session-6-test",
        title: "Investment Philosophies — Session 6 test and solutions",
        type: "external-link",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz6.pdf",
        note: "Official assessment source. OPS repairs two test-versus-solution mismatches: question 1 option (f) says \"lots of analysts\" in the test but \"few\" in the solution, and question 4's options (c) and (d) differ between the two.",
      },
      {
        id: "damodaran-ip-38-session-6-video",
        title: "Investment Philosophies — Session 6 trading-costs recording",
        type: "external-link",
        required: true,
        url: "https://www.youtube.com/watch?v=bUJUGsDQ16w",
        note: "Official recording of the trading-costs session. The Session 5 and Session 6 uploads are swapped: this upload is labeled Session 5 but contains the Session 6 trading-costs narration, confirmed by caption analysis against the deck.",
      },
    ];
  }
  if (moduleId === "if-m05-valuation-range") {
    return [
      {
        id: "damodaran-ip-38-session-5-slides",
        title: "Investment Philosophies — Session 5: Valuation: The Basics",
        type: "course-note",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session5.pdf",
        note: "Official NYU Stern slide deck for Session 5 of the locked 38-webcast course sequence. All 13 slides were visually audited.",
      },
      {
        id: "damodaran-ip-38-session-5-test",
        title: "Investment Philosophies — Session 5 test and solutions",
        type: "external-link",
        required: true,
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz5.pdf",
        note: "Official assessment source. OPS repairs question 1 because its negative stem conflicts with the answer explanation.",
      },
      {
        id: "damodaran-ip-38-session-5-video-correct-content",
        title: "Investment Philosophies — Session 5 valuation recording",
        type: "external-link",
        required: true,
        url: "https://www.youtube.com/watch?v=FNF3ncQgABk",
        note: "Official correct-content valuation recording. The Session 5 and Session 6 YouTube uploads are swapped; this upload is labeled Session 6 but visibly and audibly contains Session 5 valuation content.",
      },
    ];
  }
  return [
    {
      id: `${moduleId}-mit-ocw`,
      title: isPV
        ? "MIT 15.401 Finance Theory I — Present Value Relations"
        : isFI
          ? "MIT 15.401 Finance Theory I — Fixed-Income Securities"
          : "MIT OpenCourseWare finance source placeholder",
      type: "course-note",
      required: true,
      note: isPV
        ? "Attach or reference the canonical MIT OpenCourseWare material for this module."
        : isFI
          ? "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Fixed-Income Securities slides/video."
          : "Attach the relevant MIT OCW finance material for this module later.",
    },
    {
      id: `${moduleId}-textbook`,
      title: "Textbook / source reading placeholder",
      type: "textbook",
      required: false,
      note: "Attach the supporting textbook chapter or reading later.",
    },
    {
      id: `${moduleId}-application`,
      title: "Market or filing application placeholder",
      type: "market-data",
      required: false,
      note: "Attach a market, filing, or applied example source later.",
    },
    {
      id: `${moduleId}-case`,
      title: "Optional case study source placeholder",
      type: "annual-report",
      required: false,
      note: "Attach an optional case study source later.",
    },
  ];
};

const module = (
  id: string,
  order: number,
  title: string,
  description: string,
  learningGoal: string,
  role: CourseModule["role"],
  lessonSlugs: string[],
  unitLabel?: string,
): CourseModule => ({
  id,
  order,
  title,
  description,
  learningGoal,
  role,
  sourceSlots: moduleSourceSlots(id),
  lessonSlugs,
  unitLabel,
});

export const financeFoundations: Course = {
  slug: "finance-foundations",
  title: "Finance Foundations",
  subtitle:
    "From present value to portfolios, markets, and investment decisions.",
  description:
    "A serious but accessible finance course for students and motivated investors. The course uses a formal finance sequence as its backbone, then connects each concept to practical market interpretation, securities, valuation, portfolio construction, and investment decision-making.",
  estimatedHours: 40,
  order: 1,
  modules: [
    module(
      "m01-introduction-and-course-overview",
      1,
      "Introduction and Course Overview",
      "Orientation to the course, the problems finance sets out to solve, and how to use Open Portfolio Studio as a learning and investigation environment.",
      "Understand what finance tries to solve and how the studio supports the learning path.",
      "foundation",
      [
        "what-is-finance-value-time-risk",
        "price-discovery-and-accounting-language",
        "corporate-and-personal-financial-systems",
        "time-risk-and-financial-principles",
        "finance-roadmap-and-personal-application",
      ],
    ),
    module(
      "m02-present-value-relations",
      2,
      "Present Value Relations",
      "Learn how finance converts future cashflows into value today using timelines, discount rates, net present value (NPV), perpetuities, annuities, compounding, and inflation.",
      "Convert future cashflows into present value and make investment decisions with NPV.",
      "foundation",
      [
        "present-value-cashflows-assets-npv",
        "present-value-perpetuities-annuities-compounding",
        "present-value-inflation-real-nominal",
        "present-value-cfo-decision-room",
      ],
    ),
    module(
      "m03-fixed-income-securities",
      3,
      "Fixed-Income Securities",
      "Learn how bonds work, how fixed cash flows are valued, how yield curves encode market expectations, and why bond prices move when rates change.",
      "Price fixed cash-flow streams and read the term structure of interest rates.",
      "security-pricing",
      [
        "fixed-income-bond-markets-cash-flows-discount-bonds",
        "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
        "fixed-income-law-one-price-arbitrage-duration-convexity",
        "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization",
      ],
    ),
    module(
      "m04-equities",
      4,
      "Equities",
      "Equity as ownership, dividend discount models, multi-stage growth, earnings retention, and growth opportunities.",
      "Value equity claims using cash-flow-based and relative methods.",
      "security-pricing",
      [
        "equity-what-does-owning-a-stock-mean",
        "equity-why-does-a-stock-have-value-today",
        "equity-gordon-growth-model",
        "equity-multi-stage-growth-valuation",
        "equity-earnings-dividend-growth",
        "equity-growth-opportunities-pvgo-pe",
        "equity-valuation-case-lab",
        "multiples-and-market-expectations",
      ],
    ),
    module(
      "m07-risk-and-return",
      5,
      "Risk and Return",
      "What risk and return mean, how to measure historical return and volatility, how covariance, correlation, diversification, systematic risk, and beta work, and what historical stock-return data show.",
      "Quantify risk and return and see how diversification changes risk.",
      "risk-and-portfolio",
      [
        "risk-return-what-they-mean",
        "risk-measuring-historical-return-volatility",
        "risk-covariance-correlation-diversification",
        "risk-systematic-idiosyncratic-beta",
        "risk-empirical-properties-stock-returns",
        "risk-portfolio-risk-lab",
      ],
    ),
    module(
      "m08-portfolio-theory",
      6,
      "Portfolio Theory",
      "Portfolio weights and returns, portfolio risk with covariance and correlation, and diversification across many assets.",
      "Construct portfolios and understand how diversification reduces risk.",
      "risk-and-portfolio",
      [
        "portfolio-weights-returns",
        "portfolio-risk-covariance-correlation",
        "portfolio-diversification-many-assets",
        "portfolio-efficient-frontier",
        "portfolio-risk-free-tangency-sharpe",
      ],
    ),
    module(
      "m09-the-capm-and-apt",
      7,
      "The CAPM and APT",
      "The Capital Asset Pricing Model (CAPM) and Arbitrage Pricing Theory (APT): market equilibrium, beta and systematic risk, the security market line, estimating beta, alpha and performance, multifactor models, and a synthesis in practice.",
      "Relate risk to expected return using the CAPM equilibrium and multifactor reasoning.",
      "asset-pricing",
      [
        "capm-tangency-becomes-market-portfolio",
        "security-market-line",
        "capm-estimating-beta",
        "capm-alpha-and-performance",
        "capm-apt-in-practice",
      ],
    ),
    module(
      "m10-capital-budgeting",
      8,
      "Capital Budgeting",
      "The NPV rule, the internal rate of return (IRR) and payback, project cash flows, sensitivity and scenario analysis, and real options intuition.",
      "Evaluate investment projects using NPV and related tools.",
      "corporate-finance",
      [
        "required-return-to-discount-rate",
        "determining-the-discount-rate",
        "when-risk-changes-over-time",
        "npv-rule",
        "irr-and-payback",
        "project-cash-flows",
        "sensitivity-and-scenario-analysis",
        "real-options-intuition",
      ],
    ),
    module(
      "m11-efficient-markets",
      9,
      "Efficient Markets",
      "The efficient market hypothesis, forms of efficiency, anomalies and limits to arbitrage, active versus passive investing, and information in prices.",
      "Reason about how information is reflected in prices and what that implies for investing.",
      "market-efficiency",
      [
        "efficient-market-hypothesis",
        "forms-of-market-efficiency",
        "anomalies-and-limits-to-arbitrage",
        "active-vs-passive-investing",
        "building-investment-philosophy",
        "information-and-prices",
      ],
    ),
    module(
      "m12-integrated-portfolio-studio-application",
      10,
      "Putting It All Together",
      "An applied module that connects everything in the course into one investment workflow and decision framework.",
      "Combine security analysis, valuation, and portfolio construction into an investment decision.",
      "integration",
      [
        "course-integration-map",
        "integrated-security-analysis-case",
        "portfolio-studio-application",
        "final-investment-decision-framework",
      ],
    ),
  ],
};

export const investmentFoundations: Course = {
  slug: "investment-foundations",
  title: "Investment Foundations",
  subtitle: "Build, defend, and monitor an investment portfolio",
  description:
    "Thirteen portfolio decisions connect your goal, market beliefs, risk limits, allocation, evidence, valuation, costs, holdings, and operating rules into one portfolio plan. Investigate a Damodaran strategy only when it informs a portfolio decision.",
  estimatedHours: 10,
  order: 2,
  modules: [
    // Missions 1 and 2 were one module labelled "Missions 1-2", so both led to
    // the same four-lesson list and neither could be entered on its own. They
    // are separate portfolio decisions and the course data always treated them
    // that way; only this listing had them merged.
    module(
      "if-mission-1-mandate",
      1,
      "Set Your Goal and Limits",
      "Map where a philosophy actually changes a decision, then work out which approaches fit the investor who has to carry them out — the goal, the horizon, the cash needs and the tolerance behind every later choice.",
      "State who the portfolio is being built for, and what that rules in and out.",
      "investment-philosophy",
      [
        "if-1-2-where-philosophy-enters-the-investment-process",
        "if-1-4-when-a-philosophy-fits-the-investor",
      ],
      "Mission 1",
    ),
    module(
      "if-mission-2-observation",
      2,
      "Observe the Market",
      "Read three dated disclosures before seeing what the market did, separate a past result from a forward expectation, and learn to say only what the evidence in front of you supports.",
      "Record one market observation you could defend, and what it does not establish.",
      "investment-philosophy",
      ["if-1-1-how-an-investor-builds-a-philosophy"],
      "Mission 2",
    ),
    module(
      "if-m02-risk-in-bonds",
      3,
      "The Risk in Bonds",
      "Decode a conventional fixed-rate bond, connect market yields to price, measure interest-rate sensitivity with duration, assess an issuer’s payment capacity, and translate credit risk into required yield and price.",
      "Produce a Bond Risk Brief that connects promised payments, interest-rate exposure, default evidence, required yield, and price.",
      "security-pricing",
      [
        "if-2-1-reading-a-bonds-promise",
        "if-2-2-why-market-rates-change-bond-prices",
        "if-2-3-duration-measuring-interest-rate-sensitivity",
        "if-2-4-default-risk-can-the-issuer-deliver",
        "if-2-5-from-credit-rating-to-bond-price",
      ],
      "Mission 3",
    ),
    module(
      "if-m03-risk-in-stocks",
      4,
      "The Risk in Stocks",
      "Define equity risk through three independent lenses, separate company risk from market risk, interpret beta with its assumptions and estimation error, compare alternative risk measures, and turn the evidence into an explicit decision policy.",
      "Produce an Equity Risk Policy connecting risk definitions, portfolio context, beta, business fundamentals, alternative measures, and a price rule.",
      "risk-and-portfolio",
      [
        "if-3-1-what-risk-means-for-a-shareholder",
        "if-3-2-why-diversification-changes-the-question",
        "if-3-3-what-beta-measures",
        "if-3-4-what-makes-beta-rise-or-fall",
        "if-3-5-choosing-a-risk-measure",
        "if-3-6-build-an-equity-risk-policy",
      ],
      "Mission 4",
    ),
    module(
      "if-pb05-allocation-policy",
      5,
      "Allocation and Risk Policy",
      "Translate a goal, near-term cash need, capacity for loss, and willingness for volatility into broad portfolio roles, strategic weights, and an inspectable stress-loss budget.",
      "Produce an Allocation and Risk Policy whose assumptions, loss contributions, and review triggers can be explained without an optimizer.",
      "risk-and-portfolio",
      ["if-pb-05-set-allocation-and-risk-limits"],
      "Mission 5",
    ),
    module(
      "if-m04-financial-statement-analysis",
      6,
      "Financial Statement Analysis",
      "Read the balance sheet, income statement, and statement of cash flows as connected evidence; recast reported accounting into an investor view; and distinguish current reporting from analytical lease and R&D adjustments.",
      "Produce an Investor Statement Brief connecting reported line items, measurement choices, profitability, leverage, analytical adjustments, and cash available to investors.",
      "filing-analysis",
      [
        "if-4-1-the-three-financial-statements",
        "if-4-2-read-the-balance-sheet",
        "if-4-3-recast-the-business",
        "if-4-4-read-profit-and-leverage",
        "if-4-5-repair-the-investor-view",
        "if-4-6-trace-cash-to-the-investor",
      ],
      "Mission 6",
    ),
    module(
      "if-m05-valuation-range",
      7,
      "Valuation Range",
      "Turn company cash flow, growth quality, risk, peer evidence, and uncertainty into a defensible value range and price rule.",
      "Produce a Valuation Range with a consistent claim, required return, growth-quality cases, peer controls, and decision buffer.",
      "security-pricing",
      ["if-5-1-estimate-a-valuation-range"],
      "Mission 7",
    ),
    module(
      "if-m06-friction",
      8,
      "Trading Costs and Taxes",
      "Break the cost of acting into its four parts, work out the return a strategy must clear before it beats an index, and write down the annual drag your own plan carries.",
      "Produce a Friction Budget that turns spread, price impact, waiting cost, turnover, and tax drag into one hurdle figure.",
      "security-pricing",
      ["if-6-1-count-the-friction"],
      "Mission 8",
    ),
    module(
      "if-m07-evidence",
      9,
      "Testing a Claim",
      "Take a strategy that says it beats the market and put it through the three tests that can settle it, the faults that sink most evidence, and the return it must clear after risk and your own trading costs.",
      "Produce an Evidence Test Checklist stating the benchmark, the test design, the holdout, the sampling rule, the hurdle, and what would make you drop the claim.",
      "security-pricing",
      ["if-7-1-test-the-claim"],
      "Mission 9",
    ),
    module(
      "if-m08-architecture",
      10,
      "Index or Edge",
      "Start from the architecture the evidence supports, then find out what it would actually take to justify leaving it — a specific mispricing, a mechanism, and a margin that survives your own costs.",
      "Produce an index-or-edge decision recording the passive core, its benchmark, a dated base rate, and — only if every condition was met — a licensed active slice with its thesis-break condition and review date.",
      "security-pricing",
      ["if-8-1-choose-passive-or-prove-an-edge"],
      "Mission 10",
    ),
    module(
      "if-lab-edge-families",
      11,
      "Six Ways Investors Claim an Edge",
      "A survey of the philosophy families investors use to claim an advantage, and the market belief each one rests on.",
      "Preview the catalogue of edge claims you can now test.",
      "investment-philosophy",
      ["if-1-3-comparing-investment-philosophy-families"],
      "Optional lab",
    ),
    module(
      "if-m11-timing",
      12,
      "Timing Policy",
      "Decide whether you will ever move away from your strategic weights on purpose — and if so, how far, for how long, and what brings you back.",
      "Produce a Timing Policy: either no timing with a stated reason, or a tilt bounded by a maximum deviation, an expiry, a falsifier and a review date.",
      "security-pricing",
      ["if-pb-11-set-a-market-timing-policy"],
      "Mission 11",
    ),
    module(
      "if-m12-holdings",
      13,
      "Holdings List",
      "Turn the policy slices you licensed into exact legal products — verified against their own filings, X-rayed for the exposure you hold twice, and rehearsed as an order that is never sent.",
      "Produce a holdings list: verified products mapped to the slices you licensed, an overlap result carrying its key, coverage and as-of dates, and a non-executing order draft that names the share class.",
      "security-pricing",
      ["if-pb-12-choose-the-actual-holdings"],
      "Mission 12",
    ),
    module(
      "if-m13-operating-plan",
      14,
      "Operating Plan",
      "Decide what happens when the market falls, your income stops, or the reason you bought something turns out to be wrong — then compile every decision into one document and defend a portfolio you did not build.",
      "Produce an Operating Plan and Investment Policy Statement: rebalancing, contribution, withdrawal, replacement, thesis-break and review rules, nine answered scenarios, and a diagnosed transfer case.",
      "security-pricing",
      ["if-pb-13-write-the-rules-and-defend-the-portfolio"],
      "Mission 13",
    ),
  ],
};

export const courses: Course[] = [financeFoundations, investmentFoundations];

export function getCourse(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getModule(
  course: Course,
  moduleId: string,
): CourseModule | undefined {
  return course.modules.find((m) => m.id === moduleId);
}

export type LessonWithContext = {
  course: Course;
  module: CourseModule;
  lesson: NonNullable<ReturnType<typeof getLesson>>;
};

export function getAllLessons(): LessonWithContext[] {
  const out: LessonWithContext[] = [];
  for (const course of courses) {
    for (const module of course.modules) {
      for (const slug of module.lessonSlugs) {
        if (!isPublicBetaLesson(slug)) continue;
        const lesson = getLesson(slug);
        if (lesson) out.push({ course, module, lesson });
      }
    }
  }
  return out;
}

export function findLesson(lessonSlug: string): LessonWithContext | undefined {
  return getAllLessons().find((l) => l.lesson.slug === lessonSlug);
}
