import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CONTEXT_CHARS, anchorFor, anchorFromParagraph, locate, type PassageAnchor } from "./anchor";
import { fixtureFileName } from "./edgar";
import { paragraphsOf } from "./pages";
import { extractFilingSections } from "./sections";

/**
 * Finding a kept passage again, on real text that has really shifted.
 *
 * `live-anchors.json` holds four sentences anchored in the text of Atkore's
 * live 10-K. The fixture was rebuilt from the same filing and drops the stray
 * spaces at the edges of its lines, so each sentence now sits at a different
 * offset — the situation the anchoring exists for, produced by the real
 * extractor rather than by a hand-edited string.
 *
 * Which strategy should find each one is stated here, from why it should, and
 * was written down before the anchors were checked against the fixture: the
 * two sentences whose 32 characters of context stay inside their paragraph are
 * found by that context; the two whose context runs back across a line break
 * the fixture spaces differently can only be found by the quote itself.
 */

const DOC = "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm";
const FIXTURES = join(process.cwd(), "e2e", "fixtures", "edgar");
const sections = extractFilingSections(readFileSync(join(FIXTURES, fixtureFileName(DOC)), "utf8")).sections;
const textOf = (id: string) => sections.find((section) => section.id === id)!.text;

type LiveAnchor = PassageAnchor & { sectionId: string };
const LIVE = (JSON.parse(readFileSync(join(FIXTURES, "live-anchors.json"), "utf8")) as { anchors: LiveAnchor[] }).anchors;
const live = (sectionId: string) => {
  const { sectionId: _section, ...anchor } = LIVE.find((item) => item.sectionId === sectionId)!;
  return anchor;
};

describe("making an anchor", () => {
  it("keeps the quote, the text either side, and where it began", () => {
    const text = textOf("business");
    const at = text.indexOf("PVC resin");
    const anchor = anchorFor(text, at, at + "PVC resin".length);

    expect(anchor.quote).toBe("PVC resin");
    expect(anchor.offset).toBe(at);
    expect(anchor.prefix).toBe(text.slice(at - CONTEXT_CHARS, at));
    expect(anchor.suffix).toBe(text.slice(at + 9, at + 9 + CONTEXT_CHARS));
  });

  it("leaves out whitespace a selection picked up at its edges", () => {
    const anchor = anchorFor("alpha  beta gamma", 5, 12);
    expect(anchor).toEqual({ quote: "beta", prefix: "alpha  ", suffix: " gamma", offset: 7 });
  });

  it("keeps less context where there is less text", () => {
    const anchor = anchorFor("Item 1. Business", 0, 4);
    expect(anchor.prefix).toBe("");
    expect(anchor.quote).toBe("Item");
  });

  it("has nothing to find for a range that is only whitespace", () => {
    const anchor = anchorFor("one   two", 3, 6);
    expect(anchor.quote).toBe("");
    expect(locate("one   two", anchor)).toBeNull();
  });
});

describe("an anchor made from one paragraph of a page", () => {
  it("is exactly the anchor the whole section would give", () => {
    // The reader's page holds only its paragraphs, each with 32 characters of
    // section either side. If that were not enough, a passage kept on the page
    // would differ from the one the server looks for, and never be found.
    const text = textOf("business");
    const paragraphs = paragraphsOf(text).slice(0, 40);
    for (const paragraph of paragraphs) {
      const withContext = {
        ...paragraph,
        before: text.slice(Math.max(0, paragraph.start - CONTEXT_CHARS), paragraph.start),
        after: text.slice(paragraph.end, paragraph.end + CONTEXT_CHARS),
      };
      const length = paragraph.text.length;
      for (const [from, to] of [[0, length], [0, Math.min(9, length)], [Math.floor(length / 3), Math.floor((2 * length) / 3)], [Math.max(0, length - 12), length]]) {
        expect(anchorFromParagraph(withContext, from, to)).toEqual(anchorFor(text, paragraph.start + from, paragraph.start + to));
      }
    }
  });
});

describe("finding it again", () => {
  it("finds it where it was, when nothing has moved", () => {
    const text = textOf("mdna");
    const at = text.indexOf("average selling prices");
    const found = locate(text, anchorFor(text, at, at + 22));
    expect(found).toEqual({ start: at, end: at + 22, strategy: "position" });
  });

  it("finds a sentence by its surroundings after the text shifted", () => {
    for (const sectionId of ["business", "mdna"]) {
      const text = textOf(sectionId);
      const anchor = live(sectionId);
      const found = locate(text, anchor);

      expect(found?.strategy, sectionId).toBe("context");
      expect(text.slice(found!.start, found!.end)).toBe(anchor.quote);
      expect(found!.start).toBe(text.indexOf(anchor.quote));
      // Proof the text really moved, so this is not the position case in disguise.
      expect(found!.start).not.toBe(anchor.offset);
    }
  });

  it("falls back to the quote alone when its surroundings crossed a line break", () => {
    for (const sectionId of ["risk-factors", "market-risk"]) {
      const text = textOf(sectionId);
      const anchor = live(sectionId);
      expect(anchor.prefix).toContain("\n");

      const found = locate(text, anchor);
      expect(found?.strategy, sectionId).toBe("quote");
      expect(text.slice(found!.start, found!.end)).toBe(anchor.quote);
    }
  });

  it("ignores spacing and capitals only when nothing exact is left", () => {
    const reflowed = textOf("business").replace(/ /g, "  ");
    const anchor = live("business");
    const found = locate(reflowed, anchor);

    expect(found?.strategy).toBe("loose");
    expect(reflowed.slice(found!.start, found!.end).replace(/\s+/g, " ")).toBe(anchor.quote);
  });

  it("does not guess: one word changed is not found", () => {
    const anchor = live("business");
    const changed = { ...anchor, quote: anchor.quote.replace("suppliers of steel", "supplier of steel") };
    expect(changed.quote).not.toBe(anchor.quote);
    expect(locate(textOf("business"), changed)).toBeNull();
  });

  it("picks the occurrence nearest to where it was kept", () => {
    const text = "Revenue rose. Costs rose. Revenue rose. Costs rose.";
    const second = text.lastIndexOf("Revenue rose.");
    const kept = anchorFor(text, second, second + "Revenue rose.".length);

    // Same words, same surroundings, twice: context alone cannot tell them apart.
    const shifted = `Preface. ${text}`;
    const found = locate(shifted, kept);
    expect(found?.start).toBe(shifted.lastIndexOf("Revenue rose."));
  });
});
