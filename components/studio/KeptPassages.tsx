"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { sectionLabel as labelForSection } from "@/lib/filings/sections";
import { removePassage, updatePassage } from "@/lib/studio-project/operations";
import type { EvidenceRole, KeptPassage } from "@/lib/studio-project/schema";
import { Field, Panel } from "./shared";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/** The same three words the research record uses, so a role means one thing everywhere. */
const PASSAGE_ROLES: { value: EvidenceRole; label: string; tone: string }[] = [
  { value: "supports", label: "For it", tone: "border-accent-green/40 bg-accent-green/10 text-accent-green" },
  { value: "challenges", label: "Against it", tone: "border-accent-amber/40 bg-accent-amber/10 text-accent-amber" },
  { value: "context", label: "Background", tone: "border-white/25 bg-white/10 text-slate-200" },
];

/**
 * Passages kept from a company's own reports, and which way each one argues.
 *
 * Keeping a passage is one action, in the reader; deciding what it argues is a
 * judgment, and it is made where the decision is. This lived on the figures
 * page, which comes before the report in the research path, so a learner going
 * forward never met it again after keeping anything.
 */
export default function KeptPassages({ investigationId, passages }: { investigationId: string; passages: KeptPassage[] }) {
  const router = useRouter();
  const { session } = useWorkspace();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  /*
   * Passages kept from this company’s filings, read from the saved project
   * rather than held in page state. The reader writes them, not this page, so
   * the stored record is the only place that knows them.
   */
  const [passageNote, setPassageNote] = useState<{ id: string; message: string; search?: string } | null>(null);
  // Open while any passage is still background, which is where every passage
  // starts: that is the work left on this list. Once each has been read one
  // way or the other, the list folds away under the count.
  const unmarked = passages.filter((passage) => passage.role === "context").length;
  const [showList, setShowList] = useState(unmarked > 0);

  const markPassage = (passageId: string, patch: Partial<Pick<KeptPassage, "role" | "note">>) => {
    return sessionRef.current.update((current) => updatePassage(current, investigationId, passageId, patch));
  };

  const dropPassage = async (passageId: string) => {
    const result = await sessionRef.current.update((current) => removePassage(current, investigationId, passageId));
    if (!result.ok) setPassageNote({ id: passageId, message: `Not removed: ${result.error}` });
  };

  /**
   * Open a kept passage where it is now.
   *
   * The report is fetched fresh and the passage found again across its whole
   * section by the locate-passage route, so what opens is where the words are
   * today. When they cannot be found, that is said, with a search for their
   * opening words as the way to look.
   */
  const openPassage = async (passage: KeptPassage) => {
    setPassageNote(null);
    const opening = passage.quote.split(/\s+/).slice(0, 5).join(" ");
    const reader = `/studio/filings/${passage.cik}/${passage.accession}?doc=${encodeURIComponent(passage.document)}`;
    let answer: { found?: boolean; strategy?: string; sectionId?: string; start?: number; end?: number; message?: string; error?: string };
    try {
      const response = await fetch("/api/studio/locate-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cik: passage.cik, accession: passage.accession, document: passage.document, sectionId: passage.sectionId,
          quote: passage.quote, prefix: passage.prefix, suffix: passage.suffix, offset: passage.offset,
        }),
      });
      answer = await response.json();
    } catch {
      setPassageNote({ id: passage.id, message: "The report could not be reached just now." });
      return;
    }
    if (!answer.found || answer.start === undefined || answer.end === undefined) {
      setPassageNote({
        id: passage.id,
        message: answer.message ?? answer.error ?? "This passage could not be found in the report any more.",
        search: `${reader}&q=${encodeURIComponent(opening)}`,
      });
      return;
    }
    const moved = answer.strategy && answer.strategy !== "position" ? `&moved=${answer.strategy}` : "";
    router.push(`${reader}&section=${answer.sectionId}&at=${answer.start}&len=${answer.end - answer.start}${moved}#passage`);
  };

  if (!passages.length) return null;

  return (
    <Panel>
      <h3 className="text-[15px] font-semibold text-white">
        From its own filings <span className="font-normal text-slate-500">({passages.length})</span>
      </h3>
      <p className="mt-1 text-[13px] leading-6 text-slate-400">
        Passages you kept while reading. Say whether each argues for this business or against it.
        {unmarked ? ` ${unmarked} still marked as background.` : ""}
      </p>
      <details open={showList} onToggle={(event) => setShowList(event.currentTarget.open)} className="mt-1">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[13px] font-semibold text-accent-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
        {showList ? "Hide them" : `Show ${passages.length === 1 ? "it" : `all ${passages.length}`}`}
      </summary>
      <ul className="mt-2 space-y-4">
        {passages.map((passage) => {
          const sectionLabel = labelForSection(passage.sectionId, passage.form);
          return (
            <li key={passage.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <blockquote className="line-clamp-4 border-l-2 border-accent-cyan/40 pl-3 text-[14px] leading-6 text-slate-200">
                {passage.quote}
              </blockquote>
              <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
                {passage.form || "Report"} · {sectionLabel}
                {passage.filed ? ` · filed ${passage.filed}` : ""}
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
                <fieldset>
                  <legend className="text-[13px] font-semibold text-white">Does it argue for it or against it?</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {PASSAGE_ROLES.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3.5 text-[13px] transition-colors focus-within:ring-2 focus-within:ring-accent-cyan/40",
                          passage.role === option.value ? option.tone : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white",
                        )}
                      >
                        <input
                          type="radio"
                          name={`passage-role-${passage.id}`}
                          value={option.value}
                          checked={passage.role === option.value}
                          onChange={() => void markPassage(passage.id, { role: option.value })}
                          className="sr-only"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <Field label="What it shows" value={passage.note} onChange={(value) => markPassage(passage.id, { note: value })} multiline />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <button
                  type="button"
                  onClick={() => void openPassage(passage)}
                  className="inline-flex min-h-11 items-center text-[13px] font-semibold text-accent-cyan hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
                >
                  Open it in the report
                </button>
                <button
                  type="button"
                  onClick={() => void dropPassage(passage.id)}
                  aria-label="Remove this passage"
                  className="inline-flex min-h-11 items-center text-[13px] text-slate-400 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                >
                  Remove
                </button>
              </div>
              {passageNote?.id === passage.id ? (
                <p role="alert" className="mt-1 text-[13px] leading-6 text-accent-amber">
                  {passageNote.message}{" "}
                  {passageNote.search ? (
                    <Link href={passageNote.search} className="underline underline-offset-2">
                      Search the report for it
                    </Link>
                  ) : null}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      </details>
    </Panel>
  );
}
