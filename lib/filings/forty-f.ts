import { ENDS_IN_PAGES, type FilingDocument } from "./document";
import type { FilingSectionId } from "./sections";

/**
 * A Canadian company's annual report on Form 40-F, read by its own headings.
 *
 * A 40-F has no Items. Its cover document carries the report as exhibits, or
 * holds it all: an annual information form in the order Canada's securities
 * rules set (corporate structure, the business, risk factors, dividends,
 * capital structure, the market for its securities, directors, legal
 * proceedings…), management's discussion and analysis, and the audited
 * statements. Shopify files them as EX-1.1, 1.3 and 1.2, Suncor as EX-99.1,
 * 99.3 and 99.2, Royal Bank puts its discussion and statements together in an
 * annual report, Canadian Natural puts nearly everything in the cover document.
 * So the parts are found by their headings, wherever they are filed.
 */

type Kind = "aif" | "mdna" | "statements";

/** Where each kind of part opens: its title, as a heading of its own. */
const OPENS: Record<Kind, RegExp> = {
  aif: /^(\d{4}\s+)?annual information form\b/i,
  mdna: /^management['’]?s discussion and analysis\b/i,
  statements: /^(consolidated financial statements\b|independent auditor['’]?s report\b|report of independent registered public accounting firm\b|management['’]?s (statement of )?responsibility for financial (reporting|statements)\b|statement of management['’]?s responsibility\b)/i,
};

/**
 * The headings that head the parts of an annual information form, the list
 * Canada's Form 51-102F2 sets. A section of the form runs to the next of them;
 * a heading not among them, such as Suncor's "Oil Sands", is part of the
 * section it falls in.
 */
const AIF_HEADINGS = [
  /^corporate structure\b/i, /^general development of (the |our )?business/i, /^(narrative )?description of (the |our |[\w'’&.\s]{1,40}['’]s? )?business/i,
  /^(the |our )?business$/i, /^risk factors\b/i, /^industry conditions\b/i, /^dividends\b/i, /^(description of )?capital structure\b/i,
  /^market for (the )?securities\b/i, /^escrowed securities\b/i, /^securities subject to/i, /^directors and (executive )?officers\b/i,
  /^promoters\b/i, /^legal proceedings\b/i, /^interests? of management\b/i, /^transfer agents?\b/i, /^material contracts\b/i,
  /^interests of experts\b/i, /^experts\b/i, /^audit committee\b/i, /^additional information\b/i, /^trademarks\b/i,
];

/** What each section of the form is headed. */
const SECTION_HEADINGS: Partial<Record<FilingSectionId, RegExp>> = {
  business: /^((narrative )?description of (the |our |[\w'’&.\s]{1,40}['’]s? )?business|(the |our )?business$)/i,
  "risk-factors": /^risk factors\b/i,
  market: /^market for (the )?securities\b/i,
  legal: /^legal proceedings\b/i,
};

/** How far into a document its title is looked for, past EDGAR's own lines naming the exhibit. */
const OPENING_BLOCKS = 15;

/** Market risk, where management's discussion gives it a heading of its own. */
const MARKET_RISK = /(market risk|quantitative and qualitative disclosures|financial instruments and risk management)/i;

const isFurniture = (document: Pick<FilingDocument, "blocks">, index: number) => {
  const block = document.blocks[index];
  return block.kind === "text" && block.furniture;
};

/** A heading: short, drawn as one, and not a line of a contents list, which gives a page at either end. */
function headingText(document: Pick<FilingDocument, "blocks">, index: number): string | null {
  const block = document.blocks[index];
  if (block.kind !== "text" || block.furniture || block.text.length > 120) return null;
  if (ENDS_IN_PAGES.test(block.text) || /^\d{1,3}\s/.test(block.text)) return null;
  const heading = block.bold >= 0.5 || !/[a-z]/.test(block.text) || block.text.split(/\s+/).length <= 12;
  return heading ? block.text.replace(/\s+/g, " ").trim() : null;
}

export type FortyFSection = { id: FilingSectionId; indexes: number[] };

/**
 * The sections of a 40-F's documents, joined as one, where `starts` gives the
 * block each document begins at.
 */
export function fortyFSections(document: Pick<FilingDocument, "blocks">, starts: readonly number[]): FortyFSection[] {
  const ends = [...starts.slice(1), document.blocks.length];
  // Each kind of part: every place one opens, running to the next part opening
  // in the same document or to its end. The longest of each kind is the one.
  const opened: { kind: Kind; from: number; doc: number }[] = [];
  starts.forEach((start, doc) => {
    // A document that opens with a part's title is that part from its start,
    // however its title is set: Royal Bank's is "ANNUAL", "INFORMATION" and
    // "FORM" on three lines of their own.
    const opening = document.blocks.slice(start, Math.min(ends[doc], start + OPENING_BLOCKS)).map((block) => block.text).join(" ");
    const kind = (Object.keys(OPENS) as Kind[]).find((candidate) => OPENS[candidate].test(opening.replace(/^.*?(?=annual information form|management['’]?s discussion|consolidated financial statements|management['’]?s (statement of )?responsibility|report of independent|independent auditor)/i, "")));
    if (kind) {
      // From its first line shown, past EDGAR's lines naming the exhibit.
      let from = start;
      while (from < ends[doc] - 1 && isFurniture(document, from)) from += 1;
      opened.push({ kind, from, doc });
    }
    for (let index = start; index < ends[doc]; index += 1) {
      const text = headingText(document, index);
      if (!text) continue;
      for (const candidate of Object.keys(OPENS) as Kind[]) if (OPENS[candidate].test(text)) opened.push({ kind: candidate, from: index, doc });
    }
  });
  const parts = new Map<Kind, { from: number; to: number }>();
  for (const part of opened) {
    const next = opened.find((other) => other.doc === part.doc && other.from > part.from && other.kind !== part.kind);
    const to = next ? next.from : ends[part.doc];
    const kept = parts.get(part.kind);
    if (!kept || to - part.from > kept.to - kept.from) parts.set(part.kind, { from: part.from, to });
  }

  const sections: FortyFSection[] = [];
  const range = (from: number, to: number) => Array.from({ length: to - from }, (_, i) => from + i);

  // The annual information form's sections, each to the next of the form's own headings.
  const aif = parts.get("aif");
  if (aif) {
    // A heading of the form never ends a sentence: Shopify's risk "Our business
    // could be harmed if we fail to manage our growth effectively." is set in
    // bold within its risk factors, and is not the form's "Business".
    const headings: { index: number; text: string }[] = [];
    for (let index = aif.from + 1; index < aif.to; index += 1) {
      const text = headingText(document, index);
      if (text && !/[.!?]$/.test(text) && AIF_HEADINGS.some((pattern) => pattern.test(text))) headings.push({ index, text });
    }
    for (const [id, pattern] of Object.entries(SECTION_HEADINGS) as [FilingSectionId, RegExp][]) {
      // The last heading of the kind before the next part of the form is the
      // section itself; earlier ones are the form's own contents, which give no pages.
      const found = headings.filter((heading) => pattern.test(heading.text));
      const start = found.find((heading, i) => {
        const next = headings[headings.indexOf(heading) + 1];
        return i === found.length - 1 || !next || next.index - heading.index > 3;
      });
      if (!start) continue;
      const next = headings.find((heading) => heading.index > start.index && !pattern.test(heading.text));
      sections.push({ id, indexes: range(start.index, next ? next.index : aif.to) });
    }
  }

  const mdna = parts.get("mdna");
  if (mdna) {
    sections.push({ id: "mdna", indexes: range(mdna.from, mdna.to) });
    // Market risk, where the discussion heads it: to the next heading drawn the same way.
    for (let index = mdna.from + 1; index < mdna.to; index += 1) {
      const text = headingText(document, index);
      if (!text || !MARKET_RISK.test(text) || text.length > 90) continue;
      const block = document.blocks[index];
      const capitals = !/[a-z]/.test(text);
      const bold = block.kind === "text" && block.bold >= 0.9;
      let end = mdna.to;
      for (let next = index + 1; next < mdna.to; next += 1) {
        const other = headingText(document, next);
        const otherBlock = document.blocks[next];
        if (other && other.length <= 90 && !/[a-z]/.test(other) === capitals && (otherBlock.kind === "text" && otherBlock.bold >= 0.9) === bold) {
          end = next;
          break;
        }
      }
      if (end - index > 1) sections.push({ id: "market-risk", indexes: range(index, end) });
      break;
    }
  }

  const statements = parts.get("statements");
  if (statements) sections.push({ id: "financials", indexes: range(statements.from, statements.to) });
  return sections;
}
