"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { StudioInstrument } from "@/lib/studio-catalog";
import type { CandidateInvestigation, CandidateStatus, EvidenceRole } from "@/lib/studio-project/schema";
import type { EvidenceEdit } from "@/lib/studio-project/operations";
import { Field } from "./shared";

/**
 * What a learner worked out about one investment, kept whether they buy it or not.
 *
 * Until this existed the three note boxes appeared only once an investment was
 * in the portfolio, so the one conclusion a beginner most needs to record —
 * "I read this and decided against it" — had nowhere to go. Deciding against
 * something is a result. A learner who cannot write down why will meet the same
 * investment in six months with nothing but a vague feeling about it, and the
 * reasoning that produced the decision is the part worth keeping.
 *
 * Three things live here and are deliberately kept apart:
 *
 * - **Notes**, which are the learner's own reasoning in their own words.
 * - **Where it stands**, which is their judgment, and is not the same as
 *   whether the investment is in a portfolio. Studio never sets it for them:
 *   adding a position leaves the judgment at "still reading", because owning
 *   something in a draft portfolio is not the same as having concluded
 *   anything about it.
 * - **Evidence**, which is what they actually read, each piece pointing at a
 *   named source and saying whether it argues for the investment or against it.
 *
 * Nothing here scores, ranks or advises. It does not count the evidence on each
 * side or draw a conclusion from the balance: two weak reasons for and one
 * decisive reason against is a perfectly ordinary shape for a decision, and a
 * tally would misrepresent it.
 */

export type RecordActions = {
  note: (patch: Partial<Pick<CandidateInvestigation, "why" | "mainRisk" | "whatWouldChangeMyMind">>) => unknown;
  setStatus: (status: CandidateStatus, rejectedBecause?: string) => unknown;
  addEvidence: (entry: EvidenceEdit) => unknown;
  removeEvidence: (evidenceId: string) => unknown;
};

/**
 * The four states, in the order a decision usually travels.
 *
 * "Decided to buy" is the learner's conclusion, not the contents of their
 * portfolio: the two can honestly disagree while a plan is being built, and the
 * page says so where they do rather than quietly correcting one to match.
 */
const STANDING: { value: CandidateStatus; label: string }[] = [
  { value: "researching", label: "Still reading" },
  { value: "shortlisted", label: "Worth a closer look" },
  { value: "selected", label: "Decided to buy" },
  { value: "rejected", label: "Decided against" },
];

const ROLES: { value: EvidenceRole; label: string; tone: string }[] = [
  { value: "supports", label: "For it", tone: "border-accent-green/40 bg-accent-green/10 text-accent-green" },
  { value: "challenges", label: "Against it", tone: "border-accent-amber/40 bg-accent-amber/10 text-accent-amber" },
  { value: "context", label: "Background", tone: "border-white/25 bg-white/10 text-slate-200" },
];

const roleLabel = (role: EvidenceRole) => ROLES.find((item) => item.value === role)?.label ?? role;

export default function ResearchRecord({
  instrument,
  candidate,
  held,
  actions,
}: {
  instrument: StudioInstrument;
  /** Absent until the learner writes something. Reading is not research. */
  candidate: CandidateInvestigation | undefined;
  held: boolean;
  actions: RecordActions;
}) {
  const status = candidate?.status ?? "researching";
  const evidence = candidate?.evidence ?? [];

  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <h3 className="text-[14px] font-semibold text-white">
        Your record
        <span className="ml-2 font-normal text-slate-500">kept whether or not you buy it</span>
      </h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Why it belongs"
          value={candidate?.why ?? ""}
          onChange={(value) => actions.note({ why: value })}
          multiline
        />
        <Field
          label="The main risk I accept"
          value={candidate?.mainRisk ?? ""}
          onChange={(value) => actions.note({ mainRisk: value })}
          multiline
        />
        <Field
          label="What would change my mind"
          value={candidate?.whatWouldChangeMyMind ?? ""}
          onChange={(value) => actions.note({ whatWouldChangeMyMind: value })}
          multiline
        />
      </div>

      {/*
        * The judgment and the reading sit side by side once there is room. The
        * open card already spans both columns of the catalogue, and stacking
        * these two used none of that width while costing most of a screen.
        */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {/*
            * A real radio group, not buttons that look like one. Arrow keys
            * move between the four, which is what a keyboard user expects of a
            * single choice, and a screen reader reads it as one question with
            * four answers.
            */}
          <fieldset>
            <legend className="text-[13px] font-semibold text-white">Where this stands</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {STANDING.map((option) => {
                const active = status === option.value;
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3.5 text-[13px] transition-colors focus-within:ring-2 focus-within:ring-accent-cyan/40",
                      active
                        ? option.value === "rejected"
                          ? "border-accent-amber/50 bg-accent-amber/10 text-white"
                          : "border-accent-cyan/40 bg-accent-cyan/10 text-white"
                        : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white",
                    )}
                  >
                    <input
                      type="radio"
                      name={`standing-${instrument.id}`}
                      value={option.value}
                      checked={active}
                      onChange={() => actions.setStatus(option.value, candidate?.rejectedBecause ?? "")}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          {status === "rejected" ? (
            <div className="space-y-2">
              <Field
                label="Why you decided against it"
                hint="The reason is the part worth keeping; by the time you meet it again the feeling will have gone."
                value={candidate?.rejectedBecause ?? ""}
                onChange={(value) => actions.setStatus("rejected", value)}
                multiline
              />
              {/*
                * The two can disagree honestly while a plan is being built, so
                * this states it rather than removing the position for them.
                */}
              {held ? (
                <p className="text-[13px] leading-6 text-accent-amber">
                  It is still in your portfolio. Remove it above if that is what you meant; your
                  record stays either way.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div>
          <h4 className="text-[13px] font-semibold text-white">
            What you read{evidence.length ? ` (${evidence.length})` : ""}
          </h4>
          {evidence.length ? (
            <ul className="mt-2 space-y-2">
              {evidence.map((entry) => {
                const source = instrument.sources.find((item) => item.id === entry.sourceId);
                return (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-3"
                  >
                    <div className="min-w-0">
                      <span
                        className={cn(
                          "inline-block rounded-full border px-2 py-0.5 text-[11px]",
                          ROLES.find((role) => role.value === entry.role)?.tone,
                        )}
                      >
                        {roleLabel(entry.role)}
                      </span>
                      <p className="mt-1.5 text-[14px] leading-6 text-slate-200">{entry.note}</p>
                      <p className="mt-1 text-[12px] leading-5 text-slate-500">
                        {/*
                          * A source can leave the catalogue when a newer filing
                          * replaces it. Saying so beats showing a label that no
                          * longer matches what was read.
                          */}
                        {source ? source.label : `Source ${entry.sourceId}, no longer listed here`}
                        {entry.locator ? ` · ${entry.locator}` : ""}
                      </p>
                    </div>
                    {/*
                      * Named for what it removes. The card already carries a
                      * "Remove" for the portfolio position, and two controls
                      * reading the same word in one card is ambiguous to anyone
                      * navigating by control rather than by sight — it caught a
                      * test written by someone who knew the layout.
                      */}
                    <button
                      type="button"
                      onClick={() => actions.removeEvidence(entry.id)}
                      aria-label="Remove this note"
                      className="min-h-11 shrink-0 rounded-full px-2 text-[13px] text-slate-400 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <AddEvidence instrument={instrument} onSave={actions.addEvidence} />
        </div>
      </div>
    </div>
  );
}

/**
 * Saving one thing you read.
 *
 * Behind a disclosure because it is a form, and a form open on every card would
 * cost the page more height than the record it serves. The saved list above
 * stays visible: that is the record, and the form is the way to add to it.
 */
function AddEvidence({
  instrument,
  onSave,
}: {
  instrument: StudioInstrument;
  onSave: (entry: EvidenceEdit) => unknown;
}) {
  const [role, setRole] = useState<EvidenceRole>("supports");
  const [sourceId, setSourceId] = useState(instrument.sources[0]?.id ?? "");
  const [locator, setLocator] = useState("");
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);

  const save = () => {
    if (!note.trim() || !sourceId) return;
    onSave({ role, sourceId, locator: locator.trim(), note: note.trim() });
    setNote("");
    setLocator("");
  };

  if (!instrument.sources.length) {
    return (
      <p className="mt-2 text-[13px] leading-6 text-slate-500">
        Nothing to cite: this entry lists no sources.
      </p>
    );
  }

  return (
    <details className="mt-2" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-[13px] font-semibold text-accent-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
        Save something you read
      </summary>

      <div className="mt-2 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
        <fieldset>
          <legend className="text-[13px] font-semibold text-white">Does it argue for it or against it?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ROLES.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3.5 text-[13px] transition-colors focus-within:ring-2 focus-within:ring-accent-cyan/40",
                  role === option.value
                    ? option.tone
                    : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white",
                )}
              >
                <input
                  type="radio"
                  name={`role-${instrument.id}`}
                  value={option.value}
                  checked={role === option.value}
                  onChange={() => setRole(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="block text-[13px] font-semibold text-white">Which source</span>
            <select
              value={sourceId}
              onChange={(event) => setSourceId(event.currentTarget.value)}
              className="mt-1.5 min-h-11 w-full rounded-lg border border-white/12 bg-ink-900 px-3 py-2 text-[14px] text-white focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
            >
              {instrument.sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-white">Where in it</span>
            <input
              value={locator}
              onChange={(event) => setLocator(event.currentTarget.value)}
              placeholder="Optional — a section, a page, a line"
              className="mt-1.5 min-h-11 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[14px] text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
            />
          </label>
        </div>

        <label className="block">
          <span className="block text-[13px] font-semibold text-white">What it shows</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
            rows={2}
            placeholder="In your own words, and why it matters"
            className="mt-1.5 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[14px] leading-6 text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          />
        </label>

        <button
          type="button"
          onClick={save}
          disabled={!note.trim()}
          className="inline-flex min-h-11 items-center rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-4 text-[13px] font-semibold text-white transition-colors hover:border-accent-cyan/70 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
        >
          Keep this
        </button>
      </div>
    </details>
  );
}
