export type MarketFragment = {
  text: string;
  kind: "ticker" | "rate" | "headline" | "metric" | "signal";
  tone: "up" | "down" | "neutral";
  x: number;
  y: number;
  delay: number;
};

export const marketFragments: MarketFragment[] = [
  { text: "AAPL  +1.24%", kind: "ticker", tone: "up", x: 8, y: 18, delay: 0 },
  { text: "NVDA  -3.10%", kind: "ticker", tone: "down", x: 78, y: 12, delay: 0.4 },
  { text: "10Y  4.31%", kind: "rate", tone: "neutral", x: 18, y: 72, delay: 0.2 },
  { text: "CPI  3.2%", kind: "rate", tone: "down", x: 70, y: 64, delay: 0.6 },
  { text: "FOMC next week", kind: "headline", tone: "neutral", x: 30, y: 30, delay: 0.8 },
  { text: "FCF +18% YoY", kind: "metric", tone: "up", x: 60, y: 40, delay: 1.1 },
  { text: "GM 41.2%", kind: "metric", tone: "up", x: 12, y: 48, delay: 1.3 },
  { text: "Net Debt / EBITDA 2.1x", kind: "metric", tone: "neutral", x: 82, y: 30, delay: 0.5 },
  { text: "BUY signal", kind: "signal", tone: "up", x: 50, y: 14, delay: 1.5 },
  { text: "Shares -2.0%", kind: "metric", tone: "up", x: 40, y: 80, delay: 0.9 },
  { text: "TSLA  -2.40%", kind: "ticker", tone: "down", x: 88, y: 50, delay: 1.2 },
  { text: "VIX  17.8", kind: "rate", tone: "neutral", x: 6, y: 60, delay: 1.0 },
  { text: "EPS beat", kind: "headline", tone: "up", x: 64, y: 78, delay: 0.7 },
  { text: "Margin pressure", kind: "headline", tone: "down", x: 22, y: 24, delay: 1.4 },
  { text: "Repricing risk", kind: "signal", tone: "down", x: 74, y: 86, delay: 1.6 },
];

export type ChartPoint = { t: number; p: number };

export const stockChart: ChartPoint[] = (() => {
  const pts: ChartPoint[] = [];
  let p = 100;
  const seed = [0.6, -0.4, 1.2, 0.8, -1.1, 2.0, 1.4, -0.7, 0.9, 1.8, -0.5, 1.1, 0.4, -1.4, 2.2, 1.0, -0.3, 0.8, 1.6, -0.9, 0.5, 1.2, -0.6, 0.7, 1.4];
  for (let i = 0; i < seed.length; i++) {
    p += seed[i];
    pts.push({ t: i, p: Math.round(p * 100) / 100 });
  }
  return pts;
})();

export type ChartEvent = { t: number; label: string; tone: "up" | "down" | "neutral" };

export const chartEvents: ChartEvent[] = [
  { t: 4, label: "Earnings surprise", tone: "up" },
  { t: 9, label: "Margin pressure", tone: "down" },
  { t: 15, label: "Rate expectations", tone: "neutral" },
  { t: 21, label: "Market repricing", tone: "down" },
];

export type Driver = { key: string; label: string; value: string; tone: "up" | "down" | "neutral"; note: string };

export const businessDrivers: Driver[] = [
  { key: "revenue", label: "Revenue", value: "$24.6B", tone: "up", note: "+18% YoY" },
  { key: "grossMargin", label: "Gross Margin", value: "41.2%", tone: "up", note: "+120 bps" },
  { key: "fcf", label: "Free Cash Flow", value: "$5.1B", tone: "up", note: "+22% YoY" },
  { key: "debt", label: "Net Debt", value: "$8.4B", tone: "down", note: "2.1x EBITDA" },
  { key: "shares", label: "Shares Out.", value: "1.42B", tone: "up", note: "-2.0% YoY" },
];

export type FilingLine = { id: string; section: string; text: string; note: string };

export const filingLines: FilingLine[] = [
  { id: "biz", section: "Business", text: "We operate a platform that connects customers to a recurring subscription service across 32 markets.", note: "Recurring revenue → higher visibility into future cash flows." },
  { id: "risk", section: "Risk Factors", text: "A material increase in interest rates could raise our cost of capital and reduce share repurchases.", note: "Rate sensitivity links macro policy to equity supply." },
  { id: "mda", section: "MD&A", text: "Gross margin expanded 120 bps due to pricing power and a favorable product mix.", note: "Pricing power is a moat signal." },
  { id: "cf", section: "Cash Flow", text: "Operating cash flow of $7.8B funded $2.7B of capex, yielding $5.1B of free cash flow.", note: "FCF conversion = the cash the business actually produces." },
];

export type FlowStage = { key: string; label: string; value: string; tone: "up" | "down" | "neutral" };

export const moneyFlow: FlowStage[] = [
  { key: "customers", label: "Customers", value: "1.2M active", tone: "neutral" },
  { key: "revenue", label: "Revenue", value: "$24.6B", tone: "up" },
  { key: "grossProfit", label: "Gross Profit", value: "$10.1B", tone: "up" },
  { key: "opIncome", label: "Operating Income", value: "$6.4B", tone: "up" },
  { key: "fcf", label: "Free Cash Flow", value: "$5.1B", tone: "up" },
  { key: "value", label: "Value", value: "$210B", tone: "up" },
];

export type ValuationScenario = {
  key: string;
  label: string;
  growth: number;
  discount: number;
  terminalMultiple: number;
  impliedValue: number;
  note: string;
};

export const valuationScenarios: ValuationScenario[] = [
  { key: "bear", label: "Bear", growth: 4, discount: 11, terminalMultiple: 16, impliedValue: 142, note: "Risk and rates compress value." },
  { key: "base", label: "Base", growth: 8, discount: 9, terminalMultiple: 22, impliedValue: 210, note: "Expectations, cash flows, required return." },
  { key: "bull", label: "Bull", growth: 14, discount: 8, terminalMultiple: 30, impliedValue: 318, note: "Growth pulls value upward." },
];

export type AssetNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  vol: number;
  weight: number;
  tone: "cyan" | "green" | "purple" | "amber" | "red";
};

export const assetNodes: AssetNode[] = [
  { id: "eq", label: "US Equities", x: 20, y: 30, vol: 16, weight: 45, tone: "cyan" },
  { id: "igb", label: "IG Bonds", x: 70, y: 22, vol: 6, weight: 25, tone: "green" },
  { id: "em", label: "EM Equity", x: 78, y: 64, vol: 22, weight: 10, tone: "amber" },
  { id: "gold", label: "Gold", x: 32, y: 72, vol: 14, weight: 10, tone: "purple" },
  { id: "cash", label: "Cash", x: 56, y: 50, vol: 1, weight: 10, tone: "red" },
];

export type AssetEdge = { from: string; to: string; corr: number };

export const assetEdges: AssetEdge[] = [
  { from: "eq", to: "em", corr: 0.78 },
  { from: "eq", to: "igb", corr: -0.18 },
  { from: "eq", to: "gold", corr: 0.04 },
  { from: "igb", to: "gold", corr: 0.22 },
  { from: "em", to: "gold", corr: 0.12 },
  { from: "cash", to: "eq", corr: 0.0 },
];

export type MacroScenario = {
  key: string;
  label: string;
  fedRate: number;
  inflation: number;
  unemployment: number;
  tenYear: number;
  equityReaction: string;
  tone: "up" | "down" | "neutral";
};

export const macroScenarios: MacroScenario[] = [
  { key: "shock", label: "Inflation shock", fedRate: 5.75, inflation: 5.4, unemployment: 4.2, tenYear: 5.10, equityReaction: "Multiple compression", tone: "down" },
  { key: "hike", label: "Rate hike", fedRate: 5.50, inflation: 3.6, unemployment: 4.4, tenYear: 4.62, equityReaction: "Discount rate up, growth hit", tone: "down" },
  { key: "soft", label: "Soft landing", fedRate: 4.25, inflation: 2.4, unemployment: 4.3, tenYear: 4.05, equityReaction: "Risk-on, multiples expand", tone: "up" },
];

export const coursePath: { key: string; label: string; href?: string }[] = [
  { key: "noise", label: "Market Noise" },
  { key: "price", label: "Stock Price" },
  { key: "business", label: "Business" },
  { key: "filing", label: "Filing" },
  { key: "cashflow", label: "Cash Flow" },
  { key: "valuation", label: "Valuation" },
  { key: "portfolio", label: "Portfolio" },
  { key: "macro", label: "Macro" },
  { key: "plan", label: "Your plan", href: "/plan" },
];

export type HomepageScene = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  body: string;
};

export const homepageScenes: HomepageScene[] = [
  { id: "chaos", index: "01", eyebrow: "Markets look chaotic", title: "Thousands of signals. One structure underneath.", body: "Tickers, rates, headlines, and metrics collide. Finance teaches you to find the structure beneath the noise." },
  { id: "surface", index: "02", eyebrow: "Price is only the surface", title: "A chart shows what happened. Finance asks why.", body: "Every chart is the visible output of decisions, cash flows, expectations, and risk." },
  { id: "business", index: "03", eyebrow: "Behind every ticker is a business", title: "X-ray the chart into its drivers.", body: "Revenue, margin, cash flow, debt, and shares — the levers that move price over time." },
  { id: "filing", index: "04", eyebrow: "The 10-K is the source code", title: "Real investors read source documents.", body: "Not headlines. Not summaries. The filing is where the business explains itself." },
  { id: "flow", index: "05", eyebrow: "Financial statements show how money moves", title: "A business is a machine that turns decisions into cash.", body: "Customers → Revenue → Gross Profit → Operating Income → Free Cash Flow → Value." },
  { id: "valuation", index: "06", eyebrow: "Valuation depends on growth, risk, cash flow, and rates", title: "Value is a force system, not a single number.", body: "Growth pulls up. Risk and rates pull down. Cash flow stabilizes. Change an assumption, change the value." },
  { id: "portfolio", index: "07", eyebrow: "Portfolios change risk through interaction", title: "A portfolio is a system of relationships.", body: "Correlation, volatility, and weights — risk emerges from how assets move together." },
  { id: "macro", index: "08", eyebrow: "Macro policy ripples through markets", title: "One decision. Many transmission paths.", body: "Rates → bonds → equities → companies → portfolios. The Fed's lever moves all of them." },
  { id: "decode", index: "09", eyebrow: "Open Portfolio Studio", title: "Don't memorize finance. Decode it.", body: "Investigate real companies, real filings, portfolios, and market signals — interactively." },
];
