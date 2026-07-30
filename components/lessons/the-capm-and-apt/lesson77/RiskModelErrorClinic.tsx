"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChoiceQuestion, useResolvedGate } from "./shared";
import { useLesson77State } from "@/lib/capm-lesson77-state";

type Statement = {
  id: string;
  text: string;
  highlight: string;
  correction: { id: string; label: string }[];
  correctId: string;
  concept: string;
};

const STATEMENTS: Statement[] = [
  {
    id: "s1",
    text: "“This portfolio has beta 1.4, so it is 40% more volatile than the market.”",
    highlight: "40% more volatile",
    correction: [
      { id: "c", label: "Beta measures systematic market exposure, not total volatility" },
      { id: "x1", label: "Beta 1.4 means 40% guaranteed extra return" },
      { id: "x2", label: "Beta and volatility are the same thing" },
    ],
    correctId: "c",
    concept: "Beta vs. total volatility",
  },
  {
    id: "s2",
    text: "“CAPM says the stock should return 12%, so it will earn 12% next year.”",
    highlight: "it will earn 12% next year",
    correction: [
      { id: "c", label: "CAPM produces a required expected return, not a guaranteed realized return" },
      { id: "x1", label: "CAPM promises a fixed annual payout" },
      { id: "x2", label: "Expected return and realized return are identical" },
    ],
    correctId: "c",
    concept: "Required vs. realized return",
  },
  {
    id: "s3",
    text: "“The fund earned 15%, so it outperformed the fund that earned 11%.”",
    highlight: "so it outperformed",
    correction: [
      { id: "c", label: "Raw returns cannot be compared fairly without considering risk exposure" },
      { id: "x1", label: "Higher raw return always means better performance" },
      { id: "x2", label: "Risk adjustment is optional for performance" },
    ],
    correctId: "c",
    concept: "Risk-adjusted comparison",
  },
  {
    id: "s4",
    text: "“The regression R² is 25%, so the beta must be 0.25.”",
    highlight: "the beta must be 0.25",
    correction: [
      { id: "c", label: "Beta measures slope; R² measures the fraction of sample variation explained by the regression" },
      { id: "x1", label: "R² is just another name for beta" },
      { id: "x2", label: "A 25% R² forces beta to 0.25" },
    ],
    correctId: "c",
    concept: "Beta (slope) vs. R² (fit)",
  },
  {
    id: "s5",
    text: "“The fund has positive CAPM alpha, so the manager definitely has skill.”",
    highlight: "definitely has skill",
    correction: [
      { id: "c", label: "Positive CAPM alpha may reflect skill, chance, beta error, benchmark choice, or omitted systematic factors" },
      { id: "x1", label: "Any positive alpha proves skill" },
      { id: "x2", label: "CAPM alpha is unaffected by omitted factors" },
    ],
    correctId: "c",
    concept: "Alpha does not prove skill",
  },
];

function StatementCard({
  s,
  onResolve,
}: {
  s: Statement;
  onResolve: () => void;
}) {
  const [resolved, setResolved] = useState(false);
  const parts = s.text.split(s.highlight);
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-red/50 font-sans text-[12px] text-accent-red">
          !
        </span>
        <p className="text-[16px] leading-[1.6] text-slate-200">
          {parts[0]}
          <mark
            className={cn(
              "rounded px-1.5 py-0.5",
              resolved
                ? "bg-accent-green/15 text-accent-green"
                : "bg-accent-red/15 text-accent-red",
            )}
          >
            {s.highlight}
          </mark>
          {parts[1]}
        </p>
      </div>
      <div className="mt-3">
        <ChoiceQuestion
          compact
          item={{
            id: s.id,
            prompt: "Choose the corrected interpretation.",
            options: s.correction,
            correctId: s.correctId,
          }}
          onResolved={() => {
            setResolved(true);
            onResolve();
          }}
        />
      </div>
      {resolved && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-3 py-1">
          <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
            Concept · {s.concept}
          </span>
        </div>
      )}
    </div>
  );
}

export default function RiskModelErrorClinic() {
  const { setClinicDone } = useLesson77State();
  const keys = STATEMENTS.map((s) => s.id);
  const mark = useResolvedGate(keys, () => setClinicDone(true));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.05] p-5">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-red">
          Find the broken reasoning
        </div>
        <p className="mt-1 text-[15px] leading-[1.55] text-slate-200">
          Five analysts each made one error. Identify the faulty phrase and choose the corrected
          interpretation for each.
        </p>
      </div>
      {STATEMENTS.map((s) => (
        <StatementCard key={s.id} s={s} onResolve={() => mark(s.id)} />
      ))}
    </div>
  );
}
