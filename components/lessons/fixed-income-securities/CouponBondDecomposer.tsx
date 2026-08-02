"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  Feedback,
  InlineMath,
} from "./shared";

/**
 * Section 12 — Coupon bonds as portfolios of pure discount bonds.
 * Theorem: all coupon bonds are portfolios of pure discount bonds.
 * Example: 3-yr 5% bond $1000 -> CFs 50/50/1050 = STRIPS 50×1yr, 50×2yr, 1050×3yr.
 * Decompose/Recombine animation + a replicate activity.
 */

const TARGET = { y1: 50, y2: 50, y3: 1050 };

export default function CouponBondDecomposer() {
  const reduce = useReducedMotion();
  const [decomposed, setDecomposed] = useState(false);
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [q3, setQ3] = useState(0);

  const match = q1 === TARGET.y1 && q2 === TARGET.y2 && q3 === TARGET.y3;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Portfolio theorem">
        All coupon bonds are{" "}
        <span className="text-slate-50">portfolios of pure discount bonds</span>
        . Each coupon is just a zero-coupon bond that pays $1 at its maturity.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Decompose a 3-yr 5% bond
            </span>
          </div>
          <button
            type="button"
            aria-pressed={decomposed}
            onClick={() => setDecomposed((v) => !v)}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              decomposed
                ? "border-accent-purple/60 bg-accent-purple/15 text-accent-purple"
                : "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan",
            )}
          >
            {decomposed ? "Recombine" : "Decompose"}
          </button>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          A coupon bond is a bundle of STRIPS
        </h4>

        {/* Top: coupon bond timeline */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Coupon bond (face $1,000, 5%, 3 yr)
          </div>
          <CouponTimeline reduce={reduce} />
        </div>

        {/* Bottom: STRIPS rows (appear on decompose) */}
        <AnimatePresence>
          {decomposed && (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                <StripRow year={1} count={50} reduce={reduce} delay={0} />
                <StripRow year={2} count={50} reduce={reduce} delay={0.08} />
                <StripRow year={3} count={1050} reduce={reduce} delay={0.16} />
                <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.06] p-4 text-center">
                  <span className="ops-caption text-[11px] text-accent-green">
                    Same cash flows · same price · otherwise arbitrage
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Replicate activity */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Replicate activity — match the coupon bond with STRIPS
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
            How many $1-face STRIPS of each maturity reproduce the cash flows{" "}
            <InlineMath>{"50 \\, / \, 50 \\, / \, 1050"}</InlineMath>?
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QtyPicker
              label="1-yr STRIPS"
              target={TARGET.y1}
              value={q1}
              onChange={setQ1}
            />
            <QtyPicker
              label="2-yr STRIPS"
              target={TARGET.y2}
              value={q2}
              onChange={setQ2}
            />
            <QtyPicker
              label="3-yr STRIPS"
              target={TARGET.y3}
              value={q3}
              onChange={setQ3}
            />
          </div>
          <AnimatePresence>
            {match && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Feedback status="correct">
                  50 one-year, 50 two-year, and 1,050 three-year STRIPS produce
                  exactly the coupon bond&apos;s cash flows. Same cash flows,
                  same price — otherwise arbitrage.
                </Feedback>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function CouponTimeline({ reduce }: { reduce: boolean | null }) {
  const W = 620;
  const H = 150;
  const padX = 60;
  const baseY = 95;
  const span = (W - padX * 2) / 3;
  const xAt = (y: number) => padX + span * y;
  const flows = [
    { year: 1, amount: 50 },
    { year: 2, amount: 50 },
    { year: 3, amount: 1050 },
  ];
  const maxA = 1050;
  const scale = (H - baseY - 18) / maxA;
  return (
    <div className="overflow-x-auto pb-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full min-w-[520px]"
        role="img"
        aria-label="Coupon bond paying 50, 50, and 1050 across three years"
      >
        <line
          x1={padX}
          y1={baseY}
          x2={W - padX}
          y2={baseY}
          stroke="rgba(255,255,255,0.2)"
        />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line
              x1={xAt(i)}
              y1={baseY - 5}
              x2={xAt(i)}
              y2={baseY + 5}
              stroke="rgba(255,255,255,0.3)"
            />
            <text
              x={xAt(i)}
              y={baseY + 22}
              textAnchor="middle"
              className="fill-slate-400 font-sans"
              fontSize="12"
            >
              Y{i}
            </text>
          </g>
        ))}
        {flows.map((f, i) => {
          const h = f.amount * scale;
          const color = f.year === 3 ? "#34d399" : "#22d3ee";
          return (
            <motion.rect
              key={f.year}
              x={xAt(f.year) - 12}
              initial={reduce ? false : { y: baseY, height: 0 }}
              animate={{ y: baseY - h, height: h }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              width={24}
              rx={3}
              fill={color}
              fillOpacity={0.85}
            />
          );
        })}
        {flows.map((f) => {
          const h = f.amount * scale;
          const color = f.year === 3 ? "#34d399" : "#22d3ee";
          return (
            <text
              key={`t${f.year}`}
              x={xAt(f.year)}
              y={baseY - h - 6}
              textAnchor="middle"
              fill={color}
              className="font-sans"
              fontSize="12"
            >
              ${f.amount}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function StripRow({
  year,
  count,
  reduce,
  delay,
}: {
  year: number;
  count: number;
  reduce: boolean | null;
  delay: number;
}) {
  const W = 620;
  const x0 = 60;
  const xEnd = W - 60;
  const baseY = 26;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-xl border border-accent-purple/30 bg-accent-purple/[0.05] p-3"
    >
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-accent-purple">
          {count} × ${count >= 1000 ? "1" : "1"} {year}-yr STRIPS
        </span>
        <span className="font-sans text-[14px] text-accent-green">
          +${count} @ Y{year}
        </span>
      </div>
      <div className="overflow-x-auto pb-2">
        <svg
          viewBox={`0 0 ${W} 40`}
          className="mt-2 w-full min-w-[520px]"
          aria-hidden
        >
          <line
            x1={x0}
            y1={baseY}
            x2={xEnd}
            y2={baseY}
            stroke="rgba(167,139,250,0.3)"
            strokeWidth="1.4"
            strokeDasharray="3 3"
          />
          <circle cx={x0} cy={baseY} r="3" fill="rgba(167,139,250,0.6)" />
          <circle
            cx={xEnd * (year / 3) + x0 * (1 - year / 3)}
            cy={baseY}
            r="5"
            fill="#a78bfa"
          />
        </svg>
      </div>
    </motion.div>
  );
}

function QtyPicker({
  label,
  target,
  value,
  onChange,
}: {
  label: string;
  target: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const ok = value === target;
  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        ok
          ? "border-accent-green/50 bg-accent-green/[0.06]"
          : "border-white/10 bg-white/[0.02]",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span
          className={cn(
            "font-sans text-[14px]",
            ok ? "text-accent-green" : "text-slate-100",
          )}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1200}
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Quantity of ${label}`}
        className="mt-2 w-full accent-accent-purple"
      />
      <div className="ops-muted mt-1 text-[11px] text-slate-500">
        target ${target}
      </div>
    </div>
  );
}
