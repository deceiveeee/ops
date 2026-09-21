/**
 * The competitors a company's own annual report names, as suggestions a learner confirms.
 *
 * No free database lists a company's competitors. Most annual reports name some,
 * in their Business section's words about competition, but each writes them
 * differently: Atkore by segment, one line each, after "listed below:"; Caterpillar
 * in long lists of names ending "Co., Ltd." and "AG"; Delta as airline names with
 * no "Inc." at all; and Apple, Walmart and Netflix name none (research, 2026-09-14,
 * in docs/implementation-notes/studio-research-workspace-progress.md). So this reads
 * names out of those passages as candidates, and the learner decides, with the
 * passage beside each.
 *
 * A candidate is offered only when it is plainly a company: its name ends in a
 * company word ("Inc.", "plc", "AG"), or it is two or more words and exactly the
 * name of one company in the SEC's ticker file once words like "Inc." and "Group"
 * are set aside. A segment heading, a country or "Table of Contents" is not
 * offered. Nothing is matched on being close: "Alaska Airlines" is not "Alaska Air
 * Group", and a learner can add a company the suggestions missed by its ticker.
 *
 * Nothing here touches the network.
 */

import { anchorFor, type PassageAnchor } from "./anchor";

/** A passage of one section, anchored the way a kept passage is. */
export type SectionPassage = PassageAnchor & { sectionId: string };

/** A company in the SEC's ticker file. */
export type Filer = { cik: string; ticker: string; name: string };

/** The character references a filing's extracted text can still carry, such as "Nestl&#233;". */
export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

/** "competitor", "competes", "competition" — but not "competitive", which describes rather than names. */
const COMPETITION = /\bcompet(?:e|es|ed|ing|itor|itors|ition)\b/i;
/** A sentence that introduces a list rather than holding it: "are listed below:". */
const INTRODUCES_LIST = /\b(?:below|following)\s*:/i;
/** A line that carries a list on: a short label and a colon with names after it, or a bullet. */
const LIST_LINE = /^\s*(?:[•·▪*\-–—]\s+\S|[^:.\n]{1,60}:\s*\S)/;
/** Where a sentence ends: a stop, then a capital. "PepsiCo, Inc. is" stays one sentence. */
const SENTENCE_END = /[.!?]["”’)]?\s+(?=[\p{Lu}"“(])/gu;
const MAX_PASSAGE = 1_500;

/**
 * Where a section's text is about competition: each sentence that mentions
 * competitors or competing. Where one introduces a list, the passage runs to the
 * end of its paragraph, and when the paragraph ends on the colon, on through the
 * lines after it that carry the list.
 */
export function competitionPassages(text: string): { start: number; end: number }[] {
  const lines = text.split("\n");
  const starts: number[] = [];
  let offset = 0;
  for (const line of lines) {
    starts.push(offset);
    offset += line.length + 1;
  }

  const passages: { start: number; end: number }[] = [];
  const add = (from: number, to: number) => {
    let start = from;
    let end = to;
    while (start < end && /\s/.test(text[start])) start += 1;
    while (end > start && /\s/.test(text[end - 1])) end -= 1;
    if (end <= start) return;
    const last = passages[passages.length - 1];
    if (last && start <= last.end) last.end = Math.max(last.end, end);
    else passages.push({ start, end });
  };

  lines.forEach((line, index) => {
    const lineStart = starts[index];
    const lineEnd = lineStart + line.length;
    let sentenceStart = lineStart;
    const ends = [...line.matchAll(SENTENCE_END)].map((match) => lineStart + (match.index ?? 0) + match[0].length);
    for (const next of [...ends, lineEnd]) {
      const sentence = text.slice(sentenceStart, next);
      // A heading such as "Competition" names the subject and nothing about it, so it is not a passage.
      if (COMPETITION.test(sentence) && sentence.trim().split(/\s+/).length >= 4) {
        let end = next;
        if (INTRODUCES_LIST.test(sentence) && lineEnd - sentenceStart <= MAX_PASSAGE) {
          end = lineEnd;
          if (/:\s*$/.test(text.slice(sentenceStart, lineEnd))) {
            for (let following = index + 1; following < lines.length && LIST_LINE.test(lines[following]); following++) {
              const followingEnd = starts[following] + lines[following].length;
              if (followingEnd - sentenceStart > MAX_PASSAGE) break;
              end = followingEnd;
            }
          }
        }
        add(sentenceStart, end);
      }
      sentenceStart = next;
    }
  });
  return passages;
}

/** Words that end a company's name. Compared lower-case, without dots or a trailing comma. */
const COMPANY_WORDS = new Set([
  "inc", "incorporated", "corp", "corporation", "co", "company", "companies", "ltd", "limited", "plc", "llc", "lp", "llp",
  "nv", "sa", "sab", "ag", "se", "spa", "ab", "as", "asa", "oyj", "gmbh", "kgaa", "bv", "pte", "pty", "holdings", "group",
]);
/** Company words usually written with a full stop, so a stop after one does not end the name. */
const ABBREVIATED = new Set(["inc", "corp", "co", "ltd", "llc", "lp", "llp", "nv", "sa", "sab", "bv", "spa", "pty", "pte"]);
/** Joining words a name can carry between capitalised words: "Bank of America", "Deere & Company". */
const CONNECTORS = new Set(["of", "de", "du", "la", "del", "der", "van", "von", "&"]);
/** Capitalised words that start sentences and lists, not names. */
const STARTERS = new Set([
  "the", "our", "we", "in", "other", "others", "examples", "example", "principal", "many", "some", "certain", "each",
  "these", "those", "this", "that", "also", "additionally", "such", "global", "domestic", "international", "competition",
  "competitors", "competitor", "main", "major", "primary", "significant", "key", "including", "include", "includes", "as",
  "for", "an", "a", "and", "or", "both", "while", "although", "however", "among", "with", "from", "by", "on", "at", "to",
  "its", "their", "most", "several", "various", "all", "any", "one", "two", "three", "part", "formerly",
]);

const plain = (token: string) => token.toLowerCase().replace(/\./g, "").replace(/,$/, "");
/** "Inc." and "N.V." keep their stop; "Prysmian." at the end of a sentence does not. */
const abbreviated = (token: string) => ABBREVIATED.has(plain(token)) || /\.\p{L}/u.test(token);

/** Whether a name ends in a company word and is more than that word alone. */
export function hasCompanyWord(name: string): boolean {
  const words = name.split(/\s+/).filter((word) => word !== ",");
  return words.length >= 2 && COMPANY_WORDS.has(plain(words[words.length - 1]));
}

/**
 * The runs of capitalised words in a passage, as names. A company word after a
 * comma stays with the name before it ("Zekelman Industries, Inc.", "Co., Ltd."),
 * and so does a lower-case one ("Aggreko plc"). A name may begin with a small
 * letter before a capital, as "nVent" does. A line break, or a full stop that is
 * not part of an abbreviation, ends a name.
 */
export function namesIn(passage: string): string[] {
  const tokens = [...decodeEntities(passage).matchAll(/[\p{L}\p{N}][\p{L}\p{N}&'’./-]*|&|[,;:()\n]/gu)].map((match) => match[0]);
  const names: string[] = [];
  let current: string[] = [];

  const close = () => {
    while (current.length && (STARTERS.has(plain(current[0])) || CONNECTORS.has(current[0].toLowerCase()) || current[0] === ",")) current.shift();
    while (current.length && (CONNECTORS.has(current[current.length - 1].toLowerCase()) || current[current.length - 1] === ",")) current.pop();
    if (current.length) {
      const last = current[current.length - 1];
      if (last.endsWith(".") && !abbreviated(last)) current[current.length - 1] = last.slice(0, -1);
      names.push(current.join(" ").replace(/ ,/g, ","));
    }
    current = [];
  };

  tokens.forEach((token, index) => {
    const next = tokens[index + 1];
    if (token === ",") {
      if (current.length && next && COMPANY_WORDS.has(plain(next))) current.push(",");
      else close();
      return;
    }
    const capitalised = (/^[\p{Lu}\p{N}]/u.test(token) && !/^\p{N}+$/u.test(token)) || /^\p{Ll}\p{Lu}/u.test(token);
    if ((current.length && COMPANY_WORDS.has(plain(token))) || capitalised) {
      current.push(token);
      if (token.endsWith(".") && !abbreviated(token)) close();
      return;
    }
    if (current.length && CONNECTORS.has(token.toLowerCase()) && next && /^\p{Lu}/u.test(next)) {
      current.push(token);
      return;
    }
    close();
  });
  close();
  return names;
}

/**
 * A company's name with what varies between listings set aside: capitals, dots
 * and commas, a leading "The", a tag like "/DE/" or "/ADR", "&" spelled out, and
 * company words at the end. "Deere & Company" and "DEERE & CO" both become
 * "DEERE AND".
 */
export function normalizeCompanyName(name: string): string {
  const words = decodeEntities(name)
    .toUpperCase()
    .replace(/\s*\/[A-Z]{2,}\/?/g, " ")
    .replace(/\./g, "")
    .replace(/&/g, " AND ")
    .replace(/[,'’()]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words[0] === "THE") words.shift();
  while (words.length > 1 && COMPANY_WORDS.has(words[words.length - 1].toLowerCase())) words.pop();
  return words.join(" ");
}

/** EDGAR's ticker file as a lookup from normalised name to the companies listed under it, one entry per company. */
export function filerIndex(json: unknown): Map<string, Filer[]> {
  const index = new Map<string, Filer[]>();
  if (!json || typeof json !== "object") return index;
  for (const value of Object.values(json as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const row = value as { cik_str?: unknown; ticker?: unknown; title?: unknown };
    if (typeof row.ticker !== "string" || typeof row.title !== "string" || row.cik_str === undefined) continue;
    const cik = String(row.cik_str).padStart(10, "0");
    const key = normalizeCompanyName(row.title);
    const listed = index.get(key) ?? [];
    if (!listed.some((filer) => filer.cik === cik)) listed.push({ cik, ticker: row.ticker.toUpperCase(), name: row.title });
    index.set(key, listed);
  }
  return index;
}

export interface CompetitorSuggestion {
  /** As the report writes it. */
  name: string;
  /** The passage naming it. */
  passage: SectionPassage;
  /** The one company in the SEC's ticker file under exactly this name, or null. */
  filer: Filer | null;
  /** More than one company in the ticker file goes by this name, so none is chosen. */
  ambiguous: boolean;
}

/**
 * The competition passages of one section, and the companies named in them,
 * each once, in the order the report names them, leaving out the company itself.
 */
export function suggestCompetitors(
  section: { id: string; text: string },
  filers: Map<string, Filer[]>,
  own: { cik: string; name: string },
): { passages: SectionPassage[]; suggestions: CompetitorSuggestion[] } {
  const ownName = normalizeCompanyName(own.name);
  const passages = competitionPassages(section.text).map(({ start, end }) => ({ sectionId: section.id, ...anchorFor(section.text, start, end) }));
  const seen = new Set<string>();
  const suggestions: CompetitorSuggestion[] = [];
  for (const passage of passages) {
    for (const name of namesIn(passage.quote)) {
      const key = normalizeCompanyName(name);
      if (!key || seen.has(key) || key === ownName) continue;
      const matches = filers.get(key) ?? [];
      if (matches.some((filer) => Number(filer.cik) === Number(own.cik))) continue;
      const filer = matches.length === 1 ? matches[0] : null;
      const plainlyCompany = hasCompanyWord(name) || (filer !== null && name.trim().split(/\s+/).length >= 2);
      if (!plainlyCompany) continue;
      seen.add(key);
      suggestions.push({ name, passage, filer, ambiguous: matches.length > 1 });
    }
  }
  return { passages, suggestions };
}
