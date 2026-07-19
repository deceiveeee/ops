"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";
import SMLChart from "./SMLChart";

const RF = 4;
const SCENARIOS = [
  { id: "A", label: "Scenario A", mrp: 4, tone: "purple" as const, blurb: "Investors require 4 points of return per unit of market exposure." },
  { id: "B", label: "Scenario B", mrp: 8, tone: "amber" as const, blurb: "Investors require 8 points of return per unit of market exposure." },
];

function PredictionQuestion({
  prompt,
  options,
  correctId,
  note,
  selectedId,
  answered,
  onAnswer,
}: {
  prompt: ReactNode;
  options: { id: string; label: string }[];
  correctId: string;
  note: ReactNode;
  selectedId?: string;
  answered: boolean;
  onAnswer: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
      <div className="text-[16px] leading-[1.6] text-slate-200">{prompt}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => onAnswer(opt.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] transition-colors",
                !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                answered && opt.id === correctId && "border-accent-green bg-accent-green/15 text-accent-green",
                answered && isSelected && opt.id !== correctId && "border-accent-red bg-accent-red/15 text-accent-red",
                answered && opt.id !== correctId && !isSelected && "border-white/10 text-slate-500",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={cn("mt-2 text-[14px] leading-[1.55] text-slate-300")}>{note}</p>
      )}
    </div>
  );
}

export default function MarketRiskPremiumShift() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    {
      key: "intercept",
      prompt: "When the market risk premium rises, does the intercept at β = 0 move?",
      options: [
        { id: "yes", label: "Yes — it rises" },
        { id: "no", label: "No — R_f is held constant" },
      ],
      correctId: "no",
      note: "Correct: R_f = 4% is unchanged, so the β = 0 intercept stays put. Only the slope moves.",
    },
    {
      key: "slope",
      prompt: "Does the slope of the SML change?",
      options: [
        { id: "yes", label: "Yes — the slope equals the market risk premium" },
        { id: "no", label: "No — the slope is fixed at 1" },
      ],
      correctId: "yes",
      note: "Correct: the slope is E[R_M] − R_f, so a larger premium steepens the line.",
    },
    {
      key: "beta",
      prompt: "Which beta levels see the largest increase in required return?",
      options: [
        { id: "low", label: "Low-beta investments" },
        { id: "high", label: "High-beta investments" },
        { id: "same", label: "All levels change by the same amount" },
      ],
      correctId: "high",
      note: "Correct: required-return change = ΔMRP × β, so higher beta multiplies the effect.",
    },
  ];

  const allAnswered = questions.every((q) => answers[q.key] !== undefined);

  const answer = (k: string, id: string) => {
    if (answers[k] !== undefined) return;
    setAnswers((p) => ({ ...p, [k]: id }));
  };

  const deltaRows = [
    { beta: 0.5, tone: "text-accent-green" },
    { beta: 1.0, tone: "text-accent-cyan" },
    { beta: 1.5, tone: "text-accent-red" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Setup</div>
        <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
          Hold <InlineMath>{String.raw`R_f = 4\%`}</InlineMath> constant. Compare two economies: one with a
          market risk premium of <InlineMath>{String.raw`4\%`}</InlineMath> (calmer markets, lower required
          compensation) and one with a market risk premium of <InlineMath>{String.raw`8\%`}</InlineMath>{" "}
          (investors demand more return per unit of market risk).
        </p>
        <p className="mt-3 text-[15px] leading-[1.6] text-accent-amber/90">
          Predict first. The graphs reveal only after you answer all three questions.
        </p>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <PredictionQuestion
            key={q.key}
            prompt={q.prompt}
            options={q.options}
            correctId={q.correctId}
            note={q.note}
            selectedId={answers[q.key]}
            answered={answers[q.key] !== undefined}
            onAnswer={(id) => answer(q.key, id)}
          />
        ))}
      </div>

      {allAnswered && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {SCENARIOS.map((s) => (
              <div key={s.id} className={cn("rounded-xl border bg-white/[0.03] p-4", s.tone === "purple" ? "border-accent-purple/30" : "border-accent-amber/30")}>
                <div className="mb-2 flex items-center justify-between">
                  <span className={cn("font-mono text-[12px] uppercase tracking-[0.14em]", s.tone === "purple" ? "text-accent-purple" : "text-accent-amber")}>{s.label}</span>
                  <span className="font-mono text-[13px] text-slate-300">slope = {s.mrp}%</span>
                </div>
                <SMLChart
                  rf={RF}
                  mrp={s.mrp}
                  rMax={20}
                  points={[
                    { beta: 0.5, onLine: true, tone: "green" },
                    { beta: 1.5, onLine: true, tone: "red" },
                  ]}
                  caption={s.blurb}
                  ariaLabel={`Security Market Line with risk-free rate ${RF} percent and market risk premium ${s.mrp} percent.`}
                />
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">β</th>
                  <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-purple">A: 4 + β×4%</th>
                  <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-amber">B: 4 + β×8%</th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-green">Δ required return</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                {deltaRows.map((r) => {
                  const a = RF + r.beta * 4;
                  const b = RF + r.beta * 8;
                  const d = b - a;
                  return (
                    <tr key={r.beta} className="border-b border-white/5">
                      <td className={cn("py-3 pr-6", r.tone)}>{r.beta.toFixed(1)}</td>
                      <td className="py-3 pr-6">{a.toFixed(1)}%</td>
                      <td className="py-3 pr-6">{b.toFixed(1)}%</td>
                      <td className="py-3 text-accent-green">+{d.toFixed(1)} pp</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Feedback status="info">
            When investors demand greater compensation for market risk, the SML pivots upward around the
            fixed <InlineMath>{String.raw`R_f`}</InlineMath> intercept and becomes steeper. Because the
            required-return change scales with beta, high-beta investments experience the largest increase
            in required return.
          </Feedback>
        </>
      )}
    </div>
  );
}
