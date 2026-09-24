"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  RESEARCH_STEPS,
  pathCompany,
  stepAfter,
  stepHref,
  stepNumber,
  stepStatuses,
  type ResearchStep,
  type StepKey,
} from "@/lib/studio-project/research-path";
import { useWorkspace } from "./WorkspaceProvider";

/**
 * Where a learner is in researching a company, and where to go next.
 *
 * Drawn by the frame above every page on the path, so the eight pages cannot
 * each say it differently. From 768px it stays in view under the site header
 * while the page scrolls: the moment someone finishes a step is at the bottom
 * of the page, which is exactly when a Next at the top would have scrolled
 * away. On a phone it is two rows, and held there it would cover a sixth of
 * the screen, so it scrolls with the page.
 *
 * One row: the eight steps, which one this is and for which company, and the
 * one thing to press next. The caption gives way to the button — it truncates
 * rather than wraps, because a caption that wrapped took the bar to two rows.
 */
export function ResearchStepBar({ step }: { step: ResearchStep }) {
  const { project } = useWorkspace();
  const company = pathCompany(project);
  const statuses = stepStatuses(project, company);
  const number = stepNumber(step.key);
  const after = stepAfter(step.key);
  const numbers = RESEARCH_STEPS.find((item) => item.key === "numbers")!;

  // A step that needs a company, reached before there is one, points back to
  // where a company is chosen rather than onward to another page that cannot
  // be used yet either.
  const blocked = step.needsCompany && !company;
  const next = blocked
    ? { href: numbers.href, label: "First, choose a company", short: "Choose a company" }
    : after
      ? { href: stepHref(after, company), label: `Next: ${after.title}`, short: `Next: ${after.short}` }
      : afterDeciding(statuses.decide.note);

  return (
    <nav
      aria-label={`Research steps: step ${number} of ${RESEARCH_STEPS.length}`}
      className="z-30 -mx-1 mb-3 border-b border-[var(--ops-divider)] bg-[var(--ops-bg)] px-1 py-1.5 md:sticky md:top-[69px]"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:flex-nowrap">
        <ol className="flex shrink-0 items-center" aria-label={`Step ${number} of ${RESEARCH_STEPS.length}`}>
          {RESEARCH_STEPS.map((item, index) => {
            const current = item.key === step.key;
            const status = statuses[item.key];
            const label = `Step ${index + 1}: ${item.title}${status.note ? `. ${status.note}` : ""}${status.done ? ". Done" : ""}`;
            return (
              <li key={item.key} className="flex items-center">
                {index > 0 ? <span aria-hidden="true" className="h-px w-1.5 bg-st-hair sm:w-2.5" /> : null}
                <Link
                  href={stepHref(item, company)}
                  aria-current={current ? "step" : undefined}
                  aria-label={label}
                  title={label}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full border text-[12px] font-semibold tabular-nums transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]",
                    current
                      ? "border-2 border-st-blue-edge bg-st-select text-st-ink"
                      : status.done
                        ? "border-st-good-edge bg-st-good-soft text-st-good"
                        : "border-st-hair bg-st-paper text-st-muted hover:border-st-bound hover:text-st-body",
                  )}
                >
                  {status.done && !current ? <span aria-hidden="true">✓</span> : index + 1}
                </Link>
              </li>
            );
          })}
        </ol>
        {/* Truncated rather than wrapped: a caption that wrapped took the bar to
            two rows beside a long Next. Phones draw only the circles and Next. */}
        <p className="hidden min-w-0 flex-1 truncate text-[13px] text-st-muted md:block">
          Step {number} of {RESEARCH_STEPS.length}
          {company && number >= stepNumber("numbers") ? (
            <>
              {" "}
              · <span className="text-st-body">{company.company.trim() || "Unnamed company"}</span>
            </>
          ) : null}
        </p>
        <Link
          href={next.href}
          className="ml-auto inline-flex min-h-9 shrink-0 items-center rounded-full bg-st-blue-edge px-4 text-[13px] font-semibold text-[#fff] transition-colors hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]"
        >
          <span className="md:hidden">{next.short}</span>
          <span className="hidden md:inline">{next.label}</span>
          <span aria-hidden="true" className="ml-1.5">
            →
          </span>
        </Link>
      </div>
    </nav>
  );
}

/**
 * Where the last step leads, which depends on what was decided.
 *
 * Before a decision the one thing to do is make it, on this page. A company
 * added to the portfolio goes on to how much of it to hold; one turned down
 * leaves the learner free to research another.
 */
function afterDeciding(decided: string): { href: string; label: string; short: string } {
  if (decided === "held") return { href: "/studio/portfolio", label: "Next: decide how much goes where", short: "Next: Portfolio" };
  if (decided === "turned down") return { href: "/studio/investigate", label: "Next: research another company", short: "Another company" };
  return { href: "#decision", label: "Record your decision below", short: "Decide below" };
}

/**
 * Beside the work from 1280px: what is saved for this step, and what comes
 * after it. In place of the Research section's general definition, which was
 * the same paragraph about funds and depositary receipts on every page and said
 * nothing about the page it sat beside.
 */
export function StepAside({ step }: { step: ResearchStep }) {
  const { project } = useWorkspace();
  const company = pathCompany(project);
  const status = stepStatuses(project, company)[step.key];
  const after = stepAfter(step.key);
  return (
    <div className="border-l-2 border-st-blue-edge pl-4 sm:pl-5">
      <div className="ops-caption text-[12px] text-st-blue">
        Step {stepNumber(step.key)} of {RESEARCH_STEPS.length}
      </div>
      {/* What to do is under the page's heading; this says what is saved and
          what comes after, beside the work while it scrolls. */}
      {step.needsCompany && !company ? (
        <p className="mt-2 text-[13px] leading-5 text-st-muted">
          This step needs a company.{" "}
          <Link href="/studio/investigate" className="font-semibold text-st-blue hover:underline">
            Choose one in step 3
          </Link>
          .
        </p>
      ) : status.note ? (
        <p className="mt-2 text-[13px] leading-5 text-st-muted">
          Saved so far: <span className="text-st-body">{status.note}</span>
          {status.done ? <span className="text-st-good"> ✓</span> : null}
        </p>
      ) : null}
      {after ? (
        <p className="mt-2 text-[13px] leading-5 text-st-muted">
          When you are done:{" "}
          <Link href={stepHref(after, company)} className="font-semibold text-st-blue hover:underline">
            {after.title}
          </Link>
        </p>
      ) : status.done ? (
        <p className="mt-2 text-[13px] leading-5 text-st-muted">
          Next:{" "}
          <Link href={afterDeciding(status.note).href} className="font-semibold text-st-blue hover:underline">
            {afterDeciding(status.note).label.replace(/^Next: /, "")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

/**
 * A research page's heading: the step's name, and what to do on it.
 *
 * Taken from the path rather than written on each page, so the name in the
 * step bar, on the Research page and at the top of the page is one name. What
 * follows `todo` is the page's own, such as the paper's term for what it shows.
 */
export function StepHeading({ step: key, children }: { step: StepKey; children?: ReactNode }) {
  const step = RESEARCH_STEPS.find((item) => item.key === key)!;
  // StageHeading's type and colour, with the instruction set a little tighter:
  // the step bar above costs every research page a row, and the instruction is
  // read once rather than studied.
  return (
    <div>
      <h1 className="ops-display text-2xl leading-tight text-white sm:text-3xl">{step.title}</h1>
      <p className="ops-body mt-2 max-w-2xl text-[15px] leading-6 text-slate-300">
        {step.todo}
        {children ? <> {children}</> : null}
      </p>
    </div>
  );
}

/**
 * What a step says before there is a company to work on.
 *
 * One sentence of what the step will do, and one button to the place a company
 * is chosen. It replaced four different sentences that each ended in "then
 * come back", which told a learner they were in the wrong place without making
 * the right one obvious.
 */
export function NeedsCompany({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-st-blue-edge/40 bg-st-select px-4 py-3">
      <p className="text-[14px] leading-6 text-st-body">
        <strong className="font-semibold text-st-ink">This step needs a company first.</strong> {children}
      </p>
      <Link
        href="/studio/investigate"
        className="mt-2 inline-flex min-h-11 items-center rounded-full bg-st-blue-edge px-4 text-[13px] font-semibold text-[#fff] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]"
      >
        Choose a company in step 3 <span aria-hidden="true" className="ml-1.5">→</span>
      </Link>
    </div>
  );
}
