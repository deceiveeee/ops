"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Classification = "investment" | "financing" | "nonconventional" | "insufficient";

type Sequence = {
  id: string;
  text: string;
  flows: string;
  correct: Classification;
  explanation: string;
};

const SEQUENCES: Sequence[] = [
  {
    id: "s1",
    text: "A company pays $100 today to build a factory, then receives positive operating cash flows for ten years.",
    flows: "−100, +20, +20, +20, …",
    correct: "investment",
    explanation: "Cash outflow today, inflows later. This is an investment pattern. Higher IRR is generally preferred — the project should be accepted if IRR exceeds the required return.",
  },
  {
    id: "s2",
    text: "A bank lends $100 today and receives $110 in one year.",
    flows: "−100, +110",
    correct: "investment",
    explanation: "The bank invests $100 and receives more later. From the bank's perspective this is an investment. Higher return is better.",
  },
  {
    id: "s3",
    text: "A company borrows $100 today and repays $108 in one year.",
    flows: "+100, −108",
    correct: "financing",
    explanation: "Cash inflow today, outflow later. This is a financing (borrowing) pattern. A LOWER rate is better — the borrower wants to pay less. 'Higher IRR is better' does not apply here.",
  },
  {
    id: "s4",
    text: "A mining project requires an initial investment, generates positive cash flows during production, then requires a large environmental remediation payment at shutdown.",
    flows: "−100, +40, +40, +40, −50",
    correct: "nonconventional",
    explanation: "Signs change more than once. Multiple IRRs may exist. The standard IRR decision rule may not apply, and NPV should be used directly.",
  },
  {
    id: "s5",
    text: "A company enters a derivative contract that produces complex cash flows depending on future interest-rate movements.",
    flows: "Unknown pattern",
    correct: "insufficient",
    explanation: "Without knowing the actual cash-flow pattern, the classification cannot be determined. The investor must examine the contract's cash-flow structure before interpreting any IRR.",
  },
];

const OPTIONS: { key: Classification; label: string; tone: "cyan" | "amber" | "red" | "slate" }[] = [
  { key: "investment", label: "Investment", tone: "cyan" },
  { key: "financing", label: "Financing", tone: "amber" },
  { key: "nonconventional", label: "Nonconventional", tone: "red" },
  { key: "insufficient", label: "Insufficient info", tone: "slate" },
];

const toneText: Record<string, string> = { cyan: "text-accent-cyan", amber: "text-accent-amber", red: "text-accent-red", slate: "text-slate-400" };
const toneBorder: Record<string, string> = { cyan: "border-accent-cyan/40", amber: "border-accent-amber/40", red: "border-accent-red/40", slate: "border-white/20" };
const toneBg: Record<string, string> = { cyan: "bg-accent-cyan/[0.06]", amber: "bg-accent-amber/[0.06]", red: "bg-accent-red/[0.06]", slate: "bg-white/[0.03]" };

export default function InvestmentOrFinancingIRR() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Classification>>({});
  const assign = (id: string, c: Classification) => setPicks((p) => ({ ...p, [id]: c }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Investment pattern</div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            Cash outflow today, inflows later. <span className="text-white">Higher IRR is generally preferred.</span>
          </p>
        </div>
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-amber">Financing pattern</div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            Cash inflow today, outflows later. <span className="text-white">A lower rate is generally preferred</span> — the borrower wants to pay less.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {SEQUENCES.map((s) => {
          const pick = picks[s.id];
          const isCorrect = pick === s.correct;
          return (
            <div key={s.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] leading-[1.55] text-slate-100">{s.text}</p>
              <p className="mt-1 font-mono text-[12px] text-slate-400">Cash flows: {s.flows}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {OPTIONS.map((o) => {
                  const isPicked = pick === o.key;
                  return (
                    <button key={o.key} type="button"
                      onClick={() => assign(s.id, o.key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                        !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                        isPicked && cn(toneBorder[o.tone], toneBg[o.tone], toneText[o.tone]),
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {pick && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <p className={cn("mt-2.5 text-[13px] leading-[1.55]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ Reconsider — "}<span className="text-slate-300">{s.explanation}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          &ldquo;Higher IRR is better&rdquo; is not a universal rule. The interpretation depends on
          the direction of the cash flows.
        </p>
      </div>
    </div>
  );
}
