"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ops-m9-l94-philosophy-builder";

type MarketBelief = "always" | "usually" | "frequently" | "varies" | "undecided";
type Implementation = "passive" | "blended" | "active" | "manager" | "factor" | "undecided";

const MARKET_BELIEF: { key: MarketBelief; label: string; phrase: string }[] = [
  { key: "always", label: "Markets are nearly always efficient", phrase: "broad public markets are highly efficient" },
  { key: "usually", label: "Markets are generally efficient but occasionally misprice assets", phrase: "broad public markets are highly competitive, with occasional mispricing when information is difficult to interpret or investors face constraints" },
  { key: "frequently", label: "Markets frequently misprice assets", phrase: "mispricing occurs frequently enough to be exploitable with the right approach" },
  { key: "varies", label: "Efficiency differs materially by market and condition", phrase: "market efficiency varies materially by market, participant, and condition" },
  { key: "undecided", label: "I do not yet have enough evidence to decide", phrase: "the evidence on market efficiency is not yet sufficient to support a strong claim" },
];

const RETURN_SOURCES = [
  "Broad market exposure", "Equity risk", "Credit risk", "Factor exposure",
  "Security selection", "Market timing", "Illiquidity", "Long-term discipline",
  "Tax efficiency", "Other",
];

const EDGES = [
  { key: "none", label: "No identifiable edge", phrase: "I do not currently possess a repeatable security-selection edge" },
  { key: "horizon", label: "Long time horizon", phrase: "my time horizon is longer than most market participants, allowing me to hold positions through near-term volatility" },
  { key: "industry", label: "Specialized industry knowledge", phrase: "I have specialized industry knowledge that lets me interpret information others may overlook" },
  { key: "fundamental", label: "Better fundamental analysis", phrase: "my fundamental analysis differs from consensus in specific, testable ways" },
  { key: "quant", label: "Better quantitative analysis", phrase: "my quantitative analysis identifies patterns others have not yet captured" },
  { key: "behavioral", label: "Behavioral discipline", phrase: "my behavioral discipline lets me act patiently when others react emotionally" },
  { key: "less-followed", label: "Ability to invest in less-followed markets", phrase: "I can invest in less-followed markets where competition is weaker" },
  { key: "structural", label: "Structural or institutional advantage", phrase: "I benefit from a structural or institutional advantage unavailable to most participants" },
  { key: "other", label: "Other", phrase: "I claim an edge I will describe in my own words" },
];

const IMPLEMENTATIONS: { key: Implementation; label: string; phrase: string }[] = [
  { key: "passive", label: "Broad passive portfolio", phrase: "diversified low-cost investments for most of my portfolio" },
  { key: "blended", label: "Passive core with limited active positions", phrase: "a diversified passive core with a limited allocation to active positions that meet explicit criteria" },
  { key: "active", label: "Fully active portfolio", phrase: "a primarily active portfolio of individual positions" },
  { key: "manager", label: "Active manager selection", phrase: "a selection of active managers whose process and edge I can evaluate" },
  { key: "factor", label: "Rules-based factor portfolio", phrase: "a rules-based factor portfolio targeting specific compensated exposures" },
  { key: "undecided", label: "Still undecided", phrase: "an implementation approach I will finalize after further study" },
];

const CONSTRAINTS = [
  "Limited research time", "Limited capital", "Need for liquidity", "Tax sensitivity",
  "Low tolerance for drawdowns", "No leverage", "Long investment horizon",
  "Short investment horizon", "Limited ability to evaluate managers",
  "Concentrated employer stock", "Other",
];

const RISK_CONTROLS = [
  "Position-size limits", "Diversification minimums", "No leverage",
  "Liquidity reserve", "Scheduled reviews", "Written thesis",
  "Predefined invalidation conditions", "Maximum active allocation",
  "Benchmark review", "Other",
];

type State = {
  belief: MarketBelief | null;
  returns: string[];
  edge: string | null;
  implementation: Implementation | null;
  constraints: string[];
  riskControls: string[];
  customDraft: string;
};

const INITIAL: State = {
  belief: null,
  returns: [],
  edge: null,
  implementation: null,
  constraints: [],
  riskControls: [],
  customDraft: "",
};

const STEPS = [
  { n: 1, label: "Market belief" },
  { n: 2, label: "Return source" },
  { n: 3, label: "Claimed advantage" },
  { n: 4, label: "Implementation" },
  { n: 5, label: "Constraints" },
  { n: 6, label: "Risk controls" },
  { n: 7, label: "Your statement" },
];

function buildStatement(s: State): string {
  const belief = MARKET_BELIEF.find((b) => b.key === s.belief);
  const edge = EDGES.find((e) => e.key === s.edge);
  const impl = IMPLEMENTATIONS.find((i) => i.key === s.implementation);

  const parts: string[] = [];

  parts.push(`I believe ${belief ? belief.phrase : "[state your market belief]"}.`);

  if (edge) {
    if (edge.key === "none") {
      parts.push(`${edge.phrase.charAt(0).toUpperCase() + edge.phrase.slice(1)}.`);
    } else {
      parts.push(`My claimed edge is that ${edge.phrase}.`);
    }
  }

  if (impl) {
    parts.push(`I will therefore use ${impl.phrase}.`);
  }

  if (s.belief !== "always" && s.belief !== "undecided" && impl && (impl.key === "blended" || impl.key === "active")) {
    parts.push("For any active position, I will explain the valuation gap, the reason the market may be wrong, the expected correction mechanism, and the downside risk before committing capital.");
  }

  if (s.constraints.length > 0) {
    const items = s.constraints.map((c) => c.toLowerCase());
    parts.push(`My constraints include ${items.slice(0, -1).join(", ")}${items.length > 1 ? ", and " : ""}${items[items.length - 1]}.`);
  }

  if (s.riskControls.length > 0) {
    const items = s.riskControls.map((c) => c.toLowerCase());
    parts.push(`My risk controls include ${items.slice(0, -1).join(", ")}${items.length > 1 ? ", and " : ""}${items[items.length - 1]}.`);
  }

  return parts.join(" ");
}

export default function PhilosophyBuilder() {
  const reduce = useReducedMotion();
  const [state, setState] = useState<State>(INITIAL);
  const [step, setStep] = useState(1);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState({ ...INITIAL, ...parsed });
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state, loaded]);

  const statement = useMemo(() => state.customDraft || buildStatement(state), [state]);

  const toggleArray = (key: "returns" | "constraints" | "riskControls", val: string) => {
    setState((s) => {
      const arr = s[key];
      const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
      return { ...s, [key]: next, customDraft: "" };
    });
  };

  const setSingle = <K extends keyof State>(key: K, val: State[K]) => {
    setState((s) => ({ ...s, [key]: val, customDraft: "" }));
  };

  const reset = () => {
    setState(INITIAL);
    setStep(1);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(statement);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch { /* ignore */ }
  };

  const goNext = () => setStep((s) => Math.min(STEPS.length, s + 1));
  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Answer six short prompts to draft a provisional investment philosophy. Your selections
          generate a written statement you can edit, copy, and save. This is an educational
          exercise, not personalized financial advice.
        </p>
      </div>

      {/* Stepper */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((s) => {
            const isActive = step === s.n;
            const isDone = s.n < step;
            return (
              <button key={s.n} type="button"
                onClick={() => setStep(s.n)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  isActive ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan"
                    : isDone ? "border-accent-green/40 bg-accent-green/[0.06] text-accent-green"
                      : "border-white/15 text-slate-300 hover:border-white/30",
                )}>
                <span className="font-mono text-[10px]">{String(s.n).padStart(2, "0")}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}>

            {/* Step 1: Market belief */}
            {step === 1 && (
              <div>
                <StepHeader num="1" title="What do you believe about market efficiency?" />
                <div className="mt-4 space-y-2">
                  {MARKET_BELIEF.map((b) => (
                    <ChoiceRow key={b.key}
                      label={b.label}
                      selected={state.belief === b.key}
                      onClick={() => setSingle("belief", b.key)} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Return sources */}
            {step === 2 && (
              <div>
                <StepHeader num="2" title="Where do you expect your return to come from?" hint="Select all that apply." />
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {RETURN_SOURCES.map((r) => (
                    <ChoiceRow key={r}
                      label={r}
                      selected={state.returns.includes(r)}
                      multi
                      onClick={() => toggleArray("returns", r)} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Edge */}
            {step === 3 && (
              <div>
                <StepHeader num="3" title="What is your claimed advantage?" hint="Be honest. 'No identifiable edge' is a defensible answer — and the foundation of a passive implementation." />
                <div className="mt-4 space-y-2">
                  {EDGES.map((e) => (
                    <ChoiceRow key={e.key}
                      label={e.label}
                      selected={state.edge === e.key}
                      onClick={() => setSingle("edge", e.key)} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Implementation */}
            {step === 4 && (
              <div>
                <StepHeader num="4" title="How do you want to implement your philosophy?" />
                <div className="mt-4 space-y-2">
                  {IMPLEMENTATIONS.map((i) => (
                    <ChoiceRow key={i.key}
                      label={i.label}
                      selected={state.implementation === i.key}
                      onClick={() => setSingle("implementation", i.key)} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Constraints */}
            {step === 5 && (
              <div>
                <StepHeader num="5" title="What constraints will shape your strategy?" hint="Select all that apply." />
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CONSTRAINTS.map((c) => (
                    <ChoiceRow key={c}
                      label={c}
                      selected={state.constraints.includes(c)}
                      multi
                      onClick={() => toggleArray("constraints", c)} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Risk controls */}
            {step === 6 && (
              <div>
                <StepHeader num="6" title="What rules will protect you from yourself?" hint="Select all that apply." />
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {RISK_CONTROLS.map((r) => (
                    <ChoiceRow key={r}
                      label={r}
                      selected={state.riskControls.includes(r)}
                      multi
                      onClick={() => toggleArray("riskControls", r)} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Generated statement */}
            {step === 7 && (
              <div>
                <StepHeader num="7" title="Your provisional philosophy statement" hint="Editable. Saved locally. Not personalized financial advice." />
                <textarea
                  value={state.customDraft || buildStatement(state)}
                  onChange={(e) => setState((s) => ({ ...s, customDraft: e.target.value }))}
                  rows={8}
                  className="ops-body mt-4 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] leading-[1.65] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
                  aria-label="Editable philosophy statement" />

                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={copyToClipboard}
                    className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                    {copied ? "✓ Copied" : "Copy statement"}
                  </button>
                  <button type="button"
                    onClick={() => setState((s) => ({ ...s, customDraft: buildStatement(s) }))}
                    className="rounded-full border border-white/20 px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                    Regenerate from selections
                  </button>
                  <button type="button" onClick={reset}
                    className="rounded-full border border-white/15 px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400 transition-colors hover:border-accent-red/40 hover:text-accent-red focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                    Reset all
                  </button>
                </div>

                <div className="mt-4 rounded-lg border border-accent-amber/25 bg-accent-amber/[0.05] px-3 py-2.5">
                  <p className="text-[13px] leading-[1.55] text-slate-100">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-amber">Educational draft · </span>
                    Revise this statement until it accurately reflects your reasoning. A real
                    investment policy should be reviewed with a qualified professional and tailored
                    to your specific financial situation, tax status, and regulatory jurisdiction.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <button type="button" onClick={goPrev} disabled={step === 1}
            className={cn("rounded-full border px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              step === 1 ? "border-white/10 text-slate-500 cursor-not-allowed" : "border-white/20 text-slate-200 hover:border-white/40")}>
            ← Previous
          </button>
          <span className="font-mono text-[11px] text-slate-400">{step} of {STEPS.length}</span>
          <button type="button" onClick={goNext} disabled={step === STEPS.length}
            className={cn("rounded-full border px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              step === STEPS.length ? "border-white/10 text-slate-500 cursor-not-allowed" : "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20")}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

function StepHeader({ num, title, hint }: { num: string; title: string; hint?: string }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
        Step {num}
      </div>
      <h4 className="ops-section-title mt-2 text-[20px] leading-tight text-white sm:text-[22px]">
        {title}
      </h4>
      {hint && <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-300">{hint}</p>}
    </div>
  );
}

function ChoiceRow({ label, selected, multi, onClick }: {
  label: string; selected: boolean; multi?: boolean; onClick: () => void;
}) {
  return (
    <button type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        selected ? "border-accent-cyan/50 bg-accent-cyan/[0.08] text-white" : "border-white/12 bg-white/[0.02] text-slate-200 hover:border-white/25",
      )}>
      <span className={cn(
        "flex h-5 w-5 flex-shrink-0 items-center justify-center border font-mono text-[11px]",
        selected ? "border-accent-cyan bg-accent-cyan/20 text-accent-cyan" : "border-white/25 text-transparent",
      )}>
        {multi ? "✓" : selected ? "●" : ""}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}
