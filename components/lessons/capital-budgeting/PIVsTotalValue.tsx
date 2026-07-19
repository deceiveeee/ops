"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

type Choice = "A" | "B";

export default function PIVsTotalValue() {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Record<string, Choice | null>>({
    efficient: null,
    value: null,
    choice: null,
  });

  const projA = { pi: 2.0, npv: 1, investment: 1 };
  const projB = { pi: 1.3, npv: 30, investment: 100 };

  const higherPI = projA.pi > projB.pi ? "A" : "B";
  const higherNPV = projA.npv > projB.npv ? "A" : "B";
  const correctChoice = higherNPV;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {([
          { id: "A" as Choice, name: "Project A", investment: "$1", pv: "$2", pi: "2.0", npv: "$1M", tone: "cyan" as const },
          { id: "B" as Choice, name: "Project B", investment: "$100M", pv: "$130M", pi: "1.30", npv: "$30M", tone: "amber" as const },
        ]).map((p) => (
          <div key={p.id} className={cn(
            "rounded-2xl border p-5",
            p.tone === "cyan" ? "border-accent-cyan/25 bg-accent-cyan/[0.04]" : "border-accent-amber/25 bg-accent-amber/[0.04]",
          )}>
            <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]",
              p.tone === "cyan" ? "text-accent-cyan" : "text-accent-amber")}>{p.name}</div>
            <div className="mt-3 space-y-1 text-[14px]">
              <div className="flex justify-between"><span className="text-slate-400">Investment</span><span className="font-mono text-white">{p.investment}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">PV of inflows</span><span className="font-mono text-white">{p.pv}</span></div>
              <div className="flex justify-between border-t border-white/10 pt-1"><span className="text-slate-400">PI</span><span className="font-mono text-accent-cyan">{p.pi}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">NPV</span><span className="font-mono text-accent-green">{p.npv}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {([
          { q: "efficient", prompt: "Which project is more capital-efficient (higher PI)?", correct: higherPI },
          { q: "value", prompt: "Which project creates more total value (higher NPV)?", correct: higherNPV },
          { q: "choice", prompt: "If mutually exclusive, which should be selected?", correct: correctChoice },
        ] as { q: string; prompt: string; correct: Choice }[]).map((item) => {
          const picked = answers[item.q];
          const isCorrect = picked === item.correct;
          return (
            <div key={item.q} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] leading-[1.55] text-slate-100">{item.prompt}</p>
              <div className="mt-3 flex gap-2">
                {(["A", "B"] as Choice[]).map((c) => {
                  const isPicked = picked === c;
                  const isAnsCorrect = c === item.correct;
                  return (
                    <button key={c} type="button" disabled={picked !== null}
                      onClick={() => setAnswers((p) => ({ ...p, [item.q]: c }))}
                      className={cn(
                        "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                        !picked && "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
                        picked && isAnsCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                        picked && isPicked && !isAnsCorrect && "border-accent-red bg-accent-red/15 text-accent-red",
                        picked && !isPicked && !isAnsCorrect && "border-white/10 text-slate-500",
                      )}>
                      Project {c}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {picked && (
                  <motion.div initial={reduce ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <p className={cn("mt-2.5 text-[13px] leading-[1.6]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ "}
                      <span className="text-slate-300">
                        {item.q === "efficient" && `Project ${higherPI} is more efficient per dollar (PI ${higherPI === "A" ? "2.0" : "1.30"} vs ${higherPI === "A" ? "1.30" : "2.0"}).`}
                        {item.q === "value" && `Project ${higherNPV} creates $${fmt(Math.max(projA.npv, projB.npv))}M vs $${fmt(Math.min(projA.npv, projB.npv))}M.`}
                        {item.q === "choice" && `For mutually exclusive projects, select based primarily on NPV: Project ${correctChoice}.`}
                      </span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.7] text-slate-100">
          Project A is more efficient per dollar. Project B creates far more total value. If projects
          are mutually exclusive, select based primarily on NPV. If capital is constrained, PI may
          provide useful evidence — but the company must still identify the combination of projects
          that maximizes total NPV.
        </p>
      </div>
    </div>
  );
}
