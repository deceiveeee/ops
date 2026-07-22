import type { Course, CourseModule, SourceSlot } from "./types";
import { getLesson } from "../lessons/lessons";

export * from "./types";

const moduleSourceSlots = (moduleId: string): SourceSlot[] => {
  const isPV = moduleId === "m02-present-value-relations";
  const isFI = moduleId === "m03-fixed-income-securities";
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
): CourseModule => ({
  id,
  order,
  title,
  description,
  learningGoal,
  role,
  sourceSlots: moduleSourceSlots(id),
  lessonSlugs,
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
  subtitle: "Investment Philosophies, Strategy, and Portfolio Construction",
  description:
    "Investment Foundations examines the major ways investors attempt to earn returns. You will learn how to evaluate each approach, test the evidence behind it, and decide whether it fits your risk tolerance, time horizon, resources, and behavior. By the end of the course, you will have evaluated major investment philosophies and built a portfolio supported by research, valuation, quantitative analysis, and explicit decision rules.",
  estimatedHours: 30,
  order: 2,
  modules: [
    module(
      "if-m01-introduction-to-investment-philosophies",
      1,
      "Introduction to Investment Philosophies",
      "Map the investment process, distinguish a philosophy from a strategy, and locate where different investment approaches seek an advantage. Begin drafting the philosophy the rest of the course will test.",
      "Build a working map of the investment process and a provisional investment philosophy.",
      "investment-philosophy",
      ["if-1-1-how-an-investor-builds-a-philosophy"],
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
