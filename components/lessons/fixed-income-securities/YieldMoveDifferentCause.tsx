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
 * Section 1 — Yield move, different cause.
 * Two bonds both rise 1% in yield. The Treasury move is mostly about
 * rates/inflation/liquidity; the corporate move can also embed credit risk,
 * issuer-specific fear, market risk premium. Same number, different story.
 */
type BondId = "treasury" | "corporate";

type Cause = {
  label: string;
  treasury: boolean;
  corporate: boolean;
};

const CAUSES: Cause[] = [
  { label: "Interest-rate expectations", treasury: true, corporate: true },
  { label: "Inflation expectations", treasury: true, corporate: true },
  { label: "Liquidity / flight-to-safety", treasury: true, corporate: true },
  { label: "Credit / default risk", treasury: false, corporate: true },
  { label: "Market risk premium", treasury: false, corporate: true },
  { label: "Issuer-specific fear", treasury: false, corporate: true },
];

export default function YieldMoveDifferentCause() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<BondId>("treasury");
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-6">
      <DefinitionCard term="Same move, different meaning">
        When a Treasury yield and a corporate yield both rise by{" "}
        <span className="text-slate-50">1%</span>, the number is identical.
        The economic story is not. A Treasury move is mostly about rates,
        inflation, and liquidity. A corporate move can also carry credit risk,
        a market risk premium, and issuer-specific fear.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Yield move · different cause
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Tap a bond to inspect its drivers
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Both yields rose 1%. Why?
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          The two bonds sit side by side. Each shows the same +1% yield move.
          Toggle between them to see which causes could be behind the move.
        </p>

        {/* Two bond cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <BondCard
            id="treasury"
            active={active === "treasury"}
            onSelect={() => setActive("treasury")}
            title="U.S. Treasury"
            sub="Risk-free benchmark"
            tone="green"
            reduce={reduce}
          />
          <BondCard
            id="corporate"
            active={active === "corporate"}
            onSelect={() => setActive("corporate")}
            title="Corporate bond"
            sub="XYZ Industries · 10yr"
            tone="amber"
            reduce={reduce}
          />
        </div>

        {/* Driver list for active bond */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="ops-caption px-3 py-2.5 text-[11px] text-slate-400">
                  Possible driver of the +1% move
                </th>
                <th className="ops-caption px-3 py-2.5 text-center text-[11px] text-slate-400">
                  Treasury
                </th>
                <th className="ops-caption px-3 py-2.5 text-center text-[11px] text-slate-400">
                  Corporate
                </th>
              </tr>
            </thead>
            <tbody>
              {CAUSES.map((c) => (
                <tr key={c.label} className="border-b border-white/5">
                  <td
                    className={cn(
                      "px-3 py-2.5 font-mono text-[13px] transition-colors",
                      active === "treasury" && c.treasury
                        ? "text-accent-green"
                        : active === "corporate" && c.corporate
                          ? "text-accent-amber"
                          : "text-slate-300",
                    )}
                  >
                    {c.label}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <DriverMark on={c.treasury} highlight={active === "treasury"} reduce={reduce} />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <DriverMark on={c.corporate} highlight={active === "corporate"} reduce={reduce} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-expanded={revealed}
          className="mt-5 rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-4 py-2 text-[13px] font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          {revealed ? "Hide takeaway" : "Reveal takeaway"}
        </button>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-4 rounded-xl border border-accent-purple/30 bg-accent-purple/[0.06] p-5"
            >
              <p className="ops-body-strong text-[16px] leading-7 text-slate-50">
                Same numerical yield move.{" "}
                <span className="text-accent-purple">
                  Different economic interpretation.
                </span>
              </p>
              <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
                For the Treasury, the +1% is largely about rates, inflation, and
                liquidity. For the corporate, that same +1% may also embed credit
                risk and investor fear about the issuer — even though the headline
                number looks identical.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveFrame>
    </div>
  );
}

function BondCard({
  active,
  onSelect,
  title,
  sub,
  tone,
  reduce,
}: {
  id: BondId;
  active: boolean;
  onSelect: () => void;
  title: string;
  sub: string;
  tone: "green" | "amber";
  reduce: boolean | null;
}) {
  const accent =
    tone === "green"
      ? "border-accent-green/50 text-accent-green"
      : "border-accent-amber/50 text-accent-amber";
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border bg-white/[0.03] p-5 text-left transition-colors hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        active ? accent : "border-white/10",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{sub}</span>
        <motion.span
          animate={{ scale: active ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-md border px-2 py-0.5 font-mono text-[12px]",
            active
              ? accent
              : "border-white/10 text-slate-500",
          )}
        >
          +1.00%
        </motion.span>
      </div>
      <div className="mt-2 font-mono text-[18px] text-white">{title}</div>
      <div className="ops-caption mt-3 text-[11px] text-slate-500">
        {reduce ? "Yield change" : "Promised yield change"}
      </div>
    </button>
  );
}

function DriverMark({
  on,
  highlight,
  reduce,
}: {
  on: boolean;
  highlight: boolean;
  reduce: boolean | null;
}) {
  if (!on) {
    return <span className="font-mono text-[14px] text-slate-700">·</span>;
  }
  return (
    <motion.span
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[11px]",
        highlight
          ? "border-accent-cyan/60 bg-accent-cyan/20 text-accent-cyan"
          : "border-white/15 bg-white/5 text-slate-300",
      )}
    >
      ✓
    </motion.span>
  );
}
