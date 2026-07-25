"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaExplainer,
} from "./shared";
import {
  couponCashFlows,
  priceCouponBondFromYTM,
  solveYTM,
  classifyBondPrice,
  formatMoney,
  formatPercent,
} from "@/lib/fixed-income";

/**
 * Section 9 — Yield-to-maturity solver.
 * YTM = single discount rate making PV of all promised CFs = market price.
 * Lab: face, coupon, maturity, frequency, price -> cash flows, price-vs-YTM
 * curve, solved YTM (bisection), premium/par/discount badge.
 */

type Preset = {
  id: string;
  label: string;
  face: number;
  couponPct: number;
  maturity: number;
  freq: number;
  price: number;
};

const PRESETS: Preset[] = [
  {
    id: "par",
    label: "Par (price 1000)",
    face: 1000,
    couponPct: 5,
    maturity: 3,
    freq: 1,
    price: 1000,
  },
  {
    id: "discount",
    label: "Discount (price 950)",
    face: 1000,
    couponPct: 5,
    maturity: 3,
    freq: 1,
    price: 950,
  },
  {
    id: "premium",
    label: "Premium (price 1050)",
    face: 1000,
    couponPct: 5,
    maturity: 3,
    freq: 1,
    price: 1050,
  },
];

export default function CouponBondYtmSolver() {
  return (
    <div className="space-y-6">
      <DefinitionCard term="Yield-to-maturity (YTM)">
        The <span className="text-slate-50">single discount rate</span> that
        makes the present value of all promised coupon and principal payments
        equal the bond&apos;s market price.
      </DefinitionCard>

      <FormulaExplainer
        label="Yield-to-maturity"
        tone="cyan"
        formula={"P_0 = \\sum_{k=1}^{T}\\frac{C_k}{(1+y)^k}"}
        meaning="The single discount rate that makes PV of all cash flows equal the market price."
        variables={[
          { symbol: "P_0", description: "market price" },
          { symbol: "C_k", description: "cash flow at time k" },
          { symbol: "y", description: "yield-to-maturity" },
          { symbol: "T", description: "maturity" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-4">
          <div className="ops-caption text-[11px] text-accent-cyan">
            What YTM is
          </div>
          <ul className="ops-body mt-2 space-y-1.5 text-[14px] leading-6 text-slate-200">
            <li>• A complex average of future spot rates.</li>
            <li>• No closed form for coupon bonds — solved numerically.</li>
            <li>
              • Given P₀ + cash flows → solve y. Given y + cash flows → solve
              P₀.
            </li>
            <li>• For a pure discount bond, YTM = the current spot rate.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
          <div className="ops-caption text-[11px] text-accent-amber">
            Premium / par / discount
          </div>
          <ul className="ops-body mt-2 space-y-1.5 text-[14px] leading-6 text-slate-200">
            <li>
              • coupon &gt; YTM →{" "}
              <span className="text-accent-green">premium</span> (price &gt;
              par)
            </li>
            <li>
              • coupon = YTM → <span className="text-slate-50">par</span>
            </li>
            <li>
              • coupon &lt; YTM →{" "}
              <span className="text-accent-amber">discount</span> (price &lt;
              par)
            </li>
          </ul>
        </div>
      </div>

      <YtmLab />
    </div>
  );
}

function YtmLab() {
  const reduce = useReducedMotion();
  const [face, setFace] = useState(1000);
  const [couponPct, setCouponPct] = useState(5);
  const [maturity, setMaturity] = useState(3);
  const [freq, setFreq] = useState(1);
  const [price, setPrice] = useState(1000);

  const cashFlows = useMemo(
    () => couponCashFlows(face, couponPct / 100, maturity, freq),
    [face, couponPct, maturity, freq],
  );
  const ytm = useMemo(
    () => solveYTM(cashFlows, price, freq),
    [cashFlows, price, freq],
  );
  const classify = classifyBondPrice(
    couponPct / 100,
    isFinite(ytm) ? ytm : couponPct / 100,
  );

  const applyPreset = (p: Preset) => {
    setFace(p.face);
    setCouponPct(p.couponPct);
    setMaturity(p.maturity);
    setFreq(p.freq);
    setPrice(p.price);
  };

  const badgeCls = {
    premium: "border-accent-green/50 text-accent-green bg-accent-green/10",
    par: "border-white/30 text-slate-200 bg-white/5",
    discount: "border-accent-amber/50 text-accent-amber bg-accent-amber/10",
  }[classify];

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            YTM solver
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-full border border-white/20 px-3 py-1 text-[12px] text-slate-200 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Bond prices and yields move in opposite directions
      </h4>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
        {/* Inputs */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <Field label="Face value" value={formatMoney(face)}>
            <Slider
              min={100}
              max={5000}
              step={100}
              value={face}
              onChange={setFace}
              label="Face value"
            />
          </Field>
          <Field label="Coupon rate" value={formatPercent(couponPct / 100, 2)}>
            <Slider
              min={0}
              max={15}
              step={0.25}
              value={couponPct}
              onChange={setCouponPct}
              label="Coupon rate"
            />
          </Field>
          <Field label="Maturity (years)" value={`${maturity} yr`}>
            <Slider
              min={1}
              max={20}
              step={1}
              value={maturity}
              onChange={setMaturity}
              label="Maturity"
            />
          </Field>
          <Field label="Frequency" value={`${freq}/yr`}>
            <div className="flex gap-1.5">
              {[1, 2].map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={freq === f}
                  onClick={() => setFreq(f)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-1.5 font-mono text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    freq === f
                      ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan"
                      : "border-white/15 text-slate-300 hover:bg-white/5",
                  )}
                >
                  {f === 1 ? "Annual" : "Semi"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Market price" value={formatMoney(price)}>
            <Slider
              min={100}
              max={2000}
              step={10}
              value={price}
              onChange={setPrice}
              label="Market price"
            />
          </Field>
        </div>

        {/* Outputs */}
        <div className="space-y-4">
          {/* YTM + price tag */}
          <motion.div
            key={`${price}-${couponPct}-${maturity}`}
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-5"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="ops-caption text-[11px] text-slate-400">
                  Solved YTM
                </div>
                <div className="mt-1 font-mono text-[30px] text-accent-cyan">
                  {isFinite(ytm) ? formatPercent(ytm, 2) : "—"}
                </div>
              </div>
              <div className="text-right">
                <div className="ops-caption text-[11px] text-slate-400">
                  Price vs par ({formatMoney(face)})
                </div>
                <div
                  className={cn(
                    "mt-1 font-mono text-[18px]",
                    price > face
                      ? "text-accent-green"
                      : price < face
                        ? "text-accent-amber"
                        : "text-slate-200",
                  )}
                >
                  {formatMoney(price)}
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
                  badgeCls,
                )}
              >
                {classify}
              </span>
            </div>
          </motion.div>

          {/* Price-YTM curve */}
          <PriceYieldCurve
            cashFlows={cashFlows}
            freq={freq}
            price={price}
            ytm={ytm}
            face={face}
            reduce={reduce}
          />

          {/* Cash-flow table */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40">
            <table className="w-full border-collapse text-center">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-3 py-2 text-left ops-caption text-[11px] text-slate-400">
                    Period
                  </th>
                  {cashFlows.map((_, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 ops-caption text-[11px] text-slate-400"
                    >
                      {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 text-left font-mono text-[13px] text-slate-400">
                    Cash flow
                  </td>
                  {cashFlows.map((cf, i) => (
                    <td
                      key={i}
                      className="px-3 py-2 font-mono text-[13px] text-slate-200"
                    >
                      ${cf.toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="ops-body rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[14px] leading-6 text-slate-200">
            Drag the price down: the YTM rises, and the badge flips to{" "}
            <span className="text-accent-amber">discount</span>. Drag the price
            up: the YTM falls and the badge flips to{" "}
            <span className="text-accent-green">premium</span>. YTM is the
            single rate that reprices all of these cash flows at the market
            price.
          </p>
        </div>
      </div>
    </InteractiveFrame>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className="font-mono text-[13px] text-slate-100">{value}</span>
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Slider({
  min,
  max,
  step,
  value,
  onChange,
  label,
}: {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
      className="w-full accent-accent-cyan"
    />
  );
}

function PriceYieldCurve({
  cashFlows,
  freq,
  price,
  ytm,
  face,
  reduce,
}: {
  cashFlows: number[];
  freq: number;
  price: number;
  ytm: number;
  face: number;
  reduce: boolean | null;
}) {
  const W = 560;
  const H = 200;
  const padX = 44;
  const padY = 22;
  const yMin = -0.02;
  const yMax = 0.15;
  // price range across the yield axis
  const pAt = (y: number) => priceCouponBondFromYTM(cashFlows, y, freq);
  const pMin = pAt(yMax);
  const pMax = pAt(yMin);
  const xAt = (y: number) =>
    padX + ((W - padX * 2) * (y - yMin)) / (yMax - yMin);
  const yAt = (p: number) =>
    H - padY - ((H - padY * 2) * (p - pMin)) / (pMax - pMin || 1);

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= 60; i++) {
    const y = yMin + ((yMax - yMin) * i) / 60;
    pts.push({ x: xAt(y), y: yAt(pAt(y)) });
  }
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const dotX = isFinite(ytm) ? xAt(Math.min(yMax, Math.max(yMin, ytm))) : null;
  const dotY = dotX !== null ? yAt(price) : null;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[460px]"
        role="img"
        aria-label="Bond price versus yield curve with the current point marked"
      >
        <line
          x1={padX}
          y1={H - padY}
          x2={W - 8}
          y2={H - padY}
          stroke="rgba(255,255,255,0.2)"
        />
        <line
          x1={padX}
          y1={6}
          x2={padX}
          y2={H - padY}
          stroke="rgba(255,255,255,0.2)"
        />
        <text
          x={W - 8}
          y={H - 6}
          textAnchor="end"
          className="fill-slate-500 font-mono"
          fontSize="10"
        >
          yield y
        </text>
        <text
          x={padX + 4}
          y={14}
          className="fill-slate-500 font-mono"
          fontSize="10"
        >
          price P
        </text>
        {!reduce && (
          <motion.path
            d={path}
            fill="none"
            stroke="rgba(34,211,238,0.8)"
            strokeWidth="2.2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7 }}
          />
        )}
        {reduce && (
          <path
            d={path}
            fill="none"
            stroke="rgba(34,211,238,0.8)"
            strokeWidth="2.2"
          />
        )}
        {/* par line */}
        <line
          x1={padX}
          y1={yAt(face)}
          x2={W - 8}
          y2={yAt(face)}
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="3 3"
        />
        {dotX !== null && dotY !== null && (
          <g>
            <motion.circle
              key={`${dotX.toFixed(1)}-${dotY.toFixed(1)}`}
              cx={dotX}
              cy={dotY}
              r="6"
              fill="#fbbf24"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.25 }}
            />
            <circle
              cx={dotX}
              cy={dotY}
              r="11"
              fill="none"
              stroke="rgba(251,191,36,0.4)"
            />
          </g>
        )}
      </svg>
      <div className="ops-caption mt-1 text-center text-[11px] text-slate-400">
        Price–yield curve · price and yield move oppositely
      </div>
    </div>
  );
}
