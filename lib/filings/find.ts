/**
 * Finding a phrase inside one filing, and saying where it is.
 *
 * EDGAR's full-text search finds the filing that mentions "PVC resin". It does
 * not find the paragraph, so until this existed a learner who searched there
 * still had to open a four-hundred-thousand-character document and hunt. This
 * does the last step: every occurrence in the sections the reader shows, with
 * the page it is on and enough text either side to recognise it.
 *
 * Matching ignores case and treats any run of spaces or line breaks as one
 * space. Filers break lines and double-space inconsistently, and a learner
 * typing "PVC resin" should not miss "PVC\nresin". It does not stem, guess
 * synonyms or rank: a search that returns "resins" for "resin" can be argued
 * for, but one that decides which mention matters most is making the reading
 * decision the learner is supposed to make.
 */

import type { FilingDocument } from "./document";
import type { ExtractedSection } from "./sections";
import { pageForOffset, sectionPages } from "./pages";

/** Shorter than this and a query matches nearly everything; longer and it is a paste. */
export const MIN_QUERY = 2;
export const MAX_QUERY = 200;
/**
 * Characters shown either side of a match: about eight words, enough to
 * recognise a passage. At ninety, each hit ran to two lines and eight of them
 * ("steel" in Atkore's 10-K) took the results page to 1.65 screens at 1440.
 */
const SNIPPET = 45;
/** More hits than this are counted but not listed; a list that long is not a finding. */
export const MAX_LISTED = 40;

export type FindHit = {
  sectionId: ExtractedSection["id"];
  sectionLabel: string;
  /** Offset of the match in the section text, the same scale pages and anchors use. */
  offset: number;
  length: number;
  page: number;
  before: string;
  match: string;
  after: string;
};

export type FindResult =
  | { ok: true; query: string; hits: FindHit[]; total: number }
  | { ok: false; reason: string };

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The query as a pattern: literal words, any whitespace between them. */
export function queryPattern(query: string): RegExp {
  const words = query.trim().split(/\s+/).map(escape);
  return new RegExp(words.join("\\s+"), "gi");
}

/** Trim a snippet edge back to a word boundary so it does not start mid-word. */
const toWord = (text: string, fromStart: boolean) => {
  if (fromStart) {
    const space = text.indexOf(" ");
    return space > 0 && space < 20 ? text.slice(space + 1) : text;
  }
  const space = text.lastIndexOf(" ");
  return space > text.length - 20 ? text.slice(0, space) : text;
};

export function findInSections(sections: ExtractedSection[], rawQuery: string, document: Pick<FilingDocument, "blocks">): FindResult {
  const query = rawQuery.trim().replace(/\s+/g, " ");
  if (query.length < MIN_QUERY) return { ok: false, reason: `Type at least ${MIN_QUERY} characters to search.` };
  if (query.length > MAX_QUERY) return { ok: false, reason: `Search for a phrase of up to ${MAX_QUERY} characters.` };

  const hits: FindHit[] = [];
  let total = 0;

  for (const section of sections) {
    const pages = sectionPages(section, document);
    const text = shownText(section, document);
    const pattern = queryPattern(query);
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      total += 1;
      if (hits.length < MAX_LISTED) {
        const offset = match.index;
        const length = match[0].length;
        const before = text.slice(Math.max(0, offset - SNIPPET), offset).replace(/\s+/g, " ");
        const after = text.slice(offset + length, offset + length + SNIPPET).replace(/\s+/g, " ");
        hits.push({
          sectionId: section.id,
          sectionLabel: section.label,
          offset,
          length,
          page: pageForOffset(pages, offset),
          before: offset > SNIPPET ? toWord(before, true) : before,
          match: match[0].replace(/\s+/g, " "),
          // Trimmed back to a whole word only where the snippet cut one.
          after: offset + length + SNIPPET < text.length ? toWord(after, false) : after,
        });
      }
      // A zero-length match cannot happen with these patterns, but a loop that
      // could spin forever on one should not rely on that.
      if (match[0].length === 0) pattern.lastIndex += 1;
    }
  }

  return { ok: true, query, hits, total };
}

/**
 * The section's text as the reader shows it: page numbers and "Table of
 * Contents" lines, which are never drawn, become spaces, so they are neither
 * found nor quoted beside a hit, and every offset stays where it was.
 */
function shownText(section: Pick<ExtractedSection, "text" | "blocks">, document: Pick<FilingDocument, "blocks">): string {
  const pieces: string[] = [];
  let at = 0;
  for (const place of section.blocks) {
    const block = document.blocks[place.index];
    if (block.kind !== "text" || !block.furniture) continue;
    pieces.push(section.text.slice(at, place.start), " ".repeat(place.end - place.start));
    at = place.end;
  }
  pieces.push(section.text.slice(at));
  return pieces.join("");
}
