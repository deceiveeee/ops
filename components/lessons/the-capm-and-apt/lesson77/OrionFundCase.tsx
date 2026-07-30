"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";
import { CalculationWorksheet } from "../shared";
import { ChoiceQuestion, evaluateConcepts, type ConceptCheck } from "./shared";
import { useLesson77State, type OrionMemo } from "@/lib/capm-lesson77-state";

const RF = 3.5;
const MRP = 6;

function StageTag({ n, title, locked }: { n: number; title: string; locked: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[13px]",
          locked
            ? "border-white/15 text-slate-500"
            : "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan",
        )}
      >
        {n}
      </span>
      <span className={cn("font-sans text-[12px] uppercase tracking-[0.14em]", locked ? "text-slate-500" : "text-accent-cyan")}>
        Stage {n} · {title}
      </span>
    </div>
  );
}

function StageCard({
  n,
  title,
  locked,
  children,
}: {
  n: number;
  title: string;
  locked: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-5 sm:p-6 transition-colors",
        locked ? "border-white/10 bg-white/[0.01] opacity-60" : "border-white/12 bg-white/[0.03]",
      )}
      aria-hidden={locked}
    >
      <StageTag n={n} title={title} locked={locked} />
      {locked ? (
        <p className="mt-3 text-[14px] text-slate-500">Complete the previous stage to unlock this evidence.</p>
      ) : (
        <div className="mt-4 space-y-4">{children}</div>
      )}
    </section>
  );
}

const MEMO_CHECKS: ConceptCheck[] = [
  {
    concept: "Market / systematic exposure (beta ≈ 1.10)",
    hint: "State that Orion had slightly above-market systematic exposure (β ≈ 1.10).",
    keywords: ["beta", "market exposure", "systematic", "1.1", "1.10"],
  },
  {
    concept: "CAPM performance (≈ 3.4% above benchmark)",
    hint: "Note that Orion’s average return exceeded the one-factor CAPM benchmark by about 3.4 points.",
    keywords: ["3.4", "benchmark", "outperform", "capm alpha", "exceeded"],
  },
  {
    concept: "Multifactor interpretation (size & value; alpha ≈ 0.9%)",
    hint: "Explain that size and value exposures reduced estimated alpha to about 0.9%.",
    keywords: ["size", "value", "multifactor", "factor", "0.9"],
  },
  {
    concept: "Qualified conclusion (not proof of skill)",
    hint: "Conclude cautiously: the evidence does not establish persistent manager skill.",
    keywords: ["skill", "insufficient", "not prove", "not establish", "uncertain", "inconclusive", "evidence", "not enough"],
  },
];

function MemoField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        aria-label={label}
        className="mt-2 w-full rounded-xl border border-white/20 bg-ink-950/60 px-4 py-3 text-[15px] leading-[1.6] text-slate-100 placeholder:text-slate-600 focus:border-accent-cyan/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
      />
    </div>
  );
}

export default function OrionFundCase() {
  const { state, setOrionStage, setOrionMemo, setOrionComplete } = useLesson77State();
  const stage = state.orionStage;
  const [memo, setMemo] = useState<OrionMemo>(state.orionMemo);
  const [memoResult, setMemoResult] = useState<{ complete: boolean; missing: ConceptCheck[] } | null>(null);

  const submitMemo = () => {
    const text = `${memo.market} ${memo.capm} ${memo.multifactor} ${memo.conclusion}`;
    const res = evaluateConcepts(text, MEMO_CHECKS);
    setMemoResult(res);
    setOrionMemo(memo);
    if (res.complete) {
      setOrionComplete(true);
      setOrionStage(7);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-purple">
          Integrated case · The Orion Fund
        </div>
        <p className="mt-1 text-[15px] leading-[1.55] text-slate-200">
          Update your judgment as new evidence appears. Each stage unlocks the next.
        </p>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
        <div className="font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">Initial information</div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["Average annual return", "13.5%"],
            ["Annual standard deviation", "18%"],
            ["Estimated market beta", "1.10"],
            ["Beta standard error", "0.18"],
            ["CAPM regression R²", "42%"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-white/12 bg-white/[0.02] p-3 text-center">
              <div className="font-sans text-[11px] uppercase tracking-[0.1em] text-slate-400">{k}</div>
              <div className="mt-1 font-sans text-[16px] text-slate-100">{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[14px] text-slate-400">
          Assumptions: <InlineMath>{String.raw`R_f = ${RF}\%`}</InlineMath>,{" "}
          <InlineMath>{String.raw`E[R_M]-R_f = ${MRP}\%`}</InlineMath>.
        </p>
      </div>

      <StageCard n={1} title="Interpret the exposure" locked={false}>
        <ChoiceQuestion
          item={{
            id: "o1a",
            prompt: "Interpret the estimated market beta β_M = 1.10.",
            options: [
              { id: "ok", label: "Orion had slightly greater systematic market exposure than the market portfolio during the sample" },
              { id: "vol", label: "Orion is exactly 10% more volatile than the market" },
              { id: "mult", label: "Orion will always move 1.10 times the market" },
            ],
            correctId: "ok",
            optionFeedback: {
              vol: "Beta is systematic exposure, not total volatility.",
              mult: "Beta is an average tendency, not an exact multiplier.",
            },
          }}
          onResolved={() => setOrionStage(2)}
        />
        <ChoiceQuestion
          item={{
            id: "o1b",
            prompt: "Interpret SE(β̂) = 0.18.",
            options: [
              { id: "unc", label: "The beta estimate is uncertain and should not be treated as exactly 1.10" },
              { id: "exact", label: "The beta is known precisely to be 1.10" },
            ],
            correctId: "unc",
            optionFeedback: { exact: "The standard error shows imprecision; 1.10 is an estimate, not a fact." },
          }}
          onResolved={() => setOrionStage(2)}
        />
      </StageCard>

      <StageCard n={2} title="Calculate CAPM required return" locked={stage < 2}>
        <CalculationWorksheet
          submitLabel="Check required return"
          groups={[
            {
              hint: "R_Orion = R_f + β(E[R_M] − R_f) = 3.5% + 1.10 × 6%.",
              fields: [
                { id: "ror", label: "Required return R_Orion", answer: 10.1, tolerance: 0.05, unit: "%", hints: ["3.5% + 1.10 × 6%.", "= 10.1%."], solution: "3.5% + 1.10 × 6% = 10.1%." },
              ],
            },
          ]}
          interpretation="Orion’s CAPM-required expected return is about 10.1%."
          interpretationTone="info"
          onSolved={() => setOrionStage(3)}
          onReveal={() => setOrionStage(3)}
        />
      </StageCard>

      <StageCard n={3} title="Calculate CAPM alpha" locked={stage < 3}>
        <CalculationWorksheet
          submitLabel="Check alpha"
          groups={[
            {
              hint: "α_CAPM = average return − required = 13.5% − 10.1%.",
              fields: [
                { id: "alpha", label: "CAPM alpha α_Orion", answer: 3.4, tolerance: 0.05, unit: "%", hints: ["13.5% − 10.1%.", "= 3.4%."], solution: "13.5% − 10.1% = 3.4%." },
              ],
            },
          ]}
          interpretation="Orion earned 3.4 points more than the one-factor CAPM benchmark over the period."
          interpretationTone="info"
          onSolved={() => setOrionStage(4)}
          onReveal={() => setOrionStage(4)}
        />
        <ChoiceQuestion
          item={{
            id: "o3",
            prompt: "Select the strongest initial conclusion.",
            options: [
              { id: "bench", label: "Orion earned 3.4 points more than the one-factor CAPM benchmark over the measured period" },
              { id: "skill", label: "Orion’s manager generated 3.4% of skill" },
            ],
            correctId: "bench",
            optionFeedback: { skill: "This is a benchmark gap, not proof of skill. Keep investigating." },
          }}
          onResolved={() => setOrionStage(4)}
        />
      </StageCard>

      <StageCard n={4} title="Interpret regression fit" locked={stage < 4}>
        <ChoiceQuestion
          item={{
            id: "o4",
            prompt: "Interpret R² = 42%.",
            options: [
              { id: "fit", label: "The market regression explained about 42% of Orion’s historical return variation; the rest was not explained by this one-factor model" },
              { id: "firm", label: "The remaining 58% is entirely company-specific risk" },
            ],
            correctId: "fit",
            optionFeedback: {
              firm: "Do not describe all of the remainder as company-specific. It may include omitted systematic factors, residual variation, measurement error, and changing exposures.",
            },
          }}
          onResolved={() => setOrionStage(5)}
        />
      </StageCard>

      <StageCard n={5} title="Reveal additional factors" locked={stage < 5}>
        <div className="rounded-xl border border-accent-purple/25 bg-accent-purple/[0.05] p-4">
          <div className="font-sans text-[11px] uppercase tracking-[0.14em] text-accent-purple">New evidence</div>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/12 bg-white/[0.02] p-3 text-center">
              <div className="font-sans text-[11px] text-slate-400">Size beta β_S</div>
              <div className="mt-1 font-sans text-[16px] text-slate-100">0.55</div>
            </div>
            <div className="rounded-lg border border-white/12 bg-white/[0.02] p-3 text-center">
              <div className="font-sans text-[11px] text-slate-400">Value beta β_V</div>
              <div className="mt-1 font-sans text-[16px] text-slate-100">0.70</div>
            </div>
            <div className="rounded-lg border border-accent-purple/30 bg-accent-purple/10 p-3 text-center">
              <div className="font-sans text-[11px] text-accent-purple">Multifactor α</div>
              <div className="mt-1 font-sans text-[16px] text-accent-purple">0.9%</div>
            </div>
          </div>
        </div>
        <ChoiceQuestion
          item={{
            id: "o5a",
            prompt: "Could part of Orion’s CAPM alpha reflect systematic factor exposure rather than unique manager performance?",
            options: [
              { id: "yes", label: "Yes — Orion has meaningful small-company and value exposure that the one-factor CAPM does not include" },
              { id: "no", label: "No — CAPM already captures all risk" },
            ],
            correctId: "yes",
            optionFeedback: { no: "CAPM includes only market beta. Size and value are additional systematic exposures." },
          }}
          onResolved={() => setOrionStage(6)}
        />
        <ChoiceQuestion
          item={{
            id: "o5b",
            prompt: "Compare α_CAPM = 3.4% with α_multifactor = 0.9%. What does the change show?",
            options: [
              { id: "absorb", label: "Most of the apparent CAPM alpha is associated with systematic exposures included in the broader factor model" },
              { id: "noise", label: "The change is meaningless noise" },
            ],
            correctId: "absorb",
            optionFeedback: { noise: "The drop from 3.4% to 0.9% is economically meaningful: the extra factors explain most of the gap." },
          }}
          onResolved={() => setOrionStage(6)}
        />
      </StageCard>

      <StageCard n={6} title="Final investment memo" locked={stage < 6}>
        <p className="text-[15px] leading-[1.6] text-slate-200">
          Write a short, cautious memo across the four fields. Your draft is saved automatically. It is
          judged on whether it contains the necessary concepts, not on exact wording.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MemoField id="memo-market" label="1. Market exposure" value={memo.market} onChange={(v) => setMemo((m) => ({ ...m, market: v }))} placeholder="Orion’s systematic market exposure was…" />
          <MemoField id="memo-capm" label="2. CAPM performance" value={memo.capm} onChange={(v) => setMemo((m) => ({ ...m, capm: v }))} placeholder="Relative to the one-factor benchmark…" />
          <MemoField id="memo-multi" label="3. Multifactor interpretation" value={memo.multifactor} onChange={(v) => setMemo((m) => ({ ...m, multifactor: v }))} placeholder="After controlling for size and value…" />
          <MemoField id="memo-conc" label="4. Final conclusion" value={memo.conclusion} onChange={(v) => setMemo((m) => ({ ...m, conclusion: v }))} placeholder="On the evidence, manager skill is…" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submitMemo}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-6 py-2.5 text-[15px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Evaluate memo
          </button>
          {state.orionComplete && (
            <span className="font-sans text-[13px] text-accent-green">✓ Memo accepted — case complete</span>
          )}
        </div>
        {memoResult && !memoResult.complete && (
          <Feedback status="incorrect">
            <span className="block">Your memo is missing or thin on these concepts — revise and re-evaluate:</span>
            <ul className="mt-2 space-y-1.5">
              {memoResult.missing.map((c) => (
                <li key={c.concept} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />
                  <span>
                    <strong className="text-slate-100">{c.concept}.</strong>{" "}
                    <span className="text-slate-300">{c.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Feedback>
        )}
        {memoResult && memoResult.complete && (
          <Feedback status="correct">
            Memo accepted. It addresses market exposure, CAPM performance, the multifactor interpretation,
            and a qualified conclusion. This completes the Orion case.
          </Feedback>
        )}
      </StageCard>

      {state.orionComplete && (
        <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-5">
          <div className="max-w-xl">
            <BlockMath>{String.raw`\alpha_{\text{CAPM}} = 3.4\% \;\longrightarrow\; \alpha_{\text{multifactor}} = 0.9\%`}</BlockMath>
          </div>
          <p className="mt-2 text-[15px] leading-[1.6] text-slate-200">
            Orion outperformed the one-factor benchmark, but most of the apparent alpha appears
            associated with additional systematic exposures. The remaining evidence is insufficient to
            establish persistent manager skill.
          </p>
        </div>
      )}
    </div>
  );
}
