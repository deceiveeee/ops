"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { anchorFromParagraph } from "@/lib/filings/anchor";
import {
  investigationForCompany,
  keepPassage,
  newInvestigationId,
  newPassageId,
  removeInvestigation,
  removePassage,
  saveInvestigation,
} from "@/lib/studio-project/operations";
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
  const holders = useRef(new Map<number, HTMLSpanElement>());
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

  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph) => {
        const marked = highlight && highlight.start < paragraph.end && highlight.end > paragraph.start;
        const keptHere = alreadyKept.filter(({ passage }) =>
          passage.offset >= paragraph.start && passage.offset < paragraph.end,
        );
        const opening = paragraph.text.split(/\s+/).slice(0, 6).join(" ");
        return (
          <div key={paragraph.index}>
            <p
              id={marked ? "passage" : undefined}
              className={
                "max-w-[68ch] scroll-mt-24 text-[15px] leading-7 text-slate-200 " +
                (keptHere.length ? "border-l-2 border-accent-cyan/50 pl-3" : "")
              }
            >
              <span
                ref={(node) => {
                  if (node) holders.current.set(paragraph.index, node);
                  else holders.current.delete(paragraph.index);
                }}
              >
                {marked ? withMark(paragraph, highlight!) : paragraph.text}
              </span>{" "}
              <button
                type="button"
                // Pressing a button would otherwise clear the selection before
                // the click handler could read it.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void keep(paragraph)}
                aria-label={`Keep paragraph ${paragraph.index}, which begins "${opening}"`}
                className="inline-flex min-h-8 items-center rounded-full border border-white/12 px-2.5 align-middle text-[12px] font-medium text-slate-400 transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
              >
                Keep
              </button>
            </p>

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

/** The paragraph's text with the highlighted range marked. Its text content is unchanged. */
function withMark(paragraph: PageParagraph, range: { start: number; end: number }): ReactNode {
  const from = Math.max(0, range.start - paragraph.start);
  const to = Math.min(paragraph.text.length, range.end - paragraph.start);
  return (
    <>
      {paragraph.text.slice(0, from)}
      <mark className="rounded bg-accent-amber/25 px-0.5 text-white">{paragraph.text.slice(from, to)}</mark>
      {paragraph.text.slice(to)}
    </>
  );
}
