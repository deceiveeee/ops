"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

type Stage = {
  n: number;
  short: string;
  question: string;
  formula: string;
  interpretation: string;
  mistake: string;
  tone: "cyan" | "green" | "purple" | "amber" | "red";
};

const STAGES: Stage[] = [
  {
    n: 1,
    short: "Portfolio theory",
    question: "How does a rational investor choose between risk and return?",
    formula: String.raw`T = \text{max-Sharpe risky portfolio};\quad R_f = \text{risk-free}`,
    interpretation:
      "Investors combine the risk-free asset with the tangency portfolio to choose their total risk.",
    mistake: "Confusing the tangency portfolio (defined by optimization) with the market portfolio (defined by supply).",
    tone: "purple",
  },
  {
    n: 2,
    short: "CAPM equilibrium",
    question: "Why must the tangency portfolio become the market portfolio?",
    formula: String.raw`T = M`,
    interpretation:
      "The tangency portfolio is defined by optimization. The market portfolio is defined by asset supply. In CAPM equilibrium, prices adjust until the two coincide.",
    mistake: "Saying “T = M by definition.” It holds only under equilibrium and CAPM assumptions, not as a definition.",
    tone: "cyan",
  },
  {
    n: 3,
    short: "Beta",
    question: "How much market risk does a single asset add?",
    formula: String.raw`\beta_i = \frac{\operatorname{Cov}(R_i,R_M)}{\operatorname{Var}(R_M)}`,
    interpretation:
      "Beta measures how aggressively an investment participates in broad market movements.",
    mistake: "Equating beta with total volatility. Two assets can share σ but differ in β.",
    tone: "cyan",
  },
  {
    n: 4,
    short: "Required return",
    question: "What return is enough compensation for this beta?",
    formula: String.raw`E[R_i] = R_f + \beta_i\bigl(E[R_M]-R_f\bigr)`,
    interpretation:
      "The Security Market Line converts systematic exposure into the expected return investors require.",
    mistake: "Treating the required return as a guaranteed realized outcome.",
    tone: "green",
  },
  {
    n: 5,
    short: "Estimation",
    question: "Where does a company’s beta actually come from?",
    formula: String.raw`R_{i,t}-R_{f,t} = \alpha_i + \beta_i(R_{M,t}-R_{f,t}) + \varepsilon_{i,t}`,
    interpretation:
      "Regression provides an estimate of beta. It does not reveal a permanent or perfectly precise company characteristic.",
    mistake: "Treating an estimated beta as an exact, unchanging company trait.",
    tone: "amber",
  },
  {
    n: 6,
    short: "Performance",
    question: "Did a return exceed what its risk required?",
    formula: String.raw`\alpha_i = R_i - \bigl[R_f + \beta_i(E[R_M]-R_f)\bigr]`,
    interpretation: "Alpha is return not explained by the selected risk model.",
    mistake: "Assuming positive alpha automatically proves manager skill.",
    tone: "red",
  },
  {
    n: 7,
    short: "Multiple factors",
    question: "What if one market beta is not enough?",
    formula: String.raw`E[R_i] = R_f + \sum_{k=1}^{K}\beta_{ik}\lambda_k`,
    interpretation:
      "APT allows several systematic exposures to carry separate risk premiums.",
    mistake: "Believing APT identifies the uniquely correct factors. It does not.",
    tone: "purple",
  },
];

const TONE: Record<string, { text: string; border: string; bg: string; dot: string }> = {
  cyan: { text: "text-accent-cyan", border: "border-accent-cyan/40", bg: "bg-accent-cyan/10", dot: "bg-accent-cyan" },
  green: { text: "text-accent-green", border: "border-accent-green/40", bg: "bg-accent-green/10", dot: "bg-accent-green" },
  purple: { text: "text-accent-purple", border: "border-accent-purple/40", bg: "bg-accent-purple/10", dot: "bg-accent-purple" },
  amber: { text: "text-accent-amber", border: "border-accent-amber/40", bg: "bg-accent-amber/10", dot: "bg-accent-amber" },
  red: { text: "text-accent-red", border: "border-accent-red/40", bg: "bg-accent-red/10", dot: "bg-accent-red" },
};

export default function ModuleSevenConceptMap() {
  const [active, setActive] = useState(2);
  const stage = STAGES[active - 1];
  const tone = TONE[stage.tone];

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-[640px] gap-2 sm:min-w-0">
          {STAGES.map((s) => {
            const t = TONE[s.tone];
            const isActive = s.n === active;
            return (
              <li key={s.n} className="flex-1">
                <button
                  type="button"
                  onClick={() => setActive(s.n)}
                  aria-pressed={isActive}
                  aria-label={`Stage ${s.n}: ${s.short}`}
                  className={cn(
                    "group flex w-full flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    isActive ? cn(t.border, t.bg) : "border-white/12 bg-white/[0.02] hover:border-white/25",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[13px]",
                      isActive ? cn(t.border, t.text) : "border-white/20 text-slate-400",
                    )}
                  >
                    {s.n}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[11px] uppercase leading-tight tracking-[0.1em]",
                      isActive ? t.text : "text-slate-400",
                    )}
                  >
                    {s.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className={cn("h-2 w-2 rounded-full", tone.dot)} aria-hidden />
          <span className={cn("font-mono text-[12px] uppercase tracking-[0.16em]", tone.text)}>
            Stage {stage.n} · {stage.short}
          </span>
        </div>
        <p className="mt-3 text-[18px] leading-[1.45] text-white sm:text-[20px]">{stage.question}</p>

        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/50 px-4 py-5">
          <BlockMath>{stage.formula}</BlockMath>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.05] p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-green">Key interpretation</div>
            <p className="mt-2 text-[15px] leading-[1.6] text-slate-200">{stage.interpretation}</p>
          </div>
          <div className="rounded-xl border border-accent-red/25 bg-accent-red/[0.05] p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-red">Common mistake</div>
            <p className="mt-2 text-[15px] leading-[1.6] text-slate-200">{stage.mistake}</p>
          </div>
        </div>
      </div>

      <Feedback status="info">
        This map is the reasoning chain for the whole module. The rest of the lesson asks you to move
        through it end to end — from market exposure to a defensible investment conclusion.
      </Feedback>
    </div>
  );
}
