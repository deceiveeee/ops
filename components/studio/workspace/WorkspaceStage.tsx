"use client";

import { exportStudioCsv } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { exportProjectText } from "@/lib/studio-project/workspace";
import { downloadFile } from "../shared";
import { BuildStage, BuyStage, GoalStage, ResearchStage, ReviewStage, RiskStage, type StageProps } from "../stages";
import { WorkWaiting } from "./StudioFrame";
import { useWorkspace } from "./WorkspaceProvider";

const STAGES = {
  goal: GoalStage,
  research: ResearchStage,
  build: BuildStage,
  risk: RiskStage,
  buy: BuyStage,
  review: ReviewStage,
} as const;

/**
 * One of the existing stage forms, running on the workspace's saved project.
 *
 * The forms themselves are unchanged. What changes is underneath: edits go to
 * the working portfolio in the versioned project store through the adapter, and
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
      downloadCsv: () => downloadFile(`${fileName}.csv`, exportStudioCsv(plan, STUDIO_CATALOG), "text/csv"),
      restore: async (text) => report(await session.importBackup(text)),
      startAgain: async () => report(await session.reset()),
    },
  };
  return <Stage {...props} />;
}
