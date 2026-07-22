"use client";

import { useMemo, useState } from "react";
import { Reveal, InteractiveFrame, TryItTag, Feedback, DefinitionCard } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Section 6 — The strategy chaser.
 * Deterministic 3-period simulation. Switching costs 0.6% of portfolio value.
 * "Potential taxable realization" appears as a conceptual indicator only.
 */

type Choice = "switch" | "keep" | "review";

type Period = {
  id: number;
  returns: { strategy: string; r: number }[];
  promptStrategy: string;
  prompt: string;
  best: Choice;
  feedback: string;
};

const PERIODS: Period[] = [
  {
    id: 1,
    returns: [
      { strategy: "Growth", r: 18 },
      { strategy: "Value", r: 5 },
      { strategy: "Momentum", r: 11 },
      { strategy: "Broad market", r: 8 },
    ],
    promptStrategy: "Growth",
    prompt: "Growth was the strongest strategy. Switch the entire portfolio into growth?",
    best: "review",
    feedback:
      "Recent outperformance is evidence about what happened. It is not, by itself, an explanation of why the strategy should continue working.",
  },
  {
    id: 2,
    returns: [
      { strategy: "Growth", r: -4 },
      { strategy: "Value", r: 15 },
      { strategy: "Momentum", r: 3 },
      { strategy: "Broad market", r: 7 },
    ],
    promptStrategy: "Value",
    prompt: "Value was the strongest strategy. Switch into value?",
    best: "review",
    feedback:
      "Recent outperformance is evidence about what happened. It is not, by itself, an explanation of why the strategy should continue working.",
  },
  {
    id: 3,
    returns: [
      { strategy: "Growth", r: 6 },
      { strategy: "Value", r: 2 },
      { strategy: "Momentum", r: 17 },
      { strategy: "Broad market", r: 9 },
    ],
    promptStrategy: "Momentum",
    prompt: "Momentum was the strongest strategy. Switch into momentum?",
    best: "review",
    feedback:
      "Recent outperformance is evidence about what happened. It is not, by itself, an explanation of why the strategy should continue working.",
  },
];

const STARTING_VALUE = 100000;
const SWITCH_COST_PCT = 0.006;

const CHOICES: { id: Choice; label: string; hint: string }[] = [
  { id: "switch", label: "Switch", hint: "Move the entire portfolio into the recent winner." },
  { id: "keep", label: "Keep the current approach", hint: "Do nothing this period." },
  { id: "review", label: "Review the underlying belief first", hint: "Ask why the strategy should keep working before acting." },
];

export default function StrategyChaser() {
  const [periodIdx, setPeriodIdx] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [done, setDone] = useState(false);

  const current = PERIODS[periodIdx];

  const stats = useMemo(() => {
    let value = STARTING_VALUE;
    let switches = 0;
    let taxEvents = 0;
    let perfOnly = 0;
    let currentHolding = "Broad market";
    let holdingPeriods = 0;
    const holdingLengths: number[] = [];

    for (let i = 0; i < choices.length; i++) {
      const ch = choices[i];
      const p = PERIODS[i];
      // Apply period return to whatever we held going in
      const held = p.returns.find((r) => r.strategy === currentHolding);
      const heldReturn = held ? held.r / 100 : 0;
      value *= 1 + heldReturn;

      if (ch === "switch") {
        switches += 1;
        // Switching cost
        value *= 1 - SWITCH_COST_PCT;
        // "Potential taxable realization" if we had a gain on prior holding
        if (heldReturn > 0) taxEvents += 1;
        if (holdingPeriods > 0) holdingLengths.push(holdingPeriods);
        holdingPeriods = 1;
        currentHolding = p.promptStrategy;
      } else {
        holdingPeriods += 1;
        if (ch === "keep") {
          // Treat keep as based on inertia — not on a philosophy
          perfOnly += 0;
        }
      }

      if (ch === "switch") perfOnly += 1;
    }
    if (choices.length === PERIODS.length && holdingPeriods > 0) {
      holdingLengths.push(holdingPeriods);
    }
    const avgHolding =
      holdingLengths.length === 0
        ? 3
        : holdingLengths.reduce((a, b) => a + b, 0) / holdingLengths.length;

    return {
      value,
      switches,
      taxEvents,
      perfOnly,
      avgHolding,
      finalHolding: currentHolding,
    };
  }, [choices]);

  const choose = (c: Choice) => {
    if (showFeedback) return;
    setChoices((p) => [...p, c]);
    setShowFeedback(true);
  };

  const advance = () => {
    if (periodIdx + 1 >= PERIODS.length) {
      setDone(true);
    } else {
      setPeriodIdx((i) => i + 1);
      setShowFeedback(false);
    }
  };

  const reset = () => {
    setChoices([]);
    setPeriodIdx(0);
    setShowFeedback(false);
    setDone(false);
  };

  return (
    <Reveal>
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Strategy chaser · 3 periods
            </span>
          </div>
          {!done && (
            <span className="ops-caption text-[11px] text-slate-400">
              Period {periodIdx + 1} of {PERIODS.length}
            </span>
          )}
        </div>

        <p className="ops-body mt-4 text-[15px] text-slate-300">
          You manage a fictional portfolio across three periods. At the end of
          each period, the recently strongest strategy will be presented as the
          next obvious opportunity.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-slate-500">
          <span>Starting value: ${STARTING_VALUE.toLocaleString()}</span>
          <span>Initial allocation: Broad market</span>
          <span>Switch cost: {(SWITCH_COST_PCT * 100).toFixed(1)}% of value</span>
        </div>

        {!done ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {current.returns.map((r) => {
                const isWinner = r.strategy === current.promptStrategy;
                return (
                  <div
                    key={r.strategy}
                    className={cn(
                      "rounded-xl border p-3 text-center",
                      isWinner
                        ? "border-accent-amber/40 bg-accent-amber/[0.06]"
                        : "border-white/10 bg-white/[0.02]",
                    )}
                  >
                    <div className="ops-caption text-[10px] text-slate-400">
                      {r.strategy}
                    </div>
                    <div
                      className={cn(
                        "mt-1 font-mono text-[18px] tabular-nums",
                        r.r >= 0 ? "text-accent-green" : "text-accent-red",
                      )}
                    >
                      {r.r >= 0 ? "+" : ""}
                      {r.r}%
                    </div>
                    {isWinner && (
                      <div className="ops-caption mt-1 text-[9px] text-accent-amber">
                        Recent winner
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="ops-body-strong mt-5 text-[17px] text-slate-50">
              {current.prompt}
            </p>

            <div
              className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-label={current.prompt}
            >
              {CHOICES.map((c) => {
                const isPicked = showFeedback && choices[periodIdx] === c.id;
                const isBest = c.id === current.best;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={isPicked}
                    disabled={showFeedback}
                    onClick={() => choose(c.id)}
                    className={cn(
                      "flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                      !showFeedback &&
                        "border-white/20 text-slate-100 hover:border-accent-amber/60 hover:bg-accent-amber/[0.04]",
                      showFeedback && isBest && "border-accent-green bg-accent-green/15 text-accent-green",
                      showFeedback && isPicked && !isBest && "border-accent-red bg-accent-red/15 text-accent-red",
                      showFeedback && !isPicked && !isBest && "border-white/10 text-slate-500",
                    )}
                  >
                    <span className="text-[14px] font-medium">{c.label}</span>
                    <span className="ops-body mt-1 text-[12px] text-slate-400">
                      {c.hint}
                    </span>
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <>
                <Feedback
                  status={choices[periodIdx] === current.best ? "correct" : "info"}
                >
                  {current.feedback}
                </Feedback>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={advance}
                    className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                  >
                    {periodIdx + 1 >= PERIODS.length ? "See results →" : "Next period →"}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <Results stats={stats} choices={choices} onReset={reset} />
        )}
      </InteractiveFrame>
    </Reveal>
  );
}

function Results({
  stats,
  choices,
  onReset,
}: {
  stats: {
    value: number;
    switches: number;
    taxEvents: number;
    perfOnly: number;
    avgHolding: number;
    finalHolding: string;
  };
  choices: Choice[];
  onReset: () => void;
}) {
  // Buy-and-hold broad market comparator (deterministic)
  const broadMarketReturns = PERIODS.map((p) => p.returns.find((r) => r.strategy === "Broad market")!.r / 100);
  const buyHoldValue = STARTING_VALUE * broadMarketReturns.reduce((acc, r) => acc * (1 + r), 1);
  const diff = stats.value - buyHoldValue;
  const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="mt-5">
      <div className="ops-caption text-[11px] text-accent-amber">
        Strategy chaser · your track record
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Final portfolio value" value={fmtMoney(stats.value)} tone="cyan" />
        <Stat label="Buy-and-hold broad market" value={fmtMoney(buyHoldValue)} tone="slate" />
        <Stat
          label="Difference vs buy-and-hold"
          value={`${diff >= 0 ? "+" : "−"}${fmtMoney(Math.abs(diff))}`}
          tone={diff >= 0 ? "green" : "red"}
        />
        <Stat label="Strategy switches" value={String(stats.switches)} tone="amber" />
        <Stat
          label="Potential taxable realizations"
          value={String(stats.taxEvents)}
          tone="amber"
        />
        <Stat
          label="Performance-only decisions"
          value={String(stats.perfOnly)}
          tone="red"
        />
        <Stat label="Avg holding period (periods)" value={stats.avgHolding.toFixed(1)} tone="slate" />
        <Stat label="Final holding" value={stats.finalHolding} tone="slate" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        {PERIODS.map((p, i) => (
          <div key={p.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-2">
            <div className="ops-caption text-[9px] text-slate-500">Period {p.id}</div>
            <div className="mt-1 text-[12px] text-slate-200">
              {choices[i] === "switch"
                ? "Switch → " + p.promptStrategy
                : choices[i] === "keep"
                  ? "Keep"
                  : "Review"}
            </div>
          </div>
        ))}
      </div>

      <DefinitionCard className="mt-6">
        The problem is not that an investor changed strategy. The problem is
        that the investor had no coherent reason for changing. Without a
        philosophy, the decision process becomes:
        <span className="mt-2 block font-mono text-[13px] text-slate-300">
          recent winner → portfolio switch → disappointment → next recent winner
        </span>
      </DefinitionCard>

      <div className="ops-definition-card mt-4 p-5">
        <div className="ops-caption text-[10px] text-accent-green">Final principle</div>
        <p className="ops-body mt-2 text-[16px] text-slate-100">
          A philosophy provides the reasoning needed to distinguish adaptation
          from performance chasing.
        </p>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
      >
        Reset simulation
      </button>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "green" | "red" | "amber" | "slate";
}) {
  const toneText: Record<string, string> = {
    cyan: "text-accent-cyan",
    green: "text-accent-green",
    red: "text-accent-red",
    amber: "text-accent-amber",
    slate: "text-slate-100",
  };
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="ops-caption text-[10px] text-slate-500">{label}</div>
      <div className={cn("mt-1 font-mono text-[16px] tabular-nums", toneText[tone])}>
        {value}
      </div>
    </div>
  );
}
