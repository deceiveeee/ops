/**
 * Mission 12 — Holdings Slate.
 *
 * Every figure here was read from a named SEC filing on 2026-08-16 and is
 * recorded, with its accession number, in `docs/source-audits/mission-12-holdings.md`
 * and `docs/release-evidence/mission-12-holdings.md`. Nothing is live, nothing
 * refreshes, and nothing here is a recommendation: the four products are worked
 * examples of a category, spread deliberately across two sponsors.
 *
 * Holdings are shipped as a bounded subset. A full N-PORT is 519 to 13,269
 * positions; the top slice below carries its own `shownCoveragePct` so the UI
 * can state what share of the fund the learner is actually looking at. The
 * headline overlap figures in `RECORDED_OVERLAP` were computed at Gate A from
 * the *complete* filings and are cited, never recomputed from this subset —
 * recomputing them here would silently produce a different number.
 */

export type IssuerKeyMode = "instrument" | "issuer";

export type Sleeve = "growth" | "stability" | "liquidity";

export type Position = {
  name: string;
  cusip: string;
  /** null where the filing left `lei` empty or "N/A". Not an error — a fact. */
  lei: string | null;
  weightPct: number;
};

export type IssuerRow = {
  name: string;
  lei: string | null;
  weightPct: number;
  /** How many separate filed positions rolled up into this issuer. */
  positions: number;
};

export type HoldingsRecord = {
  accession: string;
  filed: string;
  /** `repPdDate` — the date the holdings were true. */
  asOf: string;
  /**
   * `repPdEnd` — the fiscal year end. It sits beside `asOf` in the XML, reads
   * like the holdings date, and is not. Carried so the lesson can show the trap.
   */
  fiscalPeriodEnd: string;
  netAssetsUsd: number;
  positions: number;
  /** Not 100. Never normalise it. */
  weightSumPct: number;
  top10Pct: number;
  missingLeiPositions: number;
  missingLeiPct: number;
  topPositions: Position[];
  topIssuers: IssuerRow[];
  shownCoveragePct: number;
};

export type Passport = {
  ticker: string;
  sleeve: Sleeve;
  registrant: string;
  cik: string;
  legalSeriesName: string;
  seriesId: string;
  classId: string;
  className: string;
  structure: string;
  listing: string;
  objective: string;
  targetIndex: string;
  replication: "full" | "sampled";
  /** The exact sentence a learner is asked to find in Beat 3. */
  replicationSentence: string;
  feeTable: { label: string; value: string }[];
  totalExpensePct: number;
  /** SEC cost example on $10,000 at an assumed 5% return: 1, 3, 5, 10 years. */
  costPer10kUsd: [number, number, number, number];
  turnoverPct: number;
  /**
   * False where the filed turnover figure does not describe trading activity.
   * Form N-1A Item 3(d)(ii) excludes securities maturing within a year of
   * acquisition from both sides of the ratio.
   */
  turnoverComparable: boolean;
  turnoverNote: string | null;
  principalRiskCount: number;
  riskHighlights: string[];
  benchmarkName: string;
  /** Periods ended 2025-12-31. Fund NAV return against its own stated index. */
  returns: { period: string; fundPct: number; benchmarkPct: number }[];
  lendingPermitted: string | null;
  lendingObservedPositions: number;
  leverageDescribed: false;
  spreadDisclosure: "qualitative-only";
  /**
   * What moved since the prior year, compared filing to filing. Never null:
   * "nothing substantive changed" is a finding a learner should be able to read,
   * not an absent field.
   */
  materialChanges: string;
  prospectus: {
    form: string;
    accession: string;
    document: string;
    filed: string;
    dated: string;
  };
  holdings: HoldingsRecord;
};

/** Every share class of one series. Six tickers, one portfolio. */
export type ShareClass = {
  classId: string;
  className: string;
  ticker: string;
  totalExpensePct: number | null;
  minimumUsd: number | null;
};

export const RETRIEVED_AT = "2026-08-16";

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const VTI: Passport = {
  ticker: "VTI",
  sleeve: "growth",
  registrant: "Vanguard Index Funds",
  cik: "0000036405",
  legalSeriesName: "Vanguard Total Stock Market Index Fund",
  seriesId: "S000002848",
  classId: "C000007808",
  className: "ETF Shares",
  structure:
    "Exchange-traded share class of an open-end index fund. Not individually redeemable.",
  listing: "NYSE Arca",
  objective:
    "Seeks to track the performance of a benchmark index that measures the investment return of the overall stock market.",
  targetIndex: "CRSP US Total Market Index",
  replication: "sampled",
  replicationSentence:
    "The Fund invests by sampling the Target Index, meaning that it holds a range of securities that, in the aggregate, approximates the full Target Index in terms of key risk factors and other characteristics.",
  feeTable: [
    { label: "Management fees", value: "0.03%" },
    { label: "12b-1 distribution fee", value: "None" },
    { label: "Other expenses", value: "0.00%" },
    { label: "Total annual fund operating expenses", value: "0.03%" },
  ],
  totalExpensePct: 0.03,
  costPer10kUsd: [3, 10, 17, 39],
  turnoverPct: 3,
  turnoverComparable: true,
  turnoverNote: null,
  principalRiskCount: 9,
  riskHighlights: [
    "Index investing, including tracking error from holding a sample rather than the whole index",
    "ETF share trading — market price may differ significantly from net asset value",
    "Authorized participants",
    "Information technology sector concentration",
  ],
  benchmarkName: "CRSP US Total Market Index",
  returns: [
    { period: "1 year", fundPct: 17.14, benchmarkPct: 17.15 },
    { period: "5 years", fundPct: 13.08, benchmarkPct: 13.08 },
    { period: "10 years", fundPct: 14.25, benchmarkPct: 14.25 },
  ],
  lendingPermitted: null,
  lendingObservedPositions: 0,
  leverageDescribed: false,
  spreadDisclosure: "qualitative-only",
  materialChanges:
    "Against the 2025-04-29 filing (0001683863-25-004087): the management fee rose from 0.02% to 0.03% and other expenses fell from 0.01% to 0.00%, leaving the total unchanged at 0.03%. Turnover rose from 2% to 3%. Index, replication and cost example are unchanged.",
  prospectus: {
    form: "497K",
    accession: "0000036405-26-000197",
    document: "f44849d1.htm",
    filed: "2026-04-28",
    dated: "2026-04-28",
  },
  holdings: {
    accession: "0000036405-26-000323",
    filed: "2026-05-28",
    asOf: "2026-03-31",
    fiscalPeriodEnd: "2026-12-31",
    netAssetsUsd: 1_991_691_212_321.29,
    positions: 3524,
    weightSumPct: 100.2463,
    top10Pct: 32.1039,
    missingLeiPositions: 1031,
    missingLeiPct: 3.3436,
    shownCoveragePct: 29.069,
    topPositions: [
      { name: "NVIDIA Corp", cusip: "67066G104", lei: "549300S4KLFTLO7GSQ80", weightPct: 6.4191 },
      { name: "Apple Inc", cusip: "037833100", lei: "HWUPKR0MPOU8FGXBT394", weightPct: 5.9407 },
      { name: "Microsoft Corp", cusip: "594918104", lei: "INR2EJN1ERAN0W5ZP974", weightPct: 4.3826 },
      { name: "Amazon.com Inc", cusip: "023135106", lei: "ZXTILKJKG63JELOEG630", weightPct: 3.2083 },
      { name: "Alphabet Inc", cusip: "02079K305", lei: "5493006MHB84DD0ZWV18", weightPct: 2.6694 },
      { name: "Broadcom Inc", cusip: "11135F101", lei: "549300WV6GIDOZJTV909", weightPct: 2.3398 },
      { name: "Alphabet Inc", cusip: "02079K107", lei: "5493006MHB84DD0ZWV18", weightPct: 2.1139 },
      { name: "Meta Platforms Inc", cusip: "30303M102", lei: "BQ4BKCS1HXDV9HN80Z93", weightPct: 1.9952 },
    ],
    topIssuers: [
      { name: "NVIDIA Corp", lei: "549300S4KLFTLO7GSQ80", weightPct: 6.4191, positions: 1 },
      { name: "Apple Inc", lei: "HWUPKR0MPOU8FGXBT394", weightPct: 5.9407, positions: 1 },
      { name: "Alphabet Inc", lei: "5493006MHB84DD0ZWV18", weightPct: 4.7834, positions: 2 },
      { name: "Microsoft Corp", lei: "INR2EJN1ERAN0W5ZP974", weightPct: 4.3826, positions: 1 },
      { name: "Amazon.com Inc", lei: "ZXTILKJKG63JELOEG630", weightPct: 3.2083, positions: 1 },
      { name: "Broadcom Inc", lei: "549300WV6GIDOZJTV909", weightPct: 2.3398, positions: 1 },
    ],
  },
};

const VOO: Passport = {
  ticker: "VOO",
  sleeve: "growth",
  registrant: "Vanguard Index Funds",
  cik: "0000036405",
  legalSeriesName: "Vanguard 500 Index Fund",
  seriesId: "S000002839",
  classId: "C000092055",
  className: "ETF Shares",
  structure:
    "Exchange-traded share class of an open-end index fund. Not individually redeemable.",
  listing: "NYSE Arca",
  objective:
    "Seeks to track the performance of a benchmark index that measures the investment return of large-capitalization stocks.",
  targetIndex: "S&P 500 Index",
  replication: "full",
  replicationSentence:
    "The Fund attempts to replicate the Target Index by investing all, or substantially all, of its assets in the stocks that make up the Target Index, holding each stock in approximately the same proportion as its weighting in the Target Index.",
  feeTable: [
    { label: "Management fees", value: "0.02%" },
    { label: "12b-1 distribution fee", value: "None" },
    { label: "Other expenses", value: "0.01%" },
    { label: "Total annual fund operating expenses", value: "0.03%" },
  ],
  totalExpensePct: 0.03,
  costPer10kUsd: [3, 10, 17, 39],
  turnoverPct: 2,
  turnoverComparable: true,
  turnoverNote: null,
  principalRiskCount: 9,
  riskHighlights: [
    "Index investing — the Fund seeks to hold substantially all index securities but may be unable to",
    "ETF share trading — market price may differ significantly from net asset value",
    "Authorized participants",
    "Information technology sector concentration",
  ],
  benchmarkName: "S&P 500 Index",
  returns: [
    { period: "1 year", fundPct: 17.84, benchmarkPct: 17.88 },
    { period: "5 years", fundPct: 14.38, benchmarkPct: 14.42 },
    { period: "10 years", fundPct: 14.78, benchmarkPct: 14.82 },
  ],
  lendingPermitted: null,
  lendingObservedPositions: 0,
  leverageDescribed: false,
  spreadDisclosure: "qualitative-only",
  materialChanges:
    "Against the 2025-04-29 filing (0001683863-25-004106): nothing substantive changed. Fees, turnover, index and replication are identical. The filing renamed its defined term for the benchmark from the Index to the Target Index — a wording change, not a change of index.",
  prospectus: {
    form: "497K",
    accession: "0000036405-26-000183",
    document: "f44783d1.htm",
    filed: "2026-04-28",
    dated: "2026-04-28",
  },
  holdings: {
    accession: "0000036405-26-000325",
    filed: "2026-05-28",
    asOf: "2026-03-31",
    fiscalPeriodEnd: "2026-12-31",
    netAssetsUsd: 1_421_263_311_402.89,
    positions: 519,
    weightSumPct: 100.1362,
    top10Pct: 36.4861,
    missingLeiPositions: 29,
    missingLeiPct: 1.6035,
    shownCoveragePct: 33.0457,
    topPositions: [
      { name: "NVIDIA Corp", cusip: "67066G104", lei: "549300S4KLFTLO7GSQ80", weightPct: 7.5775 },
      { name: "Apple Inc", cusip: "037833100", lei: "HWUPKR0MPOU8FGXBT394", weightPct: 6.6619 },
      { name: "Microsoft Corp", cusip: "594918104", lei: "INR2EJN1ERAN0W5ZP974", weightPct: 4.9148 },
      { name: "Amazon.com Inc", cusip: "023135106", lei: "ZXTILKJKG63JELOEG630", weightPct: 3.6379 },
      { name: "Alphabet Inc", cusip: "02079K305", lei: "5493006MHB84DD0ZWV18", weightPct: 2.9934 },
      { name: "Broadcom Inc", cusip: "11135F101", lei: "549300WV6GIDOZJTV909", weightPct: 2.6239 },
      { name: "Alphabet Inc", cusip: "02079K107", lei: "5493006MHB84DD0ZWV18", weightPct: 2.3987 },
      { name: "Meta Platforms Inc", cusip: "30303M102", lei: "BQ4BKCS1HXDV9HN80Z93", weightPct: 2.2376 },
    ],
    topIssuers: [
      { name: "NVIDIA Corp", lei: "549300S4KLFTLO7GSQ80", weightPct: 7.5775, positions: 1 },
      { name: "Apple Inc", lei: "HWUPKR0MPOU8FGXBT394", weightPct: 6.6619, positions: 1 },
      { name: "Alphabet Inc", lei: "5493006MHB84DD0ZWV18", weightPct: 5.3921, positions: 2 },
      { name: "Microsoft Corp", lei: "INR2EJN1ERAN0W5ZP974", weightPct: 4.9148, positions: 1 },
      { name: "Amazon.com Inc", lei: "ZXTILKJKG63JELOEG630", weightPct: 3.6379, positions: 1 },
      { name: "Broadcom Inc", lei: "549300WV6GIDOZJTV909", weightPct: 2.6239, positions: 1 },
    ],
  },
};

const AGG: Passport = {
  ticker: "AGG",
  sleeve: "stability",
  registrant: "iShares Trust",
  cik: "0001100663",
  legalSeriesName: "iShares Core U.S. Aggregate Bond ETF",
  seriesId: "S000004362",
  classId: "C000012092",
  className: "(single class)",
  structure: "Exchange-traded fund. One share class.",
  listing: "NYSE Arca",
  objective:
    "Seeks to track the investment results of an index composed of the total U.S. investment-grade bond market.",
  targetIndex: "Bloomberg U.S. Aggregate Bond Index (13,972 issues as of 2026-02-28)",
  replication: "sampled",
  replicationSentence:
    "BFA uses a representative sampling indexing strategy to manage the Fund… The Fund may or may not hold all of the components of the Underlying Index.",
  feeTable: [
    { label: "Management fee", value: "0.03%" },
    { label: "Other expenses", value: "0.00%" },
    { label: "Acquired fund fees and expenses", value: "0.00%" },
    { label: "Total annual fund operating expenses", value: "0.03%" },
  ],
  totalExpensePct: 0.03,
  costPer10kUsd: [3, 10, 17, 39],
  turnoverPct: 62,
  turnoverComparable: true,
  turnoverNote: null,
  principalRiskCount: 24,
  riskHighlights: [
    "Credit risk",
    "Interest rate risk",
    "Call, extension and prepayment risk",
    "U.S. agency mortgage-backed securities risk",
    "Securities lending risk",
    "Tracking error risk",
  ],
  benchmarkName: "Bloomberg U.S. Aggregate Bond Index",
  returns: [
    { period: "1 year", fundPct: 7.19, benchmarkPct: 7.3 },
    { period: "5 years", fundPct: -0.38, benchmarkPct: -0.36 },
    { period: "10 years", fundPct: 1.97, benchmarkPct: 2.01 },
  ],
  lendingPermitted: "Up to one-third of total assets",
  lendingObservedPositions: 0,
  leverageDescribed: false,
  spreadDisclosure: "qualitative-only",
  materialChanges:
    "Against the 2025-06-27 filing (0001193125-25-151199): turnover fell from 81% to 62%, and the contractual acquired-fund-fee waiver was extended from 2026-06-30 to 2027-06-30. The fee table, index, replication and lending permission are unchanged.",
  prospectus: {
    form: "497K",
    accession: "0001193125-26-287958",
    document: "d128878d497k.htm",
    filed: "2026-06-29",
    dated: "2026-06-29",
  },
  holdings: {
    accession: "0001410368-26-075254",
    filed: "2026-07-24",
    asOf: "2026-05-31",
    fiscalPeriodEnd: "2027-02-28",
    netAssetsUsd: 136_455_697_043.74,
    positions: 13269,
    weightSumPct: 101.8813,
    top10Pct: 6.6116,
    missingLeiPositions: 686,
    missingLeiPct: 5.6648,
    shownCoveragePct: 4.6399,
    topPositions: [
      { name: "BLACKROCK CASH FUNDS", cusip: "066922477", lei: null, weightPct: 2.7786 },
      { name: "BlackRock Funds III", cusip: "066922477", lei: "5493008LW2651I1QB503", weightPct: 0.6195 },
      { name: "United States Treasury", cusip: "91282CMM0", lei: "254900HROIFWPRGM1V77", weightPct: 0.42 },
      { name: "United States Treasury", cusip: "91282CLW9", lei: "254900HROIFWPRGM1V77", weightPct: 0.4131 },
      { name: "United States Treasury", cusip: "91282CGQ8", lei: "254900HROIFWPRGM1V77", weightPct: 0.4087 },
    ],
    topIssuers: [
      { name: "United States Treasury", lei: "254900HROIFWPRGM1V77", weightPct: 45.7192, positions: 295 },
      { name: "Fannie Mae", lei: "B1V7KEBTPIMZEU4LTD58", weightPct: 10.2547, positions: 1461 },
      { name: "Freddie Mac", lei: "S6XOOCT0IEG5ABCC6L87", weightPct: 7.0076, positions: 992 },
      { name: "Government National Mortgage Association", lei: "549300M8ZYFG0OCMTT87", weightPct: 5.5713, positions: 523 },
      { name: "BLACKROCK CASH FUNDS", lei: null, weightPct: 2.7786, positions: 1 },
      { name: "JPMorgan Chase & Co", lei: "8I5DZWZKVSZI1NUHU748", weightPct: 0.5868, positions: 71 },
      { name: "Bank of America Corp", lei: "9DJT3UXIJIZJI4WXO774", weightPct: 0.548, positions: 60 },
    ],
  },
};

const SGOV: Passport = {
  ticker: "SGOV",
  sleeve: "liquidity",
  registrant: "iShares Trust",
  cik: "0001100663",
  legalSeriesName: "iShares 0-3 Month Treasury Bond ETF",
  seriesId: "S000068768",
  classId: "C000219740",
  className: "(single class)",
  structure: "Exchange-traded fund. One share class.",
  listing: "NYSE",
  objective:
    "Seeks to track the investment results of an index composed of U.S. Treasury bonds with remaining maturities of less than or equal to three months.",
  targetIndex: "ICE 0-3 Month US Treasury Securities Index (39 issues as of 2026-02-28)",
  replication: "sampled",
  replicationSentence:
    "BFA uses a representative sampling indexing strategy to manage the Fund… The Fund may or may not hold all of the components of the Underlying Index.",
  feeTable: [
    { label: "Management fee", value: "0.09%" },
    { label: "Other expenses", value: "0.00%" },
    { label: "Total annual fund operating expenses", value: "0.09%" },
  ],
  totalExpensePct: 0.09,
  costPer10kUsd: [9, 29, 51, 115],
  turnoverPct: 0,
  turnoverComparable: false,
  turnoverNote:
    "Form N-1A Item 3(d)(ii) excludes securities whose maturities at the time of acquisition were one year or less from both the numerator and the denominator. Every holding in this fund is excluded, so the rate is 0% by construction. It does not describe how much this fund trades.",
  principalRiskCount: 15,
  riskHighlights: [
    "U.S. Treasury obligations risk",
    "Interest rate risk",
    "Income risk",
    "Securities lending risk",
    "Tracking error risk",
    "No credit, call, extension or prepayment risk is disclosed",
  ],
  benchmarkName: "ICE 0-3 Month US Treasury Securities Index (Spliced)",
  returns: [
    { period: "1 year", fundPct: 4.24, benchmarkPct: 3.41 },
    { period: "5 years", fundPct: 3.23, benchmarkPct: 2.54 },
    { period: "Since inception (2020-05-26)", fundPct: 2.89, benchmarkPct: 2.27 },
  ],
  lendingPermitted: "Up to one-third of total assets",
  lendingObservedPositions: 0,
  leverageDescribed: false,
  spreadDisclosure: "qualitative-only",
  materialChanges:
    "Prior to 2025-10-31 the Underlying Index's cash from coupon payments and maturing securities earned no reinvestment income.",
  prospectus: {
    form: "497K",
    accession: "0001193125-26-287938",
    document: "d126195d497k.htm",
    filed: "2026-06-29",
    dated: "2026-06-29",
  },
  holdings: {
    accession: "0002071691-26-016719",
    filed: "2026-07-24",
    asOf: "2026-05-31",
    fiscalPeriodEnd: "2027-02-28",
    netAssetsUsd: 91_903_313_184.45,
    positions: 24,
    weightSumPct: 108.8162,
    top10Pct: 72.3597,
    missingLeiPositions: 0,
    missingLeiPct: 0,
    shownCoveragePct: 36.1238,
    topPositions: [
      { name: "United States of America", cusip: "912797UC9", lei: "254900HROIFWPRGM1V77", weightPct: 10.1358 },
      { name: "United States of America", cusip: "912797TU1", lei: "254900HROIFWPRGM1V77", weightPct: 8.6419 },
      { name: "United States of America", cusip: "912797UB1", lei: "254900HROIFWPRGM1V77", weightPct: 8.5356 },
      { name: "United States of America", cusip: "912797UR6", lei: "254900HROIFWPRGM1V77", weightPct: 8.3302 },
      { name: "BlackRock Funds III", cusip: "066922477", lei: "5493005PQV5UQG4OSI49", weightPct: 0.4803 },
    ],
    topIssuers: [
      { name: "United States of America", lei: "254900HROIFWPRGM1V77", weightPct: 107.8756, positions: 22 },
      { name: "BlackRock Funds III", lei: "5493005PQV5UQG4OSI49", weightPct: 0.9406, positions: 2 },
    ],
  },
};

export const PRODUCTS: Record<string, Passport> = { VTI, VOO, AGG, SGOV };

export const PRODUCT_TICKERS = ["VTI", "VOO", "AGG", "SGOV"] as const;

/**
 * The trap, and it is not a trick: VTI and VTSAX are the same series. Read from
 * the SGML header of 485BPOS `0000036405-26-000181`.
 */
export const VTI_SHARE_CLASSES: ShareClass[] = [
  { classId: "C000007805", className: "Investor Shares", ticker: "VTSMX", totalExpensePct: null, minimumUsd: 3000 },
  { classId: "C000007806", className: "Admiral Shares", ticker: "VTSAX", totalExpensePct: 0.04, minimumUsd: 3000 },
  { classId: "C000007807", className: "Institutional Shares", ticker: "VITSX", totalExpensePct: null, minimumUsd: 5_000_000 },
  { classId: "C000007808", className: "ETF Shares", ticker: "VTI", totalExpensePct: 0.03, minimumUsd: null },
  { classId: "C000155407", className: "Institutional Plus Shares", ticker: "VSMPX", totalExpensePct: null, minimumUsd: 100_000_000 },
  { classId: "C000170276", className: "Institutional Select Shares", ticker: "VSTSX", totalExpensePct: null, minimumUsd: 3_000_000_000 },
];

/**
 * Computed at Gate A from the complete filings — not from the bounded subsets
 * above. Both keys are reported because the key changes the answer, and that
 * is the finding rather than a caveat.
 */
export const RECORDED_OVERLAP = [
  {
    inner: "VOO",
    outer: "VTI",
    byInstrumentPct: 99.88,
    byIssuerPct: 100.01,
    issuerCount: 501,
    datesAligned: true,
    note: "Two funds, two prospectuses, essentially one portfolio.",
  },
  {
    inner: "SGOV",
    outer: "AGG",
    byInstrumentPct: 0.94,
    byIssuerPct: 107.88,
    issuerCount: 1,
    datesAligned: true,
    note: "By instrument this is an affiliated cash fund. By issuer it is the U.S. Treasury, and it is nearly total.",
  },
  {
    inner: "AGG",
    outer: "VTI",
    byInstrumentPct: 0,
    byIssuerPct: 14.94,
    issuerCount: 469,
    datesAligned: false,
    note: "Your stability sleeve lends money to the same companies your growth sleeve owns.",
  },
] as const;

/**
 * One CUSIP, three names, two different LEIs, one row with no LEI — across two
 * funds from the same sponsor filed the same day. Neither key is universally
 * correct, and the lesson says so rather than implying the X-Ray is exact.
 */
export const IDENTITY_CONFLICTS = [
  { fund: "SGOV", name: "BlackRock Funds III", cusip: "066922477", lei: "5493005PQV5UQG4OSI49" },
  { fund: "AGG", name: "BlackRock Funds III", cusip: "066922477", lei: "5493008LW2651I1QB503" },
  { fund: "AGG", name: "BLACKROCK CASH FUNDS", cusip: "066922477", lei: null },
] as const;

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

/**
 * The key an exposure is aggregated under. LEI where the filing supplies one,
 * CUSIP otherwise — and a caller can always tell which happened, because an
 * uncovered position is counted rather than dropped.
 */
export function exposureKey(position: Position, mode: IssuerKeyMode): string {
  if (mode === "instrument") return `cusip:${position.cusip}`;
  return position.lei ? `lei:${position.lei}` : `cusip:${position.cusip}`;
}

export type AggregatedExposure = {
  key: string;
  name: string;
  lei: string | null;
  weightPct: number;
  positions: number;
  /** True where no LEI was filed and the key fell back to CUSIP. */
  uncovered: boolean;
};

export function aggregate(
  positions: readonly Position[],
  mode: IssuerKeyMode,
): AggregatedExposure[] {
  const out = new Map<string, AggregatedExposure>();
  for (const p of positions) {
    const key = exposureKey(p, mode);
    const existing = out.get(key);
    if (existing) {
      existing.weightPct = round4(existing.weightPct + p.weightPct);
      existing.positions += 1;
    } else {
      out.set(key, {
        key,
        name: p.name,
        lei: p.lei,
        weightPct: round4(p.weightPct),
        positions: 1,
        uncovered: mode === "issuer" && !p.lei,
      });
    }
  }
  return [...out.values()].sort((a, b) => b.weightPct - a.weightPct);
}

// ---------------------------------------------------------------------------
// Overlap
// ---------------------------------------------------------------------------

export type OverlapResult = {
  /** Share of `inner`'s reported weight also found in `outer`. */
  sharedPct: number;
  sharedKeys: number;
  /** Share of `inner` that could not be keyed on an LEI. */
  uncoveredPct: number;
  datesAligned: boolean;
  innerAsOf: string;
  outerAsOf: string;
};

/**
 * Computed on whatever positions the caller supplies. The lesson uses this for
 * the learner's own blend over the shipped subset, and states the coverage; the
 * headline figures come from `RECORDED_OVERLAP`.
 */
export function overlapBetween(
  inner: { positions: readonly Position[]; asOf: string },
  outer: { positions: readonly Position[]; asOf: string },
  mode: IssuerKeyMode,
): OverlapResult {
  const outerKeys = new Set(aggregate(outer.positions, mode).map((e) => e.key));
  let sharedPct = 0;
  let sharedKeys = 0;
  let uncoveredPct = 0;
  for (const entry of aggregate(inner.positions, mode)) {
    if (entry.uncovered) uncoveredPct = round4(uncoveredPct + entry.weightPct);
    if (outerKeys.has(entry.key)) {
      sharedPct = round4(sharedPct + entry.weightPct);
      sharedKeys += 1;
    }
  }
  return {
    sharedPct,
    sharedKeys,
    uncoveredPct,
    datesAligned: inner.asOf === outer.asOf,
    innerAsOf: inner.asOf,
    outerAsOf: outer.asOf,
  };
}

/**
 * Look-through for a saved slate:
 *   issuer exposure = Σ(fund weight × issuer weight inside fund)
 *
 * Fund weights are the learner's slate weights in percent. Nothing is
 * normalised: `coveragePct` reports what share of each fund the shipped subset
 * actually represents, so the caller can say so on screen.
 */
export type SlateEntry = { ticker: string; weightPct: number };

export type LookThroughRow = {
  key: string;
  name: string;
  lei: string | null;
  totalPct: number;
  viaFund: { ticker: string; pct: number }[];
  uncovered: boolean;
};

export function lookThrough(
  slate: readonly SlateEntry[],
  mode: IssuerKeyMode,
): { rows: LookThroughRow[]; coveragePct: number; asOfDates: string[] } {
  const rows = new Map<string, LookThroughRow>();
  let weighted = 0;
  let totalWeight = 0;
  const asOf = new Set<string>();

  for (const entry of slate) {
    const product = PRODUCTS[entry.ticker];
    if (!product || entry.weightPct <= 0) continue;
    asOf.add(product.holdings.asOf);
    totalWeight += entry.weightPct;
    weighted += entry.weightPct * (product.holdings.shownCoveragePct / 100);

    for (const pos of aggregate(product.holdings.topPositions, mode)) {
      const contribution = round4((entry.weightPct * pos.weightPct) / 100);
      const existing = rows.get(pos.key);
      if (existing) {
        existing.totalPct = round4(existing.totalPct + contribution);
        existing.viaFund.push({ ticker: entry.ticker, pct: contribution });
      } else {
        rows.set(pos.key, {
          key: pos.key,
          name: pos.name,
          lei: pos.lei,
          totalPct: contribution,
          viaFund: [{ ticker: entry.ticker, pct: contribution }],
          uncovered: pos.uncovered,
        });
      }
    }
  }

  return {
    rows: [...rows.values()].sort((a, b) => b.totalPct - a.totalPct),
    coveragePct: totalWeight > 0 ? round4(weighted / totalWeight * 100) : 0,
    asOfDates: [...asOf].sort(),
  };
}

// ---------------------------------------------------------------------------
// Staleness
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

/** Whole days between a holdings as-of date and a reference date. */
export function stalenessDays(asOf: string, reference: string): number {
  const a = Date.parse(`${asOf}T00:00:00Z`);
  const b = Date.parse(`${reference}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / DAY_MS));
}

function round4(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}
