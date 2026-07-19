"use client";

import { motion, useReducedMotion } from "motion/react";
import SectionLabel from "@/components/ui/SectionLabel";
import { moneyFlow } from "@/data/marketing";

export default function MoneyMachine() {
  const reduce = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(52,211,153,0.06),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <SectionLabel index="05" eyebrow="Financial statements show how money moves" tone="green" />
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            A business is a machine that turns decisions into cash.
          </h2>
          <p className="mt-5 max-w-lg text-balance text-slate-300">
            Customers → Revenue → Gross Profit → Operating Income → Free Cash Flow → Value. Each stage is a decision
            with a financial consequence.
          </p>
        </div>

        {/* Flow system — full-width canvas with SVG connectors and flowing particles */}
        <div className="mt-12">
          <div className="glass-panel relative overflow-hidden p-5 sm:p-8">
            <div className="mb-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <span>Money machine · income statement flow</span>
              <span className="text-accent-green">FLOW</span>
            </div>

            <FlowDiagram reduce={!!reduce} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FlowDiagram({ reduce }: { reduce: boolean }) {
  // Desktop: horizontal flow with SVG connectors + animated particles.
  // Mobile: vertical stack with downward connectors.
  return (
    <div className="relative">
      {/* Desktop horizontal flow */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* SVG connector layer beneath the nodes */}
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-24 w-full -translate-y-1/2"
            aria-hidden
          >
            <line x1="40" y1="60" x2="1160" y2="60" stroke="rgba(52,211,153,0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
            {!reduce &&
              [0, 1, 2, 3].map((i) => (
                <motion.circle
                  key={i}
                  r="4"
                  fill="#34d399"
                  cy="60"
                  initial={{ cx: 40 }}
                  animate={{ cx: [40, 1160] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: i * 1.25 }}
                />
              ))}
          </svg>

          <div className="relative grid grid-cols-6 gap-3">
            {moneyFlow.map((s, i) => (
              <FlowNode key={s.key} stage={s} index={i} isLast={i === moneyFlow.length - 1} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile vertical flow */}
      <div className="lg:hidden">
        <div className="relative flex flex-col gap-0">
          {/* vertical connector line */}
          <div className="pointer-events-none absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-accent-green/40 via-accent-green/20 to-accent-green/0" />
          {!reduce && (
            <motion.div
              className="pointer-events-none absolute left-[24px] top-4 h-2 w-2 rounded-full bg-accent-green shadow-glow"
              animate={{ top: ["16px", "calc(100% - 32px)"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
            />
          )}
          {moneyFlow.map((s, i) => (
            <FlowNodeVertical key={s.key} stage={s} index={i} isLast={i === moneyFlow.length - 1} />
          ))}
        </div>
      </div>

      {/* Decision levers */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Insight label="Pricing power" value="+120 bps" tone="up" note="Margin expansion" />
        <Insight label="OpEx discipline" value="-4% YoY" tone="up" note="Operating leverage" />
        <Insight label="Reinvestment" value="$2.7B capex" tone="neutral" note="Funds future FCF" />
      </div>
    </div>
  );
}

function FlowNode({
  stage,
  index,
  isLast,
}: {
  stage: (typeof moneyFlow)[number];
  index: number;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="relative"
    >
      <div className="relative rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="mt-1 text-sm font-medium text-slate-200">{stage.label}</div>
        <div
          className={`mt-2 text-xl font-semibold ${
            stage.tone === "up" ? "text-accent-green" : stage.tone === "down" ? "text-accent-red" : "text-slate-200"
          }`}
        >
          {stage.value}
        </div>
        <div className="absolute -top-1.5 left-4 h-2 w-2 rounded-full bg-accent-green/70" />
      </div>
      {!isLast && (
        <div className="absolute -right-2 top-1/2 z-10 -translate-y-1/2">
          <svg width="14" height="14" viewBox="0 0 14 14" className="text-accent-green/60">
            <path d="M2 7h9M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}

function FlowNodeVertical({
  stage,
  index,
  isLast,
}: {
  stage: (typeof moneyFlow)[number];
  index: number;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
      className="relative flex items-center gap-4 py-3"
    >
      <div className="relative z-10 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-accent-green/40 bg-ink-950 font-mono text-xs text-accent-green">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200">{stage.label}</span>
          <span
            className={`text-base font-semibold ${
              stage.tone === "up" ? "text-accent-green" : stage.tone === "down" ? "text-accent-red" : "text-slate-200"
            }`}
          >
            {stage.value}
          </span>
        </div>
      </div>
      {!isLast && <div className="absolute left-[27px] top-full h-3 w-px bg-accent-green/20" />}
    </motion.div>
  );
}

function Insight({
  label,
  value,
  tone,
  note,
}: {
  label: string;
  value: string;
  tone: "up" | "down" | "neutral";
  note: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className={`mt-1 text-base font-semibold ${tone === "up" ? "text-accent-green" : tone === "down" ? "text-accent-red" : "text-slate-200"}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-slate-400">{note}</div>
    </div>
  );
}
