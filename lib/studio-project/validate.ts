import { validateStudioPlan } from "@/lib/studio";

/** Limits apply to user projects, not to the separately stored source library. */
export const MAX_PROJECT_BYTES = 10 * 1024 * 1024;
type RecordValue = Record<string, unknown>;
const object = (value: unknown): value is RecordValue =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max = 20_000): value is string => typeof value === "string" && value.length <= max;
const id = (value: unknown): value is string => text(value, 200) && value.trim().length > 0;
const keys = (value: RecordValue, allowed: string[]) => Object.keys(value).every((key) => allowed.includes(key));
const choice = (value: unknown, allowed: string[]) => typeof value === "string" && allowed.includes(value);
const timestamp = (value: unknown) => {
  if (!text(value, 40) || !/^\d{4}-\d{2}-\d{2}T/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  return new Date(`${value.slice(0, 10)}T00:00:00Z`).toISOString().slice(0, 10) === value.slice(0, 10);
};
const dated = (value: RecordValue) => timestamp(value.createdAt) && timestamp(value.updatedAt);
const list = (value: unknown, max: number): value is unknown[] => Array.isArray(value) && value.length <= max;
const emptyResearch = { why: "", mainRisk: "", whatWouldChangeMyMind: "", reviewedSources: false };

/** Validate before storage or import. Unfinished work is valid; missing fields and coercions are not. */
export function validateStudioProject(value: unknown): string[] {
  if (!object(value) || value.schemaVersion !== 2) return ["This is not a supported Studio project."];
  const issues: string[] = [];
  if (!keys(value, ["schemaVersion", "id", "createdAt", "updatedAt", "mode", "name", "goal", "candidates", "alternatives", "selectedAlternativeId", "rules", "stress", "decisions", "migratedFrom"])) {
    issues.push("This project contains fields this version does not understand. Keep the original backup.");
  }
  // Goal/rule/position units are unchanged from v1. Reuse that validator rather
  // than introducing a second definition of a valid dollar amount or quote.
  const common = {
    schemaVersion: 1, id: value.id, createdAt: value.createdAt, updatedAt: value.updatedAt,
    mode: value.mode, name: value.name, goal: value.goal, rules: value.rules, stress: value.stress,
    holdings: [], currentCash: 0, contributionAmount: 0,
  };
  issues.push(...validateStudioPlan(common));
  if (!id(value.id) || !dated(value)) issues.push("The project identity or saved dates are invalid.");

  const recordIds = new Set<string>();
  const instruments = new Set<string>();
  const uniqueId = (value: unknown) => {
    if (!id(value) || recordIds.has(value)) return false;
    recordIds.add(value);
    return true;
  };
  if (!list(value.candidates, 10_000)) issues.push("The project needs a candidate list with at most 10,000 investigations.");
  else for (const candidate of value.candidates) {
    if (!object(candidate)) { issues.push("An investigation is invalid."); continue; }
    if (!keys(candidate, ["id", "instrumentId", "status", "createdAt", "updatedAt", "why", "mainRisk", "whatWouldChangeMyMind", "openQuestions", "rejectedBecause", "evidence", "reviewedSources"])
      || !uniqueId(candidate.id) || !id(candidate.instrumentId) || instruments.has(candidate.instrumentId)
      || !dated(candidate) || !choice(candidate.status, ["researching", "shortlisted", "rejected", "selected"])
      || ![candidate.why, candidate.mainRisk, candidate.whatWouldChangeMyMind, candidate.rejectedBecause].every((item) => text(item))
      || typeof candidate.reviewedSources !== "boolean"
      || !list(candidate.openQuestions, 1000) || !candidate.openQuestions.every((item) => text(item))) {
      issues.push("An investigation contains missing, repeated, or invalid fields.");
    }
    if (id(candidate.instrumentId)) instruments.add(candidate.instrumentId);
    if (!list(candidate.evidence, 1000)) issues.push("An investigation needs an evidence list with at most 1,000 entries.");
    else for (const evidence of candidate.evidence) {
      if (!object(evidence) || !keys(evidence, ["id", "sourceId", "locator", "note", "role", "savedAt"])
        || !uniqueId(evidence.id) || !id(evidence.sourceId) || !text(evidence.locator) || !text(evidence.note)
        || !choice(evidence.role, ["supports", "challenges", "context"]) || !timestamp(evidence.savedAt)) {
        issues.push("An evidence reference contains missing, repeated, or invalid fields.");
      }
    }
  }

  const alternativeIds = new Set<string>();
  if (!list(value.alternatives, 100) || value.alternatives.length === 0) issues.push("The project needs between 1 and 100 portfolio alternatives.");
  else for (const alternative of value.alternatives) {
    if (!object(alternative)) { issues.push("A portfolio alternative is invalid."); continue; }
    if (!keys(alternative, ["id", "name", "createdAt", "updatedAt", "positions", "currentCash", "contributionAmount", "reasoning"])
      || !uniqueId(alternative.id) || !text(alternative.name, 300) || !dated(alternative) || !text(alternative.reasoning)) {
      issues.push("A portfolio alternative contains missing, repeated, or invalid fields.");
    }
    if (id(alternative.id)) alternativeIds.add(alternative.id);
    if (!list(alternative.positions, 100)) { issues.push("An alternative needs a positions list with at most 100 investments."); continue; }
    const holdings = alternative.positions.map((position) => {
      if (!object(position)) return position;
      if (!keys(position, ["instrumentId", "targetWeightPct", "currentValue", "quotePrice", "quoteAsOf", "quantityMode", "accruedInterestPer100", "tradeFee"])) {
        issues.push("A position contains unsupported fields.");
      }
      if (!id(position.instrumentId) || !instruments.has(position.instrumentId)) issues.push("A position refers to an investigation that is missing.");
      return { ...position, research: emptyResearch };
    });
    issues.push(...validateStudioPlan({ ...common, holdings, currentCash: alternative.currentCash, contributionAmount: alternative.contributionAmount }));
  }
  if (value.selectedAlternativeId !== null && (!id(value.selectedAlternativeId) || !alternativeIds.has(value.selectedAlternativeId))) {
    issues.push("The selected portfolio alternative is missing.");
  }
  if (!list(value.decisions, 10_000)) issues.push("The project needs a decision list with at most 10,000 entries.");
  else for (const decision of value.decisions) {
    if (!object(decision) || !keys(decision, ["id", "at", "summary", "reason", "affects"])
      || !uniqueId(decision.id) || !timestamp(decision.at) || !text(decision.summary) || !text(decision.reason)
      || !list(decision.affects, 10_000) || !decision.affects.every(id)) issues.push("A saved decision is invalid.");
  }
  const original = value.migratedFrom;
  if (original !== null) {
    if (!object(original) || !keys(original, ["schemaVersion", "raw", "migratedAt"])
      || original.schemaVersion !== 1 || !text(original.raw, MAX_PROJECT_BYTES) || !timestamp(original.migratedAt)) {
      issues.push("The preserved original portfolio is invalid.");
    } else {
      try {
        if (validateStudioPlan(JSON.parse(original.raw)).length) issues.push("The preserved original is not a valid v1 portfolio.");
      } catch { issues.push("The preserved original portfolio is not readable JSON."); }
    }
  }
  return [...new Set(issues)];
}
