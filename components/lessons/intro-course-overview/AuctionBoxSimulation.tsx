"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Feedback, InteractiveFrame, TryItTag } from "./shared";
import { cn } from "@/lib/utils";

const BIDS = [
  { id: "0", label: "$0" },
  { id: "5", label: "$5" },
  { id: "20", label: "$20" },
  { id: "45", label: "$45" },
  { id: "149", label: "$149" },
];

type Stage = "bid" | "result" | "reflect";

export default function AuctionBoxSimulation({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [stage, setStage] = useState<Stage>("bid");
  const [bid, setBid] = useState<string | null>(null);
  const [reflect, setReflect] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const submitBid = (id: string) => {
    setBid(id);
    setStage("result");
  };

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Mystery Auction · price discovery
          </span>
        </div>
        <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
          Simulation
        </span>
      </div>

      {/* Box visual */}
      <div className="mt-6 flex justify-center">
        <svg
          viewBox="0 0 200 160"
          className="h-40 w-48"
          role="img"
          aria-label="A wrapped mystery box up for auction"
        >
          <rect
            x="40"
            y="50"
            width="120"
            height="90"
            rx="6"
            fill="rgba(34,211,238,0.06)"
            stroke="rgba(34,211,238,0.5)"
            strokeWidth="1.5"
          />
          <rect
            x="40"
            y="50"
            width="120"
            height="90"
            rx="6"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
          />
          <line
            x1="100"
            y1="50"
            x2="100"
            y2="140"
            stroke="rgba(34,211,238,0.6)"
            strokeWidth="2"
          />
          <path
            d="M100 50 C92 36 108 36 100 22 C92 36 108 36 100 50"
            fill="rgba(34,211,238,0.15)"
            stroke="rgba(34,211,238,0.7)"
            strokeWidth="1.5"
          />
          <text
            x="100"
            y="150"
            textAnchor="middle"
            className="fill-slate-400 font-sans"
            fontSize="9"
            letterSpacing="1.5"
          >
            SEALED · NO INSPECTION
          </text>
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {stage === "bid" && (
          <motion.div
            key="bid"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="ops-body-strong mt-5 text-center text-[16px] text-slate-50">
              You are in a finance class. A wrapped box is being auctioned. You
              cannot open it, shake it, or inspect it. What is the highest price
              you would bid?
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              {BIDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => submitBid(b.id)}
                  className="rounded-full border border-white/20 px-5 py-2.5 text-[15px] text-slate-100 transition-colors hover:border-accent-cyan hover:bg-accent-cyan/10 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {stage === "result" && bid && (
          <motion.div
            key="result"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="mt-5 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-5 text-center">
              <div className="ops-caption text-[11px] text-accent-cyan">
                Your bid
              </div>
              <div className="ops-display mt-2 text-3xl">
                {BIDS.find((b) => b.id === bid)?.label}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="ops-caption text-[10px] text-slate-500">
                  Class winning bid
                </div>
                <div className="ops-display mt-1.5 text-xl text-slate-100">
                  $45
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="ops-caption text-[10px] text-slate-500">
                  Item
                </div>
                <div className="ops-body-strong mt-1.5 text-[15px] text-slate-100">
                  iPod Nano
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="ops-caption text-[10px] text-slate-500">
                  Retail value
                </div>
                <div className="ops-display mt-1.5 text-xl text-slate-100">
                  ~$149
                </div>
              </div>
            </div>
            <p className="ops-body mt-5 text-[15px] text-slate-200">
              The class discovered a market price even with limited information.
              The price was not the same as the item&apos;s full retail value
              because bidders were uncertain about what was inside the box.
            </p>
            <div className="mt-5 rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.06] p-5">
              <div className="ops-caption text-[11px] text-accent-cyan">
                OPS bridge
              </div>
              <p className="ops-body mt-3 text-[15px] text-slate-200">
                Financial assets often work the same way. Investors do not know
                the future cash flows with certainty. They observe information,
                form beliefs, submit bids, and the market discovers a price.
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStage("reflect")}
                className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-2 text-sm text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
              >
                Reflect →
              </button>
            </div>
          </motion.div>
        )}

        {stage === "reflect" && (
          <motion.div
            key="reflect"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <p className="ops-body-strong mt-5 text-[16px] text-slate-50">
              Why was the winning bid below the item&apos;s retail value?
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {[
                { id: "info", label: "Students had incomplete information." },
                { id: "novalue", label: "The box had no value." },
                { id: "forced", label: "The professor forced the price down." },
                { id: "nomkt", label: "Capital markets were not involved." },
              ].map((c) => {
                const picked = reflect === c.id;
                const correct = c.id === "info";
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={reflect !== null}
                    onClick={() => {
                      setReflect(c.id);
                      if (correct) onComplete?.();
                    }}
                    className={cn(
                      "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                      !reflect &&
                        "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan",
                      reflect &&
                        correct &&
                        "border-accent-green bg-accent-green/15 text-accent-green",
                      reflect &&
                        picked &&
                        !correct &&
                        "border-accent-red bg-accent-red/15 text-accent-red",
                      reflect &&
                        !picked &&
                        !correct &&
                        "border-white/10 text-slate-500",
                    )}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
            {reflect && (
              <Feedback status={reflect === "info" ? "correct" : "incorrect"}>
                Market prices reflect available information, uncertainty, and
                the interaction of buyers and sellers. A price is not
                automatically the same as true value, but price discovery is one
                of the central functions of financial markets.
              </Feedback>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveFrame>
  );
}
