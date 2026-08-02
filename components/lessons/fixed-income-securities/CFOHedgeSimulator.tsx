"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, DefinitionCard } from "./shared";
import { formatPercent } from "@/lib/fixed-income";
import { InlineMath, FormulaExplainer } from "./shared";

/**
 * Section 6 — CFO hedge simulator.
 * A CFO will receive $10MM in Year 1 and needs it in Year 2. Lock a 1-yr
 * lending rate from Y1->Y2 by: borrow $9.524MM now at 5% (1yr); invest $9.524MM
 * at 7% (2yr). Net Y2 = +10.904MM. Locked return = 9.04% = f_2.
 *
 * Stages: problem -> lock (borrow, invest) -> cancel -> reveal forward.
 * Alive "what if" choice after lock.
 */

const R1 = 0.05;
const R2 = 0.07;
const BORROW = 9.524; // PV of 10MM at 5% for 1yr ~ 9.524
const Y2_PAYOFF = BORROW * Math.pow(1 + R2, 2); // ~10.904
const LOCKED = Y2_PAYOFF / 10.0 - 1; // ~0.0904

type Stage = "problem" | "borrowed" | "invested" | "revealed";

export default function CFOHedgeSimulator() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("problem");
  const [scenario, setScenario] = useState<number | null>(null);

  const borrowed =
    stage === "borrowed" || stage === "invested" || stage === "revealed";
  const invested = stage === "invested" || stage === "revealed";
  const revealed = stage === "revealed";

  return (
    <div className="space-y-6">
      <DefinitionCard term="Hedging with forward rates">
        By combining a short-term borrow and a long-term lend, a CFO can{" "}
        <span className="text-slate-50">lock in</span> a one-year forward
        lending rate for a future period — without knowing what rates will
        actually be.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              CFO finance desk
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <StepChip active={stage === "problem"} n={1} label="Problem" />
            <StepChip
              active={stage === "borrowed"}
              n={2}
              label="Borrow"
              done={borrowed}
            />
            <StepChip
              active={stage === "invested"}
              n={3}
              label="Invest"
              done={invested}
            />
            <StepChip
              active={stage === "revealed"}
              n={4}
              label="Locked"
              done={revealed}
            />
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Lock the Year 1 &rarr; Year 2 lending rate
        </h4>

        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          You are the CFO. A foreign subsidiary will repatriate{" "}
          <span className="text-accent-cyan">$10MM in Year 1</span>, which you
          plan to pay as dividends in{" "}
          <span className="text-accent-cyan">Year 2</span>. You want to lock in
          a one-year lending rate from Year 1 to Year 2 — but the Year 1 rate is
          uncertain today. Current rates:{" "}
          <span className="font-sans text-slate-100">r(0,1) = 5%</span>,{" "}
          <span className="font-sans text-slate-100">r(0,2) = 7%</span>.
        </p>

        {/* Cash flow desk */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-5">
          <CFDesk
            borrowed={borrowed}
            invested={invested}
            revealed={revealed}
            reduce={reduce}
          />
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          <ActionBtn
            disabled={borrowed}
            onClick={() => setStage("borrowed")}
            tone="amber"
          >
            ① Borrow $9.524MM today for 1 yr @ 5%
          </ActionBtn>
          <ActionBtn
            disabled={!borrowed || invested}
            onClick={() => setStage("invested")}
            tone="cyan"
          >
            ② Invest $9.524MM for 2 yr @ 7%
          </ActionBtn>
          <ActionBtn
            disabled={!invested || revealed}
            onClick={() => setStage("revealed")}
            tone="green"
          >
            ③ Reveal locked rate
          </ActionBtn>
          <ActionBtn
            onClick={() => {
              setStage("problem");
              setScenario(null);
            }}
            tone="ghost"
          >
            Reset
          </ActionBtn>
        </div>

        {/* Stage feedback */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5"
          >
            {stage === "problem" && (
              <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.05] p-4">
                <div className="ops-caption text-[11px] text-accent-red">
                  Uncertainty cloud
                </div>
                <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
                  The Year 1 spot rate is unknown today. If it falls, you lend
                  at a lower rate; if it rises, you lend higher. Start by
                  borrowing today.
                </p>
              </div>
            )}
            {stage === "borrowed" && (
              <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
                <p className="ops-body text-[14px] leading-6 text-slate-200">
                  Borrowed <span className="text-accent-amber">+9.524</span> at
                  Y0; owe{" "}
                  <span className="text-accent-amber">&minus;10.000</span> at
                  Y1. Why $9.524MM? Because{" "}
                  <span className="font-sans text-slate-100">
                    9.524 &times; 1.05 &asymp; 10.000
                  </span>{" "}
                  — the present value of $10MM one year out at 5%.
                </p>
              </div>
            )}
            {stage === "invested" && (
              <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
                <p className="ops-body text-[14px] leading-6 text-slate-200">
                  Invested{" "}
                  <span className="text-accent-cyan">&minus;9.524</span> at Y0;
                  receive <span className="text-accent-cyan">+10.904</span> at
                  Y2. Year 0 nets to zero; the Year 1 +10.000 cancels the
                  &minus;10.000 borrowing repayment. Only the Year 2 payoff
                  remains.
                </p>
              </div>
            )}
            {stage === "revealed" && (
              <div className="rounded-xl border border-accent-green/40 bg-accent-green/[0.08] p-5">
                <div className="ops-caption text-[11px] text-accent-green">
                  Locked one-year forward rate (Y1 &rarr; Y2)
                </div>
                <div className="mt-1 font-sans text-[30px] text-accent-green">
                  {formatPercent(LOCKED)}
                </div>
                <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
                  <span className="font-sans text-slate-100">
                    10.904 / 10.000 &minus; 1 = {formatPercent(LOCKED)}
                  </span>{" "}
                  — exactly the one-year forward rate{" "}
                  <InlineMath>{"f_2"}</InlineMath> implied by today&apos;s spot
                  rates. You locked a future lending rate without knowing the
                  future.
                </p>
                <FormulaExplainer
                  className="mt-4"
                  label="Why the lock equals the forward rate"
                  tone="purple"
                  formula={"1+f_2 = \\frac{(1+r_{0,2})^2}{1+r_{0,1}}"}
                  substitution={"f_2 = \\frac{1.07^2}{1.05} - 1 \\approx 9.04\\%"}
                  result="Locked rate = 9.04%"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Alive choice after lock */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="ops-caption text-[11px] text-slate-400">
                  What if the actual Year 1 spot rate becomes&hellip;
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[0.03, 0.07, LOCKED, 0.15].map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={scenario === s}
                      onClick={() => setScenario(s)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        scenario === s
                          ? "border-accent-purple/60 bg-accent-purple/15 text-accent-purple"
                          : "border-white/20 text-slate-200 hover:bg-white/5",
                      )}
                    >
                      {formatPercent(s, 2)}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {scenario !== null && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 rounded-xl border p-4"
                    >
                      <ScenarioFeedback scenario={scenario} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="ops-muted mt-4 text-[13px] leading-6 text-slate-300">
                  <span className="text-slate-100">Core message:</span> hedging
                  removes uncertainty. It does{" "}
                  <span className="text-slate-50">not</span> guarantee
                  regret-free outcomes. As CFO, your job is usually not to
                  speculate on rates — the point is to solve the financing
                  problem.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveFrame>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function StepChip({
  active,
  n,
  label,
  done,
}: {
  active: boolean;
  n: number;
  label: string;
  done?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[11px] uppercase tracking-[0.1em] transition-colors",
        active
          ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
          : done
            ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
            : "border-white/10 text-slate-500",
      )}
    >
      <span>{n}</span>
      {label}
      {done && !active && <span aria-hidden>✓</span>}
    </span>
  );
}

function ActionBtn({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone: "amber" | "cyan" | "green" | "ghost";
}) {
  const cls = {
    amber:
      "border-accent-amber/50 bg-accent-amber/10 text-accent-amber hover:bg-accent-amber/20",
    cyan: "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20",
    green:
      "border-accent-green/50 bg-accent-green/10 text-accent-green hover:bg-accent-green/20",
    ghost: "border-white/20 text-slate-300 hover:bg-white/5",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:opacity-35",
        cls,
      )}
    >
      {children}
    </button>
  );
}

function CFDesk({
  borrowed,
  invested,
  revealed,
  reduce,
}: {
  borrowed: boolean;
  invested: boolean;
  revealed: boolean;
  reduce: boolean | null;
}) {
  // Rows: borrow, lend, repatriation, net. Cols: Y0, Y1, Y2. (in $MM)
  const rows: {
    key: string;
    label: string;
    tone: "amber" | "cyan" | "green";
    y0: number | null;
    y1: number | null;
    y2: number | null;
    active: boolean;
  }[] = [
    {
      key: "borrow",
      label: "1-Yr Borrowing @5%",
      tone: "amber",
      y0: borrowed ? BORROW : null,
      y1: borrowed ? -10.0 : null,
      y2: null,
      active: borrowed,
    },
    {
      key: "lend",
      label: "2-Yr Lending @7%",
      tone: "cyan",
      y0: invested ? -BORROW : null,
      y1: null,
      y2: invested ? Y2_PAYOFF : null,
      active: invested,
    },
    {
      key: "repatriation",
      label: "Repatriation",
      tone: "green",
      y0: null,
      y1: 10.0,
      y2: null,
      active: true,
    },
  ];

  const net0 = rows.reduce((s, r) => s + (r.y0 ?? 0), 0);
  const net1 = rows.reduce((s, r) => s + (r.y1 ?? 0), 0);
  const net2 = rows.reduce((s, r) => s + (r.y2 ?? 0), 0);
  const showNet = borrowed || invested || revealed;

  const toneText: Record<string, string> = {
    amber: "text-accent-amber",
    cyan: "text-accent-cyan",
    green: "text-accent-green",
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="min-w-[480px]">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-2.5 text-left ops-caption text-[11px] text-slate-400">
                Cash flow ($MM)
              </th>
              <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                Year 0
              </th>
              <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                Year 1
              </th>
              <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                Year 2
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-b border-white/5">
                <td className="px-4 py-3 text-left">
                  <span
                    className={cn(
                      "text-[13px]",
                      r.active ? toneText[r.tone] : "text-slate-500",
                    )}
                  >
                    {r.label}
                  </span>
                </td>
                {([r.y0, r.y1, r.y2] as (number | null)[]).map((v, i) => (
                  <td key={i} className="px-4 py-3">
                    <AnimatePresence mode="popLayout">
                      {v !== null ? (
                        <motion.span
                          key={v.toFixed(3)}
                          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          className={cn(
                            "inline-block rounded-md border px-2.5 py-1 font-sans text-[14px]",
                            v > 0
                              ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                              : "border-accent-red/40 bg-accent-red/10 text-accent-red",
                          )}
                        >
                          {v >= 0 ? "+" : "−"}
                          {Math.abs(v).toFixed(3)}
                        </motion.span>
                      ) : (
                        <span className="font-sans text-[14px] text-slate-700">
                          0
                        </span>
                      )}
                    </AnimatePresence>
                  </td>
                ))}
              </tr>
            ))}
            {showNet && (
              <tr>
                <td className="px-4 py-3 text-left">
                  <span className="ops-body-strong text-[13px] text-slate-100">
                    Net
                  </span>
                </td>
                {[
                  { v: net0, glow: borrowed && !invested },
                  { v: net1, glow: false },
                  { v: net2, glow: revealed || invested },
                ].map((c, i) => (
                  <td key={i} className="px-4 py-3">
                    <motion.span
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "inline-block rounded-md border px-2.5 py-1 font-sans text-[15px] font-semibold",
                        Math.abs(c.v) < 0.001
                          ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                          : c.v > 0
                            ? "border-accent-green/50 bg-accent-green/15 text-accent-green"
                            : "border-accent-red/50 bg-accent-red/15 text-accent-red",
                      )}
                    >
                      {Math.abs(c.v) < 0.001
                        ? "0"
                        : `${c.v >= 0 ? "+" : "−"}${Math.abs(c.v).toFixed(3)}`}
                    </motion.span>
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScenarioFeedback({ scenario }: { scenario: number }) {
  if (Math.abs(scenario - LOCKED) < 0.0005) {
    return (
      <div className="border-accent-green/40 bg-accent-green/[0.06]">
        <div className="ops-caption text-[11px] text-accent-green">
          Matches the lock
        </div>
        <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
          The Year 1 spot rate turns out to be exactly {formatPercent(LOCKED)}.
          Locking or waiting would have produced the same result. No regret.
        </p>
      </div>
    );
  }
  if (scenario < LOCKED) {
    return (
      <div className="border-accent-green/40 bg-accent-green/[0.06]">
        <div className="ops-caption text-[11px] text-accent-green">
          Locking was favorable
        </div>
        <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
          The Year 1 spot rate ({formatPercent(scenario, 2)}) ended up below
          your locked rate ({formatPercent(LOCKED)}). By locking at{" "}
          {formatPercent(LOCKED)}, you lent above the realized market rate.
        </p>
      </div>
    );
  }
  return (
    <div className="border-accent-red/40 bg-accent-red/[0.06]">
      <div className="ops-caption text-[11px] text-accent-red">
        Locking was unfavorable
      </div>
      <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
        The Year 1 spot rate ({formatPercent(scenario, 2)}) ended up above your
        locked rate ({formatPercent(LOCKED)}). You gave up upside — but you
        removed the uncertainty in advance, which was the point.
      </p>
    </div>
  );
}
