/**
 * Reading a company's numbers out of SEC XBRL without silently getting the
 * wrong ones.
 *
 * A metric like "revenue" does not correspond to one XBRL concept. It
 * corresponds to different concepts for different kinds of company, and to
 * different concepts for the *same* company at different times, because filers
 * migrate their tagging. Both facts were measured across twelve companies
 * spanning banking, insurance, real estate, utilities, transport, energy,
 * software, semiconductors, retail, pharma, telecom and industrials.
 *
 * Four ways a naive lookup returns a wrong number while looking successful:
 *
 * 1. **Wrong concept for the sector.** Asking Fifth Third for contract revenue
 *    returns $577M — a fee subset — when the bank's net interest income is
 *    $5,982M and its noninterest income $3,035M. Wrong by about fifteen times.
 *    The field is populated, so nothing complains.
 * 2. **A concept the company abandoned years ago.** This is the big one, and it
 *    is not a sector problem: of 113 resolutions across the twelve companies,
 *    **11 returned data staler than the company's own latest annual period**.
 *    NVIDIA's `PaymentsToAcquirePropertyPlantAndEquipment` last appears in 2012
 *    and it now uses `PaymentsToAcquireProductiveAssets`. Microsoft dropped
 *    `CostOfRevenue` after 2017. Costco stopped tagging `GrossProfit` after
 *    2019. Every one of those still resolves, and every one is populated.
 * 3. **A concept that does not apply at all.** Gross profit is not a small-data
 *    problem for a bank, a REIT or a railroad; it is undefined. Six of the
 *    twelve report neither gross profit nor any cost of revenue.
 * 4. **A concept whose name resembles the answer.** NextEra tags
 *    `CapitalExpendituresIncurredButNotYetPaid` at $7.64B. That is an accrual
 *    disclosure, not cash capital spending, and taking it as capex would be
 *    wrong in a way no unit check would catch.
 *
 * So resolution here is always **for a stated period**. A concept qualifies only
 * if it carries a value covering that period; preference order then decides
 * among the ones that qualify. A stale value is never returned, and "we cannot
 * compute this" is a first-class result carrying its reason.
 */

/**
 * Accounting shape, which is what actually decides how a company's statements
 * are put together. Derived from SIC, which SEC assigns.
 */
export type Sector = "banking" | "insurance" | "real-estate" | "utility" | "transport" | "extractive" | "general";

/**
 * SIC ranges to accounting shape.
 *
 * Deliberately coarse. Telecom sits in the 4800s next to transport in the 4000s
 * but files like an ordinary goods-and-services company — Verizon reports a cost
 * of revenue and Union Pacific does not — so the boundary is drawn between them
 * rather than across the whole division.
 */
export function sectorFromSic(sic: string | number): Sector {
  const code = Number(sic);
  if (!Number.isFinite(code)) return "general";
  if (code >= 6000 && code <= 6199) return "banking";
  if (code >= 6300 && code <= 6411) return "insurance";
  if (code >= 6500 && code <= 6799) return "real-estate";
  if (code >= 4900 && code <= 4999) return "utility";
  if (code >= 4000 && code <= 4799) return "transport";
  if (code === 2911 || (code >= 1200 && code <= 1399)) return "extractive";
  return "general";
}

/** How to name a sector in a sentence a learner reads. */
export const SECTOR_LABEL: Record<Sector, string> = {
  banking: "a bank",
  insurance: "an insurer",
  "real-estate": "a property company",
  utility: "a utility",
  transport: "a transport company",
  extractive: "a resources company",
  general: "this company",
};

export type PrimitiveName =
  | "revenue"
  | "costOfRevenue"
  | "grossProfit"
  | "operatingIncome"
  | "netIncome"
  | "cashFromOperations"
  | "capitalExpenditure"
  | "assets"
  | "equity"
  | "cash"
  | "taxExpense"
  | "pretaxIncome"
  | "netInterestIncome"
  | "noninterestIncome";

interface ConceptPreference {
  /** Tried in order, for any sector without its own list. */
  default: string[];
  /** Sectors whose statements mean something different. */
  bySector?: Partial<Record<Sector, string[]>>;
  /** Recorded so the audit can show what was considered and rejected. */
  note?: string;
}

/**
 * What each primitive may be read from, in preference order.
 *
 * Every entry was checked against real filings. The bank and insurance lists
 * exist because the general list returns the wrong quantity for them, not
 * because it returns nothing.
 */
export const PRIMITIVE_CONCEPTS: Record<PrimitiveName, ConceptPreference> = {
  revenue: {
    default: [
      "RevenueFromContractWithCustomerExcludingAssessedTax",
      "RevenueFromContractWithCustomerIncludingAssessedTax",
      "Revenues",
      "SalesRevenueNet",
      "SalesRevenueGoodsNet",
    ],
    bySector: {
      // A bank's revenue analogue is net interest income plus fee income, and it
      // is assembled in totalRevenue() rather than read from one concept. The
      // contract-revenue concepts are deliberately absent from this list: they
      // resolve for Fifth Third and give a fifteenth of the right answer.
      banking: ["RevenuesNetOfInterestExpense", "Revenues"],
      insurance: ["Revenues", "PremiumsEarnedNet"],
      "real-estate": ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax"],
    },
    note: "Contract-revenue concepts are excluded for banks; they resolve but mean fee income only.",
  },
  costOfRevenue: {
    default: ["CostOfGoodsAndServicesSold", "CostOfRevenue", "CostOfGoodsSold", "CostOfServices"],
    note: "CostOfGoodsAndServicesSold is first because CostOfRevenue is the older tag; Microsoft's stops at 2017. CostsAndExpenses is deliberately absent: Verizon, Exxon and Union Pacific all report it for the current year and it is total operating expense including SG&A and depreciation, so subtracting it from revenue yields operating income wearing the name of gross profit.",
  },
  grossProfit: {
    default: ["GrossProfit"],
    note: "Often absent even where it is meaningful — Costco stopped tagging it after 2019 — so it is normally derived.",
  },
  operatingIncome: { default: ["OperatingIncomeLoss"] },
  netIncome: { default: ["NetIncomeLoss", "ProfitLoss"] },
  cashFromOperations: {
    default: [
      "NetCashProvidedByUsedInOperatingActivities",
      "NetCashProvidedByUsedInOperatingActivitiesContinuingOperations",
    ],
  },
  capitalExpenditure: {
    default: [
      "PaymentsToAcquirePropertyPlantAndEquipment",
      "PaymentsToAcquireProductiveAssets",
      "PaymentsForCapitalImprovements",
    ],
    note: "Two near-misses are deliberately absent. CapitalExpendituresIncurredButNotYetPaid is what NextEra tags, at $7.64B, and it is an accrual disclosure rather than cash spending. PaymentsToAcquireRealEstate is what Prologis tags, at $1.80B, and it is buying new buildings rather than maintaining the ones it owns.",
  },
  assets: { default: ["Assets"] },
  equity: {
    default: ["StockholdersEquity", "StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest"],
  },
  cash: {
    default: [
      "CashAndCashEquivalentsAtCarryingValue",
      "CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalents",
    ],
  },
  taxExpense: { default: ["IncomeTaxExpenseBenefit"] },
  pretaxIncome: {
    default: [
      "IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest",
      "IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments",
    ],
  },
  netInterestIncome: {
    default: [],
    bySector: { banking: ["InterestIncomeExpenseNet", "InterestIncomeExpenseAfterProvisionForLoanLoss"] },
    note: "Restricted to banks on purpose. Pfizer reports InterestIncomeExpenseNet, last in 2013, and it means nothing there.",
  },
  noninterestIncome: {
    default: [],
    bySector: { banking: ["NoninterestIncome"] },
  },
};

// ---------------------------------------------------------------- fact access

/** The shape of one observation in SEC's companyfacts payload. */
export interface XbrlFact {
  start?: string;
  end: string;
  val: number;
  fy?: number;
  fp?: string;
  form: string;
  filed: string;
  accn: string;
}

export interface CompanyFacts {
  cik: number | string;
  entityName: string;
  facts: Record<string, Record<string, { units: Record<string, XbrlFact[]> }>>;
}

export interface ResolvedFigure {
  primitive: PrimitiveName;
  concept: string;
  value: number;
  periodStart: string | null;
  periodEnd: string;
  /** The filing the number came from, so any figure can be traced. */
  accession: string;
  form: string;
  filed: string;
}

export type UnresolvedReason =
  | "not reported"
  | "no concept covers this period"
  | "not applicable to this kind of company";

export interface UnresolvedFigure {
  primitive: PrimitiveName;
  reason: UnresolvedReason;
  /** What was considered, so the audit shows the search rather than asserting it. */
  tried: string[];
  /** For a stale concept, the newest period it does cover. */
  staleAt?: string;
}

export type FigureOutcome = ResolvedFigure | UnresolvedFigure;
export const isResolved = (outcome: FigureOutcome): outcome is ResolvedFigure => "value" in outcome;

/** An annual duration, allowing for 52/53-week fiscal years. */
const isAnnualSpan = (fact: XbrlFact): boolean =>
  !fact.start || Date.parse(fact.end) - Date.parse(fact.start) > 300 * 86_400_000;

const conceptsFor = (primitive: PrimitiveName, sector: Sector): string[] => {
  const preference = PRIMITIVE_CONCEPTS[primitive];
  return preference.bySector?.[sector] ?? preference.default;
};

/**
 * The value of one concept for one period end, if it has one.
 *
 * Where a period has been restated, the most recently filed version wins: that
 * is the company's current view of its own history.
 */
function factAt(facts: CompanyFacts, concept: string, periodEnd: string): XbrlFact | null {
  const node = facts.facts["us-gaap"]?.[concept];
  if (!node) return null;
  const rows: XbrlFact[] = [];
  for (const series of Object.values(node.units)) {
    for (const fact of series) {
      if (fact.form === "10-K" && fact.end === periodEnd && isAnnualSpan(fact)) rows.push(fact);
    }
  }
  if (!rows.length) return null;
  return rows.reduce((best, next) => (next.filed > best.filed ? next : best));
}

/** The newest annual period a concept covers, for reporting staleness. */
function newestPeriod(facts: CompanyFacts, concept: string): string | null {
  const node = facts.facts["us-gaap"]?.[concept];
  if (!node) return null;
  let newest: string | null = null;
  for (const series of Object.values(node.units)) {
    for (const fact of series) {
      if (fact.form === "10-K" && isAnnualSpan(fact) && (!newest || fact.end > newest)) newest = fact.end;
    }
  }
  return newest;
}

/**
 * Resolve one primitive for one period.
 *
 * The period is required and is not negotiable. A concept that does not cover it
 * is passed over even when it is the preferred one and even when it holds a
 * perfectly good number for some other year — that is exactly how NVIDIA's 2012
 * capital spending would otherwise end up beside its 2026 revenue.
 */
export function resolvePrimitive(
  facts: CompanyFacts,
  primitive: PrimitiveName,
  sector: Sector,
  periodEnd: string,
): FigureOutcome {
  const candidates = conceptsFor(primitive, sector);
  if (!candidates.length) {
    return { primitive, reason: "not applicable to this kind of company", tried: [] };
  }

  for (const concept of candidates) {
    const fact = factAt(facts, concept, periodEnd);
    if (!fact) continue;
    return {
      primitive,
      concept,
      value: fact.val,
      periodStart: fact.start ?? null,
      periodEnd: fact.end,
      accession: fact.accn,
      form: fact.form,
      filed: fact.filed,
    };
  }

  // Nothing covered the period. Say whether the company never reports this, or
  // reports it but stopped — those call for different responses.
  let staleAt: string | undefined;
  for (const concept of candidates) {
    const newest = newestPeriod(facts, concept);
    if (newest && (!staleAt || newest > staleAt)) staleAt = newest;
  }
  return {
    primitive,
    reason: staleAt ? "no concept covers this period" : "not reported",
    tried: candidates,
    ...(staleAt ? { staleAt } : {}),
  };
}

/** The company's most recent annual period end, anchored on a universal concept. */
export function latestAnnualPeriod(facts: CompanyFacts): string | null {
  return newestPeriod(facts, "Assets");
}

// ------------------------------------------------------------------- metrics

export type MetricName = "grossProfit" | "grossMargin" | "totalRevenue" | "freeCashFlow" | "effectiveTaxRate";

export interface DerivedMetric {
  metric: MetricName;
  value: number;
  /** Whether it was filed directly or computed, and from what. */
  how: "reported" | "derived";
  from: ResolvedFigure[];
}

export interface UnavailableMetric {
  metric: MetricName;
  reason: string;
  missing: UnresolvedFigure[];
}

export type MetricOutcome = DerivedMetric | UnavailableMetric;
export const isAvailable = (outcome: MetricOutcome): outcome is DerivedMetric => "value" in outcome;

const need = (outcomes: FigureOutcome[]): UnresolvedFigure[] => outcomes.filter((o): o is UnresolvedFigure => !isResolved(o));

/**
 * Revenue, including the bank case where it is a sum rather than a line.
 *
 * A bank's income statement has no single revenue line comparable to an
 * operating company's. Net interest income plus noninterest income is the usual
 * analogue, and building it explicitly is honest in a way that picking whichever
 * concept happens to resolve is not.
 */
export function totalRevenue(facts: CompanyFacts, sector: Sector, periodEnd: string): MetricOutcome {
  if (sector === "banking") {
    const nii = resolvePrimitive(facts, "netInterestIncome", sector, periodEnd);
    const fees = resolvePrimitive(facts, "noninterestIncome", sector, periodEnd);
    if (isResolved(nii) && isResolved(fees)) {
      return { metric: "totalRevenue", value: nii.value + fees.value, how: "derived", from: [nii, fees] };
    }
    return {
      metric: "totalRevenue",
      reason: "a bank's revenue is net interest income plus noninterest income, and one of them is missing",
      missing: need([nii, fees]),
    };
  }

  const revenue = resolvePrimitive(facts, "revenue", sector, periodEnd);
  if (isResolved(revenue)) return { metric: "totalRevenue", value: revenue.value, how: "reported", from: [revenue] };
  return { metric: "totalRevenue", reason: "no revenue concept covers this period", missing: [revenue] };
}

/**
 * Gross profit, reported where it is and derived where it is not.
 *
 * Six of the twelve companies measured report neither gross profit nor any cost
 * of revenue. For a bank, a REIT or a railroad that is not missing data — the
 * quantity is not defined for how they operate — so the failure says so.
 */
export function grossProfit(facts: CompanyFacts, sector: Sector, periodEnd: string): MetricOutcome {
  const reported = resolvePrimitive(facts, "grossProfit", sector, periodEnd);
  if (isResolved(reported)) return { metric: "grossProfit", value: reported.value, how: "reported", from: [reported] };

  const revenue = resolvePrimitive(facts, "revenue", sector, periodEnd);
  const cost = resolvePrimitive(facts, "costOfRevenue", sector, periodEnd);
  if (isResolved(revenue) && isResolved(cost)) {
    return { metric: "grossProfit", value: revenue.value - cost.value, how: "derived", from: [revenue, cost] };
  }

  return {
    metric: "grossProfit",
    reason:
      sector === "banking" || sector === "insurance" || sector === "real-estate" || sector === "transport" || sector === "utility"
        ? `gross profit is not defined for ${SECTOR_LABEL[sector]}: it reports no cost of revenue`
        : "neither gross profit nor a cost of revenue covers this period",
    missing: need([reported, revenue, cost]),
  };
}

export function grossMargin(facts: CompanyFacts, sector: Sector, periodEnd: string): MetricOutcome {
  const profit = grossProfit(facts, sector, periodEnd);
  const revenue = totalRevenue(facts, sector, periodEnd);
  if (!isAvailable(profit)) return { ...profit, metric: "grossMargin" };
  if (!isAvailable(revenue)) return { ...revenue, metric: "grossMargin" };
  if (!(revenue.value > 0)) {
    return { metric: "grossMargin", reason: "revenue is not positive, so a margin has no meaning", missing: [] };
  }
  return { metric: "grossMargin", value: profit.value / revenue.value, how: "derived", from: [...profit.from, ...revenue.from] };
}

/**
 * Cash from operations less capital spending.
 *
 * Returns unavailable rather than assuming zero capex. NextEra tags no cash
 * capital spending under any standard concept, and treating that as zero would
 * turn a utility's free cash flow into its operating cash flow.
 */
export function freeCashFlow(facts: CompanyFacts, sector: Sector, periodEnd: string): MetricOutcome {
  // A bank or insurer computes to a number here and the number means nothing:
  // its operating cash flow is dominated by balance-sheet movement and its
  // capital spending is office premises. Two independent authorities agree —
  // the competition team replaced free-cash-flow yield with dividend yield for
  // banks, and Morgan Stanley's moat work excludes financials from its returns
  // analysis for accounting reasons.
  if (sector === "banking" || sector === "insurance") {
    return {
      metric: "freeCashFlow",
      reason: `free cash flow is not a meaningful measure for ${SECTOR_LABEL[sector]}; use dividend yield or return on assets instead`,
      missing: [],
    };
  }

  const cfo = resolvePrimitive(facts, "cashFromOperations", sector, periodEnd);
  const capex = resolvePrimitive(facts, "capitalExpenditure", sector, periodEnd);
  if (isResolved(cfo) && isResolved(capex)) {
    return { metric: "freeCashFlow", value: cfo.value - capex.value, how: "derived", from: [cfo, capex] };
  }
  return {
    metric: "freeCashFlow",
    reason: "free cash flow needs both operating cash flow and cash capital spending",
    missing: need([cfo, capex]),
  };
}

export function effectiveTaxRate(facts: CompanyFacts, sector: Sector, periodEnd: string): MetricOutcome {
  const tax = resolvePrimitive(facts, "taxExpense", sector, periodEnd);
  const pretax = resolvePrimitive(facts, "pretaxIncome", sector, periodEnd);
  if (!isResolved(tax) || !isResolved(pretax)) {
    return { metric: "effectiveTaxRate", reason: "needs both tax expense and pre-tax income", missing: need([tax, pretax]) };
  }
  if (!(pretax.value > 0)) {
    return { metric: "effectiveTaxRate", reason: "pre-tax income is not positive, so an effective rate is not meaningful", missing: [] };
  }
  return { metric: "effectiveTaxRate", value: tax.value / pretax.value, how: "derived", from: [tax, pretax] };
}
