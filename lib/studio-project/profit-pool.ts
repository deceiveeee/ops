/**
 * Where the money is made in an industry, as *Measuring the Moat* draws it.
 *
 * Mauboussin and Callahan, Consilient Observer, 15 October 2024, pp. 15-17.
 * "Economic profit equals the spread between ROIC and WACC times invested
 * capital" (p. 15). In a profit pool the spread is each company's height and its
 * share of the industry's invested capital its width, so "the economic profit for
 * a company equals its area" and "at a glance, a business analyst can see where
 * the money is being made." Exhibit 11 draws one industry by company, which is
 * the form built here. Pages for every claim: docs/source-audits/studio-profit-pool.md.
 *
 * The arithmetic is `profitPool` in `industry.ts`, which has had its own tests
 * since the industry work. This file decides who is in a pool, which is the part
 * that can go wrong quietly. The workspace proposal is plain that "a profit-pool
 * view must say which profit measure it uses and what participants it covers",
 * and a block drawn from a figure nobody can stand behind is worse than a gap:
 * it has an area, and the area is the claim.
 */

import industriesData from "./data/industries.json";
import { TREASURY_RATE, estimate, forSic, type CostEstimate } from "./cost-of-capital";
import { profitPool, type ProfitPoolBand } from "./industry";

/** One leading company as the industry dataset records it. */
export interface PoolLeader {
  name: string;
  cik: number;
  revenue: number;
  share: number;
}

/** A leading company's return on capital, or the pipeline's reason for having none. */
export interface PoolEarner {
  name: string;
  cik: number;
  period?: string;
  roic?: number;
  nopat?: number;
  nopatMargin?: number;
  investedCapital?: number;
  taxRateAssumed?: boolean;
  debtAssumedZero?: boolean;
  operatingLeaseLiability?: number | null;
  reason?: string;
}

/** The parts of an industry entry a pool is built from. */
export interface PoolIndustry {
  sic: string;
  label: string;
  totalRevenue: number;
  leaders: PoolLeader[];
  roic: PoolEarner[];
  /** Companies the industry dataset dropped before counting anything: two revenue figures too far apart. */
  unresolvable?: { name: string; revenue: number }[];
  instability?: { rows: { name: string; earlierShare: number | null; laterShare: number | null }[] } | null;
}

/**
 * How far the revenue behind a return may sit from the revenue the SEC records
 * in dollars before the two are taken to be in different currencies.
 *
 * The two cover different years — the SEC's dollar frames are calendar 2024,
 * the return is each company's latest full year — so real growth separates them
 * too. NVIDIA's are 1.65 apart on growth alone. The currencies this has to catch
 * are several times the dollar: NetEase's figures run 7.8 times its dollar
 * revenue and JinkoSolar's 5.2, both consistent with Chinese yuan. Three sits
 * between the two with room either side.
 */
export const CURRENCY_RATIO_LIMIT = 3;

/**
 * How many times over a company's share of its industry's revenue may grow
 * between the dataset's two years before Studio will not draw it.
 *
 * Aimed at one failure: a figure filed at the wrong scale. The industry
 * pipeline already drops a company whose competing revenue figures are a
 * thousandfold apart, but a company that files only one figure cannot be
 * checked that way. Universe Pharmaceuticals went from 0.008% of its industry
 * to 3.9%, nearly five hundredfold. The largest rise among the others is
 * NVIDIA's, under sevenfold.
 */
export const SHARE_JUMP_LIMIT = 100;

export type LeftOutReason = "not-counted" | "no-return" | "not-dollars" | "doubtful-figure" | "no-capital";

export interface LeftOut {
  name: string;
  /** Absent for a company the industry dataset never counted, which it records by name only. */
  cik?: number;
  reason: LeftOutReason;
  /** The reason in a sentence, with the numbers that produced it. */
  says: string;
}

export interface PoolBlock extends ProfitPoolBand {
  cik: number;
  /** The fiscal year-end the return covers. */
  period: string;
  /** The industry pipeline stood in the 21% US federal rate for a tax rate it could not read. */
  taxRateAssumed: boolean;
  /** Reports no borrowings, so debt was taken as zero. */
  debtAssumedZero: boolean;
  /** Lease commitments outside invested capital, where the company reports them. */
  leasesExcluded: number | null;
}

export interface Pool {
  sic: string;
  label: string;
  /** The industry's cost of capital, as every block here is judged against it. */
  cost: CostEstimate;
  /** Tallest first, as Exhibit 11 draws them. */
  blocks: PoolBlock[];
  totalEconomicProfit: number;
  totalInvestedCapital: number;
  /**
   * The share of the revenue counted for this industry that the drawn companies
   * account for. Counted, not reported: a company the industry dataset dropped
   * is outside the denominator too, and is named in `leftOut`.
   */
  revenueCovered: number;
  leftOut: LeftOut[];
  /** The earliest and latest fiscal year-ends among the drawn companies. */
  periods: { from: string; to: string } | null;
}

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

/** The revenue a return was computed on, recovered from the two figures stored with it. */
function revenueBehind(earner: PoolEarner): number | null {
  if (typeof earner.nopat !== "number" || typeof earner.nopatMargin !== "number" || earner.nopatMargin === 0) return null;
  return earner.nopat / earner.nopatMargin;
}

/**
 * Whether a company can be drawn, and if not, why not.
 *
 * Checked in order of what is most certain: no return at all, then a return on
 * no capital, then figures in another currency, then a figure out of all
 * proportion to the company's own history.
 */
export function whyLeftOut(
  earner: PoolEarner,
  leader: PoolLeader | undefined,
  history: { earlierShare: number | null; laterShare: number | null } | undefined,
): LeftOut | null {
  const base = { name: earner.name, cik: earner.cik };
  if (typeof earner.roic !== "number" || typeof earner.investedCapital !== "number") {
    return {
      ...base,
      reason: "no-return",
      says:
        earner.reason === "needs operating profit"
          ? "Its filings do not carry the operating profit line a return is worked out from."
          : `No return could be worked out: ${earner.reason ?? "the figures it needs are missing"}.`,
    };
  }
  if (earner.investedCapital <= 0) {
    return {
      ...base,
      reason: "no-capital",
      says: "It holds more cash than its borrowings and equity together, so there is no invested capital to give it a width.",
    };
  }
  const behind = revenueBehind(earner);
  if (behind !== null && leader && leader.revenue > 0) {
    const ratio = behind / leader.revenue;
    if (ratio > CURRENCY_RATIO_LIMIT || ratio < 1 / CURRENCY_RATIO_LIMIT) {
      return {
        ...base,
        reason: "not-dollars",
        says: `The figures behind its return are ${ratio.toFixed(1)} times the revenue the SEC records for it in dollars, so they are in another currency. Its return is still right, being a ratio, but its capital would be drawn several times too wide.`,
      };
    }
  }
  if (history && history.earlierShare && history.laterShare && history.laterShare / history.earlierShare > SHARE_JUMP_LIMIT) {
    return {
      ...base,
      reason: "doubtful-figure",
      says: `Its share of the industry's revenue went from ${pct(history.earlierShare, 3)} to ${pct(history.laterShare)}, about ${Math.round(history.laterShare / history.earlierShare)} times over. Studio could not check that against its filings, so it is left out rather than drawn.`,
    };
  }
  return null;
}

/**
 * The profit pool for one researched industry.
 *
 * The cost of capital is the industry's own, rebuilt on the Treasury's latest
 * 10-year auction exactly as Investigate does by default, and every company is
 * judged against the same figure. That is a simplification the surface names.
 */
export function poolFor(industry: PoolIndustry, cost: CostEstimate): Pool {
  const leaders = new Map(industry.leaders.map((leader) => [leader.cik, leader]));
  const history = new Map((industry.instability?.rows ?? []).map((row) => [row.name, row]));

  // Named first, because they are missing from the denominator as well as the
  // drawing: Burlington Northern is about as large as Union Pacific, and a pool
  // that said it covered 99% of the railroads without naming it would mislead.
  const leftOut: LeftOut[] = (industry.unresolvable ?? []).map((entry) => ({
    name: entry.name,
    reason: "not-counted" as const,
    says: "It files two revenue figures too far apart to choose between, so the industry figures leave it out altogether, and so does this.",
  }));
  const kept: (PoolEarner & { roic: number; investedCapital: number })[] = [];
  for (const earner of industry.roic) {
    const out = whyLeftOut(earner, leaders.get(earner.cik), history.get(earner.name));
    if (out) leftOut.push(out);
    else kept.push(earner as PoolEarner & { roic: number; investedCapital: number });
  }

  const byName = new Map(kept.map((earner) => [earner.name, earner]));
  const pooled = profitPool(
    kept.map((earner) => ({ name: earner.name, roic: earner.roic, wacc: cost.costOfCapital, investedCapital: earner.investedCapital })),
  );
  const blocks: PoolBlock[] = pooled.bands.map((band) => {
    const earner = byName.get(band.name)!;
    return {
      ...band,
      cik: earner.cik,
      period: earner.period ?? "",
      taxRateAssumed: Boolean(earner.taxRateAssumed),
      debtAssumedZero: Boolean(earner.debtAssumedZero),
      leasesExcluded: earner.operatingLeaseLiability ?? null,
    };
  });

  const periods = blocks.map((block) => block.period).filter(Boolean).sort();
  return {
    sic: industry.sic,
    label: industry.label,
    cost,
    blocks,
    totalEconomicProfit: pooled.totalEconomicProfit,
    totalInvestedCapital: pooled.totalInvestedCapital,
    revenueCovered: blocks.reduce((sum, block) => sum + (leaders.get(block.cik)?.share ?? 0), 0),
    leftOut,
    periods: periods.length ? { from: periods[0], to: periods[periods.length - 1] } : null,
  };
}

/** The cost of capital a researched industry's pool is judged against, as Investigate's default. */
export function poolCost(sic: string): CostEstimate | null {
  const industry = forSic(sic);
  return industry ? estimate(industry, TREASURY_RATE.rate, "treasury") : null;
}

/** Every researched industry's pool, keyed by SIC code. */
export const POOLS: ReadonlyMap<string, Pool> = new Map(
  (industriesData.industries as unknown as PoolIndustry[]).flatMap((industry) => {
    const cost = poolCost(industry.sic);
    return cost ? ([[industry.sic, poolFor(industry, cost)]] as const) : [];
  }),
);

/**
 * The block to explain first: the widest one that creates value, because a
 * worked example should be one whose area a reader can see.
 *
 * Falls back to the widest of all when nothing in the pool covers its cost of
 * capital, which is itself the finding.
 */
export function exampleBlock(pool: Pool): PoolBlock | null {
  const widest = (blocks: PoolBlock[]) =>
    blocks.reduce<PoolBlock | null>((best, block) => (!best || block.investedCapital > best.investedCapital ? block : best), null);
  return widest(pool.blocks.filter((block) => block.spread > 0)) ?? widest(pool.blocks);
}
