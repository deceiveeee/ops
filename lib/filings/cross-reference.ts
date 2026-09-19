import { ENDS_IN_PAGES, type FilingDocument } from "./document";

/**
 * Reading a report through its cross-reference index.
 *
 * Most reports head each section "Item 1A. Risk Factors", and that is how the
 * reader finds them. Some head sections in their own words instead and give
 * the Items only in an index at the back: GE's "Item 1A. Risk Factors 24-31",
 * Intel's "Item 1A. Risk Factors Pages 37-51", McDonald's "Item 1A Risk
 * Factors Page 27". Their pages carry printed page numbers, which the document
 * reader finds (`FilingDocument.pages`), so an index entry names a run of the
 * document's own blocks. A quarterly report's contents list serves the same
 * way when a section has no Item heading at all: Netflix's statements follow
 * its contents directly, under "Consolidated Statements of Operations".
 */

export type IndexEntry = {
  /** The Item number, lower-cased: "1a". */
  item: string;
  /** Its title as the index gives it. */
  title: string;
  /** Printed pages, as inclusive ranges in the order given. */
  ranges: [number, number][];
  /** Titles of the lines under it, such as Intel's "Available information", which head parts of it. */
  parts: string[];
  /** Whether the index says where the Item ends as well as where it starts. */
  explicit: boolean;
  /** The line of the document's text it came from. */
  line: number;
};

const ITEM_LINE = /^\s*item\s*(\d{1,2}[a-f]?)\s*[.:\-–—]?\s*(.*)$/i;
/** Page references closing an index line: "24-31", "Pages 37-51", "Page 27", "4-7, 9-10, 71-73", "Page 52 (a)". */
const PAGES_AT_END = /(?:^|\s)(?:pages?\s+)?(\d{1,3}(?:\s*[-–]\s*\d{1,3})?(?:\s*,\s+\d{1,3}(?:\s*[-–]\s*\d{1,3})?)*)\s*(?:\([a-z]\))?$/i;
/** An index entry and the lines under it, such as Intel's "Results of operations Pages 18-29", are short. */
const INDEX_LINE_MAX = 160;
/** Lines under an Item that still belong to its entry. */
const SUB_LINES_MAX = 6;
/** Entries with pages that must stand near one another to be an index rather than stray headings. */
const CLUSTER_MIN = 4;
const CLUSTER_SPAN = 60;
/** Letters in a title long enough that a heading carrying it is that Item's, wherever it falls. */
const DISTINCT_TITLE = 11;

function rangesOf(pages: string): [number, number][] {
  return pages.split(/\s*,\s+/).map((part) => {
    const [from, to] = part.split(/\s*[-–]\s*/).map(Number);
    return [from, to ?? from] as [number, number];
  }).filter(([from, to]) => from > 0 && to >= from);
}

/** Every Item line in the text that gives pages, with the lines under it. */
export function readIndex(text: string): IndexEntry[] {
  const lines = text.split("\n");
  const found: IndexEntry[] = [];
  lines.forEach((line, index) => {
    const match = line.match(ITEM_LINE);
    if (!match || line.length > INDEX_LINE_MAX + 60) return;
    const parts = [match[2].trim()];
    for (let next = index + 1; next < lines.length && next <= index + SUB_LINES_MAX; next += 1) {
      const sub = lines[next].trim();
      if (!sub || ITEM_LINE.test(sub) || /^part\s+[ivx]+\b/i.test(sub) || /^signatures?\b/i.test(sub) || sub.length > INDEX_LINE_MAX) break;
      parts.push(sub);
    }
    // Pages end the Item's own line; lines under it count only while they give pages too.
    const ranges: [number, number][] = [];
    const named: string[] = [];
    let title = "";
    parts.forEach((part, at) => {
      const pages = part.match(PAGES_AT_END);
      const words = (pages ? part.slice(0, pages.index) : part).replace(/[:\s]+$/, "").trim();
      if (!title && words && (at === 0 || !ranges.length)) title = words;
      else if (words && pages) named.push(words);
      if (pages) ranges.push(...rangesOf(pages[1]));
    });
    if (!ranges.length || !title) return;
    found.push({ item: match[1].toLowerCase(), title, ranges, parts: named, explicit: ranges.some(([from, to]) => to > from), line: index });
  });
  // An index is a run of entries; a lone Item heading with a number after it is not one.
  return found.filter((entry) => found.filter((other) => Math.abs(other.line - entry.line) <= CLUSTER_SPAN).length >= CLUSTER_MIN);
}

const letters = (text: string) => text.toLowerCase().replace(/[^a-z]/g, "");

/**
 * The pages each entry covers. Where the index gives only where an entry
 * starts, as McDonald's does ("Page 27"), it runs to where the next one starts.
 */
type Coverage = {
  /** The pages to read, the last one shared with the next entry where only a start is given. */
  ranges: [number, number][];
  /** Whether only a start was given, so it runs until the next entry's heading. */
  open: boolean;
  /** The pages it certainly fills from their top: all but that shared last one. */
  fills: [number, number][];
  /** How many pages its longest given range spans beyond its first, which decides who owns a page several start on. */
  span: number;
};

function coverage(entries: readonly IndexEntry[]): Map<IndexEntry, Coverage> {
  return new Map(entries.map((entry): [IndexEntry, Coverage] => {
    const span = Math.max(...entry.ranges.map(([from, to]) => to - from));
    if (entry.explicit) {
      const ranges = mergeRanges(entry.ranges);
      return [entry, { ranges, open: false, fills: ranges, span }];
    }
    // Netflix lists each statement under its Item 1 with its own page; those
    // are the Item's pages, and it runs to where anything else starts.
    const from = Math.min(...entry.ranges.map(([start]) => start));
    const next = Math.min(...entries.filter((other) => other !== entry).flatMap((other) => other.ranges.map(([start]) => start)).filter((start) => start > from));
    if (!Number.isFinite(next)) return [entry, { ranges: [[from, from]], open: false, fills: [[from, from]], span }];
    return [entry, { ranges: [[from, next]], open: true, fills: [[from, next - 1]], span }];
  }));
}

/**
 * The blocks an index entry covers, in document order, or null when its pages
 * cannot be placed.
 *
 * - Each run of pages starts at the section's own heading on its first page,
 *   where it has one: GE's "RISK FACTORS. The following discussion…" opens its
 *   paragraph. Without one, it starts at the page's top, or a page later where
 *   that top goes on from the page before: Intel gives its business as starting
 *   on page 2, whose top ends a list of risks, and it opens on page 3.
 * - A first page another section also covers, with no heading of this one on
 *   it, is left out rather than shown under the wrong name: GE gives its
 *   market risk as page 13, in the middle of its management's discussion.
 * - A run stops at another Item's heading: on its last page where the index
 *   says where it ends, and anywhere where it gives only a start.
 */
export function sectionFromIndex(
  document: Pick<FilingDocument, "blocks" | "pages">,
  entries: readonly IndexEntry[],
  entry: IndexEntry,
  titles: readonly string[] = [],
  parts: readonly string[] = [],
): number[] | null {
  const { pages, blocks } = document;
  if (pages.length < 2) return null;
  const covered = coverage(entries);
  const own = covered.get(entry);
  if (!own) return null;
  const others = entries.filter((other) => letters(other.title) !== letters(entry.title));
  /** Blocks to a printed page, at the median, for finding a page whose start is not marked. */
  const perPage = [...pages.slice(1).map((found, i) => found.block - pages[i].block)].sort((a, b) => a - b)[Math.floor((pages.length - 1) / 2)];

  /** Where a page starts: just after the footer of the page before it. */
  const startOf = (page: number): number | null => {
    let footer = -1;
    for (const found of pages) {
      if (found.number >= page) break;
      footer = found.block;
    }
    return footer === -1 ? null : footer + 1;
  };
  /** Where a page ends: its footer, or the next footer found after it. */
  const endOf = (page: number): number | null => pages.find((found) => found.number >= page)?.block ?? null;

  /**
   * A heading naming one of `names`: a block that starts with the name and is
   * short, bold or opens in capitals, or a short line that contains it, as
   * McDonald's "FINANCING AND MARKET RISK". Never a contents line, which ends
   * in its page number.
   */
  const headingIn = (from: number, to: number, names: readonly string[]): number | null => {
    const keys = names.map(letters).filter((key) => key.length >= 8).map((key) => key.slice(0, 24));
    if (!keys.length) return null;
    for (let index = Math.max(0, from); index <= to; index += 1) {
      const block = blocks[index];
      // A table's first row can head it: McDonald's "Financial Statements and
      // Supplementary Data" tops its index to the statements.
      const line = block.kind === "table" ? block.text.split("\n")[0] : block.text;
      if ((block.kind === "text" && block.furniture) || ENDS_IN_PAGES.test(line)) continue;
      const text = letters(line);
      const bold = block.kind === "text" ? block.bold : 0;
      const opens = keys.some((key) => text.startsWith(key)) && (line.length <= 200 || bold >= 0.5 || /^[^a-z]{8}/.test(line));
      const names = line.length <= 100 && keys.some((key) => key.length >= 10 && text.includes(key));
      if (opens || names) return index;
    }
    return null;
  };

  /**
   * Whether this page's top belongs to another section: one that runs on into
   * it from an earlier page, or one starting on it that spans at least as many
   * pages. GE's properties start on the page its business does, but its
   * business runs four pages and so owns the top; five of Intel's quarterly
   * Items start on page 41, and none can claim it without its heading.
   */
  const shared = (page: number, span: number) =>
    others.some((other) => {
      const theirs = covered.get(other);
      if (!theirs) return false;
      if (theirs.fills.some(([from, to]) => from < page && page <= to)) return true;
      return Math.min(...other.ranges.map(([start]) => start)) === page && theirs.span >= span;
    });

  /**
   * Whether a page opens partway through something: its first words go on from
   * the page before, in lower case or as another item of a list. Intel gives
   * its business as starting on page 2, whose top is the end of its list of
   * forward-looking risks.
   */
  const continues = (page: number): boolean => {
    const top = startOf(page);
    if (top === null) return false;
    for (let index = top; index < blocks.length; index += 1) {
      const block = blocks[index];
      if (block.kind === "text" && block.furniture) continue;
      return block.kind === "text" && /^([a-z]|[•·●◦▪■○–-]\s)/.test(block.text);
    }
    return false;
  };

  const chosen = new Set<number>();
  for (const [given, last] of own.ranges) {
    const end = endOf(last);
    if (end === null) continue;
    // A first page that opens partway through something else is not where this
    // section starts; with no heading of its own there, or of one of its parts,
    // it starts a page later.
    const named = (page: number) => headingIn(startOf(page) ?? 0, endOf(page) ?? end, [entry.title, ...entry.parts, ...titles, ...parts]) !== null;
    const first = given < last && continues(given) && !named(given) ? given + 1 : given;
    const firstEnd = endOf(first) ?? end;
    const top = startOf(first);
    // A first page whose start is not marked, before the first footer found, is
    // searched back a few pages' length for the heading, which must then be there.
    const searchFrom = top ?? firstEnd - perPage * 3;
    const theirs = top === null || shared(first, own.open ? 0 : last - first);
    // Where the page opens with another section, a heading of one of this
    // Item's parts shows where it begins.
    const heading = headingIn(searchFrom, firstEnd, [entry.title, ...entry.parts, ...titles]) ?? (theirs ? headingIn(searchFrom, firstEnd, parts) : null);
    if (heading === null && theirs) continue;
    const from = heading ?? (top as number);

    // Where it stops: the heading of an Item the index starts inside these
    // pages, or on the last page one with a title long enough to be sure of,
    // as GE's "LEGAL PROCEEDINGS." after its risk factors, which the index
    // places in the notes. A short title such as "Business" opens too many
    // ordinary paragraphs to end a section anywhere else.
    const lastTop = Math.max(from + 1, startOf(last) ?? from + 1);
    const stops = others.flatMap((other) => {
      // Where the other section starts, not a later part of it the index lists
      // again: GE gives its business at pages 9-10 too, inside its discussion.
      // One starting on this section's own first page ends it only where this
      // one is a single page, as Intel's quarterly Items on page 41 are. Where
      // the index says where this section ends, an Item that starts and ends
      // within its pages is a part of it, as properties can sit in a business.
      // An Item starting here ends it at its own heading or, from the page the
      // Item starts on, at the heading of a part the index lists under it:
      // Intel's Item 5 has no heading on page 41, but its "Rule 10b5-1 Trading
      // Arrangements" does, after the buybacks. Before that page a part's words
      // can head something else: JPMorgan's statements list "Consolidated
      // balance sheets" on page 95, and its discussion has "CONSOLIDATED
      // BALANCE SHEETS AND CASH FLOWS ANALYSIS" on page 15.
      const opening = Math.min(...other.ranges.map(([start]) => start));
      const theirEnd = Math.max(...other.ranges.map(([, to]) => to));
      const within = !own.open && theirEnd <= last;
      const starts = !within && ((opening > first && opening <= last) || (opening === first && own.span === 0));
      const at = starts
        ? [headingIn(from + 1, end, [other.title]), headingIn(Math.max(from + 1, startOf(opening) ?? from + 1), end, other.parts)]
            .filter((found): found is number => found !== null)
            .reduce<number | null>((least, found) => (least === null ? found : Math.min(least, found)), null)
        : letters(other.title).length >= DISTINCT_TITLE ? headingIn(lastTop, end, [other.title]) : null;
      return at === null ? [] : [at];
    });
    let to = stops.length ? Math.min(...stops) - 1 : end;
    // Where the next entry starts on the last page but its heading was not found, stop before that page.
    if (!stops.length && own.open) to = endOf(last - 1) ?? to;
    for (let index = from; index <= to; index += 1) chosen.add(index);
  }
  return chosen.size ? [...chosen].sort((a, b) => a - b) : null;
}

function mergeRanges(ranges: readonly [number, number][]): [number, number][] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [from, to] of sorted) {
    const last = merged[merged.length - 1];
    if (last && from <= last[1] + 1) last[1] = Math.max(last[1], to);
    else merged.push([from, to]);
  }
  return merged;
}

/** The index entry for a section: its Item number, a title that names it, and pages. */
export function entryFor(entries: readonly IndexEntry[], item: string, titles: readonly string[]): IndexEntry | null {
  const keys = titles.map(letters);
  const matching = entries.filter((entry) => entry.item === item && keys.some((key) => letters(entry.title).includes(key)));
  return matching.find((entry) => entry.explicit) ?? matching[matching.length - 1] ?? null;
}
