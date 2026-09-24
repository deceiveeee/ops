"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  addInvestigatedCompany,
  addPosition,
  removePosition,
  setCandidateStatus,
  startCandidate,
  updateCandidate,
} from "@/lib/studio-project/operations";
import { isHeld, type CandidateInvestigation, type LearnerInstrument } from "@/lib/studio-project/schema";
import { Field } from "./shared";
import { useWorkspace } from "./workspace/WorkspaceProvider";

/**
 * The two a company the learner found can be. A bond issue or a fund is
 * something Studio researches and carries, not something someone types seven
 * figures into an annual report for.
 */
const ASSET_CLASSES = [
  { value: "us-equity" as const, label: "A US-listed company" },
  { value: "international-equity" as const, label: "Listed outside the US" },
];

/**
 * Where the research on one company becomes a decision.
 *
 * Studio would investigate any business and hold any of eight, and those were
 * different sets, so reading a company's annual report ended on a screen the
 * portfolio could not see. Holding it records the company as the learner's own
 * instrument; deciding against it records a reason on a candidate, which
 * exists whether or not anything holds it. They are the two honest ends of the
 * same piece of work, not a success and a failure.
 *
 * Held is read from the portfolio, not from the instrument having been added
 * once: a company taken out in Portfolio is not held, and can be added again.
 *
 * This lived at the foot of Investigate, under the figures, where a learner met
 * it before reading the report, drawing the map or testing the competition. It
 * is the last step of the research path now, beside what those steps found.
 */
export default function CompanyDecision({ investigationId, company }: { investigationId: string; company: string }) {
  const { session, project } = useWorkspace();
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [assetClass, setAssetClass] = useState<LearnerInstrument["assetClass"]>("us-equity");
  const [decisionNote, setDecisionNote] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const ownId = `own-${investigationId}`;
  const heldNow = Boolean(project && isHeld(project, ownId));
  const decided = project?.candidates.find((candidate) => candidate.instrumentId === ownId);
  const against = decided?.status === "rejected" ? decided.rejectedBecause : null;

  const hold = useCallback(async () => {
    setDecisionNote(null);
    const result = await sessionRef.current.update((current) => {
      const withInstrument = addInvestigatedCompany(current, investigationId, assetClass);
      return isHeld(withInstrument, ownId) ? withInstrument : addPosition(withInstrument, ownId);
    });
    if (!result.ok) setDecisionNote(`Not added: ${result.error}`);
  }, [assetClass, investigationId, ownId]);

  const decideAgainst = useCallback(async () => {
    const reason = rejectReason.trim();
    if (!reason) return;
    setDecisionNote(null);
    const result = await sessionRef.current.update((current) =>
      setCandidateStatus(removePosition(startCandidate(current, ownId), ownId), ownId, "rejected", reason),
    );
    if (result.ok) {
      setRejecting(false);
      setRejectReason("");
    } else {
      setDecisionNote(`Not recorded: ${result.error}`);
    }
  }, [ownId, rejectReason]);

  const reconsider = useCallback(async () => {
    const result = await sessionRef.current.update((current) => setCandidateStatus(current, ownId, "researching"));
    if (!result.ok) setDecisionNote(`Not changed: ${result.error}`);
  }, [ownId]);

  /** Why this company is owned, on the candidate the portfolio already keeps for it. */
  const note = (patch: Partial<Pick<CandidateInvestigation, "why" | "mainRisk" | "whatWouldChangeMyMind">>) =>
    sessionRef.current.update((current) => updateCandidate(current, ownId, patch));

  if (!company.trim()) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2">
      {heldNow ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-[13px] leading-6 text-slate-300">
            <span className="font-semibold text-white">{company.trim()}</span> is in your portfolio. Choose how
            much to hold in{" "}
            <Link href="/studio/portfolio" className="text-accent-cyan hover:underline">
              Portfolio
            </Link>
            .
          </p>
          {/* Asked in the same words as any other holding, and kept on the
              company's own page rather than in the library of eight, which
              is where its figures and its filings already are. */}
          <details className="group">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[13px] font-semibold text-accent-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
              Why you own it
              <span className="ml-2 text-[12px] font-normal text-slate-500 group-open:hidden">Write it down</span>
              <span className="ml-2 hidden text-[12px] font-normal text-slate-500 group-open:inline">Hide</span>
            </summary>
            <div className="mt-2 space-y-3">
              <Field label="Why it belongs" value={decided?.why ?? ""} onChange={(value) => note({ why: value })} multiline />
              <Field label="The main risk I accept" value={decided?.mainRisk ?? ""} onChange={(value) => note({ mainRisk: value })} multiline />
              <Field
                label="What would change my mind"
                value={decided?.whatWouldChangeMyMind ?? ""}
                onChange={(value) => note({ whatWouldChangeMyMind: value })}
                multiline
              />
            </div>
          </details>
        </div>
      ) : against !== null ? (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[13px] text-slate-500">You decided against it:</span>
          <span className="text-[13px] leading-6 text-slate-300">{against}</span>
          <button
            type="button"
            onClick={() => void reconsider()}
            className="inline-flex min-h-11 items-center text-[13px] font-semibold text-accent-cyan hover:underline"
          >
            Put it back on the table
          </button>
        </div>
      ) : rejecting ? (
        <>
          <Field
            label={`Why ${company.trim()} is not for you`}
            hint="Kept with these figures, so you can check later whether it still holds."
            value={rejectReason}
            onChange={setRejectReason}
            placeholder="It earns less than its capital costs and I could not see that changing"
            multiline
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!rejectReason.trim()}
              onClick={() => void decideAgainst()}
              className="inline-flex min-h-11 items-center rounded-lg border border-white/15 px-3.5 text-[13px] font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Record this decision
            </button>
            <button
              type="button"
              onClick={() => {
                setRejecting(false);
                setRejectReason("");
              }}
              className="inline-flex min-h-11 items-center px-2 text-[13px] text-slate-400"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Asked, not guessed: an investment whose kind Studio does not know is
              dealt no fall in the scenario test, which understates the loss
              rather than showing an error. */}
          <label className="text-[13px] text-slate-400">
            Where it trades{" "}
            <select
              value={assetClass}
              onChange={(event) => setAssetClass(event.target.value as LearnerInstrument["assetClass"])}
              className="min-h-11 rounded-lg border border-white/10 bg-white/[0.03] px-2 text-[13px] text-white focus:border-accent-cyan/50 focus:outline-none"
            >
              {ASSET_CLASSES.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-900">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void hold()}
            className="inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3.5 text-[13px] font-semibold text-white hover:border-accent-cyan/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            Add {company.trim()} to your portfolio
          </button>
          {/* A business can be worth reading and still not worth owning, and that
              conclusion is the one a learner can check later against what happened. */}
          <button
            type="button"
            onClick={() => setRejecting(true)}
            className="inline-flex min-h-11 items-center text-[13px] text-slate-300 underline underline-offset-2 hover:text-white"
          >
            Decide against {company.trim()}
          </button>
        </div>
      )}
      {decisionNote ? (
        <p role="alert" className="mt-2 text-[13px] leading-6 text-accent-amber">
          {decisionNote}
        </p>
      ) : null}
    </div>
  );
}
