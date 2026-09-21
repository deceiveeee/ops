/**
 * What the inputs a company buys have cost, for any company's annual report.
 *
 * R9 in the research roadmap (docs/source-audits/studio-online-data-and-tools.md
 * §10): input-cost series, each tied to an input the filing itself names. The
 * first version was built for one company, with its indexes chosen by hand; on
 * 2026-09-14 it was reworked to work on whichever company a learner researches.
 *
 * The US Bureau of Labor Statistics publishes producer price indexes for
 * thousands of products and none for exactly what one company buys, so the risk
 * is choosing the wrong index. Studio holds a small checked library of indexes
 * for inputs companies commonly buy (scripts/source/input-cost-library-manifest.json),
 * suggests one wherever a report uses its words, and leaves the judgment to the
 * learner: an index is linked to a company only through a sentence of the
 * company's own report that the learner kept, and a mention is not always a
 * purchase — a steelmaker mentions steel because it sells it.
 *
 * Nothing here touches the network.
 */

import { anchorFor } from "../filings/anchor";

/** One month of a producer price index. */
export interface IndexMonth {
  /** YYYY-MM */
  month: string;
  value: number;
  /** BLS marks a month preliminary for four months after it is first published, and may revise it. */
  preliminary: boolean;
}

/** A data point as BLS's public API returns it. */
export interface BlsPoint {
  year: string;
  period: string;
  value: string;
  footnotes?: ({ code?: string; text?: string } | null)[];
}

const MONTH_PERIOD = /^M(0[1-9]|1[0-2])$/;

/**
 * The months of a series from BLS's answer, oldest first. BLS's annual average
 * (period M13) is not a month and is left out; anything else that is not a
 * usable month is a problem, never a guess.
 */
export function monthsFromBls(points: BlsPoint[]): { months: IndexMonth[]; problems: string[] } {
  const problems: string[] = [];
  const byMonth = new Map<string, IndexMonth>();
  for (const point of points) {
    if (point.period === "M13") continue;
    if (!/^\d{4}$/.test(point.year) || !MONTH_PERIOD.test(point.period)) {
      problems.push(`${point.year} ${point.period} is not a month.`);
      continue;
    }
    const month = `${point.year}-${point.period.slice(1)}`;
    const value = Number(point.value);
    if (point.value.trim() === "" || !Number.isFinite(value) || value <= 0) {
      problems.push(`${month} has no usable value ("${point.value}").`);
      continue;
    }
    if (byMonth.has(month)) {
      problems.push(`${month} is given twice.`);
      continue;
    }
    byMonth.set(month, { month, value, preliminary: (point.footnotes ?? []).some((note) => note?.code === "P") });
  }
  return { months: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)), problems };
}

export function nextMonth(month: string): string {
  const [year, number] = month.split("-").map(Number);
  return number === 12 ? `${year + 1}-01` : `${year}-${String(number + 1).padStart(2, "0")}`;
}

/** Months from `from` to `to`, both included, that have no value. */
export function missingMonths(months: IndexMonth[], from: string, to: string): string[] {
  const have = new Set(months.map((entry) => entry.month));
  const missing: string[] = [];
  for (let month = from; month <= to; month = nextMonth(month)) if (!have.has(month)) missing.push(month);
  return missing;
}

/**
 * The fiscal year a month falls in, named by the calendar year it ends in.
 * For a year ending in September, October 2024 is in fiscal 2025.
 */
export function fiscalYearOf(month: string, endMonth: number): number {
  const [year, number] = month.split("-").map(Number);
  return number <= endMonth ? year : year + 1;
}

/** The twelve months of a fiscal year, first to last. */
export function fiscalYearMonths(fiscalYear: number, endMonth: number): string[] {
  let month = endMonth === 12 ? `${fiscalYear}-01` : `${fiscalYear - 1}-${String(endMonth + 1).padStart(2, "0")}`;
  const months: string[] = [];
  for (let index = 0; index < 12; index++) {
    months.push(month);
    month = nextMonth(month);
  }
  return months;
}

/**
 * The fiscal year a report covers, from the date its period ends: the calendar
 * year it ends in, and its last month. A 52- or 53-week year can end a few days
 * into the next month (Apple's ended on 27 September, others on 3 October), so a
 * period ending on or before the 7th counts as ending in the month before.
 */
export function fiscalYearFor(periodEnd: string): { fiscalYear: number; endMonth: number } | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(periodEnd);
  if (!parts) return null;
  let year = Number(parts[1]);
  let month = Number(parts[2]);
  if (month < 1 || month > 12) return null;
  if (Number(parts[3]) <= 7) {
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
  }
  return { fiscalYear: year, endMonth: month };
}

export interface YearAverage {
  fiscalYear: number;
  average: number;
  /** How many of its twelve months are preliminary. */
  preliminary: number;
}

/**
 * A fiscal year's average index, or null unless all twelve of its months have a
 * value: an average of the months there happen to be would describe a different
 * stretch of time from the one the report describes.
 */
export function fiscalYearAverage(months: IndexMonth[], fiscalYear: number, endMonth: number): YearAverage | null {
  const byMonth = new Map(months.map((entry) => [entry.month, entry]));
  const year = fiscalYearMonths(fiscalYear, endMonth).map((month) => byMonth.get(month));
  if (year.some((entry) => entry === undefined)) return null;
  const present = year as IndexMonth[];
  return {
    fiscalYear,
    average: present.reduce((sum, entry) => sum + entry.value, 0) / present.length,
    preliminary: present.filter((entry) => entry.preliminary).length,
  };
}

export interface YearChange {
  fiscalYear: number;
  /** A fraction: 0.039 is 3.9% higher than the year before. */
  change: number;
  /** Preliminary months in the two years compared. */
  preliminary: number;
}

/** How far a fiscal year's average index moved from the year before's, the way a report compares its years. */
export function yearOnYear(months: IndexMonth[], fiscalYear: number, endMonth: number): YearChange | null {
  const now = fiscalYearAverage(months, fiscalYear, endMonth);
  const before = fiscalYearAverage(months, fiscalYear - 1, endMonth);
  if (!now || !before) return null;
  return { fiscalYear, change: now.average / before.average - 1, preliminary: now.preliminary + before.preliminary };
}

/**
 * An index restated so that `base` reads 100. BLS sets each index to 100 in its
 * own base period (1982 for steel mill products, December 2003 for copper rod),
 * so the raw numbers of two indexes cannot be read against each other; restated
 * against the same stretch of time, they can.
 */
export function rebase(months: IndexMonth[], base: number): IndexMonth[] {
  return months.map((entry) => ({ ...entry, value: (entry.value / base) * 100 }));
}

/** A change as a learner reads it: "+3.9%", "−8.2%", or "0.0%" when it rounds to nothing. */
export function formatChange(change: number): string {
  const tenths = Math.round(change * 1000);
  if (tenths === 0) return "0.0%";
  return `${tenths > 0 ? "+" : "−"}${(Math.abs(tenths) / 10).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// The library
// ---------------------------------------------------------------------------

/** One index in the library, with its months stored compactly. */
export interface LibrarySeries {
  id: string;
  /** The item's title on its BLS page. */
  title: string;
  /** What a learner calls the input: "Plastic resin". */
  name: string;
  /** Words a report uses for it, matched as whole words, ignoring capitals. */
  words: string[];
  /** Phrases a match inside which does not count: "commercial paper" is not paper. */
  exclude: string[];
  /** "1982 = 100" */
  baseDate: string;
  url: string;
  /** The month of the first value, YYYY-MM. */
  start: string;
  values: number[];
  /** Where in `values` the preliminary months begin, or null when none are. */
  preliminaryFrom: number | null;
}

export interface InputCostLibrary {
  builtOn: string;
  source: string;
  terms: string;
  series: LibrarySeries[];
}

/** A stored series as months. */
export function monthsOf(series: Pick<LibrarySeries, "start" | "values" | "preliminaryFrom">): IndexMonth[] {
  const months: IndexMonth[] = [];
  let month = series.start;
  series.values.forEach((value, index) => {
    months.push({ month, value, preliminary: series.preliminaryFrom !== null && index >= series.preliminaryFrom });
    month = nextMonth(month);
  });
  return months;
}

/**
 * Months stored compactly, which only works for an unbroken run whose
 * preliminary months all come at the end. Anything else is a problem, not a
 * guess: a gap stored as a run would shift every later month by one.
 */
export function compactMonths(months: IndexMonth[]): { start: string; values: number[]; preliminaryFrom: number | null; problems: string[] } {
  const problems: string[] = [];
  if (!months.length) return { start: "", values: [], preliminaryFrom: null, problems: ["No months."] };
  const gaps = missingMonths(months, months[0].month, months[months.length - 1].month);
  if (gaps.length) problems.push(`No value for ${gaps.join(", ")}.`);
  const firstPreliminary = months.findIndex((entry) => entry.preliminary);
  if (firstPreliminary >= 0 && months.slice(firstPreliminary).some((entry) => !entry.preliminary)) {
    problems.push("A final month comes after a preliminary one.");
  }
  return {
    start: months[0].month,
    values: months.map((entry) => entry.value),
    preliminaryFrom: firstPreliminary >= 0 ? firstPreliminary : null,
    problems,
  };
}

// ---------------------------------------------------------------------------
// Suggestions from a report
// ---------------------------------------------------------------------------

/** A passage of a filing section, anchored the way a kept passage is (lib/filings/anchor.ts). */
export interface CitedPassage {
  sectionId: string;
  quote: string;
  prefix: string;
  suffix: string;
  /** Where the quote starts in the section's text. */
  offset: number;
}

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A phrase as a pattern that matches it as whole words, ignoring capitals and how the words are spaced. */
export function phrasePattern(phrase: string): RegExp {
  const words = phrase.trim().split(/\s+/).map(escape).join("\\s+");
  return new RegExp(`(?<![A-Za-z0-9])${words}(?![A-Za-z0-9])`, "gi");
}

function placesOfPhrase(text: string, phrase: string): { start: number; end: number }[] {
  if (!phrase.trim()) return [];
  return [...text.matchAll(phrasePattern(phrase))].map((match) => ({ start: match.index ?? 0, end: (match.index ?? 0) + match[0].length }));
}

/**
 * Every place a text uses one of an input's words, in order, as whole words,
 * leaving out any inside an excluded phrase. Where two of its words overlap,
 * "polyvinyl chloride" and "chloride" say, they are one mention.
 */
export function mentionsOf(text: string, words: string[], exclude: string[] = []): { start: number; end: number }[] {
  const excluded = exclude.flatMap((phrase) => placesOfPhrase(text, phrase));
  const found = words
    .flatMap((word) => placesOfPhrase(text, word))
    .filter((place) => !excluded.some((range) => place.start < range.end && range.start < place.end))
    .sort((a, b) => a.start - b.start || b.end - a.end);
  const mentions: { start: number; end: number }[] = [];
  for (const place of found) if (!mentions.length || place.start >= mentions[mentions.length - 1].end) mentions.push(place);
  return mentions;
}

/** Whether a passage uses a word as a word, ignoring capitals: "steel" is in "suppliers of steel", not in "steelworks". */
export function names(passage: string, word: string): boolean {
  return mentionsOf(passage, [word]).length > 0;
}

/**
 * Where the sentence holding a position starts and ends. A paragraph is one line
 * of section text, so a sentence never runs past one. A sentence ends at a full
 * stop, question or exclamation mark followed by a capital; "PepsiCo, Inc. is"
 * stays one sentence. A sentence longer than `max` characters is cut to the words
 * around the position, so a table flattened into one line is not kept whole.
 */
export function sentenceAround(text: string, at: number, max = 400): { start: number; end: number } {
  const lineStart = text.lastIndexOf("\n", Math.max(0, at - 1)) + 1;
  const lineBreak = text.indexOf("\n", at);
  const lineEnd = lineBreak < 0 ? text.length : lineBreak;

  let start = lineStart;
  for (const stop of text.slice(lineStart, at).matchAll(/[.!?]["”’)]?\s+(?=[A-Z"“(])/g)) start = lineStart + (stop.index ?? 0) + stop[0].length;
  const next = /[.!?]["”’)]?(?=\s+[A-Z"“(]|\s*$)/.exec(text.slice(at, lineEnd));
  let end = next ? at + next.index + next[0].length : lineEnd;

  while (start < end && /\s/.test(text[start])) start += 1;
  while (end > start && /\s/.test(text[end - 1])) end -= 1;
  if (end - start <= max) return { start, end };

  let from = Math.max(start, at - Math.floor(max / 2));
  let to = Math.min(end, from + max);
  if (from > start) {
    const space = text.indexOf(" ", from);
    if (space >= 0 && space < at) from = space + 1;
  }
  if (to < end) {
    const space = text.lastIndexOf(" ", to);
    if (space > at) to = space;
  }
  return { start: from, end: to };
}

export interface InputSuggestion {
  seriesId: string;
  /** Every mention in the sections read. */
  count: number;
  /** The first few sentences holding a mention, in the order they appear. */
  sentences: CitedPassage[];
}

/**
 * Words that say a sentence is about buying something rather than only naming it.
 * Atkore's report mentions steel a dozen times before "Our primary suppliers of
 * steel are…", and showing the first three mentions would have hidden the one
 * that shows it buys steel.
 */
export const BUYING = /\b(?:raw materials?|suppliers?|supplies|supply|purchas\w*|buy|buys|buying|bought|sourc\w*|procur\w*|input costs?|commodit\w*|costs? of)\b/i;

/**
 * The library's inputs a report mentions, most mentioned first, each with a few
 * sentences that mention it: those using words about buying first, then the rest,
 * each group in the order the report has them. A count is description, and the
 * order only brings forward sentences worth reading first; which mentions are
 * purchases is the learner's call.
 */
export function suggestInputs(
  sections: { id: string; text: string }[],
  library: Pick<LibrarySeries, "id" | "words" | "exclude">[],
  perInput = 3,
): InputSuggestion[] {
  const suggestions: InputSuggestion[] = [];
  for (const series of library) {
    let count = 0;
    const found: { passage: CitedPassage; buying: boolean }[] = [];
    const seen = new Set<string>();
    for (const section of sections) {
      for (const mention of mentionsOf(section.text, series.words, series.exclude)) {
        count += 1;
        const { start, end } = sentenceAround(section.text, mention.start);
        const key = `${section.id}:${start}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const passage = { sectionId: section.id, ...anchorFor(section.text, start, end) };
        found.push({ passage, buying: BUYING.test(passage.quote) });
      }
    }
    const sentences = [...found.filter((entry) => entry.buying), ...found.filter((entry) => !entry.buying)]
      .slice(0, perInput)
      .map((entry) => entry.passage);
    if (count) suggestions.push({ seriesId: series.id, count, sentences });
  }
  return suggestions.sort((a, b) => b.count - a.count);
}
