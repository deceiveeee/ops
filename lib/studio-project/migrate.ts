import { validateStudioPlan, type StudioPlan } from "@/lib/studio";
import { MAX_PROJECT_BYTES, validateStudioProject } from "./validate";
import {
  STUDIO_PROJECT_SCHEMA_VERSION,
  type CandidateInvestigation,
  type PortfolioAlternative,
  type PortfolioPosition,
  type StudioProject,
} from "./schema";

/**
 * v1 -> v2 migration.
 *
 * Two rules govern this file.
 *
 * First, it is non-destructive. The original serialized v1 record is stored on
 * the result verbatim, so a migration bug can never be the reason a learner
 * loses work — the old record can still be read, and a v1 backup re-exported
 * unchanged.
 *
 * Second, it does not invent. v1 has no notion of a rejected candidate, so every
 * holding it carried becomes a `selected` candidate; nothing is guessed about
 * research the learner never did. Fields v2 adds that v1 could not have filled
 * start empty rather than being back-filled with a plausible-looking default.
 */

export type MigrationResult =
  | { ok: true; project: StudioProject; notes: string[] }
  | { ok: false; error: string };

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function candidateFromHolding(plan: StudioPlan, holding: StudioPlan["holdings"][number], now: string): CandidateInvestigation {
  const research = holding.research;
  return {
    id: makeId("cand"),
    instrumentId: holding.instrumentId,
    // v1 could only describe things the learner held, so every one of them was
    // selected. It had no way to record a rejection.
    status: "selected",
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    why: research?.why ?? "",
    mainRisk: research?.mainRisk ?? "",
    whatWouldChangeMyMind: research?.whatWouldChangeMyMind ?? "",
    openQuestions: [],
    rejectedBecause: "",
    evidence: [],
    reviewedSources: Boolean(research?.reviewedSources),
  };
}

function positionFromHolding(holding: StudioPlan["holdings"][number]): PortfolioPosition {
  return {
    instrumentId: holding.instrumentId,
    targetWeightPct: holding.targetWeightPct,
    currentValue: holding.currentValue,
    quotePrice: holding.quotePrice,
    quoteAsOf: holding.quoteAsOf,
    quantityMode: holding.quantityMode,
    accruedInterestPer100: holding.accruedInterestPer100,
    tradeFee: holding.tradeFee,
  };
}

/**
 * Migrate a validated v1 plan, keeping its serialized form.
 *
 * `raw` is the exact text the plan was read from. Passing a re-serialized copy
 * would defeat the point: the guarantee is that the bytes on disk are preserved,
 * not that an equivalent object is.
 */
export function migrateV1ToV2(plan: StudioPlan, raw: string, now = new Date().toISOString()): MigrationResult {
  const issues = validateStudioPlan(plan);
  if (issues.length) {
    return { ok: false, error: `The saved portfolio could not be read: ${issues.join(" ")}` };
  }

  const notes: string[] = [];
  const candidates = plan.holdings.map((holding) => candidateFromHolding(plan, holding, now));
  const positions = plan.holdings.map(positionFromHolding);

  const withResearch = candidates.filter(
    (candidate) => candidate.why || candidate.mainRisk || candidate.whatWouldChangeMyMind,
  ).length;
  notes.push(
    `${candidates.length} holding${candidates.length === 1 ? "" : "s"} became ${
      candidates.length === 1 ? "a candidate" : "candidates"
    }, ${withResearch} carrying written research.`,
  );
  notes.push("Every migrated candidate is marked selected: the previous version could not record a rejection.");

  const alternative: PortfolioAlternative = {
    id: makeId("alt"),
    name: "Your portfolio",
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    positions,
    currentCash: plan.currentCash,
    contributionAmount: plan.contributionAmount,
    reasoning: "",
  };

  return {
    ok: true,
    notes,
    project: {
      schemaVersion: STUDIO_PROJECT_SCHEMA_VERSION,
      id: plan.id,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      mode: plan.mode,
      name: plan.name,
      goal: { ...plan.goal },
      candidates,
      alternatives: [alternative],
      selectedAlternativeId: alternative.id,
      rules: { ...plan.rules },
      stress: { ...plan.stress },
      decisions: [],
      migratedFrom: { schemaVersion: 1, raw, migratedAt: now },
    },
  };
}

export type ReadResult =
  | { ok: true; project: StudioProject; migrated: boolean; notes: string[] }
  | { ok: false; error: string; preserved: string };

/**
 * Read a saved record of any known version.
 *
 * An unknown *newer* schema is refused rather than coerced, and the original
 * text is handed back so the caller can keep it. A learner who opens their
 * portfolio in an older build must not have it silently downgraded and
 * overwritten.
 */
export function readStudioRecord(raw: string, now = new Date().toISOString()): ReadResult {
  if (new TextEncoder().encode(raw).byteLength > MAX_PROJECT_BYTES) {
    return { ok: false, error: "Studio project backups support up to 10 MiB. The original has been kept.", preserved: raw };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "This file is not a readable Studio backup.", preserved: raw };
  }

  const version = (parsed as { schemaVersion?: unknown })?.schemaVersion;

  if (version === STUDIO_PROJECT_SCHEMA_VERSION) {
    const issues = validateStudioProject(parsed);
    if (issues.length) return { ok: false, error: issues.join(" "), preserved: raw };
    return { ok: true, project: parsed as StudioProject, migrated: false, notes: [] };
  }

  if (version === 1) {
    const result = migrateV1ToV2(parsed as StudioPlan, raw, now);
    if (!result.ok) return { ok: false, error: result.error, preserved: raw };
    return { ok: true, project: result.project, migrated: true, notes: result.notes };
  }

  if (typeof version === "number" && version > STUDIO_PROJECT_SCHEMA_VERSION) {
    return {
      ok: false,
      error:
        "This portfolio was saved by a newer version of Studio. Its original data has been kept and not changed.",
      preserved: raw,
    };
  }

  return { ok: false, error: "This is not a supported Studio backup.", preserved: raw };
}
