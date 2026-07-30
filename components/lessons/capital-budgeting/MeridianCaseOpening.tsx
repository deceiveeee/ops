"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Judgment = "yes" | "no" | "need-more";

const STRATEGY = [
  { icon: "🏪", label: "Open 150 new Northline Kitchen restaurants", detail: "Three-year expansion program" },
  { icon: "🤝", label: "Acquire Coastal Kitchen chain", detail: "$300M purchase price" },
  { icon: "🔄", label: "Repurchase shares with remaining capital", detail: "Subject to available funds" },
];

const MISSING = [
  { area: "Store expansion", questions: ["What is the full capital required?", "How quickly will stores mature?", "Are new markets as attractive?", "What about cannibalization?"] },
  { area: "Acquisition", questions: ["What is Coastal Kitchen worth independently?", "How credible are the synergies?", "Are integration costs included?", "Does EPS accretion mean positive NPV?"] },
  { area: "Buyback", questions: ["Are shares materially undervalued?", "What better uses would be forgone?", "Would the balance sheet remain sound?"] },
  { area: "Funding", questions: ["Is maintenance included?", "What liquidity reserve is required?", "Will Meridian need to borrow?"] },
];

export default function MeridianCaseOpening() {
  const reduce = useReducedMotion();
  const [judgment, setJudgment] = useState<Judgment | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-3">
        <p className="font-sans text-[12px] uppercase tracking-[0.14em] text-accent-amber">
          Fictional public-company case. All financial data are illustrative.
        </p>
      </div>

      {/* Company snapshot */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          Meridian Dining Group · current position
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Revenue", value: "$4.0B" }, { label: "After-tax op. profit", value: "$360M" },
            { label: "Current ROIC", value: "12%" }, { label: "Cost of capital", value: "9%" },
            { label: "Cash for allocation", value: "$600M" }, { label: "Debt", value: "$1.2B" },
            { label: "Shares", value: "100M" }, { label: "Share price", value: "$42" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-white/10 bg-ink-950/40 p-3">
              <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">{s.label}</div>
              <div className="mt-1 font-sans text-[15px] text-white">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategy */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Management&apos;s three-part strategy
        </div>
        <div className="mt-4 space-y-3">
          {STRATEGY.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-950/40 p-4">
              <span className="text-[20px]" aria-hidden>{s.icon}</span>
              <div>
                <div className="text-[15px] text-white">{s.label}</div>
                <div className="text-[12px] text-slate-400">{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Initial judgment */}
      {!judgment && (
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <p className="ops-body text-[17px] leading-[1.6] text-slate-100">
            Does management&apos;s plan create value?
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {([
              { key: "yes" as Judgment, label: "Looks promising" },
              { key: "no" as Judgment, label: "Looks concerning" },
              { key: "need-more" as Judgment, label: "Need more information" },
            ]).map((o) => (
              <button key={o.key} type="button" onClick={() => setJudgment(o.key)}
                className="rounded-full border border-white/20 px-5 py-2 text-[14px] text-slate-200 transition-colors hover:border-accent-amber/60 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50">
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {judgment && (
          <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
              <p className="ops-body text-[16px] leading-[1.65] text-slate-100">
                {judgment === "need-more" ? (
                  <>Correct instinct. The answer cannot be determined from the information provided. An
                  &ldquo;interesting strategy&rdquo; is not the same as a &ldquo;value-creating strategy.&rdquo;</>
                ) : (
                  <>The answer cannot be determined yet. An &ldquo;interesting strategy&rdquo; is not the
                  same as a &ldquo;value-creating strategy.&rdquo; Before judging, the investor must answer:</>
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MISSING.map((m) => (
                <div key={m.area} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
                  <div className="font-sans text-[11px] uppercase tracking-[0.14em] text-accent-cyan">{m.area}</div>
                  <ul className="mt-2 space-y-1">
                    {m.questions.map((q) => (
                      <li key={q} className="flex items-start gap-2 text-[13px] leading-[1.5] text-slate-200">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{q}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
