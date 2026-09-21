/**
 * Keeping a passage so it can be found again.
 *
 * A kept passage stores more than its position, and the reason is the lesson
 * Hypothesis learned annotating the web (engineering post, 2013): a position on
 * its own breaks the moment the text around it shifts. Here the document never
 * changes — a filed 10-K is fixed — but the text Studio extracts from it can,
 * whenever the extractor is improved. A position that silently pointed at the
 * wrong paragraph after that would attach a learner's note to something they
 * never read, which is worse than admitting the passage has moved.
 *
 * So each passage keeps the exact quote, up to 32 characters either side, and
 * its offset, and is re-found by four strategies in order of confidence:
 *
 * 1. **position** — the quote is still exactly where it was;
 * 2. **context** — the quote with its surrounding text is somewhere else in the
 *    section, which is what an extractor change usually produces;
 * 3. **quote** — the quote alone, nearest to where it was, for a passage whose
 *    surroundings changed;
 * 4. **loose** — the quote ignoring case and spacing, for extraction that
 *    re-flowed whitespace.
 *
 * If none finds it, the answer is "not found", stated. There is no fuzzier
 * fifth strategy: past this point a match is a guess about what the learner
 * meant, and a guess shown with their note beside it reads as a fact.
 */

import { queryPattern } from "./find";

export const CONTEXT_CHARS = 32;

export type PassageAnchor = {
  quote: string;
  prefix: string;
  suffix: string;
  /** Offset of the quote in the section text when it was kept. */
  offset: number;
};

export type LocateStrategy = "position" | "context" | "quote" | "loose";

export type Located = { start: number; end: number; strategy: LocateStrategy };

/**
 * The anchor for a range of a section's text.
 *
 * Whitespace at either edge is left out of the quote. A selection dragged a
 * little wide picks up the space or line break beside it, and a quote that
 * begins with one depends on exactly how the extractor spaced the text — the
 * one thing the anchoring must not depend on. Measured on Atkore's 10-K: a
 * sentence kept with a leading line break could be found again only by ignoring
 * spacing, where the same sentence without it was found exactly.
 */
export function anchorFor(text: string, start: number, end: number): PassageAnchor {
  let from = Math.max(0, Math.min(start, text.length));
  let to = Math.max(from, Math.min(end, text.length));
  while (from < to && /\s/.test(text[from])) from += 1;
  while (to > from && /\s/.test(text[to - 1])) to -= 1;
  return {
    quote: text.slice(from, to),
    prefix: text.slice(Math.max(0, from - CONTEXT_CHARS), from),
    suffix: text.slice(to, to + CONTEXT_CHARS),
    offset: from,
  };
}

/**
 * The same anchor, built from one paragraph and the text either side of it.
 *
 * A page of the reader holds only the paragraphs it shows, each sent with
 * `CONTEXT_CHARS` of the section before and after it. That is exactly enough
 * to produce what `anchorFor` would over the whole section, so a passage kept
 * from the page and one computed on the server are the same anchor — which the
 * tests check rather than assume.
 */
export function anchorFromParagraph(
  paragraph: { start: number; text: string; before: string; after: string },
  from: number,
  to: number,
): PassageAnchor {
  const joined = paragraph.before + paragraph.text + paragraph.after;
  const shift = paragraph.before.length;
  const clamp = (value: number) => Math.max(0, Math.min(value, paragraph.text.length));
  const local = anchorFor(joined, shift + clamp(from), shift + clamp(to));
  return { ...local, offset: paragraph.start + (local.offset - shift) };
}

/** Every index at which `needle` occurs exactly. */
function occurrences(haystack: string, needle: string): number[] {
  const out: number[] = [];
  if (!needle) return out;
  let at = haystack.indexOf(needle);
  while (at !== -1) {
    out.push(at);
    at = haystack.indexOf(needle, at + 1);
  }
  return out;
}

const nearest = (candidates: number[], target: number): number =>
  candidates.reduce((best, next) => (Math.abs(next - target) < Math.abs(best - target) ? next : best));

export function locate(text: string, anchor: PassageAnchor): Located | null {
  const { quote, prefix, suffix, offset } = anchor;
  if (!quote.trim()) return null;

  if (text.slice(offset, offset + quote.length) === quote) {
    return { start: offset, end: offset + quote.length, strategy: "position" };
  }

  const withContext = occurrences(text, prefix + quote + suffix);
  if (withContext.length) {
    const start = nearest(withContext, offset - prefix.length) + prefix.length;
    return { start, end: start + quote.length, strategy: "context" };
  }

  const bare = occurrences(text, quote);
  if (bare.length) {
    const start = nearest(bare, offset);
    return { start, end: start + quote.length, strategy: "quote" };
  }

  // Loose: the quote's words in order, any case, any spacing between them.
  const pattern = queryPattern(quote);
  const loose: { start: number; end: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    loose.push({ start: match.index, end: match.index + match[0].length });
    if (match[0].length === 0) pattern.lastIndex += 1;
  }
  if (loose.length) {
    const best = loose.reduce((a, b) => (Math.abs(b.start - offset) < Math.abs(a.start - offset) ? b : a));
    return { ...best, strategy: "loose" };
  }

  return null;
}
