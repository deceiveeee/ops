"use client";

import Link from "next/link";
import { useState } from "react";
import type { CompetitorSuggestion, SectionPassage } from "@/lib/filings/competitors";
import {
  addPeer,
  investigationForCompany,
  keepPassage,
  keptPassageId,
  newInvestigationId,
  newPassageId,
  removePeer,
  saveInvestigation,
} from "@/lib/studio-project/operations";
import type { StudioProject } from "@/lib/studio-project/schema";
import type { FilingRef } from "./FilingPassages";
import { Panel } from "./shared";
import StudioAside from "./workspace/StudioAside";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/**
 * Who a company says it competes with, read from its own annual report, for any
 * company.
 *
 * The Find step (docs/agent-prompts/studio-research-workspace-handoff.md): a
 * learner should be able to say why a company belongs beside another. No free
 * database lists competitors, and an industry code is a poor guide to them, so
 * this reads the names the report itself gives (lib/filings/competitors.ts) and
 * the learner counts the ones that belong. Counting one keeps the passage that
 * names it, so every competitor carries its reason. Where a report names nobody,
 * as Apple's, Walmart's and Netflix's do not, the page says so, shows where the
 * report writes about competition, and lets the learner add companies by ticker.
 *
 * Replaces a peer set built by hand for one company (R7, removed 2026-09-14).
 */

const LOOK_FOR =
  "Who the company itself says it competes with, and whether those companies sell the same things. A company named as a competitor may sell far more besides, so its whole-company figures are not like-for-like.";

/** Suggestions shown before "Show all". Caterpillar's report names forty-four. */
const SHOWN = 8;

const link = "text-accent-cyan underline underline-offset-2 hover:text-white";
const pill =
  "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 disabled:opacity-60";

const clip = (text: string, length = 160) => (text.length > length ? `${text.slice(0, length).replace(/\s+\S*$/, "")}…` : text);

export default function CompetitorsView({
  filing,
  readerQuery,
  businessFound,
  passages,
  suggestions,
  tickerFile,
  tabs,
}: {
  filing: Omit<FilingRef, "sectionId">;
  /** "?doc=…&ticker=…", which a link to a passage in this report extends. */
  readerQuery: string;
  /** Whether this reader found the report's Business section, where companies name their competitors. */
  businessFound: boolean;
  passages: SectionPassage[];
  suggestions: CompetitorSuggestion[];
  /** Whether EDGAR's ticker file could be read. Without it no name is matched to a company. */
  tickerFile: boolean;
  tabs: React.ReactNode;
}) {
  const { session } = useWorkspace();
  const [showAll, setShowAll] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [ticker, setTicker] = useState("");
  const [adding, setAdding] = useState(false);

  const project = session.status === "ready" ? session.project : null;
  const investigation = project ? investigationForCompany(project, { cik: filing.cik, name: filing.companyName }) : undefined;
  const peers = investigation?.peers ?? [];
  const passageHref = (passage: { sectionId: string; offset: number; quote: string }) =>
    `${readerQuery}&section=${passage.sectionId}&at=${passage.offset}&len=${passage.quote.length}#passage`;
  const isCounted = (name: string, cik: string) =>
    peers.some((peer) => (cik ? Number(peer.cik) === Number(cik) : !peer.cik && peer.name.trim().toLowerCase() === name.trim().toLowerCase()));

  /** Change this company's investigation, starting one if there is none, the way keeping a passage does. */
  const change = async (apply: (current: StudioProject, investigationId: string) => StudioProject) => {
    setProblem(null);
    if (session.status !== "ready" || !session.project) {
      setProblem("Your work is still opening. Try again in a moment.");
      return false;
    }
    const freshId = newInvestigationId();
    const result = await session.update((current) => {
      const existing = investigationForCompany(current, { cik: filing.cik, name: filing.companyName });
      const id = existing?.id ?? freshId;
      const withTarget = existing
        ? current
        : saveInvestigation(current, { company: filing.companyName, sic: filing.sic, figures: {}, riskFreePct: null, source: null }, freshId);
      return apply(withTarget, id);
    });
    if (!result.ok) {
      setProblem(`Not saved — ${result.error}`);
      return false;
    }
    return true;
  };

  const count = (suggestion: CompetitorSuggestion) =>
    change((current, id) => {
      const { sectionId, quote, prefix, suffix, offset } = suggestion.passage;
      const edit = { cik: filing.cik, accession: filing.accession, document: filing.document, form: filing.form, filed: filing.filed, sectionId, quote, prefix, suffix, offset };
      const passageId = keptPassageId(current, id, edit) ?? newPassageId();
      return addPeer(keepPassage(current, id, edit, passageId), id, {
        name: suggestion.name,
        cik: suggestion.filer?.cik ?? "",
        ticker: suggestion.filer?.ticker ?? "",
        passageId,
      });
    });

  const addByTicker = async (event: React.FormEvent) => {
    event.preventDefault();
    const symbol = ticker.trim();
    if (!symbol) {
      setProblem("Type the company's ticker symbol first.");
      return;
    }
    setAdding(true);
    setProblem(null);
    try {
      const response = await fetch(`/api/studio/company-lookup?ticker=${encodeURIComponent(symbol)}`);
      const body = (await response.json()) as { company?: { cik: string; ticker: string; name: string }; error?: string };
      if (!response.ok || !body.company) {
        setProblem(body.error ?? "That company could not be looked up.");
        return;
      }
      const company = body.company;
      if (Number(company.cik) === Number(filing.cik)) {
        setProblem(`${company.ticker} is this company itself.`);
        return;
      }
      const saved = await change((current, id) => addPeer(current, id, { name: company.name, cik: company.cik, ticker: company.ticker, passageId: "" }));
      if (saved) setTicker("");
    } catch {
      setProblem("That company could not be looked up. Try again in a moment.");
    } finally {
      setAdding(false);
    }
  };

  const shown = showAll ? suggestions : suggestions.slice(0, SHOWN);

  return (
    <>
      {tabs}
      <section aria-labelledby="section-competitors" className="space-y-3">
        <h2 id="section-competitors" className="text-[17px] font-semibold text-white">
          Who this company says it competes with
        </h2>

        <StudioAside
          inline={
            <p className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-[14px] leading-6 text-slate-300">
              <span className="font-semibold text-white">What to look for. </span>
              {LOOK_FOR}
            </p>
          }
          beside={
            <Panel>
              <h2 className="text-[14px] font-semibold text-white">What to look for here</h2>
              <p className="mt-2 text-[13px] leading-5 text-slate-400">{LOOK_FOR}</p>
            </Panel>
          }
        />

        {!businessFound ? (
          <p className="text-[14px] leading-6 text-slate-400">
            This reader could not find the report&rsquo;s Business section, where companies name their competitors. You can
            still add companies you think compete by their ticker.
          </p>
        ) : suggestions.length ? (
          <div>
            <h3 id="competitors-named" className="text-[14px] font-semibold text-white">
              Named in its words about competition ({suggestions.length})
            </h3>
            <p className="text-[13px] leading-5 text-slate-400">
              Studio reads the names; you decide which belong. Counting one keeps the passage that names it.
            </p>
            <ul aria-labelledby="competitors-named" className="mt-2 divide-y divide-white/10 border-y border-white/10">
              {shown.map((suggestion) => {
                const counted = isCounted(suggestion.name, suggestion.filer?.cik ?? "");
                return (
                  <li key={suggestion.name} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-[13px] leading-5">
                    <div className="min-w-0">
                      <span className="font-semibold text-white">{suggestion.name}</span>{" "}
                      <a href={passageHref(suggestion.passage)} aria-label={`Where the report names ${suggestion.name}`} className={`text-[12px] ${link}`}>
                        where it is named
                      </a>
                      <span className="block text-[12px] text-slate-500">
                        {suggestion.filer ? (
                          <>
                            In the SEC&rsquo;s list as {suggestion.filer.name} ·{" "}
                            <Link href={`/studio/filings?ticker=${encodeURIComponent(suggestion.filer.ticker)}`} className={link}>
                              {suggestion.filer.ticker} reports
                            </Link>
                          </>
                        ) : suggestion.ambiguous ? (
                          "More than one company in the SEC's list goes by this name"
                        ) : (
                          "No company in the SEC's list goes by this name"
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void count(suggestion)}
                      disabled={counted}
                      aria-label={counted ? `${suggestion.name} is counted` : `Count ${suggestion.name} as a competitor`}
                      className={`${pill} ${counted ? "border-accent-cyan/40 text-accent-cyan" : "border-white/12 text-slate-300 hover:border-accent-cyan/50 hover:text-accent-cyan"}`}
                    >
                      {counted ? "Counted" : "Count it"}
                    </button>
                  </li>
                );
              })}
            </ul>
            {suggestions.length > SHOWN ? (
              <button type="button" onClick={() => setShowAll((current) => !current)} className={`mt-1 min-h-9 text-[13px] ${link}`}>
                {showAll ? "Show fewer" : `Show all ${suggestions.length}`}
              </button>
            ) : null}
          </div>
        ) : (
          <div>
            <h3 className="text-[14px] font-semibold text-white">It names no competitors in words Studio can read</h3>
            <p className="text-[13px] leading-5 text-slate-400">
              {passages.length
                ? `Its Business section writes about competition in ${passages.length} ${passages.length === 1 ? "place" : "places"} without naming a company Studio recognises. Read ${passages.length === 1 ? "it" : "them"}, and add any company you think competes by its ticker.`
                : "Its Business section does not write about competitors. Add any company you think competes by its ticker."}
            </p>
            {passages.length ? (
              <ul className="mt-2 space-y-1">
                {passages.slice(0, 3).map((passage) => (
                  <li key={passage.offset} className="text-[13px] leading-5">
                    <a href={passageHref(passage)} className={link}>
                      &ldquo;{clip(passage.quote)}&rdquo;
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        {businessFound && !tickerFile ? (
          <p className="text-[12px] leading-5 text-accent-amber">
            The SEC&rsquo;s list of companies could not be read just now, so no name above is matched to a company.
          </p>
        ) : null}

        <div>
          <h3 id="competitors-yours" className="text-[14px] font-semibold text-white">
            Your competitors for this company ({peers.length})
          </h3>
          {peers.length ? (
            <ul aria-labelledby="competitors-yours" className="mt-1 space-y-1">
              {peers.map((peer) => {
                const named = peer.passageId ? investigation?.passages?.find((passage) => passage.id === peer.passageId) : undefined;
                return (
                  <li key={peer.id} className="flex flex-wrap items-center gap-x-3 text-[13px] leading-6 text-slate-300">
                    <span className="font-semibold text-white">{peer.name}</span>
                    {peer.ticker ? (
                      <Link href={`/studio/filings?ticker=${encodeURIComponent(peer.ticker)}`} className={`text-[12px] ${link}`}>
                        {peer.ticker} reports
                      </Link>
                    ) : null}
                    <span className="text-[12px] text-slate-500">
                      {named ? (named.accession === filing.accession ? "named in this report" : "named in another of its reports") : "added by ticker"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void change((current, id) => removePeer(current, id, peer.id))}
                      aria-label={`Stop counting ${peer.name}`}
                      className="min-h-9 text-[12px] text-slate-400 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[13px] leading-5 text-slate-500">None counted yet.</p>
          )}
          <form onSubmit={(event) => void addByTicker(event)} className="mt-2 flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="block text-[12px] text-slate-500">Add a company by its ticker</span>
              <input
                value={ticker}
                onChange={(event) => setTicker(event.target.value)}
                autoComplete="off"
                className="mt-1 block min-h-11 w-40 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[14px] text-white focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
              />
            </label>
            <button
              type="submit"
              disabled={adding}
              className="inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-4 text-[14px] font-semibold text-white transition-colors hover:border-accent-cyan/70 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
            >
              {adding ? "Looking it up…" : "Add"}
            </button>
          </form>
        </div>

        {problem ? (
          <p role="alert" className="text-[13px] leading-6 text-accent-amber">
            {problem}
          </p>
        ) : null}
      </section>
    </>
  );
}
