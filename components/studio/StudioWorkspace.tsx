"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { STUDIO_GUIDANCE, type StudioGuidanceKey } from "@/lib/studio-guidance";
import { useStudioPlan, type StudioMutationResult } from "@/lib/use-studio-plan";
import { BuildStage, BuyStage, GoalStage, ResearchStage, ReviewStage, RiskStage, type StageProps } from "./stages";
import { GuidancePanel, Notice, Panel, Stat, pct, usdWhole } from "./shared";

/**
 * The six destinations.
 *
 * `label` is what the sidebar says and `short` is what fits a phone tab bar;
 * the page's own heading carries the full sentence either way, so shortening
 * "Risk and cost" to "Risk" in the bar loses nothing a learner needs.
 */
const STAGES: {
  key: StudioGuidanceKey;
  label: string;
  short: string;
  render: (props: StageProps) => JSX.Element;
}[] = [
  { key: "goal", label: "Goal", short: "Goal", render: (props) => <GoalStage {...props} /> },
  { key: "research", label: "Research", short: "Research", render: (props) => <ResearchStage {...props} /> },
  { key: "build", label: "Build", short: "Build", render: (props) => <BuildStage {...props} /> },
  { key: "risk", label: "Risk and cost", short: "Risk", render: (props) => <RiskStage {...props} /> },
  { key: "buy", label: "Buying", short: "Buying", render: (props) => <BuyStage {...props} /> },
  { key: "review", label: "Rules", short: "Rules", render: (props) => <ReviewStage {...props} /> },
];

export default function StudioWorkspace() {
  const { ready, loadState, plan, calculation, update, importBackup, reset } = useStudioPlan();
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

  const goTo = useCallback(
    (index: number) => {
      const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, index))];
      // `scroll: false` because the work is already on screen; jumping to the
      // top on every move would lose the reader's place in a long step.
      router.push(`${pathname}?view=${next.key}`, { scroll: false });
    },
    [pathname, router],
  );

  // A failed write must not look like a successful one, so every mutation's
  // result is surfaced rather than assumed.
  const report = (result: StudioMutationResult): StudioMutationResult => {
    setMessage(result.ok ? null : result.error);
    return result;
  };

  const stageProps: StageProps = {
    plan,
    calculation,
    update: (change) => report(update(change)),
    importBackup: (text) => report(importBackup(text)),
    reset: () => {
      const result = report(reset());
      if (result.ok) goTo(0);
      return result;
    },
  };

  const stage = STAGES[stageIndex];
  const assigned = pct(calculation.totalWeightPct);
  const fullyAssigned = Math.abs(calculation.totalWeightPct - 100) <= 0.01;

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-st-side" />
        <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-st-paper" />
        <div className="mt-10 h-64 animate-pulse rounded-2xl bg-st-side" />
      </div>
    );
  }

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

      {loadState.status === "blocked" ? (
        <div className="mt-5">
          <Notice tone="red" title="Your saved portfolio could not be read">
            {loadState.error} Studio has started an empty portfolio and left the original untouched, so nothing is lost.
          </Notice>
        </div>
      ) : null}
      {loadState.status === "memory" ? (
        <div className="mt-5">
          <Notice tone="amber" title="This browser is not saving your work">
            {loadState.error}
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
      <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded-xl border border-st-hair bg-st-paper px-4 py-3 text-[13px] xl:hidden">
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
                  onClick={() => goTo(index)}
                  aria-current={index === stageIndex ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[14px] font-medium transition-colors",
                    index === stageIndex
                      ? "bg-st-blue-soft text-st-blue"
                      : "text-st-muted hover:bg-st-paper hover:text-st-ink",
                  )}
                >
                  <span className="tabular-nums text-[12px] opacity-70">{index + 1}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-st-hair px-3 pt-3 text-[12px] leading-5 text-st-faint">
            {plan.mode === "practice" ? "Practice portfolio" : "Your own portfolio"}
            <br />
            {loadState.status === "memory" ? "Not saving in this browser" : "Saved in this browser"}
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
            <span className="text-[13px] text-st-faint">
              Step {stageIndex + 1} of {STAGES.length}
            </span>
            {/* The step number is printed once, here. Repeating it as an eyebrow
                over the heading below was the same fact twice in 40px. */}
            <span className="ml-auto text-[13px] text-st-faint">
              {loadState.status === "memory" ? "Not saving" : "Saved in this browser"}
            </span>
          </div>
          <GuidancePanel guidance={STUDIO_GUIDANCE[stage.key]} />
          {stage.render(stageProps)}

          <div className="flex items-center justify-between gap-3 border-t border-st-hair pt-5">
            <button
              type="button"
              disabled={stageIndex === 0}
              onClick={() => goTo(stageIndex - 1)}
              className="min-h-11 rounded-full border border-st-bound px-5 text-[14px] font-medium text-st-sub disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={stageIndex === STAGES.length - 1}
              onClick={() => goTo(stageIndex + 1)}
              className="min-h-11 rounded-full border border-st-blue-edge bg-st-blue-soft px-5 text-[14px] font-semibold text-st-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stageIndex === STAGES.length - 1 ? "Finished" : `Next: ${STAGES[stageIndex + 1]?.label}`} →
            </button>
          </div>
        </div>

        {/* Beside the work, never under it: a weight change is never made
            without its consequence on screen. */}
        <aside className="hidden xl:sticky xl:top-24 xl:block">
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
                onClick={() => goTo(index)}
                aria-current={index === stageIndex ? "page" : undefined}
                className={cn(
                  "flex min-h-11 w-full flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors",
                  index === stageIndex ? "text-st-blue" : "text-st-faint hover:text-st-ink",
                )}
              >
                <span className="tabular-nums text-[10px] opacity-70">{index + 1}</span>
                <span>{item.short}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
