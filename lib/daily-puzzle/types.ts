/**
 * One day's company puzzle, as data.
 *
 * Every number is the company's own, from one annual report, and carries the
 * XBRL tag it was read from, so the page can say where each clue came from
 * and the tests can recompute every derived figure. The wording of the clues
 * is not stored here: `clues.ts` writes it from these numbers, in one place.
 */

/** A figure for the report's fiscal year (a span) or its last day (a balance). */
export type ReportedFigure = {
  /** In US dollars, exactly as tagged. */
  value: number;
  /** The us-gaap tag, such as "OperatingIncomeLoss". */
  concept: string;
};

export type RevenueRow = {
  /** The label as the page shows it, with "[[name]]" where a brand was blanked out. */
  label: string;
  /** A fraction of total revenue, from the report's own figures. */
  share: number;
};

export type DailyPuzzle = {
  /** 1 for the first puzzle. Each number is one calendar day after the last. */
  number: number;
  answer: { name: string; ticker: string; cik: string };
  report: {
    form: "10-K";
    accession: string;
    /** The report's main document, which the reader opens. */
    document: string;
    filed: string;
    /** The fiscal year's last day, YYYY-MM-DD. */
    periodEnd: string;
  };
  revenue: ReportedFigure;
  operatingProfit: ReportedFigure;
  assets: ReportedFigure;
  cash: ReportedFigure;
  industry: {
    /** The SEC's Standard Industrial Classification code. */
    sic: string;
    /** The SEC's own description, as EDGAR gives it. */
    secDescription: string;
    /** The same description in sentence case, for the page. */
    label: string;
  };
  mix: {
    /** What the report splits its revenue by. */
    kind: "products" | "regions" | "segments";
    rows: RevenueRow[];
  };
  description: {
    /** The words as the page shows them: "[[name]]" for a blanked name, "…" where the excerpt was cut. */
    shown: string;
    /** Where the original words sit in the reader's Business section, to open them there. */
    anchor: { sectionId: "business"; quote: string; prefix: string; suffix: string; offset: number };
  };
};

/** One company a learner can guess. Answers are always among them, with their ticker. */
export type GuessableCompany = { name: string; ticker?: string; aliases?: string[] };
