"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { STUDIO_GUIDANCE, type StudioGuidanceKey } from "@/lib/studio-guidance";
import { useStudioPlan, type StudioMutationResult } from "@/lib/use-studio-plan";
import { BuildStage, BuyStage, GoalStage, ResearchStage, ReviewStage, RiskStage, type StageProps } from "./stages";
import { GuidancePanel, Notice, Panel, Stat, pct, usdWhole } from "./shared";

const STAGES: { key: StudioGuidanceKey; label: string; render: (props: StageProps) => JSX.Element }[] = [
  { key: "goal", label: "Goal", render: (props) => <GoalStage {...props} /> },
  { key: "research", label: "Research", render: (props) => <ResearchStage {...props} /> },
  { key: "build", label: "Build", render: (props) => <BuildStage {...props} /> },
  { key: "risk", label: "Risk and cost", render: (props) => <RiskStage {...props} /> },
  { key: "buy", label: "Buying", render: (props) => <BuyStage {...props} /> },
  { key: "review", label: "Rules", render: (props) => <ReviewStage {...props} /> },
];

export default function StudioWorkspace() {
  const { ready, loadState, plan, calculation, update, importBackup, reset } = useStudioPlan();
  const [stageIndex, setStageIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

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
      if (result.ok) setStageIndex(0);
      return result;
    },
  };

  const stage = STAGES[stageIndex];
  const assigned = pct(calculation.totalWeightPct);
  const fullyAssigned = Math.abs(calculation.totalWeightPct - 100) <= 0.01;

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-st-side" />
        <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-st-paper" />
        <div className="mt-10 h-64 animate-pulse rounded-2xl bg-st-side" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">
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

      {/*
        * The strip scrolls, and at 390 it was cut through the middle of the
        * fourth chip with nothing to say so -- it read as a broken row rather
        * than a scrollable one. The mask fades the cut edge instead, which is
        * the same affordance the lesson rail uses, and costs no markup inside
        * the scroller.
        */}
      <nav
        aria-label="Studio steps"
        className="mt-6 [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] sm:[mask-image:none]"
      >
        <ol className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STAGES.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => setStageIndex(index)}
                aria-current={index === stageIndex ? "step" : undefined}
                className={cn(
                  "min-h-11 whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors",
                  index === stageIndex
                    ? "border-st-blue-edge bg-st-blue-soft text-st-blue"
                    : "border-st-bound text-st-muted hover:border-st-bound hover:text-st-ink",
                )}
              >
                <span className="tabular-nums">{index + 1}</span>
                <span className="ml-2">{item.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Narrow screens get the portfolio as one line above the work. The full
          panel stacked underneath added a screen of scroll on its own, which is
          what the screen budget forbids. */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded-xl border border-st-hair bg-st-paper px-4 py-3 text-[13px] lg:hidden">
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

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <div className="min-w-0 space-y-4">
          <GuidancePanel guidance={STUDIO_GUIDANCE[stage.key]} />
          {stage.render(stageProps)}

          <div className="flex items-center justify-between gap-3 border-t border-st-hair pt-5">
            <button
              type="button"
              disabled={stageIndex === 0}
              onClick={() => setStageIndex((index) => Math.max(0, index - 1))}
              className="min-h-11 rounded-full border border-st-bound px-5 text-[14px] font-medium text-st-sub disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={stageIndex === STAGES.length - 1}
              onClick={() => setStageIndex((index) => Math.min(STAGES.length - 1, index + 1))}
              className="min-h-11 rounded-full border border-st-blue-edge bg-st-blue-soft px-5 text-[14px] font-semibold text-st-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stageIndex === STAGES.length - 1 ? "Finished" : `Next: ${STAGES[stageIndex + 1]?.label}`} →
            </button>
          </div>
        </div>

        {/* Beside the work, never under it: a weight change is never made
            without its consequence on screen. */}
        <aside className="hidden lg:sticky lg:top-24 lg:block">
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
    </div>
  );
}
