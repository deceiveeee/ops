"use client";

import { useId, useMemo } from "react";
import { deriveWorkbenchLifecycle } from "@/lib/portfolio-workbench";
import { usePortfolioWorkbench } from "@/lib/use-portfolio-workbench";
import { cn } from "@/lib/utils";

const LIFECYCLE = [
  { id: "mandate", label: "Mandate drafted" },
  { id: "allocation", label: "Policy coherent" },
  { id: "evidence", label: "Research checked" },
  { id: "architecture", label: "Architecture licensed" },
  { id: "holdings", label: "Products verified" },
  { id: "policy", label: "Operating plan ready" },
  { id: "graduation", label: "Portfolio complete" },
] as const;

const REACHED: Record<ReturnType<typeof deriveWorkbenchLifecycle>, number> = {
  draft: -1,
  "mandate-drafted": 0,
  "policy-coherent": 1,
  "research-checked": 2,
  "architecture-licensed": 3,
  "products-verified": 4,
  "operating-plan-ready": 5,
  "execute-ready": 6,
  "practice-complete": 6,
};

export default function WorkbenchCompanion({ compact = false }: { compact?: boolean }) {
  const titleId = useId();
  const {
    ready,
    loadState,
    activeCase,
    activeMode,
  } = usePortfolioWorkbench();
  const lifecycle = deriveWorkbenchLifecycle(activeCase);
  const reached = REACHED[lifecycle];
  const reviewCount = useMemo(
    () =>
      Object.values(activeCase.checkpoints).filter(
        (checkpoint) => checkpoint.status === "review-required",
      ).length,
    [activeCase.checkpoints],
  );

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-[24px] border border-white/10 bg-ink-900/80 shadow-panel"
    >
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[12px] font-semibold tracking-[0.01em] text-accent-cyan">
              Portfolio Workbench
            </div>
            <h2
              id={titleId}
              className="mt-1 text-[17px] font-semibold tracking-[-0.01em] text-white"
            >
              Build while you learn
            </h2>
          </div>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[12px] font-medium",
              reviewCount
                ? "border-accent-amber/30 bg-accent-amber/10 text-accent-amber"
                : "border-accent-green/30 bg-accent-green/10 text-accent-green",
            )}
          >
            {reviewCount ? `${reviewCount} review` : ready ? "Local" : "Loading"}
          </span>
        </div>

        {/* The mode toggle that sat here is gone. It flipped a global setting
            from every lesson page while nothing on that page changed to confirm
            it, so it read as inert. The choice itself is not lost: Mission 5's
            readiness runway asks it once, in context, with the consequence of
            each route spelled out. What remains is a label reporting which case
            the checkpoints below belong to, shown only when that is not the
            default. */}
        {activeMode === "practice" && (
          <div className="mt-3 text-[12px] font-medium text-slate-400">
            Practice case
          </div>
        )}
      </div>

      <div className="px-5 py-4">
        {loadState.kind !== "ok" && (
          <div className="mb-4 rounded-xl border border-accent-amber/30 bg-accent-amber/10 p-3 text-[12px] leading-5 text-accent-amber">
            The saved Workbench needs review. Its original local record has been preserved.
          </div>
        )}

        {compact ? (
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[12px] text-slate-500">
                  {reached >= LIFECYCLE.length - 1 ? "Current state" : "Next checkpoint"}
                </div>
                <div className="mt-1 text-[14px] font-semibold text-white">
                  {LIFECYCLE[Math.min(reached + 1, LIFECYCLE.length - 1)].label}
                </div>
              </div>
              <div className="text-[13px] font-semibold tabular-nums text-accent-cyan">
                {Math.max(0, reached + 1)} / {LIFECYCLE.length}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label={`${Math.max(0, reached + 1)} of ${LIFECYCLE.length} portfolio checkpoints reached`}>
              {LIFECYCLE.map((item, index) => (
                <span
                  key={item.id}
                  className={cn(
                    "h-1.5 rounded-full",
                    index <= reached ? "bg-accent-green" : index === reached + 1 ? "bg-accent-cyan" : "bg-white/10",
                  )}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        ) : <ol className="space-y-1">
          {LIFECYCLE.map((item, index) => {
            const checkpoint = item.id === "graduation" ? null : activeCase.checkpoints[item.id];
            const review = checkpoint?.status === "review-required";
            const done = index <= reached && !review;
            const current = index === Math.min(reached + 1, LIFECYCLE.length - 1);
            return (
              <li key={item.id} className="flex min-h-9 items-center gap-3">
                <span
                  className={cn(
                    "flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[12px] font-semibold",
                    review
                      ? "border-accent-amber/30 bg-accent-amber/10 text-accent-amber"
                      : done
                        ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                        : current
                          ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan"
                          : "border-white/10 bg-white/[0.03] text-slate-500",
                  )}
                  aria-hidden
                >
                  {review ? "!" : done ? "✓" : index + 1}
                </span>
                <span
                  className={cn(
                    "text-[13px] leading-5",
                    done || current ? "font-medium text-white" : "text-slate-500",
                  )}
                >
                  {item.label}
                  {review && <span className="block text-[12px] font-normal text-accent-amber">Review required</span>}
                </span>
              </li>
            );
          })}
        </ol>}

        <p className="mt-4 border-t border-white/10 pt-3 text-[12px] leading-5 text-slate-500">
          Stored in this browser. Personal and practice work remain separate. “Complete” never means advice or permission to trade.
        </p>
      </div>
    </section>
  );
}
