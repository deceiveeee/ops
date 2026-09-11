/**
 * What the money costs, so a return has something to be judged against.
 *
 * "Return on capital above the cost of capital means the business is creating
 * value" is the test the whole investigation turns on, and the second half of
 * it is the hard half. No company reports its cost of capital, because it isn't
 * an accounting figure — it needs a risk-free rate, an equity risk premium and
 * a beta. Asking a beginner to produce one is the empty box this product exists
 * to avoid.
 *
 * So Studio ships a sourced default per industry and teaches the learner to
 * change it. Data from Aswath Damodaran, NYU Stern, whose stated rules permit
 * this and ask only for optional acknowledgement.
 *
 * **The rate ages fastest, so it is taken from somewhere newer.** His figures
 * are dated on the page his data index links ("Last Updated in January 2026").
 * The risk-free rate inside them is recovered by the ingestion, verified to
 * within beta-rounding error across all 96 industries, because it is the part
 * that goes stale first. By default Studio rebuilds each industry's figure on
 * the US Treasury's most recent 10-year note auction, dated and sourced, and a
 * learner can type their own rate instead. The equity risk premium, betas and
 * debt costs stay his.
 */

import data from "./data/cost-of-capital.json";
import treasury from "./data/treasury-rate.json";

export interface IndustryCost {
  industry: string;
  firms: number;
  beta: number;
  costOfEquity: number;
  costOfDebt: number;
  taxRate: number;
  afterTaxCostOfDebt: number;
  debtWeight: number;
  costOfCapital: number;
}

export const COST_OF_CAPITAL_SOURCE = {
  attribution: data.attribution,
  url: data.source,
  retrievedAt: data.retrievedAt,
  vintage: data.vintage,
  vintageStated: data.vintageStated,
  impliedRiskFreeRate: data.impliedRiskFreeRate,
  impliedEquityRiskPremium: data.impliedEquityRiskPremium,
} as const;

/** The US Treasury's most recent 10-year note auction: Studio's default government rate. */
export const TREASURY_RATE = {
  rate: treasury.rate,
  yieldPct: treasury.yieldPct,
  auctionDate: treasury.security.auctionDate,
  cusip: treasury.security.cusip,
  reopening: treasury.security.reopening,
  attribution: treasury.attribution,
  source: treasury.source,
  retrievedAt: treasury.retrievedAt,
} as const;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-09-09" as "9 September 2026", the same for every reader whatever their locale. */
export const longDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
};

const INDUSTRIES = data.industries as IndustryCost[];
const BY_NAME = new Map(INDUSTRIES.map((row) => [row.industry, row]));

/** Every industry name, for a learner choosing the closest fit to their company. */
export const industryNames = (): string[] => INDUSTRIES.map((row) => row.industry).sort();

export const forIndustry = (industry: string): IndustryCost | null => BY_NAME.get(industry) ?? null;

/** The industry Studio already researched for one of its SIC codes. */
export const forSic = (sic: string): IndustryCost | null => {
  const name = (data.sicToIndustry as Record<string, string>)[sic];
  return name ? forIndustry(name) : null;
};

/** Cost of equity from the capital asset pricing model. */
export const costOfEquity = (beta: number, riskFreeRate: number, equityRiskPremium: number): number =>
  riskFreeRate + beta * equityRiskPremium;

/** Equity and debt costs, weighted by how much of each the industry uses. */
export const weightedAverageCost = (equityCost: number, afterTaxDebtCost: number, debtWeight: number): number =>
  equityCost * (1 - debtWeight) + afterTaxDebtCost * debtWeight;

/** Where the government rate in an estimate came from. */
export type RateSource = "published" | "treasury" | "learner";

export interface CostEstimate {
  costOfCapital: number;
  costOfEquity: number;
  beta: number;
  riskFreeRate: number;
  equityRiskPremium: number;
  afterTaxCostOfDebt: number;
  debtWeight: number;
  /** True when a rate other than the source's own was used. */
  riskFreeRateReplaced: boolean;
  rateSource: RateSource;
  /** Every sentence the surface needs to show where this came from. */
  provenance: string[];
}

const percent = (value: number) => `${(value * 100).toFixed(2)}%`;

/**
 * The industry's cost of capital, optionally rebuilt on another risk-free rate.
 *
 * Given no rate, this reproduces the published figure exactly — the test suite
 * checks that round trip across all 96 industries, so the source's own number
 * is always recoverable rather than an approximation of it. Given a rate, `from`
 * says whose it is: the Treasury auction Studio uses by default, or one the
 * learner typed. The provenance says which, in words.
 */
export function estimate(
  industry: IndustryCost,
  riskFreeRate?: number,
  from: Exclude<RateSource, "published"> = "learner",
): CostEstimate {
  const replaced = typeof riskFreeRate === "number" && Number.isFinite(riskFreeRate);
  const rate = replaced ? (riskFreeRate as number) : data.impliedRiskFreeRate;
  const equity = replaced ? costOfEquity(industry.beta, rate, data.impliedEquityRiskPremium) : industry.costOfEquity;
  const rateSource: RateSource = replaced ? from : "published";
  const vintage = data.vintageStated ? `last updated ${data.vintage}` : "which the source does not date";

  const rateLine = {
    published: `The ${percent(rate)} government rate is the one inside the source's own figures, ${vintage}.`,
    treasury:
      `The ${percent(rate)} government rate is the yield at the US Treasury's 10-year note auction on ` +
      `${longDate(treasury.security.auctionDate)}. The source's own figures, ${vintage}, used ` +
      `${percent(data.impliedRiskFreeRate)}; its equity risk premium and beta are kept.`,
    learner: `You supplied the ${percent(rate)} government rate, so this is rebuilt rather than taken as published.`,
  }[rateSource];

  return {
    costOfCapital: replaced
      ? weightedAverageCost(equity, industry.afterTaxCostOfDebt, industry.debtWeight)
      : industry.costOfCapital,
    costOfEquity: equity,
    beta: industry.beta,
    riskFreeRate: rate,
    equityRiskPremium: data.impliedEquityRiskPremium,
    afterTaxCostOfDebt: industry.afterTaxCostOfDebt,
    debtWeight: industry.debtWeight,
    riskFreeRateReplaced: replaced,
    rateSource,
    provenance: [
      `Built from ${industry.firms} companies in ${industry.industry}, which carry ${(industry.debtWeight * 100).toFixed(0)}% of their capital as debt.`,
      `Shareholders are assumed to want ${percent(rate)} for lending to the government, plus ${percent(data.impliedEquityRiskPremium)} for taking equity risk, multiplied by this industry's beta of ${industry.beta.toFixed(2)}.`,
      rateLine,
      `${data.attribution} Retrieved ${data.retrievedAt}.`,
      ...(rateSource === "treasury" ? [`${treasury.attribution} Retrieved ${treasury.retrievedAt}.`] : []),
    ],
  };
}
