"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

const RATE = 10;

type ProjectKey = "A" | "B" | "C";

const PROJECTS: Record<ProjectKey, {
  name: string;
  blurb: string;
  flows: number[];
  tone: "cyan" | "green" | "red";
}> = {
  A: {
    name: "Project A · stops after payback",
    blurb: "Recovers the $100 investment in 2 years, then produces nothing.",
    flows: [-100, 50, 50, 0, 0],
    tone: "cyan",
  },
  B: {
    name: "Project B · valuable later cash",
    blurb: "Same payback as A, but continues producing substantial cash in Years 3–4.",
    flows: [-100, 50, 50, 100, 100],
    tone: "green",
  },
  C: {
    name: "Project C · later cleanup cost",
    blurb: "Recovers quickly, but a large shutdown payment is required in Year 4.",
    flows: [-100, 60, 60, 0, -120],
    tone: "red",
  },
};

function npv(flows: number[], rate: number) {
  return flows.reduce((s, f, t) => s + f / Math.pow(1 + rate / 100, t), 0);
}

function payback(flows: number[]) {
  const initial = Math.abs(flows[0]);
  let cum = 0;
  let prev = 0;
  for (let i = 1; i < flows.length; i++) {
    prev = cum;
    cum += flows[i];
    if (cum >= initial) {
      return i - 1 + (initial - prev) / flows[i];
    }
  }
  return -1;
}

export default function PaybackBlindSpot() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<ProjectKey>("B");
  const [revealed, setRevealed] = useState(false);

  const p = PROJECTS[active];
  const pb = payback(p.flows);
  const fullNPV = npv(p.flows, RATE);

  // NPV using only up-to-payback cash flows
  const truncatedFlows = [...p.flows];
  const pbYear = Math.ceil(pb);
  for (let i = pbYear + 1; i < truncatedFlows.length; i++) truncatedFlows[i] = 0;
  const truncatedNPV = npv(truncatedFlows, RATE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Project">
        {(Object.keys(PROJECTS) as ProjectKey[]).map((key) => (
          <button
            key={key} type="button" role="tab"
            aria-selected={active === key}
            onClick={() => { setActive(key); setRevealed(false); }}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              active === key
                ? PROJECTS[key].tone === "cyan" ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                  : PROJECTS[key].tone === "green" ? "border-accent-green bg-accent-green/15 text-accent-green"
                  : "border-accent-red bg-accent-red/15 text-accent-red"
                : "border-white/20 text-slate-200 hover:border-white/30",
            )}
          >
            {PROJECTS[key].name.split("·")[0].trim()}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.6] text-slate-100">{p.blurb}</p>
        <p className="ops-body mt-2 text-[14px] leading-[1.55] text-slate-400">
          Payback period: <span className="font-mono text-white">{fmt(pb, 1)} years</span> (all three projects share this).
        </p>

        {/* Timeline */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {p.flows.map((f, i) => {
            const hidden = !revealed && i > Math.ceil(pb);
            return (
              <div key={i} className={cn(
                "flex-shrink-0 rounded-lg border p-3 text-center transition-opacity",
                hidden ? "border-white/5 bg-white/[0.01] opacity-30" : "border-white/10 bg-ink-950/40",
              )} style={{ minWidth: "80px" }}>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
                  {i === 0 ? "Year 0" : `Year ${i}`}
                </div>
                <div className={cn("mt-1 font-mono text-[14px] tabular-nums",
                  hidden ? "text-slate-600" : f >= 0 ? "text-accent-green" : "text-accent-red")}>
                  {hidden ? "???" : `${f >= 0 ? "+" : "−"}$${fmt(Math.abs(f))}`}
                </div>
                {hidden && (
                  <div className="mt-1 font-mono text-[9px] uppercase text-slate-600">hidden</div>
                )}
              </div>
            );
          })}
        </div>

        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-4 rounded-full border border-accent-amber/50 bg-accent-amber/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
          >
            Reveal post-payback cash flows
          </button>
        )}
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-red">
                What payback sees
              </div>
              <div className="mt-2 font-mono text-[20px] tabular-nums text-white">
                NPV (truncated) = {truncatedNPV >= 0 ? "+" : "−"}${fmt(Math.abs(truncatedNPV))}
              </div>
              <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
                Cash flows after the payback date are ignored.
              </p>
            </div>
            <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-green">
                Full project NPV
              </div>
              <div className={cn("mt-2 font-mono text-[20px] tabular-nums", fullNPV > 0 ? "text-accent-green" : "text-accent-red")}>
                {fullNPV >= 0 ? "+" : "−"}${fmt(Math.abs(fullNPV))}
              </div>
              <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
                {active === "B"
                  ? "Valuable later inflows add substantial value invisible to payback."
                  : active === "C"
                    ? "A later cleanup obligation destroys value invisible to payback."
                    : "This project stops producing — payback captures the full picture here."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          Payback can ignore both valuable later inflows and costly later obligations. A project
          that looks identical by payback period can create very different amounts of value.
        </p>
      </div>
    </div>
  );
}
