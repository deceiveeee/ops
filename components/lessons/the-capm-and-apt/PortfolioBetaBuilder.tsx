"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath, InlineMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";
import { CalculationWorksheet } from "./shared";

const FUNDS = [
  { id: "A", beta: 0.75 },
  { id: "B", beta: 1.1 },
  { id: "C", beta: 1.6 },
];

function Phase2Adjust() {
  const [weights, setWeights] = useState<Record<string, string>>({ A: "", B: "", C: "" });
  const [checked, setChecked] = useState(false);
  const [resultBeta, setResultBeta] = useState<number | null>(null);

  const sum = FUNDS.reduce((s, f) => s + (parseFloat(weights[f.id]) || 0), 0);
  const beta = FUNDS.reduce((s, f) => s + ((parseFloat(weights[f.id]) || 0) / 100) * f.beta, 0);
  const sumOk = Math.abs(sum - 100) <= 0.5;
  const betaOk = beta >= 0.88 && beta <= 0.92;
  const correct = sumOk && betaOk;

  const check = () => {
    setResultBeta(beta);
    setChecked(true);
  };

  const reset = () => {
    setWeights({ A: "", B: "", C: "" });
    setChecked(false);
    setResultBeta(null);
  };

  return (
    <div>
      <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
        Now adjust the three weights so the portfolio beta falls to approximately{" "}
        <InlineMath>{String.raw`0.90`}</InlineMath>. The weights must still sum to 100%. The
        resulting beta is revealed only after you check.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FUNDS.map((f) => (
          <div key={f.id} className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
            <label className="block font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400" htmlFor={`pb-${f.id}`}>
              Fund {f.id} weight <span className="text-slate-500">(β = {f.beta.toFixed(2)})</span>
            </label>
            <div className="relative mt-2 inline-flex w-full items-center">
              <input
                id={`pb-${f.id}`}
                type="number"
                inputMode="decimal"
                value={weights[f.id]}
                disabled={checked && correct}
                onChange={(e) => {
                  setWeights((p) => ({ ...p, [f.id]: e.target.value }));
                  if (checked) {
                    setChecked(false);
                    setResultBeta(null);
                  }
                }}
                aria-label={`Fund ${f.id} weight`}
                className="w-full rounded-lg border border-white/20 bg-ink-950/60 py-2.5 pl-3.5 pr-9 font-mono text-[16px] text-slate-100 focus:border-accent-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 disabled:cursor-default"
              />
              <span className="pointer-events-none absolute right-3 font-mono text-[15px] text-slate-400" aria-hidden>%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        {!correct && (
          <button
            type="button"
            onClick={check}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-6 py-2.5 text-[15px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Check adjusted weights
          </button>
        )}
        {correct && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/15 px-5 py-2 text-[14px] text-slate-400 transition-colors hover:border-white/30 hover:text-slate-200"
          >
            Try another mix
          </button>
        )}
        <span className="font-mono text-[14px] text-slate-400">
          Weights sum to {sum.toFixed(1)}%
        </span>
      </div>

      {checked && !correct && (
        <div className="mt-4">
          <Feedback status="incorrect">
            {!sumOk
              ? "The weights must sum to 100%. Adjust them so the total is 100%."
              : `Resulting β_P ≈ ${resultBeta?.toFixed(3)}. That is not close to 0.90 yet — shift more weight toward the lower-beta fund (Fund A, β = 0.75) and away from the higher-beta fund (Fund C, β = 1.60).`}
          </Feedback>
        </div>
      )}

      {checked && correct && (
        <div className="mt-4">
          <Feedback status="correct">
            <span>
              With weights A = {weights.A}%, B = {weights.B}%, C = {weights.C}%, the portfolio beta
              is <InlineMath>{String.raw`\beta_P \approx ${resultBeta?.toFixed(3)}`}</InlineMath> —
              close to 0.90. Many different weight combinations can reach this target; the point is
              that lowering beta means shifting toward lower-beta assets.
            </span>
          </Feedback>
        </div>
      )}
    </div>
  );
}

export default function PortfolioBetaBuilder() {
  return (
    <div className="space-y-8">
      <div>
        <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
          First compute the portfolio beta for the given weights.
        </p>
        <div className="mt-5">
          <CalculationWorksheet
            submitLabel="Check portfolio beta"
            retryLabel="Clear wrong answers"
            groups={[
              {
                heading: "Weighted contributions (wᵢ × βᵢ)",
                fields: [
                  { id: "ca", label: "Fund A contribution (0.40 × 0.75)", answer: 0.3, tolerance: 0.005, decimals: 3, hints: ["0.40 × 0.75.", "= 0.300."], solution: "0.40 × 0.75 = 0.300." },
                  { id: "cb", label: "Fund B contribution (0.35 × 1.10)", answer: 0.385, tolerance: 0.005, decimals: 3, hints: ["0.35 × 1.10.", "= 0.385."], solution: "0.35 × 1.10 = 0.385." },
                  { id: "cc", label: "Fund C contribution (0.25 × 1.60)", answer: 0.4, tolerance: 0.005, decimals: 3, hints: ["0.25 × 1.60.", "= 0.400."], solution: "0.25 × 1.60 = 0.400." },
                ],
              },
              {
                heading: "Portfolio beta",
                fields: [
                  { id: "bp", label: "β_P (sum of contributions)", answer: 1.085, tolerance: 0.005, decimals: 3, hints: ["0.300 + 0.385 + 0.400.", "= 1.085."], solution: "0.300 + 0.385 + 0.400 = 1.085." },
                ],
              },
            ]}
            interpretation={
              <span>
                <InlineMath>{String.raw`\beta_P = 1.085`}</InlineMath>. If the market excess return
                changes by 1 percentage point, the portfolio&apos;s excess return would be expected to
                change by approximately 1.085 percentage points in the same direction because of its
                market exposure, on average.
              </span>
            }
            interpretationTone="info"
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-8">
        <div className="mb-4 font-mono text-[12px] uppercase tracking-[0.18em] text-accent-cyan">
          Part 2 · Reduce beta toward 0.90
        </div>
        <Phase2Adjust />
      </div>
    </div>
  );
}
