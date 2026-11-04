import { longDate } from "./schedule";
import type { DailyPuzzle } from "./types";

/**
 * The six clues, in the order they are revealed, worded from the puzzle's
 * numbers in one place.
 *
 * The order runs from the numbers a learner must reason about to the words
 * that nearly give the answer away: three figures from the financial
 * statements first, then the SEC's industry code, then where the revenue
 * comes from, and last the company's own description of itself.
 *
 * Each clue's `definition` introduces the one term the clue uses, so a
 * learner who has not met "operating profit" yet can still read the clue.
 */

export type ClueId = "revenue" | "margin" | "assets" | "industry" | "mix" | "description";

export type MixRow = { label: string; share: string };

export type Clue = {
  id: ClueId;
  /** Shown before the clue is revealed, so the learner knows what is coming. */
  title: string;
  definition: string;
} & ({ kind: "text"; text: string } | { kind: "mix"; rows: MixRow[] } | { kind: "quote"; text: string });

/** Whole dollars to "$478.8 billion", "$842 million" or "$9,500". */
export function dollars(value: number): string {
  const sign = value < 0 ? "-" : "";
  const amount = Math.abs(value);
  if (amount >= 1e9) return `${sign}$${(amount / 1e9).toFixed(1)} billion`;
  if (amount >= 1e6) return `${sign}$${Math.round(amount / 1e6)} million`;
  return `${sign}$${Math.round(amount).toLocaleString("en-US")}`;
}

/**
 * A share of revenue as a percentage. Whole numbers read best, but a whole
 * number would show 99.5% as 100% and 0.4% as 0%, which says a company has
 * one line of business or a line it does not have, so those keep a decimal.
 */
export function percent(share: number): string {
  const value = share * 100;
  if (value < 0.1) return "under 0.1%";
  if (value < 9.5 || value >= 99.5) return `${value.toFixed(1)}%`;
  return `${Math.round(value)}%`;
}

/** Operating profit per dollar of revenue, in words. */
export function marginWords(operatingProfit: number, revenue: number): string {
  const cents = (operatingProfit / revenue) * 100;
  if (cents >= 0.5) return `About ${Math.round(cents)} cents of operating profit from each dollar of revenue`;
  if (cents >= 0) return "Less than 1 cent of operating profit from each dollar of revenue";
  if (cents > -0.5) return "An operating loss of less than 1 cent on each dollar of revenue";
  return `An operating loss of about ${Math.round(-cents)} cents on each dollar of revenue`;
}

/** The clue titles in order, for places that show the puzzle's shape without a puzzle, such as its link preview. */
export const CLUE_TITLES = [
  "How much it sells",
  "What it keeps from each dollar",
  "What it owns",
  "Its industry, as the SEC files it",
  "Where its revenue comes from",
  "How it describes itself",
] as const;

const SPLIT: Record<DailyPuzzle["mix"]["kind"], string> = {
  products: "by product",
  regions: "by region",
  segments: "by business unit",
};

export function cluesFor(puzzle: DailyPuzzle): Clue[] {
  return [
    {
      id: "revenue",
      title: CLUE_TITLES[0],
      kind: "text",
      text: `${dollars(puzzle.revenue.value)} of revenue in the year ending ${longDate(puzzle.report.periodEnd)}`,
      definition: "Revenue is the money a company takes in from selling its goods and services, before it pays any costs.",
    },
    {
      id: "margin",
      title: CLUE_TITLES[1],
      kind: "text",
      text: marginWords(puzzle.operatingProfit.value, puzzle.revenue.value),
      definition:
        "Operating profit, also called operating income, is revenue minus the costs of running the business, such as making what it sells, paying staff and marketing. Interest and taxes come after it.",
    },
    {
      id: "assets",
      title: CLUE_TITLES[2],
      kind: "text",
      text: `${dollars(puzzle.assets.value)} of assets, including ${dollars(puzzle.cash.value)} of cash`,
      definition:
        "Assets are everything a company owns that has value, such as cash, buildings, equipment and goods waiting to be sold. Cash includes money in the bank and investments it can turn into cash almost at once.",
    },
    {
      id: "industry",
      title: CLUE_TITLES[3],
      kind: "text",
      text: puzzle.industry.label,
      definition: "The SEC files every company under an industry code. The names are decades old, so some sound dated.",
    },
    {
      id: "mix",
      title: CLUE_TITLES[4],
      kind: "mix",
      rows: puzzle.mix.rows.map((row) => ({ label: row.label, share: percent(row.share) })),
      definition: `Its annual report splits revenue ${SPLIT[puzzle.mix.kind]}. Any name that would give the answer away is blacked out.`,
    },
    {
      id: "description",
      title: CLUE_TITLES[5],
      kind: "quote",
      text: puzzle.description.shown,
      definition: "In its own words, from the Business section of its annual report, with its name blacked out.",
    },
  ];
}

/** Splits text on the "[[name]]" blanks, so the page can draw each as a black bar. */
export function blanks(text: string): { text: string; blank: boolean }[] {
  return text
    .split(/(\[\[name\]\])/)
    .filter((part) => part !== "")
    .map((part) => (part === "[[name]]" ? { text: "name removed", blank: true } : { text: part, blank: false }));
}
