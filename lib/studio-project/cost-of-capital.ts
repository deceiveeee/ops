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
 * **The stale part is separated on purpose.** His page carries no date, and the
 * newest dated file in his archive is the January 2025 update. The risk-free
 * rate inside a cost of capital moves with the Treasury yield, so the ingestion
 * recovers it out of the data — verified to within beta-rounding error across
 * all 96 industries — and this module lets a learner replace it with today's.
 * Everything else in the estimate is far more stable than the rate.
 */

import data from "./data/cost-of-capital.json";
import type { RoicSector } from "./roic";
import type { FigureInvestigation } from "./schema";

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
  impliedRiskFreeRate: data.impliedRiskFreeRate,
  impliedEquityRiskPremium: data.impliedEquityRiskPremium,
} as const;

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

/**
 * Industries where return on invested capital is not the right question.
 *
 * An OPS classification, not a figure from the source. Damodaran's list names
 * industries; it does not say which of them ROIC suits, and that judgement is
 * ours to make and to show.
 *
 * Only the three excluded sectors are distinguished, because only they change
 * what the investigation does: a bank, an insurer or a property company gets a
 * plain refusal and an explanation instead of a number. The remaining sectors
 * in `RoicSector` matter to the filings pipeline, which reads a real SIC code
 * off EDGAR and classifies it with `sectorFromSic`. Guessing them from an
 * industry name here would be a second, weaker classifier saying different
 * things about the same company.
 *
 * Financial firms that are not literally banks are grouped with banking on
 * purpose. The refusal names a bank, which is imprecise for an asset manager;
 * computing a return on capital for one would be wrong, which is worse.
 */
const NOT_MEASURED_BY_ROIC: Record<string, RoicSector> = {
  "Bank (Money Center)": "banking",
  "Banks (Regional)": "banking",
  "Brokerage & Investment Banking": "banking",
  "Financial Svcs. (Non-bank & Insurance)": "banking",
  "Investments & Asset Management": "banking",
  "Insurance (General)": "insurance",
  "Insurance (Life)": "insurance",
  "Insurance (Prop/Cas.)": "insurance",
  Reinsurance: "insurance",
  "R.E.I.T.": "real-estate",
  "Retail (REITs)": "real-estate",
  "Real Estate (Development)": "real-estate",
  "Real Estate (General/Diversified)": "real-estate",
  "Real Estate (Operations & Services)": "real-estate",
};

/** Which sector rules apply to a company the learner has placed in an industry. */
export const sectorForIndustry = (industry: string): RoicSector =>
  NOT_MEASURED_BY_ROIC[industry] ?? "general";

/** The industry name Studio researched peers for, if this SIC is one of them. */
export const industryForSic = (sic: string): string | null =>
  (data.sicToIndustry as Record<string, string>)[sic] ?? null;

/**
 * The industry an investigation is judged against.
 *
 * Records saved before the industry could be chosen carry only a SIC, and that
 * SIC is one of the five with peer figures. Falling back through it means an
 * older investigation reopens against exactly the cost of capital it was read
 * with, rather than reverting to whichever industry happens to sort first.
 */
export const investigationIndustry = (
  investigation: Pick<FigureInvestigation, "industry" | "sic">,
): string | null => investigation.industry ?? industryForSic(investigation.sic);

/** Cost of equity from the capital asset pricing model. */
export const costOfEquity = (beta: number, riskFreeRate: number, equityRiskPremium: number): number =>
  riskFreeRate + beta * equityRiskPremium;

/** Equity and debt costs, weighted by how much of each the industry uses. */
export const weightedAverageCost = (equityCost: number, afterTaxDebtCost: number, debtWeight: number): number =>
  equityCost * (1 - debtWeight) + afterTaxDebtCost * debtWeight;

export interface CostEstimate {
  costOfCapital: number;
  costOfEquity: number;
  beta: number;
  riskFreeRate: number;
  equityRiskPremium: number;
  afterTaxCostOfDebt: number;
  debtWeight: number;
  /** True when the learner supplied a rate rather than accepting the source's. */
  riskFreeRateReplaced: boolean;
  /** Every sentence the surface needs to show where this came from. */
  provenance: string[];
}

/**
 * The industry's cost of capital, optionally rebuilt on today's risk-free rate.
 *
 * Given no rate, this reproduces the published figure exactly — the test suite
 * checks that round trip across all 96 industries, so a learner who changes
 * nothing sees the source's own number rather than an approximation of it.
 */
export function estimate(industry: IndustryCost, riskFreeRate?: number): CostEstimate {
  const replaced = typeof riskFreeRate === "number" && Number.isFinite(riskFreeRate);
  const rate = replaced ? (riskFreeRate as number) : data.impliedRiskFreeRate;
  const equity = replaced ? costOfEquity(industry.beta, rate, data.impliedEquityRiskPremium) : industry.costOfEquity;

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
    provenance: [
      `Built from ${industry.firms} companies in ${industry.industry}, which carry ${(industry.debtWeight * 100).toFixed(0)}% of their capital as debt.`,
      `Shareholders are assumed to want ${(rate * 100).toFixed(2)}% for lending to the government, plus ${(data.impliedEquityRiskPremium * 100).toFixed(2)}% for taking equity risk, multiplied by this industry's beta of ${industry.beta.toFixed(2)}.`,
      replaced
        ? `You supplied the ${(rate * 100).toFixed(2)}% government rate, so this is rebuilt rather than taken as published.`
        : `The ${(rate * 100).toFixed(2)}% government rate is the one inside the source's own figures. It is undated — the newest dated file in the archive is the January 2025 update — so check it against today's Treasury yield and change it if it has moved.`,
      `${data.attribution} Retrieved ${data.retrievedAt}.`,
    ],
  };
}
