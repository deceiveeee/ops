"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ops-m9-l94-investment-policy";

type FieldKey = "marketBelief" | "returnSource" | "edge" | "approach" | "activeRule" | "riskLimits" | "benchmark" | "reviewProcess" | "revisionCriteria";

const FIELDS: { key: FieldKey; prefix: string; suffix?: string; placeholder: string; rows: number }[] = [
  {
    key: "marketBelief",
    prefix: "I believe market prices are generally",
    suffix: "because",
    placeholder: "competitive / efficient but occasionally wrong / variable by market…",
    rows: 2,
  },
  {
    key: "returnSource",
    prefix: "Most of my expected return should come from",
    placeholder: "broad equity exposure / a specific factor / security selection…",
    rows: 2,
  },
  {
    key: "edge",
    prefix: "I",
    suffix: "currently possess a defensible edge. The proposed edge is",
    placeholder: "do / do not — then describe the specific advantage or its absence…",
    rows: 2,
  },
  {
    key: "approach",
    prefix: "My portfolio will primarily use",
    placeholder: "low-cost diversified index funds / a passive core with limited active / …",
    rows: 2,
  },
  {
    key: "activeRule",
    prefix: "I will make an active investment only when",
    placeholder: "I can explain valuation, market expectation, correction mechanism, and downside…",
    rows: 2,
  },
  {
    key: "riskLimits",
    prefix: "I will control position size, leverage, concentration, and liquidity risk by",
    placeholder: "capping single positions at X%, using no leverage, keeping Y% in liquid reserves…",
    rows: 2,
  },
  {
    key: "benchmark",
    prefix: "I will compare results against",
    suffix: "because",
    placeholder: "an appropriate blended benchmark / a passive target…",
    rows: 2,
  },
  {
    key: "reviewProcess",
    prefix: "I will evaluate decisions using",
    suffix: "over a period of",
    placeholder: "process adherence, risk-adjusted return, after-cost results…",
    rows: 2,
  },
  {
    key: "revisionCriteria",
    prefix: "I will revise or exit a position when",
    placeholder: "the thesis is invalidated, the price exceeds estimated value, or risk limits are breached…",
    rows: 2,
  },
];

type Policy = Record<FieldKey, string>;

const EMPTY: Policy = {
  marketBelief: "", returnSource: "", edge: "", approach: "", activeRule: "",
  riskLimits: "", benchmark: "", reviewProcess: "", revisionCriteria: "",
};

export default function InvestmentPolicyStatement() {
  const [policy, setPolicy] = useState<Policy>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPolicy({ ...EMPTY, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(policy)); } catch { /* ignore */ }
  }, [policy, loaded]);

  const update = (key: FieldKey, val: string) => {
    setPolicy((p) => ({ ...p, [key]: val }));
  };

  const reset = () => {
    if (typeof window === "undefined") return;
    if (window.confirm("Clear the policy statement? This cannot be undone.")) {
      setPolicy(EMPTY);
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }
  };

  const filled = FIELDS.filter((f) => (policy[f.key] ?? "").trim().length > 0).length;

  return (
    <div className="space-y-6 ops-ips-print-container">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6 ops-ips-no-print">
        <div className="flex items-baseline justify-between gap-3">
          <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
            A one-page personal investment policy statement. Each section is editable. Auto-saves
            locally. Print or save as PDF when complete.
          </p>
        </div>
        <div className="mt-3 text-[12px] text-slate-300">
          Completed: <span className="font-sans text-accent-cyan">{filled}/{FIELDS.length}</span> · auto-saves locally
        </div>
      </div>

      {/* Editable policy */}
      <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 sm:p-8 ops-ips-page">
        <div className="border-b border-white/10 pb-4">
          <div className="font-sans text-[11px] uppercase tracking-[0.18em] text-accent-cyan">
            Personal Investment Policy Statement
          </div>
          <div className="mt-1 font-sans text-[10px] uppercase tracking-[0.14em] text-slate-500">
            Educational draft · not personalized financial advice
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {FIELDS.map((f, i) => (
            <div key={f.key}>
              <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">
                {String(i + 1).padStart(2, "0")} · {labelFor(f.key)}
              </div>
              <div className="mt-1.5 text-[15px] leading-[1.7] text-slate-100">
                <span className="text-white">{f.prefix}</span>{" "}
                <textarea
                  value={policy[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  rows={f.rows}
                  placeholder={f.placeholder}
                  className="ops-body inline-block w-full resize-y rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2 text-[14px] leading-[1.55] text-slate-100 placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
                  aria-label={labelFor(f.key)} />
                {f.suffix && (
                  <>
                    {" "}<span className="text-white">{f.suffix}</span>{" "}
                    <span className="hidden">[fill above]</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-[12px] leading-[1.5] text-slate-400">
            Review this statement at least annually and after any major life event. A real
            investment policy should be reviewed with a qualified professional and tailored to your
            specific financial situation, tax status, and regulatory jurisdiction.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 ops-ips-no-print">
        <button type="button"
          onClick={() => { if (typeof window !== "undefined") window.print(); }}
          className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
          Print / save as PDF
        </button>
        <button type="button" onClick={reset}
          className="rounded-full border border-white/15 px-5 py-2 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400 transition-colors hover:border-accent-red/40 hover:text-accent-red focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
          Clear policy
        </button>
      </div>

      <style>{`
        @media print {
          .ops-ips-no-print { display: none !important; }
          .ops-ips-print-container { padding: 0 !important; }
          .ops-ips-page {
            border: none !important;
            background: white !important;
            box-shadow: none !important;
            padding: 0 !important;
            page-break-inside: avoid;
          }
          .ops-ips-page, .ops-ips-page * {
            color: black !important;
            border-color: #ccc !important;
          }
          .ops-ips-page textarea {
            border: none !important;
            background: transparent !important;
            color: black !important;
            resize: none !important;
            padding: 0 0 2px 0 !important;
          }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

function labelFor(key: FieldKey): string {
  const map: Record<FieldKey, string> = {
    marketBelief: "My market belief",
    returnSource: "My expected source of return",
    edge: "My claimed edge",
    approach: "My portfolio approach",
    activeRule: "My active investing rule",
    riskLimits: "My risk limits",
    benchmark: "My benchmark",
    reviewProcess: "My review process",
    revisionCriteria: "My revision or exit criteria",
  };
  return map[key];
}
