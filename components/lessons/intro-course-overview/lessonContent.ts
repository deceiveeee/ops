export const SOURCE_BASIS = {
  course: "MIT OCW 15.401 Finance Theory I",
  lecture: "Lecture 1: Introduction and Course Overview",
  instructor: "Andrew W. Lo",
  note: "Adapted from MIT OpenCourseWare 15.401 Finance Theory I for educational use. No live market data.",
} as const;

export const MODULE1_LESSONS = [
  { slug: "what-is-finance-value-time-risk", title: "What Is Finance? Value, Time, and Risk", n: 1 },
  { slug: "price-discovery-and-accounting-language", title: "Price Discovery and the Language of Finance", n: 2 },
  { slug: "corporate-and-personal-financial-systems", title: "Corporate and Personal Financial Systems", n: 3 },
  { slug: "time-risk-and-financial-principles", title: "Time, Risk, and the Logic of Finance", n: 4 },
  { slug: "finance-roadmap-and-personal-application", title: "Finance Roadmap and Personal Application", n: 5 },
] as const;

export const MODULE_OBJECTIVES = [
  "Explain why finance applies to both personal and corporate decisions.",
  "Identify the main participants in the financial system.",
  "Distinguish between valuation and management.",
  "Explain why accounting is the language of finance.",
  "Distinguish between stock variables and flow variables.",
  "Explain why time and risk make finance difficult.",
  "Describe the six fundamental principles of finance.",
] as const;

export const KEY_TERMS: { term: string; def: string }[] = [
  { term: "Finance", def: "The systematic and disciplined study of financial transactions involving money." },
  { term: "Financial system", def: "The network of households, corporations, financial intermediaries, and capital markets through which money, assets, and risks move." },
  { term: "Valuation", def: "The process of estimating what an asset is worth." },
  { term: "Management", def: "The process of making decisions about acquiring, selling, financing, consuming, reinvesting, or returning assets." },
  { term: "Price discovery", def: "The process by which markets determine asset prices through the interaction of buyers and sellers." },
  { term: "Accounting", def: "The language of finance, used to measure and communicate financial position and performance." },
  { term: "Stock variable", def: "A level measured at a point in time." },
  { term: "Flow variable", def: "A rate of change measured over a period of time." },
  { term: "Balance sheet", def: "A financial statement showing assets, liabilities, and equity at a point in time." },
  { term: "Income statement", def: "A financial statement showing revenues, expenses, and profit or loss over a period of time." },
  { term: "Time value of money", def: "The idea that money today is different from money in the future." },
  { term: "Risk", def: "Uncertainty about future outcomes." },
  { term: "Expected utility", def: "A way to describe decision-making under uncertainty based on expected satisfaction or well-being." },
];

export const SIX_PRINCIPLES = [
  { id: "P1", text: "There is no such thing as a free lunch." },
  { id: "P2", text: "Other things equal, individuals prefer more money, money now, and less risk." },
  { id: "P3", text: "All agents act to further their own self-interest." },
  { id: "P4", text: "Financial market prices shift to equalize supply and demand." },
  { id: "P5", text: "Financial markets are highly adaptive and competitive." },
  { id: "P6", text: "Risk-sharing and frictions are central to financial innovation." },
] as const;

export const COURSE_ROADMAP = [
  {
    key: "intro",
    label: "Introduction",
    body: "Learn the framework: valuation, management, time, risk, and the financial system.",
  },
  {
    key: "valuation",
    label: "Valuation",
    body: "Learn discounting, net present value, and pricing stocks, bonds, futures, forwards, and options.",
  },
  {
    key: "risk",
    label: "Risk",
    body: "Learn risk measurement, diversification, portfolio theory, and how risk enters valuation.",
  },
  {
    key: "corporate",
    label: "Corporate Finance",
    body: "Learn capital budgeting, project finance, and how companies make investment decisions.",
  },
  {
    key: "efficiency",
    label: "Market Efficiency",
    body: "Ask whether financial markets always work well in discovering prices and how behavioral biases affect financial decisions.",
  },
] as const;
