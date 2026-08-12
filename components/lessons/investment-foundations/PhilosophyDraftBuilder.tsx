"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal, InteractiveFrame, TryItTag } from "./shared";
import { useIFProgress, EMPTY_DRAFT, type PhilosophyDraft } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

/**
 * Section 15 — Investment Philosophy Draft 0.1.
 * Local-persistence form with generated summary.
 */

const ADVANTAGE_OPTIONS = [
  "Asset allocation",
  "Security selection",
  "Execution",
  "More than one stage",
  "No active advantage currently identified",
  "Uncertain",
] as const;

const CONSTRAINT_FIELDS: { key: keyof PhilosophyDraft["constraints"]; label: string; placeholder: string }[] = [
  { key: "riskPreference", label: "Risk preference", placeholder: "e.g., moderate — can tolerate 20–30% temporary declines" },
  { key: "horizon", label: "Intended investment horizon", placeholder: "e.g., 10–20 years" },
  { key: "cashNeeds", label: "Actual cash needs", placeholder: "e.g., none in next 5 years" },
  { key: "taxConsiderations", label: "Tax considerations", placeholder: "e.g., mostly tax-advantaged accounts" },
  { key: "capital", label: "Available capital", placeholder: "e.g., $50,000 initial; $500/month" },
  { key: "researchTime", label: "Research time", placeholder: "e.g., 3 hours per week" },
  { key: "patience", label: "Patience", placeholder: "e.g., willing to wait 3 years for thesis to play out" },
  { key: "analyticalTools", label: "Analytical tools", placeholder: "e.g., comfortable with DCF, basic accounting" },
  { key: "liquidityNeeds", label: "Liquidity needs", placeholder: "e.g., 3 months expenses in cash reserves" },
  { key: "underperformanceTolerance", label: "Ability to tolerate underperformance", placeholder: "e.g., 12–24 months of trailing the benchmark" },
];

function buildSummary(d: PhilosophyDraft): string {
  const belief = d.marketBelief.trim() || "[market belief not yet stated]";
  const stage = d.advantageStage || "[stage not yet selected]";
  const strategy = d.strategy.trim() || "[strategy not yet described]";
  const persistence = d.persistenceReason.trim() || "[reason not yet given]";
  const constraints = Object.entries(d.constraints)
    .filter(([, v]) => v.trim() !== "")
    .map(([k, v]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase()}: ${v}`)
    .join("; ");
  const constraintsBlock = constraints || "[constraints not yet specified]";
  const risks = d.implementationRisks.trim() || "[implementation risks not yet identified]";
  const evidence = d.evidenceGap.trim() || "[evidence gap not yet identified]";

  return `I currently believe that ${belief}. I would most likely seek an advantage through ${stage}. One possible strategy would be ${strategy}. The opportunity may persist because ${persistence}. However, this approach must fit my constraints (${constraintsBlock}) and may fail because ${risks}. Before relying on this philosophy, I need stronger evidence about ${evidence}.`;
}

export default function PhilosophyDraftBuilder() {
  const { draft, saveDraft, clearDraft } = useIFProgress();
  const [local, setLocal] = useState<PhilosophyDraft>(EMPTY_DRAFT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLocal(draft);
    setLoaded(true);
  }, [draft]);

  const summary = useMemo(() => buildSummary(local), [local]);

  const update = <K extends keyof PhilosophyDraft>(key: K, value: PhilosophyDraft[K]) =>
    setLocal((p) => ({ ...p, [key]: value }));

  const updateConstraint = (key: keyof PhilosophyDraft["constraints"], value: string) =>
    setLocal((p) => ({ ...p, constraints: { ...p.constraints, [key]: value } }));

  const onSave = () => {
    saveDraft({ ...local, generatedSummary: summary });
  };

  const onClear = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Clear your Investment Philosophy Draft 0.1? This cannot be undone.");
      if (!ok) return;
    }
    clearDraft();
    setLocal(EMPTY_DRAFT);
  };

  const onCopy = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      /* ignore */
    }
  };

  if (!loaded) return null;

  const filledCount =
    (local.marketBelief.trim() ? 1 : 0) +
    (local.advantageStage ? 1 : 0) +
    (local.persistenceReason.trim() ? 1 : 0) +
    (local.strategy.trim() ? 1 : 0) +
    (local.implementationRisks.trim() ? 1 : 0) +
    (local.evidenceGap.trim() ? 1 : 0) +
    Object.values(local.constraints).filter((v) => v.trim() !== "").length;
  const totalFields = 6 + CONSTRAINT_FIELDS.length;

  return (
    <Reveal>
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[12px] text-slate-400">
              Investment Philosophy Draft 0.1
            </span>
          </div>
          <span className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-2.5 py-1 font-sans text-[12px] uppercase tracking-[0.14em] text-accent-amber">
            Starting hypothesis — not a completed philosophy
          </span>
        </div>

        <p className="ops-body mt-4 text-[15px] text-slate-300">
          You have not yet studied enough evidence to choose a final
          philosophy. This draft records your current hypotheses so that later
          lessons can test and revise them. Responses are stored only in this
          browser and never sent anywhere.
        </p>

        <div className="mt-3 font-sans text-[12px] text-slate-500">
          {filledCount}/{totalFields} fields completed
        </div>

        <div className="mt-5 space-y-5">
          <Field label="1. My current market belief" hint='I currently believe markets may __________ because __________.'>
            <textarea
              aria-label="My current market belief"
              value={local.marketBelief}
              onChange={(e) => update("marketBelief", e.target.value)}
              rows={2}
              placeholder="e.g., overreact to negative earnings announcements, because recency bias dominates initial reactions"
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
            />
          </Field>

          <Field label="2. Where I may seek an advantage">
            <div
              className="mt-2 flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Where I may seek an advantage"
            >
              {ADVANTAGE_OPTIONS.map((opt) => {
                const isPicked = local.advantageStage === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={isPicked}
                    onClick={() => update("advantageStage", opt)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                      isPicked
                        ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                        : "border-white/20 text-slate-100 hover:border-accent-amber/60 hover:text-accent-amber",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="3. Why the opportunity might persist" hint="Other investors may fail to correct the opportunity because __________.">
            <textarea
              aria-label="Why the opportunity might persist"
              value={local.persistenceReason}
              onChange={(e) => update("persistenceReason", e.target.value)}
              rows={2}
              placeholder="e.g., the mispricing is small relative to institutional fees, or correcting it requires capital I can lock up"
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
            />
          </Field>

          <Field label="4. My investor constraints">
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CONSTRAINT_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="ops-caption text-[12px] text-slate-400">
                    {f.label}
                  </span>
                  <input
                    type="text"
                    aria-label={f.label}
                    value={local.constraints[f.key]}
                    onChange={(e) => updateConstraint(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="ops-body mt-1 w-full rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2 text-[14px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
                  />
                </label>
              ))}
            </div>
          </Field>

          <Field label="5. A possible strategy" hint="One strategy consistent with this belief would be __________.">
            <textarea
              aria-label="A possible strategy"
              value={local.strategy}
              onChange={(e) => update("strategy", e.target.value)}
              rows={2}
              placeholder="e.g., screen for financially sound companies with >20% price declines after earnings, then investigate the cash-flow thesis"
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
            />
          </Field>

          <Field label="6. Implementation risks" hint="This approach may fail in practice because __________.">
            <textarea
              aria-label="Implementation risks"
              value={local.implementationRisks}
              onChange={(e) => update("implementationRisks", e.target.value)}
              rows={2}
              placeholder="e.g., I may misclassify deteriorating businesses as temporary overreactions, or sell during the next drawdown"
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
            />
          </Field>

          <Field label="7. What I still need to learn" hint="Before relying on this philosophy, I need evidence about __________.">
            <textarea
              aria-label="What I still need to learn"
              value={local.evidenceGap}
              onChange={(e) => update("evidenceGap", e.target.value)}
              rows={2}
              placeholder="e.g., historical base rates of post-decline recovery, false-positive rates, realistic transaction costs"
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
            />
          </Field>
        </div>

        <div className="mt-7 rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="ops-caption text-[12px] text-accent-amber">
              Generated summary
            </div>
            <button
              type="button"
              onClick={onCopy}
              className="rounded-full border border-white/15 px-3 py-1 text-[12px] text-slate-200 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
            >
              Copy
            </button>
          </div>
          <textarea
            aria-label="Generated philosophy summary — editable"
            value={summary}
            onChange={(e) => update("generatedSummary", e.target.value)}
            rows={6}
            className="ops-body mt-3 w-full resize-y rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-[15px] leading-relaxed text-slate-100 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
          />
          <p className="ops-body mt-3 text-[12px] text-slate-400">
            Edit the summary directly above if you want to refine wording before saving.
            This artifact is educational — it is not a personalized investment recommendation.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
          >
            Save draft to this browser
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
          >
            Clear draft
          </button>
          {local.updatedAt && (
            <span className="ml-auto font-sans text-[12px] text-slate-500">
              Last saved: {new Date(local.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </InteractiveFrame>
    </Reveal>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="ops-body-strong text-[15px] text-slate-50">{label}</label>
      {hint && (
        <p className="ops-body mt-1 text-[14px] italic text-slate-400">{hint}</p>
      )}
      {children}
    </div>
  );
}
