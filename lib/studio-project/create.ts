import { createStudioPlan } from "@/lib/studio";
import type { StudioMode, StudioProject } from "./schema";

/** A fresh project has no migration history. Practice defaults remain the existing OPS example. */
export function createStudioProject(mode: StudioMode, now = new Date().toISOString()): StudioProject {
  const plan = createStudioPlan(mode, now);
  const alternativeId = `alt-${plan.id}`;
  return {
    schemaVersion: 2, id: plan.id, createdAt: now, updatedAt: now, mode, name: plan.name,
    goal: plan.goal, candidates: [],
    alternatives: [{ id: alternativeId, name: "Your portfolio", createdAt: now, updatedAt: now, positions: [], currentCash: 0, contributionAmount: 0, reasoning: "" }],
    selectedAlternativeId: alternativeId, rules: plan.rules, stress: plan.stress, decisions: [], migratedFrom: null,
  };
}
