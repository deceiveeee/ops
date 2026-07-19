"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";

/**
 * Section 11 — Senior tranche stress room.
 * Senior tranche starts with an AAA badge; Junior sits below it with a visible
 * protection layer. Stress controls (default correlation, liquidity, housing
 * market, forced selling / mark-to-market) rise → senior value drops, the
 * rating badge cracks, liquidity worsens, mark-to-market loss climbs.
 * Message: the label did not change the underlying exposure.
 */
type StressId = "correlation" | "liquidity" | "housing" | "marks";

const STRESSES: { id: StressId; label: string; desc: string }[] = [
  { id: "correlation", label: "Default correlation", desc: "How much loans default together." },
  { id: "liquidity", label: "Liquidity", desc: "Whether buyers remain for the tranches." },
  { id: "housing", label: "Housing market", desc: "Underlying collateral value." },
  { id: "marks", label: "Forced selling / mark-to-market", desc: "Fire-sale pressure on prices." },
];

export default function SeniorTrancheStressRoom() {
  const reduce = useReducedMotion();
  const [stress, setStress] = useState<Record<StressId, number>>({
    correlation: 20,
    liquidity: 20,
    housing: 20,
    marks: 20,
  });

  const total =
    (stress.correlation + stress.liquidity + stress.housing + stress.marks) / 4;

  const seniorValue = Math.max(40, 100 - total * 0.85);
  const mtmLoss = Math.min(60, total * 0.6);
  const badgeCracks = total > 40;
  const badgeShattered = total > 70;

  const setOne = (id: StressId, v: number) =>
    setStress((prev) => ({ ...prev, [id]: v }));

  const badge = badgeShattered
    ? { label: "?", cls: "border-accent-red/60 text-accent-red", text: "Downgraded" }
    : badgeCracks
      ? { label: "A", cls: "border-accent-amber/60 text-accent-amber", text: "Under review" }
      : { label: "AAA", cls: "border-accent-green/60 text-accent-green", text: "Senior" };

  return (
    <div className="space-y-6">
      <DefinitionCard term="The label is not the exposure">
        A senior tranche may carry an AAA badge because Junior and Mezzanine sit
        beneath it. But that badge depends on assumptions about correlation,
        liquidity, and collateral. When stress rises, the badge can crack even
        though the underlying loans are the same.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Senior tranche stress room
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Raise each stress lever
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Stress the senior tranche
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          The senior tranche starts AAA. A protection layer (Junior + Mezzanine)
          sits beneath it. Push the stress levers up and watch senior value fall,
          the badge crack, liquidity dry, and mark-to-market losses climb.
        </p>

        {/* Tranche stack with badge */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="flex min-w-[480px] items-stretch gap-4">
            {/* Senior */}
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <span className="ops-caption text-[11px] text-slate-400">
                  Senior tranche
                </span>
                <motion.span
                  key={badge.label}
                  initial={reduce ? false : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "rounded-md border px-2.5 py-0.5 font-mono text-[12px]",
                    badge.cls,
                  )}
                >
                  {badge.label}
                </motion.span>
              </div>
              <div className="mt-2 flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="ops-caption text-[11px] text-slate-400">
                  Senior value
                </div>
                <motion.div
                  initial={false}
                  animate={{ opacity: seniorValue < 70 ? 0.85 : 1 }}
                  className="mt-1 font-mono text-[24px] text-white"
                >
                  {seniorValue.toFixed(0)}
                </motion.div>
                <div className="mt-3 h-2 overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
                  <motion.div
                    initial={false}
                    animate={{ width: `${seniorValue}%` }}
                    transition={reduce ? { duration: 0 } : { duration: 0.3 }}
                    className={cn(
                      "h-full rounded-full",
                      seniorValue > 70
                        ? "bg-accent-green"
                        : seniorValue > 50
                          ? "bg-accent-amber"
                          : "bg-accent-red",
                    )}
                  />
                </div>
                <div className="mt-3 ops-caption text-[11px] text-slate-500">
                  {badgeShattered
                    ? "Badge downgraded. Protection exhausted."
                    : badgeCracks
                      ? "Badge under review. Protection eroding."
                      : "Protection intact. Badge holds."}
                </div>
              </div>
            </div>

            {/* Protection layer */}
            <div className="flex w-28 flex-col justify-end">
              <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-3 text-center">
                <div className="ops-caption text-[11px] text-accent-amber">
                  Mezzanine
                </div>
              </div>
              <div className="mt-2 rounded-xl border border-accent-red/30 bg-accent-red/[0.06] p-3 text-center">
                <div className="ops-caption text-[11px] text-accent-red">
                  Junior
                </div>
                <div className="ops-caption mt-1 text-[10px] text-slate-500">
                  protection layer
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stress levers */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {STRESSES.map((s) => (
            <StressLever
              key={s.id}
              label={s.label}
              desc={s.desc}
              value={stress[s.id]}
              onChange={(v) => setOne(s.id, v)}
            />
          ))}
        </div>

        {/* Mark-to-market + liquidity meters */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <div className="flex items-center justify-between">
              <span className="ops-caption text-[11px] text-slate-400">
                Mark-to-market loss
              </span>
              <span className="font-mono text-[13px] text-accent-red">
                -{mtmLoss.toFixed(0)}
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
              <motion.div
                initial={false}
                animate={{ width: `${(mtmLoss / 60) * 100}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.3 }}
                className="h-full rounded-full bg-accent-red"
              />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <div className="flex items-center justify-between">
              <span className="ops-caption text-[11px] text-slate-400">
                Liquidity
              </span>
              <span
                className={cn(
                  "font-mono text-[13px]",
                  stress.liquidity > 66
                    ? "text-accent-red"
                    : stress.liquidity > 33
                      ? "text-accent-amber"
                      : "text-accent-green",
                )}
              >
                {stress.liquidity > 66 ? "Dry" : stress.liquidity > 33 ? "Thin" : "Ok"}
              </span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full border border-white/10 bg-ink-950/60">
              <motion.div
                initial={false}
                animate={{ width: `${100 - stress.liquidity}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.3 }}
                className="h-full rounded-full bg-accent-cyan"
              />
            </div>
          </div>
        </div>

        {/* Takeaway */}
        <div className="mt-6 rounded-xl border border-accent-purple/30 bg-accent-purple/[0.06] p-5">
          <div className="ops-caption text-[11px] uppercase tracking-[0.14em] text-accent-purple">
            The label did not change the underlying exposure
          </div>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
            As one risk manager later put it: the instruments were new, the
            losses came from familiar sources — housing, leverage, liquidity, and
            correlated defaults. The AAA badge was a conclusion drawn from
            assumptions, not a guarantee written into the assets.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function StressLever({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-5">
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span
          className={cn(
            "font-mono text-[13px]",
            value > 66
              ? "text-accent-red"
              : value > 33
                ? "text-accent-amber"
                : "text-accent-green",
          )}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-4 w-full accent-accent-red"
      />
      <p className="ops-body mt-2 text-[13px] leading-5 text-slate-400">{desc}</p>
    </div>
  );
}
