"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type DocKey = "A" | "B" | "C" | "D" | "E";

type Statement = { id: string; text: string; correct: string };

const DOCUMENTS: Record<DocKey, {
  label: string; icon: string; title: string; content: { text: string; type: "fact" | "forecast" | "interp" | "assumption" | "question" }[];
}> = {
  A: {
    label: "A", icon: "📄", title: "Annual Report Excerpt",
    content: [
      { text: "Meridian operates approximately 800 restaurants across two concepts.", type: "fact" },
      { text: "Revenue was $4.0 billion in the most recent fiscal year.", type: "fact" },
      { text: "Total capital expenditure was $280 million last year.", type: "fact" },
      { text: "Meridian sees substantial opportunity to expand Northline Kitchen.", type: "interp" },
      { text: "Management expects to open approximately 150 locations over three years.", type: "forecast" },
      { text: "Existing restaurants require continued renovation and equipment replacement.", type: "fact" },
      { text: "Meridian maintains a share-repurchase authorization.", type: "fact" },
      { text: "Management considers its balance sheet flexible.", type: "interp" },
    ],
  },
  B: {
    label: "B", icon: "📊", title: "Investor Presentation",
    content: [
      { text: "$1.3 million average physical development cost per new store.", type: "forecast" },
      { text: "$2.7 million mature annual sales per store.", type: "forecast" },
      { text: "21% restaurant-level margin target.", type: "forecast" },
      { text: "Three-year maturation period.", type: "forecast" },
      { text: "150 openings over three years.", type: "forecast" },
      { text: "The $1.3M excludes pre-opening expense, initial working capital, and central program support.", type: "fact" },
    ],
  },
  C: {
    label: "C", icon: "🎙", title: "Earnings Call Excerpt",
    content: [
      { text: "Analyst: 'How confident are you that the next 150 stores will achieve the same economics?'", type: "question" },
      { text: "Management: 'Recent stores are performing well and we see attractive white-space opportunities.'", type: "interp" },
      { text: "Management: 'We are seeing rising labor and construction costs.'", type: "fact" },
      { text: "Management: 'We expect some cannibalization as we densify existing markets.'", type: "forecast" },
      { text: "Management: 'We remain confident in the long-term concept.'", type: "interp" },
    ],
  },
  D: {
    label: "D", icon: "🔗", title: "Acquisition Announcement",
    content: [
      { text: "Purchase price: $300 million for Coastal Kitchen.", type: "fact" },
      { text: "Expected annual cost synergies: $25 million.", type: "forecast" },
      { text: "Expected integration costs: $40 million.", type: "forecast" },
      { text: "Coastal Kitchen annual operating profit: $22 million.", type: "fact" },
      { text: "Expected EPS accretion: 3% in Year 2.", type: "forecast" },
      { text: "Transaction expected to close within six months.", type: "forecast" },
    ],
  },
  E: {
    label: "E", icon: "📈", title: "Five-Year Historical Record",
    content: [
      { text: "Stores opened: 25, 30, 35, 40, 42 per year.", type: "fact" },
      { text: "Average all-in opening cost: rising from $1.2M to $1.6M.", type: "fact" },
      { text: "Average sales per new store: $2.4M to $2.6M at maturity.", type: "fact" },
      { text: "Restaurant-level margin: 22% trending toward 20%.", type: "fact" },
      { text: "Acquisitions: one small purchase in Year 3 ($50M).", type: "fact" },
      { text: "Goodwill impairments: $15M in Year 4.", type: "fact" },
      { text: "Diluted share count: 104M to 100M (declining).", type: "fact" },
      { text: "ROIC: 14% trending toward 12%.", type: "fact" },
    ],
  },
};

const TYPE_INFO: Record<string, { label: string; tone: "cyan" | "amber" | "green" | "red" | "purple" }> = {
  fact: { label: "Disclosed fact", tone: "cyan" },
  forecast: { label: "Management forecast", tone: "amber" },
  interp: { label: "Management interpretation", tone: "green" },
  assumption: { label: "Investor assumption", tone: "red" },
  question: { label: "Unresolved question", tone: "purple" },
};

const toneText: Record<string, string> = { cyan: "text-accent-cyan", amber: "text-accent-amber", green: "text-accent-green", red: "text-accent-red", purple: "text-accent-purple" };
const toneBorder: Record<string, string> = { cyan: "border-accent-cyan/30", amber: "border-accent-amber/30", green: "border-accent-green/30", red: "border-accent-red/30", purple: "border-accent-purple/30" };

export default function MeridianDisclosurePacket() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<DocKey>("A");
  const doc = DOCUMENTS[active];

  return (
    <div className="space-y-6">
      {/* Document selector */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Disclosure document">
        {(Object.keys(DOCUMENTS) as DocKey[]).map((key) => (
          <button key={key} type="button" role="tab"
            aria-selected={active === key}
            onClick={() => setActive(key)}
            className={cn("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              active === key ? "border-accent-amber/50 bg-accent-amber/10" : "border-white/12 hover:border-white/25")}>
            <span className="text-[16px]" aria-hidden>{DOCUMENTS[key].icon}</span>
            <div>
              <div className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", active === key ? "text-accent-amber" : "text-slate-400")}>
                Document {key}
              </div>
              <div className={cn("text-[12px]", active === key ? "text-white" : "text-slate-300")}>{DOCUMENTS[key].title}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Active document */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : undefined}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-white/12 bg-ink-950/50 p-5 sm:p-6"
        >
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
            Document {doc.label} · {doc.title}
          </div>
          <div className="mt-4 space-y-2.5">
            {doc.content.map((item, i) => {
              const info = TYPE_INFO[item.type];
              return (
                <div key={i} className={cn("rounded-lg border p-3", toneBorder[info.tone], "bg-white/[0.02]")}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="flex-1 text-[14px] leading-[1.55] text-slate-100">{item.text}</p>
                    <span className={cn("flex-shrink-0 rounded-full border border-current px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]", toneText[info.tone])}>
                      {info.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Guidance */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Each statement is labeled by type. Disclosed facts are historical or verifiable.
          Management forecasts are claims about the future — not verified facts. Management
          interpretations are subjective assessments. Do not automatically treat guidance as objective.
        </p>
      </div>
    </div>
  );
}
