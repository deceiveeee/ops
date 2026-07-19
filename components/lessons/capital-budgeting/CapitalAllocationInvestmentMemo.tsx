"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type SectionKey = "proposal" | "best" | "worst" | "assumptions" | "metrics" | "allocation" | "expectations" | "monitoring" | "thesis";

const SECTIONS: { key: SectionKey; prompt: string; placeholder: string }[] = [
  { key: "proposal", prompt: "What is Meridian planning to do with its available capital?", placeholder: "Summarize the three-part strategy..." },
  { key: "best", prompt: "Which proposed use appears most attractive and why?", placeholder: "Identify the strongest use and justify..." },
  { key: "worst", prompt: "Which proposed use appears least attractive and why?", placeholder: "Identify the weakest use and justify..." },
  { key: "assumptions", prompt: "Which three assumptions have the greatest effect on estimated value?", placeholder: "List the key value drivers..." },
  { key: "metrics", prompt: "What do NPV, IRR, payback, EPS, and ROIC indicate?", placeholder: "Interpret each metric for the acquisition..." },
  { key: "allocation", prompt: "How should Meridian revise its $600M plan?", placeholder: "Describe your recommended allocation..." },
  { key: "expectations", prompt: "Is the announced plan better or worse than what appears to have been expected?", placeholder: "Compare with prior market expectations..." },
  { key: "monitoring", prompt: "What should investors track over the next four quarters?", placeholder: "List key monitoring indicators..." },
  { key: "thesis", prompt: "How do the Year 1 results change confidence in management and the valuation?", placeholder: "Update the investment thesis..." },
];

const RUBRIC = [
  "Distinction between facts and assumptions",
  "Correct use of incremental cash flow",
  "Discount-rate reasoning",
  "NPV interpretation",
  "Understanding of marginal returns",
  "Interpretation of supplementary metrics",
  "Opportunity-cost reasoning",
  "Market-expectations reasoning",
  "Response to updated evidence",
  "Clarity and coherence",
];

export default function CapitalAllocationInvestmentMemo() {
  const [answers, setAnswers] = useState<Record<SectionKey, string>>({} as Record<SectionKey, string>);
  const [submitted, setSubmitted] = useState(false);

  const completed = SECTIONS.filter((s) => (answers[s.key] ?? "").trim().length >= 20).length;

  const handleChange = (key: SectionKey, val: string) => {
    setAnswers((p) => ({ ...p, [key]: val }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">Investment memo</span>
          <span className="font-mono text-[12px] text-slate-400">{completed}/{SECTIONS.length} sections</span>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((s, i) => (
          <div key={s.key} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 font-mono text-[11px] text-accent-amber">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium text-white">{s.prompt}</div>
                <textarea
                  value={answers[s.key] ?? ""}
                  onChange={(e) => handleChange(s.key, e.target.value)}
                  disabled={submitted}
                  rows={2}
                  placeholder={s.placeholder}
                  className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[14px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30 disabled:opacity-60"
                  aria-label={s.prompt}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button type="button"
          onClick={() => setSubmitted(true)}
          disabled={completed < 5}
          className={cn("rounded-full border px-6 py-2.5 font-mono text-[13px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
            completed >= 5 ? "border-accent-amber/50 bg-accent-amber/10 text-accent-amber hover:bg-accent-amber/20" : "border-white/15 text-slate-500")}>
          {completed < 5 ? `Complete ${5 - completed} more section${5 - completed > 1 ? "s" : ""}` : "Submit memo"}
        </button>
      ) : (
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-5 sm:p-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-green">Memo submitted</div>
          <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
            Your memo has been recorded. The rubric below shows the dimensions of analytical quality.
            A strong memo distinguishes facts from assumptions, uses incremental cash flow correctly,
            reasons about discount rates and NPV, understands marginal returns, interprets supplementary
            metrics, considers opportunity cost, addresses market expectations, responds to updated
            evidence, and is clear and coherent.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {RUBRIC.map((r) => (
              <div key={r} className="flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />
                <span className="text-[13px] text-slate-200">{r}</span>
              </div>
            ))}
          </div>
          <p className="ops-body mt-4 text-[14px] leading-[1.6] text-slate-300">
            The rubric rewards reasoning, not agreement with one predetermined allocation. Multiple
            defensible conclusions exist under uncertain assumptions.
          </p>
        </div>
      )}
    </div>
  );
}
