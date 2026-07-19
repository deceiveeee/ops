"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ops-m9-l94-decision-journal";

type FieldKey =
  | "date" | "asset" | "currentPrice" | "estimatedValue" | "expectedReturn"
  | "benchmark" | "thesis" | "marketExpectation" | "correctionMechanism"
  | "majorRisks" | "positionSize" | "invalidation" | "holdingPeriod"
  | "outcome" | "thesisCorrect" | "processFollowed" | "skill" | "luck"
  | "riskLimits" | "whatToChange";

const BEFORE_FIELDS: { key: FieldKey; label: string; placeholder: string }[] = [
  { key: "date", label: "Date", placeholder: "e.g., 2026-04-12" },
  { key: "asset", label: "Asset or strategy", placeholder: "Ticker, name, or strategy label" },
  { key: "currentPrice", label: "Current price", placeholder: "$ per share or % of portfolio" },
  { key: "estimatedValue", label: "Estimated value", placeholder: "Your central estimate" },
  { key: "expectedReturn", label: "Expected return", placeholder: "% over what horizon" },
  { key: "benchmark", label: "Benchmark", placeholder: "What you will compare against" },
  { key: "thesis", label: "Thesis", placeholder: "Why the asset appears attractive and what you believe differently" },
  { key: "marketExpectation", label: "Market expectation", placeholder: "What the price appears to assume" },
  { key: "correctionMechanism", label: "Correction mechanism", placeholder: "What would close the gap" },
  { key: "majorRisks", label: "Major risks", placeholder: "What could make this fail" },
  { key: "positionSize", label: "Position size", placeholder: "% of portfolio, with rationale" },
  { key: "invalidation", label: "Invalidation conditions", placeholder: "What evidence would prove the thesis wrong" },
  { key: "holdingPeriod", label: "Expected holding period", placeholder: "How long you expect to hold" },
];

const AFTER_FIELDS: { key: FieldKey; label: string; placeholder: string }[] = [
  { key: "outcome", label: "What happened", placeholder: "Describe the outcome" },
  { key: "thesisCorrect", label: "Was the thesis correct?", placeholder: "Yes / no / partially, with reasoning" },
  { key: "processFollowed", label: "Was the process followed?", placeholder: "Did you respect your own rules?" },
  { key: "skill", label: "What was skill?", placeholder: "What part of the result came from genuine edge" },
  { key: "luck", label: "What was luck?", placeholder: "What part came from factors outside your control" },
  { key: "riskLimits", label: "Did risk limits work?", placeholder: "Did your protections hold?" },
  { key: "whatToChange", label: "What should change?", placeholder: "What would you do differently" },
];

type JournalEntry = Record<FieldKey, string>;

const EMPTY: JournalEntry = {
  date: "", asset: "", currentPrice: "", estimatedValue: "", expectedReturn: "",
  benchmark: "", thesis: "", marketExpectation: "", correctionMechanism: "",
  majorRisks: "", positionSize: "", invalidation: "", holdingPeriod: "",
  outcome: "", thesisCorrect: "", processFollowed: "", skill: "", luck: "",
  riskLimits: "", whatToChange: "",
};

export default function DecisionJournal() {
  const [entry, setEntry] = useState<JournalEntry>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntry({ ...EMPTY, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entry)); } catch { /* ignore */ }
  }, [entry, loaded]);

  const update = (key: FieldKey, val: string) => {
    setEntry((p) => ({ ...p, [key]: val }));
  };

  const reset = () => {
    if (typeof window === "undefined") return;
    if (window.confirm("Clear the journal entry? This cannot be undone.")) {
      setEntry(EMPTY);
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  };

  const beforeFilled = BEFORE_FIELDS.filter((f) => (entry[f.key] ?? "").trim().length > 0).length;
  const afterFilled = AFTER_FIELDS.filter((f) => (entry[f.key] ?? "").trim().length > 0).length;

  return (
    <div className="space-y-6 ops-print-container">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6 ops-no-print">
        <div className="flex items-baseline justify-between gap-3">
          <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
            One structured entry. The journal preserves what you believed <span className="italic">before</span>{" "}
            the outcome was known — protecting against hindsight bias and thesis drift.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-slate-300">
          <span>Before: <span className="font-mono text-accent-cyan">{beforeFilled}/{BEFORE_FIELDS.length}</span></span>
          <span>After: <span className="font-mono text-accent-amber">{afterFilled}/{AFTER_FIELDS.length}</span></span>
          <span className="text-slate-400">· auto-saves locally</span>
        </div>
      </div>

      {/* Before section */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
            Before the decision
          </div>
          <div className="font-mono text-[11px] text-slate-400">Write before you act</div>
        </div>
        <p className="ops-body mt-2 text-[13px] leading-[1.6] text-slate-300">
          Record what you believe now, while you still genuinely believe it. Later, this is the
          only honest record of your reasoning.
        </p>
        <div className="mt-4 space-y-4">
          {BEFORE_FIELDS.map((f) => (
            <FieldInput key={f.key} field={f} value={entry[f.key]} onChange={(v) => update(f.key, v)} />
          ))}
        </div>
      </div>

      {/* After section */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
            After the decision
          </div>
          <div className="font-mono text-[11px] text-slate-400">Complete when outcome is known</div>
        </div>
        <p className="ops-body mt-2 text-[13px] leading-[1.6] text-slate-300">
          Return to the entry after the position is closed or the thesis resolves. Be honest about
          what was skill, what was luck, and what should change.
        </p>
        <div className="mt-4 space-y-4">
          {AFTER_FIELDS.map((f) => (
            <FieldInput key={f.key} field={f} value={entry[f.key]} onChange={(v) => update(f.key, v)} />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 ops-no-print">
        <button type="button"
          onClick={() => { if (typeof window !== "undefined") window.print(); }}
          className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
          Print / save as PDF
        </button>
        <button type="button" onClick={reset}
          className="rounded-full border border-white/15 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400 transition-colors hover:border-accent-red/40 hover:text-accent-red focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
          Clear entry
        </button>
      </div>

      <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] px-4 py-3 ops-no-print">
        <p className="text-[12px] leading-[1.55] text-slate-300">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-amber">Educational template · </span>
          Entries are stored only in your browser. Clearing browser data erases them. This is a
          learning tool, not a substitute for professional record-keeping or tax documentation.
        </p>
      </div>

      <style>{`
        @media print {
          .ops-no-print { display: none !important; }
          .ops-print-container {
            background: white !important;
            color: black !important;
            padding: 0 !important;
          }
          .ops-print-container .glass-panel,
          .ops-print-container [class*="rounded-2xl"],
          .ops-print-container [class*="border"] {
            border: 1px solid #999 !important;
            background: white !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .ops-print-container, .ops-print-container * {
            color: black !important;
          }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

function FieldInput({ field, value, onChange }: {
  field: { key: FieldKey; label: string; placeholder: string };
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        {field.label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={1}
        placeholder={field.placeholder}
        className="ops-body mt-1.5 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-2.5 text-[14px] leading-[1.55] text-slate-100 placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
        aria-label={field.label} />
    </div>
  );
}
