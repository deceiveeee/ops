"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";

/**
 * Section 9 — Securitization factory.
 * Many loans enter a machine, are pooled, and emerge as Senior / Mezzanine /
 * Junior (equity) claims. Toggle four requirements: diversification, accurate
 * risk measurement, normal market conditions, sophisticated investors. All on
 * → smooth. Any off → warning that the structure may look safe on paper but
 * fail under stress.
 */
type ReqId = "diversification" | "measurement" | "markets" | "investors";

const REQS: { id: ReqId; label: string; desc: string }[] = [
  { id: "diversification", label: "Diversification", desc: "Loans are spread across issuers, regions, and sectors." },
  { id: "measurement", label: "Accurate risk measurement", desc: "Default probabilities and correlations are well estimated." },
  { id: "markets", label: "Normal market conditions", desc: "Liquidity holds and correlations stay near their assumptions." },
  { id: "investors", label: "Sophisticated investors", desc: "Buyers understand the structure and its assumptions." },
];

const TRANCHE_COLORS = {
  senior: "border-accent-green/40 bg-accent-green/[0.06] text-accent-green",
  mezz: "border-accent-amber/40 bg-accent-amber/[0.06] text-accent-amber",
  junior: "border-accent-red/40 bg-accent-red/[0.06] text-accent-red",
} as const;

export default function SecuritizationFactory() {
  const reduce = useReducedMotion();
  const [reqs, setReqs] = useState<Record<ReqId, boolean>>({
    diversification: true,
    measurement: true,
    markets: true,
    investors: true,
  });

  const allOn = REQS.every((r) => reqs[r.id]);
  const offCount = REQS.filter((r) => !reqs[r.id]).length;

  const toggle = (id: ReqId) =>
    setReqs((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6">
      <DefinitionCard term="Securitization factory">
        Securitization pools many loans into a single structure, then slices the
        pool&apos;s cash flows into tranches: Senior (paid first, safest),
        Mezzanine (middle), and Junior / equity (paid last, absorbs first
        losses). The structure reallocates risk — it does not eliminate it.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Securitization factory
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Toggle the requirements
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Loans in, tranches out
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Many loans enter the machine. They are pooled and repackaged into
          tranches with different risk. The factory runs smoothly only when its
          assumptions hold. Flip a requirement off and watch the warning appear.
        </p>

        {/* Factory diagram */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40 p-6">
          <div className="flex min-w-[600px] items-center justify-between gap-4">
            {/* Loans in */}
            <div className="flex flex-col items-center gap-2">
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={reduce ? {} : { opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    className="h-3 w-3 rounded-sm bg-accent-cyan/60"
                  />
                ))}
              </div>
              <span className="ops-caption text-[11px] text-slate-400">
                Loans in
              </span>
            </div>

            {/* Machine */}
            <div className="relative flex flex-col items-center">
              <motion.div
                animate={
                  allOn
                    ? reduce
                      ? {}
                      : { boxShadow: "0 0 24px rgba(34,211,238,0.25)" }
                    : {}
                }
                className={cn(
                  "rounded-xl border-2 px-6 py-8 text-center",
                  allOn
                    ? "border-accent-cyan/50 bg-accent-cyan/[0.06]"
                    : "border-accent-red/50 bg-accent-red/[0.06]",
                )}
              >
                <div className="font-sans text-[14px] text-white">POOL</div>
                <div className="ops-caption mt-1 text-[11px] text-slate-400">
                  securitize
                </div>
              </motion.div>
              <motion.div
                animate={reduce ? {} : { x: [0, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="mt-2 text-[18px] text-slate-500"
                aria-hidden
              >
                →
              </motion.div>
            </div>

            {/* Tranches out */}
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "rounded-xl border px-4 py-2 text-center",
                  TRANCHE_COLORS.senior,
                )}
              >
                <div className="font-sans text-[13px]">Senior</div>
                <div className="ops-caption text-[10px]">paid first</div>
              </div>
              <div
                className={cn(
                  "rounded-xl border px-4 py-2 text-center",
                  TRANCHE_COLORS.mezz,
                )}
              >
                <div className="font-sans text-[13px]">Mezzanine</div>
                <div className="ops-caption text-[10px]">middle</div>
              </div>
              <div
                className={cn(
                  "rounded-xl border px-4 py-2 text-center",
                  TRANCHE_COLORS.junior,
                )}
              >
                <div className="font-sans text-[13px]">Junior / equity</div>
                <div className="ops-caption text-[10px]">absorbs first loss</div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirement toggles */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {REQS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => toggle(r.id)}
              aria-pressed={reqs[r.id]}
              className={cn(
                "rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                reqs[r.id]
                  ? "border-accent-green/40 bg-accent-green/[0.06]"
                  : "border-accent-red/40 bg-accent-red/[0.06]",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="ops-body-strong text-[15px] text-slate-50">
                  {r.label}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-0.5 font-sans text-[11px] uppercase tracking-[0.14em]",
                    reqs[r.id]
                      ? "border-accent-green/50 text-accent-green"
                      : "border-accent-red/50 text-accent-red",
                  )}
                >
                  {reqs[r.id] ? "On" : "Off"}
                </span>
              </div>
              <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
                {r.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Status */}
        <AnimatePresence mode="wait">
          {allOn ? (
            <motion.div
              key="ok"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-xl border border-accent-green/40 bg-accent-green/[0.08] p-5"
            >
              <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-green">
                Running smoothly
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
                All four requirements are met. Risk is allocated across tranches
                and the structure behaves as designed — for now.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="warn"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 rounded-xl border border-accent-red/40 bg-accent-red/[0.08] p-5"
            >
              <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-red">
                {offCount} requirement{offCount > 1 ? "s" : ""} violated
              </div>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
                The structure may look safe on paper but fail under stress. When
                an assumption breaks, the tranches may not behave as their labels
                promise.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveFrame>
    </div>
  );
}
