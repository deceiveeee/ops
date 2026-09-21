/**
 * Choosing the dated price a learner's buying worksheet starts from.
 *
 * The catalogue's funds are not in the snapshot `prices.ts` builds: that comes
 * from stock index funds, which hold stocks rather than other funds. They are
 * priced instead from the holdings filings of funds that own them. A fund that
 * holds VTI reports, each month-end, how many shares it has and what they were
 * worth; one divided by the other is VTI's closing price that day
 * (docs/source-audits/studio-fund-prices.md).
 *
 * One fund's figure is one sample. A price is accepted only when at least two
 * **unrelated** funds report the same month-end and agree within the tolerance
 * `prices.ts` holds its own snapshot to. Unrelated means different registrants:
 * two series of one trust share a pricing agent and a back office, so their
 * agreeing proves much less than two strangers' does. A registrant is the nearest
 * thing a filing records to independence, and not a perfect one: one sponsor can
 * file under two trusts, as Columbia's Variable Portfolio funds do for AGG, so a
 * count of registrants can include two from one family. Measured before this was
 * written, unrelated funds agreed to the cent on every date where more than one
 * was read, for all six funds and shares checked.
 *
 * When no month-end qualifies, there is no price, and the worksheet goes on
 * asking for the broker's quote. A price that could not be checked is not shown.
 *
 * Nothing here touches the network; `scripts/source/fetch-catalog-prices.mjs`
 * does the fetching and calls this.
 */

import type { FairValueLevel } from "./prices";

/** One fund's report of the listing, read from its holdings filing. */
export interface HolderReport {
  /** The registrant. "Unrelated" is judged on this, not on the fund's name. */
  cik: string;
  accession: string;
  entity: string;
  series: string | null;
  filedAt: string;
  /** The month-end the holdings were true: the filing's report date, not when it was filed. */
  asOf: string;
  /** US dollars per share. */
  price: number;
  fairValueLevel: FairValueLevel;
  currency: string;
}

export interface SetAside {
  report: HolderReport;
  why: string;
}

export type PriceChoice =
  | {
      found: true;
      asOf: string;
      price: number;
      /** Every report on that date that agreed, including more than one per registrant. */
      agreeing: HolderReport[];
      /** How many different registrants those reports came from. */
      registrants: number;
      setAside: SetAside[];
    }
  | { found: false; reason: string; setAside: SetAside[] };

/**
 * Whether a filed security identifier names this US listing.
 *
 * Filers identify a holding either by CUSIP or by ISIN. A US ISIN is "US", the
 * nine-character CUSIP and a check digit, so the CUSIP sits inside it. Nothing
 * looser is accepted: matching on names found a different Taiwanese company,
 * at $2.03, when looking for TSMC.
 */
export function namesListing(securityId: string, cusip: string): boolean {
  const id = securityId.toUpperCase();
  const wanted = cusip.toUpperCase();
  if (id === `CUSIP:${wanted}`) return true;
  return id.length === 17 && id.startsWith("ISIN:US") && id.slice(7, 16) === wanted;
}

const agrees = (a: number, b: number, tolerance: number): boolean =>
  Math.abs(a - b) <= tolerance * Math.max(Math.abs(a), Math.abs(b));

/**
 * The newest month-end on which enough unrelated funds agree, and its price.
 *
 * The price returned is one a fund actually reported, the lower middle of those
 * that agreed, never an average of them: an average of prices that agree to a
 * few hundredths of a cent is a number nobody filed.
 */
export function choosePrice(reports: HolderReport[], tolerance: number, minimumRegistrants = 2): PriceChoice {
  const setAside: SetAside[] = [];
  const usable: HolderReport[] = [];
  for (const report of reports) {
    if (report.currency !== "USD") {
      setAside.push({ report, why: `valued in ${report.currency}, not the US listing's dollars` });
    } else if (report.fairValueLevel !== "1") {
      setAside.push({ report, why: `fair-value level ${report.fairValueLevel}, not a quoted market price` });
    } else if (!Number.isFinite(report.price) || report.price <= 0) {
      setAside.push({ report, why: "no usable price" });
    } else {
      usable.push(report);
    }
  }

  const dates = [...new Set(usable.map((report) => report.asOf))].sort().reverse();
  for (const asOf of dates) {
    const onDate = usable.filter((report) => report.asOf === asOf);
    let best: { group: HolderReport[]; registrants: number } | null = null;
    for (const anchor of onDate) {
      const group = onDate.filter((report) => agrees(report.price, anchor.price, tolerance));
      const registrants = new Set(group.map((report) => report.cik)).size;
      if (!best || registrants > best.registrants) best = { group, registrants };
    }

    if (best && best.registrants >= minimumRegistrants) {
      const prices = best.group.map((report) => report.price).sort((a, b) => a - b);
      const price = prices[Math.floor((prices.length - 1) / 2)];
      for (const report of onDate) {
        if (!best.group.includes(report)) {
          setAside.push({ report, why: `disagreed with funds under ${best.registrants} registrants on ${asOf}` });
        }
      }
      return { found: true, asOf, price, agreeing: best.group, registrants: best.registrants, setAside };
    }

    // A newer month-end that could not be checked is recorded, not quietly skipped.
    const registrants = best ? best.registrants : 0;
    for (const report of onDate) {
      setAside.push({
        report,
        why: `on ${asOf} funds under only ${registrants} ${registrants === 1 ? "registrant" : "registrants"} agreed, so it could not be checked`,
      });
    }
  }

  return {
    found: false,
    reason: usable.length
      ? `No month-end on which funds under ${minimumRegistrants} different registrants reported the same quoted price.`
      : "No fund reported a quoted US-dollar price for it.",
    setAside,
  };
}
