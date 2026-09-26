"use client";

import { exportStudioCsv } from "@/lib/studio";
import { addEvidence, removeEvidence, setCandidateStatus, updateCandidate } from "@/lib/studio-project/operations";
import { exportProjectText } from "@/lib/studio-project/workspace";
import { readLimits } from "@/lib/studio-project/limits";
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
    limits: readLimits(project),
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
  return <Stage {...props} />;
}
