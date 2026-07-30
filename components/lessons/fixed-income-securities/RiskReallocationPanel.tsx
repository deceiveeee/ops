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
 * Section 10 — Risk reallocation panel.
 * Before: loan pool risk held together. After: risk allocated into
 * Senior / Mezzanine / Junior. Increasing underlying loan stress makes Junior
 * absorb first, Mezzanine next, Senior protected until lower layers exhausted.
 * Key message: risk moved, not vanished.
 */
export default function RiskReallocationPanel() {
  const reduce = useReducedMotion();
  const [stress, setStress] = useState(20); // 0..100 underlying loan stress

  // Loss absorption model (illustrative)
  const totalLoss = stress * 1.4; // up to 140
  const juniorCapacity = 30;
  const mezzCapacity = 40;
  const juniorLoss = Math.min(totalLoss, juniorCapacity);
  const mezzLoss = Math.min(Math.max(totalLoss - juniorCapacity, 0), mezzCapacity);
  const seniorLoss = Math.max(totalLoss - juniorCapacity - mezzCapacity, 0);

  const seniorProtected = seniorLoss === 0;
  const mezzHit = mezzLoss > 0;
  const juniorWiped = juniorLoss >= juniorCapacity;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Risk reallocation, not elimination">
        Securitization moves risk from one place to another. The pool&apos;s
        total risk is split across tranches so that Junior absorbs the first
        losses, Mezzanine the next, and Senior is protected until the lower
        layers are exhausted. Risk moved. Risk did not vanish.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Risk reallocation panel
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Drag stress to hit the tranches
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Before and after securitization
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Before securitization, every investor in the loan pool bears the same
          risk. After securitization, losses are layered: Junior takes the first
          hit, Mezzanine the next, Senior last. Increase the underlying loan
          stress to watch losses climb the stack.
        </p>

        {/* Before / After */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <div className="ops-caption text-[11px] text-slate-400">
              Before · untranched pool
            </div>
            <div className="mt-3 flex h-24 items-center justify-center rounded-xl border border-white/10 bg-white/[0.02]">
              <span className="font-sans text-[14px] text-slate-300">
                All investors share the same risk
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-accent-cyan/20 bg-ink-950/40 p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">
              After · tranched
            </div>
            <div className="mt-3 space-y-2">
              <TrancheLoss
                name="Senior"
                loss={seniorLoss}
                capacity={100}
                protectedLayer={seniorProtected}
                tone="green"
                reduce={reduce}
              />
              <TrancheLoss
                name="Mezzanine"
                loss={mezzLoss}
                capacity={mezzCapacity}
                protectedLayer={!mezzHit}
                tone="amber"
                reduce={reduce}
              />
              <TrancheLoss
                name="Junior / equity"
                loss={juniorLoss}
                capacity={juniorCapacity}
                protectedLayer={!juniorWiped}
                tone="red"
                reduce={reduce}
                firstLoss
              />
            </div>
          </div>
        </div>

        {/* Stress slider */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="flex items-center justify-between">
            <span className="ops-caption text-[11px] text-slate-400">
              Underlying loan stress
            </span>
            <span
              className={cn(
                "font-sans text-[13px]",
                stress > 66
                  ? "text-accent-red"
                  : stress > 33
                    ? "text-accent-amber"
                    : "text-accent-green",
              )}
            >
              {stress}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={stress}
            onChange={(e) => setStress(Number(e.target.value))}
            aria-label="Underlying loan stress level"
            className="mt-4 w-full accent-accent-red"
          />
          <div className="mt-1 flex justify-between font-sans text-[11px] text-slate-500">
            <span>Calm</span>
            <span>Stress</span>
            <span>Crisis</span>
          </div>
        </div>

        {/* Status readout */}
        <div
          className={cn(
            "mt-6 rounded-xl border p-5",
            seniorProtected
              ? "border-accent-green/30 bg-accent-green/[0.06]"
              : "border-accent-red/40 bg-accent-red/[0.08]",
          )}
        >
          <div
            className={cn(
              "ops-caption text-[11px] uppercase tracking-[0.14em]",
              seniorProtected ? "text-accent-green" : "text-accent-red",
            )}
          >
            {seniorProtected ? "Senior still protected" : "Senior breached"}
          </div>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
            {seniorProtected
              ? `Junior has absorbed ${juniorLoss.toFixed(0)} of the pool's losses${mezzHit ? ` and Mezzanine ${mezzLoss.toFixed(0)}` : ""}. Senior is untouched — so far.`
              : `Lower layers are exhausted. Senior has taken ${seniorLoss.toFixed(0)} in losses. The protection has run out.`}
          </p>
          <p className="ops-body-strong mt-3 text-[16px] text-slate-50">
            Risk moved. Risk did not vanish.
          </p>
        </div>

        <ProfessorNote tone="purple" className="mt-5">
          The genius of securitization is risk allocation. The danger is
          forgetting that allocation depends on assumptions — how big losses
          are, and how correlated the underlying loans turn out to be.
        </ProfessorNote>
      </InteractiveFrame>
    </div>
  );
}

function TrancheLoss({
  name,
  loss,
  capacity,
  protectedLayer,
  tone,
  reduce,
  firstLoss = false,
}: {
  name: string;
  loss: number;
  capacity: number;
  protectedLayer: boolean;
  tone: "green" | "amber" | "red";
  reduce: boolean | null;
  firstLoss?: boolean;
}) {
  const fill = {
    green: "bg-accent-green",
    amber: "bg-accent-amber",
    red: "bg-accent-red",
  }[tone];
  const text = {
    green: "text-accent-green",
    amber: "text-accent-amber",
    red: "text-accent-red",
  }[tone];
  const pct = Math.min(100, (loss / capacity) * 100);
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[12px] text-slate-200">
          {name}
          {firstLoss && (
            <span className="ml-2 ops-caption text-[10px] text-slate-500">
              first loss
            </span>
          )}
        </span>
        <span className={cn("font-sans text-[11px]", text)}>
          {protectedLayer ? "protected" : `${loss.toFixed(0)} loss`}
        </span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
          className={cn("h-full rounded-full", fill)}
        />
      </div>
    </div>
  );
}
