"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type QuestionKey =
  | "how-much"
  | "on-schedule"
  | "what-return"
  | "what-risk"
  | "is-it-working";

type SourceKey =
  | "10k-business"
  | "mdna"
  | "capex-guidance"
  | "ppe-note"
  | "segments"
  | "10q"
  | "earnings-call"
  | "investor-deck"
  | "8k";

type Source = {
  key: SourceKey;
  name: string;
  short: string;
  what: string;
  limit: string;
};

const SOURCES: Source[] = [
  {
    key: "10k-business",
    name: "10-K · Business section",
    short: "10-K Business",
    what: "Major products, facilities, markets, strategic initiatives, and expansion plans.",
    limit: "Describes the business at a high level; rarely quantifies individual project economics.",
  },
  {
    key: "mdna",
    name: "10-K · MD&A",
    short: "MD&A",
    what: "Management's explanation of investment priorities, capital spending, performance drivers, known uncertainties, and changes from prior expectations.",
    limit: "Narrative and management-framed; selective emphasis is common.",
  },
  {
    key: "capex-guidance",
    name: "Capital-expenditure guidance",
    short: "Capex guidance",
    what: "Expected spending, broad allocation across programs, and timing.",
    limit: "Usually aggregate, not project-level. Guidance can be revised or withdrawn.",
  },
  {
    key: "ppe-note",
    name: "Property & equipment note",
    short: "PP&E note",
    what: "Factories, stores, equipment, construction in progress, and depreciation trends.",
    limit: "Historical and aggregated; construction-in-progress signals spending but not returns.",
  },
  {
    key: "segments",
    name: "Segment disclosures",
    short: "Segments",
    what: "Revenue, operating profit, assets, and sometimes capital expenditure by business unit.",
    limit: "Segments bundle many projects; granularity varies by company.",
  },
  {
    key: "10q",
    name: "10-Q · Quarterly report",
    short: "10-Q",
    what: "Spending to date, updated guidance, delays, cost changes, segment performance, and impairments.",
    limit: "Quarterly snapshots; less detail than the annual filing.",
  },
  {
    key: "earnings-call",
    name: "Earnings calls",
    short: "Earnings call",
    what: "Management explanations and analyst questions — unit economics, timing, capacity, utilization, margins, and setbacks.",
    limit: "Forward-looking commentary; not audited and not always binding.",
  },
  {
    key: "investor-deck",
    name: "Investor presentations",
    short: "Investor deck",
    what: "Strategic targets, store counts, capacity plans, market-size assumptions, margin targets, and development milestones.",
    limit: "Marketing-oriented; assumptions are presented favorably.",
  },
  {
    key: "8k",
    name: "8-K · Transaction announcements",
    short: "8-K",
    what: "Acquisition price, financing, expected synergies, transaction rationale, and closing conditions.",
    limit: "Describes the deal as negotiated; synergy estimates are management's, not realized.",
  },
];

type Question = {
  key: QuestionKey;
  prompt: string;
  primary: SourceKey[];
  secondary: SourceKey[];
};

const QUESTIONS: Question[] = [
  {
    key: "how-much",
    prompt: "How much capital is being committed?",
    primary: ["capex-guidance", "8k", "ppe-note"],
    secondary: ["mdna", "10k-business", "segments"],
  },
  {
    key: "on-schedule",
    prompt: "Is the project on schedule and on budget?",
    primary: ["10q", "earnings-call", "mdna"],
    secondary: ["investor-deck", "ppe-note"],
  },
  {
    key: "what-return",
    prompt: "Is the investment generating an adequate return?",
    primary: ["segments", "earnings-call", "10q"],
    secondary: ["mdna", "investor-deck", "10k-business"],
  },
  {
    key: "what-risk",
    prompt: "What risks does the investment carry?",
    primary: ["10k-business", "mdna", "earnings-call"],
    secondary: ["8k", "investor-deck"],
  },
  {
    key: "is-it-working",
    prompt: "Is the project performing as management claimed?",
    primary: ["earnings-call", "10q", "segments"],
    secondary: ["mdna", "investor-deck"],
  },
];

export default function CorporateDisclosureMap() {
  const reduce = useReducedMotion();
  const [q, setQ] = useState<QuestionKey>("how-much");
  const active = QUESTIONS.find((x) => x.key === q)!;

  const relevance = (s: Source): "primary" | "secondary" | "low" => {
    if (active.primary.includes(s.key)) return "primary";
    if (active.secondary.includes(s.key)) return "secondary";
    return "low";
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Select an investor question
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Investor question">
          {QUESTIONS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={q === item.key}
              onClick={() => setQ(item.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                q === item.key
                  ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                  : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
              )}
            >
              {item.prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SOURCES.map((s) => {
          const rel = relevance(s);
          return (
            <motion.div
              key={s.key}
              initial={reduce ? false : false}
              animate={{
                opacity: rel === "low" ? 0.4 : 1,
              }}
              transition={{ duration: 0.25 }}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                rel === "primary"
                  ? "border-accent-green/40 bg-accent-green/[0.06]"
                  : rel === "secondary"
                    ? "border-accent-amber/30 bg-accent-amber/[0.04]"
                    : "border-white/10 bg-white/[0.02]",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-sans text-[9px] uppercase tracking-[0.14em]",
                    rel === "primary"
                      ? "bg-accent-green/15 text-accent-green"
                      : rel === "secondary"
                        ? "bg-accent-amber/15 text-accent-amber"
                        : "bg-white/10 text-slate-400",
                  )}
                >
                  {rel === "primary" ? "Most useful" : rel === "secondary" ? "Helpful" : "Limited"}
                </span>
              </div>
              <div className="mt-2 font-display text-[15px] font-medium text-white">
                {s.name}
              </div>
              <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
                {s.what}
              </p>
              {rel !== "low" && (
                <p className="ops-body mt-2 text-[12px] leading-[1.5] text-slate-400">
                  <span className="text-slate-500">Limit: </span>
                  {s.limit}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          No single disclosure usually contains the full answer. Investors{" "}
          <span className="text-white">assemble</span> the analysis from several sources,
          each carrying different information and different limitations. Management guidance is
          a starting point for investigation, not a neutral or guaranteed forecast.
        </p>
      </div>
    </div>
  );
}
