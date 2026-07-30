"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

const PORTFOLIOS = [
  { id: "def", label: "Defensive", beta: 0.5, tone: "green" as const },
  { id: "mkt", label: "Market-like", beta: 1.0, tone: "cyan" as const },
  { id: "agg", label: "Aggressive", beta: 1.5, tone: "red" as const },
];

const toneText: Record<string, string> = {
  green: "text-accent-green",
  cyan: "text-accent-cyan",
  red: "text-accent-red",
};
const toneBar: Record<string, string> = {
  green: "bg-accent-green/70",
  cyan: "bg-accent-cyan/70",
  red: "bg-accent-red/70",
};

function PredictionStep({
  onDone,
}: {
  onDone: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const correct = {
    up: "agg",
    down: "agg",
    low: "def",
  };
  const items: { key: string; q: ReactNode; opts: { id: string; label: string }[]; correctId: string; note: string }[] = [
    {
      key: "up",
      q: "When the market's excess return is strongly positive, which portfolio tends to respond the most?",
      opts: PORTFOLIOS.map((p) => ({ id: p.id, label: p.label })),
      correctId: correct.up,
      note: "Higher beta means more upside participation when the market rises, on average.",
    },
    {
      key: "down",
      q: "When the market's excess return is strongly negative, which portfolio tends to lose the most?",
      opts: PORTFOLIOS.map((p) => ({ id: p.id, label: p.label })),
      correctId: correct.down,
      note: "Higher beta also means more downside participation when the market falls. Beta amplifies both directions.",
    },
    {
      key: "low",
      q: "Which portfolio has the lowest market exposure?",
      opts: PORTFOLIOS.map((p) => ({ id: p.id, label: p.label })),
      correctId: correct.low,
      note: "The defensive portfolio (β = 0.5) participates least in market movements.",
    },
  ];
  const allAnswered = items.every((it) => answers[it.key] !== undefined);
  const allCorrect = items.every((it) => answers[it.key] === it.correctId);

  const choose = (k: string, id: string) => {
    if (answers[k] !== undefined) return;
    const next = { ...answers, [k]: id };
    setAnswers(next);
    if (items.every((it) => next[it.key] !== undefined) && items.every((it) => next[it.key] === it.correctId)) {
      onDone();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PORTFOLIOS.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/12 bg-white/[0.03] p-4 text-center">
            <div className={cn("font-sans text-[12px] uppercase tracking-[0.14em]", toneText[p.tone])}>{p.label}</div>
            <div className="mt-2 font-sans text-[20px] text-slate-100">β = {p.beta.toFixed(1)}</div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {items.map((it) => {
          const selected = answers[it.key];
          const answered = selected !== undefined;
          const isCorrect = selected === it.correctId;
          return (
            <div key={it.key} className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
              <div className="text-[16px] leading-[1.6] text-slate-200">{it.q}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {it.opts.map((opt) => {
                  const isSelected = selected === opt.id;
                  const showCorrect = answered && opt.id === it.correctId;
                  const showWrong = isSelected && !isCorrect;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={answered}
                      onClick={() => choose(it.key, opt.id)}
                      className={cn(
                        "rounded-full border px-4 py-2 text-[14px] transition-colors",
                        showCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                        showWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                        !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                        answered && !showCorrect && !showWrong && "border-white/10 text-slate-500",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <p className={cn("mt-2.5 text-[14px] leading-[1.55]", isCorrect ? "text-slate-300" : "text-accent-red/90")}>
                  {it.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {allAnswered && !allCorrect && (
        <Feedback status="info">
          Review the notes above, then continue. A higher beta amplifies both positive and negative
          market movements, on average.
        </Feedback>
      )}
    </div>
  );
}

function ResponseBars({ marketExcess, showShocks }: { marketExcess: number; showShocks: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-4">
      {PORTFOLIOS.map((p) => {
        const systematic = p.beta * marketExcess;
        const shock = showShocks ? (p.id === "mkt" ? 1.5 : p.id === "agg" ? -1.2 : 0.6) : 0;
        const total = systematic + shock;
        const maxAbs = 24;
        const widthPct = (Math.min(Math.abs(total), maxAbs) / maxAbs) * 100;
        const positive = total >= 0;
        return (
          <div key={p.id}>
            <div className="mb-1 flex items-center justify-between text-[15px]">
              <span className={toneText[p.tone]}>
                {p.label} <span className="font-sans text-slate-400">β = {p.beta.toFixed(1)}</span>
              </span>
              <span className="font-sans tabular-nums text-slate-100">
                {total >= 0 ? "+" : ""}{total.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-4 w-full rounded-full bg-white/10">
              <div className="absolute left-1/2 top-0 h-full w-px bg-white/30" aria-hidden />
              <motion.div
                className={cn(
                  "absolute top-0 h-full rounded-full",
                  positive ? toneBar[p.tone] : "bg-accent-red/70",
                )}
                style={{ left: positive ? "50%" : undefined, right: positive ? undefined : "50%" }}
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${widthPct / 2}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[13px] text-slate-500">
              <span>market-related: {systematic >= 0 ? "+" : ""}{systematic.toFixed(1)}%</span>
              {showShocks && <span>firm-specific: {shock >= 0 ? "+" : ""}{shock.toFixed(1)}%</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function BetaResponseLab() {
  const [predicted, setPredicted] = useState(false);
  const [marketExcess, setMarketExcess] = useState(8);
  const [showShocks, setShowShocks] = useState(false);

  return (
    <div>
      {!predicted ? (
        <PredictionStep onDone={() => setPredicted(true)} />
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Market excess return <InlineMath>{String.raw`(R_M - R_f)`}</InlineMath>:{" "}
              <span className={cn(marketExcess >= 0 ? "text-accent-green" : "text-accent-red")}>
                {marketExcess >= 0 ? "+" : ""}{marketExcess.toFixed(0)}%
              </span>
            </label>
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={marketExcess}
              onChange={(e) => setMarketExcess(Number(e.target.value))}
              className="mt-2 w-full accent-accent-cyan"
              aria-label="Market excess return"
            />
            <div className="mt-4">
              <ResponseBars marketExcess={marketExcess} showShocks={showShocks} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.05] p-4">
              <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-accent-green">Positive scenario</div>
              <p className="mt-2 text-[15px] leading-[1.55] text-slate-200">
                With <InlineMath>{String.raw`R_M - R_f = +8\%`}</InlineMath>: the defensive portfolio
                gains about 4%, the market-like 8%, the aggressive 12%.
              </p>
              <div className="mt-3"><ResponseBars marketExcess={8} showShocks={false} /></div>
            </div>
            <div className="rounded-xl border border-accent-red/25 bg-accent-red/[0.05] p-4">
              <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-accent-red">Negative scenario</div>
              <p className="mt-2 text-[15px] leading-[1.55] text-slate-200">
                With <InlineMath>{String.raw`R_M - R_f = -8\%`}</InlineMath>: the defensive portfolio
                loses about 4%, the market-like 8%, the aggressive 12%.
              </p>
              <div className="mt-3"><ResponseBars marketExcess={-8} showShocks={false} /></div>
            </div>
          </div>

          <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
            <label className="flex items-center gap-3 text-[15px] text-slate-200">
              <input
                type="checkbox"
                checked={showShocks}
                onChange={(e) => setShowShocks(e.target.checked)}
                className="h-4 w-4 accent-accent-cyan"
              />
              Add optional company-specific shocks
            </label>
            {showShocks && (
              <p className="mt-3 text-[15px] leading-[1.6] text-slate-400">
                The bars now split into a market-related part (the <InlineMath>{String.raw`\beta (R_M - R_f)`}</InlineMath> component) and an extra firm-specific part. The firm-specific part is what beta does not explain.
              </p>
            )}
          </div>

          <Feedback status="info">
            Beta describes the estimated market-related component, not the exact realized return.
            Realized returns also include firm-specific shocks that beta cannot capture.
          </Feedback>

          <p className="text-[15px] leading-[1.6] text-slate-300">
            Note: a positive market excess return is not the same thing as an economic expansion.
            Stock markets reflect expectations and may rise or fall differently from current GDP or
            business-cycle conditions.
          </p>
        </div>
      )}
    </div>
  );
}
