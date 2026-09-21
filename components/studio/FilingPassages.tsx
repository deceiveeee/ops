"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { anchorFromParagraph } from "@/lib/filings/anchor";
import { KEEP_SLOT } from "@/lib/filings/keep-slot";
import {
  investigationForCompany,
  keepPassage,
  newInvestigationId,
  newPassageId,
  removeInvestigation,
  removePassage,
  saveInvestigation,
} from "@/lib/studio-project/operations";
import styles from "./filing-reader.module.css";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/** One paragraph of the open page, with the section text either side of it. */
export type PageParagraph = {
  index: number;
  start: number;
  end: number;
  text: string;
  /** Up to `CONTEXT_CHARS` of the section immediately before and after. */
  before: string;
  after: string;
  /** How the filing set it out: a paragraph, a heading, or the rows of a table on this page. */
  kind: "text" | "heading" | "table";
  /** Whether it can be kept. A short label, such as "Products", cannot. */
  keepable: boolean;
  align: "center" | "right" | null;
  /**
   * The filing's own markup, rebuilt from an allow-list in lib/filings/document.ts:
   * one character of text for each character shown, with KEEP_SLOT where the
   * paragraph's Keep button goes.
   */
  html: string;
};

export type FilingRef = {
  cik: string;
  accession: string;
  document: string;
  form: string;
  filed: string;
  sectionId: string;
  /** EDGAR's name for the company, which is what an investigation is matched on. */
  companyName: string;
  sic: string;
};

type Kept = { paragraph: number; passageId: string; investigationId: string; company: string; started: boolean };

/**
 * A page of a filing that a learner can keep passages from.
 *
 * **One action, or two.** Pressing Keep beside a paragraph keeps that paragraph.
 * Selecting some words inside it first keeps just those words. Principle 8 of
 * the research report asks for "at most 2 actions from the passage", and a
 * paragraph in a 10-K can run to 2,300 characters, so both are needed: the
 * whole paragraph is the quick case, the selection the precise one.
 *
 * **Where it goes.** To the learner's investigation of this company, matched
 * on the SEC's company number or EDGAR's exact name — never on a name that is
 * merely close. With no such investigation, keeping a passage starts one and
 * says so. The passage arrives as background; whether it argues for the
 * business or against it is decided in Investigate, beside the figures.
 *
 * **Why every Keep has its own name.** A row of buttons all called "Keep" is
 * ambiguous to anyone moving through a page by control rather than by sight.
 * Each is named for its paragraph's place in the section and the words it
 * begins with, so no two on a page can share a name, whatever words their
 * paragraphs happen to begin with.
 */
export default function FilingPassages({
  filing,
  paragraphs,
  highlight,
}: {
  filing: FilingRef;
  paragraphs: PageParagraph[];
  /** A range of the section to mark, from a search hit or a kept passage being reopened. */
  highlight: { start: number; end: number } | null;
}) {
  const { session } = useWorkspace();
  const holders = useRef(new Map<number, HTMLElement>());
  const [kept, setKept] = useState<Kept | null>(null);
  const [problem, setProblem] = useState<{ paragraph: number; message: string } | null>(null);

  /*
   * Bring a marked passage into view once it is really on the page.
   *
   * A search hit links to `#passage`, but the workspace shows "Opening your
   * work…" in place of the page until the learner's saved work has loaded, so
   * the browser's own jump to that fragment arrives before there is anything to
   * jump to. This runs when the paragraph mounts, which is after that wait.
   */
  const markedStart = highlight?.start;
  const markedEnd = highlight?.end;
  useEffect(() => {
    if (markedStart === undefined) return;
    document.getElementById("passage")?.scrollIntoView({ block: "center" });
  }, [markedStart, markedEnd]);

  const project = session.status === "ready" ? session.project : null;
  const alreadyKept = (project?.investigations ?? []).flatMap((item) =>
    (item.passages ?? [])
      .filter((passage) => passage.accession === filing.accession && passage.sectionId === filing.sectionId)
      .map((passage) => ({ passage, company: item.company })),
  );

  /** The words selected inside one paragraph, as offsets into its text, or null. */
  const selectionIn = (index: number): { from: number; to: number } | null => {
    const holder = holders.current.get(index);
    const selection = typeof window !== "undefined" ? window.getSelection() : null;
    if (!holder || !selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
    const range = selection.getRangeAt(0);
    if (!holder.contains(range.startContainer) || !holder.contains(range.endContainer)) return null;
    const lead = document.createRange();
    lead.selectNodeContents(holder);
    lead.setEnd(range.startContainer, range.startOffset);
    const from = lead.toString().length;
    return { from, to: from + range.toString().length };
  };

  const keep = async (paragraph: PageParagraph) => {
    setProblem(null);
    if (session.status !== "ready" || !session.project) {
      setProblem({ paragraph: paragraph.index, message: "Your work is still opening. Try again in a moment." });
      return;
    }
    const chosen = selectionIn(paragraph.index) ?? { from: 0, to: paragraph.text.length };
    const anchor = anchorFromParagraph(paragraph, chosen.from, chosen.to);
    if (!anchor.quote) return;

    const passageId = newPassageId();
    const freshId = newInvestigationId();
    let targetId = "";
    let started = false;
    let company = filing.companyName;

    const result = await session.update((current) => {
      const existing = investigationForCompany(current, { cik: filing.cik, name: filing.companyName });
      targetId = existing?.id ?? freshId;
      started = !existing;
      company = existing?.company.trim() || filing.companyName;
      const withTarget = existing
        ? current
        : saveInvestigation(current, { company: filing.companyName, sic: filing.sic, figures: {}, riskFreePct: null, source: null }, freshId);
      return keepPassage(withTarget, targetId, {
        cik: filing.cik,
        accession: filing.accession,
        document: filing.document,
        form: filing.form,
        filed: filing.filed,
        sectionId: filing.sectionId,
        ...anchor,
      }, passageId);
    });

    if (!result.ok) {
      setProblem({ paragraph: paragraph.index, message: `Not kept — ${result.error}` });
      return;
    }
    window.getSelection()?.removeAllRanges();
    setKept({ paragraph: paragraph.index, passageId, investigationId: targetId, company, started });
  };

  /** Take back the last keep, and the investigation it started if that is now empty. */
  const undo = async () => {
    if (!kept) return;
    const result = await session.update((current) => {
      const without = removePassage(current, kept.investigationId, kept.passageId);
      const target = without.investigations.find((item) => item.id === kept.investigationId);
      const empty = target && Object.keys(target.figures).length === 0 && !(target.passages ?? []).length;
      return kept.started && empty ? removeInvestigation(without, kept.investigationId) : without;
    });
    if (result.ok) setKept(null);
    else setProblem({ paragraph: kept.paragraph, message: `Not undone — ${result.error}` });
  };

  /** A Keep button inside a paragraph's HTML is found by its paragraph's number. */
  const byIndex = (target: EventTarget | null) => {
    const button = (target as HTMLElement | null)?.closest?.("[data-keep]");
    if (!button) return null;
    return paragraphs.find((item) => String(item.index) === button.getAttribute("data-keep")) ?? null;
  };

  return (
    <div
      className={`space-y-3 ${styles.document}`}
      // The Keep buttons live inside each paragraph's own HTML, so their clicks are handled here.
      onMouseDown={(event) => {
        // Pressing a button would otherwise clear the selection before the click could read it.
        if (byIndex(event.target)) event.preventDefault();
      }}
      onClick={(event) => {
        const paragraph = byIndex(event.target);
        if (paragraph) void keep(paragraph);
      }}
    >
      {paragraphs.map((paragraph) => {
        const marked = highlight && highlight.start < paragraph.end && highlight.end > paragraph.start;
        const keptHere = alreadyKept.filter(({ passage }) =>
          passage.offset >= paragraph.start && passage.offset < paragraph.end,
        );
        const opening = paragraph.text.split(/\s+/).slice(0, 6).join(" ");
        const shown = marked || keptHere.length > 0;
        const keepButton = paragraph.keepable
          ? `<button type="button" data-keep="${paragraph.index}" aria-label="${escapeAttribute(`Keep paragraph ${paragraph.index}, which begins "${opening}"`)}" class="${styles.keep}${shown ? ` ${styles.keepShown}` : ""}"></button>`
          : "";
        const holder = (node: HTMLElement | null) => {
          if (node) holders.current.set(paragraph.index, node);
          else holders.current.delete(paragraph.index);
        };
        return (
          <div key={paragraph.index}>
            {paragraph.kind === "table" ? (
              <div className={`${styles.paragraph} ${keptHere.length ? styles.kept : ""}`}>
                <div className={styles.tableFrame} id={marked ? "passage" : undefined}>
                  <table className={styles.table} dangerouslySetInnerHTML={{ __html: `<tbody>${paragraph.html}</tbody>` }} />
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void keep(paragraph);
                  }}
                  aria-label={`Keep the table that begins "${opening}"`}
                  className={`${styles.keepTable}${shown ? ` ${styles.keepShown}` : ""}`}
                >
                  Keep table
                </button>
              </div>
            ) : paragraph.kind === "heading" ? (
              <h3 id={marked ? "passage" : undefined} className={`${styles.heading} ${styles.paragraph} ${keptHere.length ? styles.kept : ""}`}>
                <span ref={holder} dangerouslySetInnerHTML={{ __html: paragraph.html.replace(KEEP_SLOT, keepButton) }} />
              </h3>
            ) : (
              <p
                id={marked ? "passage" : undefined}
                className={`${styles.text} ${styles.paragraph} ${keptHere.length ? styles.kept : ""}`}
                style={paragraph.align ? { textAlign: paragraph.align } : undefined}
              >
                {/*
                  * The filing's own paragraph. The Keep button is placed inside its
                  * last word and draws its label with CSS, so the paragraph's text is
                  * only its text and a waiting button never sits on a line alone.
                  */}
                <span ref={holder} dangerouslySetInnerHTML={{ __html: paragraph.html.replace(KEEP_SLOT, keepButton) }} />
              </p>
            )}

            {kept?.paragraph === paragraph.index ? (
              <p role="status" className="mt-1 max-w-[68ch] text-[13px] leading-6 text-accent-cyan">
                Kept in your investigation of {kept.company}
                {kept.started ? ", which this started" : ""}.{" "}
                <Link
                  href={`/studio/investigate?company=${encodeURIComponent(kept.investigationId)}`}
                  className="font-semibold underline underline-offset-2"
                >
                  Open it
                </Link>
                {" · "}
                <button type="button" onClick={() => void undo()} className="underline underline-offset-2">
                  Undo
                </button>
              </p>
            ) : keptHere.length ? (
              <p className="mt-1 text-[12px] leading-5 text-slate-500">
                Kept in {keptHere[0].company.trim() || "an investigation"}
                {keptHere.length > 1 ? `, ${keptHere.length} passages` : ""}
              </p>
            ) : null}

            {problem?.paragraph === paragraph.index ? (
              <p role="alert" className="mt-1 text-[13px] leading-6 text-accent-amber">
                {problem.message}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
