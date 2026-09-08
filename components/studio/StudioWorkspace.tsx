"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { STUDIO_GUIDANCE, type StudioGuidanceKey } from "@/lib/studio-guidance";
import { calculateStudio } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { useStudioProject } from "@/lib/use-studio-project";
import type { ProjectSessionState } from "@/lib/studio-project/session";
import { applyPlanChange, projectToPlan } from "@/lib/studio-project/workspace";
import {
  BuildStage,
  BuyStage,
  GoalStage,
  OverviewStage,
  ResearchStage,
  ReviewStage,
  RiskStage,
  type StageProps,
  type StageResult,
  type StudioDestination,
} from "./stages";
import { GuidancePanel, Notice, Panel, Stat, pct, usdWhole } from "./shared";

/**
 * Which portfolio the workspace opens.
 *
 * Practice, because that is what every portfolio saved by the previous version
 * already is: `createStudioPlan` defaulted to it and this screen never offered
 * a way to change it, so every learner who has ever used Studio has a practice
 * portfolio whether or not they meant to. Opening anything else here would
 * leave all of that work behind a mode nobody chose.
 *
 * The investigation view still opens `personal`, so the two surfaces remain
 * separate portfolios. Reconciling them is a product decision about what the
 * words should mean, not a storage one, and it is deliberately not made here.
 */
const STUDIO_MODE = "practice" as const;

/**
 * What the workspace says about the state of the work.
 *
 * The previous version had two answers -- saved, or not saving at all -- because
 * localStorage acknowledged a write before `setItem` returned and there was
 * nothing in between to describe. The project session distinguishes states that
 * genuinely differ, and collapsing them back into a binary would throw away the
 * honesty it exists to provide: a write still in flight is not a write that
 * landed, and a write refused because another tab moved first is not a browser
 * that cannot save.
 */
const SAVE_STATE: Record<ProjectSessionState["status"], { label: string; warn: boolean }> = {
  loading: { label: "Opening", warn: false },
  ready: { label: "Saved in this browser", warn: false },
  saving: { label: "Saving…", warn: false },
  unsaved: { label: "Not saved", warn: true },
  conflict: { label: "Changed in another tab", warn: true },
  blocked: { label: "Cannot save", warn: true },
  unavailable: { label: "Not saving", warn: true },
  closed: { label: "Not saving", warn: true },
};

/**
 * The seven destinations.
 *
 * `label` is what the sidebar says and `short` is what fits a phone tab bar;
 * the page's own heading carries the full sentence either way, so shortening
 * "Risk and cost" to "Risk" in the bar loses nothing a learner needs.
 *
 * `guidance` is optional. Overview is a place you read rather than a step you
 * work, so it has no "before you start" definition to show -- and it is not
 * numbered for the same reason: it is not part of the sequence, it is where the
 * sequence is picked up.
 */
const STAGES: {
  key: StudioDestination;
  label: string;
  short: string;
  guidance?: StudioGuidanceKey;
  step?: number;
  render: (props: StageProps & { goTo: (key: StudioDestination) => void }) => JSX.Element;
}[] = [
  { key: "overview", label: "Overview", short: "Overview", render: (props) => <OverviewStage {...props} /> },
  { key: "goal", label: "Goal", short: "Goal", guidance: "goal", step: 1, render: (props) => <GoalStage {...props} /> },
  { key: "research", label: "Research", short: "Research", guidance: "research", step: 2, render: (props) => <ResearchStage {...props} /> },
  { key: "build", label: "Build", short: "Build", guidance: "build", step: 3, render: (props) => <BuildStage {...props} /> },
  { key: "risk", label: "Risk and cost", short: "Risk", guidance: "risk", step: 4, render: (props) => <RiskStage {...props} /> },
  { key: "buy", label: "Buying", short: "Buying", guidance: "buy", step: 5, render: (props) => <BuyStage {...props} /> },
  { key: "review", label: "Rules", short: "Rules", guidance: "review", step: 6, render: (props) => <ReviewStage {...props} /> },
];

const STEP_COUNT = STAGES.filter((item) => item.step).length;

export default function StudioWorkspace() {
  const session = useStudioProject(STUDIO_MODE);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);

  /*
   * The open destination lives in the URL rather than in component state.
   *
   * That is what makes a destination something you can link to, return to, and
   * leave with the browser's own Back button -- the three things §3 asks for
   * and the thing a linear `stageIndex` could not give. An unknown or absent
   * value falls back to the first destination rather than rendering nothing.
   */
  const stageIndex = useMemo(() => {
    const view = params.get("view");
    const found = STAGES.findIndex((item) => item.key === view);
    return found === -1 ? 0 : found;
  }, [params]);

  const goToIndex = useCallback(
    (index: number) => {
      const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, index))];
      // `scroll: false` because the work is already on screen; jumping to the
      // top on every move would lose the reader's place in a long step.
      router.push(`${pathname}?view=${next.key}`, { scroll: false });
    },
    [pathname, router],
  );

  const goTo = useCallback(
    (key: StudioDestination) => {
      router.push(`${pathname}?view=${key}`, { scroll: false });
    },
    [pathname, router],
  );

  /*
   * The stages still read and write a plan.
   *
   * `projectToPlan` renders the project as one and `applyPlanChange` applies an
   * edit written against it, so the six steps, the calculator and every figure
   * on this page carry on working against the shape they were built for. The
   * arithmetic in lib/studio.ts is not ported, which is the point: a schema
   * change is not a licence to rewrite the sums a learner is being taught.
   */
  const plan = useMemo(() => (session.project ? projectToPlan(session.project) : null), [session.project]);
  const calculation = useMemo(() => (plan ? calculateStudio(plan, STUDIO_CATALOG) : null), [plan]);

  // A failed write must not look like a successful one, so every mutation's
  // result is surfaced rather than assumed. Awaited now: storage answers later.
  const report = useCallback(async (pending: Promise<StageResult>): Promise<StageResult> => {
    const result = await pending;
    setMessage(result.ok ? null : result.error);
    return result;
  }, []);

  const stage = STAGES[stageIndex];
  const save = SAVE_STATE[session.status];

  if (!plan || !calculation) {
    /*
     * An unreadable record is not an empty one.
     *
     * The previous version started a blank portfolio and carried on, which is
     * only safe while the original is a single localStorage string it has
     * decided not to touch. The session refuses to open at all instead, and
     * keeps the original verbatim -- so there is something to say here rather
     * than a skeleton that never resolves.
     */
    if (session.status === "blocked" || session.status === "unavailable") {
      return (
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <Notice tone="red" title="Your saved portfolio could not be opened">
            {session.error} Its original has been kept exactly as it was, and nothing has replaced it.
          </Notice>
          <button
            type="button"
            onClick={() => void session.reload()}
            className="mt-5 min-h-11 rounded-full border border-st-blue-edge bg-st-blue-soft px-5 text-[14px] font-semibold text-st-blue"
          >
            Try again
          </button>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-st-side" />
        <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-st-paper" />
        <div className="mt-10 h-64 animate-pulse rounded-2xl bg-st-side" />
      </div>
    );
  }

  const stageProps: StageProps = {
    plan,
    calculation,
    update: (change) => report(session.update((project) => applyPlanChange(project, change))),
    importBackup: (text) => report(session.importBackup(text)),
    reset: async () => {
      const result = await report(session.reset());
      if (result.ok) goTo("overview");
      return result;
    },
  };

  const assigned = pct(calculation.totalWeightPct);
  const fullyAssigned = Math.abs(calculation.totalWeightPct - 100) <= 0.01;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-6 sm:px-8 sm:pt-8 lg:pb-8">
      <header>
        <div className="ops-eyebrow flex flex-wrap items-center gap-3 text-xs">
          <span>Studio</span>
          <span className="h-px w-8 bg-st-bound" />
          <span className="text-st-blue">
            {plan.mode === "practice" ? "Practice portfolio" : "Your own portfolio"}
          </span>
        </div>
        <h1 className="ops-display mt-3 text-3xl leading-[1.05] sm:text-4xl">Build a portfolio you can explain</h1>
        <p className="ops-body mt-2 max-w-2xl text-[15px] leading-6 text-st-sub">
          Six steps, one saved portfolio. No course required; nothing leaves this browser.
        </p>
      </header>

      {/* Another tab wrote a newer version. It is announced rather than adopted:
          taking it silently would replace work this tab may be in the middle of,
          so loading it is a decision the person makes. */}
      {session.externalChange ? (
        <div className="mt-5">
          <Notice tone="amber" title="This portfolio changed in another tab">
            The version saved in this browser is newer than the one on screen.
            <button
              type="button"
              onClick={() => void report(session.reload())}
              className="ml-2 min-h-11 text-[14px] font-semibold text-st-blue underline underline-offset-2"
            >
              Load the newer version
            </button>
          </Notice>
        </div>
      ) : null}
      {message ? (
        <div className="mt-5">
          <Notice tone="red" title="That change was not saved">
            {message}
          </Notice>
        </div>
      ) : null}

      {/* Narrow screens get the portfolio as one line above the work. The full
          panel stacked underneath added a screen of scroll on its own, which is
          what the screen budget forbids. */}
      <div
        className={cn(
          "mt-4 flex-wrap items-baseline gap-x-5 gap-y-1 rounded-xl border border-st-hair bg-st-paper px-4 py-3 text-[13px] xl:hidden",
          stage.step ? "flex" : "hidden",
        )}
      >
        <span className="text-st-faint">
          To invest <span className="tabular-nums text-st-ink">{usdWhole(calculation.investableBudget)}</span>
        </span>
        <span className="text-st-faint">
          Assigned{" "}
          <span className={cn("tabular-nums", fullyAssigned ? "text-st-good" : "text-st-warn")}>
            {assigned}
          </span>
        </span>
        <span className="text-st-faint">
          Investments <span className="tabular-nums text-st-ink">{plan.holdings.length}</span>
        </span>
      </div>

      {/*
       * Sidebar from 1024, the summary rail only from 1280.
       *
       * All three columns at 1024 would leave the work about 450px wide, which
       * is narrower than the form it has to hold. Apple's own guidance is that
       * a sidebar "requires a large amount of vertical and horizontal space" --
       * so the rail that is reference rather than work is the one that waits
       * for the width, and until then the portfolio total rides in the strip
       * above the work.
       */}
      <div className="mt-5 grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[13rem_minmax(0,1fr)_17rem]">
        <nav aria-label="Studio destinations" className="hidden lg:sticky lg:top-24 lg:block">
          <ol className="flex flex-col gap-0.5">
            {STAGES.map((item, index) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => goToIndex(index)}
                  aria-current={index === stageIndex ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] font-medium transition-colors",
                    index === stageIndex
                      ? "bg-st-blue-soft text-st-blue"
                      : "text-st-muted hover:bg-st-paper hover:text-st-ink",
                  )}
                >
                  <span className="w-3 tabular-nums text-[12px] opacity-70">{item.step ?? ""}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-st-hair px-3 pt-3 text-[12px] leading-5 text-st-faint">
            {plan.mode === "practice" ? "Practice portfolio" : "Your own portfolio"}
            <br />
            <span className={cn(save.warn && "text-st-warn")}>{save.label}</span>
          </p>
        </nav>

        <div className="min-w-0 space-y-4">
          {/*
           * Apple lists the title of the current view as one of the three
           * things a toolbar carries. With six destinations reachable in any
           * order it is also the only thing that says where you are once the
           * page has scrolled.
           */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-st-hair pb-3">
            <span className="text-[15px] font-semibold text-st-ink">{stage.label}</span>
            {stage.step ? (
              <span className="text-[13px] text-st-faint">
                Step {stage.step} of {STEP_COUNT}
              </span>
            ) : null}
            {/* The step number is printed once, here. Repeating it as an eyebrow
                over the heading below was the same fact twice in 40px. */}
            <span className={cn("ml-auto text-[13px]", save.warn ? "text-st-warn" : "text-st-faint")}>
              {save.label}
            </span>
          </div>
          {stage.guidance ? <GuidancePanel guidance={STUDIO_GUIDANCE[stage.guidance]} /> : null}
          {stage.render({ ...stageProps, goTo })}

          <div
            className={cn(
              "items-center justify-between gap-3 border-t border-st-hair pt-5",
              stage.step ? "flex" : "hidden",
            )}
          >
            <button
              type="button"
              disabled={stageIndex === 0}
              onClick={() => goToIndex(stageIndex - 1)}
              className="min-h-11 rounded-full border border-st-bound px-5 text-[14px] font-medium text-st-sub disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={stageIndex === STAGES.length - 1}
              onClick={() => goToIndex(stageIndex + 1)}
              className="min-h-11 rounded-full border border-st-blue-edge bg-st-blue-soft px-5 text-[14px] font-semibold text-st-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stageIndex === STAGES.length - 1 ? "Finished" : `Next: ${STAGES[stageIndex + 1]?.label}`} →
            </button>
          </div>
        </div>

        {/* Beside the work, never under it: a weight change is never made
            without its consequence on screen. Overview is excluded: it edits
            nothing and reports the same figures itself, with more detail. */}
        <aside className={cn("hidden xl:sticky xl:top-24", stage.step ? "xl:block" : "xl:hidden")}>
          <Panel>
            <div className="ops-caption text-[11px] text-st-faint">Your portfolio</div>
            <div className="mt-3 space-y-3">
              <Stat label="To invest" value={usdWhole(calculation.investableBudget)} />
              <Stat
                label="Assigned"
                value={assigned}
                detail={fullyAssigned ? "Fully assigned" : "Needs to total 100%"}
              />
              <Stat label="Investments" value={String(plan.holdings.length)} />
              <Stat label="Held as cash" value={usdWhole(calculation.targetCash)} />
            </div>
            {calculation.issues.length > 0 ? (
              <ul className="mt-4 space-y-1 border-t border-st-hair pt-3">
                {calculation.issues.slice(0, 3).map((issue) => (
                  <li key={issue} className="text-[13px] leading-5 text-st-warn">
                    {issue}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-4 border-t border-st-hair pt-3 text-[12px] leading-5 text-st-faint">
              Saved in this browser only. Educational planning, not investment advice, and no orders are ever sent.
            </p>
          </Panel>
        </aside>
      </div>

      {/*
       * Below the sidebar's width, a tab bar rather than a menu.
       *
       * Apple's guidance is explicit that when space is limited "a more compact
       * control such as a tab bar may provide a better navigation experience",
       * and a menu would hide every destination behind a tap and cost a step on
       * each switch. It is sticky rather than fixed so it cannot cover the last
       * field of a form, and the work above reserves room for it.
       */}
      <nav
        aria-label="Studio destinations"
        className="sticky bottom-0 z-30 -mx-5 border-t border-st-hair bg-st-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:-mx-8 lg:hidden"
      >
        <ol className="flex">
          {STAGES.map((item, index) => (
            <li key={item.key} className="flex-1">
              <button
                type="button"
                onClick={() => goToIndex(index)}
                aria-current={index === stageIndex ? "page" : undefined}
                className={cn(
                  "flex min-h-11 w-full flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors",
                  index === stageIndex ? "text-st-blue" : "text-st-faint hover:text-st-ink",
                )}
              >
                <span className="tabular-nums text-[10px] opacity-70">{item.step ?? "·"}</span>
                <span>{item.short}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
