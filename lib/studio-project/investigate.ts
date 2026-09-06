/**
 * Investigating one company from figures the learner looked up themselves.
 *
 * Studio does not hold every company's financials, and should not try to. The
 * learner brings the seven figures for the business they actually care about;
 * Studio's job is to say which figures matter and why, to catch the ones that
 * are typed wrong, and to interpret the result against real peers.
 *
 * The checks below exist because a person researching on a general finance site
 * hits the same traps the XBRL layer hits, only harder — there is no concept
 * name to inspect, just a number under a familiar-looking heading. Every check
 * here is deterministic and names the evidence for its objection. None of them
 * guesses.
 *
 * Nothing in this file blocks a learner from proceeding with a number Studio
 * doubts. It says what looks wrong and why; the judgment stays theirs.
 */

import type { RoicDecomposition, RoicSector } from "./roic";
import { decomposeRoic, economicProfit, isComputed, readAdvantage } from "./roic";

export type FigureKey =
  | "revenue"
  | "operatingProfit"
  | "taxExpense"
  | "pretaxProfit"
  | "totalDebt"
  | "equity"
  | "cash";

export interface FigureDefinition {
  key: FigureKey;
  /** What a learner should look for, in their words rather than an accountant's. */
  label: string;
  whatItIs: string;
  /** Which statement it sits on, so they know where to look. */
  statement: "income statement" | "balance sheet";
  /** What other sites and filings call the same line. */
  alsoCalled: string[];
}

/**
 * The seven figures a return on capital needs, and nothing else.
 *
 * Seven is the whole point. A five-year history would be thirty-five entries
 * and a peer comparison another thirty-five, which nobody types. The learner
 * enters one company for one year; Studio supplies the peers.
 */
export const FIGURES: FigureDefinition[] = [
  {
    key: "revenue",
    label: "Revenue",
    whatItIs: "Everything the business sold in the year, before any costs.",
    statement: "income statement",
    alsoCalled: ["Total revenue", "Net sales", "Turnover"],
  },
  {
    key: "operatingProfit",
    label: "Operating profit",
    whatItIs: "What was left after the costs of running the business, but before interest and tax.",
    statement: "income statement",
    alsoCalled: ["Operating income", "EBIT", "Income from operations"],
  },
  {
    key: "pretaxProfit",
    label: "Profit before tax",
    whatItIs: "Profit after interest but before tax. Used with the next figure to work out the rate the company actually pays.",
    statement: "income statement",
    alsoCalled: ["Income before income taxes", "Pre-tax income", "EBT"],
  },
  {
    key: "taxExpense",
    label: "Tax charge",
    whatItIs: "The tax on that profit. Divided by the figure above, it gives the rate this company really pays, which is rarely the headline rate.",
    statement: "income statement",
    alsoCalled: ["Provision for income taxes", "Income tax expense"],
  },
  {
    key: "totalDebt",
    label: "Total borrowings",
    whatItIs: "Money the company owes to lenders, short and long term together. Not its supplier bills or its lease commitments.",
    statement: "balance sheet",
    alsoCalled: ["Long-term debt", "Short-term borrowings", "Notes payable"],
  },
  {
    key: "equity",
    label: "Shareholders' equity",
    whatItIs: "What the owners have put in and left in, after everything owed is subtracted from everything owned.",
    statement: "balance sheet",
    alsoCalled: ["Total stockholders' equity", "Net assets", "Book value"],
  },
  {
    key: "cash",
    label: "Cash",
    whatItIs: "Cash and things immediately spendable. Subtracted, because money sitting in the bank is not capital the business is working with.",
    statement: "balance sheet",
    alsoCalled: ["Cash and cash equivalents", "Cash and short-term investments"],
  },
];

export type Entries = Partial<Record<FigureKey, number>>;

export type CheckSeverity =
  /** The arithmetic cannot proceed, or the figure cannot be what it says. */
  | "stop"
  /** It computes, but something about it looks wrong. The learner decides. */
  | "question";

export interface EntryCheck {
  severity: CheckSeverity;
  /** Which fields to mark, so the message lands next to the number it concerns. */
  figures: FigureKey[];
  message: string;
}

/** Peer statistics Studio already holds for the industry, used to sanity-check. */
export interface PeerContext {
  industry: string;
  medianMargin: number;
  medianTurnover: number;
  /** Every peer's decomposition, for the advantage read. */
  peers: RoicDecomposition[];
}

const filled = (entries: Entries, key: FigureKey): number | null =>
  typeof entries[key] === "number" && Number.isFinite(entries[key]) ? (entries[key] as number) : null;

/**
 * Everything wrong with these figures that can be established without guessing.
 *
 * Ordered so a learner reads the impossible before the merely surprising.
 */
export function checkEntries(entries: Entries, sector: RoicSector, peers?: PeerContext): EntryCheck[] {
  const checks: EntryCheck[] = [];
  const revenue = filled(entries, "revenue");
  const operating = filled(entries, "operatingProfit");
  const pretax = filled(entries, "pretaxProfit");
  const tax = filled(entries, "taxExpense");
  const debt = filled(entries, "totalDebt");
  const equity = filled(entries, "equity");
  const cash = filled(entries, "cash");

  // --- Things that cannot be true ------------------------------------------

  if (revenue !== null && revenue < 0) {
    checks.push({ severity: "stop", figures: ["revenue"], message: "Revenue cannot be negative. Check you have not picked up a figure in brackets, which means a subtraction." });
  }

  if (revenue !== null && operating !== null && operating > revenue) {
    checks.push({
      severity: "stop",
      figures: ["operatingProfit", "revenue"],
      message: "Operating profit is larger than revenue, which cannot happen — costs can only reduce it. One of the two is probably from a different line or a different period.",
    });
  }

  if (debt !== null && equity !== null && cash !== null && debt + equity - cash <= 0) {
    checks.push({
      severity: "stop",
      figures: ["cash", "totalDebt", "equity"],
      message: "Cash is at least as large as borrowings and equity combined, so there is no invested capital left to earn a return on. Check the cash figure — it is often quoted in a different unit from the rest of the balance sheet.",
    });
  }

  // --- Things that are possible but usually mean a wrong line ---------------

  if (sector === "banking" || sector === "insurance" || sector === "real-estate") {
    checks.push({
      severity: "stop",
      figures: [],
      message:
        sector === "banking"
          ? "Return on capital is not a meaningful measure for a bank. Borrowing is its raw material rather than its funding, so the capital in the denominator means something different. Return on assets or return on equity is the comparable test."
          : sector === "insurance"
            ? "Return on capital is not a meaningful measure for an insurer, whose float and reserves sit in the capital base for reasons unrelated to operating performance."
            : "Return on capital is not a meaningful measure for a property company, whose buildings sit on the balance sheet at what was paid for them rather than what they are worth.",
    });
  }

  if (revenue !== null && equity !== null && debt !== null && revenue > 0) {
    const capital = equity + debt - (cash ?? 0);
    if (capital > 0 && revenue / capital > 25) {
      checks.push({
        severity: "question",
        figures: ["revenue", "equity", "totalDebt"],
        message: `Revenue is ${Math.round(revenue / capital)} times the capital in the business. That is extraordinary even for a retailer — Costco, the fastest in our data, turns its capital about 13 times. Check that both figures are in the same units.`,
      });
    }
  }

  if (pretax !== null && tax !== null && pretax > 0) {
    const rate = tax / pretax;
    if (rate > 0.6) {
      checks.push({ severity: "question", figures: ["taxExpense", "pretaxProfit"], message: `That is a ${(rate * 100).toFixed(0)}% tax rate. Rates above about 40% usually mean a one-off charge, not the rate this company normally pays.` });
    }
    if (rate < 0) {
      checks.push({ severity: "question", figures: ["taxExpense"], message: "A negative tax charge is a credit. It happens, but it will flatter this year's return, so it is worth knowing why before drawing a conclusion from it." });
    }
  }

  if (equity !== null && equity < 0) {
    checks.push({
      severity: "question",
      figures: ["equity"],
      message: "Negative equity is real and not always a warning — years of buybacks can produce it — but it makes the capital base small, so the return will look unusually high. Treat the number with care.",
    });
  }

  if (operating !== null && operating < 0) {
    checks.push({ severity: "question", figures: ["operatingProfit"], message: "The business lost money at the operating level this year, so the return on capital will be negative. That is the answer, not an error — but one year of loss does not settle whether the business is a bad one." });
  }

  // --- What the peers say ---------------------------------------------------

  if (peers && revenue !== null && operating !== null && revenue > 0) {
    const roughMargin = operating / revenue;
    if (roughMargin > peers.medianMargin * 4 && peers.medianMargin > 0) {
      checks.push({
        severity: "question",
        figures: ["operatingProfit", "revenue"],
        message: `That margin is about four times the median for ${peers.industry}. It may be right, and outliers are often the interesting ones — but check the operating profit line is not actually gross profit, which is higher up the statement.`,
      });
    }
  }

  return checks;
}

export interface Reading {
  decomposition: RoicDecomposition;
  costOfCapital: number;
  spread: number;
  economicProfit: number;
  createsValue: boolean;
  /** How the return is earned relative to peers, when there are enough of them. */
  howEarned: string | null;
  /** Plain statements a learner can act on. */
  says: string[];
  /** What this cannot establish, stated rather than implied. */
  cannotTell: string[];
}

/**
 * Amounts stay in whatever units the learner typed.
 *
 * They were asked to keep the seven figures consistent with each other, not to
 * use any particular scale, so a currency symbol and a "bn" suffix would be an
 * invention. Everything else this module returns is a ratio, which needs none.
 */
const inTheirUnits = (value: number): string =>
  Math.abs(value) >= 1000 ? Math.round(value).toLocaleString() : value.toFixed(1);

/**
 * The interpretation, which is the part a learner cannot get elsewhere.
 *
 * The numbers are on any finance site. What is not is whether this return beats
 * the cost of the capital that produced it, how the company earns it compared
 * with the businesses it competes against, and what a single year cannot tell.
 */
export function read(
  entries: Entries,
  sector: RoicSector,
  costOfCapital: number,
  peers?: PeerContext,
): Reading | { blocked: string } {
  const need: FigureKey[] = ["revenue", "operatingProfit", "pretaxProfit", "taxExpense", "totalDebt", "equity", "cash"];
  const missing = need.filter((key) => filled(entries, key) === null);
  if (missing.length) {
    return { blocked: `Still needs ${missing.map((key) => FIGURES.find((f) => f.key === key)!.label.toLowerCase()).join(", ")}.` };
  }

  const pretax = entries.pretaxProfit as number;
  const taxRate = pretax > 0 ? (entries.taxExpense as number) / pretax : 0;

  const result = decomposeRoic({
    sector,
    operatingIncome: entries.operatingProfit as number,
    effectiveTaxRate: taxRate,
    revenue: entries.revenue as number,
    totalDebt: entries.totalDebt as number,
    equity: entries.equity as number,
    cash: entries.cash as number,
  });
  if (!isComputed(result)) return { blocked: result.reason };

  const { spread, economicProfit: profit } = economicProfit(result, costOfCapital);
  const createsValue = spread > 0;

  const says: string[] = [
    createsValue
      ? `This business earns ${(result.roic * 100).toFixed(1)}% on the money invested in it, against a cost of capital of ${(costOfCapital * 100).toFixed(1)}%. Every dollar put in comes back worth more than it cost, and over a year that gap is worth about ${inTheirUnits(profit)} — in the units you entered.`
      : `This business earns ${(result.roic * 100).toFixed(1)}% on the money invested in it, against a cost of capital of ${(costOfCapital * 100).toFixed(1)}%. It is not covering what that money costs, which over a year is about ${inTheirUnits(Math.abs(profit))} of value going the wrong way — in the units you entered.`,
    `The return is those two things multiplied: it keeps ${(result.nopatMargin * 100).toFixed(1)} cents of after-tax profit on every dollar of sales, and gets ${result.capitalTurnover.toFixed(2)} dollars of sales from every dollar of capital.`,
  ];

  let howEarned: string | null = null;
  if (peers) {
    // The hurdle is this industry's own cost of capital, not a fixed number:
    // a 9% return is good for a utility and poor for a software company.
    const advantage = readAdvantage(result, peers.peers, { hurdle: costOfCapital });
    if ("advantage" in advantage) {
      howEarned = advantage.advantage;
      const margin = advantage.marginPercentile >= 0.6 ? "higher" : "lower";
      const turnover = advantage.turnoverPercentile >= 0.6 ? "harder" : "less hard";
      says.push(
        advantage.advantage === "differentiation"
          ? `Against the rest of ${peers.industry}, it charges more rather than working its capital harder. Something lets it hold that price — find out what, and whether it lasts.`
          : advantage.advantage === "cost leadership"
            ? `Against the rest of ${peers.industry}, its margin is ordinary but its capital works unusually hard. That is a different way to earn the same return, and it usually depends on scale or on how the operation is run.`
            : advantage.advantage === "both"
              ? `Against the rest of ${peers.industry}, it both charges more and works its capital harder. That is rare, and worth understanding before assuming it continues.`
              : `Against the rest of ${peers.industry}, its margin is ${margin} than most and its capital works ${turnover} than most. There is no obvious edge in either direction here.`,
      );
    } else {
      says.push(advantage.reason);
    }
  }

  return {
    decomposition: result,
    costOfCapital,
    spread,
    economicProfit: profit,
    createsValue,
    howEarned,
    says,
    cannotTell: [
      "This is one year. It cannot tell you whether the return is durable or whether this was simply a good year — add another year to start seeing that.",
      "Invested capital here is borrowings plus equity less cash. It leaves out lease commitments, which are large for some businesses and would lower the return if counted.",
      "The cost of capital is an estimate, not a figure anyone reports. Change it and see how much of the answer depends on it.",
      peers
        ? `The peers are companies filing under the same industry code, not every competitor. Private and foreign rivals are not in the comparison.`
        : "Without peers there is nothing to say whether this return is good for this kind of business.",
    ],
  };
}
