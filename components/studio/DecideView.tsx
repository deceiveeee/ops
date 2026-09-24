"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { FORCE_BY_KEY } from "@/lib/studio-project/five-forces";
import { LEVER_BY_ID } from "@/lib/studio-project/value-stick";
import { readInvestigation } from "@/lib/studio-project/investigate-read";
import { RESEARCH_STEPS, stepHref, stepNumber, stepStatuses, type StepKey } from "@/lib/studio-project/research-path";
import { latestInvestigation, type FigureInvestigation } from "@/lib/studio-project/schema";
import CompanyDecision from "./CompanyDecision";
import KeptPassages from "./KeptPassages";
import { Panel } from "./shared";
import { NeedsCompany, StepHeading } from "./workspace/ResearchSteps";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/**
 * The last step: what the research found, and what the learner does about it.
 *
 * Every earlier step keeps its work on the company's own record — the figures,
 * the passages kept from its report, the map, the findings about competition,
 * the levers argued — and until this page nothing brought them together, so a
 * learner decided on the figures page before any of the rest existed. Here
 * each step's work is listed in the order it was done, each one line and a
 * link back, and the decision sits under it.
 *
 * Nothing here judges the research or scores it. A step with nothing saved says
 * so and where to do it; a company can be decided on with steps skipped,
 * because deciding what not to research is a decision too.
 */

const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** What one step found, in a sentence, or null when nothing is saved. */
function found(key: StepKey, investigation: FigureInvestigation): string | null {
  switch (key) {
    case "numbers": {
      const reading = readInvestigation(investigation);
      if ("blocked" in reading) return null;
      return reading.createsValue
        ? `Earns ${pct(reading.decomposition.roic)} on its capital against a cost of ${pct(reading.costOfCapital)}: more than its capital costs.`
        : `Earns ${pct(reading.decomposition.roic)} on its capital against a cost of ${pct(reading.costOfCapital)}: less than its capital costs.`;
    }
    case "report": {
      const passages = investigation.passages ?? [];
      if (!passages.length) return null;
      const by = (role: string) => passages.filter((passage) => passage.role === role).length;
      const marked = [
        by("supports") ? `${by("supports")} for it` : "",
        by("challenges") ? `${by("challenges")} against it` : "",
        by("context") ? `${by("context")} not yet marked` : "",
      ].filter(Boolean);
      return `${plural(passages.length, "passage", "passages")} kept: ${marked.join(", ")}.`;
    }
    case "map": {
      const entries = investigation.mapEntries ?? [];
      if (!entries.length) return null;
      const names = entries.slice(0, 3).map((entry) => entry.name);
      return `${plural(entries.length, "entry", "entries")} on its map: ${names.join(", ")}${entries.length > 3 ? ", and more" : ""}.`;
    }
    case "competition": {
      const findings = investigation.forces ?? [];
      if (!findings.length) return null;
      const forces = [...new Set(findings.map((finding) => FORCE_BY_KEY.get(finding.force)?.label ?? finding.force))];
      return `${plural(findings.length, "finding", "findings")}, about ${forces.join(", ").toLowerCase()}.`;
    }
    case "value": {
      const claims = investigation.valueClaims ?? [];
      if (!claims.length) return null;
      const levers = claims.map((claim) => LEVER_BY_ID.get(claim.lever)?.label ?? claim.lever);
      return `${plural(claims.length, "lever", "levers")} argued: ${levers.join("; ").toLowerCase()}.`;
    }
    default:
      return null;
  }
}

/** The steps whose work is about the company, in the order they were meant to be done. */
const SUMMARISED: StepKey[] = ["numbers", "report", "map", "competition", "value"];

export default function DecideView() {
  const { project } = useWorkspace();
  const [investigationId, setInvestigationId] = useState<string | null>(null);

  const investigations = useMemo(
    () => [...(project?.investigations ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [project],
  );

  // The company named in the address first, as Investigate does — the reader's
  // "Open it" sends a learner here with the passage they just kept — and
  // otherwise the one worked on last.
  useEffect(() => {
    if (investigationId || !project) return;
    const wanted = new URLSearchParams(window.location.search).get("company");
    const named = wanted ? project.investigations.find((item) => item.id === wanted) : undefined;
    const opening = named ?? latestInvestigation(project);
    if (opening) setInvestigationId(opening.id);
  }, [project, investigationId]);

  const open = investigations.find((item) => item.id === investigationId);
  const statuses = stepStatuses(project, open);

  return (
    <div className="space-y-4">
      <StepHeading step="decide" />

      {investigations.length > 1 ? (
        <nav aria-label="Companies you have looked at" className="-mx-1 overflow-x-auto px-1 pb-1">
          <ul className="flex items-center gap-2">
            {investigations.map((item) => {
              const active = item.id === investigationId;
              return (
                <li key={item.id} className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setInvestigationId(item.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full border px-3.5 text-[13px] transition-colors",
                      active
                        ? "border-st-blue-edge bg-st-select text-st-ink"
                        : "border-st-hair bg-st-paper text-st-muted hover:border-st-bound hover:text-st-body",
                    )}
                  >
                    {item.company.trim() || "Unnamed company"}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}

      {!open ? (
        <NeedsCompany>This is where you decide about a company you have researched.</NeedsCompany>
      ) : (
        <>
          <Panel>
            <h2 className="text-[15px] font-semibold text-st-ink">
              What you found about {open.company.trim() || "this company"}
            </h2>
            <ol className="mt-3 divide-y divide-st-hair">
              {SUMMARISED.map((key) => {
                const step = RESEARCH_STEPS.find((item) => item.key === key)!;
                const line = found(key, open);
                return (
                  <li key={key} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-semibold",
                        statuses[key].done ? "border-st-good-edge bg-st-good-soft text-st-good" : "border-st-hair text-st-muted",
                      )}
                    >
                      {statuses[key].done ? "✓" : stepNumber(key)}
                    </span>
                    <span className="min-w-0 flex-1 text-[13px] leading-6">
                      <Link href={stepHref(step, open)} className="font-semibold text-st-ink hover:underline">
                        {step.title}
                      </Link>
                      <span className="block text-st-muted">
                        {line ?? "Nothing saved yet. You can decide without it, or go back and do it first."}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <KeptPassages key={open.id} investigationId={open.id} passages={open.passages ?? []} />

          <section id="decision" aria-labelledby="decision-heading" className="scroll-mt-40 space-y-2">
            <h2 id="decision-heading" className="text-[15px] font-semibold text-st-ink">
              Your decision
            </h2>
            <CompanyDecision key={open.id} investigationId={open.id} company={open.company} />
          </section>
        </>
      )}
    </div>
  );
}
