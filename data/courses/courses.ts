import type { Course, CourseModule, SourceSlot } from "./types";
import { getLesson } from "../lessons/lessons";

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
        note: "Official NYU Stern slide deck for Session 6 of the locked 38-webcast course sequence. All 23 pages were read, including the block-trade cost table.",
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
      "Orientation to the course, the finance problem space, and how to use Open Portfolio Studio as a learning and investigation environment.",
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
      "Learn how finance converts future cashflows into value today using timelines, discount rates, NPV, perpetuities, annuities, compounding, and inflation.",
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
      "CAPM equilibrium, beta and systematic risk, the security market line, estimating beta, alpha and performance, APT and multifactor models, and a synthesis in practice.",
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
      "The NPV rule, IRR and payback, project cash flows, sensitivity and scenario analysis, and real options intuition.",
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
      "Integrated Portfolio Studio Application",
      "An applied integration module that connects the course concepts into a studio-style investment workflow and decision framework.",
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
    "Thirteen portfolio decisions connect your mandate, market beliefs, risk policies, allocation, evidence, valuation, friction, holdings, and operating rules into one Portfolio Dossier. Investigate a Damodaran strategy only when it informs a portfolio decision.",
  estimatedHours: 10,
  order: 2,
  modules: [
    module(
      "if-m01-introduction-to-investment-philosophies",
      1,
      "Building an Investment Philosophy",
      "Begin with a defensible market belief, map where it affects the investment process, compare major philosophy families, and determine which approaches fit the investor who must carry them out.",
      "Build and test a provisional investment philosophy before committing capital.",
      "investment-philosophy",
      [
        "if-1-1-how-an-investor-builds-a-philosophy",
        "if-1-2-where-philosophy-enters-the-investment-process",
        "if-1-3-comparing-investment-philosophy-families",
        "if-1-4-when-a-philosophy-fits-the-investor",
      ],
      "Missions 1-2",
    ),
    module(
      "if-m02-risk-in-bonds",
      2,
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
      3,
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
      "if-m04-financial-statement-analysis",
      4,
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
      5,
      "Valuation Range",
      "Turn company cash flow, growth quality, risk, peer evidence, and uncertainty into a defensible value range and price rule.",
      "Produce a Valuation Range with a consistent claim, required return, growth-quality cases, peer controls, and decision buffer.",
      "security-pricing",
      ["if-5-1-estimate-a-valuation-range"],
      "Mission 7",
    ),
    module(
      "if-m06-friction",
      6,
      "Trading Costs and Taxes",
      "Break the cost of acting into its four parts, work out the return a strategy must clear before it beats an index, and write down the annual drag your own plan carries.",
      "Produce a Friction Budget that turns spread, price impact, waiting cost, turnover, and tax drag into one hurdle figure.",
      "security-pricing",
      ["if-6-1-count-the-friction"],
      "Mission 8",
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
