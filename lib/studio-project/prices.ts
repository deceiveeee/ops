/**
 * Dated prices derived from N-PORT holdings filings.
 *
 * A fund reports, for each position, how many shares it holds and what they were
 * worth in dollars. Price is the quotient. SEC filings are public domain, so
 * unlike every commercial feed examined this can actually be shown to a learner.
 *
 * Four things were measured against real filings before this was written, and
 * each one changed the design. They are recorded here because each is a mistake
 * this module exists to avoid.
 *
 * 1. **LEI is an issuer, not a security.** 217 of 5,378 issuers in the VXUS
 *    filing carry more than one security under one LEI. Cemex is $12.30 as a US
 *    ADR and $1.23 as a Mexican local share; Banco Santander Chile is $31.98 and
 *    $0.08. Keying prices on LEI silently averages those. Only ISIN and CUSIP
 *    identify a security, so a position carrying neither is refused a price.
 * 2. **The venue is part of the observation.** Barrick appears in one filing on
 *    three exchanges: New York at $39.3400 and Toronto at $39.2903, both fair
 *    value Level 1, and London at $39.3401 as Level 2, because that exchange had
 *    already closed. Same security, same day, three prices and two valuation
 *    levels. Currency and country therefore travel in the key.
 * 3. **With those two fixed, the arithmetic is exact.** VTI and VOO are
 *    independently filed portfolios that both reported 2026-03-31 and share 501
 *    securities. Their implied prices agree for **501 of 501**, worst difference
 *    0.000000% at printed precision. That agreement is kept as a live gate rather
 *    than a one-off check, so the day it stops holding, the snapshot says so.
 * 4. **Only share counts give a share price.** Filings also report `NC`, a number
 *    of derivative contracts whose quotient came out at −$2.67 and $2,367,874,
 *    and `PA`, a bond principal amount whose quotient is a price per unit of face.
 *    Both are excluded, with the reason recorded rather than dropped in silence.
 *
 * Nothing here touches the network. Fetching lives in `scripts/source/`.
 */

/** ASC 820 fair-value hierarchy, exactly as the filing states it. */
export type FairValueLevel = "1" | "2" | "3" | "unstated";

/**
 * Where a security was priced.
 *
 * Kept separate from the security because one security can have several, and
 * they legitimately disagree.
 */
export interface Venue {
  /** Currency the position was struck in. */
  currency: string;
  /** Country of the listing, as `invCountry`. */
  country: string;
}

export interface PriceObservation {
  /** `ISIN:xx` or `CUSIP:xx`. Never an LEI. */
  securityId: string;
  /** Security and venue together. Unique within one date. */
  observationKey: string;
  venue: Venue;
  /** Issuer identifier when filed. Useful for grouping, never for pricing. */
  lei: string | null;
  name: string;
  /** USD per share. */
  price: number;
  /**
   * Level 1 is a quoted market price. Level 2 is observable but adjusted, which
   * is what a foreign holding usually is once its exchange has closed. Showing
   * the two as the same kind of number would misrepresent one of them.
   */
  fairValueLevel: FairValueLevel;
  /** The date the holdings were true — `repPdDate`, not the filing date. */
  asOf: string;
  /** USD per unit of the venue currency, as filed. Null when the venue is USD. */
  exchangeRate: number | null;
  /** Shares behind the price, summed if one filing reported the venue in parts. */
  shares: number;
  /** USD value behind the price. */
  value: number;
  /** How many independent filings reported this security, venue and date. */
  corroborations: number;
  /** Largest relative disagreement among them. Zero when only one reported. */
  disagreement: number;
}

/** Why a position produced no price. Never silently dropped. */
export type ExclusionReason =
  | "not a share count"
  | "no share count"
  | "no dollar value"
  | "no security identifier"
  | "filings disagree";

export interface Exclusion {
  name: string;
  reason: ExclusionReason;
  detail: string;
}

export interface FilingMeta {
  cik: string;
  accession: string;
  /** Date the filing was submitted, distinct from the period it reports. */
  filedAt: string;
  /** Registrant name, for the source manifest. */
  entity: string;
  /** Series ticker where known, purely for human reading of the manifest. */
  ticker?: string;
}

export interface ExtractionResult {
  asOf: string | null;
  observations: PriceObservation[];
  exclusions: Exclusion[];
  filing: FilingMeta;
}

const tagOf = (xml: string, name: string): string | null => {
  const match = xml.match(new RegExp(`<${name}>([^]*?)</${name}>`));
  return match ? match[1].trim() : null;
};

/** Filings write the string "N/A" rather than omitting an identifier. */
const realId = (raw: string | null): string | null => {
  const value = (raw ?? "").trim();
  return value && value.toUpperCase() !== "N/A" ? value : null;
};

const asLevel = (raw: string | null): FairValueLevel =>
  raw === "1" || raw === "2" || raw === "3" ? raw : "unstated";

export const venueKey = (securityId: string, venue: Venue): string =>
  `${securityId}@${venue.currency}/${venue.country}`;

/**
 * Every derivable price in one N-PORT document, one per security and venue.
 *
 * Where a filing reports the same security at the same venue in more than one
 * lot, the lots are combined by total value over total shares. That is the
 * filing's own blended valuation and needs no assumption. Lots at *different*
 * venues are never combined, because they are different prices.
 */
export function extractObservations(xml: string, filing: FilingMeta): ExtractionResult {
  const asOf = tagOf(xml, "repPdDate");
  const exclusions: Exclusion[] = [];
  const lots = new Map<string, PriceObservation>();

  for (const match of xml.matchAll(/<invstOrSec>([^]*?)<\/invstOrSec>/g)) {
    const block = match[1];
    const name = tagOf(block, "name") ?? "(unnamed position)";

    const units = tagOf(block, "units");
    if (units !== "NS") {
      exclusions.push({
        name,
        reason: "not a share count",
        detail: units === "NC" ? "derivative contracts" : units === "PA" ? "bond principal amount" : `units ${units ?? "absent"}`,
      });
      continue;
    }

    const shares = Number(tagOf(block, "balance"));
    if (!(shares > 0)) {
      exclusions.push({ name, reason: "no share count", detail: tagOf(block, "balance") ?? "absent" });
      continue;
    }

    const value = Number(tagOf(block, "valUSD"));
    if (!(value > 0)) {
      exclusions.push({ name, reason: "no dollar value", detail: tagOf(block, "valUSD") ?? "absent" });
      continue;
    }

    const lei = realId(tagOf(block, "lei"));
    const isin = realId(block.match(/<isin value="([^"]*)"/)?.[1] ?? null);
    const cusip = realId(tagOf(block, "cusip"));
    // ISIN first: it has the widest coverage in the filings measured, and it is
    // the only identifier present for a third of international positions.
    const securityId = isin ? `ISIN:${isin}` : cusip ? `CUSIP:${cusip}` : null;
    if (!securityId) {
      exclusions.push({
        name,
        reason: "no security identifier",
        detail: lei ? `only an issuer LEI, ${lei}` : "no identifier of any kind",
      });
      continue;
    }

    // Foreign positions carry currency and rate as attributes of
    // currencyConditional; domestic ones carry a plain curCd tag and no rate.
    const fx = block.match(/curCd="([A-Z]{3})"\s+exchangeRt="([\d.]+)"/);
    const venue: Venue = {
      currency: fx ? fx[1] : tagOf(block, "curCd") ?? "USD",
      country: tagOf(block, "invCountry") ?? "??",
    };

    const key = venueKey(securityId, venue);
    const existing = lots.get(key);
    if (existing) {
      // Same security, same venue, reported in separate lots. Blend by value.
      existing.shares += shares;
      existing.value += value;
      existing.price = existing.value / existing.shares;
      continue;
    }

    lots.set(key, {
      securityId,
      observationKey: key,
      venue,
      lei,
      name,
      price: value / shares,
      fairValueLevel: asLevel(tagOf(block, "fairValLevel")),
      asOf: asOf ?? "",
      exchangeRate: fx ? Number(fx[2]) : null,
      shares,
      value,
      corroborations: 1,
      disagreement: 0,
    });
  }

  return { asOf, observations: [...lots.values()], exclusions, filing };
}

/**
 * How far two filings may disagree about the same security, venue and date.
 *
 * Measured agreement is exact — 501 of 501 at 0.000000% — so this is not a
 * fudge factor. It exists to catch the day the assumption breaks, and a breach
 * withholds the price rather than averaging through it.
 */
export const AGREEMENT_TOLERANCE = 0.0005;

export interface PoolResult {
  observations: PriceObservation[];
  exclusions: Exclusion[];
  conflicts: { name: string; observationKey: string; asOf: string; prices: number[]; spread: number }[];
}

/** Merge extractions from several filings into one observation per key and date. */
export function poolObservations(results: ExtractionResult[]): PoolResult {
  const groups = new Map<string, PriceObservation[]>();
  const exclusions: Exclusion[] = [];

  for (const result of results) {
    exclusions.push(...result.exclusions);
    for (const observation of result.observations) {
      if (!observation.asOf) continue;
      const key = `${observation.observationKey}|${observation.asOf}`;
      const bucket = groups.get(key);
      if (bucket) bucket.push(observation);
      else groups.set(key, [observation]);
    }
  }

  const observations: PriceObservation[] = [];
  const conflicts: PoolResult["conflicts"] = [];

  for (const bucket of groups.values()) {
    const prices = bucket.map((observation) => observation.price);
    const low = Math.min(...prices);
    const high = Math.max(...prices);
    const mid = (low + high) / 2;
    const spread = mid > 0 ? (high - low) / mid : 0;

    if (spread > AGREEMENT_TOLERANCE) {
      conflicts.push({ name: bucket[0].name, observationKey: bucket[0].observationKey, asOf: bucket[0].asOf, prices, spread });
      exclusions.push({
        name: bucket[0].name,
        reason: "filings disagree",
        detail: `${(spread * 100).toFixed(4)}% across ${prices.length} filings on ${bucket[0].asOf}`,
      });
      continue;
    }

    // Median rather than mean, so one bad filing among three cannot drag the
    // result; with an even count it falls between the two central values.
    const sorted = [...prices].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const price = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;

    // Keep the deepest holding's metadata: it is the best-evidenced of the group.
    const deepest = bucket.reduce((best, next) => (next.value > best.value ? next : best));
    observations.push({ ...deepest, price, corroborations: bucket.length, disagreement: spread });
  }

  observations.sort(
    (a, b) => a.asOf.localeCompare(b.asOf) || a.name.localeCompare(b.name) || a.observationKey.localeCompare(b.observationKey),
  );
  return { observations, exclusions, conflicts };
}

/**
 * A price struck from a market, as against one the fund modelled.
 *
 * Level 3 means the fund used inputs no market supplied. Measured across 490
 * such observations, they are two different populations and both are traps:
 *
 * - 282 of them are priced under a hundredth of a cent. These are write-downs,
 *   not prices — sanctioned Russian holdings, delisted shells, suspended
 *   listings. For contrast only 12 of 89,538 Level 1 and 2 observations are that
 *   cheap. Charting one as a price would show a real company collapsing to zero
 *   when what actually happened is that it stopped being tradeable.
 * - The rest are ordinary large holdings caught mid-event: Emirates
 *   Telecommunications at $5.16 on a $259M position, Samsung Biologics at $855,
 *   Tata Motors mid-demerger. The value is credible; it just was not quoted.
 *
 * So Level 3 is never silently mixed with quoted prices, and a caller that wants
 * "the price" should filter on this.
 */
export const isMarketPrice = (observation: PriceObservation): boolean =>
  observation.fairValueLevel === "1" || observation.fairValueLevel === "2";

/** Below this, a filed value is a write-down rather than a price. */
export const NEAR_ZERO_PRICE = 0.0001;

export interface SnapshotQuality {
  observations: number;
  securities: number;
  dates: string[];
  byLevel: Record<FairValueLevel, number>;
  /** Observations confirmed by more than one filing. */
  corroborated: number;
  /** Securities priced on more than one venue. */
  multiVenue: number;
  /** Level 3: valued from inputs no market supplied. Not quoted prices. */
  modelled: number;
  /** Priced below a hundredth of a cent, which means written down. */
  nearZero: number;
  exclusionsByReason: Record<string, number>;
  conflicts: number;
}

export interface PriceSnapshot {
  /** Immutable. Research done against a snapshot keeps referring to that one. */
  version: string;
  createdAt: string;
  /** Every filing this was built from, so any number can be traced back. */
  sources: FilingMeta[];
  observations: PriceObservation[];
  quality: SnapshotQuality;
}

export function buildSnapshot(
  version: string,
  results: ExtractionResult[],
  now = new Date().toISOString(),
): { snapshot: PriceSnapshot; conflicts: PoolResult["conflicts"] } {
  const pooled = poolObservations(results);

  const byLevel: Record<FairValueLevel, number> = { "1": 0, "2": 0, "3": 0, unstated: 0 };
  const venuesPerSecurity = new Map<string, Set<string>>();
  for (const observation of pooled.observations) {
    byLevel[observation.fairValueLevel]++;
    const seen = venuesPerSecurity.get(observation.securityId) ?? new Set<string>();
    seen.add(observation.observationKey);
    venuesPerSecurity.set(observation.securityId, seen);
  }

  const exclusionsByReason: Record<string, number> = {};
  for (const exclusion of pooled.exclusions) {
    exclusionsByReason[exclusion.reason] = (exclusionsByReason[exclusion.reason] ?? 0) + 1;
  }

  return {
    conflicts: pooled.conflicts,
    snapshot: {
      version,
      createdAt: now,
      sources: results.map((result) => result.filing),
      observations: pooled.observations,
      quality: {
        observations: pooled.observations.length,
        securities: venuesPerSecurity.size,
        dates: [...new Set(pooled.observations.map((observation) => observation.asOf))].sort(),
        byLevel,
        corroborated: pooled.observations.filter((observation) => observation.corroborations > 1).length,
        multiVenue: [...venuesPerSecurity.values()].filter((set) => set.size > 1).length,
        modelled: pooled.observations.filter((observation) => !isMarketPrice(observation)).length,
        nearZero: pooled.observations.filter((observation) => observation.price < NEAR_ZERO_PRICE).length,
        exclusionsByReason,
        conflicts: pooled.conflicts.length,
      },
    },
  };
}

/**
 * Every venue a security was priced on, deepest holding first.
 *
 * A caller that wants one price should take the first and say which venue it
 * came from, rather than pretending the others do not exist.
 */
export function venuesFor(snapshot: PriceSnapshot, securityId: string, asOf?: string): PriceObservation[] {
  return snapshot.observations
    .filter((observation) => observation.securityId === securityId && (!asOf || observation.asOf === asOf))
    .sort((a, b) => b.value - a.value);
}

/**
 * The observation series for one security at one venue, oldest first.
 *
 * Returns exactly what was observed. It does not interpolate, forward-fill or
 * regularise the dates, because a gap in coverage is information the learner
 * needs — a smooth monthly line built from four real points would be a lie about
 * how much is actually known.
 */
export function seriesFor(snapshot: PriceSnapshot, observationKey: string): PriceObservation[] {
  return snapshot.observations
    .filter((observation) => observation.observationKey === observationKey)
    .sort((a, b) => a.asOf.localeCompare(b.asOf));
}

export interface PeriodReturn {
  from: string;
  to: string;
  /** Calendar days between observations. They are not evenly spaced. */
  days: number;
  return: number;
}

/**
 * Period returns between consecutive observations.
 *
 * Each carries the gap in days that produced it. Anything building a covariance
 * from these has to account for the spacing rather than assume a regular month,
 * and dropping the gap would hide that obligation.
 *
 * These are price returns. They exclude dividends, so they are not total returns
 * and must not be labelled as such.
 */
export function periodReturns(series: PriceObservation[]): PeriodReturn[] {
  const out: PeriodReturn[] = [];
  for (let index = 1; index < series.length; index++) {
    const previous = series[index - 1];
    const current = series[index];
    if (!(previous.price > 0)) continue;
    out.push({
      from: previous.asOf,
      to: current.asOf,
      days: Math.round((Date.parse(`${current.asOf}T00:00:00Z`) - Date.parse(`${previous.asOf}T00:00:00Z`)) / 86_400_000),
      return: current.price / previous.price - 1,
    });
  }
  return out;
}
