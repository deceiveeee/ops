"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

type Choice = "A" | "B";

const RATE = 10;

type Project = {
  id: "A" | "B";
  name: string;
  cost: number;
  payoff: number;
  tone: "cyan" | "amber";
};

const PROJECTS: Record<Choice, Project> = {
  A: { id: "A", name: "Investment A", cost: 1, payoff: 1.3, tone: "cyan" },
  B: { id: "B", name: "Investment B", cost: 100, payoff: 120, tone: "amber" },
};

function npv(p: Project) {
  return p.payoff / (1 + RATE / 100) - p.cost;
}
function ret(p: Project) {
  return ((p.payoff - p.cost) / p.cost) * 100;
}

type QKey = "return" | "npv" | "choice";

export default function HighestReturnVsHighestValue() {
  const reduce = useReducedMotion();
  const [answered, setAnswered] = useState<Record<QKey, Choice | null>>({
    return: null,
    npv: null,
    choice: null,
  });

  const npvA = npv(PROJECTS.A);
  const npvB = npv(PROJECTS.B);
  const retA = ret(PROJECTS.A);
  const retB = ret(PROJECTS.B);

  const higherReturn = retA > retB ? "A" : "B";
  const higherNPV = npvA > npvB ? "A" : "B";
  const correctChoice = higherNPV;

  const select = (q: QKey, c: Choice) => {
    setAnswered((prev) => ({ ...prev, [q]: c }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Two mutually exclusive investments · required return 10%
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(["A", "B"] as Choice[]).map((key) => {
            const p = PROJECTS[key];
            return (
              <div key={key} className={cn(
                "rounded-2xl border p-5",
                p.tone === "cyan" ? "border-accent-cyan/25 bg-accent-cyan/[0.04]" : "border-accent-amber/25 bg-accent-amber/[0.04]",
              )}>
                <div className={cn(
                  "font-sans text-[11px] uppercase tracking-[0.16em]",
                  p.tone === "cyan" ? "text-accent-cyan" : "text-accent-amber",
                )}>
                  {p.name}
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-slate-400">Cost</span>
                    <span className="font-sans tabular-nums text-white">${fmt(p.cost, 0)}M</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-slate-400">Expected payoff (1 yr)</span>
                    <span className="font-sans tabular-nums text-white">${fmt(p.payoff)}M</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1 text-[14px]">
                    <span className="text-slate-400">Expected return</span>
                    <span className="font-sans tabular-nums text-white">{fmt(ret(p))}%</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-slate-400">NPV</span>
                    <span className={cn("font-sans tabular-nums", npv(p) > 0 ? "text-accent-green" : "text-accent-red")}>
                      ${fmt(npv(p))}M
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NPV calculations */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`NPV_A = \frac{\$1.30\,\text{M}}{1.10} - \$1\,\text{M} = \$${fmt(npvA)}\,\text{M}`}</BlockMath>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`NPV_B = \frac{\$120\,\text{M}}{1.10} - \$100\,\text{M} = \$${fmt(npvB)}\,\text{M}`}</BlockMath>
          </div>
        </div>
      </div>

      {/* Interactive questions */}
      <div className="space-y-4">
        {([
          { q: "return", prompt: "Which investment has the higher expected return?", correct: higherReturn },
          { q: "npv", prompt: "Which investment creates more total value (higher NPV)?", correct: higherNPV },
          { q: "choice", prompt: "If only one can be undertaken, which should be selected?", correct: correctChoice },
        ] as { q: QKey; prompt: string; correct: Choice }[]).map((item) => {
          const picked = answered[item.q];
          const isCorrect = picked === item.correct;
          return (
            <div key={item.q} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] leading-[1.55] text-slate-100">{item.prompt}</p>
              <div className="mt-3 flex gap-2">
                {(["A", "B"] as Choice[]).map((c) => {
                  const isPicked = picked === c;
                  const isAnswerCorrect = c === item.correct;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={picked !== null}
                      onClick={() => select(item.q, c)}
                      className={cn(
                        "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                        !picked && "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
                        picked && isAnswerCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                        picked && isPicked && !isAnswerCorrect && "border-accent-red bg-accent-red/15 text-accent-red",
                        picked && !isPicked && !isAnswerCorrect && "border-white/10 text-slate-500",
                      )}
                    >
                      Investment {c}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {picked && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <p className={cn("mt-2.5 text-[14px] leading-[1.6]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ "}
                      <span className="text-slate-300">
                        {item.q === "return" && `Investment ${higherReturn} has a ${fmt(Math.max(retA, retB))}% return vs ${fmt(Math.min(retA, retB))}%.`}
                        {item.q === "npv" && `Investment ${higherNPV} creates $${fmt(Math.max(npvA, npvB))}M of value vs $${fmt(Math.min(npvA, npvB))}M.`}
                        {item.q === "choice" && `For mutually exclusive investments, select the highest positive NPV: Investment ${correctChoice}.`}
                      </span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.5] text-white">
          The project with the highest percentage return is not necessarily the project that creates
          the most total value.
        </p>
        <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-200">
          Portfolio analysis often uses percentage returns because individual investors are small
          relative to the market. Corporate capital allocation must account for the actual dollar
          scale of the investment — a 30% return on $1M creates less value than a 20% return on $100M.
        </p>
      </div>
    </div>
  );
}
