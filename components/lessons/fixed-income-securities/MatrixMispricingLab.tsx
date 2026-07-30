"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  InlineMath,
} from "./shared";
import { formatMoney } from "@/lib/fixed-income";
import { MathText } from "@/components/ui/MathText";

/**
 * Lesson 3.3 — Matrix mispricing lab.
 * Two discount bonds pin down the discount factors:
 *   Bond A: price 95, CF [100, 0]   -> P_{0,1} = 0.95
 *   Bond B: price 90, CF [0, 100]   -> P_{0,2} = 0.90
 * Bond C pays [50, 50]; its no-arbitrage price = 50(0.95) + 50(0.90) = 92.50.
 * The user sets Bond C's market price. The lab reads off consistency or a
 * trade direction. Equations render as a balance scale.
 */

export default function MatrixMispricingLab() {
  const reduce = useReducedMotion();
  const [marketC, setMarketC] = useState(92.5);
  const [showSystem, setShowSystem] = useState(false);

  const P01 = 0.95;
  const P02 = 0.9;
  const fairC = 50 * P01 + 50 * P02; // 92.50
  const gap = marketC - fairC;

  const verdict =
    Math.abs(gap) < 0.01
      ? {
          kind: "fair" as const,
          title: "Consistent",
          msg: "Bond C's price matches the no-arbitrage price. The three-bond system has a single consistent solution.",
        }
      : gap > 0
        ? {
            kind: "expensive" as const,
            title: "Bond C is expensive — short C",
            msg: `C trades at ${formatMoney(marketC)} but is worth ${formatMoney(fairC)}. Short C and replicate it with bonds A and B.`,
          }
        : {
            kind: "cheap" as const,
            title: "Bond C is cheap — buy C",
            msg: `C trades at ${formatMoney(marketC)} but is worth ${formatMoney(fairC)}. Buy C and short its replication.`,
          };

  const verdictTone: Record<string, string> = {
    fair: "border-accent-green/30 bg-accent-green/[0.06]",
    expensive: "border-accent-red/30 bg-accent-red/[0.06]",
    cheap: "border-accent-cyan/30 bg-accent-cyan/[0.06]",
  };
  const verdictAccent: Record<string, string> = {
    fair: "text-accent-green",
    expensive: "text-accent-red",
    cheap: "text-accent-cyan",
  };

  // balance scale geometry: tilt toward the heavier side
  const tilt = gap === 0 ? 0 : Math.max(-10, Math.min(10, gap / 5));

  return (
    <div className="space-y-6">
      <DefinitionCard term="Pricing by linear system">
        If two bonds let you solve for the discount factors{" "}
        <InlineMath>{"P_{0,1}"}</InlineMath> and{" "}
        <InlineMath>{"P_{0,2}"}</InlineMath>, then{" "}
        <span className="text-slate-50">every</span> other bond paying in those
        periods has a single no-arbitrage price. A market price that disagrees
        is a mispricing.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Matrix mispricing lab
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowSystem((s) => !s)}
            aria-expanded={showSystem}
            aria-label="Toggle equation system panel"
            className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            {showSystem ? "Hide" : "Show"} equation system
          </button>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Two bonds pin down the discount factors
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Bond A and Bond B reveal <InlineMath>{"P_{0,1}=0.95"}</InlineMath> and{" "}
          <InlineMath>{"P_{0,2}=0.90"}</InlineMath>. Bond C pays 50 in each
          period, so its no-arbitrage price is{" "}
          <InlineMath>{"50(0.95)+50(0.90)=92.50"}</InlineMath>. Set Bond
          C&apos;s market price and read the signal.
        </p>

        {/* Bond inputs */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <BondCard
            name="Bond A"
            tone="cyan"
            price={95}
            cf={[100, 0]}
            note={`Solves P_{0,1} = ${P01.toFixed(2)}`}
          />
          <BondCard
            name="Bond B"
            tone="cyan"
            price={90}
            cf={[0, 100]}
            note={`Solves P_{0,2} = ${P02.toFixed(2)}`}
          />
          <div className="rounded-2xl border border-accent-purple/30 bg-accent-purple/[0.04] p-5">
            <div className="ops-caption text-[11px] text-accent-purple">
              Bond C · market
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-sans text-[20px] text-slate-100">
                CF [50, 50]
              </span>
            </div>
            <label className="mt-3 block">
              <span className="ops-caption text-[10px] text-slate-500">
                Set Bond C market price
              </span>
              <input
                type="number"
                value={marketC}
                min={80}
                max={105}
                step={0.5}
                onChange={(e) => setMarketC(Number(e.target.value))}
                aria-label="Bond C market price"
                className="mt-1 w-full rounded-md border border-white/10 bg-ink-950/60 px-2 py-1.5 font-sans text-[14px] text-slate-100 focus:border-accent-purple/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
              />
            </label>
            <div className="ops-caption mt-2 text-[11px] text-slate-500">
              No-arb price = {formatMoney(fairC)}
            </div>
          </div>
        </div>

        {/* Balance scale */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Balance scale — market vs no-arbitrage
          </div>
          <BalanceScale
            tilt={tilt}
            marketC={marketC}
            fairC={fairC}
            reduce={reduce}
          />
        </div>

        {/* Verdict */}
        <motion.div
          key={verdict.kind}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "mt-5 rounded-xl border p-5",
            verdictTone[verdict.kind],
          )}
        >
          <div
            className={cn(
              "ops-caption text-[11px]",
              verdictAccent[verdict.kind],
            )}
          >
            Signal
          </div>
          <div className="ops-body-strong mt-1 text-[17px] text-slate-50">
            {verdict.title}
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
            {verdict.msg}
          </p>
        </motion.div>

        {/* Equation system panel */}
        <AnimatePresence>
          {showSystem && (
            <motion.div
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="ops-caption text-[11px] text-slate-400">
                  Equation system
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 font-sans text-[14px] text-slate-200 md:grid-cols-2">
                  <div className="rounded-lg border border-white/10 bg-ink-950/50 p-3">
                    <div className="text-accent-cyan">Bond A:</div>
                    <div>
                      95 = 100·P_{"{0,1}"} + 0·P_{"{0,2}"}
                    </div>
                    <div className="text-slate-400">→ P_{"{0,1}"} = 0.95</div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-ink-950/50 p-3">
                    <div className="text-accent-cyan">Bond B:</div>
                    <div>
                      90 = 0·P_{"{0,1}"} + 100·P_{"{0,2}"}
                    </div>
                    <div className="text-slate-400">→ P_{"{0,2}"} = 0.90</div>
                  </div>
                  <div className="rounded-lg border border-accent-purple/20 bg-accent-purple/[0.05] p-3 md:col-span-2">
                    <div className="text-accent-purple">
                      Bond C no-arbitrage:
                    </div>
                    <div>P_C = 50·0.95 + 50·0.90 = 47.50 + 45.00</div>
                    <div className="text-slate-100">= {formatMoney(fairC)}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Professor's note */}
        <div className="mt-5 rounded-xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            Professor&apos;s note
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
            No solution can mean mispricing. If the system of equations has no
            consistent answer, the market itself is{" "}
            <span className="text-accent-purple">internally inconsistent</span>{" "}
            — and that is information.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function BondCard({
  name,
  tone,
  price,
  cf,
  note,
}: {
  name: string;
  tone: "cyan";
  price: number;
  cf: [number, number];
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="ops-caption text-[11px] text-accent-cyan">{name}</div>
      <div className="mt-2 font-sans text-[20px] text-slate-100">
        CF [{cf[0]}, {cf[1]}]
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="ops-caption text-[10px] text-slate-500">Price</span>
        <span className="font-sans text-[15px] text-slate-100">
          {formatMoney(price)}
        </span>
      </div>
      <div className="ops-caption mt-2 text-[11px] text-slate-500"><MathText>{note}</MathText></div>
    </div>
  );
}

function BalanceScale({
  tilt,
  marketC,
  fairC,
  reduce,
}: {
  tilt: number;
  marketC: number;
  fairC: number;
  reduce: boolean | null;
}) {
  const W = 420;
  const H = 150;
  const cx = W / 2;
  const armY = 50;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-3 w-full min-w-[360px]"
      role="img"
      aria-label={`Balance scale. Bond C market price ${formatMoney(marketC)} versus no-arbitrage price ${formatMoney(fairC)}.`}
    >
      {/* fulcrum */}
      <polygon
        points={`${cx},${H - 20} ${cx - 18},${H - 50} ${cx + 18},${H - 50}`}
        fill="rgba(148,163,184,0.3)"
      />
      <line
        x1={cx}
        y1={H - 50}
        x2={cx}
        y2={armY}
        stroke="rgba(148,163,184,0.4)"
        strokeWidth={2}
      />
      {/* arm (tilts) */}
      <motion.g
        animate={{ rotate: reduce ? 0 : tilt }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: `${cx}px ${armY}px` }}
      >
        <line
          x1={cx - 150}
          y1={armY}
          x2={cx + 150}
          y2={armY}
          stroke="#a78bfa"
          strokeWidth={3}
        />
        {/* left pan: market */}
        <line
          x1={cx - 150}
          y1={armY}
          x2={cx - 150}
          y2={armY + 22}
          stroke="rgba(167,139,250,0.5)"
          strokeWidth={1.5}
        />
        <ellipse
          cx={cx - 150}
          cy={armY + 26}
          rx={34}
          ry={8}
          fill="rgba(248,113,113,0.18)"
          stroke="#f87171"
          strokeWidth={1.5}
        />
        <text
          x={cx - 150}
          y={armY + 24}
          textAnchor="middle"
          className="fill-slate-100 font-sans"
          fontSize="11"
        >
          {formatMoney(marketC)}
        </text>
        <text
          x={cx - 150}
          y={armY - 8}
          textAnchor="middle"
          className="fill-slate-500 font-sans"
          fontSize="10"
        >
          market
        </text>
        {/* right pan: fair */}
        <line
          x1={cx + 150}
          y1={armY}
          x2={cx + 150}
          y2={armY + 22}
          stroke="rgba(167,139,250,0.5)"
          strokeWidth={1.5}
        />
        <ellipse
          cx={cx + 150}
          cy={armY + 26}
          rx={34}
          ry={8}
          fill="rgba(52,211,153,0.18)"
          stroke="#34d399"
          strokeWidth={1.5}
        />
        <text
          x={cx + 150}
          y={armY + 24}
          textAnchor="middle"
          className="fill-slate-100 font-sans"
          fontSize="11"
        >
          {formatMoney(fairC)}
        </text>
        <text
          x={cx + 150}
          y={armY - 8}
          textAnchor="middle"
          className="fill-slate-500 font-sans"
          fontSize="10"
        >
          no-arb
        </text>
      </motion.g>
    </svg>
  );
}
