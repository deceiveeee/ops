import type {
  Lesson,
  LessonBlock,
  LessonStatus,
  LessonType,
  SourceSlot,
} from "../courses/types";

const COURSE_SLUG = "finance-foundations";

const lessonSourceSlots = (slug: string): SourceSlot[] => [
  {
    id: `${slug}-mit-ocw`,
    title: "MIT OpenCourseWare finance source placeholder",
    type: "course-note",
    required: true,
    note: "Attach the relevant MIT OCW material for this lesson later.",
  },
  {
    id: `${slug}-reading`,
    title: "Textbook / source reading placeholder",
    type: "textbook",
    required: false,
    note: "Attach the supporting reading for this lesson later.",
  },
  {
    id: `${slug}-application`,
    title: "Market or filing application placeholder",
    type: "market-data",
    required: false,
    note: "Attach an applied market, filing, or case source later.",
  },
];

type VisualBlock = LessonBlock & { type: "visual" | "interactive" };

function placeholderBlocks(
  slug: string,
  type: LessonType,
  objectives: string[],
  visual?: VisualBlock,
): LessonBlock[] {
  const blocks: LessonBlock[] = [
    {
      id: `${slug}-hook`,
      type: "hook",
      eyebrow: "Opening question",
      title: "Hook",
      body: "Placeholder opening hook that frames the financial question this lesson answers.",
    },
    {
      id: `${slug}-concept`,
      type: "concept",
      eyebrow: "Core idea",
      title: "Concept",
      body: "Placeholder concept block. The key relationship, definition, or model is introduced here.",
      items: objectives,
    },
  ];

  if (visual) {
    blocks.push(visual);
  }

  if (type === "filing-reader") {
    blocks.push({
      id: `${slug}-source`,
      type: "source",
      eyebrow: "Source document",
      title: "Filing excerpt",
      body: "Placeholder filing excerpt with annotation slots to be added later.",
    });
  } else if (type === "case-study") {
    blocks.push({
      id: `${slug}-example`,
      type: "example",
      eyebrow: "Case study",
      title: "Applied example",
      body: "Placeholder case study example to be developed later.",
    });
  } else if (type === "simulation") {
    blocks.push({
      id: `${slug}-interactive`,
      type: "interactive",
      eyebrow: "Simulation",
      title: "Simulation",
      body: "Placeholder simulation block. The interaction will be built in a separate pass.",
      interactionType: "simulation",
    });
  } else if (type === "quiz") {
    blocks.push({
      id: `${slug}-quiz`,
      type: "quiz",
      eyebrow: "Check",
      title: "Quick check",
      body: "Placeholder quiz block to be authored later.",
    });
  }

  blocks.push({
    id: `${slug}-reflection`,
    type: "reflection",
    eyebrow: "Reflect",
    title: "Reflection",
    body: "Placeholder reflection prompt connecting the concept to investment decisions.",
  });

  blocks.push({
    id: `${slug}-summary`,
    type: "summary",
    eyebrow: "Recap",
    title: "Summary",
    body: "Placeholder summary of the key takeaway from this lesson.",
  });

  return blocks;
}

type LessonSpec = {
  slug: string;
  moduleId: string;
  order?: number;
  shortTitle?: string;
  description?: string;
  title: string;
  subtitle: string;
  type: LessonType;
  lessonType?: string;
  estimatedMinutes: number;
  status?: LessonStatus;
  sourceRequired?: boolean;
  conceptRole?: string;
  skills?: string[];
  objectives: string[];
  visual?: VisualBlock;
};

const visual = (slug: string, visualType: string): VisualBlock => ({
  id: `${slug}-visual`,
  type: "visual",
  eyebrow: "Visual",
  title: "Diagram",
  body: "Placeholder visual block to be designed per AGENTS.md creative direction.",
  visualType,
});

const interactive = (slug: string, interactionType: string): VisualBlock => ({
  id: `${slug}-interactive`,
  type: "interactive",
  eyebrow: "Interactive",
  title: "Interactive",
  body: "Placeholder interactive block to be built in a separate pass.",
  interactionType,
});
const specs: LessonSpec[] = [
  {
    slug: "what-is-finance-value-time-risk",
    moduleId: "m01-introduction-and-course-overview",
    title: "What Is Finance? Value, Time, and Risk",
    subtitle:
      "Finance is not only about stocks, banks, or Wall Street. Finance is the systematic study of how people, companies, and markets value and manage money over time under uncertainty.",
    type: "interactive",
    estimatedMinutes: 25,
    objectives: [
      "Explain why finance applies to both personal and corporate decisions.",
      "Identify the main participants in the financial system.",
      "Distinguish between valuation and management.",
      "Explain why accounting is the language of finance.",
      "Distinguish between stock variables and flow variables.",
      "Explain why time and risk make finance difficult.",
      "Describe the six fundamental principles of finance.",
    ],
  },
  {
    slug: "price-discovery-and-accounting-language",
    moduleId: "m01-introduction-and-course-overview",
    title: "Price Discovery and the Language of Finance",
    subtitle:
      "How markets discover prices under uncertainty, and why accounting becomes the language used to interpret those prices.",
    type: "simulation",
    estimatedMinutes: 25,
    objectives: [
      "Explain how markets discover prices even with incomplete information.",
      "Explain why accounting is the language of finance.",
      "Distinguish between stock variables and flow variables.",
    ],
  },
  {
    slug: "corporate-and-personal-financial-systems",
    moduleId: "m01-introduction-and-course-overview",
    title: "Corporate and Personal Financial Systems",
    subtitle:
      "Corporations and households use similar financial logic, but with different objectives.",
    type: "interactive",
    estimatedMinutes: 25,
    objectives: [
      "Map the five corporate cash-flow steps.",
      "Map the five personal cash-flow steps.",
      "Compare corporate and personal financial objectives.",
    ],
  },
  {
    slug: "time-risk-and-financial-principles",
    moduleId: "m01-introduction-and-course-overview",
    title: "Time, Risk, and the Logic of Finance",
    subtitle:
      "Why time and uncertainty make financial decisions difficult, and the six fundamental principles that guide financial analysis.",
    type: "simulation",
    estimatedMinutes: 25,
    objectives: [
      "Explain why time and risk make finance difficult.",
      "Describe risk aversion.",
      "Apply the six fundamental principles of finance to scenarios.",
    ],
  },
  {
    slug: "finance-roadmap-and-personal-application",
    moduleId: "m01-introduction-and-course-overview",
    title: "Finance Roadmap and Personal Application",
    subtitle:
      "Connect the module to the full Finance Foundations course and apply the finance framework to yourself.",
    type: "case-study",
    estimatedMinutes: 30,
    objectives: [
      "Describe the Finance Foundations course roadmap.",
      "Recall the key terms of the module.",
      "Apply the finance framework to a personal financial model.",
    ],
  },
  {
    slug: "present-value-cashflows-assets-npv",
    moduleId: "m02-present-value-relations",
    order: 1,
    shortTitle: "Cashflows and NPV",
    title: "Present Value Relations: Cashflows, Assets, and NPV",
    subtitle:
      "Turn assets into cashflow timelines, convert future cashflows into present value, and decide whether projects create value.",
    description:
      "Finance starts by translating assets into cashflows. Learn the present value operator, timelines, and net present value.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "Foundations",
    skills: ["Timeline Reading", "Discounting", "NPV Decisions"],
    objectives: [
      "Translate assets into sequences of current and future cashflows.",
      "Place cashflows onto a timeline with the correct date and sign.",
      "Apply the present value operator to convert future cashflows.",
      "Calculate net present value and decide whether to accept or reject a project.",
      "Explain why cashflows at different dates cannot be added directly.",
    ],
  },
  {
    slug: "present-value-perpetuities-annuities-compounding",
    moduleId: "m02-present-value-relations",
    order: 2,
    shortTitle: "Special Cashflows",
    title: "Present Value Relations: Perpetuities, Annuities, and Compounding",
    subtitle:
      "Apply present value to projects, perpetuities, growing perpetuities, annuities, and loans with frequent compounding.",
    description:
      "Value repeating cashflow patterns and understand how compounding changes the effective annual rate.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "Foundations",
    skills: ["Perpetuity Logic", "Annuity Logic", "Compounding", "Discounting"],
    objectives: [
      "Compute future value and present value of $1 at a chosen rate.",
      "Value a project and a financing subsidy using NPV.",
      "Value perpetuities, growing perpetuities, and annuities.",
      "Distinguish APR from EAR and model compounding frequency.",
    ],
  },
  {
    slug: "present-value-inflation-real-nominal",
    moduleId: "m02-present-value-relations",
    order: 3,
    shortTitle: "Real vs Nominal",
    title: "Present Value Relations: Inflation, Real vs Nominal Value",
    subtitle:
      "Inflation changes purchasing power. Present value only works when cashflows and discount rates speak the same language.",
    description:
      "Distinguish real and nominal returns and keep NPV calculations internally consistent.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "Foundations",
    skills: ["Real vs Nominal", "Compounding"],
    objectives: [
      "Distinguish inflation from the time value of money.",
      "Convert between real and nominal returns.",
      "Apply the consistency rule to discount nominal or real cashflows.",
      "Value a future income stream using real rates.",
    ],
  },
  {
    slug: "present-value-cfo-decision-room",
    moduleId: "m02-present-value-relations",
    order: 4,
    shortTitle: "CFO Decision Room",
    title: "CFO Decision Room: Present Value Capstone",
    subtitle:
      "Apply timelines, discounting, NPV, special cashflows, compounding, and real-vs-nominal consistency in one integrated decision.",
    description:
      "An integrated final challenge with a Practice Arena and a Mastery Road. Gated until the three Present Value lessons are complete.",
    type: "case-study",
    lessonType: "Capstone",
    estimatedMinutes: 40,
    sourceRequired: true,
    conceptRole: "Foundations",
    skills: [
      "Timeline Reading",
      "Discounting",
      "NPV Decisions",
      "Perpetuity Logic",
      "Annuity Logic",
      "Compounding",
      "Real vs Nominal",
    ],
    objectives: [
      "Build a project timeline and classify each cashflow as nominal or real.",
      "Choose the correct discount rate and compute NPV.",
      "Recommend accept or reject with a clear justification.",
      "Practice each skill in the Practice Arena and track mastery.",
    ],
  },
  {
    slug: "fixed-income-bond-markets-cash-flows-discount-bonds",
    moduleId: "m03-fixed-income-securities",
    order: 1,
    shortTitle: "Bond Markets and Discount Bonds",
    title:
      "Fixed-Income Securities I: Bond Markets, Cash Flows, and Discount Bonds",
    subtitle:
      "How fixed-income securities are structured, how bond markets are organized, how promised bond cash flows work, and how pure discount bonds are valued.",
    description:
      "Learn how fixed-income securities are structured, how bond markets are organized, how promised bond cash flows work, and how pure discount bonds are valued.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Bond Markets",
      "Cash Flow Anatomy",
      "Discount Bonds",
      "Risk Menu",
    ],
    objectives: [
      "Define a fixed-income security.",
      "Classify major fixed-income sectors.",
      "Identify issuers, intermediaries, and investors.",
      "Read maturity, coupon, principal, and cash-flow timing.",
      "Explain why riskless bond valuation is an NPV problem.",
      "Distinguish time-value valuation from inflation, credit, callability, liquidity, and currency risk.",
      "Price a pure discount bond.",
      "Explain why zero-coupon bonds trade below face value when rates are positive.",
      "Explain STRIPS conceptually.",
    ],
  },
  {
    slug: "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
    moduleId: "m03-fixed-income-securities",
    order: 2,
    shortTitle: "Spot Rates, Forwards, and Coupon Bonds",
    title:
      "Fixed-Income Securities II: Spot Rates, Forward Rates, Yield Curves, and Coupon Bonds",
    subtitle:
      "How discount bond prices imply spot rates, how forward rates are inferred, how yield curves are interpreted, and how coupon bonds are valued as portfolios of zero-coupon bonds.",
    description:
      "Learn how discount bond prices imply spot rates, how forward rates are inferred, how yield curves are interpreted, and how coupon bonds are valued as portfolios of zero-coupon bonds.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 45,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Spot Rates",
      "Forward Rates",
      "Yield Curves",
      "Coupon Bonds",
      "Arbitrage",
    ],
    objectives: [
      "Distinguish one-year future spot rates from today’s T-year spot rate.",
      "Explain why today’s T-year spot rate is an average of future one-year rates.",
      "Infer spot rates from discount-bond prices.",
      "Compute one-year forward rates from discount bond prices or spot rates.",
      "Use forward rates to lock in future borrowing or lending.",
      "Explain YTM as the single discount rate equating a coupon bond’s cash flows to price.",
      "Explain why coupon bonds can be valued as portfolios of zero-coupon bonds.",
      "Identify arbitrage logic when a coupon bond and its STRIPS portfolio differ in price.",
      "Distinguish the Expectations Hypothesis from the Liquidity Preference Model.",
    ],
  },
  {
    slug: "fixed-income-law-one-price-arbitrage-duration-convexity",
    moduleId: "m03-fixed-income-securities",
    order: 3,
    shortTitle: "Arbitrage, Duration, and Convexity",
    title:
      "Fixed-Income Securities III: Law of One Price, Fixed-Income Arbitrage, Duration, and Convexity",
    subtitle:
      "Why identical cash flows must have identical prices, how arbitrage appears, and how duration and convexity measure bond price sensitivity.",
    description:
      "Learn why identical fixed-income cash flows should have identical prices, how arbitrage logic appears, and how duration and convexity measure bond price sensitivity to yield changes.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 40,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: ["Law of One Price", "Arbitrage", "Duration", "Convexity"],
    objectives: [
      "Explain why market prices are informative but not automatically correct.",
      "Explain the law of one price and why it does not require equilibrium.",
      "Identify the arbitrage direction when a coupon bond and STRIPS portfolio have different prices.",
      "Explain why short selling and transaction costs matter for arbitrage.",
      "Explain how multiple coupon bonds create an overdetermined pricing system.",
      "Define Macaulay duration as a present-value-weighted average payment time.",
      "Define modified duration as approximate price sensitivity to yield changes.",
      "Calculate duration from cash flows.",
      "Explain how coupon rate, YTM, and maturity affect duration.",
      "Define convexity as curvature in the price-yield relationship.",
      "Use duration plus convexity to approximate bond price changes.",
      "Explain why portfolio duration and convexity are value-weighted averages.",
    ],
  },
  {
    slug: "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization",
    moduleId: "m03-fixed-income-securities",
    order: 4,
    shortTitle: "Credit Risk and Securitization",
    title:
      "Fixed-Income Securities IV: Corporate Bonds, Default Risk, Credit Spreads, and Securitization",
    subtitle:
      "How corporate bonds add default risk, how ratings and spreads work, how promised yield differs from expected yield, and how securitization repackages risk.",
    description:
      "Learn how corporate bonds add default risk, how ratings and credit spreads work, how promised yield differs from expected yield, and how securitization repackages risk.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 40,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Default Risk",
      "Credit Spreads",
      "Promised vs Expected Yield",
      "Securitization",
    ],
    objectives: [
      "Explain why non-government bonds carry default risk.",
      "Define default and distinguish promised payoff from expected payoff.",
      "Read the simplified Moody’s, S&P, and Fitch rating scale.",
      "Distinguish investment grade from non-investment grade.",
      "Interpret a corporate bond spread over Treasuries.",
      "Explain why a corporate spread is not just default probability.",
      "Distinguish promised YTM from expected YTM.",
      "Define default premium and risk premium.",
      "Calculate promised YTM and expected YTM for a risky zero-coupon bond.",
      "Explain why securitization can repackage risk and what it requires.",
      "Explain why senior structured claims can lose value when correlation, liquidity, and model assumptions change.",
    ],
  },
  {
    slug: "equity-what-does-owning-a-stock-mean",
    moduleId: "m04-equities",
    order: 1,
    shortTitle: "What Owning a Stock Means",
    title: "What Does Owning a Stock Actually Mean?",
    subtitle:
      "Common stock as a residual ownership claim, shareholder distributions, retained earnings, and why required return equals cost of equity.",
    description:
      "Understand equity ownership, residual claims, limited liability, why companies retain earnings, and when growth creates or destroys value.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 25,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: ["Equity Ownership", "Residual Claims", "Value Creation"],
    objectives: [
      "Explain common stock as a fractional ownership claim.",
      "Describe equity as a residual claim after debt.",
      "Explain limited liability and its limits.",
      "List ways shareholders receive value.",
      "Distinguish value-creating growth from value-destroying growth.",
      "Explain why required return and cost of equity are the same rate.",
    ],
  },
  {
    slug: "equity-why-does-a-stock-have-value-today",
    moduleId: "m04-equities",
    order: 2,
    shortTitle: "Why a Stock Has Value",
    title: "Why Does a Stock Have Value Today?",
    subtitle:
      "One-period stock valuation, the Dividend Discount Model, discount rates, and why resale price is not an independent source of value.",
    description:
      "Derive stock value from expected dividends plus resale price, understand the DDM, and learn what the discount rate represents.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: ["DDM", "Discount Rates", "Stock Valuation"],
    objectives: [
      "Derive the one-period stock valuation equation.",
      "Explain why resale price is not an independent source of fundamental value.",
      "Generalize to the Dividend Discount Model.",
      "Explain what the discount rate represents.",
      "Distinguish personal required return from market-required return.",
    ],
  },
  {
    slug: "equity-gordon-growth-model",
    moduleId: "m04-equities",
    order: 3,
    shortTitle: "Gordon Growth Model",
    title: "The Gordon Growth Model",
    subtitle:
      "Constant-dividend perpetuities, the Gordon Growth Model, D₀ versus D₁, why r > g, and sensitivity to assumptions.",
    description:
      "Turn the DDM into usable constant-dividend and constant-growth valuation formulas, and understand model limitations.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: ["Gordon Growth Model", "Growing Perpetuity", "Implied Return"],
    objectives: [
      "Value a constant-dividend stock as a perpetuity.",
      "Apply the Gordon Growth Model.",
      "Distinguish D₀ from D₁.",
      "Explain why r > g is required.",
      "Demonstrate sensitivity to the r − g gap.",
      "Decompose expected return into dividend yield plus growth.",
      "Identify when the Gordon model is and is not appropriate.",
    ],
  },
  {
    slug: "equity-multi-stage-growth-valuation",
    moduleId: "m04-equities",
    order: 4,
    shortTitle: "Multi-Stage Growth Valuation",
    title: "Valuing a Company with Multiple Growth Stages",
    subtitle:
      "How to value a company that grows rapidly for a limited period before entering a stable mature stage.",
    description:
      "Learn two-stage and three-stage DDM valuation with explicit forecast periods and terminal value.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: ["Multi-Stage DDM", "Terminal Value", "Stage Valuation"],
    objectives: [
      "Explain why the Gordon model fails for temporarily high-growth companies.",
      "Separate explicit-forecast dividends from terminal value.",
      "Compute terminal value using the Gordon formula at the stable stage.",
      "Discount both explicit dividends and terminal value to today.",
      "Explain why terminal value often represents a large share of total value.",
      "Compare one-stage and multi-stage valuations.",
    ],
  },
  {
    slug: "equity-earnings-dividend-growth",
    moduleId: "m04-equities",
    order: 5,
    shortTitle: "Earnings and Dividend Growth",
    title: "From Earnings to Dividend Growth",
    subtitle:
      "How payout ratio, retention, book equity, and ROE combine to produce sustainable dividend growth.",
    description:
      "Understand the sustainable growth formula g = b × ROE and when reinvestment creates or destroys value.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: ["Payout Ratio", "Sustainable Growth", "ROE vs Cost of Equity"],
    objectives: [
      "Distinguish earnings from dividends.",
      "Define payout ratio and retention ratio.",
      "Define book value per share and return on equity.",
      "Derive the sustainable growth formula g = b × ROE.",
      "Explain why growth creates value only when ROE exceeds the cost of equity.",
      "Distinguish historical ROE from return on incremental new investment.",
    ],
  },
  {
    slug: "equity-growth-opportunities-pvgo-pe",
    moduleId: "m04-equities",
    order: 6,
    shortTitle: "PVGO and P/E",
    title: "Growth Opportunities, PVGO, and P/E",
    subtitle:
      "Decompose stock value into no-growth value plus the present value of growth opportunities, and connect this to P/E.",
    description:
      "Learn how PVGO and the cost of equity determine a company's P/E ratio.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: ["PVGO", "P/E Decomposition", "Growth Stock Valuation"],
    objectives: [
      "Compute no-growth value as EPS₁/r.",
      "Define PVGO and decompose P₀ = EPS₁/r + PVGO.",
      "Identify positive, zero, and negative PVGO.",
      "Decompose P/E into a no-growth component and a growth-opportunity component.",
      "Explain why safer companies tend to have higher P/E, all else equal.",
      "Explain why profitable growth can offset higher risk in P/E.",
    ],
  },
  {
    slug: "equity-valuation-case-lab",
    moduleId: "m04-equities",
    order: 7,
    shortTitle: "Equity Valuation Case Lab",
    title: "Equity Valuation Case Lab",
    subtitle:
      "An integrated analyst case: build a multi-stage forecast, calculate terminal value, stress-test assumptions, diagnose errors, and prepare an investment memo for Northstar Systems.",
    description:
      "Apply the full equity valuation toolkit — DDM, multi-stage growth, terminal value, payout policy, PVGO, and P/E — to a realistic company case.",
    type: "case-study",
    lessonType: "Case Study",
    estimatedMinutes: 50,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Multi-Stage DDM",
      "Terminal Value",
      "Payout Policy",
      "PVGO",
      "Cost of Equity Sensitivity",
      "Analyst Judgment",
    ],
    objectives: [
      "Build a multi-stage earnings and dividend forecast from ROE and payout assumptions.",
      "Calculate terminal value using the Gordon model at the stable stage.",
      "Discount explicit dividends and terminal value to estimate current stock value.",
      "Evaluate how alternative payout policies affect value depending on ROE versus cost of equity.",
      "Stress-test valuation under different costs of equity.",
      "Diagnose common analyst errors including misleading PVGO and temporary-growth-as-perpetual mistakes.",
      "Prepare a structured investment-committee memo with valuation, capital allocation, risk, and interpretation.",
    ],
  },
  {
    slug: "multiples-and-market-expectations",
    moduleId: "m04-equities",
    order: 8,
    shortTitle: "Multiples and Expectations",
    title: "Multiples and Market Expectations",
    subtitle: "What multiples imply about the future.",
    description:
      "Coming soon. Interpret multiples as embedded expectations and compare relative valuation across peers.",
    type: "case-study",
    lessonType: "Coming Soon",
    estimatedMinutes: 25,
    status: "coming-soon",
    sourceRequired: true,
    conceptRole: "security-pricing",
    objectives: [
      "Interpret multiples as embedded expectations.",
      "Compare relative valuation across peers.",
    ],
  },
  {
    slug: "forward-contract-basics",
    moduleId: "m05-forwards-and-futures-contracts",
    title: "Forward Contract Basics",
    subtitle: "Agreements to transact at a future price.",
    type: "reading",
    estimatedMinutes: 15,
    objectives: ["Define a forward contract.", "Identify payoff at maturity."],
  },
  {
    slug: "futures-contract-basics",
    moduleId: "m05-forwards-and-futures-contracts",
    title: "Futures Contract Basics",
    subtitle: "Marked-to-market forward contracts.",
    type: "reading",
    estimatedMinutes: 15,
    objectives: [
      "Describe futures mechanics and margin.",
      "Contrast futures with forwards.",
    ],
  },
  {
    slug: "no-arbitrage-forward-pricing",
    moduleId: "m05-forwards-and-futures-contracts",
    title: "No-Arbitrage Forward Pricing",
    subtitle: "Pricing forwards from cost of carry.",
    type: "interactive",
    estimatedMinutes: 25,
    objectives: [
      "Price a forward using cost of carry.",
      "Identify arbitrage when pricing breaks.",
    ],
    visual: interactive("no-arbitrage-forward-pricing", "arbitrage-scanner"),
  },
  {
    slug: "hedging-with-futures",
    moduleId: "m05-forwards-and-futures-contracts",
    title: "Hedging with Futures",
    subtitle: "Using futures to manage risk.",
    type: "simulation",
    estimatedMinutes: 25,
    objectives: [
      "Construct a hedge using futures.",
      "Measure basis risk and hedge effectiveness.",
    ],
    visual: interactive("hedging-with-futures", "hedge-simulation"),
  },
  {
    slug: "option-payoffs",
    moduleId: "m06-options",
    title: "Option Payoffs",
    subtitle: "Payoff diagrams at expiration.",
    type: "interactive",
    estimatedMinutes: 20,
    objectives: [
      "Draw option payoff diagrams.",
      "Distinguish long and short payoffs.",
    ],
    visual: interactive("option-payoffs", "payoff-diagram"),
  },
  {
    slug: "calls-and-puts",
    moduleId: "m06-options",
    title: "Calls and Puts",
    subtitle: "Rights and obligations of options.",
    type: "reading",
    estimatedMinutes: 15,
    objectives: [
      "Define call and put options.",
      "Identify rights versus obligations.",
    ],
  },
  {
    slug: "put-call-parity",
    moduleId: "m06-options",
    title: "Put-Call Parity",
    subtitle: "The no-arbitrage relationship between puts and calls.",
    type: "interactive",
    estimatedMinutes: 25,
    objectives: ["State put-call parity.", "Use parity to detect arbitrage."],
    visual: interactive("put-call-parity", "parity-scanner"),
  },
  {
    slug: "option-pricing-intuition",
    moduleId: "m06-options",
    title: "Option Pricing Intuition",
    subtitle: "What drives option value.",
    type: "interactive",
    estimatedMinutes: 25,
    objectives: [
      "Explain the drivers of option value.",
      "Relate volatility and time to option premium.",
    ],
    visual: interactive("option-pricing-intuition", "option-pricing-panel"),
  },
  {
    slug: "risk-and-option-greeks",
    moduleId: "m06-options",
    title: "Risk and the Option Greeks",
    subtitle: "Measuring option risk sensitivities.",
    type: "interactive",
    estimatedMinutes: 25,
    objectives: [
      "Interpret delta, gamma, vega, theta.",
      "Use Greeks to describe option risk.",
    ],
    visual: interactive("risk-and-option-greeks", "greeks-panel"),
  },
  {
    slug: "risk-return-what-they-mean",
    moduleId: "m07-risk-and-return",
    order: 1,
    shortTitle: "What Risk and Return Mean",
    title: "What Risk and Return Actually Mean",
    subtitle:
      "Total shareholder return, realized versus expected return, risk as uncertainty, and the risk premium.",
    description:
      "Understand investment return, distinguish realized from expected return, define risk, and connect risk to the cost of equity.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: ["Total Return", "Expected Return", "Risk Premium"],
    objectives: [
      "Calculate total shareholder return from dividend and price change.",
      "Distinguish realized return from expected return.",
      "Define risk as uncertainty in the return actually received.",
      "Explain the risk premium and excess return.",
      "Connect risk to the discount rate used in equity valuation.",
    ],
  },
  {
    slug: "risk-measuring-historical-return-volatility",
    moduleId: "m07-risk-and-return",
    order: 2,
    shortTitle: "Measuring Return and Volatility",
    title: "Measuring Historical Return and Volatility",
    subtitle:
      "Arithmetic and geometric averages, volatility drag, sample variance and standard deviation, and annualization.",
    description:
      "Learn to compute historical averages, understand volatility drag, calculate standard deviation, and annualize returns and volatility.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: [
      "Arithmetic vs Geometric Mean",
      "Volatility Drag",
      "Standard Deviation",
      "Annualization",
    ],
    objectives: [
      "Compute arithmetic and geometric average returns.",
      "Explain why volatility reduces compound growth.",
      "Calculate sample variance and standard deviation.",
      "Interpret a standard deviation number intuitively.",
      "Annualize returns and volatility correctly.",
    ],
  },
  {
    slug: "risk-covariance-correlation-diversification",
    moduleId: "m07-risk-and-return",
    order: 3,
    shortTitle: "Covariance and Diversification",
    title: "Covariance, Correlation, and Diversification",
    subtitle:
      "Portfolio weights and return, covariance and correlation, two-asset portfolio variance, and diversification.",
    description:
      "Understand how assets combine into portfolios, what covariance and correlation measure, and why diversification reduces risk.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: [
      "Portfolio Return",
      "Covariance",
      "Correlation",
      "Diversification",
    ],
    objectives: [
      "Calculate portfolio weights and portfolio return.",
      "Define and interpret covariance and correlation.",
      "Calculate two-asset portfolio variance and volatility.",
      "Explain how correlation creates diversification.",
      "Distinguish diversifiable from systematic risk.",
    ],
  },
  {
    slug: "risk-systematic-idiosyncratic-beta",
    moduleId: "m07-risk-and-return",
    order: 4,
    shortTitle: "Systematic Risk and Beta",
    title: "Systematic Risk, Idiosyncratic Risk, and Beta",
    subtitle:
      "Why diversification eliminates some risks but not others, how to decompose stock returns into market and firm-specific components, and what beta measures.",
    description:
      "Understand systematic vs idiosyncratic risk, decompose total volatility, learn what beta measures and how to interpret it.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: ["Systematic Risk", "Beta", "Idiosyncratic Risk", "Portfolio Beta"],
    objectives: [
      "Distinguish idiosyncratic risk from systematic risk.",
      "Explain why diversification removes only idiosyncratic risk.",
      "Decompose a stock return into market-related and firm-specific components.",
      "Define beta as Cov(R_i, R_M) / Var(R_M).",
      "Interpret beta values and distinguish beta from total volatility.",
      "Calculate portfolio beta as a weighted average.",
    ],
  },
  {
    slug: "risk-empirical-properties-stock-returns",
    moduleId: "m07-risk-and-return",
    order: 5,
    shortTitle: "Empirical Properties of Returns",
    title: "Empirical Properties of Stock Returns",
    subtitle:
      "Historical risk-return patterns, co-movement, predictability, volatility regimes, fat tails, return anomalies, and why asset-pricing models are needed.",
    description:
      "Examine what historical stock-return data actually show, from risk-return relationships to fat tails and anomalies.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: [
      "Historical Evidence",
      "Fat Tails",
      "Volatility Clustering",
      "Return Anomalies",
    ],
    objectives: [
      "Interpret historical risk-return relationships across asset classes.",
      "Explain why individual stocks are riskier than diversified indexes.",
      "Distinguish same-period co-movement from return predictability.",
      "Describe volatility clustering and regime dependence.",
      "Recognize fat tails and limitations of the normal model.",
      "Interpret historical return anomalies and why they are not guaranteed.",
    ],
  },
  {
    slug: "risk-portfolio-risk-lab",
    moduleId: "m07-risk-and-return",
    order: 6,
    shortTitle: "Portfolio Risk Lab",
    title: "Portfolio Risk Lab",
    subtitle:
      "Evaluate three fictional investments, compare two proposed portfolios, stress-test risks, and recommend the portfolio that best satisfies the client mandate.",
    description:
      "Apply the complete Module 5 toolkit — return, volatility, covariance, correlation, beta, diversification — to a realistic portfolio decision.",
    type: "case-study",
    lessonType: "Case Study",
    estimatedMinutes: 50,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: [
      "Return Measurement",
      "Correlation Analysis",
      "Portfolio Comparison",
      "Beta Estimation",
      "Stress Testing",
      "Analyst Judgment",
    ],
    objectives: [
      "Calculate arithmetic and geometric returns, standard deviations, covariance, correlation, and beta from a small fictional dataset.",
      "Build and compare two-asset and three-asset portfolios.",
      "Evaluate idiosyncratic and systematic stress scenarios.",
      "Interpret empirical limitations of a short sample.",
      "Prepare a defensible portfolio recommendation with correct reasoning.",
    ],
  },
  {
    slug: "portfolio-weights-returns",
    moduleId: "m08-portfolio-theory",
    order: 1,
    shortTitle: "Portfolios, Weights, and Returns",
    title: "Portfolios, Weights, and Returns",
    subtitle:
      "How portfolio weights summarize an allocation and how realized and expected portfolio returns are calculated.",
    description:
      "Understand portfolio weights, realized and expected portfolio return as weighted averages, and why risk is not the same.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 12,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: ["Portfolio Weights", "Portfolio Return"],
    objectives: [
      "Define portfolio weights and verify they sum to 100%.",
      "Calculate realized portfolio return as a weighted average.",
      "Calculate expected portfolio return.",
      "Distinguish asset return from portfolio contribution in percentage points.",
      "Explain why the weighted-average rule does not apply to risk.",
    ],
  },
  {
    slug: "portfolio-risk-covariance-correlation",
    moduleId: "m08-portfolio-theory",
    order: 2,
    shortTitle: "Portfolio Risk and Covariance",
    title: "Portfolio Risk, Covariance, and Correlation",
    subtitle:
      "Why portfolio volatility is not a weighted average, the weighted covariance matrix, the two-asset variance formula, and the opportunity curve.",
    description:
      "Understand portfolio variance through matrix expansion, covariance, correlation, and the two-asset opportunity curve.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: [
      "Portfolio Variance",
      "Covariance Matrix",
      "Correlation",
      "Opportunity Curve",
    ],
    objectives: [
      "Expand the variance of a two-asset portfolio step by step.",
      "Build a weighted covariance contribution matrix.",
      "Apply the two-asset variance formula with correlation.",
      "Interpret the factor of 2 in the covariance term.",
      "Explain how imperfect correlation lowers portfolio volatility.",
      "Explore the two-asset opportunity curve.",
    ],
  },
  {
    slug: "portfolio-diversification-many-assets",
    moduleId: "m08-portfolio-theory",
    order: 3,
    shortTitle: "Diversification Across Many Assets",
    title: "Diversification Across Many Assets",
    subtitle:
      "The equal-weight portfolio variance formula, the limit of diversification, and why systematic risk remains.",
    description:
      "Understand how the equal-weight variance formula decomposes risk and why diversification reaches a floor.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 20,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: [
      "Equal-Weight Variance",
      "Diversification Limit",
      "Systematic Risk",
    ],
    objectives: [
      "Derive the equal-weight portfolio variance formula.",
      "Explain why individual variance shrinks as n grows.",
      "Explain why average covariance remains.",
      "Calculate portfolio volatility for a given n.",
      "Interpret the diversification limit as systematic risk.",
    ],
  },
  {
    slug: "portfolio-efficient-frontier",
    moduleId: "m08-portfolio-theory",
    order: 4,
    shortTitle: "The Efficient Frontier",
    title: "The Efficient Frontier",
    subtitle:
      "Portfolio dominance, the feasible set, the minimum-variance boundary, the global minimum-variance portfolio, and why only the upper branch is efficient.",
    description:
      "Understand how thousands of feasible portfolios reduce to the efficient frontier through dominance and minimum-variance optimization.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 25,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: [
      "Portfolio Dominance",
      "Minimum-Variance Boundary",
      "Efficient Frontier",
    ],
    objectives: [
      "Define portfolio dominance in risk-return space.",
      "Explain what the feasible set contains.",
      "Describe how the minimum-variance boundary is constructed.",
      "Identify the global minimum-variance portfolio.",
      "Explain why only the upper branch of the boundary is efficient.",
      "Interpret why the efficient frontier narrows but does not uniquely select one portfolio.",
    ],
  },
  {
    slug: "portfolio-risk-free-tangency-sharpe",
    moduleId: "m08-portfolio-theory",
    order: 5,
    shortTitle: "Risk-Free Asset, Tangency, and Sharpe",
    title: "The Risk-Free Asset, Tangency Portfolio, and Sharpe Ratio",
    subtitle:
      "Why combining a risky portfolio with a risk-free asset creates a straight allocation line, what the Sharpe ratio measures, and why the tangency portfolio is special.",
    description:
      "Understand the Capital Allocation Line, the Sharpe ratio, the tangency portfolio, lending and leverage, and two-fund separation.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: [
      "Capital Allocation Line",
      "Sharpe Ratio",
      "Tangency Portfolio",
      "Two-Fund Separation",
    ],
    objectives: [
      "Explain why risk-free plus risky combinations form a straight line.",
      "Define and calculate the Sharpe ratio.",
      "Identify the tangency portfolio as the maximum-Sharpe risky portfolio.",
      "Interpret lending, full investment, and leverage positions.",
      "Explain two-fund separation at an introductory level.",
      "State the key assumptions and limitations of the model.",
    ],
  },
  {
    slug: "capm-tangency-becomes-market-portfolio",
    moduleId: "m09-the-capm-and-apt",
    order: 1,
    shortTitle: "Tangency Becomes the Market",
    title: "The Tangency Portfolio Becomes the Market Portfolio",
    subtitle:
      "Why the maximum-Sharpe risky portfolio equals the value-weighted market portfolio in CAPM equilibrium, through the market-clearing adjustment of prices and expected returns.",
    description:
      "Connect the tangency portfolio from portfolio theory to the market portfolio through the CAPM equilibrium argument and a market-clearing lab.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 15,
    sourceRequired: true,
    conceptRole: "asset-pricing",
    skills: [
      "Tangency Portfolio",
      "Market Portfolio",
      "CAPM Equilibrium",
      "Market Clearing",
    ],
    objectives: [
      "Define the tangency portfolio as the maximum-Sharpe risky portfolio.",
      "Define the market portfolio as the value-weighted portfolio of all risky assets.",
      "Explain why the two begin as separate concepts.",
      "Calculate simple market-value weights.",
      "Explain how a mismatch between desired holdings and asset supply forces prices to adjust.",
      "Explain why equilibrium implies that the tangency portfolio equals the market portfolio.",
      "Explain why an individual investor should care about this result.",
      "Distinguish the theoretical market portfolio from an observable index proxy.",
    ],
  },
  {
    slug: "security-market-line",
    moduleId: "m09-the-capm-and-apt",
    order: 2,
    shortTitle: "Security Market Line",
    title: "The Security Market Line: What Return Is Enough for This Beta?",
    subtitle:
      "How CAPM turns beta into a required expected return through the market risk premium, and why the Security Market Line is a straight line.",
    description:
      "Build the CAPM required-return equation, construct the Security Market Line, distinguish required from forecast and realized return, and interpret required return as cost of equity and opportunity cost.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 17,
    sourceRequired: true,
    conceptRole: "asset-pricing",
    skills: [
      "Security Market Line",
      "CAPM Required Return",
      "Market Risk Premium",
      "Cost of Equity",
    ],
    objectives: [
      "Explain why greater beta requires greater expected return.",
      "Define the market risk premium as compensation per unit of market exposure.",
      "Interpret beta as the quantity of market exposure and the market risk premium as the price per unit.",
      "Calculate the CAPM required return.",
      "Construct and read the Security Market Line.",
      "Explain why the SML is linear.",
      "Distinguish required return, forecast expected return, and realized return.",
      "Explain why high expected return is not automatically attractive.",
      "Distinguish the Security Market Line from the Capital Market Line.",
      "Interpret required return as investor opportunity cost and company cost of equity.",
    ],
    visual: interactive("security-market-line", "sml-plot"),
  },
  {
    slug: "capm-estimating-beta",
    moduleId: "m09-the-capm-and-apt",
    order: 3,
    shortTitle: "Estimating Beta",
    title: "Estimating Beta: From Return Data to Market Exposure",
    subtitle:
      "How beta is estimated from historical returns as the slope of a stock-versus-market regression, and why the estimate is uncertain.",
    description:
      "Interpret a stock-versus-market scatterplot, identify beta as the regression slope, distinguish beta, alpha, residuals, R-squared, and standard error, and assess whether a historical beta is economically reasonable.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 17,
    sourceRequired: true,
    conceptRole: "asset-pricing",
    skills: [
      "Beta Regression",
      "R-squared",
      "Residuals",
      "Standard Error",
      "Beta Estimation",
    ],
    objectives: [
      "Explain how beta is estimated from historical returns.",
      "Interpret a stock-versus-market scatterplot with excess returns on both axes.",
      "Identify beta as the regression slope.",
      "Distinguish beta, alpha, residuals, R-squared, and standard error.",
      "Explain why beta and R-squared answer different questions.",
      "Explain why estimated beta changes across samples.",
      "Assess whether a historical beta is economically reasonable.",
      "Use beta as an uncertain estimate rather than a permanent company label.",
    ],
    visual: interactive("capm-estimating-beta", "beta-regression"),
  },
  {
    slug: "capm-alpha-and-performance",
    moduleId: "m09-the-capm-and-apt",
    order: 4,
    title: "Alpha, Performance, and the Limits of CAPM",
    subtitle:
      "Evaluating investment performance against the CAPM benchmark and the empirical limits of the model.",
    type: "interactive",
    estimatedMinutes: 18,
    objectives: [
      "Define alpha as the difference between forecast and required return.",
      "Interpret alpha in performance evaluation.",
      "Discuss the empirical limitations of CAPM.",
    ],
    visual: interactive("capm-alpha-and-performance", "alpha-scatter"),
  },
  {
    slug: "capm-apt-in-practice",
    moduleId: "m09-the-capm-and-apt",
    order: 5,
    shortTitle: "CAPM and APT in Practice",
    title: "CAPM and APT in Practice",
    subtitle:
      "A synthesis and mastery lesson: move from market exposure to a defensible investment conclusion across the full Module 7 reasoning chain.",
    description:
      "Connected module recap, guided mixed practice, error diagnosis, an integrated Orion Fund case, a randomized mastery check, and the module conclusion.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 26,
    sourceRequired: true,
    conceptRole: "asset-pricing",
    skills: [
      "CAPM Synthesis",
      "Risk-Adjusted Performance",
      "Multifactor Reasoning",
      "Investment Judgment",
    ],
    objectives: [
      "Explain why CAPM equilibrium implies that the tangency portfolio becomes the market portfolio.",
      "Calculate and interpret portfolio beta.",
      "Distinguish beta from total volatility.",
      "Calculate CAPM required return.",
      "Interpret points above, on, or below the Security Market Line.",
      "Distinguish required, forecast, and realized return.",
      "Read a basic beta regression.",
      "Distinguish beta, R-squared, residuals, alpha, and standard error.",
      "Calculate CAPM alpha.",
      "Evaluate whether apparent alpha may reflect omitted factor exposure.",
      "Calculate a multifactor required return and explain the no-arbitrage intuition of APT.",
      "Compare CAPM and APT.",
      "Write a cautious, evidence-based performance conclusion.",
    ],
    visual: interactive("capm-apt-in-practice", "synthesis-case"),
  },
  {
    slug: "required-return-to-discount-rate",
    moduleId: "m10-capital-budgeting",
    order: 1,
    shortTitle: "Required Return → Discount Rate",
    title: "From Required Return to Discount Rate",
    subtitle:
      "Why the return investors require for systematic risk becomes the discount rate that converts risky future cash flows into present value.",
    description:
      "Connect CAPM to valuation: opportunity cost, one rate in three perspectives, the risk–value mechanism, and a positive-payoff but negative-NPV example.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 25,
    sourceRequired: true,
    conceptRole: "corporate-finance",
    skills: [
      "Opportunity Cost of Capital",
      "Discount Rate Logic",
      "Risk–Value Mechanism",
      "NPV Decisions",
    ],
    objectives: [
      "Explain why a return cannot be judged as attractive or unattractive in isolation.",
      "Compare a project's expected return with the return available from investments of similar systematic risk.",
      "Identify required return, discount rate, and opportunity cost of capital as three perspectives on the same rate.",
      "Derive present value as the price that earns exactly the required expected return.",
      "Explain why higher systematic risk lowers present value through the pricing mechanism.",
      "Use CAPM to connect systematic risk to the discount rate used in valuation.",
      "Distinguish a positive expected dollar payoff from a positive net present value.",
    ],
  },
  {
    slug: "determining-the-discount-rate",
    moduleId: "m10-capital-budgeting",
    order: 2,
    shortTitle: "Identifying Corporate Investments",
    title: "How Investors Identify and Evaluate Corporate Investments",
    subtitle:
      "Public companies rarely publish a project NPV. Investors reconstruct major uses of capital from filings, calls, and presentations, estimate reasonable ranges, and track results against management's claims.",
    description:
      "Bridging textbook capital budgeting and public-equity analysis: what counts as a project, where to find the information, three levels of visibility, a restaurant-expansion worked case, project-specific discount rates, pure-play comparables, scenario analysis, and forecast-versus-actual monitoring.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "corporate-finance",
    skills: [
      "Disclosure Reconstruction",
      "Project Risk Matching",
      "Pure-Play Comparables",
      "Scenario & Break-Even Analysis",
      "Forecast vs. Actual Monitoring",
    ],
    objectives: [
      "Distinguish a textbook project model from the incomplete information public investors actually receive.",
      "Identify the major uses of corporate capital from filings, earnings calls, presentations, and transaction announcements.",
      "Classify an investment's level of disclosure visibility and choose the appropriate depth of analysis.",
      "Reconstruct an illustrative incremental cash-flow estimate from disclosed unit economics, separating known facts from investor assumptions.",
      "Explain why the project-specific discount rate may differ from the parent company's historical rate, using CAPM.",
      "Apply the pure-play comparable method to construct a reasonable discount-rate range.",
      "Use scenario and break-even analysis to identify which assumptions determine whether value is created.",
      "Distinguish execution, operating, financial, and strategic performance when monitoring a project after commitment.",
      "Recognize that revenue growth or EPS accretion alone is not proof of value creation.",
    ],
  },
  {
    slug: "when-risk-changes-over-time",
    moduleId: "m10-capital-budgeting",
    order: 3,
    shortTitle: "When Risk Changes Over Time",
    title: "When Risk Changes Over Time",
    subtitle:
      "Different stages or cash flows within the same investment can carry different risks — and may justify different discount rates. Probability affects expected cash flow; the discount rate compensates for systematic risk.",
    description:
      "Stage-specific discount rates using the MIT oil-exploration example: separating probability weighting from systematic risk, avoiding double counting, and knowing when one rate remains a reasonable approximation.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 28,
    sourceRequired: true,
    conceptRole: "corporate-finance",
    skills: [
      "Stage-Specific Discount Rates",
      "Probability vs. Systematic Risk",
      "Oil-Exploration Valuation",
      "Double-Counting Avoidance",
      "Milestone-Based Updating",
    ],
    objectives: [
      "Explain how a single investment may pass through stages with different economic risks.",
      "Distinguish expected cash flow, systematic risk, and timing as three separate concepts.",
      "Explain why a high probability of failure does not automatically imply a high CAPM discount rate.",
      "Apply stage-specific discount rates using the MIT oil-exploration example.",
      "Distinguish zero beta from zero uncertainty.",
      "Compare the single-rate and stage-specific valuation approaches.",
      "Identify and avoid double counting of risk.",
      "Recognize when one discount rate remains a reasonable approximation.",
      "Update a valuation after major milestones resolve uncertainty.",
    ],
  },
  {
    slug: "npv-rule",
    moduleId: "m10-capital-budgeting",
    order: 4,
    shortTitle: "NPV: The Value-Creation Rule",
    title: "Net Present Value as the Value-Creation Rule",
    subtitle:
      "NPV measures how much value an investment is expected to create or destroy after compensating investors for time and systematic risk. Why a profitable project can still destroy value — and how outside investors reconstruct NPV from incomplete information.",
    description:
      "Combining cash-flow estimates and risk-adjusted discount rates into the central capital-allocation decision: present value vs. capital committed, value additivity, scale, incremental cash flows, sunk costs, scenario analysis, break-even, and the gap between corporate value creation and stock-price reaction.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 32,
    sourceRequired: true,
    conceptRole: "corporate-finance",
    skills: [
      "NPV Calculation",
      "Value Additivity",
      "Incremental Cash Flow Identification",
      "Scale and Mutually Exclusive Choice",
      "Break-Even NPV Analysis",
      "Corporate Value vs. Market Expectation",
    ],
    objectives: [
      "Explain why a project with positive expected profit can still have negative NPV.",
      "Distinguish present value, capital committed, and net present value.",
      "Connect positive NPV to an estimated increase in firm value through value additivity.",
      "Compare expected return and NPV as two views of the same investment.",
      "Explain why the highest percentage-return project may not create the most total value.",
      "Build an NPV estimate for a restaurant expansion using incremental after-tax cash flows.",
      "Identify incremental cash flows, opportunity costs, cannibalization, working capital, and sunk costs.",
      "Distinguish NPV from revenue growth, accounting profit, EPS accretion, payback, and ROIC.",
      "Explain why corporate value creation can differ from an immediate stock-price reaction.",
      "Use scenario and break-even analysis to test whether an NPV estimate is robust.",
      "Apply the independent vs. mutually exclusive investment rules.",
    ],
  },
  {
    slug: "irr-and-payback",
    moduleId: "m10-capital-budgeting",
    order: 5,
    shortTitle: "Useful Shortcuts, Wrong Decisions",
    title: "Useful Shortcuts, Wrong Decisions",
    subtitle:
      "IRR, payback, profitability index, EPS accretion, and ROIC each answer a narrower question than NPV. Learn what each reveals, what it omits, and when it can lead to the wrong decision.",
    description:
      "Why managers and investors use alternative investment metrics, the conditions under which IRR agrees with NPV, the scale and timing conflicts, multiple IRRs, payback blind spots, and how to use all six metrics together as diagnostic tools anchored by NPV.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "corporate-finance",
    skills: [
      "IRR Interpretation and Limits",
      "Payback and Discounted Payback",
      "Profitability Index",
      "Multiple IRR Diagnosis",
      "EPS Accretion vs. Value Creation",
      "ROIC as Performance Monitoring",
    ],
    objectives: [
      "Explain why alternative metrics remain popular despite NPV being the correct economic rule.",
      "Compute and interpret payback period and discounted payback.",
      "Identify what payback reveals and what it omits, including post-payback cash flows.",
      "Define IRR as the discount rate that makes NPV equal to zero.",
      "State the conditions under which IRR and NPV agree for conventional independent projects.",
      "Explain why IRR can misrank mutually exclusive investments due to scale and timing.",
      "Recognize nonconventional cash flows that produce multiple or nonexistent IRRs.",
      "Distinguish investment and financing cash-flow patterns for IRR interpretation.",
      "Compute and interpret the profitability index and its scale limitation.",
      "Distinguish EPS accretion from acquisition value creation.",
      "Connect ROIC to realized capital-allocation performance.",
      "Evaluate one investment through all six metrics and investigate contradictions.",
    ],
  },
  {
    slug: "project-cash-flows",
    moduleId: "m10-capital-budgeting",
    order: 6,
    shortTitle: "Evaluating Capital Allocation",
    title: "Evaluating Management\u2019s Capital Allocation",
    subtitle:
      "Once a company generates cash, how should management deploy it\u2014and how can investors determine whether those decisions create shareholder value? Maintenance, organic growth, acquisitions, debt repayment, buybacks, dividends, and cash retention as competing uses.",
    description:
      "The most portfolio-management-relevant lesson in Module 8: competing uses of capital, marginal reinvestment, acquisition price versus value, buyback price dependence, dividend appropriateness, cash trade-offs, a $1 billion allocator case, multi-year track-record reconstruction, and a capital-allocation scorecard.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "corporate-finance",
    skills: [
      "Capital Allocation Framework",
      "Marginal Reinvestment Analysis",
      "Acquisition Price Discipline",
      "Buyback Price Evaluation",
      "Track-Record Reconstruction",
      "Capital Allocation Scorecard",
    ],
    objectives: [
      "Explain why every use of corporate cash has an opportunity cost.",
      "Distinguish maintenance investment from growth investment.",
      "Evaluate organic reinvestment using incremental returns and NPV.",
      "Explain why historical ROIC does not guarantee attractive returns on the next dollar invested.",
      "Describe reinvestment runway as the product of return, scale, and duration.",
      "Apply marginal capital-allocation logic using a declining opportunity schedule.",
      "Separate acquisition business quality from purchase price.",
      "Evaluate debt repayment as an economic alternative with interest, distress, and financing benefits.",
      "Explain when dividends may protect value by preventing poor reinvestment.",
      "Demonstrate that buyback value depends on price relative to intrinsic value.",
      "Identify buyback complications including dilution offset, timing, and leverage.",
      "Evaluate cash retention as a trade-off between flexibility and inefficiency.",
      "Apply a practical capital-allocation hierarchy without treating it as a universal law.",
      "Reconstruct a multi-year sources-and-uses track record from public disclosures.",
      "Score capital allocation using evidence-based criteria with mixed conclusions.",
      "Recognize management-incentive red flags in capital allocation.",
      "Distinguish corporate value creation from stock-market reaction.",
    ],
  },
  {
    slug: "sensitivity-and-scenario-analysis",
    moduleId: "m10-capital-budgeting",
    order: 7,
    shortTitle: "Capital Allocation Case",
    title: "The Capital Allocation Case: Reinvest, Acquire, or Return Cash?",
    subtitle:
      "Apply the complete Module 8 framework to one fictional public-equity case: Meridian Dining Group. Reconstruct project economics from fragmented disclosures, evaluate store expansion, acquisition, buyback, and debt repayment, and build a defensible $600 million allocation plan.",
    description:
      "Cumulative Module 8 capstone: a fictional restaurant-company case requiring students to identify capital uses, separate facts from assumptions, build store NPV models, evaluate declining marginal returns, assess an acquisition with conflicting metrics, evaluate a buyback, and update the thesis after Year 1 actual results.",
    type: "case-study",
    lessonType: "Interactive Case Study",
    estimatedMinutes: 40,
    sourceRequired: true,
    conceptRole: "corporate-finance",
    skills: [
      "Integrated Capital Allocation",
      "Disclosure Reconstruction",
      "Multi-Metric Conflict Resolution",
      "Marginal Return Analysis",
      "Forecast vs. Actual Monitoring",
      "Investment Memo Construction",
    ],
    objectives: [
      "Apply the complete Module 8 framework to evaluate management's proposed capital allocation.",
      "Separate disclosed facts, management forecasts, and investor assumptions from a fragmented disclosure packet.",
      "Reconstruct a representative store cash-flow model and calculate NPV, IRR, and payback.",
      "Correct the restaurant-level-margin-divided-by-development-cost shortcut.",
      "Evaluate declining marginal returns across store tranches and reject negative-marginal-NPV investments.",
      "Assess an acquisition with conflicting NPV, IRR, EPS, and ROIC signals.",
      "Evaluate a share repurchase using uncertain intrinsic value and opportunity cost.",
      "Consider debt repayment and liquidity as genuine capital-allocation alternatives.",
      "Build a defensible $600 million allocation plan with realistic constraints.",
      "Distinguish value created from value destruction avoided.",
      "Separate corporate value creation from market-expectation surprise.",
      "Update the investment thesis when Year 1 actual results differ from forecasts.",
      "Assess management credibility from evidence rather than tone.",
      "Construct a structured investment memo integrating all Module 8 concepts.",
    ],
  },
  {
    slug: "real-options-intuition",
    moduleId: "m10-capital-budgeting",
    order: 8,
    title: "Real Options Intuition",
    subtitle: "Flexibility as value in capital budgeting.",
    type: "reading",
    estimatedMinutes: 15,
    objectives: [
      "Describe real options in projects.",
      "Explain how flexibility adds value beyond static NPV.",
    ],
  },
  {
    slug: "efficient-market-hypothesis",
    moduleId: "m11-efficient-markets",
    order: 1,
    shortTitle: "Why Beating the Market Is Difficult",
    title: "Why Beating the Market Is Difficult",
    subtitle:
      "When you discover that a company looks attractive, how do you know the market has not already discovered the same thing? A good company is not automatically a good investment.",
    description:
      "How public information is incorporated into prices, why obvious opportunities attract competition and disappear, price as an expectation, the Challenger price-discovery case, information versus edge, and what could create a genuine investment advantage.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 22,
    sourceRequired: true,
    conceptRole: "market-efficiency",
    skills: [
      "Price-as-Expectation Reasoning",
      "Information vs. Edge Distinction",
      "Good Company vs. Good Investment",
      "Market Efficiency Misconceptions",
      "Investment Checklist Discipline",
    ],
    objectives: [
      "Explain how public information affects market prices.",
      "Explain why obvious investment opportunities attract competition and disappear.",
      "Distinguish a good company from a good investment.",
      "Distinguish information from a differentiated investment insight.",
      "Explain what market efficiency does and does not claim.",
      "Identify what could constitute a genuine investment edge.",
    ],
  },
  {
    slug: "forms-of-market-efficiency",
    moduleId: "m11-efficient-markets",
    title: "Forms of Market Efficiency",
    subtitle: "Weak, semi-strong, and strong efficiency.",
    type: "reading",
    estimatedMinutes: 15,
    objectives: [
      "Distinguish weak, semi-strong, and strong forms.",
      "Identify the information sets each form assumes.",
    ],
  },
  {
    slug: "anomalies-and-limits-to-arbitrage",
    moduleId: "m11-efficient-markets",
    order: 3,
    shortTitle: "Why Markets Still Make Mistakes",
    title: "Why Markets Still Make Mistakes",
    subtitle:
      "If markets sometimes misprice assets, why do sophisticated investors not immediately trade those mistakes away? Behavioral errors, limits to arbitrage, forced liquidation, and the difference between recognizing a mispricing and surviving long enough to profit from it.",
    description:
      "How predictable behavioral mistakes (loss aversion, anchoring, overconfidence, herding) create price pressure, why recognizing a mispricing is not the same as being able to profit from it, the five practical limits to arbitrage, a deterministic short-position survival simulation, feedback loops between prices and fundamentals, risk versus uncertainty, adaptive markets, the strategy lifecycle, and a four-part practical framework for evaluating an apparent mispricing.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "market-efficiency",
    skills: [
      "Behavioral Bias Identification",
      "Limits-to-Arbitrage Reasoning",
      "Short-Position Survival Analysis",
      "Mispricing vs. Risk Compensation",
      "Forced-Liquidation Feedback Loops",
      "Adaptive-Markets Judgment",
    ],
    objectives: [
      "Identify several common behavioral errors that affect investment decisions.",
      "Distinguish investor irrationality from limits to arbitrage.",
      "Explain why a mispricing can grow before it disappears.",
      "Explain how leverage, withdrawals, margin calls, and forced selling amplify price movements.",
      "Distinguish genuine mispricing from compensation for hidden risk.",
      "Explain why market efficiency may vary across time and market conditions.",
      "Evaluate an apparent mispricing using valuation, catalyst, implementation, and survival questions.",
    ],
  },
  {
    slug: "active-vs-passive-investing",
    moduleId: "m11-efficient-markets",
    order: 4,
    shortTitle: "Active vs. Passive Investing",
    title: "Active Versus Passive Investing",
    subtitle:
      "When an investor pays for active management, what exactly are they paying for, and how can they determine whether they received it? Benchmark selection, beta versus alpha, fee compounding, skill versus luck, and when active management may be defensible.",
    description:
      "Evaluating active management claims: choosing appropriate benchmarks, separating market exposure from manager skill, understanding the fee hurdle, distinguishing skill from luck through a seeded simulation, survivorship bias, outcome quality versus decision quality, and the adaptive-markets lifecycle of strategies.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 28,
    sourceRequired: true,
    conceptRole: "market-efficiency",
    skills: [
      "Benchmark Selection",
      "Beta vs. Alpha Decomposition",
      "Fee Compounding Analysis",
      "Skill vs. Luck Diagnosis",
      "Outcome vs. Process Evaluation",
      "Active Management Justification",
    ],
    objectives: [
      "Distinguish active and passive investing.",
      "Explain why choosing the correct benchmark matters.",
      "Separate market exposure from manager skill using beta and alpha.",
      "Explain how fees and trading costs affect long-term results.",
      "Distinguish skill from luck using a seeded simulation.",
      "Evaluate investment process separately from outcome.",
      "Identify when active management may or may not be defensible.",
      "Explain why active strategies can stop working as competition increases.",
    ],
  },
  {
    slug: "building-investment-philosophy",
    moduleId: "m11-efficient-markets",
    order: 5,
    shortTitle: "Building an Investment Philosophy",
    title: "Building an Investment Philosophy",
    subtitle:
      "Given that markets are difficult to beat but not perfectly efficient, how should an investor actually behave? A practical synthesis converting market beliefs, expected return sources, claimed edges, implementation choices, constraints, and risk controls into a coherent personal decision framework.",
    description:
      "Concluding lesson of Module 9. Distinguishes philosophy, strategy, and portfolio decisions; the five questions every philosophy must answer; passive, active, or blended implementation; a guided philosophy builder; protective behavioral rules; rewriting weak rules; separating thesis, catalyst, and survival plan; a complete-philosophy case study; a portfolio decision journal; a process scorecard; when to revise a philosophy; red-flag diagnostics; and an editable personal investment policy statement.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "market-efficiency",
    skills: [
      "Investment Philosophy Articulation",
      "Edge Specificity Assessment",
      "Implementation Coherence",
      "Behavioral Rule Design",
      "Process vs. Outcome Evaluation",
      "Investment Policy Statement Drafting",
    ],
    objectives: [
      "Define an investment philosophy and distinguish it from a strategy or an isolated trade.",
      "Identify the claimed source of expected return and assess whether an alleged edge is specific and testable.",
      "Choose a passive, active, or blended implementation that follows from stated beliefs and constraints.",
      "Define behavioral and portfolio rules before acting, including position sizing, invalidation conditions, and review cadence.",
      "Separate thesis, correction mechanism, and survival plan as components of a complete investment case.",
      "Evaluate process separately from outcome and identify when a philosophy should or should not be revised.",
      "Draft a concise personal investment policy statement.",
    ],
  },
  {
    slug: "information-and-prices",
    moduleId: "m11-efficient-markets",
    title: "Information and Prices",
    subtitle: "How information gets into prices.",
    type: "reading",
    estimatedMinutes: 15,
    objectives: [
      "Describe the process of information incorporation.",
      "Interpret price as an information aggregator.",
    ],
  },
  {
    slug: "course-integration-map",
    moduleId: "m12-integrated-portfolio-studio-application",
    title: "Course Integration Map",
    subtitle: "Connecting the modules into one workflow.",
    type: "reading",
    estimatedMinutes: 20,
    objectives: [
      "Map how modules connect into an investment workflow.",
      "Identify where each concept is applied in the studio.",
    ],
  },
  {
    slug: "integrated-security-analysis-case",
    moduleId: "m12-integrated-portfolio-studio-application",
    title: "Integrated Security Analysis Case",
    subtitle: "A full security analysis walkthrough.",
    type: "case-study",
    estimatedMinutes: 30,
    objectives: [
      "Combine statements, valuation, and risk in one analysis.",
      "Produce a defensible view on a security.",
    ],
    visual: visual("integrated-security-analysis-case", "analysis-case"),
  },
  {
    slug: "portfolio-studio-application",
    moduleId: "m12-integrated-portfolio-studio-application",
    title: "Portfolio Studio Application",
    subtitle: "Building a portfolio in the studio.",
    type: "simulation",
    estimatedMinutes: 30,
    objectives: [
      "Construct a portfolio using course tools.",
      "Evaluate portfolio risk and return trade-offs.",
    ],
    visual: interactive("portfolio-studio-application", "portfolio-builder"),
  },
  {
    slug: "final-investment-decision-framework",
    moduleId: "m12-integrated-portfolio-studio-application",
    title: "Final Investment Decision Framework",
    subtitle: "A repeatable framework for investment decisions.",
    type: "reading",
    estimatedMinutes: 20,
    objectives: [
      "Assemble a repeatable investment decision framework.",
      "Connect security analysis to portfolio decisions.",
    ],
  },
  {
    slug: "if-1-1-how-an-investor-builds-a-philosophy",
    moduleId: "if-m01-introduction-to-investment-philosophies",
    order: 1,
    shortTitle: "Observe the Market First",
    title: "Observe the Market First",
    subtitle:
      "Read what three companies actually disclosed, watch what happened next, and learn to say only what the evidence supports.",
    description:
      "Mission 2's evidence desk. The learner reads three dated disclosures before seeing any price: Netflix in April 2022, where revenue grew 9.8% while paid net additions came in at -0.20 million against the company's own guidance of +2.5 million; NVIDIA in May 2023, where a quarter down 13% on the year arrived with an outlook of $11.00 billion; and GameStop in January 2021, where the SEC's own staff report declined to attribute the episode to short covering and concluded it was positive sentiment that sustained the move. Every figure is quoted from a primary source. Price reactions are given as direction and magnitude only, because the lesson forbids reasoning from the size of a move. The mission ends in a Market Observation Note rather than a belief, and 'three cases cannot support a belief' is a valid way to finish it.",
    type: "interactive",
    lessonType: "Portfolio Mission",
    estimatedMinutes: 17,
    sourceRequired: true,
    conceptRole: "investment-philosophy",
    skills: [
      "Source Reading",
      "Expectations vs Results",
      "Observation vs Inference",
      "Evidentiary Restraint",
    ],
    objectives: [
      "Tell an event, a price response, and an inference apart, and say which one is yours.",
      "Separate a past result from a current condition and a forward expectation inside one filing.",
      "Explain how a company can report growth and still disappoint the expectations investors held.",
      "Identify the disclosure that changed expectations, without claiming the price response was correctly sized.",
      "Recognise an episode whose evidence does not isolate a single cause, and name what is missing.",
      "Sort claims into supported, plausible and not established by the evidence in front of you.",
      "State that three cases cannot establish a repeatable pattern, and treat that as a finding.",
    ],
  },
  {
    slug: "if-1-2-where-philosophy-enters-the-investment-process",
    moduleId: "if-m01-introduction-to-investment-philosophies",
    order: 2,
    shortTitle: "Where Philosophy Enters",
    title: "Where Philosophy Enters the Process",
    subtitle:
      "Map the five-stage investment process, locate where a philosophy claims an advantage, and keep its logic intact through execution and evaluation.",
    description:
      "A guided process lab covering investor mandate, asset allocation, security selection, execution, and evaluation; the distinction between allocation and selection; philosophy placement; implementation coherence; and a saved process-placement card.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 18,
    sourceRequired: true,
    conceptRole: "investment-philosophy",
    skills: [
      "Investment Process Mapping",
      "Allocation vs Selection",
      "Philosophy Placement",
      "Implementation Coherence",
      "Benchmark Discipline",
    ],
    objectives: [
      "Sequence the five stages of the investment process from investor mandate through evaluation.",
      "Distinguish asset-allocation decisions from security-selection decisions.",
      "Identify the stage where a philosophy claims its primary advantage.",
      "Trace one market belief through a coherent set of portfolio, execution, and evaluation decisions.",
      "Save a process placement, execution rule, and evaluation rule for a provisional philosophy.",
    ],
  },
  {
    slug: "if-1-3-comparing-investment-philosophy-families",
    moduleId: "if-m01-introduction-to-investment-philosophies",
    order: 3,
    shortTitle: "Six Ways Investors Claim an Edge",
    title: "Six Ways Investors Claim an Edge",
    subtitle:
      "Compare market timing, value, growth, momentum, information-based investing, and relative-value arbitrage by the opportunity each claims, the evidence it needs, and the ways it can fail.",
    description:
      "An interactive research lab for decoding the six major active philosophy families, comparing their company lenses and process coordinates, stress-testing their claimed advantages, and saving a provisional research shortlist without treating recent returns as proof.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 20,
    sourceRequired: true,
    conceptRole: "investment-philosophy",
    skills: [
      "Philosophy Family Classification",
      "Claimed-Edge Analysis",
      "Failure-Mode Diagnosis",
      "Process Coordinate Mapping",
      "Evidence Standard Design",
    ],
    objectives: [
      "Define six major investment-philosophy families by their claimed source of advantage rather than by recent performance.",
      "Identify which philosophy family a market claim supports.",
      "Compare how different philosophy families interpret the same company or market evidence.",
      "Match each family with a material failure mode and an evidence test.",
      "Map selected families by decision stage, investor involvement, and typical horizon.",
      "Save a provisional family shortlist and evidence standard for later investor-fit analysis.",
    ],
  },
  {
    slug: "if-1-4-when-a-philosophy-fits-the-investor",
    moduleId: "if-m01-introduction-to-investment-philosophies",
    order: 4,
    shortTitle: "Investor–Philosophy Fit",
    title: "When a Philosophy Fits the Investor",
    subtitle:
      "Match a philosophy's implementation demands with the investor's horizon, liquidity, loss capacity, behavior, resources, and account context.",
    description:
      "A guided investor-fit lab defining demand–capacity matching, separating strategy demands from investor capacity and preference, comparing two investors with the same market belief, diagnosing binding constraints, rehearsing difficult moments, and saving a provisional fit charter.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 22,
    sourceRequired: true,
    conceptRole: "investment-philosophy",
    skills: [
      "Investor–Philosophy Fit",
      "Demand–Capacity Analysis",
      "Constraint Diagnosis",
      "Behavioral Review Rules",
      "Implementation Charter Design",
    ],
    objectives: [
      "Define investor–philosophy fit as a match between a philosophy's implementation demands and the investor's actual capacity.",
      "Distinguish strategy demand, investor capacity, and investor preference.",
      "Explain how horizon, liquidity, loss capacity, behavior, resources, costs, and tax context affect implementation.",
      "Derive different portfolio actions for two investors who share the same market belief.",
      "Identify the binding constraint that prevents a philosophy from being executed as designed.",
      "Apply evidence-based review rules during losses, thesis changes, and emerging cash needs.",
      "Save a provisional investor-fit charter for one shortlisted philosophy family.",
    ],
  },
  {
    slug: "if-2-1-reading-a-bonds-promise",
    moduleId: "if-m02-risk-in-bonds",
    order: 1,
    shortTitle: "Reading the Promise",
    title: "Reading a Bond’s Promise",
    subtitle:
      "Decode a conventional fixed-rate bond, construct its promised cash flows, and identify the two bond risks emphasized in this source session.",
    description:
      "A guided bond-contract lab defining issuer, bondholder, coupon, face value, and maturity before learners build a ten-year payment map and distinguish interest-rate risk from default risk.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 18,
    sourceRequired: true,
    conceptRole: "bond-risk",
    skills: [
      "Bond Contract Reading",
      "Cash-Flow Timeline Construction",
      "Interest-Rate Risk Classification",
      "Default-Risk Classification",
    ],
    objectives: [
      "Define a conventional fixed-rate bond through its issuer, bondholder, coupon, face value, and maturity.",
      "Translate a 4% coupon rate on $1,000 face value into a $40 annual payment.",
      "Construct the complete payment timeline for a ten-year coupon bond.",
      "Distinguish interest-rate risk from default risk using concrete events.",
      "Produce a Bond Payment Map for the scholarship-fund case.",
    ],
  },
  {
    slug: "if-2-2-why-market-rates-change-bond-prices",
    moduleId: "if-m02-risk-in-bonds",
    order: 2,
    shortTitle: "Rates and Bond Prices",
    title: "Why Market Rates Change Bond Prices",
    subtitle:
      "Use present value to connect changes in market yield to bond price, premium or discount status, and an investor’s holding-period return.",
    description:
      "An interactive repricing lab using Damodaran’s verified 4% coupon, ten-year bond values and one-year holding-period assessment to make the inverse rate-price relationship visible.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 20,
    sourceRequired: true,
    conceptRole: "bond-risk",
    skills: [
      "Present-Value Reasoning",
      "Bond Repricing",
      "Premium-Par-Discount Classification",
      "Holding-Period Return Analysis",
    ],
    objectives: [
      "Define market yield and present value before using them to price a bond.",
      "Explain why rising market yields lower the present value of fixed promised payments.",
      "Classify a bond as trading at a premium, par, or discount from its coupon-yield relationship.",
      "Separate coupon income from market-price change in a one-year holding-period return.",
      "State the investor’s holding horizon when interpreting an interest-rate-driven price change.",
    ],
  },
  {
    slug: "if-2-3-duration-measuring-interest-rate-sensitivity",
    moduleId: "if-m02-risk-in-bonds",
    order: 3,
    shortTitle: "Measuring Duration",
    title: "Duration: Measuring Interest-Rate Sensitivity",
    subtitle:
      "Measure weighted-average cash-flow timing, test how coupon and maturity change duration, and rank bonds by interest-rate exposure.",
    description:
      "A cash-flow center-of-gravity lab that reconstructs the verified 8.36-year Macaulay duration example, tests coupon and maturity one at a time, and distinguishes Macaulay from modified duration.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 22,
    sourceRequired: true,
    conceptRole: "bond-risk",
    skills: [
      "Macaulay Duration Interpretation",
      "Coupon Sensitivity Analysis",
      "Maturity Sensitivity Analysis",
      "Bond Duration Ranking",
    ],
    objectives: [
      "Define Macaulay duration as weighted-average cash-flow timing expressed in years.",
      "Reconstruct the verified $922.78 price and 8.36-year duration source example.",
      "Explain why lower coupons and longer maturities produce higher duration when other inputs are comparable.",
      "Rank four bonds by duration using coupon and maturity evidence.",
      "Distinguish Macaulay duration from modified duration’s approximate percentage price sensitivity.",
    ],
  },
  {
    slug: "if-2-4-default-risk-can-the-issuer-deliver",
    moduleId: "if-m02-risk-in-bonds",
    order: 4,
    shortTitle: "Default Risk",
    title: "Default Risk: Can the Issuer Deliver?",
    subtitle:
      "Connect operating cash-flow capacity, stability, and fixed commitments to the issuer’s ability to make promised bond payments.",
    description:
      "A guided issuer stress lab defining default risk and its three source drivers before learners construct a credit-rating evidence file and compare two fictional issuers.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 20,
    sourceRequired: true,
    conceptRole: "bond-risk",
    skills: [
      "Default-Risk Analysis",
      "Payment-Cushion Analysis",
      "Credit Evidence Evaluation",
      "Issuer Comparison",
    ],
    objectives: [
      "Define default risk as the possibility that an issuer misses some or all promised payments.",
      "Explain how operating cash-flow capacity, cash-flow stability, and fixed commitments affect default risk.",
      "Trace business events through the issuer’s payment cushion to a change in default risk.",
      "Define a credit rating as an agency estimate based on quantitative and qualitative evidence.",
      "Compare two issuers using payment capacity, stability, and fixed commitments.",
    ],
  },
  {
    slug: "if-2-5-from-credit-rating-to-bond-price",
    moduleId: "if-m02-risk-in-bonds",
    order: 5,
    shortTitle: "Rating to Price",
    title: "From Credit Rating to Bond Price",
    subtitle:
      "Build a required yield from a risk-free yield and default spread, calculate interest coverage, and translate credit evidence into price.",
    description:
      "A required-yield and synthetic-rating lab using verified source calculations, explicitly dated historical tables, and a final Bond Risk Brief integrating all five lessons.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 24,
    sourceRequired: true,
    conceptRole: "bond-risk",
    skills: [
      "Required-Yield Construction",
      "Default-Spread Interpretation",
      "Interest-Coverage Calculation",
      "Synthetic-Rating Qualification",
      "Bond Risk Communication",
    ],
    objectives: [
      "Define risk-free yield, default spread, and required yield and combine them correctly.",
      "Price the source assessment bond at a 5.5% required yield and explain its $962.31 discount price.",
      "Calculate interest coverage as EBIT divided by interest expense.",
      "Explain why a synthetic rating depends on a specified table’s date, thresholds, and company-size category.",
      "Produce a Bond Risk Brief connecting payments, rate exposure, duration, default evidence, required yield, and price.",
    ],
  },
  {
    slug: "if-3-1-what-risk-means-for-a-shareholder",
    moduleId: "if-m03-risk-in-stocks",
    order: 1,
    shortTitle: "Shareholder Risk",
    title: "What Risk Means for a Shareholder",
    subtitle:
      "Define uncertain outcomes and the shareholder's residual claim, then inspect equity risk through three independent dimensions.",
    description:
      "A guided risk-lens lab that defines equity before use, follows a company cash waterfall to the shareholder residual, and separates price from cash-flow risk, total from downside risk, and standalone from portfolio-added risk.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 20,
    sourceRequired: true,
    conceptRole: "equity-risk",
    skills: [
      "Equity and Residual-Claim Interpretation",
      "Expected vs Actual Return",
      "Price vs Cash-Flow Risk",
      "Total vs Downside Risk",
      "Standalone vs Portfolio-Added Risk",
    ],
    objectives: [
      "Define risk as exposure to uncertain outcomes that may finish above or below expectations.",
      "Define equity as a residual claim on earnings and cash flow after other claims are met.",
      "Distinguish expected return from the actual return that occurs.",
      "Distinguish price risk from cash-flow risk using a stable-dividend, changing-price case.",
      "Distinguish total from downside risk and standalone from portfolio-added risk.",
      "Produce a Three-Lens Risk Map before selecting any risk measure.",
    ],
  },
  {
    slug: "if-3-2-why-diversification-changes-the-question",
    moduleId: "if-m03-risk-in-stocks",
    order: 2,
    shortTitle: "Diversification",
    title: "Why Diversification Changes the Question",
    subtitle:
      "Map return dispersion, build a diversified portfolio, and separate company-specific risk from market risk.",
    description:
      "A portfolio-constellation lab defining expected return, variance, portfolio, diversification, company-specific risk, market risk, and the marginal investor before learners diagnose which shocks diversification can soften.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 22,
    sourceRequired: true,
    conceptRole: "equity-risk",
    skills: [
      "Expected-Return and Variance Interpretation",
      "Portfolio Construction",
      "Diversification Reasoning",
      "Company-Specific vs Market Risk",
      "Marginal-Investor Interpretation",
    ],
    objectives: [
      "Define expected return as a probability-weighted average and variance as dispersion around that expectation.",
      "Define a portfolio and diversification before using them in a risk prompt.",
      "Explain why diversification can reduce company-specific risk but provides less protection from shared market risk.",
      "Define the marginal investor as the investor whose trade sets the current price.",
      "Explain why theory-based models use the perspective of a diversified marginal investor.",
      "Classify concrete events as company-specific or market risk from portfolio evidence.",
    ],
  },
  {
    slug: "if-3-3-what-beta-measures",
    moduleId: "if-m03-risk-in-stocks",
    order: 3,
    shortTitle: "What Beta Measures",
    title: "What Beta Measures",
    subtitle:
      "Build CAPM, use beta 1 as the market benchmark, and inspect the estimation uncertainty inside regression beta.",
    description:
      "An interactive CAPM and beta lab defining every input, modeling positive and negative market responses, reconstructing the historical 2005–07 weekly Amgen regression, and correcting beta misconceptions before assessment.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 25,
    sourceRequired: true,
    conceptRole: "equity-risk",
    skills: [
      "CAPM Required-Return Construction",
      "Beta Benchmark Interpretation",
      "Regression-Beta Reading",
      "Estimation-Uncertainty Analysis",
      "Beta Misconception Diagnosis",
    ],
    objectives: [
      "Define CAPM, the risk-free rate, beta, and the equity risk premium before calculating required return.",
      "Calculate a 10% required return from a 4% risk-free rate, beta 1.20, and a 5% equity risk premium in an OPS case.",
      "Interpret beta 1.20 as 20% more market sensitivity than beta 1 for a diversified investor.",
      "Define regression beta as an estimated slope relating historical stock and market returns.",
      "Explain how index, frequency, period, and statistical error affect a beta estimate.",
      "Explain why beta is not total risk, a precise permanent fact, or investment quality.",
    ],
  },
  {
    slug: "if-3-4-what-makes-beta-rise-or-fall",
    moduleId: "if-m03-risk-in-stocks",
    order: 4,
    shortTitle: "Beta Drivers",
    title: "What Makes Beta Rise or Fall",
    subtitle:
      "Trace product demand, fixed operating costs, and debt through cash-flow sensitivity to predicted beta.",
    description:
      "A business beta engine that runs common economic shocks through discretionary demand, operating leverage, and financial leverage, making each cause-and-effect mechanism visible and preserving the other-things-equal qualification.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 22,
    sourceRequired: true,
    conceptRole: "equity-risk",
    skills: [
      "Product-Cyclicality Analysis",
      "Operating-Leverage Analysis",
      "Financial-Leverage Analysis",
      "Cash-Flow Sensitivity Mapping",
      "Conditional Beta Reasoning",
    ],
    objectives: [
      "Define product cyclicality through customer-demand sensitivity to broad economic conditions.",
      "Define operating leverage as the sensitivity of operating profit created by fixed operating costs.",
      "Define financial leverage as shareholder sensitivity created by debt and fixed interest payments.",
      "Trace a broad economic shock through revenue, operating profit, and the shareholder residual.",
      "Explain why discretionary demand, higher fixed costs, and more debt can raise predicted beta, other things held equal.",
      "Treat the fundamental relationships as conditional mechanisms rather than deterministic company labels.",
    ],
  },
  {
    slug: "if-3-5-choosing-a-risk-measure",
    moduleId: "if-m03-risk-in-stocks",
    order: 5,
    shortTitle: "Risk Measures",
    title: "Choosing a Risk Measure",
    subtitle:
      "State CAPM's limitations and match theory, accounting, proxy, market-implied, cash-flow, and price-buffer methods to investor questions.",
    description:
      "A risk-method switchboard covering CAPM limitations, APT and multi-factor alternatives, accounting ratios and accounting beta, proxy variables, market-implied return, certainty-equivalent cash flow, and margin of safety.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 25,
    sourceRequired: true,
    conceptRole: "equity-risk",
    skills: [
      "CAPM Limitation Analysis",
      "Multi-Factor Model Comparison",
      "Accounting and Proxy Evidence Classification",
      "Risk-Method Selection",
      "Method-Limitation Communication",
    ],
    objectives: [
      "Explain CAPM's strong assumptions, noisy estimated inputs, and limited empirical explanatory power.",
      "Distinguish CAPM, APT, multi-factor, and proxy model structures.",
      "Distinguish accounting indicators from proxy characteristics associated with returns.",
      "Explain why proxy association does not establish causation or persistence.",
      "Match seven investor questions to appropriate risk-measure families and state each method's limitation.",
      "Choose a primary risk method and a secondary check based on the investor and decision.",
    ],
  },
  {
    slug: "if-3-6-build-an-equity-risk-policy",
    moduleId: "if-m03-risk-in-stocks",
    order: 6,
    shortTitle: "Equity Risk Policy",
    title: "Build an Equity Risk Policy",
    subtitle:
      "Apply market-implied return, certainty-equivalent cash flow, and margin of safety, then defend a structured equity-risk decision.",
    description:
      "A capstone policy lab reconstructing the source-verified 8% model-implied return and $44 margin-of-safety threshold, applying certainty-equivalent reasoning, and saving a complete Equity Risk Policy with remaining uncertainty stated explicitly.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 28,
    sourceRequired: true,
    conceptRole: "equity-risk",
    skills: [
      "Market-Implied Return Calculation",
      "Certainty-Equivalent Cash-Flow Reasoning",
      "Margin-of-Safety Calculation",
      "Equity Risk Policy Design",
      "Decision and Uncertainty Communication",
    ],
    objectives: [
      "Calculate the source's 8% model-implied required return from a $20 price, $1 next-year dividend, and 3% perpetual growth.",
      "Define a certainty-equivalent cash flow and explain why its value depends on a defensible risk judgment.",
      "Calculate a $44 maximum purchase price from $55 estimated value and a 20% margin-of-safety rule.",
      "Explain why the current $50 price provides only a 9.09% discount to the $55 value estimate.",
      "Build a policy connecting risk dimensions, portfolio context, beta, business fundamentals, alternative methods, and a price rule.",
      "Explain why research can reduce estimation uncertainty but cannot remove economic uncertainty.",
      "Save and defend a complete Equity Risk Policy.",
    ],
  },
  {
    slug: "if-4-1-the-three-financial-statements",
    moduleId: "if-m04-financial-statement-analysis",
    order: 1,
    shortTitle: "Three Statements",
    title: "The Three Financial Statements",
    subtitle:
      "Follow one sale through the balance sheet, income statement, and statement of cash flows before reading any ratio.",
    description:
      "A filing-map investigation that defines the three statements, separates point-in-time from period evidence, and traces a credit sale through revenue, receivables, and cash collection.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 20,
    sourceRequired: true,
    conceptRole: "filing-analysis",
    skills: [
      "Three-Statement Navigation",
      "Point-in-Time vs Period Reasoning",
      "Credit-Sale Flow Tracing",
      "Investor Question Mapping",
    ],
    objectives: [
      "Define the balance sheet, income statement, and statement of cash flows before using them.",
      "Distinguish a point-in-time statement from statements covering a period.",
      "Trace a sale on credit from revenue to accounts receivable and later cash collection.",
      "Match an investor question to the statement and time lens that can answer it.",
      "Produce a Three-Statement Evidence Map.",
    ],
  },
  {
    slug: "if-4-2-read-the-balance-sheet",
    moduleId: "if-m04-financial-statement-analysis",
    order: 2,
    shortTitle: "Balance-Sheet X-ray",
    title: "Read the Balance Sheet",
    subtitle:
      "Reconcile what Cedar Works controls with the creditor and shareholder claims that fund it, then inspect how each number was measured.",
    description:
      "A balance-sheet X-ray that classifies assets and claims, proves the accounting equation, and separates book values from current economic values without treating either as automatically correct.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 24,
    sourceRequired: true,
    conceptRole: "filing-analysis",
    skills: [
      "Accounting-Equation Reconciliation",
      "Line-Item Classification",
      "Measurement-Basis Interpretation",
      "Book vs Market Value Reasoning",
    ],
    objectives: [
      "Define assets, liabilities, and shareholders' equity and reconcile the accounting equation.",
      "Classify current, long-lived, intangible, debt, and operating claim line items.",
      "Distinguish historical cost, carrying amount, fair value, and market value.",
      "Explain why receivables and inventory may be closer to current value without assuming they equal fair value.",
      "Produce a Balance-Sheet X-ray.",
    ],
  },
  {
    slug: "if-4-3-recast-the-business",
    moduleId: "if-m04-financial-statement-analysis",
    order: 3,
    shortTitle: "Financial Balance Sheet",
    title: "Recast the Business",
    subtitle:
      "Transform a reported balance sheet into assets in place, growth assets, debt claims, and the shareholder residual.",
    description:
      "A financial-balance-sheet routing lab that distinguishes reported accounting from Damodaran's analytical valuation framework and keeps unreported growth expectations out of the accounting equation.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 22,
    sourceRequired: true,
    conceptRole: "filing-analysis",
    skills: [
      "Accounting-to-Financial Recasting",
      "Assets-in-Place Interpretation",
      "Growth-Asset Reasoning",
      "Debt and Residual-Claim Mapping",
    ],
    objectives: [
      "Define assets in place and growth assets with concrete cash-flow examples.",
      "Define debt as a contractual claim and equity as the residual claim.",
      "Route reported line items into a financial balance-sheet framework.",
      "Explain why expected future projects can have value without appearing as reported assets.",
      "Produce a Financial Balance-Sheet Map.",
    ],
  },
  {
    slug: "if-4-4-read-profit-and-leverage",
    moduleId: "if-m04-financial-statement-analysis",
    order: 4,
    shortTitle: "Profit and Leverage",
    title: "Read Profit and Leverage",
    subtitle:
      "Run the income-statement waterfall, build compatible profitability ratios, and separate borrowing level from debt-service capacity.",
    description:
      "An income-engine investigation that models accrual accounting, expense classification, margins, returns, debt to capital, and interest coverage from a single reconciled company case.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 26,
    sourceRequired: true,
    conceptRole: "filing-analysis",
    skills: [
      "Accrual and Expense Classification",
      "Income-Waterfall Interpretation",
      "Profitability-Ratio Construction",
      "Leverage and Coverage Analysis",
    ],
    objectives: [
      "Define accrual accounting with a credit-sale example.",
      "Distinguish operating, financing, and capital expenditure treatment.",
      "Calculate operating margin, net margin, and return on equity with named inputs.",
      "Calculate debt to capital and interest coverage and explain the different question each answers.",
      "Diagnose why operating margin can exceed net margin.",
    ],
  },
  {
    slug: "if-4-5-repair-the-investor-view",
    moduleId: "if-m04-financial-statement-analysis",
    order: 5,
    shortTitle: "Analyst Adjustments",
    title: "Repair the Investor View",
    subtitle:
      "Reconcile source-era lease accounting with today's reported statements, then build an explicit analytical R&D capitalization model.",
    description:
      "An analyst repair bench that prevents lease double counting, discounts contractual payments, distinguishes US GAAP from IFRS R&D treatment, and shows why adjusted profit can rise while return on capital falls.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 28,
    sourceRequired: true,
    conceptRole: "filing-analysis",
    skills: [
      "Lease Present-Value Analysis",
      "Current-Standard Reconciliation",
      "R&D Analytical Capitalization",
      "Adjusted Return-on-Capital Interpretation",
    ],
    objectives: [
      "Explain why the source capitalizes contractual lease commitments economically.",
      "Identify a current right-of-use asset and lease liability before making an analyst adjustment.",
      "Calculate the present value of twelve $1 million end-of-year payments at 4%.",
      "Distinguish US GAAP R&D expensing from IAS 38 research and qualifying development treatment.",
      "Construct a five-year R&D asset and explain its effect on operating income and return on capital.",
    ],
  },
  {
    slug: "if-4-6-trace-cash-to-the-investor",
    moduleId: "if-m04-financial-statement-analysis",
    order: 6,
    shortTitle: "Cash to Investors",
    title: "Trace Cash to the Investor",
    subtitle:
      "Scan operating, investing, and financing cash flows, then change perspective from the company cash balance to FCFE and FCFF.",
    description:
      "A cash-flow scanner and capstone brief that reconciles the change in cash, tests working-capital direction, calculates FCFE and FCFF, and completes five corrected source-assessment concepts.",
    type: "interactive",
    lessonType: "Interactive Lesson",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "filing-analysis",
    skills: [
      "Cash-Flow Classification",
      "Working-Capital Direction",
      "FCFE and FCFF Calculation",
      "Investor Statement Brief Design",
      "Source-Concept Mastery",
    ],
    objectives: [
      "Reconcile CFO, CFI, and CFF to the net change in cash.",
      "Explain why an increase in accounts payable preserves cash, other things held constant.",
      "Distinguish company cash-flow classification from the shareholder's cash-flow perspective.",
      "Calculate simplified FCFE and FCFF from the Cedar Works case.",
      "Save and defend a complete Investor Statement Brief.",
    ],
  },
  {
    slug: "if-pb-05-set-allocation-and-risk-limits",
    moduleId: "if-pb05-allocation-policy",
    order: 1,
    shortTitle: "Allocation Policy",
    title: "Set Allocation and Risk Limits",
    subtitle:
      "Give every dollar a role, protect the near-term goal, and make the portfolio's stress loss inspectable before choosing a product.",
    description:
      "A build-as-you-learn Allocation Studio with equal personal and practice paths, a non-penalizing portfolio-theory preflight, guided loss-budget repairs, an unfamiliar transfer case, and a persistent Allocation and Risk Policy.",
    type: "interactive",
    lessonType: "Portfolio Mission",
    estimatedMinutes: 45,
    sourceRequired: true,
    conceptRole: "risk-and-portfolio",
    skills: [
      "Investment Readiness Framing",
      "Strategic Asset Allocation",
      "Liquidity-Bucket Design",
      "Stress-Loss Attribution",
      "Transparent Position-Limit Math",
    ],
    objectives: [
      "Separate financial capacity for loss from willingness to experience volatility.",
      "Explain why diversification and an efficient frontier do not choose a personally suitable portfolio by themselves.",
      "Set broad sleeve weights and target ranges that total 100% and cover a stated near-term cash need.",
      "Calculate each sleeve's contribution to an explicitly hypothetical portfolio stress loss.",
      "Derive an optional candidate position ceiling from a learner-owned loss contribution and loss assumption without presenting it as a regulator rule.",
      "Repair an unfamiliar allocation after a cash need changes, then save a coherent policy to the Portfolio Workbench.",
    ],
  },
  {
    slug: "if-7-1-test-the-claim",
    moduleId: "if-m07-evidence",
    order: 1,
    shortTitle: "Test the Claim",
    title: "Test the Claim",
    subtitle:
      "Run the three tests that decide whether a market-beating claim survives, name the faults that sink most evidence, and charge the claim for risk and your own friction.",
    description:
      "An evidence investigation that starts from the joint hypothesis problem, reads an event window and a portfolio study on their own numbers, walks the ten testing sins, and saves an Evidence Test Checklist to the Portfolio Dossier.",
    type: "interactive",
    lessonType: "Portfolio Mission",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Joint Hypothesis Reasoning",
      "Risk-Adjusted Performance Measures",
      "Event and Portfolio Study Design",
      "Survivor and Sampling Bias Control",
      "Economic Significance Testing",
    ],
    objectives: [
      "Explain why excess returns are evidence about the strategy and the risk model together.",
      "Judge a strategy on return per unit of risk when raw return and risk-adjusted return disagree.",
      "Read the three segments of an event window and say what each implies.",
      "Compute the spread between extreme portfolios and state what it does not establish.",
      "Identify the sampling design that removes survivor bias from a five-year test.",
      "Save an Evidence Test Checklist with a hurdle that charges both risk and personal friction.",
    ],
  },
  {
    slug: "if-pb-11-set-a-market-timing-policy",
    moduleId: "if-m11-timing",
    order: 1,
    shortTitle: "Timing Policy",
    title: "Set a Market-Timing Policy",
    subtitle:
      "Price what being out of the market costs in both directions, test two repeated market rules against their own record, and write a no-timing or explicitly bounded policy.",
    description:
      "A timing decision anchored to the saved strategic weights. The learner sets an exit and a re-entry rule on an illustrative path and finds that the rule ending a deviation matters as much as the one starting it, tests the T-bill and GDP rules of thumb against Damodaran's own tables, then saves either a no-timing policy or a tilt bounded by a maximum deviation, an expiry, a falsifier and a review date. No timing is a complete outcome.",
    type: "interactive",
    lessonType: "Portfolio Mission",
    estimatedMinutes: 30,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Deviation Budgeting",
      "Signal Testing",
      "Opportunity-Cost Reasoning",
      "Policy Specification",
      "Evidence Expiry Awareness",
    ],
    objectives: [
      "Explain market timing as a bounded deviation from strategic weights rather than a separate activity.",
      "State the break-even hit rate a timer must clear and where it comes from.",
      "Show why the rule that ends a deviation affects the outcome as much as the one that starts it.",
      "Test a macro rule of thumb against its own record and say whether it survives.",
      "Explain why the level of economic growth is not a signal but a surprise is.",
      "Write a no-timing policy with a reason, or a bounded tilt with a limit, expiry, falsifier and review date.",
      "Hold that policy against an unfamiliar headline and name the condition that settled the decision.",
    ],
  },
  {
    slug: "if-pb-12-choose-the-actual-holdings",
    moduleId: "if-m12-holdings",
    order: 1,
    shortTitle: "Holdings Slate",
    title: "Choose the Actual Holdings",
    subtitle:
      "Establish what a ticker legally is, read the few facts in a filing that decide whether a product fits a sleeve you already licensed, find the exposure you hold twice, and rehearse an order you never send.",
    description:
      "The first mission in which an exact legal security enters the plan. The learner searches EDGAR for a ticker and finds no filer, then resolves the registrant, series and share class that do exist. A complete Fund Passport is modelled against its filing before the learner fills one from a second sponsor's prospectus, one field at a time, where a wrong pick produces a wrong passport rather than a red cross — including a holdings date in the future. The Overlap X-ray shows that 99.88% of one growth fund sits inside another, and that changing the aggregation key from instrument to issuer changes the answer. Three checks follow: a turnover figure that measures nothing, a slate that looks diversified and is not, and a holdings file 138 days old. The mission ends in an order rehearsal that names the exact share class and cannot be transmitted, because no submission endpoint exists.",
    type: "interactive",
    lessonType: "Portfolio Mission",
    estimatedMinutes: 40,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Security Identification",
      "Filing Comprehension",
      "Cost and Fee Reading",
      "Look-Through Analysis",
      "Source-Date Discipline",
      "Order Specification",
    ],
    objectives: [
      "Resolve a ticker to its registrant, series and share class, and explain why a ticker alone is not an identity.",
      "Show that two tickers can be the same portfolio at different prices, using the filed share-class table.",
      "Find replication method, total expense, turnover, lending permission and holdings as-of date in an unfamiliar prospectus.",
      "Distinguish what a prospectus permits from what a holdings file observed.",
      "Compute look-through exposure and explain why aggregating by issuer gives a different answer than by instrument.",
      "State the coverage, residual weight and as-of dates behind any overlap figure.",
      "Explain why a filed turnover rate of 0% can measure nothing at all.",
      "Say what a quarterly holdings file does and does not support.",
      "Write an order draft that names the share class, direction, type and approximate amount, and explain why nothing is transmitted.",
    ],
  },
  {
    slug: "if-pb-13-write-the-rules-and-defend-the-portfolio",
    moduleId: "if-m13-operating-plan",
    order: 1,
    shortTitle: "Operating Plan",
    title: "Write the Rules and Defend the Portfolio",
    subtitle:
      "Decide what you will do when the market falls, your income stops or the reason you bought something turns out to be wrong — then compile twelve missions into one document and defend a stranger's portfolio.",
    description:
      "The capstone. It opens on a readiness map that names every checkpoint the plan depends on and why, then works one market-crash scenario end to end — including why a stop order is not protection, since the SEC's own description is that it becomes a market order at the moment prices move fastest. The rebalancing control room compares the three regulator-listed methods against the learner's own bands, showing that the cheapest repairs least and cannot run without ongoing contributions, while the one that repairs fully is the only one that can realise a gain. The learner then writes the two IPS elements the course has never produced — the review process and the rebalancing rule — plus contribution, withdrawal, replacement and thesis-break rules, and the compiler assembles the rest from Missions 1 to 12 without re-asking a single question. Eight unaided scenarios follow, where discovering that no written rule covers a situation is a finding rather than a mistake, and the mission closes on an unlabelled transfer case.",
    type: "interactive",
    lessonType: "Portfolio Mission",
    estimatedMinutes: 40,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Operating Policy Design",
      "Rebalancing Judgement",
      "Scenario Response",
      "Policy Compilation",
      "Portfolio Diagnosis",
      "Decision Defence",
    ],
    objectives: [
      "Explain why a plan without operating rules is a snapshot rather than a plan.",
      "Measure drift against the bands you set rather than against a feeling.",
      "Compare the three rebalancing methods on repair, cost, tax exposure and availability, without treating any as universally best.",
      "Write a rebalancing rule whose trigger carries its own number.",
      "Write a review process that says when you will not revisit the plan.",
      "State in advance what evidence would mean the reason you bought something is gone.",
      "Resolve a scenario against your own written policy, and recognise when your policy is silent.",
      "Distinguish a stop rule from a stop order.",
      "Diagnose an unfamiliar portfolio without being told which skill applies.",
      "Distinguish Practice-complete from Execute-ready, and explain why neither is advice.",
    ],
  },
  {
    slug: "if-8-1-choose-passive-or-prove-an-edge",
    moduleId: "if-m08-architecture",
    order: 1,
    shortTitle: "Passive or Edge",
    title: "Choose Passive, or Prove an Edge",
    subtitle:
      "Read the current base rate for what it does and does not say, watch a market-beating strategy destroy value once risk and friction are charged, and decide the architecture you will actually run.",
    description:
      "An architecture decision that starts from a passive default, charges a persuasive active proposal for risk and the learner's own friction, tests a winning streak against a 25% no-continuity null, and saves an Architecture and Edge Decision to the Portfolio Dossier. A fully passive portfolio is a complete outcome.",
    type: "interactive",
    lessonType: "Portfolio Mission",
    estimatedMinutes: 40,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Base-Rate Reasoning",
      "Net-of-Friction Edge Arithmetic",
      "Luck Versus Skill Discrimination",
      "Edge Claim Construction",
      "Capacity and Durability Analysis",
    ],
    objectives: [
      "State what a category base rate establishes and what it does not, with its date, denominator and survivorship handling.",
      "Compute alpha by charging a gross return for the risk model and for personal trading friction.",
      "Explain why a multi-year winning streak is not evidence of skill against a 25% no-continuity null.",
      "Name the conditions an edge claim must meet: a specific mispricing, a party who is wrong, a correction mechanism, capability, net profit and durability.",
      "Apply the Edge Licence to an unfamiliar proposal and identify the evidence that would reverse the decision.",
      "Save an Architecture and Edge Decision recording the passive core, its benchmark, a dated base rate and a review date.",
    ],
  },
  {
    slug: "if-6-1-count-the-friction",
    moduleId: "if-m06-friction",
    order: 1,
    shortTitle: "Count the Friction",
    title: "Count the Friction",
    subtitle:
      "Break the cost of acting into spread, price impact, waiting, and tax; then work out the return your strategy must clear before it beats an index.",
    description:
      "A cost investigation that starts from the active manager's historical 1% shortfall, independently recalculates Damodaran's published 12.22% approximation as about 12.24% for a 4% spread, and saves an explicitly illustrative Friction Budget to the Portfolio Dossier.",
    type: "interactive",
    lessonType: "Portfolio Mission",
    estimatedMinutes: 35,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Trading-Cost Decomposition",
      "Bid-Ask Spread Drivers",
      "Cost-Adjusted Hurdle Arithmetic",
      "Price-Impact and Liquidity Interaction",
      "Turnover and Tax Drag",
    ],
    objectives: [
      "Name the four components of trading cost and identify which is usually smallest.",
      "Predict which stock carries the highest bid-ask spread as a percent of price, and say why.",
      "Calculate the pre-cost return a strategy needs once the spread is paid on entry and exit.",
      "Explain why compounding makes the true hurdle higher than spread divided by holding period.",
      "Identify which investors and which strategies suffer most from price impact and from waiting.",
      "Save a Friction Budget that labels its annual drag as an illustrative scenario estimate and states the provisional hurdle it implies.",
    ],
  },
  {
    slug: "if-5-1-estimate-a-valuation-range",
    moduleId: "if-m05-valuation-range",
    order: 1,
    shortTitle: "Valuation Range",
    title: "Estimate a Valuation Range",
    subtitle:
      "Match the claim, cash flow, and required return; test whether growth creates value; then turn uncertainty into a price rule.",
    description:
      "A valuation-gravity investigation that corrects free-growth intuition, scans peer comparisons for missing controls, and saves a range-based buy/watch/avoid rule to the Portfolio Dossier.",
    type: "interactive",
    lessonType: "Portfolio Mission",
    estimatedMinutes: 50,
    sourceRequired: true,
    conceptRole: "security-pricing",
    skills: [
      "Firm-versus-Equity Consistency",
      "Perpetuity Valuation",
      "Growth-Quality Analysis",
      "Relative-Valuation Controls",
      "Range-and-Buffer Decision Design",
    ],
    objectives: [
      "Pair firm and equity cash flows with the matching required return.",
      "Calculate a no-growth perpetuity and identify the reinvestment omitted by a naive growth model.",
      "Explain with numbers why growth creates value only when return on capital exceeds cost of capital.",
      "Evaluate a low-P/E claim after controlling for cash flow, growth, and risk.",
      "Save a Valuation Range with a required return, decision buffer, and evidence triggers.",
    ],
  },
];

const MODULE1_SOURCE: SourceSlot = {
  id: "mit-ocw-15401-lec1",
  title:
    "MIT OCW 15.401 Finance Theory I — Lecture 1: Introduction and Course Overview",
  type: "course-note",
  required: true,
  note: "Andrew W. Lo. Source basis for this lesson. No URL fabricated; attach the canonical MIT OpenCourseWare link later.",
};

const MODULE2_SOURCE: SourceSlot = {
  id: "mit-ocw-15401-pv",
  title: "MIT 15.401 Finance Theory I — Present Value Relations",
  type: "course-note",
  required: true,
  note: "Source basis for Module 2 of Finance Foundations. No URL fabricated; attach the canonical MIT OpenCourseWare link later.",
};

const MODULE3_SOURCE: SourceSlot = {
  id: "mit-ocw-15401-fi",
  title: "MIT 15.401 Finance Theory I — Fixed-Income Securities",
  type: "course-note",
  required: true,
  note: "MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Andrew W. Lo, Fixed-Income Securities slides/video. No URL fabricated.",
};

const MODULE1_SLUGS = new Set([
  "what-is-finance-value-time-risk",
  "price-discovery-and-accounting-language",
  "corporate-and-personal-financial-systems",
  "time-risk-and-financial-principles",
  "finance-roadmap-and-personal-application",
]);

const MODULE2_SLUGS = new Set([
  "present-value-cashflows-assets-npv",
  "present-value-perpetuities-annuities-compounding",
  "present-value-inflation-real-nominal",
  "present-value-cfo-decision-room",
]);

const MODULE3_SLUGS = new Set([
  "fixed-income-bond-markets-cash-flows-discount-bonds",
  "fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds",
  "fixed-income-law-one-price-arbitrage-duration-convexity",
  "fixed-income-corporate-bonds-default-risk-credit-spreads-securitization",
]);

const MODULE4_SOURCE: SourceSlot = {
  id: "mit-ocw-15401-eq",
  title: "MIT 15.401 Finance Theory I — Equities (Lecture 7)",
  type: "course-note",
  required: true,
  note: "Andrew W. Lo, MIT OpenCourseWare, 15.401 Finance Theory I, Lecture 7: Equities. No URL fabricated.",
};

const MODULE4_SLUGS = new Set([
  "equity-what-does-owning-a-stock-mean",
  "equity-why-does-a-stock-have-value-today",
  "equity-gordon-growth-model",
  "equity-multi-stage-growth-valuation",
  "equity-earnings-dividend-growth",
  "equity-growth-opportunities-pvgo-pe",
  "equity-valuation-case-lab",
  "multiples-and-market-expectations",
]);

const MODULE7_SOURCE: SourceSlot = {
  id: "mit-ocw-15401-rr",
  title: "MIT 15.401 Finance Theory I — Risk and Return (Lecture 12)",
  type: "course-note",
  required: true,
  note: "Andrew W. Lo, MIT OpenCourseWare, 15.401 Finance Theory I, Lecture 12: Introduction to Risk and Return. No URL fabricated.",
};

const MODULE7_SLUGS = new Set([
  "risk-return-what-they-mean",
  "risk-measuring-historical-return-volatility",
  "risk-covariance-correlation-diversification",
  "risk-systematic-idiosyncratic-beta",
  "risk-empirical-properties-stock-returns",
  "risk-portfolio-risk-lab",
]);

const MODULE8_SOURCE: SourceSlot = {
  id: "mit-ocw-15401-pt",
  title: "MIT 15.401 Finance Theory I — Portfolio Theory (Lectures 13–14)",
  type: "course-note",
  required: true,
  note: "Andrew W. Lo, MIT OpenCourseWare, 15.401 Finance Theory I, Lectures 13–14: Risk Analytics and Portfolio Theory. No URL fabricated.",
};

const MODULE8_SLUGS = new Set([
  "portfolio-weights-returns",
  "portfolio-risk-covariance-correlation",
  "portfolio-diversification-many-assets",
  "portfolio-efficient-frontier",
  "portfolio-risk-free-tangency-sharpe",
]);

const MODULE9_SOURCE: SourceSlot = {
  id: "mit-ocw-15401-capm",
  title: "MIT 15.401 Finance Theory I — The CAPM and APT (Lectures 15–17)",
  type: "course-note",
  required: true,
  note: "Andrew W. Lo, MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Lectures 15–17: The CAPM and APT. No URL fabricated.",
};

const MODULE9_SLUGS = new Set([
  "capm-tangency-becomes-market-portfolio",
  "security-market-line",
  "capm-estimating-beta",
  "capm-alpha-and-performance",
  "capm-apt-in-practice",
]);

const MODULE10_SOURCE: SourceSlot = {
  id: "mit-ocw-15401-cb",
  title: "MIT 15.401 Finance Theory I — Capital Budgeting",
  type: "course-note",
  required: true,
  note: "Andrew W. Lo, MIT OpenCourseWare, 15.401 Finance Theory I, capital-budgeting lectures: required return, discount rate, and NPV. No URL fabricated.",
};

const MODULE10_SLUGS = new Set([
  "required-return-to-discount-rate",
  "determining-the-discount-rate",
  "when-risk-changes-over-time",
  "npv-rule",
  "irr-and-payback",
  "project-cash-flows",
  "sensitivity-and-scenario-analysis",
  "real-options-intuition",
]);

const MODULE11_SOURCE: SourceSlot = {
  id: "mit-ocw-15401-em",
  title: "MIT 15.401 Finance Theory I — Efficient Markets (Lecture 21)",
  type: "course-note",
  required: true,
  note: "Andrew W. Lo, MIT OpenCourseWare, 15.401 Finance Theory I, Fall 2008, Lecture 21: Efficient Markets. No URL fabricated.",
};

const MODULE11_SLUGS = new Set([
  "efficient-market-hypothesis",
  "forms-of-market-efficiency",
  "anomalies-and-limits-to-arbitrage",
  "active-vs-passive-investing",
  "building-investment-philosophy",
  "information-and-prices",
]);

const IF_MODULE1_SOURCE: SourceSlot = {
  id: "damodaran-investment-philosophies-s1",
  title:
    "Aswath Damodaran, Investment Philosophies — Session 1: Introduction",
  type: "course-note",
  required: true,
  note: "This lesson adapts Damodaran's distinction between investment philosophy and strategy, and his argument for beginning with a defensible view of how markets work. The examples, interactions, and instructional wording are original OPS implementations.",
};

const IF_MODULE1_SLUGS = new Set([
  "if-1-1-how-an-investor-builds-a-philosophy",
  "if-1-2-where-philosophy-enters-the-investment-process",
  "if-1-3-comparing-investment-philosophy-families",
  "if-1-4-when-a-philosophy-fits-the-investor",
]);

const IF_MODULE2_SOURCES: SourceSlot[] = [
  {
    id: "damodaran-ip-38-session-2-slides",
    title:
      "Aswath Damodaran, Investment Philosophies — Session 2 of 38: Understanding Risk I — The risk in bonds",
    type: "course-note",
    required: true,
    url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session2.pdf",
    note: "Official NYU Stern slide deck. All 13 slides were visually audited and every numerical example used by OPS was independently verified.",
  },
  {
    id: "damodaran-ip-38-session-2-test",
    title: "Investment Philosophies — Session 2 test and solutions",
    type: "external-link",
    required: true,
    url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz2.pdf",
    note: "Official assessment source for the one-year return, duration ranking, risky-bond price, and ratings-evidence checks.",
  },
  {
    id: "damodaran-ip-38-session-2-video",
    title: "Investment Philosophies — Session 2 of 38 video mirror",
    type: "external-link",
    required: true,
    url: "https://www.youtube.com/watch?v=8E6b60eN2Mc",
    note: "Exact 2014 Session 2 recording used for complete caption review. Third-party mirror; the official 38-webcast page currently mislinks this session video. Slides and independently checked calculations control where auto-captions conflict.",
  },
];

const IF_MODULE3_SOURCES: SourceSlot[] = [
  {
    id: "damodaran-ip-38-session-3-slides",
    title:
      "Aswath Damodaran, Investment Philosophies — Session 3 of 38: Understanding Risk II — The risk in stocks",
    type: "course-note",
    required: true,
    url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session3.pdf",
    note: "Official NYU Stern slide deck. All 18 slides were visually audited. OPS corrects the false Chinese-character etymology and uses the slide's weekly regression frequency where narration conflicts.",
  },
  {
    id: "damodaran-ip-38-session-3-test",
    title: "Investment Philosophies — Session 3 test and solutions",
    type: "external-link",
    required: true,
    url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz3.pdf",
    note: "Official assessment source. OPS rewrites the duplicated beta answer choice and replaces the question whose official solution answers a different prompt.",
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

const IF_MODULE4_SOURCES: SourceSlot[] = [
  {
    id: "damodaran-ip-38-session-4-slides",
    title:
      "Aswath Damodaran, Investment Philosophies — Session 4 of 38: Financial Statement Analysis",
    type: "course-note",
    required: true,
    url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session4.pdf",
    note: "Official NYU Stern slide deck. All 18 slides were visually audited. OPS labels source-era lease and extraordinary-item treatments and reconciles them to current accounting.",
  },
  {
    id: "damodaran-ip-38-session-4-test",
    title: "Investment Philosophies — Session 4 test and solutions",
    type: "external-link",
    required: true,
    url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz4.pdf",
    note: "Official assessment source. OPS independently verified all five answers and adds the qualifications a first-time learner needs.",
  },
  {
    id: "damodaran-ip-38-session-4-video",
    title: "Investment Philosophies — Session 4 of 38 video",
    type: "external-link",
    required: true,
    url: "https://www.youtube.com/watch?v=qaDFkAh3J4k",
    note: "Official Aswath Damodaran recording used for complete caption review. Slides and independently checked terminology control where auto-captions conflict.",
  },
];

const IF_MODULE2_SLUGS = new Set([
  "if-2-1-reading-a-bonds-promise",
  "if-2-2-why-market-rates-change-bond-prices",
  "if-2-3-duration-measuring-interest-rate-sensitivity",
  "if-2-4-default-risk-can-the-issuer-deliver",
  "if-2-5-from-credit-rating-to-bond-price",
]);

const IF_MODULE3_SLUGS = new Set([
  "if-3-1-what-risk-means-for-a-shareholder",
  "if-3-2-why-diversification-changes-the-question",
  "if-3-3-what-beta-measures",
  "if-3-4-what-makes-beta-rise-or-fall",
  "if-3-5-choosing-a-risk-measure",
  "if-3-6-build-an-equity-risk-policy",
]);

const IF_MODULE4_SLUGS = new Set([
  "if-4-1-the-three-financial-statements",
  "if-4-2-read-the-balance-sheet",
  "if-4-3-recast-the-business",
  "if-4-4-read-profit-and-leverage",
  "if-4-5-repair-the-investor-view",
  "if-4-6-trace-cash-to-the-investor",
]);

function sourceSlotsFor(slug: string): SourceSlot[] {
  if (MODULE1_SLUGS.has(slug))
    return [MODULE1_SOURCE, ...lessonSourceSlots(slug)];
  if (MODULE2_SLUGS.has(slug))
    return [MODULE2_SOURCE, ...lessonSourceSlots(slug)];
  if (MODULE3_SLUGS.has(slug))
    return [MODULE3_SOURCE, ...lessonSourceSlots(slug)];
  if (MODULE4_SLUGS.has(slug))
    return [MODULE4_SOURCE, ...lessonSourceSlots(slug)];
  if (MODULE7_SLUGS.has(slug))
    return [MODULE7_SOURCE, ...lessonSourceSlots(slug)];
  if (MODULE8_SLUGS.has(slug))
    return [MODULE8_SOURCE, ...lessonSourceSlots(slug)];
  if (MODULE9_SLUGS.has(slug))
    return [MODULE9_SOURCE, ...lessonSourceSlots(slug)];
  if (MODULE10_SLUGS.has(slug))
    return [MODULE10_SOURCE, ...lessonSourceSlots(slug)];
  if (MODULE11_SLUGS.has(slug))
    return [MODULE11_SOURCE, ...lessonSourceSlots(slug)];
  if (IF_MODULE1_SLUGS.has(slug))
    return [IF_MODULE1_SOURCE, ...lessonSourceSlots(slug)];
  if (IF_MODULE2_SLUGS.has(slug)) return IF_MODULE2_SOURCES;
  if (IF_MODULE3_SLUGS.has(slug)) return IF_MODULE3_SOURCES;
  if (IF_MODULE4_SLUGS.has(slug)) return IF_MODULE4_SOURCES;
  return lessonSourceSlots(slug);
}

function courseSlugForModule(moduleId: string): string {
  return moduleId.startsWith("if-") ? "investment-foundations" : COURSE_SLUG;
}

export const lessons: Lesson[] = specs.map((s) => ({
  slug: s.slug,
  courseSlug: courseSlugForModule(s.moduleId),
  moduleId: s.moduleId,
  order: s.order,
  shortTitle: s.shortTitle,
  title: s.title,
  subtitle: s.subtitle,
  description: s.description,
  type: s.type,
  lessonType: s.lessonType,
  estimatedMinutes: s.estimatedMinutes,
  status: s.status ?? "available",
  sourceRequired: s.sourceRequired,
  conceptRole: s.conceptRole,
  skills: s.skills,
  learningObjectives: s.objectives,
  sourceSlots: sourceSlotsFor(s.slug),
  blocks: placeholderBlocks(s.slug, s.type, s.objectives, s.visual),
}));

export function getLesson(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getLessonsForModule(moduleId: string): Lesson[] {
  return lessons.filter((l) => l.moduleId === moduleId);
}
