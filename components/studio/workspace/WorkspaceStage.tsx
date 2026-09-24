"use client";

import Link from "next/link";
import { exportStudioCsv } from "@/lib/studio";
import { addEvidence, removeEvidence, setCandidateStatus, updateCandidate } from "@/lib/studio-project/operations";
import { exportProjectText } from "@/lib/studio-project/workspace";
import { downloadFile } from "../shared";
import { BuildStage, BuyStage, ReviewStage, RiskStage, type StageProps } from "../stages";
import GoalsWorkspace from "./GoalsWorkspace";
import ResearchWorkspace from "./ResearchWorkspace";
import { WorkWaiting } from "./StudioFrame";
import { useWorkspace } from "./WorkspaceProvider";

const STAGES = {
  goal: GoalsWorkspace,
  research: ResearchWorkspace,
  build: BuildStage,
  risk: RiskStage,
  buy: BuyStage,
  review: ReviewStage,
} as const;

/**
 * Where each page of the plan sends a learner when its work is done.
 *
 * Goals has its own, inside its editor, and Research has the step bar. The
 * three parts of Portfolio had nothing: a learner who finished setting weights
 * met the end of the page and had to guess that the tabs above were an order.
 * Review is the last page, and says so in its panel for keeping a copy.
 */
const NEXT: Partial<Record<keyof typeof STAGES, { href: string; label: string; before: string }>> = {
  build: { href: "/studio/portfolio/risk", label: "Next: Check the risk and the cost", before: "Weights add up to what you want?" },
  risk: { href: "/studio/portfolio/buying", label: "Next: Work out what to buy", before: "Happy with the risk and the cost?" },
  buy: { href: "/studio/review", label: "Next: Write the rules and keep a copy", before: "Know what to buy?" },
};

function StageNext({ href, label, before }: { href: string; label: string; before: string }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ops-divider)] pt-4">
      <p className="text-[13px] leading-6 text-st-muted">{before}</p>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center rounded-full bg-st-blue-edge px-4 text-[13px] font-semibold text-[#fff] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]"
      >
        {label}
        <span aria-hidden="true" className="ml-1.5">
          →
        </span>
      </Link>
    </div>
  );
}

/**
 * A working page running on the workspace's saved project.
 *
 * Edits go to the working portfolio in the versioned project store through the adapter, and
 * the downloads carry the whole project, including research not in the
 * portfolio, rather than the single-portfolio record the wizard kept.
 */
export default function WorkspaceStage({ stage, eyebrow }: { stage: keyof typeof STAGES; eyebrow?: string }) {
  const workspace = useWorkspace();
  const { plan, calculation, project, session, report } = workspace;
  // Blocked and unavailable storage are explained above the work; this only waits.
  if (!plan || !calculation || !project) return session.status === "loading" ? <WorkWaiting /> : null;

  const Stage = STAGES[stage];
  const fileName = project.name.trim() || "Studio portfolio";
  const props: StageProps = {
    plan,
    calculation,
    eyebrow,
    headingAs: "h1",
    investigations: project.investigations.map(({ id, company }) => ({ id, company })),
    /*
     * Research goes straight to the project, not through the plan adapter.
     *
     * The adapter's job is to present a portfolio to code that predates the
     * project record, and research about an investment nobody holds has no
     * place in a portfolio to be presented from. Writing it directly is also
     * what lets a rejection survive the position being removed.
     */
    record: {
      candidates: project.candidates,
      note: async (instrumentId, patch) => report(await session.update((current) => updateCandidate(current, instrumentId, patch))),
      setStatus: async (instrumentId, status, rejectedBecause) =>
        report(await session.update((current) => setCandidateStatus(current, instrumentId, status, rejectedBecause))),
      addEvidence: async (instrumentId, entry) => report(await session.update((current) => addEvidence(current, instrumentId, entry))),
      removeEvidence: async (instrumentId, evidenceId) =>
        report(await session.update((current) => removeEvidence(current, instrumentId, evidenceId))),
    },
    update: workspace.updatePlan,
    importBackup: async (text) => report(await session.importBackup(text)),
    reset: async () => report(await session.reset()),
    actions: {
      downloadBackup: () => {
        const backup = session.exportBackup();
        if (!backup.ok) {
          report({ ok: false, code: "invalid", error: backup.error });
          return;
        }
        // A draft storage has not acknowledged must not pass for the saved portfolio.
        downloadFile(`${fileName}${backup.saved ? "" : " (unsaved draft)"}.json`, backup.raw, "application/json");
      },
      downloadText: () => downloadFile(`${fileName}.txt`, exportProjectText(project), "text/plain"),
      downloadCsv: () => downloadFile(`${fileName}.csv`, exportStudioCsv(plan, workspace.catalog), "text/csv"),
      restore: async (text) => report(await session.importBackup(text)),
      startAgain: async () => report(await session.reset()),
    },
  };
  // With nothing held, the page's own message already sends the learner to
  // Research, and a Next to an empty risk page would contradict it.
  const next = NEXT[stage];
  const showNext = next && plan.holdings.length > 0;
  return (
    <>
      <Stage {...props} />
      {showNext ? <StageNext {...next} /> : null}
    </>
  );
}
