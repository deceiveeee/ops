/**
 * Reading an industry the way Morgan Stanley's Counterpoint Global reads one.
 *
 * The measures here follow *Measuring the Moat* (Michael Mauboussin and Dan
 * Callahan, Counterpoint Global, Morgan Stanley Investment Management, 2025).
 * Definitions are the paper's; the code is OPS's, and where the paper leaves a
 * choice open this file says which choice was made and why.
 *
 * The paper's own ordering matters and is preserved: look at the industry from
 * the outside in — who is in it, how the money is split, how much share moves —
 * before forming a view about any single company.
 *
 * **The finding that shapes how all of this should be taught.** The paper reports
 * that for US companies between 1963 and 2023, the variance *within* industries
 * exceeds the variance *across* them, and concludes that the industry "is
 * important but does not dictate a firm's destiny. All industries have companies
 * that create and destroy value." So an industry screen narrows the search; it
 * does not settle it, and a surface built on this must not imply otherwise.
 *
 * **A second caution the paper states outright**, and which must survive into any
 * interface: "common measures of concentration are not reliably linked to
 * sustainable value creation or stock returns. Market share provides a better
 * link to profitability than does concentration." Concentration is therefore
 * reported here as description, never as a verdict, and share and its movement
 * are the headline.
 */

export interface IndustryMember {
  /** SEC's identifier for the filer. Stable where a ticker is not. */
  cik: number;
  name: string;
  /** Revenue for the period, in USD. */
  revenue: number;
  /** Which XBRL concept the figure came from. */
  revenueConcept: string;
  /**
   * How far apart this company's competing revenue concepts were.
   *
   * 1 means it reported one concept, or they agreed. Higher means the figures
   * disagreed and the largest was taken; above `BASIS_UNCERTAIN` the basis is
   * doubtful and the company should be resolved individually before it is
   * relied on. Measured across 5,086 filers: 1,083 report under more than one
   * revenue concept and 245 disagree by more than half again, because the
   * contract-revenue concepts capture a subset. Humana's subset is $4.43B
   * against $117.8B; Charter's is $0.94B against $55.1B.
   */
  basisSpread: number;
  periodEnd: string;
  accession: string;
}

/** Above this ratio between competing concepts, treat the revenue basis as unsettled. */
export const BASIS_UNCERTAIN = 1.5;

/**
 * Above this ratio, refuse to use the company at all.
 *
 * The usual reason two concepts disagree is that one is a subset of the other,
 * and there the larger is right: Burlington Northern files $91M of `Revenues`
 * against $23.4B of contract revenue, and $23.4B is the railroad. But the same
 * pattern also appears when a filer makes a scale error. Tigo Energy's own 10-K
 * tags `Revenues` at $54.0M and contract revenue at $54,014.0M — the same
 * filing, the same period, exactly one thousand times apart — and taking the
 * larger made a small solar-electronics company 10.4% of the semiconductor
 * industry, ahead of Intel.
 *
 * Preferring the larger is right for Burlington Northern and wrong for Tigo.
 * Preferring `Revenues` is right for Tigo and wrong for Burlington Northern.
 * Cross-sectionally there is nothing left to break the tie, so past this ratio
 * the company is dropped from the shares and reported, rather than guessed at.
 * It costs about 29 filers in 5,000 and is exactly the set that has to be
 * resolved individually with `metrics.ts` before it can be trusted.
 */
export const BASIS_UNRESOLVABLE = 100;

export interface ShareRow {
  name: string;
  cik: number;
  revenue: number;
  /** Fraction of the industry total, 0 to 1. */
  share: number;
  basisUncertain: boolean;
}

/**
 * Each company's share of the industry's revenue.
 *
 * Revenue is a proxy for the market. The paper's own examples use physical or
 * usage measures where they exist — revenue passenger miles for airlines, units
 * for cars, page views for search — which are better because they are not
 * distorted by price or by how much of the value chain a firm owns. Revenue is
 * what public filings give without a commercial licence, and the difference
 * should be stated rather than glossed.
 */
export function marketShares(members: IndustryMember[]): ShareRow[] {
  const usable = members.filter((member) => member.revenue > 0 && member.basisSpread <= BASIS_UNRESOLVABLE);
  const total = usable.reduce((sum, member) => sum + member.revenue, 0);
  if (!(total > 0)) return [];
  return usable
    .map((member) => ({
      name: member.name,
      cik: member.cik,
      revenue: member.revenue,
      share: member.revenue / total,
      basisUncertain: member.basisSpread > BASIS_UNCERTAIN,
    }))
    .sort((a, b) => b.share - a.share);
}

/**
 * Herfindahl-Hirschman Index: the sum of squared market shares.
 *
 * Expressed on the conventional 0-10,000 scale, so shares enter as percentage
 * points. A monopoly is 10,000; ten equal firms are 1,000.
 *
 * Reported, not interpreted. The paper is explicit that concentration measures
 * are not reliably linked to value creation, and that defining the market is
 * itself hard — so a number here is a description of who holds what, not a
 * finding about whether the industry is a good place to invest.
 */
export function herfindahl(shares: ShareRow[]): number {
  return shares.reduce((sum, row) => sum + (row.share * 100) ** 2, 0);
}

/** Combined share of the largest `n` firms. C4 is the usual one. */
export function concentrationRatio(shares: ShareRow[], n = 4): number {
  return shares.slice(0, n).reduce((sum, row) => sum + row.share, 0);
}

/** The name the rolled-up tail is given, matching the paper's tables. */
export const OTHER_BUCKET = "Other";

/**
 * The largest `n` companies, with everything else rolled into one "Other" row.
 *
 * This exists because instability is an *average* over rows, so the number of
 * rows changes the answer. Every exhibit in the paper lists between four and
 * thirteen named competitors plus an "Other" bucket summing to 100%. Averaged
 * instead over all 313 pharmaceutical filers, of which most are minute and
 * barely move, the average collapses towards zero and is no longer the quantity
 * the paper's two-percent rule of thumb was calibrated against.
 *
 * So a figure meant to be read against that rule must be computed this way, and
 * one computed over every filer must not be.
 */
export function topWithOther(shares: ShareRow[], n = 10): ShareRow[] {
  return namedWithOther(shares, new Set(shares.slice(0, n).map((row) => row.cik)));
}

/** The given companies as their own rows, everything else pooled into "Other". */
function namedWithOther(shares: ShareRow[], named: Set<number>): ShareRow[] {
  const head = shares.filter((row) => named.has(row.cik));
  const tail = shares.filter((row) => !named.has(row.cik));
  if (!tail.length) return head;
  return [
    ...head,
    {
      name: OTHER_BUCKET,
      cik: 0,
      revenue: tail.reduce((sum, row) => sum + row.revenue, 0),
      share: tail.reduce((sum, row) => sum + row.share, 0),
      basisUncertain: tail.some((row) => row.basisUncertain),
    },
  ];
}

/**
 * The same companies named in both periods, with each period's remainder pooled.
 *
 * Truncating each period separately makes a company that is tenth in one year
 * and eleventh in the other look as though it appeared or disappeared. Analog
 * Devices filed in both 2019 and 2024, and slipping from the top ten to
 * eleventh had the surface report it as "no longer filing" — a strong claim,
 * and false. Every exhibit in the paper lists the same names down both columns,
 * so the named set is the union of each period's leaders.
 */
export function alignedLeaders(earlier: ShareRow[], later: ShareRow[], n = 10): { earlier: ShareRow[]; later: ShareRow[] } {
  const named = new Set([...earlier.slice(0, n), ...later.slice(0, n)].map((row) => row.cik));
  return { earlier: namedWithOther(earlier, named), later: namedWithOther(later, named) };
}

export interface InstabilityRow {
  name: string;
  earlierShare: number | null;
  laterShare: number | null;
  /** Absolute change in share. Entry and exit count as a full move. */
  absoluteChange: number;
}

export interface Instability {
  /** The headline: the average absolute change in share. */
  average: number;
  years: number | null;
  rows: InstabilityRow[];
  /** True where the paper's rule of thumb calls the industry stable. */
  stableByRuleOfThumb: boolean | null;
}

/**
 * Market share instability, by the method the paper attributes to Bruce
 * Greenwald: take each company's share in two periods, three to five years
 * apart, take the absolute value of each change, and average them.
 *
 * The paper's rule of thumb: over five years, an average absolute change of two
 * percentage points or less is relatively stable, and more than that indicates
 * instability. That test is stated for a five-year gap, so it is only applied
 * when the gap is four to six years — quoting a five-year threshold against a
 * one-year change would be wrong.
 *
 * A company present in one period and not the other is an entry or an exit,
 * which is mobility of exactly the kind this measures. Its absent share counts
 * as zero rather than being dropped.
 */
export function shareInstability(earlier: ShareRow[], later: ShareRow[], years: number | null = null): Instability {
  // Identity is the CIK, never the name. Union Pacific filed as "UNION PACIFIC
  // CORPORATION" in 2019 and "UNION PACIFIC CORP" in 2024; matched on name that
  // is a 30-point exit plus a 32-point entry, and it alone pushed the railroad
  // industry's instability from about 1.6% to 9.0%. Names are for reading.
  const identity = (row: ShareRow) => (row.cik > 0 ? `cik:${row.cik}` : `name:${row.name}`);
  const earlierByKey = new Map(earlier.map((row) => [identity(row), row]));
  const laterByKey = new Map(later.map((row) => [identity(row), row]));
  const keys = [...new Set([...earlierByKey.keys(), ...laterByKey.keys()])];

  const rows: InstabilityRow[] = keys
    .map((key) => {
      const before = earlierByKey.get(key);
      const after = laterByKey.get(key);
      return {
        // Prefer the later name: it is what the company calls itself now.
        name: after?.name ?? before?.name ?? key,
        earlierShare: before?.share ?? null,
        laterShare: after?.share ?? null,
        absoluteChange: Math.abs((after?.share ?? 0) - (before?.share ?? 0)),
      };
    })
    .sort((a, b) => b.absoluteChange - a.absoluteChange);

  const average = rows.length ? rows.reduce((sum, row) => sum + row.absoluteChange, 0) / rows.length : 0;
  const fiveYearish = years !== null && years >= 4 && years <= 6;

  return { average, years, rows, stableByRuleOfThumb: fiveYearish ? average <= 0.02 : null };
}

export interface ProfitPoolEntry {
  name: string;
  /** Return on invested capital, as a fraction. */
  roic: number;
  /**
   * Weighted average cost of capital, as a fraction.
   *
   * Not derivable from filings: it needs a cost of equity, which needs a beta
   * and an equity risk premium, neither of which a company reports. It is an
   * input with its own provenance, and the interface must show whose number it
   * is rather than presenting it as a fact read off a filing.
   */
  wacc: number;
  investedCapital: number;
}

export interface ProfitPoolBand extends ProfitPoolEntry {
  /** ROIC less WACC. The height of the band. */
  spread: number;
  /** Spread times invested capital: the area, and the economic profit. */
  economicProfit: number;
  /** Share of the industry's invested capital. The width of the band. */
  capitalShare: number;
}

/**
 * A profit pool: where the economic profit in an industry actually sits.
 *
 * Economic profit is (ROIC − WACC) × invested capital. Drawn the paper's way,
 * the spread is the height of each band and invested capital its width, so the
 * area is the economic profit and a reader can see at a glance where the money
 * is made. The aviation example in the paper has most of the capital in airlines
 * and airports, both with negative economic profit.
 *
 * Bands come back ordered by spread, highest first, which is how the chart is
 * drawn.
 */
export function profitPool(entries: ProfitPoolEntry[]): { bands: ProfitPoolBand[]; totalEconomicProfit: number; totalInvestedCapital: number } {
  const totalInvestedCapital = entries.reduce((sum, entry) => sum + Math.max(0, entry.investedCapital), 0);
  const bands = entries
    .map((entry) => {
      const spread = entry.roic - entry.wacc;
      return {
        ...entry,
        spread,
        economicProfit: spread * entry.investedCapital,
        capitalShare: totalInvestedCapital > 0 ? entry.investedCapital / totalInvestedCapital : 0,
      };
    })
    .sort((a, b) => b.spread - a.spread);

  return { bands, totalEconomicProfit: bands.reduce((sum, band) => sum + band.economicProfit, 0), totalInvestedCapital };
}

export interface IndustryPicture {
  shares: ShareRow[];
  hhi: number;
  c4: number;
  /** Companies whose revenue basis is doubtful but which are still counted. */
  uncertainBasis: string[];
  /** Companies dropped outright: their competing figures cannot be adjudicated. */
  unresolvable: { name: string; spread: number; revenue: number }[];
  /**
   * Instability over the leading firms plus an "Other" bucket, which is how the
   * paper computes it and the only form its two-percent rule applies to.
   */
  instability: Instability | null;
  /**
   * The same measure over every filer. Structurally smaller, because most
   * registrants are minute and barely move. Reported so the difference between
   * the two is visible rather than a hidden choice.
   */
  instabilityAllFilers: Instability | null;
}

/** Everything the outside-in view needs, from one or two periods of members. */
export function industryPicture(
  latest: IndustryMember[],
  earlier: IndustryMember[] | null = null,
  years: number | null = null,
  leaders = 10,
): IndustryPicture {
  // A company dropped in one period must be dropped in the other. Excluding
  // Burlington Northern from 2024 alone, while it remained in 2019, read as an
  // exit and pushed the railroads' instability from 1.6% to 10.5% — the
  // exclusion inventing exactly the mobility it was meant not to distort.
  const unusable = new Set(
    [...latest, ...(earlier ?? [])].filter((m) => m.basisSpread > BASIS_UNRESOLVABLE).map((m) => m.cik),
  );
  const keep = (members: IndustryMember[]) => members.filter((member) => !unusable.has(member.cik));

  const shares = marketShares(keep(latest));
  const earlierShares = earlier ? marketShares(keep(earlier)) : null;
  return {
    shares,
    hhi: herfindahl(shares),
    c4: concentrationRatio(shares, 4),
    uncertainBasis: shares.filter((row) => row.basisUncertain).map((row) => row.name),
    unresolvable: [...latest, ...(earlier ?? [])]
      .filter((member) => unusable.has(member.cik))
      .filter((member, index, all) => all.findIndex((m) => m.cik === member.cik) === index)
      .map((member) => ({ name: member.name, spread: member.basisSpread, revenue: member.revenue }))
      .sort((a, b) => b.spread - a.spread),
    instability: earlierShares
      ? (() => {
          const aligned = alignedLeaders(earlierShares, shares, leaders);
          return shareInstability(aligned.earlier, aligned.later, years);
        })()
      : null,
    instabilityAllFilers: earlierShares ? shareInstability(earlierShares, shares, years) : null,
  };
}
