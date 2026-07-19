"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaExplainer,
} from "./shared";

/**
 * Section 7 — Promised vs expected yield splitter.
 * One risky bond splits into four branches: promised payoff, default/recovery,
 * expected payoff, and the risk-free benchmark. Four FormulaExplainers clarify
 * promised yield, expected yield, default premium, and risk premium.
 *
 * MIT-style zero: P=700, F=1000, T=10, expected payoff=900, risk-free 8%.
 */
const PRICE = 700;
const FACE = 1000;
const T = 10;
const EXPECTED_PAYOFF = 900;

function nthRoot(base: number, n: number) {
  return Math.pow(base, 1 / n);
}

export default function PromisedVsExpectedYieldSplitter() {
  const reduce = useReducedMotion();
  const [showBranches, setShowBranches] = useState(false);

  const yPromised = nthRoot(FACE / PRICE, T) - 1;
  const yExpected = nthRoot(EXPECTED_PAYOFF / PRICE, T) - 1;
  const yRiskFree = 0.08;
  const defaultPremium = yPromised - yExpected;
  const riskPremium = yExpected - yRiskFree;

  const pct = (x: number) => `${(x * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <DefinitionCard term="One bond, four views of yield">
        A risky bond can be split into branches: the promised payoff, the
        default/recovery scenario, the expected payoff, and the risk-free
        benchmark. Each produces a different &ldquo;yield&rdquo; — and confusing
        them is one of the most common fixed-income mistakes.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Promised vs expected yield splitter
            </span>
          </div>
          <div className="font-mono text-[12px] text-slate-400">
            P=$700 · F=$1,000 · E[Payoff]=$900 · T=10yr
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Split the bond into its yield branches
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          The same bond supports four related but distinct yields. Promised
          yield uses the promised payoff. Expected yield uses the expected
          payoff. The gap between them is the default premium; the gap from
          expected to risk-free is the risk premium.
        </p>

        {/* Branch diagram */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40 p-5">
          <div className="flex min-w-[560px] items-center justify-center gap-3">
            <div className="rounded-xl border border-accent-cyan/40 bg-accent-cyan/[0.06] px-4 py-3 text-center">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Risky bond
              </div>
              <div className="mt-1 font-mono text-[15px] text-white">
                P = $700
              </div>
            </div>
            <motion.div
              initial={reduce ? false : { width: 0 }}
              animate={{ width: showBranches ? 24 : 0 }}
              className="h-px bg-accent-cyan/40"
            />
            {showBranches ? (
              <div className="flex flex-col gap-3">
                <Branch label="Promised payoff" value="$1,000" tone="amber" />
                <Branch label="Default / recovery" value="< $1,000" tone="red" />
                <Branch label="Expected payoff" value="$900" tone="cyan" />
                <Branch label="Risk-free benchmark" value="8.00%" tone="green" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowBranches(true)}
                className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-4 py-2 text-[13px] font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
              >
                Split the bond
              </button>
            )}
          </div>
          {showBranches && (
            <button
              type="button"
              onClick={() => setShowBranches(false)}
              className="mt-4 rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              Reset
            </button>
          )}
        </div>

        {/* Four FormulaExplainers */}
        <div className="mt-6 space-y-5">
          <FormulaExplainer
            label="Promised yield"
            tone="amber"
            formula={String.raw`y_{\text{promised}} = \left(\frac{\text{Promised Payoff}}{P}\right)^{1/T} - 1`}
            substitution={String.raw`y_{\text{promised}} = \left(\frac{${FACE}}{${PRICE}}\right)^{1/${T}} - 1 \approx ${pct(yPromised)}`}
            interpretation="Computed from the promised payoff. This is the headline yield you see quoted — but it assumes no default."
          />
          <FormulaExplainer
            label="Expected yield"
            tone="cyan"
            formula={String.raw`y_{\text{expected}} = \left(\frac{E[\text{Payoff}]}{P}\right)^{1/T} - 1`}
            substitution={String.raw`y_{\text{expected}} = \left(\frac{${EXPECTED_PAYOFF}}{${PRICE}}\right)^{1/${T}} - 1 \approx ${pct(yExpected)}`}
            interpretation="Computed from the expected (probability-weighted) payoff. This is the yield investors actually expect to earn on average."
          />
          <FormulaExplainer
            label="Default premium"
            tone="red"
            formula={String.raw`\text{Default Premium} = y_{\text{promised}} - y_{\text{expected}}`}
            substitution={String.raw`\text{Default Premium} = ${pct(yPromised)} - ${pct(yExpected)} = ${pct(defaultPremium)}`}
            interpretation="The extra promised yield that compensates for the possibility of default. It is the gap between what is promised and what is expected."
          />
          <FormulaExplainer
            label="Risk premium"
            tone="green"
            formula={String.raw`\text{Risk Premium} = y_{\text{expected}} - y_{\text{risk-free}}`}
            substitution={String.raw`\text{Risk Premium} = ${pct(yExpected)} - ${pct(yRiskFree)} = ${pct(riskPremium)}`}
            interpretation="The extra expected yield over the risk-free rate. This is the reward for bearing the bond's risk — on top of just being compensated for expected default loss."
          />
        </div>
      </InteractiveFrame>
    </div>
  );
}

function Branch({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "red" | "cyan" | "green";
}) {
  const map = {
    amber: "border-accent-amber/40 bg-accent-amber/[0.06] text-accent-amber",
    red: "border-accent-red/40 bg-accent-red/[0.06] text-accent-red",
    cyan: "border-accent-cyan/40 bg-accent-cyan/[0.06] text-accent-cyan",
    green: "border-accent-green/40 bg-accent-green/[0.06] text-accent-green",
  }[tone];
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-center", map)}>
      <div className="ops-caption text-[11px]">{label}</div>
      <div className="mt-1 font-mono text-[15px] text-white">{value}</div>
    </div>
  );
}
