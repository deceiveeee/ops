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
 * 1. The four Mission 12 funds are derived from `lib/holdings-slate.ts` rather
 *    than retyped. That record carries their reviewed filings with accession
 *    numbers, audited in `docs/source-audits/mission-12-holdings.md`; copying
 *    the numbers here would create a second version to drift. The four entries
 *    that record does not cover — VXUS, two company shares and the Treasury
 *    note — are written out below, each with its own filing, because adding
 *    them to Mission 12’s teaching set would change the lesson.
 * 2. No fund carries a price. OPS holds no market-data licence, and EDGAR
 *    publishes filings, not quotes, so the buying worksheet keeps the dollar
 *    target and asks for a dated broker quote rather than inventing one. See
 *    `orderFor` in lib/studio.ts. The single exception is the Treasury note,
 *    which carries the auction price Treasury itself publishes.
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

/**
 * What a single company share needs beyond a fund's fields.
 *
 * Domicile, listing, trading currency and reporting currency are four separate
 * facts and the interface has to keep them apart. A US investor buys TSM in
 * dollars on the NYSE, but the company is incorporated in Taiwan and reports
 * in New Taiwan dollars — its 2025 net revenue was NT$3,809,054 million, which
 * the filing converts to US$121,423 million. Paying in dollars does not make
 * it a dollar business, and `docs/source-audits/studio-learning.md` (P3–P5)
 * records that separation as a requirement rather than a nicety.
 */
export type StudioStockFacts = {
  /** As the filing's own cover states it. */
  incorporatedIn: string;
  exchange: string;
  /** How a US investor holds it: ordinary shares, or depositary shares. */
  usListing: string;
  /** Underlying shares per US-listed unit, where the filing states a ratio. */
  adsRatio: number | null;
  /** The currency the business reports in, which need not be the traded one. */
  reportsIn: string;
  /** The annual report these facts came from. */
  annualReportForm: string;
};

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
  /** Null unless an official source publishes a price. Funds have none. */
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
  stock: StudioStockFacts | null;
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
 * says it tracks, not from a guess about how it behaves. All four of Mission
 * 12's products track US indexes; VXUS and the Treasury note are classified
 * where they are defined below.
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
    stock: null,
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
 * Two individual company shares, one US and one foreign.
 *
 * Both were chosen because a fund already in this catalog holds them: Apple is
 * VTI's and VOO's second largest documented issuer, and Taiwan Semiconductor is
 * VXUS's largest. Holding either one directly alongside its fund makes the
 * repeated-exposure check report the same company twice, which is the thing a
 * beginner buying a single stock most needs to see and cannot see anywhere
 * else in the product.
 *
 * Each carries the LEI its fund's N-PORT filing uses, so the two sides match on
 * an identifier rather than on a name.
 */
const APPLE: StudioInstrument = {
  id: "aapl",
  symbol: "AAPL",
  name: "Apple Inc.",
  kind: "stock",
  assetClass: "us-equity",
  // A share has no fund operating expenses. Null rather than zero: holding it
  // still costs commission and spread, which this figure does not describe.
  expenseRatioPct: null,
  referencePrice: null,
  priceAsOf: "",
  quantityStep: 1,
  minimumUnits: 1,
  // One company is one issuer, at its whole weight. Not a sample, so coverage
  // is complete — the opposite of a fund, where it never is.
  exposures: [{ label: "Apple Inc", key: "HWUPKR0MPOU8FGXBT394", weightPct: 100 }],
  exposureCoveragePct: 100,
  bond: null,
  stock: {
    incorporatedIn: "California, United States",
    exchange: "Nasdaq",
    usListing: "Ordinary common stock",
    adsRatio: null,
    reportsIn: "US dollars",
    annualReportForm: "10-K",
  },
  sources: [
    {
      label: "Form 10-K, Apple Inc., fiscal year ended 2025-09-27 (0000320193-25-000079)",
      url: filingIndexUrl("0000320193", "0000320193-25-000079"),
      asOf: "2025-09-27",
    },
  ],
  whatItIs:
    "A share in one company, not a fund. Apple designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services. It is incorporated in California and its shares trade on Nasdaq in US dollars.",
  // The filing’s own four risk-factor categories, in its order. Headings, not a
  // ranking, and each covers many specific risks the 10-K sets out in full. Only
  // the filing’s language belongs in this field: the card labels it as the
  // filing’s, and the single-company point is made in whatItIs instead.
  mainRisks: [
    "Macroeconomic and industry risks — the filing's first risk category",
    "Business risks, covering products, competition, suppliers and demand",
    "Legal and regulatory compliance risks",
    "Financial risks",
  ],
};

const TSMC: StudioInstrument = {
  id: "tsm",
  symbol: "TSM",
  name: "Taiwan Semiconductor Manufacturing Company Limited",
  kind: "stock",
  // Classified by where the business is, not by where it trades. TSM is bought
  // in dollars on a US exchange and is still a Taiwanese company, so the
  // international shock is the one that should apply to it.
  assetClass: "international-equity",
  expenseRatioPct: null,
  referencePrice: null,
  priceAsOf: "",
  quantityStep: 1,
  minimumUnits: 1,
  exposures: [
    { label: "Taiwan Semiconductor Manufacturing Co Ltd", key: "549300KB6NK5SBD14S87", weightPct: 100 },
  ],
  exposureCoveragePct: 100,
  bond: null,
  stock: {
    incorporatedIn: "Taiwan",
    exchange: "NYSE",
    usListing: "American depositary shares",
    // From the 20-F: "each ADS represents five (5) common shares".
    adsRatio: 5,
    reportsIn: "New Taiwan dollars",
    annualReportForm: "20-F",
  },
  sources: [
    {
      label:
        "Form 20-F, Taiwan Semiconductor Manufacturing Company Limited, year ended 2025-12-31 (0001628280-26-025362)",
      url: filingIndexUrl("0001046179", "0001628280-26-025362"),
      asOf: "2025-12-31",
    },
  ],
  whatItIs:
    "A share in one company, based in Taiwan and bought in US dollars. TSMC manufactures semiconductors to designs its customers provide — a business model it calls a dedicated semiconductor foundry. What trades on the NYSE is an American depositary share, and each one represents five of the company's common shares. The company reports in New Taiwan dollars: its 2025 net revenue was NT$3,809,054 million, which the filing converts to US$121,423 million. Buying in dollars does not remove that currency difference.",
  mainRisks: [
    "Risks relating to the business — the filing's own first category, covering demand, competition, supply and manufacturing",
    "Risks relating to owning depositary shares, which the filing lists separately, including limited voting rights",
    "Currency — the business earns in New Taiwan dollars while the shares are priced in US dollars",
  ],
};

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
  stock: null,
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
 * One broad international stock fund, so a portfolio built here is not
 * necessarily all-US and the stress model's international setting has
 * something real to act on.
 *
 * Reviewed 2026-09-04 from the fund's own filings. It is written out here
 * rather than added to lib/holdings-slate.ts because that record is Mission
 * 12's teaching set with its own audit; adding a fifth product would change
 * the lesson.
 *
 * The prospectus figures are from the ETF share class specifically. The filing
 * carries five separate prospectus sections for this one fund, one per share
 * class group, and only the ETF section describes VXUS.
 */
const VXUS: StudioInstrument = {
  id: "vxus",
  symbol: "VXUS",
  name: "Vanguard Total International Stock Index Fund",
  kind: "fund",
  assetClass: "international-equity",
  expenseRatioPct: 0.05,
  referencePrice: null,
  priceAsOf: "",
  quantityStep: 1,
  minimumUnits: 1,
  // The eight largest issuers by weight, rolled up across every position each
  // one holds. They are 12.9901% of a fund of 8,878 positions, which is what
  // `exposureCoveragePct` says: an overlap check against this fund sees an
  // eighth of it. The fund's holdings are unusually flat — its whole top ten
  // is 14.34% — so a short list cannot cover much of it, and pretending
  // otherwise would make an overlap result look more complete than it is.
  exposures: [
    { label: "Taiwan Semiconductor Manufacturing Co Ltd", key: "549300KB6NK5SBD14S87", weightPct: 3.9281 },
    { label: "Vanguard Cmt Funds-Vanguard Market Liquidity Fund", key: "1I6HV0TLSTR3A4XQ6L78", weightPct: 2.475 },
    { label: "Samsung Electronics Co Ltd", key: "9884007ER46L6N7EI764", weightPct: 1.8543 },
    { label: "ASML Holding NV", key: "724500Y6DUVHQD6OXN27", weightPct: 1.3047 },
    { label: "SK hynix Inc", key: "988400XAIK6XISWQV045", weightPct: 1.1234 },
    { label: "Tencent Holdings Ltd", key: "254900N4SLUMW4XUYY11", weightPct: 0.8746 },
    { label: "HSBC Holdings PLC", key: "MLU0ZO3ML4LN2LL2TL39", weightPct: 0.735 },
    { label: "Roche Holding AG", key: "549300U41AUUVOAAOB37", weightPct: 0.695 },
  ],
  exposureCoveragePct: 12.9901,
  bond: null,
  stock: null,
  sources: [
    {
      label:
        "485BPOS prospectus, Vanguard Star Funds, ETF share class (0001193125-26-077488)",
      url: filingIndexUrl("0000736054", "0001193125-26-077488"),
      asOf: "2026-02-27",
    },
    {
      label:
        "N-PORT holdings, Vanguard Total International Stock Index Fund (0000736054-26-000191)",
      url: filingIndexUrl("0000736054", "0000736054-26-000191"),
      asOf: "2026-04-30",
    },
  ],
  whatItIs:
    "An exchange-traded share class of an open-end index fund. It seeks to track the performance of a benchmark index that measures the investment return of stocks issued by companies located in developed and emerging markets, excluding the United States. It tracks the FTSE Global All Cap ex US Index and holds it by full replication, meaning it generally holds the same stocks as the index in approximately the same proportions.",
  mainRisks: [
    "Investing in foreign markets — political, economic and regulatory conditions differ from the US",
    "Emerging markets, where those foreign-market risks are heightened",
    "Currency — the shares it holds are priced in other currencies, so their dollar value moves with exchange rates as well as with the shares",
    "Index investing — it follows its index rather than stepping out of a falling market",
    "Concentration in whichever countries and companies its index weights most heavily",
    "ETF share trading — the market price may differ from net asset value",
  ],
};

/**
 * Order is the research library's reading order, not a ranking or a
 * recommendation: two broad US stock funds, one international stock fund, two
 * individual company shares, two US bond funds, one individual Treasury note.
 */
export const STUDIO_CATALOG: readonly StudioInstrument[] = [
  instrumentFromPassport(PRODUCTS.VTI),
  instrumentFromPassport(PRODUCTS.VOO),
  VXUS,
  APPLE,
  TSMC,
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
    missing: "A global fund, and more of any international fund's holdings",
    whyItMatters:
      "One international fund is here and it excludes the United States, so nothing in this library is a single global holding. The documented issuers cover 12.9901% of it, because a fund of 8,878 positions cannot be summarised by eight of them — an overlap check against it sees an eighth of the fund.",
    whatItNeeds:
      "A prospectus and N-PORT review per additional fund, and a deeper issuer list where a fund's holdings are too flat for a short one to be informative.",
  },
  {
    kind: "stock",
    missing: "More company shares, and any company's financial results",
    whyItMatters:
      "Two companies are here, both large and both already inside funds in this library. Neither carries revenue, profit, debt or a valuation, so nothing here supports judging whether a share is worth its price — only what the company is and what it says can go wrong.",
    whatItNeeds:
      "A per-company filing review for each addition, and a separate decision about whether Studio should carry financial statement figures at all, which is a much larger source commitment than identity and risk.",
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
