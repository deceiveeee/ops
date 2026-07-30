"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

type LimitKey = "timing" | "fundamental" | "financing" | "short" | "career";

const LIMITS: {
  key: LimitKey;
  letter: string;
  title: string;
  prompt: string;
  summary: string;
  details: string[];
  example?: { setup: string; math?: string; point: string };
  callout?: string;
}[] = [
  {
    key: "timing",
    letter: "5.1",
    title: "Timing risk",
    prompt: "Right about value, wrong about when.",
    summary:
      "The investor may be correct about intrinsic value but wrong about when the gap will close. Financing costs accumulate, opportunity cost rises, the company may deteriorate, and liquidity needs may force an early exit.",
    details: [
      "Carrying cost accumulates for as long as the position is open.",
      "Capital tied up in the trade cannot be deployed elsewhere.",
      "The fundamentals may erode while the investor waits.",
      "Personal or fund-level liquidity needs may force an exit before realization.",
    ],
    example: {
      setup: "Current price $50. Estimated value $80. Correction occurs three years later.",
      math: String.raw`\text{Annual carry of } 4\% \Rightarrow 3\text{-year drag} \approx 12\%`,
      point: "A $30 theoretical gain can shrink considerably after three years of financing, fees, and opportunity cost — and that assumes the value estimate did not also change.",
    },
    callout: "A valuation thesis is incomplete without a plausible path toward realization.",
  },
  {
    key: "fundamental",
    letter: "5.2",
    title: "Fundamental risk",
    prompt: "What might the market understand that I do not?",
    summary:
      "The valuation itself may be wrong. The market price may reflect information, risks, or expectations the investor has not considered.",
    details: [
      "Declining demand for the company's products",
      "Legal or regulatory exposure not yet public",
      "Technological disruption of the business model",
      "Hidden leverage or off-balance-sheet obligations",
      "Customer or supplier concentration",
      "Management failure or capital-allocation mistakes",
    ],
    callout: "Before declaring the market wrong, ask what risk or information could justify the price.",
  },
  {
    key: "financing",
    letter: "5.3",
    title: "Financing and liquidity risk",
    prompt: "Leverage cuts both ways.",
    summary:
      "Even a correct thesis must be financeable. Leverage, withdrawals, and illiquidity can force a sale at the worst price.",
    details: [
      "Leverage requires collateral that may be marked down at the worst moment.",
      "Margin requirements can rise during volatility precisely when capital is constrained.",
      "Fund investors may withdraw after losses, forcing the manager to sell positions.",
      "Illiquid assets may be sold at poor prices to meet cash needs.",
      "A manager may have to sell an undervalued asset simply because cash is needed today.",
    ],
    callout: "A position is not just a thesis — it is also a financing plan.",
  },
  {
    key: "short",
    letter: "5.4",
    title: "Short-selling constraints",
    prompt: "Correcting overpricing is harder than correcting underpricing.",
    summary:
      "Short selling is not the mirror image of buying. It involves borrowing, collateral, recall risk, and uncapped losses — and that is before fees.",
    details: [
      "Securities must be borrowed; borrow availability varies.",
      "Borrow fees may rise sharply for hard-to-borrow names.",
      "Shares may be recalled by the lender at any time.",
      "Collateral must be posted and may be increased.",
      "Losses can exceed the original position size — there is no pre-set maximum loss.",
    ],
    callout: "Short selling is not riskless or routine. Treating it as the mirror of a long position understates the operational, financing, and unlimited-loss risks.",
  },
  {
    key: "career",
    letter: "5.5",
    title: "Career and client risk",
    prompt: "Professional survival can conflict with long-term judgment.",
    summary:
      "Professional managers must retain clients, employment, internal approval, and funding. Refusing to join a popular trade can cause prolonged benchmark underperformance — and the manager may be removed before eventually being proven correct.",
    details: [
      "Clients compare managers to peers and benchmarks over short windows.",
      "Internal risk officers monitor drawdowns and position losses.",
      "Avoiding a crowded trade can produce extended underperformance.",
      "Capital allocators move mandates away from managers who look wrong for too long.",
      "The manager may be fired before the thesis is vindicated.",
    ],
    example: {
      setup: "Manager avoids an overvalued sector. The sector continues rising for two years. Clients withdraw before the correction.",
      point: "The decision was eventually correct. The manager was no longer in the seat to benefit from being right.",
    },
    callout: "Professional survival can conflict with long-term investment judgment.",
  },
];

export default function LimitsToArbitrage() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<LimitKey | null>("timing");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
          Terminology
        </div>
        <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-100">
          &ldquo;Arbitrage&rdquo; can refer narrowly to nearly riskless price discrepancies between
          identical assets. In behavioral finance, <span className="text-accent-cyan">limits to
          arbitrage</span> refers more broadly to the risks and constraints faced by traders
          attempting to correct apparent mispricing. The five limits below describe why even
          sophisticated investors may be unable to trade away an identifiable mistake.
        </p>
      </div>

      <div className="space-y-3">
        {LIMITS.map((l) => {
          const isOpen = open === l.key;
          return (
            <div key={l.key} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <button type="button" aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : l.key)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                <span className={cn("flex h-7 w-9 flex-shrink-0 items-center justify-center rounded-md border font-sans text-[11px]",
                  isOpen ? "border-accent-cyan text-accent-cyan" : "border-white/20 text-slate-400")}>
                  {l.letter}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[15px] font-medium", isOpen ? "text-white" : "text-slate-200")}>{l.title}</span>
                  <span className="block text-[12px] leading-snug text-slate-400">{l.prompt}</span>
                </span>
                <span className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-sans text-sm text-accent-cyan transition-transform",
                  isOpen && "rotate-45")} aria-hidden>+</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden">
                    <div className="ops-body px-5 pb-5">
                      <p className="text-[15px] leading-[1.65] text-slate-100">{l.summary}</p>
                      <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {l.details.map((d) => (
                          <li key={d} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-200">
                            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{d}
                          </li>
                        ))}
                      </ul>
                      {l.example && (
                        <div className="mt-3 rounded-lg border border-accent-amber/25 bg-accent-amber/[0.05] px-3 py-2.5">
                          <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-amber">Example</span>
                          <p className="mt-1 text-[13px] leading-[1.55] text-slate-100">{l.example.setup}</p>
                          {l.example.math && (
                            <div className="mt-2 rounded-md border border-white/10 bg-ink-950/40 px-2.5 py-1.5">
                              <BlockMath>{l.example.math}</BlockMath>
                            </div>
                          )}
                          <p className="mt-1.5 text-[12px] leading-[1.5] text-slate-300">{l.example.point}</p>
                        </div>
                      )}
                      {l.callout && (
                        <div className="mt-3 rounded-lg border border-accent-cyan/25 bg-accent-cyan/[0.05] px-3 py-2.5">
                          <p className="text-[14px] leading-[1.55] text-slate-100">{l.callout}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
