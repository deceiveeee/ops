"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  textbook: string;
  reality: string;
};

const ROWS: Row[] = [
  {
    id: "cost",
    textbook: "Initial investment — a single, fully specified number provided up front.",
    reality:
      "Broad capital-expenditure guidance, sometimes split by segment or geography. Pre-opening costs, working capital, and lease commitments often sit elsewhere in the filing.",
  },
  {
    id: "cashflows",
    textbook: "Future cash flows — a complete, dated schedule of incremental inflows and outflows.",
    reality:
      "Management targets (sales, margins, store counts) and segment disclosures. The investor must assemble incremental cash flows from fragments.",
  },
  {
    id: "rate",
    textbook: "Discount rate — given, matched to the project's risk.",
    reality:
      "Not disclosed. The investor estimates it from comparable businesses and tests it across a range.",
  },
  {
    id: "result",
    textbook: "NPV — calculated cleanly, producing an accept/reject decision.",
    reality:
      "Rarely available. The investor develops a range of outcomes and asks which assumptions must hold for value to be created.",
  },
  {
    id: "info",
    textbook: "All inputs known with adequate precision before capital is committed.",
    reality:
      "Incomplete cost and cash-flow information. Later operating results, earnings-call commentary, and 10-Q updates revise the picture continuously.",
  },
];

export default function TextbookVsInvestorReality() {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.65] text-slate-100">
          Public companies rarely provide investors with a document labeled
          <span className="text-white"> &ldquo;Project A: cost, future cash flows, beta, and NPV.&rdquo;</span>{" "}
          Investors reconstruct major corporate investments from filings, earnings calls,
          investor presentations, transaction announcements, and later operating results.
        </p>
        {!revealed && (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-4 rounded-full border border-accent-amber/50 bg-accent-amber/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
          >
            Translate textbook → reality
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Textbook panel */}
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent-cyan/40 font-mono text-[11px] text-accent-cyan">
              A
            </span>
            <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
              Textbook presentation
            </span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {ROWS.map((r) => (
              <li key={r.id} className="flex items-start gap-2.5 text-[15px] leading-[1.55] text-slate-200">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                {r.textbook}
              </li>
            ))}
          </ul>
        </div>

        {/* Reality panel — revealed progressively */}
        <div
          className={cn(
            "rounded-2xl border p-6 transition-colors",
            revealed
              ? "border-accent-amber/30 bg-accent-amber/[0.04]"
              : "border-white/10 bg-white/[0.02]",
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[11px]",
                revealed
                  ? "border-accent-amber/40 text-accent-amber"
                  : "border-white/20 text-slate-400",
              )}
            >
              B
            </span>
            <span
              className={cn(
                "font-mono text-[12px] uppercase tracking-[0.16em]",
                revealed ? "text-accent-amber" : "text-slate-400",
              )}
            >
              Public-company reality
            </span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {ROWS.map((r, i) => (
              <li key={r.id} className="flex items-start gap-2.5 text-[15px] leading-[1.55]">
                <span
                  className={cn(
                    "mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors",
                    revealed && i < 3 ? "bg-accent-amber" : "bg-white/15",
                  )}
                  aria-hidden
                />
                <AnimatePresence mode="wait">
                  {revealed ? (
                    <motion.span
                      key="shown"
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-200"
                    >
                      {r.reality}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="hidden"
                      initial={reduce ? false : { opacity: 0.4 }}
                      animate={{ opacity: 0.4 }}
                      className="text-slate-500"
                    >
                      {r.reality}
                    </motion.span>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {revealed && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6"
        >
          <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
            An outside investor usually cannot reproduce management&apos;s internal project
            model. The investor instead develops an{" "}
            <span className="text-white">independent range of possible outcomes</span> and
            determines <span className="text-white">which assumptions must be true</span> for
            the investment to create value.
          </p>
          <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-300">
            This is not a weaker version of capital budgeting. It is the actual analytical
            problem faced by investors in public markets.
          </p>
        </motion.div>
      )}
    </div>
  );
}
