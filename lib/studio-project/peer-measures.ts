/**
 * The four measures the peer screen compares companies on, worked out from the
 * same seven figures Investigate asks a learner for.
 *
 * Three of them are *Measuring the Moat*'s decomposition, computed by `roic.ts`
 * exactly as Investigate computes it for the learner's own company — the same
 * effective tax rate rule and the same refusals — so the number beside a
 * competitor's name means the same thing as the number on the learner's own
 * page. `peer-measures.test.ts` holds the two side by side so they cannot drift
 * apart.
 *
 * The fourth, borrowings against equity, is here for a reason that is as much
 * about teaching as about finance: it is the one measure in the set that counts
 * better when it is lower, and a learner cannot understand that direction is a
 * choice somebody makes until they see a screen make the opposite one. Its
 * label says as much on the surface.
 *
 * Nothing here fills a gap. A figure Studio could not read, a ratio that is not
 * defined, a company whose accounting puts a different meaning on the words —
 * each comes back as missing with its reason, for the screen to show and leave
 * out of the arithmetic.
 */

import type { Entries, FigureKey } from "./investigate";
import { FIGURES } from "./investigate";
import { decomposeRoic, investedCapital, isComputed, ROIC_EXCLUDED_SECTORS, type RoicSector } from "./roic";
import type { Direction, Observation } from "./screen";

export interface PeerMeasure {
  id: string;
  /** What the learner reads. */
  label: string;
  direction: Direction;
  /** What it is, in a sentence, and what a high or low one means. */
  what: string;
  /** How a value is written: a percentage, or a number of times. */
  unit: "percent" | "times";
}

export const PEER_MEASURES: PeerMeasure[] = [
  {
    id: "roic",
    label: "Return on capital",
    direction: "higher",
    what: "After-tax operating profit, against the borrowings and equity the business is working with. What the business earns on what has been put into it.",
    unit: "percent",
  },
  {
    id: "margin",
    label: "Profit kept from sales",
    direction: "higher",
    what: "After-tax operating profit for every dollar of sales. High here is the mark of a company that can charge more.",
    unit: "percent",
  },
  {
    id: "turnover",
    label: "Sales per dollar of capital",
    direction: "higher",
    what: "Sales against that same invested capital. High here is the mark of a company that works its capital hard rather than charging more.",
    unit: "times",
  },
  {
    id: "netMargin",
    label: "Profit left after everything",
    direction: "higher",
    what: "What is left of every dollar of sales once all costs, interest and tax are paid. The bottom line, which nearly every company tags, so it is often the only measure Studio can read for a company that does not report an operating profit.",
    unit: "percent",
  },
  {
    id: "borrowings",
    label: "Borrowings against equity",
    direction: "lower",
    what: "What it owes lenders for every dollar the owners have in it. Counted here as better when lower, which is a choice: borrowing is not a fault, and a company that borrows cheaply to build something can be worth more for it.",
    unit: "times",
  },
];

const NEEDED: Record<string, FigureKey[]> = {
  roic: ["revenue", "operatingProfit", "pretaxProfit", "taxExpense", "totalDebt", "equity", "cash"],
  margin: ["revenue", "operatingProfit", "pretaxProfit", "taxExpense", "totalDebt", "equity", "cash"],
  turnover: ["revenue", "totalDebt", "equity", "cash"],
  borrowings: ["totalDebt", "equity"],
};

const value = (entries: Entries, key: FigureKey): number | null =>
  typeof entries[key] === "number" && Number.isFinite(entries[key]) ? (entries[key] as number) : null;

const labelFor = (key: FigureKey) => FIGURES.find((figure) => figure.key === key)!.label.toLowerCase();

/** "its cash" / "its borrowings and its cash" — the figures a measure was waiting on. */
function missingFigures(entries: Entries, keys: FigureKey[]): string | null {
  const absent = keys.filter((key) => value(entries, key) === null);
  if (!absent.length) return null;
  const names = absent.map(labelFor);
  const written = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `Studio could not read its ${written} for that year`;
}

/**
 * The four measures for one company, each a value or a reason there is none.
 *
 * The effective tax rate is the company's own — tax charge over profit before
 * tax — and a year with no taxable profit is charged at zero rather than at a
 * negative rate, which is the rule Investigate's reading already uses.
 */
export function measuresFrom(entries: Entries, sector: RoicSector, netProfit: number | null = null): Record<string, Observation> {
  const measures: Record<string, Observation> = {};

  const waiting = (id: string) => missingFigures(entries, NEEDED[id]);

  const pretax = value(entries, "pretaxProfit");
  const decomposition =
    waiting("roic") === null
      ? decomposeRoic({
          sector,
          operatingIncome: value(entries, "operatingProfit") as number,
          effectiveTaxRate: (pretax as number) > 0 ? (value(entries, "taxExpense") as number) / (pretax as number) : 0,
          revenue: value(entries, "revenue") as number,
          totalDebt: value(entries, "totalDebt") as number,
          equity: value(entries, "equity") as number,
          cash: value(entries, "cash") as number,
        })
      : null;

  for (const id of ["roic", "margin"] as const) {
    const absent = waiting(id);
    if (absent) {
      measures[id] = { missing: absent };
      continue;
    }
    if (!decomposition || !isComputed(decomposition)) {
      measures[id] = { missing: decomposition ? decomposition.reason : "its figures are incomplete" };
      continue;
    }
    measures[id] = { value: id === "roic" ? decomposition.roic : decomposition.nopatMargin };
  }

  // Turnover is worked out on its own rather than lifted out of the
  // decomposition: it needs no profit figure at all, and a company that tags no
  // operating profit — three of ten large companies, measured 2026-09-15 — can
  // still say how hard it works its capital.
  const turnoverWaiting = waiting("turnover");
  const capital = turnoverWaiting
    ? null
    : investedCapital({
        totalDebt: value(entries, "totalDebt") as number,
        equity: value(entries, "equity") as number,
        cash: value(entries, "cash") as number,
      });
  const sales = value(entries, "revenue");
  if (turnoverWaiting) measures.turnover = { missing: turnoverWaiting };
  else if (ROIC_EXCLUDED_SECTORS.includes(sector)) {
    measures.turnover = {
      missing: "invested capital does not mean the same thing for this kind of company, whose accounting puts a different meaning on it",
    };
  } else if (!(capital !== null && capital > 0)) {
    measures.turnover = {
      missing: "invested capital is not positive, which happens when cash exceeds debt and equity",
    };
  } else if (!(sales !== null && sales > 0)) {
    measures.turnover = { missing: "revenue is not positive, so sales for each dollar of capital is not defined" };
  } else measures.turnover = { value: (sales as number) / (capital as number) };

  const revenue = value(entries, "revenue");
  if (netProfit === null || !Number.isFinite(netProfit)) {
    measures.netMargin = { missing: "Studio could not read what it earned after everything for that year" };
  } else if (!(revenue !== null && revenue > 0)) {
    measures.netMargin = { missing: missingFigures(entries, ["revenue"]) ?? "its revenue is not positive, so a margin is not defined" };
  } else measures.netMargin = { value: netProfit / revenue };

  const absentForBorrowings = waiting("borrowings");
  const equity = value(entries, "equity");
  if (absentForBorrowings) measures.borrowings = { missing: absentForBorrowings };
  else if (!(equity !== null && equity > 0)) {
    measures.borrowings = {
      missing: "its equity is not positive, so what it owes for each dollar the owners have in it is not defined",
    };
  } else measures.borrowings = { value: (value(entries, "totalDebt") as number) / equity };

  return measures;
}
