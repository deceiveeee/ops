"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal, InteractiveFrame, TryItTag, Feedback } from "./shared";
import { useIFProgress } from "@/lib/if-progress";

export default function ProvisionalBeliefBuilder() {
  const { draft, saveDraft } = useIFProgress();
  const [belief, setBelief] = useState("");
  const [persistence, setPersistence] = useState("");
  const [disconfirmingEvidence, setDisconfirmingEvidence] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBelief(draft.marketBelief);
    setPersistence(draft.persistenceReason);
    setDisconfirmingEvidence(draft.evidenceGap);
    setLoaded(true);
  }, [draft]);

  const complete = useMemo(
    () =>
      belief.trim().length > 0 &&
      persistence.trim().length > 0 &&
      disconfirmingEvidence.trim().length > 0,
    [belief, persistence, disconfirmingEvidence],
  );

  const summary = `I currently believe ${belief.trim() || "[state a market belief]"}. The opportunity may persist because ${persistence.trim() || "[explain why competition may not remove it]"}. I would weaken or reject this belief if ${disconfirmingEvidence.trim() || "[name evidence that would change your mind]"}.`;

  const save = () => {
    if (!complete) return;
    saveDraft({
      ...draft,
      marketBelief: belief.trim(),
      persistenceReason: persistence.trim(),
      evidenceGap: disconfirmingEvidence.trim(),
      generatedSummary: summary,
    });
    setSaved(true);
  };

  if (!loaded) return null;

  return (
    <Reveal>
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Provisional market hypothesis
            </span>
          </div>
          <span className="rounded-full border border-accent-amber/30 bg-accent-amber/[0.06] px-3 py-1 text-[11px] text-accent-amber">
            Hypothesis—not final philosophy
          </span>
        </div>

        <p className="ops-body mt-4 text-[15px] text-slate-300">
          You have not examined enough evidence to choose a final philosophy.
          Record one belief that the rest of the course can challenge. Your
          response stays in this browser.
        </p>

        <div className="mt-6 space-y-5">
          <Field
            label="What do you currently believe about markets or investor behavior?"
            hint="State a claim that could be true or false—not a stock screen or a trade."
          >
            <textarea
              value={belief}
              onChange={(event) => {
                setBelief(event.target.value);
                setSaved(false);
              }}
              rows={3}
              placeholder="Example: Investors sometimes revise long-term expectations too slowly after important new information."
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
            />
          </Field>

          <Field
            label="Why might the opportunity persist?"
            hint="Consider costs, risk, institutional limits, uncertainty, or behavior."
          >
            <textarea
              value={persistence}
              onChange={(event) => {
                setPersistence(event.target.value);
                setSaved(false);
              }}
              rows={3}
              placeholder="Example: The signal is uncertain, requires repeated research, and can underperform long enough to drive investors away."
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
            />
          </Field>

          <Field
            label="What evidence would make you change your mind?"
            hint="Name a result that would weaken the belief, not merely one losing trade."
          >
            <textarea
              value={disconfirmingEvidence}
              onChange={(event) => {
                setDisconfirmingEvidence(event.target.value);
                setSaved(false);
              }}
              rows={3}
              placeholder="Example: The return pattern disappears out of sample or cannot survive realistic risk and trading-cost adjustments."
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
            />
          </Field>
        </div>

        <div className="mt-6 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="ops-caption text-[10px] text-accent-amber">
            Your working hypothesis
          </div>
          <p className="ops-body mt-2 text-[15px] leading-relaxed text-slate-100">
            {summary}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!complete}
            onClick={save}
            className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save hypothesis to this browser
          </button>
          {!complete && (
            <span className="ops-body text-[12px] text-slate-500">
              Complete all three prompts to save.
            </span>
          )}
        </div>

        {saved && (
          <Feedback status="correct">
            Saved. Later lessons can build on and revise this hypothesis.
          </Feedback>
        )}
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
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="ops-body-strong text-[15px] text-slate-50">{label}</span>
      <span className="ops-body mt-1 block text-[13px] text-slate-400">{hint}</span>
      {children}
    </label>
  );
}
