import { PRODUCTS, RETRIEVED_AT, type Passport } from "@/lib/holdings-slate";

/**
 * The investments a user can research inside Studio.
 *
 * Every fact here comes from a named filing with a date, or is `null`. There is
 * no third option. A plausible-looking expense ratio or price with no filing
 * behind it would be indistinguishable, to the user, from a verified one — and
 * this is the file they would be trusting when they decide what to buy.
 *
 * Two consequences of that rule shape the whole module:
 *
 * 1. Entries are derived from `lib/holdings-slate.ts` rather than retyped. That
 *    record carries Mission 12's reviewed filings with their accession numbers,
 *    and `docs/source-audits/mission-12-holdings.md` is its audit. Copying the
 *    numbers here would create a second version to drift.
 * 2. `referencePrice` is null everywhere. OPS holds no market-data licence, and
 *    EDGAR publishes filings, not quotes. The buying worksheet already handles
 *    this: it keeps the dollar target and asks for a dated broker quote rather
 *    than inventing a price. See `orderFor` in lib/studio.ts.
 *
 * `CATALOG_GAPS` records what a user cannot yet research here. Studio must show
 * that rather than let an incomplete library read as a complete one.
 */

export type StudioAssetClass =
  | "us-equity"
  | "international-equity"
  | "global-equity"
  | "fixed-income"
  | "cash";

export type StudioInstrumentKind = "fund" | "stock" | "bond";

export type StudioSource = {
  label: string;
  url: string;
  /** The date the source states its facts were true, not the date it was read. */
  asOf: string;
};

/**
 * One issuer inside a fund, for the repeated-exposure check.
 *
 * `key` is the issuer's Legal Entity Identifier where the filing states one,
 * and it is what two funds are matched on. Names cannot do that job: AGG files
 * its largest issuer as "United States Treasury" and SGOV files the same issuer
 * as "United States of America", both under LEI 254900HROIFWPRGM1V77. Matching
 * on the label would tell someone holding both funds that they have no repeated
 * exposure, when in fact one issuer is most of what they own.
 */
export type StudioExposure = { label: string; key?: string; weightPct: number };

export type StudioBondTerms = {
  cusip: string;
  couponPct: number;
  maturity: string;
  /**
   * Per $100 of face value, at a stated settlement date. Null when no reviewed
   * source states it — the worksheet then excludes it and says the total is
   * incomplete, which is true, rather than silently treating it as zero.
   */
  accruedInterestPer100: number | null;
};

export interface StudioInstrument {
  id: string;
  symbol: string;
  name: string;
  kind: StudioInstrumentKind;
  assetClass: StudioAssetClass;
  /** Annual fund operating expenses. Null for anything with no filed fee table. */
  expenseRatioPct: number | null;
  /** Always null: no market-data licence. The user supplies a dated quote. */
  referencePrice: number | null;
  priceAsOf: string;
  /** Smallest tradeable increment. Shares for funds and stocks; face value for bonds. */
  quantityStep: number;
  minimumUnits: number;
  exposures: StudioExposure[];
  /**
   * How much of this instrument's holdings the exposures above actually
   * document. A top-ten list of a 3,524-position fund covers about a third of
   * it, so an overlap check built on it is partial and must say so.
   */
  exposureCoveragePct: number | null;
  bond: StudioBondTerms | null;
  sources: StudioSource[];
  /** Plain-language, drawn from the filing's own objective and structure. */
  whatItIs: string;
  /** The filing's own principal-risk language, not an OPS ranking. */
  mainRisks: string[];
}

/** EDGAR's filing index page for one accession. */
function filingIndexUrl(cik: string, accession: string): string {
  const bare = accession.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${bare}/${accession}-index.htm`;
}

/**
 * Asset class drives the stress scenario, so it is assigned from what each fund
 * says it tracks, not from a guess about how it behaves. All four reviewed
 * products track US indexes; none is an international or global fund, which is
 * exactly why `CATALOG_GAPS` names that as missing.
 */
const ASSET_CLASS: Record<string, StudioAssetClass> = {
  VTI: "us-equity",
  VOO: "us-equity",
  AGG: "fixed-income",
  SGOV: "fixed-income",
};

function instrumentFromPassport(passport: Passport): StudioInstrument {
  const { holdings, prospectus } = passport;
  return {
    id: passport.ticker.toLowerCase(),
    symbol: passport.ticker,
    name: passport.legalSeriesName,
    kind: "fund",
    assetClass: ASSET_CLASS[passport.ticker] ?? "us-equity",
    expenseRatioPct: passport.totalExpensePct,
    referencePrice: null,
    priceAsOf: "",
    quantityStep: 1,
    minimumUnits: 1,
    // Issuer rollup, not the raw position list: two share classes of one
    // company are one exposure, which is the question an overlap check asks.
    exposures: holdings.topIssuers.map((issuer) => ({
      label: issuer.name,
      // Null where the filing left the LEI empty, which holdings-slate.ts
      // records as a fact rather than an error. Those fall back to the name.
      key: issuer.lei ?? undefined,
      weightPct: issuer.weightPct,
    })),
    // The sum of those issuers, not the record's `shownCoveragePct`. The two
    // measure different slices: `shownCoveragePct` covers the top *positions*,
    // while each issuer row already aggregates every position that issuer has.
    // AGG shows why the distinction matters — its top ten positions are 4.64%
    // of the fund, but rolled up by issuer the same list accounts for about
    // 72%, because one issuer can span hundreds of positions (United States
    // Treasury: 45.7% across 295 of them). Pairing the issuer list with the
    // position figure would understate documented coverage roughly sixteenfold
    // and make the overlap check look far weaker than the filing supports.
    exposureCoveragePct: Math.min(
      100,
      holdings.topIssuers.reduce((total, issuer) => total + issuer.weightPct, 0),
    ),
    bond: null,
    sources: [
      {
        label: `${prospectus.form} prospectus, ${passport.registrant} (${prospectus.accession})`,
        url: filingIndexUrl(passport.cik, prospectus.accession),
        asOf: prospectus.dated,
      },
      {
        label: `N-PORT holdings, ${passport.legalSeriesName} (${holdings.accession})`,
        url: filingIndexUrl(passport.cik, holdings.accession),
        asOf: holdings.asOf,
      },
    ],
    whatItIs: `${passport.structure} ${passport.objective} It tracks the ${passport.targetIndex} and holds it by ${
      passport.replication === "full" ? "full replication" : "sampling"
    }. Listed on ${passport.listing}.`,
    mainRisks: passport.riskHighlights,
  };
}

/**
 * One individual Treasury note, so the buying worksheet's face-value and
 * accrued-interest handling has a real issue to work on.
 *
 * Every figure is from the US Treasury's own auction record for this CUSIP,
 * retrieved 2026-09-04 from the Fiscal Data auctions query. It is the only
 * catalog entry carrying a price, and the reason is narrow: Treasury publishes
 * the auction price itself, so this is an official dated figure rather than
 * market data OPS is not licensed to supply. It is the price at one auction on
 * one date, not a current quote, and the worksheet says so — an entry with a
 * `referencePrice` and no user quote already warns that it is a dated research
 * price to verify with a broker.
 */
const TREASURY_10Y: StudioInstrument = {
  id: "ust-91282crf0",
  symbol: "91282CRF0",
  name: "United States Treasury Note, 4.625% due 15 August 2036",
  kind: "bond",
  assetClass: "fixed-income",
  // A single bond has no fund operating expenses. Null, not zero: a broker's
  // markup is a real cost and is simply not stated here.
  expenseRatioPct: null,
  referencePrice: 99.540696,
  priceAsOf: "2026-08-12",
  // Treasury sets a $100 minimum in $100 multiples. A broker may require more,
  // which the worksheet tells the user to confirm.
  quantityStep: 100,
  minimumUnits: 100,
  // A Treasury note is entirely one issuer, which is a fact rather than a
  // sample. The LEI is the one N-PORT filings use for this issuer, so a
  // portfolio holding this note alongside AGG or SGOV shows the concentration
  // instead of reading as three separate things.
  exposures: [{ label: "United States of America", key: "254900HROIFWPRGM1V77", weightPct: 100 }],
  exposureCoveragePct: 100,
  bond: {
    cusip: "91282CRF0",
    couponPct: 4.625,
    maturity: "2036-08-15",
    // Accrued interest depends on the settlement date, and the auction record
    // states it only for issue-date settlement. Any other date needs its own
    // figure, so the worksheet excludes it and says the total is incomplete.
    accruedInterestPer100: null,
  },
  sources: [
    {
      label: "US Treasury auction results for CUSIP 91282CRF0, 10-year note auctioned 2026-08-12, issued 2026-08-17",
      url: "https://www.treasurydirect.gov/auctions/announcements-data-results/",
      asOf: "2026-08-12",
    },
  ],
  whatItIs:
    "A loan to the United States government. It pays 4.625% a year on its face value, in two payments a year, and repays the face value on 15 August 2036. Bought at auction for 99.540696 per $100 of face value. Prices are quoted per $100 of face value, so $1,000 of face value at a quote of 99.54 costs about $995.40, plus any interest that has built up since the last payment.",
  mainRisks: [
    "Its market price falls when interest rates rise, and the longer the time to maturity the larger that move",
    "Selling before 15 August 2036 means taking whatever price the market offers, which can be less than you paid",
    "Inflation can outpace a fixed 4.625% payment, so the money repaid buys less than the money lent",
  ],
};

/**
 * Order is the research library's reading order, not a ranking or a
 * recommendation: two broad US stock funds, two US bond funds, one individual
 * Treasury note.
 */
export const STUDIO_CATALOG: readonly StudioInstrument[] = [
  instrumentFromPassport(PRODUCTS.VTI),
  instrumentFromPassport(PRODUCTS.VOO),
  instrumentFromPassport(PRODUCTS.AGG),
  instrumentFromPassport(PRODUCTS.SGOV),
  TREASURY_10Y,
];

/** The date every catalog filing above was retrieved and reviewed. */
export const CATALOG_REVIEWED_AT = RETRIEVED_AT;

export function findStudioInstrument(id: string): StudioInstrument | undefined {
  return STUDIO_CATALOG.find((instrument) => instrument.id === id);
}

export type StudioCatalogGap = {
  kind: StudioInstrumentKind | "international";
  missing: string;
  whyItMatters: string;
  whatItNeeds: string;
};

/**
 * What this library cannot yet answer.
 *
 * Studio's promise is that a user can research their portfolio without leaving
 * it. Where that is not yet true the interface has to say so plainly, because
 * a user who cannot find international funds should learn that OPS has not
 * reviewed any — not conclude that none are worth holding.
 */
export const CATALOG_GAPS: readonly StudioCatalogGap[] = [
  {
    kind: "international",
    missing: "International and global stock funds",
    whyItMatters:
      "All four reviewed funds track US indexes, so a portfolio built only from this library holds US companies. The stress scenario has international and global settings with nothing yet to apply them to.",
    whatItNeeds:
      "A prospectus and N-PORT review for each candidate fund, the same review Mission 12 ran on the four already here.",
  },
  {
    kind: "stock",
    missing: "Individual company shares, US and foreign",
    whyItMatters:
      "Researching one company is a different job from researching a fund: it needs the company's own filings, and for a foreign company the domicile, trading currency and where the business actually earns its money are three separate facts.",
    whatItNeeds:
      "Per-company filing review, plus the ADR mechanics already sourced in docs/source-audits/studio-learning.md (P3, P4).",
  },
  {
    kind: "bond",
    missing: "More individual bonds, and accrued interest for the one that is here",
    whyItMatters:
      "The catalog holds a single Treasury note. There are no corporate or municipal bonds, and no issue states accrued interest for a settlement date you choose, so a bond's estimated total here is short by exactly that unstated amount.",
    whatItNeeds:
      "Per-issue terms from each issuer's official source, and an accrual basis worked out for the settlement date rather than for the auction.",
  },
];
