/**
 * The seven figures, read out of what the company itself filed.
 *
 * Investigate has always asked the learner to type seven numbers out of an
 * annual report. That is the exercise, and it stays available — but a 10-K runs
 * to four hundred thousand characters, and hunting for "income before income
 * taxes" in it teaches nothing about whether the business earns its cost of
 * capital. Worse, a typed figure carries no source, so Investigate was the one
 * surface in Studio where a number could not be traced back to anything.
 *
 * So the figures can now be supplied from SEC company facts, each one carrying
 * the tag it was read from, the period it covers and the filing it came from.
 * The learner can overwrite any of them; the moment they do, it stops being the
 * SEC's number and says so.
 *
 * **Nothing here guesses.** It reuses `metrics.ts`, which resolves a concept
 * only if that concept covers the stated period — the rule that stops NVIDIA's
 * 2012 capital spending appearing beside its 2026 revenue. A figure that cannot
 * be established is returned as missing, with the reason and the tags that were
 * tried, and the learner types it themselves. An empty box is a true statement;
 * a zero would not be.
 *
 * **US GAAP only.** `metrics.ts` reads the `us-gaap` taxonomy. A foreign issuer
 * filing its 20-F under IFRS — SAP, Novo Nordisk, Toyota — tags under
 * `ifrs-full`, so nothing resolves for it and every figure comes back missing.
 * That is stated rather than worked around: an IFRS concept map is its own
 * piece of work, and guessing across taxonomies is how wrong numbers get a
 * source note attached to them.
 */

import type { FigureKey } from "./investigate";
import {
  isResolved,
  latestAnnualPeriod,
  resolveConcepts,
  resolvePrimitive,
  totalRevenue,
  type CompanyFacts,
  type ConceptValue,
  type FigureOutcome,
  type PrimitiveName,
  type ResolvedFigure,
  type Sector,
  type UnresolvedFigure,
} from "./metrics";

/** One of Investigate's seven boxes, filled from the filing. */
export interface SuppliedFigure {
  key: FigureKey;
  /** In the filing's own currency unit, which for a US filer is whole dollars. */
  value: number;
  /** The XBRL tags read, in the order their values were added. */
  concepts: string[];
  /**
   * Set only when the value is a sum rather than one reported line, and says
   * what was added to what. A learner comparing Studio's total borrowings with
   * the balance sheet needs to see that it is two lines, not one.
   */
  addedUp: string | null;
  periodStart: string | null;
  periodEnd: string;
  accession: string;
  form: string;
  filed: string;
}

/** One of the seven that could not be established, and why. */
export interface MissingFigure {
  key: FigureKey;
  /** Written for a learner, not for an accountant. */
  reason: string;
  /** The tags that were looked for, so the search is visible rather than asserted. */
  tried: string[];
}

export interface Prefill {
  /** The annual period every supplied figure covers. */
  periodEnd: string;
  supplied: SuppliedFigure[];
  missing: MissingFigure[];
}

/**
 * Why a resolution failed, in words a learner can act on.
 *
 * `metrics.ts` distinguishes a company that never reports something from one
 * that stopped, because they call for different responses: the first means look
 * elsewhere in the statements, the second means the tag moved.
 */
function whyMissing(outcome: UnresolvedFigure, periodEnd: string): string {
  if (outcome.reason === "not applicable to this kind of company") {
    return "This does not apply to how this kind of company reports.";
  }
  if (outcome.reason === "no concept covers this period" && outcome.staleAt) {
    return `Reported, but not for the year ending ${periodEnd} — the newest is ${outcome.staleAt}. Companies change the tag they use, so this one has probably moved. Read it off the statement and type it in.`;
  }
  return "Not among the tags this company files under US accounting rules. Read it off the statement and type it in.";
}

const provenance = (from: ResolvedFigure | ConceptValue): Pick<SuppliedFigure, "periodStart" | "periodEnd" | "accession" | "form" | "filed"> => ({
  periodStart: from.periodStart,
  periodEnd: from.periodEnd,
  accession: from.accession,
  form: from.form,
  filed: from.filed,
});

/** A single primitive straight through to a box, keeping its provenance. */
function direct(
  facts: CompanyFacts,
  key: FigureKey,
  primitive: PrimitiveName,
  sector: Sector,
  periodEnd: string,
): SuppliedFigure | MissingFigure {
  const outcome = resolvePrimitive(facts, primitive, sector, periodEnd);
  if (!isResolved(outcome)) {
    return { key, reason: whyMissing(outcome, periodEnd), tried: outcome.tried };
  }
  return { key, value: outcome.value, concepts: [outcome.concept], addedUp: null, ...provenance(outcome) };
}

/**
 * Everything a company owes lenders, and nothing else.
 *
 * This does not use the `longTermDebt` primitive, and the reason is worth
 * stating. That list serves the whole of Studio and takes whichever debt tag a
 * company files; Investigate's box promises something narrower — "money the
 * company owes to lenders … not its supplier bills or its lease commitments" —
 * and three ways of getting that wrong were measured across twelve companies
 * on 2026-09-11, each of which produced a plausible number rather than an
 * error.
 *
 * 1. **A noncurrent tag is not the total.** Where `LongTermDebt` exists it
 *    equals noncurrent plus the instalment due this year: Atkore 761 = 757 + 4,
 *    Microsoft 40,294 = 31,067 + 9,227, NVIDIA 8,468 = 7,469 + 999. Where it
 *    does not exist, taking `LongTermDebtNoncurrent` alone drops that
 *    instalment — $3.0bn at Pfizer, $3.5bn at NextEra — so it is added back.
 * 2. **A combined tag is already complete.** Verizon's
 *    `DebtLongtermAndShorttermCombinedAmount` of 158,150 is 139,532 + 18,177 +
 *    441, so adding its short-term borrowings on top counted $441m twice.
 * 3. **Lease-inclusive tags contradict the box.** Exxon files no lease-free
 *    borrowing tag at all: only `LongTermDebtAndCapitalLeaseObligations`, which
 *    bundles $2.7bn of finance leases in with the debt. Rather than supply a
 *    number that means something different from what the box says, and
 *    different from what every other company's figure means, Exxon's borrowings
 *    come back missing and the learner is told why.
 *
 * A missing figure is never a zero. A company with no borrowings is a real
 * thing, and saying so is the learner's call, not an inference from an absent
 * tag.
 */

/** Complete on its own: long and short together, so nothing is added to it. */
const DEBT_COMBINED = ["DebtLongtermAndShorttermCombinedAmount"] as const;
/** The whole of long-term borrowing including the instalment due this year. */
const DEBT_LONG_TOTAL = ["LongTermDebt", "LongTermNotesAndLoans", "LongTermNotesPayable", "SeniorNotes"] as const;
/** Long-term borrowing excluding that instalment, which must then be added. */
const DEBT_LONG_NONCURRENT = ["LongTermDebtNoncurrent"] as const;
const DEBT_CURRENT_INSTALMENT = ["LongTermDebtCurrent"] as const;
/**
 * Short-term borrowing. `ShortTermBorrowings` is the total where a company
 * files one; only where it does not are the separate instruments added up,
 * because summing a total with its own parts is how Pfizer's commercial paper
 * of zero would otherwise hide $157m of other short-term borrowing.
 */
const DEBT_SHORT_TOTAL = ["ShortTermBorrowings"] as const;
const DEBT_SHORT_PARTS = ["CommercialPaper", "OtherShortTermBorrowings", "NotesPayableCurrent"] as const;

function borrowings(facts: CompanyFacts, periodEnd: string): SuppliedFigure | MissingFigure {
  const combined = resolveConcepts(facts, DEBT_COMBINED, periodEnd);
  if (combined) {
    return {
      key: "totalDebt",
      value: combined.value,
      concepts: [combined.concept],
      addedUp: null,
      ...provenance(combined),
    };
  }

  const total = resolveConcepts(facts, DEBT_LONG_TOTAL, periodEnd);
  const noncurrent = total ? null : resolveConcepts(facts, DEBT_LONG_NONCURRENT, periodEnd);
  const instalment = noncurrent ? resolveConcepts(facts, DEBT_CURRENT_INSTALMENT, periodEnd) : null;
  const long = total ?? noncurrent;
  if (!long) {
    return {
      key: "totalDebt",
      reason: `No borrowing figure that excludes finance leases is tagged for the year ending ${periodEnd}. Some companies report debt and leases on one line; Studio's figure leaves leases out, so read the debt note and type what you want to use. If the company has no borrowings, enter 0.`,
      tried: [...DEBT_COMBINED, ...DEBT_LONG_TOTAL, ...DEBT_LONG_NONCURRENT],
    };
  }

  const shortTotal = resolveConcepts(facts, DEBT_SHORT_TOTAL, periodEnd);
  const shortParts = (
    shortTotal
      ? [shortTotal]
      : DEBT_SHORT_PARTS.map((concept) => resolveConcepts(facts, [concept], periodEnd)).filter(
          (found): found is NonNullable<typeof found> => found !== null,
        )
    // A tag reported as zero added nothing, so naming it in the provenance would
    // imply it did. Pfizer files commercial paper of zero beside $157m of other
    // short-term borrowing; only the second belongs in "where this came from".
  ).filter((part) => part.value !== 0);

  const parts = [long, ...(instalment ? [instalment] : []), ...shortParts];
  const value = parts.reduce((sum, part) => sum + part.value, 0);
  const named = [
    "long-term borrowings",
    ...(instalment ? ["the instalment due within the year"] : []),
    ...(shortParts.length ? ["short-term borrowings"] : []),
  ];

  return {
    key: "totalDebt",
    value,
    concepts: parts.map((part) => part.concept),
    addedUp: parts.length > 1 ? named.join(", plus ") : null,
    ...provenance(long),
  };
}

/**
 * Revenue, which for a bank is a sum and for everyone else is a line.
 *
 * Delegated to `totalRevenue` so the bank case is handled the one way it is
 * handled everywhere else in Studio. Asking Fifth Third for contract revenue
 * returns a fifteenth of the right answer while looking perfectly successful.
 */
function revenue(facts: CompanyFacts, sector: Sector, periodEnd: string): SuppliedFigure | MissingFigure {
  const outcome = totalRevenue(facts, sector, periodEnd);
  if (!("value" in outcome)) {
    // `totalRevenue` reports one failure for the whole metric, which for a bank
    // is the useful thing to say. For everyone else the single underlying
    // resolution knows more — whether the tag was never filed or has moved to a
    // newer one — and that is what tells a learner where to look.
    const reason =
      outcome.missing.length === 1
        ? whyMissing(outcome.missing[0], periodEnd)
        : `A bank's revenue is net interest income plus fee income, and one of them is not tagged for the year ending ${periodEnd}. Read them off the income statement and type the total in.`;
    return { key: "revenue", reason, tried: outcome.missing.flatMap((figure) => figure.tried) };
  }
  const first = outcome.from[0];
  return {
    key: "revenue",
    value: outcome.value,
    concepts: outcome.from.map((figure) => figure.concept),
    addedUp: outcome.how === "derived" ? "net interest income plus fee income, which is a bank's revenue" : null,
    ...provenance(first),
  };
}

/** Which primitive each of the straightforward five is read from. */
const DIRECT: ReadonlyArray<readonly [FigureKey, PrimitiveName]> = [
  ["operatingProfit", "operatingIncome"],
  ["pretaxProfit", "pretaxIncome"],
  ["taxExpense", "taxExpense"],
  ["equity", "equity"],
  ["cash", "cash"],
];

/**
 * All seven figures for one company's most recent annual period.
 *
 * The period is chosen once, from `Assets`, and every figure must cover that
 * same period or be reported missing. Mixing periods is the failure this whole
 * arrangement exists to prevent, and it is the one that would be hardest for a
 * learner to notice: seven plausible numbers, one of them from a different year.
 */
export function figuresFromFacts(facts: CompanyFacts, sector: Sector, periodEnd: string): Prefill {
  const outcomes: Array<SuppliedFigure | MissingFigure> = [
    revenue(facts, sector, periodEnd),
    ...DIRECT.map(([key, primitive]) => direct(facts, key, primitive, sector, periodEnd)),
    borrowings(facts, periodEnd),
  ];

  return {
    periodEnd,
    supplied: outcomes.filter((outcome): outcome is SuppliedFigure => "value" in outcome),
    missing: outcomes.filter((outcome): outcome is MissingFigure => !("value" in outcome)),
  };
}

/**
 * The period to read, or nothing when this company has no annual filing here.
 *
 * Company facts can lag a filing: TSMC's FY2025 20-F was on EDGAR and tagged
 * while company facts still ended at 2024-12-31 (measured 2026-09-10). So the
 * period returned is the newest company facts actually holds, and the filing it
 * names is the one that reported it — which may not be the company's newest.
 */
export function periodToRead(facts: CompanyFacts): string | null {
  return latestAnnualPeriod(facts);
}

/** Unresolved figures keep their tag list; this narrows for the callers that need it. */
export const isMissing = (outcome: FigureOutcome): outcome is UnresolvedFigure => !isResolved(outcome);
