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
 * Order is the research library's reading order, not a ranking or a
 * recommendation: two broad US stock funds, then two US bond funds.
 */
export const STUDIO_CATALOG: readonly StudioInstrument[] = [
  instrumentFromPassport(PRODUCTS.VTI),
  instrumentFromPassport(PRODUCTS.VOO),
  instrumentFromPassport(PRODUCTS.AGG),
  instrumentFromPassport(PRODUCTS.SGOV),
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
    missing: "Individual bonds, including Treasuries",
    whyItMatters:
      "The buying worksheet already prices bonds by face value and accrued interest, but no reviewed issue exists to apply it to.",
    whatItNeeds:
      "Per-issue terms — CUSIP, coupon, maturity and an accrual basis — from an official source such as TreasuryDirect, with the settlement date the accrued figure assumes.",
  },
];
