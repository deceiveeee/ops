"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  Feedback,
} from "./shared";
import { formatMoney } from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Cash-flow matching scanner.
 * Top row: a coupon bond's cash flows [50, 50, 1050].
 * Bottom row: a portfolio of STRIPS that produces the identical cash flows
 * [50, 50, 1050]. Press "Scan cash flows" to run a scan line that stamps each
 * year as matched, ending with the Law of One Price intuition.
 */

const BOND_CF = [50, 50, 1050];
const STRIPS_CF = [50, 50, 1050];
const YEARS = [1, 2, 3];

export default function CashFlowMatchScanner() {
  const reduce = useReducedMotion();
  const [scanIdx, setScanIdx] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);

  const runScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanIdx(0);
    let i = 1;
    const tick = () => {
      setScanIdx(i);
      if (i < YEARS.length) {
        i += 1;
        window.setTimeout(tick, 650);
      } else {
        window.setTimeout(() => setScanning(false), 400);
      }
    };
    window.setTimeout(tick, 650);
  };

  const reset = () => {
    setScanIdx(null);
    setScanning(false);
  };

  const allMatched = scanIdx !== null && scanIdx >= YEARS.length;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Cash-flow replication">
        If two investments produce{" "}
        <span className="text-slate-50">identical future dollars on identical
        future dates</span>
        , then — absent frictions — they must sell for the same price today.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Cash-flow match scanner
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={runScan}
              disabled={scanning}
              aria-label="Scan cash flows year by year"
              className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-4 py-2 text-[13px] font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              {scanning ? "Scanning…" : "Scan cash flows"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={scanIdx === null}
              aria-label="Reset scanner"
              className="rounded-full border border-white/20 px-4 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Reset
            </button>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Are these two streams the same future dollars?
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          The coupon bond pays {formatMoney(50)} in years 1 and 2, then{" "}
          {formatMoney(1050)} at maturity. A portfolio of zero-coupon STRIPS can
          be assembled to deliver exactly those dollars. Scan to confirm each
          date matches.
        </p>

        {/* Scanner panel */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-5">
          <div className="min-w-[440px]">
            {/* scan progress */}
            <div className="mb-4 flex items-center gap-2">
              {YEARS.map((y, i) => {
                const done = scanIdx !== null && scanIdx > i;
                const active = scanIdx === i + 1 || (allMatched && false);
                return (
                  <div
                    key={y}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      done
                        ? "bg-accent-green"
                        : active
                          ? "bg-accent-cyan"
                          : "bg-white/10",
                    )}
                  />
                );
              })}
            </div>

            {/* Bond row */}
            <CFRow
              label="Coupon bond"
              tone="cyan"
              amounts={BOND_CF}
              scanIdx={scanIdx}
              reduce={reduce}
            />

            {/* scan line */}
            <div className="relative my-1 h-8">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
              <AnimatePresence>
                {scanIdx !== null && scanIdx >= 1 && scanIdx <= YEARS.length && (
                  <motion.div
                    key={scanIdx}
                    initial={reduce ? false : { left: "0%", opacity: 0 }}
                    animate={{ left: "66%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute top-1/2 h-6 w-px -translate-y-1/2 bg-accent-green/80"
                    style={{ boxShadow: "0 0 12px rgba(52,211,153,0.6)" }}
                    aria-hidden
                  />
                )}
              </AnimatePresence>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
                <span className="ops-caption bg-ink-950 px-2 text-[11px] text-slate-500">
                  {scanning ? "matching…" : ""}
                </span>
              </div>
            </div>

            {/* STRIPS row */}
            <CFRow
              label="STRIPS portfolio"
              tone="purple"
              amounts={STRIPS_CF}
              scanIdx={scanIdx}
              reduce={reduce}
            />

            {/* Match stamps */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {YEARS.map((y, i) => {
                const done = scanIdx !== null && scanIdx > i;
                return (
                  <div
                    key={y}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-center transition-colors",
                      done
                        ? "border-accent-green/50 bg-accent-green/10"
                        : "border-white/10 bg-white/[0.02]",
                    )}
                  >
                    <div className="ops-caption text-[11px] text-slate-500">
                      Year {y}
                    </div>
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.span
                          key="ok"
                          initial={reduce ? false : { scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mt-1 inline-block font-mono text-[16px] text-accent-green"
                        >
                          ✓ Match
                        </motion.span>
                      ) : (
                        <motion.span
                          key="wait"
                          initial={false}
                          className="mt-1 inline-block font-mono text-[14px] text-slate-600"
                        >
                          —
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {allMatched && (
          <Feedback status="correct">
            Same future dollars, same future dates. Under the Law of One Price,
            these two packages must trade for the same price today — any gap is
            an arbitrage signal (before frictions).
          </Feedback>
        )}
      </InteractiveFrame>
    </div>
  );
}

function CFRow({
  label,
  tone,
  amounts,
  scanIdx,
  reduce,
}: {
  label: string;
  tone: "cyan" | "purple";
  amounts: number[];
  scanIdx: number | null;
  reduce: boolean | null;
}) {
  const accent =
    tone === "cyan"
      ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
      : "border-accent-purple/40 bg-accent-purple/10 text-accent-purple";
  return (
    <div>
      <div className="ops-caption mb-2 text-[11px] text-slate-400">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {amounts.map((amt, i) => {
          const done = scanIdx !== null && scanIdx > i;
          return (
            <motion.div
              key={i}
              animate={
                done && !reduce ? { scale: [1, 1.04, 1] } : { scale: 1 }
              }
              transition={{ duration: 0.4 }}
              className={cn(
                "rounded-lg border px-3 py-3 text-center font-mono text-[16px] transition-colors",
                done ? accent : "border-white/10 bg-white/[0.02] text-slate-300",
              )}
            >
              {formatMoney(amt)}
              <div className="ops-caption mt-1 text-[11px] text-slate-500">
                Year {i + 1}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
