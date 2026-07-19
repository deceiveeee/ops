"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";
import { ChoiceQuestion } from "./shared";
import { useLesson77State } from "@/lib/capm-lesson77-state";

function ChallengeCard({
  n,
  title,
  children,
  done,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
  done: boolean;
}) {
  return (
    <div className="rounded-2xl border border-accent-purple/20 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[13px]",
            done ? "border-accent-green/50 bg-accent-green/10 text-accent-green" : "border-accent-purple/40 bg-accent-purple/10 text-accent-purple",
          )}
        >
          {n}
        </span>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-purple">Challenge {n}</div>
          <h4 className="ops-interactive-title text-[18px] text-white">{title}</h4>
        </div>
        {done && <span className="ml-auto font-mono text-[12px] text-accent-green">✓</span>}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

/* Challenge 1 — Target portfolio beta */
const C1_FUNDS = [
  { id: "M", beta: 1.0, label: "Market fund (β = 1.00)" },
  { id: "D", beta: 0.5, label: "Defensive fund (β = 0.50)" },
  { id: "C", beta: 1.5, label: "Cyclical fund (β = 1.50)" },
];

function ChallengeOne() {
  const { setChallengeDone } = useLesson77State();
  const [w, setW] = useState<Record<string, string>>({ M: "", D: "", C: "" });
  const [checked, setChecked] = useState(false);
  const sum = C1_FUNDS.reduce((s, f) => s + (parseFloat(w[f.id]) || 0), 0);
  const beta = C1_FUNDS.reduce((s, f) => s + ((parseFloat(w[f.id]) || 0) / 100) * f.beta, 0);
  const sumOk = Math.abs(sum - 100) <= 0.5;
  const betaOk = beta >= 0.75 && beta <= 0.85;
  const ok = sumOk && betaOk;

  return (
    <>
      <p className="text-[15px] leading-[1.6] text-slate-200">
        Build a portfolio with <InlineMath>{String.raw`\beta_P \approx 0.80`}</InlineMath>. Weights must
        sum to 100%. The result is shown only after you check.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {C1_FUNDS.map((f) => (
          <div key={f.id}>
            <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400" htmlFor={`c1-${f.id}`}>
              {f.label}
            </label>
            <div className="relative mt-1.5 inline-flex w-full items-center">
              <input
                id={`c1-${f.id}`}
                type="number"
                inputMode="decimal"
                value={w[f.id]}
                disabled={checked && ok}
                onChange={(e) => {
                  setW((p) => ({ ...p, [f.id]: e.target.value }));
                  if (checked) setChecked(false);
                }}
                className="w-full rounded-lg border border-white/20 bg-ink-950/60 py-2 pl-3 pr-8 font-mono text-[15px] text-slate-100 focus:border-accent-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
                aria-label={`${f.label} weight`}
              />
              <span className="pointer-events-none absolute right-2.5 font-mono text-[13px] text-slate-400">%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!ok && (
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-5 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25"
          >
            Check mix
          </button>
        )}
        <span className="font-mono text-[13px] text-slate-400">Weights sum to {sum.toFixed(1)}%</span>
      </div>
      {checked && !ok && (
        <Feedback status="incorrect">
          {!sumOk
            ? "Weights must sum to 100%."
            : `Resulting β_P ≈ ${beta.toFixed(3)}. Shift more toward the defensive fund (β = 0.50) and away from higher-beta funds.`}
        </Feedback>
      )}
      {checked && ok && (
        <Feedback status="correct">
          β_P ≈ {beta.toFixed(3)} — close to 0.80. The trade-off: lowering systematic exposure means
          accepting less market participation, including less upside in rising markets.
        </Feedback>
      )}
      {ok && <button type="button" onClick={() => setChallengeDone("c1", true)} className="rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-slate-400 hover:border-white/30 hover:text-slate-200">Mark challenge done</button>}
    </>
  );
}

/* Challenge 2 — SML shift */
function ChallengeTwo() {
  const { state, setChallengeDone } = useLesson77State();
  return (
    <>
      <p className="text-[15px] leading-[1.6] text-slate-200">
        Compare two shocks to the SML: (i) the risk-free rate rises, and (ii) the market risk premium
        rises.
      </p>
      <ChoiceQuestion
        item={{
          id: "c2",
          prompt: "Which best describes the effects?",
          options: [
            { id: "both", label: "A higher R_f shifts the line up in parallel; a higher premium makes it steeper — so a combined shock does both" },
            { id: "parallel", label: "Both effects only shift the line in parallel" },
            { id: "steep", label: "Both effects only make the line steeper" },
          ],
          correctId: "both",
          optionFeedback: {
            parallel: "A higher R_f moves the intercept but keeps the slope; a higher premium changes the slope. They are different effects.",
            steep: "Only the premium changes the slope. A higher R_f moves the intercept.",
          },
        }}
        onResolved={() => setChallengeDone("c2", true)}
      />
      {state.challenges.c2 && (
        <Feedback status="info">
          A higher <InlineMath>{String.raw`R_f`}</InlineMath> raises the intercept; a higher{" "}
          <InlineMath>{String.raw`E[R_M]-R_f`}</InlineMath> steepens the slope. High-beta assets feel
          the steeper-slope effect most.
        </Feedback>
      )}
    </>
  );
}

/* Challenge 3 — Beta uncertainty and required return */
function ChallengeThree() {
  const { setChallengeDone } = useLesson77State();
  const [lo, setLo] = useState("");
  const [hi, setHi] = useState("");
  const [checked, setChecked] = useState(false);
  const RF = 3.5;
  const MRP = 6;
  const loOk = Math.abs(parseFloat(lo) - 8.9) <= 0.15;
  const hiOk = Math.abs(parseFloat(hi) - 12.5) <= 0.15;
  const ok = loOk && hiOk;
  return (
    <>
      <p className="text-[15px] leading-[1.6] text-slate-200">
        An asset has <InlineMath>{String.raw`\hat{\beta}=1.20`}</InlineMath> with a plausible range of{" "}
        <InlineMath>{String.raw`0.90\text{ to }1.50`}</InlineMath>. With{" "}
        <InlineMath>{String.raw`R_f = 3.5\%`}</InlineMath> and a market risk premium of{" "}
        <InlineMath>{String.raw`6\%`}</InlineMath>, compute the range of required returns.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400" htmlFor="c3-lo">Low required return (β = 0.90)</label>
          <div className="relative mt-1.5 inline-flex w-full items-center">
            <input id="c3-lo" type="number" inputMode="decimal" value={lo} disabled={checked && ok} onChange={(e) => { setLo(e.target.value); if (checked) setChecked(false); }} className="w-full rounded-lg border border-white/20 bg-ink-950/60 py-2 pl-3 pr-8 font-mono text-[15px] text-slate-100 focus:border-accent-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40" aria-label="low required return" />
            <span className="pointer-events-none absolute right-2.5 font-mono text-[13px] text-slate-400">%</span>
          </div>
        </div>
        <div>
          <label className="block font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400" htmlFor="c3-hi">High required return (β = 1.50)</label>
          <div className="relative mt-1.5 inline-flex w-full items-center">
            <input id="c3-hi" type="number" inputMode="decimal" value={hi} disabled={checked && ok} onChange={(e) => { setHi(e.target.value); if (checked) setChecked(false); }} className="w-full rounded-lg border border-white/20 bg-ink-950/60 py-2 pl-3 pr-8 font-mono text-[15px] text-slate-100 focus:border-accent-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40" aria-label="high required return" />
            <span className="pointer-events-none absolute right-2.5 font-mono text-[13px] text-slate-400">%</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {!ok && <button type="button" onClick={() => setChecked(true)} className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-5 py-2 text-[14px] text-accent-cyan hover:bg-accent-cyan/25">Check range</button>}
      </div>
      {checked && !ok && (
        <Feedback status="incorrect">
          Low = 3.5% + 0.90 × 6% = 8.9%; High = 3.5% + 1.50 × 6% = 12.5%. Recheck your arithmetic.
        </Feedback>
      )}
      {checked && ok && (
        <Feedback status="correct">
          Required return ranges from about 8.9% to 12.5%. Uncertainty in beta creates uncertainty in
          the estimated cost of equity.
        </Feedback>
      )}
      {ok && <button type="button" onClick={() => setChallengeDone("c3", true)} className="rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-slate-400 hover:border-white/30 hover:text-slate-200">Mark challenge done</button>}
      <p className="text-[13px] text-slate-500">{RF}% + β × {MRP}%</p>
    </>
  );
}

/* Challenge 4 — Competing models */
function ChallengeFour() {
  const { setChallengeDone } = useLesson77State();
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["α_CAPM", "4.0%"],
          ["α_three-factor", "1.5%"],
          ["α_five-factor", "0.6%"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-white/12 bg-white/[0.02] p-3 text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400">{k}</div>
            <div className="mt-1 font-mono text-[16px] text-slate-100">{v}</div>
          </div>
        ))}
      </div>
      <ChoiceQuestion
        item={{
          id: "c4",
          prompt: "Does the most complex model necessarily provide the true answer?",
          options: [
            { id: "no", label: "No — additional factors may explain returns, but model selection, data mining, economic interpretation, and estimation uncertainty remain important" },
            { id: "yes", label: "Yes — more factors always means closer to truth" },
          ],
          correctId: "no",
          optionFeedback: { yes: "More factors can reduce alpha, but they can also overfit. Complexity is not the same as truth." },
        }}
        onResolved={() => setChallengeDone("c4", true)}
      />
    </>
  );
}

export default function Challenges() {
  const { state } = useLesson77State();
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-purple">
          Optional challenge problems
        </div>
        <p className="mt-1 text-[14px] leading-[1.55] text-slate-300">
          For advanced learners. These do not affect completion of the lesson.
        </p>
      </div>
      <ChallengeCard n={1} title="Target portfolio beta" done={!!state.challenges.c1}>
        <ChallengeOne />
      </ChallengeCard>
      <ChallengeCard n={2} title="SML shift" done={!!state.challenges.c2}>
        <ChallengeTwo />
      </ChallengeCard>
      <ChallengeCard n={3} title="Beta uncertainty & required return" done={!!state.challenges.c3}>
        <ChallengeThree />
      </ChallengeCard>
      <ChallengeCard n={4} title="Competing models" done={!!state.challenges.c4}>
        <ChallengeFour />
      </ChallengeCard>
    </div>
  );
}
