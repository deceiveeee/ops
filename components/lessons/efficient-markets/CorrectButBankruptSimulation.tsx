"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const FUNDAMENTAL = 70;
const INITIAL_PRICE = 100;
const PRICE_PATH = [100, 115, 135, 160, 90, 65];
const STEP_LABELS = ["Open short", "Wave 1", "Wave 2", "Wave 3 — peak", "Recovery", "Realization"];

const MAINTENANCE_MARGIN = 0.25;

type Run = {
  shares: number;
  cash: number;
};

function computeRun(run: Run) {
  const shares = run.shares;
  const cashPosted = run.cash;
  const proceeds = shares * INITIAL_PRICE;
  const collateralAccount = proceeds + cashPosted;

  const steps = PRICE_PATH.map((price, i) => {
    const liability = shares * price;
    const equity = collateralAccount - liability;
    const marginRatio = liability > 0 ? equity / liability : Infinity;
    const marginCall = marginRatio < MAINTENANCE_MARGIN;
    const insolvent = equity <= 0;
    return {
      step: i,
      label: STEP_LABELS[i],
      price,
      liability,
      equity,
      marginRatio,
      marginCall,
      insolvent,
      gain: INITIAL_PRICE - price,
    };
  });

  let liquidationStep = -1;
  for (let i = 1; i < steps.length; i++) {
    if (steps[i].insolvent) {
      liquidationStep = i;
      break;
    }
    if (steps[i].marginCall) {
      liquidationStep = i;
      break;
    }
  }

  const survives = liquidationStep === -1;
  // If liquidated, the investor recovers whatever equity remains at the liquidation step
  // (clamped at zero — in the simplified model, losses cannot exceed the cash posted).
  const finalEquity = survives
    ? collateralAccount - shares * PRICE_PATH[PRICE_PATH.length - 1]
    : Math.max(0, steps[liquidationStep].equity);
  const finalGain = finalEquity - cashPosted;

  const wouldHaveGain = collateralAccount - shares * PRICE_PATH[PRICE_PATH.length - 1] - cashPosted;

  return { steps, liquidationStep, survives, finalEquity, finalGain, wouldHaveGain, collateralAccount, proceeds };
}

function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtPct(n: number, d = 0) {
  return `${(n * 100).toFixed(d)}%`;
}

export default function CorrectButBankruptSimulation() {
  const reduce = useReducedMotion();
  const [run, setRun] = useState<Run>({ shares: 100, cash: 8000 });
  const [revealStep, setRevealStep] = useState(0);
  const [scenarioName, setScenarioName] = useState("Default");

  const result = computeRun(run);

  const advance = () => setRevealStep((s) => Math.min(PRICE_PATH.length, s + 1));
  const reset = () => setRevealStep(0);

  const setSize = (shares: number, cash: number, name: string) => {
    setRun({ shares, cash });
    setScenarioName(name);
    setRevealStep(0);
  };

  // SVG scaling
  const W = 600, H = 240, PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 40;
  const chartW = W - PAD_L - PAD_R, chartH = H - PAD_T - PAD_B;
  const maxPrice = 180, minPrice = 50;
  const xScale = (i: number) => PAD_L + (i / (PRICE_PATH.length - 1)) * chartW;
  const yScale = (p: number) => PAD_T + chartH - ((p - minPrice) / (maxPrice - minPrice)) * chartH;

  const visibleSteps = result.steps.slice(0, revealStep);
  const current = revealStep > 0 ? result.steps[revealStep - 1] : null;
  const liquidated = result.liquidationStep !== -1 && revealStep > result.liquidationStep;

  return (
    <div className="space-y-6">
      {/* Setup */}
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          The trade · deterministic price path
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Intrinsic value" value={`$${FUNDAMENTAL}`} tone="cyan" />
          <Stat label="Initial price" value={`$${INITIAL_PRICE}`} tone="amber" />
          <Stat label="Maintenance margin" value={fmtPct(MAINTENANCE_MARGIN)} tone="purple" />
          <Stat label="Scenario" value={scenarioName} tone="neutral" />
        </div>
        <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-100">
          The investor shorts the stock at <span className="text-accent-amber">$100</span>. The
          stock follows a fixed path: <span className="font-sans text-accent-red">100 → 115 → 135 → 160 → 90 → 65</span>.
          Eventually the price reaches <span className="text-accent-green">$65</span>, below the
          intrinsic-value estimate. The investor was right. The question is whether the investor
          survives long enough to benefit.
        </p>
      </div>

      {/* Scenario presets */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Choose a scenario
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <PresetButton active={scenarioName === "Aggressive"}
            onClick={() => setSize(150, 5000, "Aggressive")}
            label="Aggressive"
            detail="150 shares · $5,000 cash"
            tone="red" />
          <PresetButton active={scenarioName === "Default"}
            onClick={() => setSize(100, 8000, "Default")}
            label="Default"
            detail="100 shares · $8,000 cash"
            tone="amber" />
          <PresetButton active={scenarioName === "Conservative"}
            onClick={() => setSize(50, 10000, "Conservative")}
            label="Conservative"
            detail="50 shares · $10,000 cash"
            tone="green" />
        </div>

        {/* Sliders */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Slider label="Position size (shares short)"
            value={run.shares} min={10} max={250} step={5} suffix=" sh"
            onChange={(v) => { setRun((r) => ({ ...r, shares: v })); setScenarioName("Custom"); setRevealStep(0); }} />
          <Slider label="Starting cash posted (collateral)"
            value={run.cash} min={1000} max={30000} step={500} prefix="$"
            onChange={(v) => { setRun((r) => ({ ...r, cash: v })); setScenarioName("Custom"); setRevealStep(0); }} />
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Price path · {revealStep === 0 ? "press Start to advance" : `Step ${revealStep} of ${PRICE_PATH.length}`}
        </div>
        <div className="mt-3 overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: "420px" }}
            role="img" aria-label={`Position: ${run.shares} shares short. Cash posted: $${run.cash}. Currently at step ${revealStep}. ${current ? `Price is $${current.price}, unrealized loss per share is $${Math.max(0, INITIAL_PRICE - current.price)}.` : ""}`}>
            {/* axes */}
            <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={H - PAD_B} stroke="rgba(255,255,255,0.2)" />
            <line x1={PAD_L} y1={H - PAD_B} x2={W - PAD_R} y2={H - PAD_B} stroke="rgba(255,255,255,0.2)" />

            {/* intrinsic value line */}
            <line x1={PAD_L} y1={yScale(FUNDAMENTAL)} x2={W - PAD_R} y2={yScale(FUNDAMENTAL)} stroke="#22d3ee" strokeDasharray="4 4" strokeWidth={1.5} />
            <text x={W - PAD_R} y={yScale(FUNDAMENTAL) - 6} fill="#22d3ee" fontSize={10} fontFamily="monospace" textAnchor="end">{`Intrinsic value $${FUNDAMENTAL}`}</text>

            {/* initial price line */}
            <line x1={PAD_L} y1={yScale(INITIAL_PRICE)} x2={W - PAD_R} y2={yScale(INITIAL_PRICE)} stroke="#fbbf24" strokeDasharray="2 3" strokeWidth={1} opacity={0.6} />

            {/* price points and path */}
            {PRICE_PATH.map((p, i) => {
              const x = xScale(i);
              const y = yScale(p);
              const reached = i < revealStep;
              const isCurrent = i === revealStep - 1;
              const isLiquidation = result.liquidationStep === i;
              return (
                <g key={i}>
                  {i > 0 && i < revealStep && (
                    <line x1={xScale(i - 1)} y1={yScale(PRICE_PATH[i - 1])} x2={x} y2={y}
                      stroke="#f87171" strokeWidth={2} />
                  )}
                  <circle cx={x} cy={y} r={isCurrent ? 7 : reached ? 5 : 3.5}
                    fill={isLiquidation && reached ? "#f87171" : isCurrent ? "#fbbf24" : reached ? "#f87171" : "rgba(255,255,255,0.3)"}
                    stroke={isCurrent ? "#fbbf24" : reached ? "#f87171" : "rgba(255,255,255,0.5)"}
                    strokeWidth={1.5} />
                  {reached && (
                    <text x={x} y={y - 12} fill={isCurrent ? "#fbbf24" : "#f87171"} fontSize={11} fontFamily="monospace" textAnchor="middle">
                      ${p}
                    </text>
                  )}
                  <text x={x} y={H - PAD_B + 16} fill="rgba(255,255,255,0.6)" fontSize={10} fontFamily="monospace" textAnchor="middle">
                    {STEP_LABELS[i].split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Live readouts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={liquidated ? "Price now" : "Current price"}
          value={current ? `$${current.price}` : "—"}
          tone={current && current.price > INITIAL_PRICE ? "red" : "green"} />
        {liquidated ? (
          <>
            <Stat label="Closed at"
              value={`$${PRICE_PATH[result.liquidationStep]}`}
              tone="red" />
            <Stat label="Realized loss"
              value={`-$${fmt(run.cash - Math.max(0, result.steps[result.liquidationStep].equity))}`}
              tone="red" />
            <Stat label="Hypothetical: if held"
              value={current && current.gain < 0 ? `-$${fmt(-current.gain)}/sh` : current ? `+$${fmt(current.gain)}/sh` : "—"}
              tone={current && current.gain < 0 ? "red" : "green"} />
          </>
        ) : (
          <>
            <Stat label="Unrealized loss / share"
              value={current ? (current.gain < 0 ? `-$${fmt(-current.gain)}` : `+$${fmt(current.gain)}`) : "—"}
              tone={current && current.gain < 0 ? "red" : "green"} />
            <Stat label="Equity"
              value={current ? `$${fmt(current.equity)}` : "—"}
              tone={current && current.equity < 0 ? "red" : current && current.equity < run.cash ? "amber" : "green"} />
            <Stat label="Margin ratio"
              value={current ? fmtPct(current.marginRatio) : "—"}
              tone={current && current.marginCall ? "red" : current && current.marginRatio < 0.5 ? "amber" : "green"} />
          </>
        )}
      </div>

      {/* Margin status / liquidation */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-2xl border p-5 sm:p-6",
              liquidated
                ? "border-accent-red/40 bg-accent-red/[0.06]"
                : current.marginCall
                  ? "border-accent-amber/40 bg-accent-amber/[0.06]"
                  : "border-accent-green/25 bg-accent-green/[0.05]",
            )}>
            <div className={cn("font-sans text-[12px] uppercase tracking-[0.16em]",
              liquidated ? "text-accent-red" : current.marginCall ? "text-accent-amber" : "text-accent-green")}>
              {liquidated ? "Forced liquidation" : current.marginCall ? "Margin call" : "Within margin"}
            </div>
            <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-100">
              {liquidated
                ? `The broker has closed the position. Equity has fallen below the ${fmtPct(MAINTENANCE_MARGIN)} maintenance threshold. The investor walks away with $${fmt(Math.max(0, current.equity))} of the $${fmt(run.cash)} posted — a realized loss of $${fmt(run.cash - Math.max(0, current.equity))} — and is no longer in the trade.`
                : current.marginCall
                  ? `Margin ratio has fallen below ${fmtPct(MAINTENANCE_MARGIN)}. The broker demands additional cash. If it cannot be posted, the position will be liquidated at the next step.`
                  : `Margin ratio remains above ${fmtPct(MAINTENANCE_MARGIN)}. The position survives this step — for now.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        {revealStep < PRICE_PATH.length ? (
          <button type="button" onClick={advance}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
            {revealStep === 0
              ? "Start simulation →"
              : liquidated
                ? `See what happens next →`
                : `Advance to ${STEP_LABELS[revealStep]} →`}
          </button>
        ) : (
          <button type="button" onClick={reset}
            className="rounded-full border border-white/20 px-5 py-2 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
            ↻ Run again
          </button>
        )}
        {liquidated && revealStep < PRICE_PATH.length && (
          <button type="button" onClick={() => setRevealStep(PRICE_PATH.length)}
            className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
            Skip to outcome →
          </button>
        )}
      </div>

      {/* Final outcome */}
      <AnimatePresence>
        {revealStep === PRICE_PATH.length && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3">
            <div className={cn("rounded-2xl border p-5 sm:p-6",
              result.survives
                ? "border-accent-green/40 bg-gradient-to-br from-accent-green/[0.08] via-white/[0.03] to-transparent"
                : "border-accent-red/40 bg-gradient-to-br from-accent-red/[0.08] via-white/[0.03] to-transparent")}>
              <div className={cn("font-sans text-[12px] uppercase tracking-[0.16em]",
                result.survives ? "text-accent-green" : "text-accent-red")}>
                {result.survives ? "Survived — and benefited" : "Liquidated — and missed the realization"}
              </div>
              <p className="ops-body mt-2 text-[17px] leading-[1.5] text-white">
                {result.survives
                  ? `The investor held the position all the way to $${PRICE_PATH[PRICE_PATH.length - 1]}. Final gain on posted cash: $${fmt(result.finalGain)}.`
                  : `The investor was liquidated at $${PRICE_PATH[result.liquidationStep]} and lost $${fmt(run.cash - Math.max(0, result.steps[result.liquidationStep].equity))} of the $${fmt(run.cash)} posted. The stock then fell to $${PRICE_PATH[PRICE_PATH.length - 1]} — without the investor in the trade.`}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Stat label="Realized P&L"
                  value={`$${fmt(result.finalGain)}`}
                  tone={result.finalGain >= 0 ? "green" : "red"} />
                <Stat label="If survived to end"
                  value={`$${fmt(result.wouldHaveGain)}`}
                  tone="cyan" />
                <Stat label="Outcome gap"
                  value={`$${fmt(result.wouldHaveGain - result.finalGain)}`}
                  tone="amber" />
              </div>
            </div>

            <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.05] p-5 sm:p-6">
              <p className="ops-body text-[17px] leading-[1.5] text-white">
                Being correct eventually does not guarantee that the investor survives long enough to benefit.
              </p>
              <p className="ops-body mt-2 text-[14px] leading-[1.65] text-slate-200">
                Try the Conservative scenario. Smaller position, more cash, more room to absorb the
                drawdown. The same price path, the same thesis, a very different outcome.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5">
        <div className="font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
          How the math works
        </div>
        <p className="ops-body mt-2 text-[13px] leading-[1.6] text-slate-300">
          Collateral account = short-sale proceeds + cash posted by investor = ${(run.shares * INITIAL_PRICE + run.cash).toLocaleString()}.
          At each step, liability = shares × current price. Equity = collateral − liability.
          Margin ratio = equity ÷ liability. If margin ratio falls below {fmtPct(MAINTENANCE_MARGIN)}
          {" "}or equity turns negative, the broker liquidates. Numbers are rounded for clarity. The
          model uses a simplified maintenance rule for teaching — actual broker conventions vary.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "cyan" | "amber" | "red" | "green" | "purple" | "neutral" }) {
  const text = tone === "cyan" ? "text-accent-cyan" : tone === "amber" ? "text-accent-amber" : tone === "red" ? "text-accent-red" : tone === "green" ? "text-accent-green" : tone === "purple" ? "text-accent-purple" : "text-white";
  const border = tone === "cyan" ? "border-accent-cyan/25" : tone === "amber" ? "border-accent-amber/25" : tone === "red" ? "border-accent-red/25" : tone === "green" ? "border-accent-green/25" : tone === "purple" ? "border-accent-purple/25" : "border-white/10";
  return (
    <div className={cn("rounded-xl border bg-ink-950/40 px-3 py-2.5", border)}>
      <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className={cn("mt-0.5 font-sans text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}

function PresetButton({ active, onClick, label, detail, tone }: {
  active: boolean; onClick: () => void; label: string; detail: string;
  tone: "red" | "amber" | "green";
}) {
  const text = tone === "red" ? "text-accent-red" : tone === "amber" ? "text-accent-amber" : "text-accent-green";
  const border = tone === "red" ? "border-accent-red/40" : tone === "amber" ? "border-accent-amber/40" : "border-accent-green/40";
  const bg = tone === "red" ? "bg-accent-red/[0.06]" : tone === "amber" ? "bg-accent-amber/[0.06]" : "bg-accent-green/[0.06]";
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("rounded-xl border px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        active ? cn(border, bg) : "border-white/10 bg-white/[0.02] hover:border-white/25")}>
      <div className={cn("font-sans text-[10px] uppercase tracking-[0.14em]", active ? text : "text-slate-400")}>{label}</div>
      <div className={cn("mt-1 text-[12px] leading-tight", active ? "text-white" : "text-slate-200")}>{detail}</div>
    </button>
  );
}

function Slider({ label, value, min, max, step, suffix, prefix, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value.toLocaleString()}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-label={label} />
    </div>
  );
}
