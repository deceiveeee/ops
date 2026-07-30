"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaCard,
  Var,
  Sub,
  Sup,
  Frac,
} from "./shared";
import CashFlowTimeline, { type CashFlow } from "./CashFlowTimeline";
import {
  priceZeroCoupon,
  solveZeroCouponRate,
  formatMoney,
  formatPercent,
} from "@/lib/fixed-income";

type Mode = "price" | "yield";

/**
 * Section 11 — Pure discount (zero-coupon) bonds.
 * Formula, worked examples, an interactive lab (solve price / solve yield),
 * a discount-tunnel animation, and a price-vs-yield curve with a moving point.
 */
export default function ZeroCouponBondLab() {
  return (
    <div className="space-y-6">
      <DefinitionCard term="Pure discount bond (zero-coupon bond)">
        A bond with <span className="text-accent-cyan">no coupons</span> that pays
        a single principal payment at maturity. When rates are positive it trades
        at a <span className="text-accent-amber">discount</span> to face value.
        STRIPS are a Treasury example.
      </DefinitionCard>

      {/* Core formula */}
      <FormulaCard label="Pure discount bond price" ariaLabel="P zero equals F over quantity one plus r raised to T">
        <div className="flex items-center gap-2">
          <Var>P</Var>
          <Sub>0</Sub>
          <span>=</span>
          <Frac num={<Var>F</Var>} den={<span>(1 + <Var>r</Var>)<Sup><Var>T</Var></Sup></span>} />
        </div>
      </FormulaCard>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <VarDef sym={<><Var>P</Var><Sub>0</Sub></>} def="Price today" />
        <VarDef sym={<Var>F</Var>} def="Face value" />
        <VarDef sym={<Var>r</Var>} def="Discount rate / yield" />
        <VarDef sym={<Var>T</Var>} def="Maturity (years)" />
      </div>

      {/* Worked examples */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="glass-panel p-5">
          <div className="ops-caption text-[11px] text-accent-purple">Example 1 · solve for price</div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
            <Var>F</Var> = $1,000, <Var>r</Var> = 5%, <Var>T</Var> = 3 years.
          </p>
          <div className="mt-3 font-sans text-[15px] text-slate-100">
            <Var>P</Var><Sub>0</Sub> = 1000 / (1.05)<Sup>3</Sup> ≈ <span className="text-accent-green">$863.84</span>
          </div>
        </div>
        <div className="glass-panel p-5">
          <div className="ops-caption text-[11px] text-accent-purple">Example 2 · solve for yield</div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
            <Var>F</Var> = $1, <Var>P</Var><Sub>0</Sub> = 0.797, <Var>T</Var> = 5 years.
          </p>
          <div className="mt-3 font-sans text-[15px] text-slate-100">
            <Var>r</Var> = (1/0.797)<Sup>1/5</Sup> − 1 ≈ <span className="text-accent-cyan">4.64%</span>
          </div>
        </div>
      </div>

      <ZeroCouponLab />
      <PriceYieldCurve />
    </div>
  );
}

function VarDef({ sym, def }: { sym: React.ReactNode; def: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-center">
      <div className="font-sans text-[15px] text-slate-100">{sym}</div>
      <div className="ops-caption mt-1 text-[11px] text-slate-400">{def}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive lab                                                    */
/* ------------------------------------------------------------------ */

function ZeroCouponLab() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("price");

  const [face, setFace] = useState(1000);
  const [maturity, setMaturity] = useState(3);
  const [yieldPct, setYieldPct] = useState(5);
  const [price, setPrice] = useState(863.84);

  const rate = yieldPct / 100;

  const solvedPrice = useMemo(
    () => priceZeroCoupon(face, rate, maturity),
    [face, rate, maturity],
  );
  const solvedYield = useMemo(
    () => solveZeroCouponRate(face, price, maturity),
    [face, price, maturity],
  );

  const displayPrice = mode === "price" ? solvedPrice : price;
  const displayYieldPct = mode === "yield" ? solvedYield * 100 : yieldPct;

  const isDiscount = displayPrice < face - 0.01;
  const isPar = Math.abs(displayPrice - face) < 0.01;

  const flow: CashFlow[] = [
    { period: maturity, amount: face, label: "Principal" },
  ];

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">Zero-coupon lab</span>
        </div>
        <div className="inline-flex rounded-full border border-white/15 bg-ink-950/60 p-1">
          <ModeBtn active={mode === "price"} onClick={() => setMode("price")}>
            Solve for price
          </ModeBtn>
          <ModeBtn active={mode === "yield"} onClick={() => setMode("yield")}>
            Solve for yield
          </ModeBtn>
        </div>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Discount a single payment back to today
      </h4>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
        {/* Inputs */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <LabSlider label="Face value" value={face} min={100} max={10000} step={100} display={formatMoney(face)} onChange={setFace} />
          <LabSlider label="Maturity (years)" value={maturity} min={1} max={30} step={1} display={`${maturity} yr`} onChange={setMaturity} />

          {mode === "price" ? (
            <LabSlider label="Yield (r)" value={yieldPct} min={0} max={20} step={0.1} display={formatPercent(rate, 1)} onChange={setYieldPct} />
          ) : (
            <LabSlider label="Price today" value={price} min={10} max={face} step={1} display={formatMoney(price)} onChange={setPrice} />
          )}
        </div>

        {/* Outputs */}
        <div className="space-y-4">
          {/* Price tag */}
          <motion.div
            key={`${displayPrice.toFixed(0)}-${displayYieldPct.toFixed(1)}`}
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="ops-caption text-[11px] text-accent-cyan">Price today (P₀)</div>
                <div className="mt-1 font-sans text-[28px] text-white">{formatMoney(displayPrice)}</div>
              </div>
              <div className="text-right">
                <div className="ops-caption text-[11px] text-slate-400">Yield</div>
                <div className="mt-1 font-sans text-[18px] text-accent-amber">
                  {formatPercent(displayYieldPct / 100, 2)}
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 font-sans text-[11px] uppercase tracking-[0.14em]",
                  isPar
                    ? "border-white/30 text-slate-200"
                    : isDiscount
                      ? "border-accent-amber/50 text-accent-amber"
                      : "border-accent-green/50 text-accent-green",
                )}
              >
                {isPar ? "Par" : isDiscount ? "Discount bond: price below face" : "Premium: price above face"}
              </span>
            </div>
          </motion.div>

          {/* Discount tunnel */}
          <DiscountTunnel face={face} price={displayPrice} maturity={maturity} reduce={reduce} />

          {/* Timeline */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-4">
            <CashFlowTimeline flows={flow} maxPeriod={maturity} highlightFinal ariaLabel="Single principal payment at maturity" />
          </div>

          {/* Formula with substitution */}
          <FormulaCard
            label="Substitute"
            ariaLabel={`Price equals ${face} over 1 plus ${formatPercent(rate, 2)} raised to ${maturity}`}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Var>P</Var>
              <Sub>0</Sub>
              <span>=</span>
              <Frac
                num={<span>{formatMoney(face)}</span>}
                den={<span>(1 + {formatPercent(rate, 2)})<Sup>{maturity}</Sup></span>}
              />
              <span>=</span>
              <span className="text-accent-green">{formatMoney(displayPrice)}</span>
            </div>
          </FormulaCard>

          <p className="ops-body rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[14px] leading-6 text-slate-200">
            Higher required return means lower price today. At <span className="text-accent-cyan">r = 0</span> the
            price equals the face value; at any positive rate the future payment is worth less today.
          </p>
        </div>
      </div>
    </InteractiveFrame>
  );
}

function LabSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className="font-sans text-[13px] text-slate-100">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-accent-cyan"
      />
    </div>
  );
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        active ? "bg-accent-cyan/15 text-accent-cyan" : "text-slate-400 hover:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Discount tunnel animation                                          */
/* ------------------------------------------------------------------ */

function DiscountTunnel({
  face,
  price,
  maturity,
  reduce,
}: {
  face: number;
  price: number;
  maturity: number;
  reduce: boolean | null;
}) {
  // shrink factor from face to price
  const ratio = Math.min(1, Math.max(0.15, price / face));
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-ink-950/50 p-5">
      <div className="ops-caption text-[11px] text-slate-400">
        Discount tunnel — future payment travels back to today
      </div>
      <div className="mt-4 flex items-center justify-between">
        {/* Today */}
        <div className="text-center">
          <div className="ops-caption text-[11px] text-accent-cyan">Today (P₀)</div>
          <motion.div
            animate={{ scale: reduce ? 1 : [1, 1.05, 1] }}
            transition={{ duration: 1.6, repeat: reduce ? 0 : Infinity, ease: "easeInOut" }}
            className="mt-2 flex items-center justify-center rounded-lg border border-accent-cyan/50 bg-accent-cyan/10 px-3 py-2 font-sans text-[14px] text-accent-cyan"
            style={{ minWidth: 90 }}
          >
            {formatMoney(price)}
          </motion.div>
        </div>

        {/* Tunnel */}
        <div className="relative mx-2 h-10 flex-1">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-accent-cyan/60 to-accent-amber/60" aria-hidden />
          <motion.span
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-glow"
            initial={reduce ? false : { left: "0%" }}
            animate={reduce ? { left: "0%" } : { left: ["0%", "100%", "0%"] }}
            transition={{ duration: 2.4, repeat: reduce ? 0 : Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        </div>

        {/* Future */}
        <div className="text-center">
          <div className="ops-caption text-[11px] text-accent-amber">Year {maturity} (F)</div>
          <div className="mt-2 flex items-center justify-center rounded-lg border border-accent-amber/50 bg-accent-amber/10 px-3 py-2 font-sans text-[14px] text-accent-amber" style={{ minWidth: 90 }}>
            {formatMoney(face)}
          </div>
        </div>
      </div>
      <p className="ops-muted mt-4 text-center text-[12px] text-slate-400">
        The payment is fixed at {formatMoney(face)}, but today it is worth{" "}
        <span className="text-accent-cyan">{(ratio * 100).toFixed(0)}%</span> of face.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Price-vs-yield curve                                               */
/* ------------------------------------------------------------------ */

function PriceYieldCurve() {
  const reduce = useReducedMotion();
  const [yieldPct, setYieldPct] = useState(5);
  const face = 1000;
  const maturity = 3;
  const rate = yieldPct / 100;
  const price = priceZeroCoupon(face, rate, maturity);

  // build curve points
  const W = 520;
  const H = 240;
  const padX = 44;
  const padY = 24;
  const yMin = 0;
  const yMax = 20; // percent
  const pMin = 0;
  const pMax = face * 1.05;

  const xAt = (yp: number) => padX + ((yp - yMin) / (yMax - yMin)) * (W - padX * 2);
  const yAt = (p: number) => H - padY - ((p - pMin) / (pMax - pMin)) * (H - padY * 2);

  const pts: string[] = [];
  for (let yp = yMin; yp <= yMax; yp += 0.5) {
    const p = priceZeroCoupon(face, yp / 100, maturity);
    pts.push(`${xAt(yp).toFixed(1)},${yAt(p).toFixed(1)}`);
  }
  const path = `M ${pts.join(" L ")}`;
  const dotX = xAt(yieldPct);
  const dotY = yAt(price);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Price vs yield
          </span>
        </div>
        <span className="font-sans text-[13px] text-accent-amber">
          r = {formatPercent(rate, 1)} · P₀ = {formatMoney(price)}
        </span>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        The price–yield relationship
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
        For a zero-coupon bond the curve is convex and downward-sloping: higher
        required return means lower price today. Move the slider to slide the
        point along the curve.
      </p>

      <div className="mt-5 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label={`Price versus yield curve for a ${maturity} year zero coupon bond, face value ${formatMoney(face)}. At yield ${formatPercent(rate, 1)} price is ${formatMoney(price)}.`}>
          {/* axes */}
          <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="rgba(255,255,255,0.25)" />
          <line x1={padX} y1={padY} x2={padX} y2={H - padY} stroke="rgba(255,255,255,0.25)" />
          {/* gridlines */}
          {[0, 5, 10, 15, 20].map((yp) => (
            <g key={yp}>
              <line x1={xAt(yp)} y1={padY} x2={xAt(yp)} y2={H - padY} stroke="rgba(255,255,255,0.06)" />
              <text x={xAt(yp)} y={H - padY + 16} textAnchor="middle" className="fill-slate-500 font-sans" fontSize="10">
                {yp}%
              </text>
            </g>
          ))}
          {[0, 250, 500, 750, 1000].map((p) => (
            <text key={p} x={padX - 6} y={yAt(p) + 3} textAnchor="end" className="fill-slate-500 font-sans" fontSize="10">
              {p}
            </text>
          ))}
          {/* curve */}
          <path d={path} fill="none" stroke="#22d3ee" strokeWidth={2.5} />
          {/* moving point */}
          <motion.circle
            cx={dotX}
            cy={dotY}
            r={6}
            fill="#fbbf24"
            stroke="#05070d"
            strokeWidth={2}
            animate={reduce ? false : { r: [6, 7.5, 6] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <line x1={dotX} y1={dotY} x2={dotX} y2={H - padY} stroke="rgba(251,191,36,0.3)" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={20}
          step={0.1}
          value={yieldPct}
          onChange={(e) => setYieldPct(Number(e.target.value))}
          aria-label="Yield percentage"
          className="w-full accent-accent-amber"
        />
        <div className="mt-1 flex justify-between font-sans text-[11px] text-slate-500">
          <span>0%</span>
          <span>20%</span>
        </div>
      </div>
    </InteractiveFrame>
  );
}
