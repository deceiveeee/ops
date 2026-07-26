"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { InteractiveFrame, TryItTag } from "./shared";

type Phase = "idle" | "issuing" | "issued";

/**
 * Section 1 — IOU Machine.
 * Cinematic opener: an issuer and an investor meet through a bond contract.
 * "Issue bond" animates price flowing investor → issuer, then promised
 * coupon + principal tickets appear and travel issuer → investor.
 */
export default function IOUMachine() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const issued = phase !== "idle";

  const issue = () => {
    if (phase === "issuing") return;
    setPhase("issuing");
    // settle the timeline after the price-flow animation completes
    window.setTimeout(() => setPhase("issued"), reduce ? 200 : 1700);
  };

  const reset = () => setPhase("idle");

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            IOU machine
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          A bond is a dated promise of dollars
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        How an IOU becomes a bond
      </h3>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
        A bond starts as a promise. One party needs cash today and promises to
        pay fixed dollars on fixed dates. Another party has cash and accepts
        that promise. Press <span className="text-accent-cyan">Issue bond</span>{" "}
        to see the cash move and the promised schedule appear.
      </p>

      {/* The three-role stage */}
      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <RoleCard
          tone="purple"
          label="Issuer"
          title="Borrower"
          note="Needs cash today. Promises a schedule of future payments."
          chips={["Government", "Corporation", "Bank", "Municipality"]}
        />

        {/* Contract + flow lane */}
        <div className="relative flex min-w-[260px] flex-col justify-between rounded-2xl border border-white/10 bg-ink-950/50 p-5 md:min-w-[300px]">
          <div className="ops-caption text-[11px] text-accent-cyan">
            Bond contract
          </div>
          <div className="mt-2 space-y-2 font-mono text-[12px] text-slate-300">
            <ContractRow k="Face value" v="$1,000" />
            <ContractRow k="Coupon" v="$50 / year" />
            <ContractRow k="Maturity" v="3 years" />
            <ContractRow k="Price today" v="$?" tone="cyan" />
          </div>

          {/* flow lane */}
          <div className="relative mt-5 h-16">
            {/* investor → issuer (price) */}
            <AnimatePresence>
              {phase === "issuing" && (
                <motion.div
                  key="price"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: 70 }}
                  animate={{ opacity: 1, x: -70 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduce ? 0.1 : 1.4,
                    ease: "easeInOut",
                  }}
                  className="absolute left-1/2 top-1/2 -translate-y-1/2"
                  aria-hidden
                >
                  <FlowToken label="Price" tone="cyan" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* issuer → investor (promised coupons + principal) */}
            <AnimatePresence>
              {issued && (
                <>
                  <motion.div
                    key="c1"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 60 }}
                    transition={{
                      duration: reduce ? 0.1 : 1.0,
                      ease: "easeOut",
                    }}
                    className="absolute left-1/2 top-1/2 -translate-y-1/2"
                    aria-hidden
                  >
                    <FlowToken label="C1" tone="green" />
                  </motion.div>
                  <motion.div
                    key="c2"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 60 }}
                    transition={{
                      duration: reduce ? 0.1 : 1.0,
                      ease: "easeOut",
                      delay: reduce ? 0 : 0.35,
                    }}
                    className="absolute left-1/2 top-1/2 -translate-y-1/2"
                    aria-hidden
                  >
                    <FlowToken label="C2" tone="green" />
                  </motion.div>
                  <motion.div
                    key="final"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 60 }}
                    transition={{
                      duration: reduce ? 0.1 : 1.0,
                      ease: "easeOut",
                      delay: reduce ? 0 : 0.7,
                    }}
                    className="absolute left-1/2 top-1/2 -translate-y-1/2"
                    aria-hidden
                  >
                    <FlowToken label="C+F" tone="amber" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* baseline direction labels */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between text-[13px] font-medium text-slate-500">
              <span>← price</span>
              <span>promised →</span>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between text-[13px] font-medium text-slate-500">
              <span>investor</span>
              <span>issuer</span>
            </div>
          </div>
        </div>

        <RoleCard
          tone="cyan"
          label="Investor"
          title="Lender"
          note="Has cash today. Buys the promise and expects the scheduled payments."
          chips={["Pension fund", "Insurer", "Bank", "Individual"]}
        />
      </div>

      {/* Timeline of promised payments */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
        <div className="ops-caption text-[11px] text-slate-400">
          Promised cash-flow schedule
        </div>
        <div className="relative mt-4 flex items-start justify-between gap-2">
          <div
            className="pointer-events-none absolute left-0 right-0 top-[7px] h-px bg-accent-cyan/40"
            aria-hidden
          />
          <TimelineNode
            t="t = 0"
            label="Price paid"
            tone="cyan"
            active={phase !== "idle"}
          />
          <TimelineNode
            t="Year 1"
            label="Coupon $50"
            tone="green"
            active={issued}
          />
          <TimelineNode
            t="Year 2"
            label="Coupon $50"
            tone="green"
            active={issued}
          />
          <TimelineNode
            t="Year 3"
            label="Coupon + Principal $1,050"
            tone="amber"
            active={issued}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={issue}>
          {phase === "issuing"
            ? "Issuing…"
            : issued
              ? "Issue again"
              : "Issue bond"}
        </Button>
        {issued && (
          <Button variant="outline" onClick={reset}>
            Reset
          </Button>
        )}
      </div>

      <AnimatePresence>
        {issued && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="ops-body text-[15px] leading-7 text-slate-200">
              At <span className="text-accent-cyan">t = 0</span> the investor
              pays the price and receives the bond. In return, the issuer owes
              <span className="text-accent-green"> coupon payments</span> on
              fixed dates plus the{" "}
              <span className="text-accent-amber">principal</span> at{" "}
              <span className="text-accent-amber">maturity</span>. Everything
              else in fixed income is a variation on this timed promise.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveFrame>
  );
}

function RoleCard({
  tone,
  label,
  title,
  note,
  chips,
}: {
  tone: "purple" | "cyan";
  label: string;
  title: string;
  note: string;
  chips: string[];
}) {
  const t =
    tone === "purple"
      ? {
          border: "border-accent-purple/40",
          text: "text-accent-purple",
          dot: "bg-accent-purple",
        }
      : {
          border: "border-accent-cyan/40",
          text: "text-accent-cyan",
          dot: "bg-accent-cyan",
        };
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border bg-white/[0.03] p-5",
        t.border,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} aria-hidden />
        <span className={cn("ops-caption text-[11px]", t.text)}>{label}</span>
      </div>
      <div className="ops-interactive-title mt-3 text-lg text-white">
        {title}
      </div>
      <p className="ops-body mt-2 text-[14px] leading-6 text-slate-300">
        {note}
      </p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
        {chips.map((c) => (
          <span
            key={c}
            className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-slate-300"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function ContractRow({ k, v, tone }: { k: string; v: string; tone?: "cyan" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{k}</span>
      <span className={tone === "cyan" ? "text-accent-cyan" : "text-slate-100"}>
        {v}
      </span>
    </div>
  );
}

function FlowToken({
  label,
  tone,
}: {
  label: string;
  tone: "cyan" | "green" | "amber";
}) {
  const c =
    tone === "cyan"
      ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
      : tone === "green"
        ? "border-accent-green/60 bg-accent-green/15 text-accent-green"
        : "border-accent-amber/60 bg-accent-amber/15 text-accent-amber";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
        c,
      )}
    >
      {label}
    </span>
  );
}

function TimelineNode({
  t,
  label,
  tone,
  active,
}: {
  t: string;
  label: string;
  tone: "cyan" | "green" | "amber";
  active: boolean;
}) {
  const dot =
    tone === "cyan"
      ? "bg-accent-cyan"
      : tone === "green"
        ? "bg-accent-green"
        : "bg-accent-amber";
  return (
    <div className="relative flex w-1/4 flex-col items-center text-center">
      <motion.span
        animate={{ scale: active ? 1 : 0.6, opacity: active ? 1 : 0.4 }}
        transition={{ duration: 0.3 }}
        className={cn("h-3.5 w-3.5 rounded-full ring-4 ring-ink-950", dot)}
        aria-hidden
      />
      <div
        className={cn(
          "mt-3 font-mono text-[13px]",
          active ? "text-slate-200" : "text-slate-500",
        )}
      >
        {t}
      </div>
      <div
        className={cn(
          "ops-caption mt-1 text-[11px]",
          active ? "text-slate-300" : "text-slate-600",
        )}
      >
        {label}
      </div>
    </div>
  );
}
