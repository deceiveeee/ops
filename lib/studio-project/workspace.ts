import { exportStudioText, type StudioPlan } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { startCandidate, updateCandidate } from "./operations";
import { findCandidate, workingAlternative, type StudioProject } from "./schema";

/** A calculation view, never the stored record. Research remains project-owned. */
export function projectToPlan(project: StudioProject): StudioPlan {
  const alternative = workingAlternative(project);
  return {
    schemaVersion: 1, id: project.id, name: project.name, mode: project.mode,
    createdAt: project.createdAt, updatedAt: project.updatedAt,
    goal: { ...project.goal }, rules: { ...project.rules }, stress: { ...project.stress },
    currentCash: alternative?.currentCash ?? 0,
    contributionAmount: alternative?.contributionAmount ?? 0,
    holdings: (alternative?.positions ?? []).map((position) => {
      const candidate = findCandidate(project, position.instrumentId);
      return { ...position, research: {
        why: candidate?.why ?? "", mainRisk: candidate?.mainRisk ?? "",
        whatWouldChangeMyMind: candidate?.whatWouldChangeMyMind ?? "",
        reviewedSources: candidate?.reviewedSources ?? false,
      } };
    }),
  };
}

/** Apply existing form/calculator edits to the current alternative only. */
export function applyPlanChange(project: StudioProject, change: (plan: StudioPlan) => StudioPlan): StudioProject {
  const before = projectToPlan(project);
  const after = change(before);
  const alternative = workingAlternative(project);
  let next = { ...project, goal: after.goal, rules: after.rules, stress: after.stress };
  for (const holding of after.holdings) {
    const previous = before.holdings.find((item) => item.instrumentId === holding.instrumentId);
    next = startCandidate(next, holding.instrumentId);
    // Adding a position cannot replace an earlier investigation with blank notes.
    if (previous && JSON.stringify(previous.research) !== JSON.stringify(holding.research)) {
      next = updateCandidate(next, holding.instrumentId, holding.research);
    }
  }
  return { ...next, alternatives: next.alternatives.map((item) => item.id === alternative?.id ? {
    ...item, updatedAt: new Date().toISOString(), currentCash: after.currentCash,
    contributionAmount: after.contributionAmount,
    positions: after.holdings.map(({ research: _research, ...position }) => position),
  } : item) };
}

export function exportProjectText(project: StudioProject): string {
  const alternatives = project.alternatives.map((alternative) =>
    `PORTFOLIO: ${alternative.name}\n${alternative.reasoning}\n${exportStudioText(projectToPlan({ ...project, selectedAlternativeId: alternative.id }), STUDIO_CATALOG)}`,
  );
  const research = project.candidates.map((candidate) => [
    `${candidate.instrumentId} — ${candidate.status}`, `Why: ${candidate.why}`,
    `Main risk: ${candidate.mainRisk}`, `What would change my mind: ${candidate.whatWouldChangeMyMind}`,
    `Open questions: ${candidate.openQuestions.join("; ")}`, `Reason rejected: ${candidate.rejectedBecause}`,
    ...candidate.evidence.map((evidence) => `${evidence.role}: ${evidence.sourceId}, ${evidence.locator}\n${evidence.note}`),
  ].join("\n"));
  return [...alternatives, "ALL RESEARCH (INCLUDING INVESTMENTS NOT HELD)", ...research,
    "DECISIONS", ...project.decisions.map((decision) => `${decision.at}: ${decision.summary}\n${decision.reason}`),
  ].join("\n\n");
}
