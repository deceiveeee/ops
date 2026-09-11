"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STUDIO_STORAGE_KEY, type StudioCalculation } from "@/lib/studio";
import { findStudioInstrument } from "@/lib/studio-catalog";
import { FIGURES } from "@/lib/studio-project/investigate";
import { workingAlternative, type StudioMode, type StudioProject } from "@/lib/studio-project/schema";
import { createIndexedDbProjectStorage } from "@/lib/studio-project/storage";
import { StageHeading, pct, usdWhole } from "../shared";
import { WorkWaiting } from "./StudioFrame";
import { holdsWork, useWorkspace } from "./WorkspaceProvider";

type NextStep = { title: string; why: string; href: string; action: string };

/**
 * One suggestion, taken from what is missing. Suggested, never enforced: every
 * section stays one click away whatever this says.
 */
function suggest(project: StudioProject, calculation: StudioCalculation): NextStep {
  const positions = workingAlternative(project)?.positions ?? [];
  if (project.goal.purpose.trim() === "") {
    return {
      title: "Say what this money is for",
      why: "Every later choice is judged against it: how long you can wait, and how large a fall you could live with.",
      href: "/studio/goals",
      action: "Open Goals",
    };
  }
  if (positions.length === 0) {
    return {
      title: "Choose what you might buy",
      why: "Read what each investment is and what it holds before any of your money goes into it.",
      href: "/studio/research",
      action: "Open Research",
    };
  }
  if (Math.abs(calculation.totalWeightPct - 100) > 0.01) {
    return {
      title: "Finish deciding how much goes where",
      why: `Your percentages total ${pct(calculation.totalWeightPct)}. Anything not assigned stays in cash, so make that a choice rather than a leftover.`,
      href: "/studio/portfolio",
      action: "Open Portfolio",
    };
  }
  const { contributionRule, sellRule, guardrails } = project.rules;
  if (!contributionRule.trim() && !sellRule.trim() && !guardrails.trim()) {
    return {
      title: "Write the rules you will follow",
      why: "Deciding now, while nothing is happening, is easier than deciding in the middle of a fall.",
      href: "/studio/review",
      action: "Open Review",
    };
  }
  return {
    title: "Check the risk and the cost",
    why: "Try a fall you choose and see what it would cost, before any money moves.",
    href: "/studio/portfolio/risk",
    action: "Open Risk and cost",
  };
}

const newestFirst = <T extends { updatedAt: string }>(items: T[]) =>
  [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

/**
 * The workspace's home: a worklist rather than a dashboard. Everything on it
 * comes from work saved in this browser. There is no sample content, so a new
 * portfolio shows exactly how little has been done, and says what to do first.
 */
export default function OverviewView() {
  const { project, calculation, session } = useWorkspace();
  if (!project || !calculation) return session.status === "loading" ? <WorkWaiting /> : null;

  const step = suggest(project, calculation);
  const positions = workingAlternative(project)?.positions ?? [];
  const held = new Set(positions.map((position) => position.instrumentId));
  const companies = newestFirst(project.investigations);
  const investments = newestFirst(project.candidates);
  const { purpose, horizonYears, budget, monthlyContribution } = project.goal;

  return (
    <div className="max-w-3xl space-y-8">
      <StageHeading as="h1" eyebrow="Overview" title="Pick up where you left off">
        Everything here comes from work saved in this browser.
      </StageHeading>

      <OtherPortfolio />

      <section aria-labelledby="overview-goal" className="border-b border-[var(--ops-divider)] pb-6">
        <h2 id="overview-goal" className="text-[13px] font-medium text-[var(--ops-text-tertiary)]">
          What this money is for
        </h2>
        <p className="mt-1 text-[20px] font-semibold leading-8 text-[var(--ops-text-primary)]">
          {purpose.trim() || "Not written yet"}
        </p>
        <p className="mt-1 text-[14px] text-[var(--ops-text-secondary)]">
          {horizonYears} {horizonYears === 1 ? "year" : "years"} · {usdWhole(budget)} available
          {monthlyContribution > 0 ? ` · ${usdWhole(monthlyContribution)} added each month` : ""}
        </p>
        <Link href="/studio/goals" className="mt-2 inline-block text-[14px] font-medium text-[var(--ops-accent-strong)] hover:underline">
          Change it in Goals
        </Link>
      </section>

      <section aria-labelledby="overview-next" className="rounded-2xl border border-[rgb(0_102_204/0.3)] bg-[var(--ops-accent-soft)] p-5">
        <h2 id="overview-next" className="text-[13px] font-medium text-[var(--ops-accent-strong)]">
          A suggested next step
        </h2>
        <p className="mt-1 text-[18px] font-semibold text-[var(--ops-text-primary)]">{step.title}</p>
        <p className="mt-1 max-w-prose text-[14px] leading-6 text-[var(--ops-text-secondary)]">{step.why}</p>
        <Link
          href={step.href}
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[var(--ops-accent-strong)] px-5 text-[14px] font-semibold text-[#ffffff] hover:bg-[#0058b0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]"
        >
          {step.action}
        </Link>
      </section>

      <section aria-labelledby="overview-companies">
        <h2 id="overview-companies" className="text-[17px] font-semibold text-[var(--ops-text-primary)]">
          Companies you have looked into
        </h2>
        {companies.length ? (
          <ul className="mt-2 divide-y divide-[var(--ops-divider)] border-y border-[var(--ops-divider)]">
            {companies.map((item) => {
              const entered = Object.keys(item.figures).length;
              return (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <Link
                    href={`/studio/investigate?company=${encodeURIComponent(item.id)}`}
                    className="flex min-h-11 items-center text-[15px] font-medium text-[var(--ops-accent-strong)] hover:underline"
                  >
                    {item.company.trim() || "Unnamed company"}
                  </Link>
                  <span className="text-[13px] tabular-nums text-[var(--ops-text-tertiary)]">
                    {entered === FIGURES.length ? "All seven figures entered" : `${entered} of ${FIGURES.length} figures entered`}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-[14px] leading-6 text-[var(--ops-text-secondary)]">
            None yet.{" "}
            <Link href="/studio/investigate" className="font-medium text-[var(--ops-accent-strong)] hover:underline">
              Investigate a company
            </Link>{" "}
            you care about, using seven figures from its annual report.
          </p>
        )}
      </section>

      <section aria-labelledby="overview-investments">
        <h2 id="overview-investments" className="text-[17px] font-semibold text-[var(--ops-text-primary)]">
          Investments you have read about
        </h2>
        {investments.length ? (
          <ul className="mt-2 divide-y divide-[var(--ops-divider)] border-y border-[var(--ops-divider)]">
            {investments.map((candidate) => {
              const instrument = findStudioInstrument(candidate.instrumentId);
              const inPortfolio = held.has(candidate.instrumentId);
              return (
                <li key={candidate.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <span className="min-w-0">
                    <span className="text-[15px] font-semibold text-[var(--ops-text-primary)]">
                      {instrument?.symbol ?? candidate.instrumentId}
                    </span>{" "}
                    <span className="text-[14px] text-[var(--ops-text-secondary)]">{instrument?.name ?? ""}</span>
                  </span>
                  <span className="text-[13px] text-[var(--ops-text-tertiary)]">
                    {inPortfolio ? "In your portfolio" : "Not in your portfolio; your notes are kept"}
                    {" · "}
                    {candidate.why.trim() ? "Reason written" : "No reason written yet"}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-[14px] leading-6 text-[var(--ops-text-secondary)]">
            None yet.{" "}
            <Link href="/studio/research" className="font-medium text-[var(--ops-accent-strong)] hover:underline">
              Open Research
            </Link>{" "}
            to read what each investment is and what it holds.
          </p>
        )}
      </section>
    </div>
  );
}

/**
 * Says when the other portfolio holds work, because the two are stored
 * separately and nothing on this page would otherwise show it. Reads only.
 */
function OtherPortfolio() {
  const { mode, switchMode } = useWorkspace();
  const other: StudioMode = mode === "practice" ? "personal" : "practice";
  const [hasWork, setHasWork] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const storage = createIndexedDbProjectStorage();
    storage
      .read(other)
      .then((result) => {
        if (cancelled) return;
        if (result.ok && result.value) {
          setHasWork(holdsWork(result.value.raw));
          return;
        }
        // Practice work from the old six-step form moves across the first time
        // the practice portfolio is opened. Until then it lives here.
        let legacy: string | null = null;
        try {
          legacy = other === "practice" ? window.localStorage.getItem(STUDIO_STORAGE_KEY) : null;
        } catch {
          legacy = null;
        }
        setHasWork(legacy !== null);
      })
      .catch(() => {
        if (!cancelled) setHasWork(false);
      })
      .finally(() => storage.close());
    return () => {
      cancelled = true;
    };
  }, [other]);

  if (!hasWork) return null;
  return (
    <p className="rounded-xl border border-[var(--ops-divider)] bg-[var(--ops-surface)] px-4 py-3 text-[14px] leading-6 text-[var(--ops-text-secondary)]">
      Your {other === "practice" ? "practice portfolio" : "own portfolio"} also has saved work.{" "}
      <button
        type="button"
        onClick={() => switchMode(other)}
        className="font-medium text-[var(--ops-accent-strong)] underline-offset-2 hover:underline"
      >
        Open it
      </button>
    </p>
  );
}
