"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag } from "./shared";

type Level = "Low" | "Medium" | "High";

type Row = {
  id: string;
  label: string;
  complexity: Level;
  tradeFreq: Level;
  transparency: Level;
  liquidityRisk: Level;
};

const ROWS: Row[] = [
  {
    id: "tbills",
    label: "Treasury bills / notes",
    complexity: "Low",
    tradeFreq: "High",
    transparency: "High",
    liquidityRisk: "Low",
  },
  {
    id: "tbonds",
    label: "Treasury bonds",
    complexity: "Low",
    tradeFreq: "High",
    transparency: "High",
    liquidityRisk: "Low",
  },
  {
    id: "igcorp",
    label: "Investment-grade corporate",
    complexity: "Medium",
    tradeFreq: "Medium",
    transparency: "Medium",
    liquidityRisk: "Medium",
  },
  {
    id: "muni",
    label: "Municipal bonds",
    complexity: "Medium",
    tradeFreq: "Medium",
    transparency: "Medium",
    liquidityRisk: "Medium",
  },
  {
    id: "mbs",
    label: "Mortgage-backed securities",
    complexity: "High",
    tradeFreq: "Medium",
    transparency: "Medium",
    liquidityRisk: "High",
  },
  {
    id: "abs",
    label: "Asset-backed securities",
    complexity: "High",
    tradeFreq: "Low",
    transparency: "Low",
    liquidityRisk: "High",
  },
  {
    id: "cdo",
    label: "CDOs / structured credit",
    complexity: "High",
    tradeFreq: "Low",
    transparency: "Low",
    liquidityRisk: "High",
  },
];

const COLUMNS: {
  key: keyof Pick<
    Row,
    "complexity" | "tradeFreq" | "transparency" | "liquidityRisk"
  >;
  label: string;
}[] = [
  { key: "complexity", label: "Typical complexity" },
  { key: "tradeFreq", label: "Trading frequency" },
  { key: "transparency", label: "Price transparency" },
  { key: "liquidityRisk", label: "Liquidity risk" },
];

// Stress worsens non-Treasury rows; liquidityRisk intensifies with stress.
function stressLevel(
  row: Row,
  stress: number,
  col: (typeof COLUMNS)[number]["key"],
): Level {
  const base = row[col];
  if (col === "liquidityRisk") {
    if (row.id === "tbills" || row.id === "tbonds")
      return stress > 66 ? "Medium" : "Low";
    if (base === "High") return "High";
    if (base === "Medium") return stress > 33 ? "High" : "Medium";
    return stress > 66 ? "Medium" : "Low";
  }
  if (col === "tradeFreq") {
    if (row.id === "tbills" || row.id === "tbonds") return "High";
    if (stress > 66 && base !== "High") return downgrade(base);
    return base;
  }
  return base;
}

function downgrade(l: Level): Level {
  if (l === "High") return "Medium";
  if (l === "Medium") return "Low";
  return "Low";
}

const LEVEL_CELL: Record<Level, string> = {
  Low: "border-accent-green/40 bg-accent-green/10 text-accent-green",
  Medium: "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
  High: "border-accent-red/40 bg-accent-red/10 text-accent-red",
};

/**
 * Section 7 — Liquidity stress simulator.
 * Heat map of bond segments with a Normal → Stressed slider.
 */
export default function LiquidityStressSimulator() {
  const reduce = useReducedMotion();
  const [stress, setStress] = useState(0); // 0..100
  const regime = stress > 66 ? "Stressed" : stress > 33 ? "Cautious" : "Normal";

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Liquidity stress simulator
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          Drag the slider: Normal → Stressed
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        Huge market, uneven liquidity
      </h3>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
        Bond markets are huge, but trading differs from stocks. Many bonds do
        not trade on a centralized exchange. A large issuer can have many
        different bonds outstanding, each with a different maturity, coupon,
        covenant, or structure. Some bonds trade often while others trade
        rarely. Treasuries are generally more liquid; structured products such
        as CDOs can be much less liquid.
      </p>

      {/* Stress slider */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
        <div className="flex items-center justify-between">
          <span className="ops-caption text-[11px] text-slate-400">
            Market regime
          </span>
          <motion.span
            key={regime}
            initial={reduce ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-[12px] uppercase tracking-[0.14em]",
              regime === "Normal"
                ? "border-accent-green/50 text-accent-green"
                : regime === "Cautious"
                  ? "border-accent-amber/50 text-accent-amber"
                  : "border-accent-red/50 text-accent-red",
            )}
          >
            {regime}
          </motion.span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={stress}
          onChange={(e) => setStress(Number(e.target.value))}
          aria-label="Market stress level from normal to stressed"
          className="mt-4 w-full accent-accent-cyan"
        />
        <div className="mt-1 flex justify-between font-mono text-[11px] text-slate-500">
          <span>Normal</span>
          <span>Cautious</span>
          <span>Stressed</span>
        </div>
      </div>

      {/* Heat map table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr>
              <th className="ops-caption p-3 text-[11px] text-slate-400">
                Segment
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  className="ops-caption p-3 text-center text-[11px] text-slate-400"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.id} className="border-t border-white/10">
                <td className="ops-body p-3 text-[13px] text-slate-200">
                  {row.label}
                </td>
                {COLUMNS.map((c) => {
                  const lvl = stressLevel(row, stress, c.key);
                  return (
                    <td key={c.key} className="p-3 text-center">
                      <motion.span
                        key={lvl}
                        initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "inline-flex items-center rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
                          LEVEL_CELL[lvl],
                        )}
                      >
                        {lvl}
                      </motion.span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="ops-body text-[14px] leading-6 text-slate-200">
          When buyers disappear, price discovery becomes harder. A bond can
          still have promised cash flows but become hard to sell at a fair
          price.
        </p>
      </div>
    </InteractiveFrame>
  );
}
