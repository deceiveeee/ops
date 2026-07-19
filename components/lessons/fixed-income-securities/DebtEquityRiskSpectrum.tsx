"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";
import ProfessorNote from "./ProfessorNote";

/**
 * Section 4 — Debt / equity risk spectrum.
 * From Treasury/AAA (left, bond-like, lower promised yield) through
 * investment-grade (middle) to high-yield/distressed (right, equity-like,
 * high promised yield). Selecting a rating moves the security along the
 * spectrum and updates the meters.
 */
type Bucket = {
  id: string;
  label: string;
  short: string;
  promisedYield: number; // 0..100
  expectedPayoff: number; // 0..100 (100 = full)
  equityLike: number; // 0..100
};

const BUCKETS: Bucket[] = [
  { id: "tsy", label: "Treasury / AAA", short: "TSY/AAA", promisedYield: 8, expectedPayoff: 99, equityLike: 5 },
  { id: "aa", label: "AA", short: "AA", promisedYield: 14, expectedPayoff: 97, equityLike: 10 },
  { id: "a", label: "A", short: "A", promisedYield: 20, expectedPayoff: 94, equityLike: 18 },
  { id: "baa", label: "Baa / BBB", short: "Baa", promisedYield: 30, expectedPayoff: 90, equityLike: 28 },
  { id: "ba", label: "Ba / BB", short: "Ba", promisedYield: 48, expectedPayoff: 82, equityLike: 45 },
  { id: "b", label: "B", short: "B", promisedYield: 64, expectedPayoff: 70, equityLike: 60 },
  { id: "caa", label: "Caa / CCC", short: "Caa", promisedYield: 80, expectedPayoff: 52, equityLike: 78 },
  { id: "distressed", label: "Distressed / Default", short: "Dist.", promisedYield: 95, expectedPayoff: 35, equityLike: 92 },
];

export default function DebtEquityRiskSpectrum() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const current = BUCKETS[idx];

  return (
    <div className="space-y-6">
      <DefinitionCard term="The debt–equity risk spectrum">
        Bonds are not all equally bond-like. A Treasury or AAA sits at the safe
        end — lower promised yield, high expected payoff, low equity character.
        As ratings fall, promised yield rises and the security behaves more like
        equity: the payoff depends increasingly on whether the issuer survives.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Debt–equity risk spectrum
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Select a rating to move the security
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          From bond-like to equity-like
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          The further right you go, the more the bond&apos;s return depends on
          the issuer&apos;s survival — exactly the question equity holders ask.
        </p>

        {/* Spectrum bar */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="flex min-w-[560px] items-end justify-between gap-1">
            {BUCKETS.map((b, i) => {
              const active = i === idx;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-pressed={active}
                  aria-label={`Select ${b.label}`}
                  className="flex flex-1 flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      height: active ? 56 : 24 + b.promisedYield * 0.18,
                    }}
                    transition={reduce ? { duration: 0 } : { duration: 0.3 }}
                    className={cn(
                      "w-full rounded-t",
                      active ? "bg-accent-cyan" : "bg-accent-cyan/30",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-[11px]",
                      active ? "text-accent-cyan" : "text-slate-500",
                    )}
                  >
                    {b.short}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex min-w-[560px] justify-between font-mono text-[11px] text-slate-500">
            <span>← Bond-like · lower yield</span>
            <span>Equity-like · higher yield →</span>
          </div>
        </div>

        {/* Selected security + meters */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Selected security
            </div>
            <div className="mt-1 font-mono text-[26px] text-white">
              {current.label}
            </div>
            <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">
              {current.id === "tsy"
                ? "Effectively risk-free benchmark. Return is about time value of money."
                : current.id === "distressed"
                  ? "Survival is the main question. Promised yield is high precisely because expected payoff is low."
                  : "Promised yield compensates for rising default risk and increasingly equity-like behavior."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <SpectrumMeter label="Promised-yield meter" value={current.promisedYield} tone="amber" reduce={reduce} />
            <div className="h-4" />
            <SpectrumMeter
              label="Expected-payoff meter"
              value={current.expectedPayoff}
              tone={current.expectedPayoff >= 80 ? "green" : "amber"}
              reduce={reduce}
              invert
            />
            <div className="h-4" />
            <SpectrumMeter label="Equity-like character" value={current.equityLike} tone="purple" reduce={reduce} />
          </div>
        </div>

        <ProfessorNote tone="amber" className="mt-5">
          High promised yield can be attractive, but the word{" "}
          <span className="text-slate-50">&ldquo;promised&rdquo;</span> is doing
          a lot of work. As you slide toward the equity-like end, the promised
          yield rises because the expected payoff falls — not because the
          issuer is being generous.
        </ProfessorNote>
      </InteractiveFrame>
    </div>
  );
}

function SpectrumMeter({
  label,
  value,
  tone,
  reduce,
  invert = false,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "purple";
  reduce: boolean | null;
  invert?: boolean;
}) {
  const fill = {
    green: "bg-accent-green",
    amber: "bg-accent-amber",
    purple: "bg-accent-purple",
  }[tone];
  const text = {
    green: "text-accent-green",
    amber: "text-accent-amber",
    purple: "text-accent-purple",
  }[tone];
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className={cn("font-mono text-[13px]", text)}>
          {invert ? `${value}%` : value}
        </span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
        <motion.div
          initial={false}
          animate={{ width: `${value}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
          className={cn("h-full rounded-full", fill)}
        />
      </div>
    </div>
  );
}
